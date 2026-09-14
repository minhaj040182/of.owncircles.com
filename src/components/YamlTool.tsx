import React, { useState } from 'react';
import YAML from 'yaml';
import { 
  Copy, 
  Check, 
  Trash2, 
  Code, 
  Sparkles, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle, 
  FileText, 
  BookOpen, 
  HelpCircle, 
  Download, 
  ArrowRight, 
  ShieldCheck, 
  CheckCheck,
  Compass,
  FileCheck
} from 'lucide-react';

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

type OperationMode = 'format-yaml' | 'yaml-to-json' | 'json-to-yaml' | 'validate-yaml';

const SAMPLE_YAML = `# OwnFormatters YAML Configuration Sample
appName: OwnFormatters
version: "2.4.0"
active: true
license: MIT
metadata:
  environment: production
  offlineMode: true
  maxPayloadMB: 10
features:
  - JSON Formatter & Beautifier
  - YAML Formatter & Converter
  - Cron Expression Parser
  - Base64 Encoder / Decoder
serverless:
  runtime: nodejs20
  timeoutSeconds: 30
  retryOnFailure: false`;

const SAMPLE_JSON = `{
  "appName": "OwnFormatters",
  "version": "2.4.0",
  "active": true,
  "license": "MIT",
  "metadata": {
    "environment": "production",
    "offlineMode": true,
    "maxPayloadMB": 10
  },
  "features": [
    "JSON Formatter & Beautifier",
    "YAML Formatter & Converter",
    "Cron Expression Parser",
    "Base64 Encoder / Decoder"
  ],
  "serverless": {
    "runtime": "nodejs20",
    "timeoutSeconds": 30,
    "retryOnFailure": false
  }
}`;

function extractYamlError(err: any): { message: string; line?: number; col?: number } {
  if (!err) return { message: 'Unknown parsing error' };
  let line: number | undefined;
  let col: number | undefined;
  if (err.linePos && Array.isArray(err.linePos) && err.linePos.length > 0) {
    line = err.linePos[0].line;
    col = err.linePos[0].col;
  }
  let msg = err.message || String(err);
  const colonIdx = msg.indexOf(':\n');
  if (colonIdx !== -1) {
    msg = msg.substring(0, colonIdx).trim();
  }
  return { message: msg, line, col };
}

export default function YamlTool({ theme }: YamlToolProps) {
  const [input, setInput] = useState<string>('');
  const [output, setOutput] = useState<string>('');
  const [mode, setMode] = useState<OperationMode>('format-yaml');
  const [indentSpaces, setIndentSpaces] = useState<number>(2);
  const [status, setStatus] = useState<{ 
    type: 'idle' | 'success' | 'error'; 
    message: string; 
    line?: number; 
    col?: number;
  }>({ type: 'idle', message: '' });
  const [copied, setCopied] = useState<boolean>(false);

  // Execute active operation (Format, YAML->JSON, JSON->YAML, Validate)
  const handleExecute = (targetMode?: OperationMode) => {
    const activeMode = targetMode || mode;
    if (!input.trim()) {
      setStatus({ type: 'error', message: 'Please paste or enter input data before running the operation.' });
      return;
    }

    try {
      if (activeMode === 'format-yaml') {
        const docs = YAML.parseAllDocuments(input);
        // Check for syntax errors across all documents
        for (const doc of docs) {
          if (doc.errors && doc.errors.length > 0) {
            const errInfo = extractYamlError(doc.errors[0]);
            setStatus({ 
              type: 'error', 
              message: `YAML Syntax Error: ${errInfo.message}`, 
              line: errInfo.line, 
              col: errInfo.col 
            });
            setOutput('');
            return;
          }
        }
        const formatted = docs.map(d => d.toString({ indent: indentSpaces }).trim()).join('\n---\n') + '\n';
        setOutput(formatted);
        setStatus({ 
          type: 'success', 
          message: `Valid YAML 1.2 syntax! Formatted with ${indentSpaces}-space indentation.` 
        });
      } else if (activeMode === 'yaml-to-json') {
        const docs = YAML.parseAllDocuments(input, { merge: true });
        for (const doc of docs) {
          if (doc.errors && doc.errors.length > 0) {
            const errInfo = extractYamlError(doc.errors[0]);
            setStatus({ 
              type: 'error', 
              message: `YAML Parse Error: ${errInfo.message}`, 
              line: errInfo.line, 
              col: errInfo.col 
            });
            setOutput('');
            return;
          }
        }
        let jsonVal: any;
        if (docs.length === 1) {
          jsonVal = docs[0].toJSON();
        } else if (docs.length > 1) {
          jsonVal = docs.map(d => d.toJSON());
        } else {
          jsonVal = {};
        }
        const jsonStr = JSON.stringify(jsonVal, null, indentSpaces);
        setOutput(jsonStr);
        setStatus({ 
          type: 'success', 
          message: `Successfully converted YAML to RFC 8259 JSON (${docs.length} document${docs.length > 1 ? 's' : ''})!` 
        });
      } else if (activeMode === 'json-to-yaml') {
        let parsedJson: any;
        try {
          parsedJson = JSON.parse(input);
        } catch (jsonErr: any) {
          setStatus({ 
            type: 'error', 
            message: `Invalid JSON: ${jsonErr.message || 'Check braces, brackets, and quotes'}` 
          });
          setOutput('');
          return;
        }
        const yamlStr = YAML.stringify(parsedJson, { indent: indentSpaces });
        setOutput(yamlStr);
        setStatus({ 
          type: 'success', 
          message: `Successfully converted JSON to clean YAML with ${indentSpaces}-space indentation!` 
        });
      } else if (activeMode === 'validate-yaml') {
        const docs = YAML.parseAllDocuments(input);
        for (const doc of docs) {
          if (doc.errors && doc.errors.length > 0) {
            const errInfo = extractYamlError(doc.errors[0]);
            setStatus({ 
              type: 'error', 
              message: `YAML Validation Failed: ${errInfo.message}`, 
              line: errInfo.line, 
              col: errInfo.col 
            });
            return;
          }
        }
        setStatus({ 
          type: 'success', 
          message: `Valid YAML! 0 errors detected across ${docs.length} document${docs.length > 1 ? 's' : ''}.` 
        });
      }
    } catch (err: any) {
      setOutput('');
      const errInfo = extractYamlError(err);
      setStatus({ 
        type: 'error', 
        message: errInfo.message || 'An unexpected parsing error occurred',
        line: errInfo.line,
        col: errInfo.col
      });
    }
  };

  const handleSelectMode = (newMode: OperationMode) => {
    setMode(newMode);
    setStatus({ type: 'idle', message: '' });
  };

  const handleLoadSample = (sampleType: 'yaml' | 'json') => {
    if (sampleType === 'yaml') {
      setInput(SAMPLE_YAML);
      setMode('format-yaml');
    } else {
      setInput(SAMPLE_JSON);
      setMode('json-to-yaml');
    }
    setOutput('');
    setStatus({ type: 'idle', message: '' });
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
    setStatus({ type: 'idle', message: '' });
  };

  const handleSwapOutputToInput = () => {
    if (!output) return;
    setInput(output);
    setOutput('');
    // Switch mode logically
    if (mode === 'yaml-to-json') {
      setMode('json-to-yaml');
    } else if (mode === 'json-to-yaml') {
      setMode('format-yaml');
    }
    setStatus({ type: 'idle', message: '' });
  };

  const handleCopy = () => {
    const textToCopy = output || input;
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    const content = output || input;
    if (!content) return;
    const isJson = mode === 'yaml-to-json';
    const filename = isJson ? 'converted-output.json' : 'formatted-output.yaml';
    const mimeType = isJson ? 'application/json' : 'text/yaml';
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleInternalNav = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    if (!e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      window.history.pushState(null, '', path);
      window.dispatchEvent(new PopStateEvent('popstate'));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Theme styling helpers
  const borderClass = theme?.border || 'border-slate-800/80';
  const borderMutedClass = theme?.borderMuted || 'border-slate-850';
  const cardClass = theme?.card || 'bg-slate-900/50';
  const inputBgClass = theme?.inputBg || 'bg-slate-950';
  const panelBgClass = theme?.panelBg || 'bg-slate-900';
  const textClass = theme?.text || 'text-slate-200';
  const textMutedClass = theme?.textMuted || 'text-slate-400';
  const canvasBgClass = theme?.canvasBg || 'bg-[#02050c]';
  const isLight = theme?.isDark === false;

  const inputLineCount = input ? input.split('\n').length : 0;
  const outputLineCount = output ? output.split('\n').length : 0;

  return (
    <div className="space-y-6" id="yaml-tool-workspace">
      
      {/* TOOL WORKSPACE CONTROLS HEADER */}
      <section 
        aria-label="YAML Tool Controls"
        className={`flex flex-col gap-4 border p-4 rounded-xl shadow-sm ${cardClass} ${borderClass}`}
      >
        {/* Row 1: Mode Selectors */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Select operation mode">
            <button
              onClick={() => handleSelectMode('format-yaml')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                mode === 'format-yaml'
                  ? (isLight ? 'bg-indigo-600 text-white shadow-sm' : 'bg-indigo-600 text-white shadow-sm')
                  : (isLight ? 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50' : 'bg-slate-950 border border-slate-800 text-slate-300 hover:bg-slate-900')
              }`}
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Format YAML</span>
            </button>

            <button
              onClick={() => handleSelectMode('yaml-to-json')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                mode === 'yaml-to-json'
                  ? (isLight ? 'bg-indigo-600 text-white shadow-sm' : 'bg-indigo-600 text-white shadow-sm')
                  : (isLight ? 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50' : 'bg-slate-950 border border-slate-800 text-slate-300 hover:bg-slate-900')
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              <span>YAML to JSON</span>
            </button>

            <button
              onClick={() => handleSelectMode('json-to-yaml')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                mode === 'json-to-yaml'
                  ? (isLight ? 'bg-indigo-600 text-white shadow-sm' : 'bg-indigo-600 text-white shadow-sm')
                  : (isLight ? 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50' : 'bg-slate-950 border border-slate-800 text-slate-300 hover:bg-slate-900')
              }`}
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>JSON to YAML</span>
            </button>

            <button
              onClick={() => handleSelectMode('validate-yaml')}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                mode === 'validate-yaml'
                  ? (isLight ? 'bg-indigo-600 text-white shadow-sm' : 'bg-indigo-600 text-white shadow-sm')
                  : (isLight ? 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50' : 'bg-slate-950 border border-slate-800 text-slate-300 hover:bg-slate-900')
              }`}
            >
              <FileCheck className="w-3.5 h-3.5" />
              <span>Validate Only</span>
            </button>
          </div>

          {/* Indentation Selector */}
          <div className="flex items-center gap-2">
            <span className={`text-xs font-medium ${textMutedClass}`}>Indent:</span>
            <div className="flex items-center rounded-lg border border-slate-700/50 p-0.5 bg-slate-950/40">
              <button
                onClick={() => setIndentSpaces(2)}
                className={`px-2.5 py-1 text-xs font-mono font-semibold rounded-md transition-all cursor-pointer ${
                  indentSpaces === 2
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                2 Spaces
              </button>
              <button
                onClick={() => setIndentSpaces(4)}
                className={`px-2.5 py-1 text-xs font-mono font-semibold rounded-md transition-all cursor-pointer ${
                  indentSpaces === 4
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                4 Spaces
              </button>
            </div>
          </div>
        </div>

        {/* Row 2: Secondary Quick Actions & Privacy Guarantee */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/40">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleLoadSample('yaml')}
              className={`border text-xs font-medium px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                isLight 
                  ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700' 
                  : 'bg-slate-950 hover:bg-slate-900 border-slate-800 text-slate-300'
              }`}
            >
              Load YAML Sample
            </button>
            <button
              onClick={() => handleLoadSample('json')}
              className={`border text-xs font-medium px-3 py-1.5 rounded-lg transition-all cursor-pointer ${
                isLight 
                  ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700' 
                  : 'bg-slate-950 hover:bg-slate-900 border-slate-800 text-slate-300'
              }`}
            >
              Load JSON Sample
            </button>
            {output && (
              <button
                onClick={handleSwapOutputToInput}
                className={`border text-xs font-medium px-3 py-1.5 rounded-lg transition-all cursor-pointer flex items-center gap-1.5 ${
                  isLight 
                    ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700' 
                    : 'bg-slate-950 hover:bg-slate-900 border-slate-800 text-slate-300'
                }`}
                title="Transfer formatted output back into input"
              >
                <RefreshCw className="w-3 h-3" />
                <span>Use Output as Input</span>
              </button>
            )}
          </div>

          <div className={`text-[11px] font-mono flex items-center gap-1.5 ${textMutedClass}`}>
            <ShieldCheck className={`w-3.5 h-3.5 ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`} />
            <span>100% Client-Side • In-Browser Sandbox • Zero Logs</span>
          </div>
        </div>
      </section>

      {/* DUAL EDITOR GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Input Editor Pane */}
        <section 
          aria-label="Input Editor Pane"
          className={`flex flex-col h-[420px] border rounded-xl overflow-hidden shadow-md ${inputBgClass} ${borderClass}`}
        >
          <div className={`px-4 py-3 border-b flex items-center justify-between ${panelBgClass} ${borderClass}`}>
            <label 
              htmlFor="yaml-input" 
              className={`text-xs font-semibold font-mono flex items-center gap-2 cursor-pointer ${isLight ? 'text-slate-800' : 'text-slate-200'}`}
            >
              <FileText className="w-3.5 h-3.5 text-indigo-400" />
              <span>{mode === 'json-to-yaml' ? 'Raw JSON Input' : 'Raw YAML Input'}</span>
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={handleClear}
                className={`text-xs p-1 rounded transition-colors cursor-pointer flex items-center gap-1 ${
                  isLight ? 'text-slate-500 hover:text-red-600' : 'text-slate-400 hover:text-red-400'
                }`}
                title="Clear input buffer"
                aria-label="Clear input buffer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span className="text-[11px]">Clear</span>
              </button>
            </div>
          </div>

          <textarea
            id="yaml-input"
            aria-label={mode === 'json-to-yaml' ? 'Raw JSON Input Code' : 'Raw YAML Input Code'}
            className={`flex-1 w-full p-4 font-mono text-xs leading-relaxed focus:outline-none resize-none bg-transparent ${textClass} ${
              isLight ? 'placeholder:text-slate-400' : 'placeholder:text-slate-650'
            }`}
            placeholder={
              mode === 'json-to-yaml'
                ? 'Paste or type JSON structure here (e.g. { "name": "App", "items": [1, 2] })...'
                : 'Paste or type YAML structure here (e.g. name: App\\nitems:\\n  - 1\\n  - 2)...'
            }
            value={input}
            onChange={(e) => setInput(e.target.value)}
            spellCheck={false}
          />

          <div className={`px-4 py-2 border-t text-[11px] font-mono flex items-center justify-between ${panelBgClass} ${borderMutedClass} ${textMutedClass}`}>
            <span>Characters: {input.length.toLocaleString()}</span>
            <span>Lines: {inputLineCount}</span>
          </div>
        </section>

        {/* Output Editor Pane */}
        <section 
          aria-label="Output Editor Pane"
          className={`flex flex-col h-[420px] border rounded-xl overflow-hidden shadow-md ${inputBgClass} ${borderClass}`}
        >
          <div className={`px-4 py-3 border-b flex items-center justify-between ${panelBgClass} ${borderClass}`}>
            <span className={`text-xs font-semibold font-mono flex items-center gap-2 ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
              <Code className="w-3.5 h-3.5 text-indigo-400" />
              <span>
                {mode === 'yaml-to-json'
                  ? 'Converted JSON Output'
                  : mode === 'validate-yaml'
                  ? 'Validation Report'
                  : 'Formatted YAML Output'}
              </span>
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopy}
                disabled={!output && !input}
                className={`border px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                  isLight 
                    ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800' 
                    : 'bg-slate-950 hover:bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
                }`}
                title="Copy output to clipboard"
                aria-label="Copy output to clipboard"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>

              <button
                onClick={handleDownload}
                disabled={!output && !input}
                className={`border px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed ${
                  isLight 
                    ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800' 
                    : 'bg-slate-950 hover:bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
                }`}
                title="Download formatted file"
                aria-label="Download formatted file"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save</span>
              </button>
            </div>
          </div>

          <div className={`flex-1 overflow-auto p-4 ${canvasBgClass}`}>
            {output ? (
              <pre className={`font-mono text-xs leading-relaxed whitespace-pre select-all ${isLight ? 'text-indigo-900' : 'text-indigo-200'}`}>
                {output}
              </pre>
            ) : (
              <div className="h-full flex flex-col items-center justify-center space-y-2.5 p-4 text-center">
                <Code className={`w-8 h-8 ${isLight ? 'text-slate-300' : 'text-slate-800'}`} />
                <p className={`text-xs font-mono max-w-xs ${textMutedClass}`}>
                  {mode === 'validate-yaml'
                    ? 'Click "Validate YAML" to verify syntax and inspect line-by-line structure.'
                    : 'Click the action button below to format or convert your data.'}
                </p>
              </div>
            )}
          </div>

          <div className={`px-4 py-2 border-t text-[11px] font-mono flex items-center justify-between ${panelBgClass} ${borderMutedClass} ${textMutedClass}`}>
            <span>Characters: {output.length.toLocaleString()}</span>
            <span>Lines: {outputLineCount}</span>
          </div>
        </section>

      </div>

      {/* PRIMARY ACTION BAR & STATUS FEEDBACK */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <button
          onClick={() => handleExecute()}
          className="bg-indigo-600 hover:bg-indigo-500 active:scale-[0.99] text-white text-xs font-bold px-6 py-3 rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto"
        >
          {mode === 'format-yaml' && (
            <>
              <Sparkles className="w-4 h-4 text-white" />
              <span>Format &amp; Beautify YAML</span>
            </>
          )}
          {mode === 'yaml-to-json' && (
            <>
              <Code className="w-4 h-4 text-white" />
              <span>Convert YAML to JSON</span>
            </>
          )}
          {mode === 'json-to-yaml' && (
            <>
              <RefreshCw className="w-4 h-4 text-white" />
              <span>Convert JSON to YAML</span>
            </>
          )}
          {mode === 'validate-yaml' && (
            <>
              <FileCheck className="w-4 h-4 text-white" />
              <span>Validate YAML Syntax</span>
            </>
          )}
        </button>

        {status.type !== 'idle' && (
          <div 
            role={status.type === 'error' ? 'alert' : 'status'}
            className={`flex items-start sm:items-center gap-2.5 px-4 py-3 rounded-xl text-xs font-medium border font-mono flex-1 ${
              status.type === 'success'
                ? (isLight ? 'bg-emerald-50 border-emerald-200 text-emerald-900' : 'bg-emerald-950/30 border-emerald-900/50 text-emerald-300')
                : (isLight ? 'bg-rose-50 border-rose-200 text-rose-900' : 'bg-rose-950/30 border-rose-900/50 text-rose-300')
            }`}
          >
            {status.type === 'success' ? (
              <CheckCircle className={`w-4 h-4 shrink-0 mt-0.5 sm:mt-0 ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`} />
            ) : (
              <AlertCircle className={`w-4 h-4 shrink-0 mt-0.5 sm:mt-0 ${isLight ? 'text-rose-600' : 'text-rose-400'}`} />
            )}
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2">
              {status.line !== undefined && (
                <span className="font-bold underline">
                  [Line {status.line}{status.col !== undefined ? `, Col ${status.col}` : ''}]:
                </span>
              )}
              <span>{status.message}</span>
            </div>
          </div>
        )}
      </div>

      {/* COMPREHENSIVE HIGH-VALUE EDUCATIONAL SECTION FOR USERS & ADSENSE */}
      <article 
        aria-label="YAML Technical Guide and RFC Specifications"
        className={`mt-12 border rounded-2xl p-6 sm:p-8 space-y-8 ${cardClass} ${borderClass}`}
      >
        <header className={`border-b pb-4 ${borderClass} flex items-center gap-3`}>
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <h2 className={`text-lg sm:text-xl font-black font-sans tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
              YAML Formatter, Validator &amp; JSON Conversion Technical Guide
            </h2>
            <p className={`text-xs ${textMutedClass} mt-0.5`}>
              Comprehensive specifications, syntax rules, and bi-directional conversion patterns
            </p>
          </div>
        </header>

        {/* Section 1: What is YAML? */}
        <section className="space-y-3">
          <h2 className={`text-base font-bold font-sans ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
            What Is YAML?
          </h2>
          <p className={`text-xs sm:text-sm leading-relaxed ${textMutedClass}`}>
            YAML (a recursive acronym for <strong>YAML Ain't Markup Language</strong>) is a human-readable data serialization language widely adopted across DevOps, cloud-native orchestration, and software development. Governed by the YAML 1.2 specification, YAML represents structural hierarchies using precise whitespace indentation rather than the curly braces (<code className="font-mono text-xs">{"{}"}</code>) and quotation marks mandated by JSON. YAML is the primary configuration format for Kubernetes manifests, Docker Compose services, GitHub Actions workflows, Ansible playbooks, and OpenAPI specifications.
          </p>
        </section>

        {/* Section 2: How to Format and Validate YAML */}
        <section className="space-y-3">
          <h2 className={`text-base font-bold font-sans ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
            How to Format and Validate YAML
          </h2>
          <ol className={`text-xs sm:text-sm space-y-2 list-decimal list-inside pl-1 ${textMutedClass}`}>
            <li><strong>Paste or Edit YAML:</strong> Paste your raw YAML document, Kubernetes manifest, or Docker Compose configuration into the input editor.</li>
            <li><strong>Choose Indentation:</strong> Select your desired indentation level—<strong>2 Spaces</strong> (the cloud standard for Kubernetes and Docker) or <strong>4 Spaces</strong>.</li>
            <li><strong>Run Format &amp; Beautify:</strong> Click <em>Format &amp; Beautify YAML</em> to parse the document, validate syntax, standardize spacing, and preserve inline comments.</li>
            <li><strong>Inspect Syntax Errors:</strong> If indentation is misaligned or illegal tab characters are detected, the validator reports the precise line and column location.</li>
            <li><strong>Copy or Download:</strong> Use the one-click copy button or download the formatted <code className="font-mono text-xs">.yaml</code> file to commit into your source control repository.</li>
          </ol>
        </section>

        {/* Section 3: YAML to JSON Conversion */}
        <section className="space-y-3">
          <h2 className={`text-base font-bold font-sans ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
            YAML to JSON Conversion
          </h2>
          <p className={`text-xs sm:text-sm leading-relaxed ${textMutedClass}`}>
            Converting YAML to JSON maps YAML key-value dictionaries to JSON objects, YAML lists to JSON arrays, and resolves scalar datatypes (strings, integers, floats, booleans, and nulls) according to the RFC 8259 JSON specification. YAML anchors (<code className="font-mono text-xs">&amp;anchor</code>) and aliases (<code className="font-mono text-xs">*alias</code>) are expanded into concrete JSON properties. If your YAML stream contains multiple documents separated by <code className="font-mono text-xs">---</code>, the converter preserves all documents by wrapping them into a root JSON array. Note that YAML comments are removed during JSON conversion because standard JSON does not permit comments.
          </p>
        </section>

        {/* Section 4: JSON to YAML Conversion */}
        <section className="space-y-3">
          <h2 className={`text-base font-bold font-sans ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
            JSON to YAML Conversion
          </h2>
          <p className={`text-xs sm:text-sm leading-relaxed ${textMutedClass}`}>
            The reverse conversion transforms rigid JSON payloads into lightweight, indentation-based YAML. Nested objects become clean structural blocks without extraneous quotes, arrays are formatted as clean bulleted dashes (<code className="font-mono text-xs">-</code>), and quotes are applied only to strings containing colons, symbols, or reserved boolean keywords. This enables developers to easily convert REST API responses, configuration schemas, or database exports into clean configuration templates.
          </p>
        </section>

        {/* Section 5: YAML Formatting Example */}
        <section className="space-y-4">
          <h2 className={`text-base font-bold font-sans ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
            YAML Formatting Example
          </h2>
          <p className={`text-xs sm:text-sm ${textMutedClass}`}>
            Below is a sample YAML configuration and its exact equivalent in RFC 8259 JSON:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className={`p-4 rounded-xl border font-mono text-xs ${inputBgClass} ${borderMutedClass}`}>
              <span className={`block font-bold mb-2 pb-1 border-b ${borderMutedClass} ${isLight ? 'text-slate-800' : 'text-indigo-300'}`}>
                Clean YAML (2-Space Indent)
              </span>
              <pre className={`leading-relaxed whitespace-pre ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
{`name: OwnFormatters
active: true
version: 2.4
features:
  - JSON Formatter
  - YAML Formatter
  - Cron Parser`}
              </pre>
            </div>

            <div className={`p-4 rounded-xl border font-mono text-xs ${inputBgClass} ${borderMutedClass}`}>
              <span className={`block font-bold mb-2 pb-1 border-b ${borderMutedClass} ${isLight ? 'text-slate-800' : 'text-indigo-300'}`}>
                Equivalent JSON Output
              </span>
              <pre className={`leading-relaxed whitespace-pre ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
{`{
  "name": "OwnFormatters",
  "active": true,
  "version": 2.4,
  "features": [
    "JSON Formatter",
    "YAML Formatter",
    "Cron Parser"
  ]
}`}
              </pre>
            </div>
          </div>
        </section>

        {/* Section 6: YAML vs JSON */}
        <section className="space-y-3">
          <h2 className={`text-base font-bold font-sans ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
            YAML vs JSON Comparison
          </h2>
          <div className="overflow-x-auto">
            <table className={`w-full text-left text-xs border ${borderMutedClass}`}>
              <thead className={isLight ? 'bg-slate-100 text-slate-800' : 'bg-slate-950 text-slate-200'}>
                <tr>
                  <th className="p-2.5 border-b font-semibold">Feature</th>
                  <th className="p-2.5 border-b font-semibold">YAML</th>
                  <th className="p-2.5 border-b font-semibold">JSON</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${borderMutedClass} ${textMutedClass}`}>
                <tr>
                  <td className="p-2.5 font-medium">Syntax Hierarchy</td>
                  <td className="p-2.5">Indentation and whitespace</td>
                  <td className="p-2.5">Braces <code className="font-mono">{"{}"}</code> and brackets <code className="font-mono">[]</code></td>
                </tr>
                <tr>
                  <td className="p-2.5 font-medium">Comments</td>
                  <td className="p-2.5">Supported natively using <code className="font-mono">#</code></td>
                  <td className="p-2.5">Not supported in standard RFC 8259</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-medium">String Quotes</td>
                  <td className="p-2.5">Optional for standard identifiers</td>
                  <td className="p-2.5">Mandatory double quotes for all keys &amp; strings</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-medium">Multi-line Strings</td>
                  <td className="p-2.5">Literal (<code className="font-mono">|</code>) &amp; folded (<code className="font-mono">&gt;</code>) block scalars</td>
                  <td className="p-2.5">Explicit escaped newlines (<code className="font-mono">\n</code>)</td>
                </tr>
                <tr>
                  <td className="p-2.5 font-medium">Primary Ecosystem</td>
                  <td className="p-2.5">Kubernetes, Docker Compose, CI/CD, Helm</td>
                  <td className="p-2.5">Web APIs, REST payloads, browser storage</td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Section 7: YAML Validation and Common Errors */}
        <section className="space-y-3">
          <h2 className={`text-base font-bold font-sans ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
            YAML Validation and Common Errors
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className={`p-4 rounded-xl border ${panelBgClass} ${borderMutedClass} space-y-1.5`}>
              <strong className={`block ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>1. Tab Characters for Indentation</strong>
              <p className={textMutedClass}>
                YAML strictly forbids tab characters (<code className="font-mono">\t</code>) for indentation. You must always use space characters. The OwnFormatters validator detects tab indentation and reports the line and column.
              </p>
            </div>
            <div className={`p-4 rounded-xl border ${panelBgClass} ${borderMutedClass} space-y-1.5`}>
              <strong className={`block ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>2. Inconsistent Indentation Depth</strong>
              <p className={textMutedClass}>
                Child keys must be indented further than their parent. Mixing 2-space and 3-space indents within the same block breaks mapping parsing.
              </p>
            </div>
            <div className={`p-4 rounded-xl border ${panelBgClass} ${borderMutedClass} space-y-1.5`}>
              <strong className={`block ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>3. Unquoted Special Characters</strong>
              <p className={textMutedClass}>
                Values containing colons followed by a space (e.g. <code className="font-mono">time: 12:30</code>), hash symbols, or leading dashes must be enclosed in quotes.
              </p>
            </div>
            <div className={`p-4 rounded-xl border ${panelBgClass} ${borderMutedClass} space-y-1.5`}>
              <strong className={`block ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>4. Type Coercion (YAML 1.2 vs 1.1)</strong>
              <p className={textMutedClass}>
                In YAML 1.2, scalar values like <code className="font-mono">yes</code>, <code className="font-mono">no</code>, <code className="font-mono">on</code>, and <code className="font-mono">off</code> are treated as literal strings, while <code className="font-mono">true</code> and <code className="font-mono">false</code> are booleans. In older YAML 1.1 parsers, words like <code className="font-mono">NO</code> (e.g. country codes) were coerced into boolean <code className="font-mono">false</code>.
              </p>
            </div>
          </div>
        </section>

        {/* Section 8: Frequently Asked Questions */}
        <section className="space-y-4">
          <h2 className={`text-base font-bold font-sans ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
            Frequently Asked Questions (FAQ)
          </h2>
          <div className="space-y-3 text-xs">
            <details className={`p-4 rounded-xl border ${panelBgClass} ${borderMutedClass} group`}>
              <summary className={`font-bold cursor-pointer flex items-center justify-between ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                <span>What is a YAML formatter?</span>
                <HelpCircle className="w-3.5 h-3.5 text-indigo-400 shrink-0 ml-2" />
              </summary>
              <p className={`mt-2.5 leading-relaxed ${textMutedClass}`}>
                A YAML formatter is a tool that parses your YAML document, checks its syntactic validity against official specifications (YAML 1.2), aligns indentation consistently across all nested blocks, and removes unnecessary whitespace while preserving document comments and structure.
              </p>
            </details>

            <details className={`p-4 rounded-xl border ${panelBgClass} ${borderMutedClass} group`}>
              <summary className={`font-bold cursor-pointer flex items-center justify-between ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                <span>Can I convert YAML to JSON with this tool?</span>
                <HelpCircle className="w-3.5 h-3.5 text-indigo-400 shrink-0 ml-2" />
              </summary>
              <p className={`mt-2.5 leading-relaxed ${textMutedClass}`}>
                Yes. Select the <strong>YAML to JSON</strong> mode or click the action button. The parser converts mappings to JSON objects, sequences to arrays, resolves anchors and aliases, and formats the output with clean indentation.
              </p>
            </details>

            <details className={`p-4 rounded-xl border ${panelBgClass} ${borderMutedClass} group`}>
              <summary className={`font-bold cursor-pointer flex items-center justify-between ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                <span>Can I convert JSON to YAML?</span>
                <HelpCircle className="w-3.5 h-3.5 text-indigo-400 shrink-0 ml-2" />
              </summary>
              <p className={`mt-2.5 leading-relaxed ${textMutedClass}`}>
                Yes. Select <strong>JSON to YAML</strong>, paste your valid JSON data, and click convert. The engine transforms JSON objects and arrays into human-friendly YAML with configurable 2-space or 4-space indentation.
              </p>
            </details>

            <details className={`p-4 rounded-xl border ${panelBgClass} ${borderMutedClass} group`}>
              <summary className={`font-bold cursor-pointer flex items-center justify-between ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                <span>Does YAML support comments?</span>
                <HelpCircle className="w-3.5 h-3.5 text-indigo-400 shrink-0 ml-2" />
              </summary>
              <p className={`mt-2.5 leading-relaxed ${textMutedClass}`}>
                Yes. Any text following a hash mark (<code className="font-mono">#</code>) is treated as a comment. When you format YAML with OwnFormatters, your comments are retained. However, converting YAML to JSON strips comments because standard JSON does not support them.
              </p>
            </details>

            <details className={`p-4 rounded-xl border ${panelBgClass} ${borderMutedClass} group`}>
              <summary className={`font-bold cursor-pointer flex items-center justify-between ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                <span>Why does indentation matter in YAML?</span>
                <HelpCircle className="w-3.5 h-3.5 text-indigo-400 shrink-0 ml-2" />
              </summary>
              <p className={`mt-2.5 leading-relaxed ${textMutedClass}`}>
                YAML has no opening or closing tags or curly braces. The parser relies strictly on the number of leading space characters to determine which elements belong to which parent object or list. Inconsistent indentation causes syntax errors or misinterprets your configuration tree.
              </p>
            </details>

            <details className={`p-4 rounded-xl border ${panelBgClass} ${borderMutedClass} group`}>
              <summary className={`font-bold cursor-pointer flex items-center justify-between ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                <span>Are my YAML or JSON files uploaded to a server?</span>
                <HelpCircle className="w-3.5 h-3.5 text-indigo-400 shrink-0 ml-2" />
              </summary>
              <p className={`mt-2.5 leading-relaxed ${textMutedClass}`}>
                No. All parsing, validation, and conversion operations run 100% locally within your web browser using client-side JavaScript. Your code, API keys, and deployment credentials never leave your machine.
              </p>
            </details>

            <details className={`p-4 rounded-xl border ${panelBgClass} ${borderMutedClass} group`}>
              <summary className={`font-bold cursor-pointer flex items-center justify-between ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                <span>Does the tool support multi-document YAML files?</span>
                <HelpCircle className="w-3.5 h-3.5 text-indigo-400 shrink-0 ml-2" />
              </summary>
              <p className={`mt-2.5 leading-relaxed ${textMutedClass}`}>
                Yes. YAML documents separated by triple dashes (<code className="font-mono">---</code>) are parsed and formatted in sequence. When converting multi-document YAML to JSON, each document becomes an item in a root JSON array.
              </p>
            </details>
          </div>
        </section>

        {/* Section 9: Related Developer Utilities */}
        <section className="space-y-3 border-t pt-6 border-slate-800/40">
          <h2 className={`text-base font-bold font-sans flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-slate-100'}`}>
            <Compass className="w-4 h-4 text-indigo-400" />
            <span>Related Developer Tools</span>
          </h2>
          <p className={`text-xs ${textMutedClass}`}>
            Explore companion utilities designed for structured data transformation, configuration management, and developer productivity:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
            <a
              href="/json-formatter"
              onClick={(e) => handleInternalNav(e, '/json-formatter')}
              className={`p-3.5 rounded-xl border flex items-center justify-between group transition-all ${panelBgClass} ${borderMutedClass} hover:border-indigo-500`}
            >
              <div>
                <strong className={`block ${isLight ? 'text-slate-800' : 'text-slate-200'} group-hover:text-indigo-400 transition-colors`}>
                  JSON Formatter &amp; Beautifier
                </strong>
                <span className={`text-[11px] ${textMutedClass}`}>Format, validate, and minify RFC 8259 JSON</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition-colors" />
            </a>

            <a
              href="/k8s-yaml-validator"
              onClick={(e) => handleInternalNav(e, '/k8s-yaml-validator')}
              className={`p-3.5 rounded-xl border flex items-center justify-between group transition-all ${panelBgClass} ${borderMutedClass} hover:border-indigo-500`}
            >
              <div>
                <strong className={`block ${isLight ? 'text-slate-800' : 'text-slate-200'} group-hover:text-indigo-400 transition-colors`}>
                  Kubernetes YAML Validator
                </strong>
                <span className={`text-[11px] ${textMutedClass}`}>Verify Pod, Deployment &amp; Service manifests</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition-colors" />
            </a>

            <a
              href="/docker-compose-validator"
              onClick={(e) => handleInternalNav(e, '/docker-compose-validator')}
              className={`p-3.5 rounded-xl border flex items-center justify-between group transition-all ${panelBgClass} ${borderMutedClass} hover:border-indigo-500`}
            >
              <div>
                <strong className={`block ${isLight ? 'text-slate-800' : 'text-slate-200'} group-hover:text-indigo-400 transition-colors`}>
                  Docker Compose Validator
                </strong>
                <span className={`text-[11px] ${textMutedClass}`}>Inspect multi-container service configurations</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition-colors" />
            </a>

            <a
              href="/cron-parser"
              onClick={(e) => handleInternalNav(e, '/cron-parser')}
              className={`p-3.5 rounded-xl border flex items-center justify-between group transition-all ${panelBgClass} ${borderMutedClass} hover:border-indigo-500`}
            >
              <div>
                <strong className={`block ${isLight ? 'text-slate-800' : 'text-slate-200'} group-hover:text-indigo-400 transition-colors`}>
                  Cron Expression Parser
                </strong>
                <span className={`text-[11px] ${textMutedClass}`}>Parse schedules &amp; calculate upcoming executions</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition-colors" />
            </a>

            <a
              href="/base64-encoder-decoder"
              onClick={(e) => handleInternalNav(e, '/base64-encoder-decoder')}
              className={`p-3.5 rounded-xl border flex items-center justify-between group transition-all ${panelBgClass} ${borderMutedClass} hover:border-indigo-500`}
            >
              <div>
                <strong className={`block ${isLight ? 'text-slate-800' : 'text-slate-200'} group-hover:text-indigo-400 transition-colors`}>
                  Base64 Encoder / Decoder
                </strong>
                <span className={`text-[11px] ${textMutedClass}`}>Encode and decode UTF-8 &amp; binary payloads</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition-colors" />
            </a>

            <a
              href="/learn-yaml"
              onClick={(e) => handleInternalNav(e, '/learn-yaml')}
              className={`p-3.5 rounded-xl border flex items-center justify-between group transition-all ${panelBgClass} ${borderMutedClass} hover:border-indigo-500`}
            >
              <div>
                <strong className={`block ${isLight ? 'text-slate-800' : 'text-slate-200'} group-hover:text-indigo-400 transition-colors`}>
                  Learn YAML Handbook
                </strong>
                <span className={`text-[11px] ${textMutedClass}`}>Read our in-depth developer specification manual</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition-colors" />
            </a>
          </div>
        </section>

        <footer className={`border-t pt-4 ${borderClass} text-center`}>
          <p className={`text-[11px] ${textMutedClass}`}>
            All operations are executed securely inside your browser runtime. Zero data is stored, transmitted, or logged.
          </p>
        </footer>
      </article>

    </div>
  );
}
