# Database Schema & RLS Policies

## 🗄 Database Overview

**Platform:** Supabase (PostgreSQL)
**Project ID:** oavxilimosjrodillmea
**Dashboard:** https://supabase.com/dashboard/project/oavxilimosjrodillmea

## 📋 Tables

### 1. `profiles`
**Célja:** User profile és beállítások

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

**Mezők:**
- `id` - User UUID (auth.users foreign key)
- `name` - User megjelenített neve
- `budget` - Havi költségvetés (HUF)
- `language` - Nyelvi beállítás ('hu' | 'en')
- `created_at` - Létrehozás időpontja
- `updated_at` - Utolsó módosítás

**Kapcsolatok:**
- `auth.users(id)` → CASCADE DELETE

---

### 2. `categories`
**Célja:** Kiadási/bevételi kategóriák

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

**Mezők:**
- `id` - Auto-increment primary key
- `user_id` - Tulajdonos user UUID
- `name` - Kategória neve (pl. "Élelmiszer", "Fizetés")
- `color` - Hex color (pl. "#ef4444")
- `icon` - Font Awesome icon class (pl. "fa-shopping-cart")
- `type` - Kategória típusa ('expense' | 'income')
- `created_at` - Létrehozás időpontja

**Kapcsolatok:**
- `profiles(id)` → CASCADE DELETE

**Constraint:**
- `type` CHECK constraint: csak 'expense' vagy 'income'

**Default Categories (created on signup):**

**Expenses:**
- Élelmiszer (🛒 green)
- Közlekedés (🚗 blue)
- Szórakozás (🎬 purple)
- Számlák (💡 orange)
- Egyéb (📦 gray)

**Income:**
- Fizetés (💰 green)
- Jutalom (🎁 blue)
- Egyéb bevétel (💵 gray)

---

### 3. `expenses`
**Célja:** Tranzakciók (kiadások + bevételek)

⚠️ **Név ellenére ez tárolja MIND a kiadásokat, MIND a bevételeket!**

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

**Mezők:**
- `id` - Auto-increment primary key
- `user_id` - Tulajdonos user UUID
- `amount` - Összeg (HUF, mindig pozitív)
- `category_id` - Kategória ID (foreign key)
- `description` - Leírás (max 200 karakter UI-ban)
- `date` - Tranzakció dátuma (YYYY-MM-DD)
- `type` - Tranzakció típusa ('expense' | 'income')
- `created_at` - Rögzítés időpontja

**Kapcsolatok:**
- `profiles(id)` → CASCADE DELETE
- `categories(id)` → SET NULL vagy RESTRICT (ellenőrizni!)

**Constraint:**
- `type` CHECK constraint: csak 'expense' vagy 'income'
- `amount` > 0 (mindig pozitív)

---

## 🔐 Row Level Security (RLS)

### Concept
Minden tábla RLS-enabled. User csak saját adatait érheti el.

### Policy Pattern
```sql
-- SELECT policy
CREATE POLICY "Users can view own data"
ON table_name FOR SELECT
USING (auth.uid() = user_id);

-- INSERT policy
CREATE POLICY "Users can insert own data"
ON table_name FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- UPDATE policy
CREATE POLICY "Users can update own data"
ON table_name FOR UPDATE
USING (auth.uid() = user_id);

-- DELETE policy
CREATE POLICY "Users can delete own data"
ON table_name FOR DELETE
USING (auth.uid() = user_id);
```

### Profiles Table RLS
```sql
-- Enable RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING (auth.uid() = id);

-- Note: INSERT handled by trigger on auth.users signup
```

### Categories Table RLS
```sql
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own categories"
ON categories FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own categories"
ON categories FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own categories"
ON categories FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own categories"
ON categories FOR DELETE
USING (auth.uid() = user_id);
```

### Expenses Table RLS
```sql
ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own expenses"
ON expenses FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own expenses"
ON expenses FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own expenses"
ON expenses FOR UPDATE
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own expenses"
ON expenses FOR DELETE
USING (auth.uid() = user_id);
```

---

## 🔄 Migrations History

### Migration 1: Add Type Field
**File:** `migrations/add_type_to_categories.sql`
**Date:** 2025-11-28
**Purpose:** Add `type` field to categories table

```sql
ALTER TABLE categories 
ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'expense' 
CHECK (type IN ('expense', 'income'));
```

### Migration 2: Income Categories for Existing Users
**File:** `migrations/add_income_categories_for_existing_users.sql`
**Date:** 2025-11-28
**Purpose:** Create default income categories for all existing users

**⚠️ CRITICAL:** Run AFTER Migration 1!

---

## 📊 Common Queries

### Get User's Categories by Type
```sql
SELECT * FROM categories
WHERE user_id = auth.uid()
AND type = 'expense'
ORDER BY name;
```

### Get Monthly Expenses
```sql
SELECT 
    DATE_TRUNC('month', date) as month,
    SUM(amount) as total
FROM expenses
WHERE user_id = auth.uid()
AND type = 'expense'
AND date >= CURRENT_DATE - INTERVAL '6 months'
GROUP BY month
ORDER BY month;
```

### Get Category Distribution
```sql
SELECT 
    c.name,
    c.color,
    SUM(e.amount) as total
FROM expenses e
JOIN categories c ON e.category_id = c.id
WHERE e.user_id = auth.uid()
AND e.type = 'expense'
GROUP BY c.id, c.name, c.color
ORDER BY total DESC
LIMIT 5;
```

### Calculate Balance
```sql
SELECT 
    (SELECT COALESCE(SUM(amount), 0) FROM expenses WHERE user_id = auth.uid() AND type = 'income') -
    (SELECT COALESCE(SUM(amount), 0) FROM expenses WHERE user_id = auth.uid() AND type = 'expense')
    AS balance;
```

---

## 🎯 Type System Logic

### Important Rules
1. **Backward Compatibility:** Legacy data without `type` = 'expense'
2. **Filter Pattern:** Always check `type` OR `!type`
   ```javascript
   categories.filter(c => c.type === 'expense' || !c.type)
   ```
3. **Budget Calculation:** Only expenses count, NOT income
4. **Balance:** Income - Expenses

### Type Usage

**Categories:**
- Expense categories → type = 'expense'
- Income categories → type = 'income'
- Legacy categories → type = null (treated as expense)

**Transactions:**
- Kiadás → type = 'expense'
- Bevétel → type = 'income'

---

## 🛠 Troubleshooting

### RLS Issues
**Problem:** User can't see their data
**Solution:** Check if `auth.uid()` matches `user_id` in query

**Debug Query:**
```sql
SELECT auth.uid() as current_user_id;
SELECT * FROM profiles WHERE id = auth.uid();
```

### Migration Issues
**Problem:** Migration fails
**Solution:** 
1. Check if already applied: `SELECT * FROM categories LIMIT 1;`
2. Verify no syntax errors
3. Run in Supabase SQL Editor, not CLI

### Orphaned Data
**Problem:** Category deleted but expenses still reference it
**Solution:** Add ON DELETE CASCADE or SET NULL to foreign key

---

## 📝 Database Best Practices

1. **Always use transactions** for multi-table operations
2. **Check RLS policies** before debugging "no data" issues
3. **Test migrations** on dev environment first
4. **Backup before migration**: Export via Supabase Dashboard
5. **Use indexes** for frequently queried columns (user_id, date)

---

**Last Updated:** 2025-11-28
