CREATE DATABASE IF NOT EXISTS SRMS;
USE SRMS;
CREATE TABLE IF NOT EXISTS users (id INT AUTO_INCREMENT PRIMARY KEY, username VARCHAR(50) NOT NULL UNIQUE, password VARCHAR(255) NOT NULL);
CREATE TABLE IF NOT EXISTS customers (customer_number VARCHAR(30) PRIMARY KEY, first_name VARCHAR(60) NOT NULL, last_name VARCHAR(60) NOT NULL, telephone VARCHAR(20) NOT NULL, address VARCHAR(255) NOT NULL);
CREATE TABLE IF NOT EXISTS products (product_code VARCHAR(30) PRIMARY KEY, product_name VARCHAR(100) NOT NULL, quantity_sold INT NOT NULL DEFAULT 0, unit_price DECIMAL(12,2) NOT NULL);
CREATE TABLE IF NOT EXISTS sales (invoice_number VARCHAR(30) PRIMARY KEY, sales_date DATETIME NOT NULL, payment_method VARCHAR(40) NOT NULL, total_amount_paid DECIMAL(12,2) NOT NULL, customer_number VARCHAR(30) NOT NULL,
 product_code VARCHAR(30) NOT NULL, FOREIGN KEY (customer_number) REFERENCES customers(customer_number), FOREIGN KEY (product_code) REFERENCES products(product_code));
INSERT INTO users (username, password) VALUES ('admin', '$2b$10$aULsUjp9bb9lf5CZZyY.7./KhwsocVO0duyPlqu0Qnte75xHBdG5C') ON DUPLICATE KEY UPDATE username = username;