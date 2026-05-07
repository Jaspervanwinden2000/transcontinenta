'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Image from 'next/image';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import TypingIndicator from './TypingIndicator';
import Sidebar from './Sidebar';
import ParticleField from './ParticleField';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

const SUGGESTIONS = [
  {
    text: 'RMA aanvragen voor een defect product',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
        <polyline points="3.27 6.96 12 12.01 20.73 6.96"/><line x1="12" y1="22.08" x2="12" y2="12"/>
      </svg>
    ),
  },
  {
    text: 'Compatibiliteit objectieven Sony A7 IV',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3"/><path d="M12 1v4M12 19v4M4.22 4.22l2.83 2.83M16.95 16.95l2.83 2.83M1 12h4M19 12h4M4.22 19.78l2.83-2.83M16.95 7.05l2.83-2.83"/>
      </svg>
    ),
  },
  {
    text: 'Inlogprobleem B2B-shop',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/>
      </svg>
    ),
  },
  {
    text: 'Garantievoorwaarden Tamron',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
      </svg>
    ),
  },
  {
    text: 'Wat zijn de levertijden?',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="1" y="3" width="15" height="13" rx="1"/><path d="M16 8h4l3 3v5h-7V8z"/><circle cx="5.5" cy="18.5" r="2.5"/><circle cx="18.5" cy="18.5" r="2.5"/>
      </svg>
    ),
  },
  {
    text: 'Productafbeeldingen en specs downloaden',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
      </svg>
    ),
  },
];

const DELAY_CLASSES = [
  'animate-fade-up-delay-1',
  'animate-fade-up-delay-2',
  'animate-fade-up-delay-3',
  'animate-fade-up-delay-4',
  'animate-fade-up-delay-5',
  'animate-fade-up-delay-6',
];

export default function ChatWindow() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showScrollBtn, setShowScrollBtn] = useState(false);

  const bottomRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Auto-scroll when new content arrives
  useEffect(() => {
    if (!showScrollBtn) {
      bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, isStreaming, showScrollBtn]);

  // Detect if user scrolled up
  const handleScroll = useCallback(() => {
    const el = scrollContainerRef.current;
    if (!el) return;
    const distFromBottom = el.scrollHeight - el.scrollTop - el.clientHeight;
    setShowScrollBtn(distFromBottom > 120);
  }, []);

  const scrollToBottom = () => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    setShowScrollBtn(false);
  };

  const startNewConversation = useCallback(() => {
    setMessages([]);
    setConversationId(null);
  }, []);

  const loadConversation = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/conversations?id=${id}`);
      const data = await res.json();
      if (data.messages) {
        setMessages(
          data.messages.map((m: { id: string; role: 'user' | 'assistant'; content: string; created_at: number }) => ({
            id: m.id,
            role: m.role,
            content: m.content,
            timestamp: m.created_at,
          }))
        );
        setConversationId(id);
        setShowScrollBtn(false);
      }
    } catch {
      // ignore
    }
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    if (isStreaming) return;

    const userMsg: Message = { id: uuidv4(), role: 'user', content, timestamp: Date.now() };
    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setIsStreaming(true);
    setShowScrollBtn(false);

    const assistantMsgId = uuidv4();
    let assistantContent = '';
    let firstChunk = true;

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages.map(m => ({ role: m.role, content: m.content })),
          conversationId,
        }),
      });

      if (!res.ok) throw new Error('API error');

      const newConvId = res.headers.get('X-Conversation-Id');
      if (newConvId && !conversationId) setConversationId(newConvId);

      const reader = res.body!.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        assistantContent += decoder.decode(value, { stream: true });

        if (firstChunk && assistantContent.trim()) {
          firstChunk = false;
          setMessages(prev => [
            ...prev,
            { id: assistantMsgId, role: 'assistant', content: assistantContent, timestamp: Date.now() },
          ]);
        } else if (!firstChunk) {
          setMessages(prev =>
            prev.map(m => m.id === assistantMsgId ? { ...m, content: assistantContent } : m)
          );
        }
      }

      if (firstChunk) {
        setMessages(prev => [...prev, { id: assistantMsgId, role: 'assistant', content: assistantContent, timestamp: Date.now() }]);
      }
    } catch (error) {
      setMessages(prev => {
        const hasAssistant = prev.some(m => m.id === assistantMsgId);
        const errMsg = { id: assistantMsgId, role: 'assistant' as const, content: 'Er is een fout opgetreden. Probeer het opnieuw of neem contact op via het support formulier.', timestamp: Date.now() };
        return hasAssistant ? prev.map(m => m.id === assistantMsgId ? errMsg : m) : [...prev, errMsg];
      });
      console.error('Chat error:', error);
    } finally {
      setIsStreaming(false);
    }
  }, [messages, conversationId, isStreaming]);

  const showTypingIndicator = isStreaming && messages[messages.length - 1]?.role !== 'assistant';
  const streamingMsgId = isStreaming && messages[messages.length - 1]?.role === 'assistant'
    ? messages[messages.length - 1].id
    : null;

  return (
    <div className="flex h-screen bg-[#08080D] text-white overflow-hidden relative">

      {/* ── Background layers ── */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-[-15%] left-[5%] w-[700px] h-[700px] rounded-full bg-[#D61E23]/[0.032] blur-[140px] animate-orb-1" />
        <div className="absolute bottom-[-20%] right-[0%] w-[600px] h-[600px] rounded-full bg-[#7C3AED]/[0.038] blur-[120px] animate-orb-2" />
        <div className="absolute top-[50%] left-[50%] w-[400px] h-[400px] rounded-full bg-[#1E1B4B]/[0.055] blur-[100px] animate-orb-3" />
      </div>
      <div className="absolute inset-0 bg-grid pointer-events-none" />
      <ParticleField />

      <Sidebar
        currentConversationId={conversationId}
        onSelectConversation={loadConversation}
        onNewConversation={startNewConversation}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0 relative">

        {/* ── Header ── */}
        <header
          className="flex items-center gap-3 px-4 py-3 shrink-0 relative"
          style={{
            background: 'rgba(10,10,15,0.8)',
            backdropFilter: 'blur(24px)',
            WebkitBackdropFilter: 'blur(24px)',
            borderBottom: '1px solid rgba(255,255,255,0.055)',
          }}
        >
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#D61E23] to-transparent opacity-55" />

          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white/5 transition-colors"
            aria-label="Menu openen"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>

          <div className="flex items-center gap-3 flex-1">
            <div className="relative shrink-0">
              <div className="absolute inset-[-3px] rounded-[14px] bg-[#D61E23]/25 blur-[6px] animate-glow" />
              <div className="relative w-9 h-9 rounded-xl overflow-hidden ring-1 ring-[#D61E23]/30">
                <Image src="/lisa-avatar.svg" alt="Lisa" width={36} height={36} />
              </div>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm tracking-tight">Lisa</span>
                {!isStreaming && <span className="text-zinc-500 text-xs">— Dealer Support</span>}
              </div>
              <div className="flex items-center gap-1.5 h-4">
                {isStreaming ? (
                  <>
                    <div className="flex items-center gap-0.5">
                      <span className="typing-dot w-1.5 h-1.5 rounded-full bg-[#D61E23]" />
                      <span className="typing-dot w-1.5 h-1.5 rounded-full bg-[#D61E23]" />
                      <span className="typing-dot w-1.5 h-1.5 rounded-full bg-[#D61E23]" />
                    </div>
                    <span className="text-[10px] text-[#D61E23]/80 tracking-wide font-medium">TYPT...</span>
                  </>
                ) : (
                  <>
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-online shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
                    <span className="text-[10px] text-zinc-500 tracking-wide">ONLINE</span>
                  </>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={startNewConversation}
            className="hidden lg:flex items-center gap-2 text-xs text-zinc-400 hover:text-white transition-all duration-150 px-3 py-1.5 rounded-lg border border-white/5 hover:border-white/10 hover:bg-white/5"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Nieuw gesprek
          </button>
        </header>

        {/* ── Messages area ── */}
        <div
          ref={scrollContainerRef}
          onScroll={handleScroll}
          className="flex-1 overflow-y-auto py-6 px-2 relative"
        >
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full px-4 text-center">
              <div className="mb-5 animate-fade-up">
                <Image src="/logo-tc.png" alt="Transcontinenta" width={180} height={36} className="object-contain opacity-90" priority />
              </div>

              <div className="w-24 h-px bg-gradient-to-r from-transparent via-[#D61E23]/60 to-transparent mb-7 animate-fade-up-delay-1" />

              <div className="relative mb-5 animate-fade-up-delay-1">
                <div className="absolute inset-[-8px] rounded-[28px] bg-[#D61E23]/20 blur-[20px] animate-glow" />
                <div className="absolute inset-[-2px] rounded-[22px] border border-[#D61E23]/20" />
                <div className="relative w-20 h-20 rounded-2xl overflow-hidden">
                  <Image src="/lisa-avatar.svg" alt="Lisa" width={80} height={80} />
                </div>
                <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-[#08080D] flex items-center justify-center">
                  <div className="w-3 h-3 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.9)] animate-online" />
                </div>
              </div>

              <h2 className="text-2xl font-bold mb-2 animate-fade-up-delay-2 tracking-tight">
                Goedendag, ik ben{' '}
                <span className="text-gradient-red">Lisa</span>
              </h2>
              <p className="text-zinc-400 text-sm max-w-xs mb-1 animate-fade-up-delay-3 leading-relaxed">
                Dealer support assistent van Transcontinenta BV.
              </p>
              <p className="text-zinc-600 text-xs max-w-sm mb-8 animate-fade-up-delay-3">
                Productinformatie · Garantie &amp; RMA · Bestellingen · Technische vragen
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 w-full max-w-xl">
                {SUGGESTIONS.map((s, idx) => (
                  <button
                    key={s.text}
                    onClick={() => sendMessage(s.text)}
                    className={`card-shine group text-left bg-[#0E0E14] border border-white/[0.07] rounded-xl px-4 py-3.5 hover:border-[#D61E23]/30 hover:bg-[#130C0C] transition-all duration-300 ${DELAY_CLASSES[idx]}`}
                    style={{ boxShadow: '0 2px 20px rgba(0,0,0,0.4)' }}
                  >
                    <div className="flex items-start gap-3">
                      <div className="mt-0.5 text-[#D61E23]/60 group-hover:text-[#D61E23] transition-colors duration-200 shrink-0">
                        {s.icon}
                      </div>
                      <span className="text-sm text-zinc-400 group-hover:text-zinc-200 transition-colors duration-200 leading-snug">
                        {s.text}
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              <p className="text-[10px] text-zinc-700 mt-8 animate-fade-up-delay-6">
                Uitsluitend voor geautoriseerde dealers en wederverkopers · Druk <kbd className="px-1 py-0.5 bg-white/5 border border-white/10 rounded text-[9px]">/</kbd> om te typen
              </p>
            </div>
          )}

          {messages.map(msg => (
            <ChatMessage
              key={msg.id}
              role={msg.role}
              content={msg.content}
              timestamp={msg.timestamp}
              isStreaming={msg.id === streamingMsgId}
            />
          ))}

          {showTypingIndicator && <TypingIndicator />}
          <div ref={bottomRef} />
        </div>

        {/* ── Scroll-to-bottom button ── */}
        {showScrollBtn && (
          <button
            onClick={scrollToBottom}
            className="scroll-btn-in absolute bottom-28 right-5 z-20 w-9 h-9 rounded-full flex items-center justify-center text-white shadow-xl transition-all hover:scale-110 active:scale-95"
            style={{
              background: 'linear-gradient(135deg,#D61E23,#A81519)',
              boxShadow: '0 4px 20px rgba(214,30,35,0.45)',
            }}
            aria-label="Scroll naar beneden"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="19"/><polyline points="19 12 12 19 5 12"/>
            </svg>
          </button>
        )}

        <ChatInput onSend={sendMessage} disabled={isStreaming} />
      </div>
    </div>
  );
}
