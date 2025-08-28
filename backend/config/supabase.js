// backend/config/supabase.js
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL;                 // e.g. https://wjeqwwilkbpqwuffiuio.supabase.co
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY; // backend ONLY
const anonKey = process.env.SUPABASE_ANON_KEY || null;        // optional (backend usually doesn't need it)

if (!supabaseUrl || !serviceRoleKey) {
  console.warn('⚠️  SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing. DB calls may fail.');
}

const supabase = (supabaseUrl && serviceRoleKey)
  ? createClient(supabaseUrl, serviceRoleKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
  : null;

// Optional anon client (only if you have a use-case server-side)
const supabaseAnon = (supabaseUrl && anonKey)
  ? createClient(supabaseUrl, anonKey, {
      auth: { autoRefreshToken: false, persistSession: false },
    })
  : null;

module.exports = {
  supabase,
  supabaseAnon,
  supabaseUrl,
};
