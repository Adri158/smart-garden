const deviceRepo = require('../repositories/deviceRepository');
const sensorRepo = require('../repositories/sensorRepository');
const { RANGE_CONFIG, ALLOWED_SENSORS } = require('../constants/ranges');

async function getHistory(deviceId, rawRange, rawSensor) {
  const range  = RANGE_CONFIG[rawRange]  ? rawRange  : '1h';
  const sensor = ALLOWED_SENSORS.includes(rawSensor) ? rawSensor : 'soil';

  const { rows, stats } = await sensorRepo.bucketedHistory(deviceId, sensor, range);

  const labels = rows.map(r => r.label);
  const values = rows.map(r => r.value !== null ? Math.round(r.value * 10) / 10 : null);

  return {
    labels,
    values,
    stats: {
      min: stats.min_val !== null ? Math.round(stats.min_val * 10) / 10 : null,
      max: stats.max_val !== null ? Math.round(stats.max_val * 10) / 10 : null,
      avg: stats.avg_val !== null ? Math.round(stats.avg_val * 10) / 10 : null,
    },
    range,
    sensor,
    count: rows.length,
  };
}

async function getLatest(deviceId) {
  return sensorRepo.latestReading(deviceId);
}

async function logReading(deviceId, fields) {
  await deviceRepo.ensureDevice(deviceId);
  const id = await sensorRepo.insertReading(deviceId, fields);
  await sensorRepo.purgeOldLogs(deviceId);
  return id;
}

module.exports = { getHistory, getLatest, logReading };
