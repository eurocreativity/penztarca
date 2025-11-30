# Troubleshooting Guide

## 🔍 Common Issues & Solutions

### Authentication Issues

#### Problem: User logged in but redirected to auth page
**Symptoms:**
- Login successful but returns to auth.html
- Session exists but app.js doesn't detect it
- localStorage has token but not recognized

**Solutions:**

**1. Check Storage Configuration**
```javascript
// In supabase-client.js
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: {
        storage: window.localStorage,  // ← Must be set
        storageKey: 'sb-oavxilimosjrodillmea-auth-token',
        flowType: 'pkce'
    }
});
```

**2. Fix init() Race Condition**
```javascript
// In app.js init()
async init() {
    // Session check FIRST (before event listener)
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
        this.user = session.user;
        await this.loadUserData();
        this.updateUI();
        return;  // ← Important! Don't continue
    }
    
    // Event listener as fallback only
    supabase.auth.onAuthStateChange((event, session) => {
        // Handle auth changes
    });
}
```

**3. Clear Old Tokens**
```javascript
// In browser console
localStorage.clear();
// Then try logging in again
```

**Related Documentation:** `docs/feature-docs/LOGIN_FIX_2025-11-28.md`

---

#### Problem: Session expires immediately
**Symptoms:**
- User logged in but session gone after refresh
- Token exists but invalid

**Solutions:**

**1. Check Token Expiry**
```javascript
const { data: { session } } = await supabase.auth.getSession();
console.log('Expires at:', new Date(session.expires_at * 1000));
```

**2. Refresh Session**
```javascript
const { data, error } = await supabase.auth.refreshSession();
if (error) {
    // Redirect to login
    window.location.href = '/auth.html';
}
```

**3. Verify Redirect URLs in Supabase**
- Go to: https://supabase.com/dashboard/project/oavxilimosjrodillmea
- Authentication → URL Configuration
- Add: `http://localhost:8000/auth.html`
- Add: `https://your-netlify-url.netlify.app/auth.html`

---

### Data Loading Issues

#### Problem: Data not appearing after login
**Symptoms:**
- Login successful
- UI shows but no transactions/categories
- Console shows empty arrays

**Solutions:**

**1. Check RLS Policies**
```sql
-- Run in Supabase SQL Editor
SELECT * FROM expenses WHERE user_id = auth.uid();
SELECT * FROM categories WHERE user_id = auth.uid();
```

**2. Verify user_id Matches**
```javascript
const { data: { session } } = await supabase.auth.getSession();
console.log('Session User ID:', session.user.id);

const { data } = await supabase.from('profiles').select('*');
console.log('Profile User ID:', data[0].id);
// Should match!
```

**3. Check Network Tab**
- Open DevTools → Network
- Filter by "supabase"
- Check if requests return 401 (auth error) or 403 (RLS error)

**4. Enable RLS (if disabled)**
```sql
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
```

---

#### Problem: Categories not filtering by type
**Symptoms:**
- Expense form shows income categories
- Income form shows expense categories

**Solution:**

**1. Check Migration Applied**
```sql
-- Verify type column exists
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'categories';
-- Should show 'type' column
```

**2. Run Migration**
```sql
-- If type column missing, run this:
ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'expense' 
CHECK (type IN ('expense', 'income'));
```

**3. Fix Filter Logic**
```javascript
filterCategoriesByType(type) {
    return this.categories.filter(cat => 
        cat.type === type || !cat.type  // !cat.type for backward compatibility
    );
}
```

---

### UI/Display Issues

#### Problem: Charts not rendering
**Symptoms:**
- Canvas elements exist but charts blank
- Console error about Chart.js

**Solutions:**

**1. Check Chart.js Loaded**
```javascript
console.log(typeof Chart);  // Should be 'function'
```

**2. Verify Canvas Exists**
```javascript
const canvas = document.getElementById('monthly-chart');
console.log(canvas);  // Should not be null
```

**3. Check Data Format**
```javascript
// Chart.js expects arrays
const data = {
    labels: ['Jan', 'Feb'],  // Array of strings
    datasets: [{
        data: [10, 20]  // Array of numbers
    }]
};
```

**4. Destroy Old Chart Instances**
```javascript
if (this.monthlyChart) {
    this.monthlyChart.destroy();  // ← Prevent memory leak
}
this.monthlyChart = new Chart(ctx, config);
```

---

#### Problem: Dark mode not working
**Symptoms:**
- Toggle switch works but colors don't change
- Some elements stay light/dark

**Solutions:**

**1. Check Body Class**
```javascript
console.log(document.body.classList);
// Should contain 'light' or 'dark'
```

**2. Verify Tailwind Dark Classes**
```html
<!-- ✅ Correct -->
<div class="bg-white dark:bg-gray-800">

<!-- ❌ Wrong - missing dark: prefix -->
<div class="bg-white bg-gray-800">
```

**3. Force Reload Styles**
```javascript
// In toggleTheme()
document.body.classList.remove('light', 'dark');
document.body.classList.add(this.theme);
```

---

#### Problem: Responsive layout broken
**Symptoms:**
- Mobile view looks wrong
- Elements overflow container
- Charts too large

**Solutions:**

**1. Firefox-Specific Issues**
```css
/* Add Firefox workaround */
@-moz-document url-prefix() {
    .chart-container {
        max-width: 400px;
        margin: 0 auto;
    }
}
```

**2. Container Max-Width**
```html
<!-- Use proper container -->
<div class="container mx-auto max-w-6xl px-4">
    <!-- Content -->
</div>
```

**3. Chart Constraints**
```html
<div class="chart-container" style="max-width: 400px; max-height: 400px;">
    <canvas id="chart"></canvas>
</div>
```

**Related Documentation:** `docs/feature-docs/LAYOUT_FIX_2025-11-28.md`

---

### Filter & Search Issues

#### Problem: Search not working
**Symptoms:**
- Typing in search box does nothing
- Filter dropdowns don't filter

**Solutions:**

**1. Check Event Listeners**
```javascript
// In init()
document.getElementById('search-transactions').addEventListener('input', (e) => {
    this.searchQuery = e.target.value.toLowerCase();
    this.updateRecentExpenses();
});
```

**2. Verify filterExpenses() Called**
```javascript
updateRecentExpenses() {
    let expenses = [...this.expenses];
    
    // Apply filters
    expenses = this.filterExpenses(expenses);  // ← Must be called
    
    // Render
    this.renderExpenses(expenses);
}
```

**3. Check Filter Logic**
```javascript
filterExpenses(expenses) {
    let filtered = expenses;
    
    // Text search
    if (this.searchQuery) {
        filtered = filtered.filter(e => 
            e.description.toLowerCase().includes(this.searchQuery)
        );
    }
    
    return filtered;
}
```

---

#### Problem: Clear Filters button doesn't work
**Solution:**

```javascript
clearAllFilters() {
    // 1. Reset state
    this.searchQuery = '';
    this.filterType = 'all';
    this.filterCategory = 'all';
    this.filterDateRange = 'month';
    
    // 2. Reset UI elements
    document.getElementById('search-transactions').value = '';
    document.getElementById('filter-type').value = 'all';
    document.getElementById('filter-category').value = 'all';
    document.getElementById('filter-date-range').value = 'month';
    
    // 3. Update display
    this.updateRecentExpenses();
}
```

**Related Documentation:** `docs/feature-docs/SEARCH_FILTER_FEATURE.md`

---

### Database Issues

#### Problem: Migration fails
**Symptoms:**
- SQL error when running migration
- Column already exists error
- Constraint violation

**Solutions:**

**1. Check If Already Applied**
```sql
-- Check if type column exists
SELECT column_name 
FROM information_schema.columns 
WHERE table_name = 'categories' 
AND column_name = 'type';
```

**2. Use IF NOT EXISTS**
```sql
-- Safe migration
ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'expense';
```

**3. Rollback if Needed**
```sql
-- Remove column
ALTER TABLE categories DROP COLUMN IF EXISTS type;
-- Then re-run migration
```

**4. Check for Data Issues**
```sql
-- Find problematic rows
SELECT * FROM categories WHERE type NOT IN ('expense', 'income', NULL);
```

---

#### Problem: Cannot delete category
**Symptoms:**
- Delete button doesn't work
- Error about foreign key constraint

**Solutions:**

**1. Check Category Usage**
```javascript
async deleteCategory(id) {
    // Check if category is used
    const used = this.expenses.some(e => e.category_id === id);
    
    if (used) {
        alert(this.getText('category_in_use'));
        return;
    }
    
    // Proceed with delete
}
```

**2. Cascade Delete (if desired)**
```sql
-- Update foreign key constraint
ALTER TABLE expenses
DROP CONSTRAINT expenses_category_id_fkey,
ADD CONSTRAINT expenses_category_id_fkey
    FOREIGN KEY (category_id) 
    REFERENCES categories(id) 
    ON DELETE CASCADE;
```

**3. Set NULL on Delete (safer)**
```sql
ALTER TABLE expenses
DROP CONSTRAINT expenses_category_id_fkey,
ADD CONSTRAINT expenses_category_id_fkey
    FOREIGN KEY (category_id) 
    REFERENCES categories(id) 
    ON DELETE SET NULL;
```

---

### Performance Issues

#### Problem: App slow with many transactions
**Symptoms:**
- Lag when scrolling transaction list
- Charts take time to render
- Filter updates slow

**Solutions:**

**1. Limit Displayed Items**
```javascript
updateRecentExpenses() {
    let expenses = this.filterExpenses(this.expenses);
    
    // Limit to 10-20 items
    const limit = this.searchQuery ? 20 : 10;
    expenses = expenses.slice(0, limit);
    
    this.renderExpenses(expenses);
}
```

**2. Debounce Search Input**
```javascript
let searchTimeout;
document.getElementById('search-transactions').addEventListener('input', (e) => {
    clearTimeout(searchTimeout);
    searchTimeout = setTimeout(() => {
        this.searchQuery = e.target.value;
        this.updateRecentExpenses();
    }, 300);  // Wait 300ms after typing stops
});
```

**3. Optimize Chart Updates**
```javascript
updateCharts() {
    // Only update if data changed
    if (JSON.stringify(this.expenses) === this.lastChartData) {
        return;
    }
    
    this.lastChartData = JSON.stringify(this.expenses);
    
    // Proceed with chart update
}
```

**4. Use Virtual Scrolling (advanced)**
- Consider library like `virtual-scroller` for 100+ items

---

### Export/Import Issues

#### Problem: CSV export doesn't include all data
**Solution:**

```javascript
exportToCSV() {
    const headers = ['Date', 'Description', 'Amount', 'Category', 'Type'];
    const rows = this.expenses.map(e => {
        const category = this.categories.find(c => c.id === e.category_id);
        return [
            e.date,
            `"${e.description}"`,  // ← Escape commas in description
            e.amount,
            category ? category.name : 'N/A',
            e.type
        ];
    });
    
    const csv = [headers, ...rows]
        .map(row => row.join(','))
        .join('\n');
    
    return csv;
}
```

---

#### Problem: JSON import overwrites existing data
**Solution:**

```javascript
async importData(jsonData) {
    if (!confirm('This will ADD to existing data. Continue?')) {
        return;
    }
    
    // Import items one by one
    for (const expense of jsonData.expenses) {
        await supabase.from('expenses').insert(expense);
    }
    
    // Reload data
    await this.loadUserData();
    this.updateUI();
}
```

---

## 🆘 Emergency Procedures

### Database Corruption
1. Export current data immediately (JSON + CSV)
2. Check Supabase logs for errors
3. Contact Supabase support if needed
4. Restore from backup if available

### User Cannot Login
1. Check Supabase Auth status
2. Verify email confirmed (if required)
3. Reset password via Supabase dashboard
4. Check auth redirect URLs configured

### Site Down
1. Check Netlify deployment status
2. Verify GitHub repo accessible
3. Check Supabase project status
4. Rollback to last working commit if needed

---

## 📞 Getting Help

### Before Asking for Help
- [ ] Checked console for errors
- [ ] Checked network tab for failed requests
- [ ] Reviewed this troubleshooting guide
- [ ] Tested in different browser
- [ ] Checked Supabase dashboard for issues

### Information to Provide
1. **Error message** (full text + screenshot)
2. **Browser & version** (Chrome 119, Firefox 120, etc.)
3. **Steps to reproduce** (detailed)
4. **Expected vs actual behavior**
5. **Console logs** (relevant parts)
6. **Network requests** (if applicable)

### Useful Debug Snippets

**Full State Dump:**
```javascript
console.log({
    user: this.user,
    profile: this.profile,
    expenses: this.expenses.length,
    categories: this.categories.length,
    theme: this.theme,
    language: this.language
});
```

**Session Check:**
```javascript
const { data: { session } } = await supabase.auth.getSession();
console.log('Session:', session);
console.log('Expires:', new Date(session?.expires_at * 1000));
```

**RLS Test:**
```javascript
const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .limit(1);
console.log('Can read expenses:', !error);
console.log('Error:', error);
```

---

**Last Updated:** 2025-11-28
