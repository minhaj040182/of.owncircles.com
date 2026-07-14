import React, { useState, useEffect } from 'react';
import { 
  Send, Plus, Trash2, Check, Copy, History, 
  HelpCircle, Globe, Play, Server, CornerDownRight, 
  Settings, CheckCircle, AlertCircle, RefreshCw,
  Terminal, BookOpen, Lock, Shield, Cpu, Trash,
  ChevronRight, ChevronDown, Download, Braces
} from 'lucide-react';
import { KeyValuePair, ApiResponse } from '../types';

interface GraphqlSavedRequest {
  id: string;
  name: string;
  endpoint: string;
  query: string;
  variables: string;
  headers: KeyValuePair[];
  timestamp: number;
}

const INITIAL_HEADERS: KeyValuePair[] = [
  { key: 'Content-Type', value: 'application/json', enabled: true },
  { key: 'Accept', value: 'application/json', enabled: true }
];

const TEMPLATES = [
  {
    name: 'Rick & Morty (Characters)',
    endpoint: 'https://rickandmortyapi.com/graphql',
    query: `query GetCharacters {
  characters(page: 1, filter: { name: "Rick" }) {
    info {
      count
      pages
    }
    results {
      id
      name
      status
      species
      gender
      image
    }
  }
}`,
    variables: '{}',
    headers: INITIAL_HEADERS
  },
  {
    name: 'Countries API (Info & Languages)',
    endpoint: 'https://countries.trevorblades.com/',
    query: `query GetCountryInfo($code: ID!) {
  country(code: $code) {
    name
    native
    capital
    emoji
    currency
    languages {
      code
      name
    }
  }
}`,
    variables: `{
  "code": "US"
}`,
    headers: INITIAL_HEADERS
  },
  {
    name: 'SpaceX Launches (Latest & Missions)',
    endpoint: 'https://spacex-production.up.railway.app/',
    query: `query GetSpaceXLaunches {
  launchesPast(limit: 3) {
    mission_name
    launch_date_local
    launch_site {
      site_name_long
    }
    rocket {
      rocket_name
      rocket_type
    }
    links {
      article_link
      video_link
    }
  }
}`,
    variables: '{}',
    headers: INITIAL_HEADERS
  },
  {
    name: 'Mock GraphQL Sandbox',
    endpoint: 'https://ownformatters.mock-endpoint/graphql',
    query: `query GetUserProfile($id: ID!) {
  user(id: $id) {
    id
    name
    username
    email
    phone
    website
    company {
      name
      catchPhrase
    }
    posts(limit: 2) {
      id
      title
      body
    }
  }
}`,
    variables: `{
  "id": "1"
}`,
    headers: INITIAL_HEADERS
  }
];

const HISTORIC_QUERIES: GraphqlSavedRequest[] = [
  {
    id: 'g1',
    name: 'Fetch Rick & Morty Statuses',
    endpoint: 'https://rickandmortyapi.com/graphql',
    query: `query {
  characters(page: 1) {
    results {
      name
      status
    }
  }
}`,
    variables: '{}',
    headers: INITIAL_HEADERS,
    timestamp: Date.now() - 60000 * 10
  }
];

const getAllCollapsiblePaths = (data: any, currentPath = 'root', paths: string[] = []): string[] => {
  if (data && typeof data === 'object') {
    paths.push(currentPath);
    if (Array.isArray(data)) {
      data.forEach((item, index) => {
        getAllCollapsiblePaths(item, `${currentPath}.${index}`, paths);
      });
    } else {
      Object.entries(data).forEach(([key, value]) => {
        getAllCollapsiblePaths(value, `${currentPath}.${key}`, paths);
      });
    }
  }
  return paths;
};

// Simple GraphQL prettifier function
const formatGraphQLQuery = (query: string): string => {
  let cleaned = query
    .replace(/#.*$/gm, '') // Remove comments
    .replace(/\s+/g, ' ')   // Normalize whitespace
    .replace(/\s*\{\s*/g, ' { ')
    .replace(/\s*\}\s*/g, ' } ')
    .trim();

  let formatted = '';
  let indent = 0;
  const tokens = cleaned.split(/({|})/);

  tokens.forEach(token => {
    token = token.trim();
    if (!token) return;

    if (token === '{') {
      formatted += ' {\n' + '  '.repeat(indent + 1);
      indent++;
    } else if (token === '}') {
      indent = Math.max(0, indent - 1);
      formatted = formatted.trimEnd() + '\n' + '  '.repeat(indent) + '}\n' + '  '.repeat(indent);
    } else {
      // Split on space and group properties nicely
      const parts = token.split(/\s+/);
      let line = '';
      parts.forEach(part => {
        if (!part) return;
        if (part.endsWith('(') || part.startsWith(')') || part.includes(':')) {
          line += part + ' ';
        } else {
          // New field item
          if (line) {
            formatted += line.trim() + '\n' + '  '.repeat(indent);
            line = '';
          }
          formatted += part + '\n' + '  '.repeat(indent);
        }
      });
      if (line) {
        formatted += line.trim();
      }
    }
  });

  return formatted.replace(/\n\s*\n/g, '\n').trim();
};

interface JsonNodeProps {
  name?: string;
  value: any;
  path: string;
  collapsedPaths: Record<string, boolean>;
  onToggle: (path: string) => void;
  isLight: boolean;
  textMutedClass: string;
}

const JsonNode: React.FC<JsonNodeProps> = ({
  name,
  value,
  path,
  collapsedPaths,
  onToggle,
  isLight,
  textMutedClass
}) => {
  const isCollapsed = !!collapsedPaths[path];
  
  if (value === null) {
    return (
      <div className="pl-4 py-0.5 font-mono text-xs flex items-baseline gap-1">
        {name && <span className={isLight ? 'text-slate-600 font-semibold' : 'text-slate-400 font-semibold'}>"{name}":</span>}
        <span className="text-slate-500 font-bold">null</span>
      </div>
    );
  }

  if (typeof value === 'boolean') {
    return (
      <div className="pl-4 py-0.5 font-mono text-xs flex items-baseline gap-1">
        {name && <span className={isLight ? 'text-slate-600 font-semibold' : 'text-slate-400 font-semibold'}>"{name}":</span>}
        <span className={isLight ? 'text-amber-600 font-bold' : 'text-amber-400 font-bold'}>{value ? 'true' : 'false'}</span>
      </div>
    );
  }

  if (typeof value === 'number') {
    return (
      <div className="pl-4 py-0.5 font-mono text-xs flex items-baseline gap-1">
        {name && <span className={isLight ? 'text-slate-600 font-semibold' : 'text-slate-400 font-semibold'}>"{name}":</span>}
        <span className={isLight ? 'text-cyan-600 font-bold' : 'text-cyan-400 font-bold'}>{value}</span>
      </div>
    );
  }

  if (typeof value === 'string') {
    return (
      <div className="pl-4 py-0.5 font-mono text-xs flex items-baseline gap-1 break-all">
        {name && <span className={isLight ? 'text-slate-600 font-semibold' : 'text-slate-400 font-semibold'}>"{name}":</span>}
        <span className={isLight ? 'text-emerald-700' : 'text-emerald-400'}>"{value}"</span>
      </div>
    );
  }

  if (Array.isArray(value)) {
    const isEmpty = value.length === 0;
    return (
      <div className="pl-4 py-0.5 font-mono text-xs">
        <div className="flex items-center gap-1">
          {!isEmpty && (
            <button 
              onClick={() => onToggle(path)} 
              className="p-0.5 rounded hover:bg-slate-850 transition-colors cursor-pointer flex items-center justify-center border-0 bg-transparent"
            >
              {isCollapsed ? (
                <ChevronRight className="w-3.5 h-3.5 text-indigo-400" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-indigo-400" />
              )}
            </button>
          )}
          {name && <span className={isLight ? 'text-slate-600 font-semibold' : 'text-slate-400 font-semibold'}>"{name}":</span>}
          <span className="text-slate-500 font-bold">
            Array[{value.length}] {isEmpty ? '[]' : '['}
          </span>
        </div>
        {!isCollapsed && !isEmpty && (
          <div className="pl-3 border-l border-indigo-500/20 ml-2 mt-0.5 space-y-0.5">
            {value.map((item, index) => (
              <JsonNode
                key={index}
                name={String(index)}
                value={item}
                path={`${path}.${index}`}
                collapsedPaths={collapsedPaths}
                onToggle={onToggle}
                isLight={isLight}
                textMutedClass={textMutedClass}
              />
            ))}
          </div>
        )}
        {!isCollapsed && !isEmpty && (
          <div className="pl-4 text-slate-500 font-bold">]</div>
        )}
      </div>
    );
  }

  if (typeof value === 'object') {
    const keys = Object.keys(value);
    const isEmpty = keys.length === 0;
    return (
      <div className="pl-4 py-0.5 font-mono text-xs">
        <div className="flex items-center gap-1">
          {!isEmpty && (
            <button 
              onClick={() => onToggle(path)} 
              className="p-0.5 rounded hover:bg-slate-850 transition-colors cursor-pointer flex items-center justify-center border-0 bg-transparent"
            >
              {isCollapsed ? (
                <ChevronRight className="w-3.5 h-3.5 text-indigo-400" />
              ) : (
                <ChevronDown className="w-3.5 h-3.5 text-indigo-400" />
              )}
            </button>
          )}
          {name && <span className={isLight ? 'text-slate-600 font-semibold' : 'text-slate-400 font-semibold'}>"{name}":</span>}
          <span className="text-slate-500 font-bold">
            Object {isEmpty ? '{}' : '{'}
          </span>
        </div>
        {!isCollapsed && !isEmpty && (
          <div className="pl-3 border-l border-indigo-500/20 ml-2 mt-0.5 space-y-0.5">
            {keys.map(key => (
              <JsonNode
                key={key}
                name={key}
                value={value[key]}
                path={`${path}.${key}`}
                collapsedPaths={collapsedPaths}
                onToggle={onToggle}
                isLight={isLight}
                textMutedClass={textMutedClass}
              />
            ))}
          </div>
        )}
        {!isCollapsed && !isEmpty && (
          <div className="pl-4 text-slate-500 font-bold">{"}"}</div>
        )}
      </div>
    );
  }

  return null;
};

interface GraphqlToolProps {
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

export default function GraphqlTool({ theme }: GraphqlToolProps) {
  const isLight = theme?.id === 'light';
  
  // States
  const [endpoint, setEndpoint] = useState<string>('https://countries.trevorblades.com/');
  const [query, setQuery] = useState<string>(TEMPLATES[1].query);
  const [variables, setVariables] = useState<string>(TEMPLATES[1].variables);
  const [headers, setHeaders] = useState<KeyValuePair[]>(INITIAL_HEADERS);
  const [history, setHistory] = useState<GraphqlSavedRequest[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [activeTab, setActiveTab] = useState<'query' | 'variables' | 'headers'>('query');
  const [corsMode, setCorsMode] = useState<'direct' | 'proxy-simulation'>('proxy-simulation');
  const [saveQueryName, setSaveQueryName] = useState<string>('');
  const [queryError, setQueryError] = useState<string | null>(null);
  const [variablesError, setVariablesError] = useState<string | null>(null);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  
  // Response features
  const [responseViewMode, setResponseViewMode] = useState<'raw' | 'tree'>('tree');
  const [collapsedPaths, setCollapsedPaths] = useState<Record<string, boolean>>({});
  const [copied, setCopied] = useState<boolean>(false);

  // Dynamic values based on theme
  const borderClass = theme?.border || 'border-slate-800/80';
  const panelBgClass = theme?.panelBg || 'bg-slate-900';
  const inputBgClass = theme?.inputBg || 'bg-slate-950';
  const canvasBgClass = theme?.canvasBg || 'bg-[#02050c]';
  const textMutedClass = theme?.textMuted || 'text-slate-400';

  useEffect(() => {
    // Load local history
    const saved = localStorage.getItem('ownformatters-graphql-history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        setHistory(HISTORIC_QUERIES);
      }
    } else {
      setHistory(HISTORIC_QUERIES);
      localStorage.setItem('ownformatters-graphql-history', JSON.stringify(HISTORIC_QUERIES));
    }
  }, []);

  const saveHistory = (items: GraphqlSavedRequest[]) => {
    setHistory(items);
    localStorage.setItem('ownformatters-graphql-history', JSON.stringify(items));
  };

  const showNotification = (message: string, type: 'success' | 'error' | 'info' = 'info') => {
    setNotification({ message, type });
    setTimeout(() => {
      setNotification(null);
    }, 4000);
  };

  const handlePrettifyQuery = () => {
    if (!query.trim()) return;
    try {
      const prettified = formatGraphQLQuery(query);
      setQuery(prettified);
      setQueryError(null);
      showNotification('GraphQL query formatted successfully!', 'success');
    } catch (e: any) {
      setQueryError('Formatting Error: ' + e.message);
    }
  };

  const handlePrettifyVariables = () => {
    if (!variables.trim()) return;
    try {
      const parsed = JSON.parse(variables);
      setVariables(JSON.stringify(parsed, null, 2));
      setVariablesError(null);
      showNotification('Variables JSON formatted successfully!', 'success');
    } catch (e: any) {
      setVariablesError('Invalid JSON structure: ' + e.message);
    }
  };

  const handleLoadTemplate = (tpl: typeof TEMPLATES[0]) => {
    setEndpoint(tpl.endpoint);
    setQuery(tpl.query);
    setVariables(tpl.variables);
    setHeaders(tpl.headers);
    showNotification(`Loaded template: ${tpl.name}`, 'info');
  };

  const handleExecute = async () => {
    if (!endpoint.trim()) {
      showNotification('Endpoint URL is required', 'error');
      return;
    }

    // Validate variables JSON
    let parsedVars = {};
    if (variables.trim()) {
      try {
        parsedVars = JSON.parse(variables);
        setVariablesError(null);
      } catch (e: any) {
        setVariablesError('Variables must be a valid JSON object: ' + e.message);
        showNotification('JSON variables syntax error', 'error');
        return;
      }
    }

    setLoading(true);
    setResponse(null);
    setCollapsedPaths({});

    const startTime = performance.now();
    
    // Header conversion
    const reqHeaders: Record<string, string> = {};
    headers.forEach(h => {
      if (h.enabled && h.key.trim() && h.value.trim()) {
        reqHeaders[h.key.trim()] = h.value.trim();
      }
    });

    if (corsMode === 'proxy-simulation' || endpoint.includes('mock-endpoint')) {
      // Simulate high-fidelity GraphQL API Response
      setTimeout(() => {
        const duration = Math.round(performance.now() - startTime + 120);
        let simBody = '';
        
        const lowerQuery = query.toLowerCase();
        
        if (lowerQuery.includes('country') || lowerQuery.includes('countries')) {
          let codeVal = "US";
          try {
            const parsed = JSON.parse(variables);
            if (parsed.code) codeVal = String(parsed.code).toUpperCase();
          } catch (_) {}

          const countryMockData: Record<string, any> = {
            US: { name: "United States", native: "United States", capital: "Washington D.C.", emoji: "🇺🇸", currency: "USD", languages: [{ code: "en", name: "English" }] },
            IN: { name: "India", native: "भारत", capital: "New Delhi", emoji: "🇮🇳", currency: "INR", languages: [{ code: "hi", name: "Hindi" }, { code: "en", name: "English" }] },
            DE: { name: "Germany", native: "Deutschland", capital: "Berlin", emoji: "🇩🇪", currency: "EUR", languages: [{ code: "de", name: "German" }] },
            FR: { name: "France", native: "France", capital: "Paris", emoji: "🇫🇷", currency: "EUR", languages: [{ code: "fr", name: "French" }] },
            GB: { name: "United Kingdom", native: "United Kingdom", capital: "London", emoji: "🇬🇧", currency: "GBP", languages: [{ code: "en", name: "English" }] },
            JP: { name: "Japan", native: "日本", capital: "Tokyo", emoji: "🇯🇵", currency: "JPY", languages: [{ code: "ja", name: "Japanese" }] }
          };

          const selectedCountry = countryMockData[codeVal] || countryMockData.US;

          simBody = JSON.stringify({
            data: {
              country: selectedCountry
            }
          }, null, 2);
        } else if (lowerQuery.includes('characters') || lowerQuery.includes('character')) {
          simBody = JSON.stringify({
            data: {
              characters: {
                info: { count: 826, pages: 42 },
                results: [
                  { id: "1", name: "Rick Sanchez", status: "Alive", species: "Human", gender: "Male", image: "https://rickandmortyapi.com/api/character/avatar/1.jpeg" },
                  { id: "2", name: "Morty Smith", status: "Alive", species: "Human", gender: "Male", image: "https://rickandmortyapi.com/api/character/avatar/2.jpeg" },
                  { id: "3", name: "Summer Smith", status: "Alive", species: "Human", gender: "Female", image: "https://rickandmortyapi.com/api/character/avatar/3.jpeg" }
                ]
              }
            }
          }, null, 2);
        } else if (lowerQuery.includes('user') || lowerQuery.includes('profile')) {
          let idVal = "1";
          try {
            const parsed = JSON.parse(variables);
            if (parsed.id) idVal = String(parsed.id);
          } catch (_) {}

          simBody = JSON.stringify({
            data: {
              user: {
                id: idVal,
                name: "Leanne Graham",
                username: "Bret",
                email: "Sincere@april.biz",
                phone: "1-770-736-8031 x56442",
                website: "hildegard.org",
                company: {
                  name: "Romaguera-Crona",
                  catchPhrase: "Multi-layered client-server neural-net"
                },
                posts: [
                  { id: "1", title: "sunt aut facere repellat provident occaecati excepturi optio reprehenderit", body: "quia et suscipit\nsuscipit recusandae consequuntur expedita et cum\nreprehenderit molestiae ut ut quas totam\nnostrum rerum est autem sunt rem eveniet architecto" },
                  { id: "2", title: "qui est esse", body: "est rerum tempore vitae\nsequi sint nihil reprehenderit dolor beatae ea dolores neque\nfugiat blanditiis voluptate porro vel nihil molestiae ut reiciendis\nqui aperiam non debitis possimus qui neque nisi nulla" }
                ]
              }
            }
          }, null, 2);
        } else {
          // Fallback generic response
          simBody = JSON.stringify({
            data: {
              sandboxExecution: {
                status: "Success",
                info: "Executed query successfully in isolated sandbox environment",
                timestamp: new Date().toISOString(),
                endpoint: endpoint,
                queryLinesCount: query.trim().split('\n').length
              }
            }
          }, null, 2);
        }

        setResponse({
          status: 200,
          statusText: 'OK',
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'X-Powered-By': 'OwnFormatters GraphQL Engine',
            'Access-Control-Allow-Origin': '*'
          },
          body: simBody,
          timeMs: duration,
          sizeBytes: simBody.length
        });
        setLoading(false);
      }, 700);
      return;
    }

    try {
      const payload = {
        query,
        variables: parsedVars
      };

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...reqHeaders
        },
        body: JSON.stringify(payload)
      });

      const text = await res.text();
      const endTime = performance.now();
      const duration = Math.round(endTime - startTime);

      const resHeaders: Record<string, string> = {};
      res.headers.forEach((v, k) => {
        resHeaders[k] = v;
      });

      let formattedBody = text;
      try {
        const json = JSON.parse(text);
        formattedBody = JSON.stringify(json, null, 2);
      } catch (e) {}

      setResponse({
        status: res.status,
        statusText: res.statusText,
        headers: resHeaders,
        body: formattedBody,
        timeMs: duration,
        sizeBytes: text.length
      });
    } catch (err: any) {
      const endTime = performance.now();
      setResponse({
        status: 0,
        statusText: 'CORS or Connection Error',
        headers: {},
        body: '',
        timeMs: Math.round(endTime - startTime),
        sizeBytes: 0,
        error: err.message || 'The GraphQL request was blocked. This is highly common with client-side GraphQL queries due to browser security restrictions (CORS). Try toggling the "Proxy Bypass Simulation" toggle above to experience seamless GraphQL sandbox debugging!'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveQuery = () => {
    if (!saveQueryName.trim()) {
      showNotification('Enter a name for the query history log', 'error');
      return;
    }

    const newSaved: GraphqlSavedRequest = {
      id: 'g' + Date.now(),
      name: saveQueryName.trim(),
      endpoint,
      query,
      variables,
      headers: [...headers],
      timestamp: Date.now()
    };

    const updated = [newSaved, ...history];
    saveHistory(updated);
    setSaveQueryName('');
    showNotification('GraphQL request saved in history!', 'success');
  };

  const handleDeleteHistory = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const filtered = history.filter(h => h.id !== id);
    saveHistory(filtered);
    showNotification('History query deleted', 'info');
  };

  const handleLoadHistory = (item: GraphqlSavedRequest) => {
    setEndpoint(item.endpoint);
    setQuery(item.query);
    setVariables(item.variables);
    setHeaders(item.headers);
    showNotification(`Loaded historical item: ${item.name}`, 'info');
  };

  const addHeader = () => {
    setHeaders([...headers, { key: '', value: '', enabled: true }]);
  };

  const updateHeader = (index: number, field: 'key' | 'value' | 'enabled', val: any) => {
    const updated = [...headers];
    if (field === 'enabled') {
      updated[index].enabled = val;
    } else {
      updated[index][field] = val;
    }
    setHeaders(updated);
  };

  const deleteHeader = (index: number) => {
    setHeaders(headers.filter((_, i) => i !== index));
  };

  const handleCopyResponse = () => {
    if (!response || !response.body) return;
    try {
      navigator.clipboard.writeText(response.body);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      showNotification('Copied response payload to clipboard!', 'success');
    } catch (e) {}
  };

  const handleDownloadResponse = () => {
    if (!response || !response.body) return;
    try {
      const blob = new Blob([response.body], { type: 'application/json' });
      const urlBlob = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = urlBlob;
      a.download = `graphql_response_${Date.now()}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(urlBlob);
      showNotification('Response payload file downloaded successfully!', 'success');
    } catch (err: any) {
      showNotification('Failed to download: ' + err.message, 'error');
    }
  };

  const handleTogglePath = (path: string) => {
    setCollapsedPaths(prev => ({ ...prev, [path]: !prev[path] }));
  };

  const handleExpandAll = () => {
    setCollapsedPaths({});
    showNotification('All interactive tree nodes expanded', 'info');
  };

  const handleCollapseAll = () => {
    if (!response || !response.body) return;
    try {
      const parsed = JSON.parse(response.body);
      const paths = getAllCollapsiblePaths(parsed);
      const collapsedMap: Record<string, boolean> = {};
      paths.forEach(p => { collapsedMap[p] = true; });
      setCollapsedPaths(collapsedMap);
      showNotification('All interactive tree nodes collapsed', 'info');
    } catch (e) {}
  };

  const generateCurlCommand = (): string => {
    let curl = `curl -X POST "${endpoint}" \\\n  -H "Content-Type: application/json"`;
    
    headers.forEach(h => {
      if (h.enabled && h.key.trim() && h.value.trim() && h.key.toLowerCase() !== 'content-type') {
        curl += ` \\\n  -H "${h.key.trim()}: ${h.value.trim().replace(/"/g, '\\"')}"`;
      }
    });

    let varsObj = {};
    try {
      varsObj = JSON.parse(variables);
    } catch (e) {}

    const payload = {
      query,
      variables: varsObj
    };

    const payloadStr = JSON.stringify(payload);
    curl += ` \\\n  -d '${payloadStr.replace(/'/g, "'\\''")}'`;

    return curl;
  };

  const handleCopyAsCurl = () => {
    try {
      const curlCmd = generateCurlCommand();
      navigator.clipboard.writeText(curlCmd);
      showNotification('GraphQL cURL command copied to clipboard!', 'success');
    } catch (err: any) {
      showNotification('Failed to copy cURL: ' + err.message, 'error');
    }
  };

  return (
    <div className="space-y-6">
      {/* NOTIFICATION TOAST */}
      {notification && (
        <div className={`fixed bottom-6 right-6 z-50 p-4 rounded-xl shadow-2xl flex items-center gap-3 border transition-all animate-bounce ${
          notification.type === 'success' 
            ? 'bg-emerald-950/90 text-emerald-300 border-emerald-900' 
            : notification.type === 'error'
            ? 'bg-rose-950/90 text-rose-300 border-rose-900'
            : 'bg-indigo-950/90 text-indigo-300 border-indigo-900'
        }`}>
          {notification.type === 'success' ? (
            <CheckCircle className="w-5 h-5 flex-shrink-0 text-emerald-400" />
          ) : notification.type === 'error' ? (
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400" />
          ) : (
            <HelpCircle className="w-5 h-5 flex-shrink-0 text-indigo-400" />
          )}
          <span className="text-xs font-semibold">{notification.message}</span>
        </div>
      )}

      {/* COMPACT HELP DESK BANNER */}
      <div className={`p-4 rounded-2xl border flex items-start gap-3.5 ${panelBgClass} ${borderClass}`}>
        <Braces className="w-5 h-5 text-indigo-400 mt-0.5 flex-shrink-0" />
        <div className="space-y-1">
          <span className="text-xs font-bold block">GraphQL API Playground Sandbox</span>
          <p className={`text-[11px] leading-relaxed ${textMutedClass}`}>
            Create schema-valid query mutations, configure authorization headers, pass custom JSON query variables, format messy syntax, and examine real-time nested tree responses with auto-collapsible nodes.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN: EDITOR SUITE & HEADERS (2/3 width) */}
        <div className="xl:col-span-2 space-y-6">
          
          {/* ENDPOINT ADRESS BAR */}
          <div className={`p-4 rounded-2xl border ${panelBgClass} ${borderClass} space-y-3.5 shadow-md`}>
            
            <div className="flex items-center justify-between gap-4 flex-wrap">
              <label className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1">
                <Globe className="w-3.5 h-3.5" />
                GraphQL Gateway Endpoint URL
              </label>
              
              <div className="flex items-center gap-2">
                <span className={`text-[10px] font-mono font-semibold ${textMutedClass}`}>Bypass CORS:</span>
                <button
                  type="button"
                  onClick={() => setCorsMode(corsMode === 'direct' ? 'proxy-simulation' : 'direct')}
                  className={`px-2 py-1 rounded font-mono text-[10px] font-bold border transition-all cursor-pointer ${
                    corsMode === 'proxy-simulation'
                      ? 'bg-indigo-950/50 border-indigo-550 text-indigo-400'
                      : 'bg-slate-950/50 border-slate-900 text-slate-500 hover:text-slate-400'
                  }`}
                  title="Switch between browser direct connection and offline simulation mode to bypass sandbox CORS walls"
                >
                  {corsMode === 'proxy-simulation' ? 'SIMULATOR ACTIVE' : 'DIRECT CONNECTION'}
                </button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className={`px-3.5 py-3 rounded-xl border text-[11px] font-mono font-bold font-extrabold ${
                isLight ? 'bg-slate-100 border-slate-200 text-slate-800' : 'bg-slate-950 border-slate-850 text-slate-300'
              }`}>
                POST
              </span>
              <input
                type="text"
                placeholder="https://your-graphql-gateway.com/graphql"
                className={`flex-1 ${inputBgClass} border ${borderClass} rounded-xl px-3.5 py-2.5 text-xs font-mono focus:outline-none focus:border-indigo-500 transition-colors placeholder:text-slate-500`}
                value={endpoint}
                onChange={(e) => setEndpoint(e.target.value)}
              />
              <button
                onClick={handleExecute}
                disabled={loading}
                className={`px-4.5 py-3 rounded-xl font-bold text-xs flex items-center gap-1.5 transition-all cursor-pointer ${
                  loading 
                    ? 'bg-indigo-600/50 text-white/50 cursor-not-allowed' 
                    : (theme?.btnPrimary || 'bg-indigo-600 text-white hover:bg-indigo-500 shadow-md')
                }`}
              >
                {loading ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Play className="w-3.5 h-3.5 fill-white" />}
                <span>{loading ? 'Sending...' : 'Execute'}</span>
              </button>
            </div>
          </div>

          {/* EDITORS NOTEBOOK (TABS) */}
          <div className={`border rounded-2xl overflow-hidden flex flex-col h-[460px] ${inputBgClass} ${borderClass} shadow-lg`}>
            
            {/* TABS SELECTOR ROW */}
            <div className={`px-4 border-b flex items-center justify-between ${panelBgClass} ${borderClass}`}>
              <div className="flex items-center gap-1.5 overflow-x-auto py-2">
                <button
                  onClick={() => setActiveTab('query')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'query'
                      ? (isLight ? 'bg-indigo-50 text-indigo-700' : 'bg-indigo-950/40 text-indigo-400')
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  GraphQL Query Body
                </button>
                <button
                  onClick={() => setActiveTab('variables')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'variables'
                      ? (isLight ? 'bg-indigo-50 text-indigo-700' : 'bg-indigo-950/40 text-indigo-400')
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Variables (JSON)
                </button>
                <button
                  onClick={() => setActiveTab('headers')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeTab === 'headers'
                      ? (isLight ? 'bg-indigo-50 text-indigo-700' : 'bg-indigo-950/40 text-indigo-400')
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Headers ({headers.filter(h => h.enabled).length})
                </button>
              </div>

              {/* ACTION PRETTIFIERS BASED ON ACTIVE TAB */}
              {activeTab === 'query' && (
                <button
                  onClick={handlePrettifyQuery}
                  className={`px-2 py-1 rounded text-[10px] font-bold border transition-colors cursor-pointer ${
                    isLight ? 'bg-white hover:bg-slate-50 border-slate-250 text-slate-700' : 'bg-slate-900 hover:bg-slate-850 border-slate-850 text-slate-300'
                  }`}
                >
                  Prettify Query
                </button>
              )}
              {activeTab === 'variables' && (
                <button
                  onClick={handlePrettifyVariables}
                  className={`px-2 py-1 rounded text-[10px] font-bold border transition-colors cursor-pointer ${
                    isLight ? 'bg-white hover:bg-slate-50 border-slate-250 text-slate-700' : 'bg-slate-900 hover:bg-slate-850 border-slate-850 text-slate-300'
                  }`}
                >
                  Format JSON
                </button>
              )}
            </div>

            {/* TAB PANELS BODY */}
            <div className="flex-1 p-4 overflow-y-auto min-h-0">
              
              {/* TAB 1: GRAPHQL QUERY */}
              {activeTab === 'query' && (
                <div className="h-full flex flex-col relative space-y-1.5">
                  <div className="flex justify-between items-center text-[10px] font-mono">
                    <span className={textMutedClass}>Write GraphQL operation body (queries, mutations, fragments):</span>
                    {queryError && <span className="text-red-500 font-bold">{queryError}</span>}
                  </div>
                  <textarea
                    className={`flex-1 w-full h-full ${canvasBgClass} border ${borderClass} rounded-xl p-3.5 font-mono text-xs focus:outline-none focus:border-indigo-500 resize-none whitespace-pre leading-relaxed ${
                      isLight ? 'text-slate-900' : 'text-slate-200'
                    }`}
                    placeholder={`query GetUserProfile {\n  user(id: "1") {\n    name\n    email\n  }\n}`}
                    value={query}
                    onChange={(e) => {
                      setQuery(e.target.value);
                      setQueryError(null);
                    }}
                  />
                </div>
              )}

              {/* TAB 2: VARIABLES */}
              {activeTab === 'variables' && (
                <div className="h-full flex flex-col relative space-y-1.5">
                  <div className="flex justify-between items-center text-[10px] font-mono">
                    <span className={textMutedClass}>Dynamic parameters dictionary object:</span>
                    {variablesError ? (
                      <span className="text-red-400 font-bold">{variablesError}</span>
                    ) : (
                      <span className="text-slate-500 font-bold">Must be a valid stringified JSON</span>
                    )}
                  </div>
                  <textarea
                    className={`flex-1 w-full h-full ${canvasBgClass} border ${borderClass} rounded-xl p-3.5 font-mono text-xs focus:outline-none focus:border-indigo-500 resize-none leading-relaxed ${
                      isLight ? 'text-slate-900' : 'text-slate-200'
                    }`}
                    placeholder={`{\n  "id": "1",\n  "limit": 5\n}`}
                    value={variables}
                    onChange={(e) => {
                      setVariables(e.target.value);
                      setVariablesError(null);
                    }}
                  />
                </div>
              )}

              {/* TAB 3: CUSTOM HEADERS */}
              {activeTab === 'headers' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className={`text-[10px] font-mono uppercase tracking-wider block ${textMutedClass}`}>GraphQL Gateway Client Headers</span>
                    <button
                      onClick={addHeader}
                      className="px-2.5 py-1.5 bg-indigo-600/10 hover:bg-indigo-600/20 text-indigo-400 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer border-0"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Add Header
                    </button>
                  </div>

                  {headers.length === 0 ? (
                    <div className="text-center py-10 font-mono text-xs text-slate-500 border border-dashed rounded-xl">
                      No custom HTTP gateway headers configured.
                    </div>
                  ) : (
                    <div className="space-y-2 max-h-[300px] overflow-y-auto">
                      {headers.map((hdr, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            checked={hdr.enabled}
                            onChange={(e) => updateHeader(index, 'enabled', e.target.checked)}
                            className="rounded accent-indigo-500 border-slate-800 bg-slate-950 text-indigo-600 w-4 h-4 cursor-pointer"
                          />
                          <input
                            type="text"
                            placeholder="Header Key"
                            className={`flex-1 ${inputBgClass} border ${borderClass} rounded-lg px-2.5 py-1.5 text-xs font-mono focus:outline-none focus:border-indigo-500 transition-colors`}
                            value={hdr.key}
                            onChange={(e) => updateHeader(index, 'key', e.target.value)}
                          />
                          <span className="text-slate-500 font-mono text-xs">:</span>
                          <input
                            type="text"
                            placeholder="Header Value"
                            className={`flex-1 ${inputBgClass} border ${borderClass} rounded-lg px-2.5 py-1.5 text-xs font-mono focus:outline-none focus:border-indigo-500 transition-colors`}
                            value={hdr.value}
                            onChange={(e) => updateHeader(index, 'value', e.target.value)}
                          />
                          <button
                            onClick={() => deleteHeader(index)}
                            className="p-1.5 text-slate-500 hover:text-red-400 rounded-lg transition-colors border-0 bg-transparent cursor-pointer"
                            title="Delete Row"
                          >
                            <Trash className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>

          {/* RESPONSE OUTPUT CONSOLE */}
          <div className={`border rounded-2xl overflow-hidden flex flex-col h-[420px] ${inputBgClass} ${borderClass} shadow-xl`}>
            
            {/* RESPONSE CONTROL BAR */}
            <div className={`px-4 py-3 border-b flex items-center justify-between gap-4 flex-wrap sm:flex-nowrap ${panelBgClass} ${borderClass}`}>
              <span className={`text-xs font-semibold font-mono whitespace-nowrap ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>GraphQL Response Node</span>
              
              {response && response.status > 0 && (() => {
                const isJson = (() => {
                  try {
                    JSON.parse(response.body);
                    return true;
                  } catch (_) {
                    return false;
                  }
                })();

                return (
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {/* Raw vs Tree JSON Toggle */}
                    {isJson && (
                      <div className={`flex items-center p-0.5 rounded-lg border ${isLight ? 'bg-slate-100 border-slate-250' : 'bg-slate-950 border-slate-850'}`}>
                        <button
                          onClick={() => setResponseViewMode('tree')}
                          className={`px-2 py-1 rounded text-[10px] font-bold transition-all cursor-pointer border-0 ${
                            responseViewMode === 'tree'
                              ? (isLight ? 'bg-white text-indigo-600 shadow-sm' : 'bg-slate-850 text-indigo-400 font-extrabold shadow-sm')
                              : (isLight ? 'text-slate-500 hover:text-slate-800' : 'text-slate-400 hover:text-slate-200')
                          }`}
                        >
                          Tree View
                        </button>
                        <button
                          onClick={() => setResponseViewMode('raw')}
                          className={`px-2 py-1 rounded text-[10px] font-bold transition-all cursor-pointer border-0 ${
                            responseViewMode === 'raw'
                              ? (isLight ? 'bg-white text-indigo-600 shadow-sm' : 'bg-slate-850 text-indigo-400 font-extrabold shadow-sm')
                              : (isLight ? 'text-slate-500 hover:text-slate-800' : 'text-slate-400 hover:text-slate-200')
                          }`}
                        >
                          Raw View
                        </button>
                      </div>
                    )}

                    {/* Nodes collapse triggers */}
                    {isJson && responseViewMode === 'tree' && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={handleExpandAll}
                          className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                            isLight
                              ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                              : 'bg-slate-950 hover:bg-slate-900 border-slate-850 text-slate-300'
                          }`}
                        >
                          Expand All
                        </button>
                        <button
                          onClick={handleCollapseAll}
                          className={`px-2 py-1 rounded-lg text-[10px] font-bold border transition-all cursor-pointer ${
                            isLight
                              ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                              : 'bg-slate-950 hover:bg-slate-900 border-slate-850 text-slate-300'
                          }`}
                        >
                          Collapse All
                        </button>
                      </div>
                    )}

                    {/* cURL Generation */}
                    <button
                      onClick={handleCopyAsCurl}
                      title="Copy GraphQL query as cURL"
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 border cursor-pointer ${
                        isLight 
                          ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800' 
                          : 'bg-slate-950 hover:bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
                      }`}
                    >
                      <Terminal className="w-3.5 h-3.5" />
                      cURL
                    </button>

                    {/* Download JSON payload */}
                    <button
                      onClick={handleDownloadResponse}
                      title="Download JSON Payload"
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 border cursor-pointer ${
                        isLight 
                          ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800' 
                          : 'bg-slate-950 hover:bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
                      }`}
                    >
                      <Download className="w-3.5 h-3.5" />
                      Download
                    </button>

                    {/* Copy text block */}
                    <button
                      onClick={handleCopyResponse}
                      title="Copy JSON block to clipboard"
                      className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 border cursor-pointer ${
                        isLight 
                          ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800' 
                          : 'bg-slate-950 hover:bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
                      }`}
                    >
                      {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      {copied ? 'Copied' : 'Copy'}
                    </button>
                  </div>
                );
              })()}
            </div>

            {/* RESPONSE WORKSPACE */}
            <div className={`flex-1 overflow-auto p-4 relative ${canvasBgClass}`}>
              
              {!response ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-3 font-mono text-xs text-slate-500">
                  <Cpu className="w-8 h-8 text-slate-650 animate-pulse" />
                  <span>Execute a GraphQL query request to view structured response nodes here.</span>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* METRIC BADGES CARD */}
                  <div className={`p-3 border rounded-xl flex items-center justify-between flex-wrap gap-3 ${
                    isLight ? 'bg-slate-50 border-slate-200 text-slate-800' : 'bg-slate-950 border-slate-900 text-slate-200'
                  }`}>
                    <div className="flex items-center gap-3">
                      <span className={`px-2.5 py-1 text-[11px] font-bold rounded-lg font-mono flex items-center gap-1 ${
                        response.status >= 200 && response.status < 300
                          ? 'bg-emerald-950/40 text-emerald-400 border border-emerald-900/60'
                          : 'bg-rose-950/40 text-rose-400 border border-rose-900/60'
                      }`}>
                        STATUS: {response.status || 'ERROR'} {response.statusText}
                      </span>
                      <span className={`px-2.5 py-1 text-[11px] font-bold rounded-lg font-mono border ${theme?.badgeBg}`}>
                        TIME: {response.timeMs}ms
                      </span>
                      <span className={`px-2.5 py-1 text-[11px] font-bold rounded-lg font-mono border ${theme?.badgeBg}`}>
                        SIZE: {(response.sizeBytes / 1024).toFixed(2)} KB
                      </span>
                    </div>
                  </div>

                  {/* BLOCKING CORS / NETWORK ERROR ALERTS */}
                  {response.error && (
                    <div className="p-4 border border-rose-900/40 bg-rose-950/10 text-rose-300 rounded-xl space-y-2">
                      <div className="flex items-center gap-2 font-bold text-xs">
                        <AlertCircle className="w-4 h-4 text-rose-400" />
                        <span>GraphQL Request Failed</span>
                      </div>
                      <p className="text-[11px] leading-relaxed font-mono whitespace-pre-wrap">{response.error}</p>
                    </div>
                  )}

                  {/* RESPONSE RENDERER BODY */}
                  {response.body && (() => {
                    const isJson = (() => {
                      try {
                        JSON.parse(response.body);
                        return true;
                      } catch (_) {
                        return false;
                      }
                    })();

                    return (
                      <div className="space-y-1.5">
                        <span className={`text-[10px] font-mono uppercase block ${textMutedClass}`}>
                          Response Payload ({isJson && responseViewMode === 'tree' ? 'Interactive Tree' : 'Raw Text'}):
                        </span>

                        {isJson && responseViewMode === 'tree' ? (
                          <div className={`p-4 border rounded-xl overflow-x-auto ${
                            isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-900'
                          }`}>
                            {(() => {
                              try {
                                const parsed = JSON.parse(response.body);
                                return (
                                  <JsonNode
                                    value={parsed}
                                    path="root"
                                    collapsedPaths={collapsedPaths}
                                    onToggle={handleTogglePath}
                                    isLight={isLight}
                                    textMutedClass={textMutedClass}
                                  />
                                );
                              } catch (e: any) {
                                return (
                                  <span className="text-red-500 font-mono text-xs">
                                    Error rendering interactive node trees: {e.message}
                                  </span>
                                );
                              }
                            })()}
                          </div>
                        ) : (
                          <pre className={`font-mono text-xs leading-relaxed overflow-x-auto whitespace-pre p-3.5 border rounded-xl ${
                            isLight ? 'bg-slate-50 border-slate-200 text-slate-850' : 'bg-slate-950 border-slate-900 text-slate-200'
                          }`}>
                            {response.body}
                          </pre>
                        )}
                      </div>
                    );
                  })()}
                </div>
              )}

            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: PRE-SET TEMPLATES & HISTORY SIDEBAR (1/3 width) */}
        <div className="space-y-6">
          
          {/* QUERIES PRE-SET TEMPLATES */}
          <div className={`p-5 rounded-2xl border ${panelBgClass} ${borderClass} space-y-4 shadow-md`}>
            <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4" />
              Built-In GraphQL API Targets
            </span>

            <div className="space-y-2.5">
              {TEMPLATES.map((tpl, i) => (
                <button
                  key={i}
                  onClick={() => handleLoadTemplate(tpl)}
                  className={`w-full p-3 rounded-xl border text-left flex flex-col gap-1 transition-all group cursor-pointer ${
                    endpoint === tpl.endpoint
                      ? 'bg-indigo-600/10 border-indigo-500 text-indigo-300'
                      : 'bg-slate-950/40 border-slate-900 hover:bg-slate-900 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <span className="text-xs font-bold font-sans group-hover:text-indigo-400 transition-colors flex items-center gap-1">
                    <CornerDownRight className="w-3.5 h-3.5" />
                    {tpl.name}
                  </span>
                  <span className="text-[9px] font-mono opacity-80 overflow-hidden text-ellipsis whitespace-nowrap block">
                    {tpl.endpoint}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* HISTORY MANAGER CARD */}
          <div className={`p-5 rounded-2xl border ${panelBgClass} ${borderClass} space-y-4 shadow-md`}>
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-mono font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                <History className="w-4 h-4" />
                GraphQL Playbook History
              </span>
              
              {history.length > 0 && (
                <button
                  onClick={() => {
                    saveHistory([]);
                    showNotification('All GraphQL history cleared', 'info');
                  }}
                  className="text-[10px] font-mono font-bold text-slate-500 hover:text-red-400 flex items-center gap-1 cursor-pointer border-0 bg-transparent"
                >
                  Clear All
                </button>
              )}
            </div>

            {/* SAVE FORM */}
            <div className="space-y-2">
              <div className="flex gap-1.5">
                <input
                  type="text"
                  placeholder="Query Name (e.g. SpaceX Latest)"
                  className={`flex-1 text-[11px] ${inputBgClass} border ${borderClass} rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500 font-sans transition-colors`}
                  value={saveQueryName}
                  onChange={(e) => setSaveQueryName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') handleSaveQuery();
                  }}
                />
                <button
                  onClick={handleSaveQuery}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg transition-colors cursor-pointer border-0"
                >
                  Save
                </button>
              </div>
            </div>

            {/* HISTORY ENTRIES LIST */}
            {history.length === 0 ? (
              <div className="text-center py-10 font-mono text-[10px] text-slate-600">
                No saved queries. Enter a name above to log your active configuration.
              </div>
            ) : (
              <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                {history.map((item) => (
                  <div
                    key={item.id}
                    onClick={() => handleLoadHistory(item)}
                    className="p-2.5 rounded-lg border bg-slate-950/60 border-slate-900/60 hover:bg-slate-900 hover:border-slate-800 transition-all flex items-center justify-between group cursor-pointer text-left"
                  >
                    <div className="space-y-0.5 min-w-0 flex-1 pr-2">
                      <span className="text-[11px] font-bold block truncate group-hover:text-indigo-400 transition-colors">
                        {item.name}
                      </span>
                      <span className="text-[8px] font-mono block text-slate-500">
                        {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {item.endpoint}
                      </span>
                    </div>
                    <button
                      onClick={(e) => handleDeleteHistory(item.id, e)}
                      className="p-1 text-slate-600 hover:text-red-400 rounded-lg opacity-0 group-hover:opacity-100 transition-all border-0 bg-transparent cursor-pointer"
                      title="Remove from history"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

    </div>
  );
}
