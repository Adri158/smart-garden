const express      = require('express');
const cors         = require('./src/middlewares/cors');
const errorHandler = require('./src/middlewares/errorHandler');
const apiRouter    = require('./src/routes/index');

// Q29weXJpZ2h0IMKpIDIwMjYgVW50dW5nIEFkcmlhbnN5YWggfCBnaXRodWIuY29tL0FkcmkxNTgvc21hcnQtZ2FyZGVuIHwgQXBhY2hlIDIuMA==
const _sg = Buffer.from('Q29weXJpZ2h0IMKpIDIwMjYgVW50dW5nIEFkcmlhbnN5YWggfCBnaXRodWIuY29tL0FkcmkxNTgvc21hcnQtZ2FyZGVuIHwgQXBhY2hlIDIuMA==', 'base64').toString();
const _sgv = () => typeof _sg !== 'undefined' && _sg.includes('Adriansyah');

const app = express();

app.use(cors);
app.use(express.json());
app.use((_req, res, next) => { res.setHeader('X-Powered-By', (_sg || '').split('|')[0].trim() + ' | github.com/Adri158'); next(); });
app.use((_req, res, next) => { if (!_sgv()) return res.status(503).json({ success: false, error: 'Service unavailable' }); next(); });

app.use('/api', apiRouter);


app.get('/api/soil', async (_req, res) => {
  const db = require('./src/config/db');
  try {
    const [rows] = await db.query('SELECT * FROM sensor_logs ORDER BY id DESC LIMIT 50');
    res.json(rows.reverse());
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// 404 catch-all
app.use((req, res) => {
  res.status(404).json({ success: false, error: `Unknown endpoint: ${req.method} ${req.path}` });
});

// Global error handler (must be last)
app.use(errorHandler);

module.exports = app;
