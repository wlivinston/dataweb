# DataAfrik.com Deployment Guide

## 🚀 Complete Deployment Guide for www.dataafrik.com

This guide will walk you through deploying your DataWeb platform to replace the existing www.dataafrik.com website on DigitalOcean.

## 📋 Prerequisites

### 1. GitHub Repository Setup
Your code is now committed locally. You need to:
- Create a GitHub repository
- Push your code to GitHub
- Get your repository URL

### 2. Supabase Configuration
You need to get your Supabase credentials:
- **Project URL**: `https://wjeqwwilkbpqwuffiuio.supabase.co`
- **Anon Key**: Get from Supabase Dashboard → Settings → API
- **Service Role Key**: Get from Supabase Dashboard → Settings → API

### 3. DigitalOcean Account
- Access to DigitalOcean App Platform
- API token for deployment

## 🔧 Step-by-Step Deployment

### Step 1: Push to GitHub

1. **Create GitHub Repository**:
   - Go to GitHub.com
   - Create a new repository named `dataweb`
   - Make it public or private (your choice)

2. **Push Your Code**:
   ```bash
   # Add your GitHub repository as remote
   git remote add origin https://github.com/YOUR_USERNAME/dataweb.git
   
   # Push to GitHub
   git push -u origin main
   ```

### Step 2: Update Configuration Files

1. **Update app.yaml**:
   - Replace `your-github-username` with your actual GitHub username
   - Replace `your_dataweb_anon_key_here` with your actual Supabase anon key
   - Replace `your_supabase_service_role_key_here` with your actual service role key

2. **Verify Supabase Configuration**:
   - Check `src/lib/supabase.ts` has correct URL
   - Verify environment variables are set correctly

### Step 3: Deploy to DigitalOcean

#### Option A: Using DigitalOcean Dashboard (Recommended)

1. **Access DigitalOcean App Platform**:
   - Go to https://cloud.digitalocean.com/apps
   - Click "Create App"

2. **Connect GitHub Repository**:
   - Choose "GitHub" as source
   - Connect your GitHub account
   - Select the `dataweb` repository
   - Choose the `main` branch

3. **Configure App**:
   - **App Name**: `dataafrik-platform`
   - **Region**: Choose closest to your users
   - **Build Command**: `npm install && npm run build`
   - **Run Command**: `npm run preview`

4. **Set Environment Variables**:
   ```
   VITE_SUPABASE_URL=https://wjeqwwilkbpqwuffiuio.supabase.co
   VITE_SUPABASE_ANON_KEY=your_actual_anon_key
   NODE_ENV=production
   ```

5. **Configure Domains**:
   - **Primary Domain**: `dataafrik.com`
   - **Alias Domain**: `www.dataafrik.com`

6. **Deploy**:
   - Click "Create Resources"
   - Wait for deployment to complete

#### Option B: Using app.yaml (Advanced)

1. **Install DigitalOcean CLI**:
   ```bash
   # Install doctl
   # Follow instructions at: https://docs.digitalocean.com/reference/doctl/how-to/install/
   ```

2. **Authenticate**:
   ```bash
   doctl auth init
   ```

3. **Deploy**:
   ```bash
   doctl apps create --spec app.yaml
   ```

### Step 4: Backend API Deployment

1. **Create Separate App for Backend**:
   - Create another app in DigitalOcean
   - Source: Same GitHub repository
   - Source Directory: `backend`
   - Build Command: `npm install`
   - Run Command: `npm start`
   - Port: `3001`

2. **Backend Environment Variables**:
   ```
   SUPABASE_URL=https://wjeqwwilkbpqwuffiuio.supabase.co
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   SUPABASE_ANON_KEY=your_anon_key
   NODE_ENV=production
   PORT=3001
   ```

3. **Backend Domain**:
   - Use subdomain: `api.dataafrik.com`
   - Or use path: `dataafrik.com/api`

### Step 5: ML Hub Deployment (Optional)

1. **Create Streamlit App**:
   - Create another app in DigitalOcean
   - Source: Same GitHub repository
   - Source Directory: `streamlit_apps`
   - Build Command: `pip install -r requirements.txt`
   - Run Command: `streamlit run main.py --server.port $PORT --server.address 0.0.0.0`
   - Environment: Python

2. **ML Hub Domain**:
   - Use subdomain: `ml.dataafrik.com`
   - Or use path: `dataafrik.com/ml`

## 🔗 DNS Configuration

### Current DNS Setup
Your domain `dataafrik.com` is already configured. You need to:

1. **Update DNS Records**:
   - Point `dataafrik.com` to DigitalOcean App
   - Point `www.dataafrik.com` to DigitalOcean App
   - Point `api.dataafrik.com` to Backend App (if using subdomain)
   - Point `ml.dataafrik.com` to ML Hub App (if using subdomain)

2. **SSL Certificates**:
   - DigitalOcean will automatically provision SSL certificates
   - Ensure HTTPS is enforced

## 🔧 Post-Deployment Configuration

### 1. Supabase Authentication
Configure Supabase for production:

1. **Go to Supabase Dashboard**:
   - Navigate to Authentication → Settings
   - **Site URL**: `https://dataafrik.com`
   - **Redirect URLs**: 
     - `https://dataafrik.com/auth/callback`
     - `https://www.dataafrik.com/auth/callback`

2. **Email Templates**:
   - Configure email templates for authentication
   - Test email delivery

### 2. Environment Variables Verification
Ensure all environment variables are set correctly:

**Frontend**:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `NODE_ENV`

**Backend**:
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_ANON_KEY`
- `NODE_ENV`
- `PORT`

### 3. Health Checks
Verify all services are running:

- **Frontend**: `https://dataafrik.com/`
- **Backend**: `https://dataafrik.com/api/health`
- **ML Hub**: `https://dataafrik.com/ml`

## 🧪 Testing Your Deployment

### 1. Frontend Testing
- Visit `https://dataafrik.com`
- Test navigation and pages
- Verify blog posts load
- Test user registration/login

### 2. Backend Testing
- Test API endpoints
- Verify database connections
- Test authentication flow

### 3. ML Hub Testing
- Visit ML applications
- Test data visualization
- Verify Supabase integration

## 🔍 Monitoring and Maintenance

### 1. DigitalOcean Monitoring
- Monitor app performance
- Check resource usage
- Review logs for errors

### 2. Supabase Monitoring
- Monitor database usage
- Check authentication logs
- Review API usage

### 3. Domain Monitoring
- Monitor SSL certificate status
- Check DNS propagation
- Verify domain health

## 🚨 Troubleshooting

### Common Issues

1. **Build Failures**:
   - Check build logs in DigitalOcean
   - Verify all dependencies are in package.json
   - Check Node.js version compatibility

2. **Environment Variables**:
   - Verify all variables are set correctly
   - Check for typos in variable names
   - Ensure Supabase keys are valid

3. **Database Connection**:
   - Verify Supabase URL and keys
   - Check RLS policies
   - Ensure tables exist

4. **Authentication Issues**:
   - Verify Supabase authentication settings
   - Check redirect URLs
   - Test email templates

### Performance Optimization

1. **Frontend**:
   - Enable gzip compression
   - Use CDN for static assets
   - Implement lazy loading

2. **Backend**:
   - Implement caching
   - Use connection pooling
   - Monitor API response times

## 💰 Cost Estimation

### Monthly Costs
- **DigitalOcean App Platform**: ~$5-12/month
- **Supabase**: Free tier (up to 500MB database)
- **Domain**: ~$10-15/year
- **Total**: ~$5-12/month

### Scaling Considerations
- Monitor Supabase usage to stay within free tier
- Consider paid plans when approaching limits
- Use DigitalOcean's autoscaling features

## 📞 Support

If you encounter issues:

1. **Check DigitalOcean Logs**: App Platform → Your App → Logs
2. **Check Supabase Logs**: Dashboard → Logs
3. **Review this guide**: Follow troubleshooting steps
4. **Contact Support**: DigitalOcean and Supabase support

## ✅ Deployment Checklist

- [ ] Code pushed to GitHub
- [ ] Supabase credentials obtained
- [ ] app.yaml configured
- [ ] DigitalOcean app created
- [ ] Environment variables set
- [ ] Domain configured
- [ ] SSL certificates provisioned
- [ ] Supabase authentication configured
- [ ] Health checks passing
- [ ] Frontend tested
- [ ] Backend tested
- [ ] ML Hub tested (if applicable)
- [ ] Monitoring configured

---

**🎉 Congratulations!** Your DataWeb platform is now live at www.dataafrik.com!

**Next Steps**:
1. Set up monitoring and alerts
2. Configure backups
3. Set up CI/CD for automatic deployments
4. Add analytics (Google Analytics, etc.)
5. Implement SEO optimization
6. Set up automated testing

---

*This guide assumes you have access to DigitalOcean App Platform and your domain is already configured. If you need help with any specific step, refer to the troubleshooting section or contact support.*
