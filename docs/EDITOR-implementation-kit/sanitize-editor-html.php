<?php
/**
 * Ghar.tv editor HTML sanitiser.
 *
 * Run on every editor field on save. Strips dangerous markup the TinyMCE
 * client-side allowlist might let through, validates iframe origins, and
 * normalises whitespace. Safe to call multiple times (idempotent).
 *
 *   require_once __DIR__ . '/sanitize-editor-html.php';
 *   $_POST['content1'] = sanitize_editor_html($_POST['content1']);
 *   $_POST['content2'] = sanitize_editor_html($_POST['content2']);
 *   // ... same for keytakeaways, content1–6, contentfaq, remarks
 */

const GHAR_IFRAME_ORIGIN_ALLOWLIST = [
    'www.youtube.com',
    'www.youtube-nocookie.com',
    'player.vimeo.com',
    'open.spotify.com',
    'ghar.tv',
    'www.ghar.tv',
];

const GHAR_BLOCKED_TAGS = [
    'script', 'style', 'link', 'base', 'meta',
    'form', 'input', 'button', 'select', 'textarea',
    'object', 'embed', 'param',
];

function sanitize_editor_html(string $html): string
{
    if ($html === '' || $html === null) {
        return '';
    }

    // 1. Strip all blocked tags including their content
    foreach (GHAR_BLOCKED_TAGS as $tag) {
        $html = preg_replace('#<' . $tag . '\b[^>]*>.*?</' . $tag . '>#is', '', $html);
        $html = preg_replace('#<' . $tag . '\b[^>]*/?>#is', '', $html);
    }

    // 2. Strip every on* event handler attribute
    $html = preg_replace('#\s+on[a-z]+\s*=\s*"[^"]*"#i', '', $html);
    $html = preg_replace("#\s+on[a-z]+\s*=\s*'[^']*'#i", '', $html);
    // Unquoted form (legacy)
    $html = preg_replace('#\s+on[a-z]+\s*=\s*[^\s>]+#i', '', $html);

    // 3. Strip every inline style="" attribute — colour / spacing is locked
    //    to brand classes, not editor-pickable
    $html = preg_replace('#\s+style\s*=\s*"[^"]*"#i', '', $html);
    $html = preg_replace("#\s+style\s*=\s*'[^']*'#i", '', $html);

    // 4. Strip javascript:, data:, vbscript: URLs in href / src
    $html = preg_replace('#\s+(href|src)\s*=\s*"\s*(javascript|data|vbscript)\s*:[^"]*"#i', ' $1="#"', $html);
    $html = preg_replace("#\s+(href|src)\s*=\s*'\s*(javascript|data|vbscript)\s*:[^']*'#i", ' $1="#"', $html);

    // 5. Validate iframe origins — reject anything not in allowlist
    $html = preg_replace_callback(
        '#<iframe\b[^>]*src\s*=\s*["\']([^"\']+)["\'][^>]*></iframe>#is',
        function ($m) {
            $src = $m[1];
            $host = parse_url($src, PHP_URL_HOST);
            if (!$host) {
                return '';
            }
            // Allow exact hosts + *.ghar.tv subdomain wildcard
            foreach (GHAR_IFRAME_ORIGIN_ALLOWLIST as $allowed) {
                if ($host === $allowed || str_ends_with($host, '.ghar.tv')) {
                    return $m[0];
                }
            }
            return ''; // Rejected origin → drop the iframe
        },
        $html
    );

    // Self-closing iframe form
    $html = preg_replace_callback(
        '#<iframe\b[^>]*src\s*=\s*["\']([^"\']+)["\'][^>]*/?>(?!</iframe>)#is',
        function ($m) {
            $host = parse_url($m[1], PHP_URL_HOST);
            if (!$host) {
                return '';
            }
            foreach (GHAR_IFRAME_ORIGIN_ALLOWLIST as $allowed) {
                if ($host === $allowed || str_ends_with($host, '.ghar.tv')) {
                    return $m[0];
                }
            }
            return '';
        },
        $html
    );

    // 6. Normalise whitespace — collapse 3+ <br> in a row to 2
    $html = preg_replace('#(\s*<br\s*/?>\s*){3,}#i', '<br><br>', $html);

    // 7. Trim leading/trailing empty <p></p>
    $html = preg_replace('#^(\s*<p>(\s|&nbsp;|<br\s*/?>)*</p>\s*)+#i', '', $html);
    $html = preg_replace('#(\s*<p>(\s|&nbsp;|<br\s*/?>)*</p>\s*)+$#i', '', $html);

    return trim($html);
}

/**
 * Reverse a footnote ref's stored `data-fn-id` markup back to a stable id
 * (called by render-pipeline at render time, NOT save time).
 */
function extract_footnote_refs(string $html): array
{
    $refs = [];
    if (preg_match_all('#<sup\s+data-fn-id="([^"]+)">.*?</sup>#i', $html, $matches)) {
        foreach ($matches[1] as $id) {
            if (!in_array($id, $refs, true)) {
                $refs[] = $id;
            }
        }
    }
    return $refs;
}
