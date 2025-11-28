# PénzTár - Project Status & Development Guide

**Utolsó frissítés:** 2025-11-27
**Jelenlegi verzió:** Income Categories & Chart Visualization - DEPLOYED ✅
**Production Branch:** `master`
**Státusz:** 🟢 Live on Production

---

## 📍 Projekt Elérések

### Production & Deployment
- **Netlify Dashboard:** https://app.netlify.com/projects/penztarca
- **Live Site:** (Netlify által generált URL)
- **Deploy Branch:** `main` (automatikus deployment)

### Backend & Database
- **Supabase Dashboard:** https://supabase.com/dashboard/project/oavxilimosjrodillmea
- **Project ID:** `oavxilimosjrodillmea`
- **Database:** PostgreSQL (managed by Supabase)
- **Auth:** Supabase Auth

### Repository
- **GitHub Repo:** https://github.com/eurocreativity/penztarca
- **Main Branch:** `main`
- **Develop Branch:** https://github.com/eurocreativity/penztarca/tree/develop
- **Current Working Branch:** `claude/setup-project-links-017PEwetc7Mj1CvBwd8eVYjo`

---

## 🛠 Tech Stack

### Frontend
- **Framework:** Vanilla JavaScript (ES6+)
- **Styling:** Tailwind CSS 3.x (CDN)
- **Charts:** Chart.js 4.x (CDN)
- **Icons:** Font Awesome 6.x (CDN)
- **Build:** None (static files, no build process)

### Backend
- **BaaS:** Supabase
- **Database:** PostgreSQL
- **Authentication:** Supabase Auth (Email/Password, OAuth)
- **Storage:** Supabase Storage (if needed)
- **Real-time:** Supabase Realtime subscriptions

### Deployment
- **Hosting:** Netlify
- **CDN:** Netlify Edge Network
- **Configuration:** `netlify.toml`

---

## 📂 Project Structure

```
penztarca/
├── index.html              # Main app (requires auth)
├── auth.html              # Login/Register page
├── landing.html           # Public landing page
├── app.js                 # Main application logic (FinanceApp class)
├── auth.js                # Authentication logic (AuthManager)
├── supabase-client.js     # Supabase client initialization
├── netlify.toml           # Netlify deployment config
├── CLAUDE.md              # Development guidelines for AI
├── README.md              # Project documentation
├── PROJECT_STATUS.md      # This file
├── migrations/
│   ├── add_type_to_categories.sql                  # Migration 1: Add type field
│   ├── add_income_categories_for_existing_users.sql # Migration 2: Create income categories
│   └── README.md                                    # Migration instructions
└── .github/
    └── copilot-instructions.md
```

---

## 🗄 Database Schema

### Tables

#### `profiles`
```sql
CREATE TABLE profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id),
    name TEXT NOT NULL,
    budget NUMERIC DEFAULT 0,
    language TEXT DEFAULT 'hu',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `categories`
```sql
CREATE TABLE categories (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    color TEXT NOT NULL,
    icon TEXT NOT NULL,
    type TEXT DEFAULT 'expense' CHECK (type IN ('expense', 'income')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

#### `expenses` (stores both expenses and income)
```sql
CREATE TABLE expenses (
    id SERIAL PRIMARY KEY,
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL,
    category_id INTEGER REFERENCES categories(id),
    description TEXT NOT NULL,
    date DATE NOT NULL,
    type TEXT DEFAULT 'expense' CHECK (type IN ('expense', 'income')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Row Level Security (RLS)
All tables should have RLS enabled with policies:
- Users can only read/write their own data
- Profile is automatically created on signup

---

## 🚀 Installation & Setup

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/eurocreativity/penztarca.git
   cd penztarca
   ```

2. **Start local server**
   ```bash
   python -m http.server 8000
   # OR
   npx -y http-server -p 8080 -c-1
   ```

3. **Access the app**
   - Landing: http://localhost:8000/landing.html
   - Auth: http://localhost:8000/auth.html
   - App: http://localhost:8000/index.html

### Supabase Configuration

1. **Database Migration (CRITICAL - Run once!)**
   - Go to: https://supabase.com/dashboard/project/oavxilimosjrodillmea
   - Click: **SQL Editor** → **+ New query**
   - Copy content from: `migrations/add_type_to_categories.sql`
   - Click: **Run** (or Ctrl+Enter)
   - This adds the `type` field to categories table

2. **Supabase Client Configuration**
   - File: `supabase-client.js`
   - Current credentials are hardcoded (consider environment variables for production)

3. **Authentication Setup**
   - Navigate to: Authentication → URL Configuration
   - Add redirect URLs:
     - `http://localhost:8000/auth.html` (development)
     - `https://your-netlify-url.netlify.app/auth.html` (production)

### Netlify Deployment

1. **Connect Repository**
   - Link GitHub repo to Netlify
   - Netlify auto-detects `netlify.toml` config

2. **Environment Variables** (if needed)
   - Set in Netlify Dashboard: Site Settings → Environment Variables

3. **Deploy**
   - Push to `main` branch triggers automatic deployment
   - Or manual deploy from Netlify dashboard

---

## 📋 Current Development Status

### ✅ Deployed to Production (2025-11-27)

**Deployment:** All features successfully merged to `master` and deployed via Netlify ✅

#### **Phase 1: Income Category Support - Core Implementation**
- **Commit:** `1dba64c` - "Add income category support with type-based filtering"
- **Problem:** When adding income, no categories appeared in the dropdown
- **Solution:**
  - Fixed `ensureCategories()` to include `type: c.type` (app.js:409)
  - Updated `filterCategoriesByType()` for i18n support (app.js:1584-1595)
  - Added `addIncome` translation key (app.js:30, 85)
  - Created database migration script: `add_type_to_categories.sql`

#### **Phase 2: Documentation & Migration Scripts**
- **Commit:** `ce1b7e9` - "Add comprehensive project status and development guide"
- **Commit:** `b31a74a` - "Add migration script for existing users income categories"
- **Added:**
  - Complete `PROJECT_STATUS.md` documentation
  - `add_income_categories_for_existing_users.sql` migration
  - Updated `migrations/README.md` with migration order

#### **Phase 3: Income Category Chart Visualization**
- **Commit:** `50930ed` - "Add income category chart visualization"
- **Added:**
  - New doughnut chart for income categories
  - Reorganized chart layout: 2 category charts + 1 trend chart
  - Placeholder message when no income data exists
  - Green color scheme for income chart

#### **Phase 4: UI Bug Fixes**
- **Commit:** `743dc1e` - "Fix: Refresh expenses modal list after deletion"
  - Modal list now refreshes immediately after expense deletion
  - Checks if modal is open before refreshing

- **Commit:** `d1babe4` - "Fix: Prevent wrong category types in expense dropdown"
  - Fixed category dropdown showing wrong types on page load
  - `updateCategorySelectors()` now only updates filterCategory
  - `expenseCategory` managed exclusively by `filterCategoriesByType()`

### ✅ Database Migrations - COMPLETED

**Migration Status:** 🟢 **EXECUTED IN PRODUCTION**

1. ✅ **Migration 1:** `add_type_to_categories.sql` - Type field added
2. ✅ **Migration 2:** `add_income_categories_for_existing_users.sql` - Income categories created

**Result:**
- All users have expense categories (5)
- All users have income categories (4)
- Categories correctly filtered by type
- All data persists with type field

### ✅ Production Deployment - COMPLETED

**Deployment Method:** GitHub Pull Requests → Master → Netlify Auto-Deploy

**Merged PRs:**
- PR #15: develop → master (final deployment)
- PR #14: feature branch → master
- Previous PRs: #8-13 (incremental features)

**Live Features:**
- ✅ Income category support with type-based filtering
- ✅ Income category chart visualization
- ✅ Category dropdown type filtering
- ✅ Modal list auto-refresh after deletion
- ✅ Database migrations executed
- ✅ Full documentation

### ✅ Production Testing - ALL PASSED

- [x] Migration scripts executed successfully in production
- [x] New users receive both expense and income categories
- [x] Existing users have income categories
- [x] Expense type shows only expense categories on page load
- [x] Income type shows only income categories
- [x] Income category chart displays correctly
- [x] Expense category chart displays correctly
- [x] Modal refreshes after deletion
- [x] Category manager shows type field
- [x] Language switching works (Hungarian/English)
- [x] Charts display correctly (dark/light mode)
- [x] Data persists correctly

---

## 🎯 Core Features

### Implemented Features

#### ✅ Authentication & User Management
- Email/Password authentication via Supabase
- Automatic profile creation on signup
- User-specific data isolation (RLS)
- Session management with auto-redirect

#### ✅ Budget Management
- Set monthly budget
- Visual progress bar (green → yellow → red)
- Budget vs actual spending comparison
- Over-budget warnings

#### ✅ Transaction Tracking
- **Dual Type Support:** Expenses and Income
- Category-based organization
- Date-based filtering
- CRUD operations (Create, Read, Update, Delete)
- Inline editing
- Type-based category filtering

#### ✅ Category Management
- Custom categories with colors and icons
- Type-based categories (expense/income)
- Default categories:
  - **Expense:** Élelmiszer, Közlekedés, Szórakozás, Számlák, Egyéb
  - **Income:** Fizetés, Prémium, Megbízás, Egyéb bevétel
- Add/Edit/Delete categories
- Category usage validation (can't delete if in use)

#### ✅ Data Visualization
- **Category Chart:** Doughnut chart showing expense breakdown
- **Trend Chart:** 6-month line chart comparing:
  - Actual expenses
  - Actual income
  - Planned budget

#### ✅ Quick Statistics
- Today's expenses/income
- Monthly expenses/income
- Net balance (income - expenses)
- Color-coded indicators

#### ✅ Multi-language Support
- Hungarian (default)
- English
- User preference saved to profile

#### ✅ Dark Mode
- Toggle dark/light theme
- Preference saved to localStorage
- Charts auto-update with theme

#### ✅ Data Import/Export
- Export to JSON (with user email and timestamp)
- Import from JSON
- Data validation on import

---

## 🏗 Architecture Overview

### Application Structure

**Single Page Application (SPA) Pattern**
- Main class: `FinanceApp` (app.js)
- Singleton pattern for app instance
- Event-driven UI updates

### State Management

```javascript
class FinanceApp {
    // Core State
    currentUser: Object        // User profile + auth session
    expenses: Array            // All transactions (expenses + income)
    budget: Number             // Monthly budget amount
    categories: Array          // User's categories
    currentLanguage: String    // 'hu' or 'en'
    currentEditId: Number      // ID of transaction being edited

    // Chart Instances
    categoryChartInstance: Chart
    trendChartInstance: Chart
}
```

### Data Flow

1. **Initialization**
   - Check Supabase auth session (with retry logic)
   - Load/create user profile
   - Ensure default categories exist
   - Load user's expenses
   - Setup event listeners
   - Render UI

2. **User Actions**
   - Form submission → Validate → Save to Supabase → Update local state → Re-render UI

3. **Real-time Updates**
   - Currently: Manual refresh
   - Future: Supabase Realtime subscriptions

### Key Functions

```javascript
// Core Operations
async loadUserData()           // Load all user data from Supabase
async ensureCategories()       // Create default categories if needed
async addOrUpdateExpense()     // Save transaction (expense or income)
async deleteExpense(id)        // Delete transaction

// Category Management
filterCategoriesByType(type)   // Filter categories by expense/income
async saveCategory()           // Create/update category
async deleteCategory(id)       // Delete category (with usage check)

// UI Updates
updateUI()                     // Master update function
updateBudgetDisplay()          // Update budget progress bar
updateQuickStats()             // Update statistics cards
updateCharts()                 // Refresh both charts
updateRecentExpenses()         // Refresh recent transaction list

// Calculations
calculateBalance()             // Total income - total expenses
getMonthlyData()               // Get 6-month trend data
```

---

## 🔧 Development Guidelines

### Code Style
- ES6+ JavaScript (classes, async/await, arrow functions)
- No build process - browser-native JavaScript
- Tailwind utility classes for styling
- Hungarian variable names for UI text stored in `languages` object

### Best Practices
1. **Always check authentication** before DB operations
2. **Use try-catch** for all async operations
3. **Update local state** after successful DB operations
4. **Re-render UI** after state changes
5. **Use i18n** via `getText(key)` for all user-facing text

### Adding New Features

**Example: Add new transaction type**

1. Update database schema (migration script)
2. Update `languages` object with new text keys
3. Add UI elements in HTML
4. Add business logic in `FinanceApp` class
5. Update relevant UI update functions
6. Test with both languages and themes

### Git Workflow
```bash
# Feature development
git checkout develop
git checkout -b claude/feature-name-<session-id>

# Make changes
git add .
git commit -m "Descriptive message"

# Push (branch must start with 'claude/' and end with session ID)
git push -u origin claude/feature-name-<session-id>

# Create PR to develop branch
```

---

## 🐛 Known Issues & Limitations

### Current Limitations
1. **No offline support** - requires internet for Supabase
2. **No real-time sync** - manual refresh needed
3. **No mobile app** - web only
4. **Limited export formats** - JSON only (no CSV, Excel)
5. **No recurring transactions** - manual entry required
6. **No multi-currency** - HUF only

### Technical Debt
1. Supabase credentials hardcoded in `supabase-client.js`
2. No comprehensive error handling UI
3. No loading states for async operations
4. No data backup/restore mechanism
5. No transaction search functionality

---

## 🚦 Testing Checklist

### Pre-Deployment Testing

#### Authentication
- [ ] New user can register
- [ ] Existing user can login
- [ ] Session persists on page reload
- [ ] Logout works correctly
- [ ] Redirects work (landing → auth → app)

#### Transactions
- [ ] Can add expense with category
- [ ] Can add income with category
- [ ] Categories filter correctly by type
- [ ] Can edit transaction
- [ ] Can delete transaction
- [ ] Form validation works

#### Categories
- [ ] Default categories created for new users
- [ ] Can create custom category
- [ ] Can edit category
- [ ] Can delete unused category
- [ ] Cannot delete category in use
- [ ] Type field saves correctly

#### UI/UX
- [ ] Dark mode toggle works
- [ ] Language switch works
- [ ] Charts render correctly
- [ ] Budget progress bar updates
- [ ] Statistics display correctly
- [ ] Responsive on mobile

#### Data
- [ ] Export creates valid JSON
- [ ] Import loads data correctly
- [ ] Data persists after logout/login

---

## 📞 Emergency Contacts & Resources

### Documentation
- **Supabase Docs:** https://supabase.com/docs
- **Chart.js Docs:** https://www.chartjs.org/docs/
- **Tailwind CSS:** https://tailwindcss.com/docs

### Support
- **Supabase Support:** Dashboard → Help
- **Netlify Support:** Dashboard → Support

### Code References
- **Main Logic:** `app.js` (FinanceApp class, lines 1-1638)
- **Auth Logic:** `auth.js` (AuthManager)
- **Supabase Init:** `supabase-client.js`
- **Migrations:** `migrations/` directory

---

## 📝 Development Notes

### Transaction Type System
- Field: `type` in both `expenses` table and `categories` table
- Values: `'expense'` or `'income'`
- Default: `'expense'` for backward compatibility
- Legacy data without `type` is treated as expense

### Category Filtering Logic
```javascript
// Filter categories by transaction type
const filteredCategories = this.categories.filter(
    cat => cat.type === type || !cat.type  // !cat.type for backward compatibility
);
```

### Budget Calculation
- Budget tracks **expenses only** (not affected by income)
- Net balance = Total Income - Total Expenses
- Monthly calculations filter by `date.startsWith(YYYY-MM)`

### Chart Colors
- Expenses: Red tones (#ef4444)
- Income: Green tones (#10b981)
- Budget: Blue (#3b82f6)
- Categories: Custom colors from category.color

---

## 🎓 Development Roadmap - 2025

### 📅 **FÁZIS 1 - Quick Wins** (1-2 hét) 🔄 IN PROGRESS

**Prioritás:** MAGAS | **Komplexitás:** KÖNNYŰ-KÖZEPES | **Branch:** `claude/phase1-quick-wins-017PEwetc7Mj1CvBwd8eVYjo`

#### Feature 1.1: Top 5 Legnagyobb Kiadás Widget
- [ ] **Státusz:** Pending
- **Mit ad:** Gyorsan látható dashboard widget a top 5 legnagyobb kiadásról
- **Előny:** Azonnal látszik, hol ment el a legtöbb pénz, hol lehet spórolni
- **Implementáció:**
  - Új kártya a dashboard-on a quick stats mellett
  - Rendezés összeg szerint csökkenő sorrendben
  - Megjelenítés: összeg, kategória név (színnel), dátum, leírás
  - Kattintható elemek → edit módba ugrik

#### Feature 1.2: Kategóriánkénti Költségkeret
- [ ] **Státusz:** Pending
- **Mit ad:** Minden kategóriára (Élelmiszer, Közlekedés, stb.) külön limit beállítása
- **Előny:** Részletesebb kontroll, kategóriánként látható túlköltés
- **Implementáció:**
  - Database: `ALTER TABLE categories ADD COLUMN budget_limit DECIMAL`
  - UI: Budget input a category manager-ben
  - Quick stats: Kategóriánként mini progress bar
  - Színes jelzés: zöld (jó) → sárga (közel) → piros (túllépés)

#### Feature 1.3: Költési Előrejelzés
- [ ] **Státusz:** Pending
- **Mit ad:** Előrejelzés: "Ha így költesz tovább, a hónap végére X Ft-od marad"
- **Előny:** Korai figyelmeztetés túlköltésre, proaktív pénzügyi tervezés
- **Implementáció:**
  - Számítás: eddigi napi átlag × hátralévő napok = várható további költés
  - Előrejelzett maradék = budget - (eddigi + várható)
  - Alert banner ha negatív előrejelzés
  - Grafikon a trend chart mellett

#### Feature 1.4: Havi Összehasonlító Riport
- [ ] **Státusz:** Pending
- **Mit ad:** "Ez hónap vs. múlt hónap" összehasonlítás (összeg, kategóriánként)
- **Előny:** Trendek felismerése, havi fejlődés nyomon követése
- **Implementáció:**
  - Új chart: Bar chart összehasonlítással
  - Dropdown: "Összehasonlítás: Előző hónap / Előző év / Egyedi időszak"
  - Százalékos változás megjelenítése (+15% vagy -10%)
  - Kategóriánkénti breakdown

**Tesztelési Instrukciók (Fázis 1 befejezése után):**
1. Frissítsd a böngészőt (Ctrl+Shift+R)
2. Ellenőrizd az új widgeteket a dashboard-on
3. Teszteld a kategóriánkénti költségkeret beállítást
4. Nézd meg az előrejelzést és az összehasonlító riportot
5. Teszteld dark mode-ban is

---

### 📅 **FÁZIS 2 - Core Features** (2-3 hét)

**Prioritás:** MAGAS | **Komplexitás:** KÖZEPES

#### Feature 2.1: Ismétlődő Tranzakciók
- [ ] **Státusz:** Planned
- **Mit ad:** Havi fix kiadások/bevételek automatikus rögzítése (fizetés, albérlet, számlák)
- **Előny:** Időmegtakarítás, nem kell havonta felvinni ugyanazokat
- **Implementáció:**
  ```sql
  CREATE TABLE recurring_transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    amount DECIMAL NOT NULL,
    category_id INTEGER REFERENCES categories(id),
    description TEXT NOT NULL,
    frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'monthly', 'yearly')),
    start_date DATE NOT NULL,
    end_date DATE,
    last_created_date DATE,
    active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  ```
  - UI: "Ismétlődik" checkbox a tranzakció hozzáadásakor
  - Beállítások: gyakoriság, kezdő dátum, opcionális végdátum
  - Cronjob vagy bejelentkezéskor automatikus létrehozás
  - Recurring template manager: enable/disable/edit

#### Feature 2.2: Naptár Nézet
- [ ] **Státusz:** Planned
- **Mit ad:** Kiadások/bevételek naptár formában
- **Előny:** Gyorsan átlátható, melyik napon mennyi ment el
- **Implementáció:**
  - Library: FullCalendar.js vagy egyszerű CSS Grid
  - Minden nap: összköltés/bevétel badge
  - Színkódolás: piros (kiadás), zöld (bevétel), kék (mindkettő)
  - Kattintásra: modal az adott napi tételekkel
  - Havi/heti nézet kapcsoló

#### Feature 2.3: Keresés és Fejlett Szűrés
- [ ] **Státusz:** Planned
- **Mit ad:** Keresés leírás szerint, szűrés összeg tartomány szerint
- **Előny:** Gyorsan megtalálható bármely konkrét tétel
- **Implementáció:**
  - Search input: real-time filter (leírás, összeg)
  - Szűrő opciók:
    - Összeg tartomány: min-max slider
    - Dátum tartomány: date picker
    - Kategória: multi-select
    - Típus: kiadás/bevétel/mindkettő
  - "Szűrők törlése" gomb
  - Találatok száma megjelenítése

#### Feature 2.4: Gyors Beviteli Sablonok
- [ ] **Státusz:** Planned
- **Mit ad:** Gyakori kiadások 1 kattintással (pl. "Napi kávé - 800 Ft")
- **Előny:** Időmegtakarítás, gyorsabb rögzítés
- **Implementáció:**
  ```sql
  CREATE TABLE quick_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    amount DECIMAL NOT NULL,
    category_id INTEGER REFERENCES categories(id),
    description TEXT NOT NULL,
    icon TEXT,
    sort_order INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  ```
  - "Csillag" gomb a tranzakcióknál → Sablonként mentés
  - Floating action buttons a dashboard-on (max 5-6 sablon)
  - Template manager: edit/delete/reorder
  - 1 kattintással új tranzakció az aktuális dátummal

---

### 📅 **FÁZIS 3 - Advanced Features** (3-4 hét)

**Prioritás:** KÖZEPES | **Komplexitás:** KÖZEPES-NEHÉZ

#### Feature 3.1: Megtakarítási Célok
- [ ] **Státusz:** Planned
- **Mit ad:** Célok kitűzése (pl. "Új laptop - 500,000 Ft"), progress tracking
- **Előny:** Motiváló, látható a haladás
- **Implementáció:**
  ```sql
  CREATE TABLE savings_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    target_amount DECIMAL NOT NULL,
    current_amount DECIMAL DEFAULT 0,
    deadline DATE,
    color TEXT DEFAULT '#3b82f6',
    icon TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  ```
  - Új "Célok" oldal/modal
  - Progress bar minden célra (százalék + összeg)
  - "Hozzáadás célhoz" gomb a bevételnél
  - Opcionális: auto-save (bevétel X%-a automatikusan megy a célba)
  - Határidő figyelmeztetés

#### Feature 3.2: Címkék/Tagek
- [ ] **Státusz:** Planned
- **Mit ad:** Kategórián túl további címkézés (pl. "munkahelyi", "hétvége", "ajándék")
- **Előny:** Rugalmasabb szűrés és elemzés
- **Implementáció:**
  ```sql
  CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    color TEXT DEFAULT '#6b7280'
  );
  CREATE TABLE expense_tags (
    expense_id INTEGER REFERENCES expenses(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (expense_id, tag_id)
  );
  ```
  - Multi-select tag input a tranzakció hozzáadásakor
  - Tag manager: create/edit/delete
  - Szűrés tag szerint
  - Tag-alapú statisztikák és chartok

#### Feature 3.3: PDF/Excel Export
- [ ] **Státusz:** Planned
- **Mit ad:** Professzionális riportok exportálása könyveléshez
- **Előny:** Megosztható, nyomtatható, könyvelőnek küldhető
- **Implementáció:**
  - Library: jsPDF (PDF), SheetJS (Excel)
  - Export opciók:
    - Időszak választás (hónap/év/egyedi)
    - Formátum: PDF / Excel / CSV
    - Tartalom: részletes lista / összesítő / chartokkal
  - Template-ek:
    - Egyszerű lista (tétel-szintű)
    - Kategóriánkénti összesítő
    - Havi riport (chartokkal, statisztikákkal)
  - PDF fejléc: felhasználó neve, dátum, logo

#### Feature 3.4: PWA (Progressive Web App)
- [ ] **Státusz:** Planned
- **Mit ad:** Telepíthető mobilra/desktopra, offline működés
- **Előny:** Natív app élmény, offline használat
- **Implementáció:**
  - `manifest.json` létrehozása:
    ```json
    {
      "name": "PénzTár - Személyes Pénzügy",
      "short_name": "PénzTár",
      "start_url": "/",
      "display": "standalone",
      "background_color": "#ffffff",
      "theme_color": "#f59e0b",
      "icons": [...]
    }
    ```
  - Service Worker: offline cache, background sync
  - Install prompt UI
  - Offline detection és sync később

---

### 📅 **FÁZIS 4 - Enterprise Features** (1-2 hónap)

**Prioritás:** ALACSONY | **Komplexitás:** NEHÉZ-NAGYON NEHÉZ

#### Feature 4.1: Számla/Pénztárca Kezelés
- [ ] **Státusz:** Planned
- **Mit ad:** Több számla kezelése (Készpénz, OTP Bank, Hitelkártya, stb.)
- **Előny:** Valós pénzügyi kép, átutalások követése
- **Implementáció:**
  ```sql
  CREATE TABLE accounts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    type TEXT CHECK (type IN ('cash', 'checking', 'savings', 'credit_card', 'investment')),
    balance DECIMAL DEFAULT 0,
    currency TEXT DEFAULT 'HUF',
    color TEXT,
    icon TEXT,
    is_default BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
  );
  ALTER TABLE expenses ADD COLUMN account_id UUID REFERENCES accounts(id);
  ALTER TABLE expenses ADD COLUMN transfer_to_account_id UUID REFERENCES accounts(id);
  ```
  - Account manager: create/edit/delete/set default
  - Dashboard: összes számla egyenlege
  - Tranzakciónál: számla választás
  - Transfer funkció: "Átutalás számlák között"
  - Auto-balance számítás

#### Feature 4.2: Nyugta/Kép Feltöltés
- [ ] **Státusz:** Planned
- **Mit ad:** Fotó csatolása kiadáshoz (nyugta, számla)
- **Előny:** Teljes dokumentáció, könyveléshez hasznos
- **Implementáció:**
  - Supabase Storage bucket: `receipts`
  - File upload UI (drag & drop vagy browse)
  - Image compression kliens oldalon
  - Thumbnail generálás
  - Gallery view a tranzakcióban
  - Lightbox/zoom nagy képhez
  - OCR (opcionális, later): összeg automatikus felismerés

#### Feature 4.3: Értesítések
- [ ] **Státusz:** Planned
- **Mit ad:** Email/push értesítés túlköltésnél, közelgő számlákról
- **Előny:** Proaktív pénzügyi kontroll
- **Implementáció:**
  - Supabase Edge Functions (Deno)
  - Email: Supabase Auth email vagy SendGrid
  - Push: Web Push API + service worker
  - Notification beállítások:
    - Budget alert (75%, 90%, 100%, 110%)
    - Ismétlődő számla emlékeztető (X nappal előtte)
    - Napi/heti összesítő
    - Cél elérése
  - User preferences táblázat

#### Feature 4.4: Multi-valuta Támogatás
- [ ] **Státusz:** Planned
- **Mit ad:** Külföldi kiadások rögzítése (EUR, USD, GBP, stb.)
- **Előny:** Utazóknál/nemzetközi munkánál elengedhetetlen
- **Implementáció:**
  - ALTER TABLE expenses ADD COLUMN currency TEXT DEFAULT 'HUF'
  - ALTER TABLE expenses ADD COLUMN exchange_rate DECIMAL
  - API integráció: exchangerate-api.com (ingyenes tier)
  - Naponta frissülő árfolyamok cache-elése
  - Tranzakciónál: valuta választó
  - Auto-konverzió HUF-ra a kimutatásokhoz
  - Multi-currency chart opció

#### Feature 4.5: Megosztott Kiadások
- [ ] **Státusz:** Planned
- **Mit ad:** Közös költések kezelése (pl. albérlet, családi vásárlás)
- **Előny:** Könnyebb elszámolás, nincs utólagos matekozás
- **Implementáció:**
  - Multiuser support: meghívások, hozzáférés kezelés
  - Split logika:
    - Egyenlő megosztás (50-50)
    - Arányos megosztás (30-70)
    - Egyedi összegek
    - Százalékos
  - "Ki fizette" és "Ki tartozik" követése
  - Settle up funkció (elszámolás)
  - Notification: új megosztott kiadás

---

## 📊 Roadmap Összefoglaló

| Fázis | Időigény | Funkciók | Prioritás | Státusz |
|-------|----------|----------|-----------|---------|
| **Fázis 1** | 1-2 hét | 4 quick win feature | 🔴 MAGAS | 🔄 IN PROGRESS |
| **Fázis 2** | 2-3 hét | 4 core feature | 🔴 MAGAS | ⏳ Planned |
| **Fázis 3** | 3-4 hét | 4 advanced feature | 🟡 KÖZEPES | ⏳ Planned |
| **Fázis 4** | 1-2 hónap | 5 enterprise feature | 🟢 ALACSONY | ⏳ Planned |

**Teljes roadmap:** ~3-4 hónap fejlesztés

---

## 🎯 Next Steps & Future Enhancements

### ✅ Immediate (Completed)
1. ✅ Run `migrations/add_type_to_categories.sql`
2. ✅ Test income category functionality
3. ✅ Merge to `develop` branch
4. ✅ Deploy to production

### 🔄 Current Sprint (Fázis 1 - IN PROGRESS)
1. [ ] Top 5 Legnagyobb Kiadás Widget
2. [ ] Kategóriánkénti Költségkeret
3. [ ] Költési Előrejelzés
4. [ ] Havi Összehasonlító Riport

### 📋 Backlog (Fázis 2-4)
- Ismétlődő tranzakciók (Fázis 2)
- Naptár nézet (Fázis 2)
- Megtakarítási célok (Fázis 3)
- PWA support (Fázis 3)
- Multi-currency (Fázis 4)
- Shared expenses (Fázis 4)

---

## 📌 Quick Reference Commands

```bash
# Start local development
python -m http.server 8000

# Git operations
git status
git add .
git commit -m "message"
git push -u origin claude/branch-name-<session-id>

# View migrations
cat migrations/add_type_to_categories.sql
cat migrations/README.md

# Check current branch
git branch --show-current

# View recent commits
git log --oneline -5
```

---

## ⚠️ Important Notes

1. **Always backup data** before running migrations
2. **Test migrations** on a development project first
3. **Never commit** Supabase credentials to git (use environment variables)
4. **Branch naming:** Must start with `claude/` and end with session ID for push to work
5. **Migration order:** Run migrations in chronological order

---

**Last Updated:** 2025-11-27
**Maintained By:** Development Team
**Version:** 1.0 - Income Categories Support
