'use client';

import { useState } from 'react';
import Image from 'next/image';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: number;
  isStreaming?: boolean;
}

function formatTime(ts?: number): string {
  const d = ts ? new Date(ts) : new Date();
  return d.toLocaleTimeString('nl-NL', { hour: '2-digit', minute: '2-digit' });
}

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function formatInline(text: string): string {
  return escapeHtml(text)
    .replace(/\*\*(.*?)\*\*/g, '<strong class="text-white font-semibold">$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code class="bg-white/10 px-1.5 py-0.5 rounded text-xs font-mono text-zinc-200">$1</code>');
}

function renderContent(text: string, isStreaming?: boolean) {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];
    const isLast = i === lines.length - 1;

    if (line.startsWith('### ')) {
      elements.push(
        <h3 key={i} className="font-semibold text-sm mt-3 mb-1.5 text-white">
          {line.slice(4)}
        </h3>
      );
    } else if (line.startsWith('## ')) {
      elements.push(
        <h2 key={i} className="font-bold text-base mt-4 mb-2 text-white">
          {line.slice(3)}
        </h2>
      );
    } else if (line.startsWith('- ') || line.startsWith('* ')) {
      const items: string[] = [line.slice(2)];
      while (i + 1 < lines.length && (lines[i + 1].startsWith('- ') || lines[i + 1].startsWith('* '))) {
        i++;
        items.push(lines[i].slice(2));
      }
      elements.push(
        <ul key={i} className="space-y-1 text-sm my-2 pl-1">
          {items.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2">
              <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-[#D61E23]/60 shrink-0" />
              <span dangerouslySetInnerHTML={{ __html: formatInline(item) }} />
            </li>
          ))}
        </ul>
      );
    } else if (/^\d+\./.test(line)) {
      const items: string[] = [line.replace(/^\d+\.\s*/, '')];
      while (i + 1 < lines.length && /^\d+\./.test(lines[i + 1])) {
        i++;
        items.push(lines[i].replace(/^\d+\.\s*/, ''));
      }
      elements.push(
        <ol key={i} className="space-y-1.5 text-sm my-2 pl-1">
          {items.map((item, idx) => (
            <li key={idx} className="flex items-start gap-2.5">
              <span className="shrink-0 w-5 h-5 rounded-full bg-[#D61E23]/15 border border-[#D61E23]/25 text-[10px] font-bold text-[#D61E23] flex items-center justify-center mt-0.5">
                {idx + 1}
              </span>
              <span dangerouslySetInnerHTML={{ __html: formatInline(item) }} />
            </li>
          ))}
        </ol>
      );
    } else if (line.trim() === '') {
      if (elements.length > 0) elements.push(<div key={i} className="h-1.5" />);
    } else {
      elements.push(
        <p
          key={i}
          className={`text-sm leading-relaxed${isStreaming && isLast ? ' streaming-cursor' : ''}`}
          dangerouslySetInnerHTML={{ __html: formatInline(line) }}
        />
      );
    }
    i++;
  }

  // If last element is a list/heading while streaming, add cursor after
  if (isStreaming && elements.length > 0) {
    const last = elements[elements.length - 1];
    if (last && typeof last === 'object' && 'type' in last && (last.type === 'ul' || last.type === 'ol' || last.type === 'h2' || last.type === 'h3')) {
      elements.push(<span key="cursor" className="streaming-cursor text-sm" />);
    }
  }

  return elements;
}

export default function ChatMessage({ role, content, timestamp, isStreaming }: ChatMessageProps) {
  const isAssistant = role === 'assistant';
  const [copied, setCopied] = useState(false);
  const [toastVisible, setToastVisible] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(content).then(() => {
      setCopied(true);
      setToastVisible(true);
      setTimeout(() => {
        setToastVisible(false);
        setTimeout(() => setCopied(false), 300);
      }, 1800);
    });
  };

  return (
    <div className={`flex items-end gap-3 px-4 py-2 animate-message-in message-hover ${isAssistant ? '' : 'flex-row-reverse'}`}>

      {/* Avatar */}
      {isAssistant ? (
        <div className="relative shrink-0 mb-0.5">
          <div className="absolute inset-[-2px] rounded-[13px] bg-[#D61E23]/15 blur-[4px]" />
          <div className="relative w-8 h-8 rounded-xl overflow-hidden ring-1 ring-[#D61E23]/20">
            <Image src="/lisa-avatar.svg" alt="Lisa" width={32} height={32} />
          </div>
        </div>
      ) : (
        <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#2A2A35] to-[#1E1E28] border border-white/[0.08] flex items-center justify-center text-zinc-300 text-xs font-bold shrink-0 mb-0.5">
          U
        </div>
      )}

      {/* Bubble + meta */}
      <div className={`max-w-[78%] relative ${isAssistant ? '' : 'items-end flex flex-col'}`}>

        {/* Copy button — assistant only */}
        {isAssistant && !isStreaming && (
          <div className={`absolute -top-2.5 right-0 z-10 copy-btn`}>
            <button
              onClick={handleCopy}
              title="Kopieer bericht"
              className="flex items-center gap-1.5 bg-[#1E1E28] border border-white/10 rounded-lg px-2 py-1 text-[10px] text-zinc-400 hover:text-white hover:border-white/20 transition-all"
            >
              {copied ? (
                <>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                  <span className="text-emerald-400">Gekopieerd</span>
                </>
              ) : (
                <>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
                  </svg>
                  Kopieer
                </>
              )}
            </button>
          </div>
        )}

        {isAssistant ? (
          <div
            className="rounded-2xl rounded-bl-sm px-4 py-3.5"
            style={{
              background: 'rgba(20,20,28,0.85)',
              border: '1px solid rgba(255,255,255,0.07)',
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
              boxShadow: '0 4px 24px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)',
            }}
          >
            <div className="space-y-0.5 text-zinc-200">
              {renderContent(content, isStreaming)}
            </div>
          </div>
        ) : (
          <div
            className="rounded-2xl rounded-br-sm px-4 py-3.5"
            style={{
              background: 'linear-gradient(135deg,#D61E23 0%,#A81519 100%)',
              boxShadow: '0 4px 20px rgba(214,30,35,0.3), inset 0 1px 0 rgba(255,255,255,0.1)',
            }}
          >
            <div className="space-y-0.5 text-white">
              {renderContent(content)}
            </div>
          </div>
        )}

        <span className="text-[10px] text-zinc-600 mt-1.5 px-1">
          {formatTime(timestamp)}
        </span>
      </div>

      {/* Toast */}
      {toastVisible && (
        <div
          className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 toast-in flex items-center gap-2 bg-[#1A1A24] border border-white/10 rounded-xl px-4 py-2.5 shadow-2xl shadow-black/60"
        >
          <div className="w-5 h-5 rounded-full bg-emerald-500/20 flex items-center justify-center">
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#4ade80" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <span className="text-xs text-zinc-300">Bericht gekopieerd</span>
        </div>
      )}
    </div>
  );
}
