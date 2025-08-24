# Supabase + Digital Ocean Hybrid Setup Guide

## Overview
This guide explains how to use Supabase for database and authentication while hosting your React frontend and Node.js backend on Digital Ocean.

## Architecture
```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   React App     │    │  Node.js API    │    │    Supabase     │
│  (Digital Ocean)│◄──►│  (Digital Ocean)│◄──►│   (Database)    │
│                 │    │                 │    │   (Auth)        │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 1. Supabase Setup

### Create Supabase Project
1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Note your project URL and anon key

### Environment Variables
Add to your `.env` files:

```bash
# Frontend (.env)
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Backend (.env)
SUPABASE_URL=your_supabase_project_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
SUPABASE_ANON_KEY=your_supabase_anon_key
```

## 2. Database Migration

### Run the Schema
Use the existing `database_schema.sql` in your Supabase SQL editor:

```sql
-- Copy the entire database_schema.sql content
-- Run it in Supabase SQL Editor
```

### Enable Row Level Security (RLS)
```sql
-- Enable RLS on all tables
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE customer_subscriptions ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Public read access" ON blog_posts FOR SELECT USING (published = true);
CREATE POLICY "Authenticated users can comment" ON blog_comments FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Users can read their own comments" ON blog_comments FOR SELECT USING (auth.uid()::text = author_email);
```

## 3. Frontend Integration

### Install Supabase Client
```bash
npm install @supabase/supabase-js
```

### Create Supabase Client
```typescript
// src/lib/supabase.ts
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)
```

### Update BlogComments Component
```typescript
// src/components/BlogComments.tsx
import { supabase } from '@/lib/supabase'

// Replace the existing API calls with Supabase queries
const fetchComments = async () => {
  const { data, error } = await supabase
    .from('blog_comments')
    .select('*')
    .eq('post_id', postId)
    .eq('is_approved', true)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error fetching comments:', error)
    return
  }

  setComments(data)
}

const handleSubmitComment = async (e: React.FormEvent) => {
  e.preventDefault()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    setError('You must be logged in to post comments')
    return
  }

  const { data, error } = await supabase
    .from('blog_comments')
    .insert({
      post_id: postId,
      author_name: `${user.user_metadata.first_name} ${user.user_metadata.last_name}`,
      author_email: user.email,
      content: newComment.content
    })

  if (error) {
    setError('Failed to post comment')
    return
  }

  setSuccess('Comment posted successfully!')
  fetchComments()
}
```

## 4. Backend Integration

### Install Supabase Server Client
```bash
cd backend
npm install @supabase/supabase-js
```

### Update Database Configuration
```javascript
// backend/config/supabase.js
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

const supabase = createClient(supabaseUrl, supabaseServiceKey)

module.exports = { supabase }
```

### Update Routes to Use Supabase
```javascript
// backend/routes/comments.js
const { supabase } = require('../config/supabase')

// Replace PostgreSQL queries with Supabase
router.get('/post/:postId', async (req, res) => {
  try {
    const { postId } = req.params
    
    const { data, error } = await supabase
      .from('blog_comments')
      .select('*')
      .eq('post_id', postId)
      .eq('is_approved', true)
      .order('created_at', { ascending: false })

    if (error) throw error

    res.json({ comments: data })
  } catch (error) {
    console.error('Error:', error)
    res.status(500).json({ error: 'Failed to fetch comments' })
  }
})
```

## 5. Authentication Flow

### Frontend Auth
```typescript
// src/hooks/useAuth.ts
import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

export const useAuth = () => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null)
      setLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signUp = async (email: string, password: string, userData: any) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: userData
      }
    })
    return { data, error }
  }

  const signIn = async (email: string, password: string) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    })
    return { data, error }
  }

  const signOut = async () => {
    const { error } = await supabase.auth.signOut()
    return { error }
  }

  return { user, loading, signUp, signIn, signOut }
}
```

### Backend Auth Middleware
```javascript
// backend/middleware/auth.js
const { supabase } = require('../config/supabase')

const authenticateToken = async (req, res, next) => {
  const authHeader = req.headers['authorization']
  const token = authHeader && authHeader.split(' ')[1]

  if (!token) {
    return res.status(401).json({ error: 'Access token required' })
  }

  try {
    const { data: { user }, error } = await supabase.auth.getUser(token)
    
    if (error || !user) {
      return res.status(401).json({ error: 'Invalid token' })
    }

    req.user = user
    next()
  } catch (error) {
    console.error('Auth error:', error)
    res.status(500).json({ error: 'Authentication failed' })
  }
}

module.exports = { authenticateToken }
```

## 6. Deployment Configuration

### Digital Ocean App Spec
```yaml
# app.yaml
name: dataweb-platform
services:
  - name: frontend
    source_dir: /
    github:
      repo: your-repo
      branch: main
    build_command: npm install && npm run build
    run_command: npm run preview
    environment_slug: node-js
    envs:
      - key: VITE_SUPABASE_URL
        value: your_supabase_url
      - key: VITE_SUPABASE_ANON_KEY
        value: your_supabase_anon_key

  - name: backend
    source_dir: /backend
    github:
      repo: your-repo
      branch: main
    build_command: npm install
    run_command: npm start
    environment_slug: node-js
    envs:
      - key: SUPABASE_URL
        value: your_supabase_url
      - key: SUPABASE_SERVICE_ROLE_KEY
        value: your_supabase_service_role_key
      - key: JWT_SECRET
        value: your_jwt_secret
```

## 7. Benefits of This Setup

### Cost Savings
- **Supabase Free Tier**: 500MB database, 50MB storage, 2GB bandwidth
- **Digital Ocean**: Only pay for app hosting ($5-12/month)
- **Total Cost**: ~$5-15/month vs $20-50/month with managed database

### Features
- **Real-time subscriptions**: Comments update instantly
- **Built-in auth**: Email verification, password reset, social login
- **Automatic backups**: Daily backups included
- **Edge functions**: Serverless compute
- **Database dashboard**: Easy management interface

### Scalability
- **Supabase**: Scales automatically
- **Digital Ocean**: Predictable pricing
- **Global CDN**: Fast worldwide access

## 8. Migration Steps

1. **Create Supabase project**
2. **Run database schema**
3. **Update environment variables**
4. **Modify frontend to use Supabase client**
5. **Update backend routes**
6. **Test authentication flow**
7. **Deploy to Digital Ocean**
8. **Monitor and optimize**

## 9. Security Considerations

- Use Row Level Security (RLS) policies
- Keep service role key secure
- Implement proper CORS settings
- Use environment variables for secrets
- Regular security audits

This hybrid approach gives you the best of both worlds: cost-effective hosting with powerful database features and real-time capabilities.
