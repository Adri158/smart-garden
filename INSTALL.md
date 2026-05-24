# Panduan Instalasi Smart Garden (Full Version)

> Panduan ini untuk **versi full** — React + Node.js + Laravel + MariaDB + MQTT.  
> Kalau kamu mau yang lebih ringan (PHP murni, tanpa build step), lihat branch **[lite](https://github.com/Adri158/smart-garden/tree/lite)**.

---

## Daftar Isi

- [Windows](#-windows)
- [Ubuntu / Debian](#-ubuntu--debian)
- [Arch / Manjaro](#-arch--manjaro)
- [macOS](#-macos)
- [Penjelasan Variabel .env](#penjelasan-variabel-env)
- [Flash ESP32 (Opsional)](#flash-esp32-opsional)
- [Akses Pertama Kali](#akses-pertama-kali)
- [Troubleshooting](#troubleshooting)

---

## Windows

### 1. Install Prerequisites

**Node.js (v18 LTS atau lebih baru)**

Download di [nodejs.org](https://nodejs.org) → pilih versi **LTS** → install.

Cek instalasi:
```cmd
node -v
npm -v
```

**PHP 8.2+**

Download di [windows.php.net/download](https://windows.php.net/download) → pilih **Thread Safe** → ekstrak ke `C:\php`.

Tambahkan `C:\php` ke **System Environment Variables → PATH**.

Aktifkan ekstensi di `C:\php\php.ini` (copy dari `php.ini-development`, hapus `;` di depan baris ini):
```ini
extension=mbstring
extension=openssl
extension=pdo_mysql
extension=mysqli
extension=curl
extension=fileinfo
```

Cek PHP:
```cmd
php -v
```

**Composer**

Download installer di [getcomposer.org/download](https://getcomposer.org/download/) → jalankan → ikuti wizard.

Cek:
```cmd
composer -V
```

**MariaDB**

Download di [mariadb.org/download](https://mariadb.org/download/) → install → catat password root yang kamu set.

**Mosquitto**

Download di [mosquitto.org/download](https://mosquitto.org/download) → install.

Tambahkan `C:\Program Files\mosquitto` ke PATH.

**pm2**

```cmd
npm install -g pm2
```

---

### 2. Clone Repo

```cmd
git clone https://github.com/Adri158/smart-garden.git
cd smart-garden
```

Atau download ZIP dari [Releases](https://github.com/Adri158/smart-garden/releases) → ekstrak.

---

### 3. Setup Database

Buka Command Prompt, login MariaDB:

```cmd
mysql -u root -p
```

```sql
CREATE DATABASE smartgarden CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

Import schema:

```cmd
mysql -u root -p smartgarden < database\schema.sql
```

---

### 4. Konfigurasi .env (Root)

```cmd
copy .env.example .env
notepad .env
```

Isi:
```env
DB_HOST=127.0.0.1
DB_NAME=smartgarden
DB_USER=root
DB_PASS=password_mariadb_kamu

ADMIN_USER=admin
ADMIN_PASS=ganti_password_ini

API_KEY=buat_random_string_panjang

OPENAI_API_KEY=sk-...
```

> `API_KEY` bisa dibuat dengan: `node -e "console.log(require('crypto').randomBytes(16).toString('hex'))"`

---

### 5. Setup Backend Node.js

```cmd
cd backend
npm install
cd ..
```

---

### 6. Setup Laravel

```cmd
cd laravel
composer install
copy .env.example .env
notepad .env
```

Isi di `laravel\.env`:
```env
APP_URL=http://localhost:8000
DB_HOST=127.0.0.1
DB_DATABASE=smartgarden
DB_USERNAME=root
DB_PASSWORD=password_mariadb_kamu
API_KEY=sama_dengan_root_env
```

```cmd
php artisan key:generate
cd ..
```

---

### 7. Jalankan Backend via pm2

```cmd
pm2 startOrReload backend\ecosystem.config.js --update-env
pm2 save
```

Cek status:
```cmd
pm2 status
```

Harus ada 3 proses online: `mqtt-save`, `server-stats`, `laravel-api`.

---

### 8. Setup Mosquitto

Buka `C:\Program Files\mosquitto\mosquitto.conf` dengan Notepad (Run as Administrator), tambahkan:

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

---

### 9. Build Frontend

```cmd
cd frontend
npm install
copy .env.example .env
notepad .env
```

Isi `frontend\.env`:
```env
VITE_APP_URL=http://localhost
VITE_MQTT_URL=ws://localhost:9002
VITE_API_BASE=
VITE_API_KEY=sama_dengan_root_env
```

```cmd
npm run build
cd ..
```

---

### 10. Setup Apache (XAMPP)

Kalau belum punya Apache: download **XAMPP** di [apachefriends.org](https://apachefriends.org).

Edit `C:\xampp\apache\conf\extra\httpd-vhosts.conf`, tambahkan:

```apache
<VirtualHost *:80>
    DocumentRoot "C:/path/ke/smart-garden/frontend/dist"
    <Directory "C:/path/ke/smart-garden/frontend/dist">
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

Aktifkan module di `C:\xampp\apache\conf\httpd.conf` (hapus `#`):
```apache
LoadModule rewrite_module modules/mod_rewrite.so
LoadModule proxy_module modules/mod_proxy.so
LoadModule proxy_http_module modules/mod_proxy_http.so
```

Restart Apache dari XAMPP Control Panel.

---

### 11. Akses

| Halaman | URL |
|---------|-----|
| Dashboard | `http://localhost/dashboard` |
| Admin Login | `http://localhost/admin/login` |
| REST API | `http://localhost/api/status` |

---

---

## Ubuntu / Debian

### 1. Install Prerequisites

```bash
# Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt install -y nodejs

# PHP 8.2+ + ekstensi
sudo apt install -y php php-cli php-mbstring php-xml php-curl php-mysql php-zip php-bcmath

# Apache, MariaDB, Mosquitto
sudo apt install -y apache2 mariadb-server mosquitto

# Composer
curl -sS https://getcomposer.org/installer | php
sudo mv composer.phar /usr/local/bin/composer

# pm2
sudo npm install -g pm2

# Enable services
sudo systemctl enable --now apache2 mariadb mosquitto
```

---

### 2. Clone Repo

```bash
git clone https://github.com/Adri158/smart-garden.git
cd smart-garden
```

---

### 3. Setup Database

```bash
sudo mysql -u root
```

```sql
CREATE DATABASE smartgarden CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

```bash
sudo mysql -u root smartgarden < database/schema.sql
```

> Kalau MariaDB kamu pakai password root:  
> `sudo mysql -u root -p smartgarden < database/schema.sql`

---

### 4. Konfigurasi .env (Root)

```bash
cp .env.example .env
nano .env
```

```env
DB_HOST=127.0.0.1
DB_NAME=smartgarden
DB_USER=root
DB_PASS=

ADMIN_USER=admin
ADMIN_PASS=ganti_password_ini

API_KEY=buat_random_string_panjang

OPENAI_API_KEY=sk-...
```

---

### 5. Setup Backend Node.js

```bash
cd backend && npm install && cd ..
```

---

### 6. Setup Laravel

```bash
cd laravel
composer install
cp .env.example .env
nano .env
```

Isi:
```env
APP_URL=http://localhost:8000
DB_HOST=127.0.0.1
DB_DATABASE=smartgarden
DB_USERNAME=root
DB_PASSWORD=
API_KEY=sama_dengan_root_env
```

```bash
php artisan key:generate
cd ..
```

---

### 7. Jalankan Backend via pm2

```bash
pm2 startOrReload backend/ecosystem.config.js --update-env
pm2 save
pm2 startup
```

Jalankan perintah `sudo` yang muncul dari `pm2 startup` agar pm2 auto-start waktu reboot.

Cek:
```bash
pm2 status
```

---

### 8. Setup Mosquitto

```bash
sudo nano /etc/mosquitto/mosquitto.conf
```

Tambahkan di baris paling bawah:
```
listener 1883
listener 9002
protocol websockets
allow_anonymous true
```

```bash
sudo systemctl restart mosquitto
```

---

### 9. Build Frontend

```bash
cd frontend
npm install
cp .env.example .env
nano .env
```

```env
VITE_APP_URL=http://localhost
VITE_MQTT_URL=ws://localhost:9002
VITE_API_BASE=
VITE_API_KEY=sama_dengan_root_env
```

```bash
npm run build
cd ..
```

---

### 10. Setup Apache

```bash
# Aktifkan module
sudo a2enmod rewrite proxy proxy_http

# Buat virtual host
sudo nano /etc/apache2/sites-available/smart-garden.conf
```

Isi:
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

Ganti `/path/ke/smart-garden` dengan path absolut folder kamu.

```bash
sudo a2ensite smart-garden.conf
sudo a2dissite 000-default.conf
sudo systemctl restart apache2
```

---

### 11. Akses

| Halaman | URL |
|---------|-----|
| Dashboard | `http://localhost/dashboard` |
| Admin Login | `http://localhost/admin/login` |
| REST API | `http://localhost/api/status` |

---

---

## Arch / Manjaro

### 1. Install Prerequisites

```bash
# Packages
sudo pacman -S nodejs npm php composer apache mariadb mosquitto git

# Inisialisasi MariaDB (hanya pertama kali)
sudo mysql_install_db --user=mysql --basedir=/usr --datadir=/var/lib/mysql

# Enable services
sudo systemctl enable --now httpd mariadb mosquitto

# pm2
sudo npm install -g pm2
```

Aktifkan ekstensi PHP di `/etc/php/php.ini` (hapus `;` di depan):
```ini
extension=pdo_mysql
extension=mysqli
extension=curl
extension=mbstring
extension=openssl
extension=zip
```

---

### 2. Clone Repo

```bash
git clone https://github.com/Adri158/smart-garden.git
cd smart-garden
```

---

### 3. Setup Database

```bash
sudo mysql -u root
```

```sql
CREATE DATABASE smartgarden CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

```bash
mysql -u root smartgarden < database/schema.sql
```

---

### 4. Konfigurasi .env (Root)

```bash
cp .env.example .env
nano .env
```

```env
DB_HOST=127.0.0.1
DB_NAME=smartgarden
DB_USER=root
DB_PASS=

ADMIN_USER=admin
ADMIN_PASS=ganti_password_ini

API_KEY=buat_random_string_panjang

OPENAI_API_KEY=sk-...
```

---

### 5. Setup Backend Node.js

```bash
cd backend && npm install && cd ..
```

---

### 6. Setup Laravel

```bash
cd laravel
composer install
cp .env.example .env
nano .env
```

```env
APP_URL=http://localhost:8000
DB_HOST=127.0.0.1
DB_DATABASE=smartgarden
DB_USERNAME=root
DB_PASSWORD=
API_KEY=sama_dengan_root_env
```

```bash
php artisan key:generate
cd ..
```

---

### 7. Jalankan Backend via pm2

```bash
pm2 startOrReload backend/ecosystem.config.js --update-env
pm2 save
pm2 startup
```

Jalankan perintah `sudo` yang muncul dari `pm2 startup`.

---

### 8. Setup Mosquitto

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

---

### 9. Build Frontend

```bash
cd frontend
npm install
cp .env.example .env
nano .env
```

```env
VITE_APP_URL=http://localhost
VITE_MQTT_URL=ws://localhost:9002
VITE_API_BASE=
VITE_API_KEY=sama_dengan_root_env
```

```bash
npm run build
cd ..
```

---

### 10. Setup Apache

Edit `/etc/httpd/conf/httpd.conf`, pastikan baris ini tidak di-comment:

```apache
LoadModule rewrite_module modules/mod_rewrite.so
LoadModule proxy_module modules/mod_proxy.so
LoadModule proxy_http_module modules/mod_proxy_http.so
```

Buat file conf terpisah `/etc/httpd/conf/conf.d/smart-garden.conf`:

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

Pastikan `/etc/httpd/conf/httpd.conf` include folder conf.d:
```apache
IncludeOptional conf/conf.d/*.conf
```

```bash
sudo systemctl restart httpd
```

---

### 11. Akses

```
http://localhost/dashboard
http://localhost/admin/login
http://localhost/api/status
```

---

---

## macOS

### 1. Install Prerequisites

Install [Homebrew](https://brew.sh) dulu jika belum ada:

```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

Lalu:

```bash
brew install node php composer mariadb mosquitto httpd git

# Start services
brew services start mariadb mosquitto httpd

# pm2
npm install -g pm2
```

Aktifkan ekstensi PHP. Edit `/usr/local/etc/php/8.x/php.ini` (sesuaikan versi):

```ini
extension=pdo_mysql
extension=mysqli
extension=curl
extension=mbstring
```

---

### 2. Clone Repo

```bash
git clone https://github.com/Adri158/smart-garden.git
cd smart-garden
```

---

### 3. Setup Database

```bash
mysql -u root
```

```sql
CREATE DATABASE smartgarden CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

```bash
mysql -u root smartgarden < database/schema.sql
```

---

### 4. Konfigurasi .env (Root)

```bash
cp .env.example .env
nano .env
```

```env
DB_HOST=127.0.0.1
DB_NAME=smartgarden
DB_USER=root
DB_PASS=

ADMIN_USER=admin
ADMIN_PASS=ganti_password_ini

API_KEY=buat_random_string_panjang

OPENAI_API_KEY=sk-...
```

---

### 5. Setup Backend Node.js

```bash
cd backend && npm install && cd ..
```

---

### 6. Setup Laravel

```bash
cd laravel
composer install
cp .env.example .env
nano .env
```

```env
APP_URL=http://localhost:8080
DB_HOST=127.0.0.1
DB_DATABASE=smartgarden
DB_USERNAME=root
DB_PASSWORD=
API_KEY=sama_dengan_root_env
```

> Apache Homebrew default port **8080**, bukan 80.

```bash
php artisan key:generate
cd ..
```

---

### 7. Jalankan Backend via pm2

```bash
pm2 startOrReload backend/ecosystem.config.js --update-env
pm2 save
pm2 startup
```

---

### 8. Setup Mosquitto

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

---

### 9. Build Frontend

```bash
cd frontend
npm install
cp .env.example .env
nano .env
```

```env
VITE_APP_URL=http://localhost:8080
VITE_MQTT_URL=ws://localhost:9002
VITE_API_BASE=
VITE_API_KEY=sama_dengan_root_env
```

```bash
npm run build
cd ..
```

---

### 10. Setup Apache (Homebrew httpd)

Edit `/usr/local/etc/httpd/httpd.conf`, pastikan tidak di-comment:

```apache
LoadModule rewrite_module lib/httpd/modules/mod_rewrite.so
LoadModule proxy_module lib/httpd/modules/mod_proxy.so
LoadModule proxy_http_module lib/httpd/modules/mod_proxy_http.so
```

Tambahkan di bawah:

```apache
<VirtualHost *:8080>
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

```bash
brew services restart httpd
```

---

### 11. Akses

> Apache Homebrew default port **8080**.

| Halaman | URL |
|---------|-----|
| Dashboard | `http://localhost:8080/dashboard` |
| Admin Login | `http://localhost:8080/admin/login` |
| REST API | `http://localhost:8080/api/status` |

---

---

## Penjelasan Variabel .env

### Root `.env`

| Variabel | Keterangan |
|----------|------------|
| `DB_HOST` | Host database. Selalu `127.0.0.1` (bukan `localhost`) |
| `DB_NAME` | Nama database. Default: `smartgarden` |
| `DB_USER` | User MariaDB |
| `DB_PASS` | Password MariaDB |
| `ADMIN_USER` | Username login admin panel |
| `ADMIN_PASS` | Password admin panel |
| `API_KEY` | Key untuk endpoint write (POST/PUT/DELETE). Buat random string panjang |
| `OPENAI_API_KEY` | API key OpenAI untuk fitur AI Assistant. Opsional |

### `laravel/.env`

| Variabel | Keterangan |
|----------|------------|
| `APP_URL` | URL Laravel sendiri. `http://localhost:8000` untuk lokal |
| `DB_*` | Sama dengan root `.env` |
| `API_KEY` | Harus sama persis dengan `API_KEY` di root `.env` |

### `frontend/.env`

| Variabel | Keterangan |
|----------|------------|
| `VITE_APP_URL` | URL root dashboard (bukan API). Dipakai admin panel |
| `VITE_MQTT_URL` | WebSocket URL Mosquitto. `ws://localhost:9002` lokal, `wss://...` publik |
| `VITE_API_BASE` | Kosongkan untuk lokal (Vite dev proxy otomatis), isi URL API untuk prod |
| `VITE_API_KEY` | Sama dengan `API_KEY` di root `.env` |

---

## Flash ESP32 (Opsional)

### Prerequisites

- [Arduino IDE](https://arduino.cc/en/software) atau VS Code + PlatformIO
- Install board **ESP32** di Arduino IDE: Preferences → Additional Boards Manager URLs → tambahkan URL ESP32, lalu Boards Manager → cari ESP32 → Install

### Library yang dibutuhkan

Di Arduino IDE → **Sketch → Include Library → Manage Libraries**, install:

| Library | Author |
|---------|--------|
| DHT sensor library | Adafruit |
| DallasTemperature | Miles Burton |
| OneWire | Paul Stoffregen |
| PubSubClient | Nick O'Leary |
| ArduinoJson | Benoit Blanchon |
| WiFiManager | tzapu |

### Konfigurasi Firmware

Buka `firmware/firmware.ino`, ubah baris ini:

```cpp
const char* mqtt_server = "IP_SERVER_KAMU";
```

Ganti `IP_SERVER_KAMU` dengan IP lokal server kamu (contoh: `192.168.1.100`).

> ESP32 hanya bisa koneksi MQTT via TCP LAN, tidak lewat HTTPS/tunnel. Pastikan ESP32 dan server di jaringan yang sama.

### Upload

1. Pilih board: **Tools → Board → ESP32 Dev Module**
2. Pilih port: **Tools → Port → COMx** (Windows) atau `/dev/ttyUSB0` (Linux/macOS)
3. Klik **Upload**

Pertama kali boot, ESP32 akan membuka hotspot WiFi `SmartGarden-XXXX`. Connect ke hotspot tersebut, buka `192.168.4.1` di browser, isi SSID + password WiFi rumah kamu.

---

## Akses Pertama Kali

1. Buka `http://localhost/dashboard` (atau port 8080 di macOS)
2. Untuk admin panel: `http://localhost/admin/login`
3. Login dengan username/password yang kamu set di `.env` (`ADMIN_USER` / `ADMIN_PASS`)

---

## Troubleshooting

**pm2: proses tidak mau start**
```bash
pm2 logs laravel-api --lines 50
pm2 logs mqtt-save --lines 50
```
Lihat error di log. Biasanya karena DB credentials salah atau port 8000 sudah dipakai.

**Laravel error 500 / "No application encryption key"**
```bash
cd laravel && php artisan key:generate
pm2 restart laravel-api
```

**Frontend tidak bisa konek API (`/api` 502 Bad Gateway)**

Pastikan `laravel-api` running:
```bash
pm2 status
```
Kalau offline, lihat lognya dan restart.

**MQTT tidak menerima data dari ESP32**

Cek Mosquitto berjalan:
```bash
# Linux
sudo systemctl status mosquitto

# macOS
brew services list | grep mosquitto
```

Cek juga IP `mqtt_server` di firmware sudah benar.

**Frontend CSS tidak update setelah rebuild**

Kalau kamu pakai browser yang pernah buka dashboard sebelumnya, service worker bisa cache versi lama. Buka DevTools → Application → Service Workers → **Unregister**, lalu hard refresh (Ctrl+Shift+R).

**`composer install` gagal karena memory limit PHP**

```bash
php -d memory_limit=-1 $(which composer) install
```

**Port 8000 sudah dipakai**

Cek proses mana yang pakai port 8000:
```bash
# Linux/macOS
lsof -i :8000

# Windows
netstat -ano | findstr :8000
```

Ganti port di `backend/ecosystem.config.js` (bagian `laravel-api`) dan update `APP_URL` di `laravel/.env`.
