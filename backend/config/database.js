const { supabase } = require('./supabase');

// Connect to database
const connectDB = async () => {
  try {
    // Test the connection by making a simple query
    const { data, error } = await supabase
      .from('blog_posts')
      .select('id')
      .limit(1);
    
    if (error) {
      console.error('❌ Database connection failed:', error.message);
      // Don't throw error, just log it and continue
      console.log('⚠️  Continuing without database connection test...');
      return;
    }
    
    console.log('✅ Database connection successful');
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    // Don't throw error, just log it and continue
    console.log('⚠️  Continuing without database connection test...');
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
