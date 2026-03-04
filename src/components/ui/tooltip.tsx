'use client';

import * as TooltipPrimitive from '@radix-ui/react-tooltip';
import * as React from 'react';

import { cn } from '@/lib/utils';

const TooltipProvider = TooltipPrimitive.Provider;

const Tooltip = TooltipPrimitive.Root;

const TooltipTrigger = TooltipPrimitive.Trigger;

const TooltipPortal = TooltipPrimitive.Portal;

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 9, ...props }, ref) => (
  <TooltipPrimitive.Content
    ref={ref}
    sideOffset={sideOffset}
    className={cn(
      'tooltip-content z-50 rounded-lg bg-[rgba(0,0,0,0.70)] px-3 py-1.5 text-sm text-white shadow-md animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[side=bottom]:slide-in-from-top-2 data-[side=left]:slide-in-from-right-2 data-[side=right]:slide-in-from-left-2 data-[side=top]:slide-in-from-bottom-2',
      className
    )}
    {...props}
  />
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

const TooltipArrow = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Arrow>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Arrow>
>(({ className, ...props }, ref) => (
  <TooltipPrimitive.Arrow
    ref={ref}
    className={cn('fill-[rgba(0,0,0,0.70)]', className)}
    {...props}
  />
));
TooltipArrow.displayName = TooltipPrimitive.Arrow.displayName;

interface TooltipWrapperProps {
  title?: string | null;
  description?: string;
  children: React.ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  delayDuration?: number;
  disableOnMobile?: boolean;
  enableClickOnMobile?: boolean;
}

function TooltipWrapper({
  title,
  description,
  children,
  side = 'bottom',
  delayDuration = 300,
  disableOnMobile = true,
  enableClickOnMobile = false,
}: TooltipWrapperProps) {
  const [isMobile, setIsMobile] = React.useState<boolean | null>(null);
  const [open, setOpen] = React.useState(false);
  const wrapperId = React.useId();

  React.useEffect(() => {
    const checkMobile = () => {
      if (typeof window !== 'undefined') {
        setIsMobile(window.innerWidth < 768 || 'ontouchstart' in window);
      }
    };

    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  React.useEffect(() => {
    if (!enableClickOnMobile || !isMobile || !open) return;

    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      const target = event.target as HTMLElement;
      const tooltipContent = document.querySelector(
        `[data-tooltip-wrapper="${wrapperId}"]`
      );
      const tooltipTrigger = document.querySelector(
        `[data-tooltip-trigger="${wrapperId}"]`
      );

      if (
        tooltipContent &&
        !tooltipContent.contains(target) &&
        tooltipTrigger &&
        !tooltipTrigger.contains(target)
      ) {
        setOpen(false);
      }
    };

    const timeoutId = setTimeout(() => {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('touchstart', handleClickOutside);
    }, 0);

    return () => {
      clearTimeout(timeoutId);
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, [open, enableClickOnMobile, isMobile, wrapperId]);

  if (disableOnMobile && !enableClickOnMobile) {
    if (isMobile === null || isMobile) {
      return <>{children}</>;
    }
  }

  const handleTriggerClick = (e: React.MouseEvent) => {
    if (enableClickOnMobile && isMobile) {
      e.preventDefault();
      e.stopPropagation();
      setOpen(!open);
    }
  };

  const hasContent =
    (title && title.trim()) || (description && description.trim());

  if (!hasContent) {
    return <>{children}</>;
  }

  return (
    <TooltipProvider delayDuration={delayDuration}>
      <Tooltip open={enableClickOnMobile && isMobile ? open : undefined}>
        <TooltipTrigger
          asChild
          onClick={handleTriggerClick}
          data-tooltip-trigger={wrapperId}
        >
          {children}
        </TooltipTrigger>
        <TooltipPortal>
          <TooltipContent side={side} data-tooltip-wrapper={wrapperId}>
            <div className="text-center">
              {title && (
                <div className="font-medium whitespace-pre-line">{title}</div>
              )}
              {description && (
                <div className={cn(title ? 'mt-1' : '', 'whitespace-pre-line')}>
                  {description}
                </div>
              )}
            </div>
          </TooltipContent>
        </TooltipPortal>
      </Tooltip>
    </TooltipProvider>
  );
}

export {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
  TooltipWrapper,
  TooltipArrow,
  TooltipPortal,
};
