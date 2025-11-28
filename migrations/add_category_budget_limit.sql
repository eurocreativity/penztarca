-- Migration: Add budget_limit column to categories table
-- Description: Allows setting budget limits per category for better expense tracking
-- Created: 2025-11-27
-- Phase: 1 - Quick Wins

-- Add budget_limit column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_name = 'categories'
        AND column_name = 'budget_limit'
    ) THEN
        ALTER TABLE categories ADD COLUMN budget_limit DECIMAL DEFAULT NULL;
        RAISE NOTICE 'Column budget_limit added to categories table';
    ELSE
        RAISE NOTICE 'Column budget_limit already exists';
    END IF;
END $$;

-- Verify the change
SELECT
    id,
    name,
    type,
    budget_limit,
    user_id
FROM categories
ORDER BY user_id, type, name
LIMIT 10;
