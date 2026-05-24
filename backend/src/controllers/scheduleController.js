const scheduleService                             = require('../services/scheduleService');
const { validateScheduleCreate, validateScheduleUpdate } = require('../validators/scheduleValidator');
const { ok, fail }                                = require('../utils/response');

async function listSchedules(req, res) {
  try {
    const data = await scheduleService.listSchedules();
    return ok(res, data);
  } catch (e) {
    return fail(res, e.message, 500);
  }
}

async function createSchedule(req, res) {
  const validation = validateScheduleCreate(req.body);
  if (!validation.valid) return fail(res, validation.error);

  try {
    const data = await scheduleService.createSchedule(req.body);
    return ok(res, data, 201);
  } catch (e) {
    return fail(res, e.message, 500);
  }
}

async function updateSchedule(req, res) {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id) || id < 1) return fail(res, 'Invalid schedule ID');

  const validation = validateScheduleUpdate(req.body);
  if (!validation.valid) return fail(res, validation.error);

  try {
    const data = await scheduleService.updateSchedule(id, req.body);
    return ok(res, data);
  } catch (e) {
    if (e.message === 'not_found') return fail(res, 'Schedule not found', 404);
    return fail(res, e.message, 500);
  }
}

async function deleteSchedule(req, res) {
  const id = parseInt(req.params.id, 10);
  if (isNaN(id) || id < 1) return fail(res, 'Invalid schedule ID');

  try {
    const data = await scheduleService.deleteSchedule(id);
    return ok(res, data);
  } catch (e) {
    if (e.message === 'not_found') return fail(res, 'Schedule not found', 404);
    return fail(res, e.message, 500);
  }
}

module.exports = { listSchedules, createSchedule, updateSchedule, deleteSchedule };
