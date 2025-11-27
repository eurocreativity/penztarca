-- Migration: Add income categories for existing users
-- Run this AFTER add_type_to_categories.sql

-- Insert default income categories for all existing users who don't have them
-- This script is idempotent - safe to run multiple times

DO $$
DECLARE
    user_record RECORD;
    category_exists BOOLEAN;
BEGIN
    -- Loop through all users
    FOR user_record IN SELECT id FROM profiles LOOP

        -- Check if user already has income categories
        SELECT EXISTS (
            SELECT 1
            FROM categories
            WHERE user_id = user_record.id
            AND type = 'income'
        ) INTO category_exists;

        -- If no income categories exist, create defaults
        IF NOT category_exists THEN
            INSERT INTO categories (user_id, name, color, icon, type) VALUES
            (user_record.id, 'Fizetés', '#10b981', 'fas fa-money-bill-wave', 'income'),
            (user_record.id, 'Prémium', '#34d399', 'fas fa-award', 'income'),
            (user_record.id, 'Megbízás', '#6ee7b7', 'fas fa-laptop-code', 'income'),
            (user_record.id, 'Egyéb bevétel', '#a7f3d0', 'fas fa-hand-holding-usd', 'income');

            RAISE NOTICE 'Added income categories for user: %', user_record.id;
        ELSE
            RAISE NOTICE 'User % already has income categories', user_record.id;
        END IF;

    END LOOP;
END $$;

-- Verify: Show all categories grouped by user and type
SELECT
    user_id,
    type,
    COUNT(*) as category_count,
    STRING_AGG(name, ', ') as categories
FROM categories
GROUP BY user_id, type
ORDER BY user_id, type;
