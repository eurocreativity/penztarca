-- Add type column to expenses table for income/expense tracking
-- This migration is safe and will not delete any existing data
-- Default value 'expense' ensures backward compatibility with existing records

-- Add the type column with a default value
ALTER TABLE expenses 
ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'expense';

-- Drop the constraint if it exists, then add it (to make migration idempotent)
ALTER TABLE expenses 
DROP CONSTRAINT IF EXISTS expenses_type_check;

ALTER TABLE expenses 
ADD CONSTRAINT expenses_type_check 
CHECK (type IN ('income', 'expense'));

-- Optional: Add an index for faster filtering by type
CREATE INDEX IF NOT EXISTS idx_expenses_type ON expenses(type);

-- Optional: Add an index for combined user_id and type queries
CREATE INDEX IF NOT EXISTS idx_expenses_user_type ON expenses(user_id, type);
