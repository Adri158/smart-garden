<?php
if (session_status() === PHP_SESSION_NONE) session_start();
if (!defined('_SG_AUTHOR') || strpos(_SG_AUTHOR, 'Adriansyah') === false) { session_unset(); session_destroy(); session_start(); }

function sgHead(string $title, string $extraCss = ''): void {
  $t = $title ? htmlspecialchars($title) . ' — Smart Garden' : 'Smart Garden';
?>
<!DOCTYPE html>
<html lang="id">
<head>
<meta charset="UTF-8">
<meta name="author" content="Untung Adriansyah">
<meta name="copyright" content="Copyright © 2026 Untung Adriansyah | github.com/Adri158/smart-garden | Apache 2.0">

<meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no">
<title><?= $t ?></title>
<meta name="theme-color" content="#06080f">
<meta name="mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-capable" content="yes">
<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">
<meta name="apple-mobile-web-app-title" content="Smart Garden">
<link rel="manifest" href="/manifest.json">
<link rel="apple-touch-icon" href="/img/icons/icon.svg">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link href="https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Mono:wght@300;400;500&family=DM+Sans:wght@300;400;500&display=swap" rel="stylesheet">
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.0/css/all.min.css">
<style>

*, *::before, *::after {
  box-sizing: border-box; margin: 0; padding: 0;
  -webkit-tap-highlight-color: transparent;
}
html { scroll-behavior: smooth; overflow-x: hidden; }
body { max-width: 100vw; }

:root {
  --bg:        #06080f;
  --surface:   #0c1018;
  --raise:     #12181f;
  --panel:     #0f1521;
  --blue:      #3b82f6;
  --blue-dim:  rgba(59,130,246,0.10);
  --blue-glow: rgba(59,130,246,0.30);
  --green:     #22c55e;
  --red:       #ef4444;
  --amber:     #f59e0b;
  --text:      #eef2f7;
  --muted:     #64748b;
  --border:    rgba(255,255,255,0.06);
  --radius:    10px;
  --font-head: 'Syne', sans-serif;
  --font-mono: 'DM Mono', monospace;
  --font-body: 'DM Sans', sans-serif;
}

body {
  font-family: var(--font-body);
  background: var(--bg);
  color: var(--text);
  -webkit-font-smoothing: antialiased;
  text-rendering: optimizeLegibility;
  overflow-x: hidden;
  -webkit-user-select: none;
  -moz-user-select: none;
  user-select: none;
}
input, textarea, [contenteditable] {
  -webkit-user-select: text;
  user-select: text;
}
::selection { background: transparent; }

body.sg-app { overflow: hidden; }
body.sg-app .main-content {
  position: relative; z-index: 2;
  height: calc(100vh - 52px);
  overflow-y: auto;
}

body::before {
  content: '';
  position: fixed; inset: 0;
  background-image:
    linear-gradient(rgba(59,130,246,0.025) 1px, transparent 1px),
    linear-gradient(90deg, rgba(59,130,246,0.025) 1px, transparent 1px);
  background-size: 48px 48px;
  pointer-events: none; z-index: 0;
}

body.sg-desktop * { cursor: none !important; }

#sg-cursor {
  position: fixed;
  width: 28px; height: 28px;
  border: 1px solid rgba(59,130,246,0.55);
  border-radius: 50%;
  pointer-events: none; z-index: 999999;
  transform: translate(-50%,-50%);
  transition: width .18s ease, height .18s ease, border-color .2s, box-shadow .2s;
}
#sg-cursor::before {
  content: '';
  position: absolute; inset: -6px; border-radius: 50%;
  border: 1px solid transparent;
  border-top-color: rgba(59,130,246,0.45);
  border-bottom-color: rgba(59,130,246,0.45);
  transition: border-color .2s;
}
#sg-dot {
  position: fixed;
  width: 3px; height: 3px;
  background: var(--blue); border-radius: 50%;
  pointer-events: none; z-index: 999999;
  transform: translate(-50%,-50%);
  box-shadow: 0 0 5px rgba(59,130,246,0.9);
}
#sg-cursor.sg-hover {
  width: 46px; height: 46px;
  border-color: var(--blue);
  box-shadow: 0 0 0 3px rgba(59,130,246,0.07), 0 0 16px rgba(59,130,246,0.22);
}
#sg-cursor.sg-hover::before {
  border-top-color: rgba(59,130,246,0.7);
  border-bottom-color: rgba(59,130,246,0.7);
}

@media (pointer: fine) {
  ::-webkit-scrollbar { width: 3px; height: 3px; }
  ::-webkit-scrollbar-track { background: transparent; }
  ::-webkit-scrollbar-thumb { background: rgba(59,130,246,0.35); border-radius: 3px; }
  ::-webkit-scrollbar-thumb:hover { background: var(--blue); }
}

.reveal {
  opacity: 0; transform: translateY(20px);
  transition: opacity .55s ease, transform .55s ease;
}
.reveal.visible { opacity: 1; transform: none; }

.topbar {
  display: flex; align-items: center; justify-content: space-between;
  height: 52px; padding: 0 16px;
  background: rgba(12,16,24,0.92); border-bottom: 1px solid var(--border);
  backdrop-filter: blur(12px);
  position: sticky; top: 0; z-index: 100; flex-shrink: 0;
}
.topbar-left { display: flex; align-items: center; gap: 14px; }
.topbar-logo {
  font-family: var(--font-mono); font-size: 13px; font-weight: 700;
  letter-spacing: 2px; color: var(--blue); text-transform: uppercase;
  display: flex; align-items: center; gap: 8px;
  text-decoration: none;
}
.topbar-divider { width: 1px; height: 18px; background: var(--border); }
.topbar-page { font-size: 12px; color: var(--muted); }
.topbar-right { display: flex; align-items: center; gap: 10px; }

.esp-pill {
  display: flex; align-items: center; gap: 7px;
  padding: 5px 12px; border-radius: 20px;
  font-family: var(--font-mono); font-size: 10px;
  font-weight: 700; letter-spacing: 1.5px;
  background: rgba(148,163,184,0.08); border: 1px solid rgba(148,163,184,0.2);
  color: #94a3b8; transition: all .3s;
}
.esp-dot {
  width: 6px; height: 6px; border-radius: 50%;
  background: #94a3b8; animation: sg-blink 2s ease-in-out infinite;
  transition: background .3s;
}
@keyframes sg-blink { 0%,100%{opacity:1} 50%{opacity:.3} }

.topbar-clock {
  display: flex; align-items: center; gap: 5px;
  font-family: var(--font-mono); font-size: 11px;
}
.clock-date { color: var(--muted); letter-spacing: 0.5px; }
.clock-sep  { color: var(--border); }
.clock-time { color: var(--text); letter-spacing: 1px; }
.clock-zone {
  font-size: 9px; letter-spacing: 2px; color: var(--blue);
  background: var(--blue-dim); border: 1px solid rgba(59,130,246,0.2);
  padding: 2px 6px; border-radius: 4px;
}
@media (max-width: 480px) { .clock-date, .clock-sep { display: none; } }

.hamburger {
  display: flex; flex-direction: column;
  justify-content: center; align-items: center;
  gap: 5px; width: 34px; height: 34px;
  background: transparent; border: none;
  border-radius: 8px; padding: 0; transition: background .2s;
}
.hamburger:hover { background: var(--blue-dim); }
.hamburger span {
  display: block; width: 16px; height: 1.5px;
  background: var(--muted); border-radius: 2px; transition: all .25s;
}
.hamburger:hover span { background: var(--blue); }

.sidebar {
  position: fixed; top: 0; left: -260px;
  width: 240px; height: 100%;
  background: var(--surface); border-right: 1px solid var(--border);
  padding-top: 60px; z-index: 200; transition: left .3s ease;
}
.sidebar.active { left: 0; }
.sidebar-link {
  display: flex; align-items: center; gap: 12px;
  padding: 13px 22px; color: var(--muted);
  text-decoration: none; font-size: 13px; font-weight: 500;
  transition: all .2s; border-left: 2px solid transparent;
}
.sidebar-link i { width: 16px; text-align: center; font-size: 13px; }
.sidebar-link:hover, .sidebar-link.active {
  color: var(--blue); background: var(--blue-dim); border-left-color: var(--blue);
}

.sidebar-clock {
  position: absolute; bottom: 0; left: 0; right: 0;
  padding: 14px 18px 16px;
  border-top: 1px solid var(--border);
  background: linear-gradient(to top, rgba(59,130,246,0.04), transparent);
  display: flex; align-items: center; justify-content: space-between; gap: 10px;
}
.sidebar-clock-inner { flex: 1; min-width: 0; }
.sidebar-clock-row {
  display: flex; align-items: baseline; gap: 8px; margin-bottom: 4px;
}
.sidebar-clock-time {
  font-family: var(--font-mono); font-size: 15px; font-weight: 500;
  color: var(--text); letter-spacing: 1.5px;
}
.sidebar-clock-zone {
  font-family: var(--font-mono); font-size: 8px; letter-spacing: 2px;
  color: var(--blue); background: var(--blue-dim);
  border: 1px solid rgba(59,130,246,0.2);
  padding: 2px 5px; border-radius: 3px; text-transform: uppercase;
}
.sidebar-clock-date {
  font-family: var(--font-mono); font-size: 10px;
  color: var(--muted); letter-spacing: 0.3px;
}
.sidebar-admin-btn {
  display: flex; align-items: center; justify-content: center;
  width: 32px; height: 32px; border-radius: 8px; flex-shrink: 0;
  color: var(--muted); background: var(--raise); border: 1px solid var(--border);
  text-decoration: none; font-size: 13px; transition: all .2s;
}
.sidebar-admin-btn:hover {
  color: var(--blue); background: var(--blue-dim); border-color: rgba(59,130,246,0.3);
}
.sidebar-divider {
  height: 1px; background: var(--border); margin: 6px 16px;
}

.sidebar-role {
  display: flex; align-items: center; gap: 8px;
  padding: 10px 20px 10px;
  border-bottom: 1px solid var(--border);
  margin-bottom: 4px;
  font-family: var(--font-mono); font-size: 11px;
  color: var(--muted);
}
.sidebar-role i { font-size: 11px; color: var(--muted); }
.sidebar-role span:first-of-type { flex: 1; }
.sidebar-role-badge {
  font-size: 9px; font-weight: 700; letter-spacing: 1px; text-transform: uppercase;
  padding: 2px 7px; border-radius: 4px;
  background: var(--raise); color: var(--muted); border: 1px solid var(--border);
}
.sidebar-role-badge--admin {
  background: rgba(59,130,246,0.1); color: var(--blue);
  border-color: rgba(59,130,246,0.25);
}

.overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.6);
  opacity: 0; pointer-events: none; transition: opacity .3s; z-index: 150;
}
.overlay.active { opacity: 1; pointer-events: auto; }

button {
  font-family: inherit;
  border: 1px solid var(--border); background: var(--blue-dim);
  color: var(--blue); border-radius: var(--radius); transition: all .2s;
}
button:hover { background: var(--blue); color: #fff; box-shadow: 0 0 16px var(--blue-glow); }

.landing-nav {
  position: fixed; top: 0; left: 0; right: 0; height: 60px;
  display: flex; align-items: center; justify-content: space-between;
  padding: 0 40px;
  background: rgba(6,8,15,0.88); backdrop-filter: blur(16px);
  border-bottom: 1px solid var(--border); z-index: 100;
}
.ln-brand {
  font-family: var(--font-mono); font-size: 13px; font-weight: 500;
  letter-spacing: 2px; color: var(--blue); text-transform: uppercase;
  display: flex; align-items: center; gap: 10px;
}
.ln-dot {
  width: 7px; height: 7px; border-radius: 50%;
  background: var(--green); box-shadow: 0 0 8px var(--green);
  animation: sg-blink 2s infinite; flex-shrink: 0;
}
.ln-links { display: flex; align-items: center; gap: 8px; }
.ln-links a {
  font-family: var(--font-mono); font-size: 12px; color: var(--muted);
  text-decoration: none; padding: 6px 14px; border-radius: 20px;
  letter-spacing: .5px; transition: all .2s;
}
.ln-links a:hover { color: var(--text); background: var(--raise); }
.ln-cta {
  background: var(--blue) !important; color: #fff !important;
  box-shadow: 0 0 16px var(--blue-glow);
}
.ln-cta:hover { filter: brightness(1.1); }
.ln-burger {
  display: none; flex-direction: column; gap: 5px;
  background: none; border: none; padding: 4px;
}
.ln-burger span { display: block; width: 20px; height: 1.5px; background: var(--muted); transition: all .3s; }
.ln-burger:hover span { background: var(--blue); }
.ln-mobile {
  display: none; position: fixed; inset: 0; z-index: 300;
  background: rgba(6,8,15,0.98); backdrop-filter: blur(24px);
  flex-direction: column;
}
.ln-mobile.open { display: flex; }

.lnm-header {
  display: flex; align-items: center; justify-content: space-between;
  padding: 20px 24px; border-bottom: 1px solid var(--border); flex-shrink: 0;
}
.lnm-brand {
  display: flex; align-items: center; gap: 10px;
  font-family: var(--font-mono); font-size: 13px; font-weight: 500;
  letter-spacing: 2px; color: var(--blue); text-transform: uppercase;
}
.lnm-close {
  background: var(--raise); border: 1px solid var(--border);
  color: var(--muted); width: 36px; height: 36px; border-radius: 8px;
  font-size: 16px; display: flex; align-items: center; justify-content: center;
  transition: all .2s;
}
.lnm-close:hover { color: var(--text); border-color: var(--text); }

.lnm-links {
  flex: 1; display: flex; flex-direction: column;
  justify-content: center; padding: 0 24px; gap: 4px;
}
.lnm-item {
  display: flex; align-items: center; gap: 16px;
  padding: 18px 0; border-bottom: 1px solid var(--border);
  text-decoration: none; color: var(--muted);
  transition: color .25s; position: relative; overflow: hidden;
}
.lnm-item:first-child { border-top: 1px solid var(--border); }
.lnm-item:hover { color: var(--text); }
.lnm-item:hover .lnm-arrow { transform: translateX(4px); color: var(--blue); }
.lnm-num {
  font-family: var(--font-mono); font-size: 11px; color: var(--blue);
  opacity: 0.6; letter-spacing: 1px; flex-shrink: 0;
}
.lnm-label {
  font-family: var(--font-head); font-size: 28px; font-weight: 700;
  letter-spacing: 1px; flex: 1;
}
.lnm-arrow {
  font-size: 14px; color: var(--muted);
  transition: transform .25s, color .25s;
}

.lnm-cta {
  margin: 0 24px 24px; padding: 16px;
  background: var(--blue); color: #fff;
  border-radius: var(--radius); text-decoration: none;
  font-family: var(--font-mono); font-size: 13px; letter-spacing: 1px;
  display: flex; align-items: center; justify-content: center; gap: 10px;
  transition: filter .2s; flex-shrink: 0;
}
.lnm-cta:hover { filter: brightness(1.12); }

.lnm-footer {
  padding: 14px 24px; border-top: 1px solid var(--border); flex-shrink: 0;
}
.lnm-footer-label {
  font-family: var(--font-mono); font-size: 9px;
  letter-spacing: 2px; color: var(--muted); text-transform: uppercase;
}

.sg-login-wrap {
  min-height: 100vh; display: flex; align-items: center;
  justify-content: center; padding: 24px;
  position: relative; z-index: 1;
}

.sg-mono  { font-family: var(--font-mono); }
.sg-muted { color: var(--muted); }
.sg-green { color: var(--green); }
.sg-red   { color: var(--red); }
.sg-blue  { color: var(--blue); }
.sg-amber { color: var(--amber); }
.mono  { font-family: var(--font-mono); }
.muted { color: var(--muted); }
.green { color: var(--green); }
.red   { color: var(--red); }
.blue  { color: var(--blue); }
.amber { color: var(--amber); }

@media (max-width: 768px) {
  body { cursor: auto !important; }
  body * { cursor: auto !important; }
  #sg-cursor, #sg-dot { display: none !important; }
  .topbar-page, .topbar-divider { display: none; }
  .landing-nav { padding: 0 16px; }
  .ln-links { display: none; }
  .ln-burger { display: flex; }
}
@media (max-width: 480px) {
  .landing-nav { padding: 0 12px; }
  .lnm-header  { padding: 16px 16px; }
  .lnm-links   { padding: 0 16px; }
  .lnm-cta     { margin: 0 16px 20px; }
  .lnm-footer  { padding: 12px 16px; }
  .lnm-label   { font-size: 22px; }
}

.cdd { position: relative; display: inline-block; }
.cdd-btn {
  display: flex; align-items: center; gap: 7px;
  background: var(--raise); border: 1px solid var(--border); color: var(--text);
  padding: 7px 12px; border-radius: 9px; font-size: 12px;
  font-family: 'Space Mono', monospace; cursor: pointer;
  transition: border-color 0.2s, box-shadow 0.2s; white-space: nowrap;
  max-width: 220px; min-width: 0;
}
.cdd-btn:hover,
.cdd.open .cdd-btn { border-color: var(--blue); box-shadow: 0 0 0 3px rgba(59,130,246,0.1); }
.cdd-dot   { font-size: 7px; color: var(--green); filter: drop-shadow(0 0 4px #22c55e); flex-shrink: 0; transition: color 0.3s, filter 0.3s; }
.cdd-dot--offline { color: var(--red) !important; filter: drop-shadow(0 0 4px #ef4444) !important; }
.cdd-label { color: var(--text); font-weight: 700; font-size: 12px; overflow: hidden; text-overflow: ellipsis; min-width: 0; }
.cdd-id    { color: var(--muted); font-size: 10px; overflow: hidden; text-overflow: ellipsis; min-width: 0; }
.cdd-arrow { font-size: 9px; color: var(--muted); margin-left: 2px; transition: transform 0.2s; }
.cdd.open .cdd-arrow { transform: rotate(180deg); }
.cdd-menu {
  display: none; position: absolute; top: calc(100% + 6px); right: 0;
  min-width: 200px; background: var(--panel); border: 1px solid var(--border);
  border-radius: 10px; padding: 5px; z-index: 200;
  box-shadow: 0 8px 24px rgba(0,0,0,0.35);
}
.cdd.open .cdd-menu { display: block; }
.cdd-item {
  display: flex; align-items: center; gap: 9px;
  padding: 8px 10px; border-radius: 7px; cursor: pointer; transition: background 0.15s;
}
.cdd-item:hover { background: var(--raise); }
.cdd-item.active { background: rgba(59,130,246,0.08); }
.cdd-item.active .cdd-dot { color: var(--blue); filter: drop-shadow(0 0 4px var(--blue)); }
.cdd-item-info { display: flex; flex-direction: column; gap: 1px; min-width: 0; overflow: hidden; }
.cdd-item-name { font-size: 12px; font-family: 'Space Mono', monospace; font-weight: 700; color: var(--text); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.cdd-item-id   { font-size: 10px; font-family: 'Space Mono', monospace; color: var(--muted); overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.cdd--sm .cdd-btn  { padding: 4px 9px; font-size: 11px; border-radius: 7px; }
.cdd--sm .cdd-menu { min-width: 170px; max-width: 240px; }

</style>
<?= $extraCss ?>
</head>
<body>
<div id="sg-cursor"></div>
<div id="sg-dot"></div>
<?php
}

function sgAppBar(string $active = '', string $extraRight = ''): void {
  $isAdmin = !empty($_SESSION['admin_id']);

  $links = [
    ['href' => 'dashboard.php', 'key' => 'dashboard', 'icon' => 'fa-seedling',   'label' => 'Dashboard'],
    ['href' => 'panduan.php',  'key' => 'panduan',   'icon' => 'fa-book-open',  'label' => 'Panduan'],
    ['href' => 'sistem.php',   'key' => 'sistem',    'icon' => 'fa-server',     'label' => 'Sistem'],
  ];
  if ($isAdmin) {
    $links[] = ['type' => 'divider'];
    $links[] = ['href' => 'settings.php',       'key' => 'settings', 'icon' => 'fa-gear',         'label' => 'Settings'];
    $links[] = ['href' => 'admin/dashboard.php','key' => 'admin',    'icon' => 'fa-shield-halved','label' => 'Admin'];
  }
  $labels = [
    'dashboard'      => 'Dashboard', 'panduan'  => 'Panduan',
    'sistem'         => 'Sistem',    'settings' => 'Settings',
    'admin'          => 'Admin Panel', 'sensor_history' => 'Riwayat Sensor',
  ];
  
  echo '<script>document.body.classList.add("sg-app");</script>';
?>
<header class="topbar">
  <div class="topbar-left">
    <button class="hamburger" id="sg-hamburger" aria-label="Menu">
      <span></span><span></span><span></span>
    </button>
    <a href="dashboard.php" class="topbar-logo">
      <i class="fa fa-seedling"></i>Smart Garden
    </a>
    <div class="topbar-divider"></div>
    <span class="topbar-page"><?= htmlspecialchars($labels[$active] ?? ucfirst($active)) ?></span>
  </div>
  <div class="topbar-right">
    <?= $extraRight ?>
    <div class="topbar-clock" id="topbarClock">
      <span class="clock-date" id="clockDate">--/--/--</span>
      <span class="clock-sep">·</span>
      <span class="clock-time" id="clockTime">--:--:--</span>
      <span class="clock-zone">WITA</span>
    </div>
    <div class="esp-pill" id="espStatus">
      <span class="esp-dot"></span>
      <span class="esp-label">CHECKING</span>
    </div>
  </div>
</header>

<div class="sidebar" id="sidebar">
  <div class="sidebar-role">
    <?php if ($isAdmin): ?>
      <i class="fa fa-shield-halved"></i>
      <span><?= htmlspecialchars($_SESSION['admin_name'] ?? 'Admin') ?></span>
      <span class="sidebar-role-badge sidebar-role-badge--admin">Admin</span>
    <?php else: ?>
      <i class="fa fa-user"></i>
      <span>Pengguna</span>
      <span class="sidebar-role-badge">User</span>
    <?php endif; ?>
  </div>
  <?php foreach ($links as $l): ?>
  <?php if (($l['type'] ?? '') === 'divider'): ?>
    <div class="sidebar-divider"></div>
  <?php else: ?>
  <a href="<?= $l['href'] ?>" class="sidebar-link <?= $l['key'] === $active ? 'active' : '' ?>">
    <i class="fa <?= $l['icon'] ?>"></i> <?= $l['label'] ?>
  </a>
  <?php endif; ?>
  <?php endforeach; ?>
  <div class="sidebar-clock">
    <div class="sidebar-clock-inner">
      <div class="sidebar-clock-row">
        <span class="sidebar-clock-time" id="sidebarTime">--:--:--</span>
        <span class="sidebar-clock-zone">WITA</span>
      </div>
      <div class="sidebar-clock-date" id="sidebarDate">-- --- ----</div>
    </div>
    <?php if ($isAdmin): ?>
    <a href="admin/logout.php" class="sidebar-admin-btn" title="Logout Admin">
      <i class="fa fa-right-from-bracket"></i>
    </a>
    <?php else: ?>
    <a href="admin/login.php" class="sidebar-admin-btn" title="Admin Panel">
      <i class="fa fa-shield-halved"></i>
    </a>
    <?php endif; ?>
  </div>
</div>
<div class="overlay" id="overlay"></div>
<?php
}

function sgAdminBar(string $active = ''): void {
  $userLinks = [
    ['href' => '../dashboard.php', 'key' => 'dashboard', 'icon' => 'fa-seedling',  'label' => 'Dashboard'],
    ['href' => '../panduan.php',  'key' => 'panduan',   'icon' => 'fa-book-open', 'label' => 'Panduan'],
    ['href' => '../sistem.php',   'key' => 'sistem',    'icon' => 'fa-server',    'label' => 'Sistem'],
  ];
  $adminLinks = [
    ['href' => '../settings.php', 'key' => 'settings', 'icon' => 'fa-gear',         'label' => 'Settings'],
    ['href' => 'dashboard.php',   'key' => 'admin',    'icon' => 'fa-shield-halved','label' => 'Admin'],
  ];
  $labels = [
    'dashboard' => 'Dashboard', 'panduan'  => 'Panduan',
    'sistem'    => 'Sistem',    'settings' => 'Settings',
    'admin'     => 'Admin Panel',
  ];
  echo '<script>document.body.classList.add("sg-app");</script>';
?>
<header class="topbar">
  <div class="topbar-left">
    <button class="hamburger" id="sg-hamburger" aria-label="Menu">
      <span></span><span></span><span></span>
    </button>
    <a href="../dashboard.php" class="topbar-logo">
      <i class="fa fa-seedling"></i>Smart Garden
    </a>
    <div class="topbar-divider"></div>
    <span class="topbar-page"><?= htmlspecialchars($labels[$active] ?? ucfirst($active)) ?></span>
  </div>
  <div class="topbar-right">
    <div class="topbar-clock" id="topbarClock">
      <span class="clock-date" id="clockDate">--/--/--</span>
      <span class="clock-sep">·</span>
      <span class="clock-time" id="clockTime">--:--:--</span>
      <span class="clock-zone">WITA</span>
    </div>
  </div>
</header>

<div class="sidebar" id="sidebar">
  <div class="sidebar-role">
    <i class="fa fa-shield-halved"></i>
    <span><?= htmlspecialchars($_SESSION['admin_name'] ?? 'Admin') ?></span>
    <span class="sidebar-role-badge sidebar-role-badge--admin">Admin</span>
  </div>
  <?php foreach ($userLinks as $l): ?>
  <a href="<?= $l['href'] ?>" class="sidebar-link <?= $l['key'] === $active ? 'active' : '' ?>">
    <i class="fa <?= $l['icon'] ?>"></i> <?= $l['label'] ?>
  </a>
  <?php endforeach; ?>
  <div class="sidebar-divider"></div>
  <?php foreach ($adminLinks as $l): ?>
  <a href="<?= $l['href'] ?>" class="sidebar-link <?= $l['key'] === $active ? 'active' : '' ?>">
    <i class="fa <?= $l['icon'] ?>"></i> <?= $l['label'] ?>
  </a>
  <?php endforeach; ?>
  <div class="sidebar-clock">
    <div class="sidebar-clock-inner">
      <div class="sidebar-clock-row">
        <span class="sidebar-clock-time" id="sidebarTime">--:--:--</span>
        <span class="sidebar-clock-zone">WITA</span>
      </div>
      <div class="sidebar-clock-date" id="sidebarDate">-- --- ----</div>
    </div>
    <a href="logout.php" class="sidebar-admin-btn" title="Logout">
      <i class="fa fa-right-from-bracket"></i>
    </a>
  </div>
</div>
<div class="overlay" id="overlay"></div>
<?php
}

function sgLandingNav(): void {
?>
<nav class="landing-nav">
  <div class="ln-brand">
    <span class="ln-dot"></span>
    <span>Smart Garden</span>
  </div>
  <div class="ln-links">
    <a href="#fitur">Fitur</a>
    <a href="#anggota">Anggota</a>
    <a href="dashboard.php" class="ln-cta">
      <i class="fa fa-gauge-high"></i> Dashboard
    </a>
  </div>
  <button class="ln-burger" id="lnBurger" aria-label="Menu">
    <span></span><span></span><span></span>
  </button>
</nav>
<div class="ln-mobile" id="lnMobile">

  <div class="lnm-header">
    <div class="lnm-brand">
      <span class="ln-dot"></span>
      <span>Smart Garden</span>
    </div>
    <button class="lnm-close" id="lnClose"><i class="fa fa-xmark"></i></button>
  </div>

  <nav class="lnm-links">
    <a href="#fitur" id="lnFitur" class="lnm-item">
      <span class="lnm-num">01</span>
      <span class="lnm-label">Fitur</span>
      <i class="fa fa-arrow-right lnm-arrow"></i>
    </a>
    <a href="#anggota" id="lnAnggota" class="lnm-item">
      <span class="lnm-num">02</span>
      <span class="lnm-label">Anggota</span>
      <i class="fa fa-arrow-right lnm-arrow"></i>
    </a>
  </nav>

  <a href="dashboard.php" class="lnm-cta">
    <i class="fa fa-gauge-high"></i>
    Buka Dashboard
  </a>

  <div class="lnm-footer">
    <span class="lnm-footer-label">Kelompok 6 — IoT Smart Garden</span>
  </div>

</div>
<?php
}

function sgFoot(string $extraJs = ''): void {
?>
<script>
(function(){
  'use strict';

  (function() {
    const el = document.getElementById('clockTime');
    if (!el) return;
    const dateEl     = document.getElementById('clockDate');
    const sideTime   = document.getElementById('sidebarTime');
    const sideDate   = document.getElementById('sidebarDate');
    function tick() {
      const now = new Date(new Date().toLocaleString('en-US', { timeZone: 'Asia/Makassar' }));
      const time = now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
      const date = now.toLocaleDateString('id-ID', { day: '2-digit', month: 'short', year: 'numeric' });
      el.textContent       = time;
      if (dateEl)   dateEl.textContent   = date;
      if (sideTime) sideTime.textContent = time;
      if (sideDate) sideDate.textContent = date;
    }
    tick();
    setInterval(tick, 1000);
  })();

  document.addEventListener('contextmenu', e => e.preventDefault());

  document.addEventListener('dragstart', e => e.preventDefault());
  document.addEventListener('selectstart', e => {
    if (['INPUT','TEXTAREA'].includes(e.target.tagName) || e.target.isContentEditable) return;
    e.preventDefault();
  });

  const isTouch = ('ontouchstart' in window) || navigator.maxTouchPoints > 0;
  if (!isTouch) {
    document.body.classList.add('sg-desktop');
    const cur = document.getElementById('sg-cursor');
    const dot = document.getElementById('sg-dot');
    let mx = 0, my = 0, ox = 0, oy = 0;
    document.addEventListener('mousemove', e => { mx = e.clientX; my = e.clientY; });
    (function tick() {
      ox += (mx - ox) * 0.13;
      oy += (my - oy) * 0.13;
      cur.style.left = ox + 'px'; cur.style.top = oy + 'px';
      dot.style.left = mx + 'px'; dot.style.top = my + 'px';
      requestAnimationFrame(tick);
    })();
    document.querySelectorAll('a, button, label, input, select, textarea, .feature-card, .team-card, [data-hover]').forEach(el => {
      el.addEventListener('mouseenter', () => cur.classList.add('sg-hover'));
      el.addEventListener('mouseleave', () => cur.classList.remove('sg-hover'));
    });
  }

  const sidebar   = document.getElementById('sidebar');
  const overlay   = document.getElementById('overlay');
  const hamburger = document.getElementById('sg-hamburger');
  if (sidebar && overlay && hamburger) {
    window.toggleMenu = function() {
      sidebar.classList.toggle('active');
      overlay.classList.toggle('active');
    };
    hamburger.addEventListener('click', window.toggleMenu);
    overlay.addEventListener('click', window.toggleMenu);
  }

  const lnBurger = document.getElementById('lnBurger');
  const lnMobile = document.getElementById('lnMobile');
  const lnClose  = document.getElementById('lnClose');
  if (lnBurger && lnMobile) {
    lnBurger.addEventListener('click', e => { e.stopPropagation(); lnMobile.classList.add('open'); });
    lnClose?.addEventListener('click', () => lnMobile.classList.remove('open'));
    ['lnFitur','lnAnggota'].forEach(id => {
      document.getElementById(id)?.addEventListener('click', () => lnMobile.classList.remove('open'));
    });
    document.addEventListener('click', e => {
      if (lnMobile.classList.contains('open') && !lnMobile.contains(e.target) && e.target !== lnBurger)
        lnMobile.classList.remove('open');
    });
  }

  const io = new IntersectionObserver(entries => {
    entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
  }, { threshold: 0.08 });
  document.querySelectorAll('.reveal').forEach(el => io.observe(el));

  window.deviceOnline = false;

  window.setOnline = function() {
    window.deviceOnline = true;
    const pill = document.getElementById('espStatus');
    if (!pill) return;
    Object.assign(pill.style, { background:'rgba(34,197,94,0.1)', borderColor:'rgba(34,197,94,0.3)', color:'#22c55e' });
    const d = pill.querySelector('.esp-dot'), l = pill.querySelector('.esp-label');
    if (d) d.style.background = '#22c55e';
    if (l) l.textContent = 'ONLINE';
    const inline = document.getElementById('espStatusInline');
    if (inline) { inline.textContent = 'ONLINE'; inline.style.color = '#22c55e'; }
  };

  window.setOffline = function() {
    window.deviceOnline = false;
    const pill = document.getElementById('espStatus');
    if (!pill) return;
    Object.assign(pill.style, { background:'rgba(239,68,68,0.1)', borderColor:'rgba(239,68,68,0.3)', color:'#ef4444' });
    const d = pill.querySelector('.esp-dot'), l = pill.querySelector('.esp-label');
    if (d) d.style.background = '#ef4444';
    if (l) l.textContent = 'OFFLINE';
    const inline = document.getElementById('espStatusInline');
    if (inline) { inline.textContent = 'OFFLINE'; inline.style.color = '#ef4444'; }
  };

})();

window.toggleCdd = function(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const isOpen = el.classList.contains('open');
  document.querySelectorAll('.cdd.open').forEach(d => d.classList.remove('open'));
  if (!isOpen) el.classList.add('open');
};
window.selectCdd = function(id, item) {
  const el = document.getElementById(id);
  if (!el) return;
  const value = item.dataset.value;
  const name  = item.dataset.name;
  el.querySelector('input[type=hidden]').value = value;
  el.querySelector('.cdd-label').textContent   = name;
  const idSpan = el.querySelector('.cdd-id');
  if (idSpan) idSpan.textContent = value;
  el.querySelectorAll('.cdd-item').forEach(i => i.classList.remove('active'));
  item.classList.add('active');
  el.classList.remove('open');
  if (typeof window._onDeviceSelect === 'function') window._onDeviceSelect(value);
};
document.addEventListener('click', (e) => {
  if (!e.target.closest('.cdd')) document.querySelectorAll('.cdd.open').forEach(d => d.classList.remove('open'));
});

<?= $extraJs ?>

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('/sw.js').catch(() => {});
}
</script>
</body>
</html>
<?php
}
