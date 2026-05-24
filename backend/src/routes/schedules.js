const { Router }         = require('express');
const scheduleController = require('../controllers/scheduleController');
const { requireApiKey }  = require('../middlewares/auth');

const router = Router();

router.get('/',     scheduleController.listSchedules);
router.post('/',    requireApiKey, scheduleController.createSchedule);
router.put('/:id',  requireApiKey, scheduleController.updateSchedule);
router.delete('/:id', requireApiKey, scheduleController.deleteSchedule);

module.exports = router;
