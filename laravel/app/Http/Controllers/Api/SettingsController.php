<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class SettingsController extends ApiController
{
    private const ALLOWED_KEYS = ['soil_min', 'soil_max', 'temp_max', 'hum_min', 'publish_interval'];

    public function globalSettings(): JsonResponse
    {
        $rows = DB::table('settings')->get();
        $data = [];
        foreach ($rows as $row) {
            $data[$row->key_name] = is_numeric($row->value) ? (float) $row->value : $row->value;
        }
        return $this->ok($data);
    }

    public function deviceSettings(Request $request, string $deviceId): JsonResponse
    {
        $deviceId = $this->sanitizeDeviceId($deviceId);
        if (!$deviceId) return $this->fail('Invalid device ID');

        $globals = DB::table('settings')->get()->pluck('value', 'key_name')->toArray();

        $overrides = DB::table('device_settings')
            ->where('device_id', $deviceId)
            ->get()
            ->pluck('value', 'key_name')
            ->toArray();

        $merged = array_merge($globals, $overrides);
        $data   = [];
        foreach ($merged as $key => $val) {
            $data[$key] = is_numeric($val) ? (float) $val : $val;
        }

        return $this->ok($data);
    }

    public function updateDeviceSettings(Request $request, string $deviceId): JsonResponse
    {
        $deviceId = $this->sanitizeDeviceId($deviceId);
        if (!$deviceId) return $this->fail('Invalid device ID');

        $body = $request->only(self::ALLOWED_KEYS);
        if (empty($body)) {
            return $this->fail('No valid settings keys provided. Allowed: ' . implode(', ', self::ALLOWED_KEYS));
        }

        foreach ($body as $key => $value) {
            DB::table('device_settings')->upsert(
                ['device_id' => $deviceId, 'key_name' => $key, 'value' => (string) $value],
                ['device_id', 'key_name'],
                ['value']
            );
        }


        return $this->deviceSettings($request, $deviceId);
    }

    private function sanitizeDeviceId(string $id): string
    {
        return preg_replace('/[^a-z0-9\-]/', '', strtolower($id));
    }
}
