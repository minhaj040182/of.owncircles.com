<?php
/**
 * Sitemap Generator & Appender Module
 * Automatically creates or appends video URLs to sitemap.xml whenever a video is saved to the database.
 */

function update_or_generate_sitemap($conn) {
    if (!$conn) {
        return ['success' => false, 'error' => 'No active database connection provided'];
    }

    // Determine site base URL
    $protocol = (!empty($_SERVER['HTTPS']) && $_SERVER['HTTPS'] !== 'off' || ($_SERVER['SERVER_PORT'] ?? 80) == 443) ? "https://" : "http://";
    $domain = !empty($_SERVER['HTTP_HOST']) ? $_SERVER['HTTP_HOST'] : 'trends.owncircles.com';
    $base_url = rtrim($protocol . $domain, '/');

    // Target sitemap paths (both public directory and root directory if available)
    $sitemap_paths = [
        __DIR__ . '/sitemap.xml',
        dirname(__DIR__) . '/sitemap.xml'
    ];

    // Slug generation helper
    if (!function_exists('sitemap_slugify_helper')) {
        function sitemap_slugify_helper($text) {
            $slug = strtolower(trim($text ?? ''));
            $slug = preg_replace('/[^\w\s-]/', '', $slug);
            $slug = preg_replace('/[\s_-]+/', '-', $slug);
            return trim($slug, '-');
        }
    }

    // Query all videos from database
    $res = @$conn->query("SELECT id, slug, rephrased_title, title, updated_at, created_at FROM videos ORDER BY created_at DESC");
    $video_items = [];
    if ($res) {
        while ($row = $res->fetch_assoc()) {
            $rawTitle = $row['rephrased_title'] ?: $row['title'];
            $slug = $row['slug'] ?: sitemap_slugify_helper($rawTitle);
            if (empty($slug)) {
                $slug = 'video-' . ($row['id'] ?: rand(1000, 9999));
            }

            $lastmod = !empty($row['updated_at']) 
                ? date('Y-m-d\TH:i:sP', strtotime($row['updated_at'])) 
                : (!empty($row['created_at']) ? date('Y-m-d\TH:i:sP', strtotime($row['created_at'])) : date('Y-m-d\TH:i:sP'));

            $video_items[] = [
                'loc' => $base_url . '/video/' . rawurlencode($slug),
                'lastmod' => $lastmod,
                'changefreq' => 'daily',
                'priority' => '0.9',
                'title' => htmlspecialchars($rawTitle, ENT_XML1, 'UTF-8')
            ];
        }
    }

    // Standard static URLs
    $sitemap_urls = [];

    // Homepage
    $sitemap_urls[] = [
        'loc' => $base_url . '/',
        'lastmod' => date('Y-m-d\TH:i:sP'),
        'changefreq' => 'hourly',
        'priority' => '1.0'
    ];

    // Developer & Utility Tools (Prevents 404 / Soft 404 / Redirect flags)
    $sitemap_urls[] = [
        'loc' => $base_url . '/base64-encoder-decoder',
        'lastmod' => date('Y-m-d\TH:i:sP'),
        'changefreq' => 'monthly',
        'priority' => '0.9'
    ];
    $sitemap_urls[] = [
        'loc' => $base_url . '/yaml-converter',
        'lastmod' => date('Y-m-d\TH:i:sP'),
        'changefreq' => 'monthly',
        'priority' => '0.9'
    ];
    $sitemap_urls[] = [
        'loc' => $base_url . '/csv-to-json',
        'lastmod' => date('Y-m-d\TH:i:sP'),
        'changefreq' => 'monthly',
        'priority' => '0.9'
    ];

    // Category pages
    $categories = ['household', 'kitchen', 'fitness', 'electronics', 'beauty', 'gadgets', 'personal_care', 'home_office', 'travel_outdoor'];
    foreach ($categories as $cat) {
        $sitemap_urls[] = [
            'loc' => $base_url . '/?category=' . $cat,
            'lastmod' => date('Y-m-d\TH:i:sP'),
            'changefreq' => 'daily',
            'priority' => '0.8'
        ];
    }

    // Append video URLs
    foreach ($video_items as $v) {
        $sitemap_urls[] = $v;
    }

    // Build XML markup
    $xml = '<?xml version="1.0" encoding="UTF-8"?>' . "\n";
    $xml .= '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">' . "\n";

    foreach ($sitemap_urls as $item) {
        $xml .= "  <url>\n";
        $xml .= "    <loc>" . htmlspecialchars($item['loc'], ENT_XML1, 'UTF-8') . "</loc>\n";
        $xml .= "    <lastmod>" . $item['lastmod'] . "</lastmod>\n";
        $xml .= "    <changefreq>" . $item['changefreq'] . "</changefreq>\n";
        $xml .= "    <priority>" . $item['priority'] . "</priority>\n";
        $xml .= "  </url>\n";
    }

    $xml .= '</urlset>';

    // Write to sitemap files
    $success = false;
    $bytes_written = 0;
    $written_paths = [];

    foreach ($sitemap_paths as $path) {
        $written = @file_put_contents($path, $xml);
        if ($written !== false) {
            $success = true;
            $bytes_written = $written;
            $written_paths[] = $path;
        }
    }

    return [
        'success' => $success,
        'bytes_written' => $bytes_written,
        'total_urls' => count($sitemap_urls),
        'total_videos' => count($video_items),
        'sitemap_paths' => $written_paths
    ];
}
?>
