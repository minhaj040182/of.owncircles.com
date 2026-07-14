import React, { useState } from 'react';
import { Copy, Check, Trash2, Code, Sparkles, AlertCircle, CheckCircle, Percent, BookOpen, Cpu, ShieldAlert } from 'lucide-react';

type MinifyType = 'html' | 'css' | 'js';

function minifyHtml(code: string): string {
  let minified = code;
  // Remove HTML comments
  minified = minified.replace(/<!--[\s\S]*?-->/g, '');
  // Remove whitespace between tags
  minified = minified.replace(/>\s+</g, '><');
  // Collapse duplicate whitespace
  minified = minified.replace(/\s{2,}/g, ' ');
  return minified.trim();
}

function minifyCss(code: string): string {
  let minified = code;
  // Remove comments
  minified = minified.replace(/\/\*[\s\S]*?\*\//g, '');
  // Remove extra spacing
  minified = minified.replace(/\s*([{}|:;,])\s*/g, '$1');
  // Collapse whitespace
  minified = minified.replace(/\s{2,}/g, ' ');
  // Remove final semicolon in declarations
  minified = minified.replace(/;}/g, '}');
  return minified.trim();
}

function minifyJs(code: string): string {
  let minified = code;
  // Remove block comments
  minified = minified.replace(/\/\*[\s\S]*?\*\//g, '');
  // Remove single line comments (rough regex, ignoring strings for simplicity)
  minified = minified.split('\n')
    .map(line => {
      const trimmed = line.trim();
      if (trimmed.startsWith('//')) return '';
      return line;
    })
    .join('\n');
  
  // Collapse spaces and line breaks
  minified = minified.replace(/\s*([=+\-*/%&|<>!?;:(),{}])\s*/g, '$1');
  minified = minified.replace(/\s{2,}/g, ' ');
  return minified.trim();
}

const SAMPLE_HTML = `<!DOCTYPE html>
<html>
  <head>
    <!-- This is a sample header comment -->
    <title> My Elegant Web App </title>
    <style>
      body {
        background-color: #030712;
        color: #f1f5f9;
        margin: 0px;
      }
    </style>
  </head>
  <body>
    <div class="card" id="main-content">
      <h1> Welcome To OwnFormatters! </h1>
      <p> Speed up your client-side website assets with our robust minification tools. </p>
    </div>
  </body>
</html>`;

const SAMPLE_CSS = `/* Premium Dark Themes */
.card-container {
  display: flex;
  flex-direction: column;
  padding: 24px;
  margin-top: 16px;
  background-color: rgba(30, 41, 59, 0.4);
  border: 1px solid rgb(51, 65, 85);
  border-radius: 12px;
}

.title-accent {
  font-size: 1.5rem;
  font-weight: 700;
  color: #818cf8;
  margin-bottom: 8px;
}`;

const SAMPLE_JS = `// Application state tracker
function initAppWorkspace() {
  const isSecure = true;
  const userRole = 'Developer';
  
  /* Log initial values safely */
  console.log("Setting up client environment");
  
  if (isSecure && userRole === 'Developer') {
    return {
      sandboxEnabled: true,
      telemetry: false
    };
  }
}`;

interface MinifyToolProps {
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

export default function MinifyTool({ theme }: MinifyToolProps) {
  const [input, setInput] = useState<string>('');
  const [output, setOutput] = useState<string>('');
  const [type, setType] = useState<MinifyType>('html');
  const [copied, setCopied] = useState<boolean>(false);
  const [status, setStatus] = useState<{ type: 'idle' | 'success' | 'error'; message: string }>({ type: 'idle', message: '' });

  const handleMinify = () => {
    if (!input.trim()) {
      setStatus({ type: 'error', message: 'Please input raw code code block first!' });
      return;
    }

    try {
      let minified = '';
      if (type === 'html') minified = minifyHtml(input);
      else if (type === 'css') minified = minifyCss(input);
      else if (type === 'js') minified = minifyJs(input);

      setOutput(minified);
      setStatus({ type: 'success', message: 'Minification complete!' });
    } catch (err: any) {
      setOutput('');
      setStatus({ type: 'error', message: `Compilation failed: ${err.message || 'Check syntaxes'}` });
    }
  };

  const handleLoadSample = () => {
    if (type === 'html') setInput(SAMPLE_HTML);
    else if (type === 'css') setInput(SAMPLE_CSS);
    else if (type === 'js') setInput(SAMPLE_JS);
    setOutput('');
    setStatus({ type: 'idle', message: '' });
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
    setStatus({ type: 'idle', message: '' });
  };

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const compressionRatio = input.length && output.length
    ? Math.max(0, Math.round(((input.length - output.length) / input.length) * 100))
    : 0;

  // Dynamic values based on theme or robust defaults
  const borderClass = theme?.border || 'border-slate-800/80';
  const borderMutedClass = theme?.borderMuted || 'border-slate-850';
  const cardClass = theme?.card || 'bg-slate-900/40';
  const inputBgClass = theme?.inputBg || 'bg-slate-950';
  const panelBgClass = theme?.panelBg || 'bg-slate-900';
  const textClass = theme?.text || 'text-slate-200';
  const textMutedClass = theme?.textMuted || 'text-slate-400';
  const canvasBgClass = theme?.canvasBg || 'bg-[#02050c]';
  const isLight = theme?.isDark === false;

  return (
    <div className="space-y-6" id="code-minifier-tool">
      
      {/* Settings Selection */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border p-4 rounded-xl ${cardClass} ${borderClass}`}>
        <div className="flex flex-wrap items-center gap-2">
          {(['html', 'css', 'js'] as MinifyType[]).map((format) => (
            <button
              key={format}
              onClick={() => {
                setType(format);
                setOutput('');
                setStatus({ type: 'idle', message: '' });
              }}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all border uppercase ${
                type === format
                  ? '!bg-indigo-600 !text-white border-indigo-500 shadow-md'
                  : isLight
                    ? 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                    : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200'
              }`}
            >
              {format} minifier
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleLoadSample}
            className={`border px-3 py-1.5 rounded-lg transition-all text-xs font-semibold ${
              isLight 
                ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800' 
                : 'bg-slate-950 hover:bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            Load Sample
          </button>
          <span className={`hidden md:inline ${isLight ? 'text-slate-200' : 'text-slate-800'}`}>|</span>
          <span className={`text-xs font-mono hidden md:inline ${textMutedClass}`}>Core Web Vitals Boost</span>
        </div>
      </div>

      {/* Grid Text Areas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Raw Source Area */}
        <div className={`flex flex-col h-[380px] border rounded-xl overflow-hidden shadow-lg ${inputBgClass} ${borderClass}`}>
          <div className={`px-4 py-3 border-b flex items-center justify-between ${panelBgClass} ${borderClass}`}>
            <span className={`text-xs font-semibold font-mono uppercase ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>
              Raw {type} source code
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
            placeholder={`Paste raw ${type.toUpperCase()} assets here to compress...`}
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <div className={`px-4 py-2 border-t text-[10px] font-mono ${panelBgClass} ${borderMutedClass} ${textMutedClass}`}>
            <span>Size: {input.length} characters</span>
          </div>
        </div>

        {/* Minified Destination Area */}
        <div className={`flex flex-col h-[380px] border rounded-xl overflow-hidden shadow-lg ${inputBgClass} ${borderClass}`}>
          <div className={`px-4 py-3 border-b flex items-center justify-between ${panelBgClass} ${borderClass}`}>
            <span className={`text-xs font-semibold font-mono uppercase ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>
              Compressed {type} output
            </span>
            {output && (
              <button
                onClick={handleCopy}
                className={`border px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 font-sans ${
                  isLight 
                    ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800' 
                    : 'bg-slate-950 hover:bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                <span>Copy Code</span>
              </button>
            )}
          </div>
          <div className={`flex-1 overflow-auto p-4 ${canvasBgClass}`}>
            {output ? (
              <pre className={`font-mono text-xs leading-relaxed whitespace-pre-wrap select-all break-all ${isLight ? 'text-indigo-800' : 'text-indigo-200'}`}>{output}</pre>
            ) : (
              <div className="h-full flex flex-col items-center justify-center space-y-2">
                <Code className={`w-6 h-6 ${isLight ? 'text-slate-350' : 'text-slate-800'}`} />
                <p className={`text-xs font-mono ${textMutedClass}`}>Compressed payload output ready</p>
              </div>
            )}
          </div>
          <div className={`px-4 py-2 border-t text-[10px] font-mono flex items-center justify-between ${panelBgClass} ${borderMutedClass} ${textMutedClass}`}>
            <span>Size: {output.length} characters</span>
            {compressionRatio > 0 && (
              <span className={`${isLight ? 'text-emerald-700' : 'text-emerald-400'} font-bold flex items-center gap-0.5`}>
                <Percent className="w-3 h-3" /> {compressionRatio}% saved!
              </span>
            )}
          </div>
        </div>

      </div>

      {/* Trigger Button */}
      <div className="flex flex-wrap gap-4 items-center justify-between">
        <button
          onClick={handleMinify}
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-6 py-3 rounded-xl shadow-md transition-all active:scale-[0.98] flex items-center gap-2 cursor-pointer"
        >
          <Sparkles className="w-3.5 h-3.5 text-white" />
          <span>Compress Asset Code</span>
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

      {/* COMPREHENSIVE SEO CONTENT & GUIDES FOR ADSENSE APPROVAL */}
      <div className={`mt-12 border rounded-xl p-6 md:p-8 space-y-6 ${cardClass} ${borderClass}`}>
        <div className={`flex items-center gap-2.5 border-b pb-4 ${borderClass}`}>
          <BookOpen className={`w-5 h-5 ${isLight ? 'text-indigo-600' : 'text-indigo-400'}`} />
          <h3 className={`text-base font-bold font-sans ${isLight ? 'text-slate-900' : 'text-white'}`}>Core Web Vitals & Web Asset Minification Tutorial</h3>
        </div>

        <div className={`grid grid-cols-1 md:grid-cols-2 gap-8 text-xs leading-relaxed ${textMutedClass}`}>
          <div className="space-y-4">
            <h4 className={`text-sm font-bold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>What is Code Minification?</h4>
            <p>
              Minification is the systematic process of stripping away redundant, non-functional elements from resource files (HTML markup, cascading stylesheets, and JavaScript assets) without altering how the code executes in the end user's browser.
            </p>
            <p>
              Redundant elements include spacing, tabs, newlines, system comments, trailing semicolons, and curly braces. Eliminating these items reduces payload size, resulting in much faster asset delivery over standard networks.
            </p>
            
            <h4 className={`text-sm font-bold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>Impact on SEO & PageSpeed:</h4>
            <p>
              Search engines like Google utilize **Core Web Vitals** (specifically LCP - Largest Contentful Paint, and INP - Interaction to Next Paint) as active, direct ranking factors. Slow web portals lose ranking search weight.
            </p>
            <ul className="list-disc list-inside space-y-1.5 pl-1">
              <li><strong>Reduced Parse Latency:</strong> Smaller files mean mobile browsers compile Javascript and layout CSS much quicker.</li>
              <li><strong>Bandwidth Efficiencies:</strong> Ideal for visitors on throttled 3G/4G cellular connections.</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className={`text-sm font-bold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>Difference Between Minification and GZIP Compression:</h4>
            <p>
              Minification and file-system compression (like Gzip, Deflate, or Brotli) are complementary procedures.
            </p>
            <p>
              Minification physically cleanses syntax layout artifacts before dispatch. Gzip/Brotli works at the transport level, grouping repetitive stream patterns into bit tokens. When combined, your web assets can shrink up to 80%!
            </p>

            <div className={`p-4 rounded-xl border space-y-2 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/50 border-slate-850'}`}>
              <span className={`font-bold block ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>Minification FAQ:</span>
              <p><strong>Q: Does minifying my Javascript change its logic?</strong></p>
              <p className={isLight ? 'text-slate-600' : 'text-slate-500'}>A: No. High-performance compilers only strip layouts, structures, comments, and empty lines. Variables are unaffected, meaning execution runtime remains identical.</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
