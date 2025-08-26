-- Cleanup Script for DataWeb Supabase Project
-- This script removes all existing tables that don't belong to the free blog

-- First, let's see what tables currently exist
SELECT 'Current tables in public schema:' as info;
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;

-- Drop all existing tables in the correct order (respecting foreign key constraints)
-- These tables are from a different application and don't belong to the free blog

-- Drop reel-related tables first (they likely have foreign key dependencies)
DROP TABLE IF EXISTS reel_shares CASCADE;
DROP TABLE IF EXISTS reel_saves CASCADE;
DROP TABLE IF EXISTS reel_likes CASCADE;
DROP TABLE IF EXISTS reel_comment_likes CASCADE;
DROP TABLE IF EXISTS reel_comments CASCADE;
DROP TABLE IF EXISTS reel_views CASCADE;
DROP TABLE IF EXISTS reels CASCADE;
DROP TABLE IF EXISTS user_reel_stats CASCADE;
DROP TABLE IF EXISTS popular_reels CASCADE;

-- Drop service provider tables
DROP TABLE IF EXISTS ratings CASCADE;
DROP TABLE IF EXISTS providers CASCADE;
DROP TABLE IF EXISTS services CASCADE;
DROP TABLE IF EXISTS locations CASCADE;

-- Drop booking and payment tables
DROP TABLE IF EXISTS bookings CASCADE;
DROP TABLE IF EXISTS payouts CASCADE;
DROP TABLE IF EXISTS disputes CASCADE;
DROP TABLE IF EXISTS paystack_cred CASCADE;

-- Drop user and notification tables
DROP TABLE IF EXISTS profiles CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;
DROP TABLE IF EXISTS webhook_events CASCADE;

-- Drop any other tables that might exist (catch-all)
-- This will drop any remaining tables in the public schema
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') 
    LOOP
        EXECUTE 'DROP TABLE IF EXISTS ' || quote_ident(r.tablename) || ' CASCADE';
    END LOOP;
END $$;

-- Reset sequences if any exist
DO $$ 
DECLARE 
    r RECORD;
BEGIN
    FOR r IN (SELECT sequencename FROM pg_sequences WHERE schemaname = 'public') 
    LOOP
        EXECUTE 'DROP SEQUENCE IF EXISTS ' || quote_ident(r.sequencename) || ' CASCADE';
    END LOOP;
END $$;

-- Clean up any remaining objects
DROP FUNCTION IF EXISTS public.uuid_generate_v4() CASCADE;
DROP EXTENSION IF EXISTS "uuid-ossp" CASCADE;

-- Output confirmation
SELECT 'All existing tables and objects have been removed from the public schema.' as cleanup_status;
