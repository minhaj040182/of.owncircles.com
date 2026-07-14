import React, { useState } from 'react';
import { Copy, Check, Download, QrCode, Sparkles, RefreshCw, AlertCircle, CheckCircle, BookOpen, Settings, HelpCircle } from 'lucide-react';

interface QrcodeToolProps {
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

export default function QrcodeTool({ theme }: QrcodeToolProps) {
  const [text, setText] = useState<string>('https://of.owncircles.com');
  const [size, setSize] = useState<number>(250);
  const [fgColor, setFgColor] = useState<string>('000000'); // Hex without '#' for api.qrserver.com
  const [bgColor, setBgColor] = useState<string>('ffffff'); // Hex without '#'
  const [ecc, setEcc] = useState<'L' | 'M' | 'Q' | 'H'>('H');
  const [margin, setMargin] = useState<number>(1);
  const [copied, setCopied] = useState<boolean>(false);
  const [status, setStatus] = useState<{ type: 'idle' | 'success' | 'error'; message: string }>({ type: 'idle', message: '' });

  const borderClass = theme?.border || 'border-slate-800/80';
  const borderMutedClass = theme?.borderMuted || 'border-slate-850';
  const cardClass = theme?.card || 'bg-slate-900/50';
  const inputBgClass = theme?.inputBg || 'bg-slate-950';
  const panelBgClass = theme?.panelBg || 'bg-slate-900';
  const textClass = theme?.text || 'text-slate-200';
  const textMutedClass = theme?.textMuted || 'text-slate-400';
  const canvasBgClass = theme?.canvasBg || 'bg-[#02050c]';
  const isLight = theme?.isDark === false;

  // Generate QRServer URL
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(text)}&color=${fgColor}&bgcolor=${bgColor}&ecc=${ecc}&margin=${margin}`;

  const handleDownload = async () => {
    try {
      setStatus({ type: 'idle', message: '' });
      const response = await fetch(qrUrl);
      const blob = await response.blob();
      const blobUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = blobUrl;
      link.download = `qrcode_${Date.now()}.png`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
      setStatus({ type: 'success', message: 'QR Code downloaded successfully!' });
    } catch (err: any) {
      setStatus({ type: 'error', message: 'Unable to download directly. Right click the image to save!' });
    }
  };

  const handleCopyUrl = () => {
    navigator.clipboard.writeText(qrUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6" id="qrcode-generator-tool">
      
      {/* Parameters Panel */}
      <div className={`grid grid-cols-1 md:grid-cols-12 gap-6 border p-6 rounded-2xl ${isLight ? 'bg-white' : 'bg-slate-900/30'} ${borderClass}`}>
        
        {/* Left Side: Customizations (7 cols) */}
        <div className="md:col-span-7 space-y-4 text-xs font-sans">
          
          <div className={`flex items-center gap-2 border-b pb-3 ${borderClass}`}>
            <Settings className={`w-4 h-4 ${isLight ? 'text-indigo-650' : 'text-indigo-400'}`} />
            <h3 className={`font-bold text-[11px] uppercase tracking-wider ${isLight ? 'text-slate-855' : 'text-white'}`}>QR Code Configurations</h3>
          </div>

          <div className="space-y-1.5">
            <label className={`block font-semibold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>QR Code Payload / Target URL / Text</label>
            <input
              type="text"
              className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500 font-mono text-xs ${
                isLight 
                  ? 'bg-white border-slate-250 text-slate-800' 
                  : 'bg-slate-950 border-slate-800 text-slate-200'
              }`}
              placeholder="e.g. https://of.owncircles.com"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            <div className="space-y-1.5">
              <label className={`block font-semibold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Size (Pixels)</label>
              <select
                className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500 font-mono text-xs ${
                  isLight 
                    ? 'bg-white border-slate-250 text-slate-800' 
                    : 'bg-slate-950 border-slate-800 text-slate-200'
                }`}
                value={size}
                onChange={(e) => setSize(parseInt(e.target.value) || 250)}
              >
                <option value="150">150 x 150</option>
                <option value="200">200 x 200</option>
                <option value="250">250 x 250</option>
                <option value="300">300 x 300</option>
                <option value="400">400 x 400</option>
                <option value="500">500 x 500</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className={`block font-semibold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Error Correction Level (ECC)</label>
              <select
                className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500 font-mono text-xs ${
                  isLight 
                    ? 'bg-white border-slate-250 text-slate-800' 
                    : 'bg-slate-950 border-slate-800 text-slate-200'
                }`}
                value={ecc}
                onChange={(e) => setEcc(e.target.value as any)}
              >
                <option value="L">Level L (7% Correction)</option>
                <option value="M">Level M (15% Correction)</option>
                <option value="Q">Level Q (25% Correction)</option>
                <option value="H">Level H (30% High Damage)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-1">
            <div className="space-y-1.5">
              <label className={`block font-semibold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Foreground Color</label>
              <div className={`flex items-center gap-2 border rounded-lg px-2.5 py-1 ${
                isLight ? 'bg-white border-slate-250' : 'bg-slate-950 border-slate-800'
              }`}>
                <input
                  type="color"
                  className="w-5 h-5 border-0 bg-transparent cursor-pointer rounded"
                  value={`#${fgColor}`}
                  onChange={(e) => setFgColor(e.target.value.substring(1))}
                />
                <input
                  type="text"
                  maxLength={6}
                  className={`w-12 bg-transparent text-[11px] font-mono focus:outline-none border-none p-0 ${
                    isLight ? 'text-slate-800' : 'text-slate-200'
                  }`}
                  value={fgColor}
                  onChange={(e) => setFgColor(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className={`block font-semibold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Background Color</label>
              <div className={`flex items-center gap-2 border rounded-lg px-2.5 py-1 ${
                isLight ? 'bg-white border-slate-250' : 'bg-slate-950 border-slate-800'
              }`}>
                <input
                  type="color"
                  className="w-5 h-5 border-0 bg-transparent cursor-pointer rounded"
                  value={`#${bgColor}`}
                  onChange={(e) => setBgColor(e.target.value.substring(1))}
                />
                <input
                  type="text"
                  maxLength={6}
                  className={`w-12 bg-transparent text-[11px] font-mono focus:outline-none border-none p-0 ${
                    isLight ? 'text-slate-800' : 'text-slate-200'
                  }`}
                  value={bgColor}
                  onChange={(e) => setBgColor(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className={`block font-semibold ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>Margin Spacing</label>
              <input
                type="number"
                min="0"
                max="5"
                className={`w-full border rounded-lg px-3 py-2 focus:outline-none focus:border-indigo-500 font-mono text-xs ${
                  isLight 
                    ? 'bg-white border-slate-250 text-slate-800' 
                    : 'bg-slate-950 border-slate-800 text-slate-200'
                }`}
                value={margin}
                onChange={(e) => setMargin(Math.max(0, parseInt(e.target.value) || 0))}
              />
            </div>
          </div>

        </div>

        {/* Right Side: QR Render Stage (5 cols) */}
        <div className={`md:col-span-5 flex flex-col items-center justify-center p-4 rounded-xl border shadow-inner space-y-4 ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-900'
        }`}>
          <div className="relative bg-white p-3.5 rounded-xl shadow-lg border border-slate-100 flex items-center justify-center">
            {text.trim() ? (
              <img
                src={qrUrl}
                alt="QR Code Dynamic Output"
                className="transition-opacity duration-300"
                width={170}
                height={170}
                referrerPolicy="no-referrer"
              />
            ) : (
              <div className="w-[170px] h-[170px] bg-slate-100 flex flex-col items-center justify-center text-slate-400 text-xs text-center font-mono p-4">
                <QrCode className="w-8 h-8 text-slate-300 animate-pulse mb-1" />
                <span>Awaiting target content...</span>
              </div>
            )}
          </div>

          {text.trim() && (
            <div className="flex items-center gap-2">
              <button
                onClick={handleDownload}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-[11px] px-3.5 py-2 rounded-lg transition-all flex items-center gap-1 cursor-pointer shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download PNG</span>
              </button>

              <button
                onClick={handleCopyUrl}
                className={`border text-[11px] px-3.5 py-2 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                  isLight 
                    ? 'bg-white hover:bg-slate-100 border-slate-250 text-slate-800' 
                    : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-slate-300'
                }`}
              >
                {copied ? <Check className={`w-3.5 h-3.5 ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`} /> : <Copy className="w-3.5 h-3.5" />}
                <span>Copy URL</span>
              </button>
            </div>
          )}
        </div>

      </div>

      {/* Action Messages */}
      {status.type !== 'idle' && (
        <div className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-medium border font-mono ${
          status.type === 'success' 
            ? (isLight ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-emerald-950/20 border-emerald-900/40 text-emerald-300')
            : (isLight ? 'bg-red-50 border-red-200 text-red-800' : 'bg-pink-950/20 border-pink-900/40 text-pink-300')
        }`}>
          {status.type === 'success' ? (
            <CheckCircle className={`w-4 h-4 ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`} />
          ) : (
            <AlertCircle className={`w-4 h-4 ${isLight ? 'text-red-600' : 'text-pink-400'}`} />
          )}
          <span>{status.message}</span>
        </div>
      )}

      {/* CORE QR GEOMETRY TUTORIALS FOR ADSENSE COMPLIANCE */}
      <div className={`border rounded-xl p-6 md:p-8 space-y-6 ${inputBgClass} ${borderClass}`}>
        <div className={`flex items-center gap-2.5 border-b pb-4 ${borderClass}`}>
          <BookOpen className={`w-5 h-5 ${isLight ? 'text-indigo-650' : 'text-indigo-400'}`} />
          <h3 className={`text-base font-bold font-sans ${isLight ? 'text-slate-855' : 'text-white'}`}>Anatomy and Architecture of Quick Response (QR) Codes</h3>
        </div>

        <div className={`grid grid-cols-1 md:grid-cols-2 gap-8 text-xs leading-relaxed font-sans ${textMutedClass}`}>
          <div className="space-y-4">
            <h4 className={`text-sm font-bold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>What is a QR Code?</h4>
            <p>
              A **QR Code** (Quick Response Code) is a two-dimensional matrix barcode created in 1994 by the Japanese automotive corporation Denso Wave. Designed to track vehicles during manufacturing, QR codes have evolved into the global standard for linking physical elements with digital assets.
            </p>
            <p>
              Unlike standard linear barcodes (such as UPC barcodes) that can only store numeric characters along a single horizontal axis, QR codes store binary, numeric, or alphanumeric bits in both vertical and horizontal arrays, enabling up to **hundreds of times more data capacity**.
            </p>
            
            <h4 className={`text-sm font-bold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>The Structural Components of a QR Matrix:</h4>
            <ul className="list-disc list-inside space-y-1.5 pl-1">
              <li><strong>Finder Patterns (Three Large Corners):</strong> Allows cameras and scanners to align and determine the code's rotation angle.</li>
              <li><strong>Alignment Patterns (Small Squares):</strong> Keeps the scanning grid normalized and readable even if printed on curved surfaces.</li>
              <li><strong>Timing Patterns (Connective Lines):</strong> Defines the structural module width and block count.</li>
              <li><strong>Quiet Zone:</strong> The essential blank outer border that distinguishes the QR from surrounding graphics.</li>
            </ul>
          </div>

          <div className="space-y-4">
            <h4 className={`text-sm font-bold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>Understanding Error Correction Levels (Reed-Solomon Math):</h4>
            <p>
              QR codes employ **Reed-Solomon error correction algorithms**, a mathematical procedure that calculates and embeds recovery blocks within the QR grid. This means a QR code can remain readable even if it is partially ripped, smudged, or covered by a custom logo badge!
            </p>
            <div className={`p-4 rounded-xl border space-y-2 ${
              isLight ? 'bg-slate-55 border-slate-200 text-slate-850' : 'bg-slate-900/50 border-slate-850 text-slate-300'
            }`}>
              <span className={`font-bold block ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>Levels Breakdown:</span>
              <ul className="list-none space-y-1">
                <li><strong>Level L:</strong> Recovers up to <strong>7%</strong> of lost data pixels. (Best for simple URLs on clean flyers).</li>
                <li><strong>Level M:</strong> Recovers up to <strong>15%</strong>. (Great compromise for digital ads).</li>
                <li><strong>Level Q:</strong> Recovers up to <strong>25%</strong>.</li>
                <li><strong>Level H:</strong> Recovers up to <strong>30%</strong>. (Mandatory when centering a custom branding logo).</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
