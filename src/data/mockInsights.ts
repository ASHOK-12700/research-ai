import type { ResearchInsight, TimelineEvent } from '../types';

export const mockResearchInsights: ResearchInsight[] = [
  {
    id: 'ins-1',
    title: 'Transformer dominance in recent literature',
    description: 'Transformer-based architectures appear in 7 of your 12 uploaded papers for Medical Image Detection, replacing traditional 2D CNNs.',
    paperCount: 7,
    generatedAt: '10 mins ago',
    category: 'methodology'
  },
  {
    id: 'ins-2',
    title: 'Dataset sample size limitations',
    description: 'Small dataset size (< 100 clinical subjects) is identified as a primary limitation across 5 papers in your literature collection.',
    paperCount: 5,
    generatedAt: '1 hour ago',
    category: 'dataset'
  },
  {
    id: 'ins-3',
    title: 'Trend shift towards linear-complexity spatial mixing',
    description: 'Recent 2024–2025 papers prioritize shifted windows and state-space models (Mamba) to bypass O(N²) attention quadratic overhead.',
    paperCount: 4,
    generatedAt: '3 hours ago',
    category: 'trend'
  }
];

export const mockTimelineEvents: TimelineEvent[] = [
  {
    id: 'evt-1',
    date: '10 mins ago',
    year: 2025,
    title: 'Research Gap Discovered',
    description: 'Identified lack of multi-institutional clinical validation across 4 medical imaging papers.',
    category: 'gap',
    paperId: 'paper-2',
    paperTitle: 'An Attention-Free Swin Transformer for Medical Image Segmentation'
  },
  {
    id: 'evt-2',
    date: '1 hour ago',
    year: 2024,
    title: 'Summary Generated',
    description: 'Extracted key methodology, datasets, and limitations for MobileNetV4.',
    category: 'summary',
    paperId: 'paper-3',
    paperTitle: 'MobileNetV4: Ultra-Efficient Neural Networks for Edge Devices'
  },
  {
    id: 'evt-3',
    date: '3 hours ago',
    year: 2024,
    title: 'Paper Uploaded',
    description: 'Added "An Attention-Free Swin Transformer for Medical Image Segmentation" to AI-Based Medical Image Detection project.',
    category: 'upload',
    paperId: 'paper-2',
    paperTitle: 'An Attention-Free Swin Transformer for Medical Image Segmentation'
  },
  {
    id: 'evt-4',
    date: 'Yesterday',
    year: 2024,
    title: 'Comparison Created',
    description: 'Compared ResNet-152 against Swin-MedNet and MobileNetV4 across parameter count and accuracy.',
    category: 'comparison'
  },
  {
    id: 'evt-5',
    date: '2 days ago',
    year: 2023,
    title: 'Citations Exported',
    description: 'Exported 12 BibTeX references formatted in IEEE format for literature review draft.',
    category: 'citation'
  }
];
