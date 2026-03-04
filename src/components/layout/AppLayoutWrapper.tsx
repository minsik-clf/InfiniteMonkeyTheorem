'use client';

import { ReactNode } from 'react';

export default function AppLayoutWrapper({
  children,
}: {
  children: ReactNode;
}) {
  return <div className="flex min-h-screen flex-col">{children}</div>;
}
