import React, { useState, useEffect } from 'react';
import { 
  Check, Copy, Play, Download, AlertTriangle, CheckCircle, 
  Layers, Settings, Container, Cpu, Database, Network, Server, 
  RefreshCw, Info, HelpCircle, FileText, Sparkles, Code
} from 'lucide-react';

interface KeyValue {
  key: string;
  value: string;
}

interface ServiceTopology {
  name: string;
  image: string;
  ports: string[];
  volumes: string[];
  environment: KeyValue[];
  dependsOn: string[];
  restart?: string;
}

interface DockerError {
  line: number;
  message: string;
  severity: 'error' | 'warning';
  rawText: string;
}

const TEMPLATES = [
  {
    name: 'MERN Stack (React, Node, MongoDB)',
    code: `version: '3.8'

services:
  frontend:
    image: node:18-alpine
    container_name: react_frontend
    ports:
      - "3000:3000"
    volumes:
      - ./frontend:/app
    environment:
      - REACT_APP_API_URL=http://localhost:5000
    depends_on:
      - backend

  backend:
    image: node:18-alpine
    container_name: express_backend
    ports:
      - "5000:5000"
    environment:
      - MONGO_URI=mongodb://db:27107/mern
      - PORT=5000
    depends_on:
      - db

  db:
    image: mongo:6.0
    container_name: mongodb_database
    ports:
      - "27017:27017"
    volumes:
      - mongo_data:/data/db

volumes:
  mongo_data:
`
  },
  {
    name: 'LAMP Stack (Apache, MySQL, PHP)',
    code: `version: '3.1'

services:
  webserver:
    image: php:8.0-apache
    container_name: lamp_apache
    ports:
      - "80:80"
    volumes:
      - ./src:/var/www/html
    depends_on:
      - database

  database:
    image: mysql:8.0
    container_name: lamp_mysql
    ports:
      - "3306:3306"
    environment:
      - MYSQL_ROOT_PASSWORD=secret_root_pass
      - MYSQL_DATABASE=lamp_db
      - MYSQL_USER=lamp_user
      - MYSQL_PASSWORD=lamp_password
    volumes:
      - db_data:/var/lib/mysql

volumes:
  db_data:
`
  },
  {
    name: 'Python Web App + Redis Cache',
    code: `version: '3.9'

services:
  web:
    image: python:3.9-slim
    container_name: web_app
    ports:
      - "8000:8000"
    volumes:
      - .:/code
    environment:
      - REDIS_HOST=cache
      - FLASK_ENV=development
    depends_on:
      - cache

  cache:
    image: redis:7.0-alpine
    container_name: redis_cache
    ports:
      - "6379:6379"
`
  }
];

interface DockerToolProps {
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

export default function DockerTool({ theme }: DockerToolProps) {
  const isLight = theme?.id === 'light';
  const [code, setCode] = useState<string>(TEMPLATES[0].code);
  const [errors, setErrors] = useState<DockerError[]>([]);
  const [services, setServices] = useState<ServiceTopology[]>([]);
  const [version, setVersion] = useState<string>('Not Specified');
  const [copied, setCopied] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'errors' | 'topology' | 'yaml'>('topology');

  const borderClass = theme?.border || 'border-slate-800/80';
  const panelBgClass = theme?.panelBg || 'bg-slate-900';
  const inputBgClass = theme?.inputBg || 'bg-slate-950';
  const canvasBgClass = theme?.canvasBg || 'bg-[#02050c]';
  const textMutedClass = theme?.textMuted || 'text-slate-400';

  useEffect(() => {
    validateDockerCompose(code);
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
      const blob = new Blob([code], { type: 'text/yaml' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'docker-compose.yml';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {}
  };

  const handlePrettify = () => {
    const lines = code.split('\n');
    const cleanedLines = lines.map(line => {
      // Remove trailing whitespace but preserve indentation
      const match = line.match(/^(\s*)(.*)$/);
      if (match) {
        const indent = match[1].replace(/\t/g, '  '); // convert tabs to double spaces
        const content = match[2].trimEnd();
        return content ? `${indent}${content}` : '';
      }
      return '';
    });

    // Remove double blank lines
    let finalLines: string[] = [];
    for (let i = 0; i < cleanedLines.length; i++) {
      if (cleanedLines[i] === '' && (i === 0 || cleanedLines[i - 1] === '')) {
        continue;
      }
      finalLines.push(cleanedLines[i]);
    }

    setCode(finalLines.join('\n'));
  };

  const validateDockerCompose = (yamlText: string) => {
    const lines = yamlText.split('\n');
    const newErrors: DockerError[] = [];
    const extractedServices: ServiceTopology[] = [];
    let foundServicesKey = false;
    let yamlVersion = 'Not Specified';

    // Helper for indentations
    const getIndent = (line: string) => {
      const match = line.match(/^(\s*)/);
      return match ? match[0].length : 0;
    };

    let currentService: Partial<ServiceTopology> | null = null;
    let currentBlock: 'ports' | 'volumes' | 'environment' | 'depends_on' | null = null;
    let servicesBlockIndent = -1;
    let serviceItemsIndent = -1;

    lines.forEach((line, index) => {
      const lineNum = index + 1;
      const trimmed = line.trim();

      // Check for tab indentation (invalid in YAML)
      if (line.includes('\t')) {
        newErrors.push({
          line: lineNum,
          message: 'Tab indentation detected. YAML strictly requires spaces.',
          severity: 'error',
          rawText: line
        });
      }

      if (trimmed.startsWith('#') || !trimmed) {
        return; // Skip comments and empty lines
      }

      // Check Version
      if (trimmed.startsWith('version:')) {
        const match = trimmed.match(/version:\s*['"]?([^'"]+)['"]?/);
        if (match) {
          yamlVersion = match[1];
        }
      }

      // Detect Services Key
      if (trimmed === 'services:') {
        foundServicesKey = true;
        servicesBlockIndent = getIndent(line);
        return;
      }

      const indent = getIndent(line);

      // Handle Service definitions inside services block
      if (foundServicesKey) {
        // If indent drops back to or below the servicesBlockIndent, we have exited the services block
        if (indent <= servicesBlockIndent && trimmed && !trimmed.startsWith('services:')) {
          foundServicesKey = false;
          if (currentService && currentService.name) {
            extractedServices.push(currentService as ServiceTopology);
            currentService = null;
          }
          currentBlock = null;
        } else {
          // Inside services block!
          // Detect a new service. Standard service is indented by servicesBlockIndent + 2 (usually 2 or 4 spaces)
          const isServiceKey = trimmed.endsWith(':') && !trimmed.startsWith('-') && !trimmed.includes('{') && !trimmed.includes('[');
          
          if (isServiceKey && (servicesBlockIndent === -1 || indent > servicesBlockIndent)) {
            // Check if this is a sub-property block or a new service name
            const possibleServiceName = trimmed.slice(0, -1).trim();
            const serviceKeyIndent = indent;

            // Simple heuristic: if we are at service level (e.g. 2 spaces, and has properties indented further)
            // Or if it's the first key inside services block
            if (serviceItemsIndent === -1 || serviceKeyIndent < serviceItemsIndent) {
              // Finish current service
              if (currentService && currentService.name) {
                extractedServices.push(currentService as ServiceTopology);
              }

              // Create new service container
              currentService = {
                name: possibleServiceName,
                image: 'latest',
                ports: [],
                volumes: [],
                environment: [],
                dependsOn: []
              };
              serviceItemsIndent = -1; // reset sub-items indent anchor
              currentBlock = null;
              return;
            }
          }

          // Inspect sub-properties inside the active service
          if (currentService) {
            // Update service item properties indentation anchor
            if (serviceItemsIndent === -1 && indent > (servicesBlockIndent + 2)) {
              serviceItemsIndent = indent;
            }

            // Detect property blocks: ports:, volumes:, environment:, depends_on:
            if (trimmed.startsWith('ports:')) {
              currentBlock = 'ports';
              return;
            }
            if (trimmed.startsWith('volumes:')) {
              currentBlock = 'volumes';
              return;
            }
            if (trimmed.startsWith('environment:')) {
              currentBlock = 'environment';
              return;
            }
            if (trimmed.startsWith('depends_on:')) {
              currentBlock = 'depends_on';
              return;
            }

            // Single line image spec
            if (trimmed.startsWith('image:')) {
              const imgVal = trimmed.replace('image:', '').trim();
              currentService.image = imgVal;
              currentBlock = null;
              return;
            }

            // Restart spec
            if (trimmed.startsWith('restart:')) {
              currentService.restart = trimmed.replace('restart:', '').trim();
              currentBlock = null;
              return;
            }

            // Process list or object items for ports, volumes, env, depends_on
            if (trimmed.startsWith('-') && currentBlock) {
              const value = trimmed.substring(1).trim().replace(/['"]/g, '');

              if (currentBlock === 'ports') {
                currentService.ports?.push(value);
                // Validate port formatting
                if (value.includes(':')) {
                  const parts = value.split(':');
                  if (parts.length === 2) {
                    const hostPort = parseInt(parts[0], 10);
                    const contPort = parseInt(parts[1], 10);
                    if (isNaN(hostPort) || isNaN(contPort)) {
                      newErrors.push({
                        line: lineNum,
                        message: `Invalid port mapping format: "${value}". Must be integers.`,
                        severity: 'error',
                        rawText: line
                      });
                    }
                  }
                } else {
                  newErrors.push({
                    line: lineNum,
                    message: `Port mapping "${value}" should ideally specify HostPort:ContainerPort.`,
                    severity: 'warning',
                    rawText: line
                  });
                }
              } else if (currentBlock === 'volumes') {
                currentService.volumes?.push(value);
              } else if (currentBlock === 'depends_on') {
                currentService.dependsOn?.push(value);
              } else if (currentBlock === 'environment') {
                if (value.includes('=')) {
                  const [k, ...vParts] = value.split('=');
                  currentService.environment?.push({ key: k.trim(), value: vParts.join('=').trim() });
                } else {
                  currentService.environment?.push({ key: value.trim(), value: '' });
                }
              }
            } else if (currentBlock === 'environment' && trimmed.includes(':') && !trimmed.startsWith('-')) {
              // Key-Value style environment list (no hyphens)
              const [k, ...vParts] = trimmed.split(':');
              currentService.environment?.push({ key: k.trim(), value: vParts.join(':').trim().replace(/['"]/g, '') });
            }
          }
        }
      }
    });

    // Push the final service
    if (currentService && currentService.name) {
      extractedServices.push(currentService as ServiceTopology);
    }

    // High Level Validation Checks
    if (!yamlText.includes('services:')) {
      newErrors.push({
        line: 1,
        message: 'Missing "services:" root declaration. Docker Compose files require a services dictionary.',
        severity: 'error',
        rawText: 'YAML root structure'
      });
    }

    setVersion(yamlVersion);
    setServices(extractedServices);
    setErrors(newErrors);
  };

  return (
    <div className="space-y-6">
      {/* EXPLANATORY HEADER BANNER */}
      <div className={`p-4 rounded-2xl border flex items-start gap-3.5 ${panelBgClass} ${borderClass}`}>
        <Layers className="w-5 h-5 text-indigo-400 mt-0.5 flex-shrink-0" />
        <div className="space-y-1">
          <span className="text-xs font-bold block">Docker Compose Validator & Inspector</span>
          <p className={`text-[11px] leading-relaxed ${textMutedClass}`}>
            Review tab errors, diagnose port map structures, prettify indentation, load stack templates, and inspect a complete service topology dashboard.
          </p>
        </div>
      </div>

      {/* QUICK TEMPLATES SELECTOR ROW */}
      <div className="flex flex-wrap items-center gap-2">
        <span className={`text-[10px] font-mono font-bold uppercase tracking-wider ${textMutedClass}`}>
          Load Template Stack:
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
        
        {/* LEFT COLUMN: YAML WORKSPACE & EDITOR */}
        <div className={`border rounded-2xl overflow-hidden flex flex-col h-[580px] ${inputBgClass} ${borderClass} shadow-md`}>
          <div className={`px-4 py-3 border-b flex items-center justify-between ${panelBgClass} ${borderClass}`}>
            <span className={`text-xs font-semibold font-mono ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>
              docker-compose.yml Editor
            </span>
            <div className="flex items-center gap-1.5">
              <button
                onClick={handlePrettify}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 border cursor-pointer ${
                  isLight 
                    ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800' 
                    : 'bg-slate-950 hover:bg-slate-900 border-slate-800 text-slate-300'
                }`}
                title="Format indentation spaces"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Prettify</span>
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
                <span>Save File</span>
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
            placeholder="Paste or write docker-compose.yml syntax here..."
          />
        </div>

        {/* RIGHT COLUMN: INTERACTIVE VISUAL INSPECTOR & TOPOLOGY */}
        <div className="flex flex-col h-[580px] space-y-4">
          
          {/* TAB ROW SELECTOR */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveTab('topology')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                  activeTab === 'topology'
                    ? 'bg-indigo-950/40 border-indigo-550 text-indigo-400'
                    : 'text-slate-400 hover:text-slate-200 border-transparent'
                }`}
              >
                Visual Topology ({services.length})
              </button>
              <button
                onClick={() => setActiveTab('errors')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'errors'
                    ? 'bg-indigo-950/40 border-indigo-550 text-indigo-400'
                    : 'text-slate-400 hover:text-slate-200 border-transparent'
                }`}
              >
                <span>Syntax Diagnoses</span>
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

            <span className="text-[10px] font-mono text-slate-500 font-bold">
              Compose Spec Version: {version}
            </span>
          </div>

          {/* TAB PANEL RENDERER */}
          <div className="flex-1 overflow-y-auto min-h-0 space-y-4">
            
            {/* TAB: VISUAL TOPOLOGY */}
            {activeTab === 'topology' && (
              <div className="space-y-4">
                {services.length === 0 ? (
                  <div className={`p-10 border border-dashed rounded-2xl text-center space-y-3 ${borderClass}`}>
                    <Container className="w-8 h-8 text-slate-500 mx-auto animate-pulse" />
                    <span className="text-xs font-mono text-slate-500 block">No services detected in compose file structure.</span>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 gap-4">
                    {services.map((svc) => (
                      <div
                        key={svc.name}
                        className={`p-4 rounded-2xl border ${panelBgClass} ${borderClass} space-y-3.5 hover:border-indigo-500/40 transition-colors shadow-sm`}
                      >
                        {/* SERVICE TITLE & METRICS */}
                        <div className="flex items-center justify-between gap-4 flex-wrap">
                          <div className="flex items-center gap-2">
                            <Container className="w-4 h-4 text-indigo-400" />
                            <span className="text-xs font-black font-mono tracking-tight">{svc.name}</span>
                          </div>
                          
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {svc.restart && (
                              <span className="px-2 py-0.5 text-[9px] font-bold font-mono rounded bg-slate-950 border border-slate-800 text-slate-400">
                                restart: {svc.restart}
                              </span>
                            )}
                            {svc.dependsOn.length > 0 && (
                              <span className="px-2 py-0.5 text-[9px] font-bold font-mono rounded bg-indigo-950/40 border border-indigo-900/40 text-indigo-400">
                                deps: {svc.dependsOn.join(', ')}
                              </span>
                            )}
                          </div>
                        </div>

                        {/* SERVICE SPECS */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-[11px] font-mono">
                          
                          {/* Image & Ports */}
                          <div className="space-y-1.5">
                            <div className="flex items-center gap-1.5">
                              <span className="text-slate-500">Image:</span>
                              <span className={`px-1.5 py-0.5 rounded font-semibold text-[10px] ${
                                isLight ? 'bg-slate-100 text-slate-800' : 'bg-slate-950 text-emerald-400 border border-slate-900'
                              }`}>
                                {svc.image}
                              </span>
                            </div>

                            {svc.ports.length > 0 ? (
                              <div className="space-y-1">
                                <span className="text-slate-500 block">Network Port Mappings:</span>
                                {svc.ports.map((p, idx) => (
                                  <div key={idx} className="flex items-center gap-1 text-[10px]">
                                    <Network className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                                    <span>{p}</span>
                                    <span className="text-[9px] text-slate-500 font-bold">(Host → Container)</span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span className="text-slate-500 italic text-[10px]">No ports mapped to host</span>
                            )}
                          </div>

                          {/* Volumes & Mounts */}
                          <div className="space-y-1.5">
                            {svc.volumes.length > 0 ? (
                              <div className="space-y-1">
                                <span className="text-slate-500 block">Volume Mounts:</span>
                                {svc.volumes.map((vol, idx) => (
                                  <div key={idx} className="flex items-start gap-1 text-[10px] truncate" title={vol}>
                                    <Database className="w-3.5 h-3.5 text-teal-400 mt-0.5 flex-shrink-0" />
                                    <span className="truncate">{vol}</span>
                                  </div>
                                ))}
                              </div>
                            ) : (
                              <span className="text-slate-500 italic text-[10px]">No storage volumes mounted</span>
                            )}
                          </div>

                        </div>

                        {/* ENVIRONMENT VARIABLES */}
                        {svc.environment.length > 0 && (
                          <div className="space-y-1 pt-1.5 border-t border-slate-900/60">
                            <span className="text-[10px] text-slate-500 font-mono block">Environment Configurations:</span>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[10px] font-mono">
                              {svc.environment.map((env, idx) => (
                                <div key={idx} className="flex items-center gap-1 bg-slate-950/40 p-1.5 rounded border border-slate-900 truncate" title={`${env.key}=${env.value}`}>
                                  <Settings className="w-3 h-3 text-slate-500" />
                                  <span className="text-amber-400 truncate">{env.key}</span>
                                  <span className="text-slate-500">=</span>
                                  <span className="truncate">{env.value || '""'}</span>
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

            {/* TAB: ERRORS & WARNINGS DIAGNOSES */}
            {activeTab === 'errors' && (
              <div className="space-y-4">
                {errors.length === 0 ? (
                  <div className={`p-8 border rounded-2xl text-center space-y-2 ${
                    isLight ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-emerald-950/10 border-emerald-900/40 text-emerald-300'
                  }`}>
                    <CheckCircle className="w-6 h-6 text-emerald-400 mx-auto animate-bounce" />
                    <span className="text-xs font-bold font-mono block">✓ Syntax Validated Successfully!</span>
                    <p className="text-[10px] text-slate-400 leading-relaxed font-mono">
                      Your docker-compose.yml YAML spec conforms to correct spacing rules, ports formatting, and root declarations.
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
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold uppercase tracking-wide">
                              {err.severity === 'error' ? 'ERROR' : 'WARNING'}
                            </span>
                            <span className="text-slate-500">|</span>
                            <span>Line {err.line}</span>
                          </div>
                          <p>{err.message}</p>
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
