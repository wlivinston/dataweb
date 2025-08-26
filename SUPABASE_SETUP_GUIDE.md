# Supabase Database Setup Guide

## Overview
Your backend expects several database tables to function properly. This guide will help you set up all the required tables in your Supabase project.

## Step 1: Access Your Supabase Project

1. Go to [supabase.com](https://supabase.com) and sign in
2. Navigate to your project: `wjeqwwilkbpqwuffiuio`
3. Go to the **SQL Editor** in the left sidebar

## Step 2: Run the Database Schema

1. In the SQL Editor, copy and paste the entire contents of `database_schema.sql`
2. Click **Run** to execute the script
3. This will create all the required tables for a free blog:
   - `customers` - User authentication and profiles
   - `blog_posts` - Blog content
   - `blog_comments` - Blog comments
   - `comment_likes` - Comment likes
   - `post_likes` - Blog post likes
   - `page_views` - Analytics tracking
   - `newsletter_subscribers` - Email subscriptions

## Step 3: Verify Tables Are Created

1. Go to **Table Editor** in the left sidebar
2. You should see all the tables listed:
   - customers
   - blog_posts
   - blog_comments
   - comment_likes
   - post_likes
   - page_views
   - newsletter_subscribers

## Step 4: Check Sample Data

The script also inserts some sample data:
- **Blog Posts**: Two sample blog posts

## Step 5: Test Your Backend

After setting up the tables, your backend should now be able to:
- ✅ Start without database errors
- ✅ Handle user authentication
- ✅ Manage blog posts and comments
- ✅ Track analytics
- ✅ Handle newsletter subscriptions

## Troubleshooting

### If you get permission errors:
1. Make sure you're using the **service_role** key for backend operations
2. Check that Row Level Security (RLS) policies are properly configured

### If tables already exist:
The script uses `CREATE TABLE IF NOT EXISTS`, so it won't overwrite existing tables.

### If you need to reset:
You can drop all tables and recreate them by running:
```sql
DROP TABLE IF EXISTS newsletter_subscribers CASCADE;
DROP TABLE IF EXISTS page_views CASCADE;
DROP TABLE IF EXISTS post_likes CASCADE;
DROP TABLE IF EXISTS comment_likes CASCADE;
DROP TABLE IF EXISTS blog_comments CASCADE;
DROP TABLE IF EXISTS blog_posts CASCADE;
DROP TABLE IF EXISTS customers CASCADE;
```

Then run the `database_schema.sql` script again.

## Next Steps

Once the database is set up:
1. **Deploy your app** - The backend should now start successfully
2. **Test the API endpoints** - Try accessing `/api/health` to verify the backend is running
3. **Import blog posts** - Use the `/api/blog/import` endpoint to import your markdown files

## API Endpoints That Will Work

After setup, these endpoints should work:
- `GET /api/health` - Health check
- `GET /api/blog/posts` - Get blog posts
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `POST /api/newsletter/subscribe` - Newsletter subscription
