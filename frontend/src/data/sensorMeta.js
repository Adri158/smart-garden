export const SENSOR_META = {
  soil: {
    key: 'soil',
    label: 'Kelembaban Tanah',
    unit: '%',
    icon: '🌱',
    color: '#22c55e',
    mqttSuffix: 'sensor/soil',
    description: 'Kelembaban tanah saat ini',
    min: 0,
    max: 100,
  },
  temp_dht: {
    key: 'temp_dht',
    label: 'Suhu Udara',
    unit: '°C',
    icon: '🌡️',
    color: '#f59e0b',
    mqttSuffix: 'sensor/dht',
    description: 'Suhu udara dari sensor DHT11',
    min: 0,
    max: 60,
  },
  temp_ds: {
    key: 'temp_ds',
    label: 'Suhu Air',
    unit: '°C',
    icon: '💧',
    color: '#3b82f6',
    mqttSuffix: 'sensor/ds18b20',
    description: 'Suhu air dari sensor DS18B20',
    min: 0,
    max: 50,
  },
  humidity: {
    key: 'humidity',
    label: 'Kelembaban Udara',
    unit: '%',
    icon: '💨',
    color: '#8b5cf6',
    mqttSuffix: 'sensor/hum',
    description: 'Kelembaban udara dari sensor DHT11',
    min: 0,
    max: 100,
  },
};

export const SENSOR_KEYS = ['soil', 'temp_dht', 'humidity', 'temp_ds'];

export function getSensorMeta(key) {
  return (
    SENSOR_META[key] ?? {
      key,
      label: key,
      unit: '',
      icon: '📊',
      color: '#94a3b8',
      mqttSuffix: `sensor/${key}`,
      description: key,
      min: 0,
      max: 100,
    }
  );
}

export function getSensorStatus(sensorKey, value, settings = {}) {
  if (value === null || value === undefined) return 'muted';

  const v = parseFloat(value);

  switch (sensorKey) {
    case 'soil': {
      const min = parseFloat(settings.soil_min ?? 40);
      const max = parseFloat(settings.soil_max ?? 80);
      if (v < min) return 'red';
      if (v > max) return 'amber';
      return 'green';
    }
    case 'temp_dht':
    case 'temp_ds': {
      const tempMax = parseFloat(settings.temp_max ?? 35);
      if (v > tempMax) return 'red';
      if (v > tempMax * 0.9) return 'amber';
      return 'green';
    }
    case 'humidity': {
      const humMin = parseFloat(settings.hum_min ?? 40);
      if (v < humMin) return 'red';
      if (v < humMin * 1.1) return 'amber';
      return 'green';
    }
    default:
      return 'green';
  }
}
