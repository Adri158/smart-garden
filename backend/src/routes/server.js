const { Router }       = require('express');
const serverController = require('../controllers/serverController');

const router = Router();

router.get('/stats', serverController.getStats);

module.exports = router;
