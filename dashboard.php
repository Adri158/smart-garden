<?php
session_start();
require_once __DIR__ . '/db.php';
require_once __DIR__ . '/shared/layout.php';

try {
  initTables();
  $pdo     = getDB();
  $devices = $pdo->query("SELECT device_id, name FROM devices ORDER BY created_at ASC")->fetchAll();
} catch (Exception $e) {
  $devices = [['device_id' => 'device01', 'name' => 'ESP32 #1']];
  $pdo     = null;
}
$defaultDevice = $devices[0]['device_id'] ?? 'device01';
$thresholds    = [];
try {
  if ($pdo) $thresholds = getDeviceSettings($pdo, $defaultDevice, ['soil_min'=>'30','soil_max'=>'80']);
} catch (Exception $e) {}

sgHead('Dashboard', '
  <link rel="stylesheet" href="css/dashboard.css?v=2.8">
  <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/chartjs-adapter-date-fns"></script>
  <script src="https://cdn.jsdelivr.net/npm/hammerjs@2.0.8/hammer.min.js"></script>
  <script src="https://cdn.jsdelivr.net/npm/chartjs-plugin-zoom@2.0.1/dist/chartjs-plugin-zoom.min.js"></script>
');
sgAppBar('dashboard');
?>

  

  <main class="main-content">

    

    <div class="metric-strip">

      <div class="metric-item">
        <i class="fa fa-temperature-half metric-ico"></i>
        <div class="metric-body">
          <span class="metric-label">Suhu Udara</span>
          <span class="metric-value" id="tempDHT">--°C</span>
        </div>
      </div>

      <div class="metric-item">
        <i class="fa fa-droplet metric-ico"></i>
        <div class="metric-body">
          <span class="metric-label">Kelembaban</span>
          <span class="metric-value" id="humidity">--%</span>
        </div>
      </div>

      <div class="metric-item">
        <i class="fa fa-water metric-ico"></i>
        <div class="metric-body">
          <span class="metric-label">Suhu Air</span>
          <span class="metric-value" id="tempDS">--°C</span>
        </div>
      </div>

      <div class="metric-item">
        <i class="fa fa-plug metric-ico" id="pumpIco"></i>
        <div class="metric-body">
          <span class="metric-label">Status Pompa</span>
          <span class="metric-value" id="relay">--</span>
        </div>
      </div>

      <div class="metric-item">
        <i class="fa fa-sliders metric-ico"></i>
        <div class="metric-body">
          <span class="metric-label">Mode Sistem</span>
          <span class="metric-value" id="mode">--</span>
        </div>
      </div>

      <div class="metric-item metric-divider"></div>

      <div class="metric-item" id="weatherCondItem">
        <i class="fa fa-cloud metric-ico" id="weatherIco"></i>
        <div class="metric-body">
          <span class="metric-label">Cuaca</span>
          <span class="metric-value" id="weatherCond">--</span>
        </div>
      </div>

      <div class="metric-item">
        <i class="fa fa-sun metric-ico"></i>
        <div class="metric-body">
          <span class="metric-label">Suhu Luar</span>
          <span class="metric-value" id="weatherTemp">--°C</span>
        </div>
      </div>

      <div class="metric-item">
        <i class="fa fa-umbrella metric-ico"></i>
        <div class="metric-body">
          <span class="metric-label">Peluang Hujan</span>
          <span class="metric-value" id="weatherRain">--%</span>
        </div>
      </div>

    </div>

    

    <div class="rain-alert" id="rainAlert" style="display:none">
      <i class="fa fa-cloud-rain"></i>
      <span id="rainAlertText">Prediksi hujan dalam beberapa jam ke depan — jadwal siram otomatis mungkin tidak diperlukan.</span>
      <button onclick="document.getElementById('rainAlert').style.display='none'"><i class="fa fa-xmark"></i></button>
    </div>

    

    <div class="panel-grid">

      

      <section class="panel panel-soil">

        <div class="panel-header">
          <span class="panel-title">Kelembaban Tanah</span>
        </div>

        <div class="soil-big" id="soilValue">--%</div>

        <div class="soil-bar-wrap">
          <div class="soil-track">
            <div class="soil-fill" id="soilFill"></div>
          </div>
          <div class="soil-ticks">
            <span>Kering</span>
            <span>Optimal</span>
            <span>Basah</span>
          </div>
        </div>

        <div class="panel-sub-title">Grafik Real-time</div>

        <div class="chart-wrap">
          <canvas id="soilChart"></canvas>
        </div>

      </section>

      

      <section class="panel panel-control">

        <div class="panel-header">
          <span class="panel-title">Kontrol</span>
        </div>

        <div class="ctrl-row">
          <div class="ctrl-info">
            <span class="ctrl-name">Pompa Air</span>
            <span class="ctrl-sub">
              <span class="relay-dot" id="relayDot"></span>
              <span id="relayLabel">Tidak Aktif</span>
            </span>
            <span class="auto-badge" id="autoBadge">
              <i class="fa fa-robot"></i> Dikontrol sistem
            </span>
          </div>
          <label class="toggle">
            <input type="checkbox" id="pumpToggle">
            <span class="slider"></span>
          </label>
        </div>

        <div class="ctrl-row">
          <div class="ctrl-info">
            <span class="ctrl-name">Mode Operasi</span>
            <span class="ctrl-sub">Otomatis / Manual</span>
          </div>
          <button id="modeBtn" class="mode-btn manual">MANUAL</button>
        </div>

        <div class="panel-sub-title">Info Perangkat</div>

        <div class="device-selector-row">
          <span class="device-selector-label"><i class="fa fa-microchip"></i> Device</span>
          <div class="cdd cdd--sm" id="deviceDd">
            <input type="hidden" id="deviceSelector" value="<?= htmlspecialchars($defaultDevice) ?>">
            <button type="button" class="cdd-btn" onclick="toggleCdd('deviceDd')">
              <i class="fa fa-circle cdd-dot"></i>
              <span class="cdd-label"><?= htmlspecialchars($devices[0]['name'] ?: $defaultDevice) ?></span>
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

        <div class="device-info-list">

          <div class="device-info-row">
            <span>ESP32</span>
            <span class="mono" id="espStatusInline">CHECKING...</span>
          </div>

          <div class="device-info-row">
            <span>MQTT Broker</span>
            <span class="mono green">CONNECTED</span>
          </div>

          <div class="device-info-row">
            <span>Firmware</span>
            <span class="mono" id="espFW">—</span>
          </div>

          <div class="device-info-row">
            <span>IP Address</span>
            <span class="mono" id="espIP">—</span>
          </div>

          <div class="device-info-row">
            <span>MAC</span>
            <span class="mono" id="espMAC">—</span>
          </div>

          <div class="device-info-row">
            <span>SSID</span>
            <span class="mono" id="espSSID">—</span>
          </div>

          <div class="device-info-row">
            <span>RSSI</span>
            <span class="mono" id="espRSSI">—</span>
          </div>

          <div class="device-info-row">
            <span>Free Heap</span>
            <span class="mono" id="espHeap">—</span>
          </div>

          <div class="device-info-row">
            <span>Uptime</span>
            <span class="mono" id="espUptime">—</span>
          </div>

        </div>

      </section>

    </div>

    

    <section class="history-section">

      <div class="history-header">

        <div class="history-title-wrap">
          <span class="panel-title">Grafik Historis</span>
          <span class="history-count" id="historyCount">— data</span>
        </div>

        
        <div class="history-controls">

          <div class="sensor-tabs">
            <button class="sensor-tab active" data-sensor="soil"     onclick="switchSensor('soil', this)">
              <i class="fa fa-seedling"></i> Soil
            </button>
            <button class="sensor-tab" data-sensor="temp_dht"  onclick="switchSensor('temp_dht', this)">
              <i class="fa fa-temperature-half"></i> Suhu Udara
            </button>
            <button class="sensor-tab" data-sensor="temp_ds"   onclick="switchSensor('temp_ds', this)">
              <i class="fa fa-water"></i> Suhu Air
            </button>
            <button class="sensor-tab" data-sensor="humidity"  onclick="switchSensor('humidity', this)">
              <i class="fa fa-droplet"></i> Kelembaban
            </button>
          </div>

          
          <div class="range-tabs">
            <button class="range-tab active" data-range="1h"  onclick="switchRange('1h',  this)">1J</button>
            <button class="range-tab"        data-range="6h"  onclick="switchRange('6h',  this)">6J</button>
            <button class="range-tab"        data-range="24h" onclick="switchRange('24h', this)">24J</button>
            <button class="range-tab"        data-range="1w"  onclick="switchRange('1w',  this)">1M</button>
            <button class="range-tab"        data-range="1m"  onclick="switchRange('1m',  this)">1Bln</button>
          </div>

          <button class="reset-zoom-btn" id="resetZoomBtn" onclick="histChart&&histChart.resetZoom()" title="Reset Zoom">
            <i class="fa fa-magnifying-glass-minus"></i>
          </button>

        </div>

      </div>

      
      <div class="history-stats">
        <div class="hstat">
          <span class="hstat-label">Min</span>
          <span class="hstat-val" id="hstatMin">—</span>
        </div>
        <div class="hstat">
          <span class="hstat-label">Avg</span>
          <span class="hstat-val" id="hstatAvg">—</span>
        </div>
        <div class="hstat">
          <span class="hstat-label">Max</span>
          <span class="hstat-val" id="hstatMax">—</span>
        </div>
      </div>

      
      <div class="history-chart-wrap">
        <div class="history-loading" id="historyLoading">
          <i class="fa fa-spinner fa-spin"></i> Memuat data...
        </div>
        <canvas id="historyChart"></canvas>
      </div>

    </section>

  </main>

  

  <script>
    const SOIL_MIN = <?= (int)($thresholds['soil_min'] ?? 30) ?>;
    const SOIL_MAX = <?= (int)($thresholds['soil_max'] ?? 80) ?>;
    <?php
      $_h = explode(':', $_SERVER['HTTP_HOST'] ?? 'localhost')[0];
      $_ip = filter_var($_h, FILTER_VALIDATE_IP);
      $_local = ($_ip && !filter_var($_ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE))
             || str_ends_with($_h, '.local') || $_h === 'localhost';
      $_env = loadEnv(__DIR__ . '/.env');
      $_mqttPub = getenv('MQTT_WS_URL') ?: ($_env['MQTT_WS_URL'] ?? 'wss://mqtt.yourdomain.com');
      $_broker = $_local ? "ws://{$_h}:9002" : $_mqttPub;
    ?>
    const broker = '<?= $_broker ?>';
  </script>
  <script src="https://unpkg.com/mqtt/dist/mqtt.min.js?v=999"></script>
  <script src="js/dashboard.js?v=3.4"></script>
  <?php sgFoot(); ?>
