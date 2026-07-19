import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const routes = [
  'home',
  'json-formatter',
  'json-schema-generator',
  'jsonpath-tester',
  'yaml-converter',
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
  'base64-encoder',
  'url-encoder',
  'jwt-debugger',
  'timestamp-converter',
  'text-utility',
  'hash-generator',
  'uuid-generator',
  'qrcode-generator',
  'markdown-editor',
  'csv-converter',
  'color-converter',
  'number-base-converter',
  'cron-parser',
  'regex-tester',
  'text-diff',
  'privacy-policy',
  'terms-of-service',
  'about-us',
  'indexnow-submitter',
  'json-to-code'
];

const distDir = path.resolve(__dirname, '../dist');
const indexPath = path.join(distDir, 'index.html');

if (!fs.existsSync(indexPath)) {
  console.error('Error: dist/index.html does not exist. Run vite build first.');
  process.exit(1);
}

console.log('Generating physical route index.html files for static SEO indexation...');

routes.forEach((route) => {
  const routeDir = path.join(distDir, route);
  if (!fs.existsSync(routeDir)) {
    fs.mkdirSync(routeDir, { recursive: true });
  }
  fs.copyFileSync(indexPath, path.join(routeDir, 'index.html'));
  console.log(`- Created ${route}/index.html`);
});

console.log('SEO static routes successfully generated!');
