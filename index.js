const express = require('express');
const supabase = require('./supabase');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

const allowed_fingerprints = [
  'wave-fingerprint',
  'sirhurt-fingerprint',
];

app.post('/whitelist', async (req, res) => {
  try {
    console.log('Received request:', req.body, req.headers);
    
    const { whitelistkey } = req.body;
    const headers = req.headers;
    let foundFingerprint = null;

    for (const fingerprint of allowed_fingerprints) {
      if (headers[fingerprint]) {
        foundFingerprint = headers[fingerprint];
        break;
      }
    }

    if (!foundFingerprint) {
      return res.json({ message: "No fingerprint...", valid: false });
    }

    if (!whitelistkey) {
      return res.json({ message: "Missing whitelistkey", valid: false });
    }

    console.log('Querying database for key:', whitelistkey);
    
    // ПРОСТОЙ ЗАПРОС ДЛЯ ТЕСТА
    const { data, error } = await supabase
      .from('whitelist')
      .select('whitelistkey, fingerprint')
      .eq('whitelistkey', whitelistkey)
      .maybeSingle(); // Используем maybeSingle вместо single

    console.log('Database response:', { data, error });

    if (error) {
      console.error('Database error details:', error);
      return res.json({ 
        message: "Database query failed", 
        error: error.message,
        valid: false 
      });
    }

    if (!data) {
      return res.json({ 
        message: "Key not found in database", 
        valid: false 
      });
    }

    // Логика проверки fingerprint
    if (data.fingerprint === foundFingerprint) {
      return res.json({ valid: true, message: "Fingerprint matches" });
    } else if (data.fingerprint === null) {
      // Обновляем fingerprint
      const { error: updateError } = await supabase
        .from('whitelist')
        .update({ fingerprint: foundFingerprint })
        .eq('whitelistkey', whitelistkey);

      if (updateError) {
        console.error('Update error:', updateError);
        return res.json({ valid: false, message: "Update failed" });
      }
      
      return res.json({ valid: true, message: "Fingerprint updated" });
    } else {
      return res.json({ valid: false, message: "Fingerprint mismatch" });
    }

  } catch (error) {
    console.error('Unexpected error:', error);
    res.json({ 
      message: "Internal server error", 
      error: error.message,
      valid: false 
    });
  }
});

app.get('/', (req, res) => {
  res.json({ 
    message: 'Server is running!',
    timestamp: new Date().toISOString()
  });
});

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
