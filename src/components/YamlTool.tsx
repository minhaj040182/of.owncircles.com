import React, { useState } from 'react';
import { Copy, Check, Trash2, Code, Sparkles, RefreshCw, AlertCircle, CheckCircle, FileText, BookOpen, HelpCircle } from 'lucide-react';

// Lightweight, resilient JSON-to-YAML generator
function jsonToYaml(val: any, indent: number = 0): string {
  const spacing = ' '.repeat(indent);
  if (val === null) return 'null';
  if (typeof val === 'undefined') return '';
  if (typeof val === 'string') {
    if (val.includes('\n')) {
      return '|\n' + val.split('\n').map(line => ' '.repeat(indent + 2) + line).join('\n');
    }
    if (val.includes(':') || val.includes('#') || val.startsWith('-') || val.startsWith('{') || val.startsWith('[')) {
      return JSON.stringify(val);
    }
    return val || '""';
  }
  if (typeof val !== 'object') return String(val);

  if (Array.isArray(val)) {
    if (val.length === 0) return '[]';
    return val.map(item => {
      const formattedItem = jsonToYaml(item, indent + 2).trim();
      if (typeof item === 'object' && item !== null && !Array.isArray(item)) {
        const lines = jsonToYaml(item, indent + 2).split('\n');
        const firstLine = lines[0].trim();
        const otherLines = lines.slice(1).join('\n');
        return `${spacing}- ${firstLine}${otherLines ? '\n' + otherLines : ''}`;
      }
      return `${spacing}- ${formattedItem}`;
    }).join('\n');
  }

  const keys = Object.keys(val);
  if (keys.length === 0) return '{}';
  return keys.map(key => {
    const child = val[key];
    const safeKey = /^[a-zA-Z_][a-zA-Z0-9_-]*$/.test(key) ? key : JSON.stringify(key);
    if (typeof child === 'object' && child !== null) {
      const childYaml = jsonToYaml(child, indent + 2);
      return `${spacing}${safeKey}:\n${childYaml}`;
    }
    return `${spacing}${safeKey}: ${jsonToYaml(child, indent + 2).trim()}`;
  }).join('\n');
}

// Light parsing helper for YAML-to-JSON conversion
function yamlToJson(yamlStr: string): any {
  const lines = yamlStr.split('\n');
  const root: any = {};
  const path: { indent: number; ref: any; key?: string }[] = [{ indent: -1, ref: root }];

  for (let line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#') || trimmed.startsWith('---')) continue;

    const indent = line.length - line.trimStart().length;

    if (trimmed.startsWith('-')) {
      const itemValStr = trimmed.substring(1).trim();
      let itemVal: any = itemValStr;
      if (itemValStr === 'true') itemVal = true;
      else if (itemValStr === 'false') itemVal = false;
      else if (itemValStr === 'null') itemVal = null;
      else if (!isNaN(Number(itemValStr)) && itemValStr !== '') itemVal = Number(itemValStr);

      while (path.length > 1 && path[path.length - 1].indent >= indent) {
        path.pop();
      }
      const parent = path[path.length - 1];

      if (parent.key) {
        if (!Array.isArray(parent.ref[parent.key])) {
          parent.ref[parent.key] = [];
        }
        if (itemValStr.includes(':')) {
          const colonIdx = itemValStr.indexOf(':');
          const k = itemValStr.substring(0, colonIdx).trim();
          const v = itemValStr.substring(colonIdx + 1).trim();
          const subObj: any = {};
          subObj[k] = v === 'true' ? true : v === 'false' ? false : !isNaN(Number(v)) && v !== '' ? Number(v) : v.replace(/^['"]|['"]$/g, '');
          parent.ref[parent.key].push(subObj);
          path.push({ indent: indent + 2, ref: subObj });
        } else {
          parent.ref[parent.key].push(itemVal);
        }
      }
    } else {
      const colonIndex = trimmed.indexOf(':');
      if (colonIndex === -1) continue;
      const key = trimmed.substring(0, colonIndex).trim().replace(/^['"]|['"]$/g, '');
      const valStr = trimmed.substring(colonIndex + 1).trim();

      let val: any = valStr;
      if (valStr === 'true') val = true;
      else if (valStr === 'false') val = false;
      else if (valStr === 'null') val = null;
      else if (valStr.startsWith('"') && valStr.endsWith('"')) val = valStr.slice(1, -1);
      else if (valStr.startsWith("'") && valStr.endsWith("'")) val = valStr.slice(1, -1);
      else if (!isNaN(Number(valStr)) && valStr !== '') val = Number(valStr);

      while (path.length > 1 && path[path.length - 1].indent >= indent) {
        path.pop();
      }

      const parent = path[path.length - 1];
      if (valStr === '') {
        parent.ref[key] = {};
        path.push({ indent, ref: parent.ref[key], key });
      } else {
        parent.ref[key] = val;
        path.push({ indent, ref: parent.ref, key });
      }
    }
  }
  return root;
}

const SAMPLE_JSON = `{
  "appName": "OwnFormatters",
  "version": "2.4.0",
  "developer": {
    "organization": "OwnCircles",
    "secure": true,
    "activeUsers": 1250
  },
  "supportedFormats": ["JSON", "YAML", "XML", "SQL"],
  "features": {
    "sandbox": "Encrypted",
    "adSupported": true
  }
}`;

const SAMPLE_YAML = `appName: OwnFormatters
version: 2.4.0
developer:
  organization: OwnCircles
  secure: true
  activeUsers: 1250
supportedFormats:
  - JSON
  - YAML
  - XML
  - SQL
features:
  sandbox: Encrypted
  adSupported: true`;

interface YamlToolProps {
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

export default function YamlTool({ theme }: YamlToolProps) {
  const [input, setInput] = useState<string>('');
  const [output, setOutput] = useState<string>('');
  const [direction, setDirection] = useState<'json2yaml' | 'yaml2json'>('json2yaml');
  const [status, setStatus] = useState<{ type: 'idle' | 'success' | 'error'; message: string }>({ type: 'idle', message: '' });
  const [copied, setCopied] = useState<boolean>(false);

  const handleConvert = () => {
    if (!input.trim()) {
      setStatus({ type: 'error', message: 'Please paste some input data first.' });
      return;
    }

    try {
      if (direction === 'json2yaml') {
        // JSON -> YAML
        const parsed = JSON.parse(input);
        const yaml = jsonToYaml(parsed);
        setOutput(yaml);
        setStatus({ type: 'success', message: 'Successfully parsed JSON and formatted as YAML!' });
      } else {
        // YAML -> JSON
        const parsed = yamlToJson(input);
        const json = JSON.stringify(parsed, null, 2);
        setOutput(json);
        setStatus({ type: 'success', message: 'Successfully parsed YAML and formatted as JSON!' });
      }
    } catch (err: any) {
      setOutput('');
      setStatus({ type: 'error', message: `Parse Error: ${err.message || 'Make sure the syntax is correct'}` });
    }
  };

  const handleLoadSample = () => {
    if (direction === 'json2yaml') {
      setInput(SAMPLE_JSON);
    } else {
      setInput(SAMPLE_YAML);
    }
    setOutput('');
    setStatus({ type: 'idle', message: '' });
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
    setStatus({ type: 'idle', message: '' });
  };

  const handleCopy = () => {
    const textToCopy = output || input;
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleDirection = () => {
    const nextDirection = direction === 'json2yaml' ? 'yaml2json' : 'json2yaml';
    setDirection(nextDirection);
    // Swap input and output to maintain workflow
    setInput(output);
    setOutput('');
    setStatus({ type: 'idle', message: '' });
  };

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

  return (
    <div className="space-y-6" id="yaml-converter-tool">
      
      {/* Settings Panel */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border p-4 rounded-xl ${cardClass} ${borderClass}`}>
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={toggleDirection}
            className={`flex items-center gap-2 border text-xs font-semibold px-3.5 py-2 rounded-lg transition-all ${
              isLight 
                ? 'bg-indigo-50 border-indigo-200 text-indigo-700 hover:bg-indigo-100' 
                : 'bg-indigo-600/10 hover:bg-indigo-600/20 border-indigo-500/30 text-indigo-300 hover:text-white'
            }`}
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Mode: {direction === 'json2yaml' ? 'JSON to YAML' : 'YAML to JSON'}</span>
          </button>

          <button
            onClick={handleLoadSample}
            className={`border text-xs font-semibold px-3 py-2 rounded-lg transition-all ${
              isLight 
                ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800' 
                : 'bg-slate-950 hover:bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            Load Example
          </button>
        </div>

        <span className={`text-xs font-mono flex items-center gap-1.5 ${textMutedClass}`}>
          <FileText className={`w-3.5 h-3.5 ${isLight ? 'text-indigo-600' : 'text-indigo-400'}`} />
          Bidirectional Parser / Zero Logs
        </span>
      </div>

      {/* Editor Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Pane */}
        <div className={`flex flex-col h-[380px] border rounded-xl overflow-hidden shadow-lg ${inputBgClass} ${borderClass}`}>
          <div className={`px-4 py-3 border-b flex items-center justify-between ${panelBgClass} ${borderClass}`}>
            <span className={`text-xs font-semibold font-mono ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>
              {direction === 'json2yaml' ? 'Raw JSON Input' : 'Raw YAML Input'}
            </span>
            <button
              onClick={handleClear}
              className={`${isLight ? 'text-slate-500 hover:text-red-600' : 'text-slate-400 hover:text-pink-400'} p-1 rounded transition-colors`}
              title="Clear Input"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          <textarea
            className={`flex-1 w-full p-4 font-mono text-xs leading-relaxed focus:outline-none resize-none bg-transparent ${textClass} ${
              isLight ? 'placeholder:text-slate-400' : 'placeholder:text-slate-650'
            }`}
            placeholder={direction === 'json2yaml' ? 'Paste valid JSON structure here...' : 'Paste clean YAML structure here...'}
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <div className={`px-4 py-2 border-t text-[10px] font-mono ${panelBgClass} ${borderMutedClass} ${textMutedClass}`}>
            <span>Size: {input.length} characters</span>
          </div>
        </div>

        {/* Output Pane */}
        <div className={`flex flex-col h-[380px] border rounded-xl overflow-hidden shadow-lg ${inputBgClass} ${borderClass}`}>
          <div className={`px-4 py-3 border-b flex items-center justify-between ${panelBgClass} ${borderClass}`}>
            <span className={`text-xs font-semibold font-mono ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>
              {direction === 'json2yaml' ? 'Formatted YAML Output' : 'Formatted JSON Output'}
            </span>
            <button
              onClick={handleCopy}
              className={`border px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 font-sans ${
                isLight 
                  ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800' 
                  : 'bg-slate-950 hover:bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3 h-3" />}
              <span>Copy</span>
            </button>
          </div>
          <div className={`flex-1 overflow-auto p-4 ${canvasBgClass}`}>
            {output ? (
              <pre className={`font-mono text-xs leading-relaxed whitespace-pre select-all ${isLight ? 'text-emerald-800' : 'text-emerald-300'}`}>{output}</pre>
            ) : (
              <div className="h-full flex flex-col items-center justify-center space-y-2">
                <Code className={`w-6 h-6 ${isLight ? 'text-slate-300' : 'text-slate-800'}`} />
                <p className={`text-xs font-mono ${textMutedClass}`}>Output parsed stream ready</p>
              </div>
            )}
          </div>
          <div className={`px-4 py-2 border-t text-[10px] font-mono ${panelBgClass} ${borderMutedClass} ${textMutedClass}`}>
            <span>Size: {output.length} characters</span>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <button
          onClick={handleConvert}
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-6 py-3 rounded-xl shadow-md transition-all active:scale-[0.98] flex items-center gap-2 cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-white" />
          <span>Convert Content</span>
        </button>

        {status.type !== 'idle' && (
          <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium border font-mono ${
            status.type === 'success' 
              ? (isLight ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-emerald-950/20 border-emerald-900/40 text-emerald-300')
              : (isLight ? 'bg-red-50 border-red-200 text-red-800' : 'bg-pink-950/20 border-pink-900/40 text-pink-300')
          }`}>
            {status.type === 'success' ? (
              <CheckCircle className={`w-4 h-4 ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`} />
            ) : (
              <AlertCircle className={`w-4 h-4 ${isLight ? 'text-red-600' : 'text-red-400'}`} />
            )}
            <span>{status.message}</span>
          </div>
        )}
      </div>

      {/* HIGH VALUE DOCUMENTATION SECTION FOR GOOGLE ADSENSE COMPLIANCE */}
      <div className={`mt-12 border rounded-xl p-6 md:p-8 space-y-6 ${cardClass} ${borderClass}`}>
        <div className={`flex items-center gap-2.5 border-b pb-4 ${borderClass}`}>
          <BookOpen className={`w-5 h-5 ${isLight ? 'text-indigo-600' : 'text-indigo-400'}`} />
          <h3 className={`text-base font-bold font-sans ${isLight ? 'text-slate-900' : 'text-white'}`}>YAML & JSON Structured Format Reference Guide</h3>
        </div>

        <div className={`grid grid-cols-1 md:grid-cols-2 gap-8 text-xs leading-relaxed ${textMutedClass}`}>
          <div className="space-y-4">
            <h4 className={`text-sm font-bold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>What is YAML?</h4>
            <p>
              YAML (which stands recursively for <strong>YAML Ain't Markup Language</strong>) is a human-friendly, highly legible data serialization standard. It is primarily used for configuration files, infrastructure orchestration systems (like Kubernetes, Docker Compose, Ansible), and modern static sites. YAML represents hierarchies using spacing and indents rather than curly braces, semicolons, or markup tag elements.
            </p>
            <h4 className={`text-sm font-bold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>Key Advantages of YAML Over JSON:</h4>
            <ul className="list-disc list-inside space-y-1 pl-1">
              <li><strong>Enhanced Readability:</strong> Far less visual clutter with no double quotes or trailing commas.</li>
              <li><strong>Inline Comments Support:</strong> Unlike JSON, YAML supports inline descriptions using the hash (<code className={isLight ? 'text-indigo-600 bg-slate-50 px-1 py-0.5' : 'text-indigo-400 bg-slate-900/50 px-1 py-0.5'}>#</code>) symbol.</li>
              <li><strong>Multi-line Strings:</strong> Easily format paragraphs using the block scaler indicator pipe (<code className={isLight ? 'text-indigo-600 bg-slate-50 px-1 py-0.5' : 'text-indigo-400 bg-slate-900/50 px-1 py-0.5'}>|</code>) symbol.</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className={`text-sm font-bold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>How Does This Converter Work?</h4>
            <p>
              This utility offers bi-directional processing between YAML structure and RFC 8259 JSON standards. The process takes place 100% inside your web browser. No variables, headers, keys, or configurations are ever dispatched to a server, guaranteeing that private development keys and customer configurations remain secure on your system.
            </p>
            <div className={`p-4 rounded-xl border space-y-2 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/50 border-slate-850'}`}>
              <span className={`font-bold block ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>Frequently Asked Questions (FAQs):</span>
              <p><strong>Q: Why does my converted JSON have quotes around keys?</strong></p>
              <p className={isLight ? 'text-slate-600' : 'text-slate-500'}>A: Unlike YAML, the official JSON specification strictly mandates that all object keys must be enclosed in double quotes.</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
