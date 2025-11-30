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

### ✅ Recently Completed (2025-11-30)

#### **Phase 4: Budget Input UI Fix**
- **Commit:** `d053023` - "Fix: Budget input field blocked by overlay animation"
- **Branch:** `develop`
- **Problem:** Budget input field and "Beállít" button were unclickable
- **Root Cause:**
  - Progress bar animation overlay (`animate-pulse-soft`) had `absolute inset-0` positioning
  - Overlay was blocking mouse events on elements above it
- **Solution:**
  - Added `pointer-events-none` class to animation overlay (index.html:374)
  - Fixed layout responsiveness (adjusted container widths and grid columns)
- **Files Modified:**
  - `index.html` (lines 154, 312, 335, 374, 387, 432, 442)
- **Tested:** ✅ Budget input now fully functional, accepts input and button clicks work

### ✅ Recently Completed (2025-11-27)

#### **Phase 1: Income Category Support - Core Implementation**
- **Commit:** `1dba64c` - "Add income category support with type-based filtering"
- **Problem:** When adding income, no categories appeared in the dropdown
- **Root Cause:**
  - `ensureCategories()` didn't copy `type` field when creating default categories
  - Database missing `type` column in categories table
- **Solution:**
  - Fixed `ensureCategories()` to include `type: c.type` (app.js:409)
  - Updated `filterCategoriesByType()` for i18n support (app.js:1584-1595)
  - Added `addIncome` translation key (app.js:30, 85)
  - Created database migration script: `add_type_to_categories.sql`
- **Files Modified:**
  - `app.js` (lines 30, 85, 409, 1584-1595, 1612-1617)
  - `migrations/add_type_to_categories.sql` (new)
  - `migrations/README.md` (new)

#### **Phase 2: Documentation & Existing Users Support**
- **Commit:** `ce1b7e9` - "Add comprehensive project status and development guide"
- **Added:** Complete `PROJECT_STATUS.md` with all project information

#### **Phase 3: Existing Users Migration**
- **Commit:** `b31a74a` - "Add migration script for existing users income categories"
- **Added:** Second migration script for existing users
- **Files:**
  - `migrations/add_income_categories_for_existing_users.sql` (new)
  - Updated `migrations/README.md` with migration order

### ✅ Database Migrations - COMPLETED

**Migration Status:** 🟢 **BEFEJEZVE**

1. ✅ **Migration 1:** `add_type_to_categories.sql` - Type field hozzáadva
2. ✅ **Migration 2:** `add_income_categories_for_existing_users.sql` - Bevételi kategóriák létrehozva

**Eredmény:**
- Minden felhasználó rendelkezik expense kategóriákkal (5 db)
- Minden felhasználó rendelkezik income kategóriákkal (4 db)
- Az alkalmazás helyesen szűri a kategóriákat típus szerint

### 🎯 Deployment Ready Actions

1. **Current Status** ✅
   - Branch: `develop`
   - Latest Commit: `d053023` - Budget input fix
   - Status: Ready for production deployment

2. **Next Steps**
   - Test on develop branch (local server running)
   - Merge develop → main for production deployment
   - URL: https://github.com/eurocreativity/penztarca/compare/main...develop

### ✅ Testing Checklist - ALL PASSED

#### Income Category Support
- [x] Migration script 1 executed successfully
- [x] Migration script 2 executed successfully
- [x] New users get both expense and income categories
- [x] Existing users have income categories added
- [x] Expense type shows only expense categories
- [x] Income type shows income categories (Fizetés, Prémium, Megbízás, Egyéb bevétel)
- [x] Category manager shows type field
- [x] Language switching works for all new texts
- [x] Charts display correctly for income vs expenses
- [x] Data persists correctly with type field

#### Budget Input Fix (2025-11-30)
- [x] Budget input field accepts keyboard input
- [x] "Beállít" button is clickable
- [x] Budget value saves to database
- [x] Budget display updates correctly
- [x] No overlay blocking user interaction

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

## 🎓 Next Steps & Future Enhancements

### Immediate (After Migration)
1. ✅ Run `migrations/add_type_to_categories.sql`
2. Test income category functionality
3. Merge to `develop` branch
4. Deploy to production

### Short-term Enhancements
- [x] Add CSV export/import
- [ ] Transaction search and advanced filtering
- [ ] Recurring transactions
- [ ] Budget categories (separate budgets per category)
- [ ] Email notifications for budget alerts

### Medium-term Features
- [ ] Multi-currency support
- [ ] Savings goals tracking
- [ ] Bill reminders
- [ ] Receipt photo upload (Supabase Storage)
- [ ] Monthly/yearly reports (PDF)

### Long-term Vision
- [ ] Mobile app (React Native / PWA)
- [ ] Shared budgets (family accounts)
- [ ] Bank account integration
- [ ] AI-powered spending insights
- [ ] Investment tracking

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

**Last Updated:** 2025-11-30
**Maintained By:** Development Team
**Version:** 1.1 - Budget Input Fix + Income Categories Support
**Current Branch:** develop
**Latest Commit:** d053023
