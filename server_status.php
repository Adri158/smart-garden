<?php
header('Content-Type: application/json');

$stat1 = file('/proc/stat')[0];
usleep(300000);
$stat2 = file('/proc/stat')[0];

$c1 = array_slice(preg_split('/\s+/', trim($stat1)), 1);
$c2 = array_slice(preg_split('/\s+/', trim($stat2)), 1);

$idle1  = (int)$c1[3]; $total1 = array_sum(array_map('intval', $c1));
$idle2  = (int)$c2[3]; $total2 = array_sum(array_map('intval', $c2));
$cpu    = round((1 - ($idle2 - $idle1) / ($total2 - $total1)) * 100);

$mem = [];
foreach (file('/proc/meminfo') as $line) {
    [$k, $v] = explode(':', $line, 2);
    $mem[trim($k)] = (int)trim($v);
}
$ram_total = round($mem['MemTotal'] / 1024);
$ram_free  = round(($mem['MemAvailable']) / 1024);
$ram_used  = $ram_total - $ram_free;
$ram_pct   = round($ram_used / $ram_total * 100);

$disk_total = round(disk_total_space('/') / 1024 / 1024);
$disk_free  = round(disk_free_space('/')  / 1024 / 1024);
$disk_used  = $disk_total - $disk_free;
$disk_pct   = round($disk_used / $disk_total * 100);

$uptime = (int)explode(' ', file_get_contents('/proc/uptime'))[0];

$load = sys_getloadavg();

$uname  = posix_uname();
$kernel = $uname['release'];
$cpu_model = '';
foreach (file('/proc/cpuinfo') as $line) {
    if (str_starts_with($line, 'model name')) {
        $cpu_model = trim(explode(':', $line, 2)[1]);
        break;
    }
}
$cores = substr_count(file_get_contents('/proc/cpuinfo'), 'processor');

echo json_encode([
    'cpu_pct'    => $cpu,
    'load'       => array_map(fn($v) => round($v, 2), $load),
    'ram_pct'    => $ram_pct,
    'ram_used'   => $ram_used,
    'ram_total'  => $ram_total,
    'disk_pct'   => $disk_pct,
    'disk_used'  => $disk_used,
    'disk_total' => $disk_total,
    'uptime_sec' => $uptime,
    'hostname'   => gethostname(),
    'os'         => 'Arch Linux',
    'kernel'     => $kernel,
    'cpu_model'  => $cpu_model,
    'cores'      => $cores,
]);
