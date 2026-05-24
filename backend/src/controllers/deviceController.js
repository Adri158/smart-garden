const deviceService      = require('../services/deviceService');
const { ok, fail }       = require('../utils/response');
const { sanitizeDeviceId } = require('../utils/sanitize');

async function listDevices(req, res) {
  try {
    const devices = await deviceService.listDevices();
    return ok(res, devices);
  } catch (e) {
    return fail(res, e.message, 500);
  }
}

async function getDevice(req, res) {
  const deviceId = sanitizeDeviceId(req.params.deviceId);
  if (!deviceId) return fail(res, 'Invalid device ID');

  try {
    const device = await deviceService.getDeviceWithLatest(deviceId);
    if (!device) return fail(res, 'Device not found', 404);
    return ok(res, device);
  } catch (e) {
    return fail(res, e.message, 500);
  }
}

module.exports = { listDevices, getDevice };
