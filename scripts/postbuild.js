import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Single authoritative canonical routes
const CANONICAL_ROUTES = [
  'home',
  'json-formatter',
  'json-schema-generator',
  'jsonpath-tester',
  'json-to-code',
  'yaml-formatter',
  'xml-formatter',
  'sql-formatter',
  'code-minifier',
  'api-tester',
  'graphql-tester',
  'openapi-viewer',
  'webhook-tester',
  'mock-api-server',
  'docker-compose-validator',
  'k8s-yaml-validator',
  'nginx-config-formatter',
  'base64-encoder-decoder',
  'url-encoder-decoder',
  'jwt-debugger',
  'timestamp-converter',
  'text-utility',
  'hash-generator',
  'uuid-generator',
  'qrcode-generator',
  'markdown-editor',
  'csv-to-json',
  'color-converter',
  'number-base-converter',
  'cron-parser',
  'regex-tester',
  'text-diff',
  'privacy-policy',
  'terms-of-service',
  'about-us',
  'indexnow-submitter',
  'learn-json',
  'learn-jsonschema',
  'learn-jsonpath',
  'learn-jsontocode',
  'learn-yaml',
  'learn-xml',
  'learn-sql',
  'learn-jwt',
  'learn-regex',
  'learn-cron',
  'learn-timestamp',
  'learn-base64',
  'learn-url',
  'learn-hash',
  'learn-uuid',
  'learn-qrcode',
  'learn-markdown',
  'learn-csv',
  'learn-color',
  'learn-base',
  'learn-diff',
  'learn-api',
  'learn-graphql',
  'learn-openapi',
  'learn-webhook',
  'learn-mockapi',
  'learn-docker',
  'learn-k8s',
  'learn-nginx'
];

// Alias routes that must permanently redirect to their canonical target
const ALIAS_REDIRECT_MAP = {
  'json-beautifier': 'json-formatter',
  'json-validator': 'json-formatter',
  'cron-expression-parser': 'cron-parser',
  'cron-tester': 'cron-parser',
  'cron-expression-descriptor': 'cron-parser',
  'yaml-converter': 'yaml-formatter',
  'yaml-to-json': 'yaml-formatter',
  'json-to-yaml': 'yaml-formatter',
  'base64-encoder': 'base64-encoder-decoder',
  'base64-decoder': 'base64-encoder-decoder',
  'base64-decode': 'base64-encoder-decoder',
  'base64-encode': 'base64-encoder-decoder',
  'csv-converter': 'csv-to-json',
  'json-to-csv': 'csv-to-json',
  'csv-json-converter': 'csv-to-json',
  'docker-validator': 'docker-compose-validator',
  'kubernetes-validator': 'k8s-yaml-validator',
  'nginx-formatter': 'nginx-config-formatter',
  'url-encoder': 'url-encoder-decoder',
  'url-decoder': 'url-encoder-decoder',
  'jwt-decoder': 'jwt-debugger',
  'jwt-parser': 'jwt-debugger',
  'epoch-converter': 'timestamp-converter',
  'unix-timestamp-converter': 'timestamp-converter',
  'md5-generator': 'hash-generator',
  'sha256-generator': 'hash-generator',
  'guid-generator': 'uuid-generator',
  'qr-code-generator': 'qrcode-generator',
  'markdown-previewer': 'markdown-editor',
  'diff-checker': 'text-diff',
  'diff-tool': 'text-diff',
  'privacy': 'privacy-policy',
  'terms': 'terms-of-service',
  'about': 'about-us',
  'indexnow': 'indexnow-submitter',
  'json-to-typescript': 'json-to-code',
  'json-to-types': 'json-to-code'
};

const distDir = path.resolve(__dirname, '../dist');
const indexPath = path.join(distDir, 'index.html');

if (!fs.existsSync(indexPath)) {
  console.error('Error: dist/index.html does not exist. Run vite build first.');
  process.exit(1);
}

const baseHtml = fs.readFileSync(indexPath, 'utf8');

function formatTitle(route) {
  if (route === 'home') {
    return 'OwnFormatters – Free JSON Formatter, JSON to Code Generator & Developer Utilities';
  }
  if (route === 'json-formatter') {
    return 'Free JSON Formatter & Beautifier Online | OwnFormatters';
  }
  if (route === 'yaml-formatter') {
    return 'YAML Formatter & YAML to JSON Converter | OwnFormatters';
  }
  if (route === 'cron-parser') {
    return 'Cron Expression Parser & Explainer Online | OwnFormatters';
  }
  const clean = route.replace(/^learn-/, 'Learn ').replace(/-/g, ' ');
  const capitalized = clean.replace(/\b\w/g, l => l.toUpperCase());
  return `${capitalized} – OwnFormatters`;
}

function getRouteDescription(route) {
  if (route === 'json-formatter') {
    return 'Format, beautify, validate and minify JSON instantly with the free OwnFormatters JSON Formatter. Choose indentation, fix readability and copy or download the result.';
  }
  if (route === 'yaml-formatter') {
    return 'Format and validate YAML, convert YAML to JSON or JSON to YAML, and copy or download clean output instantly with OwnFormatters.';
  }
  if (route === 'cron-parser') {
    return 'Parse and explain cron expressions instantly. Understand each cron field, validate schedules, view human-readable meanings and calculate upcoming execution times.';
  }
  const name = route.replace(/^learn-/, '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  return `Comprehensive developer guide, technical specifications, and 100% offline client-side utility for ${name}. Formatted following strict RFC and W3C web standards with zero server logging and zero network egress.`;
}

console.log('Generating physical canonical route HTML files with pre-rendered semantic shells and canonical tags...');

// 1. Generate Canonical Routes
CANONICAL_ROUTES.forEach((route) => {
  const routeDir = path.join(distDir, route);
  if (!fs.existsSync(routeDir)) {
    fs.mkdirSync(routeDir, { recursive: true });
  }

  const canonicalUrl = route === 'home' ? 'https://ownformatters.com/' : `https://ownformatters.com/${route}`;
  const routeTitle = formatTitle(route);
  const routeDesc = getRouteDescription(route);

  // Inject route-specific fallback content inside <div id="root">
  let fallbackHtml;
  if (route === 'home') {
    fallbackHtml = null;
  } else if (route === 'json-formatter') {
    fallbackHtml = `<div id="static-fallback" style="padding:40px 20px;max-width:1100px;margin:0 auto;font-family:system-ui,-apple-system,sans-serif;color:#cbd5e1;line-height:1.7;">
      <nav aria-label="Breadcrumb" style="margin-bottom:16px;font-size:13px;color:#94a3b8;">
        <a href="/" style="color:#818cf8;text-decoration:none;">Home</a> &gt; <span style="color:#e2e8f0;font-weight:600;">JSON Formatter</span>
      </nav>
      <header style="border-bottom:1px solid #334155;padding-bottom:20px;margin-bottom:28px;">
        <h1 style="color:#f8fafc;font-size:32px;font-weight:900;margin:0 0 12px 0;letter-spacing:-0.02em;">Free Online JSON Formatter &amp; Beautifier</h1>
        <p style="font-size:15px;color:#94a3b8;margin:0;max-width:800px;line-height:1.6;">Format messy or minified JSON into readable structured data directly in your browser. Beautify with your preferred indentation, validate JSON syntax, minify the result, and copy or download the formatted JSON.</p>
      </header>

      <section style="background:#0f172a;border:1px solid #334155;border-radius:12px;padding:24px;margin-bottom:40px;">
        <p style="margin:0 0 12px 0;font-size:13px;color:#94a3b8;font-weight:600;">Instant Browser-Based JSON Formatter &amp; Validator Workspace</p>
        <p style="font-size:13px;color:#cbd5e1;margin:0;">Paste raw JSON into the editor to format, validate RFC 8259 syntax, view interactive tree hierarchies, or minify for production transmission. All data processing is strictly client-side.</p>
      </section>

      <article style="border-top:1px solid #334155;padding-top:32px;">
        <section style="margin-bottom:32px;">
          <h2 style="color:#f8fafc;font-size:22px;font-weight:700;margin:0 0 12px 0;">What is a JSON Formatter?</h2>
          <p style="margin:0;font-size:14px;color:#cbd5e1;">A JSON formatter (also known as a JSON beautifier or pretty printer) is a developer utility that converts unformatted, minified, or disorganized JavaScript Object Notation text into clean, structured, and properly indented code. Raw JSON returned by REST APIs, microservices, and database queries is typically compressed onto a single line to reduce bandwidth consumption. While efficient for machine transmission, dense payloads are challenging for humans to read. A JSON formatter reconstructs the structural hierarchy with consistent spacing and line breaks, making keys, values, nested arrays, and objects immediately clear.</p>
        </section>

        <section style="margin-bottom:32px;">
          <h2 style="color:#f8fafc;font-size:22px;font-weight:700;margin:0 0 12px 0;">How to Format JSON</h2>
          <ol style="padding-left:20px;font-size:14px;color:#cbd5e1;margin:0;">
            <li style="margin-bottom:8px;"><strong>Paste or load your JSON:</strong> Paste raw JSON text into the editor, or load a sample payload.</li>
            <li style="margin-bottom:8px;"><strong>Choose your indentation and format:</strong> Select 2 spaces, 4 spaces, 8 spaces, or tabs, then click Beautify &amp; Validate. You can also click Minify JSON for a compact one-line output.</li>
            <li style="margin-bottom:8px;"><strong>Copy or download the result:</strong> Click Copy to send the formatted JSON to your clipboard, or click Download to save formatted.json directly to your device.</li>
          </ol>
        </section>

        <section style="margin-bottom:32px;">
          <h2 style="color:#f8fafc;font-size:22px;font-weight:700;margin:0 0 12px 0;">JSON Formatting Example</h2>
          <p style="font-size:14px;color:#cbd5e1;margin:0 0 12px 0;">Input minified JSON:</p>
          <pre style="background:#020617;border:1px solid #334155;padding:12px;border-radius:8px;font-family:monospace;font-size:12px;color:#94a3b8;overflow-x:auto;">{"name":"Ava","skills":["JavaScript","React"],"active":true}</pre>
          <p style="font-size:14px;color:#cbd5e1;margin:12px 0;">Output beautified JSON:</p>
          <pre style="background:#020617;border:1px solid #334155;padding:12px;border-radius:8px;font-family:monospace;font-size:12px;color:#38bdf8;overflow-x:auto;">{\n  "name": "Ava",\n  "skills": [\n    "JavaScript",\n    "React"\n  ],\n  "active": true\n}</pre>
        </section>

        <section style="margin-bottom:32px;">
          <h2 style="color:#f8fafc;font-size:22px;font-weight:700;margin:0 0 12px 0;">JSON Formatter vs JSON Minifier</h2>
          <p style="font-size:14px;color:#cbd5e1;margin:0;">A <strong>JSON Formatter</strong> emphasizes human readability by inserting newlines and indentation levels, which is vital during debugging, API integration, and code reviews. In contrast, a <strong>JSON Minifier</strong> strips all non-essential whitespace, line breaks, and indentation to produce the smallest payload possible, reducing bandwidth and boosting network performance in production APIs.</p>
        </section>

        <section style="margin-bottom:32px;">
          <h2 style="color:#f8fafc;font-size:22px;font-weight:700;margin:0 0 12px 0;">JSON Validation &amp; Syntax Rules</h2>
          <p style="font-size:14px;color:#cbd5e1;margin:0 0 12px 0;">Valid JSON must strictly conform to RFC 8259 specifications. Common validation mistakes include:</p>
          <ul style="padding-left:20px;font-size:14px;color:#cbd5e1;margin:0;">
            <li style="margin-bottom:6px;"><strong>Missing double quotes:</strong> Property names and string values must always use double quotes ("key"), never single quotes.</li>
            <li style="margin-bottom:6px;"><strong>Trailing commas:</strong> The final element in an array or object must not end with a trailing comma.</li>
            <li style="margin-bottom:6px;"><strong>Unmatched braces or brackets:</strong> Every { must match a closing }, and every [ must match a closing ].</li>
            <li style="margin-bottom:6px;"><strong>Unescaped control characters:</strong> Special characters like newlines or tabs inside string values must be escaped as \\n or \\t.</li>
          </ul>
        </section>

        <section style="margin-bottom:32px;">
          <h2 style="color:#f8fafc;font-size:22px;font-weight:700;margin:0 0 12px 0;">Privacy &amp; Client-Side Browser Processing</h2>
          <p style="font-size:14px;color:#cbd5e1;margin:0;">All JSON formatting, validation, and tree inspection happen entirely client-side inside your web browser. Your data is never uploaded, transmitted, or logged to OwnFormatters servers. You can safely format sensitive credentials, production payloads, and proprietary configs without data leakage.</p>
        </section>

        <section style="margin-bottom:32px;">
          <h2 style="color:#f8fafc;font-size:22px;font-weight:700;margin:0 0 16px 0;">Frequently Asked Questions</h2>
          <div style="margin-bottom:16px;">
            <h3 style="color:#e2e8f0;font-size:15px;font-weight:600;margin:0 0 4px 0;">What does a JSON formatter do?</h3>
            <p style="font-size:13px;color:#94a3b8;margin:0;">A JSON formatter parses unformatted, messy, or minified JSON strings and reorganizes them with consistent indentation and line breaks, making complex data structures easy for developers to read, inspect, and debug.</p>
          </div>
          <div style="margin-bottom:16px;">
            <h3 style="color:#e2e8f0;font-size:15px;font-weight:600;margin:0 0 4px 0;">Can this tool format minified JSON?</h3>
            <p style="font-size:13px;color:#94a3b8;margin:0;">Yes. You can paste single-line or heavily minified JSON into the editor and click 'Beautify &amp; Validate' to instantly expand it into human-readable formatted JSON with proper indentation.</p>
          </div>
          <div style="margin-bottom:16px;">
            <h3 style="color:#e2e8f0;font-size:15px;font-weight:600;margin:0 0 4px 0;">Does the formatter validate JSON?</h3>
            <p style="font-size:13px;color:#94a3b8;margin:0;">Yes. The formatter checks your input against standard RFC 8259 JSON syntax rules. If your JSON has errors—such as missing quotes, trailing commas, or unescaped characters—the tool highlights the issue and points to the specific line and column number.</p>
          </div>
          <div style="margin-bottom:16px;">
            <h3 style="color:#e2e8f0;font-size:15px;font-weight:600;margin:0 0 4px 0;">What is the difference between formatting and minifying JSON?</h3>
            <p style="font-size:13px;color:#94a3b8;margin:0;">Formatting (or beautifying / pretty printing) adds whitespace, indentation, and newlines to maximize human readability. Minifying removes all unnecessary whitespace, comments, and line breaks to produce the smallest possible payload size for fast network transmission.</p>
          </div>
          <div style="margin-bottom:16px;">
            <h3 style="color:#e2e8f0;font-size:15px;font-weight:600;margin:0 0 4px 0;">Is my JSON uploaded to a server?</h3>
            <p style="font-size:13px;color:#94a3b8;margin:0;">No. All JSON formatting, validation, minification, and tree inspection happen entirely client-side inside your web browser. Your data is never uploaded, transmitted, or logged to OwnFormatters servers.</p>
          </div>
        </section>

        <section style="margin-bottom:32px;">
          <h2 style="color:#f8fafc;font-size:22px;font-weight:700;margin:0 0 12px 0;">Related Developer Tools</h2>
          <ul style="padding-left:20px;font-size:14px;color:#818cf8;margin:0;">
            <li style="margin-bottom:6px;"><a href="/yaml-formatter" style="color:#818cf8;text-decoration:none;">Convert JSON to YAML</a> - Transform JSON into clean YAML configs</li>
            <li style="margin-bottom:6px;"><a href="/csv-to-json" style="color:#818cf8;text-decoration:none;">Convert CSV to JSON</a> - Parse tabular spreadsheet data to JSON</li>
            <li style="margin-bottom:6px;"><a href="/json-to-code" style="color:#818cf8;text-decoration:none;">JSON to Code Generator</a> - TypeScript, Go, Rust, Java &amp; C# models</li>
            <li style="margin-bottom:6px;"><a href="/base64-encoder-decoder" style="color:#818cf8;text-decoration:none;">Base64 Encoder / Decoder</a> - Encode and decode payloads in-browser</li>
            <li style="margin-bottom:6px;"><a href="/learn-json" style="color:#818cf8;text-decoration:none;">Learn JSON Syntax &amp; RFC Rules</a> - Read our comprehensive JSON developer guide</li>
          </ul>
        </section>
      </article>

      <footer style="border-top:1px solid #334155;padding-top:20px;color:#64748b;font-size:13px;">
        <p>© 2026 OwnFormatters Core Engineering Team. Published with zero-egress client-side privacy guarantees.</p>
      </footer>
    </div>`;
  } else if (route === 'cron-parser') {
    fallbackHtml = `<div id="static-fallback" style="padding:40px 20px;max-width:1100px;margin:0 auto;font-family:system-ui,-apple-system,sans-serif;color:#cbd5e1;line-height:1.7;">
      <nav aria-label="Breadcrumb" style="margin-bottom:16px;font-size:13px;color:#94a3b8;">
        <a href="/" style="color:#818cf8;text-decoration:none;">Home</a> &gt; <span style="color:#e2e8f0;font-weight:600;">Cron Expression Parser</span>
      </nav>
      <header style="border-bottom:1px solid #334155;padding-bottom:20px;margin-bottom:28px;">
        <h1 style="color:#f8fafc;font-size:32px;font-weight:900;margin:0 0 12px 0;letter-spacing:-0.02em;">Cron Expression Parser &amp; Explainer</h1>
        <p style="font-size:15px;color:#94a3b8;margin:0;max-width:800px;line-height:1.6;">Enter a standard 5-field cron expression to see what it means, validate each field and calculate upcoming execution times. OwnFormatters breaks down minute, hour, day, month and weekday values into a readable schedule.</p>
      </header>

      <section style="background:#0f172a;border:1px solid #334155;border-radius:12px;padding:24px;margin-bottom:40px;">
        <p style="margin:0 0 12px 0;font-size:13px;color:#94a3b8;font-weight:600;">Unix 5-Field Cron Parser &amp; Schedule Calculator Workspace</p>
        <p style="font-size:13px;color:#cbd5e1;margin:0;">Validate expressions against POSIX crontab standards, inspect field boundaries, review human-readable explanations, and calculate upcoming run dates in local time or UTC.</p>
      </section>

      <article style="border-top:1px solid #334155;padding-top:32px;">
        <section style="margin-bottom:32px;">
          <h2 style="color:#f8fafc;font-size:22px;font-weight:700;margin:0 0 12px 0;">What is a Cron Expression?</h2>
          <p style="margin:0;font-size:14px;color:#cbd5e1;">A cron expression is a compact string format used by Unix, Linux, and modern job schedulers to define automated execution intervals. In standard Unix crontab specifications, an expression consists of exactly five space-separated fields representing Minute (0-59), Hour (0-23), Day of Month (1-31), Month (1-12), and Day of Week (0-6, where 0 is Sunday). When a schedule daemon evaluates the expression, it determines whether the current system timestamp satisfies all active field constraints.</p>
        </section>

        <section style="margin-bottom:32px;">
          <h2 style="color:#f8fafc;font-size:22px;font-weight:700;margin:0 0 12px 0;">The Standard 5-Field Format</h2>
          <p style="font-size:14px;color:#cbd5e1;margin:0 0 12px 0;">Standard crontab follows a strict 5-column positional order:</p>
          <pre style="background:#020617;border:1px solid #334155;padding:12px;border-radius:8px;font-family:monospace;font-size:13px;color:#38bdf8;overflow-x:auto;">* * * * *
┬ ┬ ┬ ┬ ┬
│ │ │ │ └─ Day of Week (0 - 6, 0 = Sun)
│ │ │ └─── Month (1 - 12)
│ │ └───── Day of Month (1 - 31)
│ └─────── Hour (0 - 23)
└───────── Minute (0 - 59)</pre>
        </section>

        <section style="margin-bottom:32px;">
          <h2 style="color:#f8fafc;font-size:22px;font-weight:700;margin:0 0 12px 0;">Day of Month vs Day of Week Semantics</h2>
          <p style="font-size:14px;color:#cbd5e1;margin:0;">A critical distinction in standard POSIX crontab is the handling of day constraints. When both Day of Month and Day of Week are explicitly restricted (neither is an asterisk *), standard cron evaluates the condition as a logical OR union rather than an AND intersection. The job fires if either the calendar day matches OR the day of the week matches.</p>
        </section>

        <section style="margin-bottom:32px;">
          <h2 style="color:#f8fafc;font-size:22px;font-weight:700;margin:0 0 12px 0;">Related Developer Utilities</h2>
          <ul style="padding-left:20px;font-size:14px;color:#818cf8;margin:0;">
            <li style="margin-bottom:6px;"><a href="/timestamp-converter" style="color:#818cf8;text-decoration:none;">Unix Timestamp &amp; Epoch Converter</a> - Convert epoch milliseconds, seconds, and ISO 8601</li>
            <li style="margin-bottom:6px;"><a href="/json-formatter" style="color:#818cf8;text-decoration:none;">Free Online JSON Formatter &amp; Beautifier</a> - Format and validate structured JSON data</li>
            <li style="margin-bottom:6px;"><a href="/regex-tester" style="color:#818cf8;text-decoration:none;">Regex Tester &amp; Explainer</a> - Test and debug regular expressions with capture groups</li>
            <li style="margin-bottom:6px;"><a href="/docker-compose-validator" style="color:#818cf8;text-decoration:none;">Docker Compose Validator</a> - Inspect container configurations and environment variables</li>
          </ul>
        </section>
      </article>

      <footer style="border-top:1px solid #334155;padding-top:20px;color:#64748b;font-size:13px;">
        <p>© 2026 OwnFormatters Core Engineering Team. Published with zero-egress client-side privacy guarantees.</p>
      </footer>
    </div>`;
  } else if (route === 'yaml-formatter') {
    fallbackHtml = `<div id="static-fallback" style="padding:40px 20px;max-width:1100px;margin:0 auto;font-family:system-ui,-apple-system,sans-serif;color:#cbd5e1;line-height:1.7;">
      <nav aria-label="Breadcrumb" style="margin-bottom:16px;font-size:13px;color:#94a3b8;">
        <a href="/" style="color:#818cf8;text-decoration:none;">Home</a> &gt; <a href="/#formatters" style="color:#818cf8;text-decoration:none;">Formatters &amp; Beautifiers</a> &gt; <span style="color:#e2e8f0;font-weight:600;">YAML Formatter &amp; Converter</span>
      </nav>
      <header style="border-bottom:1px solid #334155;padding-bottom:20px;margin-bottom:28px;">
        <h1 style="color:#f8fafc;font-size:32px;font-weight:900;margin:0 0 12px 0;letter-spacing:-0.02em;">YAML Formatter &amp; YAML to JSON Converter</h1>
        <p style="font-size:15px;color:#94a3b8;margin:0;max-width:800px;line-height:1.6;">Format, beautify, and validate YAML online, convert YAML to JSON or JSON to YAML with accurate syntax verification, configurable indentation, and client-side privacy.</p>
      </header>

      <section style="background:#0f172a;border:1px solid #334155;border-radius:12px;padding:24px;margin-bottom:40px;">
        <p style="margin:0 0 12px 0;font-size:13px;color:#94a3b8;font-weight:600;">Interactive YAML Formatter &amp; Bi-Directional Converter Workspace</p>
        <p style="font-size:13px;color:#cbd5e1;margin:0 0 16px 0;">Paste or edit raw YAML or JSON to beautify structure, validate indentation, convert formats, and copy or download results with zero server latency.</p>
        <div style="display:flex;gap:12px;flex-wrap:wrap;">
          <span style="display:inline-flex;align-items:center;padding:6px 12px;background:#1e293b;border:1px solid #475569;border-radius:6px;font-size:12px;font-family:monospace;color:#38bdf8;">✓ YAML 1.2 Standards Compliant</span>
          <span style="display:inline-flex;align-items:center;padding:6px 12px;background:#1e293b;border:1px solid #475569;border-radius:6px;font-size:12px;font-family:monospace;color:#38bdf8;">✓ 2-Space &amp; 4-Space Indentation</span>
          <span style="display:inline-flex;align-items:center;padding:6px 12px;background:#1e293b;border:1px solid #475569;border-radius:6px;font-size:12px;font-family:monospace;color:#38bdf8;">✓ Preserves Comments &amp; Anchors</span>
          <span style="display:inline-flex;align-items:center;padding:6px 12px;background:#1e293b;border:1px solid #475569;border-radius:6px;font-size:12px;font-family:monospace;color:#34d399;">✓ 100% Client-Side In-Browser Execution</span>
        </div>
      </section>

      <article style="border-top:1px solid #334155;padding-top:32px;">
        <section style="margin-bottom:32px;">
          <h2 style="color:#f8fafc;font-size:22px;font-weight:700;margin:0 0 12px 0;">What Is YAML?</h2>
          <p style="margin:0;font-size:14px;color:#cbd5e1;">YAML (YAML Ain't Markup Language) is a human-readable data serialization language widely adopted across DevOps, cloud-native orchestration, and software development. Governed by the YAML 1.2 specification, YAML represents structural hierarchies using precise whitespace indentation rather than the curly braces and quotation marks mandated by JSON. YAML is the primary configuration format for Kubernetes manifests, Docker Compose services, GitHub Actions workflows, Ansible playbooks, and OpenAPI specifications.</p>
        </section>

        <section style="margin-bottom:32px;">
          <h2 style="color:#f8fafc;font-size:22px;font-weight:700;margin:0 0 12px 0;">How to Format and Validate YAML</h2>
          <ol style="padding-left:20px;font-size:14px;color:#cbd5e1;margin:0;">
            <li style="margin-bottom:6px;"><strong>Paste or Edit YAML:</strong> Paste your raw YAML document, Kubernetes manifest, or Docker Compose configuration into the editor.</li>
            <li style="margin-bottom:6px;"><strong>Choose Indentation:</strong> Select your desired indentation level—2 Spaces (cloud standard) or 4 Spaces.</li>
            <li style="margin-bottom:6px;"><strong>Run Format &amp; Beautify:</strong> Click Format &amp; Beautify YAML to parse the document, validate syntax, standardize spacing, and preserve inline comments.</li>
            <li style="margin-bottom:6px;"><strong>Inspect Syntax Errors:</strong> If indentation is misaligned or illegal tab characters are detected, the validator reports the precise line and column location.</li>
            <li style="margin-bottom:6px;"><strong>Copy or Download:</strong> Use the one-click copy button or download the formatted .yaml file to commit into your repository.</li>
          </ol>
        </section>

        <section style="margin-bottom:32px;">
          <h2 style="color:#f8fafc;font-size:22px;font-weight:700;margin:0 0 12px 0;">YAML to JSON Conversion</h2>
          <p style="margin:0;font-size:14px;color:#cbd5e1;">Converting YAML to JSON maps YAML key-value dictionaries to JSON objects, YAML lists to JSON arrays, and resolves scalar datatypes according to RFC 8259 specifications. Anchors (&amp;) and aliases (*) are expanded into concrete JSON properties. If your YAML stream contains multiple documents separated by ---, the converter wraps them into a root JSON array.</p>
        </section>

        <section style="margin-bottom:32px;">
          <h2 style="color:#f8fafc;font-size:22px;font-weight:700;margin:0 0 12px 0;">JSON to YAML Conversion</h2>
          <p style="margin:0;font-size:14px;color:#cbd5e1;">The reverse conversion transforms rigid JSON payloads into lightweight, indentation-based YAML. Nested objects become clean structural blocks without extraneous quotes, arrays are formatted as clean bulleted dashes (-), and quotes are applied only to strings containing colons, symbols, or reserved boolean keywords.</p>
        </section>

        <section style="margin-bottom:32px;">
          <h2 style="color:#f8fafc;font-size:22px;font-weight:700;margin:0 0 12px 0;">YAML Validation and Common Errors</h2>
          <ul style="padding-left:20px;font-size:14px;color:#cbd5e1;margin:0;">
            <li style="margin-bottom:6px;"><strong>Tab Characters:</strong> YAML strictly forbids tab characters for indentation. Always use spaces.</li>
            <li style="margin-bottom:6px;"><strong>Inconsistent Indentation:</strong> Child keys must be indented further than parent keys. Mixing 2-space and 3-space indents breaks parsing.</li>
            <li style="margin-bottom:6px;"><strong>Unquoted Special Characters:</strong> Strings containing colons followed by a space, hashes, or leading dashes must be enclosed in quotes.</li>
          </ul>
        </section>

        <section style="margin-bottom:32px;">
          <h2 style="color:#f8fafc;font-size:22px;font-weight:700;margin:0 0 12px 0;">Frequently Asked Questions (FAQ)</h2>
          <div style="margin-bottom:16px;">
            <h3 style="color:#e2e8f0;font-size:16px;font-weight:600;margin:0 0 4px 0;">What is a YAML formatter?</h3>
            <p style="font-size:13px;color:#94a3b8;margin:0;">A YAML formatter parses YAML documents, validates syntax according to YAML 1.2 specifications, aligns indentation consistently across all nested blocks, and removes unnecessary whitespace while preserving comments and anchors.</p>
          </div>
          <div style="margin-bottom:16px;">
            <h3 style="color:#e2e8f0;font-size:16px;font-weight:600;margin:0 0 4px 0;">Are files uploaded to a server?</h3>
            <p style="font-size:13px;color:#94a3b8;margin:0;">No. All parsing, validation, and conversion operations run 100% locally inside your web browser. Your configuration files and secrets are never transmitted or stored on remote servers.</p>
          </div>
          <div style="margin-bottom:16px;">
            <h3 style="color:#e2e8f0;font-size:16px;font-weight:600;margin:0 0 4px 0;">Does YAML support comments?</h3>
            <p style="font-size:13px;color:#94a3b8;margin:0;">Yes. Any text following a hash mark (#) is treated as a comment. When you format YAML with OwnFormatters, your comments are retained.</p>
          </div>
        </section>

        <section style="margin-bottom:32px;">
          <h2 style="color:#f8fafc;font-size:22px;font-weight:700;margin:0 0 12px 0;">Related Developer Utilities</h2>
          <ul style="padding-left:20px;font-size:14px;color:#818cf8;margin:0;">
            <li style="margin-bottom:6px;"><a href="/json-formatter" style="color:#818cf8;text-decoration:none;">Free Online JSON Formatter &amp; Beautifier</a> - Format, validate, and minify RFC 8259 JSON</li>
            <li style="margin-bottom:6px;"><a href="/k8s-yaml-validator" style="color:#818cf8;text-decoration:none;">Kubernetes YAML Validator</a> - Verify Pod, Deployment &amp; Service manifests</li>
            <li style="margin-bottom:6px;"><a href="/docker-compose-validator" style="color:#818cf8;text-decoration:none;">Docker Compose Validator</a> - Inspect multi-container service configurations</li>
            <li style="margin-bottom:6px;"><a href="/cron-parser" style="color:#818cf8;text-decoration:none;">Cron Expression Parser &amp; Explainer</a> - Parse schedules &amp; calculate upcoming executions</li>
            <li style="margin-bottom:6px;"><a href="/base64-encoder-decoder" style="color:#818cf8;text-decoration:none;">Base64 Encoder / Decoder</a> - Encode and decode UTF-8 &amp; binary payloads</li>
          </ul>
        </section>
      </article>

      <footer style="border-top:1px solid #334155;padding-top:20px;color:#64748b;font-size:13px;">
        <p>© 2026 OwnFormatters Core Engineering Team. Published with zero-egress client-side privacy guarantees.</p>
      </footer>
    </div>`;
  } else {
    fallbackHtml = `<div id="static-fallback" style="padding:40px 20px;max-width:900px;margin:0 auto;font-family:system-ui,-apple-system,sans-serif;color:#cbd5e1;line-height:1.7;">
        <header style="border-bottom:1px solid #334155;padding-bottom:20px;margin-bottom:24px;">
          <h1 style="color:#f8fafc;font-size:28px;font-weight:800;margin:0 0 12px 0;">${routeTitle}</h1>
          <p style="font-size:15px;color:#94a3b8;margin:0;">${routeDesc}</p>
        </header>
        <section style="margin-bottom:32px;">
          <h2 style="color:#38bdf8;font-size:20px;font-weight:700;">Technical Overview & Standards Compliance</h2>
          <p>OwnFormatters provides enterprise-grade, browser-based developer utilities designed to eliminate data privacy risks. When working with sensitive payloads, tokens, database configurations, and source code, traditional online utilities send raw text over public networks to remote servers. OwnFormatters runs 100% locally in your browser memory thread.</p>
        </section>
        <section style="margin-bottom:32px;">
          <h2 style="color:#38bdf8;font-size:20px;font-weight:700;">Developer Guidelines & Best Practices</h2>
          <ul style="padding-left:20px;color:#cbd5e1;">
            <li>Verify syntax against international standards (RFC 8259, RFC 7519, RFC 4122, W3C specifications) before deploying.</li>
            <li>Maintain zero server logging: all data is isolated within client-side WebWorkers.</li>
            <li>Use offline PWA capabilities to format, validate, and convert payloads without internet connectivity.</li>
          </ul>
        </section>
        <footer style="border-top:1px solid #334155;padding-top:20px;color:#64748b;font-size:13px;">
          <p>© 2026 OwnFormatters Core Engineering Team. Published with zero-egress data guarantees.</p>
        </footer>
      </div>`;
  }

  let customizedHtml = baseHtml
    .replace(/<link rel="canonical" href="[^"]*">/, `<link rel="canonical" href="${canonicalUrl}">`)
    .replace(/<meta property="og:url" content="[^"]*">/, `<meta property="og:url" content="${canonicalUrl}">`)
    .replace(/<title>[^<]*<\/title>/, `<title>${routeTitle}</title>`)
    .replace(/<meta name="title" content="[^"]*">/, `<meta name="title" content="${routeTitle}">`)
    .replace(/<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${routeTitle}">`)
    .replace(/<meta name="twitter:title" content="[^"]*">/, `<meta name="twitter:title" content="${routeTitle}">`)
    .replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${routeDesc}">`)
    .replace(/<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${routeDesc}">`);

  if (fallbackHtml) {
    customizedHtml = customizedHtml.replace(
      /<div id="root">[\s\S]*?<\/div>\s*<\/body>/,
      `<div id="root">${fallbackHtml}</div>\n  </body>`
    );
  }

  if (route === 'json-formatter') {
    const jsonWebAppSchema = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "Free Online JSON Formatter & Beautifier",
      "url": "https://ownformatters.com/json-formatter",
      "description": "Format, beautify, validate and minify JSON instantly with the free OwnFormatters JSON Formatter. Choose indentation, fix readability and copy or download the result.",
      "applicationCategory": "DeveloperApplication",
      "operatingSystem": "All",
      "browserRequirements": "Requires JavaScript",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      }
    }, null, 2);

    const jsonFaqSchema = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What does a JSON formatter do?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "A JSON formatter parses unformatted, messy, or minified JSON strings and reorganizes them with consistent indentation (such as 2 spaces, 4 spaces, or tabs) and line breaks, making complex data structures easy for developers to read, inspect, and debug."
          }
        },
        {
          "@type": "Question",
          "name": "Can this tool format minified JSON?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. You can paste single-line or heavily minified JSON into the editor and click 'Beautify & Validate' to instantly expand it into human-readable formatted JSON with proper indentation."
          }
        },
        {
          "@type": "Question",
          "name": "Does the formatter validate JSON?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. The formatter checks your input against standard RFC 8259 JSON syntax rules. If your JSON has errors—such as missing quotes, trailing commas, or unescaped characters—the tool highlights the issue and points to the specific line and column number. It reports errors accurately without silently altering your source data."
          }
        },
        {
          "@type": "Question",
          "name": "What is the difference between formatting and minifying JSON?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Formatting (or beautifying / pretty printing) adds whitespace, indentation, and newlines to maximize human readability. Minifying removes all unnecessary whitespace, comments, and line breaks to produce the smallest possible payload size for fast network transmission."
          }
        },
        {
          "@type": "Question",
          "name": "Is my JSON uploaded to a server?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "No. All JSON formatting, validation, minification, and tree inspection happen entirely client-side inside your web browser. Your data is never uploaded, transmitted, or logged to OwnFormatters servers."
          }
        }
      ]
    }, null, 2);

    customizedHtml = customizedHtml
      .replace(/<script type="application\/ld\+json" id="schema-webapp">[\s\S]*?<\/script>/, `<script type="application/ld+json" id="schema-webapp">\n${jsonWebAppSchema}\n    </script>`)
      .replace(/<script type="application\/ld\+json" id="schema-faq">[\s\S]*?<\/script>/, `<script type="application/ld+json" id="schema-faq">\n${jsonFaqSchema}\n    </script>`);
  } else if (route === 'cron-parser') {
    const cronWebAppSchema = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "Cron Expression Parser & Explainer",
      "url": "https://ownformatters.com/cron-parser",
      "description": "Parse and explain cron expressions instantly. Understand each cron field, validate schedules, view human-readable meanings and calculate upcoming execution times.",
      "applicationCategory": "DeveloperApplication",
      "operatingSystem": "All",
      "browserRequirements": "Requires JavaScript",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      }
    }, null, 2);

    customizedHtml = customizedHtml
      .replace(/<script type="application\/ld\+json" id="schema-webapp">[\s\S]*?<\/script>/, `<script type="application/ld+json" id="schema-webapp">\n${cronWebAppSchema}\n    </script>`);
  } else if (route === 'yaml-formatter') {
    const yamlWebAppSchema = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "WebApplication",
      "name": "YAML Formatter & YAML to JSON Converter",
      "url": "https://ownformatters.com/yaml-formatter",
      "description": "Format and validate YAML, convert YAML to JSON or JSON to YAML, and copy or download clean output instantly with OwnFormatters.",
      "applicationCategory": "DeveloperApplication",
      "operatingSystem": "All",
      "browserRequirements": "Requires JavaScript",
      "offers": {
        "@type": "Offer",
        "price": "0",
        "priceCurrency": "USD"
      }
    }, null, 2);

    const yamlFaqSchema = JSON.stringify({
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What is a YAML formatter?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "A YAML formatter parses YAML documents, validates syntax according to YAML 1.2 specifications, aligns indentation consistently across all nested blocks, and removes unnecessary whitespace while preserving comments and anchors."
          }
        },
        {
          "@type": "Question",
          "name": "Can I convert YAML to JSON with this tool?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. Select YAML to JSON mode. The parser converts mappings to JSON objects, sequences to arrays, resolves anchors and aliases, and formats the output with clean indentation."
          }
        },
        {
          "@type": "Question",
          "name": "Can I convert JSON to YAML?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. Select JSON to YAML mode, paste your JSON data, and click convert. The engine transforms JSON objects and arrays into clean YAML with 2-space or 4-space indentation."
          }
        },
        {
          "@type": "Question",
          "name": "Does YAML support comments?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. Any text following a hash mark (#) is treated as a comment. When you format YAML with OwnFormatters, your comments are retained."
          }
        },
        {
          "@type": "Question",
          "name": "Are files uploaded to a server?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "No. All parsing, validation, and conversion operations run 100% locally inside your web browser. Your configuration files and secrets are never transmitted or stored on remote servers."
          }
        }
      ]
    }, null, 2);

    customizedHtml = customizedHtml
      .replace(/<script type="application\/ld\+json" id="schema-webapp">[\s\S]*?<\/script>/, `<script type="application/ld+json" id="schema-webapp">\n${yamlWebAppSchema}\n    </script>`)
      .replace(/<script type="application\/ld\+json" id="schema-faq">[\s\S]*?<\/script>/, `<script type="application/ld+json" id="schema-faq">\n${yamlFaqSchema}\n    </script>`);
  }

  // 1. Write route/index.html
  fs.writeFileSync(path.join(routeDir, 'index.html'), customizedHtml, 'utf8');
  
  // 2. Also write route.html directly for clean-URL web servers
  if (route !== 'home') {
    fs.writeFileSync(path.join(distDir, `${route}.html`), customizedHtml, 'utf8');
  }

  console.log(`- Created ${route}/index.html & ${route}.html [canonical: ${canonicalUrl}]`);
});

// 2. Generate Alias Redirect Pages (Pointing canonical strictly to primary target)
console.log('Generating alias redirect pages (with canonical pointing to primary target)...');
Object.entries(ALIAS_REDIRECT_MAP).forEach(([alias, target]) => {
  const aliasDir = path.join(distDir, alias);
  if (!fs.existsSync(aliasDir)) {
    fs.mkdirSync(aliasDir, { recursive: true });
  }

  const targetCanonicalUrl = `https://ownformatters.com/${target}`;
  const targetTitle = formatTitle(target);

  let redirectHtml = baseHtml
    .replace(/<link rel="canonical" href="[^"]*">/, `<link rel="canonical" href="${targetCanonicalUrl}">`)
    .replace(/<meta property="og:url" content="[^"]*">/, `<meta property="og:url" content="${targetCanonicalUrl}">`)
    .replace(/<title>[^<]*<\/title>/, `<title>Redirecting to ${targetTitle}</title>`)
    .replace(/<head>/, `<head>\n    <meta http-equiv="refresh" content="0;url=/${target}">\n    <script>window.location.replace("/${target}");</script>`)
    .replace(
      /<div id="root">[\s\S]*?<\/div>\s*<\/body>/,
      `<div id="root"><p style="padding:40px;font-family:sans-serif;color:#cbd5e1;">Redirecting to <a href="/${target}" style="color:#38bdf8;">/${target}</a>...</p></div>\n  </body>`
    );

  fs.writeFileSync(path.join(aliasDir, 'index.html'), redirectHtml, 'utf8');
  fs.writeFileSync(path.join(distDir, `${alias}.html`), redirectHtml, 'utf8');
  console.log(`- Created alias redirect: ${alias} -> ${target} [canonical: ${targetCanonicalUrl}]`);
});

console.log('SEO static routes & alias redirects successfully generated!');
