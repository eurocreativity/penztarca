# Quick Reference - Pénztárca Project

## 📍 Fontos Linkek

### Production & Deployment
- **Netlify Dashboard:** https://app.netlify.com/projects/penztarca
- **Live Site:** [Netlify URL]

### Backend & Database
- **Supabase Dashboard:** https://supabase.com/dashboard/project/oavxilimosjrodillmea
- **Project ID:** `oavxilimosjrodillmea`

### Repository
- **GitHub Repo:** https://github.com/eurocreativity/penztarca
- **Main Branch:** `main` (auto-deploy)
- **Develop Branch:** `develop`

## 🚀 Gyors Parancsok

### Local Development
```bash
# Start server
python -m http.server 8000
# vagy
npx -y http-server -p 8080 -c-1

# Access
http://localhost:8000/landing.html  # Public
http://localhost:8000/auth.html     # Login
http://localhost:8000/index.html    # App
```

### Git Workflow
```bash
# Status check
git status
git branch --show-current

# Feature branch (IMPORTANT: start with 'claude/' + session ID at end)
git checkout develop
git checkout -b claude/feature-name-<session-id>

# Commit & Push
git add .
git commit -m "Descriptive message"
git push -u origin claude/feature-name-<session-id>

# View history
git log --oneline -5
```

### Database Migrations
```bash
# View migration
cat migrations/add_type_to_categories.sql

# Run in Supabase SQL Editor:
# 1. Go to: https://supabase.com/dashboard/project/oavxilimosjrodillmea
# 2. Click: SQL Editor → + New query
# 3. Paste migration SQL
# 4. Run (Ctrl+Enter)
```

## 🎯 Kulcs Fájlok Lokációja

```
F:\Ai\Penztarca\
├── index.html              # Line 1-800: Main app UI
├── app.js                  # Line 1-1638: FinanceApp class
├── auth.js                 # Line 1-300: AuthManager class
├── supabase-client.js      # Line 1-50: DB connection
└── docs/                   # Moduláris dokumentáció
```

## 🔑 Gyakori Metódusok

### FinanceApp (app.js)
- `init()` - App initialization (line ~150-200)
- `saveExpense()` - Create/update transaction (line ~500-600)
- `deleteExpense(id)` - Delete transaction (line ~650-700)
- `filterExpenses(expenses)` - Apply filters (line ~800-900)
- `updateUI()` - Master refresh (line ~1000-1050)

### AuthManager (auth.js)
- `login(email, password)` - Line ~80-120
- `register(email, password, name)` - Line ~130-170
- `logout()` - Line ~180-200

## 🌍 i18n Pattern
```javascript
// Always use getText() for UI text
this.languages = {
    hu: { key: 'Magyar' },
    en: { key: 'English' }
};

const text = this.getText('key');
```

## ⚡ Token Limit Csökkentés

**Instead of:** `"Olvasd be PROJECT_STATUS.md"`

**Use:** `"Használd a penztarca-project skillt"`

---

**Last Updated:** 2025-11-28
