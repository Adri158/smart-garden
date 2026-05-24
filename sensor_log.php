<?php

header('Content-Type: application/json');

require_once __DIR__ . '/db.php';

try {
  initTables();
  $pdo = getDB();

  
  $pdo->exec("
    CREATE TABLE IF NOT EXISTS sensor_logs (
      id         INT AUTO_INCREMENT PRIMARY KEY,
      soil       FLOAT        DEFAULT NULL,
      temp_dht   FLOAT        DEFAULT NULL,
      temp_ds    FLOAT        DEFAULT NULL,
      humidity   FLOAT        DEFAULT NULL,
      relay      TINYINT(1)   DEFAULT NULL,
      mode       VARCHAR(10)  DEFAULT NULL,
      created_at DATETIME     DEFAULT CURRENT_TIMESTAMP,
      INDEX idx_created (created_at)
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  ");

  $body = json_decode(file_get_contents('php://input'), true);

  if (empty($body)) {
    echo json_encode(['success' => false, 'message' => 'No data']);
    exit;
  }

  $deviceId = isset($body['device_id']) ? substr(preg_replace('/[^a-zA-Z0-9_\-]/', '', $body['device_id']), 0, 60) : null;
  $soil     = isset($body['soil'])     ? floatval($body['soil'])     : null;
  $tempDht  = isset($body['temp_dht']) ? floatval($body['temp_dht']) : null;
  $tempDs   = isset($body['temp_ds'])  ? floatval($body['temp_ds'])  : null;
  $humidity = isset($body['humidity']) ? floatval($body['humidity']) : null;
  $relay    = isset($body['relay'])    ? ($body['relay'] ? 1 : 0)    : null;
  $mode     = isset($body['mode'])     ? substr($body['mode'], 0, 10): null;

  $pdo->prepare("
    INSERT INTO sensor_logs (device_id, soil, temp_dht, temp_ds, humidity, relay, mode)
    VALUES (?, ?, ?, ?, ?, ?, ?)
  ")->execute([$deviceId, $soil, $tempDht, $tempDs, $humidity, $relay, $mode]);

  
  $pdo->exec("DELETE FROM sensor_logs WHERE created_at < DATE_SUB(NOW(), INTERVAL 1 MONTH)");

  echo json_encode(['success' => true]);

} catch (Exception $e) {
  error_log('sensor_log error: ' . $e->getMessage());
  echo json_encode(['success' => false, 'message' => 'Server error']);
}
