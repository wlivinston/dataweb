-- DataWeb Tables Cleanup Script
-- Run this in the Supabase SQL Editor for project: nnbpqrjrfkdvhycwxayy
-- This will remove all DataWeb-related tables from the old project

-- First, let's see what tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'customers',
  'blog_posts', 
  'blog_comments',
  'subscription_plans',
  'customer_subscriptions',
  'subscription_payments',
  'comment_likes',
  'post_likes',
  'page_views',
  'newsletter_subscribers'
);

-- Drop tables in reverse order of dependencies to avoid foreign key constraint issues
-- Drop dependent tables first

-- 1. Drop analytics and tracking tables
DROP TABLE IF EXISTS page_views CASCADE;
DROP TABLE IF EXISTS newsletter_subscribers CASCADE;

-- 2. Drop social interaction tables
DROP TABLE IF EXISTS post_likes CASCADE;
DROP TABLE IF EXISTS comment_likes CASCADE;

-- 3. Drop payment and subscription tables
DROP TABLE IF EXISTS subscription_payments CASCADE;
DROP TABLE IF EXISTS customer_subscriptions CASCADE;

-- 4. Drop content tables
DROP TABLE IF EXISTS blog_comments CASCADE;
DROP TABLE IF EXISTS blog_posts CASCADE;

-- 5. Drop core tables
DROP TABLE IF EXISTS subscription_plans CASCADE;
DROP TABLE IF EXISTS customers CASCADE;

-- Verify all tables have been dropped
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'customers',
  'blog_posts', 
  'blog_comments',
  'subscription_plans',
  'customer_subscriptions',
  'subscription_payments',
  'comment_likes',
  'post_likes',
  'page_views',
  'newsletter_subscribers'
);

-- Show remaining tables (should be empty for DataWeb tables)
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
