# Quick Reference Card

## Development Commands

### Backend (Port 5000)
```bash
cd backend
npm run dev          # Start development server
npm run build        # Compile TypeScript
npm start            # Run production server
npm run seed:admin   # Create admin user
npm run lint         # Run ESLint
```

### Frontend (Port 3000)
```bash
cd client
npm run dev          # Start Next.js dev server
npm run build        # Production build
npm start            # Run production server
npm run lint         # Run Next.js lint
```

### PM2 Commands
```bash
pm2 start ecosystem.config.js    # Start all apps
pm2 stop all                    # Stop all apps
pm2 restart all                 # Restart all apps
pm2 delete all                  # Remove all apps
pm2 status                      # Show app status
pm2 logs                        # Show all logs
pm2 logs blog-backend           # Show backend logs
pm2 logs blog-frontend          # Show frontend logs
pm2 monit                       # Real-time monitoring
pm2 save                        # Save process list
pm2 startup                     # Auto-start on system boot
```

### Nginx Commands
```bash
sudo nginx -t                   # Test configuration
sudo systemctl reload nginx     # Reload configuration
sudo systemctl restart nginx    # Restart nginx
sudo systemctl status nginx     # Check status
sudo tail -f /var/log/nginx/error.log    # View error logs
```

### Database Commands
```bash
# MongoDB backup
mongodump --uri="mongodb://admin:password@localhost:27017/blog_db?authSource=admin" --out=./backup

# MongoDB restore
mongorestore --uri="mongodb://admin:password@localhost:27017/blog_db?authSource=admin" ./backup

# MongoDB shell
mongo --host localhost --port 27017 -u admin -p password --authenticationDatabase admin
```

## Admin Credentials

**Email**: yasinkaracam67@gmail.com
**Password**: Ya14sin123
**Username**: yasin

## API Endpoints

### Public
- `GET /api/posts` - List published posts
- `GET /api/posts/slug/:slug` - Get post by slug
- `GET /api/posts/:id` - Get post by ID
- `GET /api/posts/tags` - Get all tags

### Auth
- `POST /api/auth/register` - Register admin
- `POST /api/auth/login` - Login (returns JWT)
- `GET /api/auth/me` - Get current user (requires auth)

### Protected (JWT required)
- `POST /api/posts` - Create post
- `PUT /api/posts/:id` - Update post
- `DELETE /api/posts/:id` - Delete post
- `POST /api/upload` - Upload image

## Environment Variables

### Backend (.env)
```bash
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb://...
JWT_SECRET=<64-byte hex>
JWT_EXPIRE=7d
CORS_ORIGIN=https://yasinkaracam.codes
UPLOAD_DIR=./public/uploads
MAX_FILE_SIZE=5242880
```

### Frontend (.env.local)
```bash
NEXT_PUBLIC_API_URL=https://api.yasinkaracam.codes/api
NEXT_PUBLIC_SITE_URL=https://yasinkaracam.codes
```

## File Structure

```
blog.yasinkaracam.codes/
├── backend/
│   ├── src/
│   │   ├── scripts/
│   │   │   └── seedAdmin.ts          # Admin seeding script
│   │   ├── routes/
│   │   │   └── auth.ts               # With rate limiting
│   │   └── ...
│   ├── dist/                         # Compiled JS
│   ├── public/
│   │   └── uploads/                  # Uploaded images
│   ├── package.json
│   └── .env                          # Backend environment
├── client/
│   ├── app/
│   │   └── layout.tsx                # Updated favicon metadata
│   ├── public/
│   │   ├── favicon.svg               # Original favicon
│   │   ├── icon.svg                  # New 512x512 SVG
│   │   └── generate-favicons.js      # Favicon helper
│   ├── .next/                        # Next.js build
│   └── package.json
├── logs/                             # PM2 logs
├── ecosystem.config.js               # PM2 config
├── nginx.conf                        # Nginx config
└── .gitignore                        # Excludes logs/
```

## Troubleshooting

### Admin not working?
```bash
cd backend
npm run seed:admin
```

### Favicon not showing?
```bash
# Check FAVICON_INSTRUCTIONS.md
cd client/public
# Generate ICO and PNG files
```

### PM2 apps not starting?
```bash
pm2 logs --err           # Check error logs
pm2 show blog-backend    # Check app details
```

### Nginx 502 error?
```bash
pm2 status               # Check if PM2 apps are running
sudo netstat -tlnp | grep -E '3000|5000'  # Check ports
```

### Rate limiting too strict?
Edit `backend/src/routes/auth.ts` and adjust `max` value in `authLimiter`.

### JWT token expired?
Login again at `/admin/login` or extend `JWT_EXPIRE` in `.env`.

## URLs

**Development**:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000
- Admin: http://localhost:3000/tr/admin/login

**Production**:
- Frontend: https://yasinkaracam.codes
- Backend: https://api.yasinkaracam.codes
- Admin: https://yasinkaracam.codes/tr/admin/login

## Security Checklist

- [ ] Strong JWT_SECRET (✓ implemented)
- [ ] Rate limiting on auth (✓ implemented)
- [ ] HTTPS/SSL enabled
- [ ] Firewall configured
- [ ] MongoDB not exposed publicly
- [ ] Strong admin password
- [ ] Regular backups configured
- [ ] PM2 auto-start enabled
- [ ] Log rotation configured

## Deployment Workflow

```bash
# 1. Pull latest code
git pull

# 2. Install dependencies
cd backend && npm install
cd ../client && npm install

# 3. Create admin user (first time only)
cd backend && npm run seed:admin

# 4. Build applications
cd backend && npm run build
cd ../client && npm run build

# 5. Start with PM2
pm2 start ecosystem.config.js
pm2 save

# 6. Configure nginx
sudo cp nginx.conf /etc/nginx/sites-available/blog
# Edit paths in the file
sudo ln -s /etc/nginx/sites-available/blog /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx

# 7. Setup SSL
sudo certbot --nginx -d yasinkaracam.codes -d api.yasinkaracam.codes
```

## Monitoring

```bash
# PM2 monitoring
pm2 monit                 # Real-time dashboard
pm2 list                  # Process list
pm2 info blog-backend     # Detailed info

# Nginx monitoring
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# System monitoring
htop                      # Resource usage
df -h                     # Disk usage
```

## Quick Fixes

### Reset admin password
```bash
cd backend
npm run seed:admin
# (Will skip if exists, so delete admin from DB first)
```

### Clear PM2 logs
```bash
pm2 flush
pm2 reloadLogs
```

### Restart everything
```bash
pm2 restart all
sudo systemctl reload nginx
```

### Check MongoDB connection
```bash
# From backend/.env, copy MONGO_URI
mongo "mongodb://admin:password@host:port/db?authSource=admin"
```

## Documentation

- `IMPLEMENTATION_SUMMARY.md` - What was implemented
- `DEPLOYMENT_GUIDE.md` - Full deployment guide
- `FAVICON_INSTRUCTIONS.md` - Favicon generation guide
- `.yasin/CLAUDE.md` - Project architecture
- `.yasin/docs/` - Detailed documentation

## Git Commands

```bash
git status                    # Check changes
git add .                     # Stage all changes
git commit -m "message"       # Commit
git push                      # Push to remote
```

---

**Last updated**: 2025-03-21
