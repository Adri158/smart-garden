const db         = require('../config/db');
const { ok, fail } = require('../utils/response');

async function getStatus(req, res) {
  try {
    await db.query('SELECT 1');
    return ok(res, { ok: true, db: 'connected', ts: new Date().toISOString() });
  } catch (e) {
    return fail(res, 'DB unreachable: ' + e.message, 503);
  }
}

module.exports = { getStatus };
