import React, { useState } from 'react';
import { 
  Plus, Trash2, Check, Copy, Play, RefreshCw, Send, 
  Terminal, Settings, CheckCircle, AlertCircle, FileText, 
  Layers, Edit2, Download, Upload, HelpCircle, Server
} from 'lucide-react';

interface MockEndpoint {
  id: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  path: string;
  statusCode: number;
  delayMs: number;
  responseBody: string;
  contentType: string;
}

interface ServerLog {
  timestamp: string;
  method: string;
  path: string;
  status: number;
  delay: number;
  size: number;
}

const DEFAULT_ENDPOINTS: MockEndpoint[] = [
  {
    id: 'ep_1',
    method: 'GET',
    path: '/api/v1/users',
    statusCode: 200,
    delayMs: 300,
    contentType: 'application/json',
    responseBody: `[\n  { "id": 1, "name": "Alice Vance", "role": "Architect" },\n  { "id": 2, "name": "Bob Miller", "role": "DevOps" }\n]`
  },
  {
    id: 'ep_2',
    method: 'POST',
    path: '/api/v1/users',
    statusCode: 201,
    delayMs: 500,
    contentType: 'application/json',
    responseBody: `{\n  "success": true,\n  "message": "User profile successfully registered.",\n  "createdId": 103\n}`
  },
  {
    id: 'ep_3',
    method: 'GET',
    path: '/api/v1/status',
    statusCode: 500,
    delayMs: 100,
    contentType: 'application/json',
    responseBody: `{\n  "status": "unhealthy",\n  "error": "Database connection timed out."\n}`
  }
];

export default function MockApiTool({ theme }: { theme?: any }) {
  const [endpoints, setEndpoints] = useState<MockEndpoint[]>(DEFAULT_ENDPOINTS);
  const [activeEndpointId, setActiveEndpointId] = useState<string>('ep_1');
  const [logs, setLogs] = useState<ServerLog[]>([
    {
      timestamp: '11:24:05 AM',
      method: 'GET',
      path: '/api/v1/users',
      status: 200,
      delay: 300,
      size: 112
    }
  ]);

  // Editing Endpoint Form State
  const [editingEndpoint, setEditingEndpoint] = useState<MockEndpoint>({ ...DEFAULT_ENDPOINTS[0] });
  
  // Interactive client state
  const [clientMethod, setClientMethod] = useState<'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH'>('GET');
  const [clientPath, setClientPath] = useState<string>('/api/v1/users');
  const [clientBody, setClientBody] = useState<string>('{\n  "name": "Charlie Blue",\n  "role": "Product Manager"\n}');
  const [clientLoading, setClientLoading] = useState<boolean>(false);
  const [clientResult, setClientResult] = useState<{ status: number; headers: string; body: string; time: number } | null>(null);

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

  const handleSelectEndpoint = (ep: MockEndpoint) => {
    setActiveEndpointId(ep.id);
    setEditingEndpoint({ ...ep });
    setClientMethod(ep.method);
    setClientPath(ep.path);
  };

  const handleSaveEndpointChanges = () => {
    setEndpoints(prev => prev.map(ep => ep.id === editingEndpoint.id ? { ...editingEndpoint } : ep));
    
    const logItem: ServerLog = {
      timestamp: new Date().toLocaleTimeString(),
      method: 'SYSTEM',
      path: `Updated endpoint configuration: [${editingEndpoint.method}] ${editingEndpoint.path}`,
      status: 200,
      delay: 0,
      size: 0
    };
    setLogs(prev => [logItem, ...prev]);
  };

  const handleAddNewEndpoint = () => {
    const newId = `ep_${Date.now()}`;
    const newEp: MockEndpoint = {
      id: newId,
      method: 'GET',
      path: `/api/v1/new-endpoint-${endpoints.length + 1}`,
      statusCode: 200,
      delayMs: 200,
      contentType: 'application/json',
      responseBody: `{\n  "ok": true,\n  "message": "Custom Mock API response."\n}`
    };

    setEndpoints(prev => [...prev, newEp]);
    setActiveEndpointId(newId);
    setEditingEndpoint(newEp);
    setClientMethod(newEp.method);
    setClientPath(newEp.path);

    const logItem: ServerLog = {
      timestamp: new Date().toLocaleTimeString(),
      method: 'SYSTEM',
      path: `Added new mock endpoint: [GET] ${newEp.path}`,
      status: 200,
      delay: 0,
      size: 0
    };
    setLogs(prev => [logItem, ...prev]);
  };

  const handleDeleteEndpoint = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (endpoints.length <= 1) {
      alert('You must have at least one mock endpoint registered.');
      return;
    }
    const remaining = endpoints.filter(ep => ep.id !== id);
    setEndpoints(remaining);
    
    // Fallback active endpoint selection
    if (activeEndpointId === id) {
      handleSelectEndpoint(remaining[0]);
    }

    const logItem: ServerLog = {
      timestamp: new Date().toLocaleTimeString(),
      method: 'SYSTEM',
      path: `Deleted endpoint with ID ${id}`,
      status: 200,
      delay: 0,
      size: 0
    };
    setLogs(prev => [logItem, ...prev]);
  };

  // Dispatch Client Simulation
  const handleClientCall = () => {
    setClientLoading(true);
    setClientResult(null);

    // Resolve matching mock endpoint in list
    const matched = endpoints.find(
      ep => ep.method === clientMethod && ep.path.toLowerCase() === clientPath.trim().toLowerCase()
    );

    const start = Date.now();
    const delay = matched ? matched.delayMs : 150; // default delay if 404

    setTimeout(() => {
      const timeTaken = Date.now() - start;
      if (matched) {
        setClientResult({
          status: matched.statusCode,
          headers: `Content-Type: ${matched.contentType}\nx-mock-api-engine: OwnCircles/v2.5\ncache-control: no-store`,
          body: matched.responseBody,
          time: timeTaken
        });

        // Add server console logs
        setLogs(prev => [
          {
            timestamp: new Date().toLocaleTimeString(),
            method: matched.method,
            path: matched.path,
            status: matched.statusCode,
            delay: timeTaken,
            size: matched.responseBody.length
          },
          ...prev
        ]);
      } else {
        // Return 404 Not Found
        const missingBody = `{\n  "error": "Not Found",\n  "message": "No mock endpoint matching [${clientMethod}] ${clientPath} was found on this simulation server."\n}`;
        setClientResult({
          status: 404,
          headers: `Content-Type: application/json\nx-mock-api-engine: OwnCircles/v2.5`,
          body: missingBody,
          time: timeTaken
        });

        setLogs(prev => [
          {
            timestamp: new Date().toLocaleTimeString(),
            method: clientMethod,
            path: clientPath,
            status: 404,
            delay: timeTaken,
            size: missingBody.length
          },
          ...prev
        ]);
      }
      setClientLoading(false);
    }, delay);
  };

  const handleExport = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(endpoints, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href",     dataStr);
    downloadAnchor.setAttribute("download", "ownformatters-mock-endpoints.json");
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (evt) => {
      try {
        const parsed = JSON.parse(evt.target?.result as string);
        if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].path) {
          setEndpoints(parsed);
          handleSelectEndpoint(parsed[0]);
          
          setLogs(prev => [
            {
              timestamp: new Date().toLocaleTimeString(),
              method: 'SYSTEM',
              path: `Successfully imported ${parsed.length} mock endpoints!`,
              status: 200,
              delay: 0,
              size: 0
            },
            ...prev
          ]);
        } else {
          alert('Invalid file format. Ensure it is a valid list of mock endpoints.');
        }
      } catch (err) {
        alert('Failed to parse file.');
      }
    };
    reader.readAsText(file);
  };

  const getMethodColor = (m: string) => {
    switch (m.toUpperCase()) {
      case 'GET': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'POST': return 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20';
      case 'PUT': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'DELETE': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  return (
    <div className={`p-6 space-y-6 ${t.text}`}>
      {/* Title Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-sans font-bold tracking-tight">Interactive Mock API Server</h1>
          <p className={`text-xs ${t.textMuted} mt-1`}>
            Build responsive REST mock API endpoints, simulate custom latencies, and query them locally to review client workflows.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className={`px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 border transition-all ${t.btnSecondary}`}
          >
            <Download className="w-3.5 h-3.5" />
            Export Endpoints
          </button>
          <label className={`px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 border transition-all cursor-pointer ${t.btnSecondary}`}>
            <Upload className="w-3.5 h-3.5" />
            Import Config
            <input type="file" onChange={handleImport} className="hidden" accept=".json" />
          </label>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Endpoints Registry & Manager */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          <div className="flex justify-between items-center px-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">
              Endpoint Registry ({endpoints.length})
            </span>
            <button
              onClick={handleAddNewEndpoint}
              className="p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider font-mono shadow-md transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              New Mock
            </button>
          </div>

          <div className="space-y-2 max-h-96 overflow-y-auto">
            {endpoints.map((ep) => (
              <div
                key={ep.id}
                onClick={() => handleSelectEndpoint(ep)}
                className={`p-3.5 rounded-xl border text-left cursor-pointer transition-all flex items-center justify-between group ${
                  activeEndpointId === ep.id
                    ? 'border-indigo-500/50 bg-indigo-600/5 shadow-md'
                    : 'border-slate-900 hover:border-slate-800 bg-slate-900/10'
                }`}
              >
                <div className="flex items-center gap-3 truncate">
                  <span className={`px-2 py-0.5 rounded text-[9px] font-bold border font-mono ${getMethodColor(ep.method)}`}>
                    {ep.method}
                  </span>
                  <span className="font-mono text-xs text-slate-200 font-medium truncate">{ep.path}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-500 font-mono hidden md:inline">{ep.delayMs}ms</span>
                  <button
                    onClick={(e) => handleDeleteEndpoint(ep.id, e)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-400 transition-all"
                    title="Delete endpoint"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Endpoint Detail Editor */}
        <div className="lg:col-span-8 flex flex-col gap-5 p-5 rounded-xl border border-slate-900 bg-slate-950/20">
          <h3 className="text-sm font-semibold tracking-tight border-b border-slate-900 pb-3 flex items-center gap-2">
            <Server className="w-4 h-4 text-indigo-400" />
            Configure Endpoint Details
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
            <div className="md:col-span-3 space-y-1">
              <label className="text-[10px] text-slate-400 font-mono block uppercase">HTTP Method</label>
              <select
                value={editingEndpoint.method}
                onChange={(e) => setEditingEndpoint({ ...editingEndpoint, method: e.target.value as any })}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 font-mono text-xs focus:outline-none focus:border-indigo-500"
              >
                <option value="GET">GET</option>
                <option value="POST">POST</option>
                <option value="PUT">PUT</option>
                <option value="DELETE">DELETE</option>
                <option value="PATCH">PATCH</option>
              </select>
            </div>

            <div className="md:col-span-5 space-y-1">
              <label className="text-[10px] text-slate-400 font-mono block uppercase font-bold tracking-wider">Route Path</label>
              <input
                type="text"
                value={editingEndpoint.path}
                onChange={(e) => setEditingEndpoint({ ...editingEndpoint, path: e.target.value })}
                placeholder="/api/v1/resource"
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 font-mono text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="md:col-span-2 space-y-1">
              <label className="text-[10px] text-slate-400 font-mono block uppercase">HTTP Status</label>
              <input
                type="number"
                value={editingEndpoint.statusCode}
                onChange={(e) => setEditingEndpoint({ ...editingEndpoint, statusCode: parseInt(e.target.value, 10) || 200 })}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 font-mono text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="md:col-span-2 space-y-1">
              <label className="text-[10px] text-slate-400 font-mono block uppercase">Latency (ms)</label>
              <input
                type="number"
                value={editingEndpoint.delayMs}
                onChange={(e) => setEditingEndpoint({ ...editingEndpoint, delayMs: parseInt(e.target.value, 10) || 0 })}
                className="w-full bg-slate-900 border border-slate-800 rounded-lg p-2.5 font-mono text-xs focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] text-slate-400 font-mono block uppercase font-bold tracking-wider">Mock JSON Response Body</label>
            <textarea
              value={editingEndpoint.responseBody}
              onChange={(e) => setEditingEndpoint({ ...editingEndpoint, responseBody: e.target.value })}
              className="w-full h-44 bg-slate-900 border border-slate-800 rounded-xl p-3 font-mono text-xs focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          <button
            onClick={handleSaveEndpointChanges}
            className={`px-5 py-2.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 self-start shadow ${t.btnPrimary}`}
          >
            <Check className="w-4 h-4" />
            Apply Changes to Active Mock
          </button>
        </div>
      </div>

      {/* Local Simulation Client sandbox */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Interactive Query Console */}
        <div className={`p-5 rounded-xl border ${t.border} bg-slate-900/10 space-y-4`}>
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-1.5">
            <Send className="w-4 h-4 text-indigo-400" />
            Interactive Client Sandbox
          </h3>

          <div className="flex gap-2">
            <select
              value={clientMethod}
              onChange={(e) => setClientMethod(e.target.value as any)}
              className="bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 font-mono text-xs focus:outline-none"
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="DELETE">DELETE</option>
              <option value="PATCH">PATCH</option>
            </select>
            <input
              type="text"
              value={clientPath}
              onChange={(e) => setClientPath(e.target.value)}
              placeholder="/api/v1/users"
              className={`flex-1 p-2.5 rounded-xl border font-mono text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 ${t.inputBg} ${t.border}`}
            />
            <button
              onClick={handleClientCall}
              disabled={clientLoading}
              className={`px-5 py-2 rounded-xl text-xs font-semibold flex items-center gap-1.5 shrink-0 ${t.btnPrimary}`}
            >
              <Play className="w-3.5 h-3.5" />
              {clientLoading ? 'Running...' : 'Send'}
            </button>
          </div>

          {['POST', 'PUT', 'PATCH'].includes(clientMethod) && (
            <div className="space-y-1.5">
              <label className="text-[10px] text-slate-500 font-mono block uppercase">Query Body</label>
              <textarea
                value={clientBody}
                onChange={(e) => setClientBody(e.target.value)}
                className="w-full h-24 bg-slate-900/60 border border-slate-900 rounded-lg p-2.5 font-mono text-xs focus:outline-none"
              />
            </div>
          )}

          {clientResult && (
            <div className="space-y-2 border-t border-slate-900 pt-3">
              <div className="flex justify-between text-xs font-mono">
                <div>
                  <span className="text-slate-500">Status: </span>
                  <span className={`font-bold ${clientResult.status >= 200 && clientResult.status < 300 ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {clientResult.status}
                  </span>
                </div>
                <span className="text-slate-500">{clientResult.time} ms</span>
              </div>
              <pre className="p-3 bg-slate-950 border border-slate-900 rounded-lg font-mono text-[11px] overflow-auto h-36 leading-relaxed">
                {clientResult.body}
              </pre>
            </div>
          )}
        </div>

        {/* Server Log Console */}
        <div className={`p-5 rounded-xl border ${t.border} bg-slate-900/20 flex flex-col h-[340px]`}>
          <div className="flex justify-between items-center border-b border-slate-900 pb-2 mb-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-300 font-mono flex items-center gap-1.5">
              <Terminal className="w-4 h-4 text-emerald-400" />
              Simulation Server Terminal Logger
            </h3>
            <button
              onClick={() => setLogs([])}
              className="text-[10px] text-slate-500 hover:text-indigo-400 font-mono uppercase tracking-wider"
            >
              Clear Logs
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-2 font-mono text-[10px] leading-relaxed">
            {logs.length > 0 ? (
              logs.map((log, idx) => (
                <div key={idx} className="flex gap-2 items-start py-1 text-slate-400">
                  <span className="text-slate-600 shrink-0">[{log.timestamp}]</span>
                  {log.method === 'SYSTEM' ? (
                    <span className="text-indigo-400 text-xs font-bold tracking-tight">{log.path}</span>
                  ) : (
                    <div className="flex flex-wrap gap-1 items-center">
                      <span className={`px-1 rounded font-bold ${
                        log.method === 'GET' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-indigo-500/20 text-indigo-400'
                      }`}>{log.method}</span>
                      <span className="text-slate-200 font-semibold">{log.path}</span>
                      <span className="text-slate-600">-</span>
                      <span className={log.status >= 200 && log.status < 300 ? 'text-emerald-400' : 'text-rose-400'}>
                        {log.status}
                      </span>
                      <span className="text-slate-600">-</span>
                      <span className="text-slate-500">{log.delay}ms</span>
                      <span className="text-slate-600">-</span>
                      <span className="text-slate-500">{log.size}B</span>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="flex items-center justify-center h-full text-slate-600">
                Listening for incoming simulation calls...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
