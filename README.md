# 🌱 Smart Garden

> Sistem monitoring dan penyiraman tanaman otomatis berbasis IoT — **Kelompok 6**

[![Live Demo](https://img.shields.io/badge/Live%20Demo-kelompok6.my.id-4ade80?style=for-the-badge&logo=globe&logoColor=white)](https://kelompok6.my.id)
[![API](https://img.shields.io/badge/REST%20API-api.kelompok6.my.id-60a5fa?style=for-the-badge&logo=fastapi&logoColor=white)](https://api.kelompok6.my.id/api/status)
[![License](https://img.shields.io/badge/License-Apache%202.0-a78bfa?style=for-the-badge)](LICENSE)

---

## Tentang Proyek

Smart Garden adalah sistem IoT yang memantau kondisi kebun secara real-time dan mengontrol pompa penyiram tanaman secara otomatis. ESP32 membaca data sensor tanah, suhu, dan kelembaban udara, lalu mengirimkannya ke dashboard web melalui MQTT.

Pengguna bisa memantau sensor, mengontrol pompa, dan mengatur threshold/jadwal siram — semuanya dari browser, bahkan dari luar jaringan lokal.

---

## Fitur Utama

| Fitur | Deskripsi |
|-------|-----------|
| 📊 **Real-time Monitoring** | Data sensor langsung dari ESP32 via MQTT WebSocket |
| 💧 **Kontrol Pompa** | Nyala/mati manual + mode AUTO berdasarkan kelembaban tanah |
| 📈 **Grafik Historis** | Tren sensor dari 1 jam hingga 1 bulan |
| ⏰ **Jadwal Siram** | Atur hari & jam siram otomatis |
| 🌤️ **Info Cuaca** | Prakiraan cuaca & peluang hujan via Open-Meteo |
| 🔧 **OTA Update** | Firmware ESP32 update otomatis tanpa kabel |
| 🤖 **AI Assistant** | Tanya langsung tentang fitur dashboard |

---

## Arsitektur Sistem

```
ESP32 (Firmware)
  ├── DHT11       → Suhu udara & kelembaban
  ├── DS18B20     → Suhu air
  ├── Soil Sensor → Kelembaban tanah (ADC)
  └── Relay       → Pompa air (pin 27)
       │
       └── MQTT TCP (LAN) → Mosquitto Broker
                │
                ├── mqttSave.js     → MariaDB (logging)
                ├── serverStats.js  → CPU/RAM/Disk metrics
                └── React Frontend  → WSS (via Cloudflare Tunnel)
```

---

## Tech Stack

**Firmware**
- ESP32 + Arduino Framework
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
- Arch Linux

---

## Struktur Repo

```
smart-garden/
├── firmware/          # Kode Arduino ESP32 (ini.ino)
├── frontend/          # React SPA (Vite)
│   └── src/
│       ├── pages/     # Dashboard, Settings, Sistem, dll
│       ├── redux/     # State management
│       └── components/
├── backend/           # Node.js REST API + MQTT jobs
├── laravel/           # Laravel API layer
└── database/          # Migrasi & schema
```

---

## Cara Jalanin (Development)

### Frontend
```bash
cd frontend
cp .env.example .env   # isi VITE_API_BASE, VITE_MQTT_URL, VITE_API_KEY
npm install
npm run dev            # dev server :5173
npm run build          # build ke dist/
```

### Backend (Node.js)
```bash
cd backend
npm install
pm2 startOrReload ecosystem.config.js --update-env
```

### Backend (Laravel)
```bash
cd laravel
composer install
cp .env.example .env
php artisan key:generate
php artisan serve      # :8000
```

---

## Tim Pengembang — Kelompok 6

| No | Nama | Peran |
|----|------|-------|
| 1 | Untung Adriansyah | Hardware, Software, Frontend, Backend, Testing |
| 2 | Muh Rehan | Hardware |
| 3 | Andi Muhammad Ghofur Irvan | Hardware |
| 4 | Shirefa Seni | Hardware |
| 5 | Anindiya Ainun Mahya | Hardware, Testing, Dokumentasi |
| 6 | Nanda Saskia Putri | Hardware, Testing, Dokumentasi |
| 7 | Jihan Dzakira Talita | Hardware, Testing, Dokumentasi |
| 8 | Zahra Zikra | Hardware, Testing, Dokumentasi |
| 9 | Ibrahim Munir | Hardware, Testing |
| 10 | Muh. Alif Attar Maulana | Hardware, Testing |
| 11 | Muh. Rifky Al-Aqsha | Hardware, Testing |

**Guru Pembimbing:**
- Ir. Runal Rezkiawan B., S.Kom., M.T.
- Arfi Mesrach Hapaiduka, S. Pd.

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

## License

[Apache 2.0](LICENSE) © 2025 Kelompok 6
