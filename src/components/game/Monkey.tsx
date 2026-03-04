'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState, useRef } from 'react';

import { useGameStore } from '@/stores/gameStore';

const CHARACTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789 ';

export function Monkey({ id, buffer }: { id: string; buffer: string[] }) {
  const { updateMonkeyBuffer, clearMonkeyBuffer, addGold } = useGameStore();
  const [isTyping, setIsTyping] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const t = useTranslations('home');

  useEffect(() => {
    const typeNextChar = () => {
      if (buffer.length < 3) {
        const randomChar = CHARACTERS.charAt(
          Math.floor(Math.random() * CHARACTERS.length)
        );
        updateMonkeyBuffer(id, randomChar);

        setIsTyping(true);
        setTimeout(() => setIsTyping(false), 100);
      }

      const nextDelay = Math.random() * 600 + 400; // 400ms to 1000ms
      timeoutRef.current = setTimeout(typeNextChar, nextDelay);
    };

    timeoutRef.current = setTimeout(typeNextChar, Math.random() * 500);

    return () => {
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [id, updateMonkeyBuffer, buffer.length]);

  useEffect(() => {
    if (buffer.length === 3) {
      // 3 characters typed, give 3 gold
      addGold(3);
      // clear buffer after short delay so user can see what was typed
      setTimeout(() => {
        clearMonkeyBuffer(id);
      }, 800);
    }
  }, [buffer.length, addGold, clearMonkeyBuffer, id]);

  return (
    <div className="flex flex-col items-center justify-center p-4 border border-gray-200 rounded-xl bg-white shadow-sm dark:bg-gray-800 dark:border-gray-700 transition-all hover:shadow-md">
      <div className="h-12 mb-3 flex items-center justify-center font-mono text-2xl font-bold bg-gray-100 dark:bg-gray-900 w-full rounded tracking-widest text-blue-600 dark:text-blue-400">
        {buffer.length > 0 ? buffer.join('') : '\u00A0'}
      </div>
      <div
        className={`text-5xl transition-transform ${isTyping ? 'scale-110 -translate-y-1' : 'scale-100'}`}
      >
        {isTyping ? '🐒' : '🦍'}
      </div>
      <div className="mt-3 text-xs text-gray-500 font-medium bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded">
        {t('typist')}
      </div>
    </div>
  );
}
