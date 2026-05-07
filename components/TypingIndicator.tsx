'use client';

import Image from 'next/image';

export default function TypingIndicator() {
  return (
    <div className="flex items-end gap-3 px-4 py-2 animate-message-in">
      <div className="relative shrink-0 mb-0.5">
        <div className="absolute inset-[-2px] rounded-[13px] bg-[#D61E23]/15 blur-[4px]" />
        <div className="relative w-8 h-8 rounded-xl overflow-hidden ring-1 ring-[#D61E23]/20">
          <Image src="/lisa-avatar.svg" alt="Lisa" width={32} height={32} />
        </div>
      </div>
      <div
        className="rounded-2xl rounded-bl-sm px-5 py-4"
        style={{
          background: 'rgba(20, 20, 28, 0.85)',
          border: '1px solid rgba(255,255,255,0.07)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
        }}
      >
        <div className="flex items-center gap-1.5">
          <span className="typing-dot w-2 h-2 rounded-full bg-[#D61E23]" />
          <span className="typing-dot w-2 h-2 rounded-full bg-[#D61E23]" />
          <span className="typing-dot w-2 h-2 rounded-full bg-[#D61E23]" />
        </div>
      </div>
    </div>
  );
}
