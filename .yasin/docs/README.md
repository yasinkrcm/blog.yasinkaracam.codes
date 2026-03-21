# Blog Projesi Dokümantasyonu

Bu dokümantasyon, blog.yasinkaracam.codes projesinin geliştirilmesi, bakımı ve dağıtımı için kapsamlı bir rehber sunar.

## 📋 Proje Özeti

Decoupled (ayrık mimari) full-stack blog uygulaması:
- **Backend**: Node.js/Express API + MongoDB
- **Frontend**: Next.js 15 App Router + TypeScript + Tailwind CSS
- **Authentication**: JWT tabanlı
- **i18n**: Türkçe (varsayılan) ve İngilizce desteği

## 🚀 Hızlı Başlangıç

### Ön Gereksinimler
```bash
# Node.js 18+
node --version

# MongoDB 4.4+
# Docker ile:
docker run -d -p 27017:27017 --name mongodb mongo:latest
```

### Backend Kurulumu
```bash
cd backend
npm install
cp .env.example .env
# .env dosyasını düzenle
npm run dev  # http://localhost:5000
```

### Frontend Kurulumu
```bash
cd client
npm install
cp .env.example .env.local
# .env.local dosyasını düzenle
npm run dev  # http://localhost:3000
```

### İlk Admin Kullanıcısı
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","email":"admin@example.com","password":"your_password"}'
```

Sonra `http://localhost:3000/admin/login` adresinden giriş yapabilirsiniz.

## 📚 Dokümantasyon İçeriği

### Temel Dokümanlar
| Doküman | Açıklama |
|---------|----------|
| [architecture.md](./architecture.md) | Proje mimarisi, backend/frontend yapısı |
| [backend-api.md](./backend-api.md) | Tüm API endpoint'leri ve kullanımları |
| [frontend-structure.md](./frontend-structure.md) | Next.js yapılandırması ve component organizasyonu |
| [i18n-guide.md](./i18n-guide.md) | Uluslararasılaştırma (i18n) implementasyonu |
| [deployment.md](./deployment.md) | Production deployment rehberi |
| [common-tasks.md](./common-tasks.md) | Sık kullanılan geliştirme görevleri |

### Geliştirici Rehberleri
| Doküman | Açıklama |
|---------|----------|
| [testing.md](./testing.md) | Test yazma stratejileri ve örnekleri |
| [contributing.md](./contributing.md) | Projeye katkıda bulunma rehberi |

## 🎯 Teknoloji Stack'i

### Backend
```
Express 4.19.2      // Web framework
MongoDB 4.4+        // NoSQL database
Mongoose 8.7.0      // ODM
JWT 9.0.2           // Authentication
Multer 1.4.5        // File upload
Joi 17.13.3         // Validation
TypeScript 5.6.3    // Language
```

### Frontend
```
Next.js 15.5.12     // React framework
React 18.3.1        // UI library
TypeScript 5.9.3    // Language
Tailwind CSS 4.2.1  // Styling
next-intl 4.8.3     // i18n
TipTap 2.1.13       // Rich text editor
Axios 1.7.9         // HTTP client
```

## 📁 Proje Yapısı

```
blog.yasinkaracam.codes/
├── backend/                 # Express API
│   ├── src/
│   │   ├── config/         # Database, CORS, env config
│   │   ├── controllers/    # Business logic
│   │   ├── middleware/     # Auth, validation, upload
│   │   ├── models/         # Mongoose schemas
│   │   ├── routes/         # API endpoints
│   │   └── utils/          # Utilities
│   └── public/uploads/     # Image uploads
│
├── client/                 # Next.js Frontend
│   ├── app/[locale]/       # i18n routing
│   │   ├── blog/           # Public blog pages
│   │   ├── admin/          # Admin dashboard
│   │   └── layout.tsx      # Root layout
│   ├── components/         # React components
│   ├── lib/                # Utilities & API client
│   └── messages/           # i18n translations
│
└── .yasin/                 # Project documentation (this folder)
    ├── docs/               # Documentation
    └── rules/              # AI development rules
```

## 🔧 Yaygın Komutlar

### Backend
```bash
cd backend
npm run dev      # Development (nodemon)
npm run build    # Compile TypeScript
npm start        # Production
npm run lint     # ESLint check
```

### Frontend
```bash
cd client
npm run dev      # Development (HMR)
npm run build    # Production build
npm start        # Production server
npm run lint     # Next.js lint
```

## 🛡️ Güvenlik Notları

- JWT token'lar 7 gün sonra expires olur
- Tüm password'lar bcrypt ile hash'lenir
- Rate limiting aktif (express-rate-limit)
- CORS konfigüre edilmiş
- File upload max 5MB limit
- Helmet.js security headers aktif

## 🌍 i18n Desteklenen Diller

- `tr` - Türkçe (varsayılan)
- `en` - English

## 📞 Destek

Sorularınız için:
- Issue açın
- Contributing rehberini inceleyin
- `.yasin/rules/` dizinindeki geliştirme kurallarına bakın

---

**Son güncelleme**: 2026-03-21
**Versiyon**: 1.0.0
