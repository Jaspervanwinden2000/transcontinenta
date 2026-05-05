'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface Stats {
  today: number;
  total: number;
  avgMessagesPerConversation: number;
}

interface Conversation {
  id: string;
  title: string;
  updated_at: number;
  message_count: number;
}

interface KnowledgeFile {
  name: string;
  content: string;
  size: number;
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

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [authed, setAuthed] = useState(false);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<'conversations' | 'knowledge' | 'stats'>('stats');
  const [stats, setStats] = useState<Stats | null>(null);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [knowledge, setKnowledge] = useState<KnowledgeFile[]>([]);
  const [selectedFile, setSelectedFile] = useState<KnowledgeFile | null>(null);

  async function login() {
    setError('');
    try {
      const res = await fetch('/api/admin?action=stats', {
        headers: { Authorization: `Bearer ${password}` },
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data);
        setAuthed(true);
      } else {
        setError('Ongeldig wachtwoord');
      }
    } catch {
      setError('Verbindingsfout');
    }
  }

  useEffect(() => {
    if (!authed) return;

    async function fetchData() {
      const [convRes, knowledgeRes, statsRes] = await Promise.all([
        fetch('/api/admin', { headers: { Authorization: `Bearer ${password}` } }),
        fetch('/api/admin?action=knowledge', { headers: { Authorization: `Bearer ${password}` } }),
        fetch('/api/admin?action=stats', { headers: { Authorization: `Bearer ${password}` } }),
      ]);
      const [convData, knowledgeData, statsData] = await Promise.all([
        convRes.json(),
        knowledgeRes.json(),
        statsRes.json(),
      ]);
      setConversations(convData);
      setKnowledge(knowledgeData);
      setStats(statsData);
    }

    fetchData();
  }, [authed, password]);

  if (!authed) {
    return (
      <div className="min-h-screen bg-[#0F0F14] flex items-center justify-center p-4">
        <div className="bg-[#18181B] border border-[#1E1E22] rounded-2xl p-8 w-full max-w-sm shadow-2xl shadow-black/50">
          <div className="text-center mb-6">
            <div className="w-14 h-14 rounded-2xl overflow-hidden mx-auto mb-4 shadow-xl shadow-black/40">
              <Image src="/logo.svg" alt="Transcontinenta" width={56} height={56} />
            </div>
            <h1 className="text-lg font-semibold text-white">Admin Panel</h1>
            <p className="text-zinc-500 text-sm mt-1">Transcontinenta — Dealer Support AI</p>
          </div>
          <div className="space-y-3">
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && login()}
              placeholder="Wachtwoord"
              className="w-full bg-[#0F0F14] border border-[#27272A] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#F5A623]/50 transition-colors placeholder-zinc-600"
            />
            {error && (
              <p className="text-red-400 text-sm flex items-center gap-1.5">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                {error}
              </p>
            )}
            <button
              onClick={login}
              className="w-full bg-gradient-to-r from-[#F5A623] to-[#D4881F] text-white rounded-xl py-3 text-sm font-medium hover:opacity-90 active:scale-[0.98] transition-all duration-150 shadow-lg shadow-[#F5A623]/20"
            >
              Inloggen
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0F0F14] text-white">
      <header className="bg-[#111113] border-b border-[#1E1E22] px-6 py-4 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg overflow-hidden">
              <Image src="/logo.svg" alt="Transcontinenta" width={32} height={32} />
            </div>
            <span className="font-semibold">Admin Panel</span>
            <span className="text-zinc-500 text-sm hidden sm:inline">— Dealer Support</span>
          </div>
          <a
            href="/"
            className="text-sm text-zinc-400 hover:text-white transition-colors flex items-center gap-1.5"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              <line x1="19" y1="12" x2="5" y2="12" />
              <polyline points="12 19 5 12 12 5" />
            </svg>
            Terug naar chat
          </a>
        </div>
      </header>

      <div className="max-w-6xl mx-auto p-6">
        {/* Tabs */}
        <div className="flex gap-1 mb-6 bg-[#18181B] border border-[#1E1E22] rounded-xl p-1 w-fit">
          {(['stats', 'conversations', 'knowledge'] as const).map(t => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150 ${
                tab === t
                  ? 'bg-[#27272A] text-white shadow-sm'
                  : 'text-zinc-500 hover:text-zinc-300'
              }`}
            >
              {t === 'stats' ? 'Statistieken' : t === 'conversations' ? 'Gesprekken' : 'Kennisbank'}
            </button>
          ))}
        </div>

        {/* Stats */}
        {tab === 'stats' && stats && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <StatCard label="Gesprekken vandaag" value={stats.today} icon="today" />
            <StatCard label="Totaal gesprekken" value={stats.total} icon="total" />
            <StatCard label="Gem. berichten/gesprek" value={stats.avgMessagesPerConversation} icon="avg" />
          </div>
        )}

        {/* Conversations */}
        {tab === 'conversations' && (
          <div className="space-y-2">
            <p className="text-zinc-500 text-sm mb-4">{conversations.length} gesprekken</p>
            {conversations.map(conv => (
              <div key={conv.id} className="bg-[#18181B] border border-[#1E1E22] rounded-xl px-5 py-4 flex items-center justify-between hover:border-[#27272A] transition-colors">
                <div>
                  <p className="font-medium text-sm">{conv.title}</p>
                  <p className="text-zinc-500 text-xs mt-0.5">{timeAgo(conv.updated_at)} · {conv.message_count} berichten</p>
                </div>
                <span className="text-xs text-zinc-700 font-mono">{conv.id.slice(0, 8)}</span>
              </div>
            ))}
            {conversations.length === 0 && (
              <p className="text-zinc-500 text-sm">Nog geen gesprekken opgeslagen.</p>
            )}
          </div>
        )}

        {/* Knowledge */}
        {tab === 'knowledge' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <p className="text-zinc-500 text-sm mb-4">{knowledge.length} bestanden</p>
              {knowledge.map(file => (
                <button
                  key={file.name}
                  onClick={() => setSelectedFile(file)}
                  className={`w-full text-left bg-[#18181B] border rounded-xl px-4 py-3 transition-all duration-150 ${
                    selectedFile?.name === file.name
                      ? 'border-[#F5A623]/40 text-white bg-[#1C1C1F]'
                      : 'border-[#1E1E22] text-zinc-300 hover:text-white hover:border-[#27272A]'
                  }`}
                >
                  <p className="text-sm font-medium truncate">{file.name}</p>
                  <p className="text-xs text-zinc-600 mt-0.5">{(file.size / 1024).toFixed(1)} KB</p>
                </button>
              ))}
            </div>
            {selectedFile && (
              <div className="lg:col-span-2 bg-[#18181B] border border-[#1E1E22] rounded-xl p-4 overflow-auto max-h-[600px]">
                <h3 className="font-semibold text-sm mb-3 text-[#F5A623]">{selectedFile.name}</h3>
                <pre className="text-xs text-zinc-400 whitespace-pre-wrap leading-relaxed font-mono">
                  {selectedFile.content}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: string }) {
  const icons: Record<string, React.ReactNode> = {
    today: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
    total: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
      </svg>
    ),
    avg: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
        <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
      </svg>
    ),
  };

  return (
    <div className="bg-[#18181B] border border-[#1E1E22] rounded-xl p-6 hover:border-[#27272A] transition-colors">
      <div className="flex items-center justify-between mb-4">
        <p className="text-zinc-500 text-sm">{label}</p>
        <div className="text-[#F5A623]/60">{icons[icon]}</div>
      </div>
      <p className="text-3xl font-bold text-white">{value}</p>
    </div>
  );
}
