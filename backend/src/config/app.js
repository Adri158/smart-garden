module.exports = {
  db: {
    host:     process.env.DB_HOST  || '127.0.0.1',
    user:     process.env.DB_USER  || 'root',
    password: process.env.DB_PASS  || '',
    database: process.env.DB_NAME  || 'smartgarden',
  },
  apiKey:   process.env.API_KEY   || 'changeme',
  mqttHost: process.env.MQTT_HOST || 'localhost',
  port:     parseInt(process.env.PORT || '3000', 10),
};
