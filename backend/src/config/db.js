const mysql  = require('mysql2/promise');
const config = require('./app');

const pool = mysql.createPool({
  host:               config.db.host,
  user:               config.db.user,
  password:           config.db.password,
  database:           config.db.database,
  waitForConnections: true,
  connectionLimit:    10,
  decimalNumbers:     true,
});

module.exports = pool;
