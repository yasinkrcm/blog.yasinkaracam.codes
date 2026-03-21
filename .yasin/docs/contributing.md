# Contributing Guide

Bu doküman, blog projesine katkıda bulunmak için gereken adımları ve standartları açıklar.

## 🤝 Katkıda Bulunma

Katkılarınızı bekliyoruz! Bu proje geliştirilmeye açıktır ve her türlü katkıya açıktır.

### Katkı Türleri

- 🐛 Bug fixes
- ✨ Yeni özellikler
- 📝 Dokümantasyon iyileştirmeleri
- 🎨 UI/UX iyileştirmeleri
- ⚡ Performans optimizasyonları
- 🧪 Testler
- 🌍 Translation güncellemeleri

## 🚀 Başlama

### Geliştirme Ortamı Kurulumu

```bash
# Fork ve clone
git clone https://github.com/your-username/blog.yasinkaracam.codes.git
cd blog.yasinkaracam.codes

# Backend kurulumu
cd backend
npm install
cp .env.example .env
# .env dosyasını yapılandır

# Frontend kurulumu
cd ../client
npm install
cp .env.example .env.local
# .env.local dosyasını yapılandır

# Development server'ları başlat
# Terminal 1:
cd backend && npm run dev

# Terminal 2:
cd client && npm run dev
```

### Pre-commit Setup

```bash
# Husky install (varsa)
npm install --save-dev husky lint-staged
npx husky install
```

## 📋 Pull Request Süreci

### 1. Branch Oluşturma

```bash
# Main branch'ı güncelle
git checkout main
git pull upstream main

# Yeni feature branch
git checkout -b feature/your-feature-name

# Branch naming convention:
# feature/     → Yeni özellik
# bugfix/      → Bug düzeltmesi
# hotfix/      → Acil düzeltme
# docs/        → Dokümantasyon
# refactor/    → Refactoring
# test/        → Test ekleme/güncelleme
# style/       → Style/formatting
```

### 2. Değişiklikleri Yap

#### Code Style

- **TypeScript strict mode** kullan
- **ESLint** kurallarına uyu
- **Prettier** (varsa) kullan
- Anlaşılır **değişken isimlendirme**
- **Komenter** ekle (karışık logic için)

**Örnek - İyi Kod:**
```typescript
// ✅ Good
interface PostCreateInput {
  title: string;
  content: Content;
  excerpt: string;
  locale: 'tr' | 'en';
}

export async function createPost(input: PostCreateInput): Promise<Post> {
  // Slug oluştur (Türkçe karakter destekli)
  const slug = await generateUniqueSlug(input.title, input.locale);

  // Post oluştur
  const post = await Post.create({
    ...input,
    slug,
  });

  return post;
}
```

**Örnek - Kötü Kod:**
```typescript
// ❌ Bad
export async function crt(d: any) {  // Açık değil
  const s = slgify(d.t);            // Abbreviated
  const p = await Post.create(d);   // No validation
  return p;
}
```

### 3. Commit Mesajları

**Convention:** [Conventional Commits](https://www.conventionalcommits.org/)

**Format:**
```
<type>(<scope>): <description>

[optional body]

[optional footer]
```

**Types:**
- `feat`: Yeni özellik
- `fix`: Bug düzeltme
- `docs`: Dokümantasyon
- `style`: Format, missing semicolon, etc.
- `refactor`: Refactoring (ne feature ne bugfix)
- `perf`: Performans iyileştirme
- `test`: Test ekleme/güncelleme
- `chore`: Build process, dependencies, etc.

**Örnekler:**
```bash
# Feature
git commit -m "feat(blog): add comment system"

# Bugfix
git commit -m "fix(auth): prevent token leakage in error response"

# Docs
git commit -m "docs(readme): update deployment instructions"

# Refactor
git commit -m "refactor(api): extract validation logic to separate module"

# Breaking change
git commit -m "feat(api)!: change post title to required field

BREAKING CHANGE: post.title is now required"
```

**Multi-line commit:**
```bash
git commit -m "feat(admin): add bulk delete for posts

- Add select all checkbox
- Add bulk delete button
- Confirm before delete
- Show success notification

Closes #123"
```

### 4. Push ve Pull Request

```bash
# Push to fork
git push origin feature/your-feature-name

# GitHub'da Pull Request aç
```

### Pull Request Template

**.github/PULL_REQUEST_TEMPLATE.md:**

```markdown
## Description
Briefly describe the changes made in this PR.

## Type of Change
- [ ] Bug fix (non-breaking change which fixes an issue)
- [ ] New feature (non-breaking change which adds functionality)
- [ ] Breaking change (fix or feature that would cause existing functionality to not work as expected)
- [ ] Documentation update

## Related Issue
Fixes #123
Related to #456

## Changes Made
- Added feature X
- Fixed bug Y
- Updated documentation

## Screenshots (if applicable)
Before:
[Before screenshot]

After:
[After screenshot]

## Testing
- [ ] Unit tests pass
- [ ] Integration tests pass
- [ ] E2E tests pass
- [ ] Manually tested

## Checklist
- [ ] My code follows the style guidelines of this project
- [ ] I have performed a self-review of my own code
- [ ] I have commented my code, particularly in hard-to-understand areas
- [ ] I have made corresponding changes to the documentation
- [ ] My changes generate no new warnings
- [ ] I have tested my changes locally
- [ ] I have added tests that prove my fix is effective or that my feature works
```

## 👨‍⚖️ Code Review Standartları

### Reviewer İçin Checklist

#### Code Quality
- [ ] Kod clean ve readable mı?
- [ ] TypeScript strict mode'a uygun mu?
- [ ] ESLint hatası var mı?
- [ ] Duplicate code var mı?
- [ ] Magic numbers/string'ler var mı?

#### Functionality
- [ ] Feature requirement'ları karşılıyor mu?
- [ ] Edge case'ler handle edildi mi?
- [ ] Error handling var mı?
- [ ] Validation yapılıyor mu?

#### Testing
- [ ] Unit testler var mı?
- [ ] Integration testler var mı?
- [ ] E2E testler gerekli mi?
- [ ] Test coverage yeterli mi?

#### Performance
- [ ] Verimsiz query var mı?
- [ ] Unnecessary re-render var mı?
- [ ] Memory leak riski var mı?

#### Security
- [ ] Input validation yapılıyor mu?
- [ ] Sensitive data log'larda mı?
- [ ] Auth kontrolü var mı?
- [ ] SQL/XSS injection riski var mı?

#### Documentation
- [ ] README güncellendi mi?
- [ ] API dokümantasyonu güncellendi mi?
- [ ] Comments ekleniyor mu?

## 🐛 Bug Report

**Bug report açarken:**

1. **Search existing issues** first
2. **Use issue template**
3. **Provide reproduction steps**
4. **Include environment info**

**Bug Report Template:**

```markdown
## Bug Description
Clear and concise description of the bug.

## Reproduction Steps
1. Go to '...'
2. Click on '....'
3. Scroll down to '....'
4. See error

## Expected Behavior
What you expected to happen.

## Actual Behavior
What actually happened.

## Screenshots
If applicable, add screenshots.

## Environment
- OS: [e.g. Windows 11]
- Browser: [e.g. Chrome 120]
- Node.js: [e.g. 18.19.0]
- Backend version: [e.g. 1.0.0]
- Frontend version: [e.g. 1.0.0]

## Additional Context
Stack traces, logs, etc.
```

## ✨ Feature Request

**Feature request açarken:**

1. **Explain the "why"**, not just the "what"
2. **Provide use cases**
3. **Consider implementation complexity**
4. **Check if it fits project scope**

**Feature Request Template:**

```markdown
## Feature Description
What would you like to be added?

## Problem Statement
What problem does this solve? What pain point does it address?

## Proposed Solution
How do you envision this feature working?

## Alternatives Considered
What other approaches did you consider?

## Additional Context
Mockups, examples, etc.
```

## 📝 Dokümantasyon Katkısı

### Dokümantation Types

1. **Code Comments**
   - Complex logic
   - Non-obvious implementations
   - Public APIs

2. **README Updates**
   - New features
   - Setup changes
   - New commands

3. **API Docs**
   - New endpoints
   - Changed responses

4. **Developer Docs**
   - `.yasin/docs/` updates
   - New guides
   - Updated examples

### Documentation Style

```markdown
## Heading
Description of what this does.

### Usage
\`\`\`typescript
const result = doSomething();
\`\`\`

### Parameters
- \`param1\` - Description

### Returns
- \`Type\` - Description

### Example
\`\`\`typescript
// Clear example
\`\`\`
```

## 🎨 UI/UX Contributions

### Design Guidelines

- **Responsive**: Mobile-first approach
- **Accessible**: WCAG 2.1 AA compliant
- **Consistent**: Follow existing design system
- **Performant**: Optimize images and animations

### Before Submitting UI Changes

- [ ] Test on multiple screen sizes
- [ ] Check color contrast
- [ ] Test keyboard navigation
- [ ] Verify screen reader compatibility
- [ ] Check for performance regression

## 🌍 Translation Contributions

### Adding New Translations

1. Update `messages/tr.json` or `messages/en.json`
2. Follow existing structure
3. Keep translations concise
4. Test in both languages

### Translation Guidelines

- Maintain consistency
- Use context-appropriate language
- Avoid literal translations
- Keep placeholders (e.g., `{count}`)

## 🧪 Testing Contributions

### Test Guidelines

1. **Write tests first** (TDD)
2. **Aim for high coverage** (>80%)
3. **Test edge cases**
4. **Mock external dependencies**
5. **Keep tests fast**

### Test Structure

```typescript
describe('Feature Name', () => {
  describe('Function Name', () => {
    it('should do X when Y', () => {
      // Arrange
      const input = { ... };

      // Act
      const result = functionUnderTest(input);

      // Assert
      expect(result).toBe(expected);
    });
  });
});
```

## 🔄 Git Workflow

### Branching Strategy

```
main (production)
  ↑
  └── develop (staging)
         ↑
         ├── feature/blog-comments
         ├── feature/admin-dashboard
         ├── bugfix/login-error
         └── hotfix/security-patch
```

### Merge Process

1. **Feature branch** → **develop**
   - Pull request
   - Code review
   - CI tests pass
   - Merge with squash

2. **Develop** → **main**
   - Release PR
   - Final review
   - Version bump
   - Tag release
   - Deploy

### Release Process

```bash
# Version bump (npm version)
npm version major|minor|patch

# Push tags
git push origin main --tags

# Deploy (manual or CI)
```

## 📊 Project Metrics

### Goals

| Metric | Target | Current |
|--------|--------|---------|
| Test Coverage | >80% | - |
| Code Quality | A | - |
| Documentation | 100% | - |
| Issue Response | <48h | - |
| PR Review Time | <72h | - |

## 🎯 Recognition

Contributors will be:
- Listed in CONTRIBUTORS.md
- Mentioned in release notes
- Credited in features they contributed to

## 📜 Code of Conduct

### Our Pledge

- Respect differing viewpoints and experiences
- Gracefully accept constructive criticism
- Focus on what is best for the community
- Show empathy towards other community members

### Unacceptable Behavior

- Sexualized language or imagery
- Personal attacks or insulting comments
- Trolling or insulting/derogatory comments
- Public or private harassment
- Publishing others' private information

### Reporting

Email: conduct@example.com
Issue tracker: [Report Issue]

## 📚 Resources

- [Contributing to Open Source on GitHub](https://docs.github.com/en/get-started/quickstart/contributing-to-projects)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [How to Write a Git Commit Message](https://chris.beams.io/posts/git-commit/)

## ❓ Questions?

- GitHub Issues: Technical questions
- GitHub Discussions: General discussion
- Email: maintainer@example.com

---

**Teşekkürler!** 🎉

Katkılarınızı bekliyoruz. Her contribution, bu projeyi daha iyi hale getirir.

---

**İlgili Dokümanlar:**
- [README.md](../README.md) - Ana proje dokümantasyonu
- [common-tasks.md](./common-tasks.md) - Geliştirme görevleri
- [testing.md](./testing.md) - Test rehberi
