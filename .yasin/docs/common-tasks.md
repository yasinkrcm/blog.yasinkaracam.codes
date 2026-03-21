# Sık Kullanılan Geliştirme Görevleri

Bu doküman, blog projesinde sık kullanılan geliştirme görevlerinin adım adım nasıl yapılacağını açıklar.

## 📝 İçerik

- [Yeni API Endpoint Ekleme](#yeni-api-endpoint-ekleme)
- [Yeni Locale Ekleme](#yeni-locale-ekleme)
- [Blog Post Field Ekleme](#blog-post-field-ekleme)
- [Yeni Component Oluşturma](#yeni-component-oluşturma)
- [Admin Sayfası Ekleme](#admin-sayfası-ekleme)
- [SEO Meta Tags Güncelleme](#seo-meta-tags-güncelleme)
- [Endpoint Test Etme](#endpoint-test-etme)
- [Deployment Yapma](#deployment-yapma)

---

## 🚀 Yeni API Endpoint Ekleme

### Senaryo: Yorum (Comment) Sistemi

#### Adım 1: Backend Model

`backend/src/models/Comment.ts`:

```typescript
import mongoose, { Schema, Document } from 'mongoose';

export interface IComment extends Document {
  post: mongoose.Types.ObjectId;
  author: string;
  email: string;
  content: string;
  status: 'pending' | 'approved' | 'rejected';
  createdAt: Date;
}

const commentSchema = new Schema<IComment>(
  {
    post: {
      type: Schema.Types.ObjectId,
      ref: 'Post',
      required: true,
    },
    author: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
    },
    content: {
      type: String,
      required: true,
      maxlength: 1000,
    },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

// Index for efficient queries
commentSchema.index({ post: 1, status: 1, createdAt: -1 });

export default mongoose.model<IComment>('Comment', commentSchema);
```

#### Adım 2: Backend Controller

`backend/src/controllers/commentController.ts`:

```typescript
import { Response } from 'express';
import asyncHandler from 'express-async-handler';
import Comment, { IComment } from '../models/Comment';

// @desc    Create comment
// @route   POST /api/comments
// @access  Public
export const createComment = asyncHandler(async (req, res) => {
  const { post, author, email, content } = req.body;

  const comment = await Comment.create({
    post,
    author,
    email,
    content,
  });

  res.status(201).json(comment);
});

// @desc    Get comments for post
// @route   GET /api/comments/post/:postId
// @access  Public
export const getPostComments = asyncHandler(async (req, res) => {
  const comments = await Comment.find({
    post: req.params.postId,
    status: 'approved',
  }).sort({ createdAt: -1 });

  res.json(comments);
});

// @desc    Update comment status
// @route   PUT /api/comments/:id
// @access  Private (Admin)
export const updateCommentStatus = asyncHandler(async (req, res) => {
  const comment = await Comment.findById(req.params.id);

  if (!comment) {
    res.status(404);
    throw new Error('Comment not found');
  }

  comment.status = req.body.status;
  await comment.save();

  res.json(comment);
});
```

#### Adım 3: Backend Validation

`backend/src/middleware/validation.ts`:

```typescript
import Joi from 'joi';

export const commentSchema = Joi.object({
  post: Joi.string().required(),
  author: Joi.string().min(2).max(50).required(),
  email: Joi.string().email().required(),
  content: Joi.string().min(10).max(1000).required(),
});

export const commentStatusSchema = Joi.object({
  status: Joi.string().valid('pending', 'approved', 'rejected').required(),
});
```

#### Adım 4: Backend Routes

`backend/src/routes/comments.ts`:

```typescript
import express from 'express';
import {
  createComment,
  getPostComments,
  updateCommentStatus,
} from '../controllers/commentController';
import { protect } from '../middleware/auth';
import { validate, commentSchema, commentStatusSchema } from '../middleware/validation';

const router = express.Router();

router.post('/', validate(commentSchema), createComment);
router.get('/post/:postId', getPostComments);
router.put('/:id', protect, validate(commentStatusSchema), updateCommentStatus);

export default router;
```

#### Adım 5: Register Route

`backend/src/server.ts`:

```typescript
import commentRoutes from './routes/comments';

app.use('/api/comments', commentRoutes);
```

#### Adım 6: Frontend API Client

`client/lib/api/comments.ts`:

```typescript
import apiClient from './client';

export const commentsApi = {
  create: (data: CommentCreate) =>
    apiClient.post('/comments', data).then(res => res.data),

  getByPost: (postId: string) =>
    apiClient.get(`/comments/post/${postId}`).then(res => res.data),

  updateStatus: (id: string, status: string) =>
    apiClient.put(`/comments/${id}`, { status }).then(res => res.data),
};
```

#### Adım 7: Frontend Component

```typescript
'use client';
import { useState } from 'react';
import { commentsApi } from '@/lib/api/comments';

export function CommentForm({ postId }: { postId: string }) {
  const [author, setAuthor] = useState('');
  const [email, setEmail] = useState('');
  const [content, setContent] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    await commentsApi.create({
      post: postId,
      author,
      email,
      content,
    });

    // Reset form
    setAuthor('');
    setEmail('');
    setContent('');
  };

  return (
    <form onSubmit={handleSubmit}>
      <input
        type="text"
        value={author}
        onChange={(e) => setAuthor(e.target.value)}
        placeholder="Adınız"
        required
      />
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="E-posta"
        required
      />
      <textarea
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Yorumunuz"
        required
      />
      <button type="submit">Gönder</button>
    </form>
  );
}
```

---

## 🌍 Yeni Locale Ekleme

### Örnek: Almanca (de) Ekleme

#### Adım 1: Routing Configuration

`lib/i18n/routing.ts`:

```typescript
export const routing = defineRouting({
  locales: ['tr', 'en', 'de'],  // 'de' eklendi
  defaultLocale: 'tr',
  localePrefix: 'always',
});
```

#### Adım 2: Message File

`messages/de.json`:

```json
{
  "metadata": {
    "title": "Blog",
    "description": "Mein persönlicher Blog"
  },
  "nav": {
    "home": "Startseite",
    "blog": "Blog",
    "about": "Über mich",
    "contact": "Kontakt"
  },
  "blog": {
    "title": "Blog-Artikel",
    "readMore": "Weiterlesen",
    "tags": "Schlagwörter",
    "related": "Verwandte Artikel"
  },
  "home": {
    "hero": {
      "title": "Willkommen",
      "description": "Willkommen auf meinem Blog",
      "cta": "Blog erkunden"
    }
  }
}
```

#### Adım 3: Middleware Güncelleme

`middleware.ts`:

```typescript
export const config = {
  matcher: ['/', '/(tr|en|de)/:path*'],  // 'de' eklendi
};
```

#### Adım 4: Static Generation

```typescript
// app/[locale]/layout.tsx veya ilgili page
export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}
```

#### Adım 5: Test

```bash
# Development server restart
npm run dev

# Test URL
http://localhost:3000/de/blog
```

---

## ➕ Blog Post Field Ekleme

### Örnek: "Reading Time" Field

#### Adım 1: Backend Model Update

`backend/src/models/Post.ts`:

```typescript
const postSchema = new Schema<IPost>(
  {
    // ... existing fields
    readingTime: {
      type: Number,  // Dakika cinsinden
      default: 0,
    },
  },
  { timestamps: true }
);

// Auto-calculate reading time on save
postSchema.pre('save', function (next) {
  if (this.isModified('content.html')) {
    // Average reading speed: 200 words per minute
    const wordCount = this.content.html.split(/\s+/).length;
    this.readingTime = Math.ceil(wordCount / 200);
  }
  next();
});
```

#### Adım 2: Backend Controller Update

`backend/src/controllers/postController.ts`:

```typescript
// readingTime otomatik hesaplanıyor, controller'da değişiklik yok
// Ancak response'a dahil edildiğinden emin olun
```

#### Adım 3: Frontend Types Update

`client/lib/api/types.ts`:

```typescript
export interface Post {
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
  readingTime: number;  // Yeni field
  publishedDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

#### Adım 4: Frontend Display

`components/blog/BlogCard.tsx`:

```typescript
export function BlogCard({ post }: { post: Post }) {
  return (
    <article>
      {/* ... existing code */}
      <div className="flex items-center gap-2 text-sm text-gray-600">
        <span>{post.readingTime} dakikalık okuma</span>
        <span>•</span>
        <time>{new Date(post.publishedDate).toLocaleDateString('tr-TR')}</time>
      </div>
    </article>
  );
}
```

#### Adım 5: Admin Form Update (Opsiyonel)

Eğer manuel giriş istiyorsanız:

```typescript
// components/admin/PostForm.tsx
<input
  type="number"
  value={readingTime}
  onChange={(e) => setReadingTime(parseInt(e.target.value))}
  placeholder="Okuma süresi (dakika)"
/>
```

---

## 🎨 Yeni Component Oluşturma

### Örnek: Newsletter Subscribe Component

#### Adım 1: Component Dosyası

`components/home/NewsletterSubscribe.tsx`:

```typescript
'use client';
import { useState } from 'react';
import { useTranslations } from 'next-intl';

export function NewsletterSubscribe() {
  const t = useTranslations('home.newsletter');
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');

    try {
      // API call (örnek)
      await fetch('/api/newsletter/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      });

      setStatus('success');
      setEmail('');
    } catch (error) {
      setStatus('error');
    }
  };

  return (
    <section className="bg-blue-50 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto text-center">
          <h2 className="text-2xl font-bold mb-4">{t('title')}</h2>
          <p className="text-gray-600 mb-6">{t('description')}</p>

          {status === 'success' ? (
            <div className="bg-green-100 text-green-800 p-4 rounded">
              {t('successMessage')}
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex gap-2">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder={t('emailPlaceholder')}
                required
                className="flex-1 px-4 py-2 border rounded"
              />
              <button
                type="submit"
                disabled={status === 'loading'}
                className="bg-blue-500 text-white px-6 py-2 rounded hover:bg-blue-600"
              >
                {status === 'loading' ? t('subscribing') : t('subscribe')}
              </button>
            </form>
          )}

          {status === 'error' && (
            <p className="text-red-500 mt-2">{t('errorMessage')}</p>
          )}
        </div>
      </div>
    </section>
  );
}
```

#### Adım 2: Translations

`messages/tr.json`:

```json
{
  "home": {
    "newsletter": {
      "title": "Bültene Abone Olun",
      "description": "En son yazılardan haberdar olun",
      "emailPlaceholder": "E-posta adresiniz",
      "subscribe": "Abone Ol",
      "subscribing": "Abone Olunuyor...",
      "successMessage": "Başarıyla abone oldunuz!",
      "errorMessage": "Bir hata oluştu, lütfen tekrar deneyin"
    }
  }
}
```

#### Adım 3: Kullanım

`app/[locale]/page.tsx`:

```typescript
import { NewsletterSubscribe } from '@/components/home/NewsletterSubscribe';

export default function HomePage() {
  return (
    <main>
      {/* ... existing content */}
      <NewsletterSubscribe />
    </main>
  );
}
```

---

## 🔐 Admin Sayfası Ekleme

### Örnek: Yorum Yönetimi Sayfası

#### Adım 1: Admin Page

`app/[locale]/admin/comments/page.tsx`:

```typescript
'use client';
import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';
import { commentsApi } from '@/lib/api/comments';
import { ProtectedRoute } from '@/components/admin/ProtectedRoute';

export default function CommentsPage() {
  const t = useTranslations('admin');
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadComments();
  }, []);

  const loadComments = async () => {
    try {
      const data = await commentsApi.getAll();
      setComments(data);
    } catch (error) {
      console.error('Error loading comments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id: string, status: string) => {
    await commentsApi.updateStatus(id, status);
    loadComments();
  };

  if (loading) return <div>Loading...</div>;

  return (
    <ProtectedRoute>
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold mb-6">{t('comments.title')}</h1>

        <div className="space-y-4">
          {comments.map((comment) => (
            <div key={comment._id} className="bg-white p-6 rounded-lg shadow">
              <div className="flex justify-between items-start">
                <div>
                  <p className="font-semibold">{comment.author}</p>
                  <p className="text-sm text-gray-600">{comment.email}</p>
                  <p className="mt-2">{comment.content}</p>
                </div>

                <select
                  value={comment.status}
                  onChange={(e) => handleStatusChange(comment._id, e.target.value)}
                  className="border rounded px-3 py-1"
                >
                  <option value="pending">Bekliyor</option>
                  <option value="approved">Onaylandı</option>
                  <option value="rejected">Reddedildi</option>
                </select>
              </div>
            </div>
          ))}
        </div>
      </div>
    </ProtectedRoute>
  );
}
```

#### Adım 2: Navigation Update

`components/layout/Header.tsx` veya admin navigation component:

```typescript
<Link href="/admin/comments">Yorumlar</Link>
```

---

## 🔍 SEO Meta Tags Güncelleme

### Dinamik Meta Tags

`app/[locale]/blog/[slug]/page.tsx`:

```typescript
import { postsApi } from '@/lib/api/posts';

export async function generateMetadata({ params }: Props) {
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
      publishedTime: post.publishedDate,
      modifiedTime: post.updatedAt,
      authors: ['Blog Author'],
      tags: post.tags,
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

## 🧪 Endpoint Test Etme

### cURL ile Test

```bash
# Login ve token al
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}' \
  | jq -r '.token')

# Post oluştur
curl -X POST http://localhost:5000/api/posts \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Post",
    "content": {"json": {}, "html": "<p>Test</p>"},
    "excerpt": "Test excerpt",
    "locale": "tr",
    "status": "published"
  }'
```

### Postman Collection

Import edilebilir Postman collection oluşturun:

```json
{
  "info": {
    "name": "Blog API",
    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"
  },
  "variable": [
    {
      "key": "base_url",
      "value": "http://localhost:5000/api"
    },
    {
      "key": "token",
      "value": "your_jwt_token_here"
    }
  ]
}
```

---

## 🚀 Deployment Yapma

### Backend Deploy

```bash
# Sunucuya bağlan
ssh root@your_server_ip

# Repository güncelle
cd /var/www/backend
git pull origin main

# Dependencies güncelle
npm install --production

# Build
npm run build

# Restart
pm2 restart blog-backend
```

### Frontend Deploy

```bash
# Vercel CLI
cd client
vercel --prod

# Veya otomatik (git push)
git push origin main
```

---

## 📋 Best Practices

### ✅ Yapılacaklar

1. **Validation:** Her endpoint için Joi validation kullan
2. **Error Handling:** Tüm controller'larda try-catch veya asyncHandler
3. **Type Safety:** Frontend'te TypeScript interface'ler kullan
4. **i18n:** Her yeni text için translation ekle
5. **SEO:** Meta tags ve structured data ekle
6. **Testing:** Yeni endpoint'leri test et

### ❌ Yapılmaması Gerekenler

1. **Doğrudan database erişimi:** Frontend'ten doğrudan MongoDB'ye bağlanma
2. **Hardcoded values:** Environment variable kullan
3. **Password hashlememe:** Asla plain text saklama
4. **CORS unutma:** Backend CORS origin kontrol et
5. **Slug collision:** Slug uniqueness kontrol et

---

**İlgili Dokümanlar:**
- [architecture.md](./architecture.md) - Mimari
- [backend-api.md](./backend-api.md) - API dokümantasyonu
- [frontend-structure.md](./frontend-structure.md) - Frontend yapısı
