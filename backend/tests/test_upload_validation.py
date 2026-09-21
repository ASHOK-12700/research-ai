import fitz
import pytest
from pathlib import Path

from app.api.routes.papers import validate_pdf_upload
from app.services.pdf_service import extract_pdf_document
from app.services.paper_analysis_service import build_paper_analysis
from app.schemas.papers import PaperMetadata, PaperSection


def _build_valid_pdf_bytes() -> bytes:
    doc = fitz.open()
    page = doc.new_page()
    page.insert_text((72, 72), "ResearchAI validation sample")
    pdf_bytes = doc.tobytes()
    doc.close()
    return pdf_bytes


def test_validate_pdf_upload_accepts_basic_valid_pdf_bytes():
    assert validate_pdf_upload("paper.pdf", "application/octet-stream", _build_valid_pdf_bytes()) is None


def test_validate_pdf_upload_rejects_non_pdf_bytes():
    with pytest.raises(ValueError, match="valid PDF"):
        validate_pdf_upload("paper.pdf", "application/octet-stream", b"not-a-pdf")


def test_extract_pdf_document_preserves_numbered_sections_and_subsections(tmp_path: Path):
    doc = fitz.open()
    page = doc.new_page()
    page.insert_textbox((50, 50, 550, 750), """ABSTRACT
This is the abstract.

I. INTRODUCTION
This is the introduction.

1. Review Planning
This is the review planning subsection.

II. METHODOLOGY
This is the methodology.

III. RESULTS
This is the result.

REFERENCES
[1] A reference.
""")
    pdf_path = tmp_path / "sectioned.pdf"
    doc.save(pdf_path)
    doc.close()

    result = extract_pdf_document(pdf_path)

    assert [section.title for section in result.sections] == [
        "ABSTRACT",
        "INTRODUCTION",
        "Review Planning",
        "METHODOLOGY",
        "RESULTS",
        "REFERENCES",
    ]
    assert result.sections[1].page_start == 1
    assert result.sections[1].id == "section-2"
    assert result.sections[1].content == "This is the introduction."
    assert result.sections[-1].content == "[1] A reference."


def test_extract_pdf_document_reads_all_pages_and_preserves_page_boundaries(tmp_path: Path):
    doc = fitz.open()
    first = doc.new_page()
    first.insert_text((72, 72), "ABSTRACT\nA complete abstract on page one.")
    second = doc.new_page()
    second.insert_text((72, 72), "RESULTS\nThe result is reported on the final page.")
    pdf_path = tmp_path / "multi-page.pdf"
    doc.save(pdf_path)
    doc.close()

    result = extract_pdf_document(pdf_path)

    assert result.page_count == 2
    assert "final page" in result.full_text
    assert result.sections[-1].page_start == 2


def test_paper_analysis_classifies_alternate_headings_and_keeps_gaps_scoped():
    sections_a = [
        PaperSection(id="a1", title="Motivation", content="The paper addresses a missing evaluation protocol.", page_start=1, page_end=1),
        PaperSection(id="a2", title="Proposed Approach", content="The authors use a transformer encoder.", page_start=2, page_end=2),
        PaperSection(id="a3", title="Data", content="The study uses the MIMIC dataset.", page_start=3, page_end=3),
        PaperSection(id="a4", title="Evaluation", content="The method improves F1 score.", page_start=4, page_end=4),
        PaperSection(id="a5", title="Threats to Validity", content="The sample is limited to one institution.", page_start=5, page_end=5),
        PaperSection(id="a6", title="Future Directions", content="Future work should test additional institutions.", page_start=6, page_end=6),
    ]
    sections_b = [PaperSection(id="b1", title="Approach", content="A different approach is described.", page_start=1, page_end=1)]

    analysis_a = build_paper_analysis("paper-a", PaperMetadata(keywords=["medical imaging"]), sections_a, "full text A")
    analysis_b = build_paper_analysis("paper-b", PaperMetadata(), sections_b, "full text B")

    assert analysis_a.problem_statement.content.startswith("The paper addresses")
    assert analysis_a.methodology.content.startswith("The authors use")
    assert analysis_a.datasets.content.startswith("The study uses")
    assert analysis_a.algorithms_models.content.startswith("The authors use")
    assert analysis_a.major_findings.content.startswith("The method improves")
    assert analysis_a.major_findings.sources[0].paper_id == "paper-a"
    assert analysis_a.major_findings.sources[0].page == 4
    assert analysis_a.major_findings.sources[0].section == "Evaluation"
    assert analysis_a.keywords == ["medical imaging"]
    assert {gap.id for gap in analysis_a.research_gaps} == {"paper-a-gap-a5-limitation", "paper-a-gap-a6-direction"}
    assert all("paper-b" not in gap.id for gap in analysis_a.research_gaps)
    assert analysis_b.datasets.content == "Not available in this paper."
    assert analysis_b.datasets.sources == []


def test_paper_analysis_does_not_create_sources_without_matching_evidence():
    analysis = build_paper_analysis("paper-empty", PaperMetadata(), [], "Only unstructured text without supported headings.")

    assert analysis.methodology.content == "Not available in this paper."
    assert analysis.methodology.sources == []


def test_paper_analysis_handles_custom_dataset_models_and_prose_based_gaps():
    sections = [
        PaperSection(id="abstract", title="ABSTRACT", content="We study SKILL code autocompletion.", page_start=1, page_end=1),
        PaperSection(id="intro", title="INTRODUCTION", content="SKILL developers lack effective code autocompletion tools, motivating this study.", page_start=2, page_end=2),
        PaperSection(id="data", title="Custom SKILL Dataset", content="We construct a custom SKILL dataset from source programs and completion examples used for training and testing.", page_start=4, page_end=4),
        PaperSection(id="models", title="Models and Training", content="We train language models and compare neural code completion algorithms using the constructed corpus.", page_start=5, page_end=5),
        PaperSection(id="results", title="results", content="The experiments show that the proposed models improve code completion quality over the baselines.", page_start=8, page_end=8),
        PaperSection(id="discussion", title="DISCUSSION", content="A limitation is that the evaluation covers a restricted collection of programs. Future work should evaluate broader projects and additional completion settings.", page_start=9, page_end=9),
        PaperSection(id="keywords", title="Keywords/Patterns", content="SKILL, code autocompletion, language models, program synthesis", page_start=1, page_end=1),
    ]

    analysis = build_paper_analysis("skill-paper", PaperMetadata(), sections, "full text")

    assert analysis.problem_statement.content.startswith("SKILL developers")
    assert "custom SKILL dataset" in analysis.datasets.content
    assert "language models" in analysis.algorithms_models.content
    assert analysis.major_findings.content.startswith("The experiments show")
    assert "limitation" in analysis.limitations.content.casefold()
    assert "Future work" in analysis.future_work.content
    assert analysis.keywords == ["SKILL", "code autocompletion", "language models", "program synthesis"]
    assert all(source.paper_id == "skill-paper" for field in (
        analysis.problem_statement,
        analysis.datasets,
        analysis.algorithms_models,
        analysis.major_findings,
        analysis.limitations,
        analysis.future_work,
    ) for source in field.sources)


def test_paper_analysis_extracts_experimental_setup_from_alt_headings_and_keeps_normalized_fields():
    sections = [
        PaperSection(id="intro", title="INTRODUCTION", content="The main problem is that developers need faster code completion for SKILL programs.", page_start=1, page_end=1),
        PaperSection(id="objective", title="Research Objective", content="Our objective is to improve autocompletion quality for SKILL code generation.", page_start=2, page_end=2),
        PaperSection(id="methods", title="Method", content="We propose a transformer-based decoder and evaluate it against baseline systems.", page_start=3, page_end=3),
        PaperSection(id="setup", title="Experimental Setup", content="We train on 40,000 examples, validate on 10,000 examples, and compare with three baseline models.", page_start=4, page_end=4),
        PaperSection(id="dataset", title="Custom Dataset", content="The custom SKILL dataset contains task descriptions and completion targets.", page_start=5, page_end=5),
        PaperSection(id="results", title="Evaluation", content="The system improves completion accuracy and reduces latency relative to the baselines.", page_start=6, page_end=6),
        PaperSection(id="future", title="Conclusion", content="Future work will extend support to larger repositories and more library APIs.", page_start=7, page_end=7),
    ]

    analysis = build_paper_analysis("exp-paper", PaperMetadata(), sections, "full text")

    assert "developers need faster code completion" in analysis.problem_statement.content
    assert "improve autocompletion quality" in analysis.objectives.content
    assert "transformer-based decoder" in analysis.methodology.content
    assert "40,000 examples" in analysis.experimental_setup.content
    assert "custom SKILL dataset" in analysis.datasets.content
    assert "improves completion accuracy" in analysis.major_findings.content
    assert "Future work" in analysis.future_work.content
    assert analysis.experimental_setup.sources[0].paper_id == "exp-paper"
