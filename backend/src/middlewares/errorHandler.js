function errorHandler(err, req, res, _next) {
  console.error('[error]', err.message);
  res.status(500).json({ success: false, error: 'Internal server error' });
}

module.exports = errorHandler;
