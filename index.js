const express = require('express');
const supabase = require('./supabase'); // твой supabase.js
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// POST /whitelist — проверяем только ключ
app.post('/whitelist', async (req, res) => {
  try {
    const { whitelistkey } = req.body;

    if (!whitelistkey) {
      return res.json({ message: "Missing whitelistkey", valid: false });
    }

    console.log('Checking key in database:', whitelistkey);

    const { data, error } = await supabase
      .from('whitelist')
      .select('whitelistkey')
      .eq('whitelistkey', whitelistkey)
      .maybeSingle();

    if (error) {
      console.error('Database error:', error);
      return res.json({ message: "Database query failed", error: error.message, valid: false });
    }

    if (!data) {
      return res.json({ message: "Key not found in database", valid: false });
    }

    return res.json({ valid: true, message: "Key found" });

  } catch (error) {
    console.error('Unexpected error:', error);
    res.json({ message: "Internal server error", error: error.message, valid: false });
  }
});

app.get('/', (req, res) => {
  res.json({ message: 'Server is running!', timestamp: new Date().toISOString() });
});

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
