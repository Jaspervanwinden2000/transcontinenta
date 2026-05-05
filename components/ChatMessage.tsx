'use client';

import Image from 'next/image';

interface ChatMessageProps {
  role: 'user' | 'assistant';
  content: string;
  timestamp?: number;
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
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/`(.*?)`/g, '<code class="bg-black/20 px-1 rounded text-xs font-mono">$1</code>');
}

function renderContent(text: string) {
  const lines = text.split('\n');
  const elements: React.ReactNode[] = [];
  let i = 0;

  while (i < lines.length) {
    const line = lines[i];

    if (line.startsWith('### ')) {
      elements.push(
        <h3 key={i} className="font-semibold text-sm mt-3 mb-1 text-white">
          {line.slice(4)}
        </h3>
      );
    } else if (line.startsWith('## ')) {
      elements.push(
        <h2 key={i} className="font-bold text-base mt-4 mb-1 text-white">
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
        <ul key={i} className="list-disc list-inside space-y-0.5 text-sm my-1.5 pl-1">
          {items.map((item, idx) => (
            <li key={idx} dangerouslySetInnerHTML={{ __html: formatInline(item) }} />
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
        <ol key={i} className="list-decimal list-inside space-y-0.5 text-sm my-1.5 pl-1">
          {items.map((item, idx) => (
            <li key={idx} dangerouslySetInnerHTML={{ __html: formatInline(item) }} />
          ))}
        </ol>
      );
    } else if (line.trim() === '') {
      if (elements.length > 0) {
        elements.push(<div key={i} className="h-1.5" />);
      }
    } else {
      elements.push(
        <p key={i} className="text-sm leading-relaxed" dangerouslySetInnerHTML={{ __html: formatInline(line) }} />
      );
    }
    i++;
  }

  return elements;
}

export default function ChatMessage({ role, content, timestamp }: ChatMessageProps) {
  const isAssistant = role === 'assistant';

  return (
    <div className={`flex items-end gap-3 px-4 py-1.5 animate-message-in ${isAssistant ? '' : 'flex-row-reverse'}`}>
      {isAssistant ? (
        <div className="w-8 h-8 rounded-xl overflow-hidden shrink-0 mb-0.5">
          <Image src="/logo.svg" alt="Lisa" width={32} height={32} />
        </div>
      ) : (
        <div className="w-8 h-8 rounded-xl bg-[#27272A] flex items-center justify-center text-zinc-300 text-xs font-semibold shrink-0 mb-0.5">
          U
        </div>
      )}
      <div className={`max-w-[78%] ${isAssistant ? '' : 'items-end flex flex-col'}`}>
        <div
          className={`rounded-2xl px-4 py-3 ${
            isAssistant
              ? 'bg-[#18181B] text-zinc-100 rounded-bl-sm border border-[#27272A]/60'
              : 'bg-gradient-to-br from-[#F5A623] to-[#D4881F] text-white rounded-br-sm shadow-lg shadow-[#F5A623]/10'
          }`}
        >
          <div className="space-y-0.5">
            {renderContent(content)}
          </div>
        </div>
        <span className="text-[10px] text-zinc-600 mt-1 px-1">
          {formatTime(timestamp)}
        </span>
      </div>
    </div>
  );
}
