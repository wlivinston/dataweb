# DataWeb Platform Deployment Guide

## Overview
This guide will help you deploy your DataWeb platform using the hybrid Supabase + Digital Ocean setup. The platform consists of:
- **Frontend**: React application (hosted on Digital Ocean)
- **Backend**: Node.js API (hosted on Digital Ocean)
- **ML Hub**: Streamlit applications (hosted on Digital Ocean)
- **Database**: Supabase (PostgreSQL with real-time features)

## Prerequisites

### 1. GitHub Repository
First, you need to push your code to a GitHub repository:

```bash
# Initialize git repository (if not already done)
git init

# Add all files
git add .

# Create initial commit
git commit -m "Initial commit: DataWeb platform with Supabase integration"

# Add your GitHub repository as remote
git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git

# Push to GitHub
git push -u origin main
```

### 2. Supabase Service Role Key
You need to get your Supabase service role key for backend operations:

1. Go to your Supabase project dashboard: https://supabase.com/dashboard/project/wjeqwwilkbpqwuffiuio
2. Navigate to Settings → API
3. Copy the "service_role" key (not the anon key)
4. Update the `app.yaml` file, replacing `your_supabase_service_role_key_here` with your actual service role key

### 3. Domain Configuration
Update the domains in `app.yaml`:
- Replace `dataweb.yourdomain.com` with your actual domain
- Replace `www.dataweb.yourdomain.com` with your www subdomain

## Deployment Steps

### Step 1: Update app.yaml
1. Replace `your-github-username/your-repo-name` with your actual GitHub repository details
2. Replace `your_supabase_service_role_key_here` with your Supabase service role key
3. Update the domain names to match your actual domain

### Step 2: Deploy to Digital Ocean
Using the Digital Ocean MCP, deploy your application:

```bash
# The deployment will be handled through the Digital Ocean App Platform
# using the app.yaml configuration file
```

### Step 3: Configure DNS
After deployment, Digital Ocean will provide you with app URLs. Configure your DNS:

1. **Primary Domain**: Point `dataweb.yourdomain.com` to your Digital Ocean app
2. **WWW Subdomain**: Point `www.dataweb.yourdomain.com` to your Digital Ocean app
3. **SSL Certificate**: Digital Ocean will automatically provision SSL certificates

### Step 4: Environment Variables
The following environment variables are automatically configured in the `app.yaml`:

**Frontend:**
- `VITE_SUPABASE_URL`: Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY`: Your Supabase anon key
- `NODE_ENV`: production

**Backend:**
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_SERVICE_ROLE_KEY`: Your Supabase service role key
- `SUPABASE_ANON_KEY`: Your Supabase anon key
- `NODE_ENV`: production
- `PORT`: 3001

**ML Hub:**
- `SUPABASE_URL`: Your Supabase project URL
- `SUPABASE_ANON_KEY`: Your Supabase anon key

## Post-Deployment Configuration

### 1. Supabase Authentication Settings
Configure your Supabase authentication settings:

1. Go to Authentication → Settings in your Supabase dashboard
2. Add your production domain to "Site URL"
3. Add your production domain to "Redirect URLs"
4. Configure email templates if needed

### 2. Row Level Security (RLS)
Ensure RLS policies are properly configured in Supabase:

```sql
-- Example RLS policies (already applied)
ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE blog_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;

-- Public read access for blog posts
CREATE POLICY "Public read access for blog posts" ON blog_posts
FOR SELECT USING (published = true);

-- Authenticated users can create comments
CREATE POLICY "Authenticated users can create comments" ON blog_comments
FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- Users can read approved comments
CREATE POLICY "Public read access for approved comments" ON blog_comments
FOR SELECT USING (is_approved = true);
```

### 3. Email Configuration
Configure email settings in Supabase:

1. Go to Authentication → Settings → SMTP Settings
2. Configure your SMTP provider (Gmail, SendGrid, etc.)
3. Test email delivery

## Monitoring and Maintenance

### 1. Health Checks
The application includes health checks for all services:
- Frontend: `/` (root path)
- Backend: `/api/health`
- ML Hub: `/ml`

### 2. Alerts
Digital Ocean will monitor:
- Deployment failures
- Domain failures
- High CPU usage (>80%)
- High memory usage (>80%)

### 3. Logs
Access logs through the Digital Ocean dashboard:
- Application logs
- Build logs
- Error logs

## Troubleshooting

### Common Issues

1. **Build Failures**
   - Check the build logs in Digital Ocean dashboard
   - Ensure all dependencies are in `package.json`
   - Verify Node.js version compatibility

2. **Environment Variables**
   - Verify all environment variables are set correctly
   - Check that Supabase keys are valid
   - Ensure no typos in variable names

3. **Database Connection Issues**
   - Verify Supabase URL and keys
   - Check RLS policies
   - Ensure database tables exist

4. **Authentication Issues**
   - Verify Supabase authentication settings
   - Check redirect URLs
   - Ensure email templates are configured

### Performance Optimization

1. **Frontend**
   - Enable gzip compression
   - Use CDN for static assets
   - Implement lazy loading

2. **Backend**
   - Implement caching
   - Use connection pooling
   - Monitor API response times

3. **Database**
   - Monitor query performance
   - Add indexes where needed
   - Use Supabase's built-in caching

## Security Checklist

- [ ] All environment variables are marked as SECRET
- [ ] RLS policies are properly configured
- [ ] Authentication is enabled
- [ ] HTTPS is enforced
- [ ] CORS is configured correctly
- [ ] Rate limiting is implemented
- [ ] Input validation is in place
- [ ] SQL injection protection is active

## Cost Optimization

### Current Setup Costs
- **Supabase**: Free tier (up to 500MB database, 50MB file storage)
- **Digital Ocean**: ~$5-12/month for app hosting
- **Total**: ~$5-12/month

### Scaling Considerations
- Monitor Supabase usage to stay within free tier
- Consider paid plans when approaching limits
- Use Digital Ocean's autoscaling features

## Support and Resources

- **Supabase Documentation**: https://supabase.com/docs
- **Digital Ocean App Platform**: https://docs.digitalocean.com/products/app-platform/
- **React Documentation**: https://react.dev/
- **Node.js Documentation**: https://nodejs.org/docs/

## Next Steps

1. **Analytics**: Implement Google Analytics or similar
2. **SEO**: Add meta tags and sitemap
3. **Backup**: Set up automated backups
4. **Monitoring**: Implement application performance monitoring
5. **CI/CD**: Set up automated deployments
6. **Testing**: Add unit and integration tests

---

**Note**: This deployment guide assumes you have already completed the local development setup and tested the application locally. If you encounter any issues during deployment, refer to the troubleshooting section or contact support.
