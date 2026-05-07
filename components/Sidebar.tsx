'use client';

import { useEffect, useState, useCallback } from 'react';
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

  const fetchConversations = useCallback(async () => {
    try {
      const res = await fetch('/api/conversations');
      const data = await res.json();
      setConversations(data);
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    fetchConversations();
    const interval = setInterval(fetchConversations, 5000);
    return () => clearInterval(interval);
  }, [fetchConversations]);

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-black/70 z-20 lg:hidden transition-opacity duration-300 backdrop-blur-sm ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
        onClick={onClose}
      />

      <aside
        className={`
          fixed lg:relative inset-y-0 left-0 z-30 w-72
          flex flex-col
          transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] lg:transform-none
          ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        `}
        style={{
          background: 'rgba(10, 10, 15, 0.92)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderRight: '1px solid rgba(255,255,255,0.06)',
        }}
      >
        {/* Red top accent */}
        <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#D61E23]/80 to-transparent" />

        {/* Brand header */}
        <div className="flex items-center gap-3 px-4 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="flex-1 min-w-0 flex items-center">
            <Image src="/logo-tc.png" alt="Transcontinenta" width={130} height={26} className="object-contain" />
          </div>
          <button
            onClick={onClose}
            className="lg:hidden w-7 h-7 flex items-center justify-center rounded-lg hover:bg-white/5 transition-colors text-zinc-500 hover:text-white"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="18" y1="6" x2="6" y2="18" />
              <line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        {/* New conversation button */}
        <div className="p-3" style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
          <button
            onClick={() => { onNewConversation(); onClose(); }}
            className="w-full flex items-center gap-2.5 text-white rounded-xl px-4 py-2.5 text-sm font-medium hover:opacity-90 active:scale-[0.98] transition-all duration-150"
            style={{
              background: 'linear-gradient(135deg, #D61E23 0%, #A81519 100%)',
              boxShadow: '0 4px 16px rgba(214, 30, 35, 0.25)',
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <line x1="12" y1="5" x2="12" y2="19" />
              <line x1="5" y1="12" x2="19" y2="12" />
            </svg>
            Nieuw gesprek
          </button>
        </div>

        {/* Section label */}
        {conversations.length > 0 && (
          <div className="px-4 pt-4 pb-1">
            <span className="text-[10px] font-semibold text-zinc-600 tracking-widest uppercase">Gesprekken</span>
          </div>
        )}

        {/* Conversations list */}
        <div className="flex-1 overflow-y-auto">
          {conversations.length === 0 ? (
            <div className="p-8 text-zinc-700 text-sm text-center flex flex-col items-center">
              <svg className="w-8 h-8 mb-3 opacity-30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
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
                    className={`w-full text-left px-3 py-2.5 rounded-xl transition-all duration-150 ${
                      currentConversationId === conv.id
                        ? 'text-white'
                        : 'text-zinc-500 hover:text-zinc-300 hover:bg-white/[0.04]'
                    }`}
                    style={currentConversationId === conv.id ? {
                      background: 'rgba(214, 30, 35, 0.1)',
                      border: '1px solid rgba(214, 30, 35, 0.2)',
                    } : {}}
                  >
                    <div className="flex items-start gap-2">
                      {currentConversationId === conv.id && (
                        <div className="w-1 h-1 rounded-full bg-[#D61E23] mt-2 shrink-0" />
                      )}
                      <div className="min-w-0">
                        <div className="text-sm font-medium truncate">{conv.title}</div>
                        <div className="text-[11px] text-zinc-600 mt-0.5 flex items-center gap-1.5">
                          <span>{timeAgo(conv.updated_at)}</span>
                          <span className="text-zinc-700">·</span>
                          <span>{conv.message_count} berichten</span>
                        </div>
                      </div>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer */}
        <div className="p-4" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}>
          <div className="flex items-center justify-center gap-2 text-[10px] text-zinc-700">
            <div className="w-1 h-1 rounded-full bg-[#D61E23]/40" />
            <span>© Transcontinenta BV — Dealer Support AI</span>
            <div className="w-1 h-1 rounded-full bg-[#D61E23]/40" />
          </div>
        </div>
      </aside>
    </>
  );
}
