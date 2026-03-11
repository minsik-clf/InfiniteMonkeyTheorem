import { Press_Start_2P } from 'next/font/google';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages, getLocale } from 'next-intl/server';

import './globals.css';
import './pixel-theme.css';
import GoogleAnalytics from '@/components/common/GoogleAnalytics';
import AppLayoutWrapper from '@/components/layout/AppLayoutWrapper';
import { Shell } from '@/components/layout/Shell';
import { type Locale } from '@/i18n';

import type { Metadata } from 'next';
import type { ReactNode } from 'react';

const pressStart2p = Press_Start_2P({
  weight: '400',
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-pixel',
});

export async function generateMetadata(): Promise<Metadata> {
  const locale = (await getLocale()) as Locale;

  const metadataByLocale = {
    ko: {
      title: '무한 원숭이 정리 - 웹 게임',
      titleTemplate: '무한 원숭이 정리 - %s',
      description:
        '원숭이들이 무작위로 타자를 쳐서 돈을 버는 클리커 게임입니다.',
      keywords: ['웹 게임', '클리커 게임', '무한 원숭이 정리', '방치형 게임'],
    },
    en: {
      title: 'Infinite Monkey Theorem - Web Game',
      titleTemplate: 'Infinite Monkey Theorem - %s',
      description:
        'An idle clicker game where monkeys type randomly to earn gold.',
      keywords: [
        'web game',
        'clicker game',
        'infinite monkey theorem',
        'idle game',
      ],
    },
  };

  const content = metadataByLocale[locale];

  return {
    title: {
      template: content.titleTemplate,
      default: content.title,
    },
    description: content.description,
    keywords: content.keywords,
  };
}

export default async function RootLayout({
  children,
}: Readonly<{
  children: ReactNode;
}>) {
  const messages = await getMessages();
  const locale = (await getLocale()) as Locale;

  return (
    <html lang={locale} className="dark">
      <meta
        name="viewport"
        content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover"
      />
      <body
        className={`${pressStart2p.variable} ${pressStart2p.className} antialiased bg-background text-foreground`}
      >
        <GoogleAnalytics />
        <NextIntlClientProvider messages={messages}>
          <AppLayoutWrapper>
            <Shell>{children}</Shell>
          </AppLayoutWrapper>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
