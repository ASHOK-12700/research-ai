import React, { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MessageSquareText, Sparkles, Send, X, Bot, ArrowUpRight } from "lucide-react";
import { chatService } from "../../services/chatService";

const quickPrompts = [
  "What are the main features of ResearchAI?",
  "How do I upload a research paper?",
  "How do I use Ask Your Papers?",
  "I''m new to ResearchAI. Help me get started.",
];

interface ChatMessage {
  id: string;
  sender: "user" | "assistant";
  text: string;
}

export const ResearchAICopilot: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "welcome",
      sender: "assistant",
      text: "Hi! I''m ResearchAI Copilot 👋\n\nI can help you understand how to use ResearchAI, answer questions about features, and provide step-by-step guidance. What would you like to know?",
    },
  ]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isOpen]);

  const handleSend = async (queryOverride?: string) => {
    const text = (queryOverride ?? input).trim();
    if (!text || isLoading) return;

    const userMessage: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: "user",
      text,
    };
    setMessages((current) => [...current, userMessage]);
    setInput("");
    setIsLoading(true);
    setError(null);

    try {
      const response = await chatService.sendMessage(text);
      const assistantMessage: ChatMessage = {
        id: `assistant-${Date.now()}`,
        sender: "assistant",
        text: response.text,
      };
      setMessages((current) => [...current, assistantMessage]);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to get a response. Please try again.";
      setError(errorMessage);
      const errorAssistantMessage: ChatMessage = {
        id: `assistant-error-${Date.now()}`,
        sender: "assistant",
        text: `I encountered an error: ${errorMessage}\n\nPlease check your connection and try again.`,
      };
      setMessages((current) => [...current, errorAssistantMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearChat = () => {
    chatService.clearHistory();
    setMessages([
      {
        id: "welcome-reset",
        sender: "assistant",
        text: "Hi! I''m ResearchAI Copilot 👋\n\nI can help you understand how to use ResearchAI, answer questions about features, and provide step-by-step guidance. What would you like to know?",
      },
    ]);
    setError(null);
  };

  return (
    <div className="fixed bottom-5 right-5 z-50">
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.97 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="mb-4 w-[min(92vw,420px)] overflow-hidden rounded-2xl border border-[var(--border-accent)] bg-[rgba(10,12,18,0.88)] shadow-[0_20px_60px_rgba(92,76,255,0.28)] backdrop-blur-xl flex flex-col max-h-[70vh]"
          >
            <div className="flex items-center justify-between border-b border-white/10 bg-[radial-gradient(circle_at_top,_rgba(124,92,255,0.18),_transparent_50%)] px-4 py-3 shrink-0">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-full border border-violet-400/40 bg-violet-500/10 text-violet-200">
                  <Bot className="h-4 w-4" />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">ResearchAI Copilot</div>
                  <div className="text-[10px] uppercase tracking-[0.2em] text-violet-200/70">Official Assistant</div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={handleClearChat}
                  className="rounded-full p-1 text-slate-300 transition hover:bg-white/5 hover:text-white"
                  aria-label="Clear chat"
                  title="Clear conversation"
                >
                  <span className="text-xs font-semibold">↻</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-full p-1 text-slate-300 transition hover:bg-white/5 hover:text-white"
                  aria-label="Close ResearchAI Copilot"
                >
                  <X className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3">
              <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-3 text-sm text-slate-200">
                <div className="mb-1 flex items-center gap-2 font-medium text-violet-200">
                  <Sparkles className="h-4 w-4" />
                  ResearchAI Assistant
                </div>
                <p className="text-xs leading-5 text-slate-300">
                  I can help you understand ResearchAI features, provide step-by-step guidance, and answer questions about the app.
                </p>
              </div>

              <div className="space-y-3">
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.sender === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm leading-6 ${
                        message.sender === "user"
                          ? "bg-violet-500 text-white shadow-[0_10px_24px_rgba(124,92,255,0.28)]"
                          : "border border-white/10 bg-white/5 text-slate-200"
                      } whitespace-pre-wrap break-words`}
                    >
                      {message.text}
                    </div>
                  </div>
                ))}

                {isLoading && (
                  <div className="flex justify-start">
                    <div className="rounded-2xl border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200">
                      <span className="inline-flex items-center gap-1.5">
                        <span className="h-2 w-2 animate-pulse rounded-full bg-violet-400" />
                        Thinking...
                      </span>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="flex justify-start">
                    <div className="rounded-2xl border border-red-400/30 bg-red-400/10 px-3 py-2 text-sm text-red-300">
                      ⚠ {error}
                    </div>
                  </div>
                )}

                <div ref={endRef} />
              </div>

              {messages.length <= 1 && !isLoading && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {quickPrompts.map((suggestion) => (
                    <button
                      key={suggestion}
                      type="button"
                      onClick={() => handleSend(suggestion)}
                      className="rounded-full border border-violet-400/30 bg-violet-500/5 px-2.5 py-1.5 text-[11px] text-violet-100 transition hover:border-violet-300/60 hover:bg-violet-500/10"
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div className="border-t border-white/10 px-3 py-3 shrink-0">
              <div className="flex items-end gap-2 rounded-xl border border-white/10 bg-black/20 p-2">
                <textarea
                  value={input}
                  onChange={(event) => setInput(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter" && !event.shiftKey) {
                      event.preventDefault();
                      handleSend();
                    }
                  }}
                  rows={1}
                  placeholder="Ask about ResearchAI..."
                  className="max-h-24 min-h-[40px] flex-1 resize-none bg-transparent px-2 py-2 text-sm text-white placeholder:text-slate-400 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={() => handleSend()}
                  disabled={!input.trim() || isLoading}
                  className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500 text-white transition hover:bg-violet-400 disabled:cursor-not-allowed disabled:opacity-50"
                  aria-label="Send message"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        aria-label="Open ResearchAI Copilot"
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.98 }}
        onClick={() => setIsOpen((value) => !value)}
        className="flex h-14 w-14 items-center justify-center rounded-full border border-violet-400/40 bg-[radial-gradient(circle_at_top,_rgba(124,92,255,0.35),_rgba(17,24,39,0.95))] text-white shadow-[0_18px_40px_rgba(124,92,255,0.35)] transition hover:shadow-[0_22px_50px_rgba(124,92,255,0.45)]"
      >
        <div className="flex flex-col items-center justify-center">
          <MessageSquareText className="h-5 w-5" />
          <ArrowUpRight className="mt-[-4px] h-3 w-3" />
        </div>
      </motion.button>
    </div>
  );
};
