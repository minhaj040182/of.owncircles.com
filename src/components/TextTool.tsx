import React, { useState } from 'react';
import { Copy, Check, Trash2, AlignLeft, ArrowDownAZ, RefreshCw, Layers } from 'lucide-react';

interface TextToolProps {
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

export default function TextTool({ theme }: TextToolProps) {
  const [input, setInput] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [findText, setFindText] = useState<string>('');
  const [replaceText, setReplaceText] = useState<string>('');

  const borderClass = theme?.border || 'border-slate-800/80';
  const borderMutedClass = theme?.borderMuted || 'border-slate-850';
  const cardClass = theme?.card || 'bg-slate-900/50';
  const inputBgClass = theme?.inputBg || 'bg-slate-950';
  const panelBgClass = theme?.panelBg || 'bg-slate-900';
  const textClass = theme?.text || 'text-slate-200';
  const textMutedClass = theme?.textMuted || 'text-slate-400';
  const canvasBgClass = theme?.canvasBg || 'bg-[#02050c]';
  const isLight = theme?.isDark === false;

  // Count words carefully
  const getWordCount = (str: string) => {
    const clean = str.trim();
    if (!clean) return 0;
    return clean.split(/\s+/).length;
  };

  // Convert text cases
  const applyCase = (type: 'upper' | 'lower' | 'title' | 'camel' | 'snake' | 'pascal') => {
    if (!input) return;

    let result = '';
    const words = input.toLowerCase().split(/[\s_\-]+/).filter(Boolean);

    if (type === 'upper') {
      result = input.toUpperCase();
    } else if (type === 'lower') {
      result = input.toLowerCase();
    } else if (type === 'title') {
      result = input
        .split(' ')
        .map(w => w ? w.charAt(0).toUpperCase() + w.slice(1).toLowerCase() : '')
        .join(' ');
    } else if (type === 'camel') {
      if (words.length > 0) {
        result = words[0] + words.slice(1).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');
      }
    } else if (type === 'snake') {
      result = words.join('_');
    } else if (type === 'pascal') {
      result = words.map(w => w.charAt(0).toUpperCase() + w.slice(1)).join('');
    }

    setInput(result);
  };

  // Sort lines
  const sortLines = (direction: 'asc' | 'desc') => {
    if (!input) return;
    const lines = input.split('\n');
    lines.sort((a, b) => a.localeCompare(b));
    if (direction === 'desc') {
      lines.reverse();
    }
    setInput(lines.join('\n'));
  };

  // Unique lines
  const removeDuplicateLines = () => {
    if (!input) return;
    const lines = input.split('\n');
    const unique = Array.from(new Set(lines));
    setInput(unique.join('\n'));
  };

  // Trim spaces
  const trimSpaces = () => {
    if (!input) return;
    const trimmed = input.split('\n').map(l => l.trim()).join('\n');
    setInput(trimmed);
  };

  // Find & Replace
  const handleFindReplace = () => {
    if (!input || !findText) return;
    try {
      const escapedFind = findText.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
      const regex = new RegExp(escapedFind, 'g');
      const replaced = input.replace(regex, replaceText);
      setInput(replaced);
    } catch (e) {}
  };

  const handleCopy = () => {
    if (!input) return;
    navigator.clipboard.writeText(input);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setInput('');
  };

  return (
    <div className="space-y-6" id="text-utilities-tool">
      
      {/* Metrics Counters Header Grid */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className={`border p-4 rounded-xl text-center ${inputBgClass} ${borderClass}`}>
          <span className={`text-[10px] font-mono uppercase ${textMutedClass}`}>Characters</span>
          <p className={`text-xl font-bold font-mono mt-1 ${isLight ? 'text-slate-850' : 'text-white'}`}>{input.length}</p>
        </div>
        <div className={`border p-4 rounded-xl text-center ${inputBgClass} ${borderClass}`}>
          <span className={`text-[10px] font-mono uppercase ${textMutedClass}`}>Words</span>
          <p className={`text-xl font-bold font-mono mt-1 ${isLight ? 'text-slate-855' : 'text-white'}`}>{getWordCount(input)}</p>
        </div>
        <div className={`border p-4 rounded-xl text-center ${inputBgClass} ${borderClass}`}>
          <span className={`text-[10px] font-mono uppercase ${textMutedClass}`}>Lines</span>
          <p className={`text-xl font-bold font-mono mt-1 ${isLight ? 'text-slate-855' : 'text-white'}`}>{input ? input.split('\n').length : 0}</p>
        </div>
        <div className={`border p-4 rounded-xl text-center ${inputBgClass} ${borderClass}`}>
          <span className={`text-[10px] font-mono uppercase ${textMutedClass}`}>Paragraphs</span>
          <p className={`text-xl font-bold font-mono mt-1 ${isLight ? 'text-slate-855' : 'text-white'}`}>
            {input ? input.split(/\n\s*\n/).filter(Boolean).length : 0}
          </p>
        </div>
        <div className={`border p-4 rounded-xl text-center col-span-2 md:col-span-1 ${inputBgClass} ${borderClass}`}>
          <span className={`text-[10px] font-mono uppercase ${textMutedClass}`}>Byte Size</span>
          <p className={`text-xl font-bold font-mono mt-1 ${isLight ? 'text-slate-855' : 'text-white'}`}>
            {input ? `${new Blob([input]).size} B` : '0 B'}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Quick controls panel (4 cols) */}
        <div className="lg:col-span-4 space-y-4">
          
          {/* Case converters */}
          <div className={`border p-4 rounded-xl space-y-3 ${inputBgClass} ${borderClass}`}>
            <h4 className={`text-xs font-bold font-mono uppercase flex items-center gap-1.5 border-b pb-2 ${isLight ? 'text-slate-800 border-slate-200' : 'text-slate-300 border-slate-900'}`}>
              <Layers className={`w-4 h-4 ${isLight ? 'text-indigo-650' : 'text-indigo-400'}`} /> Case Transformation
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <button
                onClick={() => applyCase('upper')}
                className={`py-1.5 rounded-lg border transition-all cursor-pointer ${
                  isLight 
                    ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700' 
                    : 'bg-slate-900 hover:bg-slate-850 border-slate-800 text-slate-300'
                }`}
              >
                UPPERCASE
              </button>
              <button
                onClick={() => applyCase('lower')}
                className={`py-1.5 rounded-lg border transition-all cursor-pointer ${
                  isLight 
                    ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700' 
                    : 'bg-slate-900 hover:bg-slate-850 border-slate-800 text-slate-300'
                }`}
              >
                lowercase
              </button>
              <button
                onClick={() => applyCase('title')}
                className={`py-1.5 rounded-lg border transition-all cursor-pointer ${
                  isLight 
                    ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700' 
                    : 'bg-slate-900 hover:bg-slate-850 border-slate-800 text-slate-300'
                }`}
              >
                Title Case
              </button>
              <button
                onClick={() => applyCase('camel')}
                className={`py-1.5 rounded-lg border transition-all cursor-pointer ${
                  isLight 
                    ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700' 
                    : 'bg-slate-900 hover:bg-slate-850 border-slate-800 text-slate-300'
                }`}
                title="Convert to camelCase"
              >
                camelCase
              </button>
              <button
                onClick={() => applyCase('snake')}
                className={`py-1.5 rounded-lg border transition-all cursor-pointer ${
                  isLight 
                    ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700' 
                    : 'bg-slate-900 hover:bg-slate-850 border-slate-800 text-slate-300'
                }`}
                title="Convert to snake_case"
              >
                snake_case
              </button>
              <button
                onClick={() => applyCase('pascal')}
                className={`py-1.5 rounded-lg border transition-all cursor-pointer ${
                  isLight 
                    ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700' 
                    : 'bg-slate-900 hover:bg-slate-850 border-slate-800 text-slate-300'
                }`}
                title="Convert to PascalCase"
              >
                PascalCase
              </button>
            </div>
          </div>

          {/* Line operations */}
          <div className={`border p-4 rounded-xl space-y-3 ${inputBgClass} ${borderClass}`}>
            <h4 className={`text-xs font-bold font-mono uppercase flex items-center gap-1.5 border-b pb-2 ${isLight ? 'text-slate-800 border-slate-200' : 'text-slate-300 border-slate-900'}`}>
              <ArrowDownAZ className={`w-4 h-4 ${isLight ? 'text-indigo-650' : 'text-indigo-400'}`} /> Line Utilities
            </h4>
            <div className="space-y-2 text-xs">
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => sortLines('asc')}
                  className={`py-1.5 rounded-lg border transition-all cursor-pointer ${
                    isLight 
                      ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700' 
                      : 'bg-slate-900 hover:bg-slate-850 border-slate-800 text-slate-300'
                  }`}
                >
                  Sort Lines A-Z
                </button>
                <button
                  onClick={() => sortLines('desc')}
                  className={`py-1.5 rounded-lg border transition-all cursor-pointer ${
                    isLight 
                      ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700' 
                      : 'bg-slate-900 hover:bg-slate-850 border-slate-800 text-slate-300'
                  }`}
                >
                  Sort Lines Z-A
                </button>
              </div>
              <button
                onClick={removeDuplicateLines}
                className={`w-full py-1.5 rounded-lg border transition-all cursor-pointer ${
                  isLight 
                    ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700' 
                    : 'bg-slate-900 hover:bg-slate-850 border-slate-800 text-slate-300'
                }`}
              >
                Deduplicate Lines
              </button>
              <button
                onClick={trimSpaces}
                className={`w-full py-1.5 rounded-lg border transition-all cursor-pointer ${
                  isLight 
                    ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700' 
                    : 'bg-slate-900 hover:bg-slate-850 border-slate-800 text-slate-300'
                }`}
              >
                Trim Whitespaces (Per-Line)
              </button>
            </div>
          </div>

          {/* Find and Replace */}
          <div className={`border p-4 rounded-xl space-y-3 ${inputBgClass} ${borderClass}`}>
            <h4 className={`text-xs font-bold font-mono uppercase flex items-center gap-1.5 border-b pb-2 ${isLight ? 'text-slate-800 border-slate-200' : 'text-slate-300 border-slate-900'}`}>
              <RefreshCw className={`w-4 h-4 ${isLight ? 'text-indigo-650' : 'text-indigo-400'}`} /> Find & Replace
            </h4>
            <div className="space-y-2 text-xs font-mono">
              <input
                type="text"
                placeholder="Find match string"
                className={`w-full border text-xs rounded px-2.5 py-1.5 focus:outline-none focus:border-indigo-500 ${
                  isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-800 text-slate-200'
                }`}
                value={findText}
                onChange={(e) => setFindText(e.target.value)}
              />
              <input
                type="text"
                placeholder="Replace string"
                className={`w-full border text-xs rounded px-2.5 py-1.5 focus:outline-none focus:border-indigo-500 ${
                  isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-800 text-slate-200'
                }`}
                value={replaceText}
                onChange={(e) => setReplaceText(e.target.value)}
              />
              <button
                onClick={handleFindReplace}
                className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-sans font-bold py-1.5 rounded transition-all cursor-pointer shadow-xs"
              >
                Execute Replace
              </button>
            </div>
          </div>

        </div>

        {/* Text Area (8 cols) */}
        <div className={`lg:col-span-8 flex flex-col border rounded-xl overflow-hidden h-[480px] ${inputBgClass} ${borderClass}`}>
          <div className={`px-4 py-3 border-b flex items-center justify-between ${panelBgClass} ${borderClass}`}>
            <span className={`text-xs font-semibold font-mono ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>Interactive Workspace Canvas</span>
            <div className="flex gap-2">
              <button
                onClick={handleClear}
                className={`${isLight ? 'text-slate-400 hover:text-red-500' : 'text-slate-400 hover:text-pink-400'} p-1 rounded transition-colors cursor-pointer`}
                title="Clear All Text"
              >
                <Trash2 className="w-4 h-4" />
              </button>
              <button
                onClick={handleCopy}
                className={`border px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 font-sans cursor-pointer ${
                  isLight 
                    ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800' 
                    : 'bg-slate-950 hover:bg-slate-900 border-slate-800 text-slate-300'
                }`}
              >
                {copied ? <Check className={`w-3 h-3 ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`} /> : <Copy className="w-3 h-3" />}
                Copy text
              </button>
            </div>
          </div>
          <textarea
            className={`flex-1 w-full p-4 font-mono text-sm leading-relaxed focus:outline-none resize-none selection:bg-indigo-600/30 ${
              isLight ? 'bg-white text-slate-850 placeholder:text-slate-400' : 'bg-slate-950 text-slate-200 placeholder:text-slate-600'
            }`}
            placeholder="Type, paste, or drop your code / content text here. Use the utility controls in the left sidebar to execute case transforms, line sorting, find-replaces, and real-time word counting statistics instantly."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
        </div>

      </div>

    </div>
  );
}
