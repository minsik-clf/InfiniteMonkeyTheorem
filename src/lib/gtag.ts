import { CONFIG } from '@/config/constants';

declare global {
  interface Window {
    gtag: (...args: unknown[]) => void;
    dataLayer: Record<string, unknown>[];
  }
}

// Helper functions for GA event tracking
export const gtag = (...args: unknown[]) => {
  if (typeof window !== 'undefined' && window.gtag) {
    window.gtag(...args);
  }
};

// Page view tracking
export const trackPageView = (url: string, title?: string) => {
  const data = {
    page_path: url,
    send_to: CONFIG.GA_TRACKING_ID,
    page_title: title || document.title,
    page_location: url,
    send_page_view: true,
  };

  gtag('event', 'page_view', data);
};

// Custom event tracking
export const trackEvent = (
  action: string,
  category: string,
  label?: string,
  value?: number
) => {
  gtag('event', action, {
    event_category: category,
    event_label: label,
    value: value,
  });
};
