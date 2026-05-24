<?php

namespace App\Http\Controllers\Api;

use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ChatController extends ApiController
{
    private const RATE_LIMIT_MAX    = 20;
    private const RATE_LIMIT_WINDOW = 60;

    private const SYSTEM = "Kamu adalah asisten di Smart Garden Dashboard — sistem IoT monitoring dan kontrol kebun otomatis.\n\nSistem terdiri dari:\n- ESP32: sensor DHT11 (suhu/kelembaban udara), DS18B20 (suhu air), kelembaban tanah (ADC), relay pompa\n- MQTT broker Mosquitto untuk komunikasi real-time\n- Laravel REST API + MariaDB untuk penyimpanan histori sensor\n- React frontend dengan monitoring real-time via MQTT WebSocket\n\nCara menjawab:\n- Santai, pakai bahasa Indonesia\n- Jawab MAKSIMAL 4 baris, langsung ke inti, no basa-basi\n- Fokus membantu user memahami halaman yang sedang mereka buka";

    private const PAGE_CTX = [
        'dashboard'     => 'User di halaman Dashboard: monitor sensor real-time (soil, suhu, kelembaban), kontrol pompa & mode AUTO/MANUAL, grafik historis, info cuaca.',
        'settings'      => 'User di halaman Pengaturan: atur threshold kelembaban tanah, jadwal penyiraman otomatis, nama device.',
        'sistem'        => 'User di halaman Sistem: pantau CPU/RAM/disk server, status layanan (MQTT, DB, API).',
        'feedback'      => 'User di halaman Feedback: kirim masukan/saran tentang Smart Garden.',
        'feedback/list' => 'User di halaman Daftar Feedback: lihat semua feedback yang masuk.',
        'dokumentasi'   => 'User di halaman Dokumentasi: foto dan video dokumentasi proyek.',
        'panduan'       => 'User di halaman Panduan: tutorial penggunaan Smart Garden step-by-step.',
        'tentang'       => 'User di halaman Tentang: info proyek & tim Kelompok 6.',
    ];

    public function chat(Request $request): StreamedResponse|\Illuminate\Http\JsonResponse
    {
        $ip = explode(',', $request->header('CF-Connecting-IP')
            ?? $request->header('X-Forwarded-For')
            ?? $request->ip())[0];

        if (!$this->checkRate(trim($ip))) {
            return $this->fail('Rate limit. Coba lagi sebentar.', 429);
        }

        $messages = $request->input('messages', []);
        $page     = $request->input('page', '');

        if (!is_array($messages) || empty($messages)) {
            return $this->fail('messages wajib diisi');
        }

        $apiKey = env('OPENAI_API_KEY');
        if (!$apiKey) {
            return $this->fail('Chat tidak tersedia', 503);
        }

        $pageKey       = ltrim($page, '/');
        $pageCtx       = self::PAGE_CTX[$pageKey] ?? '';
        $systemContent = self::SYSTEM . ($pageCtx ? "\n\n{$pageCtx}" : '');

        $body = json_encode([
            'model'      => 'gpt-4o-mini',
            'messages'   => array_merge(
                [['role' => 'system', 'content' => $systemContent]],
                array_slice($messages, -20)
            ),
            'max_tokens' => 200,
            'stream'     => true,
        ]);

        return new StreamedResponse(function () use ($body, $apiKey) {
            while (ob_get_level()) ob_end_flush();

            $ctx = stream_context_create(['http' => [
                'method'        => 'POST',
                'header'        => "Content-Type: application/json\r\nAuthorization: Bearer {$apiKey}\r\n",
                'content'       => $body,
                'ignore_errors' => true,
                'timeout'       => 60,
            ]]);

            $stream = @fopen('https://api.openai.com/v1/chat/completions', 'r', false, $ctx);
            if (!$stream) {
                echo 'data: ' . json_encode(['error' => 'Gagal konek']) . "\n\n";
                flush();
                return;
            }

            $buf = '';
            while (!feof($stream)) {
                $chunk = fread($stream, 4096);
                if ($chunk === false || $chunk === '') continue;
                $buf .= $chunk;
                while (($pos = strpos($buf, "\n")) !== false) {
                    $line = rtrim(substr($buf, 0, $pos));
                    $buf  = substr($buf, $pos + 1);
                    if (!str_starts_with($line, 'data: ')) continue;
                    $d = substr($line, 6);
                    if ($d === '[DONE]') { echo "data: [DONE]\n\n"; flush(); continue; }
                    $content = json_decode($d, true)['choices'][0]['delta']['content'] ?? null;
                    if ($content !== null) {
                        echo 'data: ' . json_encode(['content' => $content]) . "\n\n";
                        flush();
                    }
                }
            }
            fclose($stream);
        }, 200, [
            'Content-Type'      => 'text/event-stream',
            'Cache-Control'     => 'no-cache',
            'X-Accel-Buffering' => 'no',
            'Connection'        => 'keep-alive',
        ]);
    }

    private function checkRate(string $ip): bool
    {
        $key = 'chat_rate_' . md5($ip);
        $now = time();
        if (function_exists('apcu_fetch')) {
            $hits = array_filter(apcu_fetch($key) ?: [], fn($t) => $now - $t < self::RATE_LIMIT_WINDOW);
            if (count($hits) >= self::RATE_LIMIT_MAX) return false;
            apcu_store($key, array_values([...$hits, $now]), self::RATE_LIMIT_WINDOW + 5);
        }
        return true;
    }
}
