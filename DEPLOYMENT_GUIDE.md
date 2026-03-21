# Deployment Guide

This guide covers deploying the blog application with nginx and PM2.

## Prerequisites

- Server with Ubuntu/Debian Linux
- Node.js 18+ installed
- MongoDB (local or remote)
- Nginx installed
- PM2 installed globally: `npm install -g pm2`

## Step 1: Setup Environment

### 1.1 Clone and Install

```bash
# Clone repository
git clone <your-repo-url>
cd blog.yasinkaracam.codes

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../client
npm install
```

### 1.2 Configure Environment Variables

**Backend** (`backend/.env`):
```bash
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb://admin:password@localhost:27017/blog_db?authSource=admin
JWT_SECRET=<use_the_generated_secret_from_implementation>
JWT_EXPIRE=7d
CORS_ORIGIN=https://yasinkaracam.codes
UPLOAD_DIR=./public/uploads
MAX_FILE_SIZE=5242880
```

**Frontend** (`client/.env.local`):
```bash
NEXT_PUBLIC_API_URL=https://api.yasinkaracam.codes/api
NEXT_PUBLIC_SITE_URL=https://yasinkaracam.codes
```

### 1.3 Create Upload Directory

```bash
cd backend
mkdir -p public/uploads
```

### 1.4 Create Admin User

```bash
cd backend
npm run seed:admin
```

You should see:
```
✓ Admin created successfully:
  Username: yasin
  Email: yasinkaracam67@gmail.com
  Password: Ya14sin123
```

## Step 2: Build Applications

### 2.1 Build Backend

```bash
cd backend
npm run build
```

### 2.2 Build Frontend

```bash
cd client
npm run build
```

## Step 3: Setup PM2

### 3.1 Start Applications

```bash
# From project root
pm2 start ecosystem.config.js
```

### 3.2 Save PM2 Configuration

```bash
pm2 save
pm2 startup
```

Follow the command output to enable PM2 to start on system reboot.

### 3.3 Verify PM2 Status

```bash
pm2 status
```

You should see:
- `blog-backend` - online
- `blog-frontend` - online

### 3.4 View Logs (if needed)

```bash
pm2 logs blog-backend
pm2 logs blog-frontend
```

## Step 4: Configure Nginx

### 4.1 Update Nginx Configuration

Copy `nginx.conf` to nginx sites-available:

```bash
sudo cp nginx.conf /etc/nginx/sites-available/blog
```

### 4.2 Update Paths in Nginx Config

Edit the copied file and update paths:

```bash
sudo nano /etc/nginx/sites-available/blog
```

Replace `/path/to/client` with your actual path, for example:
- `/home/username/blog.yasinkaracam.codes/client/public`
- `/home/username/blog.yasinkaracam.codes/client/.next/static`

### 4.3 Enable Site

```bash
sudo ln -s /etc/nginx/sites-available/blog /etc/nginx/sites-enabled/
```

### 4.4 Test Nginx Configuration

```bash
sudo nginx -t
```

### 4.5 Reload Nginx

```bash
sudo systemctl reload nginx
```

## Step 5: DNS Configuration

### 5.1 Configure DNS Records

Add the following A records to your domain:

| Type | Name | Value |
|------|------|-------|
| A | @ | Your server IP |
| A | api | Your server IP |

### 5.2 Verify DNS

```bash
ping yasinkaracam.codes
ping api.yasinkaracam.codes
```

## Step 6: SSL Certificate (Recommended)

### 6.1 Install Certbot

```bash
sudo apt update
sudo apt install certbot python3-certbot-nginx
```

### 6.2 Obtain SSL Certificate

```bash
sudo certbot --nginx -d yasinkaracam.codes -d api.yasinkaracam.codes
```

Follow the prompts. Certbot will automatically update your nginx configuration.

### 6.3 Verify SSL

Visit `https://yasinkaracam.codes` and check for the lock icon.

## Step 7: Verify Deployment

### 7.1 Check Frontend

- Visit `https://yasinkaracam.codes`
- Check favicon displays in browser tab
- Verify page loads correctly

### 7.2 Check Backend API

```bash
curl https://api.yasinkaracam.codes/api/posts
```

Should return JSON with posts.

### 7.3 Test Admin Login

- Visit `https://yasinkaracam.codes/tr/admin/login`
- Login with: yasinkaracam67@gmail.com / Ya14sin123
- Verify you can access admin dashboard

### 7.4 Check PM2 Processes

```bash
pm2 status
pm2 monit
```

## Common Issues & Solutions

### Issue: Favicon Not Showing

**Solution**: Follow the instructions in `FAVICON_INSTRUCTIONS.md` to generate all required favicon formats (ICO, PNG files).

### Issue: PM2 Processes Not Starting

**Solution**: Check logs:
```bash
pm2 logs --err
```

Common fixes:
- Ensure ports 3000 and 5000 are available
- Check MongoDB connection string
- Verify build artifacts exist (`backend/dist`, `client/.next`)

### Issue: Nginx 502 Bad Gateway

**Solution**:
```bash
# Check if PM2 apps are running
pm2 status

# Check if ports are listening
sudo netstat -tlnp | grep -E '3000|5000'

# Check nginx error logs
sudo tail -f /var/log/nginx/error.log
```

### Issue: MongoDB Connection Failed

**Solution**:
- Verify MongoDB is running: `sudo systemctl status mongodb`
- Check connection string in `.env`
- If remote MongoDB, ensure firewall allows connection
- Check MongoDB credentials

### Issue: Upload Not Working

**Solution**:
```bash
# Ensure upload directory exists and has correct permissions
cd backend
mkdir -p public/uploads
chmod 755 public/uploads
```

## Maintenance

### Update Application

```bash
# Pull latest code
git pull

# Rebuild backend
cd backend
npm install
npm run build

# Rebuild frontend
cd ../client
npm install
npm run build

# Restart PM2
pm2 restart all
```

### View Logs

```bash
# PM2 logs
pm2 logs

# Nginx logs
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

### Backup Database

```bash
# MongoDB backup
mongodump --uri="mongodb://admin:password@localhost:27017/blog_db?authSource=admin" --out=/backup/mongodb/$(date +%Y%m%d)
```

### Restart Services

```bash
# Restart all
pm2 restart all

# Restart specific app
pm2 restart blog-backend
pm2 restart blog-frontend

# Reload nginx
sudo systemctl reload nginx
```

## Security Checklist

- [ ] Strong JWT_SECRET generated and set in .env
- [ ] MongoDB credentials are strong
- [ ] MongoDB is not exposed to public internet
- [ ] SSL/HTTPS is enabled
- [ ] Firewall is configured (ufw)
- [ ] Rate limiting is enabled on auth endpoints
- [ ] Admin password is strong
- [ ] MongoDB backups are configured
- [ ] PM2 startup script is enabled
- [ ] Nginx is properly configured

## Performance Optimization

### Enable Nginx Caching

Add to nginx server block for frontend:

```nginx
# Cache API responses
proxy_cache_path /var/cache/nginx levels=1:2 keys_zone=api_cache:10m max_size=100m inactive=60m;

location /api/ {
    proxy_cache api_cache;
    proxy_cache_valid 200 5m;
    # ... other proxy settings
}
```

### PM2 Cluster Mode

For production, update `ecosystem.config.js`:

```javascript
{
  name: 'blog-backend',
  instances: 'max', // Use all CPU cores
  exec_mode: 'cluster',
  // ... other settings
}
```

## Monitoring

### Install PM2 Plus (Optional)

```bash
pm2 link <public_key> <secret_key>
```

### Basic Monitoring

```bash
pm2 monit
pm2 list
```

## Troubleshooting Commands

```bash
# Check what's listening on ports
sudo netstat -tlnp | grep -E '3000|5000'

# Check PM2 process details
pm2 show blog-backend

# Restart with empty logs
pm2 flush
pm2 restart all

# Remove and recreate PM2 app
pm2 delete blog-backend
pm2 start ecosystem.config.js
```

## Support

For issues, check:
- PM2 logs: `pm2 logs`
- Nginx logs: `/var/log/nginx/error.log`
- Application logs: `./logs/backend-error.log`, `./logs/frontend-error.log`
- MongoDB logs: `/var/log/mongodb/mongod.log`
