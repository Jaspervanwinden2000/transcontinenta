'use client';

import Image from 'next/image';

export default function TypingIndicator() {
  return (
    <div className="flex items-end gap-3 px-4 py-1.5 animate-message-in">
      <div className="w-8 h-8 rounded-xl overflow-hidden shrink-0 mb-0.5">
        <Image src="/logo.svg" alt="Lisa" width={32} height={32} />
      </div>
      <div className="bg-[#18181B] border border-[#27272A]/60 rounded-2xl rounded-bl-sm px-4 py-3.5">
        <div className="flex items-center gap-1.5">
          <span className="typing-dot w-2 h-2 rounded-full bg-[#F5A623]" />
          <span className="typing-dot w-2 h-2 rounded-full bg-[#F5A623]" />
          <span className="typing-dot w-2 h-2 rounded-full bg-[#F5A623]" />
        </div>
      </div>
    </div>
  );
}
