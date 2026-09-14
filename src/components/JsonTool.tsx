import React, { useState, useEffect } from 'react';
import { 
  Play, 
  Copy, 
  Check, 
  Trash2, 
  ArrowLeftRight, 
  HelpCircle, 
  FileText, 
  CheckCircle, 
  AlertCircle, 
  Download,
  ShieldCheck,
  Code2,
  Layers,
  ChevronDown,
  ChevronUp,
  Compass,
  ArrowRight,
  BookOpen
} from 'lucide-react';

function getJsonErrorDetails(raw: string, err: any): string {
  const message = err.message || 'Invalid JSON syntax';
  const posMatch = message.match(/at position (\d+)/i);
  if (posMatch) {
    const pos = parseInt(posMatch[1], 10);
    const beforeError = raw.substring(0, pos);
    const lines = beforeError.split('\n');
    const line = lines.length;
    const col = lines[lines.length - 1].length + 1;
    return `${message} (Line ${line}, Column ${col})`;
  }
  return message;
}

const SAMPLE_JSON = `{
  "projectName": "OwnFormatters",
  "version": "2.4.0",
  "active": true,
  "description": "Modern online Swiss-army knife developer formatting suite.",
  "technologies": ["React", "TypeScript", "TailwindCSS", "Lucide Icons"],
  "stats": {
    "speedMs": 1.2,
    "userRating": 4.9,
    "openSource": true
  }
}`;

export default function JsonTool({ theme }: { theme?: any }) {
  const [input, setInput] = useState<string>('');
  const [output, setOutput] = useState<string>('');
  const [indent, setIndent] = useState<number>(2);
  const [status, setStatus] = useState<{ type: 'idle' | 'success' | 'error'; message: string }>({ type: 'idle', message: '' });
  const [copied, setCopied] = useState<boolean>(false);
  const [searchKey, setSearchKey] = useState<string>('');
  const [treeView, setTreeView] = useState<boolean>(false);

  // Expand / Collapse state trackers for Interactive Tree View
  const [toggledPaths, setToggledPaths] = useState<Record<string, boolean>>({});
  const [defaultExpanded, setDefaultExpanded] = useState<boolean>(true);

  // Open / Close state for FAQ accordion
  const [openFaqs, setOpenFaqs] = useState<Record<number, boolean>>({
    0: true,
    1: true,
    2: true,
    3: true,
    4: true
  });

  const toggleFaq = (index: number) => {
    setOpenFaqs(prev => ({
      ...prev,
      [index]: !prev[index]
    }));
  };

  const handleInternalNav = (e: React.MouseEvent<HTMLAnchorElement>, path: string) => {
    if (!e.ctrlKey && !e.metaKey) {
      e.preventDefault();
      window.history.pushState(null, '', path);
      window.dispatchEvent(new PopStateEvent('popstate'));
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Synchronize FAQ JSON-LD schema with visible questions
  useEffect(() => {
    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": [
        {
          "@type": "Question",
          "name": "What does a JSON formatter do?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "A JSON formatter parses unformatted, messy, or minified JSON strings and reorganizes them with consistent indentation (such as 2 spaces, 4 spaces, or tabs) and line breaks, making complex data structures easy for developers to read, inspect, and debug."
          }
        },
        {
          "@type": "Question",
          "name": "Can this tool format minified JSON?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. You can paste single-line or heavily minified JSON into the editor and click 'Beautify & Validate' to instantly expand it into human-readable formatted JSON with proper indentation."
          }
        },
        {
          "@type": "Question",
          "name": "Does the formatter validate JSON?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Yes. The formatter checks your input against standard RFC 8259 JSON syntax rules. If your JSON has errors—such as missing quotes, trailing commas, or unescaped characters—the tool highlights the issue and points to the specific line and column number. It reports errors accurately without silently altering your source data."
          }
        },
        {
          "@type": "Question",
          "name": "What is the difference between formatting and minifying JSON?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "Formatting (or beautifying / pretty printing) adds whitespace, indentation, and newlines to maximize human readability. Minifying removes all unnecessary whitespace, comments, and line breaks to produce the smallest possible payload size for fast network transmission."
          }
        },
        {
          "@type": "Question",
          "name": "Is my JSON uploaded to a server?",
          "acceptedAnswer": {
            "@type": "Answer",
            "text": "No. All JSON formatting, validation, minification, and tree inspection happen entirely client-side inside your web browser. Your data is never uploaded, transmitted, or logged to OwnFormatters servers."
          }
        }
      ]
    };

    let faqScript = document.getElementById('schema-faq') as HTMLScriptElement | null;
    if (!faqScript) {
      faqScript = document.createElement('script');
      faqScript.setAttribute('type', 'application/ld+json');
      faqScript.setAttribute('id', 'schema-faq');
      document.head.appendChild(faqScript);
    }
    faqScript.textContent = JSON.stringify(faqSchema);
  }, []);

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

  const isLight = t.isDark === false;

  const handleFormat = (minifyMode: boolean = false) => {
    if (!input.trim()) {
      setStatus({ type: 'error', message: 'Input is empty!' });
      return;
    }
    try {
      const parsed = JSON.parse(input);
      if (minifyMode) {
        const minified = JSON.stringify(parsed);
        setOutput(minified);
        setStatus({ type: 'success', message: 'Successfully minified JSON!' });
      } else {
        const formatted = JSON.stringify(parsed, null, indent === -1 ? '\t' : indent);
        setOutput(formatted);
        setStatus({ type: 'success', message: 'Successfully formatted and validated JSON!' });
      }
    } catch (err: any) {
      setOutput('');
      setStatus({ 
        type: 'error', 
        message: getJsonErrorDetails(input, err)
      });
    }
  };

  const handleDownload = () => {
    const textToDownload = output || input;
    if (!textToDownload) return;
    const blob = new Blob([textToDownload], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'formatted.json';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleLoadSample = () => {
    setInput(SAMPLE_JSON);
    setStatus({ type: 'idle', message: '' });
    setOutput('');
  };

  const handleCopy = () => {
    const textToCopy = output || input;
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
    setStatus({ type: 'idle', message: '' });
  };

  // Stateful Collapsible JSON Tree Node Component
  const renderInteractiveTreeNode = (name: string | number, value: any, path: string = 'root', depth: number = 0): React.ReactNode => {
    const isObject = value !== null && typeof value === 'object';
    const isArray = Array.isArray(value);
    const keys = isObject && !isArray ? Object.keys(value) : [];
    
    // Determine expanded state based on toggles or defaults
    const isExpanded = toggledPaths[path] !== undefined ? toggledPaths[path] : defaultExpanded;

    const toggleNode = () => {
      setToggledPaths(prev => ({
        ...prev,
        [path]: !isExpanded
      }));
    };

    if (!isObject) {
      let renderedValue = <span className={isLight ? 'text-pink-650 font-mono' : 'text-pink-400 font-mono'}>null</span>;
      if (typeof value === 'undefined') renderedValue = <span className={isLight ? 'text-pink-650 font-mono' : 'text-pink-400 font-mono'}>undefined</span>;
      else if (typeof value === 'string') renderedValue = <span className={isLight ? 'text-emerald-705 font-mono' : 'text-emerald-400 font-mono'}>"{value}"</span>;
      else if (typeof value === 'number') renderedValue = <span className={isLight ? 'text-amber-700 font-mono font-medium' : 'text-amber-400 font-mono'}>{value}</span>;
      else if (typeof value === 'boolean') renderedValue = <span className={isLight ? 'text-blue-650 font-mono font-medium' : 'text-blue-400 font-mono'}>{value ? 'true' : 'false'}</span>;

      return (
        <div className="flex items-start gap-1 font-mono text-xs pl-6 py-0.5">
          {name !== '' && <span className={isLight ? 'text-indigo-800 font-semibold' : 'text-indigo-300 font-semibold'}>{name}:</span>}
          {renderedValue}
        </div>
      );
    }

    const isEmpty = isArray ? value.length === 0 : keys.length === 0;
    const bracketOpen = isArray ? '[' : '{';
    const bracketClose = isArray ? ']' : '}';

    if (isEmpty) {
      return (
        <div className="flex items-center gap-1 font-mono text-xs pl-6 py-0.5">
          {name !== '' && <span className={isLight ? 'text-indigo-800 font-semibold' : 'text-indigo-300 font-semibold'}>{name}:</span>}
          <span className={isLight ? 'text-slate-400' : 'text-slate-500'}>{bracketOpen}{bracketClose}</span>
        </div>
      );
    }

    const isMatch = searchKey && typeof name === 'string' && name.toLowerCase().includes(searchKey.toLowerCase());

    return (
      <div className="font-mono text-xs select-none">
        <div 
          onClick={toggleNode}
          className={`flex items-center gap-1.5 py-1 px-2 rounded cursor-pointer transition-colors w-fit ${
            isMatch 
              ? 'bg-indigo-500/20 border border-indigo-500/30' 
              : `hover:bg-indigo-500/5 ${isLight ? 'text-slate-800' : 'text-slate-300'}`
          }`}
        >
          {/* Collapse/Expand Arrow */}
          <span className={`flex items-center justify-center w-3 h-3 transition-transform duration-200 ${isLight ? 'text-slate-500 hover:text-slate-800' : 'text-slate-500 hover:text-slate-300'}`}>
            {isExpanded ? (
              <svg className="w-3 h-3 transform rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" />
              </svg>
            ) : (
              <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" />
              </svg>
            )}
          </span>

          {name !== '' && <span className={isLight ? 'text-indigo-850 font-semibold' : 'text-indigo-300 font-semibold'}>{name}:</span>}
          <span className={`${isLight ? 'text-slate-500' : 'text-slate-500'} font-mono text-[10px]`}>
            {bracketOpen}
            <span className={`text-[9px] mx-1 px-1 py-0.5 rounded border ${isLight ? 'bg-slate-100 text-slate-700 border-slate-200' : 'bg-slate-900 text-slate-400 border-slate-800'}`}>
              {isArray ? `${value.length} items` : `${keys.length} keys`}
            </span>
          </span>
        </div>

        {isExpanded && (
          <div className={`border-l ml-4 pl-2 my-1 space-y-0.5 ${isLight ? 'border-slate-200' : 'border-slate-800/80'}`}>
            {isArray ? (
              value.map((item: any, index: number) => (
                <div key={index}>
                  {renderInteractiveTreeNode(index, item, `${path}[${index}]`, depth + 1)}
                </div>
              ))
            ) : (
              keys.map((key: string) => (
                <div key={key}>
                  {renderInteractiveTreeNode(key, value[key], `${path}.${key}`, depth + 1)}
                </div>
              ))
            )}
            <div className={`text-[10px] pl-6 py-0.5 ${isLight ? 'text-slate-450' : 'text-slate-500'}`}>{bracketClose}</div>
          </div>
        )}
      </div>
    );
  };

  let parsedObjectForTree: any = null;
  if (treeView) {
    try {
      parsedObjectForTree = JSON.parse(output || input);
    } catch (e) {}
  }

  return (
    <div className="space-y-6" id="json-tool-container">
      {/* Top Banner Controls */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border p-4 rounded-xl ${t.card} ${t.border}`}>
        <div className="flex flex-wrap items-center gap-3">
          <label htmlFor="indent-style" className={`text-xs font-semibold ${t.textMuted}`}>Indent Style:</label>
          <select 
            id="indent-style"
            aria-label="Select Indentation Style"
            value={indent} 
            onChange={(e) => setIndent(Number(e.target.value))}
            className={`border text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500 ${t.inputBg} ${t.text} ${t.border}`}
          >
            <option value={2}>2 Spaces</option>
            <option value={4}>4 Spaces</option>
            <option value={8}>8 Spaces</option>
            <option value={-1}>Tabs</option>
          </select>

          <button
            onClick={handleLoadSample}
            aria-label="Load Sample JSON Data"
            className={`border text-xs font-semibold px-3 py-1.5 rounded-lg transition-all flex items-center gap-1 ${t.btnSecondary}`}
          >
            <FileText className="w-3.5 h-3.5" />
            Load Sample
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setTreeView(false)}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${
              !treeView 
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-md' 
                : `${t.btnSecondary}`
            }`}
          >
            Editor View
          </button>
          <button
            onClick={() => {
              setTreeView(true);
              if (!output) handleFormat();
            }}
            className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all ${
              treeView 
                ? 'bg-indigo-600 text-white border-indigo-500 shadow-md' 
                : `${t.btnSecondary}`
            }`}
          >
            Interactive Tree View
          </button>
        </div>
      </div>

      {/* Editor Panels */}
      {!treeView ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Panel */}
          <div className={`flex flex-col h-[520px] border rounded-xl overflow-hidden ${t.inputBg} ${t.border}`}>
            <div className={`px-4 py-3 border-b flex items-center justify-between ${t.panelBg} ${t.border}`}>
              <span className={`text-xs font-semibold font-mono ${t.text}`}>Raw Input JSON</span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleClear}
                  className="text-slate-400 hover:text-pink-400 p-1 rounded transition-colors"
                  title="Clear Input" aria-label="Clear Input"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <label htmlFor="raw-json-input" className="sr-only">Raw JSON Input</label>
            <textarea
              id="raw-json-input"
              aria-label="Raw JSON Input"
              className={`flex-1 w-full p-4 font-mono text-sm leading-relaxed focus:outline-none resize-none placeholder:text-slate-650 bg-transparent ${t.text}`}
              placeholder='Paste or write your raw JSON here... e.g. {"name": "OwnFormatters"}'
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <div className={`px-4 py-2 border-t flex items-center justify-between text-[11px] font-mono ${t.panelBg} ${t.border} ${t.textMuted}`}>
              <span>Lines: {input.split('\n').length}</span>
              <span>Characters: {input.length}</span>
            </div>
          </div>

          {/* Output Panel */}
          <div className={`flex flex-col h-[520px] border rounded-xl overflow-hidden ${t.inputBg} ${t.border}`}>
            <div className={`px-4 py-3 border-b flex items-center justify-between ${t.panelBg} ${t.border}`}>
              <span className={`text-xs font-semibold font-mono ${t.text}`}>Formatted & Beautified Output</span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={handleDownload}
                  disabled={!output && !input}
                  aria-label="Download Formatted JSON file"
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 disabled:opacity-40 ${t.btnSecondary}`}
                  title="Download JSON"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
                <button
                  onClick={handleCopy}
                  aria-label="Copy Formatted JSON to Clipboard"
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 ${t.btnSecondary}`}
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
              </div>
            </div>
            <div className="flex-1 overflow-auto p-4 bg-transparent">
              {output ? (
                <pre className={`font-mono text-sm leading-relaxed whitespace-pre-wrap ${t.text}`}>{output}</pre>
              ) : (
                <div className={`h-full flex flex-col items-center justify-center space-y-2 ${t.textMuted}`}>
                  <ArrowLeftRight className="w-8 h-8 text-slate-400 opacity-60" />
                  <p className="text-xs font-mono">Formatted output will appear here</p>
                </div>
              )}
            </div>
            <div className={`px-4 py-2 border-t flex items-center justify-between text-[11px] font-mono ${t.panelBg} ${t.border} ${t.textMuted}`}>
              <span>Lines: {output ? output.split('\n').length : 0}</span>
              <span>Characters: {output.length}</span>
            </div>
          </div>
        </div>
      ) : (
        /* Interactive Tree View Panel with Expand & Collapse tools */
        <div className={`flex flex-col min-h-[480px] max-h-[640px] border rounded-xl overflow-hidden ${t.inputBg} ${t.border}`}>
          <div className={`px-4 py-3 border-b flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${t.panelBg} ${t.border}`}>
            <span className={`text-xs font-semibold font-mono ${t.text}`}>Interactive Object Tree Inspector</span>
            {parsedObjectForTree && (
              <div className="flex flex-wrap items-center gap-2">
                <button
                  onClick={() => {
                    setToggledPaths({});
                    setDefaultExpanded(true);
                  }}
                  className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-all border ${t.btnSecondary}`}
                  title="Expand all tree nodes"
                >
                  Expand All
                </button>
                <button
                  onClick={() => {
                    setToggledPaths({});
                    setDefaultExpanded(false);
                  }}
                  className={`text-xs font-semibold px-2.5 py-1.5 rounded-lg transition-all border ${t.btnSecondary}`}
                  title="Collapse all tree nodes"
                >
                  Collapse All
                </button>
                <input
                  type="text"
                  placeholder="Filter key name..."
                  className={`border text-xs rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-500 w-full sm:w-48 font-mono ${t.inputBg} ${t.text} ${t.border}`}
                  value={searchKey}
                  onChange={(e) => setSearchKey(e.target.value)}
                />
              </div>
            )}
          </div>
          <div className={`flex-1 overflow-auto p-6 ${t.canvasBg}`}>
            {parsedObjectForTree ? (
              <div className="space-y-1">
                {renderInteractiveTreeNode('', parsedObjectForTree, 'root', 0)}
              </div>
            ) : (
              <div className={`h-full py-20 flex flex-col items-center justify-center space-y-2 ${t.textMuted}`}>
                <AlertCircle className="w-8 h-8 text-indigo-500 animate-pulse" />
                <p className="text-sm font-semibold">No Valid Object to Inspect</p>
                <p className="text-xs text-center max-w-sm font-mono leading-relaxed">
                  Be sure to enter a valid JSON code in the Editor View and click format before opening the Tree Inspector.
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Action Trigger Buttons */}
      {!treeView && (
        <div className="flex flex-wrap gap-3 items-center justify-between">
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => handleFormat(false)}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2.5 rounded-xl shadow-md transition-all active:scale-[0.98] flex items-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Beautify & Validate
            </button>
            <button
              onClick={() => handleFormat(true)}
              className={`text-xs font-semibold px-4 py-2.5 rounded-xl transition-all active:scale-[0.98] border ${t.btnSecondary}`}
            >
              Minify JSON
            </button>
          </div>

          {/* Validation Status Indicator */}
          {status.type !== 'idle' && (
            <div 
              role="status" 
              aria-live="polite"
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium border font-mono ${
              status.type === 'success' 
                ? (isLight 
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800' 
                    : 'bg-emerald-950/20 border-emerald-900/40 text-emerald-300')
                : (isLight 
                    ? 'bg-red-50 border-red-200 text-red-800' 
                    : 'bg-pink-950/20 border-pink-900/40 text-pink-300')
            }`}>
              {status.type === 'success' ? (
                <CheckCircle className={`w-4 h-4 flex-shrink-0 ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`} />
              ) : (
                <AlertCircle className={`w-4 h-4 flex-shrink-0 ${isLight ? 'text-red-600' : 'text-pink-400'}`} />
              )}
              <span className="line-clamp-1">{status.message}</span>
            </div>
          )}
        </div>
      )}

      {/* SEMANTIC SUPPORTING CONTENT & SPECIFICATIONS */}
      <article className={`border-t pt-10 mt-10 space-y-10 font-sans ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
        
        {/* Section 1: What is a JSON Formatter? */}
        <section className={`p-6 sm:p-8 rounded-2xl border ${t.card} ${t.border} space-y-4`}>
          <h2 className={`text-xl font-bold tracking-tight flex items-center gap-2.5 ${t.text}`}>
            <Code2 className="w-5 h-5 text-indigo-500 shrink-0" />
            <span>What is a JSON Formatter?</span>
          </h2>
          <p className="text-sm leading-relaxed">
            A JSON formatter (also known as a JSON beautifier or pretty printer) is a developer utility that converts unformatted, minified, or disorganized JavaScript Object Notation text into clean, structured, and properly indented code. Raw JSON returned by REST APIs, microservices, and database queries is typically compressed onto a single line to reduce bandwidth consumption. While efficient for machine transmission, dense payloads are challenging for humans to read. A JSON formatter reconstructs the structural hierarchy with consistent spacing and line breaks, making keys, values, nested arrays, and objects immediately clear.
          </p>
        </section>

        {/* Section 2: How to Format JSON */}
        <section className={`p-6 sm:p-8 rounded-2xl border ${t.card} ${t.border} space-y-5`}>
          <h2 className={`text-xl font-bold tracking-tight flex items-center gap-2.5 ${t.text}`}>
            <Layers className="w-5 h-5 text-indigo-500 shrink-0" />
            <span>How to Format JSON</span>
          </h2>
          <p className="text-sm leading-relaxed">
            Formatting your data takes three simple steps with the OwnFormatters online JSON tool:
          </p>
          <ol className="space-y-3 text-sm">
            <li className="flex items-start gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-600/20 text-indigo-400 font-bold text-xs shrink-0 mt-0.5 border border-indigo-500/30">1</span>
              <div>
                <strong className={t.text}>Paste or load your JSON:</strong> Paste raw JSON text into the editor on the left, or click <span className="font-semibold text-indigo-400">Load Sample</span> to test with an example payload.
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-600/20 text-indigo-400 font-bold text-xs shrink-0 mt-0.5 border border-indigo-500/30">2</span>
              <div>
                <strong className={t.text}>Choose your indentation and format:</strong> Select 2 spaces, 4 spaces, 8 spaces, or tabs, then click <span className="font-semibold text-indigo-400">Beautify & Validate</span>. You can also click <span className="font-semibold text-indigo-400">Minify JSON</span> if you need a compact one-line output.
              </div>
            </li>
            <li className="flex items-start gap-3">
              <span className="flex items-center justify-center w-6 h-6 rounded-full bg-indigo-600/20 text-indigo-400 font-bold text-xs shrink-0 mt-0.5 border border-indigo-500/30">3</span>
              <div>
                <strong className={t.text}>Copy or download the result:</strong> Click <span className="font-semibold text-indigo-400">Copy</span> to send the formatted JSON to your clipboard, or click <span className="font-semibold text-indigo-400">Download</span> to save a clean <code className="text-xs px-1.5 py-0.5 rounded bg-slate-800 text-indigo-300 font-mono">formatted.json</code> file directly to your device.
              </div>
            </li>
          </ol>
        </section>

        {/* Section 3: JSON Formatting Example */}
        <section className={`p-6 sm:p-8 rounded-2xl border ${t.card} ${t.border} space-y-5`}>
          <h2 className={`text-xl font-bold tracking-tight flex items-center gap-2.5 ${t.text}`}>
            <FileText className="w-5 h-5 text-indigo-500 shrink-0" />
            <span>JSON Formatting Example</span>
          </h2>
          <p className="text-sm leading-relaxed">
            Here is a practical example showing how raw, minified input is transformed into clean, readable JSON with 2-space indentation:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs font-mono">
            <div className={`p-4 rounded-xl border ${t.inputBg} ${t.border} space-y-2`}>
              <div className={`text-[11px] font-bold uppercase tracking-wider ${t.textMuted}`}>Input (Minified JSON):</div>
              <pre className={`p-3 rounded-lg overflow-x-auto ${t.canvasBg} text-slate-300`}>
                {`{"name":"Ava","skills":["JavaScript","React"],"active":true}`}
              </pre>
            </div>
            <div className={`p-4 rounded-xl border ${t.inputBg} ${t.border} space-y-2`}>
              <div className={`text-[11px] font-bold uppercase tracking-wider text-emerald-400`}>Output (Beautified JSON):</div>
              <pre className={`p-3 rounded-lg overflow-x-auto ${t.canvasBg} text-emerald-300`}>
{`{
  "name": "Ava",
  "skills": [
    "JavaScript",
    "React"
  ],
  "active": true
}`}
              </pre>
            </div>
          </div>
          <p className="text-xs leading-relaxed text-slate-400">
            Notice how proper indentation immediately makes arrays and primitive values distinguishable while preserving strict RFC 8259 syntax compliance.
          </p>
        </section>

        {/* Section 4: JSON Formatter vs JSON Minifier */}
        <section className={`p-6 sm:p-8 rounded-2xl border ${t.card} ${t.border} space-y-4`}>
          <h2 className={`text-xl font-bold tracking-tight flex items-center gap-2.5 ${t.text}`}>
            <ArrowLeftRight className="w-5 h-5 text-indigo-500 shrink-0" />
            <span>JSON Formatter vs JSON Minifier</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
            <div className={`p-4 rounded-xl border ${t.panelBg} ${t.border} space-y-2`}>
              <h3 className={`font-bold ${t.text}`}>JSON Formatter / Beautifier</h3>
              <p className="text-xs leading-relaxed text-slate-400">
                Adds indentation, consistent spacing, and line breaks. Its goal is <strong>human readability</strong> during debugging, code review, API development, and data analysis.
              </p>
            </div>
            <div className={`p-4 rounded-xl border ${t.panelBg} ${t.border} space-y-2`}>
              <h3 className={`font-bold ${t.text}`}>JSON Minifier</h3>
              <p className="text-xs leading-relaxed text-slate-400">
                Strips all non-essential whitespace, carriage returns, and newlines. Its goal is <strong>compact payload size</strong> to optimize network throughput and reduce HTTP payload weight in production systems.
              </p>
            </div>
          </div>
        </section>

        {/* Section 5: JSON Validation */}
        <section className={`p-6 sm:p-8 rounded-2xl border ${t.card} ${t.border} space-y-4`}>
          <h2 className={`text-xl font-bold tracking-tight flex items-center gap-2.5 ${t.text}`}>
            <AlertCircle className="w-5 h-5 text-amber-500 shrink-0" />
            <span>JSON Validation & Syntax Rules</span>
          </h2>
          <p className="text-sm leading-relaxed">
            Valid JSON must strictly conform to the <strong>RFC 8259</strong> standard. Unlike flexible JavaScript objects, JSON requires strict syntax. If your payload is invalid, our tool identifies the exact line and column number. Common syntax errors include:
          </p>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <li className={`p-3 rounded-lg border ${t.inputBg} ${t.border}`}>
              <strong className={`block mb-1 ${t.text}`}>Missing Double Quotes</strong>
              <span className="text-slate-400">All object keys and string values must use double quotes (<code className="text-indigo-300">"key": "value"</code>). Single quotes (<code className="text-pink-400">'key'</code>) are invalid.</span>
            </li>
            <li className={`p-3 rounded-lg border ${t.inputBg} ${t.border}`}>
              <strong className={`block mb-1 ${t.text}`}>Trailing Commas</strong>
              <span className="text-slate-400">JSON does not allow a comma after the final item in an object or array (e.g., <code className="text-pink-400">[1, 2,]</code> will fail).</span>
            </li>
            <li className={`p-3 rounded-lg border ${t.inputBg} ${t.border}`}>
              <strong className={`block mb-1 ${t.text}`}>Unmatched Braces or Brackets</strong>
              <span className="text-slate-400">Every opening curly brace <code className="text-indigo-300">{'{'}</code> and square bracket <code className="text-indigo-300">[</code> must have a corresponding closing partner.</span>
            </li>
            <li className={`p-3 rounded-lg border ${t.inputBg} ${t.border}`}>
              <strong className={`block mb-1 ${t.text}`}>Invalid Escape Characters</strong>
              <span className="text-slate-400">Special characters inside string values must be properly escaped (e.g., <code className="text-indigo-300">\"</code>, <code className="text-indigo-300">\\</code>, <code className="text-indigo-300">\n</code>, <code className="text-indigo-300">\t</code>).</span>
            </li>
          </ul>
          <p className="text-xs text-slate-400">
            <em>Note:</em> The OwnFormatters JSON Formatter validates syntax and pinpoints parsing errors. It does not guess or alter your underlying data structure.
          </p>
        </section>

        {/* Section 6: Privacy & Client-Side Browser Processing */}
        <section className={`p-6 sm:p-8 rounded-2xl border ${t.card} ${t.border} space-y-4`}>
          <h2 className={`text-xl font-bold tracking-tight flex items-center gap-2.5 ${t.text}`}>
            <ShieldCheck className="w-5 h-5 text-emerald-500 shrink-0" />
            <span>Privacy & Client-Side Browser Processing</span>
          </h2>
          <p className="text-sm leading-relaxed">
            Your privacy is guaranteed by design. All JSON parsing, formatting, minification, tree inspection, and validation occur <strong>100% locally in your web browser</strong> using client-side JavaScript APIs.
          </p>
          <p className="text-sm leading-relaxed text-slate-400">
            Your data is never transmitted to an external server, logged in access records, or stored in a remote database. You can safely inspect sensitive API responses, private credentials, and production configurations with complete confidence that your payloads never leave your computer.
          </p>
        </section>

        {/* Section 7: Frequently Asked Questions */}
        <section className={`p-6 sm:p-8 rounded-2xl border ${t.card} ${t.border} space-y-6`}>
          <h2 className={`text-xl font-bold tracking-tight flex items-center gap-2.5 ${t.text}`}>
            <HelpCircle className="w-5 h-5 text-indigo-500 shrink-0" />
            <span>Frequently Asked Questions</span>
          </h2>
          
          <div className="space-y-3">
            {[
              {
                q: "What does a JSON formatter do?",
                a: "A JSON formatter parses unformatted, messy, or minified JSON strings and reorganizes them with consistent indentation (such as 2 spaces, 4 spaces, or tabs) and line breaks, making complex data structures easy for developers to read, inspect, and debug."
              },
              {
                q: "Can this tool format minified JSON?",
                a: "Yes. You can paste single-line or heavily minified JSON into the editor and click 'Beautify & Validate' to instantly expand it into human-readable formatted JSON with proper indentation."
              },
              {
                q: "Does the formatter validate JSON?",
                a: "Yes. The formatter checks your input against standard RFC 8259 JSON syntax rules. If your JSON has errors—such as missing quotes, trailing commas, or unescaped characters—the tool highlights the issue and points to the specific line and column number. It reports errors accurately without silently altering your source data."
              },
              {
                q: "What is the difference between formatting and minifying JSON?",
                a: "Formatting (or beautifying / pretty printing) adds whitespace, indentation, and newlines to maximize human readability. Minifying removes all unnecessary whitespace, comments, and line breaks to produce the smallest possible payload size for fast network transmission."
              },
              {
                q: "Is my JSON uploaded to a server?",
                a: "No. All JSON formatting, validation, minification, and tree inspection happen entirely client-side inside your web browser. Your data is never uploaded, transmitted, or logged to OwnFormatters servers."
              }
            ].map((faq, idx) => (
              <div key={idx} className={`border rounded-xl overflow-hidden ${t.panelBg} ${t.border}`}>
                <button
                  onClick={() => toggleFaq(idx)}
                  className={`w-full text-left p-4 font-semibold text-sm flex items-center justify-between gap-4 transition-colors ${t.text}`}
                  aria-expanded={!!openFaqs[idx]}
                >
                  <span>{faq.q}</span>
                  {openFaqs[idx] ? (
                    <ChevronUp className="w-4 h-4 text-indigo-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                  )}
                </button>
                {openFaqs[idx] && (
                  <div className={`px-4 pb-4 pt-1 text-xs leading-relaxed border-t ${t.border} ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
                    <p>{faq.a}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>

        {/* Section 8: Related Developer Tools */}
        <section className={`p-6 sm:p-8 rounded-2xl border ${t.card} ${t.border} space-y-5`}>
          <h2 className={`text-xl font-bold tracking-tight flex items-center gap-2.5 ${t.text}`}>
            <Compass className="w-5 h-5 text-indigo-500 shrink-0" />
            <span>Related Developer Tools</span>
          </h2>
          <p className="text-sm leading-relaxed text-slate-400">
            Explore companion utilities designed for structured data transformation, schema validation, and conversion:
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
            <a
              href="/yaml-formatter"
              onClick={(e) => handleInternalNav(e, '/yaml-formatter')}
              className={`p-3.5 rounded-xl border flex items-center justify-between group transition-all ${t.panelBg} ${t.border} hover:border-indigo-500`}
            >
              <div>
                <strong className={`block ${t.text} group-hover:text-indigo-400 transition-colors`}>Convert JSON to YAML</strong>
                <span className="text-[11px] text-slate-500">Transform JSON into clean YAML configs</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition-colors" />
            </a>
            <a
              href="/csv-to-json"
              onClick={(e) => handleInternalNav(e, '/csv-to-json')}
              className={`p-3.5 rounded-xl border flex items-center justify-between group transition-all ${t.panelBg} ${t.border} hover:border-indigo-500`}
            >
              <div>
                <strong className={`block ${t.text} group-hover:text-indigo-400 transition-colors`}>Convert CSV to JSON</strong>
                <span className="text-[11px] text-slate-500">Parse tabular spreadsheet data to JSON</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition-colors" />
            </a>
            <a
              href="/json-to-code"
              onClick={(e) => handleInternalNav(e, '/json-to-code')}
              className={`p-3.5 rounded-xl border flex items-center justify-between group transition-all ${t.panelBg} ${t.border} hover:border-indigo-500`}
            >
              <div>
                <strong className={`block ${t.text} group-hover:text-indigo-400 transition-colors`}>JSON to Code Generator</strong>
                <span className="text-[11px] text-slate-500">TypeScript, Go, Rust, Java & C# models</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition-colors" />
            </a>
            <a
              href="/base64-encoder-decoder"
              onClick={(e) => handleInternalNav(e, '/base64-encoder-decoder')}
              className={`p-3.5 rounded-xl border flex items-center justify-between group transition-all ${t.panelBg} ${t.border} hover:border-indigo-500`}
            >
              <div>
                <strong className={`block ${t.text} group-hover:text-indigo-400 transition-colors`}>Base64 Encoder / Decoder</strong>
                <span className="text-[11px] text-slate-500">Encode and decode payloads in-browser</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition-colors" />
            </a>
            <a
              href="/json-schema-generator"
              onClick={(e) => handleInternalNav(e, '/json-schema-generator')}
              className={`p-3.5 rounded-xl border flex items-center justify-between group transition-all ${t.panelBg} ${t.border} hover:border-indigo-500`}
            >
              <div>
                <strong className={`block ${t.text} group-hover:text-indigo-400 transition-colors`}>JSON Schema Generator</strong>
                <span className="text-[11px] text-slate-500">Draft-07 schema creation & validation</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition-colors" />
            </a>
            <a
              href="/learn-json"
              onClick={(e) => handleInternalNav(e, '/learn-json')}
              className={`p-3.5 rounded-xl border flex items-center justify-between group transition-all ${t.panelBg} ${t.border} hover:border-indigo-500`}
            >
              <div>
                <strong className={`block ${t.text} group-hover:text-indigo-400 transition-colors flex items-center gap-1`}>
                  <BookOpen className="w-3.5 h-3.5 text-teal-400" />
                  Learn JSON Syntax & RFC Rules
                </strong>
                <span className="text-[11px] text-slate-500">Read our comprehensive JSON developer guide</span>
              </div>
              <ArrowRight className="w-4 h-4 text-slate-500 group-hover:text-indigo-400 transition-colors" />
            </a>
          </div>
        </section>

      </article>

    </div>
  );
}
