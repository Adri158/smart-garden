const WEATHER_DEFAULTS = { lat: -5.1477, lon: 119.4327 }; 

const WMO = {
  0:'Cerah', 1:'Cerah Berawan', 2:'Berawan', 3:'Mendung',
  45:'Berkabut', 48:'Berkabut',
  51:'Gerimis', 53:'Gerimis', 55:'Gerimis Lebat',
  61:'Hujan', 63:'Hujan Sedang', 65:'Hujan Lebat',
  71:'Salju', 73:'Salju', 75:'Salju Lebat',
  80:'Hujan Lokal', 81:'Hujan Lokal', 82:'Hujan Deras',
  95:'Badai Petir', 96:'Badai', 99:'Badai Petir',
};
const WMO_ICO = {
  0:'fa-sun', 1:'fa-cloud-sun', 2:'fa-cloud', 3:'fa-cloud',
  45:'fa-smog', 48:'fa-smog',
  51:'fa-cloud-drizzle', 53:'fa-cloud-drizzle', 55:'fa-cloud-drizzle',
  61:'fa-cloud-rain', 63:'fa-cloud-rain', 65:'fa-cloud-showers-heavy',
  80:'fa-cloud-showers-heavy', 81:'fa-cloud-showers-heavy', 82:'fa-cloud-showers-heavy',
  95:'fa-cloud-bolt', 96:'fa-cloud-bolt', 99:'fa-cloud-bolt',
};

async function fetchWeather(lat, lon) {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
    `&current=temperature_2m,precipitation_probability,weather_code` +
    `&hourly=precipitation_probability&timezone=Asia%2FMakassar&forecast_days=1`;
  const res  = await fetch(url);
  const data = await res.json();
  
  _weatherHourly = data.hourly?.precipitation_probability ?? [];
  return data;
}

function renderWeather(data) {
  const cur  = data.current;
  const code = cur.weather_code;
  const temp = Math.round(cur.temperature_2m);
  const rain = cur.precipitation_probability ?? 0;

  const condEl  = document.getElementById('weatherCond');
  const tempEl  = document.getElementById('weatherTemp');
  const rainEl  = document.getElementById('weatherRain');
  const icoEl   = document.getElementById('weatherIco');

  if (condEl) condEl.textContent = WMO[code] ?? 'Tidak Diketahui';
  if (tempEl) tempEl.textContent = `${temp}°C`;
  if (rainEl) {
    rainEl.textContent = `${rain}%`;
    rainEl.style.color = rain >= 60 ? '#3b82f6' : rain >= 30 ? '#f59e0b' : '';
  }
  if (icoEl) {
    icoEl.className = `fa ${WMO_ICO[code] ?? 'fa-cloud'} metric-ico`;
    icoEl.style.color = rain >= 60 ? '#3b82f6' : '';
  }

  
  const hourly = data.hourly?.precipitation_probability ?? [];
  const nowH   = new Date().getHours();
  const next3  = hourly.slice(nowH, nowH + 3);
  const maxRain = Math.max(...next3, rain);

  const alert = document.getElementById('rainAlert');
  const alertTxt = document.getElementById('rainAlertText');
  if (alert) {
    if (maxRain >= 60) {
      alertTxt.textContent = `Peluang hujan ${maxRain}% dalam 3 jam ke depan — jadwal siram otomatis mungkin tidak diperlukan.`;
      alert.style.display = 'flex';
    } else {
      alert.style.display = 'none';
    }
  }
}

function initWeather() {
  const run = (lat, lon) =>
    fetchWeather(lat, lon).then(renderWeather).catch(() => {});

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      pos => run(pos.coords.latitude, pos.coords.longitude),
      ()  => run(WEATHER_DEFAULTS.lat, WEATHER_DEFAULTS.lon),
      { timeout: 5000 }
    );
  } else {
    run(WEATHER_DEFAULTS.lat, WEATHER_DEFAULTS.lon);
  }

  
  setInterval(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        pos => run(pos.coords.latitude, pos.coords.longitude),
        ()  => run(WEATHER_DEFAULTS.lat, WEATHER_DEFAULTS.lon),
        { timeout: 5000 }
      );
    } else {
      run(WEATHER_DEFAULTS.lat, WEATHER_DEFAULTS.lon);
    }
  }, 30 * 60 * 1000);
}

initWeather();

const client = mqtt.connect(broker, {
  reconnectPeriod: 3000,
  connectTimeout:  10000,
  clean:    true,
  protocol: broker.startsWith('wss') ? 'wss' : 'ws',
});

let deviceID = document.getElementById('deviceSelector')?.value || 'device01';

const pumpBtn    = document.getElementById("pumpToggle");
const modeBtn    = document.getElementById("modeBtn");

const soilValue = document.getElementById("soilValue");

let relayState      = 0;
let autoMode        = 1;
let lastMessageTime = 0;
let modeOverride    = 0;

let sensorBuffer = {
  soil:     null,
  temp_dht: null,
  temp_ds:  null,
  humidity: null,
  relay:    null,
  mode:     null,
};

let lastLogTime = 0;
const LOG_INTERVAL = 60000; 

const chartCanvas = document.getElementById("soilChart");
let soilChart = null;

if (chartCanvas) {
  const ctx = chartCanvas.getContext("2d");

  soilChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: [],
      datasets: [{
        label: "Soil Moisture",
        data: [],
        borderColor: "#3b82f6",
        backgroundColor: "rgba(59,130,246,0.08)",
        tension: 0.4,
        pointRadius: 2,
        pointBackgroundColor: "#3b82f6",
        borderWidth: 1.5
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: false,
      scales: {
        x: {
          ticks: { color: "#64748b", font: { family: "Space Mono", size: 9 }, maxTicksLimit: 6, maxRotation: 0 },
          grid:  { color: "rgba(255,255,255,0.04)" }
        },
        y: {
          min: 0, max: 100,
          ticks: { color: "#64748b", font: { family: "Space Mono", size: 9 }, stepSize: 25 },
          grid:  { color: "rgba(255,255,255,0.04)" }
        }
      },
      plugins: { legend: { display: false } }
    }
  });
}

const histCanvas = document.getElementById("historyChart");
let histChart    = null;
let histSensor   = 'soil';
let histRange    = '1h';

const sensorColors = {
  soil:     { border: '#3b82f6', bg: 'rgba(59,130,246,0.08)',  label: 'Soil Moisture (%)', unit: '%' },
  temp_dht: { border: '#f59e0b', bg: 'rgba(245,158,11,0.08)',  label: 'Suhu Udara (°C)',   unit: '°C' },
  temp_ds:  { border: '#06b6d4', bg: 'rgba(6,182,212,0.08)',   label: 'Suhu Air (°C)',     unit: '°C' },
  humidity: { border: '#22c55e', bg: 'rgba(34,197,94,0.08)',   label: 'Kelembaban (%)',     unit: '%' },
};

let _weatherHourly = [];

if (histCanvas) {
  const ctx = histCanvas.getContext("2d");

  histChart = new Chart(ctx, {
    type: "line",
    data: {
      labels: [],
      datasets: [
        
        {
          label: "Sensor",
          data: [], borderColor: "#3b82f6", backgroundColor: "rgba(59,130,246,0.08)",
          tension: 0.3, pointRadius: 1, borderWidth: 1.5, fill: true,
          yAxisID: 'y',
        },
        
        {
          label: "Min Optimal",
          data: [], borderColor: "rgba(34,197,94,0.6)", backgroundColor: "transparent",
          borderWidth: 1.5, borderDash: [6, 4], pointRadius: 0, fill: false,
          yAxisID: 'y', hidden: true,
        },
        
        {
          label: "Max Optimal",
          data: [], borderColor: "rgba(245,158,11,0.6)", backgroundColor: "transparent",
          borderWidth: 1.5, borderDash: [6, 4], pointRadius: 0, fill: false,
          yAxisID: 'y', hidden: true,
        },
        
        {
          type: "bar",
          label: "Peluang Hujan",
          data: [], backgroundColor: "rgba(59,130,246,0.15)", borderColor: "rgba(59,130,246,0.3)",
          borderWidth: 1, borderRadius: 3, yAxisID: 'yRain', hidden: true,
        },
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 400 },
      interaction: { mode: 'index', intersect: false },
      scales: {
        x: {
          ticks: { color: "#64748b", font: { family: "DM Mono", size: 9 }, maxTicksLimit: 8, maxRotation: 30 },
          grid:  { color: "rgba(255,255,255,0.04)" }
        },
        y: {
          ticks: { color: "#64748b", font: { family: "DM Mono", size: 9 } },
          grid:  { color: "rgba(255,255,255,0.04)" }
        },
        yRain: {
          position: 'right',
          min: 0, max: 100,
          ticks: { color: "rgba(59,130,246,0.5)", font: { size: 9 }, callback: v => v + '%' },
          grid: { display: false },
        },
      },
      plugins: {
        legend: {
          display: true,
          position: 'top',
          align: 'end',
          labels: {
            color: '#64748b', font: { size: 10 }, boxWidth: 12, boxHeight: 2, padding: 12,
            filter: item => !item.hidden,
          }
        },
        tooltip: {
          callbacks: {
            label: ctx => {
              if (ctx.datasetIndex === 3) return `Hujan: ${ctx.parsed.y}%`;
              if (ctx.datasetIndex === 1) return `Min: ${ctx.parsed.y}%`;
              if (ctx.datasetIndex === 2) return `Max: ${ctx.parsed.y}%`;
              const unit = sensorColors[histSensor]?.unit || '';
              return ctx.parsed.y + unit;
            }
          }
        },
        zoom: {
          zoom: {
            wheel: { enabled: true, speed: 0.08 },
            pinch: { enabled: true },
            mode: 'x',
          },
          pan: {
            enabled: true,
            mode: 'x',
          },
        },
      }
    }
  });

  loadHistoricalData();
}

async function loadHistoricalData() {
  const loadingEl = document.getElementById('historyLoading');
  if (loadingEl) loadingEl.classList.remove('hidden');

  try {
    const res  = await fetch(`sensor_history.php?sensor=${histSensor}&range=${histRange}&device=${deviceID}`);
    const data = await res.json();

    if (data.success && histChart) {
      const cfg    = sensorColors[histSensor];
      const labels = data.labels;
      const n      = labels.length;

      
      histChart.data.labels                     = labels;
      histChart.data.datasets[0].data           = data.values;
      histChart.data.datasets[0].borderColor    = cfg.border;
      histChart.data.datasets[0].backgroundColor = cfg.bg;
      histChart.data.datasets[0].label          = cfg.label;

      
      const showThresh = histSensor === 'soil';
      histChart.data.datasets[1].data   = showThresh ? Array(n).fill(SOIL_MIN) : [];
      histChart.data.datasets[1].hidden = !showThresh;
      histChart.data.datasets[2].data   = showThresh ? Array(n).fill(SOIL_MAX) : [];
      histChart.data.datasets[2].hidden = !showThresh;

      
      const showRain = ['1h', '6h', '24h'].includes(histRange) && _weatherHourly.length > 0;
      if (showRain) {
        histChart.data.datasets[3].data   = labels.map(lbl => {
          const hour = parseInt(lbl.split(':')[0], 10);
          return _weatherHourly[hour] ?? null;
        });
        histChart.data.datasets[3].hidden = false;
      } else {
        histChart.data.datasets[3].data   = [];
        histChart.data.datasets[3].hidden = true;
      }

      histChart.resetZoom();
      histChart.update();

      const unit = cfg.unit;
      document.getElementById('hstatMin').textContent   = data.stats.min !== null ? data.stats.min + unit : '—';
      document.getElementById('hstatAvg').textContent   = data.stats.avg !== null ? data.stats.avg + unit : '—';
      document.getElementById('hstatMax').textContent   = data.stats.max !== null ? data.stats.max + unit : '—';
      document.getElementById('historyCount').textContent = data.count + ' data';
    }

  } catch (e) {
    console.error('History load error:', e);
  }

  if (loadingEl) loadingEl.classList.add('hidden');
}

window.switchSensor = function (sensor, btn) {
  document.querySelectorAll('.sensor-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  histSensor = sensor;
  loadHistoricalData();
};

window.switchRange = function (range, btn) {
  document.querySelectorAll('.range-tab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  histRange = range;
  loadHistoricalData();
};

setInterval(loadHistoricalData, 300000);

async function logSensorToDB() {
  if (
    sensorBuffer.soil === null &&
    sensorBuffer.temp_dht === null &&
    sensorBuffer.humidity === null
  ) return;

  try {
    await fetch('sensor_log.php', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ ...sensorBuffer, device_id: deviceID })
    });
  } catch (e) {
    console.error('Sensor log error:', e);
  }
}

client.on("connect", () => {
  console.log("MQTT CONNECTED");

  const topics = [
    `smartgarden/${deviceID}/status/relay`,
    `smartgarden/${deviceID}/status/mode`,
    `smartgarden/${deviceID}/sensor/dht`,
    `smartgarden/${deviceID}/sensor/ds18b20`,
    `smartgarden/${deviceID}/sensor/soil`,
    `smartgarden/${deviceID}/sensor/hum`,
    `smartgarden/${deviceID}/status/info`,
  ];

  client.subscribe(topics, (err) => {
    if (err) console.error("SUBSCRIBE ERROR", err);
    else     console.log("SUBSCRIBED:", topics);
  });
});

client.on("reconnect", () => console.log("MQTT RECONNECTING..."));
client.on("close",   () => { console.log("MQTT CLOSED");   if (typeof setOffline === "function") setOffline(); });
client.on("offline", () => { console.log("MQTT OFFLINE");  if (typeof setOffline === "function") setOffline(); });
client.on("error",   (err) => { console.error("MQTT ERROR:", err); if (typeof setOffline === "function") setOffline(); });

client.on("message", (topic, message, packet) => {
  const msg = message.toString();
  console.log("MQTT MESSAGE:", topic, msg);

  if (!packet.retain) {
    lastMessageTime = Date.now();
    if (typeof setOnline === "function") setOnline();
  }

  
  if (topic === `smartgarden/${deviceID}/status/relay`) {
    relayState = msg === "ON" ? 1 : 0;
    sensorBuffer.relay = relayState;
    updateRelayUI();
  }

  
  if (topic === `smartgarden/${deviceID}/status/mode`) {
    if (modeOverride && (Date.now() - modeOverride < 15000)) return;
    autoMode = msg === "AUTO" ? 1 : 0;
    sensorBuffer.mode = msg;
    updateModeUI();
  }

  
  if (topic === `smartgarden/${deviceID}/sensor/dht`) {
    const el = document.getElementById("tempDHT");
    if (el) { el.textContent = msg + "°C"; pulseVal(el); }
    sensorBuffer.temp_dht = parseFloat(msg);
  }

  if (topic === `smartgarden/${deviceID}/sensor/ds18b20`) {
    const el = document.getElementById("tempDS");
    if (el) { el.textContent = msg + "°C"; pulseVal(el); }
    sensorBuffer.temp_ds = parseFloat(msg);
  }

  if (topic === `smartgarden/${deviceID}/sensor/hum`) {
    const el = document.getElementById("humidity");
    if (!el) return;
    const val = parseInt(msg);
    el.textContent = val + "%";
    sensorBuffer.humidity = val;
    if      (val < 40) el.style.color = "#ef4444";
    else if (val < 70) el.style.color = "#22c55e";
    else               el.style.color = "#3b82f6";
    pulseVal(el);
  }

  
  if (topic === `smartgarden/${deviceID}/sensor/soil`) {
    const soil    = parseInt(msg);
    const soilFill = document.getElementById('soilFill');

    if (soilFill) {
      soilFill.style.width = soil + "%";
      if      (soil < 30) soilFill.style.background = '#ef4444';
      else if (soil < 60) soilFill.style.background = '#22c55e';
      else                soilFill.style.background = '#3b82f6';
    }

    if (soilValue) soilValue.textContent = soil + "%";
    sensorBuffer.soil = soil;

    
    if (soilChart) {
      const now = new Date().toLocaleTimeString("id-ID", {
        hour: "2-digit", minute: "2-digit", second: "2-digit"
      });
      soilChart.data.labels.push(now);
      soilChart.data.datasets[0].data.push(soil);
      if (soilChart.data.labels.length > 20) {
        soilChart.data.labels.shift();
        soilChart.data.datasets[0].data.shift();
      }
      soilChart.update();
    }
  }

  if (topic === `smartgarden/${deviceID}/status/info`) {
    try {
      const d = JSON.parse(msg);
      const setText = (id, val) => { const el = document.getElementById(id); if (el) el.textContent = val ?? '—'; };
      setText('espFW',     d.fw ? 'v' + d.fw : '—');
      setText('espIP',     d.ip);
      setText('espMAC',    d.mac);
      setText('espSSID',   d.ssid);
      setText('espRSSI',   d.rssi != null ? d.rssi + ' dBm' : '—');
      setText('espHeap',   d.heap != null ? (d.heap / 1024).toFixed(1) + ' KB' : '—');
      if (d.uptime != null) {
        const s = d.uptime, h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
        setText('espUptime', (h ? h + 'j ' : '') + m + 'm ' + sec + 'd');
      }
    } catch (e) {}
  }

  const now = Date.now();
  if (now - lastLogTime >= LOG_INTERVAL) {
    lastLogTime = now;
    logSensorToDB();
  }
});

const _pageLoad = Date.now();
setInterval(() => {
  const now = Date.now();
  if (!lastMessageTime) {
    if (now - _pageLoad > 5000) {
      if (typeof setOffline === "function") setOffline();
    }
    return;
  }
  if (now - lastMessageTime > 3000) {
    if (typeof setOffline === "function") setOffline();
  }
}, 1000);

if (pumpBtn) {
  pumpBtn.addEventListener("change", () => {
    if (!window.deviceOnline) { pumpBtn.checked = relayState === 1; return; }
    if (autoMode === 1) {
      pumpBtn.checked = relayState === 1;
      return;
    }
    const newState = relayState === 1 ? "OFF" : "ON";
    client.publish(`smartgarden/${deviceID}/control/relay`, newState);
    relayState = newState === "ON" ? 1 : 0;
    updateRelayUI();
  });
}

if (modeBtn) {
  modeBtn.addEventListener("click", () => {
    if (!window.deviceOnline) return;
    const newMode = autoMode === 1 ? "MANUAL" : "AUTO";
    client.publish(`smartgarden/${deviceID}/control/mode`, newMode);
    autoMode = newMode === "AUTO" ? 1 : 0;
    modeOverride = Date.now();
    updateModeUI();
  });
}

function pushConfig(soil, temp, hum) {
  const payload = JSON.stringify({ soilThreshold: soil, tempThreshold: temp, humThreshold: hum });
  client.publish(`smartgarden/${deviceID}/config`, payload);
}

function updateRelayUI() {
  if (!pumpBtn) return;
  pumpBtn.checked = relayState === 1;

  const relayEl = document.getElementById("relay");
  if (relayEl) {
    relayEl.textContent = relayState ? "Aktif" : "Tidak Aktif";
    relayEl.style.color = relayState ? "#22c55e" : "#ef4444";
  }

  const relayLabel = document.getElementById("relayLabel");
  if (relayLabel) {
    relayLabel.textContent = relayState ? "Aktif" : "Tidak Aktif";
    relayLabel.style.color = relayState ? "#22c55e" : "#ef4444";
  }

  const relayDot = document.getElementById("relayDot");
  if (relayDot) {
    relayDot.style.background = relayState ? "#22c55e" : "#ef4444";
    relayDot.style.boxShadow  = relayState ? "0 0 6px rgba(34,197,94,0.7)" : "none";
  }
}

function updateModeUI() {
  if (!modeBtn) return;
  modeBtn.className   = "mode-btn " + (autoMode ? "auto" : "manual");
  modeBtn.textContent = autoMode ? "AUTO" : "MANUAL";
  if (pumpBtn) pumpBtn.disabled = autoMode === 1;

  const badge = document.getElementById("autoBadge");
  if (badge) badge.classList.toggle("visible", autoMode === 1);

  const modeEl = document.getElementById("mode");
  if (modeEl) {
    modeEl.textContent = autoMode ? "Otomatis" : "Manual";
    modeEl.style.color = autoMode ? "#22c55e" : "#3b82f6";
  }
}

function pulseVal(el) {
  el.classList.remove('val-pulse');
  void el.offsetWidth;
  el.classList.add('val-pulse');
}

document.querySelectorAll('.metric-item').forEach((el, i) => {
  el.style.animation = `metricIn 0.4s ease ${i * 0.07}s both`;
});

window._onDeviceSelect = (deviceId) => switchDevice(deviceId);

function switchDevice(newId) {
  const oldTopics = [
    `smartgarden/${deviceID}/status/relay`,
    `smartgarden/${deviceID}/status/mode`,
    `smartgarden/${deviceID}/sensor/dht`,
    `smartgarden/${deviceID}/sensor/ds18b20`,
    `smartgarden/${deviceID}/sensor/soil`,
    `smartgarden/${deviceID}/sensor/hum`,
    `smartgarden/${deviceID}/status/info`,
  ];
  client.unsubscribe(oldTopics);

  deviceID = newId;

  const newTopics = [
    `smartgarden/${deviceID}/status/relay`,
    `smartgarden/${deviceID}/status/mode`,
    `smartgarden/${deviceID}/sensor/dht`,
    `smartgarden/${deviceID}/sensor/ds18b20`,
    `smartgarden/${deviceID}/sensor/soil`,
    `smartgarden/${deviceID}/sensor/hum`,
    `smartgarden/${deviceID}/status/info`,
  ];
  client.subscribe(newTopics);

  
  relayState      = 0;
  autoMode        = 1;
  lastMessageTime = 0;
  modeOverride    = 0;

  
  ['tempDHT','tempDS','humidity','relay','mode'].forEach(id => {
    const el = document.getElementById(id);
    if (el) { el.textContent = '--'; el.style.color = ''; }
  });
  document.getElementById('soilValue').textContent = '--%';
  const soilFill = document.getElementById('soilFill');
  if (soilFill) { soilFill.style.width = '0%'; }

  if (typeof setOffline === 'function') setOffline();

  
  ['espFW','espIP','espMAC','espSSID','espRSSI','espHeap','espUptime'].forEach(id => {
    const el = document.getElementById(id); if (el) el.textContent = '—';
  });

  
  if (soilChart) {
    soilChart.data.labels = [];
    soilChart.data.datasets[0].data = [];
    soilChart.update();
  }

  
  loadHistoricalData();
}
