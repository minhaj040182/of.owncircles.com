import React, { useState } from 'react';
import { 
  Play, Copy, Check, Trash2, Globe, Send, Terminal, 
  ChevronRight, ChevronDown, BookOpen, Layers, CheckCircle, 
  AlertCircle, Server, Code, FileText, Info
} from 'lucide-react';

const SAMPLE_OPENAPI = `{
  "openapi": "3.0.0",
  "info": {
    "title": "Swagger JSONPlaceholder Mock API",
    "version": "1.0.3",
    "description": "Standard mock spec representing the JSONPlaceholder blog service endpoints for full system documentation."
  },
  "servers": [
    {
      "url": "https://jsonplaceholder.typicode.com",
      "description": "Public JSONPlaceholder Endpoint"
    }
  ],
  "paths": {
    "/posts": {
      "get": {
        "tags": ["posts"],
        "summary": "List all blogs posts",
        "description": "Fetches standard collection of text-filled blog entries with user assignments.",
        "parameters": [
          {
            "name": "userId",
            "in": "query",
            "required": false,
            "description": "Filter entries belonging to a given user ID",
            "schema": {
              "type": "integer"
            }
          }
        ]
      },
      "post": {
        "tags": ["posts"],
        "summary": "Create new blog entry",
        "description": "Appends posts payload data. Note that this mock database does not write to disks.",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "required": ["title", "body", "userId"],
                "properties": {
                  "title": { "type": "string" },
                  "body": { "type": "string" },
                  "userId": { "type": "integer" }
                }
              }
            }
          }
        }
      }
    },
    "/users": {
      "get": {
        "tags": ["users"],
        "summary": "Get full company users profiles",
        "description": "Fetch profiles representing full list of mock accounts on the cloud server.",
        "parameters": []
      }
    }
  }
}`;

interface EndpointSpec {
  path: string;
  method: string;
  summary: string;
  description: string;
  tags: string[];
  parameters: any[];
  requestBody?: any;
  responses?: any;
}

export default function OpenApiTool({ theme }: { theme?: any }) {
  const [specInput, setSpecInput] = useState<string>(SAMPLE_OPENAPI);
  const [parsedSpec, setParsedSpec] = useState<any>(null);
  const [endpoints, setEndpoints] = useState<EndpointSpec[]>([]);
  const [expandedEndpoints, setExpandedEndpoints] = useState<Record<string, boolean>>({});
  const [status, setStatus] = useState<{ type: 'idle' | 'success' | 'error'; message: string }>({ type: 'idle', message: '' });
  const [tryParameters, setTryParameters] = useState<Record<string, string>>({});
  const [tryBody, setTryBody] = useState<Record<string, string>>({});
  const [tryResults, setTryResults] = useState<Record<string, { status: number; body: string; headers: string; time: number }>>({});
  const [loadingRequest, setLoadingRequest] = useState<Record<string, boolean>>({});

  const t = theme || {
    isDark: true,
    bg: 'bg-[#02050b]',
    text: 'text-slate-200',
    textMuted: 'text-slate-400',
    border: 'border-slate-900',
    borderMuted: 'border-slate-900/40',
    card: 'bg-slate-950/40',
    inputBg: 'bg-slate-950',
    panelBg: 'bg-slate-900',
    btnPrimary: 'bg-indigo-600 hover:bg-indigo-500 text-white',
    btnSecondary: 'bg-slate-900 hover:bg-slate-850 border-slate-800 text-slate-200',
    canvasBg: 'bg-[#02050c]'
  };

  const handleParseSpec = () => {
    if (!specInput.trim()) {
      setStatus({ type: 'error', message: 'Spec input cannot be empty!' });
      return;
    }
    try {
      const parsed = JSON.parse(specInput);
      setParsedSpec(parsed);

      const list: EndpointSpec[] = [];
      if (parsed.paths) {
        Object.entries(parsed.paths).forEach(([path, pathNode]: [string, any]) => {
          Object.entries(pathNode).forEach(([method, methodNode]: [string, any]) => {
            if (['get', 'post', 'put', 'delete', 'patch', 'head', 'options'].includes(method.toLowerCase())) {
              list.push({
                path,
                method: method.toUpperCase(),
                summary: methodNode.summary || 'No Summary',
                description: methodNode.description || 'No description provided.',
                tags: methodNode.tags || ['default'],
                parameters: methodNode.parameters || [],
                requestBody: methodNode.requestBody,
                responses: methodNode.responses
              });
            }
          });
        });
      }

      setEndpoints(list);
      setStatus({ type: 'success', message: `OpenAPI spec compiled successfully. Parsed ${list.length} endpoints.` });
    } catch (err: any) {
      setParsedSpec(null);
      setEndpoints([]);
      setStatus({ type: 'error', message: `Failed to compile OpenAPI spec: ${err.message}` });
    }
  };

  const toggleEndpoint = (key: string, endpoint: EndpointSpec) => {
    setExpandedEndpoints(prev => {
      const updated = { ...prev, [key]: !prev[key] };
      if (updated[key]) {
        // Pre-fill tryParameters with default values
        const params: Record<string, string> = { ...tryParameters };
        endpoint.parameters.forEach(p => {
          if (p.name && !params[`${key}_${p.name}`]) {
            params[`${key}_${p.name}`] = p.schema?.default || '';
          }
        });
        setTryParameters(params);

        // Pre-fill body template if post/put
        if (endpoint.requestBody && !tryBody[key]) {
          const content = endpoint.requestBody.content;
          const jsonSchema = content && (content['application/json'] || content['*/*']);
          if (jsonSchema && jsonSchema.schema) {
            const template = generateSchemaTemplate(jsonSchema.schema);
            setTryBody(prevBody => ({ ...prevBody, [key]: JSON.stringify(template, null, 2) }));
          }
        }
      }
      return updated;
    });
  };

  const generateSchemaTemplate = (schema: any): any => {
    if (!schema) return {};
    if (schema.type === 'object' && schema.properties) {
      const res: Record<string, any> = {};
      Object.entries(schema.properties).forEach(([k, v]: [string, any]) => {
        if (v.type === 'object') {
          res[k] = generateSchemaTemplate(v);
        } else if (v.type === 'array') {
          res[k] = [v.items?.type === 'integer' ? 1 : 'string'];
        } else if (v.type === 'integer' || v.type === 'number') {
          res[k] = v.default || 1;
        } else if (v.type === 'boolean') {
          res[k] = v.default || false;
        } else {
          res[k] = v.default || 'sample';
        }
      });
      return res;
    }
    return {};
  };

  const handleExecuteRequest = async (key: string, endpoint: EndpointSpec) => {
    const servers = parsedSpec?.servers;
    const baseUrl = servers && servers.length > 0 ? servers[0].url : 'https://jsonplaceholder.typicode.com';
    
    // Build path with replacements
    let actualPath = endpoint.path;
    endpoint.parameters.forEach(p => {
      if (p.in === 'path') {
        const val = tryParameters[`${key}_${p.name}`] || `{${p.name}}`;
        actualPath = actualPath.replace(`{${p.name}}`, val);
      }
    });

    // Build Query Params
    const queryParams = new URLSearchParams();
    endpoint.parameters.forEach(p => {
      if (p.in === 'query') {
        const val = tryParameters[`${key}_${p.name}`];
        if (val) {
          queryParams.append(p.name, val);
        }
      }
    });

    const queryString = queryParams.toString();
    const fullUrl = `${baseUrl}${actualPath}${queryString ? `?${queryString}` : ''}`;

    setLoadingRequest(prev => ({ ...prev, [key]: true }));

    const start = Date.now();
    try {
      const fetchOptions: RequestInit = {
        method: endpoint.method,
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      };

      if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(endpoint.method) && tryBody[key]) {
        fetchOptions.body = tryBody[key];
      }

      const response = await fetch(fullUrl, fetchOptions);
      const duration = Date.now() - start;

      const responseText = await response.text();
      let formattedBody = responseText;
      try {
        formattedBody = JSON.stringify(JSON.parse(responseText), null, 2);
      } catch (e) {}

      // Get headers string
      let headersStr = '';
      response.headers.forEach((v, k) => {
        headersStr += `${k}: ${v}\n`;
      });

      setTryResults(prev => ({
        ...prev,
        [key]: {
          status: response.status,
          body: formattedBody,
          headers: headersStr || 'No headers returned',
          time: duration
        }
      }));
    } catch (err: any) {
      setTryResults(prev => ({
        ...prev,
        [key]: {
          status: 0,
          body: `Network/CORS Error:\n${err.message || 'The endpoint could not be reached. Ensure CORS is enabled on the server.'}`,
          headers: 'N/A',
          time: Date.now() - start
        }
      }));
    } finally {
      setLoadingRequest(prev => ({ ...prev, [key]: false }));
    }
  };

  const getMethodColor = (m: string) => {
    switch (m.toUpperCase()) {
      case 'GET': return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400';
      case 'POST': return 'bg-indigo-500/10 border-indigo-500/30 text-indigo-400';
      case 'PUT': return 'bg-amber-500/10 border-amber-500/30 text-amber-400';
      case 'DELETE': return 'bg-rose-500/10 border-rose-500/30 text-rose-400';
      default: return 'bg-slate-500/10 border-slate-500/30 text-slate-400';
    }
  };

  const handleLoadSample = () => {
    setSpecInput(SAMPLE_OPENAPI);
    setStatus({ type: 'idle', message: '' });
  };

  const handleClear = () => {
    setSpecInput('');
    setParsedSpec(null);
    setEndpoints([]);
    setTryResults({});
    setStatus({ type: 'idle', message: '' });
  };

  return (
    <div className={`p-6 space-y-6 ${t.text}`}>
      {/* Heading */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-sans font-bold tracking-tight">OpenAPI & Swagger Viewer</h1>
          <p className={`text-xs ${t.textMuted} mt-1`}>
            Paste OpenAPI v3.0 specs to render interactive developers documentation complete with an active "Try it out" fetch client.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleLoadSample}
            className={`px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 border transition-all ${t.btnSecondary}`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Load Sample API Spec
          </button>
          <button
            onClick={handleClear}
            className="px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 border border-red-500/20 hover:border-red-500/40 text-red-400 hover:bg-red-500/5 transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Spec JSON Entry Box */}
        <div className="lg:col-span-5 space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono block px-1">
            Raw OpenAPI JSON Specification
          </span>
          <textarea
            value={specInput}
            onChange={(e) => setSpecInput(e.target.value)}
            placeholder={`{\n  "openapi": "3.0.0",\n  "info": { ... }\n}`}
            className={`w-full h-[500px] p-4 rounded-xl border font-mono text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 ${t.inputBg} ${t.border} resize-none`}
            id="openapi-raw-spec-input"
          />
          <button
            onClick={handleParseSpec}
            className={`px-5 py-3 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all w-full justify-center ${t.btnPrimary}`}
          >
            <Play className="w-4 h-4" />
            Compile & Render Documentation
          </button>
        </div>

        {/* Documentation Renderer Panel */}
        <div className="lg:col-span-7 flex flex-col min-h-[500px] max-h-[560px] overflow-y-auto rounded-xl border border-slate-900 bg-slate-950/20 p-5 space-y-5">
          {parsedSpec ? (
            <div className="space-y-6">
              {/* API Info Header */}
              <div className="border-b border-slate-900 pb-4 space-y-2">
                <div className="flex items-center gap-2 text-indigo-400 font-mono text-xs font-semibold">
                  <Info className="w-4 h-4" />
                  API SPEC v{parsedSpec.info?.version || '1.0.0'}
                </div>
                <h2 className="text-xl font-bold tracking-tight">{parsedSpec.info?.title || 'REST Service Endpoint'}</h2>
                <p className="text-xs text-slate-400 leading-relaxed">{parsedSpec.info?.description}</p>

                {/* Server configurations */}
                {parsedSpec.servers && parsedSpec.servers.map((srv: any, idx: number) => (
                  <div key={idx} className="flex items-center gap-2 mt-2 p-2 bg-slate-900/40 rounded-lg text-xs font-mono">
                    <Server className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="text-slate-400">Server:</span>
                    <span className="text-indigo-400 font-medium truncate">{srv.url}</span>
                    {srv.description && <span className="text-slate-600">({srv.description})</span>}
                  </div>
                ))}
              </div>

              {/* Endpoints Listing */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
                  Available Paths ({endpoints.length})
                </h3>
                {endpoints.map((ep, idx) => {
                  const key = `${ep.method}_${ep.path.replace(/[^a-zA-Z0-9]/g, '_')}`;
                  const isExpanded = !!expandedEndpoints[key];
                  return (
                    <div key={idx} className="border border-slate-900 rounded-xl overflow-hidden bg-slate-900/10">
                      {/* Header row click to expand */}
                      <button
                        onClick={() => toggleEndpoint(key, ep)}
                        className="w-full flex items-center justify-between p-3.5 hover:bg-slate-900/30 transition-all text-left"
                      >
                        <div className="flex items-center gap-3 truncate">
                          <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold font-mono border ${getMethodColor(ep.method)}`}>
                            {ep.method}
                          </span>
                          <span className="font-mono text-xs text-slate-200 font-semibold truncate">{ep.path}</span>
                          <span className="hidden md:inline text-xs text-slate-500 truncate">- {ep.summary}</span>
                        </div>
                        {isExpanded ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
                      </button>

                      {/* Expansions containing request documentation + sandbox */}
                      {isExpanded && (
                        <div className="p-4 border-t border-slate-900/60 bg-slate-950/40 space-y-4 text-xs">
                          <p className="text-slate-400 leading-relaxed">{ep.description}</p>

                          {/* Parameters Table */}
                          {ep.parameters.length > 0 && (
                            <div className="space-y-2">
                              <h4 className="font-semibold text-slate-300">Parameters</h4>
                              <div className="border border-slate-900 rounded-lg overflow-hidden">
                                <table className="w-full text-left font-mono text-[11px]">
                                  <thead className="bg-slate-900/40 text-slate-400">
                                    <tr>
                                      <th className="p-2">Name</th>
                                      <th className="p-2">In</th>
                                      <th className="p-2">Type</th>
                                      <th className="p-2">Required</th>
                                      <th className="p-2">Description</th>
                                    </tr>
                                  </thead>
                                  <tbody className="divide-y divide-slate-900/40">
                                    {ep.parameters.map((p: any, pIdx: number) => (
                                      <tr key={pIdx}>
                                        <td className="p-2 font-bold text-slate-300">{p.name}</td>
                                        <td className="p-2 text-indigo-400">{p.in}</td>
                                        <td className="p-2 text-slate-400">{p.schema?.type || 'string'}</td>
                                        <td className="p-2">
                                          {p.required ? (
                                            <span className="text-rose-400 font-bold">Yes</span>
                                          ) : (
                                            <span className="text-slate-600">No</span>
                                          )}
                                        </td>
                                        <td className="p-2 text-slate-500">{p.description || 'N/A'}</td>
                                      </tr>
                                    ))}
                                  </tbody>
                                </table>
                              </div>
                            </div>
                          )}

                          {/* Sandbox try fields */}
                          <div className="p-4 rounded-xl border border-slate-900 bg-slate-950/60 space-y-3">
                            <h4 className="font-semibold text-indigo-400 flex items-center gap-1.5 uppercase tracking-wider text-[10px]">
                              <Terminal className="w-3.5 h-3.5" />
                              Interactive Test Console
                            </h4>

                            {/* Parameter entry fields */}
                            {ep.parameters.length > 0 && (
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                {ep.parameters.map((p: any, pIdx: number) => (
                                  <div key={pIdx} className="space-y-1">
                                    <label className="text-[10px] text-slate-400 font-mono block">
                                      {p.name} <span className="text-slate-600">({p.in})</span>
                                    </label>
                                    <input
                                      type="text"
                                      value={tryParameters[`${key}_${p.name}`] || ''}
                                      onChange={(e) => setTryParameters({ ...tryParameters, [`${key}_${p.name}`]: e.target.value })}
                                      placeholder={p.schema?.type || 'value'}
                                      className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2 font-mono text-xs focus:outline-none focus:border-indigo-500"
                                    />
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Post body editor */}
                            {['POST', 'PUT', 'PATCH'].includes(ep.method) && ep.requestBody && (
                              <div className="space-y-1.5">
                                <label className="text-[10px] text-slate-400 font-mono block">
                                  Request JSON Payload
                                </label>
                                <textarea
                                  value={tryBody[key] || ''}
                                  onChange={(e) => setTryBody({ ...tryBody, [key]: e.target.value })}
                                  placeholder="{}"
                                  className="w-full h-32 bg-slate-900 border border-slate-800 rounded-lg p-3 font-mono text-[11px] focus:outline-none focus:border-indigo-500 resize-none"
                                />
                              </div>
                            )}

                            <button
                              onClick={() => handleExecuteRequest(key, ep)}
                              disabled={loadingRequest[key]}
                              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all disabled:opacity-50"
                            >
                              <Send className="w-3.5 h-3.5" />
                              {loadingRequest[key] ? 'Requesting...' : 'Send API Call'}
                            </button>

                            {/* Try Results Block */}
                            {tryResults[key] && (
                              <div className="space-y-2 border-t border-slate-900 pt-3">
                                <div className="flex items-center justify-between text-[11px] font-mono">
                                  <div className="flex items-center gap-2">
                                    <span className="text-slate-400">Response Status:</span>
                                    <span className={`font-bold ${tryResults[key].status >= 200 && tryResults[key].status < 300 ? 'text-emerald-400' : 'text-rose-400'}`}>
                                      {tryResults[key].status}
                                    </span>
                                  </div>
                                  <span className="text-slate-500">{tryResults[key].time} ms</span>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 font-mono text-[10px]">
                                  <div className="space-y-1">
                                    <span className="text-slate-500 block uppercase font-bold tracking-wider">Headers</span>
                                    <pre className="p-2.5 bg-slate-900/60 border border-slate-900 rounded-lg h-24 overflow-y-auto text-slate-400 whitespace-pre-wrap leading-relaxed">
                                      {tryResults[key].headers}
                                    </pre>
                                  </div>
                                  <div className="space-y-1">
                                    <span className="text-slate-500 block uppercase font-bold tracking-wider">Body Response</span>
                                    <pre className="p-2.5 bg-slate-900/60 border border-slate-900 rounded-lg h-24 overflow-y-auto text-slate-200 overflow-x-auto whitespace-pre leading-relaxed">
                                      {tryResults[key].body}
                                    </pre>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-2 p-10">
              <Code className="w-10 h-10 text-slate-800" />
              <span className="text-xs text-center leading-relaxed">
                Provide a compiled JSON representation of your OpenAPI specification to view dynamic interactive documents here.
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Compiler notification status bar */}
      {status.type !== 'idle' && (
        <div
          className={`p-4 rounded-xl flex items-start gap-3 border ${
            status.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-red-500/10 border-red-500/30 text-red-300'
          }`}
        >
          {status.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          )}
          <div>
            <span className="text-xs font-semibold font-mono block uppercase tracking-wider">
              {status.type === 'success' ? 'COMPILE SUCCESS' : 'COMPILE FAILURE'}
            </span>
            <p className="text-xs mt-1 font-mono leading-relaxed">{status.message}</p>
          </div>
        </div>
      )}
    </div>
  );
}
