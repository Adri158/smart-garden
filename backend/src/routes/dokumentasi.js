const { Router } = require('express');
const fs          = require('fs');
const path        = require('path');
const { ok }      = require('../utils/response');

const ROOT   = path.resolve(__dirname, '../../..');
const IMG    = path.join(ROOT, 'frontend', 'public', 'img', 'docs');
const VIDEO  = path.join(ROOT, 'frontend', 'public', 'video');

function fmtSize(bytes) {
  if (bytes < 1024)    return bytes + ' B';
  if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
  return (bytes / 1048576).toFixed(1) + ' MB';
}

function fmtDate(ms) {
  return new Date(ms).toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
}

const router = Router();

router.get('/files', (req, res) => {
  const files = [];

  const imgExts  = /\.(jpe?g|png|gif|webp)$/i;
  const vidExts  = /\.(mp4|webm|mov)$/i;

  if (fs.existsSync(IMG)) {
    for (const name of fs.readdirSync(IMG)) {
      if (!imgExts.test(name)) continue;
      const p    = path.join(IMG, name);
      const stat = fs.statSync(p);
      files.push({
        type:  'image',
        name:  path.parse(name).name,
        src:   'img/docs/' + name,
        sizeH: fmtSize(stat.size),
        date:  fmtDate(stat.mtimeMs),
        mtime: Math.floor(stat.mtimeMs / 1000),
      });
    }
  }

  if (fs.existsSync(VIDEO)) {
    for (const name of fs.readdirSync(VIDEO)) {
      if (!vidExts.test(name)) continue;
      const p     = path.join(VIDEO, name);
      const stat  = fs.statSync(p);
      const base  = path.parse(name).name;
      const thumbRel = 'video/thumbs/' + base + '.jpg';
      const thumbAbs = path.join(ROOT, 'frontend', 'public', thumbRel);
      files.push({
        type:  'video',
        name:  base,
        src:   'video/' + name,
        thumb: fs.existsSync(thumbAbs) ? thumbRel : null,
        sizeH: fmtSize(stat.size),
        date:  fmtDate(stat.mtimeMs),
        mtime: Math.floor(stat.mtimeMs / 1000),
      });
    }
  }

  const codeDefs = [
    { name: 'firmware',   src: 'ini.ino',                                    lang: 'cpp'        },
    { name: 'dashboard',  src: 'frontend/src/pages/Dashboard.jsx',           lang: 'javascript' },
    { name: 'css',        src: 'frontend/src/styles/dashboard.css',          lang: 'css'        },
    { name: 'api-server', src: 'backend/server.js',                          lang: 'javascript' },
    { name: 'api-routes', src: 'backend/src/routes/index.js',                lang: 'javascript' },
    { name: 'database',   src: 'backend/src/config/db.js',                   lang: 'javascript' },
    { name: 'mqtt-save',  src: 'backend/src/jobs/mqttSave.js',               lang: 'javascript' },
  ];

  for (const c of codeDefs) {
    const p = path.join(ROOT, c.src);
    if (!fs.existsSync(p)) continue;
    const stat    = fs.statSync(p);
    const content = fs.readFileSync(p, 'utf8');
    const preview = content.split('\n').slice(0, 9).join('\n');
    files.push({
      type:    'code',
      name:    c.name,
      src:     c.src,
      lang:    c.lang,
      content,
      preview,
      sizeH:   fmtSize(stat.size),
      date:    fmtDate(stat.mtimeMs),
      mtime:   Math.floor(stat.mtimeMs / 1000),
    });
  }

  files.sort((a, b) => a.type.localeCompare(b.type) || a.name.localeCompare(b.name));
  ok(res, files);
});

module.exports = router;
