const { Router }         = require('express');
const deviceController   = require('../controllers/deviceController');
const sensorController   = require('../controllers/sensorController');
const settingsController = require('../controllers/settingsController');
const { requireApiKey }  = require('../middlewares/auth');

const router = Router();

router.get('/',    deviceController.listDevices);
router.get('/:deviceId', deviceController.getDevice);

router.get('/:deviceId/sensors/latest', sensorController.getLatest);
router.get('/:deviceId/sensors',        sensorController.getHistory);
router.post('/:deviceId/sensors',       requireApiKey, sensorController.logReading);

router.get('/:deviceId/settings',  settingsController.getDeviceSettings);
router.put('/:deviceId/settings',  requireApiKey, settingsController.updateDeviceSettings);

module.exports = router;
