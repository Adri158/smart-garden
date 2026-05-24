export function formatSensorValue(sensorType, value) {
  if (value === null || value === undefined) return '—';
  const num = parseFloat(value);
  if (isNaN(num)) return '—';

  switch (sensorType) {
    case 'soil':
      return `${Math.round(num)}%`;
    case 'temp_dht':
    case 'temp_ds':
      return `${num.toFixed(1)}°C`;
    case 'humidity':
      return `${Math.round(num)}%`;
    default:
      return `${num}`;
  }
}

export function formatWithUnit(value, unit, decimals = 1) {
  if (value === null || value === undefined) return '—';
  const num = parseFloat(value);
  if (isNaN(num)) return '—';
  return `${num.toFixed(decimals)}${unit}`;
}

export function timeAgo(ts) {
  if (!ts) return '—';
  const now = Date.now();
  const then = new Date(ts).getTime();
  const diff = Math.floor((now - then) / 1000);

  if (diff < 5) return 'Baru saja';
  if (diff < 60) return `${diff} dtk lalu`;
  if (diff < 3600) return `${Math.floor(diff / 60)} menit lalu`;
  if (diff < 86400) return `${Math.floor(diff / 3600)} jam lalu`;
  return `${Math.floor(diff / 86400)} hari lalu`;
}

export function toLocalTime(ts) {
  if (!ts) return '—';
  return new Date(ts).toLocaleTimeString('id-ID', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  });
}

export function formatBytes(bytes) {
  if (bytes == null) return '—';
  if (bytes === 0) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB', 'TB'];
  const exp = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
  const val = bytes / Math.pow(1024, exp);

  return exp >= 3
    ? `${val.toFixed(1)} ${units[exp]}`
    : `${Math.round(val)} ${units[exp]}`;
}

export function formatUptime(seconds) {
  if (!seconds) return '—';
  const d = Math.floor(seconds / 86400);
  const h = Math.floor((seconds % 86400) / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  if (d > 0) return `${d}h ${h}j ${m}m`;
  if (h > 0) return `${h}j ${m}m`;
  return `${m}m`;
}
