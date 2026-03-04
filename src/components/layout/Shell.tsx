'use client';

import { ReactNode } from 'react';

export function Shell({ children }: { children: ReactNode }) {
  return (
    <main className="flex-1 w-full max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {children}
    </main>
  );
}
