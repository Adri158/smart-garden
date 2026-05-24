<?php
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/shared/layout.php';
sgHead('Sistem', '
<link href="https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap" rel="stylesheet">
<style>
.sis-wrap {
  max-width: 860px;
  margin: 0 auto;
  padding: 36px 24px 80px;
}

.sis-head { margin-bottom: 40px; }
.sis-eyebrow {
  font-family: "Space Mono", monospace;
  font-size: 10px; letter-spacing: 2px; text-transform: uppercase;
  color: var(--blue); margin-bottom: 8px;
}
.sis-title {
  font-family: "Bebas Neue", sans-serif;
  font-size: 48px; font-weight: 400; color: var(--text); line-height: 1;
  letter-spacing: 3px; margin-bottom: 12px;
}
.sis-status-row {
  display: flex; align-items: center; gap: 8px;
  font-family: "Space Mono", monospace; font-size: 11px; color: var(--muted);
}
.sis-dot {
  width: 8px; height: 8px; border-radius: 50%;
  background: var(--green); box-shadow: 0 0 8px #22c55e;
  transition: background .3s, box-shadow .3s; flex-shrink: 0;
}
.sis-dot.offline { background: var(--red); box-shadow: 0 0 8px #ef4444; }

.sis-stats {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  border-top: 1px solid var(--border);
  border-bottom: 1px solid var(--border);
  margin-bottom: 48px;
}
@media (max-width: 640px) {
  .sis-stats { grid-template-columns: repeat(2, 1fr); }
}
.sis-stat {
  padding: 24px 20px;
  border-right: 1px solid var(--border);
  display: flex; flex-direction: column; gap: 8px;
}
.sis-stat:last-child { border-right: none; }
@media (max-width: 640px) {
  .sis-stat:nth-child(2) { border-right: none; }
  .sis-stat:nth-child(3) { border-top: 1px solid var(--border); }
  .sis-stat:nth-child(4) { border-top: 1px solid var(--border); border-right: none; }
}

.sis-stat-label {
  font-family: "Space Mono", monospace;
  font-size: 10px; letter-spacing: 1.5px; text-transform: uppercase;
  color: var(--muted); display: flex; align-items: center; gap: 6px;
}
.sis-stat-label i { color: var(--blue); font-size: 10px; }

.sis-stat-val {
  font-family: "Bebas Neue", sans-serif;
  font-size: 52px; font-weight: 400; line-height: 1;
  color: var(--text); letter-spacing: 2px;
}
.sis-stat-val .unit {
  font-size: 16px; font-weight: 600; color: var(--muted); margin-left: 1px;
}

.sis-bar-track {
  height: 3px; background: var(--raise); border-radius: 2px; overflow: hidden;
}
.sis-bar-fill {
  height: 100%; width: 0%; border-radius: 2px;
  background: var(--blue);
  transition: width .7s ease, background .4s;
}
.sis-bar-fill.warn   { background: #f59e0b; }
.sis-bar-fill.danger { background: var(--red); }

.sis-stat-sub {
  font-family: "Space Mono", monospace;
  font-size: 10px; color: var(--muted);
}

.sis-info-head {
  font-family: "Space Mono", monospace;
  font-size: 10px; letter-spacing: 2px; text-transform: uppercase;
  color: var(--muted); margin-bottom: 16px;
  display: flex; align-items: center; gap: 8px;
}
.sis-info-head::after {
  content: ""; flex: 1; height: 1px; background: var(--border);
}
.sis-table {
  display: flex; flex-direction: column; gap: 1px;
  background: var(--border);
  border: 1px solid var(--border);
  border-radius: 10px; overflow: hidden;
}
.sis-row {
  background: var(--surface);
  display: flex; justify-content: space-between; align-items: baseline;
  padding: 10px 16px; gap: 24px;
}
.sis-key {
  font-family: "Space Mono", monospace;
  font-size: 10px; color: var(--muted); flex-shrink: 0; white-space: nowrap;
}
.sis-val {
  font-family: "Space Mono", monospace;
  font-size: 10px; font-weight: 700; color: var(--text);
  text-align: right; word-break: break-word;
}
</style>
');
sgAppBar('sistem');
?>

<main class="main-content">
<div class="sis-wrap">

  <div class="sis-head">
    <div class="sis-eyebrow">Smart Garden</div>
    <h1 class="sis-title">Status Sistem</h1>
    <div class="sis-status-row">
      <span class="sis-dot" id="sisDot"></span>
      <span id="sisLabel">Menghubungkan...</span>
    </div>
  </div>

  <div class="sis-stats">

    <div class="sis-stat">
      <div class="sis-stat-label"><i class="fa fa-microchip"></i> CPU</div>
      <div class="sis-stat-val" id="cpuVal">—<span class="unit">%</span></div>
      <div class="sis-bar-track"><div class="sis-bar-fill" id="cpuBar"></div></div>
      <div class="sis-stat-sub" id="cpuSub">—</div>
    </div>

    <div class="sis-stat">
      <div class="sis-stat-label"><i class="fa fa-memory"></i> RAM</div>
      <div class="sis-stat-val" id="ramVal">—<span class="unit">%</span></div>
      <div class="sis-bar-track"><div class="sis-bar-fill" id="ramBar"></div></div>
      <div class="sis-stat-sub" id="ramSub">—</div>
    </div>

    <div class="sis-stat">
      <div class="sis-stat-label"><i class="fa fa-hard-drive"></i> Disk</div>
      <div class="sis-stat-val" id="diskVal">—<span class="unit">%</span></div>
      <div class="sis-bar-track"><div class="sis-bar-fill" id="diskBar"></div></div>
      <div class="sis-stat-sub" id="diskSub">—</div>
    </div>

    <div class="sis-stat">
      <div class="sis-stat-label"><i class="fa fa-clock"></i> Uptime</div>
      <div class="sis-stat-val" id="uptimeVal" style="font-size:36px;padding-top:4px;letter-spacing:1px">—</div>
      <div class="sis-bar-track"></div>
      <div class="sis-stat-sub" id="uptimeSub">—</div>
    </div>

  </div>

  <div class="sis-info-head">Informasi Sistem</div>
  <div class="sis-table">
    <div class="sis-row"><span class="sis-key">Hostname</span><span class="sis-val" id="iHostname">—</span></div>
    <div class="sis-row"><span class="sis-key">OS</span><span class="sis-val" id="iOS">—</span></div>
    <div class="sis-row"><span class="sis-key">Kernel</span><span class="sis-val" id="iKernel">—</span></div>
    <div class="sis-row"><span class="sis-key">CPU Model</span><span class="sis-val" id="iCpu">—</span></div>
    <div class="sis-row"><span class="sis-key">Cores</span><span class="sis-val" id="iCores">—</span></div>
    <div class="sis-row"><span class="sis-key">Load Avg</span><span class="sis-val" id="iLoad">—</span></div>
  </div>

</div>
</main>

<?php sgFoot('
const sisDot   = document.getElementById("sisDot");
const sisLabel = document.getElementById("sisLabel");

function bar(id, pct) {
  const el = document.getElementById(id);
  if (!el) return;
  el.style.width = pct + "%";
  el.classList.toggle("warn",   pct >= 60 && pct < 80);
  el.classList.toggle("danger", pct >= 80);
}

function uptime(s) {
  const d = Math.floor(s / 86400), h = Math.floor((s % 86400) / 3600), m = Math.floor((s % 3600) / 60);
  return d > 0 ? d + " hari " + h + " jam " + m + " mnt" : h + " jam " + m + " mnt";
}

async function fetchStats() {
  try {
    const res = await fetch("/server_status.php");
    if (!res.ok) throw new Error();
    const d = await res.json();

    sisDot.classList.remove("offline");
    sisLabel.textContent = "Server online";

    document.getElementById("cpuVal").innerHTML = d.cpu_pct + `<span class="unit">%</span>`;
    document.getElementById("cpuSub").textContent = "Load: " + d.load.join("  ");
    bar("cpuBar", d.cpu_pct);

    document.getElementById("ramVal").innerHTML = d.ram_pct + `<span class="unit">%</span>`;
    document.getElementById("ramSub").textContent = d.ram_used + " / " + d.ram_total + " MB";
    bar("ramBar", d.ram_pct);

    document.getElementById("diskVal").innerHTML = d.disk_pct + `<span class="unit">%</span>`;
    document.getElementById("diskSub").textContent = d.disk_used + " / " + d.disk_total + " MB";
    bar("diskBar", d.disk_pct);

    document.getElementById("uptimeVal").textContent = uptime(d.uptime_sec);
    document.getElementById("uptimeSub").textContent = d.uptime_sec + "s total";

    document.getElementById("iHostname").textContent = d.hostname;
    document.getElementById("iOS").textContent       = d.os;
    document.getElementById("iKernel").textContent   = d.kernel;
    document.getElementById("iCpu").textContent      = d.cpu_model;
    document.getElementById("iCores").textContent    = d.cores + " cores";
    document.getElementById("iLoad").textContent     = d.load.join(" / ");
  } catch {
    sisDot.classList.add("offline");
    sisLabel.textContent = "Gagal mengambil data";
  }
}

fetchStats();
setInterval(fetchStats, 1000);
'); ?>
