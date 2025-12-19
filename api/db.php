<?php

// Very simple DB configuration – matches what you asked for.
define('DB_HOST', '127.0.0.1');
define('DB_USER', 'root');
define('DB_PASSWORD', '');
define('DB_NAME', 'nirvix');  // This database must exist in MySQL
define('DB_PORT', 3306);

/**
 * Get a mysqli connection to the nirvix database
 * and ensure required tables exist.
 *
 * @return mysqli
 */
function getDbConnection()
{
    static $conn = null;

    if ($conn instanceof mysqli) {
        return $conn;
    }

    // Connect directly to the nirvix DB
    $conn = @new mysqli(DB_HOST, DB_USER, DB_PASSWORD, DB_NAME, DB_PORT);

    if ($conn->connect_error) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error' => 'Database connection failed: ' . $conn->connect_error,
        ]);
        exit;
    }

    ensureProjectsTable($conn);
    ensureUpcomingProjectsTable($conn);
    ensureClientsTable($conn);
    ensureServersTable($conn);
    ensureDomainsTable($conn);
    ensureTeamTable($conn);

    return $conn;
}

/**
 * Ensure the projects table exists.
 *
 * @param mysqli $conn
 * @return void
 */
function ensureProjectsTable(mysqli $conn): void
{
    $sql = "
        CREATE TABLE IF NOT EXISTS projects (
            id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL UNIQUE,
            url TEXT NULL,
            type VARCHAR(100) NULL,
            tech_stack TEXT NULL,
            handled_by VARCHAR(255) NULL,
            renewal_date VARCHAR(100) NULL,
            status VARCHAR(50) DEFAULT 'Active',
            client VARCHAR(255) NULL,
            description TEXT NULL,
            assigned_to TEXT NULL,
            deadline DATE NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ";

    if (!$conn->query($sql)) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error' => 'Failed to create projects table: ' . $conn->error,
        ]);
        exit;
    }
}

/**
 * Ensure the upcoming_projects table exists.
 */
function ensureUpcomingProjectsTable(mysqli $conn): void
{
    $sql = "
        CREATE TABLE IF NOT EXISTS upcoming_projects (
            id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            code VARCHAR(50) NULL,
            name VARCHAR(255) NOT NULL,
            client VARCHAR(255) NULL,
            description TEXT NULL,
            tech_stack TEXT NULL,
            status VARCHAR(50) DEFAULT 'Upcoming',
            deadline VARCHAR(100) NULL,
            assigned_to TEXT NULL,
            created_at DATETIME NULL,
            updated_at DATETIME NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ";

    if (!$conn->query($sql)) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error' => 'Failed to create upcoming_projects table: ' . $conn->error,
        ]);
        exit;
    }
}

/**
 * Ensure the clients table exists.
 */
function ensureClientsTable(mysqli $conn): void
{
    $sql = "
        CREATE TABLE IF NOT EXISTS clients (
            id VARCHAR(50) PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            industry VARCHAR(100) NULL,
            contact_person VARCHAR(255) NULL,
            email VARCHAR(255) NULL,
            phone VARCHAR(50) NULL,
            projects TEXT NULL,
            total_value DECIMAL(15,2) DEFAULT 0,
            since DATE NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ";

    if (!$conn->query($sql)) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error' => 'Failed to create clients table: ' . $conn->error,
        ]);
        exit;
    }
}

/**
 * Ensure the servers table exists.
 */
function ensureServersTable(mysqli $conn): void
{
    $sql = "
        CREATE TABLE IF NOT EXISTS servers (
            id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            ip VARCHAR(45) NULL,
            url TEXT NULL,
            nameservers TEXT NULL,
            websites TEXT NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ";

    if (!$conn->query($sql)) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error' => 'Failed to create servers table: ' . $conn->error,
        ]);
        exit;
    }
}

/**
 * Ensure the domains table exists.
 */
function ensureDomainsTable(mysqli $conn): void
{
    $sql = "
        CREATE TABLE IF NOT EXISTS domains (
            id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL UNIQUE,
            renewal_date VARCHAR(100) NULL,
            status VARCHAR(50) DEFAULT 'Active'
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ";

    if (!$conn->query($sql)) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error' => 'Failed to create domains table: ' . $conn->error,
        ]);
        exit;
    }
}

/**
 * Ensure the team table exists.
 */
function ensureTeamTable(mysqli $conn): void
{
    $sql = "
        CREATE TABLE IF NOT EXISTS team (
            id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
            name VARCHAR(255) NOT NULL,
            role VARCHAR(255) NULL,
            email VARCHAR(255) NULL,
            skills TEXT NULL,
            avatar TEXT NULL
        ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
    ";

    if (!$conn->query($sql)) {
        http_response_code(500);
        echo json_encode([
            'success' => false,
            'error' => 'Failed to create team table: ' . $conn->error,
        ]);
        exit;
    }
}

