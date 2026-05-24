<?php

session_start();
header('Content-Type: application/json');

if (empty($_SESSION['admin_id'])) {
  http_response_code(403);
  echo json_encode(['error' => 'Forbidden']);
  exit;
}

require_once __DIR__ . '/db.php';

$body = json_decode(file_get_contents('php://input'), true);

if (empty($body['csrf']) || $body['csrf'] !== ($_SESSION['csrf'] ?? '')) {
  http_response_code(403);
  echo json_encode(['success' => false, 'message' => 'Invalid request']);
  exit;
}

try {
  initTables();
  $pdo = getDB();

  $pdo->exec("
    CREATE TABLE IF NOT EXISTS settings (
      key_name   VARCHAR(60)  PRIMARY KEY,
      value      VARCHAR(255) NOT NULL,
      updated_at DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  ");

  $pdo->exec("
    CREATE TABLE IF NOT EXISTS schedules (
      id         INT AUTO_INCREMENT PRIMARY KEY,
      days       VARCHAR(20)  NOT NULL,
      time       VARCHAR(5)   NOT NULL,
      enabled    TINYINT(1)   DEFAULT 1,
      created_at DATETIME     DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4
  ");

} catch (Exception $e) {
  echo json_encode(['success' => false, 'message' => 'DB init error']);
  exit;
}

function saveSetting(PDO $pdo, string $key, $value): void {
  $pdo->prepare("INSERT INTO settings (key_name, value) VALUES (?,?) ON DUPLICATE KEY UPDATE value=?, updated_at=NOW()")
      ->execute([$key, $value, $value]);
}

function saveDeviceSetting(PDO $pdo, string $deviceId, string $key, $value): void {
  $pdo->prepare("INSERT INTO device_settings (device_id, key_name, value) VALUES (?,?,?) ON DUPLICATE KEY UPDATE value=?, updated_at=NOW()")
      ->execute([$deviceId, $key, $value, $value]);
}

$action = $body['action'] ?? 'save';

if ($action === 'save' && ($body['section'] ?? '') === 'threshold') {
  $deviceId = preg_replace('/[^a-zA-Z0-9_\-]/', '', $body['device_id'] ?? 'device01');
  $soilMin  = max(0,  min(100, intval($body['soil_min'] ?? 30)));
  $soilMax  = max(0,  min(100, intval($body['soil_max'] ?? 80)));
  $tempMax  = max(20, min(60,  intval($body['temp_max'] ?? 35)));
  $humMin   = max(0,  min(100, intval($body['hum_min']  ?? 40)));

  saveDeviceSetting($pdo, $deviceId, 'soil_min', $soilMin);
  saveDeviceSetting($pdo, $deviceId, 'soil_max', $soilMax);
  saveDeviceSetting($pdo, $deviceId, 'temp_max', $tempMax);
  saveDeviceSetting($pdo, $deviceId, 'hum_min',  $humMin);

  echo json_encode([
    'success' => true,
    'payload' => [
      'soilThreshold' => $soilMin,
      'soilMax'       => $soilMax,
      'tempThreshold' => $tempMax,
      'humThreshold'  => $humMin,
    ]
  ]);
  exit;
}

if ($action === 'save' && ($body['section'] ?? '') === 'device') {
  $deviceId = preg_replace('/[^a-zA-Z0-9_\-]/', '', $body['device_id'] ?? 'device01');
  $interval = max(1, min(60, intval($body['publish_interval'] ?? 5)));

  saveSetting($pdo, 'device_id', $deviceId);
  saveDeviceSetting($pdo, $deviceId, 'publish_interval', $interval);

  echo json_encode([
    'success' => true,
    'payload' => [
      'deviceId'        => $deviceId,
      'publishInterval' => $interval,
    ]
  ]);
  exit;
}

if ($action === 'add_schedule') {
  $days = $body['days'] ?? [];
  $time = $body['time'] ?? '';

  if (empty($days) || !preg_match('/^\d{2}:\d{2}$/', $time)) {
    echo json_encode(['success' => false, 'message' => 'Data jadwal tidak lengkap']);
    exit;
  }

  
  $days = array_filter($days, fn($d) => is_numeric($d) && $d >= 0 && $d <= 6);
  $days = array_unique(array_map('intval', $days));
  sort($days);
  $daysStr = implode('', $days);

  $pdo->prepare("INSERT INTO schedules (days, time) VALUES (?,?)")
      ->execute([$daysStr, $time]);

  $id = $pdo->lastInsertId();

  $dayNames = ['Sen','Sel','Rab','Kam','Jum','Sab','Min'];
  $dayLabels = array_map(fn($d) => $dayNames[$d], $days);

  echo json_encode([
    'success'  => true,
    'schedule' => [
      'id'      => $id,
      'days'    => $daysStr,
      'time'    => $time,
      'enabled' => 1,
      'dayStr'  => implode(', ', $dayLabels),
    ]
  ]);
  exit;
}

if ($action === 'toggle_schedule') {
  $id      = intval($body['id'] ?? 0);
  $enabled = $body['enabled'] ? 1 : 0;

  if (!$id) {
    echo json_encode(['success' => false, 'message' => 'ID tidak valid']);
    exit;
  }

  $pdo->prepare("UPDATE schedules SET enabled=? WHERE id=?")->execute([$enabled, $id]);
  echo json_encode(['success' => true]);
  exit;
}

if ($action === 'delete_schedule') {
  $id = intval($body['id'] ?? 0);

  if (!$id) {
    echo json_encode(['success' => false, 'message' => 'ID tidak valid']);
    exit;
  }

  $pdo->prepare("DELETE FROM schedules WHERE id=?")->execute([$id]);
  echo json_encode(['success' => true]);
  exit;
}

if ($action === 'get_device_settings') {
  $deviceId = preg_replace('/[^a-zA-Z0-9_\-]/', '', $body['device_id'] ?? 'device01');
  $defaults = ['soil_min'=>30,'soil_max'=>80,'temp_max'=>35,'hum_min'=>40,'publish_interval'=>5];
  $cfg = getDeviceSettings($pdo, $deviceId, $defaults);
  echo json_encode(['success' => true, 'cfg' => $cfg]);
  exit;
}

if ($action === 'add_device') {
  $deviceId = preg_replace('/[^a-zA-Z0-9_\-]/', '', $body['device_id'] ?? '');
  $name     = substr(trim($body['name'] ?? ''), 0, 100);

  if (!$deviceId) {
    echo json_encode(['success' => false, 'message' => 'Device ID tidak valid']);
    exit;
  }

  $pdo->prepare("INSERT IGNORE INTO devices (device_id, name) VALUES (?,?)")
      ->execute([$deviceId, $name ?: $deviceId]);

  echo json_encode(['success' => true, 'device' => ['device_id' => $deviceId, 'name' => $name ?: $deviceId]]);
  exit;
}

if ($action === 'delete_device') {
  $deviceId = preg_replace('/[^a-zA-Z0-9_\-]/', '', $body['device_id'] ?? '');

  if (!$deviceId) {
    echo json_encode(['success' => false, 'message' => 'Device ID tidak valid']);
    exit;
  }

  $pdo->prepare("DELETE FROM devices WHERE device_id=?")->execute([$deviceId]);
  echo json_encode(['success' => true]);
  exit;
}

if ($action === 'get_schedules') {
  $rows = $pdo->query("SELECT * FROM schedules WHERE enabled=1 ORDER BY time ASC")->fetchAll();

  $schedules = array_map(fn($r) => [
    'id'   => $r['id'],
    'days' => str_split($r['days']),
    'time' => $r['time'],
  ], $rows);

  echo json_encode(['success' => true, 'schedules' => $schedules]);
  exit;
}

echo json_encode(['success' => false, 'message' => 'Unknown action']);
