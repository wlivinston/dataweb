# Cleanup Guide for DataWeb Supabase Project

## Overview
This guide will help you remove all existing tables from your Supabase project before setting up the new free blog database schema.

## ⚠️ Important Warning
**This will permanently delete all existing data in your Supabase project.** Make sure you want to do this before proceeding.

## Step 1: Access Your Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Navigate to your project: `wjeqwwilkbpqwuffiuio`
3. Go to the **SQL Editor** in the left sidebar

## Step 2: Check Current Tables (Optional)

First, let's see what tables currently exist:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

## Step 3: Run the Cleanup Script

1. In the SQL Editor, copy and paste the entire contents of `cleanup_old_project.sql`
2. Click **Run** to execute the cleanup script
3. This will:
   - Drop all existing tables in the correct order
   - Remove any sequences
   - Clean up extensions
   - Remove any remaining objects

## Step 4: Verify Cleanup

After running the cleanup script, verify that all tables have been removed:

```sql
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public'
ORDER BY table_name;
```

This should return an empty result (no tables).

## Step 5: Set Up New Free Blog Schema

Once the cleanup is complete:

1. **Copy and paste** the entire contents of `database_schema.sql`
2. **Click Run** to create the new free blog tables
3. **Verify** in Table Editor that you see the 7 new tables:
   - customers
   - blog_posts
   - blog_comments
   - comment_likes
   - post_likes
   - page_views
   - newsletter_subscribers

## What Gets Removed

The cleanup script will remove all existing tables that don't belong to your free blog:

**Reel/Content Tables:**
- reel_shares, reel_saves, reel_likes
- reel_comments, reel_comment_likes, reel_views
- reels, user_reel_stats, popular_reels

**Service Provider Tables:**
- ratings, providers, services, locations

**Booking & Payment Tables:**
- bookings, payouts, disputes, paystack_cred

**User & System Tables:**
- profiles, notifications, webhook_events

**Plus any other tables** that might exist in the public schema

## What Gets Created (After Cleanup)

The new schema will create:
- ✅ **7 clean tables** for your free blog
- ✅ **Proper indexes** for performance
- ✅ **Sample blog posts** to get started
- ✅ **RLS policies** for security

## Troubleshooting

### If you get permission errors:
- Make sure you're using the **service_role** key
- Check that you have admin access to the project

### If tables still exist after cleanup:
- Run the cleanup script again
- Check for any error messages in the SQL Editor

### If you need to start over:
- You can always run the cleanup script again
- Then run the database schema script

## Next Steps

After successful cleanup and setup:
1. **Deploy your app** - The backend should now work with the clean database
2. **Test the API** - Try accessing `/api/health`
3. **Import your blog posts** - Use the `/api/blog/import` endpoint

## Safety Note

The cleanup script uses `CASCADE` which means it will remove all dependent objects. This is safe for a fresh start but will permanently delete all data.
