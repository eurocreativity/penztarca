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
- Live Site: https://penztarca.netlify.app

**Backend:**
- Supabase Dashboard: https://supabase.com/dashboard/project/oavxilimosjrodillmea
- Supabase URL Config: https://supabase.com/dashboard/project/oavxilimosjrodillmea/auth/url-configuration
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
- Verify redirect URLs in Supabase Auth settings (https://supabase.com/dashboard/project/oavxilimosjrodillmea/auth/url-configuration)
- **Required Redirect URLs in Supabase:**
  - `https://penztarca.netlify.app/auth.html`
  - `https://penztarca.netlify.app/auth.html?verify=true`
  - `https://penztarca.netlify.app/index.html`
  - `http://localhost:8000/auth.html`
  - `http://localhost:8000/auth.html?verify=true`
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
- Email Verification: ✅ Fixed (2025-11-30) - Supabase redirect URLs configured
- **Loading States: ✅ IMPLEMENTED (2025-11-30)** - Complete loading indicators

**Latest Changes (2025-12-01):**
- ✅ **TRANSLATION SYSTEM COMPLETE**
  - Added missing translation keys (addRecurring, expenseOnlyTodayError)
  - Implemented dynamic category translation system with getCategoryName()
  - All categories now translate correctly (HU ↔ EN)
  - Form button text changes based on transaction type
  - "Kiadás Hozzáadása" / "Add Expense" for expenses
  - "Bevétel Hozzáadása" / "Add Income" for income
- ✅ **BUG FIXES & IMPROVEMENTS**
  - Fixed ToastManager initialization in auth.js (optional chaining)
  - Fixed setupEventListeners with optional chaining for all DOM elements
  - Added event listeners for transaction type radio buttons
  - Fixed recurring transactions button functionality
- ✅ **DATE VALIDATION FEATURE**
  - Expenses can only be added for today's date
  - Income can be added for future dates (planned salary payments)
  - Tested and working in both languages

**Previous Changes (2025-11-30):**
- ✅ **LOADING STATES IMPLEMENTATION COMPLETE**
  - 240+ lines of CSS spinner animations (light/dark mode)
  - 12 helper functions for loading management
  - 17 async operations enhanced with loading indicators
  - 26 new translation keys (HU + EN)
  - 75+ locations with visual feedback
  - 100% test coverage (89 tests passed)
  - Production ready, zero breaking changes
- Fixed email verification redirect URLs
- Fixed budget input field being blocked by animation overlay
- Improved layout responsiveness

**Loading States Details:**
- **Files Modified:** index.html (+223), auth.html (+107), app.js (+292), auth.js (+101)
- **Features:** Full-page overlay, button spinners, card loading, inline spinners
- **Performance:** 60fps CSS animations, 300ms minimum display time
- **Accessibility:** WCAG AA compliant, screen reader support
- **Documentation:** 5 comprehensive MD files (1,136 lines)

**Next Priorities:**
1. ~~Configure Supabase redirect URLs~~ ✅ DONE
2. ~~Loading states~~ ✅ DONE
3. ~~Complete translation system~~ ✅ DONE
4. ~~Date validation for expenses~~ ✅ DONE
5. Recurring transactions (NEXT)
6. Error toast notifications
7. Budget per category

---

**Last Updated:** 2025-12-01
**Project Version:** 1.4 - Complete i18n & Date Validation
**Current Branch:** develop
**Framework:** Vanilla JS + Supabase + Netlify
**Production URL:** https://penztarca.netlify.app

---

## 🔄 Loading States System (v1.3)

### Overview
Complete loading indicator system providing visual feedback for all async operations.

### Components
1. **CSS Animations** (240+ lines)
   - @keyframes spin, pulse, fadeIn, fadeOut
   - 4 size variants: inline (16px), small (16px), medium (32px), large (48px)
   - Automatic light/dark theme support

2. **HTML Templates**
   - Full-page overlay with custom messages
   - Button loading states
   - Card loading placeholders
   - Inline spinners

3. **Helper Functions** (12 total)
   - `showLoadingOverlay(message, minTime)` - Full-page loading
   - `hideLoadingOverlay(minTime)` - Hide with fade
   - `setButtonLoading(button, isLoading)` - Button spinner
   - `showLoadingWithAnimation(message)` - Animated overlay
   - `hideLoadingWithAnimation()` - Animated hide
   - Plus 7 more utility methods

### Usage Examples
```javascript
// Full-page loading
this.showLoadingOverlay('Adatok betöltése...');
await fetchData();
this.hideLoadingOverlay();

// Button loading
this.setButtonLoading(saveBtn, true);
await saveExpense();
this.setButtonLoading(saveBtn, false);

// With minimum display time (prevents flicker)
this.showLoadingOverlay('Mentés...', 300);
```

### Covered Operations (17 total)
**Auth (8):** Login, Register, Password Reset, Password Update, Logout, Session Check
**Data (9):** App Init, Budget Save, Expense CRUD, Category CRUD, Charts, CSV Import/Export

### Performance
- 60fps GPU-accelerated animations
- 300ms minimum display time (no flicker)
- <16ms DOM updates
- Zero external dependencies

### Documentation Files
- `docs/LOADING_STATES_IMPLEMENTATION.md` - Technical spec
- `docs/SPINNER_QUICK_REFERENCE.md` - Developer guide
- `docs/SPINNER_COMPONENT_SUMMARY.md` - Executive summary
- `docs/TEST_RESULTS.md` - Test report (89 tests, 100% pass)
- `docs/SUPABASE_REDIRECT_URL_FIX.md` - Email verification fix

---

## 🤖 Available Agents (.claude/agents/)

### Coordinator Agent
**File:** `.claude/agents/coordinator.md`
**Purpose:** Orchestrates multi-agent tasks, plans complex features, manages parallel execution
**Use When:** Complex tasks requiring multiple specialists, parallel development, feature planning
**Strengths:** Task decomposition, agent coordination, integration management

### Frontend Developer
**File:** `.claude/agents/frontend-developer.md`
**Purpose:** UI implementation, JavaScript features, DOM manipulation
**Strengths:** Vanilla JS, Tailwind CSS, browser APIs, responsive design

### Backend Developer
**File:** `.claude/agents/backend-developer.md`
**Purpose:** Supabase integration, database operations, RLS policies
**Strengths:** SQL, async operations, data validation, error handling

### QA Tester
**File:** `.claude/agents/qa-tester.md`
**Purpose:** Testing, validation, quality assurance
**Strengths:** Test planning, edge cases, user flows, bug reports

### UI Designer
**File:** `.claude/agents/ui-designer.md`
**Purpose:** Visual design, UX improvements, design systems
**Strengths:** Aesthetics, color theory, accessibility, layout

### DevOps
**File:** `.claude/agents/devops.md`
**Purpose:** Deployment, CI/CD, environment configuration
**Strengths:** Netlify, git workflows, build processes
