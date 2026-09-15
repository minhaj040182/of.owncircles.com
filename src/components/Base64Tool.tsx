import React, { useState } from 'react';
import { 
  Copy, 
  Check, 
  Trash2, 
  Sparkles, 
  CheckCircle, 
  AlertCircle, 
  ArrowLeftRight, 
  Download, 
  Binary, 
  ShieldAlert, 
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  FileText
} from 'lucide-react';

interface Base64ToolProps {
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
  themeKey?: string;
}

// Convert UTF-8 text string to standard Base64
export function utf8ToBase64(str: string): string {
  if (!str) return '';
  const bytes = new TextEncoder().encode(str);
  const CHUNK_SIZE = 0x8000;
  const chunks: string[] = [];
  for (let i = 0; i < bytes.length; i += CHUNK_SIZE) {
    chunks.push(String.fromCharCode.apply(null, Array.from(bytes.subarray(i, i + CHUNK_SIZE))));
  }
  return btoa(chunks.join(''));
}

// Convert Base64 string to decoded UTF-8 text with strict validation and error handling
export function base64ToUtf8(b64: string): string {
  if (!b64) return '';
  // Strip whitespace (spaces, tabs, newlines) commonly present in Base64 streams
  const clean = b64.replace(/\s+/g, '');
  if (!clean) return '';

  // Validate characters: standard Base64 (A-Z, a-z, 0-9, +, /) and URL-safe characters (-, _) with up to two = padding
  if (!/^[A-Za-z0-9+/_\-]*={0,2}$/.test(clean)) {
    throw new Error(
      "Invalid Base64 character detected. Base64 strings must only contain alphanumeric characters (A-Z, a-z, 0-9), '+', '/', and padding '='."
    );
  }

  // Length validation: A single Base64 character represents only 6 bits (less than 1 full 8-bit byte)
  if (clean.length % 4 === 1) {
    throw new Error(
      "Invalid Base64 length: truncated input. A single Base64 character cannot represent a full 8-bit byte."
    );
  }

  // Handle unpadded Base64 by padding with '=' to a multiple of 4
  let padded = clean;
  while (padded.length % 4 !== 0) {
    padded += '=';
  }

  // Check padding validity (padding characters must only be at the end)
  const padIndex = padded.indexOf('=');
  if (padIndex !== -1) {
    const trailingChars = padded.slice(padIndex);
    if (!/^={1,2}$/.test(trailingChars)) {
      throw new Error(
        "Malformed Base64 padding: '=' padding characters may only appear at the end of the string (maximum 2 '=' characters)."
      );
    }
  }

  // Standardize URL-safe characters (- -> +, _ -> /)
  const std = padded.replace(/-/g, '+').replace(/_/g, '/');

  let binary: string;
  try {
    binary = atob(std);
  } catch {
    throw new Error("Malformed Base64 input: string could not be decoded.");
  }

  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }

  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes);
  } catch {
    throw new Error(
      "Decoded bytes do not form valid UTF-8 text. The Base64 string appears to encode non-UTF-8 binary data."
    );
  }
}

export default function Base64Tool({ theme, themeKey = 'obsidian' }: Base64ToolProps) {
  const [mode, setMode] = useState<'encode' | 'decode'>('encode');
  const [input, setInput] = useState<string>('');
  const [output, setOutput] = useState<string>('');
  const [status, setStatus] = useState<{ type: 'idle' | 'success' | 'error'; message: string }>({ type: 'idle', message: '' });
  const [copied, setCopied] = useState<boolean>(false);
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const borderClass = theme?.border || 'border-slate-800/80';
  const borderMutedClass = theme?.borderMuted || 'border-slate-850';
  const cardClass = theme?.card || 'bg-slate-900/50';
  const inputBgClass = theme?.inputBg || 'bg-slate-950';
  const panelBgClass = theme?.panelBg || 'bg-slate-900';
  const textClass = theme?.text || 'text-slate-200';
  const textMutedClass = theme?.textMuted || 'text-slate-400';
  const canvasBgClass = theme?.canvasBg || 'bg-[#02050c]';
  const isLight = themeKey === 'light';

  const handleProcess = (overrideMode?: 'encode' | 'decode', overrideInput?: string) => {
    const currentMode = overrideMode || mode;
    const textToProcess = overrideInput !== undefined ? overrideInput : input;

    if (!textToProcess) {
      setOutput('');
      setStatus({ type: 'idle', message: '' });
      return;
    }

    try {
      if (currentMode === 'encode') {
        const encoded = utf8ToBase64(textToProcess);
        setOutput(encoded);
        setStatus({ type: 'success', message: 'Text successfully encoded to Base64.' });
      } else {
        const decoded = base64ToUtf8(textToProcess);
        setOutput(decoded);
        setStatus({ type: 'success', message: 'Base64 string successfully decoded to UTF-8 text.' });
      }
    } catch (err: any) {
      setOutput('');
      setStatus({
        type: 'error',
        message: err.message || 'Operation failed. Verify input format integrity.'
      });
    }
  };

  const handleModeChange = (newMode: 'encode' | 'decode') => {
    setMode(newMode);
    if (input) {
      handleProcess(newMode);
    } else {
      setStatus({ type: 'idle', message: '' });
    }
  };

  const handleSwap = () => {
    if (!output && !input) return;
    const nextInput = output;
    const nextOutput = input;
    const nextMode = mode === 'encode' ? 'decode' : 'encode';
    setInput(nextInput);
    setOutput(nextOutput);
    setMode(nextMode);
    setStatus({ 
      type: 'success', 
      message: `Swapped fields and switched to ${nextMode === 'encode' ? 'Encode' : 'Decode'} mode.` 
    });
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
    setStatus({ type: 'idle', message: '' });
  };

  const handleLoadSample = () => {
    if (mode === 'encode') {
      const sampleText = 'Hello World 👋 Welcome to OwnFormatters!';
      setInput(sampleText);
      handleProcess('encode', sampleText);
    } else {
      const sampleB64 = 'SGVsbG8gV29ybGQg8J+RiyBXZWxjb21lIHRvIE93bkZvcm1hdHRlcnMh';
      setInput(sampleB64);
      handleProcess('decode', sampleB64);
    }
  };

  const handleCopy = () => {
    const textToCopy = output;
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!output) return;
    const filename = mode === 'encode' ? 'encoded-base64.txt' : 'decoded-text.txt';
    const blob = new Blob([output], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const inputByteLength = new TextEncoder().encode(input).length;
  const outputByteLength = new TextEncoder().encode(output).length;

  const faqs = [
    {
      q: "What is Base64 encoding?",
      a: "Base64 is a binary-to-text encoding algorithm defined by RFC 4648. It converts groups of 3 8-bit bytes (24 bits total) into 4 6-bit index values, representing each index as an ASCII character from a 64-character alphabet (A-Z, a-z, 0-9, +, /)."
    },
    {
      q: "Why is Base64 not encryption?",
      a: "Base64 is strictly an encoding format, not an encryption algorithm. It uses an openly published public mapping with no secret keys or passwords. Anyone with access to a Base64 string can decode it back to the original plaintext in milliseconds. Never use Base64 to protect sensitive passwords, secrets, or personal data."
    },
    {
      q: "How does this tool handle Unicode and emojis?",
      a: "Standard browser window.btoa() and atob() only accept characters in the Latin-1 range (code points 0 to 255) and throw an exception on emojis or multi-byte characters. OwnFormatters uses the standard TextEncoder and TextDecoder APIs to safely convert arbitrary UTF-8 characters (such as emojis, accented letters, and non-Latin alphabets) into raw byte arrays before Base64 serialization, ensuring zero data corruption."
    },
    {
      q: "What does the '=' padding character mean?",
      a: "Base64 processes data in 3-byte blocks. If your input text byte length is not an exact multiple of 3, padding characters ('=') are added to complete the final 4-character block. One '=' is added if 1 byte is missing, and two '==' are added if 2 bytes are missing. This tool also supports decoding unpadded Base64 strings."
    },
    {
      q: "Is my text uploaded to a server?",
      a: "No. All encoding, decoding, validation, and file generation operations run 100% locally inside your web browser's JavaScript sandbox. Your data never leaves your computer and is never sent over any network."
    }
  ];

  return (
    <div className="space-y-8" id="base64-tool-workspace">
      {/* Interactive Tool Container */}
      <div className="space-y-6">
        {/* Controls Toolbar */}
        <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border p-4 rounded-xl ${cardClass} ${borderClass}`}>
          {/* Mode Selector Tabs */}
          <div className="flex items-center gap-2" role="tablist" aria-label="Conversion Mode">
            <button
              id="tab-encode"
              role="tab"
              aria-selected={mode === 'encode'}
              aria-controls="base64-input-panel"
              onClick={() => handleModeChange('encode')}
              className={`text-xs font-bold px-4 py-2 rounded-lg border transition-all cursor-pointer ${
                mode === 'encode'
                  ? '!bg-indigo-600 !text-white border-indigo-500 shadow-xs'
                  : isLight
                  ? 'bg-white text-slate-700 border-slate-200 hover:text-slate-900 hover:bg-slate-50'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              Encode (Text to Base64)
            </button>
            <button
              id="tab-decode"
              role="tab"
              aria-selected={mode === 'decode'}
              aria-controls="base64-input-panel"
              onClick={() => handleModeChange('decode')}
              className={`text-xs font-bold px-4 py-2 rounded-lg border transition-all cursor-pointer ${
                mode === 'decode'
                  ? '!bg-indigo-600 !text-white border-indigo-500 shadow-xs'
                  : isLight
                  ? 'bg-white text-slate-700 border-slate-200 hover:text-slate-900 hover:bg-slate-50'
                  : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              Decode (Base64 to Text)
            </button>
          </div>

          {/* Quick Helper Actions */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleLoadSample}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all cursor-pointer ${
                isLight
                  ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                  : 'bg-slate-950 hover:bg-slate-900 border-slate-800 text-slate-300'
              }`}
              title="Load sample text for testing"
            >
              Load Sample
            </button>
            <button
              onClick={handleClear}
              className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-all flex items-center gap-1 cursor-pointer ${
                isLight
                  ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                  : 'bg-slate-950 hover:bg-slate-900 border-slate-800 text-slate-300'
              }`}
              title="Clear all fields"
              aria-label="Clear All Fields"
            >
              <Trash2 className="w-3.5 h-3.5 text-slate-400" />
              Clear
            </button>
          </div>
        </div>

        {/* Editor Panes: Input & Output */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Input Panel */}
          <div 
            id="base64-input-panel"
            role="tabpanel"
            aria-labelledby={mode === 'encode' ? 'tab-encode' : 'tab-decode'}
            className={`flex flex-col h-[360px] border rounded-xl overflow-hidden ${inputBgClass} ${borderClass}`}
          >
            <div className={`px-4 py-3 border-b flex items-center justify-between ${panelBgClass} ${borderClass}`}>
              <label 
                htmlFor="base64-raw-input" 
                className={`text-xs font-bold font-mono ${isLight ? 'text-slate-800' : 'text-slate-200'}`}
              >
                {mode === 'encode' ? 'Plaintext Input (UTF-8)' : 'Base64 Input String'}
              </label>
              <span className={`text-[11px] font-mono ${textMutedClass}`}>
                {input.length} chars | {inputByteLength} B
              </span>
            </div>
            <textarea
              id="base64-raw-input"
              aria-label={mode === 'encode' ? 'Plaintext input to encode into Base64' : 'Base64 string to decode into plaintext'}
              className={`flex-1 w-full p-4 font-mono text-sm leading-relaxed focus:outline-none resize-none bg-transparent ${textClass} ${
                isLight ? 'placeholder:text-slate-400' : 'placeholder:text-slate-600'
              }`}
              placeholder={
                mode === 'encode'
                  ? 'Enter or paste plaintext to convert to Base64 (supports full Unicode, emojis, and multiline text)...'
                  : 'Enter or paste Base64 string to decode into plaintext (e.g., SGVsbG8gV29ybGQ=)...'
              }
              value={input}
              onChange={(e) => {
                setInput(e.target.value);
                if (e.target.value === '') {
                  setOutput('');
                  setStatus({ type: 'idle', message: '' });
                }
              }}
            />
            <div className={`px-4 py-2 border-t flex items-center justify-between text-[11px] font-mono ${panelBgClass} ${borderMutedClass} ${textMutedClass}`}>
              <span>Mode: {mode === 'encode' ? 'Text → Base64' : 'Base64 → Text'}</span>
              <span>100% Client-Side</span>
            </div>
          </div>

          {/* Output Panel */}
          <div className={`flex flex-col h-[360px] border rounded-xl overflow-hidden ${inputBgClass} ${borderClass}`}>
            <div className={`px-4 py-3 border-b flex items-center justify-between ${panelBgClass} ${borderClass}`}>
              <label 
                htmlFor="base64-processed-output" 
                className={`text-xs font-bold font-mono ${isLight ? 'text-slate-800' : 'text-slate-200'}`}
              >
                {mode === 'encode' ? 'Base64 Encoded Output' : 'Decoded Plaintext Output (UTF-8)'}
              </label>
              <div className="flex items-center gap-1.5">
                {output && (
                  <button
                    onClick={handleDownload}
                    className={`px-2 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 font-sans border cursor-pointer ${
                      isLight
                        ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
                        : 'bg-slate-950 hover:bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
                    }`}
                    title="Download output file"
                    aria-label="Download Output Text File"
                  >
                    <Download className="w-3 h-3" />
                    Save
                  </button>
                )}
                <button
                  onClick={handleCopy}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 font-sans border cursor-pointer ${
                    isLight
                      ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800'
                      : 'bg-slate-950 hover:bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
                  }`}
                  aria-label="Copy output text to clipboard"
                  title="Copy to clipboard"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>
            </div>
            <div className={`flex-1 overflow-auto p-4 ${canvasBgClass}`}>
              {output ? (
                <pre 
                  id="base64-processed-output"
                  tabIndex={0}
                  aria-label="Converted output result"
                  className={`font-mono text-sm leading-relaxed whitespace-pre-wrap break-all select-all focus:outline-none ${
                    isLight ? 'text-slate-900' : 'text-slate-200'
                  }`}
                >
                  {output}
                </pre>
              ) : (
                <div className="h-full flex flex-col items-center justify-center space-y-2">
                  <Binary className={`w-6 h-6 ${isLight ? 'text-slate-300' : 'text-slate-700'}`} />
                  <p className={`text-xs font-mono ${textMutedClass}`}>Output stream ready</p>
                </div>
              )}
            </div>
            <div className={`px-4 py-2 border-t flex items-center justify-between text-[11px] font-mono ${panelBgClass} ${borderMutedClass} ${textMutedClass}`}>
              <span>{output.length} chars | {outputByteLength} B</span>
              <span>UTF-8 Validated</span>
            </div>
          </div>
        </div>

        {/* Action Trigger Buttons & Status Feedback */}
        <div className="flex flex-wrap gap-3 items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleProcess()}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md transition-all active:scale-[0.98] flex items-center gap-1.5 cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-white" />
              {mode === 'encode' ? 'Encode to Base64' : 'Decode to Text'}
            </button>
            {output && (
              <button
                onClick={handleSwap}
                className={`border text-xs font-bold px-4 py-2.5 rounded-xl transition-all active:scale-[0.98] cursor-pointer ${
                  isLight
                    ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                    : 'bg-slate-900 hover:bg-slate-850 border-slate-800 text-slate-300'
                }`}
                title="Swap input and output fields, reversing the conversion direction"
              >
                <ArrowLeftRight className="w-3.5 h-3.5 inline mr-1" />
                Swap &amp; Invert
              </button>
            )}
          </div>

          {status.type !== 'idle' && (
            <div 
              role="alert"
              className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium border font-mono ${
                status.type === 'success'
                  ? isLight
                    ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                    : 'bg-emerald-950/20 border-emerald-900/40 text-emerald-300'
                  : isLight
                  ? 'bg-red-50 border-red-200 text-red-800'
                  : 'bg-pink-950/20 border-pink-900/40 text-pink-300'
              }`}
            >
              {status.type === 'success' ? (
                <CheckCircle className={`w-3.5 h-3.5 shrink-0 ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`} />
              ) : (
                <AlertCircle className={`w-3.5 h-3.5 shrink-0 ${isLight ? 'text-red-600' : 'text-pink-400'}`} />
              )}
              <span>{status.message}</span>
            </div>
          )}
        </div>

        {/* Security & Local Processing Privacy Notice */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className={`border rounded-xl p-4 text-xs font-sans space-y-1.5 ${isLight ? 'bg-amber-50/50 border-amber-200 text-amber-900' : 'bg-amber-950/20 border-amber-900/40 text-amber-300'}`}>
            <h4 className="font-bold flex items-center gap-1.5 text-xs">
              <ShieldAlert className="w-4 h-4 text-amber-600 dark:text-amber-400 shrink-0" />
              Base64 Is Encoding, Not Encryption
            </h4>
            <p className="leading-relaxed opacity-90">
              Base64 is a data representation format, not a security mechanism. Anyone with access to a Base64 string can decode it back to plaintext. Never rely on Base64 to conceal passwords or sensitive credentials.
            </p>
          </div>

          <div className={`border rounded-xl p-4 text-xs font-sans space-y-1.5 ${isLight ? 'bg-slate-50 border-slate-200 text-slate-700' : 'bg-slate-900/40 border-slate-850 text-slate-400'}`}>
            <h4 className={`font-bold flex items-center gap-1.5 text-xs ${isLight ? 'text-slate-900' : 'text-white'}`}>
              <ShieldCheck className="w-4 h-4 text-indigo-500 shrink-0" />
              100% Client-Side Privacy Guarantee
            </h4>
            <p className="leading-relaxed">
              Your text is processed locally in your browser and is not uploaded to OwnFormatters for Base64 conversion. No telemetry or log records are retained.
            </p>
          </div>
        </div>
      </div>

      {/* Supporting Documentation Section (400-700 words) */}
      <article className={`border-t pt-10 space-y-8 ${borderClass}`}>
        {/* Section 1: What Is Base64? */}
        <section className="space-y-3">
          <h2 className={`text-xl sm:text-2xl font-black tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
            What Is Base64?
          </h2>
          <p className={`text-sm leading-relaxed ${textMutedClass}`}>
            Base64 is a binary-to-text encoding algorithm defined by the Internet Engineering Task Force (IETF) in <strong>RFC 4648</strong>. It converts arbitrary binary data or text characters into a printable ASCII string consisting of 64 distinct characters: uppercase letters (<code>A–Z</code>), lowercase letters (<code>a–z</code>), digits (<code>0–9</code>), and the symbols <code>+</code> and <code>/</code>. An optional padding character, <code>=</code>, is appended when the input byte length is not evenly divisible by three.
          </p>
          <p className={`text-sm leading-relaxed ${textMutedClass}`}>
            Because standard transport protocols such as HTTP, SMTP email, and XML were historically designed to handle only 7-bit ASCII text, sending raw binary data across them frequently resulted in data corruption. Base64 resolves this by mapping every 3 bytes (24 bits) of raw data into 4 6-bit Base64 index values, ensuring seamless transmission across text-only channels. This encoding increases the data payload size by approximately 33%.
          </p>
        </section>

        {/* Section 2: How to Encode Text to Base64 */}
        <section className="space-y-3">
          <h2 className={`text-lg sm:text-xl font-bold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
            How to Encode Text to Base64
          </h2>
          <ol className={`list-decimal list-inside text-sm space-y-2 leading-relaxed ${textMutedClass}`}>
            <li>
              <strong>Select Encode mode:</strong> Ensure the <em>Encode (Text to Base64)</em> tab is active above the workspace.
            </li>
            <li>
              <strong>Enter or paste your text:</strong> Input any plain text into the left editor pane. OwnFormatters fully supports ASCII, multi-byte Unicode, symbols, and emojis.
            </li>
            <li>
              <strong>Convert:</strong> Click <em>Encode to Base64</em>. The browser converts the UTF-8 bytes into a standard RFC 4648 Base64 string instantly.
            </li>
            <li>
              <strong>Copy or download:</strong> Click <em>Copy</em> to copy the Base64 output to your clipboard or <em>Save</em> to download it as a <code>.txt</code> file.
            </li>
          </ol>
        </section>

        {/* Section 3: How to Decode Base64 */}
        <section className="space-y-3">
          <h2 className={`text-lg sm:text-xl font-bold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
            How to Decode Base64
          </h2>
          <ol className={`list-decimal list-inside text-sm space-y-2 leading-relaxed ${textMutedClass}`}>
            <li>
              <strong>Select Decode mode:</strong> Click the <em>Decode (Base64 to Text)</em> tab.
            </li>
            <li>
              <strong>Paste Base64 string:</strong> Paste your Base64 encoded payload into the input area. Leading, trailing, and inter-line whitespace (such as carriage returns in PEM files) is automatically normalized.
            </li>
            <li>
              <strong>Decode:</strong> Click <em>Decode to Text</em>. The tool validates the Base64 alphabet, verifies padding integrity, converts the radix-64 values back into bytes, and parses the UTF-8 text.
            </li>
            <li>
              <strong>Inspect output:</strong> Review the decoded plaintext in the right pane, then copy or export as needed.
            </li>
          </ol>
        </section>

        {/* Section 4: Base64 Encoding Example */}
        <section className="space-y-3">
          <h2 className={`text-lg sm:text-xl font-bold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
            Base64 Encoding Example
          </h2>
          <p className={`text-sm leading-relaxed ${textMutedClass}`}>
            Consider the standard greeting text:
          </p>
          <div className={`p-3 rounded-lg font-mono text-xs border ${isLight ? 'bg-slate-100 border-slate-200 text-slate-800' : 'bg-slate-950 border-slate-800 text-slate-200'}`}>
            Hello World
          </div>
          <p className={`text-sm leading-relaxed ${textMutedClass}`}>
            When converted into Base64, the 11-character UTF-8 byte stream is partitioned into 6-bit chunks, producing a 16-character padded Base64 string:
          </p>
          <div className={`p-3 rounded-lg font-mono text-xs border ${isLight ? 'bg-indigo-50/60 border-indigo-200 text-indigo-900' : 'bg-indigo-950/20 border-indigo-900/50 text-indigo-300'}`}>
            SGVsbG8gV29ybGQ=
          </div>
          <p className={`text-sm leading-relaxed ${textMutedClass}`}>
            Decoding <code>SGVsbG8gV29ybGQ=</code> in the reverse direction restores the exact original <code>Hello World</code> text without character loss or whitespace distortion.
          </p>
        </section>

        {/* Section 5: Base64 Is Encoding, Not Encryption */}
        <section className="space-y-3">
          <h2 className={`text-lg sm:text-xl font-bold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
            Base64 Is Encoding, Not Encryption
          </h2>
          <p className={`text-sm leading-relaxed ${textMutedClass}`}>
            A common misconception among newer developers is confusing Base64 encoding with encryption. <strong>Base64 is an encoding format, not encryption.</strong> Anyone who has Base64 data can normally decode it back to the original plaintext in fractions of a second using any standard programming language or terminal command (such as <code>base64 -d</code>).
          </p>
          <p className={`text-sm leading-relaxed ${textMutedClass}`}>
            Encryption algorithms (such as AES-256, RSA, or ChaCha20) require a secret cryptographic key to reverse the transformation and maintain confidentiality. In contrast, Base64 uses a static, openly published table that anyone can read. Never use Base64 to store passwords, API secret tokens, or personal identifiers under the belief that the data is protected.
          </p>
        </section>

        {/* Section 6: UTF-8 and Unicode */}
        <section className="space-y-3">
          <h2 className={`text-lg sm:text-xl font-bold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
            UTF-8 and Unicode Handling
          </h2>
          <p className={`text-sm leading-relaxed ${textMutedClass}`}>
            The standard JavaScript browser helper functions, <code>window.btoa()</code> and <code>window.atob()</code>, only support binary strings where each character represents a single 8-bit byte (code points <code>0x00</code> to <code>0xFF</code>). If arbitrary Unicode text containing accented characters (such as <em>Café</em>), East Asian logograms (such as <em>こんにちは</em> or <em>中文</em>), South Asian scripts (such as <em>বাংলা</em> or <em>हिन्दी</em>), or emojis (such as <em>👋</em>) is passed directly to <code>btoa()</code>, the browser immediately throws an <code>InvalidCharacterError</code> exception.
          </p>
          <p className={`text-sm leading-relaxed ${textMutedClass}`}>
            OwnFormatters resolves this by utilizing the modern W3C <code>TextEncoder</code> and <code>TextDecoder</code> specifications. The input text is first encoded into a compliant UTF-8 <code>Uint8Array</code>, which is then mapped byte-by-byte into the radix-64 alphabet. When decoding, the byte sequence is re-validated against strict UTF-8 boundaries to guarantee zero corruption of multi-byte characters.
          </p>
        </section>

        {/* Section 7: Frequently Asked Questions */}
        <section className="space-y-4">
          <h2 className={`text-lg sm:text-xl font-bold tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
            Frequently Asked Questions
          </h2>
          <div className="space-y-3">
            {faqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div
                  key={idx}
                  className={`border rounded-xl overflow-hidden transition-colors ${
                    isOpen 
                      ? isLight ? 'bg-slate-50 border-indigo-300' : 'bg-slate-900/70 border-indigo-500/40' 
                      : isLight ? 'bg-white border-slate-200' : 'bg-slate-900/30 border-slate-800'
                  }`}
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full text-left px-4 py-3.5 flex items-center justify-between gap-3 text-xs sm:text-sm font-semibold cursor-pointer"
                    aria-expanded={isOpen}
                  >
                    <span className={isLight ? 'text-slate-800' : 'text-slate-200'}>{faq.q}</span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-indigo-500 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className={`px-4 pb-4 text-xs sm:text-sm leading-relaxed border-t pt-3 ${
                      isLight ? 'border-slate-200 text-slate-650' : 'border-slate-800/80 text-slate-400'
                    }`}>
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Section 8: Related Developer Utilities */}
        <section className="space-y-4 pt-4 border-t border-slate-800/40">
          <h2 className={`text-base sm:text-lg font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
            Related Developer Utilities
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            <a
              href="/json-formatter"
              className={`p-3.5 rounded-xl border flex flex-col justify-between transition-all ${
                isLight 
                  ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800' 
                  : 'bg-slate-900/50 hover:bg-slate-850 border-slate-800 text-slate-200'
              }`}
            >
              <div className="space-y-1">
                <span className="text-xs font-bold text-indigo-400">JSON Formatter &amp; Beautifier</span>
                <p className={`text-[11px] leading-relaxed ${textMutedClass}`}>
                  Format, validate, and minify JSON data with client-side privacy.
                </p>
              </div>
              <span className="text-[10px] font-mono text-indigo-400 mt-2 flex items-center gap-1">
                Launch tool →
              </span>
            </a>

            <a
              href="/yaml-formatter"
              className={`p-3.5 rounded-xl border flex flex-col justify-between transition-all ${
                isLight 
                  ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800' 
                  : 'bg-slate-900/50 hover:bg-slate-850 border-slate-800 text-slate-200'
              }`}
            >
              <div className="space-y-1">
                <span className="text-xs font-bold text-indigo-400">YAML Formatter &amp; Converter</span>
                <p className={`text-[11px] leading-relaxed ${textMutedClass}`}>
                  Format YAML manifests and convert bi-directionally between YAML and JSON.
                </p>
              </div>
              <span className="text-[10px] font-mono text-indigo-400 mt-2 flex items-center gap-1">
                Launch tool →
              </span>
            </a>

            <a
              href="/csv-to-json"
              className={`p-3.5 rounded-xl border flex flex-col justify-between transition-all ${
                isLight 
                  ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800' 
                  : 'bg-slate-900/50 hover:bg-slate-850 border-slate-800 text-slate-200'
              }`}
            >
              <div className="space-y-1">
                <span className="text-xs font-bold text-indigo-400">CSV to JSON &amp; JSON to CSV</span>
                <p className={`text-[11px] leading-relaxed ${textMutedClass}`}>
                  Convert CSV tabular data to JSON arrays and export JSON back to RFC 4180 CSV.
                </p>
              </div>
              <span className="text-[10px] font-mono text-indigo-400 mt-2 flex items-center gap-1">
                Launch tool →
              </span>
            </a>

            <a
              href="/url-encoder-decoder"
              className={`p-3.5 rounded-xl border flex flex-col justify-between transition-all ${
                isLight 
                  ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800' 
                  : 'bg-slate-900/50 hover:bg-slate-850 border-slate-800 text-slate-200'
              }`}
            >
              <div className="space-y-1">
                <span className="text-xs font-bold text-indigo-400">URL Encoder / Decoder</span>
                <p className={`text-[11px] leading-relaxed ${textMutedClass}`}>
                  Percent-encode and decode URL parameters and query strings according to RFC 3986.
                </p>
              </div>
              <span className="text-[10px] font-mono text-indigo-400 mt-2 flex items-center gap-1">
                Launch tool →
              </span>
            </a>

            <a
              href="/hash-generator"
              className={`p-3.5 rounded-xl border flex flex-col justify-between transition-all ${
                isLight 
                  ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800' 
                  : 'bg-slate-900/50 hover:bg-slate-850 border-slate-800 text-slate-200'
              }`}
            >
              <div className="space-y-1">
                <span className="text-xs font-bold text-indigo-400">Cryptographic Hash Generator</span>
                <p className={`text-[11px] leading-relaxed ${textMutedClass}`}>
                  Generate cryptographic MD5, SHA-1, SHA-256, and SHA-512 hashes.
                </p>
              </div>
              <span className="text-[10px] font-mono text-indigo-400 mt-2 flex items-center gap-1">
                Launch tool →
              </span>
            </a>
          </div>
        </section>
      </article>
    </div>
  );
}
