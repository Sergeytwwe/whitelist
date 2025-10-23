const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = process.env.SUPABASE_URL || 'https://oqfqlsxnsbkxersgoher.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xZnFsc3huc2JreGVyc2dvaGVyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTIzNDQwNiwiZXhwIjoyMDc2ODEwNDA2fQ.3YOSvu0WchFn--M_nrdGdksiAH5SukfDWlBK6Lq-H28';

console.log('Supabase URL:', supabaseUrl ? 'Provided' : 'Missing');
console.log('Supabase Key:', supabaseKey ? 'Provided' : 'Missing');

const supabase = createClient(supabaseUrl, supabaseKey);

// Тест подключения
supabase.from('whitelist').select('*').limit(1)
  .then(({ data, error }) => {
    if (error) {
      console.error('❌ Supabase connection failed:', error.message);
    } else {
      console.log('✅ Supabase connected successfully');
    }
  })
  .catch(err => {
    console.error('❌ Connection test failed:', err.message);
  });

module.exports = supabase;
