import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const routes = [
  'home',
  'json-formatter',
  'json-validator',
  'json-beautifier',
  'json-schema-generator',
  'json-schema-validator',
  'jsonpath-tester',
  'jsonpath-evaluator',
  'yaml-converter',
  'yaml-formatter',
  'yaml-to-json',
  'json-to-yaml',
  'xml-formatter',
  'xml-beautifier',
  'xml-to-json',
  'json-to-xml',
  'sql-formatter',
  'sql-beautifier',
  'code-minifier',
  'html-minifier',
  'css-minifier',
  'js-minifier',
  'api-tester',
  'rest-api-tester',
  'graphql-tester',
  'graphql-client',
  'openapi-viewer',
  'swagger-viewer',
  'webhook-tester',
  'mock-api-server',
  'docker-compose-validator',
  'docker-validator',
  'k8s-yaml-validator',
  'kubernetes-validator',
  'nginx-config-formatter',
  'nginx-formatter',
  'base64-encoder',
  'base64-decoder',
  'base64-encoder-decoder',
  'base64-decode',
  'base64-encode',
  'url-encoder',
  'url-decoder',
  'url-encoder-decoder',
  'jwt-debugger',
  'jwt-decoder',
  'jwt-parser',
  'timestamp-converter',
  'epoch-converter',
  'unix-timestamp-converter',
  'text-utility',
  'hash-generator',
  'md5-generator',
  'sha256-generator',
  'uuid-generator',
  'guid-generator',
  'qrcode-generator',
  'qr-code-generator',
  'markdown-editor',
  'markdown-previewer',
  'csv-converter',
  'csv-to-json',
  'json-to-csv',
  'csv-json-converter',
  'color-converter',
  'hex-to-rgb',
  'rgb-to-hex',
  'number-base-converter',
  'binary-converter',
  'hex-converter',
  'cron-parser',
  'cron-tester',
  'cron-expression-descriptor',
  'regex-tester',
  'regex-checker',
  'text-diff',
  'diff-checker',
  'diff-tool',
  'privacy-policy',
  'privacy',
  'terms-of-service',
  'terms',
  'about-us',
  'about',
  'indexnow-submitter',
  'indexnow',
  'json-to-code',
  'json-to-typescript',
  'json-to-types',
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
  const clean = route.replace(/^learn-/, 'Learn ').replace(/-/g, ' ');
  const capitalized = clean.replace(/\b\w/g, l => l.toUpperCase());
  return `${capitalized} – OwnFormatters`;
}

function getRouteDescription(route) {
  const name = route.replace(/^learn-/, '').replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  return `Comprehensive developer guide, technical specifications, and 100% offline client-side utility for ${name}. Formatted following strict RFC and W3C web standards with zero server logging and zero network egress.`;
}

console.log('Generating physical route index.html files with self-referencing canonical URLs and pre-rendered semantic HTML...');

routes.forEach((route) => {
  const routeDir = path.join(distDir, route);
  if (!fs.existsSync(routeDir)) {
    fs.mkdirSync(routeDir, { recursive: true });
  }

  const canonicalUrl = route === 'home' ? 'https://ownformatters.com/' : `https://ownformatters.com/${route}`;
  const routeTitle = formatTitle(route);
  const routeDesc = getRouteDescription(route);

  // Inject route-specific fallback content inside <div id="root">
  const fallbackHtml = route === 'home' 
    ? '' 
    : `<div id="static-fallback" style="padding:40px 20px;max-width:900px;margin:0 auto;font-family:system-ui,-apple-system,sans-serif;color:#cbd5e1;line-height:1.7;">
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

  let customizedHtml = baseHtml
    .replace(/<link rel="canonical" href="[^"]*">/, `<link rel="canonical" href="${canonicalUrl}">`)
    .replace(/<meta property="og:url" content="[^"]*">/, `<meta property="og:url" content="${canonicalUrl}">`)
    .replace(/<title>[^<]*<\/title>/, `<title>${routeTitle}</title>`)
    .replace(/<meta property="og:title" content="[^"]*">/, `<meta property="og:title" content="${routeTitle}">`)
    .replace(/<meta name="twitter:title" content="[^"]*">/, `<meta name="twitter:title" content="${routeTitle}">`)
    .replace(/<meta name="description" content="[^"]*">/, `<meta name="description" content="${routeDesc}">`)
    .replace(/<meta property="og:description" content="[^"]*">/, `<meta property="og:description" content="${routeDesc}">`);

  if (fallbackHtml) {
    customizedHtml = customizedHtml.replace(
      '<div id="root"></div>',
      `<div id="root">${fallbackHtml}</div>`
    );
  }

  // 1. Write route/index.html
  fs.writeFileSync(path.join(routeDir, 'index.html'), customizedHtml, 'utf8');
  
  // 2. Also write route.html directly for clean-URL web servers
  if (route !== 'home') {
    fs.writeFileSync(path.join(distDir, `${route}.html`), customizedHtml, 'utf8');
  }

  console.log(`- Created ${route}/index.html & ${route}.html [canonical: ${canonicalUrl}]`);
});

console.log('SEO static routes successfully generated!');

