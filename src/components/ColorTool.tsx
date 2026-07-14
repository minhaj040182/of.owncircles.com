import React, { useState, useEffect } from 'react';
import { Copy, Check, Palette, Sparkles, AlertCircle, RefreshCw } from 'lucide-react';

interface ColorToolProps {
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

export default function ColorTool({ theme }: ColorToolProps) {
  const [hex, setHex] = useState<string>('#4f46e5');
  const [rgb, setRgb] = useState<string>('79, 70, 229');
  const [hsl, setHsl] = useState<string>('243, 75%, 59%');
  const [cmyk, setCmyk] = useState<string>('65, 69, 0, 10');
  
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [error, setError] = useState<string>('');

  const isLight = theme?.isDark === false;
  const borderClass = theme?.border || 'border-slate-800/80';
  const cardClass = theme?.card || 'bg-slate-900/50';
  const inputBgClass = theme?.inputBg || 'bg-slate-950';
  const panelBgClass = theme?.panelBg || 'bg-slate-900';
  const textClass = theme?.text || 'text-slate-200';
  const textMutedClass = theme?.textMuted || 'text-slate-400';

  // Helper converters
  const hexToRgb = (hexStr: string): { r: number; g: number; b: number } | null => {
    const cleanHex = hexStr.replace(/^#/, '');
    if (cleanHex.length !== 3 && cleanHex.length !== 6) return null;
    
    let r = 0, g = 0, b = 0;
    if (cleanHex.length === 3) {
      r = parseInt(cleanHex[0] + cleanHex[0], 16);
      g = parseInt(cleanHex[1] + cleanHex[1], 16);
      b = parseInt(cleanHex[2] + cleanHex[2], 16);
    } else {
      r = parseInt(cleanHex.substring(0, 2), 16);
      g = parseInt(cleanHex.substring(2, 4), 16);
      b = parseInt(cleanHex.substring(4, 6), 16);
    }
    return isNaN(r) || isNaN(g) || isNaN(b) ? null : { r, g, b };
  };

  const rgbToHex = (r: number, g: number, b: number): string => {
    const clamp = (val: number) => Math.max(0, Math.min(255, val));
    const rs = clamp(r).toString(16).padStart(2, '0');
    const gs = clamp(g).toString(16).padStart(2, '0');
    const bs = clamp(b).toString(16).padStart(2, '0');
    return `#${rs}${gs}${bs}`;
  };

  const rgbToHsl = (r: number, g: number, b: number): { h: number; s: number; l: number } => {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0, l = (max + min) / 2;

    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = (g - b) / d + (g < b ? 6 : 0); break;
        case g: h = (b - r) / d + 2; break;
        case b: h = (r - g) / d + 4; break;
      }
      h /= 6;
    }

    return {
      h: Math.round(h * 360),
      s: Math.round(s * 100),
      l: Math.round(l * 100)
    };
  };

  const hslToRgb = (h: number, s: number, l: number): { r: number; g: number; b: number } => {
    h /= 360; s /= 100; l /= 100;
    let r = l, g = l, b = l;

    if (s !== 0) {
      const hue2rgb = (p: number, q: number, t: number) => {
        if (t < 0) t += 1;
        if (t > 1) t -= 1;
        if (t < 1/6) return p + (q - p) * 6 * t;
        if (t < 1/2) return q;
        if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
        return p;
      };

      const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
      const p = 2 * l - q;
      r = hue2rgb(p, q, h + 1/3);
      g = hue2rgb(p, q, h);
      b = hue2rgb(p, q, h - 1/3);
    }

    return {
      r: Math.round(r * 255),
      g: Math.round(g * 255),
      b: Math.round(b * 255)
    };
  };

  const rgbToCmyk = (r: number, g: number, b: number): { c: number; m: number; y: number; k: number } => {
    const rf = r / 255, gf = g / 255, bf = b / 255;
    const k = 1 - Math.max(rf, gf, bf);
    if (k === 1) {
      return { c: 0, m: 0, y: 0, k: 100 };
    }
    const c = Math.round(((1 - rf - k) / (1 - k)) * 100);
    const m = Math.round(((1 - gf - k) / (1 - k)) * 100);
    const y = Math.round(((1 - bf - k) / (1 - k)) * 100);
    return { c, m, y, k: Math.round(k * 100) };
  };

  const cmykToRgb = (c: number, m: number, y: number, k: number): { r: number; g: number; b: number } => {
    c /= 100; m /= 100; y /= 100; k /= 100;
    const r = Math.round(255 * (1 - c) * (1 - k));
    const g = Math.round(255 * (1 - m) * (1 - k));
    const b = Math.round(255 * (1 - y) * (1 - k));
    return { r, g, b };
  };

  // Main synchronizer
  const updateFromHex = (hexValue: string) => {
    setHex(hexValue);
    const rgbVal = hexToRgb(hexValue);
    if (rgbVal) {
      setError('');
      setRgb(`${rgbVal.r}, ${rgbVal.g}, ${rgbVal.b}`);
      
      const hslVal = rgbToHsl(rgbVal.r, rgbVal.g, rgbVal.b);
      setHsl(`${hslVal.h}, ${hslVal.s}%, ${hslVal.l}%`);
      
      const cmykVal = rgbToCmyk(rgbVal.r, rgbVal.g, rgbVal.b);
      setCmyk(`${cmykVal.c}, ${cmykVal.m}, ${cmykVal.y}, ${cmykVal.k}`);
    } else {
      setError('Invalid Hex Color format');
    }
  };

  const handleHexChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;
    if (!value.startsWith('#') && value.length > 0) value = '#' + value;
    setHex(value);
    if (/^#[0-9A-Fa-f]{6}$|^#[0-9A-Fa-f]{3}$/.test(value)) {
      updateFromHex(value);
    }
  };

  const handleRgbChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setRgb(value);
    const parts = value.split(',').map(p => parseInt(p.trim(), 10));
    if (parts.length === 3 && parts.every(p => !isNaN(p) && p >= 0 && p <= 255)) {
      setError('');
      const calculatedHex = rgbToHex(parts[0], parts[1], parts[2]);
      setHex(calculatedHex);
      
      const hslVal = rgbToHsl(parts[0], parts[1], parts[2]);
      setHsl(`${hslVal.h}, ${hslVal.s}%, ${hslVal.l}%`);
      
      const cmykVal = rgbToCmyk(parts[0], parts[1], parts[2]);
      setCmyk(`${cmykVal.c}, ${cmykVal.m}, ${cmykVal.y}, ${cmykVal.k}`);
    } else {
      setError('Invalid RGB parameters. Example: 79, 70, 229');
    }
  };

  const handleHslChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setHsl(value);
    const parts = value.replace(/%/g, '').split(',').map(p => parseFloat(p.trim()));
    if (parts.length === 3 && !parts.some(isNaN)) {
      setError('');
      const calculatedRgb = hslToRgb(parts[0], parts[1], parts[2]);
      const calculatedHex = rgbToHex(calculatedRgb.r, calculatedRgb.g, calculatedRgb.b);
      setHex(calculatedHex);
      setRgb(`${calculatedRgb.r}, ${calculatedRgb.g}, ${calculatedRgb.b}`);
      
      const cmykVal = rgbToCmyk(calculatedRgb.r, calculatedRgb.g, calculatedRgb.b);
      setCmyk(`${cmykVal.c}, ${cmykVal.m}, ${cmykVal.y}, ${cmykVal.k}`);
    } else {
      setError('Invalid HSL parameters. Example: 243, 75%, 59%');
    }
  };

  const handleCmykChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCmyk(value);
    const parts = value.replace(/%/g, '').split(',').map(p => parseFloat(p.trim()));
    if (parts.length === 4 && !parts.some(isNaN) && parts.every(p => p >= 0 && p <= 100)) {
      setError('');
      const calculatedRgb = cmykToRgb(parts[0], parts[1], parts[2], parts[3]);
      const calculatedHex = rgbToHex(calculatedRgb.r, calculatedRgb.g, calculatedRgb.b);
      setHex(calculatedHex);
      setRgb(`${calculatedRgb.r}, ${calculatedRgb.g}, ${calculatedRgb.b}`);
      
      const hslVal = rgbToHsl(calculatedRgb.r, calculatedRgb.g, calculatedRgb.b);
      setHsl(`${hslVal.h}, ${hslVal.s}%, ${hslVal.l}%`);
    } else {
      setError('Invalid CMYK parameters. Example: 65, 69, 0, 10');
    }
  };

  const handleColorPicker = (e: React.ChangeEvent<HTMLInputElement>) => {
    updateFromHex(e.target.value);
  };

  const handleCopy = (field: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 1500);
  };

  // WCAG Contrast Check
  const getRelativeLuminance = (r: number, g: number, b: number) => {
    const a = [r, g, b].map((v) => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4);
    });
    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
  };

  const getContrastRatio = (lum1: number, lum2: number) => {
    const brightest = Math.max(lum1, lum2);
    const darkest = Math.min(lum1, lum2);
    return (brightest + 0.05) / (darkest + 0.05);
  };

  const rgbObj = hexToRgb(hex) || { r: 79, g: 70, b: 229 };
  const currentLuminance = getRelativeLuminance(rgbObj.r, rgbObj.g, rgbObj.b);
  const whiteLuminance = getRelativeLuminance(255, 255, 255);
  const blackLuminance = getRelativeLuminance(0, 0, 0);

  const whiteContrast = getContrastRatio(currentLuminance, whiteLuminance);
  const blackContrast = getContrastRatio(currentLuminance, blackLuminance);

  // Generate color palette helpers
  const generateComplementary = (): string => {
    const hslObj = rgbToHsl(rgbObj.r, rgbObj.g, rgbObj.b);
    const complementaryHue = (hslObj.h + 180) % 360;
    const complementaryRgb = hslToRgb(complementaryHue, hslObj.s, hslObj.l);
    return rgbToHex(complementaryRgb.r, complementaryRgb.g, complementaryRgb.b);
  };

  const generateAnalogous = (): string[] => {
    const hslObj = rgbToHsl(rgbObj.r, rgbObj.g, rgbObj.b);
    const r1 = hslToRgb((hslObj.h + 30) % 360, hslObj.s, hslObj.l);
    const r2 = hslToRgb((hslObj.h - 30 + 360) % 360, hslObj.s, hslObj.l);
    return [rgbToHex(r1.r, r1.g, r1.b), rgbToHex(r2.r, r2.g, r2.b)];
  };

  const generateTriadic = (): string[] => {
    const hslObj = rgbToHsl(rgbObj.r, rgbObj.g, rgbObj.b);
    const r1 = hslToRgb((hslObj.h + 120) % 360, hslObj.s, hslObj.l);
    const r2 = hslToRgb((hslObj.h + 240) % 360, hslObj.s, hslObj.l);
    return [rgbToHex(r1.r, r1.g, r1.b), rgbToHex(r2.r, r2.g, r2.b)];
  };

  const generateMonochromatic = (): string[] => {
    const hslObj = rgbToHsl(rgbObj.r, rgbObj.g, rgbObj.b);
    const r1 = hslToRgb(hslObj.h, hslObj.s, Math.max(10, hslObj.l - 20));
    const r2 = hslToRgb(hslObj.h, hslObj.s, Math.min(90, hslObj.l + 20));
    return [rgbToHex(r1.r, r1.g, r1.b), rgbToHex(r2.r, r2.g, r2.b)];
  };

  const analogous = generateAnalogous();
  const triadic = generateTriadic();
  const monochromatic = generateMonochromatic();
  const complementary = generateComplementary();

  return (
    <div className="space-y-6" id="color-converter-tool">
      
      {/* Visual Header / Color Preview Card */}
      <div className={`grid grid-cols-1 md:grid-cols-12 gap-6 border p-6 rounded-2xl ${cardClass} ${borderClass}`}>
        
        {/* Interactive Preview Canvas */}
        <div className="md:col-span-4 flex flex-col items-center justify-center space-y-4">
          <div 
            className="w-32 h-32 rounded-3xl shadow-2xl relative border border-white/20 flex items-center justify-center overflow-hidden group transition-transform duration-300 hover:scale-105"
            style={{ backgroundColor: hex }}
          >
            {/* Color picker overlay */}
            <input 
              type="color" 
              value={hex} 
              onChange={handleColorPicker}
              className="absolute inset-0 opacity-0 cursor-pointer w-full h-full"
            />
            <span className="text-white text-xs font-mono font-bold bg-black/45 px-2 py-1 rounded-md opacity-0 group-hover:opacity-100 transition-opacity">
              Choose Color
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className={`text-xs font-bold font-mono ${textMutedClass}`}>Interactive Color Hex:</span>
            <span className={`text-sm font-black font-mono tracking-tight px-2 py-0.5 rounded ${isLight ? 'bg-slate-100' : 'bg-slate-950'}`}>
              {hex.toUpperCase()}
            </span>
          </div>
        </div>

        {/* Input fields panel */}
        <div className="md:col-span-8 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            
            {/* HEX */}
            <div className="space-y-1.5">
              <label className={`text-[10px] font-mono font-bold uppercase block ${textMutedClass}`}>Hexadecimal (HEX)</label>
              <div className="relative">
                <input
                  type="text"
                  value={hex}
                  onChange={handleHexChange}
                  className={`w-full ${inputBgClass} border ${borderClass} text-xs font-mono rounded-xl pl-3 pr-10 py-2.5 focus:outline-none focus:border-indigo-500`}
                />
                <button
                  onClick={() => handleCopy('hex', hex)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                  title="Copy Hex"
                >
                  {copiedField === 'hex' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* RGB */}
            <div className="space-y-1.5">
              <label className={`text-[10px] font-mono font-bold uppercase block ${textMutedClass}`}>RGB (Red, Green, Blue)</label>
              <div className="relative">
                <input
                  type="text"
                  value={rgb}
                  onChange={handleRgbChange}
                  className={`w-full ${inputBgClass} border ${borderClass} text-xs font-mono rounded-xl pl-3 pr-10 py-2.5 focus:outline-none focus:border-indigo-500`}
                />
                <button
                  onClick={() => handleCopy('rgb', `rgb(${rgb})`)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                  title="Copy RGB"
                >
                  {copiedField === 'rgb' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* HSL */}
            <div className="space-y-1.5">
              <label className={`text-[10px] font-mono font-bold uppercase block ${textMutedClass}`}>HSL (Hue, Sat, Lightness)</label>
              <div className="relative">
                <input
                  type="text"
                  value={hsl}
                  onChange={handleHslChange}
                  className={`w-full ${inputBgClass} border ${borderClass} text-xs font-mono rounded-xl pl-3 pr-10 py-2.5 focus:outline-none focus:border-indigo-500`}
                />
                <button
                  onClick={() => handleCopy('hsl', `hsl(${hsl})`)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                  title="Copy HSL"
                >
                  {copiedField === 'hsl' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

            {/* CMYK */}
            <div className="space-y-1.5">
              <label className={`text-[10px] font-mono font-bold uppercase block ${textMutedClass}`}>CMYK (Cyan, Mag, Yellow, Key)</label>
              <div className="relative">
                <input
                  type="text"
                  value={cmyk}
                  onChange={handleCmykChange}
                  className={`w-full ${inputBgClass} border ${borderClass} text-xs font-mono rounded-xl pl-3 pr-10 py-2.5 focus:outline-none focus:border-indigo-500`}
                />
                <button
                  onClick={() => handleCopy('cmyk', `cmyk(${cmyk})`)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white"
                  title="Copy CMYK"
                >
                  {copiedField === 'cmyk' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>

          </div>

          {error && (
            <div className="text-[11px] text-pink-400 font-mono flex items-center gap-1">
              <AlertCircle className="w-3 h-3" />
              <span>{error}</span>
            </div>
          )}
        </div>

      </div>

      {/* WCAG Contrast Checker Panel & Palettes Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* WCAG Contrast Card (5 Cols) */}
        <div className={`lg:col-span-5 border p-5 rounded-xl space-y-4 ${cardClass} ${borderClass}`}>
          <h4 className={`text-xs font-bold font-mono uppercase flex items-center gap-1.5 border-b pb-2 ${isLight ? 'text-slate-800 border-slate-200' : 'text-slate-300 border-slate-900'}`}>
            <Sparkles className="w-4 h-4 text-amber-500" /> WCAG Contrast Ratios
          </h4>
          
          <div className="space-y-3">
            
            {/* White Text */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-white/5 border border-white/5">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded flex items-center justify-center font-bold text-xs" style={{ backgroundColor: hex, color: '#ffffff' }}>aA</div>
                <span className="text-xs font-semibold">on White Text</span>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono font-bold block">{whiteContrast.toFixed(2)}:1</span>
                <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                  whiteContrast >= 7 
                    ? 'bg-emerald-950/40 text-emerald-300' 
                    : whiteContrast >= 4.5 
                      ? 'bg-blue-950/40 text-blue-300' 
                      : 'bg-pink-950/40 text-pink-300'
                }`}>
                  {whiteContrast >= 7 ? 'AAA Pass' : whiteContrast >= 4.5 ? 'AA Pass' : 'Fail'}
                </span>
              </div>
            </div>

            {/* Black Text */}
            <div className="flex items-center justify-between p-3 rounded-lg bg-black/25 border border-black/5">
              <div className="flex items-center gap-2">
                <div className="w-6 h-6 rounded flex items-center justify-center font-bold text-xs" style={{ backgroundColor: hex, color: '#000000' }}>aA</div>
                <span className="text-xs font-semibold">on Black Text</span>
              </div>
              <div className="text-right">
                <span className="text-xs font-mono font-bold block">{blackContrast.toFixed(2)}:1</span>
                <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                  blackContrast >= 7 
                    ? 'bg-emerald-950/40 text-emerald-300' 
                    : blackContrast >= 4.5 
                      ? 'bg-blue-950/40 text-blue-300' 
                      : 'bg-pink-950/40 text-pink-300'
                }`}>
                  {blackContrast >= 7 ? 'AAA Pass' : blackContrast >= 4.5 ? 'AA Pass' : 'Fail'}
                </span>
              </div>
            </div>

          </div>
        </div>

        {/* Scheme Palettes Card (7 Cols) */}
        <div className={`lg:col-span-7 border p-5 rounded-xl space-y-4 ${cardClass} ${borderClass}`}>
          <h4 className={`text-xs font-bold font-mono uppercase flex items-center gap-1.5 border-b pb-2 ${isLight ? 'text-slate-800 border-slate-200' : 'text-slate-300 border-slate-900'}`}>
            <Palette className={`w-4 h-4 ${isLight ? 'text-indigo-600' : 'text-indigo-400'}`} /> Dynamic Harmonious Palettes
          </h4>

          <div className="space-y-3.5">
            {/* Complementary */}
            <div className="flex items-center justify-between">
              <span className={`text-[11px] font-semibold ${textMutedClass}`}>Complementary</span>
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => updateFromHex(complementary)}
                  className="w-12 h-6 rounded border border-white/10 relative group"
                  style={{ backgroundColor: complementary }}
                  title="Apply complimentary color"
                />
                <span className="text-xs font-mono font-bold">{complementary.toUpperCase()}</span>
                <button 
                  onClick={() => handleCopy('comp', complementary)}
                  className="p-1 rounded text-slate-500 hover:text-white"
                >
                  {copiedField === 'comp' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                </button>
              </div>
            </div>

            {/* Analogous */}
            <div className="flex items-center justify-between">
              <span className={`text-[11px] font-semibold ${textMutedClass}`}>Analogous Scheme</span>
              <div className="flex gap-2">
                {analogous.map((color, idx) => (
                  <div key={idx} className="flex items-center gap-1.5">
                    <button 
                      onClick={() => updateFromHex(color)}
                      className="w-8 h-6 rounded border border-white/10" 
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-[10px] font-mono">{color.toUpperCase()}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Triadic */}
            <div className="flex items-center justify-between">
              <span className={`text-[11px] font-semibold ${textMutedClass}`}>Triadic Harmony</span>
              <div className="flex gap-2">
                {triadic.map((color, idx) => (
                  <div key={idx} className="flex items-center gap-1.5">
                    <button 
                      onClick={() => updateFromHex(color)}
                      className="w-8 h-6 rounded border border-white/10" 
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-[10px] font-mono">{color.toUpperCase()}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Monochromatic */}
            <div className="flex items-center justify-between">
              <span className={`text-[11px] font-semibold ${textMutedClass}`}>Monochromatic Tones</span>
              <div className="flex gap-2">
                {monochromatic.map((color, idx) => (
                  <div key={idx} className="flex items-center gap-1.5">
                    <button 
                      onClick={() => updateFromHex(color)}
                      className="w-8 h-6 rounded border border-white/10" 
                      style={{ backgroundColor: color }}
                    />
                    <span className="text-[10px] font-mono">{color.toUpperCase()}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

      </div>

      {/* Color Physics Manual */}
      <div className={`border rounded-xl p-5 text-xs font-sans space-y-2 ${isLight ? 'bg-slate-50 border-slate-200 text-slate-650' : 'bg-slate-900/30 border-slate-850 text-slate-400'}`}>
        <h4 className={`font-bold flex items-center gap-1.5 ${isLight ? 'text-slate-800' : 'text-white'}`}>
          <Palette className={`w-4 h-4 ${isLight ? 'text-indigo-600' : 'text-indigo-400'}`} />
          Color Space Specifications Guide
        </h4>
        <p className="leading-relaxed">
          Colors can be represented in various spatial models. <strong>HEX</strong> is a base-16 color code format commonly used in HTML/CSS styles. <strong>RGB</strong> represents color values as additive ratios of Red, Green, and Blue light beams (0 to 255). <strong>HSL</strong> measures cylindrical coordinates of Hue, Saturation, and Lightness, making design edits more intuitive. <strong>CMYK</strong> is a subtractive ink schema (Cyan, Magenta, Yellow, Key/Black) used for physical printing presses.
        </p>
      </div>

    </div>
  );
}
