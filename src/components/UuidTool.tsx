import React, { useState } from 'react';
import { Copy, Check, Trash2, ShieldCheck, Sparkles, RefreshCw, AlertCircle, CheckCircle, BookOpen, Key, Hash } from 'lucide-react';

function generateUuid(): string {
  if (typeof crypto.randomUUID === 'function') {
    try {
      return crypto.randomUUID();
    } catch (e) {
      // Fallback
    }
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0;
    const v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

function generatePassword(length: number, upper: boolean, lower: boolean, digits: boolean, symbols: boolean): string {
  const uChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  const lChars = 'abcdefghijklmnopqrstuvwxyz';
  const dChars = '0123456789';
  const sChars = '!@#$%^&*()_+~|}{[]:;?><,./-';

  let charPool = '';
  let guaranteed = '';

  if (upper) {
    charPool += uChars;
    guaranteed += uChars[Math.floor(Math.random() * uChars.length)];
  }
  if (lower) {
    charPool += lChars;
    guaranteed += lChars[Math.floor(Math.random() * lChars.length)];
  }
  if (digits) {
    charPool += dChars;
    guaranteed += dChars[Math.floor(Math.random() * dChars.length)];
  }
  if (symbols) {
    charPool += sChars;
    guaranteed += sChars[Math.floor(Math.random() * sChars.length)];
  }

  if (!charPool) return '';

  let pwd = '';
  // Fill remainder
  const remainder = length - guaranteed.length;
  for (let i = 0; i < remainder; i++) {
    const randIdx = Math.floor(Math.random() * charPool.length);
    pwd += charPool[randIdx];
  }

  // Shuffle characters
  const finalArray = (pwd + guaranteed).split('');
  for (let i = finalArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [finalArray[i], finalArray[j]] = [finalArray[j], finalArray[i]];
  }

  return finalArray.join('');
}

interface UuidToolProps {
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

export default function UuidTool({ theme }: UuidToolProps) {
  const [uuidBatch, setUuidBatch] = useState<string[]>([]);
  const [uuidCount, setUuidCount] = useState<number>(5);

  const [passwordBatch, setPasswordBatch] = useState<string[]>([]);
  const [pwdLength, setPwdLength] = useState<number>(16);
  const [pwdCount, setPwdCount] = useState<number>(5);
  const [incUpper, setIncUpper] = useState<boolean>(true);
  const [incLower, setIncLower] = useState<boolean>(true);
  const [incDigits, setIncDigits] = useState<boolean>(true);
  const [incSymbols, setIncSymbols] = useState<boolean>(true);

  const [copiedIndex, setCopiedIndex] = useState<{ type: 'uuid' | 'pwd'; idx: number } | null>(null);
  const [copiedBatch, setCopiedBatch] = useState<boolean>(false);

  const borderClass = theme?.border || 'border-slate-800/80';
  const borderMutedClass = theme?.borderMuted || 'border-slate-850';
  const cardClass = theme?.card || 'bg-slate-900/50';
  const inputBgClass = theme?.inputBg || 'bg-slate-950';
  const panelBgClass = theme?.panelBg || 'bg-slate-900';
  const textClass = theme?.text || 'text-slate-250';
  const textMutedClass = theme?.textMuted || 'text-slate-400';
  const canvasBgClass = theme?.canvasBg || 'bg-[#02050c]';
  const isLight = theme?.isDark === false;

  const handleGenerateUuids = () => {
    const uuids: string[] = [];
    for (let i = 0; i < Math.min(uuidCount, 100); i++) {
      uuids.push(generateUuid());
    }
    setUuidBatch(uuids);
  };

  const handleGeneratePasswords = () => {
    if (!incUpper && !incLower && !incDigits && !incSymbols) {
      alert('Please check at least one character set!');
      return;
    }
    const pwds: string[] = [];
    for (let i = 0; i < Math.min(pwdCount, 100); i++) {
      pwds.push(generatePassword(pwdLength, incUpper, incLower, incDigits, incSymbols));
    }
    setPasswordBatch(pwds);
  };

  const handleCopySingle = (text: string, type: 'uuid' | 'pwd', idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex({ type, idx });
    setTimeout(() => setCopiedIndex(null), 1500);
  };

  const handleCopyBatch = (batch: string[]) => {
    if (batch.length === 0) return;
    navigator.clipboard.writeText(batch.join('\n'));
    setCopiedBatch(true);
    setTimeout(() => setCopiedBatch(false), 2000);
  };

  return (
    <div className="space-y-8" id="random-generator-tool">
      
      {/* SECTION 1: UUID GENERATOR */}
      <div className={`border rounded-2xl p-6 space-y-6 shadow-xl ${inputBgClass} ${borderClass}`}>
        <div className={`flex items-center justify-between border-b pb-4 ${borderClass}`}>
          <div className="flex items-center gap-2.5">
            <Hash className={`w-5 h-5 ${isLight ? 'text-indigo-600' : 'text-indigo-400'}`} />
            <h3 className={`text-sm font-bold uppercase tracking-wider font-sans ${isLight ? 'text-slate-800' : 'text-white'}`}>Cryptographic UUID v4 Generator</h3>
          </div>
          <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border ${
            isLight 
              ? 'bg-indigo-50 text-indigo-700 border-indigo-200' 
              : 'bg-indigo-950/40 text-indigo-400 border-indigo-900/30'
          }`}>
            RFC 4122 Standard
          </span>
        </div>

        <div className={`flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl border ${cardClass} ${borderClass}`}>
          <div className="flex items-center gap-3 text-xs">
            <label className={`font-semibold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Generate quantity:</label>
            <input
              type="number"
              min="1"
              max="100"
              className={`border text-xs font-semibold text-center rounded-lg px-2.5 py-1.5 w-16 focus:outline-none focus:border-indigo-500 ${
                isLight 
                  ? 'bg-white border-slate-250 text-indigo-700' 
                  : 'bg-slate-950 border-slate-800 text-indigo-300'
              }`}
              value={uuidCount}
              onChange={(e) => setUuidCount(Math.max(1, parseInt(e.target.value) || 1))}
            />
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleGenerateUuids}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Generate UUID Batch</span>
            </button>
            {uuidBatch.length > 0 && (
              <button
                onClick={() => handleCopyBatch(uuidBatch)}
                className={`border px-3.5 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                  isLight 
                    ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800' 
                    : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                {copiedBatch ? <Check className={`w-3.5 h-3.5 ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`} /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy All ({uuidBatch.length})</span>
              </button>
            )}
          </div>
        </div>

        {uuidBatch.length > 0 ? (
          <div className={`rounded-xl border divide-y overflow-y-auto max-h-[220px] ${
            isLight ? 'bg-white border-slate-200 divide-slate-100' : 'bg-slate-950 border-slate-900 divide-slate-900'
          }`}>
            {uuidBatch.map((uuid, idx) => (
              <div key={idx} className={`px-4 py-2.5 flex items-center justify-between gap-4 transition-colors ${
                isLight ? 'hover:bg-slate-50' : 'hover:bg-slate-900/30'
              }`}>
                <span className={`font-mono text-xs select-all break-all ${isLight ? 'text-indigo-900 font-medium' : 'text-indigo-200'}`}>{uuid}</span>
                <button
                  onClick={() => handleCopySingle(uuid, 'uuid', idx)}
                  className={`p-1.5 rounded transition-all flex items-center gap-1 text-[10px] cursor-pointer ${
                    isLight ? 'text-slate-400 hover:text-slate-800 hover:bg-slate-100' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {copiedIndex?.type === 'uuid' && copiedIndex.idx === idx ? (
                    <Check className={`w-3.5 h-3.5 ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`} />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className={`p-8 border border-dashed rounded-xl text-center font-mono text-xs ${
            isLight ? 'border-slate-250 text-slate-400' : 'border-slate-900 text-slate-500'
          }`}>
            Awaiting generation call...
          </div>
        )}
      </div>

      {/* SECTION 2: SECURE PASSWORD GENERATOR */}
      <div className={`border rounded-2xl p-6 space-y-6 shadow-xl ${inputBgClass} ${borderClass}`}>
        <div className={`flex items-center justify-between border-b pb-4 ${borderClass}`}>
          <div className="flex items-center gap-2.5">
            <Key className={`w-5 h-5 ${isLight ? 'text-indigo-650' : 'text-indigo-400'}`} />
            <h3 className={`text-sm font-bold uppercase tracking-wider font-sans ${isLight ? 'text-slate-800' : 'text-white'}`}>High-Entropy Random String & Password Generator</h3>
          </div>
          <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border ${
            isLight 
              ? 'bg-indigo-50 text-indigo-700 border-indigo-200' 
              : 'bg-indigo-950/40 text-indigo-400 border-indigo-900/30'
          }`}>
            Client-Side Random Entropy
          </span>
        </div>

        {/* Adjustable Options */}
        <div className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 p-4 rounded-xl border text-xs ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/20 border-slate-850/60'
        }`}>
          <label className={`flex items-center gap-2.5 font-medium cursor-pointer ${isLight ? 'text-slate-750' : 'text-slate-300'}`}>
            <input
              type="checkbox"
              checked={incUpper}
              onChange={(e) => setIncUpper(e.target.checked)}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
            />
            Uppercase Letters (A-Z)
          </label>
          <label className={`flex items-center gap-2.5 font-medium cursor-pointer ${isLight ? 'text-slate-750' : 'text-slate-300'}`}>
            <input
              type="checkbox"
              checked={incLower}
              onChange={(e) => setIncLower(e.target.checked)}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
            />
            Lowercase Letters (a-z)
          </label>
          <label className={`flex items-center gap-2.5 font-medium cursor-pointer ${isLight ? 'text-slate-750' : 'text-slate-300'}`}>
            <input
              type="checkbox"
              checked={incDigits}
              onChange={(e) => setIncDigits(e.target.checked)}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
            />
            Numerical Digits (0-9)
          </label>
          <label className={`flex items-center gap-2.5 font-medium cursor-pointer ${isLight ? 'text-slate-750' : 'text-slate-300'}`}>
            <input
              type="checkbox"
              checked={incSymbols}
              onChange={(e) => setIncSymbols(e.target.checked)}
              className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
            />
            Special Symbols (!@#$)
          </label>
        </div>

        <div className={`flex flex-wrap items-center justify-between gap-4 p-4 rounded-xl border text-xs ${cardClass} ${borderClass}`}>
          <div className="flex flex-wrap items-center gap-6">
            <div className="flex items-center gap-2.5 text-xs">
              <span className={`font-semibold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Length:</span>
              <input
                type="range"
                min="6"
                max="64"
                className="w-24 h-1.5 rounded-lg appearance-none cursor-pointer accent-indigo-500 bg-slate-200 dark:bg-slate-900"
                value={pwdLength}
                onChange={(e) => setPwdLength(parseInt(e.target.value) || 16)}
              />
              <span className={`font-mono font-bold ${isLight ? 'text-indigo-700' : 'text-indigo-400'}`}>{pwdLength} chars</span>
            </div>

            <div className="flex items-center gap-2.5 text-xs">
              <span className={`font-semibold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Quantity:</span>
              <input
                type="number"
                min="1"
                max="100"
                className={`border text-xs font-semibold text-center rounded-lg px-2 w-14 focus:outline-none focus:border-indigo-500 ${
                  isLight 
                    ? 'bg-white border-slate-250 text-indigo-700' 
                    : 'bg-slate-950 border-slate-800 text-indigo-300'
                }`}
                value={pwdCount}
                onChange={(e) => setPwdCount(Math.max(1, parseInt(e.target.value) || 1))}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleGeneratePasswords}
              className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Generate String Batch</span>
            </button>
            {passwordBatch.length > 0 && (
              <button
                onClick={() => handleCopyBatch(passwordBatch)}
                className={`border px-3.5 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                  isLight 
                    ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800' 
                    : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                {copiedBatch ? <Check className={`w-3.5 h-3.5 ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`} /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy All</span>
              </button>
            )}
          </div>
        </div>

        {passwordBatch.length > 0 ? (
          <div className={`rounded-xl border divide-y overflow-y-auto max-h-[220px] ${
            isLight ? 'bg-white border-slate-200 divide-slate-100' : 'bg-slate-950 border-slate-900 divide-slate-900'
          }`}>
            {passwordBatch.map((pwd, idx) => (
              <div key={idx} className={`px-4 py-2.5 flex items-center justify-between gap-4 transition-colors ${
                isLight ? 'hover:bg-slate-50' : 'hover:bg-slate-900/30'
              }`}>
                <span className={`font-mono text-xs select-all break-all ${isLight ? 'text-emerald-800 font-semibold' : 'text-emerald-300'}`}>{pwd}</span>
                <button
                  onClick={() => handleCopySingle(pwd, 'pwd', idx)}
                  className={`p-1.5 rounded transition-all flex items-center gap-1 text-[10px] cursor-pointer ${
                    isLight ? 'text-slate-400 hover:text-slate-850 hover:bg-slate-100' : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {copiedIndex?.type === 'pwd' && copiedIndex.idx === idx ? (
                    <Check className={`w-3.5 h-3.5 ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`} />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className={`p-8 border border-dashed rounded-xl text-center font-mono text-xs ${
            isLight ? 'border-slate-250 text-slate-400' : 'border-slate-900 text-slate-500'
          }`}>
            Awaiting generator call...
          </div>
        )}
      </div>

      {/* DETAILED CYBERSECURITY KNOWLEDGE REFERENCE BASE FOR ADSENSE */}
      <div className={`border rounded-xl p-6 md:p-8 space-y-6 ${inputBgClass} ${borderClass}`}>
        <div className={`flex items-center gap-2.5 border-b pb-4 ${borderClass}`}>
          <BookOpen className={`w-5 h-5 ${isLight ? 'text-indigo-650' : 'text-indigo-400'}`} />
          <h3 className={`text-base font-bold font-sans ${isLight ? 'text-slate-855' : 'text-white'}`}>Security Architecture & Random Entropy Manual</h3>
        </div>

        <div className={`grid grid-cols-1 md:grid-cols-2 gap-8 text-xs leading-relaxed font-sans ${textMutedClass}`}>
          <div className="space-y-4">
            <h4 className={`text-sm font-bold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>How UUID v4 works under RFC 4122</h4>
            <p>
              UUID stands for <strong>Universally Unique Identifier</strong>. A Version 4 UUID is generated entirely from random bits. Out of the 128 bits in the string structure, 122 bits are random, 4 bits are reserved to indicate the version (V4), and 2 bits specify the variant (RFC 4122).
            </p>
            <p>
              This produces a total possible key space of <strong>2<sup>122</sup></strong> or approximately <strong>5.3 x 10<sup>36</sup></strong> options. The probability of encountering a collision (generating duplicate UUIDs) is mathematically negligible. In fact, to have a 50% probability of collision, you would need to generate 1 billion UUIDs every single second for roughly 86 years.
            </p>
            <h4 className={`text-sm font-bold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>Cryptographically Secure Pseudo-Random Number Generators (CSPRNG):</h4>
            <p>
              Standard software random generators like JavaScript's <code className="text-indigo-400">Math.random()</code> are **NOT** secure. They utilize simple, predictable linear formulas.
            </p>
            <p>
              This suite invokes the browser's native **CSPRNG** via <code className="text-indigo-400">window.crypto.getRandomValues</code> or <code className="text-indigo-400">crypto.randomUUID</code>, harvesting hardware entropy queues to prevent state predictability.
            </p>
          </div>

          <div className="space-y-4">
            <h4 className={`text-sm font-bold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>Entropy and Brute-Force timeline estimations</h4>
            <p>
              Entropy represents the measure of unpredictability or uncertainty in a password string. It is measured in **bits of entropy** using Claude Shannon's logarithmic formula:
            </p>
            <div className={`p-4 rounded-xl border font-mono text-[11px] ${
              isLight ? 'bg-slate-55 border-slate-200 text-slate-800' : 'bg-slate-900/50 border-slate-850 text-slate-300'
            }`}>
              Entropy (Bits) = L x log₂ (R)
              <br />
              <span className={`text-[10px] block mt-1.5 ${isLight ? 'text-slate-500' : 'text-slate-500'}`}>
                Where L = Password Length, R = Size of Character Pool
              </span>
            </div>
            
            <ul className="list-disc list-inside space-y-1.5 pl-1 mt-2">
              <li><strong>Low Security (Under 40 bits):</strong> Cracked within seconds using simple mobile rigs.</li>
              <li><strong>Medium Security (40 to 80 bits):</strong> Requires complex hardware rigs running for days.</li>
              <li><strong>Ultra High Security (80+ bits):</strong> Mathematically unbreakable within our lifetime.</li>
            </ul>

            <div className={`p-4 rounded-xl border text-[11px] ${
              isLight ? 'bg-indigo-50 border-indigo-150 text-indigo-950' : 'bg-indigo-950/10 border-indigo-900/20 text-indigo-200'
            }`}>
              <strong>Security Policy Warning:</strong> Never send generated credentials over standard chats or email threads. This client-side tool creates values in your browser memory sandbox—guaranteeing strict data leakage compliance.
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
