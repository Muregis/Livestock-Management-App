-- ============================================================
-- SETUP SCRIPT - Create database for hyphenated name
-- Run this FIRST in HeidiSQL/MySQL
-- Database: livestock-management-app
-- ============================================================

-- Create database with proper character set
CREATE DATABASE IF NOT EXISTS `livestock-management-app`
CHARACTER SET utf8mb4
COLLATE utf8mb4_unicode_ci;

-- Use the database (backticks required for hyphenated name)
USE `livestock-management-app`;

-- Show created database
SELECT 'Database created successfully: livestock-management-app' as status;
SELECT SCHEMA_NAME, DEFAULT_CHARACTER_SET_NAME, DEFAULT_COLLATION_NAME
FROM information_schema.SCHEMATA
WHERE SCHEMA_NAME = 'livestock-management-app';