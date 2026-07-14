import React, { useState } from 'react';
import { Play, Copy, Check, Trash2, List, FileCode, CheckCircle, AlertCircle, BookOpen, Search, HelpCircle, ArrowRight } from 'lucide-react';

const SAMPLE_STORE = `{
  "store": {
    "book": [
      {
        "category": "reference",
        "author": "Nigel Rees",
        "title": "Sayings of the Century",
        "price": 8.95
      },
      {
        "category": "fiction",
        "author": "Evelyn Waugh",
        "title": "Sword of Honour",
        "price": 12.99
      },
      {
        "category": "fiction",
        "author": "Herman Melville",
        "title": "Moby Dick",
        "isbn": "0-553-21311-3",
        "price": 8.99
      },
      {
        "category": "fiction",
        "author": "J. R. R. Tolkien",
        "title": "The Lord of the Rings",
        "isbn": "0-395-19395-8",
        "price": 22.99
      }
    ],
    "bicycle": {
      "color": "red",
      "price": 19.95
    }
  },
  "expensive": 10
}`;

const CHEATSHEETS = [
  { label: 'Root Node', expr: '$', desc: 'Selects the root JSON object.' },
  { label: 'All Books', expr: '$.store.book[*]', desc: 'Wildcard query selects all books.' },
  { label: 'First Book Title', expr: '$.store.book[0].title', desc: 'Indexes first item properties.' },
  { label: 'Recursive Authors', expr: '$..author', desc: 'Recursive descent matching all author properties.' },
  { label: 'Cheap Books (< $10)', expr: '$.store.book[?(@.price < 10)]', desc: 'Filter expression checking item criteria.' },
  { label: 'Expensive Books', expr: '$.store.book[?(@.price > 10)]', desc: 'Filter expression with numeric comparisons.' },
  { label: 'Bicycle Specs', expr: '$.store.bicycle', desc: 'Extracts nested object value.' }
];

interface MatchedNode {
  path: string;
  value: any;
}

export default function JsonPathTool({ theme }: { theme?: any }) {
  const [jsonInput, setJsonInput] = useState<string>(SAMPLE_STORE);
  const [query, setQuery] = useState<string>('$.store.book[*].title');
  const [matches, setMatches] = useState<MatchedNode[]>([]);
  const [status, setStatus] = useState<{ type: 'idle' | 'success' | 'error'; message: string }>({ type: 'idle', message: '' });
  const [copied, setCopied] = useState<boolean>(false);

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

  // Standard lightweight robust JSONPath Evaluator
  const evaluateJsonPath = () => {
    if (!jsonInput.trim()) {
      setStatus({ type: 'error', message: 'Please provide some JSON input to evaluate.' });
      return;
    }
    if (!query.trim()) {
      setStatus({ type: 'error', message: 'Please enter a JSONPath query expression.' });
      return;
    }

    let data: any;
    try {
      data = JSON.parse(jsonInput);
    } catch (e: any) {
      setStatus({ type: 'error', message: `Invalid JSON Input: ${e.message}` });
      return;
    }

    const results: MatchedNode[] = [];

    // Helper functions for safely traversing
    const traverse = (currentVal: any, parts: string[], pathSoFar: string) => {
      if (parts.length === 0) {
        results.push({ path: pathSoFar, value: currentVal });
        return;
      }

      const nextPart = parts[0];
      const remaining = parts.slice(1);

      // Recursive descent operator
      if (nextPart === 'descendant') {
        const targetProp = remaining[0];
        const subRemaining = remaining.slice(1);

        const recursiveSearch = (val: any, p: string) => {
          if (val === null || typeof val !== 'object') return;

          if (Array.isArray(val)) {
            val.forEach((item, index) => {
              recursiveSearch(item, `${p}[${index}]`);
            });
          } else {
            Object.entries(val).forEach(([k, v]) => {
              const currentPath = `${p}.${k}`;
              if (k === targetProp) {
                traverse(v, subRemaining, currentPath);
              }
              recursiveSearch(v, currentPath);
            });
          }
        };

        recursiveSearch(currentVal, pathSoFar);
        return;
      }

      if (currentVal === null || currentVal === undefined) return;

      // Filter expression e.g. [?(@.price < 10)]
      if (nextPart.startsWith('?(') && nextPart.endsWith(')')) {
        if (!Array.isArray(currentVal)) return;

        // Parse condition like @.price < 10 or @.category == 'fiction'
        const condition = nextPart.substring(2, nextPart.length - 1); // remove ?( and )
        
        currentVal.forEach((item, index) => {
          if (evaluateCondition(item, condition)) {
            traverse(item, remaining, `${pathSoFar}[${index}]`);
          }
        });
        return;
      }

      // Wildcard *
      if (nextPart === '*') {
        if (Array.isArray(currentVal)) {
          currentVal.forEach((item, idx) => {
            traverse(item, remaining, `${pathSoFar}[${idx}]`);
          });
        } else if (typeof currentVal === 'object') {
          Object.entries(currentVal).forEach(([k, v]) => {
            traverse(v, remaining, `${pathSoFar}.${k}`);
          });
        }
        return;
      }

      // Bracketed Index e.g. [0] or ['0']
      if (nextPart.startsWith('[') && nextPart.endsWith(']')) {
        const indexStr = nextPart.slice(1, -1);
        if (indexStr === '*') {
          if (Array.isArray(currentVal)) {
            currentVal.forEach((item, idx) => {
              traverse(item, remaining, `${pathSoFar}[${idx}]`);
            });
          }
          return;
        }

        const indexNum = parseInt(indexStr, 10);
        if (!isNaN(indexNum) && Array.isArray(currentVal)) {
          if (indexNum >= 0 && indexNum < currentVal.length) {
            traverse(currentVal[indexNum], remaining, `${pathSoFar}[${indexNum}]`);
          }
        } else if (typeof currentVal === 'object') {
          // Property lookup in brackets, e.g. ['book']
          const cleanedKey = indexStr.replace(/['"]/g, '');
          if (cleanedKey in currentVal) {
            traverse(currentVal[cleanedKey], remaining, `${pathSoFar}.${cleanedKey}`);
          }
        }
        return;
      }

      // Dot property lookup
      if (typeof currentVal === 'object') {
        if (nextPart in currentVal) {
          traverse(currentVal[nextPart], remaining, pathSoFar === '$' ? `$.${nextPart}` : `${pathSoFar}.${nextPart}`);
        }
      }
    };

    // Helper to evaluate basic filter condition
    const evaluateCondition = (item: any, condStr: string): boolean => {
      // Clean string
      const cleanCond = condStr.trim();
      
      // Supported operators: <, >, <=, >=, ==, !=
      const match = cleanCond.match(/^@\.([a-zA-Z0-9_]+)\s*(<=|>=|==|!=|<|>)\s*(.+)$/);
      if (!match) return false;

      const [, field, operator, rightValStr] = match;
      if (!(field in item)) return false;

      const leftValue = item[field];
      let rightValue: any = rightValStr.trim();

      // Parse right value
      if (rightValue.startsWith('"') && rightValue.endsWith('"')) {
        rightValue = rightValue.slice(1, -1);
      } else if (rightValue.startsWith("'") && rightValue.endsWith("'")) {
        rightValue = rightValue.slice(1, -1);
      } else if (rightValue === 'true') {
        rightValue = true;
      } else if (rightValue === 'false') {
        rightValue = false;
      } else {
        const parsedNum = parseFloat(rightValue);
        if (!isNaN(parsedNum)) {
          rightValue = parsedNum;
        }
      }

      switch (operator) {
        case '==': return leftValue == rightValue;
        case '!=': return leftValue != rightValue;
        case '<': return leftValue < rightValue;
        case '>': return leftValue > rightValue;
        case '<=': return leftValue <= rightValue;
        case '>=': return leftValue >= rightValue;
        default: return false;
      }
    };

    // Parse path expression into tokens
    const parseTokens = (expr: string): string[] => {
      const parts: string[] = [];
      let i = 0;

      if (expr.startsWith('$')) {
        i = 1;
      }

      while (i < expr.length) {
        const char = expr[i];

        // Recursive descent check: ..
        if (char === '.' && expr[i + 1] === '.') {
          parts.push('descendant');
          i += 2;
          continue;
        }

        // Standard dot separator
        if (char === '.') {
          i++;
          continue;
        }

        // Bracketed access: [ ... ]
        if (char === '[') {
          let bracketContent = '';
          i++;
          while (i < expr.length && expr[i] !== ']') {
            bracketContent += expr[i];
            i++;
          }
          i++; // skip ']'
          parts.push(`[${bracketContent}]`);
          continue;
        }

        // Normal word check
        let word = '';
        while (i < expr.length && expr[i] !== '.' && expr[i] !== '[') {
          word += expr[i];
          i++;
        }
        if (word) {
          parts.push(word);
        }
      }

      return parts;
    };

    try {
      const tokens = parseTokens(query.trim());
      traverse(data, tokens, '$');

      if (results.length === 0) {
        setStatus({ type: 'success', message: 'No matches found.' });
        setMatches([]);
      } else {
        setStatus({ type: 'success', message: `Found ${results.length} matching element(s) in JSON tree.` });
        setMatches(results);
      }
    } catch (err: any) {
      setStatus({ type: 'error', message: `Parser execution failure: ${err.message}` });
      setMatches([]);
    }
  };

  const handleApplyCheatsheet = (expr: string) => {
    setQuery(expr);
    setStatus({ type: 'idle', message: '' });
  };

  const copyResults = () => {
    if (matches.length === 0) return;
    const valuesOnly = matches.map(m => m.value);
    navigator.clipboard.writeText(JSON.stringify(valuesOnly, null, 2));
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setJsonInput('');
    setQuery('');
    setMatches([]);
    setStatus({ type: 'idle', message: '' });
  };

  return (
    <div className={`p-6 space-y-6 ${t.text}`}>
      {/* Title block */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-sans font-bold tracking-tight">JSONPath Tester</h1>
          <p className={`text-xs ${t.textMuted} mt-1`}>
            Execute, analyze, and inspect queries using the standard JSONPath notation against arbitrary objects.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              setJsonInput(SAMPLE_STORE);
              setStatus({ type: 'idle', message: '' });
            }}
            className={`px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 border transition-all ${t.btnSecondary}`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Load Sample Store JSON
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

      {/* Query Bar */}
      <div className={`p-4 rounded-xl border ${t.border} bg-slate-900/10 space-y-3`}>
        <div className="flex flex-col md:flex-row gap-3 items-center">
          <div className="relative flex-1 w-full">
            <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-mono text-sm">
              JSONPath
            </span>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. $.store.book[*].author"
              className={`w-full py-3 pl-20 pr-4 rounded-xl border font-mono text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 ${t.inputBg} ${t.border}`}
              id="json-path-query-input"
            />
          </div>
          <button
            onClick={evaluateJsonPath}
            className={`px-6 py-3 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all w-full md:w-auto shrink-0 ${t.btnPrimary}`}
          >
            <Search className="w-4 h-4" />
            Run Query
          </button>
        </div>
      </div>

      {/* Main Panel Splitting */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left column: JSON Document input */}
        <div className="lg:col-span-6 space-y-2">
          <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono block px-1">
            Source JSON Payload
          </span>
          <textarea
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder={`{\n  "store": {}\n}`}
            className={`w-full h-[460px] p-4 rounded-xl border font-mono text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 ${t.inputBg} ${t.border} resize-none`}
            id="json-path-payload-input"
          />
        </div>

        {/* Right column: Results and Cheat Sheet */}
        <div className="lg:col-span-6 flex flex-col gap-6">
          {/* Matches Output */}
          <div className="space-y-2 flex-1 flex flex-col">
            <div className="flex justify-between items-center px-1">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">
                Query Matches ({matches.length})
              </span>
              {matches.length > 0 && (
                <button
                  onClick={copyResults}
                  className="p-1 hover:text-indigo-400 text-slate-500 transition-colors flex items-center gap-1 text-xs"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span className={copied ? 'text-emerald-400' : ''}>Copy Array Only</span>
                </button>
              )}
            </div>
            <div
              className={`flex-1 min-h-[220px] max-h-[300px] p-4 rounded-xl border overflow-y-auto font-mono text-xs ${t.inputBg} ${t.border}`}
            >
              {matches.length > 0 ? (
                <div className="space-y-3">
                  {matches.map((item, idx) => (
                    <div key={idx} className="pb-3 border-b border-slate-900/50 last:border-0 last:pb-0">
                      <div className="text-[10px] text-indigo-400 font-semibold uppercase tracking-wider">
                        Path: {item.path}
                      </div>
                      <pre className="mt-1 text-slate-200 overflow-x-auto text-xs">
                        {typeof item.value === 'object' ? JSON.stringify(item.value, null, 2) : String(item.value)}
                      </pre>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-slate-500 gap-2">
                  <FileCode className="w-8 h-8 text-slate-700" />
                  <span className="text-xs">Execute a valid query above to see matches here.</span>
                </div>
              )}
            </div>
          </div>

          {/* Reference Cheat Sheet */}
          <div className={`p-4 rounded-xl border ${t.border} bg-slate-900/20 space-y-3`}>
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 font-mono">
              Quick Query Builder
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {CHEATSHEETS.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleApplyCheatsheet(item.expr)}
                  className="flex items-center justify-between p-2.5 rounded-lg border border-slate-900 bg-slate-950/20 text-left hover:border-indigo-500/30 hover:bg-indigo-500/5 transition-all group"
                >
                  <div className="truncate">
                    <p className="text-xs font-bold font-mono text-indigo-400">{item.expr}</p>
                    <p className="text-[10px] text-slate-500 truncate mt-0.5">{item.label} - {item.desc}</p>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-600 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Evaluation notification status bar */}
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
              {status.type === 'success' ? 'SUCCESS' : 'EVALUATION ERROR'}
            </span>
            <p className="text-xs mt-1 font-mono leading-relaxed">{status.message}</p>
          </div>
        </div>
      )}
    </div>
  );
}
