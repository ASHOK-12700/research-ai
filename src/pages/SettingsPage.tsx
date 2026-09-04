import React, { useEffect, useState } from 'react';
import {
  Settings,
  User,
  Sliders,
  BookOpenCheck,
  Info,
  Check,
  Sparkles,
  AlertCircle,
  FileText
} from 'lucide-react';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useAuth } from '../contexts/AuthContext';
import { supabase } from '../services/supabaseClient';
import { aiPreferencesService } from '../services/aiPreferencesService';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<'profile' | 'ai' | 'citations' | 'about'>('ai');
  const [profile, setProfile] = useState<{ full_name?: string | null; email?: string | null; avatar_url?: string | null } | null>(null);

  // AI Preferences
  const [aiModel, setAiModel] = useState('meta/llama-3.2-3b-instruct');
  const [temperature, setTemperature] = useState(0.2);
  const [reasoningDepth, setReasoningDepth] = useState<'Standard Analysis' | 'Deep Analysis' | 'Exhaustive'>('Standard Analysis');
  const [saved, setSaved] = useState(false);
  const [savingError, setSavingError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) {
        setProfile(null);
        return;
      }
      if (!supabase) {
        setProfile(null);
        return;
      }

      const { data, error } = await supabase
        .from('profiles')
        .select('full_name, email, avatar_url')
        .eq('id', user.id)
        .maybeSingle();

      if (!error) {
        setProfile(data);
      }
    };

    const fetchPreferences = async () => {
      if (!user?.id) return;

      setLoading(true);
      try {
        const prefs = await aiPreferencesService.getPreferences(user.id);
        setAiModel(prefs.model);
        setTemperature(prefs.temperature);
        setReasoningDepth(prefs.reasoning_depth);
      } catch (err) {
        // Fall back to local storage if backend fails
        const localPrefs = aiPreferencesService.getLocalPreferences();
        if (localPrefs) {
          setAiModel(localPrefs.model || 'meta/llama-3.2-3b-instruct');
          setTemperature(localPrefs.temperature || 0.2);
          setReasoningDepth((localPrefs.reasoning_depth as any) || 'Standard Analysis');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
    fetchPreferences();
  }, [user?.id]);

  const handleSave = async () => {
    if (!user?.id) return;

    setSaved(false);
    setSavingError(null);

    try {
      const prefs = await aiPreferencesService.savePreferences({
        user_id: user.id,
        model: aiModel,
        temperature,
        reasoning_depth: reasoningDepth,
      });

      // Also save to local storage as backup
      aiPreferencesService.setLocalPreferences(prefs);

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Failed to save preferences';
      setSavingError(errorMsg);

      // Still save to local storage
      aiPreferencesService.setLocalPreferences({
        model: aiModel,
        temperature,
        reasoning_depth: reasoningDepth,
      });
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-12">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-zinc-100 font-heading flex items-center gap-2">
          <Settings className="w-6 h-6 text-indigo-400" />
          Settings & Configuration
        </h1>
        <p className="text-sm text-zinc-400 mt-1">
          Customize AI processing preferences, theme aesthetics, and default citation defaults.
        </p>
      </div>

      {/* Tabs Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Nav */}
        <div className="md:col-span-3 space-y-1">
          {[
            { id: 'ai', label: 'AI Preferences', icon: Sliders },
            { id: 'profile', label: 'User Profile', icon: User },
            { id: 'citations', label: 'Citation Defaults', icon: BookOpenCheck },
            { id: 'about', label: 'About ResearchAI', icon: Info }
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id as any)}
              className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors cursor-pointer ${
                activeTab === item.id
                  ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/30'
                  : 'text-zinc-400 hover:bg-white/5 hover:text-zinc-200'
              }`}
            >
              <item.icon className="w-4 h-4" />
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        {/* Right Content */}
        <div className="md:col-span-9 space-y-6">
          {activeTab === 'ai' && (
            <Card glow className="space-y-6 p-6">
              <div className="border-b border-white/10 pb-4">
                <h3 className="text-base font-bold text-zinc-100 flex items-center gap-2 font-heading">
                  <Sparkles className="w-5 h-5 text-indigo-400" />
                  AI Processing Preferences
                </h3>
                <p className="text-xs text-zinc-400 mt-0.5">
                  Configure how the AI analyzes your papers and generates responses.
                </p>
              </div>

              {savingError && (
                <div className="p-3 rounded-lg bg-yellow-500/10 border border-yellow-500/30 text-yellow-600 text-xs flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Note</p>
                    <p>{savingError} (using local storage)</p>
                  </div>
                </div>
              )}

              <div className="space-y-4 text-xs">
                {/* AI Model choice */}
                <div>
                  <label className="block font-semibold text-zinc-200 mb-1">AI Model</label>
                  <select
                    value={aiModel}
                    onChange={(e) => setAiModel(e.target.value)}
                    className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded-lg text-zinc-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="meta/llama-3.2-3b-instruct">Llama 3.2 (3B)</option>
                    <option value="meta/llama-2-70b-chat">Llama 2 (70B)</option>
                  </select>
                  <p className="text-[10px] text-zinc-500 mt-1">Selected model will be used for Ask Your Papers and general queries.</p>
                </div>

                {/* Temperature Slider */}
                <div>
                  <div className="flex justify-between font-semibold text-zinc-200 mb-1">
                    <span>Temperature (Creativity)</span>
                    <span className="font-mono text-indigo-400">{temperature.toFixed(2)}</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.05}
                    value={temperature}
                    onChange={(e) => setTemperature(parseFloat(e.target.value))}
                    className="w-full accent-indigo-500 cursor-pointer"
                  />
                  <span className="text-[10px] text-zinc-500 mt-1">
                    Lower values (0.1–0.3) produce more deterministic, focused answers for research. Higher values (0.7–1.0) produce more creative responses.
                  </span>
                </div>

                {/* Reasoning Depth */}
                <div>
                  <label className="block font-semibold text-zinc-200 mb-1">Reasoning & Analysis Depth</label>
                  <select
                    value={reasoningDepth}
                    onChange={(e) => setReasoningDepth(e.target.value as any)}
                    className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded-lg text-zinc-200 focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Standard Analysis">Standard Analysis (Fast)</option>
                    <option value="Deep Analysis">Deep Analysis (Full Equations & Methods)</option>
                    <option value="Exhaustive">Exhaustive Literature Audit</option>
                  </select>
                  <p className="text-[10px] text-zinc-500 mt-1">
                    • <strong>Standard:</strong> Quick synthesis across relevant papers<br/>
                    • <strong>Deep:</strong> Detailed extraction with full methodologies and equations<br/>
                    • <strong>Exhaustive:</strong> Comprehensive synthesis across all available papers
                  </p>
                </div>
              </div>

              <div className="pt-4 border-t border-white/10 flex justify-end gap-3">
                {saved && (
                  <span className="text-xs text-emerald-400 flex items-center gap-1.5">
                    <Check className="w-4 h-4" />
                    Saved successfully
                  </span>
                )}
                <Button 
                  variant="primary" 
                  onClick={handleSave}
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Preferences'}
                </Button>
              </div>
            </Card>
          )}

          {activeTab === 'profile' && (
            <Card className="space-y-4 p-6">
              <h3 className="text-base font-bold text-zinc-100 font-heading">Researcher Profile</h3>
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 flex items-center justify-center font-bold text-xl text-white shadow-xl">
                  {profile?.full_name
                    ? profile.full_name
                        .split(' ')
                        .slice(0, 2)
                        .map((part) => part[0]?.toUpperCase() ?? '')
                        .join('')
                    : (user?.email ?? 'R')
                        .slice(0, 2)
                        .toUpperCase()}
                </div>
                <div>
                  <h4 className="font-bold text-zinc-100">{profile?.full_name || 'Researcher'}</h4>
                  <p className="text-xs text-zinc-400">{profile?.email || user?.email || 'No profile data yet'}</p>
                  <span className="text-[10px] font-mono text-indigo-400">{user?.id ? 'Supabase profile' : 'Not signed in'}</span>
                </div>
              </div>
            </Card>
          )}

          {activeTab === 'citations' && (
            <Card className="space-y-4 p-6">
              <h3 className="text-base font-bold text-zinc-100 font-heading">Default Citation Formatting</h3>
              <p className="text-xs text-zinc-400">Choose your preferred default reference style when copying citations.</p>
              <select className="w-full px-3 py-2 bg-zinc-900 border border-white/10 rounded-lg text-xs text-zinc-200 focus:outline-none focus:border-indigo-500">
                <option value="APA">APA 7th Edition</option>
                <option value="IEEE">IEEE Reference Standard</option>
                <option value="MLA">MLA 9th Edition</option>
                <option value="BibTeX">BibTeX Code</option>
              </select>
            </Card>
          )}

          {activeTab === 'about' && (
            <div className="space-y-6">
              {/* Main About Section */}
              <Card glow className="space-y-6 p-8">
                <div>
                  <h3 className="text-2xl font-bold text-zinc-100 font-heading mb-2">ResearchAI</h3>
                  <p className="text-sm text-zinc-300 leading-relaxed mb-4">
                    ResearchAI is an intelligent research workspace designed to help researchers organize, understand, compare, and synthesize academic literature using evidence from their own uploaded papers.
                  </p>
                  <div className="flex items-center gap-2">
                    <Badge variant="indigo" className="font-mono text-xs">v1.0.0</Badge>
                    <Badge variant="indigo" className="font-mono text-xs">Production Ready</Badge>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Core Capabilities */}
                  <div className="space-y-4">
                    <h4 className="font-bold text-zinc-200 text-sm flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-indigo-400" />
                      Core Capabilities
                    </h4>
                    <ul className="space-y-2 text-xs text-zinc-400 leading-relaxed">
                      <li className="flex gap-2">
                        <span className="text-indigo-400 font-bold">•</span>
                        <span><strong>Paper Upload & Library:</strong> Upload PDF research papers and build your literature database. Papers are securely stored and searchable.</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-indigo-400 font-bold">•</span>
                        <span><strong>Ask Your Papers:</strong> Query your entire library with natural language. The AI retrieves relevant content and generates evidence-based answers with citations.</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-indigo-400 font-bold">•</span>
                        <span><strong>Evidence & Citations:</strong> Every answer includes page-level evidence snippets from your papers, making claims verifiable.</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-indigo-400 font-bold">•</span>
                        <span><strong>Paper Comparison:</strong> Analyze methodologies, results, and datasets across multiple papers side-by-side.</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-indigo-400 font-bold">•</span>
                        <span><strong>Research Projects:</strong> Organize papers into focused research projects for better workflow management.</span>
                      </li>
                    </ul>
                  </div>

                  {/* How It Works */}
                  <div className="space-y-4">
                    <h4 className="font-bold text-zinc-200 text-sm flex items-center gap-2">
                      <FileText className="w-4 h-4 text-indigo-400" />
                      How It Works
                    </h4>
                    <ul className="space-y-2 text-xs text-zinc-400 leading-relaxed">
                      <li className="flex gap-2">
                        <span className="text-indigo-400 font-bold">1</span>
                        <span><strong>Upload Papers:</strong> Log in and upload PDF files. The system extracts text, metadata, and sections.</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-indigo-400 font-bold">2</span>
                        <span><strong>Ask Questions:</strong> Use Ask Your Papers to pose research-related questions about your library.</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-indigo-400 font-bold">3</span>
                        <span><strong>AI Retrieval & Synthesis:</strong> The system retrieves relevant paper sections using semantic matching.</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-indigo-400 font-bold">4</span>
                        <span><strong>LLM Processing:</strong> An AI language model synthesizes evidence into coherent answers with proper citations.</span>
                      </li>
                      <li className="flex gap-2">
                        <span className="text-indigo-400 font-bold">5</span>
                        <span><strong>Evidence-Based Results:</strong> Receive answers with clickable evidence cards linking to specific papers and pages.</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </Card>

              {/* Technology Stack */}
              <Card className="space-y-4 p-6">
                <h4 className="font-bold text-zinc-200 text-sm">Technology Architecture</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="space-y-3">
                    <div>
                      <p className="font-semibold text-zinc-300 mb-1">Frontend</p>
                      <p className="text-zinc-500">React + TypeScript, Vite, Tailwind CSS, Framer Motion for premium interactions.</p>
                    </div>
                    <div>
                      <p className="font-semibold text-zinc-300 mb-1">Authentication</p>
                      <p className="text-zinc-500">Supabase with email/password and Google OAuth support. User data is encrypted and isolated.</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <p className="font-semibold text-zinc-300 mb-1">Backend</p>
                      <p className="text-zinc-500">Python FastAPI with secure endpoints for paper processing, RAG queries, and AI preferences.</p>
                    </div>
                    <div>
                      <p className="font-semibold text-zinc-300 mb-1">AI Models</p>
                      <p className="text-zinc-500">Configurable LLM endpoints (NVIDIA NIM). RAG uses semantic retrieval with synthesis.</p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Data Privacy & Security */}
              <Card className="space-y-4 p-6 border-emerald-500/20 bg-emerald-500/5">
                <h4 className="font-bold text-zinc-200 text-sm flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  Privacy & Security
                </h4>
                <ul className="space-y-2 text-xs text-zinc-400">
                  <li className="flex gap-2">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span>User authentication required. Each user only sees their own papers and data.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span>API keys and secrets are never exposed in frontend code.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span>PDF uploads are validated and stored securely in Supabase Storage.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span>All AI queries are processed server-side with proper authentication.</span>
                  </li>
                  <li className="flex gap-2">
                    <span className="text-emerald-400 font-bold">✓</span>
                    <span>AI preferences are user-specific and saved securely in the database.</span>
                  </li>
                </ul>
              </Card>

              {/* Getting Started */}
              <Card className="space-y-4 p-6 border-indigo-500/20 bg-indigo-500/5">
                <h4 className="font-bold text-zinc-200 text-sm">Getting Started</h4>
                <ol className="space-y-2 text-xs text-zinc-400 list-decimal list-inside">
                  <li>Sign up or log in with your email or Google account.</li>
                  <li>Navigate to the Research Library and upload your first PDF paper.</li>
                  <li>Go to "Ask Your Papers" and try a research-related question.</li>
                  <li>Explore your papers, create projects, and compare research findings.</li>
                  <li>Adjust AI preferences in Settings to customize analysis depth and model behavior.</li>
                </ol>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
