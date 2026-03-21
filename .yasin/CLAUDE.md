# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Architecture Overview

This is a **decoupled full-stack blog application** with a custom Node.js/Express backend and Next.js 15 frontend. The architecture follows a clean separation of concerns with an API-first approach.

- **Backend**: Express API + MongoDB with JWT authentication
- **Frontend**: Next.js 15 App Router with TypeScript, Tailwind CSS, and next-intl for internationalization
- **Communication**: RESTful API with Axios client layer

## Development Commands

### Backend Development
```bash
cd backend
npm install              # Install dependencies
cp .env.example .env     # Configure environment variables
npm run dev              # Start development server with nodemon (port 5000)
npm run build            # Compile TypeScript to dist/
npm start                # Run production server (node dist/server.js)
npm run lint             # Run ESLint
```

### Frontend Development
```bash
cd client
npm install              # Install dependencies
cp .env.example .env.local  # Configure environment variables
npm run dev              # Start Next.js dev server (port 3000)
npm run build            # Production build
npm start                # Run production server
npm run lint             # Run Next.js lint
```

### Prerequisites
- **MongoDB** required on localhost:27017 (or via Docker: `docker run -d -p 27017:27017 --name mongodb mongo:latest`)
- **Backend** runs on port 5000
- **Frontend** runs on port 3000

### Initial Admin Setup
After starting both servers, register the first admin user via API:
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","email":"admin@example.com","password":"your_password"}'
```

Then login at `http://localhost:3000/admin/login`

## Code Architecture

### Backend Structure (`backend/src/`)
- **config/**: Database connection, CORS setup, environment configuration
- **controllers/**: Business logic layer (auth, posts, upload)
- **middleware/**: Authentication (protect, optionalAuth), validation (Joi schemas), file upload (Multer), error handling
- **models/**: Mongoose schemas (Post, Admin) with indexes and validation
- **routes/**: API route definitions with middleware composition
- **utils/**: JWT utilities, custom slugify function with Turkish character support
- **server.ts**: Express application entry point

**Key Backend Patterns:**
- MVC architecture with clear separation of routes, controllers, and models
- Middleware chain: protect → validate → upload → error handler
- Automatic slug generation with locale-based uniqueness
- Draft/published workflow with `publishedDate` auto-set on publish
- Compound indexes on (locale, status, createdAt) for query performance

### Frontend Structure (`client/`)
- **app/[locale]/**: Next.js App Router with internationalized routing
  - **blog/**: Public blog pages (listing, single post, tag filtering)
  - **admin/**: Protected admin dashboard (login, posts management)
  - **layout.tsx**: Locale-specific layout with metadata
  - **page.tsx**: Home page
- **components/**: React components organized by feature
  - **editor/**: TipTap WYSIWYG rich text editor
  - **admin/**: Admin-specific components (PostForm, PostList, ProtectedRoute)
  - **blog/**: Blog components (BlogCard, BlogList, Pagination)
  - **home/**: Home page sections
  - **layout/**: Header, Footer components
  - **seo/**: JsonLd, OpenGraph, TwitterCard components
- **lib/**: Utilities and helpers
  - **api/**: API client layer (auth, posts, upload) with Axios interceptors
  - **cms/**: Content management abstraction layer (transforms backend Post model)
  - **hooks/**: useAuth custom hook for authentication state
  - **i18n/**: Internationalization configuration
  - **utils/**: Utility functions (cn, slugify, etc.)
- **messages/**: i18n JSON files (tr.json, en.json)

**Key Frontend Patterns:**
- Server Components by default, Client Components marked with `'use client'`
- API client layer with automatic token injection via interceptors
- 401 responses auto-redirect to login page
- Protected routes use `<ProtectedRoute>` wrapper component
- Static generation via `generateStaticParams()` for all locales
- CMS-like abstraction in `lib/cms/api-client.ts` transforms backend responses

## Internationalization (i18n)

**Framework**: next-intl 4.8.3
**Locales**: Turkish (tr - default), English (en)
**Routing**: Locale prefix always present (`/tr/*`, `/en/*`)

**Configuration**:
- `lib/i18n/routing.ts`: Locale definitions and navigation helpers
- `middleware.ts`: Locale detection and routing
- `messages/{locale}.json`: Translation files

**Usage**:
- Server components: `await getMessages()` + `<NextIntlClientProvider>`
- Client components: `useTranslations()` hook
- Navigation: Import Link, redirect, useRouter from `lib/i18n/routing`

**Important**: Always use locale-aware navigation from `lib/i18n/routing`, not Next.js default.

## Content Model

**Post Schema** (backend):
```typescript
{
  title: string;
  slug: string;           // Unique per locale, auto-generated from title
  content: {
    json: object;         // TipTap JSON format (editable)
    html: string;         // Rendered HTML
  };
  excerpt: string;
  tags: string[];
  featuredImage?: string; // URL to uploaded image
  locale: 'tr' | 'en';
  status: 'draft' | 'published';
  publishedDate?: Date;   // Auto-set when status changes to published
  createdAt: Date;
  updatedAt: Date;
}
```

**Content Flow**:
1. Admin creates post via TipTap editor (WYSIWYG with JSON + HTML output)
2. Slug auto-generated from title with Turkish character support
3. Draft posts visible only in admin dashboard
4. Published posts appear on public blog
5. Tag-based filtering and pagination (9 posts per page)

## API Endpoints

### Public
- `GET /api/posts` - List published posts (supports ?locale, ?page, ?limit, ?tag)
- `GET /api/posts/slug/:slug` - Get published post by slug (with locale)
- `GET /api/posts/tags` - Get all tags
- `GET /api/posts/:id` - Get post by ID

### Protected (JWT required)
- `POST /api/posts` - Create post
- `PUT /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post
- `POST /api/upload` - Upload image (multipart/form-data, max 5MB)

### Authentication
- `POST /api/auth/register` - Register admin user
- `POST /api/auth/login` - Login (returns JWT token)
- `GET /api/auth/me` - Get current user (protected)

## Authentication Flow

1. User registers via `/api/auth/register` (first-time setup only)
2. Login sends credentials to `/api/auth/login`
3. Backend returns JWT token (valid for 7 days)
4. Frontend stores token in `localStorage`
5. Axios interceptor automatically injects `Authorization: Bearer {token}` header
6. Protected routes verify token via `useAuth()` hook
7. 401 responses clear token and redirect to `/admin/login`

## File Upload

**Backend**: Multer stores uploads in `backend/public/uploads/`
**Supported formats**: JPEG, PNG, GIF, WebP
**Max file size**: 5MB (configurable via `MAX_FILE_SIZE` env var)
**Filename**: Unique generation (timestamp + random string)
**Frontend**: Next.js Image component with optimization

## Environment Variables

**Backend (.env)**:
```
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/blog_db
JWT_SECRET=your_jwt_secret_change_this
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:3000
UPLOAD_DIR=./public/uploads
MAX_FILE_SIZE=5242880
```

**Frontend (.env.local)**:
```
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

## SEO Implementation

- Dynamic metadata per post via `generateMetadata()`
- OpenGraph tags for social sharing
- Twitter Card support
- JSON-LD structured data (BlogPosting schema)
- Language alternates for i18n
- Reading time calculation
- Formatted dates per locale
- Sitemap generation (`app/sitemap.ts`)
- Robots.txt (`app/robots.ts`)

## Design System

**Framework**: Tailwind CSS 4.2.1 with custom HSL color variables
**Theme**: Premium dark theme
**Primary color**: Blue gradient (#60a5fa to #4f46e5)
**Utilities**:
- `.glass`, `.glass-panel`: Glass morphism effects
- `.text-gradient`, `.text-gradient-primary`: Gradient text
- `.prose`: Typography styles for blog content
- `.animate-float`, `.animate-pulse-slow`: Custom animations

**Helper function**: `cn()` from `lib/utils/cn.ts` for conditional classes (clsx + tailwind-merge)

## Code Conventions

- **TypeScript**: Strict mode enabled, interfaces for all data structures
- **File naming**:
  - Components: PascalCase (e.g., `BlogCard.tsx`, `TipTapEditor.tsx`)
  - Utilities: camelCase (e.g., `api-client.ts`, `seo.ts`)
  - Pages: `page.tsx`, `layout.tsx`
- **Component organization**: Feature-based grouping
- **Exports**: Default for components, named for utilities
- **Styling**: Tailwind CSS for all styling, no CSS modules

## Common Development Tasks

### Add New API Endpoint
1. Create controller in `backend/src/controllers/`
2. Add route in `backend/src/routes/` with appropriate middleware
3. Create API client wrapper in `client/lib/api/`
4. Implement UI components

### Add New Locale
1. Update `lib/i18n/routing.ts`: Add locale to array
2. Create `messages/{locale}.json` with translations
3. Update middleware matcher if needed
4. Run `generateStaticParams()` for static generation

### Add New Blog Post Field
1. Update Mongoose schema in `backend/src/models/Post.ts`
2. Update controller validation if needed
3. Update TypeScript interfaces in `client/lib/api/types.ts`
4. Update TipTap editor or form component
5. Update blog display components

## Deployment Notes

- **Backend**: Can be deployed to VPS (DigitalOcean, Linode), Render, Railway, or AWS
- **Frontend**: Vercel recommended (or Netlify, any static hosting)
- **MongoDB**: Use MongoDB Atlas for production, or self-hosted
- **Environment variables**: Must be configured separately for backend and frontend
- **Build artifacts**: Backend compiles to `dist/`, frontend builds to `.next/`

## Important Notes

- Backend serves uploaded images from `/public/uploads/` - ensure this directory exists and is writable
- Slug uniqueness is enforced **per locale** (same slug can exist in both tr and en)
- Draft posts are only accessible via admin dashboard or with optional auth
- JWT token expires after 7 days (configurable via `JWT_EXPIRE`)
- All API requests timeout after 30 seconds
- Frontend uses `localStorage` for token persistence (no cookies)
- Image URLs are stored as relative paths in database, frontend constructs full URLs
