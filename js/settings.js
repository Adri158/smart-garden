const mqttClient = mqtt.connect(mqttBroker, {
  reconnectPeriod: 3000,
  connectTimeout:  10000,
  clean:           true,
  protocol:        mqttBroker.startsWith('wss') ? 'wss' : 'ws',
});

let _sgLast = 0, _sgLoad = Date.now();

function getSelectedDevice() {
  return document.getElementById('deviceId')?.value || 'device01';
}

window._onDeviceSelect = (deviceId) => {
  _sgLast = 0;
  _sgLoad = Date.now();
  if (typeof setOffline === 'function') setOffline();
  resubscribeDevice(deviceId);
  loadDeviceSettings(deviceId);
};

function resubscribeDevice(deviceId) {
  mqttClient.unsubscribe('smartgarden/+/sensor/#');
  mqttClient.subscribe(`smartgarden/${deviceId}/sensor/#`);
}

mqttClient.on('connect', () => {
  console.log('Settings MQTT connected');
  resubscribeDevice(getSelectedDevice());
});
mqttClient.on('message', (t, m, pkt) => {
  if (!pkt.retain) { _sgLast = Date.now(); if (typeof setOnline === 'function') setOnline(); }
});
setInterval(() => {
  const now = Date.now();
  if (!_sgLast) { if (now - _sgLoad > 5000) { if (typeof setOffline === 'function') setOffline(); } return; }
  if (now - _sgLast > 3000) { if (typeof setOffline === 'function') setOffline(); }
}, 1000);

async function loadDeviceSettings(deviceId) {
  const csrf = document.getElementById('csrfToken').value;
  try {
    const res  = await fetch('settings_save.php', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ csrf, action: 'get_device_settings', device_id: deviceId })
    });
    const data = await res.json();
    if (!data.success) return;
    const c = data.cfg;

    const set = (id, val, dispId, suffix) => {
      const el = document.getElementById(id);
      if (el) { el.value = val; }
      const disp = document.getElementById(dispId);
      if (disp) disp.textContent = val + suffix;
    };

    set('soilMin',         c.soil_min,         'soilMinVal',         '%');
    set('soilMax',         c.soil_max,         'soilMaxVal',         '%');
    set('tempMax',         c.temp_max,         'tempMaxVal',         '°C');
    set('humMin',          c.hum_min,          'humMinVal',          '%');
    set('publishInterval', c.publish_interval, 'publishIntervalVal', 's');
  } catch (e) {
    console.error('loadDeviceSettings error:', e);
  }
}

window.syncRange = function (input, valId) {
  const el = document.getElementById(valId);
  if (!el) return;
  const suffix = valId.includes('Interval') ? 's'
               : valId.includes('temp')     ? '°C'
               : '%';
  el.textContent = input.value + suffix;
};

window.saveSection = async function (section) {
  const csrf = document.getElementById('csrfToken').value;
  let payload = { csrf, action: 'save', section };

  if (section === 'threshold') {
    payload.device_id = document.getElementById('deviceId')?.value || 'device01';
    payload.soil_min  = document.getElementById('soilMin').value;
    payload.soil_max  = document.getElementById('soilMax').value;
    payload.temp_max  = document.getElementById('tempMax').value;
    payload.hum_min   = document.getElementById('humMin').value;
  }

  if (section === 'device') {
    payload.device_id        = document.getElementById('deviceId').value.trim();
    payload.publish_interval = document.getElementById('publishInterval').value;
  }

  setAllBtns(true);
  hideFlash();

  try {
    const res  = await fetch('settings_save.php', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify(payload)
    });
    const data = await res.json();

    if (data.success) {
      const deviceId = document.getElementById('deviceId')?.value || 'device01';
      mqttPublish(`smartgarden/${deviceId}/config`, JSON.stringify(data.payload));
      showFlash('success', 'Settings disimpan & dikirim ke ESP32');
    } else {
      showFlash('error', data.message || 'Gagal menyimpan');
    }
  } catch (e) {
    showFlash('error', 'Gagal menghubungi server');
  }

  setAllBtns(false);
};

window.addSchedule = async function () {
  const csrf = document.getElementById('csrfToken').value;
  const time = document.getElementById('newSchedTime').value;
  const days = [...document.querySelectorAll('[name=sched_day]:checked')].map(el => parseInt(el.value));

  if (!time) { showFlash('error', 'Pilih jam terlebih dahulu'); return; }
  if (days.length === 0) { showFlash('error', 'Pilih minimal 1 hari'); return; }

  try {
    const res  = await fetch('settings_save.php', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ csrf, action: 'add_schedule', days, time })
    });
    const data = await res.json();

    if (data.success) {
      appendScheduleRow(data.schedule);
      updateSchedCount(1);

      
      document.querySelectorAll('[name=sched_day]').forEach(c => c.checked = false);
      document.getElementById('newSchedTime').value = '06:00';

      showFlash('success', 'Jadwal berhasil ditambahkan');
    } else {
      showFlash('error', data.message || 'Gagal menambah jadwal');
    }
  } catch (e) {
    showFlash('error', 'Gagal menghubungi server');
  }
};

window.toggleSchedule = async function (id, enabled) {
  const csrf = document.getElementById('csrfToken').value;

  try {
    const res  = await fetch('settings_save.php', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ csrf, action: 'toggle_schedule', id, enabled })
    });
    const data = await res.json();
    if (!data.success) showFlash('error', 'Gagal update jadwal');
  } catch (e) {
    showFlash('error', 'Gagal menghubungi server');
  }
};

window.deleteSchedule = async function (id) {
  if (!confirm('Hapus jadwal ini?')) return;

  const csrf = document.getElementById('csrfToken').value;

  try {
    const res  = await fetch('settings_save.php', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ csrf, action: 'delete_schedule', id })
    });
    const data = await res.json();

    if (data.success) {
      document.getElementById('schedRow' + id)?.remove();
      updateSchedCount(-1);

      const list = document.getElementById('scheduleList');
      if (!list.querySelector('.sched-row')) {
        list.innerHTML = '<div class="sched-empty">Belum ada jadwal</div>';
      }
    } else {
      showFlash('error', 'Gagal menghapus jadwal');
    }
  } catch (e) {
    showFlash('error', 'Gagal menghubungi server');
  }
};

window.pushSchedulesToESP32 = async function () {
  const csrf = document.getElementById('csrfToken').value;

  try {
    const res  = await fetch('settings_save.php', {
      method:  'POST',
      headers: { 'Content-Type': 'application/json' },
      body:    JSON.stringify({ csrf, action: 'get_schedules' })
    });
    const data = await res.json();

    if (data.success) {
      const deviceId = document.getElementById('deviceId')?.value || 'device01';
      mqttPublish(
        `smartgarden/${deviceId}/schedules`,
        JSON.stringify({ schedules: data.schedules })
      );
      showFlash('success', `${data.schedules.length} jadwal aktif dikirim ke ESP32`);
    } else {
      showFlash('error', 'Gagal mengambil jadwal');
    }
  } catch (e) {
    showFlash('error', 'Gagal menghubungi server');
  }
};

window.triggerOTA = function () {
  if (!confirm('Trigger OTA update ke ESP32? ESP32 akan restart.')) return;

  const btn      = document.getElementById('otaBtn');
  const statusEl = document.getElementById('otaStatus');

  btn.disabled     = true;
  btn.innerHTML    = '<i class="fa fa-spinner fa-spin"></i> Mengirim...';
  statusEl.textContent = '';

  const deviceId = document.getElementById('deviceId')?.value || 'device01';
  mqttClient.publish(`smartgarden/${deviceId}/terminal/input`, 'update', { qos: 1 }, (err) => {
    statusEl.textContent = err
      ? '✗ Gagal mengirim perintah OTA'
      : '✓ Perintah OTA terkirim — ESP32 sedang update...';
    statusEl.style.color = err ? 'var(--red)' : 'var(--green)';

    btn.disabled  = false;
    btn.innerHTML = '<i class="fa fa-bolt"></i> Trigger OTA Update';
  });
};

function mqttPublish(topic, payload) {
  mqttClient.publish(topic, payload, { qos: 1 }, (err) => {
    if (err) console.error('MQTT publish error:', err);
    else     console.log('Published to', topic, payload);
  });
}

function appendScheduleRow(s) {
  const list = document.getElementById('scheduleList');

  
  const empty = list.querySelector('.sched-empty');
  if (empty) empty.remove();

  const row = document.createElement('div');
  row.className = 'sched-row';
  row.id = 'schedRow' + s.id;
  row.innerHTML = `
    <div class="sched-info">
      <div class="sched-time">${escHtml(s.time)}</div>
      <div class="sched-days">${escHtml(s.dayStr)}</div>
    </div>
    <div class="sched-actions">
      <label class="s-toggle s-toggle-sm">
        <input type="checkbox" checked onchange="toggleSchedule(${s.id}, this.checked)">
        <span class="s-slider"></span>
      </label>
      <button class="sched-del-btn" onclick="deleteSchedule(${s.id})">
        <i class="fa fa-trash"></i>
      </button>
    </div>`;
  list.appendChild(row);
}

function updateSchedCount(delta) {
  const el   = document.getElementById('schedCount');
  if (!el) return;
  const curr = parseInt(el.textContent) || 0;
  const next = Math.max(0, curr + delta);
  el.textContent = next + ' jadwal';
}

function setAllBtns(disabled) {
  document.querySelectorAll('.s-save-btn').forEach(b => {
    if (b.id !== 'otaBtn') b.disabled = disabled;
  });
}

function showFlash(type, msg) {
  hideFlash();
  if (type === 'success') {
    document.getElementById('sFlashSuccessMsg').textContent = msg;
    document.getElementById('sFlashSuccess').classList.add('show');
  } else {
    document.getElementById('sFlashMsg').textContent = msg;
    document.getElementById('sFlashError').classList.add('show');
  }
  setTimeout(hideFlash, 5000);
}

function hideFlash() {
  document.getElementById('sFlashSuccess').classList.remove('show');
  document.getElementById('sFlashError').classList.remove('show');
}

function escHtml(str) {
  return String(str)
    .replace(/&/g,'&amp;')
    .replace(/</g,'&lt;')
    .replace(/>/g,'&gt;')
    .replace(/"/g,'&quot;')
    .replace(/'/g,'&#39;');
}

document.querySelectorAll('.s-card').forEach((el, i) => {
  el.style.opacity = '0';
  el.style.transform = 'translateY(14px)';
  el.style.transition = 'opacity 0.4s ease, transform 0.4s ease, border-color 0.2s';
  setTimeout(() => {
    el.style.opacity = '1';
    el.style.transform = '';
  }, 80 + i * 100);
});
