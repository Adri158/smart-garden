<?php
$page = basename($_SERVER['PHP_SELF'], '.php');

$help = [
  'dashboard' => [
    'icon'  => 'fa-gauge-high',
    'title' => 'Dashboard',
    'desc'  => 'Monitor kondisi kebun secara real-time. Data sensor langsung dari ESP32.',
    'features' => [
      ['fa-seedling',   'Soil Moisture — kelembaban tanah real-time'],
      ['fa-toggle-on',  'Kontrol — nyalain/matiin pompa & ganti mode AUTO/MANUAL'],
      ['fa-chart-line', 'Grafik Historis — tren sensor dari 1 jam sampai 1 bulan'],
    ],
  ],
  'settings' => [
    'icon'  => 'fa-sliders',
    'title' => 'Pengaturan',
    'desc'  => 'Konfigurasi threshold sensor, jadwal siram, dan manajemen device.',
    'features' => [
      ['fa-droplet',  'Threshold Tanah — batas min/max kelembaban untuk mode AUTO'],
      ['fa-calendar', 'Jadwal — atur hari & jam siram otomatis'],
      ['fa-robot',    'Mode AUTO — pompa nyala otomatis kalau tanah terlalu kering'],
    ],
  ],
  'sistem' => [
    'icon'  => 'fa-server',
    'title' => 'Sistem',
    'desc'  => 'Pantau kesehatan infrastruktur — server, layanan backend, dan konektivitas IoT.',
    'features' => [
      ['fa-microchip',  'CPU & RAM — resource usage server real-time'],
      ['fa-hard-drive', 'Disk — kapasitas penyimpanan tersisa'],
      ['fa-wifi',       'MQTT — status broker Mosquitto'],
      ['fa-database',   'Database — status koneksi MariaDB'],
    ],
  ],
  'panduan' => [
    'icon'  => 'fa-circle-question',
    'title' => 'Panduan',
    'desc'  => 'Tutorial langkah demi langkah cara menggunakan Smart Garden Dashboard.',
    'features' => [
      ['fa-wifi',       'Setup — koneksiin ESP32 ke WiFi & MQTT'],
      ['fa-gauge-high', 'Dashboard — cara baca sensor & kontrol pompa'],
      ['fa-sliders',    'Pengaturan — atur threshold & jadwal siram'],
      ['fa-wrench',     'Troubleshoot — solusi masalah umum'],
    ],
  ],
];

$h = $help[$page] ?? [
  'icon'     => 'fa-circle-question',
  'title'    => 'Bantuan',
  'desc'     => 'Navigasi ke halaman mana pun untuk melihat penjelasan spesifik.',
  'features' => [],
];
?>
<div class="hw-root" id="hw-root">
  <div class="hw-panel" id="hw-panel">
    <div class="hw-head">
      <div class="hw-head-left">
        <i class="fa <?= $h['icon'] ?> hw-head-ico"></i>
        <span class="hw-head-title"><?= $h['title'] ?></span>
      </div>
      <button class="hw-close" onclick="hwToggle()"><i class="fa fa-xmark"></i></button>
    </div>
    <div class="hw-body hw-info">
      <p class="hw-desc"><?= $h['desc'] ?></p>
      <?php if (!empty($h['features'])): ?>
      <ul class="hw-features">
        <?php foreach ($h['features'] as [$icon, $text]): ?>
        <li class="hw-feature">
          <i class="fa <?= $icon ?> hw-feature-ico"></i>
          <span><?= $text ?></span>
        </li>
        <?php endforeach; ?>
      </ul>
      <?php endif; ?>
    </div>
  </div>

  <button class="hw-btn" id="hw-btn" onclick="hwToggle()" title="Bantuan">
    <i class="fa fa-circle-question" id="hw-btn-ico"></i>
  </button>
</div>

<script>
function hwToggle() {
  var panel = document.getElementById('hw-panel');
  var btn   = document.getElementById('hw-btn');
  var ico   = document.getElementById('hw-btn-ico');
  var open  = panel.classList.toggle('hw-open');
  btn.classList.toggle('hw-btn-open', open);
  ico.className = open ? 'fa fa-xmark' : 'fa fa-circle-question';
}
document.addEventListener('mousedown', function(e) {
  var root = document.getElementById('hw-root');
  if (root && !root.contains(e.target)) {
    document.getElementById('hw-panel').classList.remove('hw-open');
    document.getElementById('hw-btn').classList.remove('hw-btn-open');
    document.getElementById('hw-btn-ico').className = 'fa fa-circle-question';
  }
});
</script>
