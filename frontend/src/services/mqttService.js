import mqtt from 'mqtt';
import { MQTT_URL } from '../utils/constants';

let client = null;
let connectPromise = null;

export function getMqttClient() {
  if (client) return client;

  client = mqtt.connect(MQTT_URL, {
    clientId: `sg-web-${Math.random().toString(16).slice(2, 10)}`,
    clean: true,
    reconnectPeriod: 3000,
    connectTimeout: 10000,
    keepalive: 30,
  });

  client.on('connect', () => {
    console.log('[MQTT] Connected to', MQTT_URL);
  });

  client.on('reconnect', () => {
    console.log('[MQTT] Reconnecting...');
  });

  client.on('error', (err) => {
    console.error('[MQTT] Error:', err.message);
  });

  client.on('offline', () => {
    console.warn('[MQTT] Offline');
  });

  return client;
}

export function disconnectMqtt() {
  if (client) {
    client.end(true);
    client = null;
    connectPromise = null;
  }
}

export function publish(topic, payload, opts = {}) {
  const c = getMqttClient();
  const msg = typeof payload === 'object' ? JSON.stringify(payload) : String(payload);
  c.publish(topic, msg, { qos: 1, ...opts });
}
