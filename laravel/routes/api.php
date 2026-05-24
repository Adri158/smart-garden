<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\StatusController;
use App\Http\Controllers\Api\DeviceController;
use App\Http\Controllers\Api\SensorController;
use App\Http\Controllers\Api\SettingsController;
use App\Http\Controllers\Api\ScheduleController;
use App\Http\Controllers\Api\ServerController;
use App\Http\Controllers\Api\ChatController;
use App\Http\Controllers\Api\DokumentasiController;

Route::get('/status', [StatusController::class, 'index']);

Route::get('/devices', [DeviceController::class, 'index']);
Route::get('/devices/{deviceId}', [DeviceController::class, 'show']);

Route::get('/devices/{deviceId}/sensors', [SensorController::class, 'history']);
Route::get('/devices/{deviceId}/sensors/latest', [SensorController::class, 'latest']);
Route::post('/devices/{deviceId}/sensors', [SensorController::class, 'store'])->middleware('api.key');

Route::get('/devices/{deviceId}/settings', [SettingsController::class, 'deviceSettings']);
Route::put('/devices/{deviceId}/settings', [SettingsController::class, 'updateDeviceSettings'])->middleware('api.key');

Route::get('/settings', [SettingsController::class, 'globalSettings']);

Route::get('/schedules', [ScheduleController::class, 'index']);
Route::post('/schedules', [ScheduleController::class, 'store'])->middleware('api.key');
Route::put('/schedules/{id}', [ScheduleController::class, 'update'])->middleware('api.key');
Route::delete('/schedules/{id}', [ScheduleController::class, 'destroy'])->middleware('api.key');

Route::get('/server/stats', [ServerController::class, 'index']);

Route::post('/chat', [ChatController::class, 'chat']);

Route::get('/project-card', function () {
    $row = \Illuminate\Support\Facades\DB::table('sensor_logs')
        ->orderByDesc('id')
        ->first();

    $soil    = $row ? round($row->soil ?? 0)      : '--';
    $temp    = $row ? round($row->temp_dht ?? 0, 1) : '--';
    $hum     = $row ? round($row->humidity ?? 0)  : '--';
    $tempDs  = $row ? round($row->temp_ds ?? 0, 1) : '--';
    $relay   = $row ? ($row->relay ? 'ON' : 'OFF') : '--';
    $mode    = $row ? ($row->mode ?? '--')         : '--';
    $relayC  = ($relay === 'ON') ? '#00ff88' : '#475569';
    $modeC   = ($mode  === 'AUTO') ? '#00d4ff' : '#a855f7';

    $soilW  = is_numeric($soil) ? round(200 * $soil / 100) : 0;
    $humW   = is_numeric($hum)  ? round(200 * $hum  / 100) : 0;

    $ago = '–';
    if ($row && $row->created_at) {
        $diff = now()->diffInMinutes(\Carbon\Carbon::parse($row->created_at));
        $ago  = $diff < 1 ? 'baru saja' : "{$diff} mnt lalu";
    }

    $svg = <<<SVG
<svg xmlns="http://www.w3.org/2000/svg" width="600" height="240">
  <defs>
    <style>
      @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.2} }
      @keyframes soil  { from{width:0} to{width:{$soilW}px} }
      @keyframes hum   { from{width:0} to{width:{$humW}px}  }
      .dot  { animation: pulse 2s ease-in-out infinite; }
      .bars { animation: soil  1.8s .3s cubic-bezier(.4,0,.2,1) both; }
      .barh { animation: hum   1.8s .5s cubic-bezier(.4,0,.2,1) both; }
    </style>
    <filter id="gl"><feGaussianBlur stdDeviation="2.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#0a0a1a"/>
      <stop offset="100%" stop-color="#0c0c22"/>
    </linearGradient>
  </defs>

  <!-- bg -->
  <rect width="600" height="240" rx="14" fill="url(#bg)" stroke="#1e3a5f" stroke-width="1"/>
  <rect width="4" height="240" rx="2" fill="#00d4ff" opacity="0.8"/>

  <!-- header -->
  <text x="20" y="30" font-family="monospace" font-size="16" fill="#00d4ff" font-weight="bold" letter-spacing="1" filter="url(#gl)">🌱 SMART GARDEN</text>
  <circle cx="557" cy="22" r="5" fill="#00ff88" class="dot" filter="url(#gl)"/>
  <text x="567" y="27" font-family="monospace" font-size="10" fill="#00ff88">LIVE</text>
  <line x1="16" y1="42" x2="584" y2="42" stroke="#1e3a5f" stroke-width="1"/>

  <!-- col 1: Tanah -->
  <text x="20" y="68" font-family="monospace" font-size="9" fill="#475569" letter-spacing="1">TANAH</text>
  <text x="20" y="86" font-family="'Courier New',monospace" font-size="20" fill="#00d4ff" font-weight="bold" filter="url(#gl)">{$soil}%</text>
  <rect x="20" y="93" width="200" height="6" rx="3" fill="#0d1117"/>
  <rect x="20" y="93" width="{$soilW}" height="6" rx="3" fill="#00d4ff" class="bars"/>

  <!-- col 2: Suhu Udara -->
  <text x="250" y="68" font-family="monospace" font-size="9" fill="#475569" letter-spacing="1">SUHU UDARA</text>
  <text x="250" y="86" font-family="'Courier New',monospace" font-size="20" fill="#f59e0b" font-weight="bold" filter="url(#gl)">{$temp}°C</text>

  <!-- col 3: Kelembaban -->
  <text x="420" y="68" font-family="monospace" font-size="9" fill="#475569" letter-spacing="1">KELEMBABAN</text>
  <text x="420" y="86" font-family="'Courier New',monospace" font-size="20" fill="#a855f7" font-weight="bold" filter="url(#gl)">{$hum}%</text>
  <rect x="420" y="93" width="160" height="6" rx="3" fill="#0d1117"/>
  <rect x="420" y="93" width="{$humW}" height="6" rx="3" fill="#a855f7" class="barh"/>

  <line x1="16" y1="114" x2="584" y2="114" stroke="#1e3a5f" stroke-width="0.5" stroke-dasharray="4 6"/>

  <!-- col 1: Suhu Air -->
  <text x="20" y="136" font-family="monospace" font-size="9" fill="#475569" letter-spacing="1">SUHU AIR</text>
  <text x="20" y="158" font-family="'Courier New',monospace" font-size="20" fill="#f472b6" font-weight="bold" filter="url(#gl)">{$tempDs}°C</text>

  <!-- col 2: Pompa -->
  <text x="250" y="136" font-family="monospace" font-size="9" fill="#475569" letter-spacing="1">POMPA</text>
  <text x="250" y="158" font-family="'Courier New',monospace" font-size="20" fill="{$relayC}" font-weight="bold" filter="url(#gl)">◉ {$relay}</text>

  <!-- col 3: Mode -->
  <text x="420" y="136" font-family="monospace" font-size="9" fill="#475569" letter-spacing="1">MODE</text>
  <text x="420" y="158" font-family="'Courier New',monospace" font-size="20" fill="{$modeC}" font-weight="bold" filter="url(#gl)">{$mode}</text>

  <!-- footer -->
  <line x1="16" y1="178" x2="584" y2="178" stroke="#1e3a5f" stroke-width="1"/>
  <text x="20" y="198" font-family="monospace" font-size="10" fill="#475569">🔗 kelompok6.my.id</text>
  <text x="20" y="214" font-family="monospace" font-size="9" fill="#1e3a5f">update: {$ago}</text>
  <text x="584" y="198" font-family="monospace" font-size="10" fill="#1e3a5f" text-anchor="end">ESP32 · MQTT · MariaDB</text>
  <text x="584" y="214" font-family="monospace" font-size="9" fill="#1e3a5f" text-anchor="end">Node.js · React · Laravel</text>
</svg>
SVG;

    return response($svg, 200, [
        'Content-Type'  => 'image/svg+xml',
        'Cache-Control' => 'no-cache, no-store, must-revalidate',
        'Pragma'        => 'no-cache',
        'Expires'       => '0',
    ]);
});

Route::get('/dokumentasi/files', [DokumentasiController::class, 'files']);
Route::get('/dokumentasi/content/{name}', [DokumentasiController::class, 'content']);

Route::get('/waktu', function () {
    $now  = \Carbon\Carbon::now('Asia/Makassar');
    $time = $now->format('H:i:s');
    $date = $now->translatedFormat('l, j F Y');

    $svg = <<<SVG
<svg xmlns="http://www.w3.org/2000/svg" width="420" height="56" role="img" aria-label="Waktu Makassar: {$time} WITA">
  <title>Waktu Makassar: {$time} WITA</title>
  <defs>
    <linearGradient id="grad" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#0d1117"/>
      <stop offset="50%" stop-color="#0c1a2e"/>
      <stop offset="100%" stop-color="#0d1117"/>
    </linearGradient>
    <filter id="glow">
      <feGaussianBlur stdDeviation="2.5" result="blur"/>
      <feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge>
    </filter>
    <style>
      @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.25} }
      @keyframes flicker { 0%,100%{opacity:1} 92%{opacity:.9} 94%{opacity:.6} 96%{opacity:1} }
      .dot  { animation: pulse 2s ease-in-out infinite; }
      .time { animation: flicker 4s ease-in-out infinite; }
    </style>
  </defs>

  <!-- background -->
  <rect width="420" height="56" rx="10" fill="url(#grad)"/>
  <rect width="420" height="56" rx="10" fill="none" stroke="#1e3a5f" stroke-width="1"/>

  <!-- left accent bar -->
  <rect width="4" height="56" rx="2" fill="#22d3ee" opacity="0.7"/>

  <!-- top scan line decoration -->
  <line x1="16" y1="14" x2="404" y2="14" stroke="#1e3a5f" stroke-width="0.5" stroke-dasharray="4 6" opacity="0.6"/>
  <line x1="16" y1="42" x2="404" y2="42" stroke="#1e3a5f" stroke-width="0.5" stroke-dasharray="4 6" opacity="0.6"/>

  <!-- live dot -->
  <circle cx="22" cy="28" r="4" fill="#22d3ee" class="dot" filter="url(#glow)"/>

  <!-- label -->
  <text x="36" y="24" font-family="monospace" font-size="9" fill="#64748b" letter-spacing="2" font-weight="bold">MAKASSAR / WITA</text>

  <!-- time -->
  <text x="36" y="40" font-family="'Courier New',monospace" font-size="18" fill="#22d3ee" letter-spacing="3" font-weight="bold" class="time" filter="url(#glow)">{$time}</text>

  <!-- divider -->
  <line x1="230" y1="12" x2="230" y2="44" stroke="#1e3a5f" stroke-width="1"/>

  <!-- date -->
  <text x="244" y="24" font-family="monospace" font-size="9" fill="#475569" letter-spacing="1">TANGGAL</text>
  <text x="244" y="40" font-family="monospace" font-size="11" fill="#94a3b8" letter-spacing="0.5">{$date}</text>
</svg>
SVG;

    return response($svg, 200, [
        'Content-Type'  => 'image/svg+xml',
        'Cache-Control' => 'no-cache, no-store, must-revalidate',
        'Pragma'        => 'no-cache',
        'Expires'       => '0',
    ]);
});

Route::get('/skills', function () {
    $skills = [
        ['name' => 'React',       'pct' => 85, 'color' => '#00d4ff'],
        ['name' => 'Node.js',     'pct' => 80, 'color' => '#00ff88'],
        ['name' => 'Arduino/IoT', 'pct' => 75, 'color' => '#00d4ff'],
        ['name' => 'PHP/Laravel', 'pct' => 70, 'color' => '#a855f7'],
        ['name' => 'Linux',       'pct' => 90, 'color' => '#f59e0b'],
        ['name' => 'C++',         'pct' => 65, 'color' => '#f472b6'],
    ];

    $barW  = 300;
    $rowH  = 42;
    $h     = 48 + count($skills) * $rowH;
    $css   = '';
    $rows  = '';

    foreach ($skills as $i => $s) {
        $delay  = round(0.1 + $i * 0.18, 2);
        $filled = round($barW * $s['pct'] / 100);
        $y      = 40 + $i * $rowH;
        $barY   = $y - 14;

        $css  .= "@keyframes g{$i}{{from{{width:0}}to{{width:{$filled}px}}}}"
               . ".g{$i}{{animation:g{$i} 1.6s {$delay}s cubic-bezier(.4,0,.2,1) both;}}";

        $rows .= "<text x='16' y='{$y}' font-family=\"'Courier New',monospace\" font-size='12' fill='#94a3b8'>{$s['name']}</text>"
               . "<rect x='148' y='{$barY}' width='{$barW}' height='16' rx='4' fill='#0d1117'/>"
               . "<rect x='148' y='{$barY}' width='{$filled}' height='16' rx='4' fill='{$s['color']}' class='g{$i}'/>"
               . "<text x='" . (148 + $barW + 10) . "' y='{$y}' font-family='monospace' font-size='11' fill='{$s['color']}'>{$s['pct']}%</text>";
    }

    $svg = <<<SVG
<svg xmlns="http://www.w3.org/2000/svg" width="490" height="{$h}">
  <defs>
    <style>
      {$css}
    </style>
    <filter id="gl"><feGaussianBlur stdDeviation="2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
  </defs>
  <rect width="490" height="{$h}" rx="12" fill="#0a0a1a" stroke="#1e3a5f" stroke-width="1"/>
  <rect width="4" height="{$h}" rx="2" fill="#a855f7" opacity="0.7"/>
  <text x="16" y="26" font-family="monospace" font-size="10" fill="#475569" letter-spacing="3">◈ SKILL PROFICIENCY</text>
  {$rows}
</svg>
SVG;

    return response($svg, 200, [
        'Content-Type'  => 'image/svg+xml',
        'Cache-Control' => 'no-cache, no-store, must-revalidate',
        'Pragma'        => 'no-cache',
        'Expires'       => '0',
    ]);
});

Route::get('/badge', function () {
    $now    = \Carbon\Carbon::now('Asia/Makassar');
    $uptime = trim(shell_exec("uptime -p") ?: 'up');
    $uptime = preg_replace('/^up /', '', $uptime);

    $svg = <<<SVG
<svg xmlns="http://www.w3.org/2000/svg" width="340" height="56">
  <defs>
    <style>
      @keyframes spin  { to { transform: rotate(360deg); transform-origin: 310px 28px; } }
      @keyframes pulse { 0%,100%{opacity:1} 50%{opacity:.2} }
      @keyframes scan  { 0%{y:0} 100%{y:56px} }
      .ring  { animation: spin  4s linear infinite; }
      .dot   { animation: pulse 1.5s ease-in-out infinite; }
    </style>
    <filter id="gl"><feGaussianBlur stdDeviation="2.5" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#0a0a1a"/>
      <stop offset="100%" stop-color="#0d1130"/>
    </linearGradient>
  </defs>
  <rect width="340" height="56" rx="10" fill="url(#bg)" stroke="#00ff88" stroke-width="1" stroke-opacity="0.4"/>
  <rect width="4" height="56" rx="2" fill="#00ff88" opacity="0.8"/>
  <circle cx="22" cy="28" r="5" fill="#00ff88" class="dot" filter="url(#gl)"/>
  <text x="36" y="23" font-family="monospace" font-size="9" fill="#475569" letter-spacing="2">SERVER STATUS</text>
  <text x="36" y="40" font-family="monospace" font-size="13" fill="#00ff88" letter-spacing="1" font-weight="bold" filter="url(#gl)">◉  ONLINE</text>
  <line x1="190" y1="12" x2="190" y2="44" stroke="#1e3a5f" stroke-width="1"/>
  <text x="202" y="23" font-family="monospace" font-size="9" fill="#475569" letter-spacing="1">UPTIME</text>
  <text x="202" y="40" font-family="monospace" font-size="11" fill="#94a3b8">{$uptime}</text>
</svg>
SVG;

    return response($svg, 200, [
        'Content-Type'  => 'image/svg+xml',
        'Cache-Control' => 'no-cache, no-store, must-revalidate',
        'Pragma'        => 'no-cache',
        'Expires'       => '0',
    ]);
});
