import React, { useState, useEffect } from 'react';
import { 
  Check, Copy, Play, Download, AlertTriangle, CheckCircle, 
  Layers, Settings, Container, Cpu, Database, Network, Server, 
  RefreshCw, Info, HelpCircle, FileText, Sparkles, Code, Globe, Lock
} from 'lucide-react';

interface NginxLocation {
  path: string;
  proxyPass?: string;
  rootPath?: string;
  fastcgiPass?: string;
  directivesCount: number;
}

interface NginxServerBlock {
  serverName: string;
  listenPorts: string[];
  locations: NginxLocation[];
  sslConfigured: boolean;
}

interface NginxError {
  line: number;
  message: string;
  severity: 'error' | 'warning' | 'info';
  rawText: string;
}

const TEMPLATES = [
  {
    name: 'Secure SSL Reverse Proxy',
    code: `server {
    listen 80;
    server_name app.ownformatters.com;
    
    # Force HTTP to HTTPS redirection
    return 301 https://$host$request_uri;
}

server {
    listen 443 ssl http2;
    server_name app.ownformatters.com;

    ssl_certificate /etc/letsencrypt/live/app.ownformatters.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/app.ownformatters.com/privkey.pem;
    
    # Modern secure SSL protocols
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers HIGH:!aNULL:!MD5;

    access_log /var/log/nginx/app_access.log;
    error_log /var/log/nginx/app_error.log;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /api {
        proxy_pass http://localhost:5000/api;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    }
}
`
  },
  {
    name: 'Static HTML Web Server with Gzip',
    code: `server {
    listen 80;
    server_name of.ownformatters.com;

    root /var/www/ownformatters/dist;
    index index.html index.htm;

    # Gzip Compression Optimization
    gzip on;
    gzip_vary on;
    gzip_min_length 10240;
    gzip_proxied any;
    gzip_types text/plain text/css text/xml text/javascript application/javascript application/x-javascript;

    location / {
        try_files $uri $uri/ /index.html;
        expires 7d;
        add_header Cache-Control "public, no-transform";
    }

    error_page 404 /404.html;
    location = /404.html {
        root /var/www/ownformatters/dist;
        internal;
    }

    error_page 500 502 503 504 /50x.html;
    location = /50x.html {
        root /usr/share/nginx/html;
    }
}
`
  },
  {
    name: 'PHP-FPM FastCGI Configuration',
    code: `server {
    listen 80;
    server_name blog.ownformatters.com;
    root /var/www/wordpress;
    index index.php index.html;

    location / {
        try_files $uri $uri/ /index.php?$args;
    }

    # Pass PHP files to fastcgi unix socket
    location ~ \\.php$ {
        include fastcgi_params;
        fastcgi_intercept_errors on;
        fastcgi_pass unix:/var/run/php/php8.1-fpm.sock;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
    }

    # Cache static resources heavily
    location ~* \\.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
        expires max;
        log_not_found off;
    }
}
`
  }
];

interface NginxToolProps {
  theme?: {
    id: string;
    bg: string;
    text: string;
    textMuted: string;
    border: string;
    borderMuted?: string;
    card: string;
    inputBg: string;
    panelBg: string;
    badgeBg: string;
    btnPrimary: string;
    btnSecondary: string;
    canvasBg: string;
    isDark: boolean;
  };
}

export default function NginxTool({ theme }: NginxToolProps) {
  const isLight = theme?.id === 'light';
  const [code, setCode] = useState<string>(TEMPLATES[0].code);
  const [errors, setErrors] = useState<NginxError[]>([]);
  const [servers, setServers] = useState<NginxServerBlock[]>([]);
  const [copied, setCopied] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'errors' | 'servers'>('servers');

  const borderClass = theme?.border || 'border-slate-800/80';
  const panelBgClass = theme?.panelBg || 'bg-slate-900';
  const inputBgClass = theme?.inputBg || 'bg-slate-950';
  const canvasBgClass = theme?.canvasBg || 'bg-[#02050c]';
  const textMutedClass = theme?.textMuted || 'text-slate-400';

  useEffect(() => {
    validateNginx(code);
  }, [code]);

  const handleCopy = () => {
    try {
      navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (e) {}
  };

  const handleDownload = () => {
    try {
      const blob = new Blob([code], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'nginx.conf';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {}
  };

  const handlePrettify = () => {
    const lines = code.split('\n');
    let indentLevel = 0;
    const cleanLines = lines.map(line => {
      let trimmed = line.trim();
      
      // If line starts with a closing bracket, decrement indent first
      if (trimmed.startsWith('}')) {
        indentLevel = Math.max(0, indentLevel - 1);
      }

      const spaces = ' '.repeat(indentLevel * 4);
      const formatted = trimmed ? `${spaces}${trimmed}` : '';

      // If line ends with opening bracket, increment indent for next lines
      if (trimmed.endsWith('{')) {
        indentLevel++;
      }

      return formatted;
    });

    let finalLines: string[] = [];
    for (let i = 0; i < cleanLines.length; i++) {
      if (cleanLines[i] === '' && (i === 0 || cleanLines[i - 1] === '')) {
        continue;
      }
      finalLines.push(cleanLines[i]);
    }

    setCode(finalLines.join('\n'));
  };

  const validateNginx = (confText: string) => {
    const lines = confText.split('\n');
    const newErrors: NginxError[] = [];
    const extractedServers: NginxServerBlock[] = [];

    let bracketCounter = 0;
    let currentServer: Partial<NginxServerBlock> | null = null;
    let currentLocation: Partial<NginxLocation> | null = null;
    let inServerBlock = false;
    let inLocationBlock = false;

    lines.forEach((line, index) => {
      const lineNum = index + 1;
      const trimmed = line.trim();

      if (trimmed.startsWith('#') || !trimmed) {
        return;
      }

      // Bracket counters
      const openBrackets = (trimmed.match(/\{/g) || []).length;
      const closeBrackets = (trimmed.match(/\}/g) || []).length;
      bracketCounter += openBrackets - closeBrackets;

      // Check missing semicolon at the end of simple directives
      if (!trimmed.endsWith('{') && !trimmed.endsWith('}') && !trimmed.startsWith('if') && !trimmed.startsWith('#')) {
        if (!trimmed.endsWith(';')) {
          newErrors.push({
            line: lineNum,
            message: 'Directive configuration line is missing a closing semicolon (;).',
            severity: 'error',
            rawText: line
          });
        }
      }

      // Check for insecure protocols
      if (trimmed.startsWith('ssl_protocols')) {
        if (trimmed.includes('TLSv1') || trimmed.includes('TLSv1.1')) {
          if (!trimmed.includes('TLSv1.2') && !trimmed.includes('TLSv1.3')) {
            newErrors.push({
              line: lineNum,
              message: 'Insecure SSL protocols (TLSv1/TLSv1.1) detected. Restrict to TLSv1.2 and TLSv1.3 for HIPAA/PCI security standards.',
              severity: 'warning',
              rawText: line
            });
          }
        }
      }

      // Server Block Parsing
      if (trimmed.startsWith('server {') || trimmed === 'server') {
        inServerBlock = true;
        currentServer = {
          serverName: 'localhost',
          listenPorts: [],
          locations: [],
          sslConfigured: false
        };
        return;
      }

      if (inServerBlock && currentServer) {
        // Find listen ports
        if (trimmed.startsWith('listen ')) {
          const match = trimmed.match(/listen\s+([^;]+);/);
          if (match) {
            currentServer.listenPorts?.push(match[1].trim());
            if (match[1].includes('ssl')) {
              currentServer.sslConfigured = true;
            }
          }
        }

        // Find server name
        if (trimmed.startsWith('server_name ')) {
          const match = trimmed.match(/server_name\s+([^;]+);/);
          if (match) {
            currentServer.serverName = match[1].trim();
          }
        }

        // Detect ssl parameters
        if (trimmed.startsWith('ssl_certificate')) {
          currentServer.sslConfigured = true;
        }

        // Detect location block entry
        if (trimmed.startsWith('location ')) {
          inLocationBlock = true;
          const match = trimmed.match(/location\s+([^\{]+)\{?/);
          currentLocation = {
            path: match ? match[1].trim() : '/',
            directivesCount: 0
          };
          return;
        }

        // In Location block context
        if (inLocationBlock && currentLocation) {
          if (trimmed.startsWith('proxy_pass ')) {
            const match = trimmed.match(/proxy_pass\s+([^;]+);/);
            if (match) currentLocation.proxyPass = match[1].trim();
          }
          if (trimmed.startsWith('root ')) {
            const match = trimmed.match(/root\s+([^;]+);/);
            if (match) currentLocation.rootPath = match[1].trim();
          }
          if (trimmed.startsWith('fastcgi_pass ')) {
            const match = trimmed.match(/fastcgi_pass\s+([^;]+);/);
            if (match) currentLocation.fastcgiPass = match[1].trim();
          }

          if (trimmed === '}') {
            inLocationBlock = false;
            currentServer.locations?.push(currentLocation as NginxLocation);
            currentLocation = null;
          } else {
            currentLocation.directivesCount = (currentLocation.directivesCount || 0) + 1;
          }
        }

        // Server Block exit
        if (trimmed === '}' && !inLocationBlock && bracketCounter === 0) {
          inServerBlock = false;
          extractedServers.push(currentServer as NginxServerBlock);
          currentServer = null;
        }
      }
    });

    // Bracket level validation check
    if (bracketCounter !== 0) {
      newErrors.push({
        line: lines.length,
        message: `Mismatched configurations block brackets. You have ${bracketCounter > 0 ? 'unclosed' : 'excessive'} brackets in this file.`,
        severity: 'error',
        rawText: 'Curly brackets check'
      });
    }

    setServers(extractedServers);
    setErrors(newErrors);
  };

  return (
    <div className="space-y-6">
      {/* EXPLANATORY HEADER BANNER */}
      <div className={`p-4 rounded-2xl border flex items-start gap-3.5 ${panelBgClass} ${borderClass}`}>
        <Globe className="w-5 h-5 text-indigo-400 mt-0.5 flex-shrink-0" />
        <div className="space-y-1">
          <span className="text-xs font-bold block">Nginx Config Formatter & Syntax Auditor</span>
          <p className={`text-[11px] leading-relaxed ${textMutedClass}`}>
            Audit reverse-proxy maps, align spacing indents automatically, detect missing semicolons, flag insecure SSL protocols, and inspect virtual host mapping routes.
          </p>
        </div>
      </div>

      {/* QUICK TEMPLATES SELECTOR ROW */}
      <div className="flex flex-wrap items-center gap-2">
        <span className={`text-[10px] font-mono font-bold uppercase tracking-wider ${textMutedClass}`}>
          Load Config Profile:
        </span>
        {TEMPLATES.map((tpl) => (
          <button
            key={tpl.name}
            onClick={() => setCode(tpl.code)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
              isLight
                ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
                : 'bg-slate-900 hover:bg-slate-850 border-slate-800 text-slate-300'
            }`}
          >
            {tpl.name}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
        
        {/* LEFT COLUMN: EDITOR */}
        <div className={`border rounded-2xl overflow-hidden flex flex-col h-[580px] ${inputBgClass} ${borderClass} shadow-md`}>
          <div className={`px-4 py-3 border-b flex items-center justify-between ${panelBgClass} ${borderClass}`}>
            <span className={`text-xs font-semibold font-mono ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>
              nginx.conf Workspace
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={handlePrettify}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 border cursor-pointer ${
                  isLight 
                    ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800' 
                    : 'bg-slate-950 hover:bg-slate-900 border-slate-800 text-slate-300'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Auto-Indent</span>
              </button>
              <button
                onClick={handleDownload}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 border cursor-pointer ${
                  isLight 
                    ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800' 
                    : 'bg-slate-950 hover:bg-slate-900 border-slate-800 text-slate-300'
                }`}
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download</span>
              </button>
              <button
                onClick={handleCopy}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 border cursor-pointer ${
                  isLight 
                    ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800' 
                    : 'bg-slate-950 hover:bg-slate-900 border-slate-800 text-slate-300'
                }`}
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          <textarea
            className={`flex-1 w-full h-full ${canvasBgClass} p-4 font-mono text-xs focus:outline-none focus:ring-0 border-0 resize-none leading-relaxed overflow-y-auto ${
              isLight ? 'text-slate-900' : 'text-slate-200'
            }`}
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="Paste or write Nginx directive configurations..."
          />
        </div>

        {/* RIGHT COLUMN: INTERACTIVE VISUAL INSPECTOR & TOPOLOGY */}
        <div className="flex flex-col h-[580px] space-y-4">
          
          {/* TAB ROW SELECTOR */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveTab('servers')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                  activeTab === 'servers'
                    ? 'bg-indigo-950/40 border-indigo-550 text-indigo-400'
                    : 'text-slate-400 hover:text-slate-200 border-transparent'
                }`}
              >
                Virtual Server Inspector ({servers.length})
              </button>
              <button
                onClick={() => setActiveTab('errors')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'errors'
                    ? 'bg-indigo-950/40 border-indigo-550 text-indigo-400'
                    : 'text-slate-400 hover:text-slate-200 border-transparent'
                }`}
              >
                <span>Diagnostics & Syntax</span>
                {errors.length > 0 ? (
                  <span className="bg-rose-500/10 text-rose-400 px-1.5 py-0.5 rounded-full text-[9px] font-mono border border-rose-500/20 font-bold">
                    {errors.length}
                  </span>
                ) : (
                  <span className="bg-emerald-500/10 text-emerald-400 px-1.5 py-0.5 rounded-full text-[9px] font-mono border border-emerald-500/20 font-bold">
                    ✓
                  </span>
                )}
              </button>
            </div>
          </div>

          {/* TAB PANEL RENDERER */}
          <div className="flex-1 overflow-y-auto min-h-0 space-y-4">
            
            {/* TAB: VIRTUAL SERVER INSPECTOR */}
            {activeTab === 'servers' && (
              <div className="space-y-4">
                {servers.length === 0 ? (
                  <div className={`p-10 border border-dashed rounded-2xl text-center space-y-3 ${borderClass}`}>
                    <Globe className="w-8 h-8 text-slate-500 mx-auto animate-pulse" />
                    <span className="text-xs font-mono text-slate-500 block">No server blocks parsed successfully. Check bracket formatting.</span>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {servers.map((srv, idx) => (
                      <div
                        key={idx}
                        className={`p-4 rounded-2xl border ${panelBgClass} ${borderClass} space-y-3.5 hover:border-indigo-500/40 transition-colors shadow-sm`}
                      >
                        {/* SERVER TITLE HEADER */}
                        <div className="flex items-center justify-between gap-4 flex-wrap">
                          <div className="flex items-center gap-2">
                            <Server className="w-4 h-4 text-indigo-400" />
                            <span className="text-xs font-black font-mono tracking-tight text-white">
                              {srv.serverName}
                            </span>
                          </div>
                          
                          <div className="flex items-center gap-1.5">
                            {srv.sslConfigured ? (
                              <span className="px-2 py-0.5 text-[9px] font-bold font-mono rounded bg-emerald-950/40 border border-emerald-900/40 text-emerald-400 flex items-center gap-1">
                                <Lock className="w-2.5 h-2.5" />
                                <span>SSL / HTTPS</span>
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 text-[9px] font-bold font-mono rounded bg-amber-950/40 border border-amber-900/40 text-amber-400">
                                HTTP Cleartext
                              </span>
                            )}
                          </div>
                        </div>

                        {/* LISTENING PORTS & SCHEMAS */}
                        <div className="flex flex-wrap items-center gap-2 text-[11px] font-mono">
                          <span className="text-slate-500">Listen Ports:</span>
                          {srv.listenPorts.map((port, pIdx) => (
                            <span key={pIdx} className="px-2 py-0.5 rounded bg-slate-950 border border-slate-900 text-cyan-400 font-bold">
                              {port}
                            </span>
                          ))}
                        </div>

                        {/* LOCATIONS DIRECTIVES */}
                        {srv.locations.length > 0 && (
                          <div className="space-y-2 pt-2.5 border-t border-slate-900/60 font-mono">
                            <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Route Context Locations:</span>
                            <div className="space-y-2">
                              {srv.locations.map((loc, lIdx) => (
                                <div key={lIdx} className="p-3 rounded bg-slate-950/60 border border-slate-900 space-y-2">
                                  <div className="flex items-center justify-between gap-2 flex-wrap">
                                    <span className="font-bold text-teal-400 text-xs">
                                      {loc.path}
                                    </span>
                                    <span className="text-[9px] text-slate-500">{loc.directivesCount} nested config lines</span>
                                  </div>

                                  {/* Route specific logic (e.g. Proxy Pass or Root directory) */}
                                  <div className="text-[11px] space-y-1 bg-slate-950/30 p-2 rounded border border-slate-900/40 text-slate-300">
                                    {loc.proxyPass && (
                                      <div className="flex items-center gap-1.5 truncate">
                                        <span className="text-slate-500">Proxy Target:</span>
                                        <span className="text-emerald-400 font-bold truncate">{loc.proxyPass}</span>
                                      </div>
                                    )}
                                    {loc.rootPath && (
                                      <div className="flex items-center gap-1.5 truncate">
                                        <span className="text-slate-500">Document Root:</span>
                                        <span className="text-slate-300 font-bold truncate">{loc.rootPath}</span>
                                      </div>
                                    )}
                                    {loc.fastcgiPass && (
                                      <div className="flex items-center gap-1.5 truncate">
                                        <span className="text-slate-500">FastCGI Socket:</span>
                                        <span className="text-amber-400 font-bold truncate">{loc.fastcgiPass}</span>
                                      </div>
                                    )}
                                    {!loc.proxyPass && !loc.rootPath && !loc.fastcgiPass && (
                                      <span className="text-slate-500 italic text-[10px]">Standard static/redirect file rule block</span>
                                    )}
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}

                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB: DIAGNOSTICS & SYNTAX */}
            {activeTab === 'errors' && (
              <div className="space-y-4">
                {errors.length === 0 ? (
                  <div className={`p-8 border rounded-2xl text-center space-y-2 ${
                    isLight ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-emerald-950/10 border-emerald-900/40 text-emerald-300'
                  }`}>
                    <CheckCircle className="w-6 h-6 text-emerald-400 mx-auto animate-bounce" />
                    <span className="text-xs font-bold font-mono block">✓ Config Validated Successfully!</span>
                    <p className="text-[10px] text-slate-400 leading-relaxed font-mono">
                      No block alignment or missing semicolon errors found in the configuration structure.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {errors.map((err, idx) => (
                      <div
                        key={idx}
                        className={`p-4 border rounded-2xl flex items-start gap-3 font-mono text-[11px] leading-relaxed ${
                          err.severity === 'error'
                            ? 'bg-rose-950/10 border-rose-900/40 text-rose-300'
                            : 'bg-amber-950/10 border-amber-900/40 text-amber-300'
                        }`}
                      >
                        <AlertTriangle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${err.severity === 'error' ? 'text-rose-400' : 'text-amber-400'}`} />
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-extrabold uppercase tracking-wide">
                              {err.severity.toUpperCase()}
                            </span>
                            <span>Line {err.line}</span>
                          </div>
                          <p className="text-white mt-1">{err.message}</p>
                          <pre className="text-[10px] p-1.5 rounded bg-slate-950 text-slate-400 mt-2 whitespace-pre overflow-x-auto">
                            {err.rawText}
                          </pre>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

          </div>

        </div>

      </div>

    </div>
  );
}
