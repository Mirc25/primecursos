-- Script para crear base de datos y usuario para WordPress
-- Edita la contraseña antes de ejecutar
CREATE DATABASE IF NOT EXISTS `wordpress` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER IF NOT EXISTS 'wpuser'@'localhost' IDENTIFIED BY 'WP_PASSWORD_HERE';
GRANT ALL PRIVILEGES ON `wordpress`.* TO 'wpuser'@'localhost';
FLUSH PRIVILEGES;
