const db = require('../config/db');

async function list() {
  const [rows] = await db.query(
    'SELECT id, days, time, enabled, created_at FROM schedules ORDER BY time ASC'
  );
  return rows;
}

async function insert(daysStr, time, enabled) {
  const [result] = await db.query(
    'INSERT INTO schedules (days, time, enabled) VALUES (?, ?, ?)',
    [daysStr, time, enabled]
  );
  return result.insertId;
}

async function update(id, fields, values) {
  const [result] = await db.query(
    `UPDATE schedules SET ${fields.join(', ')} WHERE id = ?`,
    [...values, id]
  );
  return result.affectedRows;
}

async function remove(id) {
  const [result] = await db.query('DELETE FROM schedules WHERE id = ?', [id]);
  return result.affectedRows;
}

module.exports = { list, insert, update, remove };
