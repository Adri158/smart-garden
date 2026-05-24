<?php

header('Content-Type: application/json');

require_once __DIR__ . '/db.php';

try {
  initTables();
  $pdo = getDB();

  $range    = $_GET['range']  ?? '1h';
  $sensor   = $_GET['sensor'] ?? 'soil';
  $deviceId = isset($_GET['device']) ? preg_replace('/[^a-zA-Z0-9_\-]/', '', $_GET['device']) : null;

  
  $allowed = ['soil', 'temp_dht', 'temp_ds', 'humidity'];
  if (!in_array($sensor, $allowed)) $sensor = 'soil';

  
  $intervals = [
    '1h'  => ['interval' => '1 HOUR',  'bucket' => 300,   'label_fmt' => '%H:%i'],
    '6h'  => ['interval' => '6 HOUR',  'bucket' => 1800,  'label_fmt' => '%H:%i'],
    '24h' => ['interval' => '24 HOUR', 'bucket' => 3600,  'label_fmt' => '%H:00'],
    '1w'  => ['interval' => '7 DAY',   'bucket' => 21600, 'label_fmt' => '%d/%m %H:00'],
    '1m'  => ['interval' => '30 DAY',  'bucket' => 86400, 'label_fmt' => '%d/%m'],
  ];

  $cfg    = $intervals[$range] ?? $intervals['1h'];
  $bucket = (int) $cfg['bucket'];
  $fmt    = $cfg['label_fmt'];

  $stmt = $pdo->prepare("
    SELECT
      DATE_FORMAT(
        FROM_UNIXTIME(FLOOR(UNIX_TIMESTAMP(created_at) / :bucket) * :bucket2),
        :fmt
      )                  AS label,
      AVG($sensor)       AS value,
      MIN(created_at)    AS ts
    FROM sensor_logs
    WHERE created_at >= DATE_SUB(NOW(), INTERVAL {$cfg['interval']})
      AND $sensor IS NOT NULL
      AND (:device IS NULL OR device_id = :device)
    GROUP BY FLOOR(UNIX_TIMESTAMP(created_at) / :bucket3)
    ORDER BY ts ASC
  ");

  $stmt->execute([':bucket' => $bucket, ':bucket2' => $bucket, ':bucket3' => $bucket, ':fmt' => $fmt, ':device' => $deviceId]);
  $rows = $stmt->fetchAll();

  
  $labels = [];
  $values = [];

  foreach ($rows as $r) {
    $labels[] = $r['label'];
    $values[] = round((float)$r['value'], 1);
  }

  
  $statStmt = $pdo->prepare("
    SELECT
      MIN($sensor) AS min_val,
      MAX($sensor) AS max_val,
      ROUND(AVG($sensor), 1) AS avg_val
    FROM sensor_logs
    WHERE created_at >= DATE_SUB(NOW(), INTERVAL {$cfg['interval']})
      AND $sensor IS NOT NULL
      AND (:device2 IS NULL OR device_id = :device2)
  ");
  $statStmt->execute([':device2' => $deviceId]);
  $stats = $statStmt->fetch();

  echo json_encode([
    'success' => true,
    'labels'  => $labels,
    'values'  => $values,
    'stats'   => [
      'min' => $stats['min_val'] !== null ? round((float)$stats['min_val'], 1) : null,
      'max' => $stats['max_val'] !== null ? round((float)$stats['max_val'], 1) : null,
      'avg' => $stats['avg_val'] !== null ? round((float)$stats['avg_val'], 1) : null,
    ],
    'range'   => $range,
    'sensor'  => $sensor,
    'count'   => count($rows),
  ]);

} catch (Exception $e) {
  error_log('sensor_history error: ' . $e->getMessage());
  echo json_encode(['success' => false, 'labels' => [], 'values' => []]);
}
