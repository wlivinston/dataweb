-- RLS Policies for DataWeb Free Blog
-- Run this script to add missing Row Level Security policies

-- Enable RLS on all tables (if not already enabled)
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE comment_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Allow public read access to published blog posts" ON blog_posts;
DROP POLICY IF EXISTS "Allow public read access to approved comments" ON blog_comments;
DROP POLICY IF EXISTS "Allow users to manage their own customer data" ON customers;
DROP POLICY IF EXISTS "Allow public newsletter subscription" ON newsletter_subscribers;
DROP POLICY IF EXISTS "Allow public page view tracking" ON page_views;
DROP POLICY IF EXISTS "Allow public to insert comments" ON blog_comments;
DROP POLICY IF EXISTS "Allow public to like posts" ON post_likes;
DROP POLICY IF EXISTS "Allow public to like comments" ON comment_likes;
DROP POLICY IF EXISTS "Allow public to read post likes" ON post_likes;
DROP POLICY IF EXISTS "Allow public to read comment likes" ON comment_likes;
DROP POLICY IF EXISTS "Allow public to read page views" ON page_views;
DROP POLICY IF EXISTS "Allow public to read newsletter subscribers" ON newsletter_subscribers;
DROP POLICY IF EXISTS "Allow public to update newsletter subscription" ON newsletter_subscribers;
DROP POLICY IF EXISTS "Allow public to register customers" ON customers;
DROP POLICY IF EXISTS "Allow public to read customer data for auth" ON customers;
DROP POLICY IF EXISTS "Allow public to update customer data" ON customers;

-- Create comprehensive RLS policies for free blog functionality

-- Blog Posts: Public read access to published posts
CREATE POLICY "Allow public read access to published blog posts" ON blog_posts
    FOR SELECT USING (published = true);

-- Blog Comments: Public read access to approved comments
CREATE POLICY "Allow public read access to approved comments" ON blog_comments
    FOR SELECT USING (is_approved = true);

-- Blog Comments: Public insert access (comments will be moderated)
CREATE POLICY "Allow public to insert comments" ON blog_comments
    FOR INSERT WITH CHECK (true);

-- Post Likes: Public insert and read access
CREATE POLICY "Allow public to like posts" ON post_likes
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public to read post likes" ON post_likes
    FOR SELECT USING (true);

-- Comment Likes: Public insert and read access
CREATE POLICY "Allow public to like comments" ON comment_likes
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public to read comment likes" ON comment_likes
    FOR SELECT USING (true);

-- Page Views: Public insert and read access (for analytics)
CREATE POLICY "Allow public page view tracking" ON page_views
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public to read page views" ON page_views
    FOR SELECT USING (true);

-- Newsletter Subscribers: Public insert, read, and update access
CREATE POLICY "Allow public newsletter subscription" ON newsletter_subscribers
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public to read newsletter subscribers" ON newsletter_subscribers
    FOR SELECT USING (true);

CREATE POLICY "Allow public to update newsletter subscription" ON newsletter_subscribers
    FOR UPDATE USING (true);

-- Customers: Public access for authentication and registration
CREATE POLICY "Allow public to register customers" ON customers
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public to read customer data for auth" ON customers
    FOR SELECT USING (true);

CREATE POLICY "Allow public to update customer data" ON customers
    FOR UPDATE USING (true);

-- Customers: Authenticated users can manage their own data
CREATE POLICY "Allow users to manage their own customer data" ON customers
    FOR ALL USING (auth.uid()::text = id::text);

-- Output confirmation
SELECT 'RLS policies have been successfully created for all tables.' as rls_status;
