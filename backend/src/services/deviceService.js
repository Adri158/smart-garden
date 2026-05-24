const deviceRepo = require('../repositories/deviceRepository');
const sensorRepo = require('../repositories/sensorRepository');

async function listDevices() {
  return deviceRepo.listDevices();
}

async function getDeviceWithLatest(deviceId) {
  const device = await deviceRepo.findDevice(deviceId);
  if (!device) return null;

  const latest = await sensorRepo.latestReading(deviceId);
  return { ...device, latest: latest || null };
}

module.exports = { listDevices, getDeviceWithLatest };
