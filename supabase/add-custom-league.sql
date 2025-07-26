-- Add Custom league type to support custom teams created by admins
-- Run this in Supabase SQL Editor

-- Add 'Custom' to the league_type enum
ALTER TYPE league_type ADD VALUE 'Custom';

-- Update any existing constraints or policies that might reference league types
-- (This is safe to run even if no constraints exist)

-- Note: Custom teams will be created through the admin panel and will have:
-- - league = 'Custom'
-- - All the same fields as NBA/WNBA teams
-- - Custom logos, colors, and branding