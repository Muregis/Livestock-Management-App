<?php
/**
 * Migration Runner - Livestock Management System
 * Usage: php run_migrations.php [--dry-run]
 */

require_once __DIR__ . '/run_migration.php';

use function DatabaseMigration;

// Parse command line arguments
$dryRun = in_array('--dry-run', $argv);

echo "=== Livestock Management Migration Runner ===\n\n";

if ($dryRun) {
    echo "DRY RUN MODE - No changes will be made\n\n";
}

try {
    // Load environment variables
    $envFile = __DIR__ . '/.env';
    if (file_exists($envFile)) {
        $lines = file($envFile, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);
        foreach ($lines as $line) {
            if (strpos($line, '#') === 0) continue;
            putenv(trim($line));
        }
    }

    // Load config if exists
    $configFile = __DIR__ . '/config.php';
    $config = file_exists($configFile) ? require $configFile : require __DIR__ . '/config.php.example';

    // Create migration instance
    $migration = new DatabaseMigration(
        $config['host'] ?? $_ENV['DB_HOST'] ?? 'localhost',
        $config['dbname'] ?? $_ENV['DB_NAME'] ?? 'livestock_management',
        $config['username'] ?? $_ENV['DB_USER'] ?? 'root',
        $config['password'] ?? $_ENV['DB_PASS'] ?? '',
        $config['port'] ?? $_ENV['DB_PORT'] ?? 3306
    );

    if ($dryRun) {
        echo "Would connect to: {$config['host']}:{$config['port']}/{$config['dbname']}\n";
        echo "As user: {$config['username']}\n\n";
    } else {
        $migration->runAllMigrations();
        
        $report = $migration->getReport();
        
        foreach ($report['successes'] as $success) {
            echo "[✓] $success\n";
        }
        
        foreach ($report['errors'] as $error) {
            echo "[✗] $error\n";
        }
        
        echo "\n--- Summary ---\n";
        echo "Successful: {$report['summary']['successful_operations']}\n";
        echo "Failed: {$report['summary']['failed_operations']}\n";
    }
    
} catch (Exception $e) {
    echo "[ERROR] " . $e->getMessage() . "\n";
    exit(1);
}