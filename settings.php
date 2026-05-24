<?php
session_start();

if (empty($_SESSION['admin_id'])) {
  header('Location: /403');
  exit;
}

if (empty($_SESSION['csrf'])) {
  $_SESSION['csrf'] = bin2hex(random_bytes(32));
}
$csrf = $_SESSION['csrf'];

require_once __DIR__ . '/db.php';

try {
  initTables();
  $pdo = getDB();

  
  $pdo->exec("
    CREATE TABLE IF NOT EXISTS settings (
      key_name   VARCHAR(60)  PRIMARY KEY,
      value      VARCHAR(255) NOT NULL,
      updated_at DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  ");

  
  $pdo->exec("
    CREATE TABLE IF NOT EXISTS schedules (
      id         INT AUTO_INCREMENT PRIMARY KEY,
      days       VARCHAR(20)  NOT NULL,
      time       VARCHAR(5)   NOT NULL,
      enabled    TINYINT(1)   DEFAULT 1,
      created_at DATETIME     DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  ");

  
  $defaults = [
    'soil_min'         => '30',
    'soil_max'         => '80',
    'temp_max'         => '35',
    'hum_min'          => '40',
    'publish_interval' => '5',
    'device_id'        => 'device01',
  ];

  foreach ($defaults as $k => $v) {
    $pdo->prepare("INSERT IGNORE INTO settings (key_name, value) VALUES (?,?)")->execute([$k, $v]);
  }

  $devices        = $pdo->query("SELECT device_id, name FROM devices ORDER BY created_at ASC")->fetchAll();
  $activeDeviceId = $devices[0]['device_id'] ?? 'device01';
  $cfg            = getDeviceSettings($pdo, $activeDeviceId, $defaults);

  $schedules = $pdo->query("SELECT * FROM schedules ORDER BY time ASC")->fetchAll();

} catch (Exception $e) {
  $cfg       = $defaults;
  $schedules = [];
  $devices   = [];
}

$dayNames = ['Sen','Sel','Rab','Kam','Jum','Sab','Min'];
$dayFull  = ['Senin','Selasa','Rabu','Kamis','Jumat','Sabtu','Minggu'];

require_once __DIR__ . '/shared/layout.php';
sgHead('Settings', '<link rel="stylesheet" href="css/settings.css?v=2.3">');
sgAppBar('settings');
?>
  <main class="main-content">
    <div class="settings-wrap">

      <div class="settings-header">
        <div class="settings-header-top">
          <div>
            <div class="settings-tag"><i class="fa fa-gear"></i> Konfigurasi Sistem</div>
            <h1 class="settings-title">Settings</h1>
          </div>
          <div class="device-context">
            <span class="device-context-label"><i class="fa fa-microchip"></i> Device</span>
            <div class="cdd" id="deviceDd">
              <input type="hidden" id="deviceId" value="<?= htmlspecialchars($devices[0]['device_id'] ?? 'device01') ?>">
              <button type="button" class="cdd-btn" onclick="toggleCdd('deviceDd')">
                <i class="fa fa-circle cdd-dot"></i>
                <span class="cdd-label"><?= htmlspecialchars($devices[0]['name'] ?: ($devices[0]['device_id'] ?? 'device01')) ?></span>
                <span class="cdd-id"><?= htmlspecialchars($devices[0]['device_id'] ?? 'device01') ?></span>
                <i class="fa fa-chevron-down cdd-arrow"></i>
              </button>
              <div class="cdd-menu">
                <?php foreach ($devices as $i => $d): ?>
                  <div class="cdd-item <?= $i === 0 ? 'active' : '' ?>"
                       data-value="<?= htmlspecialchars($d['device_id']) ?>"
                       data-name="<?= htmlspecialchars($d['name'] ?: $d['device_id']) ?>"
                       onclick="selectCdd('deviceDd', this)">
                    <i class="fa fa-circle cdd-dot"></i>
                    <div class="cdd-item-info">
                      <span class="cdd-item-name"><?= htmlspecialchars($d['name'] ?: $d['device_id']) ?></span>
                      <span class="cdd-item-id"><?= htmlspecialchars($d['device_id']) ?></span>
                    </div>
                  </div>
                <?php endforeach; ?>
              </div>
            </div>
          </div>
        </div>
        <p class="settings-desc">Perubahan disimpan ke database dan dikirim ke ESP32 via MQTT.</p>
      </div>

      <div class="s-flash s-flash-success" id="sFlashSuccess">
        <i class="fa fa-circle-check"></i>
        <span id="sFlashSuccessMsg">Settings berhasil disimpan.</span>
      </div>
      <div class="s-flash s-flash-error" id="sFlashError">
        <i class="fa fa-circle-exclamation"></i>
        <span id="sFlashMsg">Terjadi kesalahan.</span>
      </div>

      <input type="hidden" id="csrfToken" value="<?= htmlspecialchars($csrf) ?>">

      <div class="settings-grid">

        
        <div class="s-card">
          <div class="s-card-header">
            <div class="s-card-icon"><i class="fa fa-sliders"></i></div>
            <div>
              <div class="s-card-title">Sensor Threshold</div>
              <div class="s-card-sub">Batas nilai sensor untuk trigger aksi otomatis</div>
            </div>
          </div>

          <div class="s-fields">
            <div class="s-field">
              <label class="s-label">Soil Moisture Minimum <span class="s-unit">%</span>
                <span class="s-hint">Pompa nyala di bawah nilai ini</span>
              </label>
              <div class="s-input-wrap">
                <input type="range" id="soilMin" min="0" max="100" step="1"
                  value="<?= htmlspecialchars($cfg['soil_min']) ?>"
                  oninput="syncRange(this, 'soilMinVal')">
                <span class="s-range-val" id="soilMinVal"><?= $cfg['soil_min'] ?>%</span>
              </div>
            </div>

            <div class="s-field">
              <label class="s-label">Soil Moisture Maximum <span class="s-unit">%</span>
                <span class="s-hint">Pompa mati di atas nilai ini</span>
              </label>
              <div class="s-input-wrap">
                <input type="range" id="soilMax" min="0" max="100" step="1"
                  value="<?= htmlspecialchars($cfg['soil_max']) ?>"
                  oninput="syncRange(this, 'soilMaxVal')">
                <span class="s-range-val" id="soilMaxVal"><?= $cfg['soil_max'] ?>%</span>
              </div>
            </div>

            <div class="s-field">
              <label class="s-label">Suhu Maksimum <span class="s-unit">°C</span>
                <span class="s-hint">Alert jika suhu melebihi batas</span>
              </label>
              <div class="s-input-wrap">
                <input type="range" id="tempMax" min="20" max="50" step="1"
                  value="<?= htmlspecialchars($cfg['temp_max']) ?>"
                  oninput="syncRange(this, 'tempMaxVal')">
                <span class="s-range-val" id="tempMaxVal"><?= $cfg['temp_max'] ?>°C</span>
              </div>
            </div>

            <div class="s-field">
              <label class="s-label">Kelembaban Udara Minimum <span class="s-unit">%</span>
                <span class="s-hint">Alert jika kelembaban di bawah batas</span>
              </label>
              <div class="s-input-wrap">
                <input type="range" id="humMin" min="0" max="100" step="1"
                  value="<?= htmlspecialchars($cfg['hum_min']) ?>"
                  oninput="syncRange(this, 'humMinVal')">
                <span class="s-range-val" id="humMinVal"><?= $cfg['hum_min'] ?>%</span>
              </div>
            </div>
          </div>

          <button class="s-save-btn" onclick="saveSection('threshold')">
            <i class="fa fa-floppy-disk"></i> Simpan & Kirim
          </button>
        </div>

        
        <div class="s-card s-card-schedule">
          <div class="s-card-header">
            <div class="s-card-icon"><i class="fa fa-clock"></i></div>
            <div>
              <div class="s-card-title">Jadwal Penyiraman</div>
              <div class="s-card-sub">Atur jadwal penyiraman otomatis harian</div>
            </div>
          </div>

          
          <div class="schedule-add-form">
            <div class="schedule-add-title">Tambah Jadwal Baru</div>

            <div class="day-picker">
              <?php foreach ($dayNames as $i => $d): ?>
              <label class="day-chip">
                <input type="checkbox" name="sched_day" value="<?= $i ?>">
                <span><?= $d ?></span>
              </label>
              <?php endforeach; ?>
            </div>

            <div class="schedule-add-row">
              <input type="time" id="newSchedTime" class="s-input" value="06:00">
              <button class="s-add-btn" onclick="addSchedule()">
                <i class="fa fa-plus"></i> Tambah
              </button>
            </div>
          </div>

          
          <div class="schedule-list-wrap">
            <div class="schedule-list-label">
              <span>Jadwal Aktif</span>
              <span class="sched-count" id="schedCount"><?= count($schedules) ?> jadwal</span>
            </div>

            <div class="schedule-list" id="scheduleList">
              <?php if (empty($schedules)): ?>
                <div class="sched-empty">Belum ada jadwal</div>
              <?php else: ?>
                <?php foreach ($schedules as $s): ?>
                  <?php
                    $dayBits  = str_split($s['days']);
                    $dayLabels= [];
                    foreach ($dayBits as $d) $dayLabels[] = $dayNames[(int)$d] ?? $d;
                    $dayStr = implode(', ', $dayLabels);
                  ?>
                  <div class="sched-row" id="schedRow<?= $s['id'] ?>">
                    <div class="sched-info">
                      <div class="sched-time"><?= htmlspecialchars($s['time']) ?></div>
                      <div class="sched-days"><?= htmlspecialchars($dayStr) ?></div>
                    </div>
                    <div class="sched-actions">
                      <label class="s-toggle s-toggle-sm">
                        <input type="checkbox"
                          <?= $s['enabled'] ? 'checked' : '' ?>
                          onchange="toggleSchedule(<?= $s['id'] ?>, this.checked)">
                        <span class="s-slider"></span>
                      </label>
                      <button class="sched-del-btn" onclick="deleteSchedule(<?= $s['id'] ?>)">
                        <i class="fa fa-trash"></i>
                      </button>
                    </div>
                  </div>
                <?php endforeach; ?>
              <?php endif; ?>
            </div>
          </div>

          <button class="s-save-btn" onclick="pushSchedulesToESP32()">
            <i class="fa fa-paper-plane"></i> Kirim Semua Jadwal ke ESP32
          </button>
        </div>

        
        <div class="s-card">
          <div class="s-card-header">
            <div class="s-card-icon"><i class="fa fa-microchip"></i></div>
            <div>
              <div class="s-card-title">Device</div>
              <div class="s-card-sub">Konfigurasi perangkat ESP32</div>
            </div>
          </div>

          <div class="s-fields">
            <div class="s-field">
              <label class="s-label">Interval Publish Sensor <span class="s-unit">detik</span>
                <span class="s-hint">Seberapa sering ESP32 kirim data</span>
              </label>
              <div class="s-input-wrap">
                <input type="range" id="publishInterval" min="1" max="60" step="1"
                  value="<?= htmlspecialchars($cfg['publish_interval']) ?>"
                  oninput="syncRange(this, 'publishIntervalVal')">
                <span class="s-range-val" id="publishIntervalVal"><?= $cfg['publish_interval'] ?>s</span>
              </div>
            </div>
          </div>

          <button class="s-save-btn" onclick="saveSection('device')">
            <i class="fa fa-floppy-disk"></i> Simpan & Kirim
          </button>

        </div>

        
        <div class="s-card s-card-danger">
          <div class="s-card-header">
            <div class="s-card-icon s-icon-amber"><i class="fa fa-cloud-arrow-up"></i></div>
            <div>
              <div class="s-card-title">OTA Firmware Update</div>
              <div class="s-card-sub">Trigger update firmware ESP32 secara remote</div>
            </div>
          </div>

          <div class="s-fields">
            <div class="s-warning-box">
              <i class="fa fa-triangle-exclamation"></i>
              ESP32 akan restart selama proses update. Pastikan koneksi WiFi stabil dan firmware tersedia di server OTA.
            </div>
          </div>

          <div class="s-ota-status" id="otaStatus"></div>

          <button class="s-save-btn s-btn-amber" onclick="triggerOTA()" id="otaBtn">
            <i class="fa fa-bolt"></i> Trigger OTA Update
          </button>
        </div>

      </div>
    </div>
  </main>

  <script>
    <?php
      $_h = explode(':', $_SERVER['HTTP_HOST'] ?? 'localhost')[0];
      $_ip = filter_var($_h, FILTER_VALIDATE_IP);
      $_local = ($_ip && !filter_var($_ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE))
             || str_ends_with($_h, '.local') || $_h === 'localhost';
      $_env = loadEnv(__DIR__ . '/.env');
      $_mqttPub = getenv('MQTT_WS_URL') ?: ($_env['MQTT_WS_URL'] ?? 'wss://mqtt.yourdomain.com');
    ?>
    const mqttBroker = '<?= $_local ? "ws://{$_h}:9002" : $_mqttPub ?>';
  </script>
  <script src="https://unpkg.com/mqtt/dist/mqtt.min.js?v=999"></script>
  <script src="js/settings.js?v=2.4"></script>
  <?php sgFoot(); ?>
