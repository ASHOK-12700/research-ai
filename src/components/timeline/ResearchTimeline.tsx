import React from 'react';
import { Sparkles, Calendar, Layers } from 'lucide-react';
import { Card } from '../ui/Card';

export interface TimelineMilestone {
  year: number;
  title: string;
  methodology: string;
  description: string;
  keyPapers: string[];
}

export const researchMilestones: TimelineMilestone[] = [
  {
    year: 2021,
    title: 'Standard 2D Convolutional Networks',
    methodology: 'CNN / VGG-16 / ResNet-50',
    description: 'Initial deep learning adoption focused on 2D slice-by-slice slice classification using pre-trained ImageNet convolutional networks.',
    keyPapers: ['ResNet-50 Baseline']
  },
  {
    year: 2022,
    title: 'Residual & Skip-Connection Expansion',
    methodology: 'Deep ResNet-152 & U-Net 2D',
    description: 'Introduction of deeper residual identity shortcuts and encoder-decoder skip connections to preserve spatial boundary details.',
    keyPapers: ['Deep Residual Learning for Image Recognition']
  },
  {
    year: 2023,
    title: 'Efficient Edge & Mobile Architectures',
    methodology: 'MobileNetV3 / EfficientNet',
    description: 'Focus on depthwise separable convolutions to reduce model latency for clinical point-of-care embedded deployment.',
    keyPapers: ['MobileNetV4: Ultra-Efficient Neural Networks']
  },
  {
    year: 2024,
    title: 'Shifted Window Vision Transformers',
    methodology: 'Swin Transformer / TransUNet',
    description: 'Breakthrough integration of localized self-attention windows with linear spatial token mixing for 3D CT/MRI volumetric scans.',
    keyPapers: ['An Attention-Free Swin Transformer for Medical Image Segmentation']
  },
  {
    year: 2025,
    title: 'Hybrid State-Space & LLM Guidance',
    methodology: 'Mamba (SSMs) + Multimodal LLMs',
    description: 'Emerging synthesis of selective state-space sequence modeling with zero-shot multimodal generative educational and diagnostic feedback.',
    keyPapers: ['Evaluating LLM-Generated Feedback']
  }
];

export const ResearchTimeline: React.FC = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            Literature Evolution Timeline (2021 – 2025)
          </h3>
          <p className="text-xs text-zinc-400 mt-1">
            Visualizing how dominant methodologies and architectures evolved across your uploaded collection.
          </p>
        </div>
      </div>

      <div className="relative border-l-2 border-indigo-500/30 ml-4 pl-6 space-y-8">
        {researchMilestones.map((m) => (
          <div key={m.year} className="relative group">
            {/* Timeline Dot */}
            <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-indigo-600 border-4 border-[#0c0e16] group-hover:scale-125 transition-transform" />

            <Card className="hover:border-indigo-500/40">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-white/10 pb-3 mb-3">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 text-xs font-mono font-bold bg-indigo-500/20 text-indigo-300 rounded-md border border-indigo-500/30 flex items-center gap-1">
                    <Calendar className="w-3 h-3" /> {m.year}
                  </span>
                  <h4 className="text-base font-bold text-zinc-100">{m.title}</h4>
                </div>
                <span className="text-xs text-purple-400 font-mono font-medium">{m.methodology}</span>
              </div>

              <p className="text-sm text-zinc-300 leading-relaxed mb-3">{m.description}</p>

              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
                <span>Representative Literature:</span>
                <div className="flex flex-wrap gap-1">
                  {m.keyPapers.map((kp, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-200 text-[11px]">
                      {kp}
                    </span>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
};
