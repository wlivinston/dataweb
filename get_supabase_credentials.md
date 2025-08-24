# Getting Your Supabase Credentials

## 🔑 Required Credentials for Deployment

To deploy your DataWeb platform to www.dataafrik.com, you need these Supabase credentials:

### 1. Project URL
- **URL**: `https://wjeqwwilkbpqwuffiuio.supabase.co`
- **Status**: ✅ Already configured

### 2. Anon Key (Public Key)
**How to get it:**
1. Go to: https://supabase.com/dashboard/project/wjeqwwilkbpqwuffiuio
2. Navigate to **Settings** → **API**
3. Copy the **anon public** key
4. Replace `your_dataweb_anon_key_here` in `app.yaml`

### 3. Service Role Key (Secret Key)
**How to get it:**
1. Go to: https://supabase.com/dashboard/project/wjeqwwilkbpqwuffiuio
2. Navigate to **Settings** → **API**
3. Copy the **service_role** key (keep this secret!)
4. Replace `your_supabase_service_role_key_here` in `app.yaml`

## 📝 Update Your Configuration

### Step 1: Update app.yaml
Replace these placeholders in your `app.yaml` file:

```yaml
# Frontend environment variables
- key: VITE_SUPABASE_ANON_KEY
  value: YOUR_ACTUAL_ANON_KEY_HERE  # Replace this
  type: SECRET

# Backend environment variables  
- key: SUPABASE_SERVICE_ROLE_KEY
  value: YOUR_ACTUAL_SERVICE_ROLE_KEY_HERE  # Replace this
  type: SECRET
- key: SUPABASE_ANON_KEY
  value: YOUR_ACTUAL_ANON_KEY_HERE  # Replace this
  type: SECRET
```

### Step 2: Verify Supabase Configuration
Check that `src/lib/supabase.ts` has the correct URL:

```typescript
const supabaseUrl = 'https://wjeqwwilkbpqwuffiuio.supabase.co'
const supabaseAnonKey = 'your_anon_key_here'
```

## 🔒 Security Notes

- **Anon Key**: Safe to expose in frontend code
- **Service Role Key**: Keep secret, only use in backend
- **Never commit keys to Git**: Use environment variables
- **Rotate keys regularly**: For security best practices

## ✅ Verification Checklist

- [ ] Anon key copied from Supabase dashboard
- [ ] Service role key copied from Supabase dashboard
- [ ] app.yaml updated with actual keys
- [ ] Keys marked as SECRET in app.yaml
- [ ] Supabase URL verified in configuration
- [ ] Ready for deployment

## 🚨 Important Security Reminders

1. **Never share your service role key**
2. **Use environment variables for all secrets**
3. **Mark sensitive values as SECRET in DigitalOcean**
4. **Regularly rotate your keys**
5. **Monitor for unauthorized access**

---

**Next Step**: Once you have these credentials, proceed with the deployment guide in `DATA_AFRIK_DEPLOYMENT_GUIDE.md`
