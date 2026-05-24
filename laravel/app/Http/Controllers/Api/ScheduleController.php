<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class ScheduleController extends ApiController
{
    public function index(): JsonResponse
    {
        $schedules = DB::table('schedules')
            ->orderBy('id')
            ->get()
            ->map(fn($s) => $this->formatSchedule($s));

        return $this->ok($schedules);
    }

    public function store(Request $request): JsonResponse
    {
        $validation = $this->validateCreate($request);
        if ($validation) return $this->fail($validation);

        $id = DB::table('schedules')->insertGetId([
            'days'    => $request->input('days'),
            'time'    => $request->input('time'),
            'enabled' => $request->boolean('enabled', true) ? 1 : 0,
        ]);

        $schedule = DB::table('schedules')->find($id);
        return $this->ok($this->formatSchedule($schedule), 201);
    }

    public function update(Request $request, string $id): JsonResponse
    {
        $id = (int) $id;
        if ($id < 1) return $this->fail('Invalid schedule ID');

        $exists = DB::table('schedules')->where('id', $id)->exists();
        if (!$exists) return $this->fail('Schedule not found', 404);

        $validation = $this->validateUpdate($request);
        if ($validation) return $this->fail($validation);

        $updates = [];
        if ($request->has('days'))    $updates['days']    = $request->input('days');
        if ($request->has('time'))    $updates['time']    = $request->input('time');
        if ($request->has('enabled')) $updates['enabled'] = $request->boolean('enabled') ? 1 : 0;

        if (empty($updates)) return $this->fail('Tidak ada field yang diupdate');

        DB::table('schedules')->where('id', $id)->update($updates);
        $schedule = DB::table('schedules')->find($id);

        return $this->ok($this->formatSchedule($schedule));
    }

    public function destroy(string $id): JsonResponse
    {
        $id = (int) $id;
        if ($id < 1) return $this->fail('Invalid schedule ID');

        $exists = DB::table('schedules')->where('id', $id)->exists();
        if (!$exists) return $this->fail('Schedule not found', 404);

        DB::table('schedules')->where('id', $id)->delete();
        return $this->ok(['deleted' => $id]);
    }

    private function formatSchedule(object $s): array
    {
        return [
            'id'      => $s->id,
            'days'    => $s->days,
            'time'    => $s->time,
            'enabled' => (bool) $s->enabled,
        ];
    }

    private function validateCreate(Request $request): ?string
    {
        if (!$request->has('days') || !$request->has('time')) {
            return 'days dan time wajib diisi';
        }
        if (!preg_match('/^\d{2}:\d{2}$/', $request->input('time', ''))) {
            return 'Format time harus HH:MM';
        }
        return null;
    }

    private function validateUpdate(Request $request): ?string
    {
        if ($request->has('time') && !preg_match('/^\d{2}:\d{2}$/', $request->input('time', ''))) {
            return 'Format time harus HH:MM';
        }
        return null;
    }
}
