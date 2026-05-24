<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class DeviceController extends ApiController
{
    public function index(): JsonResponse
    {
        $devices = DB::table('devices')
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn($d) => [
                'device_id'  => $d->device_id,
                'name'       => $d->name,
                'created_at' => $d->created_at,
            ]);

        return $this->ok($devices);
    }

    public function show(string $deviceId): JsonResponse
    {
        $deviceId = $this->sanitizeDeviceId($deviceId);
        if (!$deviceId) return $this->fail('Invalid device ID');

        $device = DB::table('devices')->where('device_id', $deviceId)->first();
        if (!$device) return $this->fail('Device not found', 404);

        $latest = DB::table('sensor_logs')
            ->where('device_id', $deviceId)
            ->orderByDesc('id')
            ->first();

        return $this->ok([
            'device_id'  => $device->device_id,
            'name'       => $device->name,
            'created_at' => $device->created_at,
            'latest'     => $latest ? $this->formatReading($latest) : null,
        ]);
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
