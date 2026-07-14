import React, { useState } from 'react';
import { Copy, Check, Trash2, Columns, Layers, Sparkles, CheckCircle, AlertCircle } from 'lucide-react';

interface DiffToolProps {
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

const SAMPLE_ORIGINAL = `{
  "name": "own-formatters",
  "version": "1.0.0",
  "private": true,
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0"
  },
  "devDependencies": {
    "vite": "^4.0.0"
  }
}`;

const SAMPLE_MODIFIED = `{
  "name": "own-formatters-suite",
  "version": "1.1.0",
  "private": true,
  "dependencies": {
    "lucide-react": "^0.300.0",
    "motion": "^11.0.0",
    "react": "^18.3.1",
    "react-dom": "^18.3.1"
  },
  "devDependencies": {
    "vite": "^5.2.0"
  }
}`;

interface DiffItem {
  type: 'added' | 'removed' | 'unchanged';
  value: string;
  origLineNum?: number;
  modLineNum?: number;
}

export default function DiffTool({ theme }: DiffToolProps) {
  const [original, setOriginal] = useState<string>(SAMPLE_ORIGINAL);
  const [modified, setModified] = useState<string>(SAMPLE_MODIFIED);
  const [viewMode, setViewMode] = useState<'side' | 'inline'>('side');
  const [diffResult, setDiffResult] = useState<DiffItem[]>([]);
  const [status, setStatus] = useState<string>('');

  const isLight = theme?.isDark === false;
  const borderClass = theme?.border || 'border-slate-800/80';
  const borderMutedClass = theme?.borderMuted || 'border-slate-850';
  const cardClass = theme?.card || 'bg-slate-900/50';
  const inputBgClass = theme?.inputBg || 'bg-slate-950';
  const panelBgClass = theme?.panelBg || 'bg-slate-900';
  const textClass = theme?.text || 'text-slate-200';
  const textMutedClass = theme?.textMuted || 'text-slate-400';
  const canvasBgClass = theme?.canvasBg || 'bg-[#02050c]';

  // DP-based LCS Diff Engine
  const handleCalculateDiff = () => {
    if (!original.trim() && !modified.trim()) {
      setStatus('Inputs are empty!');
      return;
    }

    setStatus('');
    const origLines = original.split(/\r?\n/);
    const modLines = modified.split(/\r?\n/);
    
    const m = origLines.length;
    const n = modLines.length;

    // LCS Table Setup
    const dp: number[][] = Array.from({ length: m + 1 }, () => Array(n + 1).fill(0));

    for (let x = 1; x <= m; x++) {
      for (let y = 1; y <= n; y++) {
        if (origLines[x - 1] === modLines[y - 1]) {
          dp[x][y] = dp[x - 1][y - 1] + 1;
        } else {
          dp[x][y] = Math.max(dp[x - 1][y], dp[x][y - 1]);
        }
      }
    }

    // Backtrack to compile diff results sequentially
    const list: DiffItem[] = [];
    let x = m;
    let y = n;

    while (x > 0 || y > 0) {
      if (x > 0 && y > 0 && origLines[x - 1] === modLines[y - 1]) {
        list.unshift({
          type: 'unchanged',
          value: origLines[x - 1],
          origLineNum: x,
          modLineNum: y
        });
        x--;
        y--;
      } else if (y > 0 && (x === 0 || dp[x][y - 1] >= dp[x - 1][y])) {
        list.unshift({
          type: 'added',
          value: modLines[y - 1],
          modLineNum: y
        });
        y--;
      } else {
        list.unshift({
          type: 'removed',
          value: origLines[x - 1],
          origLineNum: x
        });
        x--;
      }
    }

    setDiffResult(list);
  };

  const handleClear = () => {
    setOriginal('');
    setModified('');
    setDiffResult([]);
  };

  const handleLoadSample = () => {
    setOriginal(SAMPLE_ORIGINAL);
    setModified(SAMPLE_MODIFIED);
    setDiffResult([]);
  };

  // Compile layout segments for side-by-side rendering alignment
  const renderSideBySide = () => {
    // Generate matched rows
    const rows: { left: DiffItem | null; right: DiffItem | null }[] = [];
    
    let tempRemovals: DiffItem[] = [];
    let tempAdditions: DiffItem[] = [];

    const flushBlocks = () => {
      const maxCount = Math.max(tempRemovals.length, tempAdditions.length);
      for (let k = 0; k < maxCount; k++) {
        rows.push({
          left: tempRemovals[k] || null,
          right: tempAdditions[k] || null
        });
      }
      tempRemovals = [];
      tempAdditions = [];
    };

    diffResult.forEach(item => {
      if (item.type === 'unchanged') {
        flushBlocks();
        rows.push({ left: item, right: item });
      } else if (item.type === 'removed') {
        tempRemovals.push(item);
      } else if (item.type === 'added') {
        tempAdditions.push(item);
      }
    });
    flushBlocks();

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 border rounded-xl overflow-hidden font-mono text-xs leading-relaxed divide-y lg:divide-y-0 lg:divide-x divide-slate-900/65">
        
        {/* Original Left Column */}
        <div className={`flex flex-col ${canvasBgClass}`}>
          <div className={`px-4 py-2 border-b font-sans font-bold flex justify-between items-center ${panelBgClass} ${borderClass}`}>
            <span className={isLight ? 'text-slate-700' : 'text-slate-350'}>Original Text</span>
            <span className="text-[10px] text-red-500 font-mono">- Deletions</span>
          </div>
          <div className="flex-1 overflow-auto max-h-[480px]">
            {rows.map((row, idx) => (
              <div 
                key={idx} 
                className={`flex w-full min-h-[22px] items-stretch ${
                  row.left?.type === 'removed' 
                    ? (isLight ? 'bg-red-50/75' : 'bg-red-950/20 text-red-300') 
                    : row.left === null 
                      ? (isLight ? 'bg-slate-50/50' : 'bg-slate-950/40 opacity-40') 
                      : ''
                }`}
              >
                <div className={`w-10 select-none border-r text-center text-[10px] text-slate-600 shrink-0 flex items-center justify-center ${borderMutedClass} ${panelBgClass}`}>
                  {row.left?.origLineNum || ''}
                </div>
                <div className="p-1 pl-3 font-mono break-all whitespace-pre-wrap flex items-center">
                  {row.left?.value || ''}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Modified Right Column */}
        <div className={`flex flex-col ${canvasBgClass}`}>
          <div className={`px-4 py-2 border-b font-sans font-bold flex justify-between items-center ${panelBgClass} ${borderClass}`}>
            <span className={isLight ? 'text-slate-700' : 'text-slate-350'}>Modified Text</span>
            <span className="text-[10px] text-emerald-500 font-mono">+ Additions</span>
          </div>
          <div className="flex-1 overflow-auto max-h-[480px]">
            {rows.map((row, idx) => (
              <div 
                key={idx} 
                className={`flex w-full min-h-[22px] items-stretch ${
                  row.right?.type === 'added' 
                    ? (isLight ? 'bg-emerald-50/75' : 'bg-emerald-950/25 text-emerald-300') 
                    : row.right === null 
                      ? (isLight ? 'bg-slate-50/50' : 'bg-slate-950/40 opacity-40') 
                      : ''
                }`}
              >
                <div className={`w-10 select-none border-r text-center text-[10px] text-slate-600 shrink-0 flex items-center justify-center ${borderMutedClass} ${panelBgClass}`}>
                  {row.right?.modLineNum || ''}
                </div>
                <div className="p-1 pl-3 font-mono break-all whitespace-pre-wrap flex items-center">
                  {row.right?.value || ''}
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    );
  };

  const renderInline = () => {
    return (
      <div className={`border rounded-xl overflow-hidden font-mono text-xs leading-relaxed ${canvasBgClass}`}>
        <div className={`px-4 py-2 border-b font-sans font-bold flex justify-between items-center ${panelBgClass} ${borderClass}`}>
          <span className={isLight ? 'text-slate-700' : 'text-slate-350'}>Inline Combined Diff View</span>
          <span className="text-[10px] text-slate-500 font-mono">Unified merge stream</span>
        </div>
        <div className="overflow-auto max-h-[480px]">
          {diffResult.map((item, idx) => (
            <div 
              key={idx} 
              className={`flex items-stretch min-h-[22px] ${
                item.type === 'added' 
                  ? (isLight ? 'bg-emerald-50/75 text-emerald-900' : 'bg-emerald-950/25 text-emerald-300') 
                  : item.type === 'removed' 
                    ? (isLight ? 'bg-red-50/75 text-red-900' : 'bg-red-950/20 text-red-300') 
                    : ''
              }`}
            >
              <div className={`w-10 select-none border-r text-center text-[10px] text-slate-600 shrink-0 flex items-center justify-center ${borderMutedClass} ${panelBgClass}`}>
                {item.origLineNum || ''}
              </div>
              <div className={`w-10 select-none border-r text-center text-[10px] text-slate-600 shrink-0 flex items-center justify-center ${borderMutedClass} ${panelBgClass}`}>
                {item.modLineNum || ''}
              </div>
              <div className="w-6 select-none shrink-0 flex items-center justify-center text-slate-550 font-bold">
                {item.type === 'added' ? '+' : item.type === 'removed' ? '-' : ' '}
              </div>
              <div className="p-1 pl-2 font-mono break-all whitespace-pre-wrap flex items-center">
                {item.value}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6" id="text-diff-tool">
      
      {/* Upper action rail */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border p-4 rounded-xl ${cardClass} ${borderClass}`}>
        <div className="flex items-center gap-2">
          <button
            onClick={handleLoadSample}
            className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
              isLight 
                ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800' 
                : 'bg-slate-950 hover:bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            Load Sample Snippets
          </button>
          <button
            onClick={handleClear}
            className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
              isLight 
                ? 'bg-white hover:bg-slate-10 border-slate-200 text-slate-700' 
                : 'bg-slate-950 hover:bg-slate-900 border-slate-800 text-slate-300'
            }`}
          >
            Clear Fields
          </button>
        </div>

        {diffResult.length > 0 && (
          <div className="flex items-center gap-1.5 border border-dashed rounded-lg p-1 border-slate-800">
            <button
              onClick={() => setViewMode('side')}
              className={`text-[10px] font-bold px-2.5 py-1 rounded transition-all cursor-pointer flex items-center gap-1 ${
                viewMode === 'side' ? 'bg-indigo-650 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Columns className="w-3 h-3" /> Side-by-Side
            </button>
            <button
              onClick={() => setViewMode('inline')}
              className={`text-[10px] font-bold px-2.5 py-1 rounded transition-all cursor-pointer flex items-center gap-1 ${
                viewMode === 'inline' ? 'bg-indigo-650 text-white' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Layers className="w-3 h-3" /> Inline Combined
            </button>
          </div>
        )}
      </div>

      {/* Editor Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Original Text Input */}
        <div className={`flex flex-col h-[280px] border rounded-xl overflow-hidden ${inputBgClass} ${borderClass}`}>
          <div className={`px-4 py-3 border-b flex items-center justify-between ${panelBgClass} ${borderClass}`}>
            <span className={`text-xs font-semibold font-mono ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>Original Version Text (Left)</span>
            <span className="text-[10px] font-mono text-red-500">- Old</span>
          </div>
          <textarea
            className={`flex-1 w-full p-4 font-mono text-xs leading-relaxed focus:outline-none resize-none bg-transparent ${textClass} ${
              isLight ? 'placeholder:text-slate-400' : 'placeholder:text-slate-600'
            }`}
            placeholder="Paste source text snippet here..."
            value={original}
            onChange={(e) => setOriginal(e.target.value)}
          />
        </div>

        {/* Modified Text Input */}
        <div className={`flex flex-col h-[280px] border rounded-xl overflow-hidden ${inputBgClass} ${borderClass}`}>
          <div className={`px-4 py-3 border-b flex items-center justify-between ${panelBgClass} ${borderClass}`}>
            <span className={`text-xs font-semibold font-mono ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>Modified Version Text (Right)</span>
            <span className="text-[10px] font-mono text-emerald-500">+ New</span>
          </div>
          <textarea
            className={`flex-1 w-full p-4 font-mono text-xs leading-relaxed focus:outline-none resize-none bg-transparent ${textClass} ${
              isLight ? 'placeholder:text-slate-400' : 'placeholder:text-slate-600'
            }`}
            placeholder="Paste target comparison text here..."
            value={modified}
            onChange={(e) => setModified(e.target.value)}
          />
        </div>

      </div>

      {/* Trigger Row */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <button
          onClick={handleCalculateDiff}
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md transition-all active:scale-[0.98] flex items-center gap-1.5 cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-white" />
          Compare & Calculate Diff
        </button>

        {status && (
          <div className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium border font-mono ${
            isLight ? 'bg-red-50 border-red-200 text-red-800' : 'bg-pink-950/20 border-pink-900/40 text-pink-300'
          }`}>
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{status}</span>
          </div>
        )}
      </div>

      {/* Render Calculated Diffs */}
      {diffResult.length > 0 && (
        <div className="space-y-4">
          {viewMode === 'side' ? renderSideBySide() : renderInline()}
        </div>
      )}

      {/* Specs description */}
      <div className={`border rounded-xl p-5 text-xs font-sans space-y-2 ${isLight ? 'bg-slate-50 border-slate-200 text-slate-650' : 'bg-slate-900/30 border-slate-850 text-slate-400'}`}>
        <h4 className={`font-bold flex items-center gap-1.5 ${isLight ? 'text-slate-800' : 'text-white'}`}>
          <Columns className={`w-4 h-4 ${isLight ? 'text-indigo-600' : 'text-indigo-400'}`} />
          The Longest Common Subsequence (LCS) Diff Algorithm
        </h4>
        <p className="leading-relaxed">
          OwnFormatters text comparison tool utilizes an optimized Dynamic Programming LCS algorithm to determine the shortest edit path. By identifying shared subsequences of lines, the engine isolates line additions (green) and deletions (red) in real-time, executing completely client-side.
        </p>
      </div>

    </div>
  );
}
