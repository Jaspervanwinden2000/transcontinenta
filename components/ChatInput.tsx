'use client';

import { useState, useRef, KeyboardEvent } from 'react';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export default function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [value, setValue] = useState('');
  const [focused, setFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue('');
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = () => {
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
      textareaRef.current.style.height = `${Math.min(textareaRef.current.scrollHeight, 120)}px`;
    }
  };

  const canSend = !disabled && value.trim().length > 0;

  return (
    <div className="border-t border-[#1E1E22] bg-[#0F0F14] px-4 pt-3 pb-4">
      <div
        className={`flex items-end gap-3 bg-[#18181B] rounded-2xl border px-4 py-3 transition-all duration-200 ${
          focused ? 'border-[#F5A623]/40 shadow-lg shadow-[#F5A623]/5' : 'border-[#27272A]'
        }`}
      >
        <textarea
          ref={textareaRef}
          value={value}
          onChange={e => setValue(e.target.value)}
          onKeyDown={handleKeyDown}
          onInput={handleInput}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholder="Stel een vraag over producten, garantie, RMA of bestellingen..."
          disabled={disabled}
          rows={1}
          className="flex-1 bg-transparent text-white text-sm placeholder-zinc-600 resize-none outline-none min-h-[24px] max-h-[120px] leading-6 disabled:opacity-40 transition-opacity"
        />
        <button
          onClick={handleSend}
          disabled={!canSend}
          className={`w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0 transition-all duration-200 ${
            canSend
              ? 'bg-gradient-to-br from-[#F5A623] to-[#D4881F] hover:opacity-90 active:scale-95 shadow-md shadow-[#F5A623]/20'
              : 'bg-[#27272A] opacity-40 cursor-not-allowed'
          }`}
          aria-label="Verstuur bericht"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <line x1="22" y1="2" x2="11" y2="13" />
            <polygon points="22 2 15 22 11 13 2 9 22 2" />
          </svg>
        </button>
      </div>
      <p className="text-[10px] text-zinc-700 text-center mt-2">
        Lisa kan fouten maken. Verifieer kritische informatie altijd via de helpdesk of het support portal.
      </p>
    </div>
  );
}
