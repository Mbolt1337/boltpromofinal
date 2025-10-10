# GitHub Repository Setup Checklist

Before pushing to GitHub, ensure you've completed all items:

## ✅ Pre-Push Checklist

### 1. Sensitive Data
- [x] `.env` files added to `.gitignore`
- [x] `.env.production` removed from git tracking
- [x] Secrets regenerated (SECRET_KEY, DB_PASSWORD)
- [x] No API keys or passwords in code
- [x] `.env.example` and `.env.production.sample` created with placeholders

### 2. Documentation
- [x] README.md created with project overview
- [x] CONTRIBUTING.md added with contribution guidelines
- [x] LICENSE added (MIT)
- [x] Comprehensive docs in `/docs` directory
- [x] API documentation available

### 3. Code Quality
- [x] ESLint configuration updated
- [x] All critical warnings fixed
- [x] Code follows style guidelines
- [x] No console.log in production code (or disabled via eslint)

### 4. Git Setup
- [x] `.gitignore` properly configured
- [x] Git history is clean
- [ ] No large files (>100MB) in repository
- [ ] Sensitive files not in git history

### 5. Project Structure
- [x] Deployment scripts in `/ops`
- [x] Configuration files in `/deploy`
- [x] Documentation in `/docs`
- [x] Environment templates created

## 📦 Repository Creation

### 1. Create GitHub Repository

```bash
# On GitHub:
# 1. Go to https://github.com/new
# 2. Repository name: boltpromo
# 3. Description: Modern promo codes aggregator with Django & Next.js
# 4. Public or Private (your choice)
# 5. DO NOT initialize with README (we have one)
# 6. Click "Create repository"
```

### 2. Push to GitHub

```bash
# Initialize git (if not already)
git init

# Add remote
git remote add origin https://github.com/YOUR_USERNAME/boltpromo.git

# Check what will be committed
git status

# Stage all files
git add .

# Commit
git commit -m "feat: initial commit with full production setup

- Django 5.0.8 backend with DRF
- Next.js 15.4.6 frontend with TypeScript
- Complete deployment automation (ops/, deploy/)
- Comprehensive documentation (docs/)
- Production-ready configuration
- Security features (HSTS, CSP, secure cookies)
- Performance optimizations (Redis caching, query optimization)

🤖 Generated with Claude Code"

# Push to GitHub
git branch -M main
git push -u origin main
```

## 🔒 Security Review

### Before First Push

1. **Search for Secrets**
   ```bash
   # Search for potential secrets
   grep -r "password" --include="*.py" --include="*.js" --include="*.ts" --exclude-dir=node_modules --exclude-dir=venv
   grep -r "secret" --include="*.py" --include="*.js" --include="*.ts" --exclude-dir=node_modules --exclude-dir=venv
   grep -r "api_key" --include="*.py" --include="*.js" --include="*.ts" --exclude-dir=node_modules --exclude-dir=venv
   ```

2. **Check Git History**
   ```bash
   # Check for .env files in history
   git log --all --full-history -- "**/.env*"

   # If found, remove from history:
   git filter-branch --force --index-filter \
     "git rm --cached --ignore-unmatch backend/.env frontend/.env.production" \
     --prune-empty --tag-name-filter cat -- --all
   ```

3. **Verify .gitignore**
   ```bash
   # Test what will be ignored
   git check-ignore -v backend/.env
   git check-ignore -v frontend/.env.production
   ```

## 🚀 After Push

### 1. Repository Settings

On GitHub repository page:

- **About Section:**
  - Description: "Modern promo codes aggregator with Django & Next.js"
  - Website: (add your site URL when deployed)
  - Topics: `django`, `nextjs`, `typescript`, `promo-codes`, `aggregator`, `rest-api`

- **Security:**
  - Enable "Private vulnerability reporting"
  - Enable "Dependabot alerts"
  - Enable "Dependabot security updates"

### 2. Branch Protection

Settings → Branches → Add rule:

- Branch name pattern: `main`
- ✅ Require pull request reviews before merging
- ✅ Require status checks to pass before merging
- ✅ Require branches to be up to date before merging

### 3. GitHub Actions (Optional)

Create `.github/workflows/ci.yml`:

```yaml
name: CI

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  backend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.13'
      - name: Install dependencies
        run: |
          cd backend
          pip install -r requirements.txt
      - name: Run tests
        run: |
          cd backend
          python manage.py test

  frontend-tests:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Set up Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
      - name: Install dependencies
        run: |
          cd frontend
          npm ci
      - name: Run tests
        run: |
          cd frontend
          npm run test
      - name: Lint
        run: |
          cd frontend
          npm run lint
```

## 📝 Post-Push Tasks

1. **Update URLs in README**
   - Replace `https://github.com/yourusername/boltpromo` with actual URL
   - Replace `yourdomain.ru` with actual domain (when deployed)

2. **Add Team Members** (if applicable)
   - Settings → Collaborators → Add people

3. **Create First Issue**
   - Example: "Setup CI/CD pipeline"
   - Example: "Add integration tests"

4. **Add Project Board** (optional)
   - Projects → New project → Board
   - Add columns: To Do, In Progress, Done

## 🎉 Repository Ready!

Your repository is now:
- ✅ Clean and professional
- ✅ Free of sensitive data
- ✅ Well-documented
- ✅ Ready for collaboration
- ✅ Production-ready

## 📧 Next Steps

1. Share repository with team
2. Set up CI/CD pipeline
3. Deploy to production server
4. Monitor issues and pull requests
5. Keep documentation updated

---

**Created:** 2025-01-10
**For:** BoltPromo GitHub Setup
