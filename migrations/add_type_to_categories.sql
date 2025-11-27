-- Migration: Add type field to categories table
-- This allows categories to be classified as 'expense' or 'income'

-- Step 1: Add the type column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'categories'
        AND column_name = 'type'
    ) THEN
        ALTER TABLE categories ADD COLUMN type TEXT DEFAULT 'expense';

        -- Add check constraint to ensure only 'expense' or 'income' values
        ALTER TABLE categories ADD CONSTRAINT categories_type_check
            CHECK (type IN ('expense', 'income'));
    END IF;
END $$;

-- Step 2: Update existing categories to set their type
-- This assumes existing categories are expense categories
UPDATE categories
SET type = 'expense'
WHERE type IS NULL OR type = '';

-- Step 3: Verify the changes
SELECT
    id,
    name,
    type,
    color,
    icon
FROM categories
ORDER BY type, name;
