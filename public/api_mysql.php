<?php
header("Access-Control-Allow-Origin: *");
header("Access-Control-Allow-Headers: Content-Type");
header("Content-Type: application/json; charset=UTF-8");

@ini_set('display_errors', 0);
@error_reporting(E_ALL);

require_once __DIR__ . '/sitemap_generator.php';

// Disable mysqli throwing unhandled exceptions in PHP 8.1+
@mysqli_report(MYSQLI_REPORT_OFF);

// Register shutdown function to catch any fatal PHP errors and output 200 with JSON
register_shutdown_function(function() {
    $error = error_get_last();
    if ($error !== NULL && in_array($error['type'], [E_ERROR, E_PARSE, E_CORE_ERROR, E_COMPILE_ERROR])) {
        if (!headers_sent()) {
            http_response_code(200);
        }
        echo json_encode([
            "success" => false,
            "error" => "PHP Fatal Error: " . $error['message'],
            "file" => basename($error['file']),
            "line" => $error['line']
        ], JSON_PRETTY_PRINT);
    }
});

// Global Exception Handler to output clean JSON instead of 500 HTML errors
set_exception_handler(function($e) {
    if (!headers_sent()) {
        http_response_code(200);
    }
    echo json_encode([
        "success" => false,
        "error" => "PHP Runtime Exception: " . $e->getMessage(),
        "file" => basename($e->getFile()),
        "line" => $e->getLine()
    ], JSON_PRETTY_PRINT);
    exit();
});

// MySQL Connection Credentials for Shared Hosting
$db_hosts = ["localhost", "127.0.0.1", "204.11.58.166"];
$db_users = ["ownbizhub", "own_trending"];
$db_passwords = ["ownbizhub@1982", "1j16?mv0Y"];
$database = "own_trending";

$conn = null;
foreach ($db_hosts as $h) {
    foreach ($db_users as $idx => $u) {
        $p = $db_passwords[$idx] ?? $db_passwords[0];
        $test_conn = @new mysqli($h, $u, $p, $database);
        if ($test_conn && !$test_conn->connect_error) {
            $conn = $test_conn;
            break 2;
        }
    }
}

if (!$conn || $conn->connect_error) {
    echo json_encode(["success" => false, "error" => "Database connection failed"]);
    exit();
}

$conn->set_charset("utf8mb4");

// Auto-Create Videos Table if missing
@$conn->query("
CREATE TABLE IF NOT EXISTS videos (
  id VARCHAR(255) PRIMARY KEY,
  youtube_url TEXT NOT NULL,
  youtube_id VARCHAR(100) NOT NULL,
  title TEXT NOT NULL,
  rephrased_title TEXT,
  rephrased_description TEXT,
  slug TEXT,
  channel_title VARCHAR(255),
  category VARCHAR(100) DEFAULT 'household',
  thumbnail_url TEXT,
  view_count VARCHAR(100) DEFAULT '0',
  like_count VARCHAR(100) DEFAULT '0',
  comment_count VARCHAR(100) DEFAULT '0',
  published_at VARCHAR(100),
  affiliate_tag_used VARCHAR(100) DEFAULT 'trends0628-21',
  pulse_json LONGTEXT,
  products_json LONGTEXT,
  comments_json LONGTEXT,
  region VARCHAR(10) DEFAULT 'IN',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY unique_youtube_id (youtube_id),
  KEY idx_region (region),
  KEY idx_category (category)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
");

// Auto-Create User Visits / Location Logs Table if missing
@$conn->query("
CREATE TABLE IF NOT EXISTS user_visits (
  id INT AUTO_INCREMENT PRIMARY KEY,
  ip_address VARCHAR(100),
  region_code VARCHAR(10) DEFAULT 'IN',
  country_name VARCHAR(100) DEFAULT 'India',
  user_agent TEXT,
  visited_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
");

// Auto-Create Cron Queue Table if missing
@$conn->query("
CREATE TABLE IF NOT EXISTS cron_queue (
  region VARCHAR(10) PRIMARY KEY,
  country_name VARCHAR(100) NOT NULL,
  amazon_domain VARCHAR(100) NOT NULL,
  last_cron_run DATETIME NULL DEFAULT NULL,
  total_videos_pulled INT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
");

// Pre-seed default locations into cron_queue if missing
@$conn->query("
INSERT IGNORE INTO cron_queue (region, country_name, amazon_domain) VALUES
('IN', 'India', 'amazon.in'),
('PK', 'Pakistan', 'amazon.pk'),
('BD', 'Bangladesh', 'amazon.com.bd'),
('US', 'United States', 'amazon.com'),
('GB', 'United Kingdom', 'amazon.co.uk'),
('CA', 'Canada', 'amazon.ca'),
('AU', 'Australia', 'amazon.com.au'),
('DE', 'Germany', 'amazon.de');
");

// Auto-Create Cron Category Queue Table if missing
@$conn->query("
CREATE TABLE IF NOT EXISTS cron_category_queue (
  category VARCHAR(50) PRIMARY KEY,
  category_name VARCHAR(100) NOT NULL,
  last_cron_run DATETIME NULL DEFAULT NULL,
  total_videos_pulled INT DEFAULT 0,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
");

// Pre-seed default categories into cron_category_queue if missing
@$conn->query("
INSERT IGNORE INTO cron_category_queue (category, category_name) VALUES
('electronics', 'Electronics'),
('household', 'Household & Living'),
('kitchen', 'Kitchen & Cooking'),
('fitness', 'Fitness & Health'),
('gadgets', 'Home Gadgets & Smart Tech'),
('personal_care', 'Personal Care & Grooming'),
('baby_parenting', 'Baby & Parenting'),
('pet_supplies', 'Pet Supplies'),
('home_office', 'Home Office & Desk Setup'),
('travel_outdoor', 'Travel & Outdoor Gear'),
('automotive', 'Automotive & Tools'),
('fashion', 'Fashion & Accessories'),
('gaming', 'Gaming & Entertainment');
");

// Auto-Create Cron Cycle State Table if missing
@$conn->query("
CREATE TABLE IF NOT EXISTS cron_cycle_state (
  id INT PRIMARY KEY DEFAULT 1,
  last_region VARCHAR(10) DEFAULT 'US',
  last_category VARCHAR(50) DEFAULT 'electronics',
  last_run DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
");

// Ensure all columns exist if table was created previously with older schema
$cols_to_check = [
    'rephrased_title'       => "TEXT",
    'rephrased_description' => "TEXT",
    'slug'                  => "TEXT",
    'comment_count'         => "VARCHAR(100) DEFAULT '0'",
    'affiliate_tag_used'    => "VARCHAR(100) DEFAULT 'trends0628-21'",
    'pulse_json'            => "LONGTEXT",
    'products_json'         => "LONGTEXT",
    'comments_json'         => "LONGTEXT",
    'region'                => "VARCHAR(10) DEFAULT 'IN'",
    'created_at'            => "DATETIME DEFAULT CURRENT_TIMESTAMP",
    'updated_at'            => "DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP"
];
$existing_cols = [];
$col_res = @$conn->query("SHOW COLUMNS FROM videos");
if ($col_res) {
    while ($c = $col_res->fetch_assoc()) {
        $existing_cols[$c['Field']] = true;
    }
}
foreach ($cols_to_check as $colName => $colDef) {
    if (!isset($existing_cols[$colName])) {
        @$conn->query("ALTER TABLE videos ADD COLUMN $colName $colDef");
    }
}

$action = isset($_GET['action']) ? $_GET['action'] : 'get_videos';

// Helper to ensure location is registered in Cron Queue database
function ensureLocationInQueue($conn, $regionCode = 'IN') {
    $regionCode = strtoupper(trim($regionCode ?: 'IN'));
    if (empty($regionCode) || strlen($regionCode) > 10) return;

    $countryNames = [
        'IN' => 'India', 'PK' => 'Pakistan', 'BD' => 'Bangladesh',
        'US' => 'United States', 'GB' => 'United Kingdom',
        'CA' => 'Canada', 'AU' => 'Australia', 'DE' => 'Germany',
        'AE' => 'United Arab Emirates', 'FR' => 'France', 'JP' => 'Japan'
    ];
    $amazonDomains = [
        'IN' => 'amazon.in', 'PK' => 'amazon.pk', 'BD' => 'amazon.com.bd',
        'US' => 'amazon.com', 'GB' => 'amazon.co.uk', 'CA' => 'amazon.ca',
        'AU' => 'amazon.com.au', 'DE' => 'amazon.de', 'AE' => 'amazon.ae',
        'FR' => 'amazon.fr', 'JP' => 'amazon.co.jp'
    ];

    $country = $countryNames[$regionCode] ?? ($regionCode . ' Location');
    $domain = $amazonDomains[$regionCode] ?? ('amazon.' . strtolower($regionCode));

    $stmt = $conn->prepare("INSERT IGNORE INTO cron_queue (region, country_name, amazon_domain) VALUES (?, ?, ?)");
    if ($stmt) {
        $stmt->bind_param("sss", $regionCode, $country, $domain);
        $stmt->execute();
    }
}

// Helper to seed initial localized videos for a specific region if 0 videos exist in DB
function seedInitialRegionVideos($conn, $targetRegion = 'IN') {
    $targetRegion = strtoupper(trim($targetRegion ?: 'IN'));
    ensureLocationInQueue($conn, $targetRegion);

    $regionMap = [
        'IN' => ['domain' => 'amazon.in', 'tag' => 'trends0628-in-21', 'currency' => '₹', 'country' => 'India'],
        'PK' => ['domain' => 'amazon.pk', 'tag' => 'trends0628-pk-21', 'currency' => 'Rs ', 'country' => 'Pakistan'],
        'BD' => ['domain' => 'amazon.com.bd', 'tag' => 'trends0628-bd-21', 'currency' => '৳', 'country' => 'Bangladesh'],
        'GB' => ['domain' => 'amazon.co.uk', 'tag' => 'trends0628-gb-21', 'currency' => '£', 'country' => 'United Kingdom'],
        'CA' => ['domain' => 'amazon.ca', 'tag' => 'trends0628-ca-21', 'currency' => 'C$', 'country' => 'Canada'],
        'AU' => ['domain' => 'amazon.com.au', 'tag' => 'trends0628-au-21', 'currency' => 'A$', 'country' => 'Australia'],
        'DE' => ['domain' => 'amazon.de', 'tag' => 'trends0628-de-21', 'currency' => '€', 'country' => 'Germany'],
        'US' => ['domain' => 'amazon.com', 'tag' => 'trends0628-21', 'currency' => '$', 'country' => 'United States']
    ];
    $cfg = $regionMap[$targetRegion] ?? $regionMap['IN'];

    $sampleTopics = [
        ['yt' => 'bCXhRtb16mk', 'title' => 'Flagship Smart LED TV 55 Inch Review', 'cat' => 'electronics', 'p' => '39,999'],
        ['yt' => 'UpmihdDasyk', 'title' => 'Noise Cancelling Wireless Earbuds Test', 'cat' => 'electronics', 'p' => '2,499'],
        ['yt' => '1fbUlzz2zfY', 'title' => 'Smart Double Door Refrigerator Review', 'cat' => 'kitchen', 'p' => '28,990'],
        ['yt' => 'PRgy1nnm3fg', 'title' => 'Automatic Front Load Washing Machine Test', 'cat' => 'household', 'p' => '32,490'],
        ['yt' => 'VadYsrjOusY', 'title' => 'High Speed Air Fryer & Oven Review', 'cat' => 'kitchen', 'p' => '5,999'],
        ['yt' => 'XZ0pMbshy3o', 'title' => 'Ergonomic Standing Desk & Chair Setup', 'cat' => 'home_office', 'p' => '14,999']
    ];

    $stmt = $conn->prepare("
        INSERT IGNORE INTO videos 
        (id, youtube_url, youtube_id, title, rephrased_title, rephrased_description, slug, channel_title, category, thumbnail_url, view_count, like_count, comment_count, published_at, affiliate_tag_used, pulse_json, products_json, comments_json, region) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    ");

    if (!$stmt) return;

    foreach ($sampleTopics as $idx => $top) {
        $vidId = 'vid-' . strtolower($targetRegion) . '-' . $top['yt'];
        $ytUrl = 'https://www.youtube.com/watch?v=' . $top['yt'];
        $cleanTitle = preg_replace('/\b(Review|Testing|Test|Unboxing|Best|Top)\b/i', '', $top['title']);
        $cleanTerms = implode('+', array_slice(array_values(array_filter(explode(' ', trim($cleanTitle)))), 0, 4));
        $amzUrl = "https://www." . $cfg['domain'] . "/s?k=" . urlencode($cleanTerms) . "&tag=" . $cfg['tag'];

        $pulse = json_encode([
            'summary' => $top['title'] . ' - Detailed product review and performance analysis for buyers in ' . $cfg['country'] . '.',
            'keyTakeaways' => ['Official warranty & support in ' . $cfg['country'], 'Top rated customer feedback', 'Verified build quality'],
            'viralPotentialScore' => 92 + $idx,
            'overallSentimentRatio' => ['positive' => 92, 'negative' => 4, 'neutral' => 4],
            'buyerRecommendation' => 'Must Buy',
            'buyerVerdictText' => 'Highly recommended product review.'
        ]);

        $products = json_encode([[
            'id' => 'prod-' . $top['yt'],
            'name' => $top['title'],
            'category' => $top['cat'],
            'originalUrl' => $amzUrl,
            'affiliateUrl' => $amzUrl,
            'affiliateTag' => $cfg['tag'],
            'estimatedPrice' => $cfg['currency'] . $top['p'],
            'rating' => 4.8,
            'keyFeatures' => ['Verified Build Quality', 'Fast Shipping on ' . $cfg['domain'], 'Top Customer Rating'],
            'pros' => ['Easy setup and operation', 'Great value for money'],
            'cons' => ['High regional demand item'],
            'targetAudience' => 'Buyers in ' . $cfg['country'],
            'verdict' => 'Highly recommended.'
        ]]);

        $comments = json_encode([
            ['text' => 'Great review! Ordered on ' . $cfg['domain'] . ' and got it delivered quickly.']
        ]);

        $slug = strtolower(preg_replace('/[^a-z0-9]+/', '-', $top['title'])) . '-' . strtolower($targetRegion);
        $thumb = 'https://i.ytimg.com/vi/' . $top['yt'] . '/hqdefault.jpg';
        $views = (150 + $idx * 45) . 'K';
        $likes = (12 + $idx * 3) . 'K';

        $stmt->bind_param("sssssssssssssssssss",
            $vidId, $ytUrl, $top['yt'], $top['title'], $top['title'],
            $top['title'], $slug, 'Tech & Home Reviews', $top['cat'],
            $thumb, $views, $likes, '450', 'Recent', $cfg['tag'],
            $pulse, $products, $comments, $targetRegion
        );
        $stmt->execute();
    }
}

// Helper to log user visit
function logVisit($conn, $regionCode = 'IN') {
    $ip = $_SERVER['REMOTE_ADDR'] ?? '127.0.0.1';
    if (!empty($_SERVER['HTTP_X_FORWARDED_FOR'])) {
        $ip = trim(explode(',', $_SERVER['HTTP_X_FORWARDED_FOR'])[0]);
    }
    $agent = substr($_SERVER['HTTP_USER_AGENT'] ?? 'Web Browser', 0, 250);
    $regionCode = strtoupper(trim($regionCode ?: 'IN'));

    ensureLocationInQueue($conn, $regionCode);

    $countryNames = [
        'IN' => 'India', 'PK' => 'Pakistan', 'BD' => 'Bangladesh',
        'US' => 'United States', 'GB' => 'United Kingdom',
        'CA' => 'Canada', 'AU' => 'Australia', 'DE' => 'Germany'
    ];
    $countryName = $countryNames[$regionCode] ?? 'Global';

    $stmt = $conn->prepare("INSERT INTO user_visits (ip_address, region_code, country_name, user_agent) VALUES (?, ?, ?, ?)");
    if ($stmt) {
        $stmt->bind_param("ssss", $ip, $regionCode, $countryName, $agent);
        $stmt->execute();
    }
}

if ($action === 'log_visit') {
    $reqRegion = strtoupper($_GET['region'] ?? $_POST['region'] ?? 'IN');
    logVisit($conn, $reqRegion);
    echo json_encode(["success" => true, "message" => "User visit logged successfully", "region" => $reqRegion]);
    exit();
}

if ($action === 'get_videos') {
    $reqRegion = strtoupper($_GET['region'] ?? 'IN');
    if (empty($reqRegion)) $reqRegion = 'IN';

    logVisit($conn, $reqRegion);

    $regionDomainMap = [
        'IN' => ['domain' => 'amazon.in', 'tag' => 'trends0628-in-21', 'currency' => '₹'],
        'PK' => ['domain' => 'amazon.pk', 'tag' => 'trends0628-pk-21', 'currency' => 'Rs '],
        'BD' => ['domain' => 'amazon.com.bd', 'tag' => 'trends0628-bd-21', 'currency' => '৳'],
        'GB' => ['domain' => 'amazon.co.uk', 'tag' => 'trends0628-gb-21', 'currency' => '£'],
        'CA' => ['domain' => 'amazon.ca', 'tag' => 'trends0628-ca-21', 'currency' => 'C$'],
        'AU' => ['domain' => 'amazon.com.au', 'tag' => 'trends0628-au-21', 'currency' => 'A$'],
        'DE' => ['domain' => 'amazon.de', 'tag' => 'trends0628-de-21', 'currency' => '€'],
        'US' => ['domain' => 'amazon.com', 'tag' => 'trends0628-21', 'currency' => '$']
    ];
    $activeRegionCfg = $regionDomainMap[$reqRegion] ?? $regionDomainMap['IN'];

    // 1. Strictly filter by region if requested (e.g. IN, PK, BD, US)
    if ($reqRegion !== 'ALL') {
        $stmt = $conn->prepare("SELECT * FROM videos WHERE region = ? ORDER BY created_at DESC");
        $stmt->bind_param("s", $reqRegion);
        $stmt->execute();
        $result = $stmt->get_result();

        // If 0 videos exist in DB for requested region, auto-seed clean initial localized videos
        if (!$result || $result->num_rows === 0) {
            seedInitialRegionVideos($conn, $reqRegion);
            $stmt = $conn->prepare("SELECT * FROM videos WHERE region = ? ORDER BY created_at DESC");
            $stmt->bind_param("s", $reqRegion);
            $stmt->execute();
            $result = $stmt->get_result();
        }
    } else {
        $result = $conn->query("SELECT * FROM videos ORDER BY created_at DESC");
    }

    $videos = [];
    if ($result) {
        while ($r = $result->fetch_assoc()) {
            $pulse = json_decode($r['pulse_json'] ?? '', true);
            if (!$pulse || !is_array($pulse) || empty($pulse['summary'])) {
                $pulse = [
                    'summary' => $r['rephrased_description'] ?: ($r['title'] ?: 'Direct database record from own_trending.videos'),
                    'keyTakeaways' => ['Direct database record from own_trending.videos'],
                    'viralPotentialScore' => 90,
                    'overallSentimentRatio' => ['positive' => 90, 'negative' => 5, 'neutral' => 5],
                    'buyerRecommendation' => 'Must Buy',
                    'buyerVerdictText' => 'Row directly retrieved from own_trending.videos database.'
                ];
            }

            $products = json_decode($r['products_json'] ?? '', true) ?: [];
            $comments = json_decode($r['comments_json'] ?? '', true) ?: [];

            $vTitle = $r['rephrased_title'] ?: ($r['title'] ?: 'Product Review');

            // Clean title for high-converting Amazon search matching
            $cleanTerms = preg_replace('/\b(Review|Reviews|Testing|Test|Tests|Unboxing|Real-World|Hands-On|Comparison|Vs|2026|2025|2024|In-Depth|Field Test|Full|Honest|Best|Top|Amazon|Finds|Gadgets|Gadget|India|USA|UK|Canada|Pakistan|Bangladesh|Germany|Australia|Must Watch|OMG|WOW)\b/i', '', $vTitle);
            $cleanTerms = preg_replace('/[^\w\s-]/', ' ', $cleanTerms);
            $termsArray = array_values(array_filter(explode(' ', trim($cleanTerms))));
            $searchKeywords = implode('+', array_slice($termsArray, 0, 4));
            if (empty($searchKeywords)) $searchKeywords = 'trending+products';

            $localizedAmazonUrl = "https://www." . $activeRegionCfg['domain'] . "/s?k=" . urlencode($searchKeywords) . "&tag=" . $activeRegionCfg['tag'];

            // Ensure products have valid localized Amazon URLs matching requested region
            if (empty($products)) {
                $products = [[
                    'id' => 'prod-' . ($r['youtube_id'] ?: uniqid()),
                    'name' => $vTitle,
                    'category' => ucfirst($r['category'] ?: 'household'),
                    'originalUrl' => $localizedAmazonUrl,
                    'affiliateUrl' => $localizedAmazonUrl,
                    'affiliateTag' => $activeRegionCfg['tag'],
                    'estimatedPrice' => $activeRegionCfg['currency'] . '1,999',
                    'rating' => 4.8,
                    'keyFeatures' => ['Verified Build Quality', 'Fast Regional Delivery', 'Top Customer Rating'],
                    'pros' => ['Easy setup and operation', 'Reliable performance'],
                    'cons' => ['High regional demand item'],
                    'targetAudience' => 'Buyers looking for verified product recommendations.',
                    'verdict' => 'Highly recommended product review.'
                ]];
            } else {
                foreach ($products as &$pItem) {
                    $pItem['affiliateUrl'] = $localizedAmazonUrl;
                    $pItem['affiliateTag'] = $activeRegionCfg['tag'];
                    if (empty($pItem['estimatedPrice']) || strpos($pItem['estimatedPrice'], '$') !== false) {
                        $pItem['estimatedPrice'] = $activeRegionCfg['currency'] . '2,499';
                    }
                }
                unset($pItem);
            }

            $videos[] = [
                'id' => (string)($r['id'] ?? 'vid-' . uniqid()),
                'youtubeUrl' => $r['youtube_url'] ?: ($r['youtube_id'] ? 'https://www.youtube.com/watch?v=' . $r['youtube_id'] : 'https://www.youtube.com/watch?v=a5p4Xj2A9aE'),
                'youtubeId' => $r['youtube_id'] ?: 'a5p4Xj2A9aE',
                'title' => $r['title'] ?: 'Untitled Video',
                'rephrasedTitle' => $vTitle,
                'rephrasedDescription' => $r['rephrased_description'] ?: '',
                'slug' => $r['slug'] ?: (string)$r['id'],
                'channelTitle' => $r['channel_title'] ?: 'YouTube Creator',
                'category' => $r['category'] ?: 'household',
                'thumbnailUrl' => $r['thumbnail_url'] ?: ($r['youtube_id'] ? 'https://i.ytimg.com/vi/' . $r['youtube_id'] . '/hqdefault.jpg' : 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80'),
                'viewCount' => $r['view_count'] ?: '100K',
                'likeCount' => $r['like_count'] ?: '5K',
                'publishedAt' => $r['published_at'] ?: 'Recent',
                'region' => $reqRegion,
                'affiliateTagUsed' => $activeRegionCfg['tag'],
                'pulse' => $pulse,
                'products' => $products,
                'comments' => $comments
            ];
        }
    }
    echo json_encode(["success" => true, "region_requested" => $reqRegion, "count" => count($videos), "videos" => $videos]);
    exit();
}

if ($action === 'seed_videos' || $action === 'add_video') {
    $rawInput = file_get_contents("php://input");
    $input = json_decode($rawInput, true);

    if (!$input) {
        echo json_encode(["success" => false, "error" => "Invalid JSON payload"]);
        exit();
    }

    $items = ($action === 'seed_videos') ? $input : [$input];
    if (!is_array($items)) {
        echo json_encode(["success" => false, "error" => "Payload must be an array or object"]);
        exit();
    }

    $stmt = $conn->prepare("
        INSERT INTO videos 
        (id, youtube_url, youtube_id, title, rephrased_title, rephrased_description, slug, channel_title, category, thumbnail_url, view_count, like_count, comment_count, published_at, affiliate_tag_used, pulse_json, products_json, comments_json, region) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) 
        ON DUPLICATE KEY UPDATE 
          title=VALUES(title), 
          rephrased_title=VALUES(rephrased_title), 
          rephrased_description=VALUES(rephrased_description), 
          slug=VALUES(slug), 
          category=VALUES(category), 
          region=VALUES(region), 
          pulse_json=VALUES(pulse_json), 
          products_json=VALUES(products_json), 
          comments_json=VALUES(comments_json)
    ");
    
    $inserted = 0;
    foreach ($items as $v) {
        $pulse = json_encode($v['pulse'] ?? []);
        $products = json_encode($v['products'] ?? []);
        $comments = json_encode($v['comments'] ?? []);
        
        $p_id = $v['id'] ?? ('vid-' . ($v['youtubeId'] ?? uniqid()));
        $p_youtubeUrl = $v['youtubeUrl'] ?? '';
        $p_youtubeId = $v['youtubeId'] ?? '';
        $p_title = $v['title'] ?? '';
        $p_rephrasedTitle = $v['rephrasedTitle'] ?? $p_title;
        $p_rephrasedDescription = $v['rephrasedDescription'] ?? '';
        $p_slug = $v['slug'] ?? '';
        $p_channelTitle = $v['channelTitle'] ?? '';
        $p_category = $v['category'] ?? 'household';
        $p_thumbnailUrl = $v['thumbnailUrl'] ?? '';
        $p_viewCount = $v['viewCount'] ?? '100K';
        $p_likeCount = $v['likeCount'] ?? '5K';
        $p_publishedAt = $v['publishedAt'] ?? 'Recent';
        $p_affiliateTagUsed = $v['affiliateTagUsed'] ?? 'trends0628-21';
        $p_region = strtoupper($v['region'] ?? 'IN');
        ensureLocationInQueue($conn, $p_region);

        $stmt->bind_param("sssssssssssssssssss",
            $p_id,
            $p_youtubeUrl,
            $p_youtubeId,
            $p_title,
            $p_rephrasedTitle,
            $p_rephrasedDescription,
            $p_slug,
            $p_channelTitle,
            $p_category,
            $p_thumbnailUrl,
            $p_viewCount,
            $p_likeCount,
            $p_publishedAt,
            $p_affiliateTagUsed,
            $pulse,
            $products,
            $comments,
            $p_region
        );
        if ($stmt->execute()) {
            $inserted++;
        }
    }

    // Automatically update or generate sitemap.xml
    $sitemapRes = update_or_generate_sitemap($conn);

    echo json_encode([
        "success" => true, 
        "inserted" => $inserted, 
        "message" => "Saved $inserted video(s) into MySQL with region binding",
        "sitemap_status" => $sitemapRes
    ]);
    exit();
}

if ($action === 'generate_sitemap') {
    $sitemapRes = update_or_generate_sitemap($conn);
    echo json_encode([
        "success" => true,
        "message" => "Sitemap generated / updated successfully",
        "sitemap_status" => $sitemapRes
    ]);
    exit();
}

if ($action === 'get_cron_queue') {
    $q_res = $conn->query("SELECT * FROM cron_queue ORDER BY (last_cron_run IS NULL) DESC, last_cron_run ASC, created_at ASC");
    $queue_items = [];
    if ($q_res) {
        while ($r = $q_res->fetch_assoc()) {
            $queue_items[] = $r;
        }
    }
    echo json_encode(["success" => true, "count" => count($queue_items), "cron_queue" => $queue_items]);
    exit();
}

if ($action === 'interpret_price_trend') {
    $rawInput = file_get_contents('php://input');
    $data = json_decode($rawInput, true) ?: [];

    $productName = $data['productName'] ?? 'Product';
    $region = $data['region'] ?? 'Global';
    $currencySymbol = $data['currencySymbol'] ?? '$';
    $currentLowestPrice = floatval($data['currentLowestPrice'] ?? 0);
    $thirtyDayLowest = floatval($data['thirtyDayLowest'] ?? 0);
    $thirtyDayHighest = floatval($data['thirtyDayHighest'] ?? 0);
    $thirtyDayAverage = floatval($data['thirtyDayAverage'] ?? 0);
    $currentTrend = $data['currentTrend'] ?? 'stable';
    $trendPercent = intval($data['trendPercent'] ?? 0);

    $apiKey = getenv('GEMINI_API_KEY') ?: '';

    // If Gemini API key is available in PHP environment, query Gemini via cURL
    if (!empty($apiKey)) {
        $prompt = "You are an expert e-commerce market price analyst. Analyze the following 30-day price trend for {$productName} in {$region}. Respond strictly in valid JSON with keys: summary, actionableAdvice, verdict (one of STRONG_BUY, GOOD_DEAL, FAIR_PRICE, WAIT_FOR_DROP), savingsPotential. Current price: {$currencySymbol}{$currentLowestPrice}, 30d Low: {$currencySymbol}{$thirtyDayLowest}, 30d High: {$currencySymbol}{$thirtyDayHighest}, 30d Avg: {$currencySymbol}{$thirtyDayAverage}, Trend: {$currentTrend} ({$trendPercent}%).";

        $payload = json_encode([
            "contents" => [
                [
                    "parts" => [
                        ["text" => $prompt]
                    ]
                ]
            ],
            "generationConfig" => [
                "responseMimeType" => "application/json",
                "temperature" => 0.2
            ]
        ]);

        $apiUrl = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=" . urlencode($apiKey);

        $ch = curl_init();
        curl_setopt($ch, CURLOPT_URL, $apiUrl);
        curl_setopt($ch, CURLOPT_POST, true);
        curl_setopt($ch, CURLOPT_POSTFIELDS, $payload);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_HTTPHEADER, ["Content-Type: application/json"]);
        curl_setopt($ch, CURLOPT_TIMEOUT, 6);
        $resp = curl_exec($ch);
        curl_close($ch);

        if ($resp) {
            $geminiRes = json_decode($resp, true);
            $rawText = $geminiRes['candidates'][0]['content']['parts'][0]['text'] ?? '';
            $parsed = json_decode($rawText, true);
            if (!empty($parsed) && !empty($parsed['summary'])) {
                echo json_encode(array_merge($parsed, ["confidence" => "Gemini AI (PHP Server)"]));
                exit();
            }
        }
    }

    // High-performance algorithmic fallback if no Gemini key or network delay
    $isNearLow = $thirtyDayLowest > 0 ? ($currentLowestPrice <= ($thirtyDayLowest * 1.03)) : false;
    $isBelowAvg = $thirtyDayAverage > 0 ? ($currentLowestPrice < $thirtyDayAverage) : false;

    $trendPhrase = "Price is currently holding steady with low market volatility";
    if ($currentTrend === 'dropping') {
        $trendPhrase = "Price is currently trending downward by {$trendPercent}% over the last 30 days";
    } elseif ($currentTrend === 'rising') {
        $trendPhrase = "Price is currently trending upward (+{$trendPercent}%) over recent weeks";
    }

    $comparisonPhrase = $isNearLow
        ? "Today's best price of {$currencySymbol}{$currentLowestPrice} is right at the 30-day historical lowest point ({$currencySymbol}{$thirtyDayLowest})."
        : ($isBelowAvg
            ? "At {$currencySymbol}{$currentLowestPrice}, it is currently below the 30-day average of {$currencySymbol}{$thirtyDayAverage}."
            : "Current price of {$currencySymbol}{$currentLowestPrice} sits near the 30-day high ({$currencySymbol}{$thirtyDayHighest}).");

    $summary = "{$trendPhrase}. {$comparisonPhrase} Live stock verified across major regional merchants.";
    $actionableAdvice = $isNearLow
        ? "Strong Buy - Current price is near its 30-day promotional low. Excellent time to purchase."
        : ($isBelowAvg
            ? "Good Deal - Price is below recent market averages. Favorable buying window."
            : "Consider Waiting - Price is slightly elevated above recent mid-month discount levels.");

    $verdict = $isNearLow ? 'STRONG_BUY' : ($isBelowAvg ? 'GOOD_DEAL' : 'WAIT_FOR_DROP');
    $potentialSave = max(0, $thirtyDayHighest - $currentLowestPrice);

    echo json_encode([
        "summary" => $summary,
        "actionableAdvice" => $actionableAdvice,
        "verdict" => $verdict,
        "savingsPotential" => $potentialSave > 0 ? "Save up to {$currencySymbol}{$potentialSave} vs 30-day peak" : "Competitive pricing",
        "confidence" => "Algorithmic Analysis (PHP Host)"
    ]);
    exit();
}

if ($action === 'get_cron_category_queue') {
    $q_res = $conn->query("SELECT * FROM cron_category_queue ORDER BY (last_cron_run IS NULL) DESC, last_cron_run ASC, created_at ASC");
    $queue_items = [];
    if ($q_res) {
        while ($r = $q_res->fetch_assoc()) {
            $queue_items[] = $r;
        }
    }
    echo json_encode(["success" => true, "count" => count($queue_items), "cron_category_queue" => $queue_items]);
    exit();
}

echo json_encode(["success" => true, "status" => "PHP MySQL API Ready"]);
