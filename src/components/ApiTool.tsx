import React, { useState, useEffect } from 'react';
import { 
  Send, Plus, Trash2, Check, Copy, History, 
  HelpCircle, Globe, Play, Server, CornerDownRight, 
  Settings, CheckCircle, AlertCircle, RefreshCw,
  Terminal, BookOpen, Lock, Shield, Cpu, Trash,
  ChevronRight, ChevronDown, Download
} from 'lucide-react';
import { KeyValuePair, HttpMethod, ApiResponse, SavedApiRequest } from '../types';

const INITIAL_HEADERS: KeyValuePair[] = [
  { key: 'Content-Type', value: 'application/json', enabled: true },
  { key: 'Accept', value: 'application/json', enabled: true }
];

const INITIAL_PARAMS: KeyValuePair[] = [
  { key: 'userId', value: '1', enabled: false }
];

const DEFAULT_POST_BODY = `{
  "title": "Hello OwnFormatters",
  "body": "Modern Developer Tools Suite",
  "userId": 1
}`;

const HISTORIC_REQUESTS: SavedApiRequest[] = [
  {
    id: 'h1',
    name: 'Get User List (JSONPlaceholder)',
    timestamp: Date.now() - 60000 * 5,
    request: {
      url: 'https://jsonplaceholder.typicode.com/users',
      method: 'GET',
      headers: [{ key: 'Accept', value: 'application/json', enabled: true }],
      params: [],
      bodyType: 'none',
      body: ''
    }
  },
  {
    id: 'h2',
    name: 'Create Post (JSONPlaceholder)',
    timestamp: Date.now() - 60000 * 15,
    request: {
      url: 'https://jsonplaceholder.typicode.com/posts',
      method: 'POST',
      headers: INITIAL_HEADERS,
      params: [],
      bodyType: 'json',
      body: DEFAULT_POST_BODY
    }
  }
];

export interface SwaggerEndpoint {
  path: string;
  method: HttpMethod;
  summary: string;
  description?: string;
  parameters: any[];
  requestBodySchema?: any;
}

const SAMPLE_SWAGGER_JSON = `{
  "openapi": "3.0.0",
  "info": {
    "title": "OwnFormatters Sample API Spec",
    "version": "1.0.0",
    "description": "Mock OpenAPI definition for testing Swagger importers inside API tool."
  },
  "servers": [
    {
      "url": "https://jsonplaceholder.typicode.com"
    }
  ],
  "paths": {
    "/posts": {
      "get": {
        "summary": "Retrieve collection of blog posts",
        "description": "Returns a list of articles for formatting and styling validation",
        "parameters": [
          {
            "name": "userId",
            "in": "query",
            "required": false,
            "schema": {
              "type": "integer"
            }
          }
        ]
      },
      "post": {
        "summary": "Create a new posts payload",
        "requestBody": {
          "required": true,
          "content": {
            "application/json": {
              "schema": {
                "type": "object",
                "properties": {
                  "title": { "type": "string", "example": "A Custom OpenAPI Created Entry" },
                  "body": { "type": "string", "example": "This request is generated directly by Swagger schemas." },
                  "userId": { "type": "integer", "example": 1 }
                }
              }
            }
          }
        }
      }
    },
    "/users": {
      "get": {
        "summary": "Fetch simulated user profiles",
        "parameters": [
          {
            "name": "id",
            "in": "query",
            "required": false,
            "schema": {
              "type": "integer"
            }
          }
        ]
      }
    }
  }
}`;

const parseCurl = (curl: string) => {
  const cleanCurl = curl.replace(/\\\r?\n/g, ' ').trim();
  
  let parsedUrl = '';
  let parsedMethod: HttpMethod = 'GET';
  const parsedHeaders: KeyValuePair[] = [];
  const parsedParams: KeyValuePair[] = [];
  let parsedBody = '';
  let parsedBodyType: 'none' | 'json' | 'text' = 'none';

  const urlMatches = cleanCurl.match(/(?:https?:\/\/[^\s'"]+)/gi);
  if (urlMatches && urlMatches.length > 0) {
    parsedUrl = urlMatches[0].replace(/['"]+$/g, '').replace(/^['"]+/g, '');
  }

  const methodMatch = cleanCurl.match(/(?:-X|--request)\s+([A-Z]+)/i);
  if (methodMatch) {
    parsedMethod = methodMatch[1].toUpperCase() as HttpMethod;
  } else if (cleanCurl.includes('-d ') || cleanCurl.includes('--data ') || cleanCurl.includes('--data-raw ') || cleanCurl.includes('--data-binary ')) {
    parsedMethod = 'POST';
  }

  const headerRegex = /(?:-H|--header)\s+((?:"[^"]*")|(?:'[^']*')|(?:[^\s"']+))/g;
  let match;
  while ((match = headerRegex.exec(cleanCurl)) !== null) {
    const rawHeader = match[1];
    const headerStr = rawHeader.replace(/^['"]|['"]$/g, '').trim();
    const colonIdx = headerStr.indexOf(':');
    if (colonIdx > 0) {
      const key = headerStr.slice(0, colonIdx).trim();
      const value = headerStr.slice(colonIdx + 1).trim();
      parsedHeaders.push({ key, value, enabled: true });
    }
  }

  const bodyRegex = /(?:-d|--data|--data-raw|--data-binary)\s+((?:"[^"]*")|(?:'[^']*')|(?:\{[^}]*\}))/i;
  const bodyMatch = cleanCurl.match(bodyRegex);
  if (bodyMatch) {
    let bodyText = bodyMatch[1].trim();
    if ((bodyText.startsWith("'") && bodyText.endsWith("'")) || (bodyText.startsWith('"') && bodyText.endsWith('"'))) {
      bodyText = bodyText.slice(1, -1);
    }
    bodyText = bodyText.replace(/\\"/g, '"').replace(/\\'/g, "'");
    parsedBody = bodyText;
    parsedBodyType = 'text';
    try {
      JSON.parse(bodyText);
      parsedBodyType = 'json';
    } catch (_) {}
  }

  if (parsedUrl) {
    try {
      const urlObj = new URL(parsedUrl);
      const searchParams = urlObj.searchParams;
      searchParams.forEach((value, key) => {
        parsedParams.push({ key, value, enabled: true });
      });
      parsedUrl = urlObj.origin + urlObj.pathname;
    } catch (_) {
      const qIdx = parsedUrl.indexOf('?');
      if (qIdx > -1) {
        const query = parsedUrl.substring(qIdx + 1);
        parsedUrl = parsedUrl.substring(0, qIdx);
        const pairs = query.split('&');
        pairs.forEach(pair => {
          const eqIdx = pair.indexOf('=');
          if (eqIdx > -1) {
            const key = decodeURIComponent(pair.substring(0, eqIdx));
            const value = decodeURIComponent(pair.substring(eqIdx + 1));
            parsedParams.push({ key, value, enabled: true });
          } else if (pair.trim()) {
            parsedParams.push({ key: decodeURIComponent(pair), value: '', enabled: true });
          }
        });
      }
    }
  }

  return {
    url: parsedUrl || 'https://jsonplaceholder.typicode.com/posts',
    method: parsedMethod,
    headers: parsedHeaders.length > 0 ? parsedHeaders : INITIAL_HEADERS,
    params: parsedParams.length > 0 ? parsedParams : INITIAL_PARAMS,
    body: parsedBody,
    bodyType: parsedBodyType
  };
};

const generateMockFromSchemaValue = (schema: any): any => {
  if (!schema) return 'value';
  if (schema.type === 'object' && schema.properties) {
    const obj: any = {};
    Object.entries(schema.properties).forEach(([key, prop]: [string, any]) => {
      obj[key] = generateMockFromSchemaValue(prop);
    });
    return obj;
  } else if (schema.type === 'array') {
    const items = schema.items ? [generateMockFromSchemaValue(schema.items)] : [];
    return items;
  } else if (schema.type === 'string') {
    if (schema.format === 'date-time') return new Date().toISOString();
    if (schema.example) return schema.example;
    return 'string_value';
  } else if (schema.type === 'integer' || schema.type === 'number') {
    return schema.example || 123;
  } else if (schema.type === 'boolean') {
    return true;
  } else {
    return schema.example || 'value';
  }
};

const generateMockBodyFromSchema = (schema: any): string => {
  if (!schema) return '';
  try {
    const mockObj = generateMockFromSchemaValue(schema);
    return JSON.stringify(mockObj, null, 2);
  } catch (_) {
    return '';
  }
};

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

const parseSwagger = (swaggerText: string): { info?: any; servers: string[]; endpoints: SwaggerEndpoint[] } => {
  try {
    const spec = JSON.parse(swaggerText);
    const endpoints: SwaggerEndpoint[] = [];
    const servers: string[] = [];

    if (Array.isArray(spec.servers)) {
      spec.servers.forEach((s: any) => {
        if (s.url) servers.push(s.url);
      });
    } else if (spec.host) {
      const scheme = Array.isArray(spec.schemes) ? spec.schemes[0] : 'https';
      const basePath = spec.basePath || '';
      servers.push(`${scheme}://${spec.host}${basePath}`);
    }
    
    if (servers.length === 0) {
      servers.push('https://jsonplaceholder.typicode.com');
    }

    if (spec.paths) {
      Object.entries(spec.paths).forEach(([pathKey, pathItem]: [string, any]) => {
        const methods: HttpMethod[] = ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'HEAD', 'OPTIONS'];
        methods.forEach(m => {
          const mLower = m.toLowerCase();
          if (pathItem && pathItem[mLower]) {
            const operation = pathItem[mLower];
            const combinedParams = [
              ...(pathItem.parameters || []),
              ...(operation.parameters || [])
            ];

            let requestBodySchema: any = null;
            if (operation.requestBody && operation.requestBody.content) {
              const content = operation.requestBody.content;
              const jsonContent = content['application/json'] || content['*/*'];
              if (jsonContent && jsonContent.schema) {
                requestBodySchema = jsonContent.schema;
              }
            } else if (operation.parameters) {
              const bodyParam = operation.parameters.find((p: any) => p.in === 'body');
              if (bodyParam && bodyParam.schema) {
                requestBodySchema = bodyParam.schema;
              }
            }

            endpoints.push({
              path: pathKey,
              method: m,
              summary: operation.summary || operation.description || `${m} ${pathKey}`,
              description: operation.description,
              parameters: combinedParams,
              requestBodySchema
            });
          }
        });
      });
    }

    return {
      info: spec.info,
      servers,
      endpoints
    };
  } catch (e: any) {
    throw new Error('Invalid JSON format. Please paste a valid JSON Swagger/OpenAPI spec.');
  }
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
              className={`p-0.5 rounded hover:bg-slate-800/40 transition-colors cursor-pointer flex items-center justify-center`}
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
              className={`p-0.5 rounded hover:bg-slate-800/40 transition-colors cursor-pointer flex items-center justify-center`}
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

interface ApiToolProps {
  theme?: {
    id: string;
    bg: string;
    text: string;
    textMuted: string;
    border: string;
    borderMuted: string;
    card: string;
    inputBg: string;
    panelBg: string;
    btnSecondary: string;
    canvasBg: string;
    isDark: boolean;
  };
}

export default function ApiTool({ theme }: ApiToolProps) {
  const [url, setUrl] = useState<string>('https://jsonplaceholder.typicode.com/posts');
  const [method, setMethod] = useState<HttpMethod>('GET');
  const [headers, setHeaders] = useState<KeyValuePair[]>(INITIAL_HEADERS);
  const [params, setParams] = useState<KeyValuePair[]>(INITIAL_PARAMS);
  const [bodyType, setBodyType] = useState<'none' | 'json' | 'text'>('json');
  const [body, setBody] = useState<string>(DEFAULT_POST_BODY);
  const [loading, setLoading] = useState<boolean>(false);
  const [response, setResponse] = useState<ApiResponse | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'headers' | 'params' | 'body' | 'auth' | 'env'>('headers');
  const [history, setHistory] = useState<SavedApiRequest[]>(HISTORIC_REQUESTS);
  const [corsMode, setCorsMode] = useState<'normal' | 'proxy-simulation'>('normal');

  // Advanced features states
  const [envVars, setEnvVars] = useState<KeyValuePair[]>([
    { key: 'baseUrl', value: 'https://jsonplaceholder.typicode.com', enabled: true },
    { key: 'userId', value: '1', enabled: true }
  ]);
  const [authType, setAuthType] = useState<'none' | 'bearer' | 'basic' | 'apikey'>('none');
  const [authBearerToken, setAuthBearerToken] = useState<string>('');
  const [authBasicUser, setAuthBasicUser] = useState<string>('');
  const [authBasicPass, setAuthBasicPass] = useState<string>('');
  const [authApiKeyName, setAuthApiKeyName] = useState<string>('X-API-Key');
  const [authApiKeyValue, setAuthApiKeyValue] = useState<string>('');
  const [authApiKeyAddTo, setAuthApiKeyAddTo] = useState<'header' | 'query'>('header');

  const [showCurlImport, setShowCurlImport] = useState<boolean>(false);
  const [curlInput, setCurlInput] = useState<string>('');
  const [showSwaggerImport, setShowSwaggerImport] = useState<boolean>(false);
  const [swaggerInput, setSwaggerInput] = useState<string>('');
  const [swaggerError, setSwaggerError] = useState<string>('');
  const [parsedSwaggerData, setParsedSwaggerData] = useState<{ info?: any; servers: string[]; endpoints: SwaggerEndpoint[] } | null>(null);
  const [swaggerFilter, setSwaggerFilter] = useState<string>('');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null);
  const [responseViewMode, setResponseViewMode] = useState<'raw' | 'tree'>('tree');
  const [collapsedPaths, setCollapsedPaths] = useState<Record<string, boolean>>({});

  // Dynamic values based on theme or robust defaults
  const borderClass = theme?.border || 'border-slate-800/80';
  const borderMutedClass = theme?.borderMuted || 'border-slate-850';
  const cardClass = theme?.card || 'bg-slate-900/50';
  const inputBgClass = theme?.inputBg || 'bg-slate-950';
  const panelBgClass = theme?.panelBg || 'bg-slate-900';
  const textClass = theme?.text || 'text-slate-200';
  const textMutedClass = theme?.textMuted || 'text-slate-400';
  const canvasBgClass = theme?.canvasBg || 'bg-[#02050c]';
  const isLight = theme?.isDark === false;

  // On Mount: Load data from localStorage
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem('ownformatters_api_history');
      if (savedHistory) {
        setHistory(JSON.parse(savedHistory));
      } else {
        setHistory(HISTORIC_REQUESTS);
      }
    } catch (_) {}

    try {
      const savedEnv = localStorage.getItem('ownformatters_api_env');
      if (savedEnv) {
        setEnvVars(JSON.parse(savedEnv));
      }
    } catch (_) {}

    try {
      const savedAuth = localStorage.getItem('ownformatters_api_auth');
      if (savedAuth) {
        const parsed = JSON.parse(savedAuth);
        if (parsed.authType) setAuthType(parsed.authType);
        if (parsed.authBearerToken) setAuthBearerToken(parsed.authBearerToken);
        if (parsed.authBasicUser) setAuthBasicUser(parsed.authBasicUser);
        if (parsed.authBasicPass) setAuthBasicPass(parsed.authBasicPass);
        if (parsed.authApiKeyName) setAuthApiKeyName(parsed.authApiKeyName);
        if (parsed.authApiKeyValue) setAuthApiKeyValue(parsed.authApiKeyValue);
        if (parsed.authApiKeyAddTo) setAuthApiKeyAddTo(parsed.authApiKeyAddTo);
      }
    } catch (_) {}
  }, []);

  // Clear notification automatically
  useEffect(() => {
    if (notification) {
      const t = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(t);
    }
  }, [notification]);

  const saveHistory = (newHistory: SavedApiRequest[]) => {
    setHistory(newHistory);
    try {
      localStorage.setItem('ownformatters_api_history', JSON.stringify(newHistory));
    } catch (_) {}
  };

  const saveEnv = (newEnv: KeyValuePair[]) => {
    setEnvVars(newEnv);
    try {
      localStorage.setItem('ownformatters_api_env', JSON.stringify(newEnv));
    } catch (_) {}
  };

  const saveAuth = (updates: any) => {
    try {
      const current = {
        authType,
        authBearerToken,
        authBasicUser,
        authBasicPass,
        authApiKeyName,
        authApiKeyValue,
        authApiKeyAddTo,
        ...updates
      };
      localStorage.setItem('ownformatters_api_auth', JSON.stringify(current));
    } catch (_) {}
  };

  const replaceEnvVars = (text: string): string => {
    if (!text) return text;
    let result = text;
    envVars.forEach(v => {
      if (v.enabled && v.key.trim()) {
        result = result.split(`{{${v.key.trim()}}}`).join(v.value);
        result = result.split(`{{ ${v.key.trim()} }}`).join(v.value);
      }
    });
    return result;
  };

  // Build complete URL with query params & Environment interpolation
  const buildFullUrl = () => {
    let resolvedUrl = replaceEnvVars(url);
    const activeParams = [...params];

    // Inject API Key into params if configured so
    if (authType === 'apikey' && authApiKeyName.trim() && authApiKeyValue.trim() && authApiKeyAddTo === 'query') {
      activeParams.push({
        key: authApiKeyName.trim(),
        value: authApiKeyValue.trim(),
        enabled: true
      });
    }

    try {
      const parsedUrl = new URL(resolvedUrl);
      activeParams.forEach(p => {
        if (p.enabled && p.key.trim()) {
          parsedUrl.searchParams.append(p.key.trim(), replaceEnvVars(p.value));
        }
      });
      return parsedUrl.toString();
    } catch (e) {
      // If URL parser fails, do manual build or fallback
      let queryStr = activeParams
        .filter(p => p.enabled && p.key.trim())
        .map(p => `${encodeURIComponent(p.key.trim())}=${encodeURIComponent(replaceEnvVars(p.value))}`)
        .join('&');
      
      if (!queryStr) return resolvedUrl;
      const separator = resolvedUrl.includes('?') ? '&' : '?';
      return `${resolvedUrl}${separator}${queryStr}`;
    }
  };

  const handleSendRequest = async () => {
    if (!url.trim()) return;
    setLoading(true);
    setResponse(null);

    const fullUrl = buildFullUrl();
    const requestHeaders: Record<string, string> = {};
    headers.forEach(h => {
      if (h.enabled && h.key.trim() && h.value.trim()) {
        requestHeaders[h.key.trim()] = replaceEnvVars(h.value.trim());
      }
    });

    // Handle Authorization headers
    if (authType === 'bearer' && authBearerToken.trim()) {
      requestHeaders['Authorization'] = `Bearer ${replaceEnvVars(authBearerToken.trim())}`;
    } else if (authType === 'basic' && (authBasicUser.trim() || authBasicPass.trim())) {
      const user = replaceEnvVars(authBasicUser.trim());
      const pass = replaceEnvVars(authBasicPass.trim());
      try {
        requestHeaders['Authorization'] = `Basic ${btoa(`${user}:${pass}`)}`;
      } catch (err) {}
    } else if (authType === 'apikey' && authApiKeyName.trim() && authApiKeyValue.trim() && authApiKeyAddTo === 'header') {
      const keyName = replaceEnvVars(authApiKeyName.trim());
      const keyValue = replaceEnvVars(authApiKeyValue.trim());
      requestHeaders[keyName] = keyValue;
    }

    // Save this request to history registry
    const newHistoryItem: SavedApiRequest = {
      id: 'h_' + Date.now(),
      name: `${method} ${url.replace(/^https?:\/\//i, '').substring(0, 30)}...`,
      timestamp: Date.now(),
      request: {
        url,
        method,
        headers: [...headers],
        params: [...params],
        bodyType,
        body
      }
    };
    const updatedHistory = [newHistoryItem, ...history.filter(h => h.request.url !== url || h.request.method !== method)].slice(0, 50);
    saveHistory(updatedHistory);

    const startTime = performance.now();

    // If corsMode is proxy-simulation or is a local simulation url
    if (corsMode === 'proxy-simulation' || url.includes('mock-endpoint')) {
      // Simulate high-fidelity network request to ensure a working fallback in iframe env
      setTimeout(() => {
        const duration = Math.round(performance.now() - startTime + 80);
        let simStatus = 200;
        let simBody = '';
        let simStatusText = 'OK';

        if (method === 'GET') {
          if (url.includes('users')) {
            simBody = JSON.stringify([
              { id: 1, name: 'Leanne Graham', username: 'Bret', email: 'Sincere@april.biz' },
              { id: 2, name: 'Ervin Howell', username: 'Antonette', email: 'Shanna@melissa.tv' }
            ], null, 2);
          } else {
            simBody = JSON.stringify([
              { id: 1, title: 'OwnFormatters Rules', body: 'This is a simulated secure response to bypass CORS restrictions.' },
              { id: 2, title: 'API Tester Pro', body: 'Our high fidelity simulator mocks response status codes, headers and payloads.' }
            ], null, 2);
          }
        } else if (method === 'POST') {
          simStatus = 201;
          simStatusText = 'Created';
          try {
            const resolvedBody = replaceEnvVars(body);
            const parsedBody = resolvedBody ? JSON.parse(resolvedBody) : {};
            simBody = JSON.stringify({ id: 101, ...parsedBody, createdAt: new Date().toISOString() }, null, 2);
          } catch (e) {
            simBody = JSON.stringify({ id: 101, body: replaceEnvVars(body), info: 'Created successfully (plaintext)' }, null, 2);
          }
        } else {
          simBody = JSON.stringify({ status: 'success', method, info: 'Request processed via sandbox environment' }, null, 2);
        }

        setResponse({
          status: simStatus,
          statusText: simStatusText,
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'X-Powered-By': 'OwnFormatters Proxy Engine',
            'Access-Control-Allow-Origin': '*',
            'Cache-Control': 'no-cache'
          },
          body: simBody,
          timeMs: duration,
          sizeBytes: simBody.length
        });
        setLoading(false);
      }, 600);
      return;
    }

    try {
      const options: RequestInit = {
        method,
        headers: requestHeaders,
      };

      if (method !== 'GET' && method !== 'HEAD') {
        options.body = bodyType === 'none' ? undefined : replaceEnvVars(body);
      }

      const res = await fetch(fullUrl, options);
      const text = await res.text();
      const endTime = performance.now();
      const duration = Math.round(endTime - startTime);

      const responseHeaders: Record<string, string> = {};
      res.headers.forEach((val, key) => {
        responseHeaders[key] = val;
      });

      // Try formatting if it is JSON
      let formattedBody = text;
      try {
        const json = JSON.parse(text);
        formattedBody = JSON.stringify(json, null, 2);
      } catch (e) {}

      setResponse({
        status: res.status,
        statusText: res.statusText,
        headers: responseHeaders,
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
        error: err.message || 'The request was blocked by the browser. This is common with client-side API requests due to CORS security (Cross-Origin Resource Sharing). Try switching to the "Proxy Bypass Simulation" mode in the header to view high-fidelity network responses!'
      });
    } finally {
      setLoading(false);
    }
  };

  const loadHistoryItem = (item: SavedApiRequest) => {
    setUrl(item.request.url);
    setMethod(item.request.method);
    setHeaders(item.request.headers);
    setParams(item.request.params);
    setBody(item.request.body);
    setBodyType(item.request.bodyType as any);
  };

  const addHeader = () => {
    setHeaders([...headers, { key: '', value: '', enabled: true }]);
  };

  const removeHeader = (index: number) => {
    setHeaders(headers.filter((_, i) => i !== index));
  };

  const updateHeader = (index: number, field: 'key' | 'value' | 'enabled', val: any) => {
    const updated = [...headers];
    updated[index] = { ...updated[index], [field]: val };
    setHeaders(updated);
  };

  const addParam = () => {
    setParams([...params, { key: '', value: '', enabled: true }]);
  };

  const removeParam = (index: number) => {
    setParams(params.filter((_, i) => i !== index));
  };

  const updateParam = (index: number, field: 'key' | 'value' | 'enabled', val: any) => {
    const updated = [...params];
    updated[index] = { ...updated[index], [field]: val };
    setParams(updated);
  };

  const handleCopyResponse = () => {
    if (!response || !response.body) return;
    navigator.clipboard.writeText(response.body);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadResponse = () => {
    if (!response || !response.body) return;
    try {
      const contentType = response.headers['content-type'] || 'application/json';
      const isJson = contentType.includes('json');
      const extension = isJson ? 'json' : 'txt';
      const blob = new Blob([response.body], { type: contentType });
      const urlBlob = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = urlBlob;
      a.download = `response_${Date.now()}.${extension}`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(urlBlob);
      setNotification({ message: 'Response downloaded successfully!', type: 'success' });
    } catch (err: any) {
      setNotification({ message: 'Failed to download response: ' + err.message, type: 'error' });
    }
  };

  const generateCurlCommand = (): string => {
    const fullUrl = buildFullUrl();
    let curl = `curl -X ${method} "${fullUrl}"`;
    
    headers.forEach(h => {
      if (h.enabled && h.key.trim() && h.value.trim()) {
        const resolvedVal = replaceEnvVars(h.value.trim());
        curl += ` \\\n  -H "${h.key.trim()}: ${resolvedVal.replace(/"/g, '\\"')}"`;
      }
    });

    if (authType === 'bearer' && authBearerToken.trim()) {
      curl += ` \\\n  -H "Authorization: Bearer ${replaceEnvVars(authBearerToken.trim()).replace(/"/g, '\\"')}"`;
    } else if (authType === 'basic' && (authBasicUser.trim() || authBasicPass.trim())) {
      const user = replaceEnvVars(authBasicUser.trim());
      const pass = replaceEnvVars(authBasicPass.trim());
      try {
        curl += ` \\\n  -H "Authorization: Basic ${btoa(`${user}:${pass}`)}"`;
      } catch (err) {}
    } else if (authType === 'apikey' && authApiKeyName.trim() && authApiKeyValue.trim() && authApiKeyAddTo === 'header') {
      const keyName = replaceEnvVars(authApiKeyName.trim());
      const keyValue = replaceEnvVars(authApiKeyValue.trim());
      curl += ` \\\n  -H "${keyName}: ${keyValue.replace(/"/g, '\\"')}"`;
    }

    if (method !== 'GET' && method !== 'HEAD' && bodyType !== 'none' && body) {
      const resolvedBody = replaceEnvVars(body);
      curl += ` \\\n  -d '${resolvedBody.replace(/'/g, "'\\''")}'`;
    }

    return curl;
  };

  const handleCopyAsCurl = () => {
    try {
      const curlCmd = generateCurlCommand();
      navigator.clipboard.writeText(curlCmd);
      setNotification({ message: 'cURL command copied to clipboard!', type: 'success' });
    } catch (err: any) {
      setNotification({ message: 'Failed to copy cURL: ' + err.message, type: 'error' });
    }
  };

  const handleTogglePath = (path: string) => {
    setCollapsedPaths(prev => ({
      ...prev,
      [path]: !prev[path]
    }));
  };

  const handleExpandAll = () => {
    setCollapsedPaths({});
    setNotification({ message: 'All JSON nodes expanded', type: 'info' });
  };

  const handleCollapseAll = () => {
    if (!response || !response.body) return;
    try {
      const parsed = JSON.parse(response.body);
      const paths = getAllCollapsiblePaths(parsed);
      const collapsedMap: Record<string, boolean> = {};
      paths.forEach(p => {
        collapsedMap[p] = true;
      });
      setCollapsedPaths(collapsedMap);
      setNotification({ message: 'All JSON nodes collapsed', type: 'info' });
    } catch (e) {}
  };

  const handleImportCurl = () => {
    if (!curlInput.trim()) return;
    try {
      const parsed = parseCurl(curlInput);
      setUrl(parsed.url);
      setMethod(parsed.method);
      setHeaders(parsed.headers);
      setParams(parsed.params);
      setBody(parsed.body);
      setBodyType(parsed.bodyType);
      
      if (parsed.body) {
        setActiveTab('body');
      } else if (parsed.headers.length > 0 && parsed.headers !== INITIAL_HEADERS) {
        setActiveTab('headers');
      } else if (parsed.params.length > 0) {
        setActiveTab('params');
      }

      setShowCurlImport(false);
      setCurlInput('');
      setNotification({ message: 'cURL request imported successfully!', type: 'success' });
    } catch (e: any) {
      setNotification({ message: 'Failed to parse cURL command. Check syntax.', type: 'error' });
    }
  };

  const handleImportSwagger = () => {
    if (!swaggerInput.trim()) return;
    try {
      setSwaggerError('');
      const data = parseSwagger(swaggerInput);
      setParsedSwaggerData(data);
      setNotification({ message: 'Swagger spec parsed successfully!', type: 'success' });
    } catch (e: any) {
      setSwaggerError(e.message || 'Error processing OpenAPI schema.');
    }
  };

  const loadDemoSwagger = () => {
    setSwaggerInput(SAMPLE_SWAGGER_JSON);
    setSwaggerError('');
  };

  const handleSelectSwaggerEndpoint = (endpoint: SwaggerEndpoint) => {
    const baseUrl = parsedSwaggerData?.servers[0] || 'https://api.example.com';
    setUrl(`${baseUrl}${endpoint.path}`);
    setMethod(endpoint.method);

    const newHeaders: KeyValuePair[] = [...INITIAL_HEADERS];
    const newParams: KeyValuePair[] = [];
    
    endpoint.parameters.forEach((p: any) => {
      if (p.in === 'query') {
        newParams.push({
          key: p.name,
          value: p.schema?.example || p.example || '',
          enabled: p.required || false
        });
      } else if (p.in === 'header') {
        newHeaders.push({
          key: p.name,
          value: p.schema?.example || p.example || '',
          enabled: p.required || false
        });
      }
    });

    setParams(newParams.length > 0 ? newParams : INITIAL_PARAMS);
    setHeaders(newHeaders);

    if (endpoint.requestBodySchema) {
      setBody(generateMockBodyFromSchema(endpoint.requestBodySchema));
      setBodyType('json');
      setActiveTab('body');
    } else {
      setBody('');
      setBodyType('none');
      setActiveTab(newParams.length > 0 ? 'params' : 'headers');
    }

    setNotification({ message: `Loaded endpoint: ${endpoint.method} ${endpoint.path}`, type: 'success' });
    setShowSwaggerImport(false);
  };

  const filteredSwaggerEndpoints = parsedSwaggerData
    ? parsedSwaggerData.endpoints.filter(e =>
        e.path.toLowerCase().includes(swaggerFilter.toLowerCase()) ||
        e.summary.toLowerCase().includes(swaggerFilter.toLowerCase())
      )
    : [];

  return (
    <div className="grid grid-cols-1 xl:grid-cols-12 gap-6" id="api-tool-wrapper">
      
      {/* LEFT COLUMN: HISTORY & PRESETS (3 cols) */}
      <div className={`xl:col-span-3 flex flex-col border rounded-xl p-4 space-y-4 ${inputBgClass} ${borderClass}`}>
        <div className="space-y-3">
          <div className={`flex items-center justify-between pb-2 border-b ${borderClass}`}>
            <div className="flex items-center gap-1.5">
              <History className={`w-3.5 h-3.5 ${isLight ? 'text-indigo-600' : 'text-indigo-400'}`} />
              <h3 className={`text-xs font-bold tracking-wider uppercase font-mono ${isLight ? 'text-slate-800' : 'text-white'}`}>Registry</h3>
            </div>
            <div className="flex gap-1.5">
              <button
                onClick={() => {
                  saveHistory([]);
                  setNotification({ message: 'Request history cleared', type: 'info' });
                }}
                className={`px-2 py-1 rounded text-[9px] font-bold font-mono border flex items-center gap-0.5 transition-all ${
                  isLight 
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200' 
                    : 'bg-slate-900 hover:bg-slate-850 text-slate-300 border-slate-800/80'
                }`}
                title="Wipe request history"
              >
                <Trash2 className="w-2.5 h-2.5 text-red-400" />
                Clear
              </button>
              <button
                onClick={() => {
                  try {
                    localStorage.removeItem('ownformatters_api_history');
                    localStorage.removeItem('ownformatters_api_env');
                    localStorage.removeItem('ownformatters_api_auth');
                  } catch (_) {}
                  setHistory(HISTORIC_REQUESTS);
                  setEnvVars([
                    { key: 'baseUrl', value: 'https://jsonplaceholder.typicode.com', enabled: true },
                    { key: 'userId', value: '1', enabled: true }
                  ]);
                  setAuthType('none');
                  setAuthBearerToken('');
                  setAuthBasicUser('');
                  setAuthBasicPass('');
                  setAuthApiKeyName('X-API-Key');
                  setAuthApiKeyValue('');
                  setAuthApiKeyAddTo('header');
                  setNotification({ message: 'Local storage reset successfully!', type: 'success' });
                }}
                className={`px-2 py-1 rounded text-[9px] font-bold font-mono border flex items-center gap-0.5 transition-all ${
                  isLight 
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200' 
                    : 'bg-slate-900 hover:bg-slate-850 text-slate-300 border-slate-800/80'
                }`}
                title="Reset all settings and environment defaults"
              >
                <RefreshCw className="w-2.5 h-2.5 text-amber-400" />
                Reset Store
              </button>
            </div>
          </div>
        </div>

        <div className="space-y-2.5 overflow-y-auto max-h-[360px] xl:max-h-[580px] flex-1">
          {history.length === 0 ? (
            <div className={`p-4 text-center rounded-lg border border-dashed ${isLight ? 'border-slate-200' : 'border-slate-850'} ${textMutedClass} text-[11px] font-mono`}>
              Empty Request Log
            </div>
          ) : (
            history.map(item => (
              <div
                key={item.id}
                className={`relative w-full rounded-lg border transition-all text-xs group ${
                  isLight 
                    ? 'bg-slate-50 border-slate-200 hover:border-slate-300' 
                    : 'bg-slate-900/60 border-slate-900/85 hover:border-slate-800 hover:bg-slate-900'
                }`}
              >
                <button
                  onClick={() => loadHistoryItem(item)}
                  className="w-full text-left p-3 pr-10 space-y-1.5 focus:outline-none"
                >
                  <div className="flex items-center justify-between">
                    <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold font-mono ${
                      item.request.method === 'GET' 
                        ? (isLight ? 'bg-emerald-100 text-emerald-800' : 'bg-emerald-950/40 text-emerald-400') 
                        : (isLight ? 'bg-indigo-100 text-indigo-800' : 'bg-indigo-950/40 text-indigo-400')
                    }`}>
                      {item.request.method}
                    </span>
                    <span className={`text-[10px] font-mono ${textMutedClass}`}>
                      {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>
                  <p className={`font-semibold truncate font-sans ${isLight ? 'text-slate-800 group-hover:text-indigo-600' : 'text-slate-300 group-hover:text-white'}`}>{item.name}</p>
                  <p className={`text-[10px] font-mono truncate ${textMutedClass}`}>{item.request.url}</p>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    const filtered = history.filter(h => h.id !== item.id);
                    saveHistory(filtered);
                    setNotification({ message: 'Request removed from history', type: 'info' });
                  }}
                  className={`absolute right-2.5 top-2.5 p-1 rounded-md transition-colors ${
                    isLight 
                      ? 'text-slate-400 hover:text-red-500 hover:bg-slate-200' 
                      : 'text-slate-500 hover:text-pink-400 hover:bg-slate-850'
                  }`}
                  title="Remove request"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            ))
          )}
        </div>

        <div className={`p-3 rounded-lg border text-[11px] leading-relaxed font-sans ${
          isLight ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-slate-900/45 border-slate-900/80 text-slate-400'
        }`}>
          <span className={`font-semibold block mb-1 ${isLight ? 'text-indigo-700' : 'text-indigo-300'}`}>Sandbox Presets:</span>
          Click any registry endpoint to load standard validation test blocks instantly.
        </div>
      </div>

      {/* RIGHT COLUMN: REQUEST BUILDER & RESPONSE PANELS (9 cols) */}
      <div className="xl:col-span-9 space-y-6">
        
        {/* URL Bar */}
        <div className={`border p-4 rounded-xl space-y-4 ${inputBgClass} ${borderClass}`}>
          <div className="flex items-center justify-between">
            <span className={`text-xs font-semibold flex items-center gap-1 ${textMutedClass}`}>
              <Globe className={`w-3.5 h-3.5 ${isLight ? 'text-slate-500' : 'text-slate-400'}`} />
              API Endpoint Address
            </span>
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-mono ${textMutedClass}`}>Connection:</span>
              <button
                onClick={() => setCorsMode(corsMode === 'normal' ? 'proxy-simulation' : 'normal')}
                className={`text-[10px] font-mono font-bold px-2 py-1 rounded transition-all border ${
                  corsMode === 'proxy-simulation'
                    ? (isLight ? 'bg-emerald-50 text-emerald-850 border-emerald-200' : 'bg-emerald-950/30 text-emerald-400 border-emerald-900/40')
                    : (isLight ? 'bg-white text-slate-600 border-slate-200 hover:bg-slate-50 shadow-xs' : 'bg-slate-900 text-slate-400 border-slate-800')
                }`}
                title="Toggle proxy simulation mode to bypass CORS errors"
              >
                {corsMode === 'proxy-simulation' ? '🟢 Proxy Bypass: Active' : '🔴 Direct Browser (CORS Sensitive)'}
              </button>
            </div>
          </div>

          <div className="flex gap-2">
            <select
              value={method}
              onChange={(e) => setMethod(e.target.value as HttpMethod)}
              className={`border text-xs font-bold rounded-lg px-3 py-2.5 focus:outline-none focus:border-indigo-500 font-mono ${
                isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-800 text-slate-200'
              }`}
            >
              <option value="GET">GET</option>
              <option value="POST">POST</option>
              <option value="PUT">PUT</option>
              <option value="DELETE">DELETE</option>
              <option value="PATCH">PATCH</option>
              <option value="HEAD">HEAD</option>
              <option value="OPTIONS">OPTIONS</option>
            </select>
            
            <input
              type="text"
              placeholder="Enter request URL... (e.g. https://api.endpoint.com/data)"
              className={`flex-1 border text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-indigo-500 font-mono ${
                isLight ? 'bg-white border-slate-200 text-slate-800 placeholder:text-slate-400' : 'bg-slate-900 border-slate-800 text-slate-200 placeholder:text-slate-500'
              }`}
              value={url}
              onChange={(e) => setUrl(e.target.value)}
            />

            <button
              onClick={handleSendRequest}
              disabled={loading}
              className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-850 text-white text-xs font-bold px-5 py-2.5 rounded-lg flex items-center gap-1.5 transition-all active:scale-[0.98] cursor-pointer shrink-0"
            >
              {loading ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
              ) : (
                <Send className="w-3.5 h-3.5 text-white" />
              )}
              {loading ? 'Sending...' : 'Send'}
            </button>
          </div>

          {/* Quick Import Actions Row */}
          <div className={`flex flex-wrap gap-2.5 pt-1 border-t ${borderMutedClass}`}>
            <button
              onClick={() => {
                setShowCurlImport(!showCurlImport);
                setShowSwaggerImport(false);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 border cursor-pointer ${
                showCurlImport
                  ? 'bg-indigo-600 border-indigo-500 text-white shadow-md'
                  : isLight
                    ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                    : 'bg-slate-900 hover:bg-slate-850 border-slate-800/80 text-slate-300'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              Import cURL Command
            </button>

            <button
              onClick={() => {
                setShowSwaggerImport(!showSwaggerImport);
                setShowCurlImport(false);
              }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 border cursor-pointer ${
                showSwaggerImport
                  ? 'bg-indigo-600 border-indigo-500 text-white shadow-md'
                  : isLight
                    ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
                    : 'bg-slate-900 hover:bg-slate-850 border-slate-800/80 text-slate-300'
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              Import Swagger / OpenAPI Spec
            </button>
          </div>

          {/* Inline cURL Importer Pane */}
          {showCurlImport && (
            <div className={`p-4 border rounded-xl mt-3 space-y-3.5 transition-all ${isLight ? 'bg-indigo-50/40 border-indigo-150' : 'bg-slate-900/30 border-slate-850'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <Terminal className={`w-4 h-4 ${isLight ? 'text-indigo-600' : 'text-indigo-400'}`} />
                  <span className={`text-xs font-bold font-mono ${isLight ? 'text-indigo-900' : 'text-indigo-300'}`}>cURL CLI Importer</span>
                </div>
                <button onClick={() => setShowCurlImport(false)} className={`text-xs ${textMutedClass} hover:text-white transition-colors`}>Cancel</button>
              </div>
              <textarea
                placeholder="Paste your cURL terminal command string here... e.g. curl -X POST https://api.endpoint.com/data -H 'Content-Type: application/json' -d '{&quot;id&quot;: 1}'"
                className={`w-full h-24 border rounded-lg p-2.5 text-xs font-mono focus:outline-none focus:border-indigo-500 resize-none ${
                  isLight ? 'bg-white border-slate-200 text-slate-850 placeholder:text-slate-400' : 'bg-slate-950 border-slate-850 text-slate-200 placeholder:text-slate-600'
                }`}
                value={curlInput}
                onChange={(e) => setCurlInput(e.target.value)}
              />
              <div className="flex justify-end gap-2">
                <button
                  onClick={handleImportCurl}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition-all shadow-xs active:scale-95"
                >
                  Process & Populate Request
                </button>
              </div>
            </div>
          )}

          {/* Inline Swagger Importer Pane */}
          {showSwaggerImport && (
            <div className={`p-4 border rounded-xl mt-3 space-y-3.5 transition-all ${isLight ? 'bg-indigo-50/40 border-indigo-150' : 'bg-slate-900/30 border-slate-850'}`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <BookOpen className={`w-4 h-4 ${isLight ? 'text-indigo-600' : 'text-indigo-400'}`} />
                  <span className={`text-xs font-bold font-mono ${isLight ? 'text-indigo-900' : 'text-indigo-300'}`}>OpenAPI Swagger Schema Importer</span>
                </div>
                <button onClick={() => setShowSwaggerImport(false)} className={`text-xs ${textMutedClass} hover:text-white transition-colors`}>Cancel</button>
              </div>
              
              <textarea
                placeholder="Paste valid Swagger 2.0 or OpenAPI 3.0 spec JSON structure here..."
                className={`w-full h-32 border rounded-lg p-2.5 text-xs font-mono focus:outline-none focus:border-indigo-500 resize-none ${
                  isLight ? 'bg-white border-slate-200 text-slate-850 placeholder:text-slate-400' : 'bg-slate-950 border-slate-850 text-slate-200 placeholder:text-slate-600'
                }`}
                value={swaggerInput}
                onChange={(e) => setSwaggerInput(e.target.value)}
              />

              {swaggerError && (
                <p className="text-xs text-red-500 font-semibold font-mono bg-red-950/20 p-2 rounded-md border border-red-900/30">{swaggerError}</p>
              )}

              <div className="flex justify-between items-center pt-1">
                <button
                  onClick={loadDemoSwagger}
                  className={`text-[11px] font-bold flex items-center gap-1 ${isLight ? 'text-indigo-600 hover:text-indigo-700' : 'text-indigo-400 hover:text-indigo-300'}`}
                >
                  💡 Load Sample Swagger JSON
                </button>
                <button
                  onClick={handleImportSwagger}
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-lg transition-all active:scale-95"
                >
                  Parse Swagger Spec
                </button>
              </div>

              {parsedSwaggerData && parsedSwaggerData.endpoints.length > 0 && (
                <div className="space-y-3 border-t pt-3.5 border-slate-800">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <span className={`text-xs font-bold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                      Parsed Endpoints ({filteredSwaggerEndpoints.length})
                    </span>
                    <input
                      type="text"
                      placeholder="Filter paths..."
                      value={swaggerFilter}
                      onChange={(e) => setSwaggerFilter(e.target.value)}
                      className={`text-[11px] px-2.5 py-1.5 border rounded-md focus:outline-none focus:border-indigo-500 font-mono ${
                        isLight ? 'bg-white border-slate-200 text-slate-855' : 'bg-slate-950 border-slate-850 text-slate-300'
                      }`}
                    />
                  </div>

                  <div className={`max-h-56 overflow-y-auto space-y-1.5 pr-1 p-2 rounded-lg border ${isLight ? 'bg-slate-100/40 border-slate-200' : 'bg-slate-950/30 border-slate-850'}`}>
                    {filteredSwaggerEndpoints.map((endpoint, index) => (
                      <div
                        key={index}
                        onClick={() => handleSelectSwaggerEndpoint(endpoint)}
                        className={`flex flex-col sm:flex-row sm:items-center justify-between p-2.5 rounded-lg border text-xs cursor-pointer transition-all ${
                          isLight
                            ? 'bg-white border-slate-150 hover:bg-slate-50 hover:border-indigo-200'
                            : 'bg-slate-900 border-slate-800/80 hover:bg-slate-850 hover:border-indigo-900/40'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <span className={`px-1.5 py-0.5 rounded text-[10px] font-black font-mono ${
                            endpoint.method === 'GET' 
                              ? (isLight ? 'bg-emerald-100 text-emerald-800' : 'bg-emerald-950/40 text-emerald-400') 
                              : (isLight ? 'bg-indigo-100 text-indigo-800' : 'bg-indigo-950/40 text-indigo-400')
                          }`}>
                            {endpoint.method}
                          </span>
                          <span className="font-mono text-xs font-semibold break-all">{endpoint.path}</span>
                        </div>
                        <span className={`text-[10px] italic mt-1 sm:mt-0 ${textMutedClass} max-w-xs truncate`}>
                          {endpoint.summary}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Tab Selector for Request Config */}
        <div className={`border rounded-xl overflow-hidden ${inputBgClass} ${borderClass}`}>
          <div className={`border-b flex items-center justify-between px-4 py-1 ${panelBgClass} ${borderClass}`}>
            <div className="flex gap-1">
              {[
                { id: 'headers', label: `Headers (${headers.filter(h => h.enabled).length})` },
                { id: 'params', label: `Params (${params.filter(p => p.enabled).length})` },
                { id: 'body', label: 'Body' },
                { id: 'auth', label: authType !== 'none' ? `Auth (${authType})` : 'Authorization' },
                { id: 'env', label: `Environment (${envVars.filter(e => e.enabled).length})` }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`px-3 py-3 text-xs font-semibold border-b-2 transition-all ${
                    activeTab === tab.id
                      ? (isLight ? 'text-indigo-600 border-indigo-600 font-bold' : 'text-indigo-400 border-indigo-500 font-bold')
                      : (isLight ? 'text-slate-500 border-transparent hover:text-slate-800' : 'text-slate-400 border-transparent hover:text-white')
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
            <span className={`text-[10px] font-mono ${textMutedClass}`}>Payload parameters</span>
          </div>

          <div className={`p-4 min-h-[180px] max-h-[260px] overflow-y-auto ${canvasBgClass}`}>
            {activeTab === 'headers' && (
              <div className="space-y-2">
                {headers.map((h, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={h.enabled}
                      onChange={(e) => updateHeader(i, 'enabled', e.target.checked)}
                      className={`rounded text-indigo-600 focus:ring-indigo-500 ${isLight ? 'border-slate-300 bg-white' : 'border-slate-800 bg-slate-900'}`}
                    />
                    <input
                      type="text"
                      placeholder="Header Name"
                      className={`flex-1 border text-xs rounded px-2.5 py-1.5 focus:outline-none focus:border-indigo-500 font-mono ${
                        isLight ? 'bg-white border-slate-200 text-slate-805 placeholder:text-slate-400' : 'bg-slate-900 border-slate-800 text-slate-300'
                      }`}
                      value={h.key}
                      onChange={(e) => updateHeader(i, 'key', e.target.value)}
                    />
                    <input
                      type="text"
                      placeholder="Value"
                      className={`flex-1 border text-xs rounded px-2.5 py-1.5 focus:outline-none focus:border-indigo-500 font-mono ${
                        isLight ? 'bg-white border-slate-200 text-slate-805 placeholder:text-slate-400' : 'bg-slate-900 border-slate-800 text-slate-300'
                      }`}
                      value={h.value}
                      onChange={(e) => updateHeader(i, 'value', e.target.value)}
                    />
                    <button
                      onClick={() => removeHeader(i)}
                      className={`${isLight ? 'text-slate-400 hover:text-red-500' : 'text-slate-500 hover:text-pink-400'} p-1.5 transition-colors`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={addHeader}
                  className={`mt-2 text-[11px] font-bold flex items-center gap-1 ${isLight ? 'text-indigo-600 hover:text-indigo-700' : 'text-indigo-400 hover:text-indigo-300'}`}
                >
                  <Plus className="w-3 h-3" /> Add Custom Header
                </button>
              </div>
            )}

            {activeTab === 'params' && (
              <div className="space-y-2">
                {params.map((p, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={p.enabled}
                      onChange={(e) => updateParam(i, 'enabled', e.target.checked)}
                      className={`rounded text-indigo-600 focus:ring-indigo-500 ${isLight ? 'border-slate-300 bg-white' : 'border-slate-800 bg-slate-900'}`}
                    />
                    <input
                      type="text"
                      placeholder="Parameter Key"
                      className={`flex-1 border text-xs rounded px-2.5 py-1.5 focus:outline-none focus:border-indigo-500 font-mono ${
                        isLight ? 'bg-white border-slate-200 text-slate-805 placeholder:text-slate-400' : 'bg-slate-900 border-slate-800 text-slate-300'
                      }`}
                      value={p.key}
                      onChange={(e) => updateParam(i, 'key', e.target.value)}
                    />
                    <input
                      type="text"
                      placeholder="Value"
                      className={`flex-1 border text-xs rounded px-2.5 py-1.5 focus:outline-none focus:border-indigo-500 font-mono ${
                        isLight ? 'bg-white border-slate-200 text-slate-805 placeholder:text-slate-400' : 'bg-slate-900 border-slate-800 text-slate-300'
                      }`}
                      value={p.value}
                      onChange={(e) => updateParam(i, 'value', e.target.value)}
                    />
                    <button
                      onClick={() => removeParam(i)}
                      className={`${isLight ? 'text-slate-400 hover:text-red-500' : 'text-slate-500 hover:text-pink-400'} p-1.5 transition-colors`}
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
                <button
                  onClick={addParam}
                  className={`mt-2 text-[11px] font-bold flex items-center gap-1 ${isLight ? 'text-indigo-600 hover:text-indigo-700' : 'text-indigo-400 hover:text-indigo-300'}`}
                >
                  <Plus className="w-3.5 h-3" /> Add Query Parameter
                </button>
              </div>
            )}

            {activeTab === 'body' && (
              <div className="space-y-3">
                <div className="flex gap-4 text-[11px]">
                  <label className={`flex items-center gap-1.5 font-semibold cursor-pointer ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    <input
                      type="radio"
                      name="body-type"
                      checked={bodyType === 'json'}
                      onChange={() => setBodyType('json')}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    JSON (application/json)
                  </label>
                  <label className={`flex items-center gap-1.5 font-semibold cursor-pointer ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    <input
                      type="radio"
                      name="body-type"
                      checked={bodyType === 'text'}
                      onChange={() => setBodyType('text')}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    Plain Text
                  </label>
                  <label className={`flex items-center gap-1.5 font-semibold cursor-pointer ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
                    <input
                      type="radio"
                      name="body-type"
                      checked={bodyType === 'none'}
                      onChange={() => setBodyType('none')}
                      className="text-indigo-600 focus:ring-indigo-500"
                    />
                    None
                  </label>
                </div>

                {bodyType !== 'none' && (
                  <textarea
                    placeholder="Enter raw request payload body... (supports {{variableName}} interpolation)"
                    className={`w-full h-24 border rounded p-2.5 text-xs font-mono focus:outline-none focus:border-indigo-500 resize-none ${
                      isLight ? 'bg-white border-slate-200 text-slate-805 placeholder:text-slate-400' : 'bg-slate-900 border-slate-800 text-slate-200'
                    }`}
                    value={body}
                    onChange={(e) => setBody(e.target.value)}
                  />
                )}
              </div>
            )}

            {activeTab === 'auth' && (
              <div className="space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center gap-3">
                  <label className={`text-xs font-semibold w-24 ${isLight ? 'text-slate-700' : 'text-slate-350'}`}>Auth Protocol:</label>
                  <select
                    value={authType}
                    onChange={(e) => {
                      const val = e.target.value as any;
                      setAuthType(val);
                      saveAuth({ authType: val });
                    }}
                    className={`border text-xs font-semibold rounded px-2.5 py-1.5 focus:outline-none focus:border-indigo-500 font-sans ${
                      isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-800 text-slate-200'
                    }`}
                  >
                    <option value="none">No Auth (Public)</option>
                    <option value="bearer">Bearer Token</option>
                    <option value="basic">Basic Access Auth</option>
                    <option value="apikey">API Key Token</option>
                  </select>
                </div>

                {authType === 'bearer' && (
                  <div className="space-y-1.5 pl-0 sm:pl-28">
                    <label className={`text-[10px] uppercase font-bold tracking-wider ${textMutedClass}`}>Token</label>
                    <input
                      type="text"
                      placeholder="Paste your Authorization token here... (supports {{variableName}})"
                      className={`w-full border text-xs rounded px-3 py-2 focus:outline-none focus:border-indigo-500 font-mono ${
                        isLight ? 'bg-white border-slate-200 text-slate-805' : 'bg-slate-900 border-slate-800 text-slate-300'
                      }`}
                      value={authBearerToken}
                      onChange={(e) => {
                        setAuthBearerToken(e.target.value);
                        saveAuth({ authBearerToken: e.target.value });
                      }}
                    />
                  </div>
                )}

                {authType === 'basic' && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pl-0 sm:pl-28">
                    <div className="space-y-1.5">
                      <label className={`text-[10px] uppercase font-bold tracking-wider ${textMutedClass}`}>Username / Client ID</label>
                      <input
                        type="text"
                        placeholder="admin"
                        className={`w-full border text-xs rounded px-3 py-2 focus:outline-none focus:border-indigo-500 font-mono ${
                          isLight ? 'bg-white border-slate-200 text-slate-805' : 'bg-slate-900 border-slate-800 text-slate-300'
                        }`}
                        value={authBasicUser}
                        onChange={(e) => {
                          setAuthBasicUser(e.target.value);
                          saveAuth({ authBasicUser: e.target.value });
                        }}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className={`text-[10px] uppercase font-bold tracking-wider ${textMutedClass}`}>Password / Secret</label>
                      <input
                        type="password"
                        placeholder="••••••••••••"
                        className={`w-full border text-xs rounded px-3 py-2 focus:outline-none focus:border-indigo-500 font-mono ${
                          isLight ? 'bg-white border-slate-200 text-slate-805' : 'bg-slate-900 border-slate-800 text-slate-300'
                        }`}
                        value={authBasicPass}
                        onChange={(e) => {
                          setAuthBasicPass(e.target.value);
                          saveAuth({ authBasicPass: e.target.value });
                        }}
                      />
                    </div>
                  </div>
                )}

                {authType === 'apikey' && (
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pl-0 sm:pl-28">
                    <div className="space-y-1.5">
                      <label className={`text-[10px] uppercase font-bold tracking-wider ${textMutedClass}`}>Header/Query Key Name</label>
                      <input
                        type="text"
                        placeholder="e.g. X-API-Key"
                        className={`w-full border text-xs rounded px-3 py-2 focus:outline-none focus:border-indigo-500 font-mono ${
                          isLight ? 'bg-white border-slate-200 text-slate-805' : 'bg-slate-900 border-slate-800 text-slate-300'
                        }`}
                        value={authApiKeyName}
                        onChange={(e) => {
                          setAuthApiKeyName(e.target.value);
                          saveAuth({ authApiKeyName: e.target.value });
                        }}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className={`text-[10px] uppercase font-bold tracking-wider ${textMutedClass}`}>Value</label>
                      <input
                        type="text"
                        placeholder="Enter API Key token value..."
                        className={`w-full border text-xs rounded px-3 py-2 focus:outline-none focus:border-indigo-500 font-mono ${
                          isLight ? 'bg-white border-slate-200 text-slate-805' : 'bg-slate-900 border-slate-800 text-slate-300'
                        }`}
                        value={authApiKeyValue}
                        onChange={(e) => {
                          setAuthApiKeyValue(e.target.value);
                          saveAuth({ authApiKeyValue: e.target.value });
                        }}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className={`text-[10px] uppercase font-bold tracking-wider ${textMutedClass}`}>Add To Location</label>
                      <select
                        value={authApiKeyAddTo}
                        onChange={(e) => {
                          const val = e.target.value as 'header' | 'query';
                          setAuthApiKeyAddTo(val);
                          saveAuth({ authApiKeyAddTo: val });
                        }}
                        className={`w-full border text-xs rounded px-3 py-2 focus:outline-none focus:border-indigo-500 font-sans ${
                          isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-800 text-slate-200'
                        }`}
                      >
                        <option value="header">Request Headers</option>
                        <option value="query">Query Parameters</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'env' && (
              <div className="space-y-3">
                <div className={`p-3 rounded-lg border text-[11px] leading-relaxed font-sans ${
                  isLight ? 'bg-indigo-50 border-indigo-150 text-indigo-900' : 'bg-slate-900/50 border-slate-850 text-slate-400'
                }`}>
                  ⚙️ Define environment key-value pairs here. Reference them in the <strong>URL bar, headers, or request body</strong> using double curly brackets: <code>{"{{baseUrl}}"}</code> or <code>{"{{userId}}"}</code>.
                </div>
                <div className="space-y-2">
                  {envVars.map((env, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        checked={env.enabled}
                        onChange={(e) => {
                          const updated = [...envVars];
                          updated[i].enabled = e.target.checked;
                          saveEnv(updated);
                        }}
                        className={`rounded text-indigo-600 focus:ring-indigo-500 ${isLight ? 'border-slate-300 bg-white' : 'border-slate-800 bg-slate-900'}`}
                      />
                      <input
                        type="text"
                        placeholder="Variable Key Name"
                        className={`flex-1 border text-xs rounded px-2.5 py-1.5 focus:outline-none focus:border-indigo-500 font-mono ${
                          isLight ? 'bg-white border-slate-200 text-slate-855 placeholder:text-slate-400' : 'bg-slate-900 border-slate-800 text-slate-300'
                        }`}
                        value={env.key}
                        onChange={(e) => {
                          const updated = [...envVars];
                          updated[i].key = e.target.value;
                          saveEnv(updated);
                        }}
                      />
                      <input
                        type="text"
                        placeholder="Value"
                        className={`flex-1 border text-xs rounded px-2.5 py-1.5 focus:outline-none focus:border-indigo-500 font-mono ${
                          isLight ? 'bg-white border-slate-200 text-slate-855 placeholder:text-slate-400' : 'bg-slate-900 border-slate-800 text-slate-300'
                        }`}
                        value={env.value}
                        onChange={(e) => {
                          const updated = [...envVars];
                          updated[i].value = e.target.value;
                          saveEnv(updated);
                        }}
                      />
                      <button
                        onClick={() => {
                          const updated = envVars.filter((_, idx) => idx !== i);
                          saveEnv(updated);
                        }}
                        className={`${isLight ? 'text-slate-400 hover:text-red-500' : 'text-slate-500 hover:text-pink-400'} p-1.5 transition-colors`}
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                  <button
                    onClick={() => {
                      const updated = [...envVars, { key: '', value: '', enabled: true }];
                      saveEnv(updated);
                    }}
                    className={`mt-2 text-[11px] font-bold flex items-center gap-1 ${isLight ? 'text-indigo-600 hover:text-indigo-700' : 'text-indigo-400 hover:text-indigo-300'}`}
                  >
                    <Plus className="w-3 h-3" /> Add Env Variable
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* RESPONSE SECTION */}
        <div className={`border rounded-xl overflow-hidden flex flex-col h-[400px] ${inputBgClass} ${borderClass}`}>
          <div className={`px-4 py-3 border-b flex items-center justify-between gap-4 flex-wrap sm:flex-nowrap ${panelBgClass} ${borderClass}`}>
            <span className={`text-xs font-semibold font-mono whitespace-nowrap ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>Server Response Panel</span>
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
                <div className="flex items-center gap-2 flex-wrap">
                  {/* Format Toggle for JSON */}
                  {isJson && (
                    <div className={`flex items-center p-0.5 rounded-lg border ${isLight ? 'bg-slate-100 border-slate-250' : 'bg-slate-950 border-slate-850'}`}>
                      <button
                        onClick={() => setResponseViewMode('tree')}
                        className={`px-2 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${
                          responseViewMode === 'tree'
                            ? (isLight ? 'bg-white text-indigo-600 shadow-sm' : 'bg-slate-850 text-indigo-400 font-extrabold shadow-sm')
                            : (isLight ? 'text-slate-500 hover:text-slate-800' : 'text-slate-400 hover:text-slate-200')
                        }`}
                      >
                        Tree View
                      </button>
                      <button
                        onClick={() => setResponseViewMode('raw')}
                        className={`px-2 py-1 rounded text-[10px] font-bold transition-all cursor-pointer ${
                          responseViewMode === 'raw'
                            ? (isLight ? 'bg-white text-indigo-600 shadow-sm' : 'bg-slate-850 text-indigo-400 font-extrabold shadow-sm')
                            : (isLight ? 'text-slate-500 hover:text-slate-800' : 'text-slate-400 hover:text-slate-200')
                        }`}
                      >
                        Raw View
                      </button>
                    </div>
                  )}

                  {/* Tree View Controls */}
                  {isJson && responseViewMode === 'tree' && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={handleExpandAll}
                        title="Expand All Nodes"
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
                        title="Collapse All Nodes"
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

                  {/* Copy as cURL */}
                  <button
                    onClick={handleCopyAsCurl}
                    title="Copy executed request as cURL command"
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 font-sans border cursor-pointer ${
                      isLight 
                        ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800' 
                        : 'bg-slate-950 hover:bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    <Terminal className="w-3 h-3" />
                    cURL
                  </button>

                  {/* Download */}
                  <button
                    onClick={handleDownloadResponse}
                    title="Download response body as a file"
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 font-sans border cursor-pointer ${
                      isLight 
                        ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800' 
                        : 'bg-slate-950 hover:bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    <Download className="w-3 h-3" />
                    Download
                  </button>

                  {/* Copy Response */}
                  <button
                    onClick={handleCopyResponse}
                    title="Copy complete response body"
                    className={`px-2 py-1 rounded-lg text-[10px] font-bold transition-all flex items-center gap-1 font-sans border cursor-pointer ${
                      isLight 
                        ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800' 
                        : 'bg-slate-950 hover:bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
                    }`}
                  >
                    {copied ? <Check className={`w-3 h-3 ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`} /> : <Copy className="w-3 h-3" />}
                    {copied ? 'Copied' : 'Copy'}
                  </button>
                </div>
              );
            })()}
          </div>

          <div className={`flex-1 overflow-auto p-4 relative ${canvasBgClass}`}>
            {loading ? (
              <div className={`absolute inset-0 flex flex-col items-center justify-center space-y-3 backdrop-blur-sm z-10 ${isLight ? 'bg-white/80' : 'bg-slate-950/80'}`}>
                <RefreshCw className="w-8 h-8 text-indigo-500 animate-spin" />
                <p className={`text-xs font-mono ${textMutedClass}`}>Processing REST network protocol...</p>
              </div>
            ) : null}

            {response ? (
              <div className="space-y-4">
                {/* Meta stats */}
                <div className="flex flex-wrap gap-2.5">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-bold font-mono border ${
                    response.status >= 200 && response.status < 300
                      ? (isLight ? 'bg-emerald-50 text-emerald-800 border-emerald-200' : 'bg-emerald-950/30 text-emerald-400 border-emerald-900/40')
                      : response.status >= 400
                      ? (isLight ? 'bg-red-50 text-red-800 border-red-200' : 'bg-pink-950/20 border-pink-900/40 text-pink-300')
                      : (isLight ? 'bg-amber-50 text-amber-800 border-amber-200' : 'bg-amber-950/30 text-amber-400 border-amber-900/40')
                  }`}>
                    STATUS: {response.status} {response.statusText}
                  </span>
                  <span className={`border px-2.5 py-1 rounded-lg text-xs font-semibold font-mono ${
                    isLight ? 'bg-slate-100 border-slate-200 text-slate-850' : 'bg-slate-900 border-slate-800 text-slate-300'
                  }`}>
                    TIME: {response.timeMs} ms
                  </span>
                  <span className={`border px-2.5 py-1 rounded-lg text-xs font-semibold font-mono ${
                    isLight ? 'bg-slate-100 border-slate-200 text-slate-850' : 'bg-slate-900 border-slate-800 text-slate-300'
                  }`}>
                    SIZE: {response.sizeBytes ? `${(response.sizeBytes / 1024).toFixed(2)} KB` : '0 B'}
                  </span>
                </div>

                {/* Error Banner */}
                {response.error && (
                  <div className={`border p-3 rounded-lg text-xs space-y-1 ${
                    isLight ? 'bg-red-50 border-red-200 text-red-850' : 'bg-pink-950/20 border-pink-900/40 text-pink-300'
                  }`}>
                    <div className="flex items-center gap-1 font-bold">
                      <AlertCircle className={`w-4 h-4 ${isLight ? 'text-red-600' : 'text-pink-400'}`} />
                      <span>Request Error Flagged</span>
                    </div>
                    <p className={`font-mono leading-relaxed text-[11px] ${isLight ? 'text-red-700' : 'text-pink-400/90'}`}>{response.error}</p>
                    <div className="pt-1">
                      <button
                        onClick={() => setCorsMode('proxy-simulation')}
                        className={`text-[10px] border px-2 py-1 rounded font-sans font-bold transition-all ${
                          isLight 
                            ? 'bg-red-600 text-white border-red-500 hover:bg-red-700 cursor-pointer' 
                            : 'bg-pink-900/30 text-white border border-pink-700/40 hover:bg-pink-800/40 cursor-pointer'
                        }`}
                      >
                        ⚡ Enable Proxy Bypass Simulation to view success values
                      </button>
                    </div>
                  </div>
                )}

                {/* Response body output */}
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
                        Response Payload ({isJson && responseViewMode === 'tree' ? 'Tree Interactive' : 'Raw Text'}):
                      </span>
                      {isJson && responseViewMode === 'tree' ? (
                        <div className={`p-4 border rounded-lg overflow-x-auto ${
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
                                  Error rendering tree view: {e.message}
                                </span>
                              );
                            }
                          })()}
                        </div>
                      ) : (
                        <pre className={`font-mono text-xs leading-relaxed overflow-x-auto whitespace-pre p-3.5 border rounded-lg ${
                          isLight ? 'bg-slate-50 border-slate-200 text-slate-850' : 'bg-slate-950 border-slate-900 text-slate-200'
                        }`}>
                          {response.body}
                        </pre>
                      )}
                    </div>
                  );
                })()}

                {/* Response Headers */}
                {Object.keys(response.headers).length > 0 && (
                  <div className="space-y-1.5">
                    <span className={`text-[10px] font-mono uppercase block ${textMutedClass}`}>Response Headers:</span>
                    <div className={`border rounded-lg p-3 text-[11px] font-mono space-y-1 ${
                      isLight ? 'bg-slate-50 border-slate-200 text-slate-705' : 'bg-slate-950 border-slate-900 text-slate-400'
                    }`}>
                      {Object.entries(response.headers).map(([key, val]) => (
                        <div key={key} className={`flex justify-between border-b pb-0.5 ${isLight ? 'border-slate-200' : 'border-slate-900/40'}`}>
                          <span className={`${isLight ? 'text-indigo-700' : 'text-indigo-400'} font-medium`}>{key}:</span>
                          <span className={`text-right truncate max-w-md ${isLight ? 'text-slate-850' : 'text-slate-300'}`}>{val}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="h-full flex flex-col items-center justify-center space-y-2">
                <Server className={`w-8 h-8 ${isLight ? 'text-slate-300' : 'text-slate-600'}`} />
                <p className={`text-xs font-mono ${textMutedClass}`}>Awaiting network trigger...</p>
                <p className={`text-[10px] max-w-sm text-center font-sans ${textMutedClass}`}>
                  Choose a method, fill the query and header parameters, and click Send to witness high-fidelity network transport statistics.
                </p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
