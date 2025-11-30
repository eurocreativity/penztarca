# Recurring Transactions Implementation Plan

**Project:** Pénztárca Personal Finance Web App
**Version:** 1.5 (Post Toast Notifications v1.4)
**Date:** 2025-11-30
**Status:** PLANNING PHASE

---

## 1. Overview

### What are Recurring Transactions?

Recurring transactions are regularly scheduled financial events (expenses or income) that repeat automatically at fixed intervals. Examples include monthly rent, weekly grocery budgets, quarterly insurance payments, or annual subscriptions.

### Why This Feature is Valuable

**User Pain Points Solved:**
- Manual entry of repetitive transactions is tedious and error-prone
- Users forget to log regular expenses/income
- Historical data becomes incomplete due to missed entries
- No way to plan for predictable future expenses
- Difficulty budgeting for recurring obligations

**Benefits:**
- **Automation:** Transactions automatically generated on schedule
- **Accuracy:** Never miss recording a recurring payment
- **Forecasting:** Better budget planning with predictable entries
- **Time Saving:** Set once, generate hundreds of times
- **Flexibility:** Pause/resume without deleting the pattern
- **Complete History:** Full transaction log for analysis

### Expected User Experience

**User Journey:**
1. User clicks "Add Recurring Transaction" button
2. Fills out form: amount, category, description, frequency, start date
3. Optionally sets end date (or leaves open-ended)
4. System automatically generates actual transactions when due
5. User can view/edit/pause/delete recurring patterns
6. Generated transactions appear in normal transaction list
7. User sees both active and paused recurring items in dedicated list

**Example Use Cases:**
- **Rent:** $800/month starting Jan 1, no end date
- **Salary:** $3000/month income, every 30 days
- **Gym Membership:** $50/month, quarterly billing (every 90 days)
- **Weekly Groceries:** $100/week, every 7 days
- **Annual Insurance:** $1200/year, every 365 days
- **Subscription:** $15/month, started March 15, ends in December

---

## 2. Database Design

### Recurring Transactions Table Schema

```sql
CREATE TABLE recurring_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE RESTRICT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('expense', 'income')),
  frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'semiannual', 'annual')),
  start_date DATE NOT NULL,
  end_date DATE,
  next_occurrence DATE NOT NULL,
  last_generated_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

### Field Descriptions

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `id` | UUID | Yes | Unique identifier for recurring pattern |
| `user_id` | UUID | Yes | Links to auth.users, CASCADE delete |
| `amount` | DECIMAL(10,2) | Yes | Transaction amount (positive for both types) |
| `category_id` | UUID | Yes | Links to categories, RESTRICT delete |
| `description` | TEXT | Yes | Description for generated transactions |
| `type` | TEXT | Yes | 'expense' or 'income' |
| `frequency` | TEXT | Yes | How often to repeat (see patterns below) |
| `start_date` | DATE | Yes | First occurrence date |
| `end_date` | DATE | No | Optional end date (NULL = indefinite) |
| `next_occurrence` | DATE | Yes | Next date to generate transaction |
| `last_generated_date` | DATE | No | Last successful generation date |
| `is_active` | BOOLEAN | Yes | false = paused, true = active |
| `created_at` | TIMESTAMP | Yes | Record creation timestamp |
| `updated_at` | TIMESTAMP | Yes | Last modification timestamp |

### Frequency Patterns & Intervals

| Frequency | Days | Use Case |
|-----------|------|----------|
| `daily` | 1 | Daily medication cost, daily parking |
| `weekly` | 7 | Weekly grocery shopping, weekly cleaning service |
| `biweekly` | 14 | Biweekly paycheck, every 2 weeks |
| `monthly` | 30 | Rent, utilities, most subscriptions |
| `quarterly` | 90 | Quarterly taxes, seasonal payments |
| `semiannual` | 180 | Biannual insurance, 6-month check-ups |
| `annual` | 365 | Annual membership, yearly subscription |

**Note:** We use fixed day intervals (30, 90, 180, 365) rather than calendar months/years for simplicity and consistency. This means:
- Monthly on Jan 1 → Feb 1 → Mar 3 → Apr 2 (due to varying month lengths)
- For exact calendar-based recurring (e.g., "1st of every month"), this is future enhancement

### Indexes for Performance

```sql
-- Index for user's recurring transactions lookup
CREATE INDEX idx_recurring_user_id ON recurring_transactions(user_id);

-- Index for finding due transactions (generation query)
CREATE INDEX idx_recurring_next_occurrence
ON recurring_transactions(next_occurrence)
WHERE is_active = true;

-- Composite index for user + active status filtering
CREATE INDEX idx_recurring_user_active
ON recurring_transactions(user_id, is_active);
```

### Row-Level Security (RLS) Policies

```sql
-- Enable RLS on table
ALTER TABLE recurring_transactions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view only their own recurring transactions
CREATE POLICY "Users can view own recurring transactions"
ON recurring_transactions FOR SELECT
USING (auth.uid() = user_id);

-- Policy: Users can insert their own recurring transactions
CREATE POLICY "Users can insert own recurring transactions"
ON recurring_transactions FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own recurring transactions
CREATE POLICY "Users can update own recurring transactions"
ON recurring_transactions FOR UPDATE
USING (auth.uid() = user_id);

-- Policy: Users can delete their own recurring transactions
CREATE POLICY "Users can delete own recurring transactions"
ON recurring_transactions FOR DELETE
USING (auth.uid() = user_id);
```

### Relationship with Existing Tables

**Expenses Table:**
- Recurring transactions generate actual `expenses` records
- Generated expenses have normal fields: amount, category_id, description, date, type
- No direct foreign key linking expenses back to recurring (keeps it simple)
- Users can edit/delete generated expenses independently

**Categories Table:**
- `category_id` foreign key with `ON DELETE RESTRICT`
- Cannot delete category if recurring transaction uses it
- Same behavior as regular expenses

**Profiles Table:**
- No direct link, but recurring transactions belong to users
- User preferences (language) apply to recurring UI

---

## 3. RecurringManager Class Specification

### Class Location & Integration

**File:** `f:\AI\Penztarca\app.js`
**Location:** Add after line 2700 (after existing manager classes)
**Integration:** Instantiate in `FinanceApp` constructor

### Class Structure

```javascript
class RecurringManager {
    constructor(app) {
        this.app = app; // Reference to FinanceApp instance
        this.recurring = []; // Array of recurring transaction objects
        this.autoCheckInterval = null; // Interval for automatic checking
    }

    // ===== CORE METHODS =====

    /**
     * Load all recurring transactions for current user
     * @returns {Promise<void>}
     */
    async loadRecurring() {
        try {
            const { data, error } = await window.supabaseClient
                .from('recurring_transactions')
                .select('*')
                .eq('user_id', this.app.currentUser.id)
                .order('next_occurrence', { ascending: true });

            if (error) throw error;

            this.recurring = data || [];
            this.renderRecurringList();
        } catch (error) {
            console.error('Error loading recurring transactions:', error);
            this.app.toast(this.app.getText('loadingRecurringError'), 'error');
        }
    }

    /**
     * Save recurring transaction (create or update)
     * @param {Object} data - Recurring transaction data
     * @returns {Promise<boolean>} Success status
     */
    async saveRecurring(data) {
        try {
            const recurringData = {
                user_id: this.app.currentUser.id,
                amount: parseFloat(data.amount),
                category_id: data.category_id,
                description: data.description,
                type: data.type,
                frequency: data.frequency,
                start_date: data.start_date,
                end_date: data.end_date || null,
                next_occurrence: data.next_occurrence || data.start_date,
                is_active: data.is_active !== undefined ? data.is_active : true,
                updated_at: new Date().toISOString()
            };

            let result;
            if (data.id) {
                // Update existing
                result = await window.supabaseClient
                    .from('recurring_transactions')
                    .update(recurringData)
                    .eq('id', data.id);
            } else {
                // Create new
                result = await window.supabaseClient
                    .from('recurring_transactions')
                    .insert([recurringData]);
            }

            if (result.error) throw result.error;

            await this.loadRecurring();
            this.app.toast(this.app.getText('recurringSaved'), 'success');
            return true;
        } catch (error) {
            console.error('Error saving recurring transaction:', error);
            this.app.toast(this.app.getText('saveError'), 'error');
            return false;
        }
    }

    /**
     * Delete recurring transaction
     * @param {string} id - Recurring transaction ID
     * @returns {Promise<boolean>} Success status
     */
    async deleteRecurring(id) {
        try {
            const { error } = await window.supabaseClient
                .from('recurring_transactions')
                .delete()
                .eq('id', id)
                .eq('user_id', this.app.currentUser.id);

            if (error) throw error;

            await this.loadRecurring();
            this.app.toast(this.app.getText('recurringDeleted'), 'success');
            return true;
        } catch (error) {
            console.error('Error deleting recurring transaction:', error);
            this.app.toast(this.app.getText('deleteError'), 'error');
            return false;
        }
    }

    /**
     * Toggle active status (pause/resume)
     * @param {string} id - Recurring transaction ID
     * @returns {Promise<boolean>} Success status
     */
    async toggleActive(id) {
        try {
            const recurring = this.recurring.find(r => r.id === id);
            if (!recurring) return false;

            const { error } = await window.supabaseClient
                .from('recurring_transactions')
                .update({
                    is_active: !recurring.is_active,
                    updated_at: new Date().toISOString()
                })
                .eq('id', id)
                .eq('user_id', this.app.currentUser.id);

            if (error) throw error;

            await this.loadRecurring();
            const status = !recurring.is_active ? 'recurringResumed' : 'recurringPaused';
            this.app.toast(this.app.getText(status), 'success');
            return true;
        } catch (error) {
            console.error('Error toggling recurring transaction:', error);
            this.app.toast(this.app.getText('saveError'), 'error');
            return false;
        }
    }

    /**
     * Check for due recurring transactions and generate them
     * Called on app init and periodically
     * @returns {Promise<number>} Number of transactions generated
     */
    async checkAndGenerate() {
        try {
            const today = new Date();
            today.setHours(0, 0, 0, 0); // Normalize to start of day

            const dueRecurring = this.recurring.filter(r => {
                if (!r.is_active) return false;

                const nextDate = new Date(r.next_occurrence);
                nextDate.setHours(0, 0, 0, 0);

                // Check if due today or overdue
                return nextDate <= today;
            });

            let generatedCount = 0;

            for (const recurring of dueRecurring) {
                const success = await this.generateTransaction(recurring.id);
                if (success) generatedCount++;
            }

            if (generatedCount > 0) {
                await this.app.loadExpenses(); // Refresh expense list
                this.app.toast(
                    this.app.getText('recurringGenerated').replace('{count}', generatedCount),
                    'success'
                );
            }

            return generatedCount;
        } catch (error) {
            console.error('Error checking recurring transactions:', error);
            return 0;
        }
    }

    /**
     * Generate actual transaction from recurring pattern
     * @param {string} recurringId - Recurring transaction ID
     * @returns {Promise<boolean>} Success status
     */
    async generateTransaction(recurringId) {
        try {
            const recurring = this.recurring.find(r => r.id === recurringId);
            if (!recurring) return false;

            const today = new Date();
            today.setHours(0, 0, 0, 0);

            // Create the actual expense/income transaction
            const transaction = {
                user_id: this.app.currentUser.id,
                amount: parseFloat(recurring.amount),
                category_id: recurring.category_id,
                description: `[Recurring] ${recurring.description}`,
                type: recurring.type,
                date: recurring.next_occurrence,
                created_at: new Date().toISOString()
            };

            const { error: insertError } = await window.supabaseClient
                .from('expenses')
                .insert([transaction]);

            if (insertError) throw insertError;

            // Calculate next occurrence
            const nextDate = this.calculateNextOccurrence(
                recurring.next_occurrence,
                recurring.frequency
            );

            // Check if we should continue (end_date check)
            const shouldContinue = !recurring.end_date || new Date(nextDate) <= new Date(recurring.end_date);

            // Update recurring transaction
            const updateData = {
                last_generated_date: recurring.next_occurrence,
                next_occurrence: nextDate,
                updated_at: new Date().toISOString()
            };

            // If past end date, deactivate
            if (!shouldContinue) {
                updateData.is_active = false;
            }

            const { error: updateError } = await window.supabaseClient
                .from('recurring_transactions')
                .update(updateData)
                .eq('id', recurringId);

            if (updateError) throw updateError;

            await this.loadRecurring();
            return true;
        } catch (error) {
            console.error('Error generating transaction:', error);
            return false;
        }
    }

    /**
     * Calculate next occurrence date based on frequency
     * @param {string} currentDate - Current occurrence date (YYYY-MM-DD)
     * @param {string} frequency - Frequency pattern
     * @returns {string} Next occurrence date (YYYY-MM-DD)
     */
    calculateNextOccurrence(currentDate, frequency) {
        const date = new Date(currentDate);

        const intervals = {
            daily: 1,
            weekly: 7,
            biweekly: 14,
            monthly: 30,
            quarterly: 90,
            semiannual: 180,
            annual: 365
        };

        const daysToAdd = intervals[frequency] || 30;
        date.setDate(date.getDate() + daysToAdd);

        // Return in YYYY-MM-DD format
        return date.toISOString().split('T')[0];
    }

    /**
     * Start automatic checking (every 6 hours)
     * Called on app initialization
     */
    startAutoCheck() {
        // Check immediately on start
        this.checkAndGenerate();

        // Check every 6 hours (21600000 ms)
        this.autoCheckInterval = setInterval(() => {
            this.checkAndGenerate();
        }, 21600000);
    }

    /**
     * Stop automatic checking
     */
    stopAutoCheck() {
        if (this.autoCheckInterval) {
            clearInterval(this.autoCheckInterval);
            this.autoCheckInterval = null;
        }
    }

    // ===== UI RENDERING METHODS =====

    /**
     * Render recurring transactions list in UI
     */
    renderRecurringList() {
        const container = document.getElementById('recurringList');
        if (!container) return;

        if (this.recurring.length === 0) {
            container.innerHTML = `
                <div class="text-center py-8 text-gray-500 dark:text-gray-400">
                    <i class="fas fa-sync-alt text-4xl mb-2 opacity-30"></i>
                    <p>${this.app.getText('noRecurring')}</p>
                </div>
            `;
            return;
        }

        // Separate active and paused
        const active = this.recurring.filter(r => r.is_active);
        const paused = this.recurring.filter(r => !r.is_active);

        let html = '';

        if (active.length > 0) {
            html += `<div class="mb-4">
                <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    ${this.app.getText('activeRecurring')}
                </h3>
                ${active.map(r => this.renderRecurringItem(r)).join('')}
            </div>`;
        }

        if (paused.length > 0) {
            html += `<div>
                <h3 class="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2">
                    ${this.app.getText('pausedRecurring')}
                </h3>
                ${paused.map(r => this.renderRecurringItem(r)).join('')}
            </div>`;
        }

        container.innerHTML = html;
    }

    /**
     * Render individual recurring transaction item
     * @param {Object} recurring - Recurring transaction object
     * @returns {string} HTML string
     */
    renderRecurringItem(recurring) {
        const category = this.app.categories.find(c => c.id === recurring.category_id);
        const categoryName = category ? category.name : 'Unknown';
        const categoryIcon = category ? category.icon : 'fa-question';

        const typeClass = recurring.type === 'expense' ? 'text-rose-600 dark:text-rose-400' : 'text-emerald-600 dark:text-emerald-400';
        const typeIcon = recurring.type === 'expense' ? 'fa-arrow-down' : 'fa-arrow-up';

        const frequencyText = this.app.getText(`frequency_${recurring.frequency}`);
        const statusBadge = recurring.is_active
            ? `<span class="px-2 py-1 text-xs bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded">${this.app.getText('active')}</span>`
            : `<span class="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">${this.app.getText('paused')}</span>`;

        const nextOccurrence = new Date(recurring.next_occurrence).toLocaleDateString(this.app.currentLanguage);
        const endDateText = recurring.end_date
            ? `${this.app.getText('until')} ${new Date(recurring.end_date).toLocaleDateString(this.app.currentLanguage)}`
            : this.app.getText('noEndDate');

        return `
            <div class="flex items-center justify-between p-3 mb-2 bg-white dark:bg-slate-700 rounded-lg border border-gray-200 dark:border-slate-600 hover:shadow-md transition-shadow">
                <div class="flex-1">
                    <div class="flex items-center gap-2 mb-1">
                        <i class="fas ${categoryIcon} text-gray-500"></i>
                        <span class="font-medium text-gray-900 dark:text-white">${recurring.description}</span>
                        ${statusBadge}
                    </div>
                    <div class="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                        <span class="${typeClass} font-semibold">
                            <i class="fas ${typeIcon} mr-1"></i>${recurring.amount.toLocaleString()} Ft
                        </span>
                        <span><i class="fas fa-tag mr-1"></i>${categoryName}</span>
                        <span><i class="fas fa-sync-alt mr-1"></i>${frequencyText}</span>
                        <span><i class="fas fa-calendar mr-1"></i>${nextOccurrence}</span>
                    </div>
                    <div class="text-xs text-gray-500 dark:text-gray-500 mt-1">
                        ${endDateText}
                    </div>
                </div>
                <div class="flex items-center gap-2">
                    <button onclick="window.app.recurringManager.toggleActive('${recurring.id}')"
                        class="p-2 text-gray-600 dark:text-gray-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                        title="${recurring.is_active ? this.app.getText('pauseRecurring') : this.app.getText('resumeRecurring')}">
                        <i class="fas ${recurring.is_active ? 'fa-pause' : 'fa-play'}"></i>
                    </button>
                    <button onclick="window.app.recurringManager.editRecurring('${recurring.id}')"
                        class="p-2 text-gray-600 dark:text-gray-400 hover:text-amber-600 dark:hover:text-amber-400 transition-colors"
                        title="${this.app.getText('edit')}">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button onclick="window.app.recurringManager.confirmDelete('${recurring.id}')"
                        class="p-2 text-gray-600 dark:text-gray-400 hover:text-rose-600 dark:hover:text-rose-400 transition-colors"
                        title="${this.app.getText('delete')}">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Show edit form for recurring transaction
     * @param {string} id - Recurring transaction ID
     */
    editRecurring(id) {
        const recurring = this.recurring.find(r => r.id === id);
        if (!recurring) return;

        // Populate form with existing data
        document.getElementById('recurringId').value = recurring.id;
        document.getElementById('recurringAmount').value = recurring.amount;
        document.getElementById('recurringCategory').value = recurring.category_id;
        document.getElementById('recurringDescription').value = recurring.description;
        document.querySelector(`input[name="recurringType"][value="${recurring.type}"]`).checked = true;
        document.getElementById('recurringFrequency').value = recurring.frequency;
        document.getElementById('recurringStartDate').value = recurring.start_date;
        document.getElementById('recurringEndDate').value = recurring.end_date || '';

        // Scroll to form
        document.getElementById('recurringForm').scrollIntoView({ behavior: 'smooth' });
    }

    /**
     * Confirm deletion with user
     * @param {string} id - Recurring transaction ID
     */
    confirmDelete(id) {
        if (confirm(this.app.getText('deleteRecurringConfirm'))) {
            this.deleteRecurring(id);
        }
    }

    /**
     * Clear recurring form
     */
    clearForm() {
        document.getElementById('recurringForm').reset();
        document.getElementById('recurringId').value = '';
    }
}
```

### Integration with FinanceApp Class

```javascript
// In FinanceApp constructor (around line 12)
class FinanceApp {
    constructor() {
        // ... existing properties ...
        this.recurringManager = null; // Will be initialized after auth
        this.init();
    }

    async init() {
        // ... existing init code ...

        // After successful auth and data load
        if (this.currentUser) {
            this.recurringManager = new RecurringManager(this);
            await this.recurringManager.loadRecurring();
            this.recurringManager.startAutoCheck();
        }
    }

    // Helper method for recurring form submission
    async handleRecurringSubmit(e) {
        e.preventDefault();

        const formData = {
            id: document.getElementById('recurringId').value || null,
            amount: document.getElementById('recurringAmount').value,
            category_id: document.getElementById('recurringCategory').value,
            description: document.getElementById('recurringDescription').value,
            type: document.querySelector('input[name="recurringType"]:checked').value,
            frequency: document.getElementById('recurringFrequency').value,
            start_date: document.getElementById('recurringStartDate').value,
            end_date: document.getElementById('recurringEndDate').value || null
        };

        const success = await this.recurringManager.saveRecurring(formData);
        if (success) {
            this.recurringManager.clearForm();
        }
    }
}
```

---

## 4. UI Components

### Recurring Transactions Card (Main List)

**Location in index.html:** After transaction list card (around line 1031)

```html
<!-- Recurring Transactions Card -->
<div class="bg-white/90 dark:bg-slate-800/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-4 sm:p-5">
    <!-- Header -->
    <div class="flex justify-between items-center mb-4">
        <h2 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <i class="fas fa-sync-alt text-violet-500 text-lg"></i>
            <span data-lang="recurringTransactions">Ismétlődő tranzakciók</span>
        </h2>
        <button id="addRecurringBtn"
            class="text-violet-600 dark:text-violet-400 hover:text-violet-700 text-sm font-medium flex items-center gap-1.5">
            <i class="fas fa-plus"></i>
            <span data-lang="addRecurring">Új ismétlődő</span>
        </button>
    </div>

    <!-- Recurring List -->
    <div id="recurringList" class="space-y-2 max-h-96 overflow-y-auto">
        <!-- Rendered by RecurringManager.renderRecurringList() -->
    </div>
</div>
```

### Recurring Transaction Form

**Location in index.html:** After expense form (around line 970)

```html
<!-- Recurring Transaction Form (Initially Hidden) -->
<div id="recurringFormCard" class="bg-white/90 dark:bg-slate-800/90 backdrop-blur-md rounded-xl shadow-lg border border-gray-200 dark:border-slate-700 p-4 sm:p-5 hidden">
    <div class="flex justify-between items-center mb-4">
        <h2 class="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white flex items-center gap-2">
            <i class="fas fa-sync-alt text-violet-500 text-lg"></i>
            <span data-lang="newRecurring">Új ismétlődő tranzakció</span>
        </h2>
        <button id="closeRecurringForm" class="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
            <i class="fas fa-times text-xl"></i>
        </button>
    </div>

    <form id="recurringForm" class="space-y-3">
        <input type="hidden" id="recurringId">

        <!-- Type selector -->
        <div>
            <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-2" data-lang="type">Típus</label>
            <div class="flex gap-2">
                <label class="flex-1 cursor-pointer">
                    <input type="radio" name="recurringType" value="expense" class="peer sr-only" checked>
                    <div class="px-4 py-2.5 bg-gray-100 dark:bg-slate-700 border-2 border-gray-300 dark:border-slate-600 rounded-lg text-center font-medium text-sm peer-checked:bg-rose-500 peer-checked:border-rose-500 peer-checked:text-white transition-all">
                        <i class="fas fa-arrow-down mr-1"></i> <span data-lang="expense">Kiadás</span>
                    </div>
                </label>
                <label class="flex-1 cursor-pointer">
                    <input type="radio" name="recurringType" value="income" class="peer sr-only">
                    <div class="px-4 py-2.5 bg-gray-100 dark:bg-slate-700 border-2 border-gray-300 dark:border-slate-600 rounded-lg text-center font-medium text-sm peer-checked:bg-emerald-500 peer-checked:border-emerald-500 peer-checked:text-white transition-all">
                        <i class="fas fa-arrow-up mr-1"></i> <span data-lang="income">Bevétel</span>
                    </div>
                </label>
            </div>
        </div>

        <!-- Amount and Category -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
                <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5" data-lang="amount">Összeg (Ft)</label>
                <input type="number" id="recurringAmount" required placeholder="10,000"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 dark:bg-slate-700/70 dark:text-white text-sm transition-all">
            </div>

            <div>
                <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5" data-lang="category">Kategória</label>
                <select id="recurringCategory" required
                    class="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 dark:bg-slate-700/70 dark:text-white text-sm transition-all">
                    <option value="" data-lang="selectCategory">Válassz...</option>
                    <!-- Populated by JavaScript -->
                </select>
            </div>
        </div>

        <!-- Description -->
        <div>
            <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5" data-lang="description">Leírás</label>
            <input type="text" id="recurringDescription" required placeholder="pl. Havi lakbér"
                class="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 dark:bg-slate-700/70 dark:text-white text-sm transition-all">
        </div>

        <!-- Frequency -->
        <div>
            <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5" data-lang="frequency">Gyakoriság</label>
            <select id="recurringFrequency" required
                class="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 dark:bg-slate-700/70 dark:text-white text-sm transition-all">
                <option value="daily" data-lang="frequency_daily">Naponta (1 nap)</option>
                <option value="weekly" data-lang="frequency_weekly">Hetente (7 nap)</option>
                <option value="biweekly" data-lang="frequency_biweekly">Kéthetente (14 nap)</option>
                <option value="monthly" data-lang="frequency_monthly" selected>Havonta (30 nap)</option>
                <option value="quarterly" data-lang="frequency_quarterly">Negyedévente (90 nap)</option>
                <option value="semiannual" data-lang="frequency_semiannual">Félévente (180 nap)</option>
                <option value="annual" data-lang="frequency_annual">Évente (365 nap)</option>
            </select>
        </div>

        <!-- Start Date and End Date -->
        <div class="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
                <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5" data-lang="startDate">Kezdő dátum</label>
                <input type="date" id="recurringStartDate" required
                    class="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 dark:bg-slate-700/70 dark:text-white text-sm transition-all">
            </div>

            <div>
                <label class="block text-xs font-medium text-gray-600 dark:text-gray-400 mb-1.5">
                    <span data-lang="endDate">Befejező dátum</span>
                    <span class="text-xs text-gray-500 ml-1" data-lang="optional">(opcionális)</span>
                </label>
                <input type="date" id="recurringEndDate"
                    class="w-full px-3 py-2 border border-gray-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-violet-500 focus:border-violet-500 dark:bg-slate-700/70 dark:text-white text-sm transition-all">
            </div>
        </div>

        <!-- Submit buttons -->
        <div class="flex gap-2">
            <button type="submit"
                class="flex-1 px-4 py-3 bg-gradient-to-r from-violet-500 to-purple-600 text-white rounded-lg hover:from-violet-600 hover:to-purple-700 transition-all shadow-md hover:shadow-lg font-semibold text-sm sm:text-base flex items-center justify-center gap-2">
                <i class="fas fa-save"></i>
                <span data-lang="saveRecurring">Mentés</span>
            </button>
            <button type="button" id="cancelRecurringBtn"
                class="px-4 py-3 bg-gray-200 dark:bg-slate-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-300 dark:hover:bg-slate-600 transition-all font-semibold text-sm sm:text-base">
                <span data-lang="cancel">Mégse</span>
            </button>
        </div>
    </form>
</div>
```

### UI Interaction Flow

1. **Show/Hide Form:**
   - Click "Add Recurring" button → Show form card, hide normal expense form
   - Click close button / cancel → Hide form card, clear fields

2. **Form Submission:**
   - Validate all fields
   - Call `recurringManager.saveRecurring(data)`
   - Show success toast
   - Clear form and hide it
   - Refresh recurring list

3. **Edit Recurring:**
   - Click edit icon on recurring item
   - Populate form with existing data
   - Scroll to form
   - Submit updates existing record

4. **Toggle Active:**
   - Click pause/play icon
   - Update `is_active` status
   - Show success toast
   - Update list (move between Active/Paused sections)

5. **Delete Recurring:**
   - Click delete icon
   - Show confirm dialog
   - Delete from database
   - Show success toast
   - Refresh list

---

## 5. Integration Points

### Integration Point 1: FinanceApp Initialization

**File:** `app.js`
**Location:** `async init()` method (around line 323)

```javascript
async init() {
    // ... existing auth check ...

    if (this.currentUser) {
        await this.loadUserData();

        // Initialize RecurringManager
        this.recurringManager = new RecurringManager(this);
        await this.recurringManager.loadRecurring();

        // Start automatic checking
        this.recurringManager.startAutoCheck();

        // ... rest of init ...
    }
}
```

### Integration Point 2: Form Event Listeners

**File:** `app.js`
**Location:** Event listeners setup (around line 650)

```javascript
// Add recurring form toggle
document.getElementById('addRecurringBtn').addEventListener('click', () => {
    document.getElementById('recurringFormCard').classList.remove('hidden');
    document.getElementById('recurringFormCard').scrollIntoView({ behavior: 'smooth' });
});

document.getElementById('closeRecurringForm').addEventListener('click', () => {
    document.getElementById('recurringFormCard').classList.add('hidden');
    this.recurringManager.clearForm();
});

document.getElementById('cancelRecurringBtn').addEventListener('click', () => {
    document.getElementById('recurringFormCard').classList.add('hidden');
    this.recurringManager.clearForm();
});

// Recurring form submission
document.getElementById('recurringForm').addEventListener('submit', async (e) => {
    await this.handleRecurringSubmit(e);
});

// Populate recurring category dropdown when type changes
document.querySelectorAll('input[name="recurringType"]').forEach(radio => {
    radio.addEventListener('change', (e) => {
        this.populateRecurringCategories(e.target.value);
    });
});
```

### Integration Point 3: Category Dropdown Population

**File:** `app.js`
**Location:** New helper method (around line 1100)

```javascript
/**
 * Populate recurring transaction category dropdown
 * @param {string} type - 'expense' or 'income'
 */
populateRecurringCategories(type) {
    const select = document.getElementById('recurringCategory');
    if (!select) return;

    select.innerHTML = '<option value="">' + this.getText('selectCategory') + '</option>';

    const filteredCategories = this.categories.filter(cat => cat.type === type);

    filteredCategories.forEach(category => {
        const option = document.createElement('option');
        option.value = category.id;
        option.textContent = category.name;
        select.appendChild(option);
    });
}
```

### Integration Point 4: Cleanup on Logout

**File:** `app.js`
**Location:** Logout handler (around line 530)

```javascript
// In logout button event listener
logoutBtn.addEventListener('click', async () => {
    // Stop recurring auto-check
    if (this.recurringManager) {
        this.recurringManager.stopAutoCheck();
    }

    // ... existing logout code ...
});
```

---

## 6. Translation Keys

### Hungarian Translation Keys (25+ keys)

Add to `this.languages.hu` object in `app.js`:

```javascript
hu: {
    // ... existing keys ...

    // Recurring Transactions UI
    recurringTransactions: 'Ismétlődő tranzakciók',
    addRecurring: 'Új ismétlődő',
    newRecurring: 'Új ismétlődő tranzakció',
    editRecurring: 'Ismétlődő szerkesztése',
    saveRecurring: 'Mentés',
    deleteRecurringConfirm: 'Biztosan törölni szeretnéd ezt az ismétlődő tranzakciót?',

    // Recurring Status
    activeRecurring: 'Aktív ismétlődések',
    pausedRecurring: 'Szüneteltetett ismétlődések',
    active: 'Aktív',
    paused: 'Szüneteltetve',
    pauseRecurring: 'Szüneteltetés',
    resumeRecurring: 'Folytatás',

    // Frequency Labels
    frequency: 'Gyakoriság',
    frequency_daily: 'Naponta (1 nap)',
    frequency_weekly: 'Hetente (7 nap)',
    frequency_biweekly: 'Kéthetente (14 nap)',
    frequency_monthly: 'Havonta (30 nap)',
    frequency_quarterly: 'Negyedévente (90 nap)',
    frequency_semiannual: 'Félévente (180 nap)',
    frequency_annual: 'Évente (365 nap)',

    // Date Labels
    startDate: 'Kezdő dátum',
    endDate: 'Befejező dátum',
    nextOccurrence: 'Következő generálás',
    until: 'Vége',
    noEndDate: 'Nincs határidő',
    optional: '(opcionális)',

    // Messages
    noRecurring: 'Még nincsenek ismétlődő tranzakciók',
    recurringSaved: 'Ismétlődő tranzakció mentve!',
    recurringDeleted: 'Ismétlődő tranzakció törölve!',
    recurringPaused: 'Ismétlődő tranzakció szüneteltetve',
    recurringResumed: 'Ismétlődő tranzakció folytatva',
    recurringGenerated: '{count} tranzakció automatikusan generálva',
    loadingRecurringError: 'Hiba az ismétlődő tranzakciók betöltésekor',
}
```

### English Translation Keys (25+ keys)

Add to `this.languages.en` object in `app.js`:

```javascript
en: {
    // ... existing keys ...

    // Recurring Transactions UI
    recurringTransactions: 'Recurring Transactions',
    addRecurring: 'Add Recurring',
    newRecurring: 'New Recurring Transaction',
    editRecurring: 'Edit Recurring',
    saveRecurring: 'Save',
    deleteRecurringConfirm: 'Are you sure you want to delete this recurring transaction?',

    // Recurring Status
    activeRecurring: 'Active Recurring',
    pausedRecurring: 'Paused Recurring',
    active: 'Active',
    paused: 'Paused',
    pauseRecurring: 'Pause',
    resumeRecurring: 'Resume',

    // Frequency Labels
    frequency: 'Frequency',
    frequency_daily: 'Daily (1 day)',
    frequency_weekly: 'Weekly (7 days)',
    frequency_biweekly: 'Biweekly (14 days)',
    frequency_monthly: 'Monthly (30 days)',
    frequency_quarterly: 'Quarterly (90 days)',
    frequency_semiannual: 'Semi-annual (180 days)',
    frequency_annual: 'Annual (365 days)',

    // Date Labels
    startDate: 'Start Date',
    endDate: 'End Date',
    nextOccurrence: 'Next Generation',
    until: 'Until',
    noEndDate: 'No end date',
    optional: '(optional)',

    // Messages
    noRecurring: 'No recurring transactions yet',
    recurringSaved: 'Recurring transaction saved!',
    recurringDeleted: 'Recurring transaction deleted!',
    recurringPaused: 'Recurring transaction paused',
    recurringResumed: 'Recurring transaction resumed',
    recurringGenerated: '{count} transaction(s) automatically generated',
    loadingRecurringError: 'Error loading recurring transactions',
}
```

---

## 7. Auto-Generation Logic

### When Transactions are Generated

**Timing:**
- On app initialization: `app.init()` → `recurringManager.startAutoCheck()`
- Every 6 hours: Automatic interval check
- Manual trigger: Admin or user can manually trigger (future enhancement)

**Process Flow:**

```
1. Load all recurring transactions for user
2. Filter to active (is_active = true)
3. Filter to due (next_occurrence <= today)
4. For each due recurring:
   a. Create actual expense/income transaction
   b. Set transaction date to next_occurrence
   c. Prefix description with "[Recurring]"
   d. Calculate new next_occurrence (add frequency days)
   e. Update recurring record:
      - last_generated_date = old next_occurrence
      - next_occurrence = calculated new date
      - If past end_date: set is_active = false
5. Reload expenses list to show new transactions
6. Show toast: "X transactions generated"
```

### Edge Cases & Handling

**1. User Opens App After Long Absence**
- Multiple occurrences may be overdue
- **Solution:** Only generate ONE transaction per recurring pattern per check
- **Reason:** Prevent flooding user with backlog
- **Future Enhancement:** Generate all missed occurrences (optional setting)

**2. Recurring Reaches End Date**
- After generating final transaction, next_occurrence > end_date
- **Solution:** Set `is_active = false` automatically
- User can see it in "Paused" section
- User can edit and extend end_date if needed

**3. Category Deleted**
- Category has `ON DELETE RESTRICT` foreign key
- **Solution:** Cannot delete category if recurring uses it
- Same behavior as regular expenses

**4. Overlapping Generations**
- User opens app in multiple tabs/devices
- **Solution:** Database-level uniqueness not enforced (by design)
- Accept potential duplicates (user can delete manually)
- **Future Enhancement:** Add `generated_for_date` unique constraint

**5. Timezone Issues**
- Date comparisons use UTC 00:00:00
- **Solution:** Normalize all dates to midnight in user's timezone
- Use `.setHours(0, 0, 0, 0)` before comparisons

### Example Calculation

**Scenario:** Monthly rent starting Jan 1, 2025

```javascript
Start Date: 2025-01-01
Frequency: monthly (30 days)

Generation 1 (Jan 1):
  - Create transaction for 2025-01-01
  - next_occurrence = 2025-01-01 + 30 days = 2025-01-31

Generation 2 (Jan 31):
  - Create transaction for 2025-01-31
  - next_occurrence = 2025-01-31 + 30 days = 2025-03-02

Generation 3 (Mar 2):
  - Create transaction for 2025-03-02
  - next_occurrence = 2025-03-02 + 30 days = 2025-04-01
```

**Note:** Dates drift slightly due to fixed 30-day intervals vs. actual month lengths. This is acceptable for simplicity.

---

## 8. Testing Checklist

### Database Tests

- [ ] Migration runs successfully without errors
- [ ] Table created with correct schema
- [ ] All indexes created
- [ ] RLS policies active and working
- [ ] Foreign key constraints enforced (CASCADE/RESTRICT)
- [ ] User can only see their own recurring transactions
- [ ] User cannot see other users' recurring transactions

### RecurringManager Class Tests

- [ ] `loadRecurring()` fetches all user's recurring transactions
- [ ] `saveRecurring()` creates new recurring transaction
- [ ] `saveRecurring()` updates existing recurring transaction
- [ ] `deleteRecurring()` removes recurring transaction
- [ ] `toggleActive()` pauses active recurring
- [ ] `toggleActive()` resumes paused recurring
- [ ] `calculateNextOccurrence()` correctly adds days for each frequency
- [ ] `generateTransaction()` creates actual expense/income
- [ ] `generateTransaction()` updates next_occurrence correctly
- [ ] `generateTransaction()` deactivates when past end_date
- [ ] `checkAndGenerate()` finds all due recurring transactions
- [ ] `checkAndGenerate()` skips paused recurring transactions
- [ ] `startAutoCheck()` runs check immediately on start
- [ ] `startAutoCheck()` sets up 6-hour interval
- [ ] `stopAutoCheck()` clears interval on logout

### UI Tests

- [ ] Recurring transactions card displays correctly
- [ ] "Add Recurring" button shows form
- [ ] Form has all required fields
- [ ] Type selector (expense/income) works
- [ ] Category dropdown filters by type
- [ ] Frequency dropdown has all 7 options
- [ ] Start date picker works
- [ ] End date picker is optional
- [ ] Form validation prevents empty fields
- [ ] Submit creates new recurring transaction
- [ ] Edit button populates form with existing data
- [ ] Submit with ID updates existing recurring
- [ ] Delete button shows confirmation
- [ ] Delete removes recurring from list
- [ ] Pause button changes active to paused
- [ ] Resume button changes paused to active
- [ ] Active/Paused sections display correctly
- [ ] Empty state shows when no recurring transactions
- [ ] List scrolls if more than ~5 items

### Generation Tests

- [ ] Daily recurring generates every 1 day
- [ ] Weekly recurring generates every 7 days
- [ ] Biweekly recurring generates every 14 days
- [ ] Monthly recurring generates every 30 days
- [ ] Quarterly recurring generates every 90 days
- [ ] Semiannual recurring generates every 180 days
- [ ] Annual recurring generates every 365 days
- [ ] Generated transaction appears in expense list
- [ ] Generated transaction has "[Recurring]" prefix
- [ ] Generated transaction has correct amount
- [ ] Generated transaction has correct category
- [ ] Generated transaction has correct type (expense/income)
- [ ] Generated transaction has correct date (next_occurrence)
- [ ] next_occurrence updated to future date
- [ ] last_generated_date updated to old next_occurrence
- [ ] Recurring auto-deactivates after end_date
- [ ] Multiple due recurring all generate correctly
- [ ] Toast notification shows count of generated transactions

### Integration Tests

- [ ] RecurringManager initialized on app start
- [ ] Auto-check runs on app initialization
- [ ] Recurring list loads after login
- [ ] Recurring form uses existing category system
- [ ] Recurring form uses existing toast notifications
- [ ] Recurring form uses existing loading states
- [ ] Recurring list updates after expense generation
- [ ] Category delete blocked if used by recurring
- [ ] Language switch updates all recurring UI text
- [ ] Dark mode applies to recurring UI
- [ ] Mobile responsive layout works
- [ ] Auto-check stops on logout

### Internationalization Tests

- [ ] All Hungarian labels display correctly
- [ ] All English labels display correctly
- [ ] Frequency labels localized
- [ ] Status labels localized
- [ ] Messages localized
- [ ] Date formatting uses current language locale
- [ ] Language switch updates recurring UI

### Performance Tests

- [ ] Load 50+ recurring transactions smoothly
- [ ] Generate 10+ transactions at once without lag
- [ ] Auto-check interval doesn't cause UI freeze
- [ ] List rendering is fast (<100ms)
- [ ] Form submission is responsive (<500ms)

---

## 9. Success Criteria

### Functionality Complete When:

1. ✅ Database migration successfully creates `recurring_transactions` table
2. ✅ RLS policies protect user data correctly
3. ✅ RecurringManager class fully functional with all methods
4. ✅ UI form allows creating recurring transactions
5. ✅ UI form allows editing recurring transactions
6. ✅ UI list displays active and paused recurring transactions
7. ✅ All 7 frequency patterns work correctly
8. ✅ Auto-generation runs on app init and every 6 hours
9. ✅ Generated transactions appear in expense list
10. ✅ Pause/resume functionality works
11. ✅ Delete functionality works with confirmation
12. ✅ All 27+ translation keys added (HU/EN)
13. ✅ Integration with existing systems complete
14. ✅ All 60+ test checklist items pass
15. ✅ No console errors or warnings
16. ✅ Code follows project conventions
17. ✅ Production-ready code quality

### User Acceptance Criteria:

1. User can create a recurring monthly expense (e.g., rent)
2. User can create a recurring weekly expense (e.g., groceries)
3. User can create a recurring annual expense (e.g., insurance)
4. User can create a recurring income (e.g., salary)
5. User can set an end date for recurring transaction
6. User can leave end date empty for indefinite recurring
7. User can pause a recurring transaction without deleting it
8. User can resume a paused recurring transaction
9. User can edit amount/category/frequency of recurring
10. User can delete a recurring transaction
11. User sees transactions automatically generated on schedule
12. User sees count notification when transactions are generated
13. User can distinguish generated transactions by "[Recurring]" prefix
14. User interface is intuitive and easy to use
15. All features work in both Hungarian and English

---

## 10. Agent Assignments & Deliverables

### Agent 1: Backend Developer (Database)

**Responsibility:** Database schema, migration, RLS policies

**Files to Create:**
- `f:\AI\Penztarca\migrations\add_recurring_transactions.sql`

**Deliverables:**

1. **Migration SQL File** (~80 lines)
   - CREATE TABLE with all 14 fields
   - 3 indexes for performance
   - Enable RLS on table
   - 4 RLS policies (SELECT, INSERT, UPDATE, DELETE)
   - Comments explaining each section

2. **Testing:**
   - Run migration in Supabase SQL editor
   - Verify table created with correct schema
   - Test RLS policies with test user
   - Verify foreign key constraints

**Estimated Lines of Code:** 80 lines SQL

**Integration Points:**
- None (standalone migration)

**Example Code:**

```sql
-- Recurring Transactions Migration
-- Adds support for automatically recurring expenses and income

-- Create main table
CREATE TABLE recurring_transactions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount DECIMAL(10,2) NOT NULL,
  category_id UUID REFERENCES categories(id) ON DELETE RESTRICT NOT NULL,
  description TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('expense', 'income')),
  frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'biweekly', 'monthly', 'quarterly', 'semiannual', 'annual')),
  start_date DATE NOT NULL,
  end_date DATE,
  next_occurrence DATE NOT NULL,
  last_generated_date DATE,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);

-- Create indexes
CREATE INDEX idx_recurring_user_id ON recurring_transactions(user_id);
CREATE INDEX idx_recurring_next_occurrence ON recurring_transactions(next_occurrence) WHERE is_active = true;
CREATE INDEX idx_recurring_user_active ON recurring_transactions(user_id, is_active);

-- Enable RLS
ALTER TABLE recurring_transactions ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own recurring transactions"
ON recurring_transactions FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own recurring transactions"
ON recurring_transactions FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own recurring transactions"
ON recurring_transactions FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own recurring transactions"
ON recurring_transactions FOR DELETE
USING (auth.uid() = user_id);
```

---

### Agent 2: RecurringManager Class Developer

**Responsibility:** JavaScript class for recurring transaction logic

**Files to Modify:**
- `f:\AI\Penztarca\app.js` (add RecurringManager class around line 2700)

**Deliverables:**

1. **RecurringManager Class** (~350 lines)
   - Constructor with app reference
   - 10+ core methods:
     * `loadRecurring()` - Fetch from database
     * `saveRecurring(data)` - Create/update
     * `deleteRecurring(id)` - Delete
     * `toggleActive(id)` - Pause/resume
     * `checkAndGenerate()` - Find and generate due transactions
     * `generateTransaction(recurringId)` - Create actual transaction
     * `calculateNextOccurrence(date, frequency)` - Date math
     * `renderRecurringList()` - UI rendering
     * `renderRecurringItem(recurring)` - Individual item HTML
     * `editRecurring(id)` - Populate edit form
     * `confirmDelete(id)` - Delete with confirmation
     * `clearForm()` - Reset form
     * `startAutoCheck()` - Start interval
     * `stopAutoCheck()` - Clear interval

2. **Integration Code** (~50 lines)
   - Add `this.recurringManager` to FinanceApp constructor
   - Add initialization in `app.init()`
   - Add form event listeners
   - Add `handleRecurringSubmit()` method
   - Add `populateRecurringCategories()` helper
   - Add cleanup on logout

**Estimated Lines of Code:** 400 lines JavaScript

**Integration Points:**
- FinanceApp.constructor
- FinanceApp.init()
- FinanceApp event listeners
- FinanceApp.loadExpenses() (refresh after generation)
- FinanceApp.getText() (i18n)
- FinanceApp.toast() (notifications)

**Key Logic Examples:**

```javascript
// Calculate next occurrence
calculateNextOccurrence(currentDate, frequency) {
    const date = new Date(currentDate);
    const intervals = {
        daily: 1, weekly: 7, biweekly: 14, monthly: 30,
        quarterly: 90, semiannual: 180, annual: 365
    };
    date.setDate(date.getDate() + intervals[frequency]);
    return date.toISOString().split('T')[0];
}

// Check and generate due transactions
async checkAndGenerate() {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const dueRecurring = this.recurring.filter(r => {
        if (!r.is_active) return false;
        const nextDate = new Date(r.next_occurrence);
        nextDate.setHours(0, 0, 0, 0);
        return nextDate <= today;
    });

    let count = 0;
    for (const r of dueRecurring) {
        if (await this.generateTransaction(r.id)) count++;
    }

    if (count > 0) {
        await this.app.loadExpenses();
        this.app.toast(
            this.app.getText('recurringGenerated').replace('{count}', count),
            'success'
        );
    }
    return count;
}
```

---

### Agent 3: UI Developer (Frontend)

**Responsibility:** HTML structure for recurring UI

**Files to Modify:**
- `f:\AI\Penztarca\index.html` (add recurring UI sections)

**Deliverables:**

1. **Recurring Transactions List Card** (~30 lines HTML)
   - Section header with icon
   - "Add Recurring" button
   - Container div for recurring list
   - Location: After transaction list (line ~1031)

2. **Recurring Transaction Form Card** (~90 lines HTML)
   - Form header with close button
   - Hidden input for ID (edit mode)
   - Type selector (expense/income) radio buttons
   - Amount and category inputs
   - Description input
   - Frequency dropdown (7 options)
   - Start date and end date pickers
   - Submit and cancel buttons
   - Location: After expense form (line ~970)

3. **Event Listener Setup** (~30 lines JS)
   - Show/hide form buttons
   - Form submission handler
   - Cancel button handler
   - Type change handler (for category filtering)

**Estimated Lines of Code:** 150 lines HTML/JS

**Integration Points:**
- Existing form structure patterns (match expense form)
- Existing Tailwind CSS classes
- Existing data-lang attributes for i18n
- RecurringManager methods (called via window.app.recurringManager)

**Styling Guidelines:**
- Match existing card design (rounded-xl, shadow-lg, backdrop-blur)
- Use violet/purple theme for recurring (consistent with expense form)
- Responsive grid layout (1 column mobile, 2 columns desktop)
- Dark mode support (dark:bg-slate-800, etc.)

---

### Agent 4: Translation & Testing

**Responsibility:** Internationalization and quality assurance

**Files to Modify:**
- `f:\AI\Penztarca\app.js` (add translation keys to `this.languages` object)

**Deliverables:**

1. **Translation Keys** (~27 keys × 2 languages = 54 strings)
   - Hungarian translations in `languages.hu`
   - English translations in `languages.en`
   - Categories:
     * UI labels (10 keys)
     * Frequency labels (7 keys)
     * Status labels (4 keys)
     * Date labels (3 keys)
     * Messages (3 keys)

2. **Testing Documentation**
   - Test all 7 frequency patterns
   - Test auto-generation on app start
   - Test auto-generation after 6 hours (simulated)
   - Test pause/resume functionality
   - Test edit/delete functionality
   - Test end_date behavior
   - Test integration with expense list
   - Test mobile responsive layout
   - Test dark mode
   - Test Hungarian/English language switch

3. **Test Report** (Markdown document)
   - List of all tests performed
   - Screenshots of key features
   - Edge cases tested
   - Bugs found and fixed
   - Performance observations

**Estimated Lines of Code:** 60 lines (translation keys) + Test documentation

**Integration Points:**
- All UI elements with data-lang attributes
- All toast messages
- All confirmation dialogs

**Testing Scenarios:**

1. **Daily Recurring:** Medication cost, generates every day
2. **Weekly Recurring:** Grocery shopping, generates every 7 days
3. **Monthly Recurring:** Rent, generates every 30 days
4. **Annual Recurring:** Insurance, generates every 365 days
5. **With End Date:** Subscription ending in 3 months
6. **Without End Date:** Indefinite rent payment
7. **Paused Recurring:** Temporarily disabled, no generation
8. **Edit Frequency:** Change from monthly to quarterly
9. **Delete Recurring:** Remove pattern completely
10. **Multiple Due:** User returns after 2 weeks with weekly recurring

---

## 11. Potential Risks & Mitigation

### Risk 1: Multiple Devices Generating Duplicates

**Likelihood:** Medium
**Impact:** Low
**Scenario:** User opens app on phone and laptop simultaneously, both generate same recurring transaction

**Mitigation:**
- Accept potential duplicates as edge case
- User can manually delete duplicate if occurs
- **Future Enhancement:** Add database constraint to prevent duplicate generation for same date

**Cost-Benefit:** Risk acceptable for v1, enhancement for v2

---

### Risk 2: Timezone Confusion

**Likelihood:** Medium
**Impact:** Medium
**Scenario:** User travels across timezones, transactions generate at wrong times

**Mitigation:**
- Always normalize dates to midnight (00:00:00) before comparison
- Use user's browser timezone for date calculations
- Document that recurring uses local timezone

**Code Pattern:**
```javascript
const today = new Date();
today.setHours(0, 0, 0, 0); // Always normalize
```

---

### Risk 3: Performance with Many Recurring Transactions

**Likelihood:** Low
**Impact:** Low
**Scenario:** User has 100+ recurring transactions, UI becomes slow

**Mitigation:**
- Database indexes on `user_id` and `next_occurrence`
- Limit query to active recurring only
- Lazy loading / pagination if list exceeds 50 items (future)

**Threshold:** Acceptable for up to 200 recurring transactions per user

---

### Risk 4: Category Deletion Blocking

**Likelihood:** Medium
**Impact:** Low
**Scenario:** User can't delete category because recurring transaction uses it

**Mitigation:**
- Show clear warning toast explaining why deletion failed
- Suggest editing/deleting recurring transaction first
- Provide link to recurring list from error message (future enhancement)

**Translation Key:**
```javascript
categoryUsedByRecurring: 'Cannot delete this category because it is used by recurring transactions. Please edit or delete them first.'
```

---

### Risk 5: Missing Generations During Downtime

**Likelihood:** High
**Impact:** Medium
**Scenario:** User doesn't open app for 2 weeks, misses multiple recurring generations

**Current Behavior:** Only generates ONE transaction per recurring pattern per check
**Reason:** Prevent flooding user with backlog

**Mitigation:**
- Document behavior clearly in user guide
- **Future Enhancement:** Add "Generate All Missed" button
- **Future Enhancement:** Add setting: "Auto-generate backlog: Yes/No"

**User Education:**
- Recurring generates transactions when app is opened
- Check app regularly for accurate records
- Can manually add missed transactions if needed

---

### Risk 6: End Date Edge Cases

**Likelihood:** Low
**Impact:** Low
**Scenario:** End date exactly on next_occurrence date causes confusion

**Mitigation:**
- Generate transaction if `next_occurrence <= end_date` (inclusive)
- Deactivate AFTER generating final transaction
- Clear documentation of behavior

**Example:**
```
Recurring: Monthly rent, start: Jan 1, end: Mar 1
- Jan 1: Generate, next = Jan 31
- Jan 31: Generate, next = Mar 2
- Mar 2: next > end_date, deactivate (no generation)
Result: 2 transactions (Jan, Jan 31), NOT 3
```

---

## 12. Future Enhancements (Out of Scope for v1)

These features are NOT included in this implementation but could be added later:

1. **Calendar-Based Recurring**
   - "1st of every month" instead of "every 30 days"
   - Requires more complex date math
   - Would need new frequency types: `monthly_calendar`, `yearly_calendar`

2. **Custom Frequencies**
   - "Every 3 days", "Every 45 days", etc.
   - Add `custom_interval_days` field to table
   - Add UI input for custom day count

3. **Generate All Missed Transactions**
   - Button to backfill all missed occurrences
   - Useful after long absence
   - Requires loop logic to generate multiple

4. **Recurring Templates**
   - Save common recurring patterns (e.g., "Monthly Rent")
   - Quick-add from template library
   - Shared templates across users (optional)

5. **Recurring Transaction History**
   - Link generated expenses back to recurring pattern
   - Show "generated from recurring X" in expense detail
   - Add `recurring_id` field to expenses table

6. **Recurring Statistics**
   - Total amount saved via recurring
   - Average monthly recurring expenses
   - Chart: Recurring vs. one-time expenses

7. **Push Notifications**
   - "3 transactions generated while you were away"
   - Requires backend service (Supabase Edge Functions)

8. **Recurring Import/Export**
   - Include recurring in CSV export
   - Import recurring patterns from file

9. **Variable Amount Recurring**
   - Amount changes each occurrence (e.g., utilities)
   - Add amount formula or manual adjustment

10. **Recurring Budget Impact**
    - Show recurring expenses in budget calculation
    - Forecast: "Your recurring expenses will exceed budget in 2 months"

---

## 13. Implementation Timeline

### Week 1: Backend & Core Logic

**Day 1-2: Agent 1 (Database)**
- Create migration SQL file
- Test in Supabase SQL editor
- Verify RLS policies
- Document schema

**Day 3-4: Agent 2 (RecurringManager - Part 1)**
- Create RecurringManager class structure
- Implement CRUD methods (load, save, delete, toggle)
- Implement calculateNextOccurrence()
- Write unit tests for date calculations

**Day 5: Agent 2 (RecurringManager - Part 2)**
- Implement generation logic (checkAndGenerate, generateTransaction)
- Implement auto-check interval (start/stop)
- Integration with FinanceApp class
- Test generation with various frequencies

### Week 2: Frontend & Polish

**Day 1-2: Agent 3 (UI)**
- Create recurring list card HTML
- Create recurring form card HTML
- Add event listeners
- Style with Tailwind CSS (light/dark modes)
- Test responsive layout

**Day 3: Agent 2 & 3 (Integration)**
- Implement renderRecurringList() method
- Implement renderRecurringItem() method
- Connect form submission to RecurringManager
- Test UI interactions (add, edit, delete, pause)

**Day 4: Agent 4 (Translation)**
- Add all Hungarian translation keys
- Add all English translation keys
- Test language switching
- Verify all UI elements use i18n

**Day 5: Agent 4 (Testing)**
- Run full test checklist (60+ items)
- Test all frequency patterns
- Test edge cases (end date, pause, multiple due)
- Test integration with expense list
- Performance testing

### Week 3: QA & Deployment

**Day 1-2: Bug Fixes**
- Address any issues found in testing
- Code review and refactoring
- Documentation updates

**Day 3: Final Testing**
- User acceptance testing
- Cross-browser testing (Chrome, Firefox, Safari)
- Mobile device testing (iOS, Android)

**Day 4: Deployment Prep**
- Backup production database
- Prepare rollback plan
- Final code review
- Update IMPLEMENTATION_SUMMARY.txt

**Day 5: Deployment**
- Run migration on production database
- Deploy updated app.js and index.html
- Monitor for errors
- User announcement/tutorial

**Total Timeline:** 15 working days (~3 weeks)

---

## 14. Code Quality Standards

### JavaScript Conventions

1. **Class Structure:**
   - Constructor first
   - Public methods (alphabetical)
   - Private methods (prefix with _)
   - UI methods last

2. **Method Documentation:**
   - JSDoc comments for all public methods
   - @param and @returns tags
   - Example usage where complex

3. **Error Handling:**
   - Try-catch blocks for all async operations
   - Log errors to console
   - Show user-friendly toast messages
   - Never silently fail

4. **Code Comments:**
   - Comment WHY, not WHAT
   - Explain complex logic
   - Document edge cases

### SQL Conventions

1. **Naming:**
   - Tables: lowercase with underscores (recurring_transactions)
   - Indexes: prefix idx_ (idx_recurring_user_id)
   - Policies: descriptive names in quotes

2. **Structure:**
   - CREATE TABLE first
   - Indexes second
   - RLS enable third
   - Policies last

3. **Comments:**
   - Section headers with -- comments
   - Explain purpose of each policy
   - Document constraints

### HTML/CSS Conventions

1. **Structure:**
   - Semantic HTML5 elements
   - Consistent indentation (2 spaces)
   - Data attributes for i18n (data-lang)

2. **Tailwind CSS:**
   - Follow project's existing patterns
   - Use utility classes, avoid custom CSS
   - Dark mode variants (dark:)
   - Responsive variants (sm:, md:, lg:)

3. **Accessibility:**
   - ARIA labels for screen readers
   - Keyboard navigation support
   - Sufficient color contrast

---

## 15. Summary

### What We're Building

A comprehensive recurring transactions system that:
- Allows users to create recurring expenses and income
- Automatically generates transactions on schedule
- Supports 7 frequency patterns (daily to annual)
- Provides pause/resume functionality
- Integrates seamlessly with existing expense tracking
- Works in Hungarian and English

### Key Benefits

**For Users:**
- Save time on repetitive data entry
- Never forget to log regular expenses
- Better budget planning with predictable entries
- Complete financial history

**For App:**
- Competitive feature parity with commercial apps
- Increased user engagement (daily/weekly check-ins)
- Foundation for forecasting features

### Estimated Scope

| Metric | Count |
|--------|-------|
| **Lines of Code** | ~680 total |
| **Database Tables** | 1 new table |
| **JavaScript Classes** | 1 new class (RecurringManager) |
| **UI Components** | 2 new cards (list + form) |
| **Translation Keys** | 27 keys × 2 languages = 54 strings |
| **Test Items** | 60+ checklist items |
| **Agent Hours** | ~60 hours total |
| **Calendar Time** | 3 weeks |

### Agent Workload Distribution

| Agent | Responsibility | LOC | Estimated Hours |
|-------|---------------|-----|-----------------|
| Agent 1 | Database (SQL) | 80 | 8 hours |
| Agent 2 | RecurringManager (JS) | 400 | 32 hours |
| Agent 3 | UI (HTML/CSS) | 150 | 12 hours |
| Agent 4 | i18n & Testing | 60 | 8 hours |
| **Total** | | **690** | **60 hours** |

### Integration Points Summary

1. **Database:** New `recurring_transactions` table with RLS
2. **FinanceApp.init():** Initialize RecurringManager, start auto-check
3. **FinanceApp.constructor:** Add `this.recurringManager` property
4. **Event Listeners:** Form submission, show/hide, type change
5. **Translation System:** 27 new keys in existing languages object
6. **Toast Notifications:** Success/error messages for all actions
7. **Loading States:** Apply existing patterns to recurring operations
8. **Category System:** Use existing categories, filter by type
9. **Expense List:** Display generated transactions with "[Recurring]" prefix
10. **Logout Handler:** Stop auto-check interval on logout

### Success Metrics

**Technical:**
- Zero console errors
- All 60+ tests pass
- <500ms form submission
- <100ms list rendering
- Works on all browsers (Chrome, Firefox, Safari)

**User Experience:**
- Intuitive UI (no user guide needed)
- Clear feedback (toasts for all actions)
- Responsive (works on mobile/tablet/desktop)
- Accessible (keyboard navigation, screen readers)
- Bilingual (Hungarian/English)

**Functionality:**
- All 7 frequencies work correctly
- Auto-generation runs reliably
- Pause/resume works as expected
- Edit/delete work correctly
- Integration with expenses seamless

---

## 16. Next Steps

### Pre-Implementation Checklist

- [ ] Review this plan with all agents
- [ ] Confirm understanding of requirements
- [ ] Clarify any ambiguities
- [ ] Agree on timeline and milestones
- [ ] Set up communication channels
- [ ] Prepare development environment (Supabase access, local server)

### Phase 1: Backend Setup (Agent 1)

- [ ] Create `migrations/add_recurring_transactions.sql`
- [ ] Test migration in Supabase SQL editor
- [ ] Verify table schema matches specification
- [ ] Test RLS policies with test user
- [ ] Document any schema changes/decisions
- [ ] Commit migration file to repository

### Phase 2: Core Logic (Agent 2)

- [ ] Create RecurringManager class in `app.js`
- [ ] Implement all CRUD methods
- [ ] Implement date calculation logic
- [ ] Implement generation logic
- [ ] Test each method individually
- [ ] Integrate with FinanceApp class
- [ ] Test auto-check functionality

### Phase 3: UI Development (Agent 3)

- [ ] Add recurring list card to `index.html`
- [ ] Add recurring form card to `index.html`
- [ ] Add event listeners for all buttons
- [ ] Style with Tailwind CSS (light/dark modes)
- [ ] Test responsive layout (mobile/desktop)
- [ ] Test form validation
- [ ] Test show/hide interactions

### Phase 4: i18n & Testing (Agent 4)

- [ ] Add all Hungarian translation keys
- [ ] Add all English translation keys
- [ ] Test language switching
- [ ] Run full test checklist
- [ ] Test all frequency patterns
- [ ] Test edge cases
- [ ] Document bugs found
- [ ] Create test report

### Phase 5: Integration & QA

- [ ] Full integration testing
- [ ] Cross-browser testing
- [ ] Mobile device testing
- [ ] Performance testing
- [ ] User acceptance testing
- [ ] Code review
- [ ] Documentation update

### Phase 6: Deployment

- [ ] Backup production database
- [ ] Run migration on production
- [ ] Deploy updated code
- [ ] Monitor for errors
- [ ] User announcement
- [ ] Celebrate! 🎉

---

**END OF IMPLEMENTATION PLAN**

**Questions or Concerns?**
Address before beginning implementation. This plan is a living document and can be updated as needed during development.

**Plan Version:** 1.0
**Last Updated:** 2025-11-30
**Status:** READY FOR IMPLEMENTATION
