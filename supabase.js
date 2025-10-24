const { createClient } = require('@supabase/supabase-js');

// Берём URL и ключ из environment variables (Variables в хосте)
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ SUPABASE_URL или SUPABASE_KEY не установлены в environment variables!");
  process.exit(1);
}

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
