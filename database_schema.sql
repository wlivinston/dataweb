-- Database Schema for DataWeb Platform
-- Customer Subscriptions and Blog Comments System

-- =============================================
-- CUSTOMER SUBSCRIPTIONS
-- =============================================

CREATE TABLE customers (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100) NOT NULL,
    last_name VARCHAR(100) NOT NULL,
    company VARCHAR(200),
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    is_active BOOLEAN DEFAULT true,
    subscription_status VARCHAR(50) DEFAULT 'free',
    last_login TIMESTAMP
);

CREATE TABLE subscription_plans (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    price DECIMAL(10,2) NOT NULL,
    billing_cycle VARCHAR(20) NOT NULL, -- monthly, yearly, quarterly
    features JSONB, -- Store features as JSON
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE customer_subscriptions (
    id SERIAL PRIMARY KEY,
    customer_id INTEGER REFERENCES customers(id) ON DELETE CASCADE,
    plan_id INTEGER REFERENCES subscription_plans(id),
    status VARCHAR(50) NOT NULL, -- active, cancelled, expired, pending
    start_date DATE NOT NULL,
    end_date DATE,
    auto_renew BOOLEAN DEFAULT true,
    payment_method VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE subscription_payments (
    id SERIAL PRIMARY KEY,
    subscription_id INTEGER REFERENCES customer_subscriptions(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'USD',
    payment_method VARCHAR(100),
    transaction_id VARCHAR(255),
    status VARCHAR(50) NOT NULL, -- success, failed, pending, refunded
    payment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- BLOG COMMENTS SYSTEM
-- =============================================

CREATE TABLE blog_posts (
    id SERIAL PRIMARY KEY,
    slug VARCHAR(255) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    excerpt TEXT,
    content TEXT NOT NULL,
    author VARCHAR(100) NOT NULL,
    category VARCHAR(100),
    tags TEXT[], -- Array of tags
    featured BOOLEAN DEFAULT false,
    published BOOLEAN DEFAULT true,
    published_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    read_time VARCHAR(20),
    view_count INTEGER DEFAULT 0,
    like_count INTEGER DEFAULT 0
);

CREATE TABLE blog_comments (
    id SERIAL PRIMARY KEY,
    post_id INTEGER REFERENCES blog_posts(id) ON DELETE CASCADE,
    parent_id INTEGER REFERENCES blog_comments(id) ON DELETE CASCADE, -- For nested replies
    author_name VARCHAR(100) NOT NULL,
    author_email VARCHAR(255) NOT NULL,
    author_website VARCHAR(255),
    content TEXT NOT NULL,
    is_approved BOOLEAN DEFAULT false,
    is_spam BOOLEAN DEFAULT false,
    ip_address INET,
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE comment_likes (
    id SERIAL PRIMARY KEY,
    comment_id INTEGER REFERENCES blog_comments(id) ON DELETE CASCADE,
    ip_address INET NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(comment_id, ip_address)
);

-- =============================================
-- ANALYTICS & TRACKING
-- =============================================

CREATE TABLE page_views (
    id SERIAL PRIMARY KEY,
    page_url VARCHAR(500) NOT NULL,
    ip_address INET,
    user_agent TEXT,
    referrer VARCHAR(500),
    country VARCHAR(100),
    city VARCHAR(100),
    device_type VARCHAR(50),
    browser VARCHAR(100),
    os VARCHAR(100),
    viewed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE newsletter_subscribers (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    first_name VARCHAR(100),
    last_name VARCHAR(100),
    is_active BOOLEAN DEFAULT true,
    subscribed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    unsubscribed_at TIMESTAMP,
    source VARCHAR(100) -- website, blog, social media, etc.
);

-- =============================================
-- INDEXES FOR PERFORMANCE
-- =============================================

CREATE INDEX idx_customers_email ON customers(email);
CREATE INDEX idx_customers_subscription_status ON customers(subscription_status);
CREATE INDEX idx_subscriptions_customer_id ON customer_subscriptions(customer_id);
CREATE INDEX idx_subscriptions_status ON customer_subscriptions(status);
CREATE INDEX idx_blog_posts_slug ON blog_posts(slug);
CREATE INDEX idx_blog_posts_published ON blog_posts(published);
CREATE INDEX idx_blog_posts_category ON blog_posts(category);
CREATE INDEX idx_blog_comments_post_id ON blog_comments(post_id);
CREATE INDEX idx_blog_comments_approved ON blog_comments(is_approved);
CREATE INDEX idx_blog_comments_parent_id ON blog_comments(parent_id);
CREATE INDEX idx_page_views_viewed_at ON page_views(viewed_at);

-- =============================================
-- SAMPLE DATA
-- =============================================

-- Insert sample subscription plans
INSERT INTO subscription_plans (name, description, price, billing_cycle, features) VALUES
('Free', 'Basic access to blog content and limited features', 0.00, 'monthly', '["blog_access", "newsletter"]'),
('Pro', 'Full access to all content, priority support, and advanced analytics', 29.99, 'monthly', '["blog_access", "newsletter", "priority_support", "advanced_analytics", "exclusive_content"]'),
('Enterprise', 'Custom solutions, dedicated support, and white-label options', 99.99, 'monthly', '["blog_access", "newsletter", "priority_support", "advanced_analytics", "exclusive_content", "custom_solutions", "white_label", "dedicated_support"]');

-- Insert sample blog posts (if needed)
INSERT INTO blog_posts (slug, title, excerpt, content, author, category, featured, read_time) VALUES
('data-analytics-visual-storytelling', 'Data Analytics: Turning Numbers Into Narrative', 'How data analytics helps you tell better stories and make smarter decisions—with a visual and video example.', '# Data Analytics: Turning Numbers Into Narrative\n\n## Introduction\n\nEver wondered how companies like Netflix know what you want to watch next?', 'Senyo K. Tsedze', 'Analytics', true, '5 min read');
