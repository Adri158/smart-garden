export const API_BASE = import.meta.env.VITE_API_BASE ?? '';

function resolveMqttUrl() {
  const host = window.location.hostname;
  const isLocal = /^(localhost|127\.|192\.168\.|10\.|172\.(1[6-9]|2[0-9]|3[01])\.)/.test(host)
               || host.endsWith('.local');
  if (isLocal) return `ws://${host}:9002`;
  return import.meta.env.VITE_MQTT_URL || 'wss://mqtt.domainkamu.com';
}

export const MQTT_URL = resolveMqttUrl();

export const MQTT_TOPIC_PREFIX = 'smartgarden';

export function mqttTopic(deviceId, ...parts) {
  return [MQTT_TOPIC_PREFIX, deviceId, ...parts].join('/');
}

export const RANGE_OPTIONS = [
  { label: '1 Jam', value: '1h' },
  { label: '6 Jam', value: '6h' },
  { label: '24 Jam', value: '24h' },
  { label: '1 Minggu', value: '1w' },
  { label: '1 Bulan', value: '1m' },
];

export const SENSOR_TYPES = ['soil', 'temp_dht', 'temp_ds', 'humidity'];

export const OFFLINE_THRESHOLD_MS = 3000;
