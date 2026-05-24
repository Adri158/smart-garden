function sanitizeDeviceId(id) {
  if (typeof id !== 'string') return null;
  const clean = id.replace(/[^a-z0-9\-]/gi, '');
  return clean.length > 0 && clean.length <= 60 ? clean : null;
}

module.exports = { sanitizeDeviceId };
