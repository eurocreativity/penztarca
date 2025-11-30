# Development Guide

## 🎯 Code Style & Standards

### JavaScript Style (ES6+)

**Use:**
- ✅ ES6 Classes (not prototypes)
- ✅ Arrow functions
- ✅ async/await (not .then())
- ✅ Template literals (not string concatenation)
- ✅ Destructuring
- ✅ Const/Let (never var)

**Avoid:**
- ❌ var declarations
- ❌ Function prototypes
- ❌ Callback hell
- ❌ jQuery or other libraries

**Example:**
```javascript
// ✅ Good
class FinanceApp {
    async loadData() {
        const { data, error } = await supabase
            .from('expenses')
            .select('*');
        
        if (error) throw error;
        return data;
    }
}

// ❌ Bad
function FinanceApp() {
    this.loadData = function() {
        return supabase
            .from('expenses')
            .select('*')
            .then(function(response) {
                return response.data;
            });
    }
}
```

---

## 🏗 Architecture Patterns

### State Management
**Pattern:** Centralized state in FinanceApp class

```javascript
class FinanceApp {
    constructor() {
        // Single source of truth
        this.expenses = [];
        this.categories = [];
        this.profile = null;
    }
    
    async saveExpense(expenseData) {
        // 1. Validate
        if (!expenseData.amount) throw new Error('Amount required');
        
        // 2. DB Operation
        const { data, error } = await supabase
            .from('expenses')
            .insert(expenseData);
        
        if (error) throw error;
        
        // 3. Update Local State
        this.expenses.push(data[0]);
        
        // 4. Re-render UI
        this.updateUI();
    }
}
```

**Rule:** Always update local state THEN call updateUI()

---

### Error Handling
**Pattern:** Try-catch with user-friendly messages

```javascript
async saveExpense() {
    try {
        // DB operation
        const { error } = await supabase
            .from('expenses')
            .insert(data);
        
        if (error) throw error;
        
        // Success feedback
        alert(this.getText('success_message'));
        
    } catch (error) {
        console.error('Save failed:', error);
        alert(this.getText('error_message'));
    }
}
```

**Always:**
- Log errors to console
- Show user-friendly message
- Don't expose technical details to user

---

### Authentication Checks
**Pattern:** Always verify session before DB operations

```javascript
async saveExpense() {
    // 1. Check auth
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
        window.location.href = '/auth.html';
        return;
    }
    
    // 2. Add user_id
    const expenseData = {
        ...formData,
        user_id: session.user.id
    };
    
    // 3. Proceed with operation
    const { error } = await supabase
        .from('expenses')
        .insert(expenseData);
}
```

---

## 🌍 Internationalization (i18n)

### Adding New Text

**Step 1:** Add to languages object
```javascript
this.languages = {
    hu: {
        new_feature: 'Új funkció',
        new_button: 'Mentés'
    },
    en: {
        new_feature: 'New feature',
        new_button: 'Save'
    }
};
```

**Step 2:** Use getText() in code
```javascript
const title = this.getText('new_feature');
const button = this.getText('new_button');
```

**Step 3:** Update language switcher (if new section)
```javascript
updateLanguage() {
    // Add new elements
    document.getElementById('new-title').textContent = 
        this.getText('new_feature');
}
```

**Rules:**
- ✅ ALWAYS add to BOTH languages (hu + en)
- ✅ Use descriptive keys (not 'text1', 'text2')
- ✅ Never hardcode text in HTML/JS
- ✅ Test with both languages

---

## 🎨 Styling Guidelines

### Tailwind CSS Usage

**Responsive Design:**
```html
<!-- Mobile-first approach -->
<div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
    <!-- Content -->
</div>
```

**Dark Mode:**
```html
<div class="bg-white dark:bg-gray-800 text-gray-900 dark:text-white">
    <!-- Auto switches based on theme -->
</div>
```

**Common Patterns:**
```html
<!-- Card -->
<div class="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
    
<!-- Button -->
<button class="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg">

<!-- Input -->
<input class="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-4 py-2">
```

**Rules:**
- ✅ Use utility classes (not custom CSS)
- ✅ Always include dark mode variants
- ✅ Keep responsive breakpoints consistent
- ✅ Use Tailwind's color palette

---

## 🗄 Database Operations

### Supabase Query Patterns

**Select:**
```javascript
const { data, error } = await supabase
    .from('expenses')
    .select('*, categories(*)')  // Join with categories
    .eq('user_id', userId)
    .order('date', { ascending: false });
```

**Insert:**
```javascript
const { data, error } = await supabase
    .from('expenses')
    .insert({
        user_id: session.user.id,
        amount: 1000,
        description: 'Grocery',
        date: '2025-11-28',
        type: 'expense'
    })
    .select()
    .single();
```

**Update:**
```javascript
const { error } = await supabase
    .from('expenses')
    .update({ amount: 1500 })
    .eq('id', expenseId)
    .eq('user_id', userId);  // Security: verify ownership
```

**Delete:**
```javascript
const { error } = await supabase
    .from('expenses')
    .delete()
    .eq('id', expenseId)
    .eq('user_id', userId);  // Security: verify ownership
```

**Rules:**
- ✅ Always check error
- ✅ Always filter by user_id (RLS backup)
- ✅ Use .select() after insert/update to get returned data
- ✅ Use .single() when expecting one row

---

## 🧪 Testing Checklist

### Before Committing

**Functionality:**
- [ ] Feature works in Hungarian
- [ ] Feature works in English
- [ ] Feature works in light mode
- [ ] Feature works in dark mode
- [ ] Mobile responsive (test at 375px, 768px, 1440px)

**Error Handling:**
- [ ] Network error handled
- [ ] Invalid input handled
- [ ] Empty state handled
- [ ] User feedback provided

**Code Quality:**
- [ ] No console.log() left in code
- [ ] No commented-out code
- [ ] ES6+ patterns used
- [ ] Error messages are i18n

**Browser Testing:**
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (latest - if available)

---

## 🔧 Common Development Tasks

### Adding a New Filter

**Step 1:** Add state variable
```javascript
constructor() {
    this.filterNewField = 'all';
}
```

**Step 2:** Update filterExpenses()
```javascript
filterExpenses(expenses) {
    let filtered = expenses;
    
    // Existing filters...
    
    // New filter
    if (this.filterNewField !== 'all') {
        filtered = filtered.filter(e => 
            e.newField === this.filterNewField
        );
    }
    
    return filtered;
}
```

**Step 3:** Add UI control
```html
<select id="filter-new-field" class="...">
    <option value="all">All</option>
    <option value="option1">Option 1</option>
</select>
```

**Step 4:** Add event listener
```javascript
init() {
    document.getElementById('filter-new-field')
        .addEventListener('change', (e) => {
            this.filterNewField = e.target.value;
            this.updateRecentExpenses();
        });
}
```

**Step 5:** Update clear function
```javascript
clearAllFilters() {
    this.filterNewField = 'all';
    document.getElementById('filter-new-field').value = 'all';
}
```

---

### Adding a New Chart

**Step 1:** Add canvas in HTML
```html
<canvas id="new-chart"></canvas>
```

**Step 2:** Create chart in updateCharts()
```javascript
updateCharts() {
    // Existing charts...
    
    // New chart
    const ctx = document.getElementById('new-chart').getContext('2d');
    
    if (this.newChart) {
        this.newChart.destroy();  // Clean up old instance
    }
    
    this.newChart = new Chart(ctx, {
        type: 'bar',  // or 'line', 'pie', etc.
        data: {
            labels: ['Jan', 'Feb', 'Mar'],
            datasets: [{
                label: 'Dataset',
                data: [10, 20, 30],
                backgroundColor: '#3b82f6'
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true
        }
    });
}
```

**Step 3:** Update on data change
```javascript
async saveExpense() {
    // ... save logic
    this.updateUI();  // This calls updateCharts()
}
```

---

### Adding a New Transaction Field

**Step 1:** Update database
```sql
ALTER TABLE expenses 
ADD COLUMN new_field TEXT;
```

**Step 2:** Update form HTML
```html
<input type="text" id="expense-new-field" placeholder="New field">
```

**Step 3:** Update saveExpense()
```javascript
async saveExpense() {
    const formData = {
        amount: document.getElementById('expense-amount').value,
        // ... existing fields
        new_field: document.getElementById('expense-new-field').value
    };
    
    // ... rest of save logic
}
```

**Step 4:** Update display
```javascript
updateRecentExpenses() {
    expensesList.innerHTML = this.expenses.map(expense => `
        <div>
            ${expense.description}
            <div>${expense.new_field}</div>
        </div>
    `).join('');
}
```

**Step 5:** Add i18n
```javascript
this.languages = {
    hu: { new_field_label: 'Új mező' },
    en: { new_field_label: 'New field' }
};
```

---

## 🚀 Git Workflow

### Branch Naming
**CRITICAL:** Branch must start with `claude/` and end with session ID

```bash
# ✅ Correct
claude/search-filter-feature-017PEwetc7Mj1CvBwd8eVYjo
claude/fix-login-bug-018AbCdeFgHiJkLmNoPqRsTuV

# ❌ Wrong
feature/search-filter
fix-login-bug
```

### Commit Messages

**Format:** `[Component] Brief description`

**Examples:**
```bash
git commit -m "[Search] Add text filter functionality"
git commit -m "[Auth] Fix session persistence bug"
git commit -m "[UI] Update dark mode colors"
git commit -m "[DB] Add type field migration"
```

**Rules:**
- Start with component in brackets
- Use present tense ("Add" not "Added")
- Keep under 72 characters
- Be specific

### Pull Request Process

1. **Create feature branch**
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b claude/feature-name-<session-id>
   ```

2. **Make changes & commit**
   ```bash
   git add .
   git commit -m "[Component] Description"
   ```

3. **Push to remote**
   ```bash
   git push -u origin claude/feature-name-<session-id>
   ```

4. **Create PR on GitHub**
   - Base: `develop`
   - Compare: `claude/feature-name-<session-id>`
   - Title: Brief feature description
   - Description: What changed and why

5. **Merge to develop**
   - Review code
   - Test functionality
   - Merge PR

6. **Deploy to production**
   ```bash
   git checkout main
   git merge develop
   git push origin main
   # Netlify auto-deploys
   ```

---

## 📝 Documentation Standards

### Code Comments

**When to comment:**
- Complex logic
- Workarounds
- TODOs
- Critical sections

**Example:**
```javascript
// HACK: Firefox doesn't support this property yet
// Remove this workaround when FF 120+ is released
if (isFirefox) {
    element.style.overflow = 'clip';
}

// TODO: Refactor this to use async/await
// Currently using promises for legacy compatibility
```

### Function Documentation

**For complex functions:**
```javascript
/**
 * Filters expenses based on current filter state
 * @param {Array} expenses - Array of expense objects
 * @returns {Array} Filtered expense array
 * 
 * Applies search, type, category, and date range filters
 * in sequence. Returns original array if no filters active.
 */
filterExpenses(expenses) {
    // Implementation
}
```

---

## 🐛 Debugging Tips

### Common Issues

**1. Data not loading**
```javascript
// Check RLS policies
const { data, error } = await supabase
    .from('expenses')
    .select('*');

console.log('Data:', data);
console.log('Error:', error);
console.log('User ID:', session.user.id);
```

**2. UI not updating**
```javascript
// Ensure updateUI() is called
async saveExpense() {
    // ... DB operation
    this.expenses.push(newExpense);
    this.updateUI();  // ← Don't forget!
}
```

**3. i18n not working**
```javascript
// Check key exists
console.log(this.languages[this.language]);
console.log(this.getText('missing_key'));  // Returns key if not found
```

**4. Dark mode issues**
```javascript
// Verify theme class
console.log(document.body.classList);  // Should contain 'light' or 'dark'
```

---

## 🔐 Security Best Practices

1. **Always verify user_id** in queries
2. **Never trust client-side data** - validate on server
3. **Use RLS policies** as primary security
4. **Store tokens in localStorage** only (not cookies)
5. **No sensitive data** in URL params or logs
6. **Sanitize user input** before display
7. **Use HTTPS** in production always

---

**Last Updated:** 2025-11-28
