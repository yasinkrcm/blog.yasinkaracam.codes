export const locales = ['tr', 'en'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'tr';

export const localeNames: Record<Locale, string> = {
  tr: 'Türkçe',
  en: 'English',
};

export const localePrefixes: Record<Locale, string> = {
  tr: 'tr',
  en: 'en',
};
