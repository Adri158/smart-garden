const scheduleRepo = require('../repositories/scheduleRepository');

function normalize(r) {
  return {
    id:         r.id,
    days:       r.days ? r.days.split(',').map(Number) : [],
    time:       r.time,
    enabled:    !!r.enabled,
    created_at: r.created_at,
  };
}

async function listSchedules() {
  const rows = await scheduleRepo.list();
  return rows.map(normalize);
}

async function createSchedule({ days, time, enabled }) {
  const daysStr   = [...new Set(days)].sort().join(',');
  const isEnabled = enabled !== undefined ? (enabled ? 1 : 0) : 1;
  const id        = await scheduleRepo.insert(daysStr, time, isEnabled);

  return { id, days: daysStr.split(',').map(Number), time, enabled: !!isEnabled };
}

async function updateSchedule(id, { days, time, enabled }) {
  const fields = [];
  const values = [];

  if (days !== undefined) {
    fields.push('days = ?');
    values.push([...new Set(days)].sort().join(','));
  }
  if (time !== undefined) {
    fields.push('time = ?');
    values.push(time);
  }
  if (enabled !== undefined) {
    fields.push('enabled = ?');
    values.push(enabled ? 1 : 0);
  }

  const affected = await scheduleRepo.update(id, fields, values);
  if (affected === 0) throw new Error('not_found');
  return { id, updated: true };
}

async function deleteSchedule(id) {
  const affected = await scheduleRepo.remove(id);
  if (affected === 0) throw new Error('not_found');
  return { id, deleted: true };
}

module.exports = { listSchedules, createSchedule, updateSchedule, deleteSchedule };
