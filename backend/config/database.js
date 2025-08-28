// backend/config/database.js
const { supabase } = require('./supabase');

// Optional connectivity check that never blocks server startup
async function connectDB() {
  try {
    console.log('🔗 Testing Supabase connection…');

    // ping a trivial query; if table doesn’t exist, just warn and move on
    const { data, error } = await supabase.from('blog_posts').select('id').limit(1);

    if (error) {
      console.warn('⚠️  Supabase ping failed:', error.message);
      console.warn("⚠️  That's fine if the table doesn’t exist yet. Server continues.");
      return;
    }

    console.log('✅ Supabase connection OK', `— rows visible: ${data?.length ?? 0}`);
  } catch (err) {
    console.warn('⚠️  Supabase ping threw:', err.message);
    console.warn('✅ Server continues without DB.');
  }
}

/**
 * Tiny helper to run common CRUD operations.
 * Usage examples:
 *   await query('subscriptions', { type: 'select', match: { email } })
 *   await query('subscriptions', { type: 'insert', data: { email } })
 */
async function query(table, op = {}) {
  const start = Date.now();
  const type = op.type;

  try {
    let req = supabase.from(table);

    switch (type) {
      case 'select': {
        req = req.select(op.select || '*');

        if (op.match) req = req.match(op.match);
        if (op.order) {
          // op.order can be 'created_at' or { column:'created_at', ascending:false }
          const column = typeof op.order === 'string' ? op.order : op.order.column;
          const ascending =
            typeof op.order === 'object' ? !!op.order.ascending : false;
          req = req.order(column, { ascending });
        }
        if (op.range) req = req.range(op.range.from ?? 0, op.range.to ?? 999);
        break;
      }

      case 'insert':
        req = req.insert(op.data);
        break;

      case 'update':
        req = req.update(op.data).match(op.match || {});
        break;

      case 'delete':
        req = req.delete().match(op.match || {});
        break;

      default:
        throw new Error(`Unknown operation type: ${type}`);
    }

    const { data, error } = await req;

    const ms = Date.now() - start;
    console.log('📊 query', { table, type, ms, rows: Array.isArray(data) ? data.length : 0 });

    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('❌ query error:', error.message);
    throw error;
  }
}

const getClient = () => supabase;

module.exports = {
  connectDB,
  query,
  getClient,
  supabase,
};
