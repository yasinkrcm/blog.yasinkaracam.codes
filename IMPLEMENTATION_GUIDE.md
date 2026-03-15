# Full-Stack Blog Implementation Guide

## Overview

This implementation transforms the Contentful-based blog into a custom full-stack application with:

- **Backend**: Node.js/Express + MongoDB
- **Frontend**: Next.js 16 with App Router
- **Editor**: TipTap WYSIWYG editor
- **Features**: Authentication, image upload, SEO, bilingual support (TR/EN)

## Architecture

```
blog.yasinkaracam.codes/
├── backend/                    # Custom Node.js/Express API
│   ├── src/
│   │   ├── config/            # Database, environment config
│   │   ├── models/            # MongoDB schemas (Post, Admin)
│   │   ├── controllers/       # Business logic
│   │   ├── middleware/        # Auth, validation, upload
│   │   ├── routes/            # API endpoints
│   │   ├── utils/             # JWT, slugify utilities
│   │   └── server.ts          # Express app entry point
│   ├── public/uploads/        # Uploaded images
│   └── package.json
│
└── [client root]/              # Next.js frontend
    ├── app/[locale]/
    │   ├── blog/              # Public blog pages
    │   └── admin/             # Admin dashboard (NEW)
    ├── components/
    │   ├── editor/            # TipTap editor (NEW)
    │   ├── admin/             # Admin components (NEW)
    │   └── blog/              # Blog components (updated)
    ├── lib/
    │   ├── api/               # API client layer (NEW)
    │   ├── cms/               # API client wrapper (NEW)
    │   └── hooks/             # Custom React hooks (NEW)
    └── package.json
```

## Setup Instructions

### 1. Backend Setup

```bash
cd backend
npm install
cp .env.example .env
```

Configure `backend/.env`:
```env
NODE_ENV=development
PORT=5000
MONGO_URI=mongodb://localhost:27017/blog_db
JWT_SECRET=your_jwt_secret_here
JWT_EXPIRE=7d
CORS_ORIGIN=http://localhost:3000
```

Start MongoDB:
```bash
# If using local MongoDB
mongod

# Or using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

Start backend server:
```bash
npm run dev
```

The API will be available at `http://localhost:5000/api`

### 2. Frontend Setup

```bash
# Install dependencies (already done)
npm install

# Configure environment
cp .env.local.example .env.local
```

Configure `.env.local`:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

Start frontend:
```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### 3. Initial Setup

**Register First Admin:**
1. Go to `http://localhost:3000/admin/login`
2. Use Postman/curl to register first admin:
```bash
POST http://localhost:5000/api/auth/register
Content-Type: application/json

{
  "username": "admin",
  "email": "admin@example.com",
  "password": "your_password"
}
```
3. Login with those credentials at `/admin/login`

## API Endpoints

### Public Routes
- `GET /api/posts` - List all published posts (paginated, filterable)
- `GET /api/posts/slug/:slug` - Get single post by slug
- `GET /api/posts/tags` - Get all tags

### Protected Routes (JWT required)
- `POST /api/posts` - Create new post
- `PUT /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post
- `POST /api/upload` - Upload image
- `DELETE /api/upload/:filename` - Delete image

### Auth Routes
- `POST /api/auth/register` - Register admin (first time only)
- `POST /api/auth/login` - Login and receive JWT
- `GET /api/auth/me` - Get current user

## Database Schema

### Post Model
```typescript
{
  title: string;
  slug: string;              // Unique, indexed
  content: {
    json: object;            // TipTap JSON for editing
    html: string;            // Rendered HTML for display
  }
  excerpt: string;
  tags: string[];
  featuredImage?: string;    // URL to uploaded image
  locale: 'tr' | 'en';
  status: 'draft' | 'published';
  publishedDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### Admin Model
```typescript
{
  username: string;
  email: string;
  password: string;          // Hashed with bcrypt
  createdAt: Date;
}
```

## Key Features

### 1. TipTap Editor Integration

The TipTap editor stores content in two formats:
- **JSON**: For editing in the admin interface
- **HTML**: For displaying on the public blog

Data flow:
```
User creates content → TipTap Editor (JSON)
                      ↓
                 PostForm Component
                      ↓
           POST /api/posts (with JWT)
                      ↓
              MongoDB (stores JSON + HTML)
                      ↓
        Frontend fetches and displays HTML
```

### 2. Image Upload

- Multer handles file uploads on backend
- Images stored in `backend/public/uploads/`
- Served via Express static files
- Accessible at `http://localhost:5000/uploads/filename`

### 3. Authentication

- JWT-based authentication
- Protected admin routes via `ProtectedRoute` component
- Token stored in localStorage
- Auto-redirect to login if unauthorized

### 4. SEO Features

- Dynamic meta tags per page
- Open Graph tags for social sharing
- JSON-LD structured data (BlogPosting schema)
- Dynamic sitemap.xml generation
- hreflang tags for bilingual support

### 5. Bilingual Support

- Locale-based content filtering (TR/EN)
- URL structure: `/blog` (TR), `/en/blog` (EN)
- Admin can create posts in either language

## Admin Interface

### Dashboard (`/admin/dashboard`)
- View all posts
- Create new post
- Edit existing post
- Delete post

### Create/Edit Post (`/admin/posts/new` or `/admin/posts/:id`)
- Title input
- Excerpt textarea
- Tags input (comma-separated)
- Featured image upload
- Language selector (TR/EN)
- Status selector (Draft/Published)
- TipTap WYSIWYG editor

## Development

### Backend Development

```bash
cd backend
npm run dev        # Start with nodemon + ts-node
npm run build      # Compile TypeScript
npm start          # Run compiled code
```

### Frontend Development

```bash
npm run dev        # Start Next.js dev server
npm run build      # Build for production
npm start          # Run production server
```

## Deployment

### Backend Deployment Options

1. **VPS (DigitalOcean, Linode)**
   - Install Node.js, MongoDB
   - Clone repository
   - Configure PM2 for process management
   - Setup Nginx reverse proxy

2. **Cloud Platforms (Render, Railway)**
   - Connect GitHub repo
   - Configure environment variables
   - Deploy automatically

### Frontend Deployment

1. **Vercel** (Recommended for Next.js)
   - Connect GitHub repo
   - Configure `NEXT_PUBLIC_API_URL` to production backend
   - Auto-deploys on push

2. **Other Platforms**
   - Build: `npm run build`
   - Deploy `.next` folder

## Security Considerations

- JWT_SECRET should be strong and unique in production
- MongoDB should use authentication in production
- Rate limiting implemented on API endpoints
- Input validation on all endpoints
- CORS configured for specific origins
- File upload validation (type, size)
- Helmet.js for security headers

## Troubleshooting

### MongoDB Connection Issues
```bash
# Check if MongoDB is running
mongo --eval "db.adminCommand('ping')"

# Check MongoDB logs
tail -f /var/log/mongodb/mongod.log
```

### CORS Errors
- Verify `CORS_ORIGIN` in backend `.env`
- Check API URL in frontend `.env.local`

### Authentication Issues
- Clear localStorage
- Verify JWT_SECRET matches
- Check token expiration

### Image Upload Issues
- Verify `backend/public/uploads` exists and is writable
- Check MAX_FILE_SIZE configuration
- Verify file type is supported (JPEG, PNG, GIF, WebP)

## Next Steps

1. **Testing**: Write unit and integration tests
2. **CI/CD**: Setup automated testing and deployment
3. **Monitoring**: Add logging and monitoring
4. **Performance**: Implement caching (Redis)
5. **Search**: Add full-text search capability
6. **Comments**: Add comment system
7. **Analytics**: Integrate analytics (Google Analytics, Plausible)

## Support

For issues or questions:
- Check the code comments
- Review MongoDB and Express documentation
- Refer to TipTap documentation for editor issues
