import type { Paper } from '../types';

export const mockPapers: Paper[] = [
  {
    id: 'paper-1',
    title: 'Deep Residual Learning for Image Recognition',
    authors: ['Kaiming He', 'Xiangyu Zhang', 'Shaoqing Ren', 'Jian Sun'],
    year: 2016,
    journal: 'IEEE Conference on Computer Vision and Pattern Recognition (CVPR)',
    projectId: 'proj-1',
    projectTitle: 'AI-Based Medical Image Detection',
    tags: ['CNN', 'Computer Vision', 'Residual Learning', 'Classification'],
    summaryStatus: 'completed',
    similarityScore: 94,
    similarityReason: 'Foundational residual architecture utilized by most downstream medical imaging detection baselines.',
    abstract: 'Deeper neural networks are more difficult to train. We present a residual learning framework to ease the training of networks that are substantially deeper than those used previously. We explicitly reformulate the layers as learning residual functions with reference to the layer inputs, instead of learning unreferenced functions. We provide comprehensive empirical evidence showing that these residual networks are easier to optimize, and can gain accuracy from considerably increased depth.',
    fileSize: '2.4 MB',
    uploadDate: '2026-08-10',
    citationsCount: 165400,
    sections: [
      {
        id: 'sec-1',
        title: 'Abstract',
        content: 'Deeper neural networks are more difficult to train. We present a residual learning framework to ease the training of networks that are substantially deeper than those used previously. We explicitly reformulate the layers as learning residual functions with reference to the layer inputs, instead of learning unreferenced functions.',
        pageNumber: 1
      },
      {
        id: 'sec-2',
        title: 'Introduction',
        content: 'Deep convolutional neural networks have led to a series of breakthroughs for image classification. Driven by the significance of depth, a question arises: Is learning better networks as easy as stacking more layers? An obstacle to answering this question was the notorious problem of vanishing/exploding gradients, which hampers convergence from the onset.',
        pageNumber: 1
      },
      {
        id: 'sec-3',
        title: 'Related Work',
        content: 'Residual Representations: In image processing, residual coding and Multigrid methods have demonstrated superior performance for differential operator discretization. Highway Networks introduce shortcut connections with gating functions.',
        pageNumber: 2
      },
      {
        id: 'sec-4',
        title: 'Methodology',
        content: 'Formally, considering H(x) as an underlying mapping to be fit by a few stacked layers, we let these layers fit another mapping F(x) := H(x) - x. The original mapping is recast into F(x) + x. We adopt residual blocks with shortcut connections performing identity mappings.',
        pageNumber: 3
      },
      {
        id: 'sec-5',
        title: 'Dataset & Setup',
        content: 'Evaluated on ImageNet 2012 classification dataset (1.28 million training images, 50k validation images across 1000 classes) and PASCAL VOC 2007/2012 detection benchmarks.',
        pageNumber: 4
      },
      {
        id: 'sec-6',
        title: 'Experiments & Results',
        content: 'On ImageNet, 152-layer ResNet achieves 3.57% top-5 error, winning 1st place in the ILSVRC 2015 classification competition. ResNet-101 reduces top-1 error significantly over VGG-16 while having lower computational complexity.',
        pageNumber: 6
      },
      {
        id: 'sec-7',
        title: 'Discussion & Limitations',
        content: 'Extremely deep networks (>1000 layers) can exhibit mild overfitting on small datasets without strong regularization. High memory footprint during backpropagation remains a bottleneck for edge deployment.',
        pageNumber: 8
      },
      {
        id: 'sec-8',
        title: 'Conclusion',
        content: 'Residual learning overcomes degradation in ultra-deep networks. Identity shortcut connections introduce zero additional parameters while drastically accelerating gradient flow.',
        pageNumber: 9
      }
    ],
    summary: {
      id: 'sum-1',
      paperId: 'paper-1',
      problem: 'Training degradation in deep neural networks where accuracy saturates and then degrades rapidly as depth increases.',
      approach: 'Reformulating stacked layers to learn residual mappings relative to layer inputs rather than unreferenced functions.',
      methodology: 'Identity shortcut connections F(x) + x inserted across layer pairs without parameter overhead or computational complexity increase.',
      dataset: 'ImageNet 2012 (1.28M images, 1000 classes), COCO 2014, and PASCAL VOC.',
      algorithms: ['ResNet-34', 'ResNet-50', 'ResNet-101', 'ResNet-152'],
      keyResults: [
        '3.57% top-5 error on ImageNet test set (1st place ILSVRC 2015).',
        'Successfully trained networks up to 152 layers with 8x depth of VGG-16.',
        '28% relative performance boost on COCO object detection.'
      ],
      limitations: [
        'Overfitting on small datasets when exceeding 1000 layers without heavy data augmentation.',
        'Memory bandwidth bottleneck during backpropagation through deep identity paths.'
      ],
      futureWork: [
        'Investigation of stochastic depth dropping during training.',
        'Combining residual connections with attention modules for dense prediction tasks.'
      ]
    }
  },
  {
    id: 'paper-2',
    title: 'An Attention-Free Swin Transformer for Medical Image Segmentation',
    authors: ['Elena Rostova', 'Marcus Thorne', 'Amina Al-Mansoor', 'David Chen'],
    year: 2024,
    journal: 'Medical Image Analysis (Elsevier)',
    projectId: 'proj-1',
    projectTitle: 'AI-Based Medical Image Detection',
    tags: ['Transformers', 'Medical Imaging', 'U-Net', 'Segmentation'],
    summaryStatus: 'completed',
    similarityScore: 88,
    similarityReason: 'Both paper-1 and paper-2 address hierarchical feature extractions for visual classification and multi-organ segmentation.',
    abstract: 'Convolutional networks have traditionally dominated medical image segmentation. While Vision Transformers (ViTs) capture global context, self-attention scales quadratically with resolution. We introduce Swin-MedNet, a linear-complexity spatial token mixer that replaces dense attention with multi-scale shifted window kernels.',
    fileSize: '3.8 MB',
    uploadDate: '2026-08-11',
    citationsCount: 42,
    sections: [
      {
        id: 'sec-201',
        title: 'Abstract',
        content: 'While Vision Transformers (ViTs) capture global context, self-attention scales quadratically with resolution. We introduce Swin-MedNet, a linear-complexity spatial token mixer that replaces dense attention with multi-scale shifted window kernels.',
        pageNumber: 1
      },
      {
        id: 'sec-202',
        title: 'Introduction',
        content: 'Accurate segmentation of CT and MRI slices is critical for radiotherapy target volume definition. U-Net and its variants remain popular, but suffer from constrained receptive fields in early layers.',
        pageNumber: 1
      },
      {
        id: 'sec-203',
        title: 'Methodology',
        content: 'Swin-MedNet operates on 3D volumetric patches. It integrates shifted window cross-correlations with bottleneck feature fusion, producing linear runtime O(N) relative to volume depth.',
        pageNumber: 3
      },
      {
        id: 'sec-204',
        title: 'Dataset',
        content: 'Validated on Synapse Multi-Organ Segmentation dataset (30 abdominal CT scans, 3779 axial slices) and ACDC Cardiac MRI benchmark.',
        pageNumber: 4
      },
      {
        id: 'sec-205',
        title: 'Results',
        content: 'Achieves a Dice Similarity Coefficient (DSC) of 89.4% on Synapse abdominal organs, outperforming TransUNet by 1.9% while requiring 40% fewer parameters.',
        pageNumber: 6
      },
      {
        id: 'sec-206',
        title: 'Limitations',
        content: 'Requires pre-processing volumetric normalization; performance drops on rare organ anomalies present in fewer than 3 training scans.',
        pageNumber: 8
      }
    ],
    summary: {
      id: 'sum-2',
      paperId: 'paper-2',
      problem: 'Quadratic computational overhead of self-attention in standard ViTs when processing high-resolution 3D medical CT/MRI scans.',
      approach: 'Swin-MedNet: Shifted-window token mixing architecture combined with lightweight hierarchical encoder-decoder skip connections.',
      methodology: 'Multi-scale shifted window convolutions operating on volumetric voxel blocks with linear O(N) time complexity.',
      dataset: 'Synapse Multi-Organ Abdominal CT (30 scans) and ACDC 3D Cardiac MRI.',
      algorithms: ['Swin-MedNet', 'TransUNet baseline', 'Swin-UNETR'],
      keyResults: [
        '89.4% average Dice Similarity Coefficient on Synapse multi-organ CT benchmark.',
        '40% parameter reduction compared to TransUNet (28M vs 47M params).',
        'Real-time inferencing at 34 FPS on NVIDIA RTX 4090 GPU.'
      ],
      limitations: [
        'Evaluated on a small cohort of 30 scans; limited real-world multi-site clinical validation across diverse scanners.',
        'Sensitivity to slice thickness variations between 1mm and 5mm CT acquisitions.'
      ],
      futureWork: [
        'Federated multi-institutional validation across diverse hospital systems.',
        'Self-supervised pre-training on unlabeled 3D DICOM repositories.'
      ]
    }
  },
  {
    id: 'paper-3',
    title: 'MobileNetV4: Ultra-Efficient Neural Networks for Edge Devices',
    authors: ['Andrew Howard', 'Mark Sandler', 'Grace Chu', 'Benoit Jacob'],
    year: 2024,
    journal: 'IEEE International Conference on Robotics and Automation (ICRA)',
    projectId: 'proj-2',
    projectTitle: 'Edge AI for Smart Agriculture',
    tags: ['Edge AI', 'MobileNet', 'Efficiency', 'Embedded'],
    summaryStatus: 'completed',
    similarityScore: 82,
    similarityReason: 'Focuses on low-latency neural architectures designed for resource-constrained hardware.',
    abstract: 'We present MobileNetV4, a family of universal high-efficiency models designed for mobile and embedded devices. Built upon Universal Inverted Bottleneck (UIB) search spaces, MobileNetV4 optimizes latency across CPUs, GPUs, and Neural Processing Units (NPUs).',
    fileSize: '1.9 MB',
    uploadDate: '2026-08-09',
    citationsCount: 180,
    sections: [
      {
        id: 'sec-301',
        title: 'Abstract',
        content: 'We present MobileNetV4, a family of universal high-efficiency models designed for mobile and embedded devices. Built upon Universal Inverted Bottleneck (UIB) search spaces, MobileNetV4 optimizes latency across CPUs, GPUs, and Neural Processing Units (NPUs).',
        pageNumber: 1
      },
      {
        id: 'sec-302',
        title: 'Methodology',
        content: 'Introduces Universal Inverted Bottleneck (UIB) blocks combining depthwise separable convolutions with inverted residual expansion and extra spatial shortcut paths.',
        pageNumber: 3
      },
      {
        id: 'sec-303',
        title: 'Dataset & Experiments',
        content: 'Benchmarked on ImageNet-1K, COCO 2017 detection, and plant leaf disease datasets for agricultural edge processing.',
        pageNumber: 5
      },
      {
        id: 'sec-304',
        title: 'Results',
        content: 'Achieves 83.2% ImageNet top-1 accuracy at 3.8ms latency on Snapdragon 8 Gen 3 NPU, outperforming MobileNetV3 and EfficientNet-B0.',
        pageNumber: 7
      }
    ],
    summary: {
      id: 'sum-3',
      paperId: 'paper-3',
      problem: 'Suboptimal latency-accuracy trade-offs across heterogeneous hardware targets (CPUs vs NPUs vs Microcontrollers).',
      approach: 'Universal Inverted Bottleneck (UIB) block search space unified with hardware-aware Neural Architecture Search (NAS).',
      methodology: 'Flexible fusion of depthwise, expansion, and spatial convolutions with hardware hardware-specific kernel compiler optimizations.',
      dataset: 'ImageNet-1K, COCO 2017, and PlantVillage Agronomic Dataset.',
      algorithms: ['MobileNetV4-Small', 'MobileNetV4-Medium', 'MobileNetV4-Large'],
      keyResults: [
        '83.2% top-1 accuracy on ImageNet with 3.8ms inference time.',
        '2.4x energy reduction on ARM Cortex-M microcontrollers.',
        '96.1% leaf disease detection accuracy on edge devices.'
      ],
      limitations: [
        'High computational cost during NAS search phase requiring ~10,000 GPU hours.',
        'Slight performance degradation when quantizing to sub-8-bit integer formats (INT4).'
      ],
      futureWork: [
        'Extending UIB blocks to 3D video recognition and streaming camera feeds.',
        'Auto-quantization tooling for sub-mW microcontroller targets.'
      ]
    }
  },
  {
    id: 'paper-4',
    title: 'Evaluating LLM-Generated Feedback in Automated Essay Scoring',
    authors: ['Sarah Jenkins', 'Robert Vance', 'Li Na', 'Tariq Al-Hassan'],
    year: 2025,
    journal: 'Computers & Education (Elsevier)',
    projectId: 'proj-3',
    projectTitle: 'Large Language Models in Education',
    tags: ['LLM', 'Pedagogy', 'Generative AI', 'Assessment'],
    summaryStatus: 'completed',
    similarityScore: 91,
    similarityReason: 'Directly investigates pedagogy, feedback fidelity, and scoring consistency of large language models.',
    abstract: 'Automated Essay Scoring (AES) has evolved from statistical n-gram analysis to LLM zero-shot feedback. In this study, we benchmark GPT-4o, Claude 3.5 Sonnet, and Llama-3-70B on 12,000 student essays across argumentative, narrative, and analytical domains.',
    fileSize: '4.1 MB',
    uploadDate: '2026-08-08',
    citationsCount: 65,
    sections: [
      {
        id: 'sec-401',
        title: 'Abstract',
        content: 'Automated Essay Scoring (AES) has evolved from statistical n-gram analysis to LLM zero-shot feedback. In this study, we benchmark GPT-4o, Claude 3.5 Sonnet, and Llama-3-70B on 12,000 student essays.',
        pageNumber: 1
      },
      {
        id: 'sec-402',
        title: 'Methodology',
        content: 'We constructed a rubric-aligned prompt scaffold measuring 5 core dimensions: thesis coherence, evidence integration, stylistic fluency, grammatical accuracy, and logical transitions.',
        pageNumber: 3
      },
      {
        id: 'sec-403',
        title: 'Results & Findings',
        content: 'Claude 3.5 Sonnet achieved quadratic weighted kappa (QWK) of 0.88 with human master raters, exceeding previous fine-tuned DeBERTa models by 0.06 points.',
        pageNumber: 7
      }
    ],
    summary: {
      id: 'sum-4',
      paperId: 'paper-4',
      problem: 'Inconsistent grading rubrics and generic feedback generated by early automated scoring tools in educational settings.',
      approach: 'Structured multi-dimensional prompt scaffolding combining chain-of-thought grading with targeted constructive revision suggestions.',
      methodology: 'Evaluating 12,000 anonymized student responses against human master graders using Quadratic Weighted Kappa (QWK) and rubric alignment metrics.',
      dataset: 'ASAP Automated Student Assessment Prize Dataset & Educational Feedback Corpus (12,000 essays).',
      algorithms: ['GPT-4o', 'Claude 3.5 Sonnet', 'Llama-3-70B-Instruct', 'DeBERTa-v3 baseline'],
      keyResults: [
        '0.88 Quadratic Weighted Kappa score matching expert human rating agreement.',
        '92% student preference for LLM-generated revision actionable suggestions over single score numbers.',
        'Zero-shot performance rivaling domain-tuned BERT models.'
      ],
      limitations: [
        'Hallucination risks when evaluating highly creative or non-standard writing styles.',
        'Potential algorithmic bias penalizing ESL (English as a Second Language) dialect variations.'
      ],
      futureWork: [
        'Multi-lingual rubric alignment across non-English student writing samples.',
        'Integration of real-time dialogue agents during the essay writing process.'
      ]
    }
  }
];
