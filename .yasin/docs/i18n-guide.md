# Uluslararasılaştırma (i18n) Rehberi

Bu doküman, blog projesindeki uluslararasılaştırma (internationalization - i18n) implementasyonunu açıklar.

## 🌍 Desteklenen Diller

| Dil | Kod | Varsayılan | Durum |
|-----|-----|------------|-------|
| Türkçe | `tr` | ✅ | Aktif |
| İngilizce | `en` | - | Aktif |

## 🏗️ i18n Framework: next-intl

Proje **next-intl 4.8.3** kullanır.

### Temel Özellikler

- ✅ Locale-based routing (`/tr/*`, `/en/*`)
- ✅ Automatic locale detection
- ✅ Server & client component support
- ✅ TypeScript support
- ✅ Static generation
- ✅ Message nesting
- ✅ Date/number formatting

## 📁 Yapılandırma

### 1. Routing Configuration

```typescript
// lib/i18n/routing.ts
import { defineRouting } from 'next-intl/routing';
import { createNavigation } from 'next-intl/navigation';

export const routing = defineRouting({
  locales: ['tr', 'en'],        // Desteklenen diller
  defaultLocale: 'tr',          // Varsayılan dil
  localePrefix: 'always',       // Her zaman locale prefix
});

export const { Link, redirect, usePathname, useRouter } =
  createNavigation(routing);
```

**`localePrefix` Seçenekleri:**

| Seçenek | Açıklama | Örnek |
|---------|----------|-------|
| `always` | Her zaman locale prefix | `/tr/blog`, `/en/blog` |
| `as-needed` | Sadece non-default | `/blog`, `/en/blog` |
| `never` | Hiçbir zaman | `/blog` (subdomain) |

**Biz `always` kullanıyoruz** - SEO için daha iyi.

### 2. Middleware

```typescript
// middleware.ts
import createMiddleware from 'next-intl/middleware';
import { routing } from './lib/i18n/routing';

export default createMiddleware(routing);

export const config = {
  matcher: ['/', '/(tr|en)/:path*'],
};
```

**Middleware Matcher:**
- `/` → Redirect to `/tr`
- `/tr/*` → Turkish content
- `/en/*` → English content
- `/api/*` → Passthrough (no locale)

### 3. Request Configuration

```typescript
// lib/i18n/request.ts
import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;

  // Validate locale
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }

  return {
    locale,
    messages: (await import(`@/messages/${locale}.json`)).default,
  };
});
```

### 4. Next.js Config

```javascript
// next.config.mjs
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./lib/i18n/request.ts');

export default withNextIntl({
  // ... other config
});
```

## 📝 Çeviri Dosyaları

### Yapı

```
messages/
├── tr.json          # Türkçe çeviriler
└── en.json          # İngilizce çeviriler
```

### Mesaj Formatı

```json
{
  "metadata": {
    "title": "Blog",
    "description": "Kişisel blogum"
  },
  "nav": {
    "home": "Anasayfa",
    "blog": "Blog",
    "about": "Hakkımda",
    "contact": "İletişim"
  },
  "blog": {
    "title": "Blog Yazıları",
    "readMore": "Devamını Oku",
    "tags": "Etiketler",
    "related": "İlgili Yazılar"
  },
  "footer": {
    "copyright": "© 2024 Tüm hakları saklıdır."
  }
}
```

### Nested Messages

```json
{
  "home": {
    "hero": {
      "title": "Hoş Geldiniz",
      "description": "Bloguma hoş geldiniz",
      "cta": "Blog'u Keşfet"
    }
  }
}
```

## 🎯 Kullanım Pattern'leri

### 1. Server Components

```typescript
// app/[locale]/page.tsx
import { getTranslations } from 'next-intl/server';

export default async function HomePage() {
  const t = await getTranslations('home');

  return (
    <div>
      <h1>{t('hero.title')}</h1>
      <p>{t('hero.description')}</p>
      <button>{t('hero.cta')}</button>
    </div>
  );
}
```

**Namespace Kullanımı:**
```typescript
const t = await getTranslations('blog'); // blog namespace

// blog.title, blog.readMore, etc.
<h1>{t('title')}</h1>
<button>{t('readMore')}</button>
```

### 2. Client Components

```typescript
'use client';
import { useTranslations } from 'next-intl';

export function Hero() {
  const t = useTranslations('home');

  return (
    <div>
      <h1>{t('hero.title')}</h1>
    </div>
  );
}
```

### 3. Metadata

```typescript
// app/[locale]/layout.tsx
import { getTranslations } from 'next-intl/server';

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const t = await getTranslations({ locale: params.locale, namespace: 'metadata' });

  return {
    title: t('title'),
    description: t('description'),
  };
}
```

### 4. Dynamic Values

```json
// messages/tr.json
{
  "blog": {
    "postCount": "{count} yazı",
    "readingTime": "{minutes} dakikalık okuma"
  }
}
```

```typescript
const t = await getTranslations('blog');

<p>{t('postCount', { count: 5 })}</p>  // "5 yazı"
<p>{t('readingTime', { minutes: 3 })}</p>  // "3 dakikalık okuma"
```

### 5. Dates & Numbers

```typescript
import { formatDate, formatNumber } from 'next-intl/server';

export async function PostDate({ date }: { date: Date }) {
  const formatted = await formatDate(date, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  return <time>{formatted}</time>;  // "1 Ocak 2024" (TR), "January 1, 2024" (EN)
}

export async function PostViews({ count }: { count: number }) {
  const formatted = await formatNumber(count);

  return <span>{formatted} görüntülenme</span>;  // "1.234" (TR), "1,234" (EN)
}
```

## 🧭 Locale-Aware Navigation

### Link Component

```typescript
// ❌ Yanlış - Next.js default
import { Link } from 'next/link';
<Link href="/blog">Blog</Link>

// ✅ Doğru - i18n-aware
import { Link } from '@/lib/i18n/routing';
<Link href="/blog">Blog</Link>
```

**Çıktı:**
- Türkçe için: `/tr/blog`
- İngilizce için: `/en/blog`

### useRouter Hook

```typescript
import { useRouter } from '@/lib/i18n/routing';

export function Navigation() {
  const router = useRouter();

  const handleClick = () => {
    // Otomatik mevcut locale'e redirect
    router.push('/blog');

    // Manuel locale belirleme
    router.push('/blog', { locale: 'en' });

    // External link (locale korur)
    router.push('https://example.com');
  };

  return <button onClick={handleClick}>Git</button>;
}
```

### Redirect

```typescript
import { redirect } from '@/lib/i18n/routing';

export async function requireAuth(locale: string) {
  if (!isAuthenticated()) {
    redirect('/admin/login');  // → /{locale}/admin/login
  }
}
```

### usePathname Hook

```typescript
import { usePathname } from '@/lib/i18n/routing';

export function CurrentPath() {
  const pathname = usePathname();

  // TR için: "/blog"
  // EN için: "/blog"
  // (Locale prefix dahil değil)

  return <span>{pathname}</span>;
}
```

## 🔄 Locale Switching

### Language Switcher Component

```typescript
'use client';
import { useRouter, usePathname } from '@/lib/i18n/routing';
import { routing } from '@/lib/i18n/routing';

export function LanguageSwitcher() {
  const router = useRouter();
  const pathname = usePathname();
  const currentLocale = routing.defaultLocale; // veya context'ten al

  const switchLocale = (newLocale: string) => {
    // Mevcut path'i koruyarak locale değiştir
    router.replace(pathname, { locale: newLocale });
  };

  return (
    <div>
      <button
        onClick={() => switchLocale('tr')}
        className={currentLocale === 'tr' ? 'active' : ''}
      >
        TR
      </button>
      <button
        onClick={() => switchLocale('en')}
        className={currentLocale === 'en' ? 'active' : ''}
      >
        EN
      </button>
    </div>
  );
}
```

## 📊 Content Localization

### Blog Post Model

```typescript
// Her dil için ayrı post
interface Post {
  _id: string;
  title: string;
  slug: string;        // Unique per locale
  content: {
    json: object;
    html: string;
  };
  locale: 'tr' | 'en';  // Language identifier
  // ... diğer field'lar
}
```

### Localized Content Fetching

```typescript
// Mevcut locale'deki postları getir
export async function getPosts(locale: string) {
  const posts = await postsApi.getAll({ locale });

  return posts;
}
```

### Content Translation

**Strateji:**
- Her dil için ayrı post oluşturulur
- Aynı slug farklı dillerde kullanılabilir
- `locale` field ile ayrım yapılır

**Örnek:**
```
/tr/blog/nextjs-nedir     → Türkçe post
/en/blog/what-is-nextjs   → İngilizce post (farklı içerik)
```

## 🎨 Pluralization

### Plural Rules

```json
// messages/tr.json
{
  "comments": "{count, plural, =0 {Yorum yok} =1 {1 yorum} other {# yorum}}"
}
```

```typescript
const t = await getTranslations();

<p>{t('comments', { count: 0 })}</p>  // "Yorum yok"
<p>{t('comments', { count: 1 })}</p>  // "1 yorum"
<p>{t('comments', { count: 5 })}</p>  // "5 yorum"
```

## 🔧 Yeni Locale Ekleme

### Adım 1: Routing Configuration

```typescript
// lib/i18n/routing.ts
export const routing = defineRouting({
  locales: ['tr', 'en', 'de'],  // 'de' eklendi
  defaultLocale: 'tr',
  localePrefix: 'always',
});
```

### Adım 2: Message File

```bash
# messages/de.json oluştur
touch messages/de.json
```

```json
{
  "metadata": {
    "title": "Blog",
    "description": "Mein persönlicher Blog"
  },
  "nav": {
    "home": "Startseite",
    "blog": "Blog"
  }
}
```

### Adım 3: Middleware Güncelleme

```typescript
// middleware.ts
export const config = {
  matcher: ['/', '/(tr|en|de)/:path*'],  // 'de' eklendi
};
```

### Adım 4: Static Generation

```typescript
// app/[locale]/layout.tsx
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}
```

### Adım 5: Test

```bash
# Deutsche content test
http://localhost:3000/de/blog
```

## 🚀 Best Practices

### ✅ Doğru Kullanım

```typescript
// 1. Locale-aware navigation
import { Link } from '@/lib/i18n/routing';
<Link href="/blog">Blog</Link>

// 2. Namespace kullanımı
const t = await getTranslations('blog');
<h1>{t('title')}</h1>

// 3. Dynamic values
t('postCount', { count: 5 })

// 4. Client component translate
'use client';
const t = useTranslations('home');
```

### ❌ Yanlış Kullanım

```typescript
// 1. Doğrudan Next.js Link
import { Link } from 'next/link';  // ❌
<Link href="/blog">Blog</Link>

// 2. Hardcoded locale
<Link href={`/tr/blog`}>Blog</Link>  // ❌

// 3. String concatenation
const title = `${t('prefix')} ${value}`;  // ❌
// ✅ Doğrusu: t('prefixWithValue', { value })
```

## 📚 Tips & Tricks

### 1. Missing Translation Handling

```typescript
// next-intl otomatik fallback kullanır
// tr.json'da yoksa → en.json'a bakar → orada yoksa key'i gösterir
```

### 2. Translation Key Organizasyonu

```json
{
  "common": {           // Paylaşılan çeviriler
    "loading": "Yükleniyor...",
    "error": "Hata"
  },
  "blog": {             // Blog-specific
    "title": "Blog"
  },
  "admin": {            // Admin-specific
    "dashboard": "Panel"
  }
}
```

### 3. Type Safety

```typescript
// TypeScript otomatik type inference
const t = await getTranslations('blog');
// t('title') → string
// t('unknown') → TypeScript error (eğer strict mode)
```

### 4. Locale Detection

```typescript
// Middleware otomatik locale detection yapar:
// 1. URL path (/tr/* veya /en/*)
// 2. Accept-Language header
// 3. Cookie (varsa)
```

---

**İlgili Dokümanlar:**
- [frontend-structure.md](./frontend-structure.md) - Frontend yapısı
- [common-tasks.md](./common-tasks.md) - Yeni locale ekleme adımları
