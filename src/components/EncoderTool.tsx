import React, { useState } from 'react';
import { Copy, Check, Trash2, Shield, Eye, HelpCircle, ArrowLeftRight, CheckCircle, AlertCircle, Sparkles } from 'lucide-react';

interface EncoderToolProps {
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
  activeTool?: 'base64' | 'url' | 'html';
}

export default function EncoderTool({ theme, activeTool = 'base64' }: EncoderToolProps) {
  const [activeTab, setActiveTab] = useState<'base64' | 'url' | 'html'>(activeTool);
  const [input, setInput] = useState<string>('');
  const [output, setOutput] = useState<string>('');
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [copied, setCopied] = useState<boolean>(false);
  const [status, setStatus] = useState<{ type: 'idle' | 'success' | 'error'; message: string }>({ type: 'idle', message: '' });
  const [urlOption, setUrlOption] = useState<'standard' | 'component'>('standard');

  React.useEffect(() => {
    if (activeTool === 'base64' || activeTool === 'url' || activeTool === 'html') {
      setActiveTab(activeTool);
      handleClear();
    }
  }, [activeTool]);

  const borderClass = theme?.border || 'border-slate-800/80';
  const borderMutedClass = theme?.borderMuted || 'border-slate-850';
  const cardClass = theme?.card || 'bg-slate-900/50';
  const inputBgClass = theme?.inputBg || 'bg-slate-950';
  const panelBgClass = theme?.panelBg || 'bg-slate-900';
  const textClass = theme?.text || 'text-slate-200';
  const textMutedClass = theme?.textMuted || 'text-slate-400';
  const canvasBgClass = theme?.canvasBg || 'bg-[#02050c]';
  const isLight = theme?.isDark === false;

  const handleProcess = (overrideMode?: 'encode' | 'decode') => {
    const currentMode = overrideMode || mode;
    if (!input) {
      setStatus({ type: 'error', message: 'Input text is empty!' });
      return;
    }

    try {
      if (activeTab === 'base64') {
        if (currentMode === 'encode') {
          // Standard UTF-8 safe base64 encoding
          const encoded = btoa(encodeURIComponent(input).replace(/%([0-9A-F]{2})/g, (match, p1) => {
            return String.fromCharCode(parseInt(p1, 16));
          }));
          setOutput(encoded);
          setStatus({ type: 'success', message: 'Base64 encoded successfully!' });
        } else {
          // Standard UTF-8 safe base64 decoding
          try {
            const decoded = decodeURIComponent(atob(input).split('').map((c) => {
              return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
            }).join(''));
            setOutput(decoded);
            setStatus({ type: 'success', message: 'Base64 decoded successfully!' });
          } catch (e) {
            // Fallback to basic atob
            const decoded = atob(input);
            setOutput(decoded);
            setStatus({ type: 'success', message: 'Base64 decoded successfully (fallback Mode)!' });
          }
        }
      } else if (activeTab === 'url') {
        // URL Tool
        if (currentMode === 'encode') {
          const encoded = urlOption === 'standard' ? encodeURI(input) : encodeURIComponent(input);
          setOutput(encoded);
          setStatus({ type: 'success', message: 'URL encoded successfully!' });
        } else {
          const decoded = urlOption === 'standard' ? decodeURI(input) : decodeURIComponent(input);
          setOutput(decoded);
          setStatus({ type: 'success', message: 'URL decoded successfully!' });
        }
      } else {
        // HTML Entities Tool
        if (currentMode === 'encode') {
          const encoded = input.replace(/[\u00A0-\u9999<>&"']/g, (i) => {
            return '&#' + i.charCodeAt(0) + ';';
          });
          setOutput(encoded);
          setStatus({ type: 'success', message: 'HTML entities encoded successfully!' });
        } else {
          const doc = new DOMParser().parseFromString(input, 'text/html');
          const decoded = doc.documentElement.textContent || '';
          setOutput(decoded);
          setStatus({ type: 'success', message: 'HTML entities decoded successfully!' });
        }
      }
    } catch (err: any) {
      setOutput('');
      setStatus({ 
        type: 'error', 
        message: err.message || 'Operation failed. Verify input format integrity.' 
      });
    }
  };

  const handleSwap = () => {
    setInput(output);
    setOutput(input);
    setMode(mode === 'encode' ? 'decode' : 'encode');
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

  return (
    <div className="space-y-6" id="encoder-decoder-tool">
      {/* Tab Select & Settings */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border p-4 rounded-xl ${cardClass} ${borderClass}`}>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setActiveTab('base64');
              handleClear();
            }}
            className={`text-xs font-semibold px-4 py-2 rounded-lg border transition-all cursor-pointer ${
              activeTab === 'base64' 
                ? '!bg-indigo-600 !text-white border-indigo-500 shadow-xs' 
                : isLight
                ? 'bg-white text-slate-600 border-slate-200 hover:text-slate-800 hover:bg-slate-50'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            Base64
          </button>
          <button
            onClick={() => {
              setActiveTab('url');
              handleClear();
            }}
            className={`text-xs font-semibold px-4 py-2 rounded-lg border transition-all cursor-pointer ${
              activeTab === 'url' 
                ? '!bg-indigo-600 !text-white border-indigo-500 shadow-xs' 
                : isLight
                ? 'bg-white text-slate-600 border-slate-200 hover:text-slate-800 hover:bg-slate-50'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            URL Percent
          </button>
          <button
            onClick={() => {
              setActiveTab('html');
              handleClear();
            }}
            className={`text-xs font-semibold px-4 py-2 rounded-lg border transition-all cursor-pointer ${
              activeTab === 'html' 
                ? '!bg-indigo-600 !text-white border-indigo-500 shadow-xs' 
                : isLight
                ? 'bg-white text-slate-600 border-slate-200 hover:text-slate-800 hover:bg-slate-50'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            HTML Entity
          </button>
        </div>

        <div className="flex items-center gap-3">
          <div className={`flex p-1 rounded-lg border ${isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-950 border-slate-800'}`}>
            <button
              onClick={() => {
                setMode('encode');
                if (input) handleProcess('encode');
              }}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                mode === 'encode' 
                  ? '!bg-indigo-600 !text-white shadow-xs' 
                  : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
              }`}
            >
              Encode
            </button>
            <button
              onClick={() => {
                setMode('decode');
                if (input) handleProcess('decode');
              }}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all cursor-pointer ${
                mode === 'decode' 
                  ? '!bg-indigo-600 !text-white shadow-xs' 
                  : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
              }`}
            >
              Decode
            </button>
          </div>

          {activeTab === 'url' && (
            <select
              value={urlOption}
              onChange={(e) => setUrlOption(e.target.value as any)}
              className={`border text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500 font-mono ${
                isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-950 border-slate-800 text-slate-200'
              }`}
            >
              <option value="standard">standard (encodeURI)</option>
              <option value="component">component (encodeURIComponent)</option>
            </select>
          )}
        </div>
      </div>

      {/* Editor Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Text Area */}
        <div className={`flex flex-col h-[340px] border rounded-xl overflow-hidden ${inputBgClass} ${borderClass}`}>
          <div className={`px-4 py-3 border-b flex items-center justify-between ${panelBgClass} ${borderClass}`}>
            <span className={`text-xs font-semibold font-mono ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>
              Raw Input ({mode === 'encode' ? 'Plaintext' : activeTab === 'base64' ? 'Base64 String' : activeTab === 'url' ? 'URL Encoded String' : 'HTML Entity String'})
            </span>
            <button
              onClick={handleClear}
              className={`${isLight ? 'text-slate-400 hover:text-red-500' : 'text-slate-400 hover:text-pink-400'} p-1 rounded transition-colors cursor-pointer`}
              title="Clear Input"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          <textarea
            className={`flex-1 w-full p-4 font-mono text-sm leading-relaxed focus:outline-none resize-none ${
              isLight ? 'bg-white text-slate-850 placeholder:text-slate-400' : 'bg-slate-950 text-slate-200 placeholder:text-slate-600'
            }`}
            placeholder={
              activeTab === 'base64'
                ? mode === 'encode' 
                  ? 'Enter text to convert to base64... (e.g. hello world)' 
                  : 'Enter valid base64 string... (e.g. aGVsbG8gd29ybGQ=)'
                : activeTab === 'url'
                  ? mode === 'encode'
                    ? 'Enter URL or query parameters... (e.g. https://google.com/search?q=own formatters)'
                    : 'Enter URL encoded string... (e.g. https%3A%2F%2Fgoogle.com%2Fsearch%3Fq%3Down%20formatters)'
                  : mode === 'encode'
                    ? 'Enter HTML or text to encode entities... (e.g. <p>Hello & Welcome!</p>)'
                    : 'Enter HTML entity encoded string... (e.g. &#60;p&#62;Hello &#38; Welcome!&#60;/p&#62;)'
            }
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <div className={`px-4 py-2 border-t flex items-center justify-between text-[11px] font-mono ${panelBgClass} ${borderClass} ${textMutedClass}`}>
            <span>Length: {input.length} chars</span>
          </div>
        </div>

        {/* Output Text Area */}
        <div className={`flex flex-col h-[340px] border rounded-xl overflow-hidden ${inputBgClass} ${borderClass}`}>
          <div className={`px-4 py-3 border-b flex items-center justify-between ${panelBgClass} ${borderClass}`}>
            <span className={`text-xs font-semibold font-mono ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>
              Processed Output ({mode === 'encode' ? activeTab === 'base64' ? 'Base64' : activeTab === 'url' ? 'URL Encoded' : 'HTML Entity Encoded' : 'Decoded Plaintext'})
            </span>
            <button
              onClick={handleCopy}
              className={`border px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 font-sans cursor-pointer ${
                isLight 
                  ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800' 
                  : 'bg-slate-950 hover:bg-slate-900 border-slate-800 text-slate-300'
              }`}
            >
              {copied ? <Check className={`w-3 h-3 ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`} /> : <Copy className="w-3 h-3" />}
              Copy
            </button>
          </div>
          <div className={`flex-1 overflow-auto p-4 ${canvasBgClass}`}>
            {output ? (
              <pre className={`font-mono text-sm leading-relaxed whitespace-pre-wrap select-all ${isLight ? 'text-slate-850' : 'text-slate-200'}`}>{output}</pre>
            ) : (
              <div className="h-full flex flex-col items-center justify-center space-y-2">
                <ArrowLeftRight className={`w-6 h-6 ${isLight ? 'text-slate-300' : 'text-slate-700'}`} />
                <p className={`text-xs font-mono ${textMutedClass}`}>Output stream ready</p>
              </div>
            )}
          </div>
          <div className={`px-4 py-2 border-t flex items-center justify-between text-[11px] font-mono ${panelBgClass} ${borderClass} ${textMutedClass}`}>
            <span>Length: {output.length} chars</span>
          </div>
        </div>
      </div>

      {/* Action Buttons & Status Indicators */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={() => handleProcess()}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md transition-all active:scale-[0.98] flex items-center gap-1 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Perform Conversion
          </button>
          {output && (
            <button
              onClick={handleSwap}
              className={`border text-xs font-bold px-4 py-2.5 rounded-xl transition-all active:scale-[0.98] cursor-pointer ${
                isLight 
                  ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700' 
                  : 'bg-slate-900 hover:bg-slate-850 border-slate-800 text-slate-300'
              }`}
              title="Swap input and output, and reverse the action"
            >
              Swap & Invert
            </button>
          )}
        </div>

        {status.type !== 'idle' && (
          <div className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium border font-mono ${
            status.type === 'success' 
              ? isLight 
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800 shadow-sm' 
                : 'bg-emerald-950/20 border-emerald-900/40 text-emerald-300' 
              : isLight
                ? 'bg-red-50 border-red-200 text-red-800 shadow-sm'
                : 'bg-pink-950/20 border-pink-900/40 text-pink-300'
          }`}>
            {status.type === 'success' ? (
              <CheckCircle className={`w-3.5 h-3.5 ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`} />
            ) : (
              <AlertCircle className={`w-3.5 h-3.5 ${isLight ? 'text-red-600' : 'text-pink-400'}`} />
            )}
            <span>{status.message}</span>
          </div>
        )}
      </div>

      {/* Reference Card */}
      <div className={`border rounded-2xl p-5 space-y-2 text-xs font-sans ${isLight ? 'bg-slate-50 border-slate-200 text-slate-600' : 'bg-slate-900/30 border-slate-850 text-slate-400'}`}>
        <h4 className={`font-bold flex items-center gap-1.5 ${isLight ? 'text-slate-800' : 'text-white'}`}>
          <Shield className={`w-4 h-4 ${isLight ? 'text-indigo-600' : 'text-indigo-400'}`} />
          Data Privacy & Integrity Standard
        </h4>
        <p className="leading-relaxed">
          OwnFormatters operates entirely on the client-side within your browser. 
          No text payloads, API parameters, or secret data are ever uploaded, processed, or logged by external hosts.
        </p>
      </div>
    </div>
  );
}
