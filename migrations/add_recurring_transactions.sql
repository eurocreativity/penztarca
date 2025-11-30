-- ============================================================================
-- Recurring Transactions Migration
-- ============================================================================
-- This migration adds support for automatically recurring expenses and income.
-- Users can create recurring patterns (daily, weekly, monthly, etc.) and the
-- system will automatically generate actual transactions on schedule.
--
-- Version: 1.0
-- Date: 2025-11-30
-- ============================================================================

-- ============================================================================
-- 1. CREATE RECURRING TRANSACTIONS TABLE
-- ============================================================================
-- Main table for storing recurring transaction patterns.
-- Each record defines a pattern that generates actual transactions automatically.

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

-- ============================================================================
-- 2. TABLE COMMENTS
-- ============================================================================
-- Document table and column purposes for developers

COMMENT ON TABLE recurring_transactions IS 'Recurring transactions are regularly scheduled financial events (expenses or income) that repeat automatically at fixed intervals. Examples include monthly rent, weekly groceries, quarterly insurance, or annual subscriptions.';

COMMENT ON COLUMN recurring_transactions.id IS 'Unique identifier for each recurring transaction pattern';

COMMENT ON COLUMN recurring_transactions.user_id IS 'Foreign key to auth.users - identifies the owner of this recurring pattern. ON DELETE CASCADE ensures pattern is deleted when user is deleted.';

COMMENT ON COLUMN recurring_transactions.amount IS 'Transaction amount in currency units. Always positive, regardless of type (expense/income). The type field determines if it is subtracted or added to the user''s balance.';

COMMENT ON COLUMN recurring_transactions.category_id IS 'Foreign key to categories - groups recurring transactions by category (food, transport, etc.). ON DELETE RESTRICT prevents category deletion if used by an active recurring pattern.';

COMMENT ON COLUMN recurring_transactions.description IS 'User-friendly description of the recurring transaction. Example: "Monthly rent", "Weekly groceries", "Annual insurance".';

COMMENT ON COLUMN recurring_transactions.type IS 'Type of recurring transaction: ''expense'' (money out) or ''income'' (money in). Controls whether generated transactions are debits or credits.';

COMMENT ON COLUMN recurring_transactions.frequency IS 'Recurrence frequency determines how often transactions are generated:
  - daily: Every 1 day (e.g., daily parking cost)
  - weekly: Every 7 days (e.g., weekly grocery shopping)
  - biweekly: Every 14 days (e.g., biweekly paycheck)
  - monthly: Every 30 days (e.g., monthly rent) - Note: Uses fixed 30-day intervals, not calendar months
  - quarterly: Every 90 days (e.g., quarterly taxes)
  - semiannual: Every 180 days (e.g., biannual insurance)
  - annual: Every 365 days (e.g., yearly subscription)';

COMMENT ON COLUMN recurring_transactions.start_date IS 'Date when the recurring pattern begins. The first transaction will be generated on or after this date.';

COMMENT ON COLUMN recurring_transactions.end_date IS 'Optional date when the recurring pattern ends. If NULL, the pattern repeats indefinitely. When next_occurrence exceeds end_date, the pattern is automatically deactivated.';

COMMENT ON COLUMN recurring_transactions.next_occurrence IS 'The next date on which a transaction should be generated from this pattern. Updated after each generation. This field is critical for the generation scheduler to determine which recurring transactions are due.';

COMMENT ON COLUMN recurring_transactions.last_generated_date IS 'The date of the most recent transaction generation for this pattern. Used for auditing and tracking generation history. NULL if no transactions have been generated yet.';

COMMENT ON COLUMN recurring_transactions.is_active IS 'Boolean flag: true = pattern is active and generates transactions, false = pattern is paused and does not generate transactions. Users can toggle this to pause/resume without deleting the pattern.';

COMMENT ON COLUMN recurring_transactions.created_at IS 'Timestamp when this recurring pattern was created. Automatically set to current time on insert.';

COMMENT ON COLUMN recurring_transactions.updated_at IS 'Timestamp when this recurring pattern was last modified. Automatically set to current time on insert and update.';

-- ============================================================================
-- 3. CREATE INDEXES FOR PERFORMANCE
-- ============================================================================
-- Indexes are essential for efficient queries during recurring transaction lookups

-- Index 1: User ID lookup
-- Used for: Finding all recurring transactions for a specific user
-- Query Pattern: SELECT * FROM recurring_transactions WHERE user_id = ?
CREATE INDEX idx_recurring_user_id ON recurring_transactions(user_id);

-- Index 2: Next occurrence with active filter
-- Used for: Finding due recurring transactions to generate
-- Query Pattern: SELECT * FROM recurring_transactions WHERE is_active = true AND next_occurrence <= ? ORDER BY next_occurrence
-- Note: Partial index only includes active recurring transactions (is_active = true)
CREATE INDEX idx_recurring_next_occurrence ON recurring_transactions(next_occurrence) WHERE is_active = true;

-- Index 3: Category ID lookup
-- Used for: Finding recurring transactions by category
-- Query Pattern: SELECT * FROM recurring_transactions WHERE category_id = ?
CREATE INDEX idx_recurring_category_id ON recurring_transactions(category_id);

-- ============================================================================
-- 4. ENABLE ROW LEVEL SECURITY (RLS)
-- ============================================================================
-- RLS ensures users can only access their own recurring transactions

ALTER TABLE recurring_transactions ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 5. CREATE RLS POLICIES
-- ============================================================================
-- Four policies control access: SELECT, INSERT, UPDATE, DELETE

-- Policy 1: SELECT - Users can view only their own recurring transactions
CREATE POLICY "Users can view own recurring transactions"
ON recurring_transactions FOR SELECT
USING (auth.uid() = user_id);

-- Policy 2: INSERT - Users can create recurring transactions for themselves
CREATE POLICY "Users can insert own recurring transactions"
ON recurring_transactions FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Policy 3: UPDATE - Users can modify only their own recurring transactions
CREATE POLICY "Users can update own recurring transactions"
ON recurring_transactions FOR UPDATE
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy 4: DELETE - Users can delete only their own recurring transactions
CREATE POLICY "Users can delete own recurring transactions"
ON recurring_transactions FOR DELETE
USING (auth.uid() = user_id);

-- ============================================================================
-- 6. MIGRATION METADATA
-- ============================================================================
-- Document what was created by this migration

-- This migration creates:
-- - 1 new table (recurring_transactions) with 14 columns
-- - 3 performance indexes
-- - 4 RLS policies
-- - Total SQL lines: ~130 (including comments)
--
-- Database Impact:
-- - Adds new table and indexes
-- - Enables RLS for data privacy
-- - Establishes referential integrity (user_id CASCADE, category_id RESTRICT)
-- - No existing tables are modified
--
-- To Verify:
-- 1. Check table: SELECT * FROM information_schema.tables WHERE table_name = 'recurring_transactions';
-- 2. Check indexes: SELECT * FROM pg_indexes WHERE tablename = 'recurring_transactions';
-- 3. Check RLS: SELECT * FROM pg_policies WHERE tablename = 'recurring_transactions';
-- 4. Test RLS: Connect as test user and verify they can only see their own recurring transactions

-- ============================================================================
-- END OF MIGRATION
-- ============================================================================
