'use client';

import Link from 'next/link';
import { useEffect } from 'react';

import { Icon } from '@/components/common/Icon';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface ToastProps {
  message: string;
  open: boolean;
  onClose: () => void;
  durationMs?: number;
  actionLabel?: string;
  actionHref?: string;
  className?: string;
}

export function Toast({
  message,
  open,
  onClose,
  durationMs = 4000,
  actionLabel,
  actionHref,
  className,
}: ToastProps) {
  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => onClose(), durationMs);
    return () => clearTimeout(timer);
  }, [durationMs, onClose, open]);

  if (!open) return null;

  return (
    <div
      className={cn(
        'fixed right-6 top-6 z-50 flex items-center gap-3 rounded-xl border border-[#e6e6e6] bg-white px-4 py-3 text-sm text-[#2A272E] shadow-lg',
        className
      )}
      role="status"
    >
      <span>{message}</span>
      {actionLabel && actionHref && (
        <Link href={actionHref} className="text-[#6851ff] hover:underline">
          {actionLabel}
        </Link>
      )}
      <Button
        variant="ghost"
        size="icon-sm"
        className="text-[#8e8e8e]"
        onClick={onClose}
        aria-label="Close"
      >
        <Icon.CrossSmall className="h-3.5 w-3.5" />
      </Button>
    </div>
  );
}
