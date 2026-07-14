import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  Code, 
  Terminal, 
  Globe, 
  Lock, 
  Settings, 
  Search, 
  Braces, 
  Database, 
  FileCode, 
  Key, 
  Clock, 
  AlignLeft, 
  Maximize2, 
  ShieldCheck, 
  Network,
  ChevronRight,
  BookOpen,
  HelpCircle,
  Hash,
  Minimize2,
  QrCode,
  FileText,
  FileSpreadsheet,
  Palette,
  Binary,
  Columns,
  Home,
  Layers,
  Cpu,
  Server
} from 'lucide-react';

import JsonTool from './components/JsonTool';
import JsonSchemaTool from './components/JsonSchemaTool';
import JsonPathTool from './components/JsonPathTool';
import OpenApiTool from './components/OpenApiTool';
import WebhookTool from './components/WebhookTool';
import MockApiTool from './components/MockApiTool';
import ApiTool from './components/ApiTool';
import GraphqlTool from './components/GraphqlTool';
import DockerTool from './components/DockerTool';
import K8sTool from './components/K8sTool';
import NginxTool from './components/NginxTool';
import EncoderTool from './components/EncoderTool';
import JwtTool from './components/JwtTool';
import SqlTool from './components/SqlTool';
import XmlTool from './components/XmlTool';
import TimestampTool from './components/TimestampTool';
import TextTool from './components/TextTool';

// New Advanced Tools Imports
import YamlTool from './components/YamlTool';
import HashTool from './components/HashTool';
import MinifyTool from './components/MinifyTool';
import UuidTool from './components/UuidTool';
import QrcodeTool from './components/QrcodeTool';
import MarkdownTool from './components/MarkdownTool';

// Missing Tools Imports
import CsvTool from './components/CsvTool';
import ColorTool from './components/ColorTool';
import NumberBaseTool from './components/NumberBaseTool';
import CronTool from './components/CronTool';
import RegexTool from './components/RegexTool';
import DiffTool from './components/DiffTool';
import HomeTool from './components/HomeTool';
import PrivacyTool from './components/PrivacyTool';
import TermsTool from './components/TermsTool';
import AboutTool from './components/AboutTool';

import { ToolId, ToolDefinition } from './types';

const TOOLS_LIST: ToolDefinition[] = [
  {
    id: 'json',
    name: 'JSON Formatter & Validator',
    description: 'Beautify, minify, inspect, and validate raw JSON trees with syntax error marking.',
    category: 'formatter',
    icon: 'Braces'
  },
  {
    id: 'jsonschema',
    name: 'JSON Schema Generator & Validator',
    description: 'Auto-generate draft-07 compatible schemas and validate JSON data structures instantly.',
    category: 'formatter',
    icon: 'Sparkles'
  },
  {
    id: 'jsonpath',
    name: 'JSONPath Tester',
    description: 'Execute query expressions and extract matching element nodes from nested objects.',
    category: 'formatter',
    icon: 'Search'
  },
  {
    id: 'yaml',
    name: 'YAML <-> JSON Converter',
    description: 'Bi-directional real-time YAML and JSON converter with nested object support.',
    category: 'formatter',
    icon: 'FileText'
  },
  {
    id: 'xml',
    name: 'XML Formatter & Beautifier',
    description: 'Format, align, indent, and parse XML code snippets cleanly.',
    category: 'formatter',
    icon: 'FileCode'
  },
  {
    id: 'sql',
    name: 'SQL Formatter & Beautifier',
    description: 'Beautify, uppercase keyword structures, and indent relational database queries.',
    category: 'formatter',
    icon: 'Database'
  },
  {
    id: 'minify',
    name: 'HTML, CSS & JS Code Minifier',
    description: 'Strip white spaces, remove comments, and compress web assets for maximum speed.',
    category: 'formatter',
    icon: 'Minimize2'
  },
  {
    id: 'api',
    name: 'API Request Tester',
    description: 'HTTP client workspace to build, test and send REST API requests with proxy bypass.',
    category: 'network',
    icon: 'Network'
  },
  {
    id: 'graphql',
    name: 'GraphQL API Tester',
    description: 'Interactive GraphQL client playground to test queries, variables, and headers with live node trees.',
    category: 'network',
    icon: 'Braces'
  },
  {
    id: 'openapi',
    name: 'OpenAPI & Swagger Viewer',
    description: 'Paste specs to render elegant interactive API documents complete with active Test client.',
    category: 'network',
    icon: 'BookOpen'
  },
  {
    id: 'webhook',
    name: 'Webhook Tester & Signer',
    description: 'Construct event templates, sign using real HMAC SHA-256 keys, and fire Webhook POST calls.',
    category: 'network',
    icon: 'Globe'
  },
  {
    id: 'mockapi',
    name: 'Interactive Mock API Server',
    description: 'Build REST endpoints, simulate response latencies, and capture client transaction logs.',
    category: 'network',
    icon: 'Server'
  },
  {
    id: 'docker',
    name: 'Docker Compose Validator',
    description: 'Diagnose indentation errors, visualize container topologies, and map service networks.',
    category: 'devops',
    icon: 'Layers'
  },
  {
    id: 'k8s',
    name: 'Kubernetes YAML Validator',
    description: 'Verify deployment specs, audit API resources, check CPU/Memory limits, and manage namespaces.',
    category: 'devops',
    icon: 'Cpu'
  },
  {
    id: 'nginx',
    name: 'Nginx Config Formatter',
    description: 'Format directive spacing, detect missing semicolons, verify bracket nesting, and audit SSL setup.',
    category: 'devops',
    icon: 'Globe'
  },
  {
    id: 'base64',
    name: 'Base64 & URL Encoder',
    description: 'Robust, UTF-8 secure encoder and decoder for Base64 and Percent-Encoded strings.',
    category: 'encoder',
    icon: 'Terminal'
  },
  {
    id: 'jwt',
    name: 'JWT Token Debugger',
    description: 'Decode and inspect JSON Web Tokens instantly, verifying claims and expiration dates.',
    category: 'utility',
    icon: 'Key'
  },
  {
    id: 'timestamp',
    name: 'Epoch Unix Timestamp Converter',
    description: 'Convert Unix epoch timestamps to human readable date formats and vice versa.',
    category: 'utility',
    icon: 'Clock'
  },
  {
    id: 'text',
    name: 'Text Utility Case & Counters',
    description: 'Transform string case, sort lines, deduplicate, and analyze character/word statistics.',
    category: 'utility',
    icon: 'AlignLeft'
  },
  {
    id: 'hash',
    name: 'Cryptographic Hash Generator',
    description: 'Generate high-performance secure MD5, SHA-1, SHA-256, and SHA-512 checksums.',
    category: 'utility',
    icon: 'Hash'
  },
  {
    id: 'uuid',
    name: 'UUID v4 & Password Generator',
    description: 'Generate random UUIDs and secure cryptographic password strings with high entropy.',
    category: 'utility',
    icon: 'Key'
  },
  {
    id: 'qrcode',
    name: 'Dynamic QR Code Generator',
    description: 'Generate customizable QR Codes with custom background/foreground color grids.',
    category: 'utility',
    icon: 'QrCode'
  },
  {
    id: 'markdown',
    name: 'Markdown Live Editor & Preview',
    description: 'Sleek split-pane Markdown editor and HTML previewer for rapid document drafts.',
    category: 'utility',
    icon: 'BookOpen'
  },
  {
    id: 'csv',
    name: 'CSV <-> JSON Converter',
    description: 'Convert CSV data to JSON and vice-versa with custom delimiters and RFC-4180 parsing.',
    category: 'formatter',
    icon: 'FileSpreadsheet'
  },
  {
    id: 'color',
    name: 'Color Space Converter',
    description: 'Convert HEX, RGB, HSL, CMYK colors with dynamic palettes and WCAG contrast calculators.',
    category: 'utility',
    icon: 'Palette'
  },
  {
    id: 'base',
    name: 'Multi-Radix Number Base Converter',
    description: 'Convert between Decimal, Binary, Octal, Hex, or custom bases from 2 to 36.',
    category: 'utility',
    icon: 'Binary'
  },
  {
    id: 'cron',
    name: 'Cron Expression Parser & Builder',
    description: 'Parse standard cron expressions into human language with upcoming execution schedules.',
    category: 'utility',
    icon: 'Clock'
  },
  {
    id: 'regex',
    name: 'Regex Tester & Highlighter',
    description: 'Validate regular expressions with real-time match highlights and captured groups breakdown.',
    category: 'utility',
    icon: 'Search'
  },
  {
    id: 'diff',
    name: 'Myers Text Diff & Comparator',
    description: 'Compare two text snapshots line-by-line using Myers LCS with inline or split views.',
    category: 'utility',
    icon: 'Columns'
  }
];

const PATH_TO_TOOL_MAP: Record<string, ToolId> = {
  '/home': 'home',
  '/json-formatter': 'json',
  '/json-schema-generator': 'jsonschema',
  '/jsonpath-tester': 'jsonpath',
  '/yaml-converter': 'yaml',
  '/xml-formatter': 'xml',
  '/sql-formatter': 'sql',
  '/code-minifier': 'minify',
  '/api-tester': 'api',
  '/graphql-tester': 'graphql',
  '/openapi-viewer': 'openapi',
  '/webhook-tester': 'webhook',
  '/mock-api-server': 'mockapi',
  '/docker-compose-validator': 'docker',
  '/k8s-yaml-validator': 'k8s',
  '/nginx-config-formatter': 'nginx',
  '/base64-encoder': 'base64',
  '/url-encoder': 'url',
  '/jwt-debugger': 'jwt',
  '/timestamp-converter': 'timestamp',
  '/text-utility': 'text',
  '/hash-generator': 'hash',
  '/uuid-generator': 'uuid',
  '/qrcode-generator': 'qrcode',
  '/markdown-editor': 'markdown',
  '/csv-converter': 'csv',
  '/color-converter': 'color',
  '/number-base-converter': 'base',
  '/cron-parser': 'cron',
  '/regex-tester': 'regex',
  '/text-diff': 'diff',
  '/privacy-policy': 'privacy',
  '/terms-of-service': 'terms',
  '/about-us': 'about',
};

const TOOL_TO_PATH_MAP: Record<ToolId, string> = {
  home: '/home',
  json: '/json-formatter',
  jsonschema: '/json-schema-generator',
  jsonpath: '/jsonpath-tester',
  yaml: '/yaml-converter',
  xml: '/xml-formatter',
  sql: '/sql-formatter',
  minify: '/code-minifier',
  api: '/api-tester',
  graphql: '/graphql-tester',
  openapi: '/openapi-viewer',
  webhook: '/webhook-tester',
  mockapi: '/mock-api-server',
  docker: '/docker-compose-validator',
  k8s: '/k8s-yaml-validator',
  nginx: '/nginx-config-formatter',
  base64: '/base64-encoder',
  url: '/url-encoder',
  html: '/base64-encoder', // Fallback
  jwt: '/jwt-debugger',
  timestamp: '/timestamp-converter',
  text: '/text-utility',
  hash: '/hash-generator',
  uuid: '/uuid-generator',
  qrcode: '/qrcode-generator',
  markdown: '/markdown-editor',
  csv: '/csv-converter',
  color: '/color-converter',
  base: '/number-base-converter',
  cron: '/cron-parser',
  regex: '/regex-tester',
  diff: '/text-diff',
  privacy: '/privacy-policy',
  terms: '/terms-of-service',
  about: '/about-us',
};

// Global ads feature flag for AdSense sandboxing and SEO reviews
const SHOW_ADS = false;

// Real active ad scripts for high-converting premium ad inventory
function RealAdSlot({ position, activeTool }: { position: 'top' | 'right'; activeTool?: string }) {
  const containerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!SHOW_ADS) return;
    if (!containerRef.current) return;
    containerRef.current.innerHTML = '';

    const iframe = document.createElement('iframe');
    iframe.style.border = 'none';
    iframe.style.overflow = 'hidden';
    iframe.style.background = 'transparent';

    if (position === 'top') {
      // Horizontal ad (728x90) after the title bar
      iframe.width = '728';
      iframe.height = '90';
      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; background: transparent; overflow: hidden; }
            </style>
          </head>
          <body>
            <script type="text/javascript">
              atOptions = {
                'key' : '0af48a35b1ed7ba39bf569c91661e9c3',
                'format' : 'iframe',
                'height' : 90,
                'width' : 728,
                'params' : {}
              };
            </script>
            <script type="text/javascript" src="https://www.highperformanceformat.com/0af48a35b1ed7ba39bf569c91661e9c3/invoke.js"></script>
          </body>
        </html>
      `;
      iframe.srcdoc = htmlContent;
    } else {
      // Vertical ad (160x600) in the right panel (160px width)
      iframe.width = '160';
      iframe.height = '600';
      
      const htmlContent = `
        <!DOCTYPE html>
        <html>
          <head>
            <style>
              body { margin: 0; padding: 0; display: flex; justify-content: center; align-items: center; background: transparent; overflow: hidden; }
            </style>
          </head>
          <body>
            <script type="text/javascript">
              atOptions = {
                'key' : '15ada0752e5c49998faddcd5796d91e3',
                'format' : 'iframe',
                'height' : 600,
                'width' : 160,
                'params' : {}
              };
            </script>
            <script type="text/javascript" src="https://www.highperformanceformat.com/15ada0752e5c49998faddcd5796d91e3/invoke.js"></script>
          </body>
        </html>
      `;
      iframe.srcdoc = htmlContent;
    }

    containerRef.current.appendChild(iframe);
  }, [position, activeTool]);

  if (!SHOW_ADS) {
    return null;
  }

  if (position === 'top') {
    return (
      <div className="flex flex-col items-center justify-center my-4 w-full px-4 overflow-x-auto">
        <span className="text-[10px] tracking-wider uppercase font-bold text-slate-500 font-mono mb-2">Advertisement</span>
        <div className="p-1 bg-slate-950/60 border border-slate-900 rounded-xl overflow-hidden shadow-xl max-w-full">
          <div ref={containerRef} className="w-[728px] h-[90px] flex items-center justify-center bg-[#02050b]" />
        </div>
      </div>
    );
  }

  // Right vertical panel (exactly 160px width, height 100%)
  return (
    <div className="flex flex-col items-center h-full w-full relative">
      <span className="text-[9px] tracking-wider uppercase font-bold text-slate-500 font-mono py-2 block text-center border-b border-slate-900 w-full mb-4">AD</span>
      <div className="relative w-[160px] h-[600px] flex justify-center items-start">
        <div ref={containerRef} className="w-[160px] h-[600px]" />
      </div>
    </div>
  );
}

const THEMES = {
  obsidian: {
    id: 'obsidian',
    name: 'Obsidian Dark',
    bg: 'bg-[#02050b]',
    text: 'text-slate-200',
    textMuted: 'text-slate-400',
    border: 'border-slate-900',
    borderMuted: 'border-slate-900/40',
    card: 'bg-slate-950/40',
    headerBg: 'bg-[#02050b]/80',
    heroBg: 'bg-gradient-to-b from-[#02050b] to-[#040914]',
    inputBg: 'bg-slate-950',
    panelBg: 'bg-slate-900',
    accentColor: 'text-indigo-400',
    badgeBg: 'bg-indigo-950/30 border-indigo-900/40 text-indigo-300',
    activeNav: '!bg-indigo-600 !text-white border-indigo-500',
    inactiveNav: 'bg-slate-950/50 text-slate-400 border-slate-900 hover:text-white hover:bg-slate-900',
    btnPrimary: '!bg-indigo-600 hover:bg-indigo-500 !text-white',
    btnSecondary: 'bg-slate-900 hover:bg-slate-850 border-slate-800 text-slate-200',
    footerBg: 'bg-slate-950',
    canvasBg: 'bg-[#02050c]',
    isDark: true
  },
  light: {
    id: 'light',
    name: 'Classic Light',
    bg: 'bg-white',
    text: 'text-slate-900',
    textMuted: 'text-slate-600',
    border: 'border-slate-200',
    borderMuted: 'border-slate-200/50',
    card: 'bg-white border-slate-200 shadow-sm',
    headerBg: 'bg-white/95 border-b border-slate-200',
    heroBg: 'bg-gradient-to-b from-slate-50 to-white border-b border-slate-200',
    inputBg: 'bg-white border-slate-200',
    panelBg: 'bg-slate-50',
    accentColor: 'text-indigo-600',
    badgeBg: 'bg-indigo-50 border border-indigo-100 text-indigo-700',
    activeNav: '!bg-indigo-600 !text-white border-indigo-600 shadow-sm',
    inactiveNav: 'bg-white text-slate-700 border-slate-200 hover:text-indigo-600 hover:bg-slate-50',
    btnPrimary: '!bg-indigo-600 hover:bg-indigo-700 !text-white shadow-sm',
    btnSecondary: 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800',
    footerBg: 'bg-slate-50 border-t border-slate-200',
    canvasBg: 'bg-white',
    isDark: false
  }
};

export default function App() {
  const [activeTool, setActiveTool] = useState<ToolId>('json');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Theme selection state with localStorage caching
  const [themeKey, setThemeKey] = useState<keyof typeof THEMES>(() => {
    const saved = localStorage.getItem('ownformatters-theme');
    return (saved && THEMES[saved as keyof typeof THEMES]) ? (saved as keyof typeof THEMES) : 'obsidian';
  });

  const theme = THEMES[themeKey];

  useEffect(() => {
    localStorage.setItem('ownformatters-theme', themeKey);
  }, [themeKey]);

  // 1. DYNAMIC URL ROUTER (SEO-Friendly Clean Path URLs)
  useEffect(() => {
    const handleLocationChange = () => {
      const path = window.location.pathname;
      let validTool = PATH_TO_TOOL_MAP[path];

      if (!validTool && window.location.hash) {
        const hash = window.location.hash.replace(/^#\//, '');
        validTool = TOOLS_LIST.find(t => t.id === hash)?.id || (hash === 'home' ? 'home' : undefined);
      }

      if (validTool) {
        setActiveTool(validTool);
      } else {
        window.history.replaceState(null, '', '/home');
        setActiveTool('home');
      }
    };

    handleLocationChange();

    window.addEventListener('popstate', handleLocationChange);
    window.addEventListener('hashchange', handleLocationChange);
    return () => {
      window.removeEventListener('popstate', handleLocationChange);
      window.removeEventListener('hashchange', handleLocationChange);
    };
  }, []);

  // 2. DYNAMIC CRAWLER SEO & METADATA UPDATE
  useEffect(() => {
    const targetPath = TOOL_TO_PATH_MAP[activeTool];
    if (targetPath && window.location.pathname !== targetPath) {
      window.history.pushState(null, '', targetPath);
    }

    if (activeTool === 'home') {
      document.title = "OwnFormatters - Free Online Developer Tools Suite | Home Dashboard";
      let metaDesc = document.querySelector('meta[name="description"]');
      if (!metaDesc) {
        metaDesc = document.createElement('meta');
        metaDesc.setAttribute('name', 'description');
        document.head.appendChild(metaDesc);
      }
      metaDesc.setAttribute('content', 'All-in-one free offline developer utilities dashboard. Formatters, encoders, network testers, security checksums, custom converters.');
      return;
    }

    const activeToolInfo = TOOLS_LIST.find(t => t.id === activeTool);
    if (!activeToolInfo) return;

    // High Keyword Density Titles
    const formattedTitle = `${activeToolInfo.name} - Free Online Developer Tools Suite | OwnFormatters`;
    document.title = formattedTitle;

    // Crawler meta description updating
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', `${activeToolInfo.description} Full-stack secure sandboxed developer utility by OwnCircles. 100% offline compliant, no user logs recorded.`);
  }, [activeTool]);

  const filteredTools = TOOLS_LIST.filter(tool => 
    tool.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tool.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
    tool.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getToolIcon = (iconName: string) => {
    switch (iconName) {
      case 'Braces': return <Braces className="w-4 h-4" />;
      case 'Network': return <Network className="w-4 h-4" />;
      case 'FileCode': return <FileCode className="w-4 h-4" />;
      case 'Database': return <Database className="w-4 h-4" />;
      case 'Terminal': return <Terminal className="w-4 h-4" />;
      case 'Key': return <Key className="w-4 h-4" />;
      case 'Clock': return <Clock className="w-4 h-4" />;
      case 'AlignLeft': return <AlignLeft className="w-4 h-4" />;
      case 'FileText': return <FileText className="w-4 h-4" />;
      case 'Hash': return <Hash className="w-4 h-4" />;
      case 'Minimize2': return <Minimize2 className="w-4 h-4" />;
      case 'QrCode': return <QrCode className="w-4 h-4" />;
      case 'BookOpen': return <BookOpen className="w-4 h-4" />;
      case 'FileSpreadsheet': return <FileSpreadsheet className="w-4 h-4" />;
      case 'Palette': return <Palette className="w-4 h-4" />;
      case 'Binary': return <Binary className="w-4 h-4" />;
      case 'Search': return <Search className="w-4 h-4" />;
      case 'Columns': return <Columns className="w-4 h-4" />;
      case 'Home': return <Home className="w-4 h-4" />;
      case 'Layers': return <Layers className="w-4 h-4" />;
      case 'Cpu': return <Cpu className="w-4 h-4" />;
      case 'Globe': return <Globe className="w-4 h-4" />;
      case 'Sparkles': return <Sparkles className="w-4 h-4" />;
      case 'Server': return <Server className="w-4 h-4" />;
      default: return <Code className="w-4 h-4" />;
    }
  };

  const getCategoryTheme = (category: string) => {
    switch (category) {
      case 'formatter': return 'from-indigo-500/20 to-violet-500/10 border-indigo-500/30 text-indigo-400';
      case 'network': return 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30 text-emerald-400';
      case 'encoder': return 'from-cyan-500/20 to-blue-500/10 border-cyan-500/30 text-cyan-400';
      case 'utility': return 'from-amber-500/20 to-orange-500/10 border-amber-500/30 text-amber-400';
      case 'devops': return 'from-rose-500/20 to-orange-500/10 border-rose-500/30 text-rose-400';
      default: return 'from-slate-500/20 to-slate-500/10 border-slate-500/30 text-slate-400';
    }
  };

  return (
    <div className={`min-h-screen ${theme.bg} ${theme.text} ${themeKey === 'light' ? 'theme-light' : 'theme-dark'} font-sans selection:bg-indigo-600/30 selection:text-indigo-200 flex flex-col relative transition-colors duration-250`}>
      
      {/* GRID PATTERN BACKDROP (Conditional on theme dark) */}
      {theme.isDark && (
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#090d16_1px,transparent_1px),linear-gradient(to_bottom,#090d16_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
      )}

      {/* BACKGROUND FUZZY NEBULA ACCENTS (Conditional on theme dark) */}
      {theme.isDark && (
        <>
          <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-indigo-500/5 rounded-full blur-[140px] pointer-events-none -translate-y-1/2" />
          <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-violet-500/5 rounded-full blur-[120px] pointer-events-none" />
        </>
      )}

      {/* HEADER BAR */}
      <header className={`sticky top-0 z-50 ${theme.headerBg} backdrop-blur-lg border-b ${theme.border} py-3 shadow-sm shadow-slate-950/25 w-full px-4 lg:px-6 transition-all`}>
        <div className="w-full flex flex-col md:flex-row items-center justify-between gap-4">
          
          {/* Brand Logo Identity */}
          <div className="flex items-center gap-3 self-start md:self-auto">
            <div className="w-9 h-9 rounded-xl bg-[#eef2f6] dark:bg-[#1e293b] flex items-center justify-center shadow-md border border-indigo-100/50 dark:border-slate-800 transition-colors">
              <Code className="w-5 h-5 text-[#2563eb] dark:text-[#3b82f6]" strokeWidth={3.2} />
            </div>
            <div>
              <span className={`text-sm font-black tracking-tight block ${themeKey === 'light' ? 'text-slate-800' : 'text-white'}`}>OwnFormatters</span>
              <span className={`text-[10px] block font-mono ${theme.textMuted}`}>by OwnCircles</span>
            </div>
          </div>

          {/* Dynamic Template Selection Presets */}
          <div className={`flex items-center gap-2 p-1 rounded-xl border ${theme.card} ${theme.border}`}>
            <span className={`text-[10px] font-bold uppercase font-mono px-2 ${theme.textMuted}`}>Theme:</span>
            <div className="flex items-center gap-1">
              {(Object.keys(THEMES) as Array<keyof typeof THEMES>).map((key) => {
                const tInfo = THEMES[key];
                const isActive = themeKey === key;
                return (
                  <button
                    key={key}
                    onClick={() => setThemeKey(key)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all duration-150 flex items-center gap-1.5 ${
                      isActive 
                        ? '!bg-indigo-600 !text-white shadow-sm border border-indigo-500' 
                        : `${theme.inactiveNav} border`
                    }`}
                    title={tInfo.name}
                  >
                    <span className={`w-2 h-2 rounded-full ${
                      key === 'obsidian' ? 'bg-indigo-400' : 'bg-slate-400 border border-slate-300'
                    }`} />
                    <span>{tInfo.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Secure status bar */}
          <div className="flex items-center gap-3 text-xs font-mono self-end md:self-auto">
            <span className={`hidden sm:flex items-center gap-2 px-3 py-1 border font-semibold rounded-full text-[11px] shadow-sm ${
              themeKey === 'light'
                ? 'bg-slate-100 border-slate-200 text-slate-950 font-bold'
                : 'bg-slate-900 dark:bg-slate-950/80 border-slate-800 dark:border-slate-800/80 text-white'
            }`}>
              <Lock className={`w-3.5 h-3.5 animate-pulse ${themeKey === 'light' ? 'text-emerald-600' : 'text-emerald-400'}`} />
              <span>100% Client-Side Private</span>
            </span>
          </div>

        </div>
      </header>

      {/* PREMIUM HERO BANNER */}
      <section className={`relative pt-10 pb-8 px-4 lg:px-6 overflow-hidden border-b ${theme.border} w-full ${theme.heroBg || ''}`}>
        <div className="w-full flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-3 max-w-3xl">
            <div className={`inline-flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded-full shadow-sm ${theme.badgeBg}`}>
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Active Encryption Sandboxed</span>
            </div>
            <h1 className={`text-2xl md:text-4xl font-black tracking-tight leading-tight ${themeKey === 'light' ? 'text-slate-800' : 'text-white'}`}>
              OwnFormatters <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-violet-500 to-indigo-600 dark:from-indigo-400 dark:via-violet-300 dark:to-indigo-400">Developer Utility Suite</span>
            </h1>
            <p className={`text-xs md:text-sm leading-relaxed max-w-2xl ${theme.textMuted}`}>
              A comprehensive offline development workbench providing secure formatters, syntax validators, cryptographic hash generators, custom token decoders, and network testbeds. Zero cloud footprints.
            </p>
          </div>

          {/* Metadata badges for high AdSense score */}
          <div className="flex flex-wrap md:flex-col items-start gap-2 text-[9px] font-semibold text-slate-400 font-mono">
            <span className={`border px-3 py-1.5 rounded-xl flex items-center gap-2 ${theme.card} ${theme.border}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              RFC Specifications Compliant
            </span>
            <span className={`border px-3 py-1.5 rounded-xl flex items-center gap-2 ${theme.card} ${theme.border}`}>
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
              W3C Standards Compliant
            </span>
          </div>
        </div>
      </section>

      {/* MAIN LAYOUT (FULL SCREEN FLUID WIDTH FOR SPACIOUS COMFORTABLE WORKSPACE) */}
      <main className="w-full px-4 lg:px-6 py-6 flex-1 flex flex-col lg:flex-row gap-6">
        
        {/* COLUMN 1: LEFT NAVIGATION CONTROLS (STICKY CARD) */}
        <div className={`w-full lg:w-72 ${theme.card} border ${theme.border} rounded-2xl p-6 flex-shrink-0 space-y-6 lg:sticky lg:top-20 h-fit max-h-[calc(100vh-6rem)] overflow-y-auto shadow-xl`}>
          
          {/* Search Input Filter */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-slate-500" />
            </span>
            <input
              type="text"
              placeholder="Search tools, checksums..."
              className={`w-full ${theme.inputBg} border ${theme.border} hover:border-slate-800/40 text-xs ${theme.text} rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-indigo-500 font-sans transition-colors placeholder:text-slate-500`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Navigational Category Groups */}
          <div className="space-y-6">

            {/* HOME NAVIGATOR */}
            <button
              onClick={() => setActiveTool('home')}
              className={`w-full flex items-center gap-2.5 px-3 py-3 rounded-xl text-left text-xs transition-all border group cursor-pointer ${
                activeTool === 'home'
                  ? '!bg-indigo-600 !text-white font-bold border-indigo-550 shadow-md'
                  : `${theme.inactiveNav}`
              }`}
            >
              <span className={activeTool === 'home' ? '!text-white' : `${themeKey === 'light' ? 'text-indigo-600' : 'text-indigo-400'} group-hover:text-indigo-500`}>
                <Home className="w-4 h-4" />
              </span>
              <span className="font-bold">Home / All Tools</span>
            </button>
            
            {/* CATEGORY: FORMATTERS */}
            <div className="space-y-2">
              <span className={`text-[10px] uppercase font-bold ${themeKey === 'light' ? 'text-indigo-600' : 'text-indigo-400'} font-mono tracking-wider block px-1`}>
                Formatters & Beautifiers
              </span>
              <div className="space-y-1.5">
                {filteredTools
                  .filter(t => t.category === 'formatter')
                  .map(tool => (
                    <button
                      key={tool.id}
                      onClick={() => setActiveTool(tool.id)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left text-xs transition-all border group ${
                        activeTool === tool.id
                          ? `${theme.activeNav} font-bold shadow-md`
                          : `${theme.inactiveNav}`
                      }`}
                    >
                      <span className={activeTool === tool.id ? 'text-white' : `${themeKey === 'light' ? 'text-indigo-600' : 'text-indigo-400'} group-hover:text-indigo-500`}>
                        {getToolIcon(tool.icon)}
                      </span>
                      <span className="truncate">{tool.name}</span>
                    </button>
                  ))}
              </div>
            </div>

            {/* CATEGORY: NETWORK */}
            <div className="space-y-2">
              <span className={`text-[10px] uppercase font-bold ${themeKey === 'light' ? 'text-emerald-700' : 'text-emerald-400'} font-mono tracking-wider block px-1`}>
                REST Network Tools
              </span>
              <div className="space-y-1.5">
                {filteredTools
                  .filter(t => t.category === 'network')
                  .map(tool => (
                    <button
                      key={tool.id}
                      onClick={() => setActiveTool(tool.id)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left text-xs transition-all border group ${
                        activeTool === tool.id
                          ? `${theme.activeNav} font-bold shadow-md`
                          : `${theme.inactiveNav}`
                      }`}
                    >
                      <span className={activeTool === tool.id ? 'text-white' : `${themeKey === 'light' ? 'text-emerald-700' : 'text-emerald-400'} group-hover:text-emerald-500`}>
                        {getToolIcon(tool.icon)}
                      </span>
                      <span className="truncate">{tool.name}</span>
                    </button>
                  ))}
              </div>
            </div>

            {/* CATEGORY: DEVOPS */}
            <div className="space-y-2">
              <span className={`text-[10px] uppercase font-bold ${themeKey === 'light' ? 'text-rose-700' : 'text-rose-400'} font-mono tracking-wider block px-1`}>
                DevOps & Cloud Tools
              </span>
              <div className="space-y-1.5">
                {filteredTools
                  .filter(t => t.category === 'devops')
                  .map(tool => (
                    <button
                      key={tool.id}
                      onClick={() => setActiveTool(tool.id)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left text-xs transition-all border group ${
                        activeTool === tool.id
                          ? `${theme.activeNav} font-bold shadow-md`
                          : `${theme.inactiveNav}`
                      }`}
                    >
                      <span className={activeTool === tool.id ? 'text-white' : `${themeKey === 'light' ? 'text-rose-700' : 'text-rose-400'} group-hover:text-rose-500`}>
                        {getToolIcon(tool.icon)}
                      </span>
                      <span className="truncate">{tool.name}</span>
                    </button>
                  ))}
              </div>
            </div>

            {/* CATEGORY: ENCODERS */}
            <div className="space-y-2">
              <span className={`text-[10px] uppercase font-bold ${themeKey === 'light' ? 'text-cyan-700' : 'text-cyan-400'} font-mono tracking-wider block px-1`}>
                Encoders & Decoders
              </span>
              <div className="space-y-1.5">
                {filteredTools
                  .filter(t => t.category === 'encoder')
                  .map(tool => (
                    <button
                      key={tool.id}
                      onClick={() => setActiveTool(tool.id)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left text-xs transition-all border group ${
                        activeTool === tool.id
                          ? `${theme.activeNav} font-bold shadow-md`
                          : `${theme.inactiveNav}`
                      }`}
                    >
                      <span className={activeTool === tool.id ? 'text-white' : `${themeKey === 'light' ? 'text-cyan-700' : 'text-cyan-400'} group-hover:text-cyan-500`}>
                        {getToolIcon(tool.icon)}
                      </span>
                      <span className="truncate">{tool.name}</span>
                    </button>
                  ))}
              </div>
            </div>

            {/* CATEGORY: UTILITIES */}
            <div className="space-y-2">
              <span className={`text-[10px] uppercase font-bold ${themeKey === 'light' ? 'text-amber-700' : 'text-amber-400'} font-mono tracking-wider block px-1`}>
                Security & String Utils
              </span>
              <div className="space-y-1.5">
                {filteredTools
                  .filter(t => t.category === 'utility')
                  .map(tool => (
                    <button
                      key={tool.id}
                      onClick={() => setActiveTool(tool.id)}
                      className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-left text-xs transition-all border group ${
                        activeTool === tool.id
                          ? `${theme.activeNav} font-bold shadow-md`
                          : `${theme.inactiveNav}`
                      }`}
                    >
                      <span className={activeTool === tool.id ? 'text-white' : `${themeKey === 'light' ? 'text-amber-700' : 'text-amber-400'} group-hover:text-amber-500`}>
                        {getToolIcon(tool.icon)}
                      </span>
                      <span className="truncate">{tool.name}</span>
                    </button>
                  ))}
              </div>
            </div>

          </div>

        </div>

        {/* COLUMN 2: ACTIVE TOOL WORKSPACE CANVAS */}
        <div className="flex-1 space-y-6 min-w-0">
          
          {/* Tool Identity Header */}
          {activeTool !== 'home' && (
            <div className={`pb-3 border-b ${theme.border} flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3`}>
              <div>
                <h2 className={`text-xl font-extrabold tracking-tight flex items-center gap-2 ${themeKey === 'light' ? 'text-slate-800' : 'text-white'}`}>
                  {getToolIcon(TOOLS_LIST.find(t => t.id === activeTool)?.icon || 'Code')}
                  {TOOLS_LIST.find(t => t.id === activeTool)?.name}
                </h2>
                <p className={`text-xs mt-1 max-w-lg leading-relaxed ${theme.textMuted}`}>
                  {TOOLS_LIST.find(t => t.id === activeTool)?.description}
                </p>
              </div>

              <span className={`self-start sm:self-center px-3 py-1 rounded-lg text-[9px] font-mono font-bold border ${theme.badgeBg}`}>
                MODULE: {activeTool.toUpperCase()}
              </span>
            </div>
          )}

          {/* DYNAMIC TOP ADVERTISEMENT DISPLAYED AFTER THE ACTIVE TOOL'S TITLE */}
          {SHOW_ADS && <RealAdSlot position="top" activeTool={activeTool} />}

          {/* Interactive Workspace Components and Right Ad Panel side-by-side with exact same starting height */}
          <div className="flex flex-col lg:flex-row gap-6 items-start">
            
            <div className="flex-1 min-w-0 w-full transition-all duration-350">
              {activeTool === 'home' && <HomeTool theme={theme} tools={TOOLS_LIST} onSelectTool={(id) => setActiveTool(id)} />}
              {activeTool === 'json' && <JsonTool theme={theme} />}
              {activeTool === 'jsonschema' && <JsonSchemaTool theme={theme} />}
              {activeTool === 'jsonpath' && <JsonPathTool theme={theme} />}
              {activeTool === 'yaml' && <YamlTool theme={theme} />}
              {activeTool === 'xml' && <XmlTool theme={theme} />}
              {activeTool === 'sql' && <SqlTool theme={theme} />}
              {activeTool === 'minify' && <MinifyTool theme={theme} />}
              {activeTool === 'api' && <ApiTool theme={theme} />}
              {activeTool === 'graphql' && <GraphqlTool theme={theme} />}
              {activeTool === 'openapi' && <OpenApiTool theme={theme} />}
              {activeTool === 'webhook' && <WebhookTool theme={theme} />}
              {activeTool === 'mockapi' && <MockApiTool theme={theme} />}
              {activeTool === 'docker' && <DockerTool theme={theme} />}
              {activeTool === 'k8s' && <K8sTool theme={theme} />}
              {activeTool === 'nginx' && <NginxTool theme={theme} />}
              {activeTool === 'base64' && <EncoderTool theme={theme} />}
              {activeTool === 'url' && <EncoderTool theme={theme} />}
              {activeTool === 'jwt' && <JwtTool theme={theme} />}
              {activeTool === 'timestamp' && <TimestampTool theme={theme} />}
              {activeTool === 'text' && <TextTool theme={theme} />}
              {activeTool === 'hash' && <HashTool theme={theme} />}
              {activeTool === 'uuid' && <UuidTool theme={theme} />}
              {activeTool === 'qrcode' && <QrcodeTool theme={theme} />}
              {activeTool === 'markdown' && <MarkdownTool theme={theme} />}
              
              {/* Missing Tools Components */}
              {activeTool === 'csv' && <CsvTool theme={theme} />}
              {activeTool === 'color' && <ColorTool theme={theme} />}
              {activeTool === 'base' && <NumberBaseTool theme={theme} />}
              {activeTool === 'cron' && <CronTool theme={theme} />}
              {activeTool === 'regex' && <RegexTool theme={theme} />}
              {activeTool === 'diff' && <DiffTool theme={theme} />}

              {/* Compliance & Legal Documentation Hub */}
              {activeTool === 'privacy' && <PrivacyTool theme={theme} />}
              {activeTool === 'terms' && <TermsTool theme={theme} />}
              {activeTool === 'about' && <AboutTool theme={theme} />}
            </div>

            {/* COLUMN 3: RIGHT AD PANEL (EXACTLY 160PX WIDTH, MATCHING WORKSPACE HEIGHT LEVEL) */}
            {SHOW_ADS && (
              <div className={`w-full lg:w-[160px] ${theme.card} border ${theme.border} rounded-2xl p-4 flex-shrink-0 flex flex-col items-center shadow-xl`}>
                <RealAdSlot position="right" activeTool={activeTool} />
              </div>
            )}

          </div>

        </div>

      </main>

      {/* GLOBAL DEVELOPER TECHNICAL REFERENCE HUB (SEO & AdSense compliance) */}
      <section className={`w-full border-t py-12 px-6 lg:px-8 mt-12 ${theme.card} ${theme.border} relative z-10`}>
        <div className="w-full space-y-8">
          <div className={`space-y-2 border-b pb-4 ${theme.border}`}>
            <h2 className={`text-xl md:text-2xl font-black tracking-tight flex items-center gap-2.5 ${themeKey === 'light' ? 'text-slate-800' : 'text-white'}`}>
              <Sparkles className="w-5.5 h-5.5 text-indigo-500 dark:text-indigo-400" />
              Comprehensive Developer Reference Manual & Web Utilities Guide
            </h2>
            <p className={`text-xs ${theme.textMuted}`}>
              Your premium offline-first standard documentation portal for structural data manipulation, network API testing, cryptographic encoding, and formatting specifications.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* Guide column 1 */}
            <div className="space-y-3">
              <h3 className={`text-sm font-bold flex items-center gap-2 ${themeKey === 'light' ? 'text-indigo-950' : 'text-white'}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                Data Interchange Formats: JSON vs YAML vs XML
              </h3>
              <p className={`text-xs leading-relaxed ${theme.textMuted}`}>
                Data serialization is key to modern API systems. <strong>JSON (JavaScript Object Notation)</strong> is characterized by its strict key-value collections wrapped in curly brackets. 
                <strong>YAML (YAML Ain't Markup Language)</strong> relies on Pythonic line indentations and spacing thresholds, omitting structural brackets for maximum human readability. 
                <strong>XML (eXtensible Markup Language)</strong> utilizes a rigorous tag-based parsing system resembling HTML, prioritizing legacy enterprise configuration compatibility and validation schemas (XSD).
              </p>
              <ul className={`list-disc list-inside text-[11px] space-y-1 pl-1 ${theme.textMuted}`}>
                <li>JSON follows RFC 8259 specifications.</li>
                <li>YAML is a superset of JSON for human drafting.</li>
                <li>XML excels in enterprise metadata schemas.</li>
              </ul>
            </div>

            {/* Guide column 2 */}
            <div className="space-y-3">
              <h3 className={`text-sm font-bold flex items-center gap-2 ${themeKey === 'light' ? 'text-emerald-950' : 'text-white'}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                Web Performance Optimization: Asset Minification
              </h3>
              <p className={`text-xs leading-relaxed ${theme.textMuted}`}>
                Minification is the process of removing unnecessary characters from source code without changing its functionality. This includes stripping whitespace, newlines, comments, and short-circuiting logical operations. 
                Our HTML, CSS, and JS code minifiers compress your client-side assets to minimize web page load times, lowering Time to First Byte (TTFB) and significantly boosting mobile Google Lighthouse and SEO rankings.
              </p>
              <table className={`w-full text-left text-[10px] mt-2 border-t ${theme.border}`}>
                <thead>
                  <tr className={`border-b ${theme.border}`}>
                    <th className={`py-1 ${themeKey === 'light' ? 'text-slate-800' : 'text-slate-300'}`}>Type</th>
                    <th className={`py-1 ${themeKey === 'light' ? 'text-slate-800' : 'text-slate-300'}`}>Action</th>
                    <th className={`py-1 ${themeKey === 'light' ? 'text-slate-800' : 'text-slate-300'}`}>Impact</th>
                  </tr>
                </thead>
                <tbody>
                  <tr className={`border-b ${theme.borderMuted || 'border-slate-900/40'}`}>
                    <td className="py-1">HTML</td>
                    <td className="py-1">Strips comments/space</td>
                    <td className="py-1">-15% to -25% size</td>
                  </tr>
                  <tr className={`border-b ${theme.borderMuted || 'border-slate-900/40'}`}>
                    <td className="py-1">CSS</td>
                    <td className="py-1">Compresses rule blocks</td>
                    <td className="py-1">-30% file weight</td>
                  </tr>
                  <tr className={`border-b ${theme.borderMuted || 'border-slate-900/40'}`}>
                    <td className="py-1">JS</td>
                    <td className="py-1">Variable mangling & spacing</td>
                    <td className="py-1">Substantial load speed</td>
                  </tr>
                </tbody>
              </table>
            </div>

            {/* Guide column 3 */}
            <div className="space-y-3">
              <h3 className={`text-sm font-bold flex items-center gap-2 ${themeKey === 'light' ? 'text-cyan-950' : 'text-white'}`}>
                <span className="w-1.5 h-1.5 rounded-full bg-cyan-500" />
                Cryptographic Integrity: Hex Checksums & Hash Digests
              </h3>
              <p className={`text-xs leading-relaxed ${theme.textMuted}`}>
                Hash algorithms are one-way cryptographic functions that generate a fixed-size byte string output from input data of any size. 
                <strong>SHA-256</strong> and <strong>SHA-512</strong> are highly recommended for verification of passwords and binaries as they offer maximum collision resistance. 
                Our checksum tool utilizes local WebCrypto interfaces to run native computations in your browser thread, preserving absolute security and privacy offline.
              </p>
              <ul className={`list-disc list-inside text-[11px] space-y-1 pl-1 ${theme.textMuted}`}>
                <li>MD5 is legacy, suited for basic file verification.</li>
                <li>SHA-256 provides secure collision-resistant hashing.</li>
                <li>SHA-512 offers military-grade checksum validation.</li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER BAR */}
      <footer className={`${theme.footerBg} border-t ${theme.border} py-10 px-6 text-center text-xs ${theme.textMuted} font-sans relative z-10 w-full transition-all`}>
        <div className="w-full space-y-3">
          <p className="font-semibold">© 2026 OwnFormatters Suite. Designed for high performance security, speed, and privacy compliance.</p>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 text-[10px] text-slate-500 dark:text-slate-650 font-mono">
            <span>Secure SSL Encryption</span>
            <span>•</span>
            <span>Local Browser Processing</span>
            <span>•</span>
            <span>Bypass-CORS Ready</span>
            <span>•</span>
            <button 
              onClick={() => { setActiveTool('privacy'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="hover:text-indigo-400 hover:underline cursor-pointer transition-colors"
            >
              Privacy Policy
            </button>
            <span>•</span>
            <button 
              onClick={() => { setActiveTool('terms'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="hover:text-indigo-400 hover:underline cursor-pointer transition-colors"
            >
              Terms of Service
            </button>
            <span>•</span>
            <button 
              onClick={() => { setActiveTool('about'); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              className="hover:text-indigo-400 hover:underline cursor-pointer transition-colors"
            >
              About & Contact Us
            </button>
          </div>
        </div>
      </footer>

    </div>
  );
}
