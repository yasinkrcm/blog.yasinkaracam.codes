# Backend Geliştirme Kuralları

Bu doküman, backend geliştirme için yapılması ve yapılmaması gerekenleri içerir. AI asistanları için kesin komutlar seti.

## ✅ YAPILMASI GEREKENLER (DO'S)

### 1. MVC Yapısına Uy

**Her zaman bu sırayı takip et:**

```typescript
// ✅ DOĞRU - MVC yapısı
// 1. Route (routes/posts.ts)
router.post('/', protect, validate(postSchema), createPost);

// 2. Controller (controllers/postController.ts)
export const createPost = asyncHandler(async (req, res) => {
  const post = await Post.create(req.body);
  res.status(201).json(post);
});

// 3. Model (models/Post.ts)
const postSchema = new Schema({
  title: { type: String, required: true }
});
```

**❌ YANLIŞ - Route içeri business logic:**
```typescript
// ❌ YANLIŞ
router.post('/', async (req, res) => {
  const post = await Post.create(req.body);  // Logic route'da
  res.status(201).json(post);
});
```

**Neden:** Separation of concerns, test edilebilirlik, maintainability.

---

### 2. Middleware Chain'i Koru

**Standart middleware sırası:**

```typescript
// ✅ DOĞRU - Correct middleware order
router.route('/')
  .get(protect, optionalAuth, getPosts)           // GET
  .post(protect, validate(postSchema), createPost); // POST

router.route('/:id')
  .get(getPostById)                               // Public
  .put(protect, validate(postSchema), updatePost)  // Protected
  .delete(protect, deletePost);                   // Protected
```

**Middleware sırası:**
1. `protect` - Authentication check (önce)
2. `optionalAuth` - Optional auth (preview için)
3. `validate(schema)` - Input validation
4. `upload` - File upload (varsa)
5. Controller - Business logic (son)

**❌ YANLIŞ - Yanlış sıra:**
```typescript
// ❌ YANLIŞ
router.post('/', validate(postSchema), protect, createPost);  // Validate then auth
```

**Problem:** Validasyon authentication'dan önce yapılıyor, gereksiz computation.

---

### 3. Joi Validation Kullan

**Her endpoint için validation schema:**

```typescript
// ✅ DOĞRU - Joi validation
export const postSchema = Joi.object({
  title: Joi.string().min(3).max(200).required(),
  content: Joi.object({
    json: Joi.object().required(),
    html: Joi.string().required(),
  }).required(),
  excerpt: Joi.string().min(10).max(500).required(),
  tags: Joi.array().items(Joi.string()).optional(),
  locale: Joi.string().valid('tr', 'en').required(),
  status: Joi.string().valid('draft', 'published').required(),
});

// Route'da kullan
router.post('/', protect, validate(postSchema), createPost);
```

**❌ YANLIŞ - Manual validation:**
```typescript
// ❌ YANLIŞ
export const createPost = async (req, res) => {
  const { title, content } = req.body;

  if (!title || title.length < 3) {
    return res.status(400).json({ error: 'Invalid title' });
  }

  // ... manuel validation
};
```

**Problem:** Kod tekrarı, error-prone, consistency yok.

---

### 4. TypeScript Strict Mode

**Her zaman type tanımla:**

```typescript
// ✅ DOĞRU - Type definitions
export interface IPost extends Document {
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
  publishedDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export const createPost = asyncHandler(async (
  req: Request,
  res: Response
) => {
  const postData: Partial<IPost> = req.body;

  const post = await Post.create(postData);

  res.status(201).json(post);
});
```

**❌ YANLIŞ - Any types:**
```typescript
// ❌ YANLIŞ
export const createPost = async (req: any, res: any) => {
  const data: any = req.body;
  // ...
};
```

---

### 5. Türkçe Karakter Destekli Slugify

**Her zaman utility function kullan:**

```typescript
// ✅ DOĞRU - Custom slugify
import { generateSlug, generateUniqueSlug } from '../utils/slugify';

// Controller'da
const slug = await generateUniqueSlug(title, locale);

const post = await Post.create({
  title,
  slug,  // Unique per locale
  locale,
  // ...
});
```

**Utility function:**
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

export const generateUniqueSlug = async (
  title: string,
  locale: string
): Promise<string> => {
  const baseSlug = generateSlug(title);
  let slug = baseSlug;
  let counter = 1;

  while (await Post.findOne({ slug, locale })) {
    slug = `${baseSlug}-${counter}`;
    counter++;
  }

  return slug;
};
```

**❌ YANLIŞ - Package kullan:**
```typescript
// ❌ YANLIŞ - Türkçe karakterleri desteklemez
import slugify from 'slugify';
const slug = slugify(title);  // "Çalışma" → "calisma" ❌
```

---

### 6. Error Handler Kullan

**Tüm controller'larda asyncHandler:**

```typescript
// ✅ DOĞRU - Centralized error handling
import asyncHandler from 'express-async-handler';

export const createPost = asyncHandler(async (req, res) => {
  const post = await Post.create(req.body);
  res.status(201).json(post);
  // Hataları otomatik errorHandler middleware'e gönder
});
```

**❌ YANLIŞ - Manual try-catch:**
```typescript
// ❌ YANLIŞ
export const createPost = async (req, res) => {
  try {
    const post = await Post.create(req.body);
    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
```

**Problem:** Kod tekrarı, inconsistency.

---

### 7. Environment Variables Kullan

**Hiçbir zaman hardcoded değerler:**

```typescript
// ✅ DOĞRU - Environment variables
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;
const JWT_SECRET = process.env.JWT_SECRET;
const CORS_ORIGIN = process.env.CORS_ORIGIN;

app.use(cors({
  origin: CORS_ORIGIN,
  credentials: true,
}));
```

**❌ YANLIŞ - Hardcoded:**
```typescript
// ❌ YANLIŞ
const MONGO_URI = 'mongodb://localhost:27017/blog_db';  // Hardcoded
app.use(cors({ origin: 'http://localhost:3000' }));      // Hardcoded
```

---

### 8. Database Indexes Tanımla

**Performans için compound indexes:**

```typescript
// ✅ DOĞRU - Indexes
postSchema.index({ locale: 1, status: 1, createdAt: -1 });
postSchema.index({ slug: 1, locale: 1 }, { unique: true });
postSchema.index({ tags: 1 });
postSchema.index({ status: 1, publishedDate: -1 });
```

**Query patterns:**
```typescript
// Bu query'ler için index var
Post.find({ locale: 'tr', status: 'published' }).sort({ createdAt: -1 });
Post.findOne({ slug: 'nextjs-15', locale: 'tr' });
Post.find({ tags: 'react' });
```

---

### 9. Response Format Standardı

**Tüm endpoint'lerde tutarlı response:**

```typescript
// ✅ DOĞRU - Success response
res.status(200).json({
  success: true,
  data: post,
});

// List response
res.status(200).json({
  success: true,
  count: posts.length,
  totalPages: Math.ceil(count / limit),
  currentPage: page,
  data: posts,
});

// ✅ DOĞRU - Error response
res.status(404).json({
  success: false,
  error: 'Post not found',
});
```

**❌ YANLIŞ - Inconsistent:**
```typescript
// ❌ YANLIŞ
res.json(post);  // Bazen
res.json({ post });  // Bazen
res.status(200).send(post);  // Bazen
```

---

### 10. Password Hashleme

**Her zaman bcrypt ile hash'le:**

```typescript
// ✅ DOĞRU - Password hashing
import bcrypt from 'bcryptjs';

// Register
const salt = await bcrypt.genSalt(10);
const hashedPassword = await bcrypt.hash(password, salt);

admin.password = hashedPassword;
await admin.save();

// Login
const isMatch = await bcrypt.compare(password, admin.password);
```

**❌ YANLIŞ - Plain text:**
```typescript
// ❌ YANLIŞ - NEVER store plain text passwords
admin.password = password;  // SECURITY RISK!
```

---

## ❌ YAPILMAMASI GEREKENLER (DON'TS)

### 1. Doğrudan Response Gönderme

**❌ YANLIŞ:**
```typescript
// ❌ YANLIŞ - Response route'da
router.get('/', async (req, res) => {
  const posts = await Post.find({});
  res.json(posts);
});
```

**✅ DOĞRU:**
```typescript
// ✅ DOĞRU - Separate controller
router.get('/', getPosts);

// Controller
export const getPosts = asyncHandler(async (req, res) => {
  const posts = await Post.find({});
  res.json(posts);
});
```

---

### 2. Plain MongoDB Query'ler

**❌ YANLIŞ:**
```typescript
// ❌ YANLIŞ - Direct MongoDB
import mongoose from 'mongoose';
const db = mongoose.connection.db;
const posts = await db.collection('posts').find({}).toArray();
```

**✅ DOĞRU:**
```typescript
// ✅ DOĞRU - Mongoose ODM
import Post from '../models/Post';
const posts = await Post.find({});
```

---

### 3. SQL Injection Vulnerable Kodlar

**❌ YANLIŞ:**
```typescript
// ❌ YANLIŞ - User input doğrudan query'de
const postId = req.params.id;
const post = await Post.findById(postId);  // Mongoose bunu korur

// AMA
const query = `{ "_id": "${postId}" }`;  // ❌ DANGER
const post = await Post.findOne(JSON.parse(query));
```

**✅ DOĞRU:**
```typescript
// ✅ DOĞRU - Mongoose parameterized queries
const post = await Post.findById(req.params.id);
```

---

### 4. Sensitive Data Log'lama

**❌ YANLIŞ:**
```typescript
// ❌ YANLIŞ - Password log'lama
console.log('User:', { email, password });  // SECURITY RISK!
logger.info(`Creating admin: ${email} with ${password}`);
```

**✅ DOĞRU:**
```typescript
// ✅ DOĞRU - Password filtrele
console.log('User:', { email, password: '***' });
logger.info(`Creating admin: ${email}`);
```

---

### 5. Hardcoded Secrets

**❌ YANLIŞ:**
```typescript
// ❌ YANLIŞ
const JWT_SECRET = 'my_super_secret_key_123';  // NEVER commit this!
const API_KEY = 'sk-1234567890';
```

**✅ DOĞRU:**
```typescript
// ✅ DOĞRU
const JWT_SECRET = process.env.JWT_SECRET;
const API_KEY = process.env.API_KEY;

// .env.example
JWT_SECRET=your_jwt_secret_here
API_KEY=your_api_key_here
```

---

### 6. Global State Kullanımı

**❌ YANLIŞ:**
```typescript
// ❌ YANLIŞ - Global değişkenler
let currentUser = null;

export const login = async (req, res) => {
  currentUser = req.user;  // State tutuluyor
};
```

**✅ DOĞRU:**
```typescript
// ✅ DOĞRU - Stateless (JWT)
export const login = async (req, res) => {
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET);
  res.json({ token });
};
```

---

### 7. Callback Hell

**❌ YANLIŞ:**
```typescript
// ❌ YANLIŞ - Nested callbacks
Post.findById(id, (err, post) => {
  if (err) return next(err);
  User.findById(post.author, (err, user) => {
    if (err) return next(err);
    Comment.find({ post: post._id }, (err, comments) => {
      // ... callback hell
    });
  });
});
```

**✅ DOĞRU:**
```typescript
// ✅ DOĞRU - Async/await
const post = await Post.findById(id);
const user = await User.findById(post.author);
const comments = await Comment.find({ post: post._id });
```

---

### 8. Error Swallowing

**❌ YANLIŞ:**
```typescript
// ❌ YANLIŞ - Error swallow
try {
  await Post.create(req.body);
} catch (error) {
  console.log(error);  // Log only, no response
  // Error'ı client'e göndermiyoruz
}
```

**✅ DOĞRU:**
```typescript
// ✅ DOĞRU - Error propagation
export const createPost = asyncHandler(async (req, res) => {
  const post = await Post.create(req.body);
  // asyncHandler otomatik error handle eder
});
```

---

### 9. Mixed Response Types

**❌ YANLIŞ:**
```typescript
// ❌ YANLIŞ - Inconsistent response
if (post) {
  res.json(post);           // JSON
} else {
  res.send('Not found');    // String
}
```

**✅ DOĞRU:**
```typescript
// ✅ DOĞRU - Consistent JSON
if (post) {
  res.json({ success: true, data: post });
} else {
  res.status(404).json({ success: false, error: 'Not found' });
}
```

---

### 10. Unhandled Promises

**❌ YANLIŞ:**
```typescript
// ❌ YANLIŞ - Unhandled promise
router.post('/', (req, res) => {
  Post.create(req.body);  // Promise ignored
  res.json({ message: 'Post created' });
});
```

**✅ DOĞRU:**
```typescript
// ✅ DOĞRU - Await promise
router.post('/', asyncHandler(async (req, res) => {
  const post = await Post.create(req.body);
  res.json({ success: true, data: post });
}));
```

---

## 🎯 Best Practices Checklist

### Her Endpoint İçin:

- [ ] MVC yapısı takip edildi mi?
- [ ] Validation schema var mı?
- [ ] Error handling var mı?
- [ ] TypeScript tip tanımları var mı?
- [ ] Response format tutarlı mı?
- [ ] Authentication gerekli mi?
- [ ] Environment variables kullanıldı mı?
- [ ] Database query'ler optimal mi?
- [ ] Loglama var mı (sensitive data olmadan)?
- [ ] Test yazıldı mı?

---

**İlgili Dokümanlar:**
- [frontend-rules.md](./frontend-rules.md) - Frontend kuralları
- [security-rules.md](./security-rules.md) - Güvenlik kuralları
