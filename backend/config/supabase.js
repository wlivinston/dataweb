const { createClient } = require('@supabase/supabase-js')

// Use environment variables with fallbacks for DigitalOcean deployment
const supabaseUrl = process.env.SUPABASE_URL || 'https://wjeqwwilkbpqwuffiuio.supabase.co'
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndqZXF3d2lsa2JwcXd1ZmZpdWlvIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NDk2OTM0MiwiZXhwIjoyMDcwNTQ1MzQyfQ.tTJK-p4jIO4FwVyVUmNQx7gUaP5J7SZNoLvJPeCsT-k'
const supabaseAnonKey = process.env.SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6IndqZXF3d2lsa2JwcXd1ZmZpdWlvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTQ5NjkzNDIsImV4cCI6MjA3MDU0NTM0Mn0.b2_QEsEHBGewRGOJHccE9_onobcKgfLU25IoKRdXGGo'

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase environment variables');
  console.log('⚠️  Using fallback values for local development');
}

console.log('🔗 Supabase URL:', supabaseUrl);
console.log('🔑 Service Key configured:', !!supabaseServiceKey);
console.log('🔑 Anon Key configured:', !!supabaseAnonKey);

// Create Supabase client with service role key for admin operations
const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

// Create Supabase client with anon key for user operations
const supabaseAnon = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
})

module.exports = { 
  supabase, 
  supabaseAnon,
  supabaseUrl 
}
