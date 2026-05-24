<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\JsonResponse;

class DokumentasiController extends ApiController
{
    private string $root;

    public function __construct()
    {
        $this->root = realpath(base_path('../'));
    }

    public function files(): JsonResponse
    {
        $files = array_merge(
            $this->scanImages(),
            $this->scanVideos(),
        );

        usort($files, fn($a, $b) =>
            strcmp($a['type'], $b['type']) ?: strcmp($a['name'], $b['name'])
        );

        return $this->ok($files);
    }

    public function content(string $name): JsonResponse
    {
        $defs = [
            'firmware'   => ['src' => 'ini.ino',                                  'lang' => 'cpp'],
            'dashboard'  => ['src' => 'frontend/src/pages/Dashboard.jsx',         'lang' => 'javascript'],
            'css'        => ['src' => 'frontend/src/styles/dashboard.css',        'lang' => 'css'],
            'api-server' => ['src' => 'laravel/artisan',                          'lang' => 'php'],
            'api-routes' => ['src' => 'laravel/routes/api.php',                   'lang' => 'php'],
            'mqtt-save'  => ['src' => 'backend/src/jobs/mqttSave.js',             'lang' => 'javascript'],
        ];

        if (!isset($defs[$name])) {
            return $this->fail('File tidak ditemukan', 404);
        }

        $path = $this->root . '/' . $defs[$name]['src'];
        if (!file_exists($path)) {
            return $this->fail('File tidak ditemukan', 404);
        }

        return $this->ok(['content' => file_get_contents($path)]);
    }

    private function scanImages(): array
    {
        $dir    = $this->root . '/frontend/public/img/docs';
        $result = [];
        if (!is_dir($dir)) return $result;

        foreach (scandir($dir) as $name) {
            if (!preg_match('/\.(jpe?g|png|gif|webp)$/i', $name)) continue;
            $path = $dir . '/' . $name;
            $stat = stat($path);
            $result[] = [
                'type'  => 'image',
                'name'  => pathinfo($name, PATHINFO_FILENAME),
                'src'   => 'img/docs/' . $name,
                'sizeH' => $this->fmtSize($stat['size']),
                'date'  => $this->fmtDate($stat['mtime']),
                'mtime' => $stat['mtime'],
            ];
        }

        return $result;
    }

    private function scanVideos(): array
    {
        $dir    = $this->root . '/frontend/public/video';
        $result = [];
        if (!is_dir($dir)) return $result;

        foreach (scandir($dir) as $name) {
            if (!preg_match('/\.(mp4|webm|mov)$/i', $name)) continue;
            $path     = $dir . '/' . $name;
            $stat     = stat($path);
            $base     = pathinfo($name, PATHINFO_FILENAME);
            $thumbRel = 'video/thumbs/' . $base . '.jpg';
            $thumbAbs = $dir . '/thumbs/' . $base . '.jpg';
            $result[] = [
                'type'  => 'video',
                'name'  => $base,
                'src'   => 'video/' . $name,
                'thumb' => file_exists($thumbAbs) ? $thumbRel : null,
                'sizeH' => $this->fmtSize($stat['size']),
                'date'  => $this->fmtDate($stat['mtime']),
                'mtime' => $stat['mtime'],
            ];
        }

        return $result;
    }

    private function scanCode(): array
    {
        $defs = [
            ['name' => 'firmware',    'src' => 'ini.ino',                                   'lang' => 'cpp'],
            ['name' => 'dashboard',   'src' => 'frontend/src/pages/Dashboard.jsx',          'lang' => 'javascript'],
            ['name' => 'css',         'src' => 'frontend/src/styles/dashboard.css',         'lang' => 'css'],
            ['name' => 'api-server',  'src' => 'laravel/artisan',                           'lang' => 'php'],
            ['name' => 'api-routes',  'src' => 'laravel/routes/api.php',                    'lang' => 'php'],
            ['name' => 'mqtt-save',   'src' => 'backend/src/jobs/mqttSave.js',              'lang' => 'javascript'],
        ];

        $result = [];
        foreach ($defs as $c) {
            $path = $this->root . '/' . $c['src'];
            if (!file_exists($path)) continue;
            $stat    = stat($path);
            $content  = file_get_contents($path);
            $preview  = implode("\n", array_slice(explode("\n", $content), 0, 9));
            $result[] = [
                'type'    => 'code',
                'name'    => $c['name'],
                'src'     => $c['src'],
                'lang'    => $c['lang'],
                'preview' => $preview,   
                'sizeH'   => $this->fmtSize($stat['size']),
                'date'    => $this->fmtDate($stat['mtime']),
                'mtime'   => $stat['mtime'],
            ];
        }

        return $result;
    }

    private function fmtSize(int $bytes): string
    {
        if ($bytes < 1024)    return $bytes . ' B';
        if ($bytes < 1048576) return round($bytes / 1024, 1) . ' KB';
        return round($bytes / 1048576, 1) . ' MB';
    }

    private function fmtDate(int $ts): string
    {
        $months = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Ags','Sep','Okt','Nov','Des'];
        $d = getdate($ts);
        return sprintf('%02d %s %d', $d['mday'], $months[$d['mon'] - 1], $d['year']);
    }
}
