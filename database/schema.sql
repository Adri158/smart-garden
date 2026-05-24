-- Smart Garden — Database Schema
-- Jalanin file ini di MariaDB/MySQL untuk membuat semua tabel yang dibutuhkan
--
-- Cara pakai:
--   mysql -u root -p < database/schema.sql
-- atau import lewat phpMyAdmin / DBeaver / MySQL Workbench

CREATE DATABASE IF NOT EXISTS smartgarden CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE smartgarden;

-- ─────────────────────────────────────────────────────────────────────────────
-- Devices — daftar perangkat ESP32
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS devices (
    device_id   VARCHAR(64)  NOT NULL,
    name        VARCHAR(128) DEFAULT NULL,
    created_at  TIMESTAMP    NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (device_id)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- Sensor Logs — histori pembacaan sensor
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS sensor_logs (
    id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    device_id   VARCHAR(64)     NOT NULL,
    soil        FLOAT           DEFAULT NULL,  -- kelembaban tanah (%)
    temp_dht    FLOAT           DEFAULT NULL,  -- suhu udara °C (DHT11)
    temp_ds     FLOAT           DEFAULT NULL,  -- suhu air °C (DS18B20)
    humidity    FLOAT           DEFAULT NULL,  -- kelembaban udara (%)
    relay       TINYINT         DEFAULT NULL,  -- 0 = OFF, 1 = ON
    mode        VARCHAR(16)     DEFAULT NULL,  -- 'AUTO' atau 'MANUAL'
    created_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    INDEX idx_device_time (device_id, created_at),
    FOREIGN KEY (device_id) REFERENCES devices(device_id)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- Settings — konfigurasi global
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS settings (
    key_name    VARCHAR(64)  NOT NULL,
    value       VARCHAR(255) DEFAULT NULL,
    PRIMARY KEY (key_name)
);

-- Nilai default
INSERT IGNORE INTO settings (key_name, value) VALUES
    ('soil_min',         '40'),    -- batas bawah kelembaban tanah (%)
    ('soil_max',         '80'),    -- batas atas kelembaban tanah (%)
    ('temp_max',         '35'),    -- suhu maksimal (°C)
    ('hum_min',          '30'),    -- kelembaban udara minimum (%)
    ('publish_interval', '5000'); -- interval kirim data sensor (ms)

-- ─────────────────────────────────────────────────────────────────────────────
-- Device Settings — override settings per perangkat
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS device_settings (
    device_id   VARCHAR(64)  NOT NULL,
    key_name    VARCHAR(64)  NOT NULL,
    value       VARCHAR(255) DEFAULT NULL,
    PRIMARY KEY (device_id, key_name),
    FOREIGN KEY (device_id) REFERENCES devices(device_id)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- Schedules — jadwal penyiraman otomatis
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS schedules (
    id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    days        VARCHAR(32)     NOT NULL,  -- CSV hari: 0=Minggu, 1=Senin, ..., 6=Sabtu
    time        VARCHAR(8)      NOT NULL,  -- format HH:MM
    enabled     TINYINT(1)      NOT NULL DEFAULT 1,
    created_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- Feedback — masukan dari pengguna
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS feedback (
    id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    nama        VARCHAR(128)    DEFAULT NULL,
    email       VARCHAR(255)    DEFAULT NULL,
    category    VARCHAR(32)     DEFAULT NULL,
    pesan       TEXT            NOT NULL,
    rating      TINYINT         NOT NULL DEFAULT 0,
    reply       TEXT            DEFAULT NULL,
    reply_by    VARCHAR(128)    DEFAULT NULL,
    reply_at    TIMESTAMP       DEFAULT NULL,
    ip          VARCHAR(64)     DEFAULT NULL,
    created_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id)
);

-- ─────────────────────────────────────────────────────────────────────────────
-- Admins — akun admin dashboard
-- ─────────────────────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS admins (
    id          BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
    username    VARCHAR(64)     NOT NULL,
    name        VARCHAR(128)    DEFAULT NULL,
    password    VARCHAR(255)    NOT NULL,  -- bcrypt hash
    created_at  TIMESTAMP       NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    UNIQUE KEY uq_username (username)
);
