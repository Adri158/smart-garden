const serverService  = require('../services/serverService');
const { ok, fail }   = require('../utils/response');

async function getStats(req, res) {
  try {
    const stats = await serverService.getStats();
    return ok(res, stats);
  } catch (e) {
    return fail(res, e.message, 500);
  }
}

module.exports = { getStats };
