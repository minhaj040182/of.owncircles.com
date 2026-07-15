import React, { useState, useEffect } from 'react';
import { Copy, Check, Search, Sparkles, CheckCircle, AlertCircle, HelpCircle } from 'lucide-react';

interface RegexToolProps {
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

const PRESETS = [
  {
    name: 'Email Address',
    pattern: '[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}',
    flags: 'g',
    text: 'Please reach out to support@ownformatters.com or contact our administration at admin-group@ownformatters.org.'
  },
  {
    name: 'Phone Number (US)',
    pattern: '\\(?(\\d{3})\\)?[\\s.-]?(\\d{3})[\\s.-]?(\\d{4})',
    flags: 'g',
    text: 'Customer support hotline is (800) 555-0199, and local fax is 212-555-0144.'
  },
  {
    name: 'URL / Hyperlink',
    pattern: 'https?:\\/\\/(www\\.)?[-a-zA-Z0-9@:%._\\+~#=]{1,256}\\.[a-zA-Z0-9()]{1,6}\\b([-a-zA-Z0-9()@:%_\\+.~#?&//=]*)',
    flags: 'g',
    text: 'Search engines include https://google.com and documentation is hosted at http://www.wikipedia.org/wiki/Main_Page.'
  },
  {
    name: 'IPv4 Address',
    pattern: '\\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\\b',
    flags: 'g',
    text: 'The local loopback is 127.0.0.1, secondary gateway resides at 192.168.1.254.'
  }
];

export default function RegexTool({ theme }: RegexToolProps) {
  const [pattern, setPattern] = useState<string>('[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\\.[a-zA-Z]{2,}');
  const [flags, setFlags] = useState<string>('g');
  const [testText, setTestText] = useState<string>('Please reach out to support@ownformatters.com or contact our administration at admin-group@ownformatters.org.');
  
  const [matches, setMatches] = useState<any[]>([]);
  const [regexError, setRegexError] = useState<string>('');

  const isLight = theme?.isDark === false;
  const borderClass = theme?.border || 'border-slate-800/80';
  const cardClass = theme?.card || 'bg-slate-900/50';
  const inputBgClass = theme?.inputBg || 'bg-slate-950';
  const panelBgClass = theme?.panelBg || 'bg-slate-900';
  const textClass = theme?.text || 'text-slate-200';
  const textMutedClass = theme?.textMuted || 'text-slate-400';
  const canvasBgClass = theme?.canvasBg || 'bg-[#02050c]';

  // Recalculate matches whenever regex, flags, or testText changes
  useEffect(() => {
    if (!pattern.trim()) {
      setMatches([]);
      setRegexError('');
      return;
    }

    try {
      const re = new RegExp(pattern, flags.includes('g') ? flags : flags + 'g'); // Enforce global flag to find all occurrences
      setRegexError('');

      const list: any[] = [];
      let match;
      let limitCount = 0; // Prevent infinite loops

      // Reset lastIndex for the regex execution
      re.lastIndex = 0;

      while ((match = re.exec(testText)) !== null && limitCount < 1000) {
        limitCount++;
        // Avoid infinite loop on zero-width matches
        if (match.index === re.lastIndex) {
          re.lastIndex++;
        }

        list.push({
          index: match.index,
          text: match[0],
          groups: match.slice(1) // sub-captured groups
        });
      }

      setMatches(list);
    } catch (err: any) {
      setMatches([]);
      setRegexError(err.message || 'Invalid regular expression syntax');
    }
  }, [pattern, flags, testText]);

  const handleSelectPreset = (p: typeof PRESETS[0]) => {
    setPattern(p.pattern);
    setFlags(p.flags);
    setTestText(p.text);
  };

  const toggleFlag = (flagChar: string) => {
    if (flags.includes(flagChar)) {
      setFlags(flags.replace(flagChar, ''));
    } else {
      setFlags(flags + flagChar);
    }
  };

  // Render text with matches highlighted
  const renderHighlightedText = () => {
    if (matches.length === 0 || regexError) return <span className="whitespace-pre-wrap">{testText}</span>;

    const elements: React.ReactNode[] = [];
    let lastIdx = 0;

    // Sort matches to ensure sequential order
    const sortedMatches = [...matches].sort((a, b) => a.index - b.index);

    sortedMatches.forEach((m, idx) => {
      // Append non-matching block before this match
      if (m.index > lastIdx) {
        elements.push(<span key={`text-${idx}`}>{testText.substring(lastIdx, m.index)}</span>);
      }

      // Append matching highlighted block
      elements.push(
        <span 
          key={`match-${idx}`} 
          className="bg-yellow-450/40 text-yellow-200 border-b-2 border-yellow-500 font-bold px-0.5 rounded-sm"
          title={`Match #${idx + 1}: "${m.text}"`}
        >
          {m.text}
        </span>
      );

      lastIdx = m.index + m.text.length;
    });

    // Append remaining string
    if (lastIdx < testText.length) {
      elements.push(<span key="text-end">{testText.substring(lastIdx)}</span>);
    }

    return <div className="whitespace-pre-wrap leading-relaxed">{elements}</div>;
  };

  return (
    <div className="space-y-6" id="regex-tester-tool">
      
      {/* Presets Row */}
      <div className={`border p-4 rounded-xl ${cardClass} ${borderClass} space-y-3`}>
        <span className={`text-xs font-mono uppercase block ${textMutedClass}`}>Common Regular Expression Presets:</span>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => handleSelectPreset(preset)}
              className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                pattern === preset.pattern
                  ? 'bg-indigo-650 text-white border-indigo-500'
                  : isLight 
                    ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                    : 'bg-slate-950 hover:bg-slate-900 border-slate-800 text-slate-300'
              }`}
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* Regex Input Settings Grid */}
      <div className={`border p-5 rounded-xl space-y-4 ${cardClass} ${borderClass}`}>
        <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
          
          {/* Pattern input */}
          <div className="md:col-span-8 space-y-1.5">
            <label className={`text-[10px] font-mono font-bold uppercase block ${textMutedClass}`}>Regular Expression Pattern</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-indigo-500 font-bold font-mono text-sm">/</span>
              <input
                type="text"
                value={pattern}
                onChange={(e) => setPattern(e.target.value)}
                placeholder="[a-z]+"
                className={`w-full ${inputBgClass} border ${borderClass} text-xs font-mono rounded-xl pl-6 pr-10 py-3 focus:outline-none focus:border-indigo-500`}
              />
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-indigo-500 font-bold font-mono text-sm">/</span>
            </div>
          </div>

          {/* Flags checklist */}
          <div className="md:col-span-4 space-y-1.5">
            <label className={`text-[10px] font-mono font-bold uppercase block ${textMutedClass}`}>Regex Modifiers (Flags)</label>
            <div className="flex items-center gap-3 h-10 border border-dashed rounded-xl px-4 border-slate-800">
              
              <label className="flex items-center gap-1 text-xs cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={flags.includes('i')}
                  onChange={() => toggleFlag('i')}
                  className="accent-indigo-600 rounded"
                />
                <span className="font-mono font-bold">i</span>
                <span className="text-[10px] text-slate-500">ignoreCase</span>
              </label>

              <label className="flex items-center gap-1 text-xs cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={flags.includes('m')}
                  onChange={() => toggleFlag('m')}
                  className="accent-indigo-600 rounded"
                />
                <span className="font-mono font-bold">m</span>
                <span className="text-[10px] text-slate-500">multiline</span>
              </label>

              <label className="flex items-center gap-1 text-xs cursor-pointer select-none" title="Dot matches newline">
                <input
                  type="checkbox"
                  checked={flags.includes('s')}
                  onChange={() => toggleFlag('s')}
                  className="accent-indigo-600 rounded"
                />
                <span className="font-mono font-bold">s</span>
                <span className="text-[10px] text-slate-500">dotAll</span>
              </label>

            </div>
          </div>

        </div>

        {regexError && (
          <div className="text-[11px] text-pink-400 font-mono flex items-center gap-1.5 bg-pink-950/10 border border-pink-900/30 p-3 rounded-lg">
            <AlertCircle className="w-3.5 h-3.5 shrink-0" />
            <span>{regexError}</span>
          </div>
        )}
      </div>

      {/* Editor Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Test Text Subject Input */}
        <div className={`flex flex-col h-[340px] border rounded-xl overflow-hidden ${inputBgClass} ${borderClass}`}>
          <div className={`px-4 py-3 border-b flex items-center justify-between ${panelBgClass} ${borderClass}`}>
            <span className={`text-xs font-semibold font-mono ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>Test Subject Text</span>
            <span className="text-[10px] font-mono font-black text-indigo-400">Match Target</span>
          </div>
          <textarea
            className={`flex-1 w-full p-4 font-mono text-sm leading-relaxed focus:outline-none resize-none bg-transparent ${textClass} ${
              isLight ? 'placeholder:text-slate-400' : 'placeholder:text-slate-600'
            }`}
            placeholder="Type subject test strings to match against the regex pattern..."
            value={testText}
            onChange={(e) => setTestText(e.target.value)}
          />
        </div>

        {/* Matches Highlights Outputs */}
        <div className={`flex flex-col h-[340px] border rounded-xl overflow-hidden ${inputBgClass} ${borderClass}`}>
          <div className={`px-4 py-3 border-b flex items-center justify-between ${panelBgClass} ${borderClass}`}>
            <span className={`text-xs font-semibold font-mono ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>Highlighted Matches ({matches.length})</span>
            <span className="text-[10px] font-mono font-black text-amber-500 uppercase">Live Output</span>
          </div>
          <div className={`flex-1 overflow-auto p-4 font-mono text-sm ${canvasBgClass} ${isLight ? 'text-slate-900' : 'text-slate-200'}`}>
            {renderHighlightedText()}
          </div>
        </div>

      </div>

      {/* Capture Groups Details and Guide */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Match Groups List (7 Cols) */}
        <div className={`lg:col-span-7 border p-5 rounded-xl space-y-4 ${cardClass} ${borderClass}`}>
          <h4 className={`text-xs font-bold font-mono uppercase flex items-center gap-1.5 border-b pb-2 ${isLight ? 'text-slate-800 border-slate-200' : 'text-slate-300 border-slate-900'}`}>
            <Search className="w-4 h-4 text-indigo-400" /> Matches & Captured Groups List
          </h4>

          {matches.length === 0 ? (
            <p className="text-xs text-slate-500 font-mono italic">No matches found in the current subject string.</p>
          ) : (
            <div className="max-h-[220px] overflow-y-auto space-y-2.5 pr-1 font-mono text-xs">
              {matches.map((m, idx) => (
                <div key={idx} className={`p-3 rounded-lg border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/40 border-slate-900'}`}>
                  <div className="flex items-center justify-between font-bold mb-1.5">
                    <span className="text-indigo-400">Match #{idx + 1}</span>
                    <span className="text-slate-500 text-[10px]">Index: {m.index} .. {m.index + m.text.length}</span>
                  </div>
                  <div className="text-slate-300 break-all mb-1">
                    Value: <span className={`font-semibold rounded px-1 ${isLight ? 'bg-indigo-50 text-indigo-800' : 'bg-indigo-950/40 text-indigo-300'}`}>"{m.text}"</span>
                  </div>
                  {m.groups.length > 0 && m.groups.some((g: any) => g !== undefined) && (
                    <div className="mt-2 pt-1.5 border-t border-slate-900/60 text-[11px] text-slate-500 space-y-1">
                      <span className="font-bold uppercase text-[9px] block">Captured Parentheses Groups:</span>
                      {m.groups.map((g: any, gIdx: number) => (
                        g !== undefined && (
                          <div key={gIdx} className="pl-2">
                            Group {gIdx + 1}: <span className={isLight ? 'text-slate-800 font-bold' : 'text-slate-300 font-bold'}>"{g}"</span>
                          </div>
                        )
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Regular Expression Cheat Sheet (5 Cols) */}
        <div className={`lg:col-span-5 border p-5 rounded-xl space-y-3.5 ${cardClass} ${borderClass} text-xs ${textMutedClass}`}>
          <h4 className={`font-bold flex items-center gap-1.5 border-b pb-2 ${isLight ? 'text-slate-800 border-slate-200 border-b pb-2' : 'text-slate-300 border-slate-900 border-b pb-2'}`}>
            <HelpCircle className={`w-4 h-4 ${isLight ? 'text-indigo-600' : 'text-indigo-400'}`} />
            RegEx Quick Syntax Handbook
          </h4>
          <ul className="space-y-2 list-none font-mono text-[11px]">
            <li><code className="text-indigo-450 font-bold">.</code> - Match any character except newline</li>
            <li><code className="text-indigo-450 font-bold">\d</code> - Match any decimal digit [0-9]</li>
            <li><code className="text-indigo-450 font-bold">\w</code> - Match word character [a-zA-Z0-9_]</li>
            <li><code className="text-indigo-450 font-bold">+</code> - Matches 1 or more occurrences</li>
            <li><code className="text-indigo-450 font-bold">*</code> - Matches 0 or more occurrences</li>
            <li><code className="text-indigo-450 font-bold">?</code> - Matches 0 or 1 (lazy descriptor)</li>
            <li><code className="text-indigo-450 font-bold">^</code> / <code className="text-indigo-450 font-bold">$</code> - Start / End of input boundary</li>
          </ul>
        </div>

      </div>

    </div>
  );
}
