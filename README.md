# 🌱 Smart Garden

> Sistem monitoring dan penyiraman tanaman otomatis berbasis IoT — **Kelompok 6**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-kelompok6.my.id-4ade80?style=for-the-badge&logo=globe&logoColor=white)](https://kelompok6.my.id)
[![API](https://img.shields.io/badge/REST%20API-api.kelompok6.my.id-60a5fa?style=for-the-badge&logo=fastapi&logoColor=white)](https://api.kelompok6.my.id/api/status)
[![License](https://img.shields.io/badge/License-Apache%202.0-a78bfa?style=for-the-badge)](LICENSE)

---

## Tentang Projek ini

Smart Garden adalah sistem IoT yang memantau kondisi kebun secara real-time dan mengontrol pompa penyiram tanaman secara otomatis. ESP32 membaca data sensor tanah, suhu, dan kelembaban udara, lalu mengirimkannya ke dashboard web melalui MQTT.

Pengguna bisa memantau sensor, mengontrol pompa, dan mengatur threshold/jadwal siram — semuanya dari browser.

---

## Fitur Utama

| Fitur | Deskripsi |
|-------|-----------|
| 📊 **Real-time Monitoring** | Data sensor langsung dari ESP32 lewat MQTT WebSocket |
| 💧 **Kontrol Pompa** | Nyala/mati manual + mode AUTO berdasarkan kelembaban tanah |
| 📈 **Grafik Historis** | Histori sensor dari 1 jam hingga 1 bulan |
| ⏰ **Jadwal Siram** | Atur hari & jam siram otomatis |
| 🌤️ **Info Cuaca** | Perkiraan cuaca & peluang hujan lewat Open-Meteo |
| 🔧 **OTA Update** | Firmware ESP32 update otomatis tanpa kabel |
| 🤖 **AI Assistant** | Tanya langsung tentang fitur dashboard |

---

## Arsitektur Sistem

```
ESP32 (Firmware)
  ├── DHT11       → Suhu udara & kelembaban
  ├── DS18B20     → Suhu air
  ├── Soil Sensor → Kelembaban tanah
  └── Relay       → Pompa air
       │
       └── MQTT TCP → Mosquitto Broker
                │
                ├── mqttSave.js     → MariaDB (Histori)
                ├── serverStats.js  → CPU/RAM/Disk metrik
                └── React Frontend  → WSS (lewat Cloudflare Tunnel)
```

---

## Tech Stack

**Firmware**
- ESP32 + Arduino IDE
- DHT11, DS18B20, PubSubClient, ArduinoJson, WiFiManager, HTTPUpdate

**Backend**
- Node.js (REST API, MQTT jobs) — pm2
- Laravel (API layer)
- MariaDB
- Mosquitto MQTT Broker

**Frontend**
- React 18 + Vite
- Redux Toolkit
- Chart.js (react-chartjs-2)
- MQTT.js

**Infrastruktur**
- Apache (reverse proxy + SPA serving)
- Cloudflare Tunnel (HTTPS tanpa port forwarding)
- Linux (OS Server)

---

## Struktur Repo

```
smart-garden/
├── firmware/          # Kode Arduino ESP32
├── frontend/          # React SPA (Vite)
│   └── src/
│       ├── pages/     # Dashboard, Settings, Sistem, dll
│       ├── redux/     # State management
│       └── components/
├── backend/           # Node.js REST API + MQTT jobs
├── laravel/           # Laravel API layer
└── database/          # Schema SQL
```

---

## Cara ngejalaninnya

> **Catatan:** Proyek ini butuh setup infrastruktur lengkap sebelum bisa jalan — Apache, MariaDB, Mosquitto, Node.js, PHP, dan pm2 harus diinstall dulu di server. Hardware ESP32 juga harus ada dan di-flash firmwarenya.

### Panduan Syntax (untuk yang baru)

Semua perintah di bawah dijalankan di **Terminal** (Command Prompt / PowerShell di Windows, Terminal di Mac/Linux).

| Perintah | Artinya |
|----------|---------|
| `cd nama-folder` | masuk ke folder |
| `cp file.contoh file.baru` | duplikat file (untuk buat `.env`) |
| `npm install` | download semua package yang dibutuhkan |
| `npm run build` | compile kode frontend jadi file siap pakai |
| `npm run dev` | jalanin server development (untuk testing lokal) |
| `composer install` | download semua package PHP |
| `php artisan ...` | perintah bawaan Laravel |
| `pm2 startOrReload ...` | jalanin/reload proses Node.js di background |

> File `.env` berisi konfigurasi rahasia (password DB, API key, dll) — **jangan di-share atau di-upload ke GitHub**.

---

### Prerequisites
- Node.js + npm → [nodejs.org](https://nodejs.org)
- PHP 8.x + Composer → [php.net](https://php.net) & [getcomposer.org](https://getcomposer.org)
- MariaDB → [mariadb.org](https://mariadb.org)
- Mosquitto MQTT Broker → [mosquitto.org](https://mosquitto.org)
- Apache (dengan mod_proxy)
- pm2 → `npm install -g pm2`

### 1. Clone Repo
```bash
git clone https://github.com/Adri158/smart-garden.git
cd smart-garden
```

### 2. Setup Database
```bash
mysql -u root -p < database/schema.sql
```
Atau import file `database/schema.sql` lewat phpMyAdmin / DBeaver / MySQL Workbench.

### 3. Backend (Node.js)
```bash
cd backend
cp .env.example .env
```
Isi file `.env` dengan kredensial database dan API key kamu, lalu:
```bash
npm install
pm2 startOrReload ecosystem.config.js --update-env
```

### 4. Backend (Laravel)
```bash
cd laravel
composer install
cp .env.example .env
php artisan key:generate
php artisan serve
```

### 5. Frontend
```bash
cd frontend
cp .env.example .env
```
Buka file `.env` yang baru dibuat, isi nilainya sesuai setup kamu, lalu:
```bash
npm install
npm run build
```

---

## Setup Cloudflare Tunnel (Akses Publik)

Cloudflare Tunnel memungkinkan dashboar diakses dari internet tanpa perlu port forwarding atau IP publik.

### 1. Install cloudflared

**Linux (Debian/Ubuntu):**
```bash
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb -o cloudflared.deb
sudo dpkg -i cloudflared.deb
```

**Arch Linux:**
```bash
yay -S cloudflared
```

**Windows / Mac:** download di [developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads](https://developers.cloudflare.com/cloudflare-one/connections/connect-networks/downloads/)

### 2. Login & Buat Tunnel

```bash
cloudflared tunnel login
cloudflared tunnel create smart-garden
```

Setelah buat tunnel, kamu akan dapat **Tunnel ID** — catat, dibutuhkan di langkah berikutnya.

### 3. Buat File Konfigurasi

Buat file `/etc/cloudflared/config.yml`:

```yaml
tunnel: <TUNNEL-ID-KAMU>
credentials-file: /root/.cloudflared/<TUNNEL-ID-KAMU>.json

ingress:
  - hostname: domainkamu.com
    service: http://localhost:80

  - hostname: api.domainkamu.com
    service: http://localhost:3000

  - hostname: mqtt.domainkamu.com
    service: ws://localhost:9002

  - service: http_status:404
```

### 4. Tambah DNS di Cloudflare Dashboard

Buka **Cloudflare Dashboard → DNS → Add Record** untuk setiap subdomain:

| Type | Name | Target |
|------|------|--------|
| CNAME | `@` (atau nama domain) | `<TUNNEL-ID>.cfargotunnel.com` |
| CNAME | `api` | `<TUNNEL-ID>.cfargotunnel.com` |
| CNAME | `mqtt` | `<TUNNEL-ID>.cfargotunnel.com` |

> Pastikan **Proxy status = Proxied** (ikon awan oranye aktif).

### 5. Jalanin sebagai Service

```bash
sudo cloudflared service install
sudo systemctl enable cloudflared
sudo systemctl start cloudflared
```

Cek status:
```bash
sudo systemctl status cloudflared
```

### Subdomain yang Dipakai

| Subdomain | Tujuan | Keterangan |
|-----------|--------|------------|
| `domainkamu.com` | Frontend (React) | Dashboard utama |
| `api.domainkamu.com` | REST API (Node.js :3000) | Endpoint data sensor |
| `mqtt.domainkamu.com` | MQTT WebSocket (:9002) | Koneksi real-time browser |

---

## Topik MQTT

| Topik | Arah | Isi |
|-------|------|-----|
| `smartgarden/{id}/sensor/soil` | ESP → Broker | Kelembaban tanah (%) |
| `smartgarden/{id}/sensor/dht` | ESP → Broker | Suhu udara (°C) |
| `smartgarden/{id}/sensor/hum` | ESP → Broker | Kelembaban udara (%) |
| `smartgarden/{id}/sensor/ds18b20` | ESP → Broker | Suhu air (°C) |
| `smartgarden/{id}/status/relay` | ESP → Broker | `ON` / `OFF` |
| `smartgarden/{id}/status/mode` | ESP → Broker | `AUTO` / `MANUAL` |
| `smartgarden/{id}/control/relay` | Browser → ESP | Toggle pompa |
| `smartgarden/{id}/control/mode` | Browser → ESP | Ganti mode |
| `smartgarden/{id}/config` | Browser → ESP | Threshold (JSON) |
| `smartgarden/{id}/schedules` | Browser → ESP | Jadwal siram (JSON) |

---

## Pengembang

| No | Nama |
|----|------|
| 1 | Untung Adriansyah |

---

## License

[Apache 2.0](LICENSE) © 2025 Kelompok 6
