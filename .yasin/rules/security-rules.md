# Güvenlik Kuralları

Bu doküman, proje güvenliği için yapılması ve yapılmaması gerekenleri içerir. **KRİTİK ÖNEME SAHİPTİR.**

## 🚨 Kritik Güvenlik Kuralları

### 1. Password Güvenliği

#### ✅ YAP: Hashleme ile Sakla

```typescript
// ✅ DOĞRU - Password hashleme
import bcrypt from 'bcryptjs';

// Register
const salt = await bcrypt.genSalt(10);
const hashedPassword = await bcrypt.hash(password, salt);

admin.password = hashedPassword;
await admin.save();

// Login
const isMatch = await bcrypt.compare(password, admin.password);
if (!isMatch) {
  return res.status(401).json({ error: 'Invalid credentials' });
}
```

**Kurallar:**
- ✅ Her zaman bcrypt ile hash'le (minimum 10 salt rounds)
- ✅ Asla plain text password saklama
- ✅ Hash'leri log'larda gösterme
- ✅ Password validation ekle (minimum 6 karakter)

```typescript
// ✅ DOĞRU - Password validation
export const registerSchema = Joi.object({
  password: Joi.string()
    .min(6)
    .pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)  // En az 1 küçük, 1 büyük, 1 rakam
    .required()
    .messages({
      'string.pattern.base': 'Password must contain at least one lowercase, uppercase, and number',
    }),
});
```

#### ❌ YAPMA: Asla Plain Text

```typescript
// ❌ YANLIŞ - NEVER do this
admin.password = password;  // SECURITY BREACH!
await admin.save();

// ❌ YANLIŞ - Log'lama
console.log(`Creating user: ${email} with password: ${password}`);
logger.info(`User password: ${password}`);

// ❌ YANLIŞ - Response'ta password
res.json({
  user: {
    ...admin.toObject(),
    password: admin.password,  // ❌ NEVER send password
  },
});
```

---

### 2. JWT Token Güvenliği

#### ✅ YAP: Güçlü Secret ile İmzala

```typescript
// ✅ DOĞRU - JWT imzalama
import jwt from 'jsonwebtoken';

const token = jwt.sign(
  { userId: user._id, email: user.email },
  process.env.JWT_SECRET,  // Strong secret
  { expiresIn: '7d' }
);

res.json({ token });
```

**JWT Secret Kuralları:**
- ✅ Minimum 64 karakter
- ✅ Random string (crypto.randomBytes)
- ✅ Environment variable'da sakla
- ✅ Asla .env'e commit etme

**Güçlü Secret Oluştur:**
```bash
# Terminal'de çalıştır
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Çıktı: 8f3b2e1a9d4c7e6f5a8b1c2d3e4f5a6b7c8d9e0f1a2b3c4d5e6f7a8b9c0d1e2f
```

**.env.example:**
```bash
# Her environment için farklı secret
JWT_SECRET=your_super_secret_jwt_key_change_this_in_production_min_64_chars
```

#### ✅ YAP: Token Verification

```typescript
// ✅ DOĞRU - JWT doğrulama
import jwt from 'jsonwebtoken';

export const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  }

  if (!token) {
    return res.status(401).json({ error: 'Not authorized, no token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = await User.findById(decoded.userId);
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Not authorized, token failed' });
  }
});
```

#### ❌ YAPMA: Zayıf Secret veya Expiration

```typescript
// ❌ YANLIŞ - Zayıf secret
const token = jwt.sign(
  { userId: user._id },
  'secret'  // ❌ Too weak, crackable
);

// ❌ YANLIŞ - No expiration
const token = jwt.sign(
  { userId: user._id },
  process.env.JWT_SECRET
  // ❌ Missing expiresIn, token never expires
);

// ❌ YANLIŞ - Too long expiration
const token = jwt.sign(
  { userId: user._id },
  process.env.JWT_SECRET,
  { expiresIn: '365d' }  // ❌ Too long, compromised token risky
);
```

**Önerilen Expiration:**
- Access token: 15 minutes - 1 hour
- Refresh token: 7 days - 30 days
- Bu proje: 7 days (simple implementation)

---

### 3. Input Validation

#### ✅ YAP: Joi Validation Kullan

```typescript
// ✅ DOĞRU - Joi schema validation
export const postSchema = Joi.object({
  title: Joi.string()
    .min(3)
    .max(200)
    .required()
    .messages({
      'string.empty': 'Title cannot be empty',
      'string.min': 'Title must be at least 3 characters',
      'string.max': 'Title cannot exceed 200 characters',
    }),

  content: Joi.object({
    json: Joi.object().required(),
    html: Joi.string().max(100000).required(),  // Max 100KB
  }).required(),

  excerpt: Joi.string()
    .min(10)
    .max(500)
    .required(),

  tags: Joi.array()
    .items(Joi.string().max(50))
    .max(10)  // Max 10 tags
    .optional(),

  locale: Joi.string()
    .valid('tr', 'en')
    .required(),

  status: Joi.string()
    .valid('draft', 'published')
    .required(),
});

// Route'da kullan
router.post('/', protect, validate(postSchema), createPost);
```

#### ❌ YAPMA: Validation Yok

```typescript
// ❌ YANLIŞ - No validation
export const createPost = async (req, res) => {
  const { title, content } = req.body;  // ❌ No validation

  const post = await Post.create({
    title,  // Could be empty, too long, or malicious
    content,
  });

  res.json(post);
};

// ❌ YANLIŞ - Manual validation (insufficient)
if (!title || title.length < 3) {
  return res.status(400).json({ error: 'Invalid title' });
}
// ❌ Missing XSS protection, SQL injection, etc.
```

**XSS Koruma:**
```typescript
// ✅ DOĞRU - HTML sanitization
import DOMPurify from 'isomorphic-dompurify';

const sanitizedHtml = DOMPurify.sanitize(userInputHtml);

post.content.html = sanitizedHtml;
```

---

### 4. SQL/NoSQL Injection

#### ✅ YAP: Parameterized Queries

```typescript
// ✅ DOĞRU - Mongoose parameterized
const post = await Post.findById(req.params.id);  // Safe
const posts = await Post.find({ locale: req.query.locale });  // Safe

// ✅ DOĞRU - Type casting
const postId = new mongoose.Types.ObjectId(req.params.id);
const post = await Post.findById(postId);
```

#### ❌ YAPMA: User Input Doğrudan Query'de

```typescript
// ❌ YANLIŞ - NoSQL injection riski
const query = JSON.parse(req.query.filter);  // ❌ DANGER
const posts = await Post.find(query);

// Attacker input: {"$ne": null}
// Result: Returns all posts (bypass filter)

// ❌ YANLIŞ - String concatenation
const query = `{ "_id": "${req.params.id}" }`;
const post = await Post.findOne(JSON.parse(query));

// Attacker input: 5f9d; return db.users.find({})
// Result: Returns all users
```

---

### 5. File Upload Güvenliği

#### ✅ YAP: Multer ile Güvenli Upload

```typescript
// ✅ DOĞRU - Multer configuration
import multer from 'multer';

// File filter
const fileFilter = (req: any, file: any, cb: any) => {
  const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

// Storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/');
  },

  filename: (req, file, cb) => {
    // Unique filename: timestamp + random string
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = file.originalname.split('.').pop();
    cb(null, `${file.fieldname}-${uniqueSuffix}.${ext}`);
  },
});

// Middleware
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024,  // 5MB
  },
});
```

**Ekstra Güvenlik Önlemleri:**
```typescript
// ✅ DOĞRU - File validation
import path from 'path';

export const validateImageFile = (file: Express.Multer.File) => {
  // Check file extension
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedExts = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];

  if (!allowedExts.includes(ext)) {
    throw new Error('Invalid file extension');
  }

  // Check MIME type
  const allowedMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
  if (!allowedMimes.includes(file.mimetype)) {
    throw new Error('Invalid MIME type');
  }

  // Check file size (double check)
  if (file.size > 5 * 1024 * 1024) {
    throw new Error('File too large');
  }
};
```

#### ❌ YAPMA: Güvensiz Upload

```typescript
// ❌ YANLIŞ - No file type check
const upload = multer({ dest: 'uploads/' });  // ❌ Accepts any file

// ❌ YANLIŞ - No file size limit
const storage = multer.diskStorage({
  filename: (req, file, cb) => {
    cb(null, file.originalname);  // ❌ Original name (could be malicious)
  },
});

// ❌ YANLIŞ - Executable file upload
// Attacker uploads: shell.php, virus.exe, etc.
```

**Directory Traversal Önleme:**
```typescript
// ❌ YANLIŞ - Path traversal vulnerability
const filename = req.body.filename;  // User input
const filepath = path.join(__dirname, '../public', filename);  // ❌ DANGER

// Attacker input: ../../etc/passwd
// Result: Access to any file on server

// ✅ DOĞRU - Sanitize filename
import { normalize } from 'path';

const filename = normalize(req.body.filename).replace(/^(\.\.(\/|\\|$))+/, '');
const filepath = path.join(__dirname, '../public/uploads', filename);
```

---

### 6. CORS ve Origin Kontrolü

#### ✅ YAP: Whitelist Kullan

```typescript
// ✅ DOĞRU - CORS whitelist
const allowedOrigins = [
  process.env.CORS_ORIGIN,  // http://localhost:3000
  'https://yourdomain.com',
  'https://www.yourdomain.com',
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (mobile apps, curl, etc.)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,  // Allow cookies
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));
```

#### ❌ YAPMA: Her Origin'e İzin Verme

```typescript
// ❌ YANLIŞ - Allow all origins
app.use(cors());  // ❌ DANGER

// ❌ YANLIŞ - Wildcard
app.use(cors({
  origin: '*',  // ❌ Anyone can access
}));

// ❌ YANLIŞ - No origin check
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');  // ❌ DANGER
  next();
});
```

---

### 7. Rate Limiting

#### ✅ YAP: Rate Limit Uygula

```typescript
// ✅ DOĞRU - Rate limiting
import rateLimit from 'express-rate-limit';

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,  // 15 minutes
  max: 100,  // Limit each IP to 100 requests per windowMs
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,  // Return rate limit info in headers
  legacyHeaders: false,
});

// Auth endpoints (stricter)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5,  // 5 login attempts per 15 minutes
  skipSuccessfulRequests: true,  // Don't count successful requests
});

app.use('/api/', apiLimiter);
app.use('/api/auth/', authLimiter);
```

#### ❌ YAPMA: Rate Limit Yok

```typescript
// ❌ YANLIŞ - No rate limiting
app.post('/api/auth/login', login);  // ❌ Brute force attack vulnerability

// Attacker can try 1000+ passwords per second
```

---

### 8. Environment Variables

#### ✅ YAP: .env.example Kullan

```bash
# .env.example (commit to repo)
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/blog_db
JWT_SECRET=your_jwt_secret_change_this_in_production
CORS_ORIGIN=http://localhost:3000

# .env (do NOT commit)
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/blog_db
JWT_SECRET=actual_random_secret_here
CORS_ORIGIN=http://localhost:3000
```

**.gitignore:**
```
.env
.env.local
.env.production
```

#### ❌ YAPMA: Secret'lara Commit Etme

```typescript
// ❌ YANLIŞ - Hardcoded secrets
const JWT_SECRET = 'my_super_secret_key_123';  // ❌ Committed to git

const API_KEY = 'sk-1234567890abcdef';  // ❌ Publicly visible

const MONGO_URI = 'mongodb://user:password@host';  // ❌ Credentials exposed
```

**Secret scanner kullan (önlem):**
```bash
# Git history'de secret ara
git log --all --full-history --source -- "**/package.json" "**/.env*"

# Ya da tool kullan:
# truffleHog, git-secrets, etc.
```

---

### 9. Security Headers

#### ✅ YAP: Helmet.js Kullan

```typescript
// ✅ DOĞRU - Security headers
import helmet from 'helmet';

app.use(helmet());

// Custom configuration
app.use(helmet.contentSecurityPolicy({
  directives: {
    defaultSrc: ["'self'"],
    styleSrc: ["'self'", "'unsafe-inline'"],
    scriptSrc: ["'self'"],
    imgSrc: ["'self'", 'data:', 'https:'],
    connectSrc: ["'self'", 'https:'],
  },
}));

app.use(helmet.hsts({
  maxAge: 31536000,  // 1 year
  includeSubDomains: true,
  preload: true
}));
```

**Headers:**
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security: max-age=31536000`
- `Content-Security-Policy: default-src 'self'`

#### ❌ YAPMA: Header Eksikliği

```typescript
// ❌ YANLIŞ - No security headers
app.use(express.json());  // ❌ Vulnerable to XSS, clickjacking, etc.
```

---

### 10. Error Handling (Information Disclosure)

#### ✅ YAP: Generic Error Messages

```typescript
// ✅ DOĞRU - Generic error (production)
if (process.env.NODE_ENV === 'production') {
  res.status(500).json({
    success: false,
    error: 'Internal server error',  // Generic message
  });
} else {
  res.status(500).json({
    success: false,
    error: error.message,  // Detailed (development only)
    stack: error.stack,
  });
}
```

#### ❌ YAPMA: Detaylı Error (Production)

```typescript
// ❌ YANLIŞ - Detailed error in production
res.status(500).json({
  error: error.message,  // ❌ Exposes internal logic
  stack: error.stack,    // ❌ Exposes file paths
  sql: error.sql,        // ❌ Exposes database queries
});
```

---

## 🔐 Güvenlik Checklist

### Her Deploy Önce:

- [ ] `.env` dosyası `.gitignore`'da mı?
- [ ] JWT_SECRET güçlü mü (64+ chars)?
- [ ] Password hashing aktif mi?
- [ ] Rate limiting aktif mi?
- [ ] CORS whitelist yapıldı mı?
- [ ] Helmet.js security headers aktif mi?
- [ ] File upload validation var mı?
- [ ] Input validation (Joi) var mı?
- [ ] SQL/NoSQL injection koruması var mı?
- [ ] Error messages production'da generic mi?

---

## 🛡️ Güvenlik Test Senaryoları

### Test Cases

```bash
# 1. SQL Injection Attempt
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@--test.com","password":"anything"}'

# Expected: 401 Unauthorized (not bypassed)

# 2. XSS Attempt
curl -X POST http://localhost:5000/api/posts \
  -H "Content-Type: application/json" \
  -d '{"title":"<script>alert(1)</script>","content":{"html":"<script>alert(1)</script>"}}'

# Expected: Sanitized/escaped HTML

# 3. Rate Limit Test
for i in {1..200}; do
  curl http://localhost:5000/api/posts
done

# Expected: 429 Too Many Requests after 100 requests

# 4. File Upload Test
curl -X POST http://localhost:5000/api/upload \
  -F "file=@malicious.php"

# Expected: 400 Bad Request (invalid file type)
```

---

## 📚 Güvenlik Kaynakları

- [OWASP Top 10](https://owasp.org/www-project-top-ten/)
- [Node.js Security Best Practices](https://nodejs.org/en/docs/guides/security/)
- [JWT Best Practices](https://tools.ietf.org/html/rfc8725)
- [CORS Security](https://developer.mozilla.org/en-US/docs/Web/HTTP/CORS)

---

**İlgili Dokümanlar:**
- [backend-rules.md](./backend-rules.md) - Backend kuralları
- [frontend-rules.md](./frontend-rules.md) - Frontend kuralları
