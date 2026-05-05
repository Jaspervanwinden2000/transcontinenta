'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { v4 as uuidv4 } from 'uuid';
import Image from 'next/image';
import ChatMessage from './ChatMessage';
import ChatInput from './ChatInput';
import TypingIndicator from './TypingIndicator';
import Sidebar from './Sidebar';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

const SUGGESTIONS = [
  'RMA aanvragen voor een defect product',
  'Compatibiliteit objectieven Sony A7 IV',
  'Inlogprobleem B2B-shop',
  'Garantievoorwaarden Tamron',
  'Wat zijn de levertijden?',
  'Productafbeeldingen en specs downloaden',
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
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isStreaming]);

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
      }
    } catch {
      // ignore
    }
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    if (isStreaming) return;

    const userMsg: Message = {
      id: uuidv4(),
      role: 'user',
      content,
      timestamp: Date.now(),
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setIsStreaming(true);

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
      if (newConvId && !conversationId) {
        setConversationId(newConvId);
      }

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
            prev.map(m =>
              m.id === assistantMsgId ? { ...m, content: assistantContent } : m
            )
          );
        }
      }

      // Ensure final content is set even if we never got past firstChunk
      if (firstChunk) {
        setMessages(prev => [
          ...prev,
          { id: assistantMsgId, role: 'assistant', content: assistantContent, timestamp: Date.now() },
        ]);
      }
    } catch (error) {
      setMessages(prev => {
        const hasAssistant = prev.some(m => m.id === assistantMsgId);
        const errorMsg = { id: assistantMsgId, role: 'assistant' as const, content: 'Er is een fout opgetreden. Probeer het opnieuw of neem contact op via het support formulier.', timestamp: Date.now() };
        return hasAssistant ? prev.map(m => m.id === assistantMsgId ? errorMsg : m) : [...prev, errorMsg];
      });
      console.error('Chat error:', error);
    } finally {
      setIsStreaming(false);
    }
  }, [messages, conversationId, isStreaming]);

  const showTypingIndicator = isStreaming && messages[messages.length - 1]?.role !== 'assistant';

  return (
    <div className="flex h-screen bg-[#0F0F14] text-white overflow-hidden">
      <Sidebar
        currentConversationId={conversationId}
        onSelectConversation={loadConversation}
        onNewConversation={startNewConversation}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex-1 flex flex-col min-w-0">
        {/* Header */}
        <header className="flex items-center gap-3 px-4 py-3 border-b border-[#1E1E22] bg-[#111113] shrink-0">
          <button
            onClick={() => setSidebarOpen(true)}
            className="lg:hidden w-9 h-9 flex items-center justify-center rounded-lg hover:bg-[#27272A] transition-colors"
            aria-label="Menu openen"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>

          <div className="flex items-center gap-3 flex-1">
            <div className="w-9 h-9 rounded-xl overflow-hidden shrink-0">
              <Image src="/logo.svg" alt="Transcontinenta" width={36} height={36} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm">Lisa</span>
                <span className="text-zinc-500 text-sm">— Dealer Support</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-online" />
                <span className="text-[11px] text-zinc-500">Online</span>
              </div>
            </div>
          </div>

          <button
            onClick={startNewConversation}
            className="hidden lg:flex items-center gap-2 text-sm text-zinc-400 hover:text-white transition-all duration-150 px-3 py-1.5 rounded-lg hover:bg-[#27272A]"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Nieuw gesprek
          </button>
        </header>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto py-4">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full px-4 text-center">
              <div className="w-20 h-20 rounded-2xl overflow-hidden mb-5 animate-fade-up shadow-xl shadow-black/40">
                <Image src="/logo.svg" alt="Transcontinenta" width={80} height={80} />
              </div>
              <h2 className="text-xl font-semibold mb-2 animate-fade-up-delay-1">Goedendag, ik ben Lisa</h2>
              <p className="text-zinc-400 text-sm max-w-md mb-1 animate-fade-up-delay-2">
                Dealer support assistent van Transcontinenta BV.
              </p>
              <p className="text-zinc-500 text-sm max-w-md mb-7 animate-fade-up-delay-2">
                Ik help u met productinformatie, garantie &amp; RMA, bestellingen en technische vragen.
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 w-full max-w-lg">
                {SUGGESTIONS.map((suggestion, idx) => (
                  <button
                    key={suggestion}
                    onClick={() => sendMessage(suggestion)}
                    className={`text-left text-sm bg-[#18181B] border border-[#27272A] rounded-xl px-4 py-3 text-zinc-400 hover:text-white hover:border-[#F5A623]/40 hover:bg-[#1C1C1F] transition-all duration-200 ${DELAY_CLASSES[idx]}`}
                  >
                    {suggestion}
                  </button>
                ))}
              </div>
            </div>
          )}

          {messages.map(msg => (
            <ChatMessage
              key={msg.id}
              role={msg.role}
              content={msg.content}
              timestamp={msg.timestamp}
            />
          ))}

          {showTypingIndicator && <TypingIndicator />}

          <div ref={bottomRef} />
        </div>

        <ChatInput onSend={sendMessage} disabled={isStreaming} />
      </div>
    </div>
  );
}
