const RANGE_CONFIG = {
  '1h':  { interval: '1 HOUR',   bucket: 300,   labelFmt: '%H:%i'       },
  '6h':  { interval: '6 HOUR',   bucket: 1800,  labelFmt: '%H:%i'       },
  '24h': { interval: '24 HOUR',  bucket: 3600,  labelFmt: '%H:00'       },
  '1w':  { interval: '7 DAY',    bucket: 21600, labelFmt: '%d/%m %H:00' },
  '1m':  { interval: '30 DAY',   bucket: 86400, labelFmt: '%d/%m'       },
};

const ALLOWED_SENSORS = ['soil', 'temp_dht', 'temp_ds', 'humidity'];

const ALLOWED_SETTINGS = ['soil_min', 'soil_max', 'temp_max', 'hum_min', 'publish_interval'];

module.exports = { RANGE_CONFIG, ALLOWED_SENSORS, ALLOWED_SETTINGS };
