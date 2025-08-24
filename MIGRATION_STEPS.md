# Migration Steps: Supabase + Digital Ocean Hybrid Setup

## Prerequisites
- GitHub repository with your code
- Digital Ocean account
- Supabase account

## Step 1: Create Supabase Project

1. **Go to Supabase Dashboard**
   - Visit [supabase.com](https://supabase.com)
   - Sign up or log in

2. **Create New Project**
   - Click "New Project"
   - Choose your organization
   - Enter project name: `dataweb-platform`
   - Enter database password (save this!)
   - Choose region (closest to your users)
   - Click "Create new project"

3. **Get Project Credentials**
   - Go to Settings → API
   - Copy:
     - Project URL
     - Anon public key
     - Service role key (keep this secret!)

## Step 2: Set Up Database Schema

1. **Open SQL Editor**
   - In Supabase dashboard, go to SQL Editor

2. **Run Database Schema**
   ```sql
   -- Copy and paste the entire content of database_schema.sql
   -- This will create all your tables
   ```

3. **Enable Row Level Security**
   ```sql
   -- Enable RLS on all tables
   ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
   ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
   ALTER TABLE blog_comments ENABLE ROW LEVEL SECURITY;
   ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
   ALTER TABLE customer_subscriptions ENABLE ROW LEVEL SECURITY;
   ALTER TABLE subscription_payments ENABLE ROW LEVEL SECURITY;
   ALTER TABLE comment_likes ENABLE ROW LEVEL SECURITY;
   ALTER TABLE post_likes ENABLE ROW LEVEL SECURITY;
   ALTER TABLE page_views ENABLE ROW LEVEL SECURITY;
   ALTER TABLE newsletter_subscribers ENABLE ROW LEVEL SECURITY;

   -- Create basic policies
   CREATE POLICY "Public read access to blog posts" ON blog_posts 
   FOR SELECT USING (published = true);

   CREATE POLICY "Authenticated users can comment" ON blog_comments 
   FOR INSERT WITH CHECK (auth.role() = 'authenticated');

   CREATE POLICY "Public read access to approved comments" ON blog_comments 
   FOR SELECT USING (is_approved = true AND is_spam = false);

   CREATE POLICY "Users can update their own comments" ON blog_comments 
   FOR UPDATE USING (auth.jwt() ->> 'email' = author_email);

   CREATE POLICY "Public read access to subscription plans" ON subscription_plans 
   FOR SELECT USING (is_active = true);
   ```

## Step 3: Update Frontend Dependencies

1. **Install Supabase Client**
   ```bash
   npm install @supabase/supabase-js
   ```

2. **Create Environment File**
   ```bash
   # .env.local
   VITE_SUPABASE_URL=your_supabase_project_url
   VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

3. **Update Package.json Scripts**
   ```json
   {
     "scripts": {
       "dev": "vite",
       "build": "vite build",
       "preview": "vite preview --port 4173 --host 0.0.0.0"
     }
   }
   ```

## Step 4: Update Backend Dependencies

1. **Install Supabase Server Client**
   ```bash
   cd backend
   npm install @supabase/supabase-js
   ```

2. **Create Environment File**
   ```bash
   # backend/.env
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
   SUPABASE_ANON_KEY=your_supabase_anon_key
   NODE_ENV=production
   PORT=3001
   ```

## Step 5: Test Locally

1. **Start Frontend**
   ```bash
   npm run dev
   ```

2. **Start Backend**
   ```bash
   cd backend
   npm run dev
   ```

3. **Test Authentication**
   - Try signing up a new user
   - Check if user appears in Supabase Auth
   - Check if customer record is created

4. **Test Comments**
   - Create a blog post
   - Try posting a comment
   - Verify comment appears in database

## Step 6: Deploy to Digital Ocean

1. **Install Digital Ocean CLI**
   ```bash
   # macOS
   brew install doctl

   # Windows
   # Download from https://github.com/digitalocean/doctl/releases

   # Linux
   snap install doctl
   ```

2. **Authenticate with Digital Ocean**
   ```bash
   doctl auth init
   # Enter your Digital Ocean API token
   ```

3. **Update app.yaml**
   - Replace `your-github-username/your-repo-name` with your actual repo
   - Replace all placeholder values with your actual Supabase credentials
   - Update region if needed

4. **Deploy the App**
   ```bash
   doctl apps create --spec app.yaml
   ```

5. **Get App URL**
   ```bash
   doctl apps list
   # Note the app URL
   ```

## Step 7: Configure Domain (Optional)

1. **Add Custom Domain**
   - In Digital Ocean dashboard, go to your app
   - Click "Settings" → "Domains"
   - Add your domain

2. **Update DNS**
   - Point your domain to the Digital Ocean app URL
   - Wait for DNS propagation

## Step 8: Set Up Monitoring

1. **Enable Logs**
   - In Digital Ocean dashboard, go to your app
   - Click "Logs" to view application logs

2. **Set Up Alerts**
   - Configure alerts for high CPU/memory usage
   - Set up email notifications

## Step 9: Test Production

1. **Test Authentication**
   - Visit your app URL
   - Try signing up/signing in
   - Verify email confirmation works

2. **Test Comments**
   - Create a blog post
   - Post comments as authenticated user
   - Verify real-time updates

3. **Test ML Hub**
   - Visit `/ml` path
   - Verify Streamlit app loads

## Step 10: Optimize and Scale

1. **Monitor Performance**
   - Check Digital Ocean metrics
   - Monitor Supabase usage
   - Optimize queries if needed

2. **Scale Up (if needed)**
   - Increase instance sizes
   - Add more instances
   - Upgrade Supabase plan

## Troubleshooting

### Common Issues

1. **Environment Variables Not Working**
   - Check if variables are set correctly in Digital Ocean
   - Verify variable names match your code

2. **CORS Errors**
   - Update CORS settings in backend
   - Add your domain to allowed origins

3. **Database Connection Issues**
   - Verify Supabase credentials
   - Check if RLS policies are correct

4. **Build Failures**
   - Check build logs in Digital Ocean
   - Verify all dependencies are installed

### Useful Commands

```bash
# View app logs
doctl apps logs your-app-id

# Update app
doctl apps update your-app-id --spec app.yaml

# Scale app
doctl apps update your-app-id --size basic-s

# Delete app
doctl apps delete your-app-id
```

## Cost Optimization

1. **Digital Ocean**
   - Use basic-xxs instances for development
   - Scale up only when needed
   - Monitor usage regularly

2. **Supabase**
   - Free tier: 500MB database, 50MB storage
   - Upgrade only when you hit limits
   - Use edge functions for compute-heavy tasks

## Security Checklist

- [ ] Environment variables are set as SECRET in Digital Ocean
- [ ] RLS policies are properly configured
- [ ] CORS settings are secure
- [ ] API keys are not exposed in client code
- [ ] Regular security updates are applied

## Next Steps

1. **Add Real-time Features**
   - Implement real-time comments
   - Add live notifications

2. **Enhance ML Hub**
   - Add more ML models
   - Implement data visualization

3. **Add Analytics**
   - Track user behavior
   - Monitor performance metrics

4. **Implement Caching**
   - Add Redis for session storage
   - Implement CDN for static assets

This hybrid setup gives you the best of both worlds: cost-effective hosting with powerful database features and real-time capabilities!
