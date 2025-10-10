# Contributing to BoltPromo

Thank you for your interest in contributing to BoltPromo! This document provides guidelines and instructions for contributing.

## 📋 Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Commit Guidelines](#commit-guidelines)
- [Pull Request Process](#pull-request-process)
- [Testing](#testing)

## 🤝 Code of Conduct

### Our Pledge

We are committed to providing a welcoming and inspiring community for all. Please be respectful and constructive in your interactions.

### Our Standards

- Use welcoming and inclusive language
- Be respectful of differing viewpoints
- Accept constructive criticism gracefully
- Focus on what is best for the community

## 🚀 Getting Started

### 1. Fork the Repository

```bash
# Fork on GitHub, then clone your fork
git clone https://github.com/YOUR_USERNAME/boltpromo.git
cd boltpromo
```

### 2. Set Up Development Environment

Follow the [Quick Start guide](README.md#quick-start) in the main README.

### 3. Create a Branch

```bash
git checkout -b feature/your-feature-name
# or
git checkout -b fix/your-bug-fix
```

Branch naming conventions:
- `feature/` - New features
- `fix/` - Bug fixes
- `docs/` - Documentation changes
- `refactor/` - Code refactoring
- `test/` - Test additions/changes
- `chore/` - Maintenance tasks

## 💻 Development Workflow

### Backend Development

```bash
cd backend
source venv/bin/activate  # Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py migrate

# Run development server
python manage.py runserver

# Run tests
python manage.py test

# Check code style
flake8 .
black --check .
```

### Frontend Development

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm run test

# Lint code
npm run lint

# Type check
npm run type-check
```

## 📝 Coding Standards

### Backend (Python/Django)

#### Code Style

Follow [PEP 8](https://pep8.org/):

```python
# Good
def calculate_discount(price: float, percentage: int) -> float:
    """Calculate discount amount."""
    return price * (percentage / 100)

# Bad
def calcDiscount(p,pct):return p*(pct/100)
```

#### Django Best Practices

- Use Django ORM methods (avoid raw SQL)
- Implement proper model methods
- Use Django forms for validation
- Follow MVT (Model-View-Template) pattern

```python
# Good - Using ORM
Store.objects.filter(is_active=True).select_related('category')

# Bad - Raw SQL
cursor.execute("SELECT * FROM stores WHERE is_active = 1")
```

#### API Design

- Use proper HTTP methods (GET, POST, PUT, DELETE)
- Return appropriate status codes
- Implement pagination for list endpoints
- Use serializers for validation

### Frontend (TypeScript/React)

#### Code Style

- Use TypeScript for all new code
- Follow React best practices
- Use functional components with hooks
- Implement proper error boundaries

```typescript
// Good
interface PromoCodeProps {
  code: string;
  discount: number;
  onActivate: () => void;
}

const PromoCode: React.FC<PromoCodeProps> = ({ code, discount, onActivate }) => {
  return (
    <button onClick={onActivate}>
      {code} - {discount}%
    </button>
  );
};

// Bad
const PromoCode = (props) => {
  return <button onClick={props.onActivate}>{props.code}</button>;
};
```

#### Component Guidelines

- Keep components small and focused
- Extract reusable logic into custom hooks
- Use proper prop types
- Implement loading and error states

### General Guidelines

- Write self-documenting code
- Add comments for complex logic
- Keep functions small and focused
- Follow DRY (Don't Repeat Yourself)
- Use meaningful variable names

## 📤 Commit Guidelines

### Commit Message Format

```
type(scope): subject

body

footer
```

#### Types

- `feat` - New feature
- `fix` - Bug fix
- `docs` - Documentation changes
- `style` - Code style changes (formatting)
- `refactor` - Code refactoring
- `test` - Test additions/changes
- `chore` - Maintenance tasks

#### Examples

```bash
# Good commits
git commit -m "feat(api): add promo code search endpoint"
git commit -m "fix(ui): resolve mobile menu overlap issue"
git commit -m "docs(readme): update installation instructions"

# Bad commits
git commit -m "fixed stuff"
git commit -m "wip"
git commit -m "asdfasdf"
```

### Commit Best Practices

- Commit early and often
- Each commit should be a logical unit
- Write clear, descriptive messages
- Reference issues when applicable (#123)

## 🔍 Pull Request Process

### Before Submitting

1. **Update your fork**
   ```bash
   git fetch upstream
   git rebase upstream/main
   ```

2. **Run tests**
   ```bash
   # Backend
   cd backend && python manage.py test

   # Frontend
   cd frontend && npm run test
   ```

3. **Lint your code**
   ```bash
   # Backend
   cd backend && flake8 . && black .

   # Frontend
   cd frontend && npm run lint
   ```

4. **Update documentation** if needed

### Submitting a Pull Request

1. Push your branch to your fork
   ```bash
   git push origin feature/your-feature-name
   ```

2. Go to GitHub and create a Pull Request

3. Fill out the PR template:
   - Description of changes
   - Related issues
   - Screenshots (if UI changes)
   - Testing performed

4. Wait for review and address feedback

### PR Requirements

- ✅ All tests must pass
- ✅ Code must be linted
- ✅ No merge conflicts
- ✅ Documentation updated (if applicable)
- ✅ At least one approval from maintainer

## 🧪 Testing

### Backend Tests

```bash
cd backend

# Run all tests
python manage.py test

# Run specific app tests
python manage.py test core

# Run specific test case
python manage.py test core.tests.test_models.PromoCodeTestCase

# With coverage
coverage run --source='.' manage.py test
coverage report
```

### Frontend Tests

```bash
cd frontend

# Run all tests
npm run test

# Run in watch mode
npm run test:watch

# With coverage
npm run test:coverage
```

### Writing Tests

#### Backend Test Example

```python
from django.test import TestCase
from core.models import PromoCode

class PromoCodeTestCase(TestCase):
    def setUp(self):
        self.promo = PromoCode.objects.create(
            code="TEST123",
            discount=10
        )

    def test_promo_code_creation(self):
        """Test promo code is created correctly"""
        self.assertEqual(self.promo.code, "TEST123")
        self.assertEqual(self.promo.discount, 10)
```

#### Frontend Test Example

```typescript
import { render, screen } from '@testing-library/react';
import PromoCard from './PromoCard';

describe('PromoCard', () => {
  it('renders promo code', () => {
    render(<PromoCard code="TEST123" discount={10} />);
    expect(screen.getByText('TEST123')).toBeInTheDocument();
  });
});
```

## 📚 Additional Resources

- [Django Documentation](https://docs.djangoproject.com/)
- [Next.js Documentation](https://nextjs.org/docs)
- [React Documentation](https://react.dev/)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

## ❓ Questions?

If you have questions:

1. Check existing [issues](https://github.com/yourusername/boltpromo/issues)
2. Search [discussions](https://github.com/yourusername/boltpromo/discussions)
3. Create a new issue with the `question` label

## 🙏 Thank You!

Your contributions make BoltPromo better for everyone. We appreciate your time and effort! 🎉
