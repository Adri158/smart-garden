const db = require('../config/db');

async function getGlobal() {
  const [rows] = await db.query(
    'SELECT key_name, value, updated_at FROM settings ORDER BY key_name'
  );
  return rows;
}

async function getDeviceMerged(deviceId) {
  const [global] = await db.query('SELECT key_name, value FROM settings');
  const merged = {};
  for (const r of global) merged[r.key_name] = r.value;

  const [device] = await db.query(
    'SELECT key_name, value FROM device_settings WHERE device_id = ?',
    [deviceId]
  );
  for (const r of device) merged[r.key_name] = r.value;

  return merged;
}

async function upsertDeviceSettings(deviceId, updates) {
  for (const [key, value] of updates) {
    await db.query(
      `INSERT INTO device_settings (device_id, key_name, value)
       VALUES (?, ?, ?)
       ON DUPLICATE KEY UPDATE value = VALUES(value)`,
      [deviceId, key, String(value)]
    );
  }
}

module.exports = { getGlobal, getDeviceMerged, upsertDeviceSettings };
