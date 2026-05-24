const express      = require('express');
const cors         = require('./src/middlewares/cors');
const errorHandler = require('./src/middlewares/errorHandler');
const apiRouter    = require('./src/routes/index');

const app = express();

app.use(cors);
app.use(express.json());

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
