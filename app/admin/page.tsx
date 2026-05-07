'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

interface Stats {
  today: number;
  total: number;
  totalMessages: number;
  avgMessagesPerConversation: number;
}

interface DailyStat {
  date: string;
  conversations: number;
  messages: number;
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

function BarChart({ data }: { data: DailyStat[] }) {
  const maxConv = Math.max(...data.map(d => d.conversations), 1);
  const maxMsg = Math.max(...data.map(d => d.messages), 1);
  const maxVal = Math.max(maxConv, maxMsg, 1);

  return (
    <div className="bg-[#18181B] border border-[#1E1E22] rounded-xl p-5">
      <div className="flex items-center justify-between mb-5">
        <h3 className="text-sm font-semibold text-white">Activiteit afgelopen 7 dagen</h3>
        <div className="flex items-center gap-4 text-[11px] text-zinc-500">
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#D61E23]" />
            Gesprekken
          </span>
          <span className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm bg-[#3A3A44]" />
            Berichten
          </span>
        </div>
      </div>

      <div className="flex items-end gap-2 h-36">
        {data.map((day, i) => (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div className="w-full flex items-end gap-0.5 h-28">
              {/* Messages bar (background) */}
              <div
                className="flex-1 rounded-t-sm bg-[#3A3A44] transition-all duration-500"
                style={{ height: `${Math.max((day.messages / maxVal) * 100, 2)}%` }}
                title={`${day.messages} berichten`}
              />
              {/* Conversations bar (foreground) */}
              <div
                className="flex-1 rounded-t-sm bg-[#D61E23] transition-all duration-500"
                style={{ height: `${Math.max((day.conversations / maxVal) * 100, 2)}%` }}
                title={`${day.conversations} gesprekken`}
              />
            </div>
            <span className="text-[9px] text-zinc-600 text-center leading-tight whitespace-pre-wrap">
              {day.date.split(' ').slice(0, 2).join('\n')}
            </span>
          </div>
        ))}
      </div>

      {/* Totals row */}
      <div className="grid grid-cols-7 gap-2 mt-3 pt-3 border-t border-[#27272A]">
        {data.map((day, i) => (
          <div key={i} className="text-center">
            <div className="text-[10px] font-medium text-white">{day.conversations}</div>
            <div className="text-[9px] text-zinc-600">{day.messages} msg</div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function AdminPage() {
  const [password, setPassword] = useState('');
  const [authed, setAuthed] = useState(false);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<'stats' | 'conversations' | 'knowledge'>('stats');
  const [stats, setStats] = useState<Stats | null>(null);
  const [daily, setDaily] = useState<DailyStat[]>([]);
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
      const [convRes, knowledgeRes, statsRes, dailyRes] = await Promise.all([
        fetch('/api/admin', { headers: { Authorization: `Bearer ${password}` } }),
        fetch('/api/admin?action=knowledge', { headers: { Authorization: `Bearer ${password}` } }),
        fetch('/api/admin?action=stats', { headers: { Authorization: `Bearer ${password}` } }),
        fetch('/api/admin?action=daily', { headers: { Authorization: `Bearer ${password}` } }),
      ]);
      const [convData, knowledgeData, statsData, dailyData] = await Promise.all([
        convRes.json(),
        knowledgeRes.json(),
        statsRes.json(),
        dailyRes.json(),
      ]);
      setConversations(convData);
      setKnowledge(knowledgeData);
      setStats(statsData);
      setDaily(dailyData);
    }

    fetchData();
  }, [authed, password]);

  if (!authed) {
    return (
      <div className="min-h-screen bg-[#0F0F14] flex items-center justify-center p-4">
        <div className="bg-[#18181B] border border-[#1E1E22] rounded-2xl p-8 w-full max-w-sm shadow-2xl shadow-black/50">
          <div className="text-center mb-6">
            <div className="flex justify-center mb-5">
              <Image src="/logo-tc.png" alt="Transcontinenta" width={160} height={32} className="object-contain" />
            </div>
            <h1 className="text-lg font-semibold text-white">Admin Panel</h1>
            <p className="text-zinc-500 text-sm mt-1">Dealer Support AI</p>
          </div>
          <div className="space-y-3">
            <input
              type="password"
              value={password}
              onChange={e => setPassword(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && login()}
              placeholder="Wachtwoord"
              className="w-full bg-[#0F0F14] border border-[#27272A] rounded-xl px-4 py-3 text-white text-sm outline-none focus:border-[#D61E23]/50 transition-colors placeholder-zinc-600"
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
              className="w-full bg-gradient-to-r from-[#D61E23] to-[#A81519] text-white rounded-xl py-3 text-sm font-medium hover:opacity-90 active:scale-[0.98] transition-all duration-150 shadow-lg shadow-[#D61E23]/20"
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
          <div className="flex items-center gap-4">
            <Image src="/logo-tc.png" alt="Transcontinenta" width={130} height={26} className="object-contain" />
            <div className="hidden sm:flex items-center gap-2">
              <span className="text-zinc-600">|</span>
              <span className="text-zinc-400 text-sm">Admin Panel</span>
            </div>
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

      <div className="max-w-6xl mx-auto p-6 space-y-6">
        {/* Tabs */}
        <div className="flex gap-1 bg-[#18181B] border border-[#1E1E22] rounded-xl p-1 w-fit">
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

        {/* Stats tab */}
        {tab === 'stats' && stats && (
          <>
            {/* KPI cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
              <StatCard
                label="Gesprekken vandaag"
                value={stats.today}
                icon={
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                }
              />
              <StatCard
                label="Totaal gesprekken"
                value={stats.total}
                icon={
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                }
              />
              <StatCard
                label="Totaal berichten"
                value={stats.totalMessages}
                icon={
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /><line x1="8" y1="10" x2="16" y2="10" /><line x1="8" y1="14" x2="13" y2="14" />
                  </svg>
                }
              />
              <StatCard
                label="Gem. berichten/gesprek"
                value={stats.avgMessagesPerConversation}
                icon={
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <line x1="18" y1="20" x2="18" y2="10" /><line x1="12" y1="20" x2="12" y2="4" /><line x1="6" y1="20" x2="6" y2="14" />
                  </svg>
                }
              />
            </div>

            {/* Bar chart */}
            {daily.length > 0 && <BarChart data={daily} />}

            {/* Recent conversations preview */}
            {conversations.length > 0 && (
              <div className="bg-[#18181B] border border-[#1E1E22] rounded-xl p-5">
                <h3 className="text-sm font-semibold text-white mb-4">Recente gesprekken</h3>
                <div className="space-y-2">
                  {conversations.slice(0, 5).map(conv => (
                    <div key={conv.id} className="flex items-center justify-between py-2 border-b border-[#27272A]/50 last:border-0">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-1.5 h-1.5 rounded-full bg-[#D61E23] shrink-0" />
                        <span className="text-sm text-zinc-300 truncate">{conv.title}</span>
                      </div>
                      <div className="flex items-center gap-3 shrink-0 ml-4">
                        <span className="text-xs text-zinc-600">{conv.message_count} berichten</span>
                        <span className="text-xs text-zinc-700">{timeAgo(conv.updated_at)}</span>
                      </div>
                    </div>
                  ))}
                </div>
                {conversations.length > 5 && (
                  <button
                    onClick={() => setTab('conversations')}
                    className="mt-3 text-xs text-[#D61E23] hover:text-red-400 transition-colors"
                  >
                    Bekijk alle {conversations.length} gesprekken →
                  </button>
                )}
              </div>
            )}
          </>
        )}

        {/* Conversations tab */}
        {tab === 'conversations' && (
          <div className="space-y-2">
            <p className="text-zinc-500 text-sm mb-4">{conversations.length} gesprekken in totaal</p>
            {conversations.map(conv => (
              <div key={conv.id} className="bg-[#18181B] border border-[#1E1E22] rounded-xl px-5 py-4 flex items-center justify-between hover:border-[#27272A] transition-colors">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-[#D61E23] shrink-0" />
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">{conv.title}</p>
                    <p className="text-zinc-500 text-xs mt-0.5">{timeAgo(conv.updated_at)} · {conv.message_count} berichten</p>
                  </div>
                </div>
                <span className="text-xs text-zinc-700 font-mono ml-4 shrink-0">{conv.id.slice(0, 8)}</span>
              </div>
            ))}
            {conversations.length === 0 && (
              <div className="text-center py-16 text-zinc-600">
                <svg className="w-10 h-10 mx-auto mb-3 opacity-30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                <p className="text-sm">Nog geen gesprekken opgeslagen.</p>
              </div>
            )}
          </div>
        )}

        {/* Knowledge tab */}
        {tab === 'knowledge' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="space-y-2">
              <p className="text-zinc-500 text-sm mb-4">{knowledge.length} bestanden in kennisbank</p>
              {knowledge.map(file => (
                <button
                  key={file.name}
                  onClick={() => setSelectedFile(file)}
                  className={`w-full text-left bg-[#18181B] border rounded-xl px-4 py-3 transition-all duration-150 ${
                    selectedFile?.name === file.name
                      ? 'border-[#D61E23]/40 text-white bg-[#1C1C1F]'
                      : 'border-[#1E1E22] text-zinc-300 hover:text-white hover:border-[#27272A]'
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" className="text-zinc-500 shrink-0">
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
                    </svg>
                    <p className="text-sm font-medium truncate">{file.name}</p>
                  </div>
                  <p className="text-xs text-zinc-600 mt-1 pl-5">{(file.size / 1024).toFixed(1)} KB</p>
                </button>
              ))}
            </div>
            {selectedFile ? (
              <div className="lg:col-span-2 bg-[#18181B] border border-[#1E1E22] rounded-xl p-4 overflow-auto max-h-[600px]">
                <h3 className="font-semibold text-sm mb-3 text-[#D61E23] flex items-center gap-2">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" />
                  </svg>
                  {selectedFile.name}
                </h3>
                <pre className="text-xs text-zinc-400 whitespace-pre-wrap leading-relaxed font-mono">
                  {selectedFile.content}
                </pre>
              </div>
            ) : (
              <div className="lg:col-span-2 bg-[#18181B] border border-[#1E1E22] rounded-xl p-8 flex items-center justify-center text-zinc-600 text-sm">
                Selecteer een bestand om de inhoud te bekijken
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, icon }: { label: string; value: number; icon: React.ReactNode }) {
  return (
    <div className="bg-[#18181B] border border-[#1E1E22] rounded-xl p-5 hover:border-[#27272A] transition-colors">
      <div className="flex items-center justify-between mb-3">
        <p className="text-zinc-500 text-xs font-medium uppercase tracking-wide">{label}</p>
        <div className="text-[#D61E23]/70">{icon}</div>
      </div>
      <p className="text-3xl font-bold text-white">{value}</p>
    </div>
  );
}
