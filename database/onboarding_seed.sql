-- ============================================================
-- ONBOARDING TEST DATA SEED SCRIPT
-- Purpose: Seed sample data for testing new client onboarding
-- Run after: database/setup_database.sql
-- ============================================================

USE `livestock-management-app`;

-- ============================================
-- 1. Create Test Admin User
-- ============================================
INSERT INTO users (id, email, password_hash, name, role, permissions, hire_date) VALUES
(
  UUID(),
  'test.user@livestock.local',
  '$2b$10$tmKJ9PY9j6K6YxyY0txZJumwTBGVCxdj0SaKxg0F1eqg1dh572v36',
  'Test User',
  'admin',
  '{"read","write","delete","manage_animals"}',
  CURDATE()
);

-- ============================================
-- 2. Create Sample Roles/Permissions
-- ============================================
-- Ensure permissions table has entries
INSERT IGNORE INTO permissions (permission_key, description, category) VALUES
('read', 'Read access to data', 'general'),
('write', 'Write/modify data', 'general'),
('delete', 'Delete data', 'general'),
('manage_users', 'Create/modify users and roles', 'admin'),
('manage_animals', 'Create/modify animal records', 'operations'),
('manage_financial', 'View/edit financial records', 'finance'),
('view_reports', 'View production reports', 'operations'),
('manage_health', 'Manage health events', 'operations');

-- ============================================
-- 3. Create Sample Breeds
-- ============================================
INSERT IGNORE INTO breeds (id, species, name, growth_rate, lactation_capacity, gestation_period, description) VALUES
('HOLSTEIN', 'dairy_cattle', 'Holstein', 1.8, 2600.00, 283, 'High milk producing dairy breed'),
('JERSEY', 'dairy_cattle', 'Jersey', 1.5, 2000.00, 278, 'Rich butterfat dairy breed'),
('ANGUS', 'beef_cattle', 'Angus', 2.2, 0, 210, 'Premium beef cattle breed'),
('HERESTON', 'beef_cattle', 'Hereford', 2.0, 0, 210, 'Good beef cattle for crossbreeding'),
('DEBRINE', 'sheep', 'Debrine', 2.1, 0, 150, 'Commercial sheep breed'),
('LARGE_WHITE', 'pigs', 'Large White', 0.5, 0, 114, 'Commercial swine breed'),
('WHITE_LEGHORN', 'poultry', 'White Leghorn', 0.02, 250, 0, 'High egg production chicken');

-- ============================================
-- 4. Create Sample Locations
-- ============================================
-- (Using locationName field in animals table)
-- Common fields: Barn A, Barn B, Pasture 1, Pasture 2, etc.

-- ============================================
-- 5. Create Sample Farm (via animals)
-- ============================================
-- Add sample animals to demonstrate features

-- Dairy Cows
INSERT INTO animals (id, ear_tag, name, gender, species, breed, birth_date, status, location_id, location_name, current_weight, health_score, genetic_value) VALUES
(UUID(), 'DC-001', 'Daisy', 'female', 'dairy_cattle', 'Holstein', DATE_SUB(CURDATE(), INTERVAL 5 YEAR), 'active', 'barn-a', 'Barn A', 650.00, 92.0, 78.5),
(UUID(), 'DC-002', 'Butter', 'female', 'dairy_cattle', 'Jersey', DATE_SUB(CURDATE(), INTERVAL 4 YEAR), 'active', 'barn-a', 'Barn A', 420.00, 88.0, 72.3),
(UUID(), 'DC-003', 'Goldie', 'female', 'dairy_cattle', 'Holstein', DATE_SUB(CURDATE(), INTERVAL 3 YEAR), 'active', 'barn-b', 'Barn B', 580.00, 94.0, 81.2);

-- Beef Cattle (FIX: Now visible!)
INSERT INTO animals (id, ear_tag, name, gender, species, breed, birth_date, status, location_id, location_name, current_weight, health_score, genetic_value) VALUES
(UUID(), 'BC-001', 'Buddy', 'male', 'beef_cattle', 'Angus', DATE_SUB(CURDATE(), INTERVAL 4 YEAR), 'active', 'pasture-1', 'Pasture North', 780.00, 90.0, 85.5),
(UUID(), 'BC-002', 'Bella', 'female', 'beef_cattle', 'Angus', DATE_SUB(CURDATE(), INTERVAL 3 YEAR), 'active', 'pasture-1', 'Pasture North', 650.00, 93.0, 82.1),
(UUID(), 'BC-003', 'Rex', 'male', 'beef_cattle', 'Hereford', DATE_SUB(CURDATE(), INTERVAL 5 YEAR), 'active', 'pasture-2', 'Pasture South', 820.00, 88.0, 80.3);

-- Sheep
INSERT INTO animals (id, ear_tag, name, gender, species, breed, birth_date, status, location_id, location_name, current_weight, health_score, genetic_value) VALUES
(UUID(), 'SH-001', 'Wooly', 'male', 'sheep', 'Debrine', DATE_SUB(CURDATE(), INTERVAL 1 YEAR), 'active', 'shed-1', 'Sheep Shed', 85.00, 95.0, 65.0),
(UUID(), 'SH-002', 'Snowflake', 'female', 'sheep', 'Debrine', DATE_SUB(CURDATE(), INTERVAL 1 YEAR), 'active', 'shed-1', 'Sheep Shed', 82.00, 93.0, 62.5);

-- ============================================
-- 6. Create Sample Tasks
-- ============================================
INSERT INTO tasks (id, title, description, status, priority, category, due_date, location, related_animal_id) VALUES
(UUID(), 'Health Check - Dairy Cows', 'Monthly health assessment for dairy cows', 'todo', 'high', 'health', DATE_ADD(CURDATE(), INTERVAL 3 DAY), 'Barn A', NULL),
(UUID(), 'Weight Measurement - Beef Cattle', 'Record current weights for beef cattle', 'todo', 'medium', 'health', DATE_ADD(CURDATE(), INTERVAL 5 DAY), 'Pasture North', 'BC-001'),
(UUID(), 'Vaccination Schedule', 'Review and schedule vaccinations', 'todo', 'high', 'health', DATE_ADD(CURDATE(), INTERVAL 7 DAY), 'Farm', NULL);

-- ============================================
-- 7. Create Sample Health Events
-- ============================================
INSERT INTO health_events (id, animal_id, type, date, description, veterinarian_id, veterinarian_name, cost, next_due_date) VALUES
(UUID(), 'DC-001', 'vaccination', DATE_SUB(CURDATE(), INTERVAL 2 MONTH), 'Clostridial vaccination', 'vets-001', 'Dr. Smith', 25.00, DATE_ADD(CURDATE(), INTERVAL 12 MONTH)),
(UUID(), 'BC-001', 'health_check', DATE_SUB(CURDATE(), INTERVAL 1 WEEK), 'Routine health check', 'vets-001', 'Dr. Smith', 50.00, DATE_ADD(CURDATE(), INTERVAL 1 MONTH));

-- ============================================
-- 8. Vaccination Schedules
-- ============================================
INSERT INTO vaccination_schedules (id, vaccine, age_months, dose, route, applicable_breeds, valid_for_months) VALUES
(UUID(), 'Clostridial (CD&T)', 1, '1', 'Subcutaneous', '["all"]', 12),
(UUID(), 'Leptospirosis', 1, '1', 'Subcutaneous', '["all"]', 6),
(UUID(), 'Rabies', 3, '1', 'Subcutaneous', '["all"]', 12);

-- ============================================
-- 9. Summary Statistics
-- ============================================
SELECT '=== ONBOARDING TEST DATA CREATED ===' as message;
SELECT CONCAT('Users: ', COUNT(*)) as users FROM users
UNION ALL
SELECT CONCAT('Animals: ', COUNT(*)) FROM animals
UNION ALL
SELECT CONCAT('Species: ', COUNT(DISTINCT species)) FROM animals
UNION ALL
SELECT CONCAT('Breeds seeded: ', COUNT(*)) FROM breeds
UNION ALL
SELECT CONCAT('Tasks created: ', COUNT(*)) FROM tasks;