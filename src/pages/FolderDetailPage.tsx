import React, { useEffect, useState } from 'react';
import { ArrowLeft, FileText, MessageSquareQuote, X } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { folderService } from '../services/folderService';
import { paperService } from '../services/paperService';
import type { Paper, ResearchFolder } from '../types';

export const FolderDetailPage: React.FC = () => {
  const { folderId } = useParams<{ folderId: string }>();
  const navigate = useNavigate();
  const [folder, setFolder] = useState<ResearchFolder | null>(null);
  const [papers, setPapers] = useState<Paper[]>([]);
  const [available, setAvailable] = useState<Paper[]>([]);
  const [selected, setSelected] = useState<string[]>([]);

  const load = async () => {
    if (!folderId) return;
    const next = await folderService.getFolder(folderId);
    setFolder(next);
    const all = await paperService.getPapers();
    setPapers(all.filter((paper) => next.paperIds.includes(paper.id)));
    setAvailable(all.filter((paper) => !next.paperIds.includes(paper.id)));
  };
  useEffect(() => { load(); }, [folderId]);

  if (!folder) return <div className="p-12 text-zinc-400">Loading folder...</div>;
  const add = async () => { if (folderId && selected.length) { await folderService.addPapers(folderId, selected); setSelected([]); await load(); } };
  const remove = async (paperId: string) => { if (folderId) { await folderService.removePaper(folderId, paperId); await load(); } };
  return <div className="space-y-8 max-w-6xl mx-auto pb-16"><button onClick={() => navigate('/folders')} className="flex gap-2 items-center text-sm text-zinc-400 hover:text-white"><ArrowLeft className="w-4 h-4" />Folders</button><div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4"><div><h1 className="text-4xl font-bold text-white font-heading">{folder.name}</h1><p className="mt-2 text-zinc-400">{folder.description || 'No description provided.'}</p></div><Button onClick={() => navigate(`/ask?folder_id=${encodeURIComponent(folder.id)}`)} icon={<MessageSquareQuote className="w-4 h-4" />}>Ask this folder</Button></div><section className="space-y-4"><h2 className="text-lg font-semibold text-white">Papers in folder ({papers.length})</h2>{papers.length === 0 ? <Card><p className="text-sm text-zinc-400">This folder is empty.</p></Card> : papers.map((paper) => <Card key={paper.id} className="flex items-center justify-between gap-4"><button className="flex items-center gap-3 text-left min-w-0" onClick={() => navigate(`/papers/${paper.id}`)}><FileText className="w-5 h-5 text-indigo-400 shrink-0" /><span className="text-sm text-zinc-200 truncate">{paper.title}</span></button><button onClick={() => remove(paper.id)} title="Remove from folder" className="p-2 text-zinc-500 hover:text-red-300"><X className="w-4 h-4" /></button></Card>)}</section><section className="space-y-4"><h2 className="text-lg font-semibold text-white">Add papers</h2><div className="space-y-2">{available.map((paper) => <label key={paper.id} className="flex items-center gap-3 p-3 rounded-lg border border-white/10"><input type="checkbox" checked={selected.includes(paper.id)} onChange={(event) => setSelected((current) => event.target.checked ? [...current, paper.id] : current.filter((id) => id !== paper.id))} /><span className="text-sm text-zinc-200">{paper.title}</span></label>)}</div><Button onClick={add} disabled={!selected.length}>Add selected papers</Button></section></div>;
};