-- Smart Garden Lite — Database Setup
-- Run: mysql -u root -p < setup.sql

CREATE DATABASE IF NOT EXISTS smartgarden
  CHARACTER SET utf8mb4
  COLLATE utf8mb4_unicode_ci;

USE smartgarden;

CREATE TABLE IF NOT EXISTS admins (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  username   VARCHAR(60)  NOT NULL UNIQUE,
  password   VARCHAR(255) NOT NULL,
  name       VARCHAR(100) DEFAULT NULL,
  email      VARCHAR(120) DEFAULT NULL,
  created_at DATETIME     DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS devices (
  device_id  VARCHAR(60)  PRIMARY KEY,
  name       VARCHAR(100) DEFAULT NULL,
  created_at DATETIME     DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS sensor_logs (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  device_id  VARCHAR(60)  DEFAULT NULL,
  soil       FLOAT        DEFAULT NULL,
  temp_dht   FLOAT        DEFAULT NULL,
  temp_ds    FLOAT        DEFAULT NULL,
  humidity   FLOAT        DEFAULT NULL,
  relay      TINYINT(1)   DEFAULT NULL,
  mode       VARCHAR(10)  DEFAULT NULL,
  created_at DATETIME     DEFAULT CURRENT_TIMESTAMP,
  INDEX idx_created (created_at),
  INDEX idx_device  (device_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS settings (
  key_name   VARCHAR(60)  PRIMARY KEY,
  value      VARCHAR(255) NOT NULL,
  updated_at DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS device_settings (
  device_id  VARCHAR(60)  NOT NULL,
  key_name   VARCHAR(60)  NOT NULL,
  value      VARCHAR(255) NOT NULL,
  updated_at DATETIME     DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (device_id, key_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS schedules (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  days       VARCHAR(20)  NOT NULL,
  time       VARCHAR(5)   NOT NULL,
  enabled    TINYINT(1)   DEFAULT 1,
  created_at DATETIME     DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS feedback (
  id         INT AUTO_INCREMENT PRIMARY KEY,
  nama       VARCHAR(80)  DEFAULT NULL,
  email      VARCHAR(120) DEFAULT NULL,
  category   VARCHAR(20)  NOT NULL DEFAULT 'lainnya',
  pesan      TEXT         NOT NULL,
  rating     TINYINT      DEFAULT 0,
  ip         VARCHAR(45)  DEFAULT NULL,
  reply      TEXT         DEFAULT NULL,
  reply_by   VARCHAR(60)  DEFAULT NULL,
  reply_at   DATETIME     DEFAULT NULL,
  created_at DATETIME     DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

INSERT IGNORE INTO settings (key_name, value) VALUES
  ('soil_min',         '30'),
  ('soil_max',         '80'),
  ('temp_max',         '35'),
  ('hum_min',          '40'),
  ('publish_interval', '5'),
  ('device_id',        '');

-- Default admin: username=admin, password=admin123 — GANTI SETELAH INSTALL
INSERT IGNORE INTO admins (username, password, name) VALUES
  ('admin', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Administrator');
