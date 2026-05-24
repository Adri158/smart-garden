const db = require('../config/db');

async function listDevices() {
  const [rows] = await db.query(
    'SELECT device_id, name, created_at FROM devices ORDER BY created_at DESC'
  );
  return rows;
}

async function findDevice(deviceId) {
  const [[row]] = await db.query(
    'SELECT device_id, name, created_at FROM devices WHERE device_id = ?',
    [deviceId]
  );
  return row;
}

async function ensureDevice(deviceId) {
  await db.query(
    'INSERT IGNORE INTO devices (device_id, name) VALUES (?, ?)',
    [deviceId, deviceId]
  );
}

module.exports = { listDevices, findDevice, ensureDevice };
