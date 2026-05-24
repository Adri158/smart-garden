export const API_BASE = import.meta.env.VITE_API_BASE ?? '';

export const MQTT_URL = import.meta.env.VITE_MQTT_URL ?? '';

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
