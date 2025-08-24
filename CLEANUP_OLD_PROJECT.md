# Cleanup Old Project Guide

## 🧹 Cleaning Up DataWeb Tables from Old Project

Since you've successfully migrated all DataWeb tables to the new dedicated project (`wjeqwwilkbpqwuffiuio`), you can now clean up the old project (`nnbpqrjrfkdvhycwxayy`) to remove the DataWeb tables.

## 📋 What Will Be Removed

The following tables will be dropped from the old project:
- `customers` - User profiles and management
- `blog_posts` - Content management system
- `blog_comments` - User interaction system
- `subscription_plans` - Pricing tiers
- `customer_subscriptions` - User subscription management
- `subscription_payments` - Payment tracking
- `comment_likes` - Social interaction features
- `post_likes` - Content engagement tracking
- `page_views` - Analytics and tracking
- `newsletter_subscribers` - Email marketing

## 🚀 How to Clean Up

### Option 1: Using Supabase Dashboard (Recommended)

1. **Go to the old project dashboard**:
   - Visit: https://supabase.com/dashboard/project/nnbpqrjrfkdvhycwxayy

2. **Open the SQL Editor**:
   - Navigate to SQL Editor in the left sidebar
   - Click "New Query"

3. **Run the cleanup script**:
   - Copy the contents of `cleanup_old_project.sql`
   - Paste it into the SQL Editor
   - Click "Run" to execute

4. **Verify the cleanup**:
   - The script will show you which tables existed before cleanup
   - It will then drop all DataWeb tables
   - Finally, it will verify that all tables have been removed

### Option 2: Manual Cleanup

If you prefer to do it manually, you can run these commands one by one in the SQL Editor:

```sql
-- Step 1: Check what DataWeb tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'customers', 'blog_posts', 'blog_comments', 'subscription_plans',
  'customer_subscriptions', 'subscription_payments', 'comment_likes',
  'post_likes', 'page_views', 'newsletter_subscribers'
);

-- Step 2: Drop tables in dependency order
DROP TABLE IF EXISTS page_views CASCADE;
DROP TABLE IF EXISTS newsletter_subscribers CASCADE;
DROP TABLE IF EXISTS post_likes CASCADE;
DROP TABLE IF EXISTS comment_likes CASCADE;
DROP TABLE IF EXISTS subscription_payments CASCADE;
DROP TABLE IF EXISTS customer_subscriptions CASCADE;
DROP TABLE IF EXISTS blog_comments CASCADE;
DROP TABLE IF EXISTS blog_posts CASCADE;
DROP TABLE IF EXISTS subscription_plans CASCADE;
DROP TABLE IF EXISTS customers CASCADE;

-- Step 3: Verify cleanup
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'customers', 'blog_posts', 'blog_comments', 'subscription_plans',
  'customer_subscriptions', 'subscription_payments', 'comment_likes',
  'post_likes', 'page_views', 'newsletter_subscribers'
);
```

## ⚠️ Important Notes

### Before Cleanup
- ✅ **Migration Complete**: All data has been successfully migrated to the new project
- ✅ **Backup**: The new project contains all the data and schema
- ✅ **Verification**: You can verify the migration by checking the new project

### Safety Measures
- **CASCADE**: The cleanup script uses `CASCADE` to handle foreign key dependencies
- **IF EXISTS**: All DROP statements use `IF EXISTS` to prevent errors if tables don't exist
- **Verification**: The script includes verification steps to confirm cleanup

### What Won't Be Affected
- Any other tables in the old project that are not related to DataWeb
- The project itself (only the DataWeb tables will be removed)
- Any other applications or data that might be using the old project

## 🔍 Verification Steps

After running the cleanup:

1. **Check the old project**:
   - Go to: https://supabase.com/dashboard/project/nnbpqrjrfkdvhycwxayy
   - Navigate to Table Editor
   - Verify that DataWeb tables are no longer present

2. **Verify the new project**:
   - Go to: https://supabase.com/dashboard/project/wjeqwwilkbpqwuffiuio
   - Navigate to Table Editor
   - Confirm all DataWeb tables are present and contain data

3. **Test the application**:
   - Run your DataWeb application locally
   - Verify that it connects to the new project
   - Test user registration, blog viewing, and commenting

## 📊 Project Status After Cleanup

### Old Project (`nnbpqrjrfkdvhycwxayy`)
- **Status**: Cleaned up
- **DataWeb Tables**: Removed
- **Other Tables**: Unaffected (if any exist)
- **Usage**: Can be used for other purposes or archived

### New Project (`wjeqwwilkbpqwuffiuio`)
- **Status**: Active and configured
- **DataWeb Tables**: All present with data
- **Security**: RLS policies configured
- **Authentication**: Ready for use

## 🎯 Benefits of Cleanup

1. **Project Separation**: Clean separation between different projects
2. **Resource Management**: Free up resources in the old project
3. **Organization**: Better project organization and maintenance
4. **Cost Optimization**: Avoid confusion and potential costs
5. **Security**: Isolated data and access controls

## 🆘 If Something Goes Wrong

If you encounter any issues during cleanup:

1. **Don't Panic**: The new project contains all your data
2. **Check Logs**: Look at the SQL execution logs in Supabase
3. **Verify Migration**: Confirm that the new project has all data
4. **Contact Support**: If needed, contact Supabase support

## ✅ Completion Checklist

- [ ] Run the cleanup script in the old project
- [ ] Verify DataWeb tables are removed from old project
- [ ] Confirm DataWeb tables exist in new project
- [ ] Test application connectivity to new project
- [ ] Update any remaining references to old project

---

**Note**: This cleanup is safe because all DataWeb data has been successfully migrated to the new dedicated project. The old project will be clean and ready for other uses or can be archived.
