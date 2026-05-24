<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\JsonResponse;

class ServerController extends ApiController
{
    public function index(): JsonResponse
    {
        return $this->ok($this->gatherStats());
    }

    private function gatherStats(): array
    {

        $cpu = $this->getCpuUsage();


        $mem = $this->getMemInfo();


        $disk = $this->getDiskInfo();


        $uptimeRaw = file_exists('/proc/uptime')
            ? (float) explode(' ', file_get_contents('/proc/uptime'))[0]
            : 0;


        $loadRaw  = file_exists('/proc/loadavg') ? explode(' ', file_get_contents('/proc/loadavg')) : [];
        $loadAvg  = array_map('floatval', array_slice($loadRaw, 0, 3));


        $hostname  = gethostname() ?: '—';
        $os = 'Arch Linux';
        $kernelRaw = @file_get_contents('/proc/version') ?: '';
        preg_match('/Linux version (\S+)/', $kernelRaw, $m);
        $kernel = $m[1] ?? trim(shell_exec('uname -r') ?: '—');
        $cpuModel  = '—';
        if (file_exists('/proc/cpuinfo')) {
            foreach (file('/proc/cpuinfo') as $line) {
                if (str_starts_with($line, 'model name')) {
                    $cpuModel = trim(explode(':', $line, 2)[1] ?? '—');
                    break;
                }
            }
        }

        return [
            'cpu'      => ['percent' => $cpu['usage'], 'cores' => $cpu['cores'], 'model' => $cpuModel],
            'memory'   => [
                'used_bytes'  => $mem['used'],
                'total_bytes' => $mem['total'],
                'percent'     => $mem['usage'],
            ],
            'disk'     => [
                'used_bytes'  => $disk['used'],
                'total_bytes' => $disk['total'],
                'percent'     => $disk['usage'],
            ],
            'uptime'   => ['seconds' => (int) $uptimeRaw],
            'load_avg' => $loadAvg,
            'hostname' => $hostname,
            'os'       => $os,
            'kernel'   => $kernel,
            'cpu_model'=> $cpuModel,
            'cores'    => $cpu['cores'],
        ];
    }

    private function getCpuUsage(): array
    {
        if (!file_exists('/proc/stat')) {
            return ['usage' => 0, 'cores' => 1];
        }


        $stat1 = $this->parseCpuStat();
        usleep(200000); 
        $stat2 = $this->parseCpuStat();

        $idle1  = $stat1['idle']  + $stat1['iowait'];
        $total1 = array_sum($stat1);
        $idle2  = $stat2['idle']  + $stat2['iowait'];
        $total2 = array_sum($stat2);

        $deltaIdle  = $idle2 - $idle1;
        $deltaTotal = $total2 - $total1;

        $usage = $deltaTotal > 0 ? round((1 - $deltaIdle / $deltaTotal) * 100, 1) : 0;

        return [
            'usage' => $usage,
            'cores' => (int) shell_exec('nproc') ?: 1,
        ];
    }

    private function parseCpuStat(): array
    {
        $line   = explode("\n", file_get_contents('/proc/stat'))[0];
        $parts  = preg_split('/\s+/', trim($line));

        return [
            'user'    => (int) ($parts[1] ?? 0),
            'nice'    => (int) ($parts[2] ?? 0),
            'system'  => (int) ($parts[3] ?? 0),
            'idle'    => (int) ($parts[4] ?? 0),
            'iowait'  => (int) ($parts[5] ?? 0),
            'irq'     => (int) ($parts[6] ?? 0),
            'softirq' => (int) ($parts[7] ?? 0),
            'steal'   => (int) ($parts[8] ?? 0),
        ];
    }

    private function getMemInfo(): array
    {
        if (!file_exists('/proc/meminfo')) {
            return ['total' => 0, 'used' => 0, 'free' => 0, 'usage' => 0];
        }

        $info    = [];
        $lines   = file('/proc/meminfo', FILE_IGNORE_NEW_LINES);
        foreach ($lines as $line) {
            [$key, $val] = explode(':', $line, 2);
            $info[trim($key)] = (int) trim(str_replace(' kB', '', $val));
        }

        $total    = $info['MemTotal'] ?? 0;
        $free     = $info['MemFree'] ?? 0;
        $buffers  = $info['Buffers'] ?? 0;
        $cached   = $info['Cached'] ?? 0;
        $available= $info['MemAvailable'] ?? ($free + $buffers + $cached);
        $used     = $total - $available;

        return [
            'total' => $total * 1024,           
            'used'  => $used * 1024,
            'free'  => $available * 1024,
            'usage' => $total > 0 ? round($used / $total * 100, 1) : 0,
        ];
    }

    private function getDiskInfo(): array
    {
        $total = disk_total_space('/');
        $free  = disk_free_space('/');
        $used  = $total - $free;

        return [
            'total' => $total,
            'used'  => $used,
            'free'  => $free,
            'usage' => $total > 0 ? round($used / $total * 100, 1) : 0,
        ];
    }
}
