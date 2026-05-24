const app    = require('./app');
const config = require('./src/config/app');

const PORT = config.port;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`[api] Smart Garden REST API running on :${PORT}`);
  console.log('[api] API_KEY auth enabled for write endpoints');
});
