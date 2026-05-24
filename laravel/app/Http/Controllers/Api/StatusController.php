<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\DB;

class StatusController extends ApiController
{
    public function index(): JsonResponse
    {
        try {
            DB::select('SELECT 1');
            $dbOk = true;
        } catch (\Exception $e) {
            $dbOk = false;
        }

        return $this->ok([
            'status'    => 'ok',
            'timestamp' => now()->toISOString(),
            'db'        => $dbOk ? 'ok' : 'error',
            'version'   => 'laravel/' . app()->version(),
        ]);
    }
}
