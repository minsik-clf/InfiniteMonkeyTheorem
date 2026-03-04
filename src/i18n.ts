import { headers } from 'next/headers';
import { getRequestConfig } from 'next-intl/server';

export const locales = ['en', 'ko'] as const;
export type Locale = (typeof locales)[number];
export const defaultLocale: Locale = 'en';

// Locale display names
export const localeNames: Record<Locale, string> = {
  en: 'English',
  ko: '한국어',
};

// Helper to check if a string is a valid locale
export function isValidLocale(locale: string): locale is Locale {
  return locales.includes(locale as Locale);
}

export default getRequestConfig(async () => {
  const headersList = await headers();
  const middlewareLocale = headersList.get('x-locale');

  let locale: Locale = defaultLocale;

  if (middlewareLocale && locales.includes(middlewareLocale as Locale)) {
    locale = middlewareLocale as Locale;
  }

  // Load translation files
  const [common, home] = await Promise.all([
    import(`../messages/common/${locale}.json`),
    import(`../messages/home/${locale}.json`),
  ]);

  return {
    locale: locale as string,
    messages: {
      common: common.default,
      home: home.default,
    },
    timeZone: 'UTC',
    formats: {
      dateTime: {
        short: {
          day: 'numeric',
          month: 'short',
          year: 'numeric',
        },
        long: {
          day: 'numeric',
          month: 'long',
          year: 'numeric',
          hour: 'numeric',
          minute: 'numeric',
        },
      },
    },
  };
});
