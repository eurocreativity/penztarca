---
name: penztarca-project
description: Pénztárca personal finance web app context. Use when working on the Penztarca project with Supabase backend, Vanilla JS frontend, and Netlify deployment. Essential for maintaining project knowledge across sessions.
---

# Pénztárca Project Skill

## 🎯 Purpose
This skill provides context for the **Pénztárca** personal finance management web application. Use this when:
- Developing new features for Penztarca
- Fixing bugs or issues
- Modifying existing functionality
- Understanding the codebase structure

## 📍 Quick Access Links

**Production:**
- Netlify: https://app.netlify.com/projects/penztarca
- Live Site: [Netlify generated URL]

**Backend:**
- Supabase: https://supabase.com/dashboard/project/oavxilimosjrodillmea
- Project ID: `oavxilimosjrodillmea`

**Repository:**
- GitHub: https://github.com/eurocreativity/penztarca
- Main: `main` (auto-deploy)
- Develop: `develop`

## 🛠 Tech Stack Summary

**Frontend:** Vanilla JavaScript (ES6+), Tailwind CSS (CDN), Chart.js, Font Awesome
**Backend:** Supabase (PostgreSQL, Auth, Storage)
**Deployment:** Netlify (static hosting, CDN)
**No Build Process:** Browser-native JavaScript only

## 📂 File Structure
```
penztarca/
├── index.html              # Main app (auth required)
├── auth.html              # Login/Register
├── landing.html           # Public landing
├── app.js                 # Main logic (FinanceApp class)
├── auth.js                # Auth logic (AuthManager)
├── supabase-client.js     # Supabase init
├── netlify.toml           # Deploy config
├── docs/                  # Feature documentation
└── migrations/            # SQL migrations
```

## 🗄 Database Schema (Critical)

### Tables
**profiles**: id (UUID), name, budget, language, created_at, updated_at
**categories**: id, user_id, name, color, icon, **type** (expense/income), created_at
**expenses**: id, user_id, amount, category_id, description, date, **type** (expense/income), created_at

### RLS Policy
All tables have Row Level Security. Users can only read/write their own data.

## 🔑 Key Classes & Methods

### FinanceApp Class (app.js)
**Core State:**
- `user`, `profile`, `expenses`, `categories`, `language`, `theme`
- `searchQuery`, `filterType`, `filterCategory`, `filterDateRange` (filters)

**Essential Methods:**
- `init()` - App initialization with session check
- `saveExpense()` - Create/update transaction (expense or income)
- `deleteExpense(id)` - Delete transaction
- `saveCategory()` - Create/update category with type
- `filterExpenses(expenses)` - Apply active filters
- `updateUI()` - Master UI refresh
- `updateRecentExpenses()` - Transaction list with filters
- `getText(key)` - i18n translation helper

### AuthManager Class (auth.js)
- `login()`, `register()`, `logout()`
- Session persistence with retry logic (5 attempts, 800ms intervals)

## 🎨 UI Features

### Recently Implemented (2025-11-28)
✅ **Search & Filter System**
- Real-time text search in descriptions
- Type filter (All/Expenses/Income)
- Category filter (smart dropdown by type)
- Date range filter (Today, Week, Month, Prev Month, Year)
- "Clear Filters" button
- Full i18n support

✅ **Login/Auth Fixes**
- Storage: `window.localStorage` with PKCE flow
- Session check as first step in init()
- Enhanced retry logic (5 attempts)

✅ **Layout Optimizations**
- Firefox fullscreen compatibility
- Responsive design (mobile-first)
- Chart constraints (max 400x400px)

## 🌍 Internationalization

**Supported Languages:** Hungarian (hu), English (en)

**Pattern:**
```javascript
this.languages = {
    hu: { key: 'Magyar szöveg' },
    en: { key: 'English text' }
};

// Usage
getText(key) {
    return this.languages[this.language][key] || key;
}
```

**Always add new UI text to both languages!**

## 💡 Development Guidelines

### Code Style
1. ES6+ only (classes, async/await, arrow functions)
2. No build tools - browser-native JavaScript
3. Tailwind utility classes for styling
4. Hungarian variable names in `languages` object

### Best Practices
1. **Always check auth** before DB operations
2. **Use try-catch** for all async functions
3. **Update local state** after DB changes
4. **Re-render UI** after state updates
5. **Use getText(key)** for all user-facing text
6. **Test both languages** and themes

### Git Workflow
```bash
# Feature branch (must start with 'claude/' and end with session ID)
git checkout develop
git checkout -b claude/feature-name-<session-id>

# Changes
git add .
git commit -m "Descriptive message"
git push -u origin claude/feature-name-<session-id>

# Create PR to develop
```

## ⚠️ Critical Notes

### Type System (IMPORTANT!)
- Both `categories` and `expenses` tables have `type` field
- Values: `'expense'` | `'income'`
- Default: `'expense'` (backward compatibility)
- Filter categories by type when showing dropdown

### Migrations
1. **MUST RUN:** `migrations/add_type_to_categories.sql` (if not done)
2. Run in Supabase SQL Editor
3. Always test on dev first

### Known Limitations
- No offline support (requires internet)
- No real-time sync (manual refresh)
- No recurring transactions
- No multi-currency (HUF only)
- No custom date ranges (only presets)

### Technical Debt
- Supabase credentials hardcoded (move to env vars)
- Loading states missing (HIGH PRIORITY)
- No comprehensive error UI

## 🚀 Common Tasks

### Adding New Transaction Type Feature
1. Update DB schema (migration)
2. Add to `languages` object (both hu/en)
3. Add UI in HTML
4. Add logic in FinanceApp class
5. Update UI methods
6. Test in both languages

### Adding New Filter
1. Add state variable (e.g., `this.filterX`)
2. Update `filterExpenses()` method
3. Add UI control in HTML
4. Add event listener in init()
5. Update `updateFilterCategoryOptions()` if needed
6. Add clear logic in `clearAllFilters()`

### Adding Translation
1. Add key to `this.languages.hu`
2. Add same key to `this.languages.en`
3. Use `this.getText('newKey')` in code
4. Update `updateLanguage()` if needed

## 🐛 Debugging Tips

### Authentication Issues
- Check localStorage: `sb-oavxilimosjrodillmea-auth-token`
- Verify redirect URLs in Supabase Auth settings
- Check retry attempts in auth.js (default: 5)

### Data Not Loading
- Verify RLS policies in Supabase
- Check user session: `supabase.auth.getSession()`
- Confirm user_id matches in tables

### UI Not Updating
- Check if `updateUI()` is called after state change
- Verify element IDs match querySelector targets
- Check browser console for errors

## 📊 Stats Display Logic

**Budget Progress:**
- Shows spent amount vs budget
- Only counts expenses (not income)
- Progress bar color: green → yellow → red

**Balance Calculation:**
- `balance = totalIncome - totalExpenses`
- Separate tracking from budget

**Charts:**
1. **Monthly Trend** (Line): 6 months, expenses vs income
2. **Category Distribution** (Doughnut): Top 5 categories

## 🔧 Local Development

```bash
# Start server
python -m http.server 8000
# or
npx -y http-server -p 8080 -c-1

# Access
http://localhost:8000/landing.html  # Public
http://localhost:8000/auth.html     # Login
http://localhost:8000/index.html    # App (auth required)
```

## 📝 Session Memory Aid

**Current Status:**
- Search & Filter: ✅ Implemented
- Login Issues: ✅ Fixed
- Layout: ✅ Optimized
- CSV Export: ✅ Working
- Budget Input Fix: ✅ Fixed (2025-11-30) - overlay blocking issue resolved

**Latest Changes (2025-11-30):**
- Fixed budget input field being blocked by animation overlay
- Added `pointer-events-none` to pulse animation
- Improved layout responsiveness
- Commit: `d053023` on develop branch

**Next Priorities:**
1. Loading states (HIGH)
2. Error handling UI
3. Recurring transactions
4. Budget per category

---

**Last Updated:** 2025-11-30
**Project Version:** 1.1 - Budget Input Fix
**Current Branch:** develop
**Framework:** Vanilla JS + Supabase + Netlify
