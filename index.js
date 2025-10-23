const express = require('express');
const supabase = require('./supabase');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// допустимые fingerprint-заголовки
const allowed_fingerprints = [
  'wave-fingerprint',
  'sirhurt-fingerprint',
];

// Middleware для логирования
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// Health check endpoint
app.get('/', (req, res) => {
  res.json({ 
    message: 'Whitelist Server is running!',
    timestamp: new Date().toISOString(),
    status: 'OK'
  });
});

// Основной endpoint для whitelist проверки
app.post('/whitelist', async (req, res) => {
  try {
    const { whitelistkey } = req.body;
    const headers = req.headers;
    let foundFingerprint = null;

    // поиск fingerprint среди заголовков
    for (const fingerprint of allowed_fingerprints) {
      if (headers[fingerprint]) {
        foundFingerprint = headers[fingerprint];
        console.log(`Found fingerprint: ${fingerprint} = ${foundFingerprint}`);
        break;
      }
    }

    if (!foundFingerprint) {
      console.log('No fingerprint found in headers');
      return res.status(400).json({ 
        message: "No fingerprint...",
        valid: false 
      });
    }

    if (!whitelistkey) {
      return res.status(400).json({ 
        message: "Missing whitelistkey",
        valid: false 
      });
    }

    // Поиск в базе данных
    const { data, error } = await supabase
      .from('whitelist')
      .select('*')
      .eq('whitelistkey', whitelistkey)
      .single();

    if (error) {
      console.error('Database error:', error);
      return res.status(500).json({ 
        message: "Database error",
        valid: false 
      });
    }

    if (data) {
      if (data.fingerprint === foundFingerprint) {
        console.log(`Valid fingerprint for key: ${whitelistkey}`);
        return res.json({ 
          valid: true,
          message: "Fingerprint matches" 
        });
      } else if (data.fingerprint === null) {
        // Обновляем fingerprint если он пустой
        const { error: updateError } = await supabase
          .from('whitelist')
          .update({ fingerprint: foundFingerprint })
          .eq('whitelistkey', whitelistkey);

        if (updateError) {
          console.error('Update error:', updateError);
          return res.status(500).json({ 
            valid: false,
            message: "Update failed" 
          });
        }
        
        console.log(`Fingerprint updated for key: ${whitelistkey}`);
        return res.json({ 
          valid: true,
          message: "Fingerprint updated successfully" 
        });
      } else {
        console.log(`Invalid fingerprint for key: ${whitelistkey}`);
        return res.json({ 
          valid: false,
          message: "Fingerprint does not match" 
        });
      }
    } else {
      console.log(`Key not found: ${whitelistkey}`);
      return res.json({ 
        valid: false,
        message: "Key not found in database" 
      });
    }
  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ 
      valid: false,
      message: "Internal server error" 
    });
  }
});

// Обработка ошибок
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!',
    valid: false
  });
});

// Обработка 404
app.use((req, res) => {
  res.status(404).json({ 
    error: 'Route not found',
    valid: false 
  });
});

app.listen(port, () => {
  console.log(`🚀 Server started on port ${port}`);
  console.log(`📍 Health check: http://localhost:${port}/`);
  console.log(`🔑 Whitelist endpoint: http://localhost:${port}/whitelist`);
});
