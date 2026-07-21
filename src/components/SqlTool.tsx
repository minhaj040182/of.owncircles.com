import React, { useState } from 'react';
import { Copy, Check, Trash2, Database, Sparkles, CheckCircle, AlertCircle, HelpCircle, ArrowLeftRight } from 'lucide-react';
import { formatSql } from '../utils';

const SAMPLE_SQL = "SELECT u.id, u.username, p.title, p.body FROM users u LEFT JOIN posts p ON u.id = p.user_id WHERE u.active = 1 AND p.created_at > '2026-01-01' ORDER BY p.created_at DESC LIMIT 50 OFFSET 0;";

interface SqlToolProps {
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

export default function SqlTool({ theme }: SqlToolProps) {
  const [input, setInput] = useState<string>('');
  const [output, setOutput] = useState<string>('');
  const [uppercaseKeywords, setUppercaseKeywords] = useState<boolean>(true);
  const [status, setStatus] = useState<{ type: 'idle' | 'success' | 'error'; message: string }>({ type: 'idle', message: '' });
  const [copied, setCopied] = useState<boolean>(false);

  const handleFormat = () => {
    if (!input.trim()) {
      setStatus({ type: 'error', message: 'Input is empty!' });
      return;
    }
    try {
      const formatted = formatSql(input, uppercaseKeywords);
      setOutput(formatted);
      setStatus({ type: 'success', message: 'SQL statements reformatted cleanly!' });
    } catch (err: any) {
      setOutput('');
      setStatus({ type: 'error', message: err.message || 'Error occurred during parsing' });
    }
  };

  const handleLoadSample = () => {
    setInput(SAMPLE_SQL);
    setStatus({ type: 'idle', message: '' });
    setOutput('');
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
    <div className="space-y-6" id="sql-beautifier-tool">
      
      {/* Top Banner Controls */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border p-4 rounded-xl ${cardClass} ${borderClass}`}>
        <div className="flex flex-wrap items-center gap-3">
          <label className={`flex items-center gap-2 text-xs font-semibold cursor-pointer ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
            <input
              type="checkbox"
              checked={uppercaseKeywords}
              onChange={(e) => setUppercaseKeywords(e.target.checked)}
              className={`rounded focus:ring-indigo-500 ${isLight ? 'border-slate-300 bg-white text-indigo-600' : 'border-slate-800 bg-slate-900 text-indigo-600'}`}
            />
            Uppercase SQL Keywords (e.g. SELECT, JOIN)
          </label>
 
          <button
            onClick={handleLoadSample}
            className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all ${
              isLight 
                ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800' 
                : 'bg-slate-950 hover:bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            Load Sample Query
          </button>
        </div>
 
        <div className="flex items-center gap-2">
          <span className={`text-xs font-mono flex items-center gap-1 ${textMutedClass}`}>
            <Database className={`w-3.5 h-3.5 ${isLight ? 'text-indigo-600' : 'text-indigo-400'}`} /> PostgreSQL / MySQL / SQLite Compliant
          </span>
        </div>
      </div>
 
      {/* Editor Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Text Area */}
        <div className={`flex flex-col h-[380px] border rounded-xl overflow-hidden ${inputBgClass} ${borderClass}`}>
          <div className={`px-4 py-3 border-b flex items-center justify-between ${panelBgClass} ${borderClass}`}>
            <span className={`text-xs font-semibold font-mono ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>Raw SQL Input</span>
            <button
              onClick={handleClear}
              className={`${isLight ? 'text-slate-500 hover:text-red-600' : 'text-slate-400 hover:text-pink-400'} p-1 rounded transition-colors`}
              title="Clear Input"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          <textarea
            className={`flex-1 w-full p-4 font-mono text-sm leading-relaxed focus:outline-none resize-none bg-transparent ${textClass} ${
              isLight ? 'placeholder:text-slate-400' : 'placeholder:text-slate-600'
            }`}
            placeholder="SELECT * FROM table JOIN another ON id = parent_id WHERE val = 1;"
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <div className={`px-4 py-2 border-t text-[11px] font-mono ${panelBgClass} ${borderMutedClass} ${textMutedClass}`}>
            <span>Length: {input.length} chars</span>
          </div>
        </div>
 
        {/* Output Text Area */}
        <div className={`flex flex-col h-[380px] border rounded-xl overflow-hidden ${inputBgClass} ${borderClass}`}>
          <div className={`px-4 py-3 border-b flex items-center justify-between ${panelBgClass} ${borderClass}`}>
            <span className={`text-xs font-semibold font-mono ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>Formatted Beautified SQL</span>
            <button
              onClick={handleCopy}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 font-sans border ${
                isLight 
                  ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800' 
                  : 'bg-slate-950 hover:bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
              Copy Query
            </button>
          </div>
          <div className={`flex-1 overflow-auto p-4 ${canvasBgClass}`}>
            {output ? (
              <pre className={`font-mono text-sm leading-relaxed whitespace-pre select-all ${isLight ? 'text-indigo-900' : 'text-indigo-200'}`}>{output}</pre>
            ) : (
              <div className="h-full flex flex-col items-center justify-center space-y-2">
                <Database className={`w-6 h-6 ${isLight ? 'text-slate-300' : 'text-slate-750'}`} />
                <p className={`text-xs font-mono ${textMutedClass}`}>Output SQL stream ready</p>
              </div>
            )}
          </div>
          <div className={`px-4 py-2 border-t text-[11px] font-mono ${panelBgClass} ${borderMutedClass} ${textMutedClass}`}>
            <span>Length: {output.length} chars</span>
          </div>
        </div>
      </div>
 
      {/* Action Trigger */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <button
          onClick={handleFormat}
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md transition-all active:scale-[0.98] flex items-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5 text-white" />
          Format Query
        </button>
 
        {status.type !== 'idle' && (
          <div className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium border font-mono ${
            status.type === 'success' 
              ? (isLight ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-emerald-950/20 border-emerald-900/40 text-emerald-300')
              : (isLight ? 'bg-red-50 border-red-200 text-red-800' : 'bg-pink-950/20 border-pink-900/40 text-pink-300')
          }`}>
            {status.type === 'success' ? (
              <CheckCircle className={`w-3.5 h-3.5 ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`} />
            ) : (
              <AlertCircle className={`w-3.5 h-3.5 ${isLight ? 'text-red-600' : 'text-red-400'}`} />
            )}
            <span>{status.message}</span>
          </div>
        )}
      </div>

    </div>
  );
}
