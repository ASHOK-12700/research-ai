import React, { useState, useEffect, useRef } from 'react';
import { useOutletContext } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  MessageSquareQuote,
  Send,
  Sparkles,
  FileText,
  User,
  Bot,
  ExternalLink,
  HelpCircle,
  AlertCircle
} from 'lucide-react';
import { ragService } from '../services/ragService';
import type { Evidence } from '../services/ragService';
import { useAuth } from '../contexts/AuthContext';
import { suggestedPrompts } from '../data/mockConversations';
import type { ChatMessage, SourceReference } from '../types';

export const AskPapersPage: React.FC = () => {
  const { onOpenEvidence } = useOutletContext<{
    onOpenEvidence: (source: SourceReference) => void;
  }>();
  const { user } = useAuth();

  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const text = textToSend || input;
    if (!text.trim() || loading || !user) return;

    setInput('');
    setError(null);
    setLoading(true);

    try {
      // Add user message
      const userMessage: ChatMessage = {
        id: `msg-u-${Date.now()}`,
        sender: 'user',
        text,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };
      setMessages(prev => [...prev, userMessage]);

      // Call RAG service
      const response = await ragService.queryPapers({
        query: text,
        temperature: 0.2,
        reasoning_depth: 'Standard Analysis',
      });

      // Convert response to ChatMessage with sources
      const assistantMessage: ChatMessage = {
        id: `msg-${Date.now()}`,
        sender: 'assistant',
        text: response.answer,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        sources: response.evidence.length > 0 ? response.evidence.map((e: Evidence) => ({
          paperId: e.paper_id || '',
          paperTitle: e.paper_title || '',
          page: e.page_number || 0,
          section: e.section || 'Unknown',
          snippet: e.snippet || ''
        })) : undefined
      };

      setMessages(prev => [...prev, assistantMessage]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to query papers. Please try again.';
      setError(errorMessage);
      
      // Remove the user message on error
      setMessages(prev => prev.slice(0, -1));
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-6rem)] max-w-5xl mx-auto">
        <div className="text-center space-y-4">
          <AlertCircle className="w-12 h-12 text-yellow-500 mx-auto" />
          <p className="text-zinc-400">Please log in to use Ask Your Papers.</p>
        </div>
      </div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="flex flex-col h-[calc(100vh-6rem)] max-w-5xl mx-auto pb-4"
    >
      {/* Premium Header */}
      <div className="flex items-center justify-between pb-6 border-b border-white/10 shrink-0">
        <div className="space-y-2">
          <h1 className="text-3xl md:text-4xl font-bold text-[#f0f2f7] font-heading flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-indigo-600/20 border border-indigo-500/30">
              <MessageSquareQuote className="w-6 h-6 text-indigo-400" />
            </div>
            Ask Your Papers
          </h1>
          <p className="text-sm text-[#b4b9c7]">
            Query across your entire literature library with page-level citation evidence.
          </p>
        </div>
        <div className="px-3 py-1.5 text-xs font-mono font-bold text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 rounded-full flex items-center gap-2 shrink-0">
          <motion.span
            animate={{ rotate: 360 }}
            transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
          >
            <Sparkles className="w-3 h-3" />
          </motion.span>
          RAG Active
        </div>
      </div>

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto py-8 space-y-6 scrollbar-thin">
        <AnimatePresence mode="wait">
          {messages.length === 0 ? (
            <motion.div
              key="empty-state"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.4 }}
              className="py-12 text-center space-y-8 max-w-lg mx-auto"
            >
              <div className="w-20 h-20 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mx-auto shadow-lg shadow-indigo-500/10">
                <Bot className="w-10 h-10" />
              </div>
              <div className="space-y-3">
                <h2 className="text-2xl font-bold text-[#f0f2f7] font-heading">Ask About Your Research</h2>
                <p className="text-sm text-[#b4b9c7] leading-relaxed">
                  Our AI synthesizes evidence across all papers in your library, citing exact pages and sections.
                </p>
              </div>

              {/* Suggested Prompts */}
              <div className="space-y-3 text-left pt-4">
                <span className="text-xs font-bold uppercase tracking-widest text-[#7d8599] flex items-center gap-2 justify-center">
                  <HelpCircle className="w-4 h-4 text-indigo-400" /> Try These Queries
                </span>
                <div className="space-y-2">
                  {suggestedPrompts.map((prompt, idx) => (
                    <motion.button
                      key={idx}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3, delay: idx * 0.05 }}
                      onClick={() => handleSend(prompt)}
                      className="w-full text-left p-4 rounded-lg bg-[#0f131a] hover:bg-indigo-600/10 border border-white/10 hover:border-indigo-500/50 text-sm text-[#b4b9c7] transition-all duration-200 cursor-pointer flex items-center justify-between group"
                    >
                      <span className="truncate">"{prompt}"</span>
                      <span className="text-indigo-400 opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-2">→</span>
                    </motion.button>
                  ))}
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key="messages"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {messages.map((msg, idx) => (
                <motion.div
                  key={msg.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: idx * 0.05 }}
                  className={`flex items-start gap-4 ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.sender === 'assistant' && (
                    <div className="w-9 h-9 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
                      <Bot className="w-5 h-5" />
                    </div>
                  )}

                  <div className={`max-w-2xl space-y-3 flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}>
                    {/* Text Bubble */}
                    <div
                      className={`p-5 rounded-xl text-sm leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-indigo-600 text-[#f0f2f7] rounded-tr-none shadow-lg shadow-indigo-600/20'
                          : 'bg-[#0f131a] text-[#b4b9c7] border border-white/10 rounded-tl-none'
                      }`}
                    >
                      <p className="whitespace-pre-wrap">{msg.text}</p>
                    </div>

                    {/* Sources Section */}
                    {msg.sources && msg.sources.length > 0 && (
                      <motion.div
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="p-4 rounded-lg bg-[#0f131a]/50 border border-indigo-500/20 space-y-3 w-full"
                      >
                        <span className="text-xs font-mono font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                          <FileText className="w-4 h-4" /> Evidence ({msg.sources.length})
                        </span>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {msg.sources.map((src, srcIdx) => (
                            <button
                              key={srcIdx}
                              onClick={() => onOpenEvidence(src)}
                              className="p-3 rounded-lg bg-[#121820] hover:bg-indigo-600/10 border border-white/10 hover:border-indigo-500/30 transition-all text-left group space-y-1.5"
                            >
                              <div className="flex items-center justify-between text-xs font-mono text-indigo-300">
                                <span>p.{src.page} • {src.section}</span>
                                <ExternalLink className="w-3 h-3 text-[#7d8599] group-hover:text-indigo-400 transition-colors" />
                              </div>
                              <h5 className="text-xs font-semibold text-[#f0f2f7] line-clamp-1 group-hover:text-indigo-300 transition-colors">
                                {src.paperTitle}
                              </h5>
                              <p className="text-xs text-[#7d8599] italic line-clamp-1">"{src.snippet}"</p>
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    )}

                    <span className="text-xs text-[#7d8599] font-mono px-2">{msg.timestamp}</span>
                  </div>

                  {msg.sender === 'user' && (
                    <div className="w-9 h-9 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
                      <User className="w-5 h-5" />
                    </div>
                  )}
                </motion.div>
              ))}
            </motion.div>
          )}

          {loading && (
            <motion.div
              key="loading"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="flex items-start gap-4"
            >
              <div className="w-9 h-9 rounded-lg bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-400 shrink-0">
                <Bot className="w-5 h-5" />
              </div>
              <div className="p-5 rounded-xl bg-[#0f131a] border border-white/10 text-xs text-indigo-300 font-mono flex items-center gap-2">
                <motion.div
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'linear' }}
                >
                  <Sparkles className="w-4 h-4" />
                </motion.div>
                Synthesizing across literature...
              </div>
            </motion.div>
          )}

          {error && (
            <motion.div
              key="error"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="p-4 rounded-lg bg-red-500/10 border border-red-500/30 text-red-400 text-sm flex items-start gap-3"
            >
              <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold">Error</p>
                <p>{error}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div ref={messagesEndRef} />
      </div>

      {/* Premium Input Bar */}
      <div className="pt-4 border-t border-white/10 shrink-0">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleSend();
          }}
          className="flex items-center gap-3 p-3 rounded-xl bg-gradient-to-r from-[#0f131a] to-[#0a0e15] border border-white/10 focus-within:border-indigo-500/50 focus-within:shadow-lg focus-within:shadow-indigo-500/10 transition-all"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask about datasets, methodologies, results..."
            className="flex-1 px-4 py-2.5 bg-transparent text-sm text-[#f0f2f7] placeholder-[#7d8599] focus:outline-none"
            disabled={loading}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="shrink-0 px-4 py-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-[#f0f2f7] font-medium text-sm flex items-center gap-2 transition-all shadow-lg shadow-indigo-600/20"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      </div>
    </motion.div>
  );
};
