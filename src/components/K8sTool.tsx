import React, { useState, useEffect } from 'react';
import { 
  Check, Copy, Play, Download, AlertTriangle, CheckCircle, 
  Layers, Settings, Container, Cpu, Database, Network, Server, 
  RefreshCw, Info, HelpCircle, FileText, Sparkles, Code, Eye
} from 'lucide-react';

interface ManifestMetadata {
  name: string;
  namespace?: string;
  labels: Record<string, string>;
}

interface K8sManifest {
  apiVersion: string;
  kind: string;
  name: string;
  namespace?: string;
  replicas?: number;
  containers: {
    name: string;
    image: string;
    ports: number[];
    limits?: { cpu?: string; memory?: string };
    requests?: { cpu?: string; memory?: string };
  }[];
  servicePorts: { port: number; targetPort?: string | number; nodePort?: number }[];
  selectors: Record<string, string>;
}

interface K8sError {
  line: number;
  message: string;
  severity: 'error' | 'warning' | 'info';
  rawText: string;
}

const TEMPLATES = [
  {
    name: 'Standard Deployment & Service',
    code: `apiVersion: apps/v1
kind: Deployment
metadata:
  name: web-app-deployment
  namespace: production
  labels:
    app: web-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: web-app
  template:
    metadata:
      labels:
        app: web-app
    spec:
      containers:
      - name: nginx-web
        image: nginx:1.21-alpine
        ports:
        - containerPort: 80
        resources:
          limits:
            cpu: "500m"
            memory: "256Mi"
          requests:
            cpu: "200m"
            memory: "128Mi"
---
apiVersion: v1
kind: Service
metadata:
  name: web-app-service
  namespace: production
spec:
  type: LoadBalancer
  selector:
    app: web-app
  ports:
  - port: 80
    targetPort: 80
`
  },
  {
    name: 'Ingress Controller Routing',
    code: `apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: main-ingress
  annotations:
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
spec:
  rules:
  - host: app.owncircles.com
    http:
      paths:
      - path: /api
        pathType: Prefix
        backend:
          service:
            name: api-service
            port:
              number: 8080
      - path: /
        pathType: Prefix
        backend:
          service:
            name: static-service
            port:
              number: 80
`
  },
  {
    name: 'ConfigMap & Secret Mounts',
    code: `apiVersion: v1
kind: ConfigMap
metadata:
  name: app-config
  namespace: default
data:
  DB_HOST: "postgres-service"
  LOG_LEVEL: "info"
---
apiVersion: v1
kind: Secret
metadata:
  name: app-secrets
  namespace: default
type: Opaque
data:
  API_KEY: "YmFzZTY0ZW5jb2RlZHNlY3JldA=="
  DB_PASSWORD: "c3VwZXJzZWNyZXRwYXNzd29yZA=="
`
  }
];

interface K8sToolProps {
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

export default function K8sTool({ theme }: K8sToolProps) {
  const isLight = theme?.id === 'light';
  const [code, setCode] = useState<string>(TEMPLATES[0].code);
  const [errors, setErrors] = useState<K8sError[]>([]);
  const [manifests, setManifests] = useState<K8sManifest[]>([]);
  const [copied, setCopied] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'errors' | 'manifests'>('manifests');

  const borderClass = theme?.border || 'border-slate-800/80';
  const panelBgClass = theme?.panelBg || 'bg-slate-900';
  const inputBgClass = theme?.inputBg || 'bg-slate-950';
  const canvasBgClass = theme?.canvasBg || 'bg-[#02050c]';
  const textMutedClass = theme?.textMuted || 'text-slate-400';

  useEffect(() => {
    validateK8sYaml(code);
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
      a.download = 'kubernetes-manifest.yaml';
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (e) {}
  };

  const handlePrettify = () => {
    const lines = code.split('\n');
    const cleanedLines = lines.map(line => {
      const match = line.match(/^(\s*)(.*)$/);
      if (match) {
        const indent = match[1].replace(/\t/g, '  ');
        const content = match[2].trimEnd();
        return content ? `${indent}${content}` : '';
      }
      return '';
    });

    let finalLines: string[] = [];
    for (let i = 0; i < cleanedLines.length; i++) {
      if (cleanedLines[i] === '' && (i === 0 || cleanedLines[i - 1] === '')) {
        continue;
      }
      finalLines.push(cleanedLines[i]);
    }

    setCode(finalLines.join('\n'));
  };

  const validateK8sYaml = (yamlText: string) => {
    const newErrors: K8sError[] = [];
    const parsedManifests: K8sManifest[] = [];
    
    // Split the document by --- for multi-resource support
    const documents = yamlText.split('---');
    let absoluteLineCounter = 1;

    documents.forEach((doc, docIndex) => {
      const lines = doc.split('\n');
      const docStartLine = absoluteLineCounter;

      let apiVersion = '';
      let kind = '';
      let name = '';
      let namespace = '';
      let replicas: number | undefined;
      const containers: K8sManifest['containers'] = [];
      const servicePorts: K8sManifest['servicePorts'] = [];
      const selectors: Record<string, string> = {};

      let currentContainer: typeof containers[0] | null = null;
      let inContainerBlock = false;
      let inSelectorBlock = false;
      let inServicePortsBlock = false;
      let inResourcesBlock = false;
      let currentResourceLimit: 'limits' | 'requests' | null = null;

      lines.forEach((line, index) => {
        const lineNum = docStartLine + index;
        const trimmed = line.trim();

        if (line.includes('\t')) {
          newErrors.push({
            line: lineNum,
            message: 'Tab indentation found. Kubernetes YAML strictly prohibits tabs.',
            severity: 'error',
            rawText: line
          });
        }

        if (trimmed.startsWith('#') || !trimmed) {
          return;
        }

        // ApiVersion detection
        if (trimmed.startsWith('apiVersion:')) {
          apiVersion = trimmed.replace('apiVersion:', '').trim();
          return;
        }

        // Kind detection
        if (trimmed.startsWith('kind:')) {
          kind = trimmed.replace('kind:', '').trim();
          return;
        }

        // Name detection (under metadata)
        if (trimmed.startsWith('name:')) {
          const match = trimmed.match(/name:\s*['"]?([^'"]+)['"]?/);
          if (match && !name) {
            name = match[1];
          }
          return;
        }

        // Namespace detection
        if (trimmed.startsWith('namespace:')) {
          const match = trimmed.match(/namespace:\s*['"]?([^'"]+)['"]?/);
          if (match) {
            namespace = match[1];
          }
          return;
        }

        // Replicas
        if (trimmed.startsWith('replicas:')) {
          const match = trimmed.match(/replicas:\s*(\d+)/);
          if (match) {
            replicas = parseInt(match[1], 10);
          }
          return;
        }

        // Detect selector block
        if (trimmed.startsWith('selector:')) {
          inSelectorBlock = true;
          inContainerBlock = false;
          inServicePortsBlock = false;
          return;
        }

        // Containers list anchor
        if (trimmed.startsWith('containers:')) {
          inContainerBlock = true;
          inSelectorBlock = false;
          inServicePortsBlock = false;
          return;
        }

        // Ports lists anchor
        if (trimmed.startsWith('ports:') && kind === 'Service') {
          inServicePortsBlock = true;
          inContainerBlock = false;
          inSelectorBlock = false;
          return;
        }

        // Process Container definition fields
        if (inContainerBlock) {
          if (trimmed.startsWith('- name:')) {
            if (currentContainer) {
              containers.push(currentContainer);
            }
            currentContainer = {
              name: trimmed.replace('- name:', '').trim().replace(/['"]/g, ''),
              image: '',
              ports: [],
              limits: undefined,
              requests: undefined
            };
            inResourcesBlock = false;
            currentResourceLimit = null;
          } else if (currentContainer) {
            // Container Image
            if (trimmed.startsWith('image:')) {
              currentContainer.image = trimmed.replace('image:', '').trim().replace(/['"]/g, '');
            }
            // Container Port
            else if (trimmed.startsWith('containerPort:')) {
              const portMatch = trimmed.match(/containerPort:\s*(\d+)/);
              if (portMatch) {
                currentContainer.ports.push(parseInt(portMatch[1], 10));
              }
            }
            // resources
            else if (trimmed.startsWith('resources:')) {
              inResourcesBlock = true;
            }
            // Limits vs Requests
            else if (inResourcesBlock) {
              if (trimmed.startsWith('limits:')) {
                currentResourceLimit = 'limits';
                currentContainer.limits = {};
              } else if (trimmed.startsWith('requests:')) {
                currentResourceLimit = 'requests';
                currentContainer.requests = {};
              } else if (currentResourceLimit && currentContainer) {
                if (trimmed.startsWith('cpu:')) {
                  const val = trimmed.replace('cpu:', '').trim().replace(/['"]/g, '');
                  if (currentResourceLimit === 'limits' && currentContainer.limits) {
                    currentContainer.limits.cpu = val;
                  } else if (currentResourceLimit === 'requests' && currentContainer.requests) {
                    currentContainer.requests.cpu = val;
                  }
                } else if (trimmed.startsWith('memory:')) {
                  const val = trimmed.replace('memory:', '').trim().replace(/['"]/g, '');
                  if (currentResourceLimit === 'limits' && currentContainer.limits) {
                    currentContainer.limits.memory = val;
                  } else if (currentResourceLimit === 'requests' && currentContainer.requests) {
                    currentContainer.requests.memory = val;
                  }
                }
              }
            }
          }
        }

        // Process selectors key value
        if (inSelectorBlock && trimmed.includes(':') && !trimmed.startsWith('selector:')) {
          const parts = trimmed.split(':');
          if (parts.length === 2) {
            selectors[parts[0].trim()] = parts[1].trim().replace(/['"]/g, '');
          }
        }

        // Service ports
        if (inServicePortsBlock && kind === 'Service') {
          if (trimmed.startsWith('- port:')) {
            const portMatch = trimmed.match(/- port:\s*(\d+)/);
            if (portMatch) {
              servicePorts.push({
                port: parseInt(portMatch[1], 10)
              });
            }
          } else if (trimmed.startsWith('targetPort:') && servicePorts.length > 0) {
            const val = trimmed.replace('targetPort:', '').trim().replace(/['"]/g, '');
            const parsedVal = parseInt(val, 10);
            servicePorts[servicePorts.length - 1].targetPort = isNaN(parsedVal) ? val : parsedVal;
          } else if (trimmed.startsWith('nodePort:') && servicePorts.length > 0) {
            const portMatch = trimmed.match(/nodePort:\s*(\d+)/);
            if (portMatch) {
              servicePorts[servicePorts.length - 1].nodePort = parseInt(portMatch[1], 10);
            }
          }
        }
      });

      // Push final container
      if (currentContainer && currentContainer.name) {
        containers.push(currentContainer);
      }

      // Check Manifest details validity
      const cleanDocText = doc.trim();
      if (cleanDocText) {
        if (!apiVersion) {
          newErrors.push({
            line: docStartLine,
            message: `Manifest #${docIndex + 1} is missing standard "apiVersion" specification.`,
            severity: 'error',
            rawText: cleanDocText.substring(0, 100) + '...'
          });
        }
        if (!kind) {
          newErrors.push({
            line: docStartLine,
            message: `Manifest #${docIndex + 1} is missing standard "kind" resource type.`,
            severity: 'error',
            rawText: cleanDocText.substring(0, 100) + '...'
          });
        }
        if (!name) {
          newErrors.push({
            line: docStartLine,
            message: `Manifest #${docIndex + 1} is missing standard "metadata.name" field.`,
            severity: 'error',
            rawText: cleanDocText.substring(0, 100) + '...'
          });
        }

        // Best Practice warnings
        if (kind === 'Deployment') {
          if (containers.length === 0) {
            newErrors.push({
              line: docStartLine,
              message: 'Deployments require at least one container spec inside template.spec.containers.',
              severity: 'error',
              rawText: `Kind: ${kind}`
            });
          } else {
            containers.forEach(c => {
              if (!c.limits || !c.limits.cpu || !c.limits.memory) {
                newErrors.push({
                  line: docStartLine,
                  message: `Best Practice: Container "${c.name}" should have defined resources.limits configured to avoid memory saturation crashes.`,
                  severity: 'warning',
                  rawText: `container: ${c.name}`
                });
              }
              // Check for stable/latest tags
              if (c.image.endsWith(':latest')) {
                newErrors.push({
                  line: docStartLine,
                  message: `Production Best Practice: Avoid using ":latest" tags for container image "${c.image}" to maintain deterministic, reliable deployments.`,
                  severity: 'info',
                  rawText: `image: ${c.image}`
                });
              }
            });
          }
        }

        if (kind) {
          parsedManifests.push({
            apiVersion,
            kind,
            name: name || 'Unnamed',
            namespace: namespace || 'default',
            replicas,
            containers,
            servicePorts,
            selectors
          });
        }
      }

      absoluteLineCounter += lines.length;
    });

    setManifests(parsedManifests);
    setErrors(newErrors);
  };

  return (
    <div className="space-y-6">
      {/* EXPLANATORY HEADER BANNER */}
      <div className={`p-4 rounded-2xl border flex items-start gap-3.5 ${panelBgClass} ${borderClass}`}>
        <Cpu className="w-5 h-5 text-emerald-400 mt-0.5 flex-shrink-0" />
        <div className="space-y-1">
          <span className="text-xs font-bold block">Kubernetes YAML Validator & Resource Analyzer</span>
          <p className={`text-[11px] leading-relaxed ${textMutedClass}`}>
            Analyze nested multi-document Kubernetes configurations. Highlight tabs errors, check container resource thresholds, inspect selector mappings, and verify apiVersion/kind schemas.
          </p>
        </div>
      </div>

      {/* QUICK TEMPLATES SELECTOR ROW */}
      <div className="flex flex-wrap items-center gap-2">
        <span className={`text-[10px] font-mono font-bold uppercase tracking-wider ${textMutedClass}`}>
          Load Resource Template:
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
              kubernetes-manifest.yaml
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
                <span>Format</span>
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
                <span>Save</span>
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
            placeholder="Paste or write standard Kubernetes manifest configuration..."
          />
        </div>

        {/* RIGHT COLUMN: INTERACTIVE VISUAL INSPECTOR & TOPOLOGY */}
        <div className="flex flex-col h-[580px] space-y-4">
          
          {/* TAB ROW SELECTOR */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-2">
            <div className="flex items-center gap-1">
              <button
                onClick={() => setActiveTab('manifests')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border cursor-pointer ${
                  activeTab === 'manifests'
                    ? 'bg-indigo-950/40 border-indigo-550 text-indigo-400'
                    : 'text-slate-400 hover:text-slate-200 border-transparent'
                }`}
              >
                Manifest Analysis ({manifests.length})
              </button>
              <button
                onClick={() => setActiveTab('errors')}
                className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all border flex items-center gap-1.5 cursor-pointer ${
                  activeTab === 'errors'
                    ? 'bg-indigo-950/40 border-indigo-550 text-indigo-400'
                    : 'text-slate-400 hover:text-slate-200 border-transparent'
                }`}
              >
                <span>Diagnostics & Errors</span>
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
            
            {/* TAB: MANIFEST ANALYSIS */}
            {activeTab === 'manifests' && (
              <div className="space-y-4">
                {manifests.length === 0 ? (
                  <div className={`p-10 border border-dashed rounded-2xl text-center space-y-3 ${borderClass}`}>
                    <Server className="w-8 h-8 text-slate-500 mx-auto animate-pulse" />
                    <span className="text-xs font-mono text-slate-500 block">No Kubernetes resources detected.</span>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {manifests.map((m, idx) => (
                      <div
                        key={idx}
                        className={`p-4 rounded-2xl border ${panelBgClass} ${borderClass} space-y-3.5 hover:border-indigo-500/40 transition-colors shadow-sm`}
                      >
                        {/* TITLE & API */}
                        <div className="flex items-center justify-between gap-4 flex-wrap">
                          <div className="flex items-center gap-2">
                            <Server className="w-4 h-4 text-emerald-400" />
                            <span className="text-xs font-extrabold font-mono tracking-tight text-white bg-slate-950 border border-slate-850 px-2 py-0.5 rounded">
                              {m.kind}
                            </span>
                            <span className="text-xs font-black font-mono tracking-tight">{m.name}</span>
                          </div>
                          
                          <div className="flex items-center gap-1.5 text-[9px] font-bold font-mono text-slate-400 bg-slate-950/60 border border-slate-900 px-2 py-1 rounded">
                            <span>apiVersion: {m.apiVersion}</span>
                          </div>
                        </div>

                        {/* SUB SPECS ACCORDING TO KIND */}
                        <div className="space-y-2 text-[11px] font-mono">
                          
                          {/* Metadata */}
                          <div className="flex items-center gap-2">
                            <span className="text-slate-500">Namespace:</span>
                            <span className="text-slate-300 font-semibold">{m.namespace}</span>
                          </div>

                          {/* Replicas (Deployment) */}
                          {m.replicas !== undefined && (
                            <div className="flex items-center gap-2">
                              <span className="text-slate-500">Desired Replicas:</span>
                              <span className="text-indigo-400 font-extrabold">{m.replicas} Pods</span>
                            </div>
                          )}

                          {/* Selectors */}
                          {Object.keys(m.selectors).length > 0 && (
                            <div className="space-y-1">
                              <span className="text-slate-500">Selector Labels:</span>
                              <div className="flex flex-wrap gap-1">
                                {Object.entries(m.selectors).map(([k, v]) => (
                                  <span key={k} className="px-1.5 py-0.5 rounded bg-slate-950 border border-slate-900 text-teal-400 text-[10px]">
                                    {k}: {v}
                                  </span>
                                ))}
                              </div>
                            </div>
                          )}

                          {/* Container specification (Deployment / Pod) */}
                          {m.containers.length > 0 && (
                            <div className="space-y-2.5 pt-2 border-t border-slate-900/60">
                              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Container Deployments:</span>
                              {m.containers.map((c, cIdx) => (
                                <div key={cIdx} className="p-3 rounded bg-slate-950/60 border border-slate-900 space-y-2">
                                  <div className="flex items-center justify-between gap-2 flex-wrap">
                                    <div className="flex items-center gap-1.5 text-xs">
                                      <Container className="w-3.5 h-3.5 text-indigo-400" />
                                      <span className="font-bold text-white">{c.name}</span>
                                    </div>
                                    <span className="text-[10px] text-slate-400 bg-slate-900 border border-slate-800 px-1.5 rounded">{c.image}</span>
                                  </div>

                                  {/* Limits */}
                                  <div className="grid grid-cols-2 gap-2 text-[10px] bg-slate-950/30 p-2 rounded border border-slate-900/40">
                                    <div className="space-y-0.5">
                                      <span className="text-slate-500 block font-bold uppercase text-[8px]">Request Thresholds</span>
                                      <span className="text-slate-300 block">CPU: {c.requests?.cpu || 'Unlimited'}</span>
                                      <span className="text-slate-300 block">Memory: {c.requests?.memory || 'Unlimited'}</span>
                                    </div>
                                    <div className="space-y-0.5 border-l border-slate-900/80 pl-2">
                                      <span className="text-rose-400 block font-bold uppercase text-[8px]">Limits Caps</span>
                                      <span className="text-slate-300 block">CPU: {c.limits?.cpu || 'Unlimited'}</span>
                                      <span className="text-slate-300 block">Memory: {c.limits?.memory || 'Unlimited'}</span>
                                    </div>
                                  </div>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Service port bindings */}
                          {m.servicePorts.length > 0 && (
                            <div className="space-y-1.5 pt-2 border-t border-slate-900/60">
                              <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Service Network Ports:</span>
                              <div className="space-y-1">
                                {m.servicePorts.map((sp, spIdx) => (
                                  <div key={spIdx} className="flex items-center justify-between gap-4 p-2 rounded bg-slate-950/60 border border-slate-900 text-[10px]">
                                    <div className="flex items-center gap-1.5">
                                      <Network className="w-3.5 h-3.5 text-cyan-400" />
                                      <span>Service Port: <strong className="text-white">{sp.port}</strong></span>
                                      <span className="text-slate-500">→</span>
                                      <span>Target Port: <strong className="text-teal-400">{sp.targetPort || sp.port}</strong></span>
                                    </div>
                                    {sp.nodePort && (
                                      <span className="px-1.5 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-bold">
                                        nodePort: {sp.nodePort}
                                      </span>
                                    )}
                                  </div>
                                ))}
                              </div>
                            </div>
                          )}

                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* TAB: DIAGNOSTICS & ERRORS */}
            {activeTab === 'errors' && (
              <div className="space-y-4">
                {errors.length === 0 ? (
                  <div className={`p-8 border rounded-2xl text-center space-y-2 ${
                    isLight ? 'bg-emerald-50 border-emerald-100 text-emerald-800' : 'bg-emerald-950/10 border-emerald-900/40 text-emerald-300'
                  }`}>
                    <CheckCircle className="w-6 h-6 text-emerald-400 mx-auto animate-bounce" />
                    <span className="text-xs font-bold font-mono block">✓ YAML Manifest Successfully Audited!</span>
                    <p className="text-[10px] text-slate-400 leading-relaxed font-mono">
                      No syntax blocking issues found. Resources are labeled correctly and align with general k8s schema rules.
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
                            : err.severity === 'warning'
                            ? 'bg-amber-950/10 border-amber-900/40 text-amber-300'
                            : 'bg-indigo-950/10 border-indigo-900/40 text-indigo-300'
                        }`}
                      >
                        <AlertTriangle className={`w-4 h-4 mt-0.5 flex-shrink-0 ${
                          err.severity === 'error' ? 'text-rose-400' : err.severity === 'warning' ? 'text-amber-400' : 'text-indigo-400'
                        }`} />
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
