// backend/config/database.js
const { supabase } = require('./supabase');

// Optional connectivity check; NEVER throws to the caller.
async function connectDB() {
  try {
    console.log('🔗 Testing Supabase connection…');
    const { data, error } = await supabase.from('blog_posts').select('id').limit(1);
    if (error) {
      console.warn('⚠️ Supabase ping failed:', error.message);
      console.warn("ℹ️ That's OK if the table doesn't exist yet. Server will keep running.");
      return;
    }
    console.log('✅ Supabase connection OK — rows visible:', data?.length ?? 0);
  } catch (err) {
    console.warn('⚠️ Supabase ping threw:', err.message);
    console.warn('ℹ️ Server continues without DB.');
  }
}

// Tiny CRUD helper (no pg, no localhost)
async function query(table, op = {}) {
  const start = Date.now();
  let req = supabase.from(table);

  try {
    switch (op.type) {
      case 'select': {
        req = req.select(op.select || '*');
        if (op.match) req = req.match(op.match);
        if (op.order) {
          const column = typeof op.order === 'string' ? op.order : op.order.column;
          const ascending = typeof op.order === 'object' ? !!op.order.ascending : false;
          req = req.order(column, { ascending });
        }
        if (op.range) req = req.range(op.range.from ?? 0, op.range.to ?? 999);
        break;
      }
      case 'insert': req = req.insert(op.data); break;
      case 'update': req = req.update(op.data).match(op.match || {}); break;
      case 'delete': req = req.delete().match(op.match || {}); break;
      default: throw new Error(`Unknown operation type: ${op.type}`);
    }

    const { data, error } = await req;
    const ms = Date.now() - start;
    console.log('📊 query', { table, type: op.type, ms, rows: Array.isArray(data) ? data.length : 0 });
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('❌ query error:', error.message);
    throw error;
  }
}

const getClient = () => supabase;

module.exports = { connectDB, query, getClient, supabase };
