import React, { useEffect, useState } from 'react';
import { Folder, Plus, ArrowRight, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { folderService } from '../services/folderService';
import { paperService } from '../services/paperService';
import type { Paper, ResearchFolder } from '../types';

export const FoldersPage: React.FC = () => {
  const navigate = useNavigate();
  const [folders, setFolders] = useState<ResearchFolder[]>([]);
  const [papers, setPapers] = useState<Paper[]>([]);
  const [open, setOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [selected, setSelected] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = async () => {
    setLoading(true);
    try { setFolders(await folderService.getFolders()); } finally { setLoading(false); }
  };

  useEffect(() => { load(); }, []);

  const openCreate = async () => {
    setPapers(await paperService.getPapers());
    setSelected([]);
    setOpen(true);
  };

  const create = async (event: React.FormEvent) => {
    event.preventDefault();
    if (!name.trim()) return;
    setSaving(true);
    try {
      await folderService.createFolder({ name, description, paperIds: selected });
      setName(''); setDescription(''); setOpen(false); await load();
    } finally { setSaving(false); }
  };

  return <div className="space-y-8 max-w-7xl mx-auto pb-16">
    <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
      <div><p className="text-xs uppercase tracking-widest text-indigo-400 font-mono">Library organization</p><h1 className="text-4xl font-bold text-[#f0f2f7] font-heading">Research folders</h1><p className="mt-2 text-[#b4b9c7]">Keep related papers together and ask questions within one collection.</p></div>
      <Button onClick={openCreate} icon={<Plus className="w-4 h-4" />}>Create Folder</Button>
    </div>
    {loading ? <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">{[1,2,3].map((item) => <Card key={item} className="h-44 animate-pulse" />)}</div> : folders.length === 0 ? <div className="py-20 text-center"><Folder className="w-12 h-12 mx-auto text-indigo-400" /><h2 className="mt-4 text-xl text-white font-semibold">No folders yet</h2><p className="mt-2 text-sm text-zinc-400">Create a folder and choose papers from your library.</p></div> : <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">{folders.map((folder) => <Card key={folder.id} hoverEffect className="space-y-5"><div className="flex justify-between"><div className="p-3 rounded-lg bg-indigo-500/10 text-indigo-300"><Folder className="w-6 h-6" /></div><span className="text-xs text-zinc-500 font-mono">{folder.paperCount} papers</span></div><div><h2 className="text-lg font-semibold text-white">{folder.name}</h2><p className="mt-2 text-sm text-zinc-400 line-clamp-2">{folder.description || 'No description provided.'}</p></div><Button variant="ghost" size="sm" onClick={() => navigate(`/folders/${folder.id}`)} icon={<ArrowRight className="w-4 h-4" />}>Open folder</Button></Card>)}</div>}
    <Modal isOpen={open} onClose={() => setOpen(false)} title="Create folder" subtitle="Select papers from your existing library now, or add them later." maxWidth="lg">
      <form onSubmit={create} className="space-y-5">
        <input required value={name} onChange={(event) => setName(event.target.value)} placeholder="Folder name" className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded-lg text-sm text-white" />
        <textarea value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Description (optional)" rows={3} className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded-lg text-sm text-white" />
        <div className="max-h-64 overflow-y-auto space-y-2">{papers.length === 0 ? <p className="text-sm text-zinc-400">Upload papers before creating a populated folder.</p> : papers.map((paper) => <label key={paper.id} className="flex items-center gap-3 p-3 rounded-lg border border-white/10 hover:border-indigo-500/40 cursor-pointer"><input type="checkbox" checked={selected.includes(paper.id)} onChange={(event) => setSelected((current) => event.target.checked ? [...current, paper.id] : current.filter((id) => id !== paper.id))} /><FileText className="w-4 h-4 text-indigo-400" /><span className="text-sm text-zinc-200 truncate">{paper.title}</span></label>)}</div>
        <Button type="submit" disabled={saving}>{saving ? 'Creating...' : 'Create folder'}</Button>
      </form>
    </Modal>
  </div>;
};