const { fail }  = require('../utils/response');
const config    = require('../config/app');

function requireApiKey(req, res, next) {
  const key = req.headers['x-api-key'];
  if (!key || key !== config.apiKey) {
    return fail(res, 'Invalid or missing API key', 401);
  }
  next();
}

module.exports = { requireApiKey };
