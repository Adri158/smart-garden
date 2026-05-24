<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SensorController extends ApiController
{
    private const RANGE_CONFIG = [
        '1h'  => ['interval' => '1 HOUR',  'bucket' => 300,   'labelFmt' => '%H:%i'],
        '6h'  => ['interval' => '6 HOUR',  'bucket' => 1800,  'labelFmt' => '%H:%i'],
        '24h' => ['interval' => '24 HOUR', 'bucket' => 3600,  'labelFmt' => '%H:00'],
        '1w'  => ['interval' => '7 DAY',   'bucket' => 21600, 'labelFmt' => '%d/%m %H:00'],
        '1m'  => ['interval' => '30 DAY',  'bucket' => 86400, 'labelFmt' => '%d/%m'],
    ];

    private const ALLOWED_SENSORS = ['soil', 'temp_dht', 'temp_ds', 'humidity'];

    public function history(Request $request, string $deviceId): JsonResponse
    {
        $deviceId = $this->sanitizeDeviceId($deviceId);
        if (!$deviceId) return $this->fail('Invalid device ID');

        $range  = array_key_exists($request->query('range', ''), self::RANGE_CONFIG)
                    ? $request->query('range')
                    : '1h';
        $sensor = in_array($request->query('sensor', ''), self::ALLOWED_SENSORS)
                    ? $request->query('sensor')
                    : 'soil';

        $cfg    = self::RANGE_CONFIG[$range];
        $bucket = $cfg['bucket'];
        $fmt    = $cfg['labelFmt'];
        $intv   = $cfg['interval'];

        $rows = DB::select(
            "SELECT
               DATE_FORMAT(
                 FROM_UNIXTIME(FLOOR(UNIX_TIMESTAMP(created_at) / ?) * ?),
                 ?
               )               AS label,
               AVG(`{$sensor}`) AS value,
               FLOOR(UNIX_TIMESTAMP(created_at) / ?) AS bucket_key
             FROM sensor_logs
             WHERE created_at >= DATE_SUB(NOW(), INTERVAL {$intv})
               AND `{$sensor}` IS NOT NULL
               AND device_id = ?
             GROUP BY bucket_key
             ORDER BY bucket_key ASC",
            [$bucket, $bucket, $fmt, $bucket, $deviceId]
        );

        $stats = DB::selectOne(
            "SELECT
               MIN(`{$sensor}`)           AS min_val,
               MAX(`{$sensor}`)           AS max_val,
               ROUND(AVG(`{$sensor}`), 1) AS avg_val
             FROM sensor_logs
             WHERE created_at >= DATE_SUB(NOW(), INTERVAL {$intv})
               AND `{$sensor}` IS NOT NULL
               AND device_id = ?",
            [$deviceId]
        );

        $labels = array_column($rows, 'label');
        $values = array_map(
            fn($r) => $r->value !== null ? round((float) $r->value, 1) : null,
            $rows
        );

        return $this->ok([
            'labels' => $labels,
            'values' => $values,
            'stats'  => [
                'min' => $stats->min_val !== null ? round((float) $stats->min_val, 1) : null,
                'max' => $stats->max_val !== null ? round((float) $stats->max_val, 1) : null,
                'avg' => $stats->avg_val !== null ? round((float) $stats->avg_val, 1) : null,
            ],
            'range'  => $range,
            'sensor' => $sensor,
            'count'  => count($rows),
        ]);
    }

    public function latest(Request $request, string $deviceId): JsonResponse
    {
        $deviceId = $this->sanitizeDeviceId($deviceId);
        if (!$deviceId) return $this->fail('Invalid device ID');

        $row = DB::table('sensor_logs')
            ->where('device_id', $deviceId)
            ->orderByDesc('id')
            ->first();

        if (!$row) return $this->fail('No sensor data found for this device', 404);

        return $this->ok($this->formatReading($row));
    }

    public function store(Request $request, string $deviceId): JsonResponse
    {
        $deviceId = $this->sanitizeDeviceId($deviceId);
        if (!$deviceId) return $this->fail('Invalid device ID');

        $body = $request->only(['soil', 'temp_dht', 'temp_ds', 'humidity', 'relay', 'mode']);
        if (empty($body)) return $this->fail('Minimal satu field sensor harus diisi');

        DB::table('devices')->insertOrIgnore([
            'device_id'  => $deviceId,
            'created_at' => now(),
        ]);

        DB::table('sensor_logs')->insert([
            'device_id' => $deviceId,
            'soil'      => $body['soil']     ?? null,
            'temp_dht'  => $body['temp_dht'] ?? null,
            'temp_ds'   => $body['temp_ds']  ?? null,
            'humidity'  => $body['humidity'] ?? null,
            'relay'     => isset($body['relay']) ? (int) $body['relay'] : null,
            'mode'      => $body['mode']     ?? null,
            'created_at'=> now(),
        ]);

        $id = DB::getPdo()->lastInsertId();

        DB::table('sensor_logs')
            ->where('device_id', $deviceId)
            ->where('created_at', '<', now()->subMonth())
            ->delete();

        return $this->ok(['id' => (int) $id], 201);
    }

    private function sanitizeDeviceId(string $id): string
    {
        return preg_replace('/[^a-z0-9\-]/', '', strtolower($id));
    }

    private function formatReading(object $row): array
    {
        return [
            'id'         => $row->id,
            'device_id'  => $row->device_id,
            'soil'       => $row->soil !== null ? (float) $row->soil : null,
            'temp_dht'   => $row->temp_dht !== null ? (float) $row->temp_dht : null,
            'temp_ds'    => $row->temp_ds !== null ? (float) $row->temp_ds : null,
            'humidity'   => $row->humidity !== null ? (float) $row->humidity : null,
            'relay'      => $row->relay !== null ? ($row->relay ? 'ON' : 'OFF') : null,
            'mode'       => $row->mode,
            'created_at' => $row->created_at,
        ];
    }
}
