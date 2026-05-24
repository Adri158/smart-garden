const db             = require('../config/db');
const { RANGE_CONFIG } = require('../constants/ranges');

async function latestReading(deviceId) {
  const [[row]] = await db.query(
    `SELECT id, device_id, soil, temp_dht, temp_ds, humidity, relay, mode, created_at
     FROM sensor_logs
     WHERE device_id = ?
     ORDER BY id DESC LIMIT 1`,
    [deviceId]
  );
  return row;
}

async function bucketedHistory(deviceId, sensor, range) {
  const cfg = RANGE_CONFIG[range];

  const [rows] = await db.query(
    `SELECT
       DATE_FORMAT(
         FROM_UNIXTIME(FLOOR(UNIX_TIMESTAMP(created_at) / ?) * ?),
         ?
       )               AS label,
       AVG(??)         AS value,
       MIN(created_at) AS ts
     FROM sensor_logs
     WHERE created_at >= DATE_SUB(NOW(), INTERVAL ${cfg.interval})
       AND ?? IS NOT NULL
       AND device_id = ?
     GROUP BY FLOOR(UNIX_TIMESTAMP(created_at) / ?)
     ORDER BY ts ASC`,
    [cfg.bucket, cfg.bucket, cfg.labelFmt, sensor, sensor, deviceId, cfg.bucket]
  );

  const [[stats]] = await db.query(
    `SELECT
       MIN(??)                AS min_val,
       MAX(??)                AS max_val,
       ROUND(AVG(??), 1)      AS avg_val
     FROM sensor_logs
     WHERE created_at >= DATE_SUB(NOW(), INTERVAL ${cfg.interval})
       AND ?? IS NOT NULL
       AND device_id = ?`,
    [sensor, sensor, sensor, sensor, deviceId]
  );

  return { rows, stats };
}

async function insertReading(deviceId, { soil, temp_dht, temp_ds, humidity, relay, mode }) {
  const [result] = await db.query(
    `INSERT INTO sensor_logs (device_id, soil, temp_dht, temp_ds, humidity, relay, mode)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      deviceId,
      soil     !== undefined ? soil     : null,
      temp_dht !== undefined ? temp_dht : null,
      temp_ds  !== undefined ? temp_ds  : null,
      humidity !== undefined ? humidity : null,
      relay    !== undefined ? relay    : null,
      mode     !== undefined ? mode     : null,
    ]
  );
  return result.insertId;
}

async function purgeOldLogs(deviceId) {
  await db.query(
    "DELETE FROM sensor_logs WHERE created_at < DATE_SUB(NOW(), INTERVAL 1 MONTH) AND device_id = ?",
    [deviceId]
  );
}

module.exports = { latestReading, bucketedHistory, insertReading, purgeOldLogs };
