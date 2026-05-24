import { useSelector, useDispatch } from 'react-redux';
import { useDevices } from '../hooks/useDevices';
import { useSensor } from '../hooks/useSensor';
import { setSelectedDevice } from '../redux/slices/deviceSlice';
import { setHistorySensor, setHistoryRange } from '../redux/slices/sensorSlice';
import { fetchSettings } from '../redux/slices/settingsSlice';
import { useEffect, useRef, useState, useCallback } from 'react';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  LineController,
  BarController,
  TimeScale,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';
import { Line, Bar } from 'react-chartjs-2';
import { publish, getMqttClient } from '../services/mqttService';
import { mqttTopic } from '../utils/constants';
import '../styles/dashboard.css';

ChartJS.register(
  CategoryScale, LinearScale, PointElement, LineElement, BarElement,
  LineController, BarController,
  TimeScale, Title, Tooltip, Legend, Filler
);

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

const SENSOR_COLORS = {
  soil:     { border: '#3b82f6', bg: 'rgba(59,130,246,0.08)',  label: 'Soil Moisture (%)', unit: '%' },
  temp_dht: { border: '#f59e0b', bg: 'rgba(245,158,11,0.08)',  label: 'Suhu Udara (°C)',   unit: '°C' },
  temp_ds:  { border: '#06b6d4', bg: 'rgba(6,182,212,0.08)',   label: 'Suhu Air (°C)',     unit: '°C' },
  humidity: { border: '#22c55e', bg: 'rgba(34,197,94,0.08)',   label: 'Kelembaban (%)',     unit: '%' },
};

const RANGE_OPTIONS = [
  { label: '1J', value: '1h' },
  { label: '6J', value: '6h' },
  { label: '24J', value: '24h' },
  { label: '1M', value: '1w' },
  { label: '1Bln', value: '1m' },
];
const SENSOR_TABS = [
  { key: 'soil',     icon: 'fa-seedling',         label: 'Soil' },
  { key: 'temp_dht', icon: 'fa-temperature-half', label: 'Suhu Udara' },
  { key: 'temp_ds',  icon: 'fa-water',            label: 'Suhu Air' },
  { key: 'humidity', icon: 'fa-droplet',           label: 'Kelembaban' },
];
const DAY_NAMES = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

function DeviceDropdown({ devices, selectedId, onSelect, size }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const selected = devices.find(d => d.device_id === selectedId);

  useEffect(() => {
    function onClick(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <div className={`cdd${size === 'sm' ? ' cdd--sm' : ''}`} ref={ref}>
      <button type="button" className="cdd-btn" onClick={() => setOpen(v => !v)}>
        <i className="fa fa-circle cdd-dot" />
        <span className="cdd-label">{selected?.name || selected?.device_id || selectedId || '—'}</span>
        <i className="fa fa-chevron-down cdd-arrow" />
      </button>
      {open && (
        <div className="cdd-menu">
          {devices.map((d, i) => (
            <div
              key={d.device_id}
              className={`cdd-item${d.device_id === selectedId ? ' active' : ''}`}
              onClick={() => { onSelect(d.device_id); setOpen(false); }}
            >
              <i className="fa fa-circle cdd-dot" />
              <div className="cdd-item-info">
                <span className="cdd-item-name">{d.name || d.device_id}</span>
                <span className="cdd-item-id">{d.device_id}</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function useWeather() {
  const [weather, setWeather] = useState(null);
  const [hourly, setHourly] = useState([]);

  const fetchAndSet = useCallback((lat, lon) => {
    const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
      `&current=temperature_2m,precipitation_probability,weather_code` +
      `&hourly=precipitation_probability&timezone=Asia%2FMakassar&forecast_days=1`;
    fetch(url)
      .then(r => r.json())
      .then(data => {
        setHourly(data.hourly?.precipitation_probability ?? []);
        setWeather(data.current);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    const run = () => {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          pos => fetchAndSet(pos.coords.latitude, pos.coords.longitude),
          ()  => fetchAndSet(WEATHER_DEFAULTS.lat, WEATHER_DEFAULTS.lon),
          { timeout: 5000 }
        );
      } else {
        fetchAndSet(WEATHER_DEFAULTS.lat, WEATHER_DEFAULTS.lon);
      }
    };
    run();
    const id = setInterval(run, 30 * 60 * 1000);
    return () => clearInterval(id);
  }, [fetchAndSet]);

  return { weather, hourly };
}

function useRealtimeSoilChart(soilValue) {
  const labelsRef = useRef([]);
  const valuesRef = useRef([]);
  const [chartData, setChartData] = useState({ labels: [], datasets: [{ label: 'Soil Moisture', data: [], borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.08)', tension: 0.4, pointRadius: 2, borderWidth: 1.5 }] });

  useEffect(() => {
    if (soilValue == null) return;
    const now = new Date().toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    labelsRef.current = [...labelsRef.current, now].slice(-20);
    valuesRef.current = [...valuesRef.current, soilValue].slice(-20);
    setChartData({
      labels: labelsRef.current,
      datasets: [{ label: 'Soil Moisture', data: valuesRef.current, borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.08)', tension: 0.4, pointRadius: 2, pointBackgroundColor: '#3b82f6', borderWidth: 1.5 }],
    });
  }, [soilValue]);

  return chartData;
}

const MINI_CHART_OPTIONS = {
  responsive: true, maintainAspectRatio: false, animation: false,
  scales: {
    x: { ticks: { color: '#64748b', font: { family: 'Space Mono', size: 9 }, maxTicksLimit: 6, maxRotation: 0 }, grid: { color: 'rgba(255,255,255,0.04)' } },
    y: { min: 0, max: 100, ticks: { color: '#64748b', font: { family: 'Space Mono', size: 9 }, stepSize: 25 }, grid: { color: 'rgba(255,255,255,0.04)' } },
  },
  plugins: { legend: { display: false } },
};

function buildHistChartOptions(histSensor) {
  return {
    responsive: true, maintainAspectRatio: false,
    animation: { duration: 400 },
    interaction: { mode: 'index', intersect: false },
    scales: {
      x: { ticks: { color: '#64748b', font: { family: 'DM Mono', size: 9 }, maxTicksLimit: 8, maxRotation: 30 }, grid: { color: 'rgba(255,255,255,0.04)' } },
      y: { ticks: { color: '#64748b', font: { family: 'DM Mono', size: 9 } }, grid: { color: 'rgba(255,255,255,0.04)' } },
      yRain: { position: 'right', min: 0, max: 100, ticks: { color: 'rgba(59,130,246,0.5)', font: { size: 9 }, callback: v => v + '%' }, grid: { display: false } },
    },
    plugins: {
      legend: { display: true, position: 'top', align: 'end', labels: { color: '#64748b', font: { size: 10 }, boxWidth: 12, boxHeight: 2, padding: 12 } },
      tooltip: {
        callbacks: {
          label: ctx => {
            if (ctx.datasetIndex === 3) return `Hujan: ${ctx.parsed.y}%`;
            if (ctx.datasetIndex === 1) return `Min: ${ctx.parsed.y}%`;
            if (ctx.datasetIndex === 2) return `Max: ${ctx.parsed.y}%`;
            const unit = SENSOR_COLORS[histSensor]?.unit || '';
            return ctx.parsed.y + unit;
          },
        },
      },
    },
  };
}

export default function Dashboard() {
  const dispatch  = useDispatch();
  const { devices, selectedId } = useDevices();
  const { live, latest, history, historyLoading, historySensor, historyRange } = useSensor(selectedId);
  const settings  = useSelector(s => s.settings.device);
  const { weather, hourly } = useWeather();


  const modeOverrideRef = useRef(0);


  const [rainAlertDismissed, setRainAlertDismissed] = useState(false);


  const nowH = new Date().getHours();
  const next3Rain = hourly.slice(nowH, nowH + 3);
  const rainProb  = weather?.precipitation_probability ?? 0;
  const maxRain   = Math.max(...next3Rain, rainProb, 0);
  const showRainAlert = maxRain >= 60 && !rainAlertDismissed;


  const [espInfo, setEspInfo] = useState({});


  useEffect(() => {
    if (!selectedId) return;
    const client = getMqttClient();
    const infoTopic = `smartgarden/${selectedId}/status/info`;
    client.subscribe(infoTopic, { qos: 0 });
    function onMsg(topic, buf) {
      if (topic !== infoTopic) return;
      try { setEspInfo(JSON.parse(buf.toString())); } catch (_) {}
    }
    client.on('message', onMsg);
    return () => { client.unsubscribe(infoTopic); client.removeListener('message', onMsg); };
  }, [selectedId]);


  useEffect(() => { setEspInfo({}); }, [selectedId]);


  useEffect(() => {
    if (selectedId) dispatch(fetchSettings(selectedId));
  }, [selectedId, dispatch]);

  function handleDeviceSwitch(id) {
    dispatch(setSelectedDevice(id));
  }

  function getValue(field) {
    if (live[field] !== null && live[field] !== undefined) return live[field];
    if (latest) return latest[field] ?? null;
    return null;
  }

  const soilValue  = getValue('soil');
  const soilPct    = soilValue != null ? Math.min(Math.max(soilValue, 0), 100) : 0;
  const relayOn    = getValue('relay') === 'ON';
  const modeIsAuto = getValue('mode') === 'AUTO';
  const deviceOnline = live.online;

  const relayColor = relayOn ? '#22c55e' : '#ef4444';
  const humVal     = getValue('humidity');

  function humColor(v) {
    if (v == null) return '';
    if (v < 40) return '#ef4444';
    if (v < 70) return '#22c55e';
    return '#3b82f6';
  }

  function soilFillColor(v) {
    if (v == null) return '#3b82f6';
    if (v < 30) return '#ef4444';
    if (v < 60) return '#22c55e';
    return '#3b82f6';
  }

  function handleRelayToggle() {
    if (!selectedId || !deviceOnline) return;
    if (modeIsAuto) return; 
    const next = relayOn ? 'OFF' : 'ON';
    publish(mqttTopic(selectedId, 'control/relay'), next);
  }

  function handleModeToggle() {
    if (!selectedId || !deviceOnline) return;
    const next = modeIsAuto ? 'MANUAL' : 'AUTO';
    publish(mqttTopic(selectedId, 'control/mode'), next);
    modeOverrideRef.current = Date.now();
  }


  const miniChartData = useRealtimeSoilChart(soilValue);


  const SOIL_MIN = parseFloat(settings?.soil_min ?? 30);
  const SOIL_MAX = parseFloat(settings?.soil_max ?? 80);
  const cfg = SENSOR_COLORS[historySensor] ?? SENSOR_COLORS.soil;

  const histLabels = history.map(p => p.label ?? p.time ?? '');
  const histValues = history.map(p => p.value ?? null);
  const n = histLabels.length;

  const showThresh = historySensor === 'soil';
  const showRainOverlay = ['1h', '6h', '24h'].includes(historyRange) && hourly.length > 0;

  const rainOverlayData = showRainOverlay
    ? histLabels.map(lbl => { const h = parseInt(lbl.split(':')[0], 10); return hourly[h] ?? null; })
    : [];

  const histChartData = {
    labels: histLabels,
    datasets: [
      {
        label: cfg.label,
        data: histValues,
        borderColor: cfg.border,
        backgroundColor: cfg.bg,
        tension: 0.3, pointRadius: 1, borderWidth: 1.5, fill: true,
        yAxisID: 'y',
      },
      {
        label: 'Min Optimal',
        data: showThresh ? Array(n).fill(SOIL_MIN) : [],
        borderColor: 'rgba(34,197,94,0.6)', backgroundColor: 'transparent',
        borderWidth: 1.5, borderDash: [6, 4], pointRadius: 0, fill: false,
        yAxisID: 'y', hidden: !showThresh,
      },
      {
        label: 'Max Optimal',
        data: showThresh ? Array(n).fill(SOIL_MAX) : [],
        borderColor: 'rgba(245,158,11,0.6)', backgroundColor: 'transparent',
        borderWidth: 1.5, borderDash: [6, 4], pointRadius: 0, fill: false,
        yAxisID: 'y', hidden: !showThresh,
      },
      {
        type: 'bar',
        label: 'Peluang Hujan',
        data: rainOverlayData,
        backgroundColor: 'rgba(59,130,246,0.15)', borderColor: 'rgba(59,130,246,0.3)',
        borderWidth: 1, borderRadius: 3, yAxisID: 'yRain', hidden: !showRainOverlay,
      },
    ],
  };


  const vals = histValues.filter(v => v != null);
  const hMin = vals.length ? Math.min(...vals) : null;
  const hAvg = vals.length ? (vals.reduce((a, b) => a + b, 0) / vals.length) : null;
  const hMax = vals.length ? Math.max(...vals) : null;
  const unit = cfg.unit;


  function fmtUptime(s) {
    if (!s) return '—';
    const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
    return (h ? h + 'j ' : '') + m + 'm ' + sec + 'd';
  }

  const selectedDevice = devices.find(d => d.device_id === selectedId);

  return (
    <main className="main-content" style={{ padding: 0 }}>


      <div className="metric-strip">
        <div className="metric-item">
          <i className="fa fa-temperature-half metric-ico" />
          <div className="metric-body">
            <span className="metric-label">Suhu Udara</span>
            <span className="metric-value">{getValue('temp_dht') != null ? `${getValue('temp_dht')}°C` : '--°C'}</span>
          </div>
        </div>
        <div className="metric-item">
          <i className="fa fa-droplet metric-ico" />
          <div className="metric-body">
            <span className="metric-label">Kelembaban</span>
            <span className="metric-value" style={{ color: humColor(humVal) || undefined }}>
              {humVal != null ? `${humVal}%` : '--%'}
            </span>
          </div>
        </div>
        <div className="metric-item">
          <i className="fa fa-water metric-ico" />
          <div className="metric-body">
            <span className="metric-label">Suhu Air</span>
            <span className="metric-value">{getValue('temp_ds') != null ? `${getValue('temp_ds')}°C` : '--°C'}</span>
          </div>
        </div>
        <div className="metric-item">
          <i className={`fa fa-plug metric-ico`} style={{ color: relayOn ? '#22c55e' : undefined }} />
          <div className="metric-body">
            <span className="metric-label">Status Pompa</span>
            <span className="metric-value" style={{ color: relayOn ? '#22c55e' : '#ef4444' }}>
              {getValue('relay') ? (relayOn ? 'Aktif' : 'Tidak Aktif') : '--'}
            </span>
          </div>
        </div>
        <div className="metric-item">
          <i className="fa fa-sliders metric-ico" />
          <div className="metric-body">
            <span className="metric-label">Mode Sistem</span>
            <span className="metric-value" style={{ color: modeIsAuto ? '#22c55e' : '#3b82f6' }}>
              {getValue('mode') ? (modeIsAuto ? 'Otomatis' : 'Manual') : '--'}
            </span>
          </div>
        </div>

        <div className="metric-item metric-divider" />

        <div className="metric-item">
          <i className={`fa ${WMO_ICO[weather?.weather_code] ?? 'fa-cloud'} metric-ico`}
             style={{ color: rainProb >= 60 ? '#3b82f6' : undefined }} />
          <div className="metric-body">
            <span className="metric-label">Cuaca</span>
            <span className="metric-value">{weather ? (WMO[weather.weather_code] ?? 'Tidak Diketahui') : '--'}</span>
          </div>
        </div>
        <div className="metric-item">
          <i className="fa fa-sun metric-ico" />
          <div className="metric-body">
            <span className="metric-label">Suhu Luar</span>
            <span className="metric-value">{weather ? `${Math.round(weather.temperature_2m)}°C` : '--°C'}</span>
          </div>
        </div>
        <div className="metric-item">
          <i className="fa fa-umbrella metric-ico" />
          <div className="metric-body">
            <span className="metric-label">Peluang Hujan</span>
            <span className="metric-value" style={{ color: rainProb >= 60 ? '#3b82f6' : rainProb >= 30 ? '#f59e0b' : undefined }}>
              {weather ? `${rainProb}%` : '--%'}
            </span>
          </div>
        </div>
      </div>


      {showRainAlert && (
        <div className="rain-alert">
          <i className="fa fa-cloud-rain" />
          <span>Peluang hujan {maxRain}% dalam 3 jam ke depan — jadwal siram otomatis mungkin tidak diperlukan.</span>
          <button onClick={() => setRainAlertDismissed(true)}><i className="fa fa-xmark" /></button>
        </div>
      )}


      <div className="panel-grid">


        <section className="panel panel-soil">
          <div className="panel-header">
            <span className="panel-title">Kelembaban Tanah</span>
          </div>

          <div className="soil-big">{soilValue != null ? `${soilValue}%` : '--%'}</div>

          <div className="soil-bar-wrap">
            <div className="soil-track">
              <div
                className="soil-fill"
                style={{ width: `${soilPct}%`, background: soilFillColor(soilValue) }}
              />
            </div>
            <div className="soil-ticks">
              <span>Kering</span>
              <span>Optimal</span>
              <span>Basah</span>
            </div>
          </div>

          <div className="panel-sub-title">Grafik Real-time</div>
          <div className="chart-wrap">
            <Line data={miniChartData} options={MINI_CHART_OPTIONS} />
          </div>
        </section>


        <section className="panel panel-control">
          <div className="panel-header">
            <span className="panel-title">Kontrol</span>
          </div>


          <div className="ctrl-row">
            <div className="ctrl-info">
              <span className="ctrl-name">Pompa Air</span>
              <span className="ctrl-sub">
                <span className="relay-dot" style={{ background: relayColor, boxShadow: relayOn ? '0 0 6px rgba(34,197,94,0.7)' : 'none' }} />
                <span style={{ color: relayColor }}>{relayOn ? 'Aktif' : 'Tidak Aktif'}</span>
              </span>
              <span className={`auto-badge${modeIsAuto ? ' visible' : ''}`}>
                <i className="fa fa-robot" /> Dikontrol sistem
              </span>
            </div>
            <label className="toggle">
              <input
                type="checkbox"
                checked={relayOn}
                onChange={handleRelayToggle}
                disabled={modeIsAuto}
              />
              <span className="slider" />
            </label>
          </div>


          <div className="ctrl-row">
            <div className="ctrl-info">
              <span className="ctrl-name">Mode Operasi</span>
              <span className="ctrl-sub">Otomatis / Manual</span>
            </div>
            <button
              className={`mode-btn ${modeIsAuto ? 'auto' : 'manual'}`}
              onClick={handleModeToggle}
            >
              {modeIsAuto ? 'AUTO' : 'MANUAL'}
            </button>
          </div>

          <div className="panel-sub-title">Info Perangkat</div>


          <div className="device-selector-row">
            <span className="device-selector-label"><i className="fa fa-microchip" /> Device</span>
            <DeviceDropdown
              devices={devices}
              selectedId={selectedId}
              onSelect={handleDeviceSwitch}
              size="sm"
            />
          </div>


          <div className="device-info-list">
            <div className="device-info-row">
              <span>ESP32</span>
              <span className={`mono${deviceOnline ? ' green' : ''}`}>
                {deviceOnline ? 'ONLINE' : 'OFFLINE'}
              </span>
            </div>
            <div className="device-info-row">
              <span>MQTT Broker</span>
              <span className="mono green">CONNECTED</span>
            </div>
            <div className="device-info-row">
              <span>Firmware</span>
              <span className="mono">{espInfo.fw ? 'v' + espInfo.fw : '—'}</span>
            </div>
            <div className="device-info-row">
              <span>IP Address</span>
              <span className="mono">{espInfo.ip ?? '—'}</span>
            </div>
            <div className="device-info-row">
              <span>MAC</span>
              <span className="mono">{espInfo.mac ?? '—'}</span>
            </div>
            <div className="device-info-row">
              <span>SSID</span>
              <span className="mono">{espInfo.ssid ?? '—'}</span>
            </div>
            <div className="device-info-row">
              <span>RSSI</span>
              <span className="mono">{espInfo.rssi != null ? espInfo.rssi + ' dBm' : '—'}</span>
            </div>
            <div className="device-info-row">
              <span>Free Heap</span>
              <span className="mono">{espInfo.heap != null ? (espInfo.heap / 1024).toFixed(1) + ' KB' : '—'}</span>
            </div>
            <div className="device-info-row">
              <span>Uptime</span>
              <span className="mono">{fmtUptime(espInfo.uptime)}</span>
            </div>
          </div>
        </section>

      </div>


      <section className="history-section">
        <div className="history-header">
          <div className="history-title-wrap">
            <span className="panel-title">Grafik Historis</span>
            <span className="history-count">{history.length > 0 ? `${history.length} data` : '— data'}</span>
          </div>
          <div className="history-controls">
            <div className="sensor-tabs">
              {SENSOR_TABS.map(({ key, icon, label }) => (
                <button
                  key={key}
                  className={`sensor-tab${historySensor === key ? ' active' : ''}`}
                  onClick={() => dispatch(setHistorySensor(key))}
                >
                  <i className={`fa ${icon}`} /> {label}
                </button>
              ))}
            </div>
            <div className="range-tabs">
              {RANGE_OPTIONS.map(({ label, value }) => (
                <button
                  key={value}
                  className={`range-tab${historyRange === value ? ' active' : ''}`}
                  onClick={() => dispatch(setHistoryRange(value))}
                >
                  {label}
                </button>
              ))}
            </div>
            <button className="reset-zoom-btn" title="Reset Zoom">
              <i className="fa fa-magnifying-glass-minus" />
            </button>
          </div>
        </div>


        <div className="history-stats">
          <div className="hstat">
            <span className="hstat-label">Min</span>
            <span className="hstat-val">{hMin !== null ? hMin.toFixed(1) + unit : '—'}</span>
          </div>
          <div className="hstat">
            <span className="hstat-label">Avg</span>
            <span className="hstat-val">{hAvg !== null ? hAvg.toFixed(1) + unit : '—'}</span>
          </div>
          <div className="hstat">
            <span className="hstat-label">Max</span>
            <span className="hstat-val">{hMax !== null ? hMax.toFixed(1) + unit : '—'}</span>
          </div>
        </div>


        <div className="history-chart-wrap">
          {historyLoading && (
            <div className="history-loading">
              <i className="fa fa-spinner fa-spin" /> Memuat data...
            </div>
          )}
          {!historyLoading && history.length > 0 && (
            <Line data={histChartData} options={buildHistChartOptions(historySensor)} />
          )}
          {!historyLoading && history.length === 0 && (
            <div className="history-loading">Belum ada data untuk rentang ini</div>
          )}
        </div>
      </section>

    </main>
  );
}
