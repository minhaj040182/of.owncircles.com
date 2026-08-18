import React, { useState, useEffect } from 'react';
import { 
  Code, 
  FileText, 
  FileCode, 
  Copy, 
  Check, 
  ArrowLeftRight, 
  Download, 
  Trash2, 
  Sparkles, 
  ArrowLeft,
  ShieldCheck,
  Zap,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

export type DevToolType = 'base64' | 'yaml' | 'csv';

interface DeveloperToolsProps {
  initialTool?: DevToolType;
  onBackToHub?: () => void;
}

export const DeveloperTools: React.FC<DeveloperToolsProps> = ({
  initialTool = 'base64',
  onBackToHub
}) => {
  const [activeTool, setActiveTool] = useState<DevToolType>(initialTool);

  // Base64 State
  const [base64Input, setBase64Input] = useState('Welcome to OwnCircles online developer utilities!');
  const [base64Output, setBase64Output] = useState('');
  const [base64Mode, setBase64Mode] = useState<'encode' | 'decode'>('encode');
  const [base64Error, setBase64Error] = useState<string | null>(null);

  // YAML / JSON State
  const [yamlInput, setYamlInput] = useState(
`app:
  name: TrendPulse Hub
  version: 2.5.0
  features:
    - AI YouTube Review Curation
    - Amazon Price Analysis
    - Multiregion Support: true`
  );
  const [yamlOutput, setYamlOutput] = useState('');
  const [yamlMode, setYamlMode] = useState<'yaml2json' | 'json2yaml'>('yaml2json');
  const [yamlError, setYamlError] = useState<string | null>(null);

  // CSV / JSON State
  const [csvInput, setCsvInput] = useState(
`Product,Category,Price,Rating
Apple iPhone 16 Pro Max,Electronics,$1199,4.9
MacBook Pro M4 16-inch,Electronics,$2499,4.9
Samsung Galaxy S24 Ultra,Electronics,$1299,4.8
Smart Air Fryer Multi-Oven,Kitchen,$149,4.7`
  );
  const [csvOutput, setCsvOutput] = useState('');
  const [csvMode, setCsvMode] = useState<'csv2json' | 'json2csv'>('csv2json');
  const [csvError, setCsvError] = useState<string | null>(null);

  const [copied, setCopied] = useState(false);

  // Sync with initialTool changes
  useEffect(() => {
    setActiveTool(initialTool);
  }, [initialTool]);

  // Update SEO for Active Tool
  useEffect(() => {
    const origin = window.location.origin;
    let title = 'Online Developer Utilities | OwnCircles';
    let desc = 'Free, fast, secure online developer tools for Base64 encoding/decoding, YAML to JSON conversion, and CSV to JSON parsing.';
    let slug = '';

    if (activeTool === 'base64') {
      title = 'Base64 Encoder & Decoder Online Tool | OwnCircles';
      desc = 'Free online Base64 encoder and decoder. Convert text, strings, and UTF-8 data to Base64 and decode Base64 strings with zero latency.';
      slug = 'base64-encoder-decoder';
    } else if (activeTool === 'yaml') {
      title = 'YAML to JSON & JSON to YAML Converter | OwnCircles';
      desc = 'Free online YAML to JSON and JSON to YAML converter with syntax validation, formatting, and live error checking.';
      slug = 'yaml-converter';
    } else if (activeTool === 'csv') {
      title = 'CSV to JSON & JSON to CSV Converter | OwnCircles';
      desc = 'Convert CSV tabular data to JSON arrays and JSON objects to clean CSV format instantly online. Fast, secure, client-side.';
      slug = 'csv-to-json';
    }

    document.title = title;

    // Update Meta Description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', desc);

    // Update Canonical URL matching current URL
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', `${origin}/${slug}`);

    // Update OpenGraph tags
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (ogTitle) ogTitle.setAttribute('content', title);
    let ogDesc = document.querySelector('meta[property="og:description"]');
    if (ogDesc) ogDesc.setAttribute('content', desc);
    let ogUrl = document.querySelector('meta[property="og:url"]');
    if (ogUrl) ogUrl.setAttribute('content', `${origin}/${slug}`);
  }, [activeTool]);

  // Base64 Conversion Logic
  useEffect(() => {
    setBase64Error(null);
    if (!base64Input.trim()) {
      setBase64Output('');
      return;
    }

    try {
      if (base64Mode === 'encode') {
        const encoded = btoa(unescape(encodeURIComponent(base64Input)));
        setBase64Output(encoded);
      } else {
        const decoded = decodeURIComponent(escape(atob(base64Input.trim())));
        setBase64Output(decoded);
      }
    } catch (e: any) {
      setBase64Error(`Invalid ${base64Mode === 'encode' ? 'input text' : 'Base64 string format'}: ${e?.message || 'Decoding error'}`);
      setBase64Output('');
    }
  }, [base64Input, base64Mode]);

  // YAML to JSON helper
  const parseSimpleYaml = (yamlStr: string) => {
    const lines = yamlStr.split('\n');
    const result: any = {};
    let currentKey = '';
    let currentList: any[] | null = null;

    for (let rawLine of lines) {
      const line = rawLine.trimEnd();
      if (!line.trim() || line.trim().startsWith('#')) continue;

      const indent = rawLine.search(/\S|$/);
      const trimmed = line.trim();

      if (trimmed.startsWith('- ')) {
        // List item
        const itemVal = trimmed.substring(2).trim();
        if (currentList) {
          currentList.push(parseYamlValue(itemVal));
        } else {
          result.items = result.items || [];
          result.items.push(parseYamlValue(itemVal));
        }
        continue;
      }

      const colonIndex = trimmed.indexOf(':');
      if (colonIndex > 0) {
        const key = trimmed.substring(0, colonIndex).trim();
        const value = trimmed.substring(colonIndex + 1).trim();

        if (value === '') {
          // Parent object or array
          currentKey = key;
          currentList = [];
          result[key] = currentList;
        } else {
          currentKey = key;
          currentList = null;
          result[key] = parseYamlValue(value);
        }
      }
    }
    return result;
  };

  const parseYamlValue = (val: string) => {
    if (val === 'true') return true;
    if (val === 'false') return false;
    if (val === 'null') return null;
    if (!isNaN(Number(val)) && val.trim() !== '') return Number(val);
    if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
      return val.substring(1, val.length - 1);
    }
    return val;
  };

  const jsonToSimpleYaml = (obj: any, indent = 0): string => {
    let yaml = '';
    const spaces = '  '.repeat(indent);

    if (Array.isArray(obj)) {
      for (const item of obj) {
        if (typeof item === 'object' && item !== null) {
          yaml += `${spaces}-\n${jsonToSimpleYaml(item, indent + 1)}`;
        } else {
          yaml += `${spaces}- ${JSON.stringify(item)}\n`;
        }
      }
    } else if (typeof obj === 'object' && obj !== null) {
      for (const key of Object.keys(obj)) {
        const val = obj[key];
        if (typeof val === 'object' && val !== null) {
          yaml += `${spaces}${key}:\n${jsonToSimpleYaml(val, indent + 1)}`;
        } else {
          yaml += `${spaces}${key}: ${typeof val === 'string' ? val : JSON.stringify(val)}\n`;
        }
      }
    } else {
      yaml += `${spaces}${JSON.stringify(obj)}\n`;
    }
    return yaml;
  };

  // YAML Conversion Logic
  useEffect(() => {
    setYamlError(null);
    if (!yamlInput.trim()) {
      setYamlOutput('');
      return;
    }

    try {
      if (yamlMode === 'yaml2json') {
        const parsed = parseSimpleYaml(yamlInput);
        setYamlOutput(JSON.stringify(parsed, null, 2));
      } else {
        const parsed = JSON.parse(yamlInput);
        const converted = jsonToSimpleYaml(parsed);
        setYamlOutput(converted);
      }
    } catch (e: any) {
      setYamlError(`Syntax error during conversion: ${e?.message || 'Invalid syntax'}`);
      setYamlOutput('');
    }
  }, [yamlInput, yamlMode]);

  // CSV to JSON Logic
  const parseCsvToJson = (csv: string) => {
    const lines = csv.trim().split('\n').filter(l => l.trim());
    if (lines.length === 0) return [];
    
    // Auto-detect comma or tab or semicolon
    const firstLine = lines[0];
    let delimiter = ',';
    if (firstLine.includes('\t')) delimiter = '\t';
    else if (firstLine.includes(';') && !firstLine.includes(',')) delimiter = ';';

    const headers = firstLine.split(delimiter).map(h => h.trim().replace(/^["']|["']$/g, ''));
    const rows = [];

    for (let i = 1; i < lines.length; i++) {
      const currentline = lines[i].split(delimiter).map(c => c.trim().replace(/^["']|["']$/g, ''));
      const obj: any = {};
      for (let j = 0; j < headers.length; j++) {
        const val = currentline[j] !== undefined ? currentline[j] : '';
        // Parse numbers if applicable
        if (!isNaN(Number(val)) && val !== '' && !val.startsWith('$') && !val.startsWith('0x')) {
          obj[headers[j]] = Number(val);
        } else {
          obj[headers[j]] = val;
        }
      }
      rows.push(obj);
    }
    return rows;
  };

  const jsonToCsv = (jsonStr: string) => {
    const arr = JSON.parse(jsonStr);
    if (!Array.isArray(arr) || arr.length === 0) {
      throw new Error('Input must be a JSON array of objects, e.g. [{"id": 1, "name": "Item"}]');
    }
    const headers = Object.keys(arr[0]);
    const csvRows = [headers.join(',')];

    for (const item of arr) {
      const values = headers.map(h => {
        const val = item[h] !== undefined ? String(item[h]) : '';
        return val.includes(',') ? `"${val.replace(/"/g, '""')}"` : val;
      });
      csvRows.push(values.join(','));
    }
    return csvRows.join('\n');
  };

  useEffect(() => {
    setCsvError(null);
    if (!csvInput.trim()) {
      setCsvOutput('');
      return;
    }

    try {
      if (csvMode === 'csv2json') {
        const jsonResult = parseCsvToJson(csvInput);
        setCsvOutput(JSON.stringify(jsonResult, null, 2));
      } else {
        const csvResult = jsonToCsv(csvInput);
        setCsvOutput(csvResult);
      }
    } catch (e: any) {
      setCsvError(`CSV Conversion error: ${e?.message || 'Invalid format'}`);
      setCsvOutput('');
    }
  }, [csvInput, csvMode]);

  const handleCopy = (text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = (content: string, filename: string) => {
    if (!content) return;
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const selectTool = (tool: DevToolType) => {
    setActiveTool(tool);
    const slugMap: Record<DevToolType, string> = {
      base64: 'base64-encoder-decoder',
      yaml: 'yaml-converter',
      csv: 'csv-to-json'
    };
    window.history.pushState({}, '', `/${slugMap[tool]}`);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 space-y-8 animate-fadeIn">
      {/* Top Header Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          {onBackToHub && (
            <button
              onClick={onBackToHub}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-bold flex items-center gap-1.5 transition-all"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Review Hub</span>
            </button>
          )}
          <div>
            <div className="flex items-center gap-2">
              <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
                <Code className="w-4 h-4" />
              </span>
              <h1 className="text-xl sm:text-2xl font-black text-white">
                OwnCircles Online Developer Tools
              </h1>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Zero latency, 100% private, client-side data conversion and formatting utilities
            </p>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex flex-wrap items-center gap-2 bg-slate-900/90 p-1.5 rounded-2xl border border-slate-800">
          <button
            onClick={() => selectTool('base64')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeTool === 'base64'
                ? 'bg-amber-500 text-slate-950 shadow-md scale-102'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <Code className="w-3.5 h-3.5" />
            <span>Base64 Encoder / Decoder</span>
          </button>

          <button
            onClick={() => selectTool('yaml')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeTool === 'yaml'
                ? 'bg-amber-500 text-slate-950 shadow-md scale-102'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <FileCode className="w-3.5 h-3.5" />
            <span>YAML &lt;&gt; JSON</span>
          </button>

          <button
            onClick={() => selectTool('csv')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
              activeTool === 'csv'
                ? 'bg-amber-500 text-slate-950 shadow-md scale-102'
                : 'text-slate-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>CSV &lt;&gt; JSON</span>
          </button>
        </div>
      </div>

      {/* TOOL 1: BASE64 ENCODER / DECODER */}
      {activeTool === 'base64' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>Base64 String Encoder &amp; Decoder</span>
                  <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-black px-2 py-0.5 rounded-full border border-emerald-500/20">
                    UTF-8 Safe
                  </span>
                </h2>
                <p className="text-xs text-slate-400">
                  Instantly encode plain text to Base64 or decode Base64 data strings with full UTF-8 Unicode support.
                </p>
              </div>

              {/* Mode Toggle */}
              <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => setBase64Mode('encode')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    base64Mode === 'encode'
                      ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Encode Text ➔ Base64
                </button>
                <button
                  onClick={() => setBase64Mode('decode')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    base64Mode === 'decode'
                      ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Decode Base64 ➔ Text
                </button>
              </div>
            </div>

            {/* Error Message */}
            {base64Error && (
              <div className="bg-rose-950/60 border border-rose-500/40 rounded-xl p-3 text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{base64Error}</span>
              </div>
            )}

            {/* Grid for Input and Output */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Input Area */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300">
                    {base64Mode === 'encode' ? 'Plain Text / UTF-8 Input:' : 'Base64 Encoded Input:'}
                  </label>
                  <button
                    onClick={() => setBase64Input('')}
                    className="text-[11px] text-slate-400 hover:text-rose-400 flex items-center gap-1 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Clear</span>
                  </button>
                </div>

                <textarea
                  rows={10}
                  value={base64Input}
                  onChange={(e) => setBase64Input(e.target.value)}
                  placeholder={base64Mode === 'encode' ? 'Type or paste text to encode...' : 'Paste Base64 string here (e.g. V2VsY29tZSE=)...'}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>

              {/* Output Area */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {base64Mode === 'encode' ? 'Base64 Result Output:' : 'Decoded Plain Text Output:'}
                  </label>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopy(base64Output)}
                      disabled={!base64Output}
                      className="px-3 py-1 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1 transition-all shadow-xs"
                    >
                      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>

                    <button
                      onClick={() => handleDownload(base64Output, `base64_${base64Mode}_result.txt`)}
                      disabled={!base64Output}
                      className="px-3 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 font-bold text-xs rounded-lg flex items-center gap-1 transition-all"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Save</span>
                    </button>
                  </div>
                </div>

                <div className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-mono text-emerald-300 min-h-[235px] max-h-[235px] overflow-y-auto break-all whitespace-pre-wrap leading-relaxed">
                  {base64Output || <span className="text-slate-600 italic">Result output will generate automatically...</span>}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TOOL 2: YAML CONVERTER */}
      {activeTool === 'yaml' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>YAML &lt;&gt; JSON Converter &amp; Validator</span>
                  <span className="bg-blue-500/10 text-blue-400 text-[10px] font-black px-2 py-0.5 rounded-full border border-blue-500/20">
                    Interactive Formatter
                  </span>
                </h2>
                <p className="text-xs text-slate-400">
                  Convert YAML configuration files to JSON data or convert JSON objects to structured YAML format.
                </p>
              </div>

              {/* Mode Toggle */}
              <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => {
                    setYamlMode('yaml2json');
                    setYamlInput(
`server:
  port: 3000
  host: 0.0.0.0
database:
  type: mysql
  enabled: true`
                    );
                  }}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    yamlMode === 'yaml2json'
                      ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  YAML ➔ JSON
                </button>
                <button
                  onClick={() => {
                    setYamlMode('json2yaml');
                    setYamlInput(JSON.stringify({ name: "TrendPulse", version: "2.5.0", active: true }, null, 2));
                  }}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    yamlMode === 'json2yaml'
                      ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  JSON ➔ YAML
                </button>
              </div>
            </div>

            {/* Error Message */}
            {yamlError && (
              <div className="bg-rose-950/60 border border-rose-500/40 rounded-xl p-3 text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{yamlError}</span>
              </div>
            )}

            {/* Grid for Input and Output */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Input Area */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300">
                    {yamlMode === 'yaml2json' ? 'YAML Input Data:' : 'JSON Input Data:'}
                  </label>
                  <button
                    onClick={() => setYamlInput('')}
                    className="text-[11px] text-slate-400 hover:text-rose-400 flex items-center gap-1 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Clear</span>
                  </button>
                </div>

                <textarea
                  rows={10}
                  value={yamlInput}
                  onChange={(e) => setYamlInput(e.target.value)}
                  placeholder={yamlMode === 'yaml2json' ? 'Paste YAML content...' : 'Paste valid JSON string...'}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>

              {/* Output Area */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {yamlMode === 'yaml2json' ? 'Formatted JSON Output:' : 'Formatted YAML Output:'}
                  </label>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopy(yamlOutput)}
                      disabled={!yamlOutput}
                      className="px-3 py-1 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1 transition-all shadow-xs"
                    >
                      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>

                    <button
                      onClick={() => handleDownload(yamlOutput, yamlMode === 'yaml2json' ? 'converted.json' : 'converted.yaml')}
                      disabled={!yamlOutput}
                      className="px-3 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 font-bold text-xs rounded-lg flex items-center gap-1 transition-all"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Save</span>
                    </button>
                  </div>
                </div>

                <div className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-mono text-emerald-300 min-h-[235px] max-h-[235px] overflow-y-auto break-all whitespace-pre-wrap leading-relaxed">
                  {yamlOutput || <span className="text-slate-600 italic">Formatted output will render automatically...</span>}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TOOL 3: CSV TO JSON */}
      {activeTool === 'csv' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <span>CSV &lt;&gt; JSON Converter &amp; Table Parser</span>
                  <span className="bg-purple-500/10 text-purple-400 text-[10px] font-black px-2 py-0.5 rounded-full border border-purple-500/20">
                    Auto-Delimiter Detection
                  </span>
                </h2>
                <p className="text-xs text-slate-400">
                  Parse CSV spreadsheets and comma-separated lists into JSON object arrays or export JSON data to CSV spreadsheets.
                </p>
              </div>

              {/* Mode Toggle */}
              <div className="flex items-center gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => setCsvMode('csv2json')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    csvMode === 'csv2json'
                      ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  CSV ➔ JSON
                </button>
                <button
                  onClick={() => {
                    setCsvMode('json2csv');
                    setCsvInput(
JSON.stringify([
  { id: 1, name: "Flagship Smartphone", price: "$1199", inStock: true },
  { id: 2, name: "M4 Ultra Laptop", price: "$2499", inStock: true }
], null, 2)
                    );
                  }}
                  className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                    csvMode === 'json2csv'
                      ? 'bg-amber-500 text-slate-950 font-black shadow-xs'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  JSON ➔ CSV
                </button>
              </div>
            </div>

            {/* Error Message */}
            {csvError && (
              <div className="bg-rose-950/60 border border-rose-500/40 rounded-xl p-3 text-xs text-rose-300 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{csvError}</span>
              </div>
            )}

            {/* Grid for Input and Output */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Input Area */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300">
                    {csvMode === 'csv2json' ? 'CSV Tabular Input (comma/tab delimited):' : 'JSON Array Input:'}
                  </label>
                  <button
                    onClick={() => setCsvInput('')}
                    className="text-[11px] text-slate-400 hover:text-rose-400 flex items-center gap-1 transition-colors"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>Clear</span>
                  </button>
                </div>

                <textarea
                  rows={10}
                  value={csvInput}
                  onChange={(e) => setCsvInput(e.target.value)}
                  placeholder={csvMode === 'csv2json' ? 'Header1,Header2,Header3\nValue1,Value2,Value3' : '[{"key": "value"}]'}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs text-white placeholder-slate-500 font-mono focus:outline-none focus:ring-2 focus:ring-amber-500/50"
                />
              </div>

              {/* Output Area */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {csvMode === 'csv2json' ? 'Parsed JSON Array Output:' : 'Generated CSV Output:'}
                  </label>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleCopy(csvOutput)}
                      disabled={!csvOutput}
                      className="px-3 py-1 bg-amber-500 hover:bg-amber-400 disabled:opacity-50 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1 transition-all shadow-xs"
                    >
                      {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copied ? 'Copied' : 'Copy'}</span>
                    </button>

                    <button
                      onClick={() => handleDownload(csvOutput, csvMode === 'csv2json' ? 'output.json' : 'output.csv')}
                      disabled={!csvOutput}
                      className="px-3 py-1 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 font-bold text-xs rounded-lg flex items-center gap-1 transition-all"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Save</span>
                    </button>
                  </div>
                </div>

                <div className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-mono text-emerald-300 min-h-[235px] max-h-[235px] overflow-y-auto break-all whitespace-pre-wrap leading-relaxed">
                  {csvOutput || <span className="text-slate-600 italic">Converted records will show here...</span>}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SEO & Knowledge Section for Search Engines */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4 text-xs text-slate-400">
        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl space-y-2">
          <div className="flex items-center gap-1.5 text-amber-400 font-bold">
            <Zap className="w-4 h-4" />
            <span>100% Client-Side Execution</span>
          </div>
          <p className="text-slate-400 leading-relaxed">
            All encoding, decoding, and parsing operations run securely inside your web browser. No data or sensitive strings are ever uploaded to remote servers.
          </p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl space-y-2">
          <div className="flex items-center gap-1.5 text-emerald-400 font-bold">
            <ShieldCheck className="w-4 h-4" />
            <span>UTF-8 &amp; Unicode Compliant</span>
          </div>
          <p className="text-slate-400 leading-relaxed">
            Full support for multilingual text, emojis, escape sequences, and multi-line strings without corrupting characters.
          </p>
        </div>

        <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl space-y-2">
          <div className="flex items-center gap-1.5 text-blue-400 font-bold">
            <Sparkles className="w-4 h-4" />
            <span>Instant Format Export</span>
          </div>
          <p className="text-slate-400 leading-relaxed">
            Copy outputs directly to clipboard or download formatted JSON, YAML, and CSV files with one click.
          </p>
        </div>
      </div>
    </div>
  );
};
