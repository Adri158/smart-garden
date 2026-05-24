const { Router } = require('express');
const router = Router();

router.get('/waktu', (req, res) => {
  const now = new Date(Date.now() + 8 * 3600_000); // UTC+8 WITA
  const hh  = String(now.getUTCHours()).padStart(2, '0');
  const mm  = String(now.getUTCMinutes()).padStart(2, '0');
  const ss  = String(now.getUTCSeconds()).padStart(2, '0');
  const dd  = now.getUTCDate();
  const mo  = now.toLocaleString('id-ID', { month: 'long', timeZone: 'UTC' });
  const yy  = now.getUTCFullYear();
  const time = `${hh}:${mm}:${ss} WITA`;
  const date = `${dd} ${mo} ${yy}`;

  const labelW = 80;
  const timeW  = 148;
  const dateW  = 148;
  const totalW = labelW + timeW + dateW;
  const h      = 28;

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${totalW}" height="${h}" role="img" aria-label="Waktu Makassar: ${time}">
  <title>Waktu Makassar: ${time}</title>
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#0d1117"/>
      <stop offset="100%" stop-color="#0f1e3a"/>
    </linearGradient>
  </defs>
  <rect width="${totalW}" height="${h}" rx="6" fill="url(#bg)"/>
  <rect width="${labelW}" height="${h}" rx="6" fill="#1e3a5f"/>
  <rect x="${labelW - 4}" width="4" height="${h}" fill="#1e3a5f"/>
  <text x="${labelW / 2}" y="18" font-family="monospace" font-size="11" fill="#64748b" text-anchor="middle" font-weight="bold">🕐 WITA</text>
  <text x="${labelW + timeW / 2}" y="18" font-family="'Courier New',monospace" font-size="12" fill="#22d3ee" text-anchor="middle" letter-spacing="1">${time}</text>
  <rect x="${labelW + timeW - 1}" width="1" height="${h}" fill="#1e3a5f" opacity="0.6"/>
  <text x="${labelW + timeW + dateW / 2}" y="18" font-family="'Courier New',monospace" font-size="11" fill="#94a3b8" text-anchor="middle">${date}</text>
</svg>`;

  res.set({
    'Content-Type': 'image/svg+xml',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Pragma': 'no-cache',
    'Expires': '0',
  });
  res.send(svg);
});

module.exports = router;
