# 🌱 Smart Garden Lite

> Sistem monitoring dan penyiraman tanaman otomatis berbasis IoT — **Kelompok 6**

[![License](https://img.shields.io/badge/License-Apache%202.0-a78bfa?style=for-the-badge)](LICENSE)
[![PHP](https://img.shields.io/badge/PHP-8.x-777bb4?style=for-the-badge&logo=php&logoColor=white)](https://php.net)
[![Live](https://img.shields.io/badge/🌐%20Live-kelompok6.my.id-4ade80?style=for-the-badge)](https://kelompok6.my.id)

---

## Tentang Versi Lite

Smart Garden Lite adalah versi ringan berbasis **PHP murni** — tanpa Node.js, tanpa React, tanpa build step.

ESP32 membaca data sensor tanah, suhu, dan kelembaban udara, lalu mengirimkannya ke dashboard web melalui MQTT. Pengguna bisa memantau sensor, mengontrol pompa, dan mengatur jadwal siram langsung dari browser.

---

## Lite vs Full

| | Lite (branch ini) | Full (branch main) |
|--|:--:|:--:|
| **Tech stack** | PHP murni | React + Node.js + Laravel |
| **Build step** | Tidak perlu | `npm run build` |
| **Install** | Ekstrak + isi `.env` | 10+ langkah |
| **Dashboard real-time** | ✅ | ✅ |
| **Kontrol pompa** | ✅ | ✅ |
| **Grafik historis** | ✅ | ✅ |
| **Jadwal siram** | ✅ | ✅ |
| **Info cuaca** | ✅ | ✅ |
| **Admin panel** | ✅ | ✅ |
| **Panduan** | ✅ | ✅ |
| **Feedback pengguna** | ❌ | ✅ |
| **Dokumentasi projek** | ❌ | ✅ |
| **Halaman Tentang** | ❌ | ✅ |
| **Landing page** | ❌ | ✅ |
| **PWA (installable)** | ❌ | ✅ |
| **AI Assistant** | ❌ | ✅ |
| **OTA firmware update** | ❌ | ✅ |
| **REST API** | ❌ | ✅ |

> **Buat projek sekolah/kampus**: versi Full lebih lengkap karena ada **Feedback** (penilaian & komentar dari pengguna) dan **Dokumentasi** (foto/video projek) — nilai plus buat presentasi.  
> Kalau cuma butuh monitoring sensor cepat tanpa setup ribet, Lite sudah cukup.
>
> Versi Full ada di branch [`main`](https://github.com/Adri158/smart-garden/tree/main).

---

## Fitur

| Fitur | Deskripsi |
|-------|-----------|
| 📊 **Real-time Monitoring** | Data sensor langsung dari ESP32 lewat MQTT WebSocket |
| 💧 **Kontrol Pompa** | Nyala/mati manual + mode AUTO berdasarkan threshold |
| 📈 **Grafik Historis** | Riwayat sensor dari 1 jam hingga 1 bulan |
| ⏰ **Jadwal Siram** | Atur hari & jam siram otomatis |
| 🌤️ **Info Cuaca** | Perkiraan cuaca & peluang hujan via Open-Meteo |
| 🛡️ **Admin Panel** | Kelola perangkat, pengaturan, dan akun admin |

---

## Tech Stack

- **Backend** — PHP 8.x + MariaDB
- **Broker** — Mosquitto MQTT
- **Web Server** — Apache / Nginx
- **Firmware** — ESP32 + Arduino IDE

---

## Struktur Folder

```
smart-garden-lite/
├── admin/              # Panel admin (login, dashboard, API)
├── css/                # Stylesheet
├── js/                 # JavaScript frontend
├── shared/             # Layout & helper PHP
├── dashboard.php       # Halaman utama
├── settings.php        # Konfigurasi threshold & jadwal
├── sistem.php          # Status server & perangkat
├── panduan.php         # Panduan penggunaan
├── db.php              # Koneksi database & inisialisasi tabel
├── setup.sql           # Schema database (opsional, auto-create via db.php)
└── .env.example        # Template konfigurasi
```

---

## ⬇️ Download / Clone

**Via Git (direkomendasikan):**

```bash
git clone -b lite https://github.com/Adri158/smart-garden.git smart-garden-lite
cd smart-garden-lite
```

**Via ZIP/TAR.GZ:**

Download dari halaman [**Releases**](https://github.com/Adri158/smart-garden/releases):

| File | Deskripsi |
|------|-----------|
| `smart-garden-lite-v1.0.0.zip` | Arsip ZIP |
| `smart-garden-lite-v1.0.0.tar.gz` | Arsip TAR.GZ |

---

## Install

> 📄 Panduan lengkap & rinci ada di **[INSTALL.md](INSTALL.md)** — mencakup semua OS, troubleshooting, dan penjelasan tiap konfigurasi.

Pilih sistem operasi kamu:

<details>
<summary><b>🪟 Windows</b></summary>

<br>

**1. Install Prerequisites**

Gunakan **XAMPP** — sudah include PHP + Apache + MariaDB dalam satu installer.

1. Download & install XAMPP di [apachefriends.org](https://apachefriends.org)
2. Buka **XAMPP Control Panel** → Start **Apache** dan **MySQL**
3. Download & install Mosquitto di [mosquitto.org/download](https://mosquitto.org/download)
4. Tambahkan `C:\Program Files\mosquitto` ke **Environment Variables → PATH**

**2. Download & Ekstrak**

Pilih salah satu cara:

- **Git:** buka Git Bash / terminal, jalankan:
  ```bash
  git clone -b lite https://github.com/Adri158/smart-garden.git C:\xampp\htdocs\smart-garden-lite
  ```
- **ZIP:** download `smart-garden-lite-v1.0.0.zip` dari [Releases](https://github.com/Adri158/smart-garden/releases) → klik kanan → **Extract All** → ekstrak ke `C:\xampp\htdocs\smart-garden-lite`

**3. Setup Database**

Buka `http://localhost/phpmyadmin` → klik **New** → isi nama database `smartgarden` → klik **Create**.

> Tabel dibuat otomatis saat pertama kali mengakses dashboard. Atau import manual via tab **Import** → pilih file `setup.sql`.

**4. Konfigurasi .env**

Duplikat file `.env.example` → rename jadi `.env` → buka dengan Notepad/VSCode, isi:

```env
DB_HOST=127.0.0.1
DB_NAME=smartgarden
DB_USER=root
DB_PASS=

ADMIN_USER=admin
ADMIN_PASS=password_admin_kamu

API_KEY=buat_random_string_panjang

# Kosongkan jika hanya pakai lokal — otomatis terdeteksi
# Isi jika deploy ke server publik, contoh: wss://mqtt.domainkamu.com
MQTT_WS_URL=
```

> ⚠️ Jangan commit file `.env` ke GitHub.

**5. Setup Mosquitto**

Buka file `C:\Program Files\mosquitto\mosquitto.conf` dengan Notepad (Run as Administrator), tambahkan:

```
listener 1883
listener 9002
protocol websockets
allow_anonymous true
```

Restart Mosquitto:

```cmd
net stop mosquitto
net start mosquitto
```

**6. Akses**

| Halaman | URL |
|---------|-----|
| Dashboard | `http://localhost/smart-garden-lite/dashboard.php` |
| Pengaturan | `http://localhost/smart-garden-lite/settings.php` |
| Sistem | `http://localhost/smart-garden-lite/sistem.php` |
| Panduan | `http://localhost/smart-garden-lite/panduan.php` |
| Admin | `http://localhost/smart-garden-lite/admin/login.php` |

Login admin default: `admin` / `admin123` — **ganti segera setelah login pertama**.

</details>

<details>
<summary><b>🐧 Linux — Ubuntu / Debian</b></summary>

<br>

**1. Install Prerequisites**

```bash
sudo apt update
sudo apt install -y php php-mysqli apache2 mariadb-server mosquitto
sudo systemctl enable --now apache2 mariadb mosquitto
```

**2. Download & Ekstrak**

Pilih salah satu cara:

```bash
# Via Git (direkomendasikan):
git clone -b lite https://github.com/Adri158/smart-garden.git smart-garden-lite

# Via ZIP:
unzip smart-garden-lite-v1.0.0.zip
```

```bash
sudo mv smart-garden-lite /var/www/html/
sudo chown -R www-data:www-data /var/www/html/smart-garden-lite
```

**3. Setup Database**

```bash
sudo mysql -u root
```
```sql
CREATE DATABASE smartgarden CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

> Tabel dibuat otomatis saat pertama kali akses dashboard. Atau import manual:
> ```bash
> mysql -u root smartgarden < /var/www/html/smart-garden-lite/setup.sql
> ```

**4. Konfigurasi .env**

```bash
cd /var/www/html/smart-garden-lite
cp .env.example .env
nano .env
```

```env
DB_HOST=127.0.0.1
DB_NAME=smartgarden
DB_USER=root
DB_PASS=

ADMIN_USER=admin
ADMIN_PASS=password_admin_kamu

API_KEY=buat_random_string_panjang

# Kosongkan jika hanya pakai lokal — otomatis terdeteksi
# Isi jika deploy ke server publik, contoh: wss://mqtt.domainkamu.com
MQTT_WS_URL=
```

**5. Setup Mosquitto**

```bash
sudo nano /etc/mosquitto/mosquitto.conf
```

Tambahkan:

```
listener 1883
listener 9002
protocol websockets
allow_anonymous true
```

```bash
sudo systemctl restart mosquitto
```

**6. Aktifkan mod_rewrite Apache**

```bash
sudo a2enmod rewrite
sudo systemctl restart apache2
```

Pastikan `AllowOverride All` aktif di `/etc/apache2/apache2.conf`:

```apache
<Directory /var/www/html>
    AllowOverride All
</Directory>
```

**7. Akses**

| Halaman | URL |
|---------|-----|
| Dashboard | `http://localhost/smart-garden-lite/dashboard.php` |
| Pengaturan | `http://localhost/smart-garden-lite/settings.php` |
| Sistem | `http://localhost/smart-garden-lite/sistem.php` |
| Panduan | `http://localhost/smart-garden-lite/panduan.php` |
| Admin | `http://localhost/smart-garden-lite/admin/login.php` |

Login admin default: `admin` / `admin123` — **ganti segera setelah login pertama**.

</details>

<details>
<summary><b>🐧 Linux — Arch / Manjaro</b></summary>

<br>

**1. Install Prerequisites**

```bash
sudo pacman -S php apache mariadb mosquitto
sudo mysql_install_db --user=mysql --basedir=/usr --datadir=/var/lib/mysql
sudo systemctl enable --now httpd mariadb mosquitto
```

**2. Download & Ekstrak**

Pilih salah satu cara:

```bash
# Via Git (direkomendasikan):
git clone -b lite https://github.com/Adri158/smart-garden.git smart-garden-lite

# Via ZIP:
unzip smart-garden-lite-v1.0.0.zip
```

```bash
sudo mv smart-garden-lite /srv/http/
sudo chown -R http:http /srv/http/smart-garden-lite
```

**3. Setup Database**

```bash
sudo mysql -u root
```
```sql
CREATE DATABASE smartgarden CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

> Tabel dibuat otomatis saat pertama kali akses dashboard. Atau import manual:
> ```bash
> mysql -u root smartgarden < /srv/http/smart-garden-lite/setup.sql
> ```

**4. Konfigurasi .env**

```bash
cd /srv/http/smart-garden-lite
cp .env.example .env
nano .env
```

```env
DB_HOST=127.0.0.1
DB_NAME=smartgarden
DB_USER=root
DB_PASS=

ADMIN_USER=admin
ADMIN_PASS=password_admin_kamu

API_KEY=buat_random_string_panjang

# Kosongkan jika hanya pakai lokal — otomatis terdeteksi
# Isi jika deploy ke server publik, contoh: wss://mqtt.domainkamu.com
MQTT_WS_URL=
```

**5. Setup Mosquitto**

```bash
sudo nano /etc/mosquitto/mosquitto.conf
```

Tambahkan:

```
listener 1883
listener 9002
protocol websockets
allow_anonymous true
```

```bash
sudo systemctl restart mosquitto
```

**6. Konfigurasi Apache**

Edit `/etc/httpd/conf/httpd.conf`, pastikan baris ini tidak di-comment:

```apache
LoadModule rewrite_module modules/mod_rewrite.so
```

Tambahkan di bagian bawah:

```apache
<Directory "/srv/http/smart-garden-lite">
    AllowOverride All
    Require all granted
</Directory>
```

```bash
sudo systemctl restart httpd
```

**7. Akses**

| Halaman | URL |
|---------|-----|
| Dashboard | `http://localhost/smart-garden-lite/dashboard.php` |
| Pengaturan | `http://localhost/smart-garden-lite/settings.php` |
| Sistem | `http://localhost/smart-garden-lite/sistem.php` |
| Panduan | `http://localhost/smart-garden-lite/panduan.php` |
| Admin | `http://localhost/smart-garden-lite/admin/login.php` |

Login admin default: `admin` / `admin123` — **ganti segera setelah login pertama**.

</details>

<details>
<summary><b>🍎 macOS</b></summary>

<br>

**1. Install Prerequisites**

Install [Homebrew](https://brew.sh) dulu jika belum:

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

Lalu install semua:

```bash
brew install php mariadb mosquitto httpd
brew services start mariadb mosquitto httpd
```

**2. Download & Ekstrak**

Pilih salah satu cara:

```bash
# Via Git (direkomendasikan):
git clone -b lite https://github.com/Adri158/smart-garden.git smart-garden-lite

# Via ZIP:
unzip smart-garden-lite-v1.0.0.zip
```

```bash
cp -r smart-garden-lite /usr/local/var/www/
```

**3. Setup Database**

```bash
mysql -u root
```
```sql
CREATE DATABASE smartgarden CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

> Tabel dibuat otomatis saat pertama kali akses dashboard. Atau import manual:
> ```bash
> mysql -u root smartgarden < /usr/local/var/www/smart-garden-lite/setup.sql
> ```

**4. Konfigurasi .env**

```bash
cd /usr/local/var/www/smart-garden-lite
cp .env.example .env
nano .env
```

```env
DB_HOST=127.0.0.1
DB_NAME=smartgarden
DB_USER=root
DB_PASS=

ADMIN_USER=admin
ADMIN_PASS=password_admin_kamu

API_KEY=buat_random_string_panjang

# Kosongkan jika hanya pakai lokal — otomatis terdeteksi
# Isi jika deploy ke server publik, contoh: wss://mqtt.domainkamu.com
MQTT_WS_URL=
```

**5. Setup Mosquitto**

```bash
nano /usr/local/etc/mosquitto/mosquitto.conf
```

Tambahkan:

```
listener 1883
listener 9002
protocol websockets
allow_anonymous true
```

```bash
brew services restart mosquitto
```

**6. Konfigurasi Apache**

Edit `/usr/local/etc/httpd/httpd.conf`:

Pastikan baris ini tidak di-comment:

```apache
LoadModule rewrite_module lib/httpd/modules/mod_rewrite.so
```

Tambahkan:

```apache
<Directory "/usr/local/var/www/smart-garden-lite">
    AllowOverride All
    Require all granted
</Directory>
```

```bash
brew services restart httpd
```

**7. Akses**

> Apache Homebrew default berjalan di port **8080**.

| Halaman | URL |
|---------|-----|
| Dashboard | `http://localhost:8080/smart-garden-lite/dashboard.php` |
| Pengaturan | `http://localhost:8080/smart-garden-lite/settings.php` |
| Sistem | `http://localhost:8080/smart-garden-lite/sistem.php` |
| Panduan | `http://localhost:8080/smart-garden-lite/panduan.php` |
| Admin | `http://localhost:8080/smart-garden-lite/admin/login.php` |

Login admin default: `admin` / `admin123` — **ganti segera setelah login pertama**.

</details>

---

## 🌐 Deploy ke Server Publik (Cloudflare Tunnel)

> Opsional — buat dashboard bisa diakses dari internet tanpa port forwarding.  
> Butuh domain yang sudah di-manage di Cloudflare.

<details>
<summary><b>Klik untuk lihat langkah-langkah</b></summary>

<br>

**1. Install cloudflared**

**🪟 Windows:**
```cmd
winget install --id Cloudflare.cloudflared
```

**🐧 Ubuntu/Debian:**
```bash
curl -L https://github.com/cloudflare/cloudflared/releases/latest/download/cloudflared-linux-amd64.deb -o cloudflared.deb
sudo dpkg -i cloudflared.deb
```

**🐧 Arch:**
```bash
yay -S cloudflared
```

**🍎 macOS:**
```bash
brew install cloudflared
```

**2. Login & Buat Tunnel**

```bash
cloudflared tunnel login
cloudflared tunnel create smart-garden
```

Catat **Tunnel ID** yang muncul.

**3. Konfigurasi Tunnel**

| OS | Path Config |
|----|-------------|
| Windows | `C:\Users\<user>\.cloudflared\config.yml` |
| Linux | `/etc/cloudflared/config.yml` |
| macOS | `~/.cloudflared/config.yml` |

Isi config:

```yaml
tunnel: <TUNNEL-ID-KAMU>
credentials-file: /path/ke/<TUNNEL-ID-KAMU>.json

ingress:
  - hostname: domainkamu.com
    service: http://localhost:80

  - hostname: mqtt.domainkamu.com
    service: ws://localhost:9002

  - service: http_status:404
```

**4. DNS di Cloudflare Dashboard**

Buka **Cloudflare Dashboard → DNS → Add Record**:

| Type | Name | Target |
|------|------|--------|
| CNAME | `@` | `<TUNNEL-ID>.cfargotunnel.com` |
| CNAME | `mqtt` | `<TUNNEL-ID>.cfargotunnel.com` |

Pastikan **Proxy status = Proxied** (ikon awan oranye aktif).

**5. Update .env**

Setelah tunnel aktif, update `MQTT_WS_URL` di `.env`:

```env
MQTT_WS_URL=wss://mqtt.domainkamu.com
```

**6. Jalankan sebagai Service**

**🪟 Windows:**
```cmd
cloudflared service install
```

**🐧 Linux:**
```bash
sudo cloudflared service install
sudo systemctl enable --now cloudflared
```

**🍎 macOS:**
```bash
sudo cloudflared service install
```

</details>

---

## Flash ESP32

> Opsional — jika kamu ingin menghubungkan hardware ESP32 ke dashboard.

1. Buka `firmware/ini.ino` di Arduino IDE
2. Install library: `DHT`, `DallasTemperature`, `PubSubClient`, `ArduinoJson`, `WiFiManager`
3. Ubah `mqtt_server` ke IP server kamu
4. Pilih board **ESP32 Dev Module** → Upload
5. Saat pertama nyala, ESP32 buat WiFi hotspot → hubungkan → isi SSID & password

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

## Dukung Projek Ini

<div align="center">

[![Star](https://img.shields.io/badge/⭐%20Kasih%20Star-Gratis%20kok!-f59e0b?style=for-the-badge)](https://github.com/Adri158/smart-garden/stargazers)
[![Fork](https://img.shields.io/badge/🍴%20Fork%20Repo-Modif%20bebas-4ade80?style=for-the-badge)](https://github.com/Adri158/smart-garden/fork)
[![Issues](https://img.shields.io/badge/🐛%20Laporin%20Bug-Buka%20Issue-60a5fa?style=for-the-badge)](https://github.com/Adri158/smart-garden/issues/new?labels=bug)
[![Pull Request](https://img.shields.io/badge/💡%20Contribute-Buka%20PR-a78bfa?style=for-the-badge)](https://github.com/Adri158/smart-garden/compare)

</div>

---

## Kontak

<div align="center">

[![Instagram](https://img.shields.io/badge/Instagram-E4405F?style=for-the-badge&logo=instagram&logoColor=white)](https://instagram.com/seekor_rin)
[![TikTok](https://img.shields.io/badge/TikTok-000000?style=for-the-badge&logo=tiktok&logoColor=white)](https://tiktok.com/@seekor_rin)
[![WhatsApp](https://img.shields.io/badge/WhatsApp-25D366?style=for-the-badge&logo=whatsapp&logoColor=white)](https://wa.me/62895419694709)

</div>

---

## ⚖️ Lisensi

<div align="center">

[![License](https://img.shields.io/badge/Apache%202.0-Open%20Source-4ade80?style=for-the-badge&logo=apache&logoColor=white)](LICENSE)

</div>

<details>
<summary><b>Klik untuk lihat hak &amp; ketentuan lengkap</b></summary>

<br>

**✅ Boleh:**

![](https://img.shields.io/badge/✅_Penggunaan_Komersial-diizinkan-4ade80?style=flat-square)
![](https://img.shields.io/badge/✅_Modifikasi_Bebas-diizinkan-4ade80?style=flat-square)
![](https://img.shields.io/badge/✅_Distribusi_Ulang-diizinkan-4ade80?style=flat-square)
![](https://img.shields.io/badge/✅_Penggunaan_Private-diizinkan-4ade80?style=flat-square)

**⚠️ Harus:**

![](https://img.shields.io/badge/⚠️_Sertakan_License_Notice-wajib-f59e0b?style=flat-square)
![](https://img.shields.io/badge/⚠️_Cantumkan_Perubahan-wajib-f59e0b?style=flat-square)
![](https://img.shields.io/badge/⚠️_Sertakan_Copyright-wajib-f59e0b?style=flat-square)

**❌ Tidak boleh:**

![](https://img.shields.io/badge/❌_Klaim_Trademark-dilarang-ef4444?style=flat-square)
![](https://img.shields.io/badge/❌_Tuntut_Liability-dilarang-ef4444?style=flat-square)

<br>

> Bebas pakai, modif, dan distribusikan — asal tetap cantumkan lisensi aslinya.  
> Detail lengkap di file [`LICENSE`](LICENSE).

</details>

<br>

<div align="center">

*Copyright © 2026 **Kelompok 6** — dibuat dengan ☕ + 🎧 + ESP32*

</div>
