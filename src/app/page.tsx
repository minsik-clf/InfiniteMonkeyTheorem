'use client';

import { useTranslations } from 'next-intl';
import { useEffect, useState } from 'react';

import { Monkey } from '@/components/game/Monkey';
import { useGameStore, getMonkeyCost } from '@/stores/gameStore';

export default function Home() {
  const [mounted, setMounted] = useState(false);
  const { gold, monkeys, buyMonkey } = useGameStore();
  const currentCost = getMonkeyCost(monkeys?.length || 1);
  const t = useTranslations('home');

  // Avoid hydration mismatch by waiting for client mount
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null; // Or a loading spinner
  }

  return (
    <div className="flex flex-col items-center min-h-screen py-6 px-4">
      <header className="mb-10 text-center">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4 text-gray-900 dark:text-white">
          {t('title')}
        </h1>
        <p className="text-gray-600 dark:text-gray-400 mb-6 max-w-lg mx-auto">
          {t('description')}
        </p>
        <div className="text-3xl font-bold text-yellow-600 bg-yellow-100 dark:bg-yellow-900/30 px-8 py-3 rounded-full inline-block shadow-sm">
          {t('gold', { amount: gold })}
        </div>
      </header>

      <div className="mb-12 sticky top-4 z-10">
        <button
          onClick={buyMonkey}
          disabled={gold < currentCost}
          className={`px-8 py-4 rounded-2xl font-bold text-xl transition-all shadow-lg ${
            gold >= currentCost
              ? 'bg-blue-600 hover:bg-blue-500 text-white active:scale-95 shadow-blue-500/30'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-800 dark:text-gray-600 shadow-none'
          }`}
        >
          {t('buy_monkey', { cost: currentCost })}
        </button>
      </div>

      <div className="w-full max-w-6xl bg-gray-50/50 dark:bg-gray-900/50 p-6 rounded-3xl border border-gray-100 dark:border-gray-800">
        <div className="flex justify-between items-center mb-6 px-2">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-200">
            {t('workforce')}
          </h2>
          <span className="text-sm font-semibold bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-300 px-3 py-1 rounded-full">
            {t('monkeys_count', { count: monkeys.length })}
          </span>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6">
          {monkeys.map((monkey) => (
            <Monkey key={monkey.id} id={monkey.id} buffer={monkey.buffer} />
          ))}
        </div>
      </div>
    </div>
  );
}
