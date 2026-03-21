# Frontend Yapısı

Bu doküman, Next.js 15 frontend yapısını, component organizasyonunu ve data fetching pattern'lerini açıklar.

## 🏗️ Proje Yapısı

```
client/
├── app/                      # Next.js App Router
│   ├── [locale]/            # Dynamic locale routing
│   │   ├── layout.tsx       # Locale-specific layout
│   │   ├── page.tsx         # Home page
│   │   ├── blog/            # Blog routes
│   │   │   ├── page.tsx     # Blog listing
│   │   │   ├── [slug]/      # Single post
│   │   │   │   └── page.tsx
│   │   │   └── tag/
│   │   │       └── [tag]/
│   │   │           └── page.tsx
│   │   └── admin/           # Protected admin routes
│   │       ├── login/
│   │       │   └── page.tsx
│   │       ├── dashboard/
│   │       │   └── page.tsx
│   │       └── posts/
│   │           ├── new/
│   │           │   └── page.tsx
│   │           └── [id]/
│   │               └── page.tsx
│   ├── layout.tsx           # Root layout
│   ├── sitemap.ts           # SEO sitemap
│   └── robots.ts            # SEO robots.txt
│
├── components/              # React components
│   ├── admin/               # Admin-specific
│   ├── blog/                # Blog components
│   ├── editor/              # TipTap editor
│   ├── home/                # Home page sections
│   ├── layout/              # Header, Footer
│   └── seo/                 # SEO components
│
├── lib/                     # Utilities & helpers
│   ├── api/                 # API client layer
│   ├── cms/                 # CMS abstraction
│   ├── hooks/               # Custom React hooks
│   ├── i18n/                # i18n configuration
│   └── utils/               # Utility functions
│
├── messages/                # i18n translations
│   ├── en.json
│   └── tr.json
│
├── public/                  # Static assets
├── styles/                  # Global styles
├── next.config.mjs          # Next.js config
├── tailwind.config.ts       # Tailwind config
├── middleware.ts            # next-intl middleware
└── tsconfig.json            # TypeScript config
```

## 📁 App Router Yapısı

### Root Layout (`app/layout.tsx`)

Global layout ve metadata configuration.

```typescript
// app/layout.tsx
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/lib/i18n/routing';

export default async function RootLayout({
  children,
  params: { locale }
}: {
  children: React.ReactNode;
  params: { locale: string };
}) {
  // Locale validation
  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider messages={messages}>
          {children}
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
```

### Locale Layout (`app/[locale]/layout.tsx`)

Locale-specific metadata ve header/footer.

```typescript
// app/[locale]/layout.tsx
import { useTranslations } from 'next-intl';
import Header from '@/components/layout/Header';
import Footer from '@/components/layout/Footer';

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const t = await getTranslations({ locale: params.locale, namespace: 'metadata' });

  return {
    title: t('title'),
    description: t('description'),
    openGraph: {
      title: t('title'),
      description: t('description'),
      locale: params.locale,
    },
  };
}

export default function LocaleLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main>{children}</main>
      <Footer />
    </>
  );
}
```

### Page Routes

#### Blog Listing (`app/[locale]/blog/page.tsx`)

```typescript
// Server Component
import { postsApi } from '@/lib/api/posts';
import { BlogList } from '@/components/blog/BlogList';

export default async function BlogPage({
  params,
  searchParams,
}: {
  params: { locale: string };
  searchParams: { page?: string };
}) {
  const page = parseInt(searchParams.page || '1');

  // Server-side fetch
  const postsData = await postsApi.getAll({
    locale: params.locale,
    page,
    limit: 9,
  });

  return <BlogList posts={postsData.data} pagination={postsData} />;
}
```

#### Single Post (`app/[locale]/blog/[slug]/page.tsx`)

```typescript
// Server Component
import { postsApi } from '@/lib/api/posts';
import { BlogPost } from '@/components/blog/BlogPost';
import { JsonLd } from '@/components/seo/JsonLd';

export async function generateMetadata({ params }: Props) {
  const post = await postsApi.getBySlug(params.slug, params.locale);

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      images: post.featuredImage ? [post.featuredImage] : [],
    },
  };
}

export default async function PostPage({ params }: Props) {
  const post = await postsApi.getBySlug(params.slug, params.locale);

  return (
    <>
      <JsonLd post={post} />
      <BlogPost post={post} />
    </>
  );
}
```

#### Admin Login (`app/[locale]/admin/login/page.tsx`)

```typescript
// Client Component
'use client';
import { useState } from 'react';
import { authApi } from '@/lib/api/auth';
import { useRouter } from '@/lib/i18n/routing';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const response = await authApi.login({ email, password });
    localStorage.setItem('token', response.token);

    router.push('/admin/dashboard');
  };

  return (
    <form onSubmit={handleSubmit}>
      {/* Login form */}
    </form>
  );
}
```

### Static Generation

```typescript
// app/[locale]/blog/page.tsx
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}
```

## 🎨 Component Yapısı

### Component Hierarchy

```
RootLayout
 └─ LocaleLayout
     ├─ Header (client)
     │   ├─ Logo
     │   ├─ Navigation
     │   └─ LanguageSwitcher
     │
     ├─ Page Content
     │   ├─ BlogList (server)
     │   │   └─ BlogCard × N
     │   │       ├─ PostImage
     │   │       ├─ PostTitle
     │   │       ├─ PostExcerpt
     │   │       ├─ PostTags
     │   │       └─ PostMeta
     │   │
     │   └─ BlogPost (server)
     │       ├─ PostHeader
     │       ├─ PostContent
     │       ├─ PostTags
     │       └─ PostNavigation
     │
     └─ Footer (server)
         ├─ FooterLinks
         ├─ SocialLinks
         └─ Copyright
```

### Component Types

#### 1. Server Components (Default)

**Kullanım Alanları:**
- Blog listing ve single post
- Home page
- Static content
- Data fetching heavy components

**Avantajları:**
- ✅ Direct database access (API kullanır ama backend'ten bağımsız)
- ✅ SEO friendly
- ✅ Daha küçük client bundle
- ✅ Server-side rendering

**Örnek:**
```typescript
// components/blog/BlogList.tsx
import { postsApi } from '@/lib/api/posts';

export async function BlogList({ locale }: { locale: string }) {
  const posts = await postsApi.getAll({ locale });

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {posts.data.map((post) => (
        <BlogCard key={post._id} post={post} />
      ))}
    </div>
  );
}
```

#### 2. Client Components

**Kullanım Alanları:**
- Interactive forms
- Event handlers
- Browser API usage (localStorage, etc.)
- Real-time updates
- TipTap editor

**Örnek:**
```typescript
// components/admin/PostForm.tsx
'use client';
import { useState } from 'react';
import { TipTapEditor } from '@/components/editor/TipTapEditor';
import { postsApi } from '@/lib/api/posts';

export function PostForm() {
  const [content, setContent] = useState({ json: null, html: '' });

  const handleSubmit = async () => {
    await postsApi.create({ content, ...otherData });
  };

  return (
    <form onSubmit={handleSubmit}>
      <TipTapEditor
        content={content.json}
        onChange={setContent}
      />
    </form>
  );
}
```

## 📦 Component Organizasyonu

### Feature-based Structure

Her feature için ayrı dizin:

```
components/
├── blog/
│   ├── BlogCard.tsx        # Post kartı
│   ├── BlogList.tsx        # Post listesi
│   ├── BlogPost.tsx        # Tekil post sayfası
│   └── Pagination.tsx      # Sayfalama
│
├── admin/
│   ├── PostForm.tsx        # Post oluşturma/düzenleme
│   ├── PostList.tsx        # Admin post listesi
│   └── ProtectedRoute.tsx  # Auth kontrol wrapper
│
├── editor/
│   ├── TipTapEditor.tsx    # Rich text editor
│   └── EditorToolbar.tsx   # Editor toolbar
│
├── layout/
│   ├── Header.tsx          # Site header
│   ├── Footer.tsx          # Site footer
│   └── Container.tsx       # Layout container
│
├── home/
│   ├── Hero.tsx            # Hero section
│   └── FeaturedPosts.tsx   # Öne çıkan postlar
│
└── seo/
    ├── JsonLd.tsx          # Structured data
    ├── OpenGraph.tsx       # OG tags
    └── TwitterCard.tsx     # Twitter card
```

### Component Naming Convention

- **PascalCase**: Component dosyaları
  - ✅ `BlogCard.tsx`
  - ✅ `TipTapEditor.tsx`
  - ❌ `blog-card.tsx`
  - ❌ `blogCard.tsx`

- **camelCase**: Utility dosyaları
  - ✅ `api-client.ts`
  - ✅ `seo.ts`
  - ❌ `Api-Client.ts`

## 🔄 Data Fetching

### 1. Server-side Fetching

**Pattern:** Server component içinde API call.

```typescript
// app/[locale]/blog/[slug]/page.tsx
export default async function PostPage({ params }) {
  const post = await postsApi.getBySlug(params.slug, params.locale);

  return <BlogPost post={post} />;
}
```

**Avantajları:**
- ✅ Data hazır gelir (client-side fetch yok)
- ✅ SEO optimized
- ✅ Daha hızlı initial load

### 2. Client-side Fetching

**Pattern:** useEffect ile data fetch.

```typescript
'use client';
import { useEffect, useState } from 'react';
import { postsApi } from '@/lib/api/posts';

export function PostEditor({ postId }) {
  const [post, setPost] = useState(null);

  useEffect(() => {
    postsApi.getById(postId).then(setPost);
  }, [postId]);

  if (!post) return <div>Loading...</div>;

  return <Editor post={post} />;
}
```

**Kullanım Alanları:**
- Admin panel
- Interactive dashboards
- Real-time data
- User-specific content

### 3. Hybrid Approach

**Pattern:** Server fetch + client interactivity.

```typescript
// Server parent
export default async function BlogPage() {
  const posts = await postsApi.getAll();

  return <BlogListClient initialPosts={posts} />;
}

// Client child
'use client';
export function BlogListClient({ initialPosts }) {
  const [posts, setPosts] = useState(initialPosts);

  // Client-side updates
  const handleFilter = async (tag) => {
    const filtered = await postsApi.getAll({ tag });
    setPosts(filtered);
  };

  return <BlogList posts={posts} onFilter={handleFilter} />;
}
```

## 🎯 API Client Layer

Tüm API çağrıları `lib/api/` altındaki wrapper'lar üzerinden yapılır.

### API Client Structure

```
lib/api/
├── client.ts         # Axios instance setup
├── auth.ts           # Auth API calls
├── posts.ts          # Posts API calls
└── upload.ts         # Upload API calls
```

### Axios Instance

```typescript
// lib/api/client.ts
import axios from 'axios';

const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL,
  timeout: 30000,
});

// Request interceptor - Auth token injection
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Response interceptor - Error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      window.location.href = '/admin/login';
    }
    return Promise.reject(error);
  }
);

export default apiClient;
```

### API Wrapper Examples

```typescript
// lib/api/posts.ts
import apiClient from './client';

export const postsApi = {
  getAll: (params?) =>
    apiClient.get('/posts', { params }).then(res => res.data),

  getById: (id) =>
    apiClient.get(`/posts/${id}`).then(res => res.data),

  getBySlug: (slug, locale) =>
    apiClient.get(`/posts/slug/${slug}`, { params: { locale } })
      .then(res => res.data),

  create: (data) =>
    apiClient.post('/posts', data).then(res => res.data),

  update: (id, data) =>
    apiClient.put(`/posts/${id}`, data).then(res => res.data),

  delete: (id) =>
    apiClient.delete(`/posts/${id}`).then(res => res.data),
};
```

## 🌍 i18n Integration

### Navigation

```typescript
// ❌ Yanlış - Next.js default
import { Link } from 'next/link';
<Link href="/blog">Blog</Link>

// ✅ Doğru - i18n-aware
import { Link } from '@/lib/i18n/routing';
<Link href="/blog">Blog</Link>
```

### Translations

**Server Component:**
```typescript
import { getTranslations } from 'next-intl/server';

export default async function HomePage() {
  const t = await getTranslations('home');

  return (
    <div>
      <h1>{t('hero.title')}</h1>
      <p>{t('hero.description')}</p>
    </div>
  );
}
```

**Client Component:**
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

## 🎨 Styling

### Tailwind CSS Usage

```typescript
// Component styling
export function BlogCard({ post }) {
  return (
    <article className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow">
      <img
        src={post.featuredImage}
        alt={post.title}
        className="w-full h-48 object-cover"
      />
      <div className="p-6">
        <h2 className="text-xl font-bold mb-2">{post.title}</h2>
        <p className="text-gray-600">{post.excerpt}</p>
      </div>
    </article>
  );
}
```

### Conditional Classes

```typescript
import { cn } from '@/lib/utils/cn';

export function Button({ variant, className, ...props }) {
  return (
    <button
      className={cn(
        'px-4 py-2 rounded font-medium',
        variant === 'primary' && 'bg-blue-500 text-white',
        variant === 'secondary' && 'bg-gray-200 text-gray-800',
        className
      )}
      {...props}
    />
  );
}
```

## 🔒 Protected Routes

Admin sayfaları için auth kontrolü:

```typescript
// components/admin/ProtectedRoute.tsx
'use client';
import { useEffect } from 'react';
import { useRouter } from '@/lib/i18n/routing';
import { useAuth } from '@/lib/hooks/useAuth';

export function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.push('/admin/login');
    }
  }, [user, loading, router]);

  if (loading) return <div>Loading...</div>;
  if (!user) return null;

  return <>{children}</>;
}
```

**Kullanımı:**
```typescript
// app/[locale]/admin/dashboard/page.tsx
import { ProtectedRoute } from '@/components/admin/ProtectedRoute';

export default function Dashboard() {
  return (
    <ProtectedRoute>
      <DashboardContent />
    </ProtectedRoute>
  );
}
```

---

**İlgili Dokümanlar:**
- [architecture.md](./architecture.md) - Genel mimari
- [i18n-guide.md](./i18n-guide.md) - i18n detayları
- [frontend-rules.md](../rules/frontend-rules.md) - Frontend geliştirme kuralları
