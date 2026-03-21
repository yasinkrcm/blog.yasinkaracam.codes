# Deployment Rehberi

Bu doküman, blog projesinin production ortamına nasıl deploy edileceğini açıklar.

## 🎯 Deployment Stratejisi

Proje **decoupled (ayrık)** mimaride olduğu için backend ve frontend ayrı ayrı deploy edilir:

```
┌─────────────────┐         HTTPS API          ┌─────────────────┐
│   Frontend      │ ←─────────────────────→ │    Backend      │
│  (Vercel/Netlify)│                          │   (VPS/Railway) │
└─────────────────┘                          └────────┬────────┘
                                                       │
                                                       ↓
                                                 ┌───────────┐
                                                 │  MongoDB  │
                                                 │   Atlas   │
                                                 └───────────┘
```

## 🚀 Backend Deployment

### Seçenekler

| Platform | Açıklama | Zorluk | Maliyet |
|----------|----------|--------|--------|
| **DigitalOcean** | VPS, tam kontrol | Orta | $5-20/ay |
| **Render** | Managed service | Kolay | $7-25/ay |
| **Railway** | Modern platform | Kolay | $5-20/ay |
| **AWS EC2** | Enterprise | Zor | Değişken |

### 1. DigitalOcean VPS Deployment

#### Önem: Gerekli Araçlar

```bash
# Sunucuya bağlanmak için SSH key oluştur
ssh-keygen -t rsa -b 4096 -C "your_email@example.com"
```

#### Adım 1: Sunucu Kurulumu

```bash
# DigitalOcean'da Ubuntu 22.04 droplet oluştur
# SSH ile bağlan
ssh root@your_server_ip

# System güncelle
apt update && apt upgrade -y

# Node.js 18.x kur
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# MongoDB kur
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | apt-key add -
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu jammy/mongodb-org/6.0 multiverse" | tee /etc/apt/sources.list.d/mongodb-org-6.0.list
apt update
apt install -y mongodb-org

# MongoDB başlat
systemctl start mongod
systemctl enable mongod

# PM2 kur (process manager)
npm install -g pm2
```

#### Adım 2: Backend Deploy

```bash
# Sunucuda
mkdir -p /var/www/backend
cd /var/www/backend

# Kodları upload et (scp veya git)
# Option 1: Git
git clone https://github.com/your-repo/backend.git .

# Option 2: SCP (lokalden)
scp -r backend/* root@your_server_ip:/var/www/backend/

# Dependencies kur
npm install --production

# Environment variables oluştur
cp .env.example .env
nano .env
```

**.env Dosyası (Production):**
```bash
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb://localhost:27017/blog_prod
JWT_SECRET=change_this_to_random_64_char_string
JWT_EXPIRE=7d
CORS_ORIGIN=https://your-domain.com
UPLOAD_DIR=./public/uploads
MAX_FILE_SIZE=5242880
```

#### Adım 3: Build ve Start

```bash
# TypeScript compile
npm run build

# Uploads dizini oluştur
mkdir -p public/uploads

# PM2 ile başlat
pm2 start dist/server.js --name "blog-backend"
pm2 save
pm2 startup
```

#### Adım 4: Nginx Reverse Proxy

```bash
# Nginx kur
apt install -y nginx

# Config oluştur
nano /etc/nginx/sites-available/blog-api
```

**Nginx Config:**
```nginx
server {
    listen 80;
    server_name api.your-domain.com;

    location / {
        proxy_pass http://localhost:5000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }

    # Upload limit
    client_max_body_size 5M;
}
```

```bash
# Site aktifleştir
ln -s /etc/nginx/sites-available/blog-api /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

#### Adım 5: SSL (Let's Encrypt)

```bash
# Certbot kur
apt install -y certbot python3-certbot-nginx

# SSL al
certbot --nginx -d api.your-domain.com

# Auto-renewal
certbot renew --dry-run
```

---

### 2. Render Deployment

#### Adım 1: PostgreSQL

Render'de PostgreSQL yerine **MongoDB Atlas** kullanın (ücretsiz tier mevcut).

#### Adım 2: Render Web Service

1. GitHub reposunu bağla
2. Build Command: `npm install && npm run build`
3. Start Command: `npm start`
4. Environment Variables:
   ```
   NODE_ENV=production
   PORT=5000
   MONGO_URI=mongodb+srv://...
   JWT_SECRET=your_secret
   CORS_ORIGIN=https://your-frontend.vercel.app
   ```

#### Adım 3: Deploy

Render otomatik deploy edecek ve `https://your-api.onrender.com` adresinden erişilebilir olacak.

---

### 3. Railway Deployment

1. Railway'de new project oluştur
2. GitHub repo'sunu bağla
3. Backend dizinini seç
4. Environment variables'ları ekle
5. Deploy!

---

## 🎨 Frontend Deployment

### Vercel Deployment (Önerilen)

#### Adım 1: Vercel CLI Install

```bash
npm install -g vercel
```

#### Adım 2: Build Config

```bash
cd client
vercel
```

**Vercel soracak:**
```
? Set up and deploy “~/client”? [Y/n] y
? Which scope do you want to deploy to? Your Account
? Link to existing project? [y/N] n
? What’s your project’s name? blog-frontend
? In which directory is your code located? ./
? Want to override the settings? [y/N] n
```

#### Adım 3: Environment Variables

Vercel dashboard'da veya CLI ile:

```bash
vercel env add NEXT_PUBLIC_API_URL production
# Değer: https://api.your-domain.com/api

vercel env add NEXT_PUBLIC_SITE_URL production
# Değer: https://your-domain.com
```

#### Adım 4: Deploy

```bash
vercel --prod
```

#### Adım 5: Custom Domain (Opsiyonel)

1. Vercel dashboard → Settings → Domains
2. Domain ekle: `your-domain.com`
3. DNS records güncelle:
   ```
   A    your-domain.com    →    76.76.21.21 (Vercel)
   CNAME www              →    cname.vercel-dns.com
   ```

---

### Netlify Deployment

#### Adım 1: Netlify CLI

```bash
npm install -g netlify-cli
```

#### Adım 2: Build Config

```bash
cd client
netlify init
```

#### Adım 3: netlify.toml

```tomml
[build]
  command = "npm run build"
  publish = ".next"

[build.environment]
  NEXT_PUBLIC_API_URL = "https://api.your-domain.com/api"
  NEXT_PUBLIC_SITE_URL = "https://your-domain.com"

[[plugins]]
  package = "@netlify/plugin-nextjs"
```

#### Adım 4: Deploy

```bash
netlify deploy --prod
```

---

## 🗄️ MongoDB Atlas Setup (Ücretsiz)

### Adım 1: Atlas Account

1. [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)'a git
2. Ücretsiz account oluştur

### Adım 2: Cluster Create

1. "Build a Database" → "Free" (M0 Sandbox)
2. Region seç (en yakın)
3. Cluster name: `blog-prod`

### Adım 3: Database User

1. Database Access → "Create User"
2. Username: `blog-admin`
3. Password: Generate strong password
4. Role: "Read and write to any database"

### Adım 4: Network Access

1. Network Access → "Add IP Address"
2. Option: "Allow Access from Anywhere" (0.0.0.0/0)
3. VPS IP'sini manuel ekle (daha güvenli)

### Adım 5: Connection String

1. "Connect" → "Drivers"
2. Connection string al:
   ```
   mongodb+srv://blog-admin:<password>@blog-prod.xxxxx.mongodb.net/?retryWrites=true&w=majority
   ```

3. Backend `.env`'de kullan:
   ```
   MONGO_URI=mongodb+srv://blog-admin:your_password@blog-prod.xxxxx.mongodb.net/blog_prod
   ```

---

## 🔐 Environment Variables

### Backend (.env)

```bash
# Production
NODE_ENV=production
PORT=5000
MONGO_URI=mongodb+srv://...
JWT_SECRET=random_64_char_string
JWT_EXPIRE=7d
CORS_ORIGIN=https://your-domain.com
UPLOAD_DIR=./public/uploads
MAX_FILE_SIZE=5242880
```

### Frontend (.env.local / Vercel)

```bash
NEXT_PUBLIC_API_URL=https://api.your-domain.com/api
NEXT_PUBLIC_SITE_URL=https://your-domain.com
```

### JWT Secret Generator

```bash
# Güçlü secret oluştur
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

---

## 🔄 CI/CD Pipeline

### GitHub Actions (Backend)

`.github/workflows/backend-deploy.yml`:

```yaml
name: Deploy Backend

on:
  push:
    branches: [main]
    paths:
      - 'backend/**'

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3

      - name: Deploy to Server
        uses: appleboy/ssh-action@master
        with:
          host: ${{ secrets.SERVER_HOST }}
          username: root
          key: ${{ secrets.SSH_PRIVATE_KEY }}
          script: |
            cd /var/www/backend
            git pull origin main
            npm install --production
            npm run build
            pm2 restart blog-backend
```

### GitHub Actions (Frontend)

Vercel otomatik deploy eder, ek config gerekmez.

---

## 📊 Monitoring & Logs

### Backend Monitoring

```bash
# PM2 monitoring
pm2 monit

# Logları görüntüle
pm2 logs blog-backend

# Log dosyaları
tail -f /var/www/backend/logs/combined.log
tail -f /var/www/backend/logs/error.log
```

### Frontend Monitoring

Vercel Analytics kullanın:
1. Vercel dashboard → Analytics
2. Page views, web vitals, etc.

---

## 🧪 Production Testing

### Checklist

- [ ] Backend API çalışıyor (`https://api.your-domain.com/api/posts`)
- [ ] Frontend yükleniyor (`https://your-domain.com`)
- [ ] Auth çalışıyor (login/logout)
- [ ] Post oluşturulabiliyor
- [ ] Resim upload çalışıyor
- [ ] i18n switch çalışıyor (/tr, /en)
- [ ] SEO meta tags doğru
- [ ] SSL sertifikası aktif
- [ ] Console'da hata yok
- [ ] Mobile responsive

### Test Komutları

```bash
# Backend health check
curl https://api.your-domain.com/api/posts

# Frontend test
curl https://your-domain.com

# SSL test
curl -I https://your-domain.com
```

---

## 🚨 Troubleshooting

### Common Issues

#### 1. CORS Error

**Sorun:** Frontend backend'e erişemiyor

**Çözüm:**
```bash
# Backend .env CORS_ORIGIN kontrol et
CORS_ORIGIN=https://your-domain.com

# Nginx config kontrol et
add_header Access-Control-Allow-Origin *;
```

#### 2. 502 Bad Gateway

**Sorun:** Backend çalışmıyor

**Çözüm:**
```bash
# PM2 status kontrol et
pm2 status

# Logları kontrol et
pm2 logs blog-backend

# Backend restart
pm2 restart blog-backend
```

#### 3. Upload Fail

**Sorun:** Resim upload başarısız

**Çözüm:**
```bash
# Uploads dizin izinleri
chmod 755 /var/www/backend/public/uploads

# Nginx client_max_body_size
client_max_body_size 5M;
```

#### 4. MongoDB Connection

**Sorun:** Database bağlanamıyor

**Çözüm:**
```bash
# Atlas IP whitelist kontrol et
# Network Access → IP Address → Add VPS IP
```

---

## 💰 Maliyet Optimizasyonu

### Ücretsiz/Ambalaj Seçenekler

| Hizmet | Ücretsiz Tier | Limit |
|--------|---------------|-------|
| MongoDB Atlas | M0 Sandbox | 512 MB |
| Vercel | Hobby | 100 GB bandwidth |
| Netlify | Free | 100 GB bandwidth |
| GitHub | Private | Unlimited |
| Cloudflare | Free | SSL, CDN |

**Aylık Maliyet:**
- Backend: $5 (DigitalOcean) veya $7 (Render)
- Frontend: $0 (Vercel/Netlify free tier)
- Database: $0 (MongoDB Atlas free tier)
- **Toplam: $0-15/ay**

---

**İlgili Dokümanlar:**
- [architecture.md](./architecture.md) - Mimari
- [common-tasks.md](./common-tasks.md) - Environment setup
