const settingsRepo         = require('../repositories/settingsRepository');
const { ALLOWED_SETTINGS } = require('../constants/ranges');

async function getGlobalSettings() {
  const rows = await settingsRepo.getGlobal();
  const data = {};
  for (const r of rows) data[r.key_name] = r.value;
  return data;
}

async function getDeviceSettings(deviceId) {
  return settingsRepo.getDeviceMerged(deviceId);
}

async function updateDeviceSettings(deviceId, body) {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw new Error('Request body must be a JSON object of key:value pairs');
  }

  const keys = Object.keys(body).filter(k => ALLOWED_SETTINGS.includes(k));
  if (keys.length === 0) {
    throw new Error(`No valid keys provided. Allowed: ${ALLOWED_SETTINGS.join(', ')}`);
  }

  for (const k of keys) {
    const v = parseFloat(body[k]);
    if (isNaN(v)) throw new Error(`${k} must be a number`);
  }

  const updates = keys.map(k => [k, body[k]]);
  await settingsRepo.upsertDeviceSettings(deviceId, updates);
  return { updated: keys };
}

module.exports = { getGlobalSettings, getDeviceSettings, updateDeviceSettings };
