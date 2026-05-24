const { Router }         = require('express');
const settingsController = require('../controllers/settingsController');

const router = Router();

router.get('/', settingsController.getGlobalSettings);

module.exports = router;
