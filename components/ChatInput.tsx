'use client';

import { useState, useRef, useEffect, KeyboardEvent } from 'react';

interface ChatInputProps {
  onSend: (message: string) => void;
  disabled?: boolean;
}

export default function ChatInput({ onSend, disabled }: ChatInputProps) {
  const [value, setValue] = useState('');
  const [focused, setFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const isTyping = value.trim().length > 0;

  // Press "/" to focus input when not already in a text field
  useEffect(() => {
    const handler = (e: globalThis.KeyboardEvent) => {
      if (
        e.key === '/' &&
        document.activeElement?.tagName !== 'TEXTAREA' &&
        document.activeElement?.tagName !== 'INPUT'
      ) {
        e.preventDefault();
        textareaRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const handleSend = () => {
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSend(trimmed);
    setValue('');
    if (textareaRef.current) textareaRef.current.style.height = 'auto';
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
    <div
      className="px-4 pt-3 pb-5 relative"
      style={{
        background: 'rgba(8,8,13,0.9)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderTop: '1px solid rgba(255,255,255,0.05)',
      }}
    >
      {/* Glow line that brightens on focus */}
      <div
        className="absolute top-0 left-0 right-0 h-px transition-opacity duration-300"
        style={{
          background: 'linear-gradient(90deg,transparent,#D61E23,transparent)',
          opacity: focused ? 0.6 : 0,
        }}
      />

      {/* Rotating laser border wrapper — shown when typing */}
      <div className="relative rounded-2xl p-[1.5px] transition-all duration-300"
        style={isTyping && !disabled ? {
          backgroundClip: 'padding-box',
        } : {}}
      >
        {/* Laser border layer */}
        {isTyping && !disabled && (
          <div
            className="absolute inset-0 rounded-2xl input-laser-border"
            style={{ zIndex: 0 }}
          />
        )}

        {/* Inner container */}
        <div
          className="relative flex items-end gap-3 rounded-2xl px-4 py-3 transition-all duration-300"
          style={{
            zIndex: 1,
            background: focused ? 'rgba(22,18,18,0.95)' : 'rgba(16,16,22,0.92)',
            border: !isTyping
              ? (focused
                  ? '1px solid rgba(214,30,35,0.35)'
                  : '1px solid rgba(255,255,255,0.07)')
              : 'none',
            boxShadow: focused
              ? '0 0 0 3px rgba(214,30,35,0.08), 0 8px 32px rgba(0,0,0,0.5)'
              : '0 4px 24px rgba(0,0,0,0.4)',
          }}
        >
          <textarea
            ref={textareaRef}
            value={value}
            onChange={e => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onInput={handleInput}
            onFocus={() => setFocused(true)}
            onBlur={() => setFocused(false)}
            placeholder="Stel een vraag…  ( / om te focussen )"
            disabled={disabled}
            rows={1}
            className="flex-1 bg-transparent text-white text-sm placeholder-zinc-600 resize-none outline-none min-h-[24px] max-h-[120px] leading-6 disabled:opacity-30 transition-opacity"
          />

          {/* Character count — shown when approaching limits */}
          {value.length > 200 && (
            <span className="text-[10px] text-zinc-600 self-end mb-0.5 shrink-0">
              {value.length}
            </span>
          )}

          <button
            onClick={handleSend}
            disabled={!canSend}
            className="w-9 h-9 rounded-xl flex items-center justify-center text-white shrink-0 transition-all duration-200 active:scale-90"
            style={canSend ? {
              background: 'linear-gradient(135deg,#D61E23 0%,#A81519 100%)',
              boxShadow: `0 4px ${Math.min(8 + value.length / 10, 24)}px rgba(214,30,35,${Math.min(0.35 + value.length / 500, 0.65)})`,
            } : {
              background: 'rgba(255,255,255,0.05)',
              opacity: 0.4,
              cursor: 'not-allowed',
            }}
            aria-label="Verstuur bericht"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </div>

      <div className="flex items-center justify-center gap-3 mt-2.5">
        <span className="w-1 h-1 rounded-full bg-[#D61E23]/30" />
        <p className="text-[10px] text-zinc-700">
          Lisa kan fouten maken — verifieer kritische informatie via de helpdesk
        </p>
        <span className="w-1 h-1 rounded-full bg-[#D61E23]/30" />
      </div>
    </div>
  );
}
