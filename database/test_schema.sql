-- ============================================================
-- DATABASE DIAGNOSTIC SCRIPT
-- Fixed for hyphenated database name: livestock-management-app
-- Run this after applying mysql_schema.sql to verify everything
-- ============================================================

-- ============================================
-- SECTION 1: Check Database Exists
-- ============================================
SELECT 'Database: livestock-management-app' as info;
SELECT `SCHEMA_NAME`, DEFAULT_CHARACTER_SET_NAME, DEFAULT_COLLATION_NAME 
FROM information_schema.SCHEMATA 
WHERE `SCHEMA_NAME` = 'livestock-management-app';

-- ============================================
-- SECTION 2: Check Tables Exist
-- ============================================
SELECT 'Tables in database' as section, TABLE_NAME as table_name
FROM information_schema.TABLES 
WHERE `TABLE_SCHEMA` = 'livestock-management-app' 
ORDER BY TABLE_NAME;

-- ============================================
-- SECTION 3: Check Users Table (RBAC)
-- ============================================
SELECT 'Checking users table...' as status;

SELECT IF(COUNT(*) > 0, 'EXISTS', 'MISSING') as users_table_status,
        COUNT(*) as users_count
FROM information_schema.TABLES 
WHERE `TABLE_SCHEMA` = 'livestock-management-app' 
AND TABLE_NAME = 'users';

-- If table exists, check columns
SELECT COLUMN_NAME, COLUMN_TYPE, IS_NULLABLE, COLUMN_DEFAULT
FROM information_schema.COLUMNS 
WHERE `TABLE_SCHEMA` = 'livestock-management-app' 
AND TABLE_NAME = 'users'
ORDER BY ORDINAL_POSITION;

-- ============================================
-- SECTION 4: Check Permissions Table
-- ============================================
SELECT IF(COUNT(*) > 0, 'EXISTS', 'MISSING') as permissions_table_status,
       COUNT(*) as permissions_count
FROM information_schema.TABLES 
WHERE `TABLE_SCHEMA` = 'livestock-management-app' 
AND TABLE_NAME = 'permissions';

-- If exists, check data
SELECT permission_key, description, category 
FROM `livestock-management-app`.permissions 
ORDER BY permission_key;

-- ============================================
-- SECTION 5: Check Animals Table - SPECIES COLUMN (FIX FOR BEEF COWS)
-- ============================================
SELECT 'Checking animals table - species column...' as status;

SELECT IF(COUNT(*) > 0, 'EXISTS', 'MISSING') as animals_table_status,
       COUNT(*) as animals_count
FROM information_schema.TABLES 
WHERE `TABLE_SCHEMA` = 'livestock-management-app' 
AND TABLE_NAME = 'animals';

-- Check if species column exists
SELECT COLUMN_NAME, COLUMN_TYPE
FROM information_schema.COLUMNS 
WHERE `TABLE_SCHEMA` = 'livestock-management-app' 
AND TABLE_NAME = 'animals' 
AND COLUMN_NAME = 'species';

-- Check if pregnancy columns exist
SELECT COLUMN_NAME 
FROM information_schema.COLUMNS 
WHERE `TABLE_SCHEMA` = 'livestock-management-app' 
AND TABLE_NAME = 'animals' 
AND COLUMN_NAME IN ('is_pregnant', 'expected_calving_date', 'last_milk_date');

-- Check animal status distribution
SELECT status, COUNT(*) as count 
FROM `livestock-management-app`.animals 
GROUP BY status;

-- Check species distribution (VERIFIES BEEF COW VISIBLE)
SELECT species, COUNT(*) as count 
FROM `livestock-management-app`.animals 
WHERE species IS NOT NULL
GROUP BY species 
ORDER BY species;

-- ============================================
-- SECTION 6: Check Breeds Table
-- ============================================
SELECT 'Checking breeds table...' as status;
SELECT IF(COUNT(*) > 0, 'EXISTS', 'MISSING') as breeds_table_status,
       COUNT(*) as breed_count
FROM information_schema.TABLES 
WHERE `TABLE_SCHEMA` = 'livestock-management-app' 
AND TABLE_NAME = 'breeds';

SELECT id, species, name, growth_rate 
FROM `livestock-management-app`.breeds 
ORDER BY species, name;

-- ============================================
-- SECTION 7: Check Audit Tables
-- ============================================
SELECT 'Checking audit tables...' as status;

SELECT 'error_logs' as table_name, IF(COUNT(*) > 0, 'EXISTS', 'MISSING') as status
FROM information_schema.TABLES 
WHERE `TABLE_SCHEMA` = 'livestock-management-app' 
AND TABLE_NAME = 'error_logs'
UNION ALL
SELECT 'audit_log' as table_name, IF(COUNT(*) > 0, 'EXISTS', 'MISSING') as status
FROM information_schema.TABLES 
WHERE `TABLE_SCHEMA` = 'livestock-management-app' 
AND TABLE_NAME = 'audit_log';

-- ============================================
-- SECTION 8: Check Views
-- ============================================
SELECT 'Checking views...' as status;
SELECT TABLE_NAME, TABLE_TYPE
FROM information_schema.TABLES 
WHERE `TABLE_SCHEMA` = 'livestock-management-app' 
AND TABLE_TYPE = 'VIEW'
ORDER BY TABLE_NAME;

-- ============================================
-- SECTION 9: Check Indexes on Animals Table
-- ============================================
SELECT 'Indexes on animals table' as section;
SELECT INDEX_NAME, COLUMN_NAME, seq_in_index
FROM information_schema.STATISTICS 
WHERE `TABLE_SCHEMA` = 'livestock-management-app' 
AND TABLE_NAME = 'animals'
ORDER BY INDEX_NAME, seq_in_index;

-- ============================================
-- SECTION 10: MISSING ITEMS CHECK
-- ============================================
SELECT '=== MISSING ITEMS SUMMARY ===' as section;

SELECT 'users table' as item, IF(COUNT(*) > 0, 'OK', 'MISSING') as status
FROM information_schema.TABLES WHERE `TABLE_SCHEMA` = 'livestock-management-app' AND TABLE_NAME = 'users'
UNION ALL
SELECT 'permissions table' as item, IF(COUNT(*) > 0, 'OK', 'MISSING') as status
FROM information_schema.TABLES WHERE `TABLE_SCHEMA` = 'livestock-management-app' AND TABLE_NAME = 'permissions'
UNION ALL
SELECT 'animals table' as item, IF(COUNT(*) > 0, 'OK', 'MISSING') as status
FROM information_schema.TABLES WHERE `TABLE_SCHEMA` = 'livestock-management-app' AND TABLE_NAME = 'animals'
UNION ALL
SELECT 'species column' as item, IF(COUNT(*) > 0, 'OK', 'MISSING') as status
FROM information_schema.COLUMNS WHERE `TABLE_SCHEMA` = 'livestock-management-app' AND TABLE_NAME = 'animals' AND COLUMN_NAME = 'species'
UNION ALL
SELECT 'error_logs table' as item, IF(COUNT(*) > 0, 'OK', 'MISSING') as status
FROM information_schema.TABLES WHERE `TABLE_SCHEMA` = 'livestock-management-app' AND TABLE_NAME = 'error_logs'
UNION ALL
SELECT 'audit_log table' as item, IF(COUNT(*) > 0, 'OK', 'MISSING') as status
FROM information_schema.TABLES WHERE `TABLE_SCHEMA` = 'livestock-management-app' AND TABLE_NAME = 'audit_log'
UNION ALL
SELECT 'breeds table' as item, IF(COUNT(*) > 0, 'OK', 'MISSING') as status
FROM information_schema.TABLES WHERE `TABLE_SCHEMA` = 'livestock-management-app' AND TABLE_NAME = 'breeds';

-- ============================================
-- SECTION 11: DATA VERIFICATION
-- ============================================
SELECT '=== DATA VERIFICATION ===' as section;

SELECT CONCAT('Users count: ', COUNT(*)) as users_count 
FROM `livestock-management-app`.users
UNION ALL
SELECT CONCAT('Animals count: ', COUNT(*)) as animals_count 
FROM `livestock-management-app`.animals
UNION ALL
SELECT CONCAT('Permissions count: ', COUNT(*)) as permissions_count 
FROM `livestock-management-app`.permissions;

-- Check beef cattle count (VERIFIES FIX)
SELECT IF(COUNT(*) > 0, '✓ BEEF COWS ARE VISIBLE', '✗ NO BEEF COWS IN DATABASE') as status
FROM `livestock-management-app`.animals 
WHERE species = 'beef_cattle';

-- Check dairy cattle count
SELECT IF(COUNT(*) > 0, '✓ DAIRY COWS ARE VISIBLE', '✗ NO DAIRY COWS IN DATABASE') as status
FROM `livestock-management-app`.animals 
WHERE species = 'dairy_cattle';