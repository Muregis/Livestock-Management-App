-- ============================================================
-- MySQL Database Schema for Livestock Management System
-- Security Enhanced Version
-- ============================================================

-- ------------------------------------------------------------
-- USERS TABLE (For Authentication & RBAC)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(36) NOT NULL PRIMARY KEY,
    email VARCHAR(100) NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    role ENUM('superadmin', 'admin', 'manager', 'veterinarian', 'farmhand', 'viewer') NOT NULL DEFAULT 'viewer',
    permissions JSON NOT NULL,
    avatar VARCHAR(255),
    phone VARCHAR(20),
    birth_date DATE,
    hire_date DATE NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    last_login TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY email_unique (email),
    INDEX idx_users_role (role),
    INDEX idx_users_active (is_active)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- PERMISSIONS TABLE (For RBAC)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS permissions (
    permission_key VARCHAR(50) NOT NULL PRIMARY KEY,
    description TEXT NOT NULL,
    category VARCHAR(50) DEFAULT 'general',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT IGNORE INTO permissions (permission_key, description, category) VALUES
('read', 'Read access to data', 'general'),
('write', 'Write/modify data', 'general'),
('delete', 'Delete data', 'general'),
('manage_users', 'Create/modify users and roles', 'admin'),
('manage_animals', 'Create/modify animal records', 'operations'),
('manage_financial', 'View/edit financial records', 'finance');

-- ------------------------------------------------------------
-- ANIMALS TABLE (with Species Support - FIXES beef cow visibility)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS animals (
    id VARCHAR(36) NOT NULL PRIMARY KEY,
    ear_tag VARCHAR(50) NOT NULL,
    name VARCHAR(100),
    gender ENUM('male', 'female') NOT NULL,
    breed VARCHAR(50) NOT NULL,
    species ENUM('dairy_cattle', 'beef_cattle', 'sheep', 'goats', 'poultry', 'rabbits', 'pigs', 'horses', 'buffalo', 'camel', 'other') DEFAULT 'dairy_cattle',
    sire_id VARCHAR(36),
    dam_id VARCHAR(36),
    birth_date DATETIME NOT NULL,
    status ENUM('active', 'sold', 'deceased', 'quarantine') NOT NULL DEFAULT 'active',
    location_id VARCHAR(50) NOT NULL,
    location_name VARCHAR(100),
    acquisition_date DATETIME,
    acquisition_cost DECIMAL(10,2),
    current_weight DECIMAL(8,2),
    expected_weight DECIMAL(8,2),
    milk_production_today DECIMAL(10,2),
    milk_production_lifetime DECIMAL(12,2),
    days_in_milk INT DEFAULT 0,
    body_condition_score DECIMAL(3,1),
    genetic_value DECIMAL(5,2),
    health_score DECIMAL(5,1),
    productivity_score DECIMAL(5,1),
    age_in_days INT,
    age_display VARCHAR(50),
    is_pregnant BOOLEAN DEFAULT FALSE,
    expected_calving_date DATETIME,
    last_milk_date DATETIME,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY ear_tag_unique (ear_tag),
    INDEX idx_animals_status (status),
    INDEX idx_animals_location (location_id),
    INDEX idx_animals_gender_breed (gender, breed),
    INDEX idx_animals_birth_date (birth_date),
    INDEX idx_animals_genetic_value (genetic_value),
    INDEX idx_animals_species (species),
    INDEX idx_animals_pregnant (is_pregnant),
    INDEX idx_animals_expected_calving (expected_calving_date),
    FOREIGN KEY (sire_id) REFERENCES animals(id) ON DELETE SET NULL,
    FOREIGN KEY (dam_id) REFERENCES animals(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- HEALTH EVENTS TABLE
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS health_events (
    id VARCHAR(36) NOT NULL PRIMARY KEY,
    animal_id VARCHAR(36) NOT NULL,
    type ENUM('vaccination', 'treatment', 'health_check', 'disease_outbreak', 'parasite_check', 'castration', 'ewe_rapping', 'hoof_trim', 'dental') NOT NULL,
    date DATE NOT NULL,
    description TEXT NOT NULL,
    veterinarian_id VARCHAR(50),
    veterinarian_name VARCHAR(100),
    cost DECIMAL(10,2) DEFAULT 0,
    notes TEXT,
    next_due_date DATETIME,
    related_event_id VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (animal_id) REFERENCES animals(id) ON DELETE CASCADE,
    INDEX idx_health_events_animal (animal_id),
    INDEX idx_health_events_type_date (type, date),
    INDEX idx_health_events_next_due (next_due_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- BREEDING EVENTS TABLE
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS breeding_events (
    id VARCHAR(36) NOT NULL PRIMARY KEY,
    dam_id VARCHAR(36) NOT NULL,
    sire_id VARCHAR(36),
    bull_name VARCHAR(100),
    service_date DATETIME NOT NULL,
    method ENUM('AI', 'Natural') NOT NULL,
    expected_calving_date DATETIME NOT NULL,
    actual_calving_date DATETIME,
    outcome ENUM('pregnant', 'not_pregnant', 'c_section', 'stillborn', 'aborted'),
    calf_id VARCHAR(36),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (dam_id) REFERENCES animals(id) ON DELETE CASCADE,
    FOREIGN KEY (sire_id) REFERENCES animals(id) ON DELETE SET NULL,
    FOREIGN KEY (calf_id) REFERENCES animals(id) ON DELETE SET NULL,
    INDEX idx_breeding_dam (dam_id),
    INDEX idx_breeding_expected_calving (expected_calving_date),
    INDEX idx_breeding_outcome (outcome),
    INDEX idx_breding_service_date (service_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- FEED CONSUMPTION TABLE
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS feed_consumption (
    id VARCHAR(36) NOT NULL PRIMARY KEY,
    animal_id VARCHAR(36) NOT NULL,
    feed_type ENUM('hay', 'silage', 'grain', 'supplement', 'mineral') NOT NULL,
    quantity DECIMAL(10,2) NOT NULL,
    unit VARCHAR(20) DEFAULT 'kg',
    date DATETIME NOT NULL,
    notes TEXT,
    FOREIGN KEY (animal_id) REFERENCES animals(id) ON DELETE CASCADE,
    INDEX idx_feed_consumption_animal (animal_id),
    INDEX idx_feed_consumption_date_type (date, feed_type),
    INDEX idx_feed_consumption_date (date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- FEED INVENTORY TABLE
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS feed_inventory (
    id VARCHAR(36) NOT NULL PRIMARY KEY,
    feed_type ENUM('hay', 'silage', 'grain', 'supplement', 'mineral') NOT NULL,
    start_date DATETIME NOT NULL,
    end_date DATETIME,
    quantity_received DECIMAL(12,2) NOT NULL,
    quantity_consumed DECIMAL(12,2) DEFAULT 0,
    quantity_remaining DECIMAL(12,2) NOT NULL,
    cost_per_unit DECIMAL(10,2) NOT NULL,
    supplier VARCHAR(100) NOT NULL,
    storage_location VARCHAR(100) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_feed_inventory_type (feed_type),
    INDEX idx_feed_inventory_remaining (quantity_remaining),
    INDEX idx_feed_inventory_dates (start_date, end_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- FINANCIAL RECORDS TABLE
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS financial_records (
    id VARCHAR(36) NOT NULL PRIMARY KEY,
    type ENUM('birth', 'sale', 'veterinary', 'feed', 'labor', 'other') NOT NULL,
    date DATETIME NOT NULL,
    amount DECIMAL(12,2) NOT NULL,
    description TEXT NOT NULL,
    related_animal_id VARCHAR(36),
    related_event_id VARCHAR(36),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (related_animal_id) REFERENCES animals(id) ON DELETE SET NULL,
    INDEX idx_financial_date_type (date, type),
    INDEX idx_financial_related (related_animal_id),
    INDEX idx_financial_type (type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- TASKS TABLE
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS tasks (
    id VARCHAR(36) NOT NULL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    status ENUM('todo', 'in-progress', 'done') NOT NULL DEFAULT 'todo',
    priority ENUM('high', 'medium', 'low') NOT NULL DEFAULT 'medium',
    category ENUM('feeding', 'health', 'maintenance', 'milking', 'breeding') NOT NULL,
    assignee_name VARCHAR(100),
    assignee_avatar VARCHAR(255),
    due_date DATE NOT NULL,
    estimated_time VARCHAR(50),
    location VARCHAR(100),
    related_animal_id VARCHAR(36),
    recurring BOOLEAN DEFAULT FALSE,
    recurrence_pattern ENUM('daily', 'weekly', 'monthly'),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (related_animal_id) REFERENCES animals(id) ON DELETE SET NULL,
    INDEX idx_tasks_due_date (due_date),
    INDEX idx_tasks_status_priority (status, priority),
    INDEX idx_tasks_category (category),
    INDEX idx_tasks_assignee (assignee_name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- WORKERS TABLE
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS workers (
    id VARCHAR(36) NOT NULL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    role ENUM('Veterinarian', 'Farm Hand', 'Milking Specialist', 'Maintenance', 'Manager', 'Nutritionist', 'Breeding Specialist', 'Sales Agent') NOT NULL,
    status ENUM('Active', 'On Leave', 'Off Duty') NOT NULL DEFAULT 'Active',
    avatar VARCHAR(255),
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(100) NOT NULL,
    location VARCHAR(100) NOT NULL,
    start_date DATE NOT NULL,
    specialization TEXT,
    current_tasks INT DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_workers_role (role),
    INDEX idx_workers_status (status),
    INDEX idx_workers_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- REPORTS TABLE
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS reports (
    id VARCHAR(36) NOT NULL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    date DATE NOT NULL,
    type ENUM('Production', 'Health', 'Inventory', 'Breeding', 'Maintenance', 'Compliance', 'Financial') NOT NULL,
    status ENUM('Completed', 'Processing') NOT NULL DEFAULT 'Completed',
    description TEXT,
    data JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_reports_type_status (type, status),
    INDEX idx_reports_date (date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- BREEDS TABLE (For Species Support and Data Normalization)
-- FIX: Added to support expanded livestock types (beef cattle, etc.)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS breeds (
    id VARCHAR(50) NOT NULL PRIMARY KEY,
    species ENUM('dairy_cattle', 'beef_cattle', 'sheep', 'goats', 'poultry', 'rabbits', 'pigs', 'horses', 'buffalo', 'camel', 'other') NOT NULL,
    name VARCHAR(100) NOT NULL,
    growth_rate DECIMAL(4,2) DEFAULT 2.0,
    lactation_capacity DECIMAL(6,2) DEFAULT 0,
    gestation_period INT DEFAULT 283,
    description TEXT,
    UNIQUE KEY unique_breed_per_species (species, name)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Seed breed data
INSERT IGNORE INTO breeds (id, species, name, growth_rate, lactation_capacity, gestation_period, description) VALUES
('HOLSTEIN', 'dairy_cattle', 'Holstein', 1.8, 2600.00, 283, 'High milk producing dairy breed'),
('JERSEY', 'dairy_cattle', 'Jersey', 1.5, 2000.00, 278, 'Rich butterfat dairy breed'),
('ANGUS', 'beef_cattle', 'Angus', 2.2, 0, 210, 'Premium beef cattle breed'),
('HERESTON', 'beef_cattle', 'Hereford', 2.0, 0, 210, 'Good beef cattle for crossbreeding'),
('SUFFOLK', 'sheep', 'Suffolk', 1.8, 0, 152, 'Hardy sheep breed'),
('DEBRINE', 'sheep', 'Debrine', 2.1, 0, 150, 'Commercial sheep breed'),
('TEXEL', 'sheep', 'Texel', 2.0, 0, 150, 'Muscular meat sheep'),
('WHITE_LEGHORN', 'poultry', 'White Leghorn', 0.02, 250, 0, 'High egg production chicken'),
('RHODE_ISLAND_RED', 'poultry', 'Rhode Island Red', 0.025, 220, 0, 'Dual purpose chicken'),
('LARGE_WHITE', 'pigs', 'Large White', 0.5, 0, 114, 'Commercial swine breed'),
('ARABIAN', 'horses', 'Arabian', 0.9, 0, 336, 'Endurance horse breed'),
('THOROUGHBRED', 'horses', 'Thoroughbred', 0.7, 0, 365, 'Racehorse breed'),
('BUFFALO_SILK', 'buffalo', 'Buffalo Silk', 2.5, 1500, 310, 'Water buffalo for dairy'),
('DROMEDARY', 'camel', 'Dromedary', 0.9, 600, 380, 'Single hump camel');

-- ------------------------------------------------------------
-- VACCINATION SCHEDULES TABLE
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS vaccination_schedules (
    id VARCHAR(36) NOT NULL PRIMARY KEY,
    vaccine VARCHAR(100) NOT NULL,
    age_months INT NOT NULL,
    dose VARCHAR(50) NOT NULL,
    route VARCHAR(50) NOT NULL,
    applicable_breeds JSON NOT NULL,
    contraindications JSON,
    valid_for_months INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_vaccination_age (age_months)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- ERROR LOGS TABLE (For Security Auditing)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS error_logs (
    id VARCHAR(36) NOT NULL PRIMARY KEY DEFAULT (UUID()),
    error_message TEXT NOT NULL,
    stack_trace LONGTEXT,
    user_id VARCHAR(36),
    location VARCHAR(255),
    severity ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_error_logs_severity (severity),
    INDEX idx_error_logs_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- AUDIT LOG TABLE (For Compliance)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS audit_log (
    id VARCHAR(36) NOT NULL PRIMARY KEY DEFAULT (UUID()),
    table_name VARCHAR(50) NOT NULL,
    record_id VARCHAR(36) NOT NULL,
    action ENUM('INSERT', 'UPDATE', 'DELETE') NOT NULL,
    old_values JSON,
    new_values JSON,
    user_id VARCHAR(36),
    ip_address VARCHAR(45),
    user_agent TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
    INDEX idx_audit_table (table_name),
    INDEX idx_audit_record (record_id),
    INDEX idx_audit_user (user_id),
    INDEX idx_audit_created (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ------------------------------------------------------------
-- VIEWS
-- ------------------------------------------------------------
CREATE OR REPLACE VIEW v_animal_dashboard AS
SELECT 
    a.id,
    a.ear_tag,
    a.name,
    a.species,
    a.breed,
    a.gender,
    COALESCE(a.age_in_days, 0) as age_in_days,
    COALESCE(a.health_score, 75) as health_score,
    a.milk_production_today,
    a.current_weight,
    a.genetic_value,
    a.status,
    a.location_name,
    CONCAT(FLOOR(COALESCE(a.age_in_days, 0) / 365), 'y ', FLOOR((COALESCE(a.age_in_days, 0) % 365) / 30), 'm') as age_display,
    CASE WHEN COALESCE(a.health_score, 75) < 50 THEN 'critical' WHEN COALESCE(a.health_score, 75) < 70 THEN 'warning' ELSE 'normal' END as health_risk,
    CASE a.species WHEN 'dairy_cattle' THEN 'dairy' WHEN 'beef_cattle' THEN 'beef' WHEN 'sheep' THEN 'small_ruminant' WHEN 'goats' THEN 'small_ruminant' WHEN 'poultry' THEN 'poultry' WHEN 'rabbits' THEN 'small_mammal' WHEN 'pigs' THEN 'swine' ELSE 'other' END as species_category
FROM animals a 
WHERE a.status = 'active';