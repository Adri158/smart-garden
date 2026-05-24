# Smart Garden

> Sistem monitoring dan penyiraman tanaman otomatis berbasis IoT — **Kelompok 6**

[![Live](https://img.shields.io/badge/🌐%20Live-kelompok6.my.id-4ade80?style=for-the-badge&logo=globe&logoColor=white)](https://kelompok6.my.id)
[![API](https://img.shields.io/badge/REST%20API-api.kelompok6.my.id-60a5fa?style=for-the-badge&logo=fastapi&logoColor=white)](https://api.kelompok6.my.id/api/status)
[![License](https://img.shields.io/badge/License-Apache%202.0-a78bfa?style=for-the-badge)](LICENSE)

---

## Tentang Projek ini

Smart Garden adalah sistem IoT yang memantau kondisi kebun secara real-time dan mengontrol pompa penyiram tanaman secara otomatis. ESP32 membaca data sensor tanah, suhu, dan kelembaban udara, lalu mengirimkannya ke dashboard web melalui MQTT.

Pengguna bisa memantau sensor, mengontrol pompa, dan mengatur threshold/jadwal siram — semuanya dari browser.

> Versi ringan berbasis PHP murni tersedia di branch **[lite](https://github.com/Adri158/smart-garden/tree/lite)** — tanpa Node.js, tanpa build step, cukup PHP + MariaDB.

---

## Full vs Lite

| | Full (branch main) | Lite (branch lite) |
|--|:--:|:--:|
| **Tech stack** | React + Node.js + Laravel | PHP murni |
| **Build step** | `npm run build` | Tidak perlu |
| **Install** | 10+ langkah | Ekstrak + isi `.env` |
| **Dashboard real-time** | ✅ | ✅ |
| **Kontrol pompa** | ✅ | ✅ |
| **Grafik historis** | ✅ | ✅ |
| **Jadwal siram** | ✅ | ✅ |
| **Info cuaca** | ✅ | ✅ |
| **Admin panel** | ✅ | ✅ |
| **Panduan** | ✅ | ✅ |
| **Feedback pengguna** | ✅ | ❌ |
| **Dokumentasi projek** | ✅ | ❌ |
| **Halaman Tentang** | ✅ | ❌ |
| **Landing page** | ✅ | ❌ |
| **PWA (installable)** | ✅ | ❌ |
| **AI Assistant** | ✅ | ❌ |
| **OTA firmware update** | ✅ | ❌ |
| **REST API** | ✅ | ❌ |

> **Buat projek sekolah/kampus**: versi Full cocok karena ada halaman **Feedback** (pengguna bisa kasih penilaian & komentar) dan **Dokumentasi** (foto/video dokumentasi projek) — nilai plus buat presentasi.  
> Kalau cuma butuh monitoring sensor cepat tanpa setup ribet, pakai **Lite**.

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
                ├── mqttSave.js     → MariaDB (histori sensor)
                ├── serverStats.js  → CPU/RAM/Disk metrik
                └── React Frontend  → WSS (lewat Cloudflare Tunnel)
```

---

## Tech Stack

**Firmware**
- ESP32 + Arduino IDE
- DHT11, DS18B20, PubSubClient, ArduinoJson, WiFiManager, HTTPUpdate

**Backend**
- Laravel (REST API + Admin Panel) — port 8000 via pm2
- Node.js (MQTT jobs: mqttSave, serverStats) — via pm2
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
├── firmware/          # Kode Arduino ESP32 (firmware.ino)
├── frontend/          # React SPA (Vite)
│   └── src/
│       ├── pages/     # Dashboard, Settings, Sistem, dll
│       ├── redux/     # State management
│       └── components/
├── backend/           # Node.js MQTT jobs (mqttSave, serverStats)
├── laravel/           # Laravel REST API + Admin Panel
└── database/          # Schema SQL (schema.sql)
```

---

## Download / Clone

**Rekomendasi: clone via Git** — bisa pull update terbaru kapanpun.

```bash
git clone https://github.com/Adri158/smart-garden.git
cd smart-garden
```

Atau download ZIP dari halaman [**Releases**](https://github.com/Adri158/smart-garden/releases).

---

## Install

Lihat panduan instalasi lengkap per sistem operasi di **[INSTALL.md](INSTALL.md)**.

Ringkasan langkah:

1. Install prerequisites (Node.js, PHP, Composer, MariaDB, Mosquitto)
2. Clone repo
3. Buat database `smartgarden`, import `database/schema.sql`
4. Copy & isi `.env` (root + `laravel/` + `frontend/`)
5. Setup backend Node.js + Laravel via pm2
6. Build frontend React
7. Konfigurasi Apache
8. (Opsional) Flash firmware ke ESP32

---

## Variabel .env

**Root `.env`** (dibaca Node.js backend & laravel via config):

```env
DB_HOST=127.0.0.1
DB_NAME=smartgarden
DB_USER=root
DB_PASS=

ADMIN_USER=admin
ADMIN_PASS=ganti_ini

API_KEY=random_string_panjang

OPENAI_API_KEY=sk-...
```

**`laravel/.env`** (copy dari `laravel/.env.example`):

```env
APP_URL=http://localhost:8000
DB_HOST=127.0.0.1
DB_DATABASE=smartgarden
DB_USERNAME=root
DB_PASSWORD=
API_KEY=sama_dengan_root_env
```

**`frontend/.env`** (copy dari `frontend/.env.example`):

```env
VITE_APP_URL=http://localhost
VITE_MQTT_URL=ws://localhost:9002
VITE_API_BASE=
VITE_API_KEY=sama_dengan_root_env
```

---

## Jalankan Services

Setelah setup, semua service dijalankan via pm2:

```bash
# Backend (dari root folder smart-garden)
pm2 startOrReload backend/ecosystem.config.js --update-env
pm2 save
pm2 startup
```

Ecosystem menjalankan 3 proses:
- `mqtt-save` — menyimpan data sensor dari MQTT ke MariaDB
- `server-stats` — memantau CPU/RAM/disk lalu publish ke MQTT
- `laravel-api` — Laravel REST API + Admin Panel (port 8000)

Cek status:

```bash
pm2 status
pm2 logs [nama-proses]
```

---

## Apache Config

Buat file virtual host (misal `/etc/httpd/conf/conf.d/smart-garden.conf`):

```apache
<VirtualHost *:80>
    DocumentRoot /path/ke/smart-garden/frontend/dist

    <Directory /path/ke/smart-garden/frontend/dist>
        AllowOverride All
        Require all granted
        RewriteEngine On
        RewriteCond %{REQUEST_FILENAME} !-f
        RewriteRule ^ /index.html [L]
    </Directory>

    ProxyPreserveHost On
    ProxyPass /api http://localhost:8000/api
    ProxyPassReverse /api http://localhost:8000/api
    ProxyPass /admin http://localhost:8000/admin
    ProxyPassReverse /admin http://localhost:8000/admin
</VirtualHost>
```

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

## Akses Publik via Cloudflare Tunnel

> Buat dashboard bisa diakses dari internet tanpa port forwarding atau IP publik.  
> Butuh domain yang sudah di-manage di Cloudflare.

### 1 — Install cloudflared

**Windows:**
```cmd
winget install --id Cloudflare.cloudflared
```

**Ubuntu/Debian:**
```bash
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb -o cloudflared.deb
sudo dpkg -i cloudflared.deb
```

**Arch/Manjaro:**
```bash
yay -S cloudflared
```

**macOS:**
```bash
brew install cloudflared
```

---

### 2 — Login & Buat Tunnel

```bash
cloudflared tunnel login
cloudflared tunnel create smart-garden
```

Catat **Tunnel ID** yang muncul.

---

### 3 — Konfigurasi Tunnel

| OS | Path Config |
|----|-------------|
| Windows | `C:\Users\<user>\.cloudflared\config.yml` |
| Linux | `/etc/cloudflared/config.yml` |
| macOS | `~/.cloudflared/config.yml` |

```yaml
tunnel: <TUNNEL-ID-KAMU>
credentials-file: /path/ke/<TUNNEL-ID-KAMU>.json

ingress:
  - hostname: domainkamu.com
    service: http://localhost:80

  - hostname: api.domainkamu.com
    service: http://localhost:8000

  - hostname: mqtt.domainkamu.com
    service: ws://localhost:9002

  - service: http_status:404
```

---

### 4 — DNS di Cloudflare Dashboard

**DNS → Add Record:**

| Type | Name | Target |
|------|------|--------|
| CNAME | `@` | `<TUNNEL-ID>.cfargotunnel.com` |
| CNAME | `api` | `<TUNNEL-ID>.cfargotunnel.com` |
| CNAME | `mqtt` | `<TUNNEL-ID>.cfargotunnel.com` |

Pastikan **Proxy status = Proxied** (ikon awan oranye).

---

### 5 — Jalankan sebagai Service

**Windows:**
```cmd
cloudflared service install
```

**Linux:**
```bash
sudo cloudflared service install
sudo systemctl enable --now cloudflared
```

**macOS:**
```bash
sudo cloudflared service install
```

---

### 6 — Update frontend/.env untuk Domain Publik

```env
VITE_APP_URL=https://domainkamu.com
VITE_MQTT_URL=wss://mqtt.domainkamu.com
```

Lalu rebuild:
```bash
cd frontend && npm run build
```

---

## Dukung Projek Ini

Kalau projek ini berguna buat kamu, atau sekadar pengen support, bantuan kecil ini sangat berarti:

<div align="center">

[![Star](https://img.shields.io/badge/⭐%20Kasih%20Star-Gratis%20kok!-f59e0b?style=for-the-badge)](https://github.com/Adri158/smart-garden/stargazers)
[![Fork](https://img.shields.io/badge/🍴%20Fork%20Repo-Modif%20bebas-4ade80?style=for-the-badge)](https://github.com/Adri158/smart-garden/fork)
[![Issues](https://img.shields.io/badge/🐛%20Laporin%20Bug-Buka%20Issue-60a5fa?style=for-the-badge)](https://github.com/Adri158/smart-garden/issues/new?template=bug_report.md&labels=bug)
[![Pull Request](https://img.shields.io/badge/💡%20Contribute%20Fitur-Buka%20PR-a78bfa?style=for-the-badge)](https://github.com/Adri158/smart-garden/compare)

</div>

> **⭐ Star** — bantu projek ini makin keliatan di GitHub search  
> **🍴 Fork** — pengen modif buat projek sendiri? fork aja, bebas!  
> **🐛 Issue** — nemuin bug? langsung buka [Issues](https://github.com/Adri158/smart-garden/issues)  
> **💡 PR** — mau nambahin fitur? fork → implement → buka Pull Request

---

## Kontak

Mau request fitur, tanya-tanya, atau cuman nyapa? Kontak gw:

<div align="center">

[![Instagram](https://img.shields.io/badge/Instagram-E4405F?style=for-the-badge&logo=instagram&logoColor=white)](https://instagram.com/seekor_rin)
[![TikTok](https://img.shields.io/badge/TikTok-000000?style=for-the-badge&logo=tiktok&logoColor=white)](https://tiktok.com/@seekor_rin)
[![WhatsApp](https://img.shields.io/badge/WhatsApp-25D366?style=for-the-badge&logo=whatsapp&logoColor=white)](https://wa.me/62895419694709)

</div>

---

## Lisensi

<div align="center">

[![License](https://img.shields.io/badge/Apache%202.0-Open%20Source-4ade80?style=for-the-badge&logo=apache&logoColor=white)](LICENSE)

</div>

<details>
<summary><b>Klik untuk lihat hak &amp; ketentuan lengkap</b></summary>

<br>

**Boleh:**

![](https://img.shields.io/badge/✅_Penggunaan_Komersial-diizinkan-4ade80?style=flat-square)
![](https://img.shields.io/badge/✅_Modifikasi_Bebas-diizinkan-4ade80?style=flat-square)
![](https://img.shields.io/badge/✅_Distribusi_Ulang-diizinkan-4ade80?style=flat-square)
![](https://img.shields.io/badge/✅_Penggunaan_Private-diizinkan-4ade80?style=flat-square)
![](https://img.shields.io/badge/✅_Pakai_Patent-diizinkan-4ade80?style=flat-square)

**Harus:**

![](https://img.shields.io/badge/⚠️_Sertakan_License_Notice-wajib-f59e0b?style=flat-square)
![](https://img.shields.io/badge/⚠️_Cantumkan_Perubahan-wajib-f59e0b?style=flat-square)
![](https://img.shields.io/badge/⚠️_Sertakan_Copyright-wajib-f59e0b?style=flat-square)

**Tidak boleh:**

![](https://img.shields.io/badge/❌_Klaim_Trademark-dilarang-ef4444?style=flat-square)
![](https://img.shields.io/badge/❌_Tuntut_Liability-dilarang-ef4444?style=flat-square)

<br>

> Singkatnya: bebas pakai, modif, dan distribusikan — asal tetap cantumkan lisensi aslinya.  
> Detail lengkap di file [`LICENSE`](LICENSE).

</details>

<br>

<div align="center">

*Copyright © 2026 **Kelompok 6** — dibuat dengan ESP32*

</div>
