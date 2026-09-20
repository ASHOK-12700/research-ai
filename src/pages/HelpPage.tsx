import React from 'react';
import { HelpCircle, Mail, ShieldCheck, Upload, MessageSquareQuote } from 'lucide-react';
import { Card } from '../components/ui/Card';

const topics = [
  { icon: Upload, title: 'Build your library', text: 'Upload PDF papers from the Papers view. ResearchAI extracts metadata and section content for your account.' },
  { icon: MessageSquareQuote, title: 'Ask with evidence', text: 'Ask Your Papers searches your uploaded content and returns answer evidence with paper and page references.' },
  { icon: ShieldCheck, title: 'Your data stays scoped', text: 'Papers, folders, projects, profiles, and AI requests are scoped to your authenticated account.' },
];

export const HelpPage: React.FC = () => <div className="max-w-4xl mx-auto space-y-8 pb-16"><div><p className="text-xs uppercase tracking-widest text-indigo-400 font-mono">Support</p><h1 className="text-4xl font-bold text-white font-heading">Help and documentation</h1><p className="mt-2 text-zinc-400">Practical guidance for the core ResearchAI workflows.</p></div><div className="grid md:grid-cols-3 gap-5">{topics.map(({ icon: Icon, title, text }) => <Card key={title} className="space-y-3"><Icon className="w-6 h-6 text-indigo-400" /><h2 className="text-base font-semibold text-white">{title}</h2><p className="text-sm leading-relaxed text-zinc-400">{text}</p></Card>)}</div><Card className="space-y-3"><h2 className="flex items-center gap-2 text-lg font-semibold text-white"><HelpCircle className="w-5 h-5 text-indigo-400" />Need assistance?</h2><p className="text-sm text-zinc-400">For account or deployment support, contact the project administrator with the affected route and timestamp. Never include passwords or access tokens.</p><a className="inline-flex items-center gap-2 text-sm text-indigo-300 hover:text-indigo-200" href="mailto:support@researchai.io"><Mail className="w-4 h-4" />support@researchai.io</a></Card></div>;