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
