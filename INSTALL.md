# Panduan Instalasi — Smart Garden Lite

Panduan ini menjelaskan cara install dan setup Smart Garden Lite dari nol sampai bisa diakses di browser. Pilih sistem operasi kamu di bawah.

---

## Daftar Isi

- [Persyaratan](#persyaratan)
- [Windows](#windows)
- [Linux — Ubuntu / Debian](#linux--ubuntu--debian)
- [Linux — Arch / Manjaro](#linux--arch--manjaro)
- [macOS](#macos)
- [Penjelasan File .env](#penjelasan-file-env)
- [Login Pertama & Ganti Password](#login-pertama--ganti-password)
- [Menghubungkan ESP32](#menghubungkan-esp32)
- [Troubleshooting](#troubleshooting)

---

## Persyaratan

| Komponen | Versi Minimal | Keterangan |
|----------|--------------|------------|
| PHP | 8.0+ | Dengan ekstensi `mysqli` atau `pdo_mysql` |
| MariaDB / MySQL | 10.4+ / 8.0+ | Database utama |
| Mosquitto | 2.0+ | MQTT broker |
| Apache / Nginx | — | Web server |
| Browser | — | Chrome, Firefox, Edge (terbaru) |

---

## Windows

### Langkah 1 — Install XAMPP

XAMPP menyediakan PHP + Apache + MariaDB dalam satu paket.

1. Buka [apachefriends.org](https://apachefriends.org) → download versi terbaru
2. Jalankan installer, ikuti langkah default
3. Setelah selesai, buka **XAMPP Control Panel**
4. Klik **Start** di baris **Apache** dan **MySQL**
5. Pastikan statusnya hijau (Running)

> Jika port 80 bentrok (misal dengan IIS atau Skype), ubah port Apache di XAMPP Control Panel → Apache → Config → `httpd.conf`, cari `Listen 80` ganti ke `Listen 8080`.

### Langkah 2 — Install Mosquitto

1. Buka [mosquitto.org/download](https://mosquitto.org/download) → download installer Windows
2. Jalankan installer, centang **Install as Windows Service**
3. Tambahkan path Mosquitto ke Environment Variables:
   - Tekan `Win + S` → cari **Environment Variables**
   - Klik **Environment Variables** → di bagian **System variables**, pilih **Path** → **Edit**
   - Klik **New** → masukkan `C:\Program Files\mosquitto`
   - Klik OK di semua jendela

### Langkah 3 — Dapatkan File Project

Pilih salah satu cara:

**Via Git** (perlu install [Git for Windows](https://git-scm.com/download/win)):
```bash
git clone -b lite https://github.com/Adri158/smart-garden.git C:\xampp\htdocs\smart-garden-lite
```

**Via ZIP:**
1. Download `smart-garden-lite-v1.0.0.zip` dari [Releases](https://github.com/Adri158/smart-garden/releases)
2. Klik kanan → **Extract All**
3. Pindahkan folder hasil ekstrak ke `C:\xampp\htdocs\smart-garden-lite`

### Langkah 4 — Setup Database

1. Buka browser → akses `http://localhost/phpmyadmin`
2. Di sidebar kiri, klik **New**
3. Isi nama database: `smartgarden`
4. Pilih collation: `utf8mb4_unicode_ci`
5. Klik **Create**

> Tabel akan dibuat otomatis saat pertama kali mengakses dashboard. Jika ingin import manual, klik database `smartgarden` → tab **Import** → pilih file `setup.sql` → klik **Go**.

### Langkah 5 — Konfigurasi .env

1. Masuk ke folder `C:\xampp\htdocs\smart-garden-lite`
2. Duplikat file `.env.example` → rename jadi `.env`
3. Buka `.env` dengan Notepad atau VSCode
4. Isi sesuai kebutuhan:

```env
DB_HOST=127.0.0.1
DB_NAME=smartgarden
DB_USER=root
DB_PASS=

ADMIN_USER=admin
ADMIN_PASS=password_kamu_yang_kuat

API_KEY=isi_dengan_string_acak_panjang

# Kosongkan untuk lokal — otomatis terdeteksi
# Isi jika deploy ke server publik: wss://mqtt.domainkamu.com
MQTT_WS_URL=
```

Lihat [Penjelasan File .env](#penjelasan-file-env) untuk detail tiap variabel.

### Langkah 6 — Konfigurasi Mosquitto

1. Buka File Explorer → navigasi ke `C:\Program Files\mosquitto`
2. Klik kanan `mosquitto.conf` → **Open with** → Notepad (Run as Administrator)
3. Tambahkan baris berikut di bagian paling bawah:

```
listener 1883
listener 9002
protocol websockets
allow_anonymous true
```

4. Simpan file
5. Restart Mosquitto — buka **Command Prompt as Administrator**:

```cmd
net stop mosquitto
net start mosquitto
```

### Langkah 7 — Akses Dashboard

Buka browser dan akses salah satu URL berikut:

| Halaman | URL |
|---------|-----|
| Dashboard | `http://localhost/smart-garden-lite/dashboard.php` |
| Pengaturan | `http://localhost/smart-garden-lite/settings.php` |
| Sistem | `http://localhost/smart-garden-lite/sistem.php` |
| Panduan | `http://localhost/smart-garden-lite/panduan.php` |
| Admin | `http://localhost/smart-garden-lite/admin/login.php` |

---

## Linux — Ubuntu / Debian

### Langkah 1 — Install Prerequisites

```bash
sudo apt update && sudo apt upgrade -y
sudo apt install -y php php-mysqli php-pdo-mysql apache2 mariadb-server mosquitto git unzip
sudo systemctl enable --now apache2 mariadb mosquitto
```

Verifikasi semua service berjalan:
```bash
sudo systemctl status apache2 mariadb mosquitto
```

### Langkah 2 — Dapatkan File Project

Pilih salah satu cara:

**Via Git:**
```bash
cd /var/www/html
sudo git clone -b lite https://github.com/Adri158/smart-garden.git smart-garden-lite
```

**Via ZIP:**
```bash
cd ~
unzip smart-garden-lite-v1.0.0.zip
sudo mv smart-garden-lite /var/www/html/
```

Set permission:
```bash
sudo chown -R www-data:www-data /var/www/html/smart-garden-lite
sudo chmod -R 755 /var/www/html/smart-garden-lite
```

### Langkah 3 — Setup Database

Masuk ke MariaDB:
```bash
sudo mysql -u root
```

Jalankan perintah SQL berikut:
```sql
CREATE DATABASE smartgarden CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

> Tabel dibuat otomatis saat pertama kali akses dashboard. Jika ingin import manual:
> ```bash
> sudo mysql -u root smartgarden < /var/www/html/smart-garden-lite/setup.sql
> ```

### Langkah 4 — Konfigurasi .env

```bash
cd /var/www/html/smart-garden-lite
sudo cp .env.example .env
sudo nano .env
```

Isi file `.env`:
```env
DB_HOST=127.0.0.1
DB_NAME=smartgarden
DB_USER=root
DB_PASS=

ADMIN_USER=admin
ADMIN_PASS=password_kamu_yang_kuat

API_KEY=isi_dengan_string_acak_panjang

# Kosongkan untuk lokal — otomatis terdeteksi
# Isi jika deploy ke server publik: wss://mqtt.domainkamu.com
MQTT_WS_URL=
```

Simpan dengan `Ctrl+O` → Enter → `Ctrl+X`.

Set permission file .env:
```bash
sudo chmod 640 /var/www/html/smart-garden-lite/.env
```

### Langkah 5 — Konfigurasi Mosquitto

```bash
sudo nano /etc/mosquitto/mosquitto.conf
```

Tambahkan di bagian paling bawah:
```
listener 1883
listener 9002
protocol websockets
allow_anonymous true
```

Simpan, lalu restart:
```bash
sudo systemctl restart mosquitto
```

Verifikasi Mosquitto berjalan di port yang benar:
```bash
sudo ss -tlnp | grep mosquitto
```

Harus muncul port `1883` dan `9002`.

### Langkah 6 — Konfigurasi Apache

Aktifkan mod_rewrite:
```bash
sudo a2enmod rewrite
```

Pastikan `AllowOverride All` aktif. Buka:
```bash
sudo nano /etc/apache2/apache2.conf
```

Cari bagian `<Directory /var/www/>` dan ubah `AllowOverride None` menjadi:
```apache
<Directory /var/www/>
    Options Indexes FollowSymLinks
    AllowOverride All
    Require all granted
</Directory>
```

Restart Apache:
```bash
sudo systemctl restart apache2
```

### Langkah 7 — Akses Dashboard

| Halaman | URL |
|---------|-----|
| Dashboard | `http://localhost/smart-garden-lite/dashboard.php` |
| Pengaturan | `http://localhost/smart-garden-lite/settings.php` |
| Sistem | `http://localhost/smart-garden-lite/sistem.php` |
| Panduan | `http://localhost/smart-garden-lite/panduan.php` |
| Admin | `http://localhost/smart-garden-lite/admin/login.php` |

---

## Linux — Arch / Manjaro

### Langkah 1 — Install Prerequisites

```bash
sudo pacman -Syu
sudo pacman -S php apache mariadb mosquitto git unzip
```

Inisialisasi MariaDB (hanya pertama kali):
```bash
sudo mysql_install_db --user=mysql --basedir=/usr --datadir=/var/lib/mysql
```

Aktifkan semua service:
```bash
sudo systemctl enable --now httpd mariadb mosquitto
```

Aktifkan ekstensi PHP yang dibutuhkan. Buka `/etc/php/php.ini`:
```bash
sudo nano /etc/php/php.ini
```

Cari baris berikut dan hapus tanda `;` di depannya (uncomment):
```
;extension=mysqli
;extension=pdo_mysql
```

Menjadi:
```
extension=mysqli
extension=pdo_mysql
```

Restart Apache:
```bash
sudo systemctl restart httpd
```

### Langkah 2 — Dapatkan File Project

Pilih salah satu cara:

**Via Git:**
```bash
cd /srv/http
sudo git clone -b lite https://github.com/Adri158/smart-garden.git smart-garden-lite
```

**Via ZIP:**
```bash
cd ~
unzip smart-garden-lite-v1.0.0.zip
sudo mv smart-garden-lite /srv/http/
```

Set permission:
```bash
sudo chown -R http:http /srv/http/smart-garden-lite
sudo chmod -R 755 /srv/http/smart-garden-lite
```

### Langkah 3 — Setup Database

```bash
sudo mysql -u root
```
```sql
CREATE DATABASE smartgarden CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

> Import manual jika diperlukan:
> ```bash
> sudo mysql -u root smartgarden < /srv/http/smart-garden-lite/setup.sql
> ```

### Langkah 4 — Konfigurasi .env

```bash
cd /srv/http/smart-garden-lite
sudo cp .env.example .env
sudo nano .env
```

```env
DB_HOST=127.0.0.1
DB_NAME=smartgarden
DB_USER=root
DB_PASS=

ADMIN_USER=admin
ADMIN_PASS=password_kamu_yang_kuat

API_KEY=isi_dengan_string_acak_panjang

# Kosongkan untuk lokal — otomatis terdeteksi
# Isi jika deploy ke server publik: wss://mqtt.domainkamu.com
MQTT_WS_URL=
```

```bash
sudo chmod 640 /srv/http/smart-garden-lite/.env
```

### Langkah 5 — Konfigurasi Mosquitto

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

### Langkah 6 — Konfigurasi Apache

Buka `/etc/httpd/conf/httpd.conf`:
```bash
sudo nano /etc/httpd/conf/httpd.conf
```

Pastikan baris ini tidak di-comment (hapus `#` jika ada):
```apache
LoadModule rewrite_module modules/mod_rewrite.so
```

Tambahkan di bagian paling bawah file:
```apache
<Directory "/srv/http/smart-garden-lite">
    AllowOverride All
    Require all granted
</Directory>
```

```bash
sudo systemctl restart httpd
```

### Langkah 7 — Akses Dashboard

| Halaman | URL |
|---------|-----|
| Dashboard | `http://localhost/smart-garden-lite/dashboard.php` |
| Pengaturan | `http://localhost/smart-garden-lite/settings.php` |
| Sistem | `http://localhost/smart-garden-lite/sistem.php` |
| Panduan | `http://localhost/smart-garden-lite/panduan.php` |
| Admin | `http://localhost/smart-garden-lite/admin/login.php` |

---

## macOS

### Langkah 1 — Install Homebrew

Jika belum ada:
```bash
/bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
```

### Langkah 2 — Install Prerequisites

```bash
brew install php mariadb mosquitto httpd git
brew services start mariadb mosquitto httpd
```

Verifikasi:
```bash
brew services list
```

Pastikan `mariadb`, `mosquitto`, dan `httpd` statusnya `started`.

### Langkah 3 — Dapatkan File Project

Pilih salah satu cara:

**Via Git:**
```bash
git clone -b lite https://github.com/Adri158/smart-garden.git /usr/local/var/www/smart-garden-lite
```

**Via ZIP:**
```bash
cd ~
unzip smart-garden-lite-v1.0.0.zip
cp -r smart-garden-lite /usr/local/var/www/
```

### Langkah 4 — Setup Database

```bash
mysql -u root
```
```sql
CREATE DATABASE smartgarden CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
EXIT;
```

> Import manual jika diperlukan:
> ```bash
> mysql -u root smartgarden < /usr/local/var/www/smart-garden-lite/setup.sql
> ```

### Langkah 5 — Konfigurasi .env

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
ADMIN_PASS=password_kamu_yang_kuat

API_KEY=isi_dengan_string_acak_panjang

# Kosongkan untuk lokal — otomatis terdeteksi
# Isi jika deploy ke server publik: wss://mqtt.domainkamu.com
MQTT_WS_URL=
```

```bash
chmod 640 /usr/local/var/www/smart-garden-lite/.env
```

### Langkah 6 — Konfigurasi Mosquitto

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

### Langkah 7 — Konfigurasi Apache

```bash
nano /usr/local/etc/httpd/httpd.conf
```

Pastikan baris ini tidak di-comment:
```apache
LoadModule rewrite_module lib/httpd/modules/mod_rewrite.so
LoadModule php_module /usr/local/opt/php/lib/httpd/modules/libphp.so
```

Tambahkan di bagian bawah:
```apache
<Directory "/usr/local/var/www/smart-garden-lite">
    AllowOverride All
    Require all granted
</Directory>
```

```bash
brew services restart httpd
```

### Langkah 8 — Akses Dashboard

> Apache Homebrew default berjalan di port **8080**.

| Halaman | URL |
|---------|-----|
| Dashboard | `http://localhost:8080/smart-garden-lite/dashboard.php` |
| Pengaturan | `http://localhost:8080/smart-garden-lite/settings.php` |
| Sistem | `http://localhost:8080/smart-garden-lite/sistem.php` |
| Panduan | `http://localhost:8080/smart-garden-lite/panduan.php` |
| Admin | `http://localhost:8080/smart-garden-lite/admin/login.php` |

---

## Penjelasan File .env

| Variabel | Wajib | Penjelasan |
|----------|:-----:|------------|
| `DB_HOST` | ✅ | Host database. Gunakan `127.0.0.1` (bukan `localhost`) untuk menghindari masalah socket di Linux |
| `DB_NAME` | ✅ | Nama database. Default: `smartgarden` |
| `DB_USER` | ✅ | Username database. Default XAMPP/MariaDB: `root` |
| `DB_PASS` | — | Password database. Kosong jika tidak ada password |
| `ADMIN_USER` | ✅ | Username untuk login admin panel |
| `ADMIN_PASS` | ✅ | Password admin. **Ganti dari default!** Minimal 8 karakter |
| `API_KEY` | ✅ | Kunci API untuk ESP32 mengirim data sensor. Buat string acak panjang, contoh: `sg_a8f3k2m9x1p7q4n6` |
| `MQTT_WS_URL` | — | URL broker MQTT untuk koneksi publik. **Kosongkan jika hanya pakai lokal** — otomatis terdeteksi. Isi jika deploy ke server publik, contoh: `wss://mqtt.domainkamu.com` |

**Cara generate API_KEY yang aman:**

```bash
# Linux / macOS
openssl rand -hex 32

# Windows (PowerShell)
[System.Web.Security.Membership]::GeneratePassword(32, 0)
```

---

## Login Pertama & Ganti Password

1. Akses `http://localhost/smart-garden-lite/admin/login.php`
2. Login dengan:
   - Username: sesuai `ADMIN_USER` di `.env`
   - Password: sesuai `ADMIN_PASS` di `.env`

> Jika `.env` belum diisi, login default adalah `admin` / `admin123`.

3. Setelah login, segera ganti password melalui menu **Admin Panel → Akun**

---

## Menghubungkan ESP32

Jika kamu ingin menghubungkan hardware ESP32 ke dashboard:

1. Buka `firmware/ini.ino` di Arduino IDE
2. Install library yang dibutuhkan melalui **Library Manager**:
   - `DHT sensor library` by Adafruit
   - `DallasTemperature` by Miles Burton
   - `PubSubClient` by Nick O'Leary
   - `ArduinoJson` by Benoit Blanchon
   - `WiFiManager` by tzapu
3. Ubah konfigurasi MQTT server di file firmware:
   ```cpp
   const char* mqtt_server = "IP_SERVER_KAMU";
   // Contoh: "192.168.1.10" atau "namadomain.local"
   ```
4. Pilih board **ESP32 Dev Module** di menu Tools → Board
5. Pilih port yang sesuai → klik **Upload**
6. Saat pertama kali nyala, ESP32 akan membuat hotspot WiFi → hubungkan dari HP/laptop → isi SSID dan password WiFi kamu
7. ESP32 akan connect ke WiFi dan mulai kirim data ke MQTT broker

---

## Troubleshooting

### Dashboard tidak bisa dibuka

- Pastikan Apache / httpd berjalan
- Cek path folder sudah benar
- Cek error log Apache:
  - Ubuntu: `sudo tail -f /var/log/apache2/error.log`
  - Arch: `sudo journalctl -u httpd -f`
  - Windows: buka XAMPP → Apache → Logs → `error.log`

### Data sensor tidak muncul / MQTT tidak connect

- Pastikan Mosquitto berjalan dan port `9002` aktif
- Cek dengan: `sudo ss -tlnp | grep 9002` (Linux) atau `netstat -ano | findstr 9002` (Windows)
- Pastikan konfigurasi `listener 9002` + `protocol websockets` sudah ada di `mosquitto.conf`
- Buka browser DevTools (F12) → tab **Console** — cek apakah ada error koneksi MQTT

### Tidak bisa konek ke database

- Pastikan MariaDB / MySQL berjalan
- Cek `DB_HOST` di `.env` menggunakan `127.0.0.1` bukan `localhost`
- Coba konek manual: `mysql -u root -p -h 127.0.0.1`
- Pastikan database `smartgarden` sudah dibuat

### Permission denied (Linux)

```bash
# Ubuntu / Debian
sudo chown -R www-data:www-data /var/www/html/smart-garden-lite
sudo chmod -R 755 /var/www/html/smart-garden-lite

# Arch / Manjaro
sudo chown -R http:http /srv/http/smart-garden-lite
sudo chmod -R 755 /srv/http/smart-garden-lite
```

### File .env tidak terbaca

- Pastikan file bernama `.env` (bukan `.env.txt` atau `.env.example`)
- Pastikan file ada di root folder project (sejajar dengan `dashboard.php`)
- Windows: pastikan "Show file extensions" aktif di File Explorer agar bisa melihat ekstensi file

### Lupa password admin

Jalankan perintah SQL berikut (ganti `password_baru` dengan password yang diinginkan):

```bash
# Linux
mysql -u root smartgarden
```
```sql
UPDATE admins SET password = '$2y$10$hash_baru' WHERE username = 'admin';
```

Atau lebih mudah, edit `.env` ubah `ADMIN_PASS`, lalu hapus user admin dari database agar dibuat ulang:
```sql
DELETE FROM admins WHERE username = 'admin';
EXIT;
```

Kemudian akses dashboard sekali — admin akan dibuat ulang dari nilai `.env`.

---

*Butuh bantuan lebih lanjut? Buka [Issues](https://github.com/Adri158/smart-garden/issues) di GitHub.*
