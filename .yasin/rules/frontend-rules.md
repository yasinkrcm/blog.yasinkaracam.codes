# Frontend Geliştirme Kuralları

Bu doküman, frontend geliştirme için yapılması ve yapılmaması gerekenleri içerir. AI asistanları için kesin komutlar seti.

## ✅ YAPILMASI GEREKENLER (DO'S)

### 1. Sunucu Bileşenleri Öncelikli (Server Components First)

**Varsayılan olarak Server Component kullan:**

```typescript
// ✅ DOĞRU - Server Component (default)
import { postsApi } from '@/lib/api/posts';
import { BlogCard } from './BlogCard';

export default async function BlogPage({ params }: { params: { locale: string } }) {
  // Server-side data fetching
  const posts = await postsApi.getAll({ locale: params.locale });

  return (
    <div className="grid grid-cols-3 gap-6">
      {posts.data.map((post) => (
        <BlogCard key={post._id} post={post} />
      ))}
    </div>
  );
}
```

**Neden:**
- ✅ SEO friendly
- ✅ Daha küçük client bundle
- ✅ Daha hızlı initial load
- ✅ Server-side rendering

**Sadece şu durumlarda Client Component:**
- Event handlers (`onClick`, `onChange`, etc.)
- Browser API usage (`localStorage`, `window`, etc.)
- React hooks (`useState`, `useEffect`, etc.)
- Interactive elements

---

### 2. i18n-Aware Navigation Kullan

**Her zaman `lib/i18n/routing.ts`'den import et:**

```typescript
// ✅ DOĞRU - i18n-aware navigation
import { Link, useRouter, redirect } from '@/lib/i18n/routing';

export function Navigation() {
  const router = useRouter();

  return (
    <nav>
      <Link href="/blog">Blog</Link>  {/* → /tr/blog veya /en/blog */}
      <Link href="/about">Hakkımda</Link>

      <button onClick={() => router.push('/admin/dashboard')}>
        Dashboard
      </button>
    </nav>
  );
}

// Server redirect
export default async function AdminPage() {
  redirect('/admin/login');  // Otomatik locale ekler
}
```

**❌ YANLIŞ - Next.js default:**
```typescript
// ❌ YANLIŞ
import { Link } from 'next/link';
import { useRouter } from 'next/navigation';

<Link href="/blog">Blog</Link>  {/* Locale eksik */}
useRouter().push('/blog');       {/* Locale eksik */}
```

**Problem:** İngilizce content'de `/tr/blog` gitmeye çalışır, URL yanlış olur.

---

### 3. API Client Layer Kullan

**Doğrudan axios yerine wrapper fonksiyonlar:**

```typescript
// ✅ DOĞRU - API client layer
import { postsApi } from '@/lib/api/posts';

export async function BlogPost({ slug, locale }: { slug: string; locale: string }) {
  const post = await postsApi.getBySlug(slug, locale);

  return <article>{post.content.html}</article>;
}
```

**API client structure:**
```typescript
// lib/api/posts.ts
import apiClient from './client';

export const postsApi = {
  getAll: (params?) => apiClient.get('/posts', { params }).then(res => res.data),
  getById: (id) => apiClient.get(`/posts/${id}`).then(res => res.data),
  getBySlug: (slug, locale) =>
    apiClient.get(`/posts/slug/${slug}`, { params: { locale } })
      .then(res => res.data),
  create: (data) => apiClient.post('/posts', data).then(res => res.data),
  update: (id, data) => apiClient.put(`/posts/${id}`, data).then(res => res.data),
  delete: (id) => apiClient.delete(`/posts/${id}`).then(res => res.data),
};
```

**Avantajları:**
- ✅ Tek noktadan endpoint yönetimi
- ✅ Otomatik auth token injection
- ✅ Type-safe API calls
- ✅ Centralized error handling

**❌ YANLIŞ - Direct axios:**
```typescript
// ❌ YANLIŞ
import axios from 'axios';

const post = await axios.get(`/api/posts/slug/${slug}`);  // Her yerde tekrar
```

---

### 4. Tailwind CSS ile Style Yap

**Her zaman Tailwind utility classes kullan:**

```typescript
// ✅ DOĞRU - Tailwind classes
export function BlogCard({ post }: { post: Post }) {
  return (
    <article className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300">
      <img
        src={post.featuredImage}
        alt={post.title}
        className="w-full h-48 object-cover"
      />
      <div className="p-6">
        <h2 className="text-xl font-bold mb-2 text-gray-900">{post.title}</h2>
        <p className="text-gray-600 line-clamp-3">{post.excerpt}</p>
        <div className="mt-4 flex items-center justify-between">
          <span className="text-sm text-gray-500">
            {new Date(post.publishedDate).toLocaleDateString('tr-TR')}
          </span>
          <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
            Devamını Oku
          </button>
        </div>
      </div>
    </article>
  );
}
```

**Conditional classes için `cn()` utility:**
```typescript
import { cn } from '@/lib/utils/cn';

export function Button({ variant, className, ...props }) {
  return (
    <button
      className={cn(
        'px-4 py-2 rounded font-medium transition-colors',
        variant === 'primary' && 'bg-blue-500 text-white hover:bg-blue-600',
        variant === 'secondary' && 'bg-gray-200 text-gray-800 hover:bg-gray-300',
        variant === 'danger' && 'bg-red-500 text-white hover:bg-red-600',
        className
      )}
      {...props}
    />
  );
}
```

**❌ YANLIŞ - CSS modules veya inline styles:**
```typescript
// ❌ YANLIŞ - Inline styles
<div style={{ backgroundColor: 'white', padding: '24px' }}>

// ❌ YANLIŞ - CSS modules
import styles from './BlogCard.module.css';
<div className={styles.card}>
```

---

### 5. `cn()` Utility Kullan

**Conditional class merging için:**

```typescript
// ✅ DOĞRU - cn() utility
import { cn } from '@/lib/utils/cn';

export function Input({ error, className, ...props }) {
  return (
    <input
      className={cn(
        'border rounded px-3 py-2 w-full',
        error && 'border-red-500 focus:border-red-500',
        props.disabled && 'opacity-50 cursor-not-allowed',
        className
      )}
      {...props}
    />
  );
}
```

**`cn()` implementation:**
```typescript
// lib/utils/cn.ts
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
```

**Avantajları:**
- ✅ Tailwind conflict resolution (`text-red text-blue` → `text-blue`)
- ✅ Conditional classes
- ✅ Clean syntax

---

### 6. TypeScript Strict Mode

**Her zaman type tanımla:**

```typescript
// ✅ DOĞRU - Type definitions
interface Post {
  _id: string;
  title: string;
  slug: string;
  content: {
    json: object;
    html: string;
  };
  excerpt: string;
  tags: string[];
  featuredImage?: string;
  locale: 'tr' | 'en';
  status: 'draft' | 'published';
  readingTime: number;
  publishedDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

interface BlogCardProps {
  post: Post;
  variant?: 'default' | 'featured';
}

export function BlogCard({ post, variant = 'default' }: BlogCardProps) {
  return <article>{/* ... */}</article>;
}
```

**❌ YANLIŞ - Any types:**
```typescript
// ❌ YANLIŞ
export function BlogCard({ post }: any) {  // Type safety yok
  return <article>{post.title}</article>;
}
```

---

### 7. Proper Error Handling

**API errors için consistent error handling:**

```typescript
// ✅ DOĞRU - Error handling
'use client';
import { useState } from 'react';
import { postsApi } from '@/lib/api/posts';

export function PostEditor({ postId }: { postId: string }) {
  const [post, setPost] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    postsApi.getById(postId)
      .then(setPost)
      .catch((err) => {
        setError(err.message || 'Post yüklenemedi');
      })
      .finally(() => setLoading(false));
  }, [postId]);

  if (loading) return <div>Yükleniyor...</div>;
  if (error) return <div className="text-red-500">{error}</div>;
  if (!post) return <div>Post bulunamadı</div>;

  return <Editor post={post} />;
}
```

---

### 8. SEO Meta Tags

**Her sayfa için proper meta tags:**

```typescript
// ✅ DOĞRU - Metadata
import { postsApi } from '@/lib/api/posts';

export async function generateMetadata({ params }: { params: { slug: string; locale: string } }) {
  const post = await postsApi.getBySlug(params.slug, params.locale);

  return {
    title: post.title,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      locale: params.locale,
      url: `${process.env.NEXT_PUBLIC_SITE_URL}/${params.locale}/blog/${post.slug}`,
      images: post.featuredImage ? [
        {
          url: post.featuredImage,
          width: 1200,
          height: 630,
          alt: post.title,
        }
      ] : [],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: post.featuredImage ? [post.featuredImage] : [],
    },
    alternates: {
      canonical: `${process.env.NEXT_PUBLIC_SITE_URL}/${params.locale}/blog/${post.slug}`,
      languages: {
        tr: `${process.env.NEXT_PUBLIC_SITE_URL}/tr/blog/${post.slug}`,
        en: `${process.env.NEXT_PUBLIC_SITE_URL}/en/blog/${post.slug}`,
      },
    },
  };
}
```

---

### 9. Image Optimization

**Next.js Image component kullan:**

```typescript
// ✅ DOĞRU - Next.js Image
import Image from 'next/image';

export function BlogCard({ post }: { post: Post }) {
  return (
    <article>
      <Image
        src={post.featuredImage || '/placeholder.jpg'}
        alt={post.title}
        width={800}
        height={400}
        className="w-full h-48 object-cover"
        priority={false}  // Above-fold images: true
      />
      <h2>{post.title}</h2>
    </article>
  );
}
```

**❌ YANLIŞ - Plain img tag:**
```typescript
// ❌ YANLIŞ
<img src={post.featuredImage} alt={post.title} />  // No optimization
```

---

### 10. Component Organizasyonu

**Feature-based grouping:**

```
components/
├── blog/
│   ├── BlogCard.tsx        # Blog post card
│   ├── BlogList.tsx        # Blog post list
│   ├── BlogPost.tsx        # Single post view
│   └── Pagination.tsx      # Pagination component
├── admin/
│   ├── PostForm.tsx        # Admin post form
│   ├── PostList.tsx        # Admin post list
│   └── ProtectedRoute.tsx  # Auth wrapper
├── editor/
│   ├── TipTapEditor.tsx    # Rich text editor
│   └── EditorToolbar.tsx   # Editor toolbar
└── layout/
    ├── Header.tsx          # Site header
    └── Footer.tsx          # Site footer
```

**İsimlendirme convention:**
- Components: PascalCase (`BlogCard.tsx`)
- Utilities: camelCase (`api-client.ts`, `seo.ts`)
- Hooks: `use` prefix (`useAuth.ts`)

---

## ❌ YAPILMAMASI GEREKENLER (DON'TS)

### 1. Gereksiz Client Components

**❌ YANLIŞ - Interactive değilse client component yapma:**
```typescript
// ❌ YANLIŞ - Gereksiz 'use client'
'use client';

export function BlogPost({ post }: { post: Post }) {
  return (
    <article>
      <h1>{post.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: post.content.html }} />
    </article>
  );
}
```

**✅ DOĞRU - Server component kullan:**
```typescript
// ✅ DOĞRU - Interactive yok, server component
export function BlogPost({ post }: { post: Post }) {
  return (
    <article>
      <h1>{post.title}</h1>
      <div dangerouslySetInnerHTML={{ __html: post.content.html }} />
    </article>
  );
}
```

---

### 2. Next.js Default Navigation

**❌ YANLIŞ - i18n desteği yok:**
```typescript
// ❌ YANLIŞ
import { Link } from 'next/link';
import { useRouter } from 'next/navigation';

<Link href="/blog">Blog</Link>     {/* /tr değil /blog */}
useRouter().push('/admin');        {/* Locale eksik */}
```

**✅ DOĞRU - i18n-aware:**
```typescript
// ✅ DOĞRU
import { Link, useRouter } from '@/lib/i18n/routing';

<Link href="/blog">Blog</Link>     {/* /tr/blog veya /en/blog */}
useRouter().push('/admin');        {/* /tr/admin veya /en/admin */}
```

---

### 3. Direct Axios Calls

**❌ YANLIŞ - API client layer olmadan:**
```typescript
// ❌ YANLIŞ
import axios from 'axios';

const post = await axios.get('/api/posts');  // Auth, error handling yok
```

**✅ DOĞRU - API wrapper kullan:**
```typescript
// ✅ DOĞRU
import { postsApi } from '@/lib/api/posts';

const post = await postsApi.getById(id);  // Auth, error handling var
```

---

### 4. CSS Modules veya Inline Styles

**❌ YANLIŞ:**
```typescript
// ❌ YANLIŞ - CSS modules
import styles from './Component.module.css';
<div className={styles.container}>

// ❌ YANLIŞ - Inline styles
<div style={{ display: 'flex', padding: '20px' }}>
```

**✅ DOĞRU - Tailwind utilities:**
```typescript
// ✅ DOĞRU
<div className="flex p-5">
```

---

### 5. localStorage useEffect İçinde

**❌ YANLIŞ - Server render hatası:**
```typescript
// ❌ YANLIŞ - SSR'de localStorage undefined
export function ThemeToggle() {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    const saved = localStorage.getItem('theme');  // ❌ Server-side çalışır
    setTheme(saved);
  }, []);

  return <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
    Toggle
  </button>;
}
```

**✅ DOĞRU - Server-safe check:**
```typescript
// ✅ DOĞRU
export function ThemeToggle() {
  const [theme, setTheme] = useState('light');

  useEffect(() => {
    if (typeof window !== 'undefined') {  // ✅ Browser check
      const saved = localStorage.getItem('theme');
      setTheme(saved || 'light');
    }
  }, []);

  return <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
    Toggle
  </button>;
}
```

---

### 6. Hardcoded String'ler

**❌ YANLIŞ - Translation yok:**
```typescript
// ❌ YANLIŞ
export function BlogList() {
  return (
    <div>
      <h1>Blog Yazıları</h1>  {/* Hardcoded */}
      <button>Devamını Oku</button>
    </div>
  );
}
```

**✅ DOĞRU - i18n:**
```typescript
// ✅ DOĞRU
import { useTranslations } from 'next-intl';

export function BlogList() {
  const t = useTranslations('blog');

  return (
    <div>
      <h1>{t('title')}</h1>  {/* Blog Yazıları / Blog Posts */}
      <button>{t('readMore')}</button>  {/* Devamını Oku / Read More */}
    </div>
  );
}
```

---

### 7. Unhandled Promise Rejections

**❌ YANLIŞ:**
```typescript
// ❌ YANLIŞ - Error handling yok
export function PostEditor({ postId }: { postId: string }) {
  useEffect(() => {
    postsApi.getById(postId).then(setPost);  // Error yok
  }, [postId]);

  return <Editor post={post} />;
}
```

**✅ DOĞRU:**
```typescript
// ✅ DOĞRU - Error handling
export function PostEditor({ postId }: { postId: string }) {
  const [error, setError] = useState(null);

  useEffect(() => {
    postsApi.getById(postId)
      .then(setPost)
      .catch((err) => setError(err.message));
  }, [postId]);

  if (error) return <Error message={error} />;
  return <Editor post={post} />;
}
```

---

### 8. Magic Numbers/Strings

**❌ YANLIŞ:**
```typescript
// ❌ YANLIŞ - Magic numbers
<div style={{ width: 800 }}>
  {posts.slice(0, 9).map(...)}  // 9 ne?
</div>
```

**✅ DOĞRU:**
```typescript
// ✅ DOĞRU - Named constants
const POSTS_PER_PAGE = 9;
const CONTAINER_WIDTH = 800;

<div style={{ width: CONTAINER_WIDTH }}>
  {posts.slice(0, POSTS_PER_PAGE).map(...)}
</div>
```

---

### 9. PropTypes yerine TypeScript

**❌ YANLIŞ:**
```typescript
// ❌ YANLIŞ - PropTypes (redundant)
import PropTypes from 'prop-types';

BlogCard.propTypes = {
  post: PropTypes.object.isRequired,
  variant: PropTypes.string,
};
```

**✅ DOĞRU:**
```typescript
// ✅ DOĞRU - TypeScript interfaces
interface BlogCardProps {
  post: Post;
  variant?: 'default' | 'featured';
}

export function BlogCard({ post, variant = 'default' }: BlogCardProps) {
  // ...
}
```

---

### 10. Client-only Data Fetching (Server Component mümkünken)

**❌ YANLIŞ:**
```typescript
// ❌ YANLIŞ - Client-side fetch (Server component ile mümkün)
'use client';

export function BlogPage() {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    postsApi.getAll().then(setPosts);  // Client-side fetch
  }, []);

  return <BlogList posts={posts} />;
}
```

**✅ DOĞRU:**
```typescript
// ✅ DOĞRU - Server-side fetch
export default async function BlogPage() {
  const posts = await postsApi.getAll();  // Server-side fetch

  return <BlogList posts={posts.data} />;
}
```

**Neden:**
- ✅ SEO optimized
- ✅ Faster initial load
- ✅ Smaller client bundle
- ✅ Better UX

---

## 🎯 Best Practices Checklist

### Her Component İçin:

- [ ] Server component mi (mümkünse)?
- [ ] TypeScript types tanımlandı mı?
- [ ] i18n translations var mı?
- [ ] Tailwind classes kullanıldı mı?
- [ ] Error handling var mı?
- [ ] Loading states var mı?
- [ ] SEO meta tags var mı (sayfa ise)?
- [ ] API client layer kullanıldı mı?
- [ ] Proper props destructuring yapıldı mı?
- [ ] Component test edilebilir mi?

---

**İlgili Dokümanlar:**
- [backend-rules.md](./backend-rules.md) - Backend kuralları
- [code-conventions.md](./code-conventions.md) - Kod konvansiyonları
