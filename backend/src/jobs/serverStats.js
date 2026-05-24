const mqtt          = require('mqtt');
const fs            = require('fs');
const os            = require('os');
const { execSync }  = require('child_process');

const client = mqtt.connect('mqtt://localhost:1883', { clientId: 'server-stats' });

function getStats() {
  const load     = os.loadavg().map(v => Math.round(v * 100) / 100);
  const totalMem = Math.round(os.totalmem() / 1024 / 1024);
  const freeMem  = Math.round(os.freemem()  / 1024 / 1024);
  const usedMem  = totalMem - freeMem;
  const ramPct   = Math.round((usedMem / totalMem) * 100);


  const stat1  = fs.readFileSync('/proc/stat', 'utf8').split('\n')[0].split(' ').slice(1).map(Number);
  const idle1  = stat1[3];
  const total1 = stat1.reduce((a, b) => a + b, 0);


  const dfOut        = execSync("df / --output=used,avail --block-size=MB | tail -1").toString().trim();
  const [usedDiskStr, availDiskStr] = dfOut.split(/\s+/);
  const usedDisk  = parseInt(usedDiskStr);
  const availDisk = parseInt(availDiskStr);
  const totalDisk = usedDisk + availDisk;
  const diskPct   = Math.round((usedDisk / totalDisk) * 100);

  const uptime = Math.floor(os.uptime());

  return new Promise(resolve => {
    setTimeout(() => {
      const stat2  = fs.readFileSync('/proc/stat', 'utf8').split('\n')[0].split(' ').slice(1).map(Number);
      const idle2  = stat2[3];
      const total2 = stat2.reduce((a, b) => a + b, 0);
      const cpuPct = Math.round((1 - (idle2 - idle1) / (total2 - total1)) * 100);

      resolve({
        cpu_pct:    cpuPct,
        load,
        ram_pct:    ramPct,
        ram_used:   usedMem,
        ram_total:  totalMem,
        disk_pct:   diskPct,
        disk_used:  usedDisk,
        disk_total: totalDisk,
        uptime_sec: uptime,
        hostname:   os.hostname(),
        os:         'Arch Linux',
        kernel:     os.release(),
        cpu_model:  os.cpus()[0]?.model || '-',
        cores:      os.cpus().length,
      });
    }, 500);
  });
}

client.on('connect', () => {
  console.log('server-stats connected to MQTT');

  async function publish() {
    try {
      const stats = await getStats();
      client.publish('smartgarden/server/status', JSON.stringify(stats), { retain: true });
    } catch (e) {
      console.error('stats error:', e.message);
    }
  }

  publish();
  setInterval(publish, 5000);
});

client.on('error', err => console.error('MQTT error:', err.message));
