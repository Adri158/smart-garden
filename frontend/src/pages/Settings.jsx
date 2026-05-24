import { useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSettings, fetchSchedules } from '../redux/slices/settingsSlice';
import { setSelectedDevice } from '../redux/slices/deviceSlice';
import { useDevices } from '../hooks/useDevices';
import { publish, getMqttClient } from '../services/mqttService';
import { mqttTopic } from '../utils/constants';
import '../styles/settings.css';

const API_KEY = import.meta.env.VITE_API_KEY ?? '';

const DAY_NAMES     = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
const DAY_FULL      = ['Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu', 'Minggu'];

function dayStr(daysValue) {
  if (!daysValue) return '—';

  const bits = String(daysValue).replace(/,/g, '').split('').filter(c => /\d/.test(c));
  return bits.map(d => DAY_NAMES[parseInt(d)] ?? d).join(', ');
}

function DeviceDropdown({ devices, selectedId, onSelect }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const selected = devices.find(d => d.device_id === selectedId);

  useEffect(() => {
    function onClick(e) { if (ref.current && !ref.current.contains(e.target)) setOpen(false); }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  return (
    <div className="cdd" ref={ref}>
      <button type="button" className="cdd-btn" onClick={() => setOpen(v => !v)}>
        <i className="fa fa-circle cdd-dot" />
        <span className="cdd-label">{selected?.name || selected?.device_id || selectedId || '—'}</span>
        <span className="cdd-id">{selectedId || ''}</span>
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

function FlashMsg({ type, msg, onHide }) {
  useEffect(() => { if (msg) { const t = setTimeout(onHide, 5000); return () => clearTimeout(t); } }, [msg, onHide]);
  if (!msg) return null;
  return (
    <div className={`s-flash s-flash-${type} show`}>
      <i className={`fa fa-${type === 'success' ? 'circle-check' : 'circle-exclamation'}`} />
      <span>{msg}</span>
    </div>
  );
}

export default function Settings() {
  const dispatch = useDispatch();
  const { devices, selectedId, setSelectedId } = useDevices();
  const { device: settings, schedules, loading } = useSelector(s => s.settings);


  const [soilMin, setSoilMin]     = useState('');
  const [soilMax, setSoilMax]     = useState('');
  const [tempMax, setTempMax]     = useState('');
  const [humMin, setHumMin]       = useState('');
  const [pubInterval, setPubInterval] = useState('');


  const [schedDays, setSchedDays] = useState([]);
  const [schedTime, setSchedTime] = useState('06:00');
  const [localSchedules, setLocalSchedules] = useState([]);


  const [flash, setFlash] = useState({ type: '', msg: '' });
  const [saving, setSaving] = useState(false);


  const [otaStatus, setOtaStatus] = useState('');
  const [otaLoading, setOtaLoading] = useState(false);


  useEffect(() => {
    if (settings) {
      setSoilMin(String(settings.soil_min ?? '30'));
      setSoilMax(String(settings.soil_max ?? '80'));
      setTempMax(String(settings.temp_max ?? '35'));
      setHumMin(String(settings.hum_min  ?? '40'));
      setPubInterval(String(settings.publish_interval ?? '5'));
    }
  }, [settings]);

  useEffect(() => {
    if (schedules) setLocalSchedules(schedules);
  }, [schedules]);

  useEffect(() => {
    if (selectedId) dispatch(fetchSettings(selectedId));
    dispatch(fetchSchedules());
  }, [selectedId, dispatch]);

  function showFlash(type, msg) { setFlash({ type, msg }); }
  function hideFlash() { setFlash({ type: '', msg: '' }); }

  const apiHeaders = { 'Content-Type': 'application/json', 'X-API-Key': API_KEY };

  async function saveThreshold() {
    setSaving(true); hideFlash();
    try {
      const res  = await fetch(`/api/devices/${selectedId}/settings`, {
        method: 'PUT', headers: apiHeaders,
        body: JSON.stringify({ soil_min: Number(soilMin), soil_max: Number(soilMax), temp_max: Number(tempMax), hum_min: Number(humMin) }),
      });
      const data = await res.json();
      if (data.success) {
        publish(`smartgarden/${selectedId}/config`, JSON.stringify({ soil_min: Number(soilMin), soil_max: Number(soilMax), temp_max: Number(tempMax), hum_min: Number(humMin) }), { retain: true });
        showFlash('success', 'Settings disimpan & dikirim ke ESP32');
        dispatch(fetchSettings(selectedId));
      } else {
        showFlash('error', data.message || 'Gagal menyimpan');
      }
    } catch {
      showFlash('error', 'Gagal menghubungi server');
    }
    setSaving(false);
  }

  async function saveDevice() {
    setSaving(true); hideFlash();
    try {
      const res  = await fetch(`/api/devices/${selectedId}/settings`, {
        method: 'PUT', headers: apiHeaders,
        body: JSON.stringify({ publish_interval: Number(pubInterval) }),
      });
      const data = await res.json();
      if (data.success) {
        publish(`smartgarden/${selectedId}/config`, JSON.stringify({ publish_interval: Number(pubInterval) }), { retain: true });
        showFlash('success', 'Settings disimpan & dikirim ke ESP32');
      } else {
        showFlash('error', data.message || 'Gagal menyimpan');
      }
    } catch {
      showFlash('error', 'Gagal menghubungi server');
    }
    setSaving(false);
  }

  async function addSchedule() {
    if (!schedTime) { showFlash('error', 'Pilih jam terlebih dahulu'); return; }
    if (schedDays.length === 0) { showFlash('error', 'Pilih minimal 1 hari'); return; }
    try {
      const days = schedDays.slice().sort((a, b) => a - b).join(',');
      const res  = await fetch('/api/schedules', {
        method: 'POST', headers: apiHeaders,
        body: JSON.stringify({ days, time: schedTime, enabled: true }),
      });
      const data = await res.json();
      if (data.success) {
        setLocalSchedules(prev => [...prev, data.data]);
        setSchedDays([]); setSchedTime('06:00');
        showFlash('success', 'Jadwal berhasil ditambahkan');
      } else { showFlash('error', data.message || 'Gagal menambah jadwal'); }
    } catch { showFlash('error', 'Gagal menghubungi server'); }
  }

  async function toggleSchedule(id, enabled) {
    try {
      const res  = await fetch(`/api/schedules/${id}`, {
        method: 'PUT', headers: apiHeaders,
        body: JSON.stringify({ enabled }),
      });
      const data = await res.json();
      if (data.success) {
        setLocalSchedules(prev => prev.map(s => s.id === id ? { ...s, enabled } : s));
      } else { showFlash('error', 'Gagal update jadwal'); }
    } catch { showFlash('error', 'Gagal menghubungi server'); }
  }

  async function deleteSchedule(id) {
    if (!window.confirm('Hapus jadwal ini?')) return;
    try {
      const res  = await fetch(`/api/schedules/${id}`, {
        method: 'DELETE', headers: apiHeaders,
      });
      const data = await res.json();
      if (data.success) {
        setLocalSchedules(prev => prev.filter(s => s.id !== id));
      } else { showFlash('error', 'Gagal menghapus jadwal'); }
    } catch { showFlash('error', 'Gagal menghubungi server'); }
  }

  async function pushSchedules() {
    try {
      const res  = await fetch('/api/schedules');
      const data = await res.json();
      if (data.success) {
        const active = (data.data ?? []).filter(s => s.enabled);
        publish(`smartgarden/${selectedId}/schedules`, JSON.stringify({ schedules: active }), { retain: true });
        showFlash('success', `${active.length} jadwal aktif dikirim ke ESP32`);
      } else { showFlash('error', 'Gagal mengambil jadwal'); }
    } catch { showFlash('error', 'Gagal menghubungi server'); }
  }

  function triggerOTA() {
    if (!window.confirm('Trigger OTA update ke ESP32? ESP32 akan restart.')) return;
    setOtaLoading(true); setOtaStatus('');
    const client = getMqttClient();
    client.publish(`smartgarden/${selectedId}/terminal/input`, 'update', { qos: 1 }, err => {
      setOtaStatus(err ? '✗ Gagal mengirim perintah OTA' : '✓ Perintah OTA terkirim — ESP32 sedang update...');
      setOtaLoading(false);
    });
  }

  function toggleDay(i) {
    setSchedDays(prev => prev.includes(i) ? prev.filter(d => d !== i) : [...prev, i]);
  }

  return (
    <div className="settings-wrap">


      <div className="settings-header">
        <div className="settings-header-top">
          <div>
            <div className="settings-tag"><i className="fa fa-gear" /> Konfigurasi Sistem</div>
            <h1 className="settings-title">Settings</h1>
          </div>
          <div className="device-context">
            <span className="device-context-label"><i className="fa fa-microchip" /> Device</span>
            <DeviceDropdown devices={devices} selectedId={selectedId} onSelect={id => {
              dispatch(setSelectedDevice(id));
            }} />
          </div>
        </div>
        <p className="settings-desc">Perubahan disimpan ke database dan dikirim ke ESP32 via MQTT.</p>
      </div>


      <FlashMsg type={flash.type} msg={flash.msg} onHide={hideFlash} />


      <div className="settings-grid">


        <div className="s-card">
          <div className="s-card-header">
            <div className="s-card-icon"><i className="fa fa-sliders" /></div>
            <div>
              <div className="s-card-title">Sensor Threshold</div>
              <div className="s-card-sub">Batas nilai sensor untuk trigger aksi otomatis</div>
            </div>
          </div>

          <div className="s-fields">
            <div className="s-field">
              <label className="s-label">
                Soil Moisture Minimum <span className="s-unit">%</span>
                <span className="s-hint">Pompa nyala di bawah nilai ini</span>
              </label>
              <div className="s-input-wrap">
                <input type="range" min="0" max="100" step="1" value={soilMin}
                  onChange={e => setSoilMin(e.target.value)} />
                <span className="s-range-val">{soilMin}%</span>
              </div>
            </div>
            <div className="s-field">
              <label className="s-label">
                Soil Moisture Maximum <span className="s-unit">%</span>
                <span className="s-hint">Pompa mati di atas nilai ini</span>
              </label>
              <div className="s-input-wrap">
                <input type="range" min="0" max="100" step="1" value={soilMax}
                  onChange={e => setSoilMax(e.target.value)} />
                <span className="s-range-val">{soilMax}%</span>
              </div>
            </div>
            <div className="s-field">
              <label className="s-label">
                Suhu Maksimum <span className="s-unit">°C</span>
                <span className="s-hint">Alert jika suhu melebihi batas</span>
              </label>
              <div className="s-input-wrap">
                <input type="range" min="20" max="50" step="1" value={tempMax}
                  onChange={e => setTempMax(e.target.value)} />
                <span className="s-range-val">{tempMax}°C</span>
              </div>
            </div>
            <div className="s-field">
              <label className="s-label">
                Kelembaban Udara Minimum <span className="s-unit">%</span>
                <span className="s-hint">Alert jika kelembaban di bawah batas</span>
              </label>
              <div className="s-input-wrap">
                <input type="range" min="0" max="100" step="1" value={humMin}
                  onChange={e => setHumMin(e.target.value)} />
                <span className="s-range-val">{humMin}%</span>
              </div>
            </div>
          </div>

          <button className="s-save-btn" onClick={saveThreshold} disabled={saving}>
            <i className="fa fa-floppy-disk" /> Simpan &amp; Kirim
          </button>
        </div>


        <div className="s-card s-card-schedule">
          <div className="s-card-header">
            <div className="s-card-icon"><i className="fa fa-clock" /></div>
            <div>
              <div className="s-card-title">Jadwal Penyiraman</div>
              <div className="s-card-sub">Atur jadwal penyiraman otomatis harian</div>
            </div>
          </div>


          <div className="schedule-add-form">
            <div className="schedule-add-title">Tambah Jadwal Baru</div>
            <div className="day-picker">
              {DAY_NAMES.map((d, i) => (
                <label key={i} className="day-chip">
                  <input
                    type="checkbox"
                    checked={schedDays.includes(i)}
                    onChange={() => toggleDay(i)}
                  />
                  <span>{d}</span>
                </label>
              ))}
            </div>
            <div className="schedule-add-row">
              <input
                type="time"
                className="s-input"
                value={schedTime}
                onChange={e => setSchedTime(e.target.value)}
              />
              <button className="s-add-btn" onClick={addSchedule}>
                <i className="fa fa-plus" /> Tambah
              </button>
            </div>
          </div>


          <div className="schedule-list-wrap">
            <div className="schedule-list-label">
              <span>Jadwal Aktif</span>
              <span className="sched-count">{localSchedules.length} jadwal</span>
            </div>
            <div className="schedule-list">
              {localSchedules.length === 0 ? (
                <div className="sched-empty">Belum ada jadwal</div>
              ) : (
                localSchedules.map(s => (
                  <div className="sched-row" key={s.id}>
                    <div className="sched-info">
                      <div className="sched-time">{s.time}</div>
                      <div className="sched-days">{dayStr(s.days)}</div>
                    </div>
                    <div className="sched-actions">
                      <label className="s-toggle s-toggle-sm">
                        <input
                          type="checkbox"
                          checked={!!s.enabled}
                          onChange={e => toggleSchedule(s.id, e.target.checked)}
                        />
                        <span className="s-slider" />
                      </label>
                      <button className="sched-del-btn" onClick={() => deleteSchedule(s.id)}>
                        <i className="fa fa-trash" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <button className="s-save-btn" onClick={pushSchedules} disabled={saving}>
            <i className="fa fa-paper-plane" /> Kirim Semua Jadwal ke ESP32
          </button>
        </div>


        <div className="s-card">
          <div className="s-card-header">
            <div className="s-card-icon"><i className="fa fa-microchip" /></div>
            <div>
              <div className="s-card-title">Device</div>
              <div className="s-card-sub">Konfigurasi perangkat ESP32</div>
            </div>
          </div>
          <div className="s-fields">
            <div className="s-field">
              <label className="s-label">
                Interval Publish Sensor <span className="s-unit">detik</span>
                <span className="s-hint">Seberapa sering ESP32 kirim data</span>
              </label>
              <div className="s-input-wrap">
                <input type="range" min="1" max="60" step="1" value={pubInterval}
                  onChange={e => setPubInterval(e.target.value)} />
                <span className="s-range-val">{pubInterval}s</span>
              </div>
            </div>
          </div>
          <button className="s-save-btn" onClick={saveDevice} disabled={saving}>
            <i className="fa fa-floppy-disk" /> Simpan &amp; Kirim
          </button>
        </div>


        <div className="s-card s-card-danger">
          <div className="s-card-header">
            <div className="s-card-icon s-icon-amber"><i className="fa fa-cloud-arrow-up" /></div>
            <div>
              <div className="s-card-title">OTA Firmware Update</div>
              <div className="s-card-sub">Trigger update firmware ESP32 secara remote</div>
            </div>
          </div>
          <div className="s-fields">
            <div className="s-warning-box">
              <i className="fa fa-triangle-exclamation" />
              {' '}ESP32 akan restart selama proses update. Pastikan koneksi WiFi stabil dan firmware tersedia di server OTA.
            </div>
          </div>
          {otaStatus && (
            <div className="s-ota-status" style={{ color: otaStatus.startsWith('✓') ? 'var(--green)' : 'var(--red)' }}>
              {otaStatus}
            </div>
          )}
          <button className="s-save-btn s-btn-amber" onClick={triggerOTA} disabled={otaLoading}>
            <i className={`fa ${otaLoading ? 'fa-spinner fa-spin' : 'fa-bolt'}`} />
            {otaLoading ? ' Mengirim...' : ' Trigger OTA Update'}
          </button>
        </div>

      </div>
    </div>
  );
}
