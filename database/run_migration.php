<?php
/**
 * Livestock Management System - MySQL Migration Script
 * PHP 8.0+ recommended
 */

declare(strict_types=1);

class DatabaseMigration
{
    private PDO $pdo;
    private array $errors = [];
    private array $successes = [];

    public function __construct(
        string $host = 'localhost',
        string $dbname = 'livestock_management',
        string $username = 'root',
        string $password = '',
        int $port = 3306
    ) {
        try {
            $dsn = "mysql:host={$host};dbname={$dbname};charset=utf8mb4";
            $this->pdo = new PDO(
                $dsn,
                $username,
                $password,
                [
                    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                    PDO::ATTR_EMULATE_PREPARES => false,
                ]
            );
        } catch (PDOException $e) {
            throw new RuntimeException("Database connection failed: " . $e->getMessage());
        }
    }

    public function runAllMigrations(): self
    {
        $this->runUserTableMigration();
        $this->runAnimalSpeciesMigration();
        $this->runBreedsTable();
        $this->runErrorLogTable();
        $this->runAuditLogTable();
        $this->runPermissionsTable();
        $this->runTriggers();
        $this->runViews();
        $this->runFunctions();
        
        return $this;
    }

    private function runUserTableMigration(): void
    {
        $sql = <<<'SQL'
            CREATE TABLE IF NOT EXISTS users (
                id VARCHAR(36) PRIMARY KEY,
                email VARCHAR(100) NOT NULL UNIQUE,
                password_hash VARCHAR(255) NOT NULL,
                name VARCHAR(100) NOT NULL,
                role ENUM('superadmin', 'admin', 'manager', 'veterinarian', 'farmhand', 'viewer') NOT NULL DEFAULT 'viewer',
                permissions JSON NOT NULL DEFAULT JSON_ARRAY('read'),
                avatar VARCHAR(255),
                phone VARCHAR(20),
                birth_date DATE,
                hire_date DATE NOT NULL DEFAULT (CURRENT_DATE()),
                is_active BOOLEAN DEFAULT TRUE,
                last_login TIMESTAMP NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
                
                INDEX idx_users_email (email),
                INDEX idx_users_role (role),
                INDEX idx_users_active (is_active)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            SQL;
        
        $this->executeStatement($sql, 'User table migrated successfully');

        // Add default admin user (change password immediately!)
        $adminPassword = password_hash(bin2hex(random_bytes(16)), PASSWORD_DEFAULT);
        $stmt = $this->pdo->prepare(
            "INSERT IGNORE INTO users (id, email, password_hash, name, role, permissions, hire_date) 
             VALUES (UUID(), 'admin@livestock.local', ?, 'System Administrator', 'superadmin', 
                     JSON_ARRAY('read', 'write', 'delete', 'manage_users', 'manage_animals', 'manage_financial'), 
                     CURRENT_DATE())"
        );
        $stmt->execute([$adminPassword]);
        $this->successes[] = "Default admin user created - CHANGE PASSWORD IMMEDIATELY";
    }

    private function runAnimalSpeciesMigration(): void
    {
        $sql = <<<'SQL'
            ALTER TABLE animals 
            ADD COLUMN IF NOT EXISTS species ENUM(
                'dairy_cattle', 'beef_cattle', 'sheep', 'goats', 
                'poultry', 'rabbits', 'pigs', 'horses', 
                'buffalo', 'camel', 'other'
            ) DEFAULT 'dairy_cattle'
            SQL;
        $this->executeStatement($sql, 'Species column added');

        $sql2 = <<<'SQL'
            ALTER TABLE animals
            ADD COLUMN IF NOT EXISTS is_pregnant BOOLEAN DEFAULT FALSE AFTER health_score,
            ADD COLUMN IF NOT EXISTS expected_calving_date DATETIME NULL AFTER is_pregnant,
            ADD COLUMN IF NOT EXISTS last_milk_date DATETIME NULL AFTER expected_calving_date
            SQL;
        $this->executeStatement($sql2, 'Pregnancy columns added');

        $sql3 = <<<'SQL'
            CREATE INDEX IF NOT EXISTS idx_animals_species ON animals(species),
            CREATE INDEX IF NOT EXISTS idx_animals_pregnant ON animals(is_pregnant),
            CREATE INDEX IF NOT EXISTS idx_animals_expected_calving ON animals(expected_calving_date)
            SQL;
        $this->executeStatement($sql3, 'Species indexes created');
    }

    private function runBreedsTable(): void
    {
        $sql = <<<'SQL'
            CREATE TABLE IF NOT EXISTS breeds (
                id VARCHAR(50) PRIMARY KEY,
                species ENUM('dairy_cattle', 'beef_cattle', 'sheep', 'goats', 'poultry', 'rabbits', 'pigs', 'horses', 'buffalo', 'camel', 'other') NOT NULL,
                name VARCHAR(100) NOT NULL,
                growth_rate DECIMAL(4,2) DEFAULT 2.0,
                lactation_capacity DECIMAL(6,2) DEFAULT 0,
                gestation_period INT DEFAULT 283,
                description TEXT,
                
                UNIQUE KEY unique_breed_per_species (species, name)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            SQL;
        
        $this->executeStatement($sql, 'Breeds table created');

        // Insert breed data using prepared statement
        $breeds = [
            ['HOLSTEIN', 'dairy_cattle', 'Holstein', 1.8, 2600.00, 283, 'High milk producing breed'],
            ['JERSEY', 'dairy_cattle', 'Jersey', 1.5, 2000.00, 278, 'Rich butterfat content'],
            ['ANGUS', 'beef_cattle', 'Angus', 2.2, 0, 210, 'Premium beef breed'],
            ['HERESTON', 'beef_cattle', 'Hereford', 2.0, 0, 210, 'Good beef cattle'],
            ['SUFFOLK', 'sheep', 'Suffolk', 1.8, 0, 152, 'Hardy sheep breed'],
            ['WHITE_LEGHORN', 'poultry', 'White Leghorn', 0.02, 250, 0, 'High egg production'],
            ['LARGE_WHITE', 'pigs', 'Large White', 0.5, 0, 114, 'Commercial swine breed'],
            ['ARABIAN', 'horses', 'Arabian', 0.8, 0, 336, 'Endurance horse breed'],
            ['BUFFALO_SILK', 'buffalo', 'Buffalo Silk', 2.5, 1500, 310, 'Water buffalo breed'],
            ['DROMEDARY', 'camel', 'Dromedary', 0.9, 600, 380, 'Single hump camel']
        ];

        $stmt = $this->pdo->prepare(
            "INSERT IGNORE INTO breeds (id, species, name, growth_rate, lactation_capacity, gestation_period, description)
             VALUES (?, ?, ?, ?, ?, ?, ?)"
        );

        foreach ($breeds as $breed) {
            $stmt->execute($breed);
        }
        $this->successes[] = "Breed data inserted (" . count($breeds) . " breeds)";
    }

    private function runErrorLogTable(): void
    {
        $sql = <<<'SQL'
            CREATE TABLE IF NOT EXISTS error_logs (
                id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
                error_message TEXT NOT NULL,
                stack_trace LONGTEXT,
                user_id VARCHAR(36),
                location VARCHAR(255),
                severity ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                
                FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
                INDEX idx_error_logs_severity (severity),
                INDEX idx_error_logs_created (created_at)
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            SQL;
        
        $this->executeStatement($sql, 'Error logs table created');
    }

    private function runAuditLogTable(): void
    {
        $sql = <<<'SQL'
            CREATE TABLE IF NOT EXISTS audit_log (
                id VARCHAR(36) PRIMARY KEY DEFAULT (UUID()),
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
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            SQL;
        
        $this->executeStatement($sql, 'Audit log table created');
    }

    private function runPermissionsTable(): void
    {
        $sql = <<<'SQL'
            CREATE TABLE IF NOT EXISTS permissions (
                permission_key VARCHAR(50) PRIMARY KEY,
                description TEXT NOT NULL,
                category ENUM('general', 'admin', 'operations', 'finance', 'health') DEFAULT 'general',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
            SQL;
        
        $this->executeStatement($sql, 'Permissions table created');

        // Insert standard permissions
        $permissions = [
            ['read', 'Read access to data', 'general'],
            ['write', 'Write/modify data', 'general'],
            ['delete', 'Delete data', 'general'],
            ['manage_users', 'Create/modify users and roles', 'admin'],
            ['manage_animals', 'Create/modify animal records', 'operations'],
            ['manage_financial', 'View/edit financial records', 'finance']
        ];

        $stmt = $this->pdo->prepare(
            "INSERT IGNORE INTO permissions (permission_key, description, category) VALUES (?, ?, ?)"
        );

        foreach ($permissions as $permission) {
            $stmt->execute($permission);
        }
        $this->successes[] = "Permissions seeded (" . count($permissions) . " permissions)";
    }

    private function runTriggers(): void
    {
        // Drop existing triggers if they exist
        $dropTriggers = [
            "DROP TRIGGER IF EXISTS validate_animal_birth_date",
            "DROP TRIGGER IF EXISTS validate_animal_birth_date_update",
            "DROP TRIGGER IF EXISTS validate_ear_tag",
            "DROP TRIGGER IF EXISTS update_animal_metadata",
            "DROP TRIGGER IF EXISTS validate_feed_type",
            "DROP TRIGGER IF EXISTS validate_task_category"
        ];

        foreach ($dropTriggers as $drop) {
            $this->executeStatement($drop, 'Drop trigger executed');
        }

        // Create birth date validation trigger
        $trigger1 = <<<'SQL'
            CREATE TRIGGER validate_animal_birth_date
            BEFORE INSERT ON animals
            FOR EACH ROW
            BEGIN
                IF NEW.birth_date > NOW() THEN
                    SIGNAL SQLSTATE '45000' 
                    SET MESSAGE_TEXT = 'Birth date cannot be in the future';
                END IF;
            END
            SQL;
        $this->executeStatement($trigger1, 'Birth date validation trigger created');

        // Create update birth date trigger
        $trigger2 = <<<'SQL'
            CREATE TRIGGER validate_animal_birth_date_update
            BEFORE UPDATE ON animals
            FOR EACH ROW
            BEGIN
                IF NEW.birth_date > NOW() THEN
                    SIGNAL SQLSTATE '45000' 
                    SET MESSAGE_TEXT = 'Birth date cannot be in the future';
                END IF;
            END
            SQL;
        $this->executeStatement($trigger2, 'Update birth date trigger created');

        // Create ear tag validation trigger
        $trigger3 = <<<'SQL'
            CREATE TRIGGER validate_ear_tag
            BEFORE INSERT ON animals
            FOR EACH ROW
            BEGIN
                IF NEW.ear_tag IS NULL OR TRIM(NEW.ear_tag) = '' THEN
                    SIGNAL SQLSTATE '45000' 
                    SET MESSAGE_TEXT = 'Ear tag is required';
                END IF;
            END
            SQL;
        $this->executeStatement($trigger3, 'Ear tag validation trigger created');

        // Create metadata update trigger
        $trigger4 = $this->getMetadataTriggerSql();
        $this->executeStatement($trigger4, 'Metadata auto-update trigger created');

        // Create feed type validation
        $trigger5 = $this->getFeedTypeTriggerSql();
        $this->executeStatement($trigger5, 'Feed type validation trigger created');

        // Create task category validation
        $trigger6 = $this->getTaskCategoryTriggerSql();
        $this->executeStatement($trigger6, 'Task category validation trigger created');
    }

    private function getMetadataTriggerSql(): string
    {
        return "CREATE TRIGGER update_animal_metadata
            BEFORE INSERT ON animals
            FOR EACH ROW
            BEGIN
                DECLARE age_days INT DEFAULT 0;
                
                SET age_days = DATEDIFF(CURDATE(), NEW.birth_date);
                SET NEW.age_in_days = age_days;
                
                IF NEW.body_condition_score IS NOT NULL THEN
                    IF NEW.body_condition_score < 2 THEN
                        SET NEW.health_score = 50;
                    ELSEIF NEW.body_condition_score > 3.5 THEN
                        SET NEW.health_score = 70;
                    ELSE
                        SET NEW.health_score = 80;
                    END IF;
                ELSE
                    SET NEW.health_score = 75;
                END IF;
            END";
    }

    private function getFeedTypeTriggerSql(): string
    {
        return "CREATE TRIGGER validate_feed_type
            BEFORE INSERT ON feed_consumption
            FOR EACH ROW
            BEGIN
                IF NEW.feed_type NOT IN ('hay', 'silage', 'grain', 'supplement', 'mineral') THEN
                    SIGNAL SQLSTATE '45000' 
                    SET MESSAGE_TEXT = 'Invalid feed type';
                END IF;
            END";
    }

    private function getTaskCategoryTriggerSql(): string
    {
        return "CREATE TRIGGER validate_task_category
            BEFORE INSERT ON tasks
            FOR EACH ROW
            BEGIN
                IF NEW.category NOT IN ('feeding', 'health', 'maintenance', 'milking', 'breeding') THEN
                    SIGNAL SQLSTATE '45000' 
                    SET MESSAGE_TEXT = 'Invalid task category';
                END IF;
            END";
    }

    private function runViews(): void
    {
        // Animal dashboard view
        $view1 = "CREATE OR REPLACE VIEW v_animal_dashboard AS
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
                CONCAT(
                    FLOOR(COALESCE(a.age_in_days, 0) / 365), 'y ',
                    FLOOR((COALESCE(a.age_in_days, 0) % 365) / 30), 'm'
                ) as age_display,
                CASE 
                    WHEN COALESCE(a.health_score, 75) < 50 THEN 'critical'
                    WHEN COALESCE(a.health_score, 75) < 70 THEN 'warning'
                    ELSE 'normal'
                END as health_risk,
                CASE a.species
                    WHEN 'dairy_cattle' THEN 'dairy'
                    WHEN 'beef_cattle' THEN 'beef'
                    WHEN 'sheep' THEN 'small_ruminant'
                    WHEN 'goats' THEN 'small_ruminant'
                    WHEN 'poultry' THEN 'poultry'
                    WHEN 'rabbits' THEN 'small_mammal'
                    WHEN 'pigs' THEN 'swine'
                    ELSE 'other'
                END as species_category
            FROM animals a
            WHERE a.status = 'active'";

        $this->executeStatement($view1, 'Animal dashboard view created');

        // User permissions view
        $view2 = "CREATE OR REPLACE VIEW user_permissions_view AS
            SELECT 
                u.id as user_id,
                u.name,
                u.role,
                JSON_EXTRACT(u.permissions, '$') as permissions_json
            FROM users u
            WHERE u.is_active = TRUE";

        $this->executeStatement($view2, 'User permissions view created');
    }

    private function runFunctions(): void
    {
        // Weight ratio calculation function with division by zero protection
        $func1 = $this->getWeightRatioFunction();
        $this->executeStatement($func1, 'Weight ratio function created');
    }

    private function getWeightRatioFunction(): string
    {
        return "CREATE FUNCTION calculate_weight_ratio(
            p_current_weight DECIMAL(10,2),
            p_expected_weight DECIMAL(10,2)
        ) RETURNS DECIMAL(5,4)
        READS SQL DATA
        DETERMINISTIC
        BEGIN
            DECLARE ratio DECIMAL(5,4) DEFAULT 0.0000;
            
            IF p_expected_weight IS NULL OR p_expected_weight <= 0 THEN
                RETURN 0.0000;
            ELSE
                SET ratio = p_current_weight / p_expected_weight;
                RETURN ratio;
            END IF;
        END";
    }

    private function executeStatement(string $sql, string $successMessage): void
    {
        try {
            $this->pdo->exec($sql);
            $this->successes[] = $successMessage;
        } catch (PDOException $e) {
            // Don't fail on IF NOT EXISTS or similar
            if (strpos($e->getMessage(), 'IF NOT EXISTS') !== false ||
                strpos($e->getMessage(), '1060') !== false ||
                strpos($e->getMessage(), 'Duplicate entry') !== false) {
                return;
            }
            $this->errors[] = "Error: " . $sql . " - " . $e->getMessage();
        }
    }

    public function getReport(): array
    {
        return [
            'successes' => $this->successes,
            'errors' => $this->errors,
            'summary' => [
                'successful_operations' => count($this->successes),
                'failed_operations' => count($this->errors)
            ]
        ];
    }

    public function getJsonReport(): string
    {
        return json_encode($this->getReport(), JSON_PRETTY_PRINT);
    }
}

// Run migration if executed directly
if (php_sapi_name() === 'cli' || basename(__FILE__) === basename($_SERVER['SCRIPT_NAME'] ?? '')) {
    echo "Running database migration...\n\n";
    
    try {
        // Update these credentials for your environment
        $host = $_ENV['DB_HOST'] ?? 'localhost';
        $dbname = $_ENV['DB_NAME'] ?? 'livestock_management';
        $username = $_ENV['DB_USER'] ?? 'root';
        $password = $_ENV['DB_PASS'] ?? '';
        
        $migration = new DatabaseMigration($host, $dbname, $username, $password);
        $migration->runAllMigrations();
        
        $report = $migration->getJsonReport();
        echo $report . "\n";
        
        echo "\n========================================\n";
        echo "Migration Complete!\n";
        echo "========================================\n";
        
    } catch (Exception $e) {
        echo "Migration failed: " . $e->getMessage() . "\n";
        exit(1);
    }
}