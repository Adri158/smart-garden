const { Router } = require('express');

const statusRouter       = require('./status');
const devicesRouter      = require('./devices');
const settingsRouter     = require('./settings');
const schedulesRouter    = require('./schedules');
const serverRouter       = require('./server');
const dokumentasiRouter  = require('./dokumentasi');
const chatRouter         = require('./chat');

const router = Router();

router.use(statusRouter);
router.use('/devices',      devicesRouter);
router.use('/settings',     settingsRouter);
router.use('/schedules',    schedulesRouter);
router.use('/server',       serverRouter);
router.use('/dokumentasi',  dokumentasiRouter);
router.use('/chat',         chatRouter);

module.exports = router;
