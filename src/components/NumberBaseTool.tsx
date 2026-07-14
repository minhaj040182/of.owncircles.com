import React, { useState } from 'react';
import { Copy, Check, Trash2, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';

interface NumberBaseToolProps {
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

export default function NumberBaseTool({ theme }: NumberBaseToolProps) {
  const [decimal, setDecimal] = useState<string>('42');
  const [hex, setHex] = useState<string>('2a');
  const [octal, setOctal] = useState<string>('52');
  const [binary, setBinary] = useState<string>('101010');
  const [customBase, setCustomBase] = useState<number>(12);
  const [customValue, setCustomValue] = useState<string>('36');
  
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [error, setError] = useState<string>('');

  const isLight = theme?.isDark === false;
  const borderClass = theme?.border || 'border-slate-800/80';
  const cardClass = theme?.card || 'bg-slate-900/50';
  const inputBgClass = theme?.inputBg || 'bg-slate-950';
  const textMutedClass = theme?.textMuted || 'text-slate-400';

  // Master Synchronizer
  const updateFromDecimalValue = (decStr: string) => {
    setDecimal(decStr);
    
    if (!decStr.trim()) {
      setHex('');
      setOctal('');
      setBinary('');
      setCustomValue('');
      setError('');
      return;
    }

    const num = BigInt(decStr);
    if (num < 0n) {
      setError('Only non-negative integers are supported for multi-base visualization.');
      return;
    }

    setError('');
    setHex(num.toString(16));
    setOctal(num.toString(8));
    setBinary(num.toString(2));
    setCustomValue(num.toString(customBase));
  };

  const handleDecimalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9]/g, '');
    updateFromDecimalValue(val);
  };

  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-9A-Fa-f]/g, '').toLowerCase();
    setHex(val);
    if (val) {
      try {
        const decVal = BigInt(`0x${val}`);
        setDecimal(decVal.toString(10));
        setOctal(decVal.toString(8));
        setBinary(decVal.toString(2));
        setCustomValue(decVal.toString(customBase));
        setError('');
      } catch (err) {
        setError('Hex conversion fault.');
      }
    } else {
      updateFromDecimalValue('');
    }
  };

  const handleOctalChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^0-7]/g, '');
    setOctal(val);
    if (val) {
      try {
        const decVal = BigInt(`0o${val}`);
        setDecimal(decVal.toString(10));
        setHex(decVal.toString(16));
        setBinary(decVal.toString(2));
        setCustomValue(decVal.toString(customBase));
        setError('');
      } catch (err) {
        setError('Octal conversion fault.');
      }
    } else {
      updateFromDecimalValue('');
    }
  };

  const handleBinaryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.replace(/[^01]/g, '');
    setBinary(val);
    if (val) {
      try {
        const decVal = BigInt(`0b${val}`);
        setDecimal(decVal.toString(10));
        setHex(decVal.toString(16));
        setOctal(decVal.toString(8));
        setCustomValue(decVal.toString(customBase));
        setError('');
      } catch (err) {
        setError('Binary conversion fault.');
      }
    } else {
      updateFromDecimalValue('');
    }
  };

  const handleCustomBaseChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const base = Math.max(2, Math.min(36, parseInt(e.target.value, 10) || 12));
    setCustomBase(base);
    if (decimal.trim() && !error) {
      const num = BigInt(decimal);
      setCustomValue(num.toString(base));
    }
  };

  const handleCustomValueChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Keep characters conforming to alphabet of the base
    const alphabet = '0123456789abcdefghijklmnopqrstuvwxyz'.substring(0, customBase);
    const regex = new RegExp(`[^${alphabet}]`, 'gi');
    const val = e.target.value.replace(regex, '').toLowerCase();
    setCustomValue(val);

    if (val) {
      try {
        // Parse a custom base manually via BigInt
        let bigDecimal = 0n;
        const alphabetArr = '0123456789abcdefghijklmnopqrstuvwxyz';
        for (let i = 0; i < val.length; i++) {
          const digitChar = val[i];
          const digitValue = BigInt(alphabetArr.indexOf(digitChar));
          bigDecimal = bigDecimal * BigInt(customBase) + digitValue;
        }

        setDecimal(bigDecimal.toString(10));
        setHex(bigDecimal.toString(16));
        setOctal(bigDecimal.toString(8));
        setBinary(bigDecimal.toString(2));
        setError('');
      } catch (err) {
        setError(`Failed parsing base ${customBase} value.`);
      }
    } else {
      updateFromDecimalValue('');
    }
  };

  const handleClear = () => {
    setDecimal('');
    setHex('');
    setOctal('');
    setBinary('');
    setCustomValue('');
    setError('');
  };

  const handleCopy = (field: string, text: string) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 1500);
  };

  // Render a visual 16-bit register
  const renderBinaryRegister = () => {
    if (error || !decimal) return null;
    const num = parseInt(decimal, 10);
    if (isNaN(num) || num > 65535) return null;

    const bits = num.toString(2).padStart(16, '0').split('');
    return (
      <div className="space-y-2 pt-2">
        <label className={`text-[10px] font-mono font-bold uppercase block ${textMutedClass}`}>16-Bit Register Memory Grid</label>
        <div className="grid grid-cols-8 gap-1 md:grid-cols-16">
          {bits.map((bit, idx) => (
            <div key={idx} className="flex flex-col items-center">
              <span className="text-[8px] font-mono font-semibold text-slate-500 mb-1">{15 - idx}</span>
              <div className={`w-full py-2 rounded text-center font-mono text-xs font-bold border transition-all ${
                bit === '1' 
                  ? 'bg-indigo-650 text-white border-indigo-500 shadow-xs' 
                  : isLight 
                    ? 'bg-slate-50 text-slate-400 border-slate-200' 
                    : 'bg-slate-950 text-slate-600 border-slate-900'
              }`}>
                {bit}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6" id="number-base-converter-tool">
      
      {/* Top Controller */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border p-4 rounded-xl ${cardClass} ${borderClass}`}>
        <div className="flex items-center gap-2">
          <span className={`text-xs font-semibold font-mono flex items-center gap-1.5 ${textMutedClass}`}>
            <RefreshCw className="w-4 h-4 text-indigo-500" /> Multi-Radix Numeric Workspace
          </span>
        </div>
        <button
          onClick={handleClear}
          className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all flex items-center gap-1 cursor-pointer ${
            isLight 
              ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800' 
              : 'bg-slate-950 hover:bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
          }`}
        >
          <Trash2 className="w-3.5 h-3.5" />
          Reset Workspace
        </button>
      </div>

      {/* Main Base Conversion Panel */}
      <div className={`border p-6 rounded-xl space-y-6 ${cardClass} ${borderClass}`}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          
          {/* Decimal (Base 10) */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className={`text-[10px] font-mono font-bold uppercase ${textMutedClass}`}>Decimal (Base 10)</label>
              <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${isLight ? 'bg-slate-100' : 'bg-slate-950'}`}>0-9</span>
            </div>
            <div className="relative">
              <input
                type="text"
                value={decimal}
                onChange={handleDecimalChange}
                placeholder="Enter decimal integer..."
                className={`w-full ${inputBgClass} border ${borderClass} text-xs font-mono rounded-xl pl-3 pr-10 py-3 focus:outline-none focus:border-indigo-500`}
              />
              <button
                onClick={() => handleCopy('dec', decimal)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                title="Copy Decimal"
              >
                {copiedField === 'dec' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Hexadecimal (Base 16) */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className={`text-[10px] font-mono font-bold uppercase ${textMutedClass}`}>Hexadecimal (Base 16)</label>
              <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${isLight ? 'bg-slate-100' : 'bg-slate-950'}`}>0-9, A-F</span>
            </div>
            <div className="relative">
              <input
                type="text"
                value={hex}
                onChange={handleHexChange}
                placeholder="Enter hexadecimal integer..."
                className={`w-full ${inputBgClass} border ${borderClass} text-xs font-mono rounded-xl pl-3 pr-10 py-3 focus:outline-none focus:border-indigo-500`}
              />
              <button
                onClick={() => handleCopy('hex', hex)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                title="Copy Hexadecimal"
              >
                {copiedField === 'hex' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Octal (Base 8) */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className={`text-[10px] font-mono font-bold uppercase ${textMutedClass}`}>Octal (Base 8)</label>
              <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${isLight ? 'bg-slate-100' : 'bg-slate-950'}`}>0-7</span>
            </div>
            <div className="relative">
              <input
                type="text"
                value={octal}
                onChange={handleOctalChange}
                placeholder="Enter octal integer..."
                className={`w-full ${inputBgClass} border ${borderClass} text-xs font-mono rounded-xl pl-3 pr-10 py-3 focus:outline-none focus:border-indigo-500`}
              />
              <button
                onClick={() => handleCopy('oct', octal)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                title="Copy Octal"
              >
                {copiedField === 'oct' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Binary (Base 2) */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <label className={`text-[10px] font-mono font-bold uppercase ${textMutedClass}`}>Binary (Base 2)</label>
              <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${isLight ? 'bg-slate-100' : 'bg-slate-950'}`}>0, 1</span>
            </div>
            <div className="relative">
              <input
                type="text"
                value={binary}
                onChange={handleBinaryChange}
                placeholder="Enter binary bits..."
                className={`w-full ${inputBgClass} border ${borderClass} text-xs font-mono rounded-xl pl-3 pr-10 py-3 focus:outline-none focus:border-indigo-500`}
              />
              <button
                onClick={() => handleCopy('bin', binary)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                title="Copy Binary"
              >
                {copiedField === 'bin' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          {/* Custom Base Converter */}
          <div className="space-y-1.5 md:col-span-2 border-t pt-4 border-slate-900/60">
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-4">
              
              <div className="sm:col-span-3 space-y-1">
                <label className={`text-[10px] font-mono font-bold uppercase block ${textMutedClass}`}>Custom Base Radix</label>
                <div className="flex items-center gap-2">
                  <input
                    type="range"
                    min="2"
                    max="36"
                    value={customBase}
                    onChange={handleCustomBaseChange}
                    className="flex-1 accent-indigo-600 cursor-pointer"
                  />
                  <span className="text-xs font-bold font-mono px-2 py-1 rounded bg-indigo-950/30 text-indigo-400 border border-indigo-900/40 w-10 text-center">{customBase}</span>
                </div>
              </div>

              <div className="sm:col-span-9 space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className={`text-[10px] font-mono font-bold uppercase block ${textMutedClass}`}>Base {customBase} Representation</label>
                  <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${isLight ? 'bg-slate-100' : 'bg-slate-950'}`}>Alphabet: 0-{customBase > 10 ? String.fromCharCode(87 + customBase) : customBase - 1}</span>
                </div>
                <div className="relative">
                  <input
                    type="text"
                    value={customValue}
                    onChange={handleCustomValueChange}
                    placeholder={`Enter value in base ${customBase}...`}
                    className={`w-full ${inputBgClass} border ${borderClass} text-xs font-mono rounded-xl pl-3 pr-10 py-3 focus:outline-none focus:border-indigo-500`}
                  />
                  <button
                    onClick={() => handleCopy('custom', customValue)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                    title={`Copy Base ${customBase}`}
                  >
                    {copiedField === 'custom' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>

            </div>
          </div>

        </div>

        {error && (
          <div className="text-[11px] text-pink-400 font-mono flex items-center gap-1.5 bg-pink-950/10 border border-pink-900/30 p-3.5 rounded-xl">
            <AlertCircle className="w-4 h-4 text-pink-400" />
            <span>{error}</span>
          </div>
        )}

        {/* Visual Binary bits grid (Renders only if no error and integer fits standard sizes) */}
        {renderBinaryRegister()}

      </div>

      {/* Manual details */}
      <div className={`border rounded-xl p-5 text-xs font-sans space-y-2 ${isLight ? 'bg-slate-50 border-slate-200 text-slate-650' : 'bg-slate-900/30 border-slate-850 text-slate-400'}`}>
        <h4 className={`font-bold flex items-center gap-1.5 ${isLight ? 'text-slate-800' : 'text-white'}`}>
          <Sparkles className={`w-4 h-4 ${isLight ? 'text-indigo-600' : 'text-indigo-400'}`} />
          Computer Architecture Radix Specifications
        </h4>
        <p className="leading-relaxed">
          Number bases represent different positional notation formats. <strong>Decimal (Base 10)</strong> is the standard human counting format. <strong>Binary (Base 2)</strong> represents the raw on/off transistors inside computer CPUs. <strong>Octal (Base 8)</strong> is commonly utilized in Unix file permission strings. <strong>Hexadecimal (Base 16)</strong> packs 4 binary bits (a nibble) into a single scannable character, which is the standard format for memory offset addresses and color Hex specs.
        </p>
      </div>

    </div>
  );
}
