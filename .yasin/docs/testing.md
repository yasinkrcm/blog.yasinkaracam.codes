# Testing Rehberi

Bu doküman, blog projesinde test yazma stratejilerini ve örneklerini içerir.

## 🎯 Test Stratejisi

Proje **test piramidi** stratejisini takip eder:

```
        ┌─────────┐
       /   E2E    \      ← En az sayıda (kritik user flows)
      └───────────┘
     /   Integration   \    ← Orta sayıda (API endpoints)
    └────────────────────┘
   /     Unit Tests      \  ← En fazla sayıda (utility functions)
  └───────────────────────┘
```

### Test Katmanları

| Test Tipi | Açıklama | Araçlar | Sayı |
|-----------|----------|---------|------|
| **Unit** | Tekil fonksiyon/test | Jest | Çok |
| **Integration** | API endpoint testleri | Jest + Supertest | Orta |
| **E2E** | Full user flow | Playwright/Cypress | Az |

## 🧪 Unit Testing

### Kurulum

```bash
cd backend
npm install --save-dev jest @types/jest ts-jest
```

### Jest Configuration

`backend/jest.config.js`:

```javascript
module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  roots: ['<rootDir>/src'],
  testMatch: ['**/__tests__/**/*.ts', '**/?(*.)+(spec|test).ts'],
  collectCoverageFrom: [
    'src/**/*.ts',
    '!src/**/*.d.ts',
  ],
};
```

### Unit Test Örneği

#### Utility Function Test

`src/utils/__tests__/slugify.test.ts`:

```typescript
import { generateSlug, generateUniqueSlug } from '../slugify';

describe('generateSlug', () => {
  it('should convert Turkish characters correctly', () => {
    expect(generateSlug('Çalışma Zamanı')).toBe('calisma-zamani');
    expect(generateSlug('İstanbul')).toBe('istanbul');
    expect(generateSlug('şğüçöıŞĞÜÇÖİ')).toBe('sguoci');
  });

  it('should handle multiple spaces', () => {
    expect(generateSlug('hello    world')).toBe('hello-world');
  });

  it('should remove special characters', () => {
    expect(generateSlug('hello@world!')).toBe('hello-world');
  });

  it('should trim dashes from ends', () => {
    expect(generateSlug('---hello---world---')).toBe('hello-world');
  });

  it('should handle empty string', () => {
    expect(generateSlug('')).toBe('');
  });

  it('should handle numbers', () => {
    expect(generateSlug('Next.js 15')).toBe('nextjs-15');
  });
});
```

#### Model Method Test

`src/models/__tests__/Post.test.ts`:

```typescript
import Post from '../Post';

describe('Post Model', () => {
  it('should create post with valid data', () => {
    const postData = {
      title: 'Test Post',
      slug: 'test-post',
      content: {
        json: { type: 'doc', content: [] },
        html: '<p>Test content</p>',
      },
      excerpt: 'Test excerpt',
      locale: 'tr',
      status: 'published',
    };

    const post = new Post(postData);

    expect(post.title).toBe('Test Post');
    expect(post.slug).toBe('test-post');
    expect(post.status).toBe('published');
  });

  it('should fail without required fields', () => {
    const post = new Post({});

    const validationResult = post.validateSync();

    expect(validationResult).toBeDefined();
    expect(validationResult?.errors.title).toBeDefined();
  });
});
```

### Test Çalıştırma

```bash
# Tüm testler
npm test

# Watch mode
npm test -- --watch

# Coverage
npm test -- --coverage

# Sadece belirli dosya
npm test -- slugify.test.ts
```

## 🔗 Integration Testing

### Kurulum

```bash
cd backend
npm install --save-dev supertest mongodb-memory-server
```

### Integration Test Örneği

#### API Endpoint Test

`src/__tests__/api/posts.test.ts`:

```typescript
import request from 'supertest';
import mongoose from 'mongoose';
import app from '../../server';
import Post from '../models/Post';

// Test database
let testPostId: string;

beforeAll(async () => {
  // Test database bağlantısı
  const mongoUri = process.env.MONGO_TEST_URI || 'mongodb://localhost:27017/blog_test';
  await mongoose.connect(mongoUri);
});

afterAll(async () => {
  // Cleanup
  await Post.deleteMany({});
  await mongoose.connection.close();
});

describe('POST /api/posts', () => {
  it('should create a new post', async () => {
    const postData = {
      title: 'Test Post',
      content: {
        json: { type: 'doc', content: [] },
        html: '<p>Test content</p>',
      },
      excerpt: 'Test excerpt',
      locale: 'tr',
      status: 'published',
    };

    const response = await request(app)
      .post('/api/posts')
      .set('Authorization', `Bearer ${getTestToken()}`)
      .send(postData)
      .expect(201);

    expect(response.body.success).toBe(true);
    expect(response.body.data.title).toBe('Test Post');
    expect(response.body.data.slug).toBe('test-post');

    testPostId = response.body.data._id;
  });

  it('should fail without auth token', async () => {
    const response = await request(app)
      .post('/api/posts')
      .send({ title: 'Test' })
      .expect(401);

    expect(response.body.success).toBe(false);
  });
});

describe('GET /api/posts', () => {
  it('should get all posts', async () => {
    const response = await request(app)
      .get('/api/posts')
      .expect(200);

    expect(response.body.success).toBe(true);
    expect(Array.isArray(response.body.data)).toBe(true);
    expect(response.body.data.length).toBeGreaterThan(0);
  });

  it('should filter by locale', async () => {
    const response = await request(app)
      .get('/api/posts?locale=tr')
      .expect(200);

    response.body.data.forEach((post: any) => {
      expect(post.locale).toBe('tr');
    });
  });

  it('should paginate results', async () => {
    const response = await request(app)
      .get('/api/posts?page=1&limit=5')
      .expect(200);

    expect(response.body.data.length).toBeLessThanOrEqual(5);
    expect(response.body.currentPage).toBe(1);
  });
});

describe('GET /api/posts/:id', () => {
  it('should get single post by ID', async () => {
    const response = await request(app)
      .get(`/api/posts/${testPostId}`)
      .expect(200);

    expect(response.body.data._id).toBe(testPostId);
  });

  it('should return 404 for non-existent post', async () => {
    const response = await request(app)
      .get('/api/posts/507f1f77bcf86cd799439011')
      .expect(404);

    expect(response.body.success).toBe(false);
  });
});

describe('PUT /api/posts/:id', () => {
  it('should update post', async () => {
    const updates = {
      title: 'Updated Title',
    };

    const response = await request(app)
      .put(`/api/posts/${testPostId}`)
      .set('Authorization', `Bearer ${getTestToken()}`)
      .send(updates)
      .expect(200);

    expect(response.body.data.title).toBe('Updated Title');
  });
});

describe('DELETE /api/posts/:id', () => {
  it('should delete post', async () => {
    await request(app)
      .delete(`/api/posts/${testPostId}`)
      .set('Authorization', `Bearer ${getTestToken()}`)
      .expect(200);

    // Verify deleted
    await request(app)
      .get(`/api/posts/${testPostId}`)
      .expect(404);
  });
});

// Helper: Test token generator
function getTestToken(): string {
  // Test için geçici JWT token oluştur
  return jwt.sign(
    { userId: 'test-admin-id' },
    process.env.JWT_SECRET || 'test-secret',
    { expiresIn: '1h' }
  );
}
```

### Test Script

`package.json`:

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:integration": "jest --testPathPattern=integration"
  }
}
```

## 🎭 E2E Testing

### Playwright ile E2E

#### Kurulum

```bash
cd client
npm install --save-dev @playwright/test
```

#### Configuration

`client/playwright.config.ts`:

```typescript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  webServer: {
    command: 'npm run dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
});
```

#### E2E Test Örneği

`client/e2e/blog.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';

test.describe('Blog', () => {
  test('should display blog listing', async ({ page }) => {
    await page.goto('/tr/blog');

    // Title kontrol
    await expect(page).toHaveTitle(/Blog/);

    // Blog kartları görünür mü?
    const blogCards = page.locator('article');
    await expect(blogCards.first()).toBeVisible();

    // Sayfa başlığı
    const heading = page.locator('h1');
    await expect(heading).toContainText('Blog Yazıları');
  });

  test('should navigate to single post', async ({ page }) => {
    await page.goto('/tr/blog');

    // İlk post'a tıkla
    const firstPost = page.locator('article').first();
    await firstPost.click();

    // URL kontrol
    await expect(page).toHaveURL(/\/blog\/[\w-]+$/);

    // Post içeriği görünür mü?
    const postContent = page.locator('article');
    await expect(postContent).toBeVisible();
  });

  test('should filter by tag', async ({ page }) => {
    await page.goto('/tr/blog');

    // Etiket butonu
    const tagButton = page.locator('button:has-text("nextjs")').first();
    await tagButton.click();

    // URL kontrol
    await expect(page).toHaveURL(/tag\/nextjs$/);

    // Filtrelenmiş postlar
    const posts = page.locator('article');
    await expect(posts).toHaveCountGreaterThan(0);
  });
});

test.describe('Admin Authentication', () => {
  test('should login successfully', async ({ page }) => {
    await page.goto('/tr/admin/login');

    // Form doldur
    await page.fill('input[name="email"]', 'admin@example.com');
    await page.fill('input[name="password"]', 'password');

    // Submit
    await page.click('button[type="submit"]');

    // Dashboard'a redirect
    await expect(page).toHaveURL('/tr/admin/dashboard');
  });

  test('should show error with invalid credentials', async ({ page }) => {
    await page.goto('/tr/admin/login');

    await page.fill('input[name="email"]', 'wrong@example.com');
    await page.fill('input[name="password"]', 'wrongpassword');
    await page.click('button[type="submit"]');

    // Error message
    const errorMessage = page.locator('text=Invalid credentials');
    await expect(errorMessage).toBeVisible();
  });
});

test.describe('Admin Post Management', () => {
  test.beforeEach(async ({ page }) => {
    // Login öncesi
    await page.goto('/tr/admin/login');
    await page.fill('input[name="email"]', 'admin@example.com');
    await page.fill('input[name="password"]', 'password');
    await page.click('button[type="submit"]');
    await page.waitForURL('/tr/admin/dashboard');
  });

  test('should create new post', async ({ page }) => {
    await page.goto('/tr/admin/posts/new');

    // Form doldur
    await page.fill('input[name="title"]', 'E2E Test Post');
    await page.fill('textarea[name="excerpt"]', 'Test excerpt');

    // TipTap editor'a içerik ekle
    const editor = page.locator('.ProseMirror');
    await editor.fill('Test content');

    // Submit
    await page.click('button[type="submit"]');

    // Success message veya redirect
    await expect(page).toHaveURL(/\/admin\/posts\/[\w]+$/);
  });

  test('should update existing post', async ({ page }) => {
    await page.goto('/tr/admin/dashboard');

    // İlk post'u düzenle
    const editButton = page.locator('button:has-text("Düzenle")').first();
    await editButton.click();

    // Title güncelle
    await page.fill('input[name="title"]', 'Updated Title');
    await page.click('button[type="submit"]');

    // Success kontrol
    const successMessage = page.locator('text=updated');
    await expect(successMessage).toBeVisible();
  });
});
```

#### E2E Test Çalıştırma

```bash
# Tüm testler
npx playwright test

# UI mode (interactive)
npx playwright test --ui

# headed mode (browser visible)
npx playwright test --headed

# Sadece belirli dosya
npx playwright test blog.spec.ts
```

## 📊 Coverage

### Coverage Report

```bash
npm test -- --coverage
```

### Coverage Goals

| Metrik | Hedef | Mevcut |
|--------|-------|--------|
| Statements | %80+ | - |
| Branches | %75+ | - |
| Functions | %80+ | - |
| Lines | %80+ | - |

### Coverage Raporu

Coverage raporu `coverage/` dizininde oluşturulur:

```bash
# HTML report
open coverage/lcov-report/index.html
```

## 🔄 CI/CD Integration

### GitHub Actions

`.github/workflows/test.yml`:

```yaml
name: Test

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main, develop]

jobs:
  backend-test:
    runs-on: ubuntu-latest

    services:
      mongodb:
        image: mongo:latest
        ports:
          - 27017:27017

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        working-directory: ./backend
        run: npm ci

      - name: Run tests
        working-directory: ./backend
        run: npm test
        env:
          MONGO_URI: mongodb://localhost:27017/blog_test
          JWT_SECRET: test_secret

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./backend/coverage/lcov.info

  frontend-test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        working-directory: ./client
        run: npm ci

      - name: Install Playwright
        working-directory: ./client
        run: npx playwright install --with-deps

      - name: Run E2E tests
        working-directory: ./client
        run: npx playwright test

      - name: Upload Playwright report
        uses: actions/upload-artifact@v3
        if: always()
        with:
          name: playwright-report
          path: client/playwright-report/
```

## 🎯 Test Checklist

### Önce Test Yaz

- [ ] Yeni feature için önce test yaz
- [ ] Test fail olmalı (red phase)
- [ ] Minimum kod yaz testi geçirmek için (green phase)
- [ ] Kodu refactor et

### Unit Test Coverage

- [ ] Utility fonksiyonlar
- [ ] Model metodları
- [ ] Controller logic
- [ ] Helper fonksiyonlar

### Integration Test Coverage

- [ ] Tüm API endpoint'ler
- [ ] Authentication flow
- [ ] Authorization checks
- [ ] Validation errors
- [ ] Error handling

### E2E Test Coverage

- [ ] Kritik user flows
  - [ ] Login/logout
  - [ ] Post oluşturma
  - [ ] Post okuma
  - [ ] Admin paneli
- [ ] Cross-browser testing
- [ ] Mobile responsive

## 📚 Best Practices

### ✅ İyi Test Alışkanlıkları

1. **Descriptive test names:** `should return 404 when post not found`
2. **AAA Pattern:** Arrange, Act, Assert
3. **One assertion per test:** Test isolation
4. **Mock external dependencies:** Database, API calls
5. **Test edge cases:** Null, empty, invalid input
6. **Keep tests fast:** Unit tests < 100ms
7. **Independent tests:** Test order bağımsız çalışmalı

### ❌ Kötü Test Alışkanlıkları

1. **Test coupling:** Testler birbirine bağımlı olmamalı
2. **Hardcoded values:** Environment variable kullan
3. **Testing implementation:** Behavior test et, implementation değil
4. **Flaky tests:** Random timeout'lar, race conditions
5. **Too many assertions:** Test spesifik olmalı

### Test Örneği: AAA Pattern

```typescript
describe('Post Creation', () => {
  it('should create post with valid data', async () => {
    // Arrange - Test data hazırla
    const postData = {
      title: 'Test Post',
      content: { json: {}, html: '<p>Test</p>' },
      excerpt: 'Test',
      locale: 'tr',
      status: 'published',
    };

    // Act - İşlemi gerçekleştir
    const response = await request(app)
      .post('/api/posts')
      .send(postData);

    // Assert - Sonucu doğrula
    expect(response.status).toBe(201);
    expect(response.body.data.title).toBe('Test Post');
    expect(response.body.data.slug).toBe('test-post');
  });
});
```

---

**İlgili Dokümanlar:**
- [common-tasks.md](./common-tasks.md) - Geliştirme görevleri
- [backend-api.md](./backend-api.md) - API endpoint'ler
