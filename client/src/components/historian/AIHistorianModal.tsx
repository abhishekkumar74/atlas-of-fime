import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { queryAIHistorian } from '../../lib/aiHistorian';
import type { AIHistorianResponse } from '../../lib/types/database.types';
import { useTimelineStore } from '../../lib/store/useTimelineStore';
import { useAuth } from '../../lib/authService';
import {
  Bot,
  X,
  Send,
  Loader2,
  Sparkles,
  ExternalLink,
  Info,
  ShieldAlert,
} from 'lucide-react';

interface ChatMessage {
  id: string;
  sender: 'user' | 'historian';
  text: string;
  citations?: AIHistorianResponse['citations'];
  refused?: boolean;
}

interface AIHistorianModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AIHistorianModal: React.FC<AIHistorianModalProps> = ({
  isOpen,
  onClose,
}) => {
  const navigate = useNavigate();
  const { openPanel } = useTimelineStore();
  const { user } = useAuth();

  const [question, setQuestion] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-welcome',
      sender: 'historian',
      text: 'Greetings. I am the Atlas of Time AI Historian — a navigator grounded strictly in active database records. Ask any question about historical events, figures, or civilizations in the atlas.',
    },
  ]);
  const [loading, setLoading] = useState(false);

  if (!isOpen) return null;

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    const trimmed = question.trim();
    if (!trimmed || loading) return;

    const userMsg: ChatMessage = {
      id: `msg-${Date.now()}-user`,
      sender: 'user',
      text: trimmed,
    };

    setMessages((prev) => [...prev, userMsg]);
    setQuestion('');
    setLoading(true);

    try {
      const res = await queryAIHistorian(trimmed, user?.id || 'anon-user');
      const historianMsg: ChatMessage = {
        id: `msg-${Date.now()}-historian`,
        sender: 'historian',
        text: res.answer,
        citations: res.citations,
        refused: res.refused,
      };

      setMessages((prev) => [...prev, historianMsg]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: `msg-${Date.now()}-error`,
          sender: 'historian',
          text: 'An error occurred while processing your query.',
          refused: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCitationClick = (citation: NonNullable<ChatMessage['citations']>[0]) => {
    if (citation.entityType === 'event') {
      openPanel(citation.id);
    } else if (citation.entityType === 'person') {
      navigate(citation.targetUrl);
    } else {
      navigate('/');
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-0 sm:p-4 bg-black/70 backdrop-blur-sm">
      <div className="w-full h-full sm:h-[580px] sm:max-w-2xl bg-atlas-panel border border-atlas-border sm:rounded-xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-4 bg-atlas-surface border-b border-atlas-border flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-atlas-brass/10 border border-atlas-brass/30 rounded-lg text-atlas-brass">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-serif text-sm font-bold text-atlas-parchment flex items-center gap-1.5">
                <span>AI Historian Navigator</span>
                <span className="text-[10px] font-mono bg-atlas-brass/20 text-atlas-brass px-1.5 py-0.5 rounded border border-atlas-brass/30 uppercase hidden sm:inline">
                  Grounding Mode
                </span>
              </h2>
              <p className="text-[11px] text-atlas-muted line-clamp-1">
                Retrieval-grounded historical synthesis over active database records
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 text-atlas-muted hover:text-atlas-parchment rounded hover:bg-atlas-panel transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Grounding Disclaimer Banner */}
        <div className="px-4 py-2 bg-atlas-brass/10 border-b border-atlas-brass/20 flex items-center gap-2 text-[11px] text-atlas-parchment">
          <Info className="w-4 h-4 text-atlas-brass flex-shrink-0" />
          <span className="line-clamp-2">
            Experimental assistant grounded only in active records. Uncovered topics are refused to prevent hallucination.
          </span>
        </div>

        {/* Chat History List */}
        <div className="flex-1 p-4 overflow-y-auto space-y-4 font-sans text-xs">
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex flex-col ${
                msg.sender === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              <div
                className={`max-w-[90%] sm:max-w-[85%] p-3 rounded-lg space-y-2 border ${
                  msg.sender === 'user'
                    ? 'bg-atlas-brass/20 text-atlas-parchment border-atlas-brass/30 rounded-br-none'
                    : msg.refused
                    ? 'bg-amber-950/30 text-amber-200 border-amber-500/30 rounded-bl-none'
                    : 'bg-atlas-surface text-atlas-text border-atlas-border rounded-bl-none'
                }`}
              >
                <div className="flex items-center gap-1.5 text-[10px] font-mono text-atlas-muted uppercase mb-1">
                  {msg.sender === 'user' ? (
                    <span>You</span>
                  ) : (
                    <span className="flex items-center gap-1 text-atlas-brass font-bold">
                      <Sparkles className="w-3 h-3" />
                      AI Historian
                    </span>
                  )}
                </div>

                {msg.refused && (
                  <div className="flex items-center gap-1.5 text-[11px] text-amber-400 font-mono font-semibold">
                    <ShieldAlert className="w-3.5 h-3.5" />
                    <span>Non-Hallucination Refusal</span>
                  </div>
                )}

                <div className="leading-relaxed whitespace-pre-wrap">{msg.text}</div>

                {/* Clickable Citations */}
                {msg.citations && msg.citations.length > 0 && (
                  <div className="pt-2 border-t border-atlas-border/40 space-y-1.5">
                    <div className="text-[10px] font-mono text-atlas-muted uppercase">
                      Grounded Database Citations:
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {msg.citations.map((cit) => (
                        <button
                          key={cit.id}
                          onClick={() => handleCitationClick(cit)}
                          className="inline-flex items-center gap-1.5 text-[10px] font-mono bg-atlas-brass/10 hover:bg-atlas-brass/20 text-atlas-brass px-2 py-1 rounded border border-atlas-brass/30 transition-colors"
                        >
                          <span>{cit.title}</span>
                          <ExternalLink className="w-2.5 h-2.5" />
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-atlas-brass font-mono text-xs animate-pulse">
              <Loader2 className="w-4 h-4 animate-spin" />
              <span>Querying database index & synthesizing answer...</span>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSend} className="p-3 bg-atlas-surface border-t border-atlas-border flex gap-2">
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Ask a historical question..."
            className="flex-1 px-3 py-2 bg-atlas-panel border border-atlas-border rounded-md text-xs text-atlas-text placeholder-atlas-subtle focus:outline-none focus:border-atlas-brass"
          />
          <button
            type="submit"
            disabled={loading || !question.trim()}
            className="py-2 px-4 bg-atlas-brass text-atlas-bg text-xs font-bold rounded-md hover:bg-atlas-brass/90 transition-colors disabled:opacity-40 flex items-center gap-1.5"
          >
            <span>Ask</span>
            <Send className="w-3.5 h-3.5" />
          </button>
        </form>
      </div>
    </div>
  );
};
