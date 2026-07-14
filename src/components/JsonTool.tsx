import React, { useState } from 'react';
import { Play, Copy, Check, Trash2, ArrowLeftRight, HelpCircle, FileText, CheckCircle, AlertCircle } from 'lucide-react';

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
        message: err.message || 'Invalid JSON syntax' 
      });
    }
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
          <span className={`text-xs font-semibold ${t.textMuted}`}>Indent Style:</span>
          <select 
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
                  title="Clear Input"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <textarea
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
              <div className="flex items-center gap-1">
                <button
                  onClick={handleCopy}
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
            <div className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium border font-mono ${
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

      {/* CORE JSON KNOWLEDGE GUIDE AND DOCUMENTATION (AdSense compliance) */}
      <div className={`border rounded-xl p-6 md:p-8 space-y-6 ${t.card} ${t.border}`}>
        <div className={`flex items-center gap-2.5 border-b pb-4 ${t.border}`}>
          <FileText className="w-5 h-5 text-indigo-400" />
          <h3 className={`text-base font-bold font-sans ${t.text}`}>The Comprehensive JSON Syntax & Validation Handbook</h3>
        </div>

        <div className={`grid grid-cols-1 md:grid-cols-2 gap-8 text-xs leading-relaxed font-sans ${isLight ? 'text-slate-600' : 'text-slate-400'}`}>
          <div className="space-y-4">
            <h4 className={`text-sm font-bold font-sans ${t.text}`}>What is JSON (JavaScript Object Notation)?</h4>
            <p>
              JSON is a lightweight, language-independent data interchange standard defined under <strong>RFC 8259</strong>. It uses simple human-readable text to encode structured data in key-value collections and ordered lists (arrays).
            </p>
            <p>
              Despite having originated from the JavaScript language syntax, JSON is supported by almost every modern programming language including Python, Java, Go, PHP, C++, and Ruby, making it the supreme choice for REST APIs, modern web sockets, and static app configurations.
            </p>

            <h4 className={`text-sm font-bold font-sans ${t.text}`}>Essential JSON Syntax Rules:</h4>
            <ul className="list-disc list-inside space-y-1.5 pl-1">
              <li><strong>Double Quotes Only:</strong> All string literals, including key declarations, must be wrapped in double quotes (<code className="text-indigo-400">"key"</code>). Single quotes (<code className="text-pink-400">'key'</code>) are invalid.</li>
              <li><strong>No Trailing Commas:</strong> Commas must separate items inside arrays or objects, but the final item must NOT have a trailing comma.</li>
              <li><strong>Primitive Types:</strong> Supports numbers, strings, booleans (<code className="text-indigo-300">true</code>, <code className="text-indigo-300">false</code>), objects, arrays, and <code className="text-indigo-300">null</code> values.</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className={`text-sm font-bold font-sans ${t.text}`}>Common JSON Pitfalls and Troubleshooting:</h4>
            <p>
              Developers often encounter errors when compiling JSON manually. Here are the most typical syntax bugs:
            </p>
            <div className={`p-4 rounded-xl border space-y-2.5 ${t.inputBg} ${t.border}`}>
              <div>
                <span className={`font-bold block ${t.text}`}>1. Unescaped Control Characters:</span>
                <p className="text-[11px] text-slate-400">Characters like tabulator keys or raw line-breaks inside a string must be escaped as <code className="text-indigo-450">\t</code> or <code className="text-indigo-450">\n</code>.</p>
              </div>
              <div>
                <span className={`font-bold block ${t.text}`}>2. Incorrect Comments:</span>
                <p className="text-[11px] text-slate-400">The JSON specification strictly prohibits comments (<code className="text-pink-400">//</code> or <code className="text-pink-400">/* */</code>). Strip comments before validating.</p>
              </div>
            </div>

            <div className={`p-4 rounded-xl border ${t.panelBg} ${t.border}`}>
              <span className={`font-bold block mb-1.5 font-sans ${t.text}`}>JSON Validation FAQ:</span>
              <p><strong>Q: Is my pasted data sent to a cloud database?</strong></p>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1">A: Absolutely not. This formatter operates 100% in-browser. The code runs inside your local browser memory sandbox, meaning no third-party server ever reads your secret development keys or user payload.</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
