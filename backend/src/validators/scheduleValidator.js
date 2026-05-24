function validateScheduleCreate(body) {
  const { days, time } = body;

  if (!Array.isArray(days) || days.length === 0) {
    return { valid: false, error: 'days must be a non-empty array of integers 0–6' };
  }
  for (const d of days) {
    if (!Number.isInteger(d) || d < 0 || d > 6) {
      return { valid: false, error: 'Each day must be an integer 0 (Sun) – 6 (Sat)' };
    }
  }
  if (typeof time !== 'string' || !/^\d{2}:\d{2}$/.test(time)) {
    return { valid: false, error: 'time must be HH:MM format' };
  }

  return { valid: true };
}

function validateScheduleUpdate(body) {
  const { days, time, enabled } = body;

  if (days === undefined && time === undefined && enabled === undefined) {
    return { valid: false, error: 'Nothing to update — provide days, time, or enabled' };
  }

  if (days !== undefined) {
    if (!Array.isArray(days) || days.length === 0) {
      return { valid: false, error: 'days must be a non-empty array of integers 0–6' };
    }
    for (const d of days) {
      if (!Number.isInteger(d) || d < 0 || d > 6) {
        return { valid: false, error: 'Each day must be an integer 0 (Sun) – 6 (Sat)' };
      }
    }
  }

  if (time !== undefined) {
    if (typeof time !== 'string' || !/^\d{2}:\d{2}$/.test(time)) {
      return { valid: false, error: 'time must be HH:MM format' };
    }
  }

  return { valid: true };
}

module.exports = { validateScheduleCreate, validateScheduleUpdate };
