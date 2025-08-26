-- Cleanup Script for DataWeb Supabase Project
-- This script removes all existing tables to prepare for the new free blog setup

-- Drop all existing tables in the correct order (respecting foreign key constraints)
-- Start with tables that have foreign key dependencies

-- Drop subscription-related tables first (if they exist)
DROP TABLE IF EXISTS subscription_payments CASCADE;
DROP TABLE IF EXISTS customer_subscriptions CASCADE;
DROP TABLE IF EXISTS subscription_plans CASCADE;

-- Drop analytics and interaction tables
DROP TABLE IF EXISTS page_views CASCADE;
DROP TABLE IF EXISTS post_likes CASCADE;
DROP TABLE IF EXISTS comment_likes CASCADE;

-- Drop content tables
DROP TABLE IF EXISTS blog_comments CASCADE;
DROP TABLE IF EXISTS blog_posts CASCADE;

-- Drop user and newsletter tables
DROP TABLE IF EXISTS newsletter_subscribers CASCADE;
DROP TABLE IF EXISTS customers CASCADE;

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
