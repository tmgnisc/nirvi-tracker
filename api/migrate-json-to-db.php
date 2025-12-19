<?php
header('Content-Type: application/json');

require_once __DIR__ . '/db.php';

$conn = getDbConnection();

// Paths to JSON files
$baseDir = dirname(__DIR__);

$mainDataPaths = [
    $baseDir . '/src/data/data.json',
    $baseDir . '/deploy/src-data/data.json',
];

$clientsPaths = [
    $baseDir . '/src/data/clients.json',
];

$upcomingProjectsPaths = [
    $baseDir . '/data/upcoming-projects.json',
    $baseDir . '/deploy/data/upcoming-projects.json',
];

function firstExistingJson(array $paths): ?array {
    foreach ($paths as $path) {
        if (file_exists($path)) {
            $content = file_get_contents($path);
            $data = json_decode($content, true);
            if (is_array($data)) {
                return $data;
            }
        }
    }
    return null;
}

try {
    // Make sure columns can store human-readable strings where needed
    $conn->query("ALTER TABLE projects MODIFY COLUMN renewal_date VARCHAR(100) NULL");
    $conn->query("ALTER TABLE projects MODIFY COLUMN deadline VARCHAR(100) NULL");
    $conn->query("ALTER TABLE upcoming_projects MODIFY COLUMN deadline VARCHAR(100) NULL");

    // Load main data (projects, upcomingProjects, servers, domains, team)
    $mainData = firstExistingJson($mainDataPaths);
    if ($mainData) {
        // Projects
        if (!empty($mainData['projects']) && is_array($mainData['projects'])) {
            $conn->query('TRUNCATE TABLE projects');
            $stmt = $conn->prepare("
                INSERT INTO projects
                    (name, url, type, tech_stack, handled_by, renewal_date, status, client, description, assigned_to, deadline)
                VALUES
                    (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            ");
            foreach ($mainData['projects'] as $p) {
                $name        = $p['name'] ?? '';
                $url         = $p['url'] ?? null;
                $type        = $p['type'] ?? null;
                $techStack   = isset($p['techStack']) ? json_encode($p['techStack']) : null;
                $handledBy   = $p['handledBy'] ?? null;
                $renewalDate = $p['renewalDate'] ?? null;
                $status      = $p['status'] ?? 'Active';
                $client      = $p['client'] ?? null;
                $description = $p['description'] ?? null;
                $assignedTo  = isset($p['assignedTo']) ? json_encode($p['assignedTo']) : null;
                $deadline    = $p['deadline'] ?? null;

                $stmt->bind_param(
                    'sssssssssss',
                    $name,
                    $url,
                    $type,
                    $techStack,
                    $handledBy,
                    $renewalDate,
                    $status,
                    $client,
                    $description,
                    $assignedTo,
                    $deadline
                );
                $stmt->execute();
            }
            $stmt->close();
        }

        // Upcoming projects (from main data)
        if (!empty($mainData['upcomingProjects']) && is_array($mainData['upcomingProjects'])) {
            $conn->query('TRUNCATE TABLE upcoming_projects');
            $stmt = $conn->prepare("
                INSERT INTO upcoming_projects
                    (name, client, description, tech_stack, status, deadline, assigned_to)
                VALUES
                    (?, ?, ?, ?, ?, ?, ?)
            ");
            foreach ($mainData['upcomingProjects'] as $up) {
                $name        = $up['name'] ?? '';
                $client      = $up['client'] ?? null;
                $description = $up['description'] ?? null;
                $techStack   = isset($up['techStack']) ? (is_array($up['techStack']) ? json_encode($up['techStack']) : $up['techStack']) : null;
                $status      = $up['status'] ?? 'Upcoming';
                $deadline    = $up['deadline'] ?? null;
                $assignedTo  = isset($up['assignedTo']) ? json_encode($up['assignedTo']) : null;

                $stmt->bind_param(
                    'sssssss',
                    $name,
                    $client,
                    $description,
                    $techStack,
                    $status,
                    $deadline,
                    $assignedTo
                );
                $stmt->execute();
            }
            $stmt->close();
        }

        // Servers
        if (!empty($mainData['servers']) && is_array($mainData['servers'])) {
            $conn->query('TRUNCATE TABLE servers');
            $stmt = $conn->prepare("
                INSERT INTO servers
                    (name, ip, url, nameservers, websites)
                VALUES
                    (?, ?, ?, ?, ?)
            ");
            foreach ($mainData['servers'] as $s) {
                $name        = $s['name'] ?? '';
                $ip          = $s['ip'] ?? null;
                $url         = $s['url'] ?? null;
                $nameservers = isset($s['nameservers']) ? json_encode($s['nameservers']) : null;
                $websites    = isset($s['websites']) ? json_encode($s['websites']) : null;

                $stmt->bind_param(
                    'sssss',
                    $name,
                    $ip,
                    $url,
                    $nameservers,
                    $websites
                );
                $stmt->execute();
            }
            $stmt->close();
        }

        // Domains
        if (!empty($mainData['domains']) && is_array($mainData['domains'])) {
            $conn->query('TRUNCATE TABLE domains');
            $stmt = $conn->prepare("
                INSERT INTO domains
                    (name, renewal_date, status)
                VALUES
                    (?, ?, ?)
            ");
            foreach ($mainData['domains'] as $d) {
                $name        = $d['name'] ?? '';
                $renewalDate = $d['renewalDate'] ?? null;
                $status      = $d['status'] ?? 'Active';

                $stmt->bind_param(
                    'sss',
                    $name,
                    $renewalDate,
                    $status
                );
                $stmt->execute();
            }
            $stmt->close();
        }

        // Team
        if (!empty($mainData['team']) && is_array($mainData['team'])) {
            $conn->query('TRUNCATE TABLE team');
            $stmt = $conn->prepare("
                INSERT INTO team
                    (name, role, email, skills, avatar)
                VALUES
                    (?, ?, ?, ?, ?)
            ");
            foreach ($mainData['team'] as $t) {
                $name   = $t['name'] ?? '';
                $role   = $t['role'] ?? null;
                $email  = $t['email'] ?? null;
                $skills = isset($t['skills']) ? json_encode($t['skills']) : null;
                $avatar = $t['avatar'] ?? null;

                $stmt->bind_param(
                    'sssss',
                    $name,
                    $role,
                    $email,
                    $skills,
                    $avatar
                );
                $stmt->execute();
            }
            $stmt->close();
        }
    }

    // Load clients
    $clientsData = firstExistingJson($clientsPaths);
    if ($clientsData && is_array($clientsData)) {
        $conn->query('TRUNCATE TABLE clients');
        $stmt = $conn->prepare("
            INSERT INTO clients
                (id, name, industry, contact_person, email, phone, projects, total_value, since)
            VALUES
                (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        foreach ($clientsData as $c) {
            $id            = $c['id'] ?? null;
            $name          = $c['name'] ?? '';
            $industry      = $c['industry'] ?? null;
            $contactPerson = $c['contactPerson'] ?? null;
            $email         = $c['email'] ?? null;
            $phone         = $c['phone'] ?? null;
            $projects      = isset($c['projects']) ? json_encode($c['projects']) : null;
            $totalValue    = isset($c['totalValue']) ? (float)$c['totalValue'] : 0;
            $since         = $c['since'] ?? null;

            $stmt->bind_param(
                'sssssssds',
                $id,
                $name,
                $industry,
                $contactPerson,
                $email,
                $phone,
                $projects,
                $totalValue,
                $since
            );
            $stmt->execute();
        }
        $stmt->close();
    }

    // Upcoming projects detailed list (overrides main simple ones if present)
    $upcomingList = firstExistingJson($upcomingProjectsPaths);
    if ($upcomingList && is_array($upcomingList)) {
        $conn->query('TRUNCATE TABLE upcoming_projects');
        $stmt = $conn->prepare("
            INSERT INTO upcoming_projects
                (code, name, client, description, tech_stack, status, deadline, assigned_to, created_at, updated_at)
            VALUES
                (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ");
        foreach ($upcomingList as $up) {
            $code        = $up['id'] ?? null;
            $name        = $up['name'] ?? '';
            $client      = $up['client'] ?? null;
            $description = $up['description'] ?? null;
            $techStack   = isset($up['techStack']) ? json_encode($up['techStack']) : null;
            $status      = $up['status'] ?? 'Upcoming';
            $deadline    = $up['deadline'] ?? null;
            $assignedTo  = isset($up['assignedTo']) ? json_encode($up['assignedTo']) : null;
            $createdAt   = $up['createdAt'] ?? null;
            $updatedAt   = $up['updatedAt'] ?? null;

            $stmt->bind_param(
                'ssssssssss',
                $code,
                $name,
                $client,
                $description,
                $techStack,
                $status,
                $deadline,
                $assignedTo,
                $createdAt,
                $updatedAt
            );
            $stmt->execute();
        }
        $stmt->close();
    }

    echo json_encode(['success' => true, 'message' => 'JSON data migrated to database successfully.']);
} catch (Throwable $e) {
    http_response_code(500);
    echo json_encode([
        'success' => false,
        'error' => $e->getMessage(),
    ]);
}


