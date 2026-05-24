const fs   = require('fs');
const os   = require('os');
const { exec } = require('child_process');

async function getCpuPercent() {
  function readStat() {
    const line  = fs.readFileSync('/proc/stat', 'utf8').split('\n')[0];
    const parts = line.split(/\s+/).slice(1).map(Number);
    const idle  = parts[3] + (parts[4] || 0); 
    const total = parts.reduce((a, b) => a + b, 0);
    return { idle, total };
  }

  const a = readStat();
  await new Promise(r => setTimeout(r, 200));
  const b = readStat();

  const diffTotal = b.total - a.total;
  const diffIdle  = b.idle  - a.idle;
  if (diffTotal === 0) return 0;
  return Math.round((1 - diffIdle / diffTotal) * 1000) / 10;
}

function getMemInfo() {
  const text = fs.readFileSync('/proc/meminfo', 'utf8');
  const parse = key => {
    const m = text.match(new RegExp(`^${key}:\\s+(\\d+)`, 'm'));
    return m ? parseInt(m[1], 10) * 1024 : 0; 
  };
  const total     = parse('MemTotal');
  const available = parse('MemAvailable');
  const used      = total - available;
  return {
    total_bytes:     total,
    used_bytes:      used,
    available_bytes: available,
    percent:         total > 0 ? Math.round((used / total) * 1000) / 10 : 0,
  };
}

function getDiskInfo() {
  return new Promise((resolve) => {
    exec("df -BK / --output=size,used,avail,pcent | tail -1", (err, stdout) => {
      if (err) return resolve(null);
      const parts   = stdout.trim().split(/\s+/);
      const toBytes = s => parseInt(s.replace('K', ''), 10) * 1024;
      resolve({
        total_bytes: toBytes(parts[0]),
        used_bytes:  toBytes(parts[1]),
        free_bytes:  toBytes(parts[2]),
        percent:     parseFloat(parts[3]),
      });
    });
  });
}

function getUptime() {
  const text  = fs.readFileSync('/proc/uptime', 'utf8');
  const secs  = parseFloat(text.split(' ')[0]);
  const days  = Math.floor(secs / 86400);
  const hours = Math.floor((secs % 86400) / 3600);
  const mins  = Math.floor((secs % 3600)  / 60);
  return { seconds: Math.floor(secs), days, hours, minutes: mins };
}

async function getStats() {
  const [cpu, disk] = await Promise.all([getCpuPercent(), getDiskInfo()]);
  const mem    = getMemInfo();
  const uptime = getUptime();

  return {
    cpu: {
      percent: cpu,
      cores:   os.cpus().length,
      model:   os.cpus()[0]?.model || 'unknown',
    },
    memory:   mem,
    disk:     disk,
    uptime:   uptime,
    load_avg: os.loadavg().map(v => Math.round(v * 100) / 100),
    hostname: os.hostname(),
    os:       'Arch Linux',
    kernel:   os.release(),
    ts:       new Date().toISOString(),
  };
}

module.exports = { getStats };
