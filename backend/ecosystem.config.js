const fs   = require('fs');
const path = require('path');

function loadEnv(envPath) {
  if (!fs.existsSync(envPath)) return {};
  const out = {};
  for (let line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    line = line.trim();
    if (!line || line.startsWith('#')) continue;
    const idx = line.indexOf('=');
    if (idx === -1) continue;
    const key = line.slice(0, idx).trim();
    let   val = line.slice(idx + 1).trim();
    if ((val.startsWith('"') && val.endsWith('"')) ||
        (val.startsWith("'") && val.endsWith("'"))) {
      val = val.slice(1, -1);
    }
    out[key] = val;
  }
  return out;
}

const env = loadEnv(path.resolve(__dirname, '.env'));

const dbEnv = {
  DB_HOST: env.DB_HOST || '127.0.0.1',
  DB_USER: env.DB_USER || 'root',
  DB_PASS: env.DB_PASS,
  DB_NAME: env.DB_NAME || 'smartgarden',
};

const apiKey = env.API_KEY || 'changeme';

module.exports = {
  apps: [
    {
      name:   'mqtt-save',
      script: './src/jobs/mqttSave.js',
      env: {
        MQTT_HOST: env.MQTT_HOST || 'localhost',
        ...dbEnv,
      },
    },
    {
      name:   'server-stats',
      script: './src/jobs/serverStats.js',
    },
    {
      name:   'laravel-api',
      script: 'php',
      args:   'artisan serve --host=127.0.0.1 --port=8000',
      cwd:    '/srv/http/smart-garden/laravel',
      env:    { APP_ENV: 'production' },
    },
  ],
};
