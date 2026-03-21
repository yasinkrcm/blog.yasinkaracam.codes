# Backend API Dokümantasyonu

Bu doküman, blog backend API'sinin tüm endpoint'lerini, request/response formatlarını ve kullanım örneklerini içerir.

## 🔗 Base URL

```
Development:  http://localhost:5000/api
Production:   https://your-domain.com/api
```

## 📋 Genel Bilgiler

### Authentication

API'nin bazı endpoint'leri JWT tabanlı authentication gerektirir.

**Protected Request Format:**
```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Token Alma:**
1. `/api/auth/login` endpoint'inden token alın
2. Token'ı localStorage'da saklayın
3. Her request'te `Authorization` header'a ekleyin

### Response Format

**Success Response:**
```json
{
  "success": true,
  "data": { ... }
}
```

**Error Response:**
```json
{
  "success": false,
  "error": "Error message"
}
```

### Status Codes

| Code | Açıklama |
|------|----------|
| 200 | OK |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 429 | Too Many Requests (Rate limit) |
| 500 | Internal Server Error |

---

## 🔐 Authentication Endpoints

### POST /auth/register

Yeni admin kullanıcı kaydı oluşturur. Genellikle ilk kurulum için kullanılır.

**Endpoint:** `POST /api/auth/register`

**Authentication:** Gerekli değil

**Request Body:**
```json
{
  "username": "admin",
  "email": "admin@example.com",
  "password": "secure_password_123"
}
```

**Validation Rules:**
- `username`: 3-30 karakter, alphanumeric
- `email`: Valid email format
- `password`: Minimum 6 karakter

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
    "username": "admin",
    "email": "admin@example.com",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "error": "Email already registered"
}
```

**cURL Örneği:**
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "admin",
    "email": "admin@example.com",
    "password": "secure_password_123"
  }'
```

---

### POST /auth/login

Kullanıcı girişi yapar ve JWT token döner.

**Endpoint:** `POST /api/auth/login`

**Authentication:** Gerekli değil

**Request Body:**
```json
{
  "email": "admin@example.com",
  "password": "secure_password_123"
}
```

**Success Response (200):**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "data": {
    "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
    "username": "admin",
    "email": "admin@example.com"
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "error": "Invalid credentials"
}
```

**cURL Örneği:**
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@example.com",
    "password": "secure_password_123"
  }'
```

**Frontend Kullanımı:**
```typescript
// Login sonrası token saklama
const response = await authApi.login({ email, password });
localStorage.setItem('token', response.token);
```

---

### GET /auth/me

Mevcut kullanıcının bilgilerini getirir.

**Endpoint:** `GET /api/auth/me`

**Authentication:** Gerekli (JWT token)

**Request Headers:**
```http
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
    "username": "admin",
    "email": "admin@example.com",
    "createdAt": "2024-01-01T00:00:00.000Z"
  }
}
```

**Error Response (401):**
```json
{
  "success": false,
  "error": "Not authorized, token failed"
}
```

---

## 📝 Post Endpoints

### GET /posts

Yayınlanmış blog postlarını listeler. Query parametreleri ile filtreleme yapılabilir.

**Endpoint:** `GET /api/posts`

**Authentication:** Gerekli değil (public)

**Query Parameters:**

| Parametre | Tip | Zorunlu | Default | Açıklama |
|-----------|-----|---------|---------|----------|
| locale | string | Hayır | tr | Dil filtreleri (tr, en) |
| page | number | Hayır | 1 | Sayfa numarası |
| limit | number | Hayır | 9 | Sayfa başına post sayısı |
| tag | string | Hayır | - | Etiket filtreleme |
| status | string | Hayır | published | Durum (draft, published) |

**Request Örnekleri:**

```http
# Türkçe postlar, 1. sayfa
GET /api/posts?locale=tr&page=1

# İngilizce postlar, "react" etiketi ile
GET /api/posts?locale=en&tag=react

# Tüm postlar (admin için)
GET /api/posts?locale=tr&page=1&limit=20
```

**Success Response (200):**
```json
{
  "success": true,
  "count": 15,
  "totalPages": 2,
  "currentPage": 1,
  "data": [
    {
      "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
      "title": "Next.js 15 ile Geliştirme",
      "slug": "nextjs-15-ile-gelistirme",
      "excerpt": "Next.js 15 App Router'ın yenilikleri...",
      "content": {
        "json": { ... },
        "html": "<p>...</p>"
      },
      "tags": ["nextjs", "react", "webdev"],
      "featuredImage": "/uploads/1704110400000-abc123.jpg",
      "locale": "tr",
      "status": "published",
      "publishedDate": "2024-01-01T10:00:00.000Z",
      "readingTime": 5,
      "createdAt": "2024-01-01T08:00:00.000Z",
      "updatedAt": "2024-01-01T08:00:00.000Z"
    }
    // ... daha fazla post
  ]
}
```

**Empty Response (200):**
```json
{
  "success": true,
  "count": 0,
  "data": []
}
```

**Frontend Kullanımı:**
```typescript
// Public blog listing
const posts = await postsApi.getAll({
  locale: 'tr',
  page: 1,
  limit: 9,
  tag: 'react'
});
```

---

### GET /posts/:id

ID ile post getirir.

**Endpoint:** `GET /api/posts/:id`

**Authentication:** Gerekli değil

**URL Parameter:**
- `id`: Post MongoDB ObjectId

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
    "title": "Next.js 15 ile Geliştirme",
    "slug": "nextjs-15-ile-gelistirme",
    "content": {
      "json": { ... },
      "html": "<div>...</div>"
    },
    // ... diğer field'lar
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "error": "Post not found"
}
```

---

### GET /posts/slug/:slug

Slug ile post getirir. Locale parametresi gerekir.

**Endpoint:** `GET /api/posts/slug/:slug`

**Authentication:** Gerekli değil

**URL Parameters:**
- `slug`: Post slug
- `locale`: Locale (tr, en) - query param

**Request Örnek:**
```http
GET /api/posts/slug/nextjs-15-ile-gelistirme?locale=tr
```

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
    "title": "Next.js 15 ile Geliştirme",
    "slug": "nextjs-15-ile-gelistirme",
    "locale": "tr",
    "status": "published",
    // ... diğer field'lar
  }
}
```

**Error Response (404):**
```json
{
  "success": false,
  "error": "Post not found"
}
```

**Frontend Kullanımı:**
```typescript
// Blog post page
const post = await postsApi.getBySlug('nextjs-15-ile-gelistirme', 'tr');
```

---

### GET /posts/tags

Tüm etiketleri listeler.

**Endpoint:** `GET /api/posts/tags`

**Authentication:** Gerekli değil

**Query Parameter:**
- `locale`: Locale filtre (optional)

**Request Örnek:**
```http
GET /api/posts/tags?locale=tr
```

**Success Response (200):**
```json
{
  "success": true,
  "data": ["nextjs", "react", "webdev", "mongodb", "typescript"]
}
```

---

### POST /posts

Yeni blog postu oluşturur.

**Endpoint:** `POST /api/posts`

**Authentication:** Gerekli (JWT token)

**Request Body:**
```json
{
  "title": "Next.js 15 ile Geliştirme",
  "content": {
    "json": {
      "type": "doc",
      "content": [
        {
          "type": "paragraph",
          "content": [
            { "type": "text", "text": "Blog içeriği..." }
          ]
        }
      ]
    },
    "html": "<p>Blog içeriği...</p>"
  },
  "excerpt": "Next.js 15 App Router'ın yenilikleri...",
  "tags": ["nextjs", "react"],
  "featuredImage": "/uploads/1704110400000-abc123.jpg",
  "locale": "tr",
  "status": "published"
}
```

**Field Açıklamaları:**

| Field | Tip | Zorunlu | Açıklama |
|-------|-----|---------|----------|
| title | string | Evet | Post başlığı |
| content.json | object | Evet | TipTap JSON formatı |
| content.html | string | Evet | Render edilmiş HTML |
| excerpt | string | Evet | Kısa özet |
| tags | string[] | Hayır | Etiket listesi |
| featuredImage | string | Hayır | Kapak resmi URL |
| locale | string | Evet | Dil (tr, en) |
| status | string | Evet | Durum (draft, published) |

**Slug Otomatik Oluşturma:**
Slug otomatik olarak title'dan oluşturulur. Eğer aynı slug varsa, sonuna sayı eklenir:
- `nextjs-15` → `nextjs-15-2` → `nextjs-15-3`

**Success Response (201):**
```json
{
  "success": true,
  "data": {
    "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
    "title": "Next.js 15 ile Geliştirme",
    "slug": "nextjs-15-ile-gelistirme",
    "content": { ... },
    "excerpt": "Next.js 15 App Router'ın yenilikleri...",
    "tags": ["nextjs", "react"],
    "featuredImage": "/uploads/1704110400000-abc123.jpg",
    "locale": "tr",
    "status": "published",
    "publishedDate": "2024-01-01T10:00:00.000Z",
    "createdAt": "2024-01-01T08:00:00.000Z"
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "error": "Validation error: Title is required"
}
```

**Frontend Kullanımı:**
```typescript
const newPost = await postsApi.create({
  title: 'Next.js 15 ile Geliştirme',
  content: { json: tipapJSON, html: tipapHTML },
  excerpt: 'Kısa özet...',
  tags: ['nextjs', 'react'],
  locale: 'tr',
  status: 'published'
});
```

---

### PUT /posts/:id

Mevcut postu günceller.

**Endpoint:** `PUT /api/posts/:id`

**Authentication:** Gerekli (JWT token)

**URL Parameter:**
- `id`: Post MongoDB ObjectId

**Request Body:** POST /posts ile aynı

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "_id": "64f1a2b3c4d5e6f7g8h9i0j1",
    "title": "Güncellenmiş Başlık",
    "slug": "nextjs-15-ile-gelistirme",
    "updatedAt": "2024-01-02T10:00:00.000Z",
    // ... diğer güncellenmiş field'lar
  }
}
```

**Frontend Kullanımı:**
```typescript
const updated = await postsApi.update(postId, {
  title: 'Yeni başlık',
  content: { ... },
  status: 'published'
});
```

---

### DELETE /posts/:id

Postu siler.

**Endpoint:** `DELETE /api/posts/:id`

**Authentication:** Gerekli (JWT token)

**URL Parameter:**
- `id`: Post MongoDB ObjectId

**Success Response (200):**
```json
{
  "success": true,
  "data": {}
}
```

**Error Response (404):**
```json
{
  "success": false,
  "error": "Post not found"
}
```

**Frontend Kullanımı:**
```typescript
await postsApi.delete(postId);
```

---

## 📤 Upload Endpoint

### POST /upload

Resim dosyası yükler.

**Endpoint:** `POST /api/upload`

**Authentication:** Gerekli (JWT token)

**Content-Type:** `multipart/form-data`

**Form Data:**
```
image: [file]
```

**Desteklenen Formatlar:**
- JPEG
- PNG
- GIF
- WebP

**Maksimum Dosya Boyutu:** 5MB (configurable)

**Success Response (200):**
```json
{
  "success": true,
  "data": {
    "filename": "1704110400000-abc123.jpg",
    "url": "/uploads/1704110400000-abc123.jpg"
  }
}
```

**Error Response (400):**
```json
{
  "success": false,
  "error": "Only image files are allowed"
}
```

**Error Response (413):**
```json
{
  "success": false,
  "error": "File size exceeds 5MB limit"
}
```

**Frontend Kullanımı:**
```typescript
const formData = new FormData();
formData.append('image', file);

const response = await uploadApi.uploadImage(formData);
const imageUrl = response.url;
```

---

## 🚨 Error Handling

### Rate Limiting

API, 15 dakikada 100 request ile sınırlıdır.

**Rate Limit Response (429):**
```json
{
  "success": false,
  "error": "Too many requests, please try again later"
}
```

### Common Errors

| Status Code | Error Message | Açıklama |
|-------------|---------------|----------|
| 400 | Validation error | Request body validation hatası |
| 401 | Not authorized | Token geçersiz veya eksik |
| 403 | Forbidden | Yetki hatası |
| 404 | Resource not found | Endpoint veya resource bulunamadı |
| 413 | File too large | Dosya boyutu limit aşıldı |
| 429 | Too many requests | Rate limit aşıldı |
| 500 | Server error | Sunucu hatası |

### Error Response Structure

```json
{
  "success": false,
  "error": "Error message description"
}
```

---

## 🔒 Güvenlik Notları

1. **Token Storage**: Token'lar güvenli bir şekilde saklanmalı (localStorage kullanılıyor)
2. **HTTPS**: Production'da mutlaka HTTPS kullanın
3. **CORS**: Backend'de CORS whitelist kullanın
4. **Rate Limiting**: Abuse önleme için aktif
5. **Input Validation**: Joi schema validation aktif
6. **File Upload**: Sadece resim dosyalarına izin veriliyor

---

## 📊 Pagination Pattern

API, list endpoint'lerinde pagination kullanır:

**Request:**
```http
GET /api/posts?page=2&limit=9
```

**Response:**
```json
{
  "success": true,
  "count": 18,           // Toplam post sayısı
  "totalPages": 2,       // Toplam sayfa sayısı
  "currentPage": 2,      // Mevcut sayfa
  "data": [ ... ]        // Post verisi
}
```

**Frontend Pagination:**
```typescript
const totalPages = Math.ceil(count / limit);
const hasNextPage = currentPage < totalPages;
const hasPrevPage = currentPage > 1;
```

---

## 🧪 Testing API

### cURL Examples

**Login ve Token Alma:**
```bash
TOKEN=$(curl -s -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"password"}' \
  | jq -r '.token')
```

**Post Oluşturma:**
```bash
curl -X POST http://localhost:5000/api/posts \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Post",
    "content": {
      "json": {"type": "doc", "content": []},
      "html": "<p>Test content</p>"
    },
    "excerpt": "Test excerpt",
    "locale": "tr",
    "status": "published"
  }'
```

**Resim Yükleme:**
```bash
curl -X POST http://localhost:5000/api/upload \
  -H "Authorization: Bearer $TOKEN" \
  -F "image=@/path/to/image.jpg"
```

---

**İlgili Dokümanlar:**
- [architecture.md](./architecture.md) - Mimari detaylar
- [security-rules.md](../rules/security-rules.md) - Güvenlik kuralları
