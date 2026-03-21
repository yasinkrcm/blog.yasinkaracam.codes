# Kod Konvansiyonları

Bu doküman, proje genelindeki kod yazma standartlarını ve convention'larını içerir. Tüm geliştiriciler bu standartlara uymalıdır.

## 📋 Genel İlkeler

1. **Readability matters** - Kodun ne yaptığı açık olmalı
2. **Consistency is key** - Tutarsızlık yok
3. **Less is more** - Gereksiz karmaşıklıktan kaçın
4. **Self-documenting** - Koddan anlaşılmalı, comment destek

---

## 📁 Dosya ve Dizin İsimlendirme

### Dizin İsimleri

```
✅ DOĞRU              ❌ YANLIŞ
components/          Components/
blog/                Blog/
admin-dashboard/     adminDashboard/
api-client/          api_client/
```

**Kural:** Küçük harf, tire ile ayır (`kebab-case`)

### Dosya İsimleri

#### Component Dosyaları

```
✅ DOĞRU              ❌ YANLIŞ
BlogCard.tsx         blog-card.tsx
TipTapEditor.tsx     tiptapeditor.tsx
ProtectedRoute.tsx   protected_route.tsx
```

**Kural:** PascalCase, component adı

#### Utility Dosyaları

```
✅ DOĞRU              ❌ YANLIŞ
api-client.ts        ApiClient.ts
seo.ts               SEO.ts
slugify.ts           slugify_helper.ts
useAuth.ts           UseAuth.ts
```

**Kural:** camelCase, açıklayıcı

#### Test Dosyaları

```
✅ DOĞRU              ❌ YANLIŞ
BlogCard.test.tsx    blog-card-test.tsx
api.spec.ts          api.test.spec.ts
```

**Kural:** `<DosyaAdı>.test.ts` veya `<DosyaAdı>.spec.ts`

---

## 🎯 TypeScript Konvansiyonları

### Type ve Interface

**Interface kullan (object'ler için):**
```typescript
// ✅ DOĞRU
interface Post {
  _id: string;
  title: string;
  slug: string;
  content: {
    json: object;
    html: string;
  };
}

interface BlogCardProps {
  post: Post;
  variant?: 'default' | 'featured';
}
```

**Type kullan (union, primitive):**
```typescript
// ✅ DOĞRU
type Locale = 'tr' | 'en';
type PostStatus = 'draft' | 'published';
type ID = string;
```

### Type Export

```typescript
// ✅ DOĞRU - Ayrı export
interface Post {
  _id: string;
  title: string;
}

export type { Post };
export { Post };

// ✅ DOĞRU - Inline export
export interface Post {
  _id: string;
  title: string;
}
```

### Generic Type Parameters

```typescript
// ✅ DOĞRU - Descriptive names
function toArray<T>(value: T): T[] {
  return [value];
}

function first<T>(items: T[]): T | undefined {
  return items[0];
}

// ❌ YANLIŞ - Single letter (complex types)
function first<T>(items: T[]): T | undefined {  // ✅ Basit için OK
  return items[0];
}

// ✅ DOĞRU - Complex için descriptive
function getItemsByCategory<ItemType extends { category: string }>(
  items: ItemType[],
  category: string
): ItemType[] {
  return items.filter(item => item.category === category);
}
```

### Avoid `any`

```typescript
// ❌ YANLIŞ
function processData(data: any) {
  return data.value;
}

// ✅ DOĞRU - Type tanımla
interface Data {
  value: number;
}

function processData(data: Data) {
  return data.value;
}

// ✅ DOĞRU - Generic (type bilinmiyorsa)
function processData<T extends { value: number }>(data: T) {
  return data.value;
}

// ✅ DOĞRU - Unknown (any yerine)
function processData(data: unknown) {
  if (typeof data === 'object' && data !== null && 'value' in data) {
    return (data as { value: number }).value;
  }
}
```

---

## 🎨 React Component Konvansiyonları

### Component Declaration

```typescript
// ✅ DOĞRU - Function declaration
export default function BlogCard({ post }: { post: Post }) {
  return <article>{post.title}</article>;
}

// ✅ DOĞRU - Arrow function
export const BlogCard = ({ post }: { post: Post }) => {
  return <article>{post.title}</article>;
};

// ❌ YANLIŞ - var
var BlogCard = ({ post }: { post: Post }) => {  // Never use var
  return <article>{post.title}</article>;
};
```

### Props Destructuring

```typescript
// ✅ DOĞRU - Destructure props
export function BlogCard({ post, variant = 'default', className }: BlogCardProps) {
  return <article className={className}>{post.title}</article>;
}

// ✅ DOĞRU - Spread rest
export function BlogCard({ post, ...props }: BlogCardProps) {
  return <article {...props}>{post.title}</article>;
}

// ❌ YANLIŞ - No destructuring
export function BlogCard(props: BlogCardProps) {
  return <article>{props.post.title}</article>;
}
```

### Component Naming

```typescript
// ✅ DOĞRU - Descriptive names
export function BlogPostCard({ post }: { post: Post }) { }
export function AdminDashboardHeader({ user }: { user: User }) { }
export function TipTapEditor({ content, onChange }: EditorProps) { }

// ❌ YANLIŞ - Vague names
export function Card({ post }: { post: Post }) { }  // BlogCard olsaydı
export function Header({ user }: { user: User }) { }  // AdminHeader olsaydı
export function Editor({ content, onChange }: EditorProps) { }  // TipTapEditor olsaydı
```

### `use client` Directive

```typescript
// ✅ DOĞRU - Top of file, imports'tan sonra
'use client';

import { useState } from 'react';
import { Button } from './Button';

export function InteractiveComponent() {
  const [count, setCount] = useState(0);
  return <Button onClick={() => setCount(c => c + 1)}>Count: {count}</Button>;
}

// ❌ YANLIŞ - İmports'tan önce
'use client';

import { useState } from 'react';  // ❌ 'use client' sonraysı olmalı

// ❌ YANLIŞ - Araya eklenmiş
import { useState } from 'react';
'use client';  // ❌ En başta olmalı
import { Button } from './Button';
```

---

## 🔷 Function Konvansiyonları

### Function Declaration vs Expression

```typescript
// ✅ DOĞRU - Declaration (hoisting için)
export async function getPost(id: string): Promise<Post> {
  return await postsApi.getById(id);
}

// ✅ DOĞRU - Expression (callbacks, etc.)
const posts = data.map(post => (
  <BlogCard key={post._id} post={post} />
));

// ✅ DOĞRU - Arrow function
export const getPost = async (id: string): Promise<Post> => {
  return await postsApi.getById(id);
};
```

### Async/Await vs Promises

```typescript
// ✅ DOĞRU - async/await (preferred)
export async function createPost(data: PostCreateInput): Promise<Post> {
  const post = await postsApi.create(data);
  return post;
}

// ✅ DOĞRU - Promise chain (simple cases)
export const getPosts = () => postsApi.getAll();

// ❌ YANLIŞ - Mixed
export async function createPost(data: PostCreateInput) {
  return postsApi.create(data).then(post => post);  // Unnecessary
}
```

### Parameter Naming

```typescript
// ✅ DOĞRU - Descriptive
function createPost(input: PostCreateInput) { }
function getUserById(userId: string) { }
function formatDateWithOptions(date: Date, options: Intl.DateTimeFormatOptions) { }

// ❌ YANLIŞ - Vague
function createPost(d: PostCreateInput) { }  // What's d?
function getUserById(id: string) { }  // OK, but userId more explicit
function formatDate(date: Date, opts: any) { }  // Abbreviated
```

### Return Types

```typescript
// ✅ DOĞRU - Explicit return type
export function getPost(id: string): Promise<Post> {
  return postsApi.getById(id);
}

export function slugify(text: string): string {
  return text.toLowerCase().replace(/\s+/g, '-');
}

// ✅ DOĞRU - Inferred (obvious cases)
export const isValidEmail = (email: string): boolean =>
  /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

// ❌ YANLIŞ - Missing return type (complex)
export function getPost(id: string) {  // What does it return?
  return postsApi.getById(id);
}
```

---

## 🎯 Variable Konvansiyonları

### Variable Declaration

```typescript
// ✅ DOĞRU - const (default)
const API_URL = process.env.NEXT_PUBLIC_API_URL;
const posts = await postsApi.getAll();

// ✅ DOĞRU - let (reassignment)
let page = 1;
page += 1;

// ❌ YANLIŞ - var (never use)
var posts = [];  // ❌ Never use var
```

### Naming Convention

```typescript
// ✅ DOĞRU - camelCase
const blogPosts = await postsApi.getAll();
const isLoggedIn = true;
const maxFileSize = 5 * 1024 * 1024;

// ✅ DOĞRU - UPPER_CASE (constants)
const API_BASE_URL = 'https://api.example.com';
const MAX_FILE_SIZE = 5 * 1024 * 1024;
const DEFAULT_LOCALE = 'tr';

// ❌ YANLIŞ - Inconsistent
const BlogPosts = await postsApi.getAll();  // PascalCase for variable
const is_logged_in = true;                  // snake_case
const MAXFILESIZE = 5 * 1024 * 1024;        // Not a constant
```

### Boolean Variables

```typescript
// ✅ DOĞRU - is/has/should prefix
const isActive = true;
const hasPermission = false;
const shouldRender = true;
const isLoading = false;

// ❌ YANLIŞ - Unclear
const active = true;        // Active what?
const permission = false;   // Permission what?
const render = true;        // Render what?
```

---

## 🔢 Konstant (Constant) Tanımlama

### Magic Numbers

```typescript
// ❌ YANLIŞ - Magic numbers
const limit = 9;
const size = 5 * 1024 * 1024;
const timeout = 30000;

// ✅ DOĞRU - Named constants
const POSTS_PER_PAGE = 9;
const MAX_FILE_SIZE = 5 * 1024 * 1024;  // 5MB
const API_TIMEOUT = 30000;  // 30 seconds
```

### Constant Location

```typescript
// ✅ DOĞRU - Top of file/module
const POSTS_PER_PAGE = 9;
const API_TIMEOUT = 30000;

export async function getPosts(page: number) {
  return postsApi.getAll({ page, limit: POSTS_PER_PAGE });
}

// ❌ YANLIŞ - Inline
export async function getPosts(page: number) {
  return postsApi.getAll({ page, limit: 9 });  // What's 9?
}
```

---

## 📝 Comment Konvansiyonları

### JSDoc

```typescript
// ✅ DOĞRU - JSDoc for exported functions
/**
 * Blog post slug'ını başlıktan oluşturur
 * @param title - Post başlığı
 * @param locale - Dil kodu (tr, en)
 * @returns URL-friendly slug
 * @example
 * generateSlug('Çalışma Zamanı', 'tr') // 'calisma-zamani'
 */
export function generateSlug(title: string, locale: string): string {
  return title.toLowerCase().replace(/\s+/g, '-');
}

// ✅ DOĞRU - Simple comment (obvious functions)
// Türkçe karakterleri İngilizce karşılıklarıyla değiştir
export function normalizeTurkish(text: string): string {
  return text
    .replace(/ı/g, 'i')
    .replace(/ş/g, 's')
    .replace(/ğ/g, 'g');
}
```

### Inline Comments

```typescript
// ✅ DOĞRU - Explain "why", not "what"
// Slug uniquness kontrolü için atomic operation gerekli
const slug = await generateUniqueSlug(title, locale);

// ✅ DOĞRU - Complex logic explanation
// Reading time hesaplama: Ortalama 200 kelime/dakika
const wordCount = content.split(/\s+/).length;
const readingTime = Math.ceil(wordCount / 200);

// ❌ YANLIŞ - Stating the obvious
// Define variable
const posts = [];  // ❌ Useless comment

// Return the post
return post;  // ❌ Obvious
```

### TODO/FIXME Comments

```typescript
// ✅ DOĞRU - Actionable TODO
// TODO: Add pagination support (issue #123)
// FIXME: This causes a memory leak, use useCallback
// HACK: Temporarily disable auth for demo

// ❌ YANLIŞ - Vague TODO
// TODO: Fix this
// TODO: Make it better
```

---

## 🏗️ Import/Export Konvansiyonları

### Import Order

```typescript
// ✅ DOĞRU - Grouped imports
// 1. React/Next.js
import { useState, useEffect } from 'react';
import Image from 'next/image';

// 2. Third-party libraries
import { useRouter } from 'next-intl/navigation';
import clsx from 'clsx';

// 3. Internal imports (absolute)
import { Button } from '@/components/ui/Button';
import { postsApi } from '@/lib/api/posts';
import { cn } from '@/lib/utils/cn';

// 4. Relative imports
import { BlogCard } from './BlogCard';
import { Pagination } from './Pagination';

// 5. Types (if separate)
import type { Post } from '@/types';
```

### Named vs Default Exports

```typescript
// ✅ DOĞRU - Named export (components)
export function BlogCard({ post }: { post: Post }) { }
export const BlogCard = ({ post }: { post: Post }) => { };

// ✅ DOĞRU - Default export (pages)
export default function BlogPage() { }

// ✅ DOĞRU - Both (flexibility)
export function BlogCard({ post }: { post: Post }) { }
export default BlogCard;

// ❌ YANLIŞ - Inconsistent
export default function BlogCard() { }  // Some components
export const BlogList = () => { }        // Other components
```

### Barrel Exports (index.ts)

```typescript
// components/blog/index.ts
export { BlogCard } from './BlogCard';
export { BlogList } from './BlogList';
export { BlogPost } from './BlogPost';
export { Pagination } from './Pagination';

// Usage
import { BlogCard, BlogList, BlogPost, Pagination } from '@/components/blog';
```

---

## 🎨 CSS/Tailwind Konvansiyonları

### Tailwind Class Order

```typescript
// ✅ DOĞRU - Logical grouping
className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
//       │    │         │            │    │     │       │        │                 │
//       Layout      Spacing       Colors  Shapes  Effects  Interactions     Animation
```

**Recommended order:**
1. Layout (flex, grid, block, etc.)
2. Alignment (items-center, justify-between, etc.)
3. Spacing (p-4, m-2, gap-4, etc.)
4. Sizing (w-full, h-48, etc.)
5. Typography (text-xl, font-bold, etc.)
6. Colors (bg-white, text-gray-900, etc.)
7. Borders/Shapes (rounded-lg, border, etc.)
8. Effects (shadow-md, opacity, etc.)
9. Transitions (hover:, focus:, etc.)

---

## 🧪 Test Konvansiyonları

### Test Structure

```typescript
// ✅ DOĞRU - AAA pattern (Arrange, Act, Assert)
describe('generateSlug', () => {
  it('should convert Turkish characters', () => {
    // Arrange
    const input = 'Çalışma Zamanı';

    // Act
    const result = generateSlug(input);

    // Assert
    expect(result).toBe('calisma-zamani');
  });
});
```

### Test Naming

```typescript
// ✅ DOĞRU - Descriptive test names
it('should return 404 when post not found', () => { });
it('should create post with valid data', () => { });
it('should reject invalid email format', () => { });

// ❌ YANLIŞ - Vague names
it('works', () => { });
it('test post', () => { });
it('error', () => { });
```

---

## 📦 Project Structure Konvansiyonları

### Directory Structure

```
project/
├── backend/
│   └── src/
│       ├── config/       # Configuration
│       ├── controllers/  # Business logic
│       ├── middleware/   # Express middleware
│       ├── models/       # Mongoose schemas
│       ├── routes/       # API routes
│       └── utils/        # Utility functions
│
└── client/
    ├── app/              # Next.js App Router
    ├── components/       # React components
    ├── lib/              # Utilities & API client
    └── messages/         # i18n translations
```

**Kural:** Feature-based grouping, type-based separation

---

## 🔍 Code Review Checklist

### Her PR'de kontrol et:

- [ ] TypeScript strict mode violations yok
- [ ] ESLint warnings yok
- [ ] Console.log'lar temizlendi mi
- [ ] TODO/FIXME comments handle edildi mi
- [ ] Unused imports/variables yok
- [ ] Magic numbers/strings yok
- [ ] Consistent naming convention
- [ ] Proper error handling
- [ ] Tests yazıldı mı
- [ ] Documentation güncellendi mi

---

**İlgili Dokümanlar:**
- [backend-rules.md](./backend-rules.md) - Backend kuralları
- [frontend-rules.md](./frontend-rules.md) - Frontend kuralları
