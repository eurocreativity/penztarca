# Architecture & Tech Stack

## 🛠 Technology Stack

### Frontend
- **Framework:** Vanilla JavaScript (ES6+)
  - No build process needed
  - Browser-native modules
  - ES6 Classes (FinanceApp, AuthManager)
- **Styling:** Tailwind CSS 3.x (CDN)
  - Utility-first approach
  - Responsive design
  - Dark mode support
- **Charts:** Chart.js 4.x (CDN)
  - Line chart (monthly trend)
  - Doughnut chart (category distribution)
- **Icons:** Font Awesome 6.x (CDN)
- **HTTP:** Fetch API (native)

### Backend
- **BaaS Platform:** Supabase
- **Database:** PostgreSQL (managed)
- **Authentication:** Supabase Auth
  - Email/Password
  - OAuth (ready)
  - Session management with PKCE flow
- **Storage:** Supabase Storage (available)
- **Real-time:** Supabase Realtime subscriptions (available)

### Deployment & Hosting
- **Platform:** Netlify
- **CDN:** Netlify Edge Network
- **Deploy Trigger:** Push to `main` branch
- **Configuration:** `netlify.toml`
- **Build:** None (static files)

## 📂 Project Structure

```
penztarca/
├── index.html              # Main app (requires auth)
├── auth.html              # Login/Register page
├── landing.html           # Public landing page
│
├── app.js                 # Main application logic (FinanceApp class)
├── auth.js                # Authentication logic (AuthManager)
├── supabase-client.js     # Supabase client initialization
│
├── netlify.toml           # Netlify deployment config
├── CLAUDE.md              # Development guidelines for AI
├── README.md              # Project documentation
│
├── docs/                  # Documentation folder
│   ├── QUICK_REF.md              # Links & commands
│   ├── ARCHITECTURE.md           # This file
│   ├── DATABASE.md               # Schema & RLS
│   ├── FEATURES.md               # Feature list
│   ├── DEV_GUIDE.md              # Development guidelines
│   ├── TROUBLESHOOTING.md        # Known issues
│   └── feature-docs/             # Specific features
│       ├── SEARCH_FILTER_FEATURE.md
│       ├── LOGIN_FIX_2025-11-28.md
│       └── ...
│
├── migrations/
│   ├── add_type_to_categories.sql
│   ├── add_income_categories_for_existing_users.sql
│   └── README.md
│
└── .github/
    └── copilot-instructions.md
```

## 🏗 Application Architecture

### Core Classes

#### FinanceApp (app.js)
**Felelősség:** Main application logic

**State Management:**
```javascript
class FinanceApp {
    constructor() {
        // User & Profile
        this.user = null;
        this.profile = null;
        
        // Data
        this.expenses = [];
        this.categories = [];
        
        // UI State
        this.language = 'hu';
        this.theme = 'light';
        this.currentExpense = null;
        
        // Filters (NEW 2025-11-28)
        this.searchQuery = '';
        this.filterType = 'all';
        this.filterCategory = 'all';
        this.filterDateRange = 'month';
        
        // i18n
        this.languages = { hu: {...}, en: {...} };
    }
}
```

**Key Methods:**
- Initialization: `init()`, `loadUserData()`
- CRUD: `saveExpense()`, `deleteExpense()`, `saveCategory()`, `deleteCategory()`
- UI Updates: `updateUI()`, `updateRecentExpenses()`, `updateCharts()`
- Filters: `filterExpenses()`, `clearAllFilters()`
- Calculations: `calculateBalance()`, `getMonthlyData()`

#### AuthManager (auth.js)
**Felelősség:** Authentication & session management

**Methods:**
- `login(email, password)` - Email/password login
- `register(email, password, name)` - New user registration
- `logout()` - Session cleanup
- `handleAuthStateChange()` - Auth event listener

**Session Persistence:**
- Storage: `window.localStorage`
- Key: `sb-oavxilimosjrodillmea-auth-token`
- Flow: PKCE (Proof Key for Code Exchange)
- Retry: 5 attempts, 800ms intervals

## 🔄 Data Flow

### Authentication Flow
```
1. User → auth.html (login/register form)
2. AuthManager.login() → Supabase Auth
3. Session token → localStorage
4. Redirect → index.html
5. app.js init() checks session
6. Load user data → render UI
```

### Transaction Flow
```
1. User fills form (index.html)
2. FinanceApp.saveExpense() validates
3. Supabase INSERT/UPDATE (expenses table)
4. Update local state (this.expenses)
5. FinanceApp.updateUI() refreshes
6. Charts & stats recalculate
```

### Filter Flow (NEW 2025-11-28)
```
1. User types/selects filter
2. Event listener updates state
3. filterExpenses() applies rules
4. updateRecentExpenses() re-renders
5. Dynamic limit (5 → 10 with filters)
```

## 🔐 Security Architecture

### Row Level Security (RLS)
- Minden tábla RLS enabled
- Policy: User csak saját adatait látja/módosítja
- Enforcement: PostgreSQL RLS policies

### Authentication
- Supabase Auth managed sessions
- JWT tokens in localStorage
- PKCE flow for security
- Password hashing: Supabase managed

### Data Validation
- Frontend: Form validation
- Backend: Database constraints
- Type checking: PostgreSQL CHECK constraints

## 🎨 UI Architecture

### Responsive Design
- **Mobile-first approach**
- Breakpoints: sm (640px), md (768px), lg (1024px), xl (1280px)
- Grid layout adapts: 1 col → 2 col → 3 col

### Theme System
- Light/Dark mode toggle
- CSS classes: `.light`, `.dark`
- Persistent in localStorage

### i18n System
- Languages: Hungarian (hu), English (en)
- Pattern: `getText(key)` → `languages[lang][key]`
- All UI text externalized

## 📊 Chart Architecture

### Monthly Trend (Line Chart)
- **Data:** Last 6 months
- **Lines:** Income (green), Expenses (red)
- **Y-axis:** Amount in HUF
- **X-axis:** Months

### Category Distribution (Doughnut)
- **Data:** Top 5 categories
- **Colors:** Category.color
- **Labels:** Category name + percentage
- **Center:** Total amount

## 🔌 External Dependencies (CDN)

All loaded via CDN in HTML:
```html
<!-- Tailwind CSS 3.x -->
<script src="https://cdn.tailwindcss.com"></script>

<!-- Chart.js 4.x -->
<script src="https://cdn.jsdelivr.net/npm/chart.js"></script>

<!-- Font Awesome 6.x -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">

<!-- Supabase JS -->
<script src="https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2"></script>
```

## 🚀 Performance Considerations

### No Build Process
- ✅ Instant deployment
- ✅ No bundler needed
- ✅ Browser caching efficient
- ⚠️ Multiple HTTP requests (CDN mitigates)

### Data Loading
- Fetch on init() only
- Local state updates (no re-fetch)
- Charts update from local state

### Filter Performance
- Client-side filtering (array methods)
- No database queries for filters
- Re-render only filtered list

---

**Last Updated:** 2025-11-28
