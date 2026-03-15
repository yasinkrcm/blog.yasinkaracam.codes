# Full-Stack Blog Application

A decoupled blog application with custom Node.js/Express backend and Next.js 16 frontend.

## Architecture

```
blog.yasinkaracam.codes/
├── backend/           # Node.js/Express API + MongoDB
│   ├── src/
│   │   ├── config/    # Database, CORS, environment
│   │   ├── models/    # Mongoose schemas (Post, Admin)
│   │   ├── controllers/# Business logic
│   │   ├── middleware/# Auth, validation, upload
│   │   ├── routes/    # API endpoints
│   │   └── utils/     # JWT, slugify
│   ├── public/uploads/# Uploaded images
│   └── package.json
│
└── client/            # Next.js 16 frontend
    ├── app/[locale]/
    │   ├── blog/      # Public blog pages
    │   └── admin/     # Admin dashboard
    ├── components/
    │   ├── editor/    # TipTap editor
    │   ├── admin/     # Admin components
    │   └── blog/      # Blog components
    ├── lib/
    │   ├── api/       # API client layer
    │   └── hooks/     # Custom React hooks
    └── package.json
```

## Quick Start

### Prerequisites
- Node.js 18+
- MongoDB 4.4+

### 1. Start MongoDB

```bash
# Using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Or local installation
mongod
```

### 2. Start Backend

```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

Backend runs on `http://localhost:5000`

### 3. Start Frontend

```bash
cd client
npm install
cp .env.example .env.local
npm run dev
```

Frontend runs on `http://localhost:3000`

### 4. Setup Admin

First, register an admin user via API:

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","email":"admin@example.com","password":"your_password"}'
```

Then login at `http://localhost:3000/admin/login`

## Features

- ✅ Custom Node.js/Express backend with MongoDB
- ✅ Next.js 16 frontend with App Router
- ✅ TipTap WYSIWYG editor for rich text content
- ✅ JWT authentication
- ✅ Image upload system
- ✅ SEO optimization (meta tags, OG, JSON-LD)
- ✅ Bilingual support (Turkish/English)
- ✅ Admin dashboard
- ✅ Draft/Published status
- ✅ Tag system

## Documentation

For detailed implementation guide, see [IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md)

## API Endpoints

### Public
- `GET /api/posts` - List all published posts
- `GET /api/posts/slug/:slug` - Get post by slug
- `GET /api/posts/tags` - Get all tags

### Protected (JWT required)
- `POST /api/posts` - Create post
- `PUT /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post
- `POST /api/upload` - Upload image

### Auth
- `POST /api/auth/register` - Register admin
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user

## Tech Stack

**Backend:**
- Node.js + Express
- MongoDB + Mongoose
- JWT authentication
- Multer for file uploads
- Joi for validation

**Frontend:**
- Next.js 16 (App Router)
- React 19
- TipTap editor
- Axios
- Tailwind CSS
- next-intl for i18n

## Deployment

### Backend
- VPS (DigitalOcean, Linode)
- Render, Railway
- AWS, Azure

### Frontend
- Vercel (recommended)
- Netlify
- Any static hosting

## License

ISC
