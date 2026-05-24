const sensorService        = require('../services/sensorService');
const { validateSensorBody } = require('../validators/sensorValidator');
const { ok, fail }           = require('../utils/response');
const { sanitizeDeviceId }   = require('../utils/sanitize');

async function getHistory(req, res) {
  const deviceId = sanitizeDeviceId(req.params.deviceId);
  if (!deviceId) return fail(res, 'Invalid device ID');

  try {
    const data = await sensorService.getHistory(deviceId, req.query.range, req.query.sensor);
    return ok(res, data);
  } catch (e) {
    return fail(res, e.message, 500);
  }
}

async function getLatest(req, res) {
  const deviceId = sanitizeDeviceId(req.params.deviceId);
  if (!deviceId) return fail(res, 'Invalid device ID');

  try {
    const row = await sensorService.getLatest(deviceId);
    if (!row) return fail(res, 'No sensor data found for this device', 404);
    return ok(res, row);
  } catch (e) {
    return fail(res, e.message, 500);
  }
}

async function logReading(req, res) {
  const deviceId = sanitizeDeviceId(req.params.deviceId);
  if (!deviceId) return fail(res, 'Invalid device ID');

  const validation = validateSensorBody(req.body);
  if (!validation.valid) return fail(res, validation.error);

  try {
    const id = await sensorService.logReading(deviceId, req.body);
    return ok(res, { id }, 201);
  } catch (e) {
    return fail(res, e.message, 500);
  }
}

module.exports = { getHistory, getLatest, logReading };
