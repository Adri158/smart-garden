const mqtt   = require('mqtt');
const mysql  = require('mysql2');
const config = require('../config/app');

const client = mqtt.connect(`mqtt://${config.mqttHost}`);

const db = mysql.createPool({
  host:               config.db.host,
  user:               config.db.user,
  password:           config.db.password,
  database:           config.db.database,
  waitForConnections: true,
  connectionLimit:    5,
});

function registerDevice(deviceId) {
  db.query(
    'INSERT IGNORE INTO devices (device_id, name) VALUES (?, ?)',
    [deviceId, deviceId],
    (err) => { if (err) console.error('Device register error:', err.message); }
  );
}

client.on('connect', () => {
  console.log('MQTT CONNECTED to', config.mqttHost);
  client.subscribe([
    'smartgarden/+/sensor/soil',
    'smartgarden/+/sensor/dht',
    'smartgarden/+/sensor/ds18b20',
    'smartgarden/+/sensor/hum',
    'smartgarden/+/status/relay',
    'smartgarden/+/status/mode',
    'smartgarden/+/status/device',
  ]);
});

client.on('message', (topic, message) => {
  const payload  = message.toString();
  const parts    = topic.split('/'); 
  const deviceId = parts[1];

  if (!deviceId) return;


  registerDevice(deviceId);

  if (topic === `smartgarden/${deviceId}/sensor/soil`) {
    const soil = parseInt(payload);
    if (isNaN(soil)) return;
    db.query(
      'INSERT INTO sensor_logs (device_id, soil) VALUES (?, ?)',
      [deviceId, soil],
      (err) => {
        if (err) console.error('DB error:', err.message);
        else     console.log(`[${deviceId}] soil: ${soil}`);
      }
    );
  }

  if (topic === `smartgarden/${deviceId}/status/relay`)  console.log(`[${deviceId}] relay: ${payload}`);
  if (topic === `smartgarden/${deviceId}/status/mode`)   console.log(`[${deviceId}] mode: ${payload}`);
  if (topic === `smartgarden/${deviceId}/status/device`) console.log(`[${deviceId}] device: ${payload}`);
});

client.on('error', (err) => console.error('MQTT error:', err.message));
