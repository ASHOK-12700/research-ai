import type { ChatMessage } from '../types';

export const mockChatMessages: ChatMessage[] = [
  {
    id: 'msg-1',
    sender: 'user',
    text: 'What are the main methodology differences between ResNet-152 and Swin-MedNet in medical image classification?',
    timestamp: '10:14 AM'
  },
  {
    id: 'msg-2',
    sender: 'assistant',
    text: `Based on your uploaded literature, the primary differences lie in feature topology, spatial receptive fields, and computational scaling:

1. **Residual Connections vs Shifted Window Mixing**: ResNet-152 relies on standard 2D convolution layers with identity shortcut connections (F(x) + x), which preserve gradient flow through deep convolutional blocks. In contrast, Swin-MedNet utilizes shifted window spatial token mixers operating on 3D patch tokens.
2. **Computational Time Complexity**: ResNet convolution kernels have fixed O(K² · C) complexity per pixel. Standard Vision Transformers suffer from quadratic O(N²) self-attention overhead, but Swin-MedNet achieves linear O(N) runtime by restricting token interactions to local shifted windows.
3. **Parameter Efficiency**: Swin-MedNet requires **40% fewer parameters** (28M vs 47M) while outperforming ResNet baselines on volumetric multi-organ segmentation datasets by ~1.9% Dice score.`,
    timestamp: '10:15 AM',
    sources: [
      {
        paperId: 'paper-1',
        paperTitle: 'Deep Residual Learning for Image Recognition',
        page: 3,
        section: 'Methodology',
        snippet: 'Formally, considering H(x) as an underlying mapping to be fit by a few stacked layers, we let these layers fit another mapping F(x) := H(x) - x.'
      },
      {
        paperId: 'paper-2',
        paperTitle: 'An Attention-Free Swin Transformer for Medical Image Segmentation',
        page: 3,
        section: 'Methodology',
        snippet: 'Swin-MedNet operates on 3D volumetric patches. It integrates shifted window cross-correlations with bottleneck feature fusion, producing linear runtime O(N).'
      },
      {
        paperId: 'paper-2',
        paperTitle: 'An Attention-Free Swin Transformer for Medical Image Segmentation',
        page: 6,
        section: 'Results',
        snippet: 'Achieves a Dice Similarity Coefficient (DSC) of 89.4% on Synapse abdominal organs, outperforming TransUNet by 1.9% while requiring 40% fewer parameters.'
      }
    ]
  }
];

export const suggestedPrompts = [
  'What methodologies are most common across my papers?',
  'Compare the datasets used in these medical imaging papers.',
  'Which paper achieved the best reported accuracy result?',
  'What limitations appear repeatedly across all 12 papers?',
  'What potential research gaps can be identified for future grants?'
];
