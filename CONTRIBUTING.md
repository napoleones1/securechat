# Contributing to SecureChat

Terima kasih atas minat Anda untuk berkontribusi pada SecureChat! 🎉

## Cara Berkontribusi

### 1. Fork Repository

Fork repository ini ke akun GitHub Anda.

### 2. Clone Repository

```bash
git clone https://github.com/your-username/securechat.git
cd securechat
```

### 3. Buat Branch Baru

```bash
git checkout -b feature/nama-fitur-anda
# atau
git checkout -b fix/nama-bug-yang-diperbaiki
```

### 4. Lakukan Perubahan

- Tulis kode yang bersih dan mudah dibaca
- Ikuti style guide yang ada
- Tambahkan komentar jika diperlukan
- Test perubahan Anda

### 5. Commit Perubahan

```bash
git add .
git commit -m "feat: deskripsi singkat perubahan"
```

Format commit message:
- `feat:` untuk fitur baru
- `fix:` untuk bug fix
- `docs:` untuk perubahan dokumentasi
- `style:` untuk perubahan formatting
- `refactor:` untuk refactoring kode
- `test:` untuk menambah test
- `chore:` untuk maintenance

### 6. Push ke GitHub

```bash
git push origin feature/nama-fitur-anda
```

### 7. Buat Pull Request

- Buka repository di GitHub
- Klik "New Pull Request"
- Pilih branch Anda
- Isi deskripsi lengkap tentang perubahan
- Submit pull request

## Guidelines

### Code Style

#### JavaScript/Node.js
- Gunakan ES6+ syntax
- 2 spaces untuk indentation
- Semicolons required
- Single quotes untuk strings
- Meaningful variable names

#### React/React Native
- Functional components dengan hooks
- PropTypes atau TypeScript untuk type checking
- Destructure props
- Keep components small and focused

### Testing

- Tulis test untuk fitur baru
- Pastikan semua test pass sebelum submit PR
- Test coverage minimal 70%

```bash
# Backend
cd backend && npm test

# Mobile
cd mobile && npm test
```

### Documentation

- Update README jika menambah fitur baru
- Tambahkan JSDoc comments untuk functions
- Update API documentation jika ada perubahan endpoint

### Commit Messages

Good examples:
```
feat: add voice message feature
fix: resolve socket connection issue on mobile
docs: update installation guide
refactor: simplify authentication logic
```

Bad examples:
```
update
fix bug
changes
wip
```

## Apa yang Bisa Dikontribusikan?

### Bug Fixes
- Perbaiki bug yang ada di issues
- Report bug baru dengan detail

### Features
- Implement fitur dari roadmap
- Propose fitur baru (buat issue dulu)

### Documentation
- Perbaiki typo
- Tambah contoh penggunaan
- Translate dokumentasi

### Testing
- Tambah unit tests
- Tambah integration tests
- Improve test coverage

### Performance
- Optimize queries
- Reduce bundle size
- Improve loading time

## Review Process

1. Maintainer akan review PR Anda
2. Mungkin ada request untuk perubahan
3. Setelah approved, PR akan di-merge
4. Kontribusi Anda akan masuk ke changelog

## Code of Conduct

- Be respectful
- Be collaborative
- Be constructive
- No harassment
- No spam

## Questions?

Jika ada pertanyaan, silakan:
- Buat issue dengan label "question"
- Diskusi di pull request
- Contact maintainer

## Recognition

Semua kontributor akan dicantumkan di:
- README.md
- CONTRIBUTORS.md
- Release notes

Terima kasih atas kontribusi Anda! 🙏
