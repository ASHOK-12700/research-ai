import type { ResearchGap } from '../types';

export const mockResearchGaps: ResearchGap[] = [
  {
    id: 'gap-1',
    title: 'Small Cohort Dataset Limitations in Clinical Scans',
    category: 'limitation',
    paperCount: 5,
    description: 'A major recurring bottleneck across 5 medical AI papers is the reliance on single-site CT/MRI datasets containing fewer than 100 patient scans, leading to domain shift failure when deployed on multi-site hospital scanners.',
    supportingPapers: [
      {
        paperId: 'paper-2',
        paperTitle: 'An Attention-Free Swin Transformer for Medical Image Segmentation',
        page: 8,
        snippet: 'Evaluated on a small cohort of 30 scans; limited real-world multi-site clinical validation across diverse scanners.'
      },
      {
        paperId: 'paper-1',
        paperTitle: 'Deep Residual Learning for Image Recognition',
        page: 8,
        snippet: 'Extremely deep networks (>1000 layers) can exhibit mild overfitting on small datasets without strong regularization.'
      }
    ],
    isAiSuggested: false
  },
  {
    id: 'gap-2',
    title: 'Lack of Real-World Out-of-Distribution Validation',
    category: 'limitation',
    paperCount: 4,
    description: 'Models reported high benchmark accuracy on curated datasets (ImageNet/Synapse) but lacked evaluation against out-of-distribution artifacts, noise, motion blur, and missing slice modalities.',
    supportingPapers: [
      {
        paperId: 'paper-2',
        paperTitle: 'An Attention-Free Swin Transformer for Medical Image Segmentation',
        page: 8,
        snippet: 'Sensitivity to slice thickness variations between 1mm and 5mm CT acquisitions.'
      },
      {
        paperId: 'paper-4',
        paperTitle: 'Evaluating LLM-Generated Feedback in Automated Essay Scoring',
        page: 8,
        snippet: 'Potential algorithmic bias penalizing ESL (English as a Second Language) dialect variations.'
      }
    ],
    isAiSuggested: false
  },
  {
    id: 'gap-3',
    title: 'High Computational Overhead for Volumetric 3D Inputs',
    category: 'limitation',
    paperCount: 3,
    description: 'Full-resolution 3D medical images require GPU memory exceeding 24GB during training, restricting real-time deployment on portable bedside diagnostic carts.',
    supportingPapers: [
      {
        paperId: 'paper-1',
        paperTitle: 'Deep Residual Learning for Image Recognition',
        page: 8,
        snippet: 'Memory bandwidth bottleneck during backpropagation through deep identity paths.'
      },
      {
        paperId: 'paper-3',
        paperTitle: 'MobileNetV4: Ultra-Efficient Neural Networks for Edge Devices',
        page: 8,
        snippet: 'High computational cost during NAS search phase requiring ~10,000 GPU hours.'
      }
    ],
    isAiSuggested: false
  },
  {
    id: 'gap-4',
    title: 'Hybrid State-Space Models (Mamba) + Vision Transformers for 3D Segmentation',
    category: 'underexplored',
    paperCount: 2,
    description: 'While Swin-MedNet improves windowed self-attention, state-space selective scan mechanisms (Mamba) remain largely unexplored for long-range 3D anatomical context modeling.',
    supportingPapers: [
      {
        paperId: 'paper-2',
        paperTitle: 'An Attention-Free Swin Transformer for Medical Image Segmentation',
        page: 9,
        snippet: 'Self-supervised pre-training on unlabeled 3D DICOM repositories.'
      }
    ],
    isAiSuggested: true
  },
  {
    id: 'gap-5',
    title: 'Investigate Lightweight Sub-8-Bit Quantized Models for Bedside Diagnostic Devices',
    category: 'direction',
    paperCount: 3,
    description: 'Future direction: Combine Universal Inverted Bottleneck (UIB) blocks with post-training INT4 quantization to achieve real-time 3D segmentation on ARM Cortex embedded hardware with sub-5W power budgets.',
    supportingPapers: [
      {
        paperId: 'paper-3',
        paperTitle: 'MobileNetV4: Ultra-Efficient Neural Networks for Edge Devices',
        page: 9,
        snippet: 'Auto-quantization tooling for sub-mW microcontroller targets.'
      }
    ],
    isAiSuggested: true
  }
];
