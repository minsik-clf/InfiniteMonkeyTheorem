import { NextRequest, NextResponse } from 'next/server';

import { defaultLocale, isValidLocale, locales, type Locale } from './i18n';

/**
 * Edge middleware for handling locale detection and setting.
 * Supports:
 * - Query parameter (?lang=ko)
 * - Cookie-based locale persistence
 * - Accept-Language header detection
 * - Default locale fallback
 */
export function middleware(request: NextRequest) {
  const { pathname, searchParams } = request.nextUrl;
  const langParam = searchParams.get('lang');

  // Check if pathname has locale prefix (e.g., /en/dashboard)
  const pathnameHasLocale = locales.some(
    (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
  );

  // Redirect /en/path or /ko/path to /path?lang=en or /path?lang=ko
  if (pathnameHasLocale) {
    const pathnameLocale = pathname.split('/')[1] as Locale;
    const pathWithoutLocale = pathname.replace(/^\/(en|ko)/, '') || '/';

    const newUrl = request.nextUrl.clone();
    newUrl.pathname = pathWithoutLocale;
    newUrl.searchParams.set('lang', pathnameLocale);

    const response = NextResponse.redirect(newUrl);
    response.headers.set('x-locale', pathnameLocale);
    response.cookies.set('locale', pathnameLocale, {
      maxAge: 365 * 24 * 60 * 60, // 1 year
      httpOnly: false, // Allow client-side access
      sameSite: 'lax',
      path: '/',
    });

    return response;
  }

  let locale: Locale = defaultLocale;

  // Priority 1: Query parameter (?lang=ko)
  if (langParam) {
    const normalizedLang = langParam.toLowerCase().trim();
    if (isValidLocale(normalizedLang)) {
      locale = normalizedLang;

      const response = NextResponse.next();
      response.headers.set('x-locale', locale);
      response.cookies.set('locale', locale, {
        maxAge: 365 * 24 * 60 * 60,
        httpOnly: false,
        sameSite: 'lax',
        path: '/',
      });
      return response;
    }
  }

  // Priority 2: Cookie
  const cookieLocale = request.cookies.get('locale')?.value;
  if (cookieLocale && isValidLocale(cookieLocale)) {
    locale = cookieLocale;
  }
  // Priority 3: Accept-Language header
  else {
    const acceptLanguage = request.headers.get('accept-language');
    if (acceptLanguage) {
      const browserLocales = acceptLanguage
        .split(',')
        .map((lang) => lang.split(';')[0].trim().toLowerCase());

      const matchedLocale = browserLocales.find((lang) => {
        // Try exact match first (e.g., 'en', 'ko')
        if (isValidLocale(lang)) return true;
        // Try language prefix (e.g., 'en-US' -> 'en')
        const langPrefix = lang.split('-')[0];
        return isValidLocale(langPrefix);
      });

      if (matchedLocale) {
        locale = isValidLocale(matchedLocale)
          ? matchedLocale
          : (matchedLocale.split('-')[0] as Locale);
      }
    }
  }

  // Set locale in response
  const response = NextResponse.next();
  response.headers.set('x-locale', locale);

  // Update cookie if not set or different
  if (!cookieLocale || cookieLocale !== locale) {
    response.cookies.set('locale', locale, {
      maxAge: 365 * 24 * 60 * 60,
      httpOnly: false,
      sameSite: 'lax',
      path: '/',
    });
  }

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, robots.txt, sitemap.xml
     * - files with extensions (e.g., .png, .jpg, .css, .js)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.).*)',
  ],
};
