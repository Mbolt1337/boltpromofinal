# BoltPromo - Aggregator Platform for Promo Codes & Deals

<div align="center">

![BoltPromo](https://img.shields.io/badge/BoltPromo-Production%20Ready-success)
![Django](https://img.shields.io/badge/Django-5.0.8-green)
![Next.js](https://img.shields.io/badge/Next.js-15.4.6-black)
![Python](https://img.shields.io/badge/Python-3.13-blue)
![License](https://img.shields.io/badge/License-MIT-yellow)

**Modern promotional codes and deals aggregator with Django REST Framework backend and Next.js frontend**

[Features](#features) • [Tech Stack](#tech-stack) • [Quick Start](#quick-start) • [Documentation](#documentation) • [Deployment](#deployment)

</div>

---

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Quick Start](#quick-start)
- [Documentation](#documentation)
- [Project Structure](#project-structure)
- [API Documentation](#api-documentation)
- [Deployment](#deployment)
- [Contributing](#contributing)
- [License](#license)

---

## ✨ Features

### Core Functionality
- 🎫 **Promo Code Management** - Browse, search, and activate promotional codes
- 🏪 **Store Directory** - Comprehensive catalog of partner stores
- 📊 **Categories & Showcases** - Organized content with custom showcases
- 🔍 **Advanced Search** - Real-time search across stores, categories, and promo codes
- 📱 **Mobile-First Design** - Responsive UI with glassmorphism effects

### User Experience
- ⚡ **Real-time Updates** - Dynamic content loading with ISR (Incremental Static Regeneration)
- 🎨 **Modern UI/UX** - Glassmorphism design with smooth animations
- 🍪 **Cookie Consent** - GDPR-compliant cookie management
- 📈 **Analytics Integration** - Yandex Metrika & Google Analytics support
- 🎯 **Click Tracking** - Detailed analytics for promo code activations

### Technical Features
- 🔒 **Security First** - HSTS, CSP headers, secure cookies, CSRF protection
- ⚡ **Performance** - Redis caching, database query optimization
- 📊 **Admin Dashboard** - Comprehensive admin panel with statistics
- 🔄 **Background Tasks** - Celery for async operations
- 📝 **API Documentation** - Interactive Swagger/ReDoc documentation

---

## 🛠 Tech Stack

### Backend
- **Framework:** Django 5.0.8 + Django REST Framework 3.15.2
- **Database:** PostgreSQL 16+
- **Cache:** Redis 7+
- **Task Queue:** Celery 5.4.0 + Celery Beat
- **API Docs:** drf-spectacular (Swagger/OpenAPI)
- **Admin:** Django Jazzmin (enhanced admin interface)

### Frontend
- **Framework:** Next.js 15.4.6 (App Router)
- **Language:** TypeScript 5
- **Styling:** Tailwind CSS 3.4 + Framer Motion
- **Icons:** Lucide React
- **Notifications:** Sonner (toast notifications)
- **Forms:** React Hook Form

### DevOps & Infrastructure
- **Web Server:** Nginx (SSL, caching, rate limiting)
- **Process Manager:** Systemd (Gunicorn, Celery, Celery Beat)
- **Deployment:** Automated scripts in `/ops`
- **Monitoring:** Sentry (optional), custom health checks
- **SSL:** Let's Encrypt (Certbot)

---

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────┐
│                      Nginx (443)                        │
│  ┌──────────────────┐         ┌──────────────────┐     │
│  │  Frontend (3000) │         │  Backend (8000)  │     │
│  │    Next.js SSR   │◄────────┤    Django API    │     │
│  └──────────────────┘         └──────────────────┘     │
│                                        │                │
└────────────────────────────────────────┼────────────────┘
                                         │
                    ┌────────────────────┼────────────────┐
                    │                    │                │
             ┌──────▼──────┐      ┌─────▼─────┐   ┌─────▼─────┐
             │  PostgreSQL │      │   Redis   │   │  Celery   │
             │  (Database) │      │  (Cache)  │   │ (Workers) │
             └─────────────┘      └───────────┘   └───────────┘
```

---

## 🚀 Quick Start

### Prerequisites

- Python 3.13+
- Node.js 18+ & npm
- PostgreSQL 16+
- Redis 7+

### 1. Clone Repository

```bash
git clone https://github.com/yourusername/boltpromo.git
cd boltpromo
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Create .env from template
cp .env.production.sample .env
# Edit .env and set:
# - DEBUG=True (for development)
# - SECRET_KEY=<generate-new-key>
# - DB credentials
# - REDIS_URL

# Run migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Load initial data (optional)
python manage.py loaddata fixtures/initial_data.json

# Run development server
python manage.py runserver
```

### 3. Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Create .env from template
cp .env.example .env.local
# Edit .env.local:
# NEXT_PUBLIC_API_URL=http://localhost:8000
# NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Run development server
npm run dev
```

### 4. Start Celery (Optional, for background tasks)

```bash
# In backend directory
celery -A config worker -l info
celery -A config beat -l info  # For periodic tasks
```

### 5. Access Application

- **Frontend:** http://localhost:3000
- **Backend API:** http://localhost:8000/api/v1/
- **Admin Panel:** http://localhost:8000/admin
- **API Docs:** http://localhost:8000/api/schema/swagger/

---

## 📚 Documentation

Comprehensive documentation is available in the `/docs` directory:

| Document | Description |
|----------|-------------|
| [PRE_DEPLOY_READINESS.md](docs/PRE_DEPLOY_READINESS.md) | Complete project inventory and features |
| [QUICK_DEPLOY_GUIDE.md](docs/QUICK_DEPLOY_GUIDE.md) | Step-by-step deployment guide |
| [ENV_REFERENCE.md](docs/ENV_REFERENCE.md) | Environment variables documentation |
| [DEPLOYMENT_FINAL_REPORT.md](docs/DEPLOYMENT_FINAL_REPORT.md) | Production readiness report |

---

## 📁 Project Structure

```
boltpromo/
├── backend/                 # Django Backend
│   ├── config/             # Project settings
│   ├── core/               # Main application
│   │   ├── models.py       # Database models
│   │   ├── views.py        # API views
│   │   ├── serializers.py  # DRF serializers
│   │   └── urls.py         # URL routing
│   ├── analytics/          # Analytics app
│   ├── cms/                # CMS app
│   └── manage.py           # Django CLI
│
├── frontend/               # Next.js Frontend
│   ├── src/
│   │   ├── app/            # App Router pages
│   │   ├── components/     # React components
│   │   ├── lib/            # Utilities & API client
│   │   └── styles/         # Global styles
│   ├── public/             # Static assets
│   └── next.config.js      # Next.js config
│
├── deploy/                 # Deployment configs
│   ├── systemd/            # Systemd service files
│   ├── nginx/              # Nginx configuration
│   └── README.md           # Deployment setup guide
│
├── ops/                    # Operational scripts
│   ├── deploy.sh           # Full deployment script
│   ├── backup.sh           # Backup script
│   ├── migrate.sh          # Migration script
│   └── celery_check.sh     # Health check script
│
└── docs/                   # Documentation
    ├── PRE_DEPLOY_READINESS.md
    ├── QUICK_DEPLOY_GUIDE.md
    ├── ENV_REFERENCE.md
    └── DEPLOYMENT_FINAL_REPORT.md
```

---

## 🔌 API Documentation

### Base URL
```
Development: http://localhost:8000/api/v1/
Production:  https://api.yourdomain.ru/api/v1/
```

### Key Endpoints

#### Promo Codes
```http
GET    /promocodes/          # List all promo codes
GET    /promocodes/{id}/     # Get promo code details
POST   /promocodes/{id}/increment-views/  # Track views
```

#### Stores
```http
GET    /stores/              # List all stores
GET    /stores/{slug}/       # Get store details
GET    /stores/{slug}/promocodes/  # Store promo codes
```

#### Categories
```http
GET    /categories/          # List all categories
GET    /categories/{slug}/   # Get category details
GET    /categories/{slug}/promocodes/  # Category promo codes
```

#### Search
```http
GET    /search/              # Global search
```

#### Statistics
```http
GET    /stats/top-promos/    # Top promo codes
GET    /stats/top-stores/    # Top stores
GET    /stats/types-share/   # Offer types distribution
```

### Interactive Documentation

- **Swagger UI:** `/api/schema/swagger/`
- **ReDoc:** `/api/schema/redoc/`
- **OpenAPI Schema:** `/api/schema/`

---

## 🚢 Deployment

### Quick Deployment (Production)

```bash
# 1. Setup environment files
cp backend/.env.production.sample backend/.env
cp frontend/.env.production.sample frontend/.env.production
# Edit both files with production values

# 2. Run deployment script
./ops/deploy.sh
```

### Manual Deployment

See [QUICK_DEPLOY_GUIDE.md](docs/QUICK_DEPLOY_GUIDE.md) for detailed instructions.

### Key Deployment Files

- **`ops/deploy.sh`** - Full deployment automation
- **`deploy/systemd/`** - Systemd service files (Gunicorn, Celery, Celery Beat)
- **`deploy/nginx/`** - Nginx configuration with SSL
- **`ops/backup.sh`** - Database and media backup

### Environment Variables

See [ENV_REFERENCE.md](docs/ENV_REFERENCE.md) for complete documentation.

**Critical Variables:**

Backend:
```bash
DEBUG=False
SECRET_KEY=<generated-key>
ALLOWED_HOSTS=yourdomain.ru,www.yourdomain.ru
DB_PASSWORD=<strong-password>
REDIS_URL=redis://localhost:6379/0
```

Frontend:
```bash
NEXT_PUBLIC_API_URL=https://api.yourdomain.ru
NEXT_PUBLIC_SITE_URL=https://yourdomain.ru
```

---

## 🧪 Testing

### Backend Tests

```bash
cd backend
python manage.py test
```

### Frontend Tests

```bash
cd frontend
npm run test
```

### Linting

```bash
# Backend
cd backend
flake8 .
black --check .

# Frontend
cd frontend
npm run lint
```

---

## 🔒 Security

### Implemented Security Features

- ✅ HSTS headers (31536000 seconds)
- ✅ Content Security Policy (CSP)
- ✅ CSRF protection with secure cookies
- ✅ Session security with secure cookies
- ✅ XSS protection headers
- ✅ Nginx rate limiting
- ✅ SSL/TLS 1.2 & 1.3
- ✅ OCSP stapling
- ✅ Secrets management via environment variables

### Security Checklist

Before deployment, ensure:

- [ ] `DEBUG=False` in production
- [ ] Strong `SECRET_KEY` generated
- [ ] Strong database passwords
- [ ] SSL certificates installed
- [ ] Firewall configured
- [ ] Regular backups enabled
- [ ] Monitoring setup (Sentry)

---

## 📊 Performance

### Optimization Features

- **Backend:**
  - Redis caching (300s default, 1800s for static data)
  - Database query optimization (select_related, prefetch_related)
  - Celery for async tasks
  - Django connection pooling

- **Frontend:**
  - Next.js ISR (Incremental Static Regeneration)
  - Static page generation
  - Image optimization
  - Code splitting
  - Gzip compression (Nginx)

### Expected Metrics

| Metric | Target |
|--------|--------|
| API Response Time | < 200ms |
| Frontend First Load | < 3s |
| Lighthouse Score | > 90 |
| Database Queries | < 50ms avg |

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

### Development Guidelines

- Follow PEP 8 for Python code
- Use TypeScript for all new frontend code
- Write tests for new features
- Update documentation as needed
- Run linters before committing

---

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---

## 👥 Authors

- **Your Name** - *Initial work* - [YourGitHub](https://github.com/yourusername)

---

## 🙏 Acknowledgments

- Django & Django REST Framework communities
- Next.js team for excellent framework
- All open-source contributors

---

## 📞 Support

For support and questions:

- **Documentation:** `/docs` directory
- **Issues:** [GitHub Issues](https://github.com/yourusername/boltpromo/issues)
- **Email:** support@yourdomain.ru

---

<div align="center">

**Built with ❤️ using Django & Next.js**

[⬆ Back to Top](#boltpromo---aggregator-platform-for-promo-codes--deals)

</div>
