const express = require('express');
const supabase = require('./supabase');
const app = express();
const port = process.env.PORT || 3000;

app.use(express.json());

// Вспомогательные функции для вычислений (в точности как в клиенте)
function computeNewFirst(r1) {
  return 3 * (r1 * r1) + 7 * r1 - 19;
}

function computeNewSecond(r2) {
  return 5 * (r2 * r2 * r2) - 11 * r2 + 42;
}

// POST /check
// Body: { hwid, key, first_val, second_val }
app.post('/check', async (req, res) => {
  try {
    const { hwid, key, first_val, second_val } = req.body;

    if (!key) {
      return res.status(400).json({ status: 'deny', message: 'Missing key' });
    }

    // Приведение значений к числу
    const r1 = Number(first_val) || 0;
    const r2 = Number(second_val) || 0;

    // Получаем запись по ключу
    const { data, error } = await supabase
      .from('whitelist')
      .select('*')
      .eq('whitelistkey', key)
      .maybeSingle();

    if (error) {
      console.error('Supabase error:', error);
      return res.status(500).json({ status: 'error', message: 'Database query failed' });
    }

    if (!data) {
      return res.status(200).json({ status: 'deny', message: 'Key not found' });
    }

    // Если hwid в БД пустой -> сохраняем привязку
    if (!data.hwid && hwid) {
      const { error: upErr } = await supabase
        .from('whitelist')
        .update({ hwid: hwid })
        .eq('whitelistkey', key);

      if (upErr) {
        console.error('Failed to update hwid:', upErr);
      } else {
        data.hwid = hwid;
      }
    }

    // Если hwid в БД существует и не совпадает с присланным => deny
    if (data.hwid && hwid && data.hwid !== hwid) {
      return res.status(200).json({ status: 'deny', message: 'HWID mismatch' });
    }

    // Вычисляем проверочные значения
    const newfirst = computeNewFirst(r1);
    const newsecond = computeNewSecond(r2);

    // Ответ клиенту
    return res.json({
      status: 'allow',
      newfirst_val: newfirst,
      newsecond_val: newsecond,
      is_dev: !!data.is_dev,
      days: Number(data.days) || 0,
      message: 'Allowed'
    });

  } catch (err) {
    console.error('Unexpected error /check:', err);
    return res.status(500).json({ status: 'error', message: 'Internal server error' });
  }
});

// POST /log
// Body: { key, placeName, ip, note? }
app.post('/log', async (req, res) => {
  try {
    const { key, placeName, ip, note } = req.body;
    await supabase.from('logs').insert([{ whitelistkey: key, place_name: placeName, ip: ip, note: note || null }]);
    return res.json({ status: 'success' });
  } catch (err) {
    console.error('Log insert failed:', err);
    return res.status(500).json({ status: 'error' });
  }
});

app.get('/', (req, res) => {
  res.json({ message: 'Server is running!', timestamp: new Date().toISOString() });
});

app.listen(port, () => {
  console.log(`Server started on port ${port}`);
});
