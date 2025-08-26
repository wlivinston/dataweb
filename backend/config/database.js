const { supabase } = require('./supabase');

// Connect to database (optional - won't block server startup)
const connectDB = async () => {
  try {
    console.log('🔗 Testing Supabase connection...');
    
    // Simple connection test - just check if we can reach Supabase
    const { data, error } = await supabase
      .from('blog_posts')
      .select('id')
      .limit(1);
    
    if (error) {
      console.log('⚠️  Supabase connection test failed:', error.message);
      console.log('⚠️  This is expected if tables don\'t exist yet');
      console.log('✅ Server will continue without database connection');
      return;
    }
    
    console.log('✅ Supabase connection successful');
    console.log(`📊 Found ${data?.length || 0} blog posts`);
  } catch (error) {
    console.log('⚠️  Supabase connection test failed:', error.message);
    console.log('✅ Server will continue without database connection');
  }
};

// Execute a query using Supabase
const query = async (table, operation, params = {}) => {
  const start = Date.now();
  try {
    let result;
    
    switch (operation.type) {
      case 'select':
        result = await supabase
          .from(table)
          .select(params.select || '*')
          .match(params.match || {})
          .order(params.order || 'created_at', { ascending: false })
          .range(params.range?.from || 0, params.range?.to || 999);
        break;
      case 'insert':
        result = await supabase
          .from(table)
          .insert(params.data);
        break;
      case 'update':
        result = await supabase
          .from(table)
          .update(params.data)
          .match(params.match);
        break;
      case 'delete':
        result = await supabase
          .from(table)
          .delete()
          .match(params.match);
        break;
      default:
        throw new Error(`Unknown operation type: ${operation.type}`);
    }
    
    const duration = Date.now() - start;
    console.log('📊 Executed query', { table, operation: operation.type, duration, rows: result.data?.length || 0 });
    
    if (result.error) {
      throw result.error;
    }
    
    return result;
  } catch (error) {
    console.error('❌ Query error:', error);
    throw error;
  }
};

// Get Supabase client
const getClient = () => {
  return supabase;
};

module.exports = {
  connectDB,
  query,
  getClient,
  supabase
};
