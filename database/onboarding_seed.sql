-- ============================================================
-- ONBOARDING TEST DATA SEED SCRIPT (Supabase / PostgreSQL)
-- Purpose: Seed sample data for testing new client onboarding
-- Run after: database/setup_database.sql
-- ============================================================

-- ============================================
-- 0. Ensure Permissions Exist
-- ============================================
insert into permissions (permission_key, description, category) values
('read', 'Read access to data', 'general'),
('write', 'Write/modify data', 'general'),
('delete', 'Delete data', 'general'),
('manage_users', 'Create/modify users and roles', 'admin'),
('manage_animals', 'Create/modify animal records', 'operations'),
('manage_financial', 'View/edit financial records', 'finance'),
('view_reports', 'View production reports', 'operations'),
('manage_health', 'Manage health events', 'operations')
on conflict (permission_key) do nothing;

-- ============================================
-- 1. Create Test Admin User
-- ============================================
insert into users (id, email, password_hash, name, role, permissions, hire_date)
values (
  uuid_generate_v4(),
  'test.user@livestock.local',
  '$2b$10$tmKJ9PY9j6K6YxyY0txZJumwTBGVCxdj0SaKxg0F1eqg1dh572v36',
  'Test User',
  'admin',
  '["read","write","delete","manage_animals"]'::jsonb,
  CURRENT_DATE
)
on conflict (email) do nothing;

-- ============================================
-- 2. Create Sample Breeds
-- ============================================
insert into breeds (id, species, name, growth_rate, lactation_capacity, gestation_period, description) values
('HOLSTEIN', 'dairy_cattle', 'Holstein', 1.8, 2600.00, 283, 'High milk producing dairy breed'),
('JERSEY', 'dairy_cattle', 'Jersey', 1.5, 2000.00, 278, 'Rich butterfat dairy breed'),
('ANGUS', 'beef_cattle', 'Angus', 2.2, 0, 210, 'Premium beef cattle breed'),
('HERESTON', 'beef_cattle', 'Hereford', 2.0, 0, 210, 'Good beef cattle for crossbreeding'),
('DEBRINE', 'sheep', 'Debrine', 2.1, 0, 150, 'Commercial sheep breed'),
('LARGE_WHITE', 'pigs', 'Large White', 0.5, 0, 114, 'Commercial swine breed'),
('WHITE_LEGHORN', 'poultry', 'White Leghorn', 0.02, 250, 0, 'High egg production chicken')
on conflict do nothing;

-- ============================================
-- 3. Create Sample Locations
-- ============================================
-- (Using location_name field in animals table — no separate table)
-- Common values: Barn A, Barn B, Pasture 1, Pasture 2, etc.

-- ============================================
-- 4. Create Sample Farm Animals
-- Fixed UUID literals used so later inserts (tasks, health_events)
-- can reference specific animals reliably.
-- ============================================

-- Dairy Cows
insert into animals (id, ear_tag, name, gender, species, breed, birth_date, status, location_id, location_name, current_weight, health_score, genetic_value) values
('a1000000-0000-0000-0000-000000000001', 'DC-001', 'Daisy', 'female', 'dairy_cattle', 'Holstein', CURRENT_DATE - INTERVAL '5 years', 'active', 'barn-a', 'Barn A', 650.00, 92.0, 78.5),
('a1000000-0000-0000-0000-000000000002', 'DC-002', 'Butter', 'female', 'dairy_cattle', 'Jersey', CURRENT_DATE - INTERVAL '4 years', 'active', 'barn-a', 'Barn A', 420.00, 88.0, 72.3),
('a1000000-0000-0000-0000-000000000003', 'DC-003', 'Goldie', 'female', 'dairy_cattle', 'Holstein', CURRENT_DATE - INTERVAL '3 years', 'active', 'barn-b', 'Barn B', 580.00, 94.0, 81.2)
on conflict (ear_tag) do nothing;

-- Beef Cattle
insert into animals (id, ear_tag, name, gender, species, breed, birth_date, status, location_id, location_name, current_weight, health_score, genetic_value) values
('a2000000-0000-0000-0000-000000000001', 'BC-001', 'Buddy', 'male', 'beef_cattle', 'Angus', CURRENT_DATE - INTERVAL '4 years', 'active', 'pasture-1', 'Pasture North', 780.00, 90.0, 85.5),
('a2000000-0000-0000-0000-000000000002', 'BC-002', 'Bella', 'female', 'beef_cattle', 'Angus', CURRENT_DATE - INTERVAL '3 years', 'active', 'pasture-1', 'Pasture North', 650.00, 93.0, 82.1),
('a2000000-0000-0000-0000-000000000003', 'BC-003', 'Rex', 'male', 'beef_cattle', 'Hereford', CURRENT_DATE - INTERVAL '5 years', 'active', 'pasture-2', 'Pasture South', 820.00, 88.0, 80.3)
on conflict (ear_tag) do nothing;

-- Sheep
insert into animals (id, ear_tag, name, gender, species, breed, birth_date, status, location_id, location_name, current_weight, health_score, genetic_value) values
('a3000000-0000-0000-0000-000000000001', 'SH-001', 'Wooly', 'male', 'sheep', 'Debrine', CURRENT_DATE - INTERVAL '1 year', 'active', 'shed-1', 'Sheep Shed', 85.00, 95.0, 65.0),
('a3000000-0000-0000-0000-000000000002', 'SH-002', 'Snowflake', 'female', 'sheep', 'Debrine', CURRENT_DATE - INTERVAL '1 year', 'active', 'shed-1', 'Sheep Shed', 82.00, 93.0, 62.5)
on conflict (ear_tag) do nothing;

-- ============================================
-- 5. Create Sample Tasks
-- related_animal_id must be a real animals.id (uuid), not an ear tag.
-- ============================================
insert into tasks (id, title, description, status, priority, category, due_date, location, related_animal_id) values
(uuid_generate_v4(), 'Health Check - Dairy Cows', 'Monthly health assessment for dairy cows', 'todo', 'high', 'health', CURRENT_DATE + INTERVAL '3 days', 'Barn A', null),
(uuid_generate_v4(), 'Weight Measurement - Beef Cattle', 'Record current weights for beef cattle', 'todo', 'medium', 'health', CURRENT_DATE + INTERVAL '5 days', 'Pasture North', 'a2000000-0000-0000-0000-000000000001'),
(uuid_generate_v4(), 'Vaccination Schedule', 'Review and schedule vaccinations', 'todo', 'high', 'health', CURRENT_DATE + INTERVAL '7 days', 'Farm', null);

-- ============================================
-- 6. Create Sample Health Events
-- animal_id must be a real animals.id (uuid), not an ear tag.
-- ============================================
insert into health_events (id, animal_id, type, date, description, veterinarian_id, veterinarian_name, cost, next_due_date) values
(uuid_generate_v4(), 'a1000000-0000-0000-0000-000000000001', 'vaccination', CURRENT_DATE - INTERVAL '2 months', 'Clostridial vaccination', 'vets-001', 'Dr. Smith', 25.00, CURRENT_DATE + INTERVAL '12 months'),
(uuid_generate_v4(), 'a2000000-0000-0000-0000-000000000001', 'health_check', CURRENT_DATE - INTERVAL '1 week', 'Routine health check', 'vets-001', 'Dr. Smith', 50.00, CURRENT_DATE + INTERVAL '1 month');

-- ============================================
-- 7. Vaccination Schedules
-- (id column already defaults to uuid_generate_v4() in schema — omit it)
-- ============================================
insert into vaccination_schedules (vaccine, age_months, dose, route, applicable_breeds, valid_for_months) values
('Clostridial (CD&T)', 1, '1', 'Subcutaneous', '["all"]'::jsonb, 12),
('Leptospirosis', 1, '1', 'Subcutaneous', '["all"]'::jsonb, 6),
('Rabies', 3, '1', 'Subcutaneous', '["all"]'::jsonb, 12)
on conflict do nothing;

-- ============================================
-- 8. Summary Statistics
-- ============================================
select '=== ONBOARDING TEST DATA CREATED ===' as message;

select 'Users: ' || count(*) as summary from users
union all
select 'Animals: ' || count(*) from animals
union all
select 'Species: ' || count(distinct species) from animals
union all
select 'Breeds seeded: ' || count(*) from breeds
union all
select 'Tasks created: ' || count(*) from tasks;