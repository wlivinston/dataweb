// backend/config/supabase.js
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl  = (process.env.SUPABASE_URL || '').trim();
const serviceKey   = (process.env.SUPABASE_SERVICE_ROLE_KEY || '').trim();
const anonKey      = (process.env.SUPABASE_ANON_KEY || '').trim();

const hasServiceKey = Boolean(supabaseUrl && serviceKey);
const hasAnonKey    = Boolean(supabaseUrl && anonKey);

let supabase = null;
let supabaseAnon = null;

if (hasServiceKey) {
  supabase = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
} else {
  console.warn('⚠️  SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY is missing. DB calls will be skipped.');
}

if (hasAnonKey) {
  supabaseAnon = createClient(supabaseUrl, anonKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}

module.exports = { supabase, supabaseAnon, hasServiceKey, hasAnonKey };
