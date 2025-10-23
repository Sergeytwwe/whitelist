const { createClient } = require('@supabase/supabase-js');

// Используем переменные окружения или значения по умолчанию
const supabaseUrl = process.env.SUPABASE_URL || 'https://oqfqlsxnsbkxersgoher.supabase.co';
const supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9xZnFsc3huc2JreGVyc2dvaGVyIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc2MTIzNDQwNiwiZXhwIjoyMDc2ODEwNDA2fQ.3YOSvu0WchFn--M_nrdGdksiAH5SukfDWlBK6Lq-H28';

console.log('Initializing Supabase client...');
console.log('URL:', supabaseUrl ? 'Set' : 'Not set');
console.log('Key:', supabaseKey ? 'Set' : 'Not set');

const supabase = createClient(supabaseUrl, supabaseKey);

// Тестовое подключение к базе
async function testConnection() {
  try {
    const { data, error } = await supabase
      .from('whitelist')
      .select('*')
      .limit(1);
    
    if (error) {
      console.error('❌ Supabase connection failed:', error.message);
    } else {
      console.log('✅ Supabase connected successfully');
    }
  } catch (err) {
    console.error('❌ Supabase connection test failed:', err.message);
  }
}

testConnection();

module.exports = supabase;
