const settingsService      = require('../services/settingsService');
const { ok, fail }         = require('../utils/response');
const { sanitizeDeviceId } = require('../utils/sanitize');

async function getGlobalSettings(req, res) {
  try {
    const data = await settingsService.getGlobalSettings();
    return ok(res, data);
  } catch (e) {
    return fail(res, e.message, 500);
  }
}

async function getDeviceSettings(req, res) {
  const deviceId = sanitizeDeviceId(req.params.deviceId);
  if (!deviceId) return fail(res, 'Invalid device ID');

  try {
    const data = await settingsService.getDeviceSettings(deviceId);
    return ok(res, data);
  } catch (e) {
    return fail(res, e.message, 500);
  }
}

async function updateDeviceSettings(req, res) {
  const deviceId = sanitizeDeviceId(req.params.deviceId);
  if (!deviceId) return fail(res, 'Invalid device ID');

  try {
    const result = await settingsService.updateDeviceSettings(deviceId, req.body);
    return ok(res, result);
  } catch (e) {
    return fail(res, e.message, 400);
  }
}

module.exports = { getGlobalSettings, getDeviceSettings, updateDeviceSettings };
