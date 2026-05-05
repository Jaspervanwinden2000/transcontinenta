'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';

interface Conversation {
  id: string;
  title: string;
  updated_at: number;
  message_count: number;
}

interface SidebarProps {
  currentConversationId: string | null;
  onSelectConversation: (id: string) => void;
  onNewConversation: () => void;
  isOpen: boolean;
  onClose: () => void;
}

function timeAgo(ts: number): string {
  const diff = Date.now() - ts;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return 'Zojuist';
  if (minutes < 60) return `${minutes}m geleden`;
  if (hours < 24) return `${hours}u geleden`;
  return `${days}d geleden`;
}

export default function Sidebar({ currentConversationId, onSelectConversation, onNewConversation, isOpen, onClose }: SidebarProps) {
  const [conversations, setConversations] = useState<Conversation[]>([]);

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 5000);
    return () => clearInterval(interval);
  }, []);

  async function fetchConversations() {
    try {
      const res = await fetch('/api/conversations');
      const data = await res.json();
      setConversations(data);
    } catch {
      // ignore
    }
  }

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/60 z-20 lg:hidden transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      <aside
        className={`
          fixed lg:relative inset-y-0 left-0 z-30 w-72
          bg-[#111113] border-r border-[#1E1E22]
          flex flex-col
          transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] lg:transform-none
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
      >
        {/* Brand header */}
        <div className="flex items-center gap-3 px-4 py-4 border-b border-[#1E1E22]">
          <div className="w-8 h-8 rounded-lg overflow-hidden shrink-0">
            <Image src="/logo.svg" alt="Transcontinenta" width={32} height={32} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-semibold text-white leading-tight">Transcontinenta</div>
            <div className="text-[11px] text-zinc-500">Dealer Support AI</div>
          </div>
          <button
            onClick={onClose}
            className="lg:hidden w-7 h-7 flex items-center justify-center rounded-md hover:bg-[#27272A] transition-colors text-zinc-500 hover:text-white"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* New conversation button */}
        <div className="p-3 border-b border-[#1E1E22]">
          <button
            onClick={() => { onNewConversation(); onClose(); }}
            className="w-full flex items-center gap-2.5 bg-gradient-to-r from-[#F5A623] to-[#D4881F] text-white rounded-xl px-4 py-2.5 text-sm font-medium hover:opacity-90 active:scale-[0.98] transition-all duration-150 shadow-lg shadow-[#F5A623]/15"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Nieuw gesprek
          </button>
        </div>

        {/* Conversations list */}
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-6 text-zinc-600 text-sm text-center">
              <svg className="w-8 h-8 mx-auto mb-3 opacity-40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Nog geen gesprekken
            </div>
          ) : (
            <ul className="p-2 space-y-0.5">
              {conversations.map(conv => (
                <li key={conv.id}>
                  <button
                    onClick={() => { onSelectConversation(conv.id); onClose(); }}
                    className={`w-full text-left px-3 py-2.5 rounded-lg transition-all duration-150 ${
                      currentConversationId === conv.id
                        ? 'bg-[#27272A] text-white'
                        : 'text-zinc-400 hover:bg-[#1C1C1F] hover:text-zinc-200'
                    }`}
                  >
                    <div className="text-sm font-medium truncate">{conv.title}</div>
                    <div className="text-[11px] text-zinc-600 mt-0.5 flex items-center gap-1.5">
                      <span>{timeAgo(conv.updated_at)}</span>
                      <span>·</span>
                      <span>{conv.message_count} berichten</span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="p-4 border-t border-[#1E1E22]">
          <div className="text-[11px] text-zinc-700 text-center">
            © Transcontinenta BV
          </div>
        </div>
      </aside>
    </>
  );
}
