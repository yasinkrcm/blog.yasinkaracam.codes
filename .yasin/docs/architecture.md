# Mimari Genel Bakış

Bu doküman, blog.yasinkaracam.codes projesinin mimari yapısını, bileşenlerini ve veri akışını açıklar.

## 🏗️ Yüksek Seviye Mimari

Proje **decoupled (ayrık)** mimari prensibine göre tasarlanmıştır:

```
┌─────────────────┐         REST API         ┌─────────────────┐
│                 │ ←─────────────────────→ │                 │
│   Frontend      │    (JSON/HTTPS)         │    Backend      │
│   (Next.js)     │                          │   (Express)     │
│                 │                          │                 │
└─────────────────┘                          └────────┬────────┘
                                                       │
                                                       │ Mongoose
                                                       ↓
                                                 ┌───────────┐
                                                 │  MongoDB  │
                                                 └───────────┘
```

### Temel Prensipler

1. **Separation of Concerns**: Frontend ve backend tamamen ayrı codebase'ler
2. **API-First Communication**: Tüm veri exchange REST API üzerinden
3. **Stateless Authentication**: JWT token based auth
4. **Locale-based Routing**: Her dil için ayrı route'lar

## 📊 Backend Mimarisı

### Katmanlı Mimari (Layered Architecture)

```
┌─────────────────────────────────────────┐
│           Routes Layer                  │  ← API endpoint tanımları
├─────────────────────────────────────────┤
│        Middleware Layer                 │  ← Auth, validation, upload
├─────────────────────────────────────────┤
│      Controllers Layer                  │  ← Business logic
├─────────────────────────────────────────┤
│         Models Layer                    │  ← Data schemas & validation
├─────────────────────────────────────────┤
│        Database Layer                   │  ← MongoDB (via Mongoose)
└─────────────────────────────────────────┘
```

### Bileşenler

#### 1. Routes (`backend/src/routes/`)

API endpoint'lerini tanımlar ve middleware'leri chain eder.

**Örnek structure:**
```typescript
// routes/posts.ts
router.route('/')
  .get(protect, optionalAuth, getPosts)        // List posts
  .post(protect, validate(postSchema), createPost);  // Create

router.route('/:id')
  .get(getPostById)                            // Get single
  .put(protect, validate(postSchema), updatePost)   // Update
  .delete(protect, deletePost);                // Delete
```

**Middleware Chain:**
```
Request → protect → validate → upload → controller → response
                    ↓           ↓
                 (Joi)      (Multer)
```

#### 2. Controllers (`backend/src/controllers/`)

Business logic'i içerir. Request/Response handling yapar.

**Post Controller Örneği:**
```typescript
// controllers/postController.ts
export const createPost = asyncHandler(async (req, res) => {
  // 1. Veriyi al
  const { title, content, excerpt, tags, locale } = req.body;

  // 2. İş mantığı
  const slug = await generateUniqueSlug(title, locale);

  // 3. Database kayıt
  const post = await Post.create({
    title, slug, content, excerpt, tags, locale
  });

  // 4. Response
  res.status(201).json(post);
});
```

#### 3. Models (`backend/src/models/`)

Mongoose schema'ları, validation ve indexes.

**Post Model Özellikleri:**
```typescript
{
  title: String (required)
  slug: String (unique per locale)
  content: {
    json: Object    // TipTap editable format
    html: String    // Rendered HTML
  }
  excerpt: String
  tags: [String]
  featuredImage: String
  locale: 'tr' | 'en'
  status: 'draft' | 'published'
  publishedDate: Date (auto-set on publish)
  createdAt/updatedAt: Date
}
```

**Indexes (Performans için):**
```javascript
// Compound index for efficient queries
postSchema.index({ locale: 1, status: 1, createdAt: -1 });

// Unique slug per locale
postSchema.index({ slug: 1, locale: 1 }, { unique: true });
```

#### 4. Middleware (`backend/src/middleware/`)

**Kritik Middleware'ler:**

| Middleware | Açıklama | Kullanım |
|------------|----------|----------|
| `protect` | JWT token verification | Protected routes |
| `optionalAuth` | Optional auth (preview) | Draft post preview |
| `validate(schema)` | Joi validation | Request body validation |
| `upload` | Multer file handling | Image upload |
| `errorHandler` | Centralized error handling | Global |

**Middleware Flow Örneği:**
```typescript
// POST /api/posts
router.post('/',
  protect,              // 1. Check JWT token
  validate(postSchema), // 2. Validate request body
  upload.single('image'), // 3. Handle file upload
  createPost            // 4. Execute controller
);
```

#### 5. Utils (`backend/src/utils/`)

**slugify.ts** - Türkçe karakter destekli URL slug oluşturma:
```typescript
export const generateSlug = (text: string): string => {
  return text
    .toLowerCase()
    .replace(/ı/g, 'i')
    .replace(/ş/g, 's')
    .replace(/ğ/g, 'g')
    .replace(/ç/g, 'c')
    .replace(/ö/g, 'o')
    .replace(/ü/g, 'u')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '');
};
```

## 🎨 Frontend Mimarisı

### Next.js 15 App Router Architecture

```
app/
├── [locale]/              # Dynamic locale segment
│   ├── layout.tsx         # Locale-specific layout
│   ├── page.tsx           # Home page
│   ├── blog/              # Blog routes
│   │   ├── page.tsx       # Blog listing
│   │   └── [slug]/page.tsx # Single post
│   └── admin/             # Protected admin routes
│       ├── login/
│       └── dashboard/
```

### Component Hierarchy

```
RootLayout (app/layout.tsx)
  └─ LocaleLayout (app/[locale]/layout.tsx)
      ├─ Header
      ├─ Page Content (Server Component)
      │   ├─ BlogList
      │   │   └─ BlogCard × N
      │   └─ BlogPost
      │       └─ JsonLd (SEO)
      └─ Footer
```

### Client vs Server Components

**Server Components (Default):**
- Blog sayfaları (listing, single post)
- Home page
- Admin post list
- ✅ Direct database access yok, API kullan
- ✅ SEO friendly
- ✅ Daha küçük bundle size

**Client Components ('use client'):**
- TipTap editor
- Admin login form
- Post edit form
- Interactive UI elements

### Data Fetching Patterns

**1. Server Components (Direct API):**
```typescript
// app/[locale]/blog/page.tsx
export default async function BlogPage() {
  const posts = await postsApi.getAll();  // Server-side fetch

  return <BlogList posts={posts} />;
}
```

**2. Client Components (useEffect):**
```typescript
'use client';
export default function PostForm() {
  const [post, setPost] = useState(null);

  useEffect(() => {
    postsApi.getById(id).then(setPost);
  }, [id]);

  return <form>{/* ... */}</form>;
}
```

## 🔄 Veri Akışı

### Post Creation Flow

```
┌──────────┐
│  Admin   │
└────┬─────┘
     │ 1. Fill form
     ↓
┌──────────────────┐
│ TipTap Editor    │ ← WYSIWYG editor
└────┬─────────────┘
     │ 2. Submit (JSON + HTML)
     ↓
┌──────────────────┐
│ API Client Layer │ ← Axios with auth token
└────┬─────────────┘
     │ 3. POST /api/posts
     ↓
┌──────────────────┐
│ Backend Routes   │ ← Middleware chain
└────┬─────────────┘
     │ 4. Validate → Create
     ↓
┌──────────────────┐
│ MongoDB          │ ← Save post
└────┬─────────────┘
     │ 5. Return post
     ↓
┌──────────────────┐
│ Admin Dashboard  │ ← Show success
└──────────────────┘
```

### Authentication Flow

```
┌──────────┐
│   User   │
└────┬─────┘
     │ 1. POST /api/auth/login
     ↓
┌──────────────────┐
│ Backend          │ ← Verify credentials
└────┬─────────────┘
     │ 2. Generate JWT
     ↓
┌──────────────────┐
│ Frontend         │ ← Store in localStorage
└────┬─────────────┘
     │ 3. Auto-inject header
     ↓
┌──────────────────┐
│ Axios Interceptor│ ← Authorization: Bearer {token}
└────┬─────────────┘
     │ 4. Protected requests
     ↓
┌──────────────────┐
│ Backend          │ ← Verify JWT
└──────────────────┘
```

## 🛡️ Güvenlik Mimarisı

### Security Layers

```
┌──────────────────────────────────┐
│  CORS (whitelist origins)        │ ← Layer 1
├──────────────────────────────────┤
│  Helmet.js (security headers)    │ ← Layer 2
├──────────────────────────────────┤
│  Rate Limiting (100 req/15min)   │ ← Layer 3
├──────────────────────────────────┤
│  JWT Verification                │ ← Layer 4
├──────────────────────────────────┤
│  Input Validation (Joi)          │ ← Layer 5
├──────────────────────────────────┤
│  Password Hashing (bcrypt)       │ ← Layer 6
└──────────────────────────────────┘
```

## 📦 Package Dependencies

### Backend Critical Dependencies
```
express         → HTTP server
mongoose        → MongoDB ODM
jsonwebtoken    → JWT auth
bcryptjs        → Password hashing
multer          → File upload
joi             → Validation
cors            → CORS
helmet          → Security headers
express-rate-limit → Rate limiting
```

### Frontend Critical Dependencies
```
next            → React framework
next-intl       → i18n
@tiptap/react   → Rich text editor
axios           → HTTP client
framer-motion   → Animations
lucide-react    → Icons
tailwindcss     → Styling
clsx            → Conditional classes
tailwind-merge  → Tailwind conflict resolution
```

## 🔗 Service Communication

### API Client Layer Pattern

Frontend'te tüm API çağrıları `lib/api/` altındaki wrapper fonksiyonlar üzerinden yapılır:

```typescript
// lib/api/posts.ts
export const postsApi = {
  getAll: (params?) => apiClient.get('/posts', { params }),
  getById: (id) => apiClient.get(`/posts/${id}`),
  create: (data) => apiClient.post('/posts', data),
  update: (id, data) => apiClient.put(`/posts/${id}`, data),
  delete: (id) => apiClient.delete(`/posts/${id}`),
};
```

**Avantajları:**
- ✅ Tek bir noktadan endpoint yönetimi
- ✅ Type-safe API calls
- ✅ Otomatik auth token injection
- ✅ Centralized error handling

## 🚀 Performans Optimizasyonları

### Backend
1. **Database Indexes**: Compound indexes for common queries
2. **Pagination**: 9 posts per page (configurable)
3. **Slug uniqueness check**: Efficient indexed queries

### Frontend
1. **Static Generation**: `generateStaticParams()` for locales
2. **Image Optimization**: Next.js Image component
3. **Code Splitting**: Automatic with App Router
4. **Server Components**: Reduce client-side JavaScript

---

**İlgili Dokümanlar:**
- [backend-api.md](./backend-api.md) - API endpoint detayları
- [frontend-structure.md](./frontend-structure.md) - Frontend component yapısı
