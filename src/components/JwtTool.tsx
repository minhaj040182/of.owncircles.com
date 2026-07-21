import React, { useState } from 'react';
import { Copy, Check, Trash2, Key, Info, HelpCircle, CheckCircle, AlertCircle, Eye, ArrowLeftRight } from 'lucide-react';
import { decodeJwt, JwtPayload } from '../utils';

const SAMPLE_JWT = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyLCJleHAiOjE4MDExOTI4MDAsImFkbWluIjp0cnVlLCJyb2xlcyI6WyJkZXZlbG9wZXIiLCJhbmFseXN0Il19.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

interface JwtToolProps {
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

export default function JwtTool({ theme }: JwtToolProps) {
  const [token, setToken] = useState<string>('');
  const [decoded, setDecoded] = useState<JwtPayload | null>(null);
  const [copied, setCopied] = useState<Record<string, boolean>>({});

  const borderClass = theme?.border || 'border-slate-800/80';
  const borderMutedClass = theme?.borderMuted || 'border-slate-850';
  const cardClass = theme?.card || 'bg-slate-900/50';
  const inputBgClass = theme?.inputBg || 'bg-slate-950';
  const panelBgClass = theme?.panelBg || 'bg-slate-900';
  const textClass = theme?.text || 'text-slate-200';
  const textMutedClass = theme?.textMuted || 'text-slate-400';
  const canvasBgClass = theme?.canvasBg || 'bg-[#02050c]';
  const isLight = theme?.isDark === false;

  const handleDecode = (inputToken: string) => {
    const rawToken = inputToken.trim();
    if (!rawToken) {
      setDecoded(null);
      return;
    }
    const result = decodeJwt(rawToken);
    setDecoded(result);
  };

  const handleLoadSample = () => {
    setToken(SAMPLE_JWT);
    handleDecode(SAMPLE_JWT);
  };

  const handleClear = () => {
    setToken('');
    setDecoded(null);
  };

  const handleCopySection = (key: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopied({ ...copied, [key]: true });
    setTimeout(() => {
      setCopied({ ...copied, [key]: false });
    }, 2000);
  };

  // Convert exp/iat epoch timestamp to readable date
  const formatEpoch = (epoch: number) => {
    try {
      const date = new Date(epoch * 1000);
      return date.toLocaleString();
    } catch (e) {
      return 'Invalid timestamp';
    }
  };

  // Check if JWT exp is expired
  const checkExpirationStatus = (exp: number) => {
    const now = Math.floor(Date.now() / 1000);
    if (exp < now) {
      return { 
        expired: true, 
        text: 'Expired', 
        class: isLight 
          ? 'bg-red-50 text-red-800 border-red-250 shadow-xs' 
          : 'bg-pink-950/30 text-pink-400 border-pink-900/40' 
      };
    }
    return { 
      expired: false, 
      text: 'Active / Valid Timeframe', 
      class: isLight 
        ? 'bg-emerald-50 text-emerald-800 border-emerald-250 shadow-xs' 
        : 'bg-emerald-950/30 text-emerald-400 border-emerald-900/40' 
    };
  };

  return (
    <div className="space-y-6" id="jwt-tool-section">
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border p-4 rounded-xl ${cardClass} ${borderClass}`}>
        <div className="flex items-center gap-2">
          <Key className={`w-4 h-4 ${isLight ? 'text-indigo-600' : 'text-indigo-400'}`} />
          <h3 className={`text-xs font-bold tracking-wider uppercase font-mono ${isLight ? 'text-slate-800' : 'text-white'}`}>JWT Debugger Decoder</h3>
        </div>
        <button
          onClick={handleLoadSample}
          className={`text-xs font-semibold px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
            isLight 
              ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800 shadow-xs' 
              : 'bg-slate-950 hover:bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
          }`}
        >
          Load Mock JWT Token
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Token Input (5 cols) */}
        <div className={`lg:col-span-5 flex flex-col border rounded-xl overflow-hidden min-h-[380px] lg:h-[500px] ${inputBgClass} ${borderClass}`}>
          <div className={`px-4 py-3 border-b flex items-center justify-between ${panelBgClass} ${borderClass}`}>
            <span className={`text-xs font-semibold font-mono ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>Paste Encoded Token (Header.Payload.Signature)</span>
            <button
              onClick={handleClear}
              className={`${isLight ? 'text-slate-400 hover:text-red-500' : 'text-slate-400 hover:text-pink-400'} p-1 rounded transition-colors cursor-pointer`}
              title="Clear Token"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          <textarea
            className={`flex-1 w-full p-4 font-mono text-xs leading-relaxed focus:outline-none resize-none break-all select-all selection:bg-indigo-600/30 ${
              isLight ? 'bg-white text-slate-850 placeholder:text-slate-400' : 'bg-slate-950 text-slate-300 placeholder:text-slate-600'
            }`}
            placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
            value={token}
            onChange={(e) => {
              setToken(e.target.value);
              handleDecode(e.target.value);
            }}
          />
          <div className={`p-4 border-t text-xs font-sans space-y-1 ${panelBgClass} ${borderClass} ${textMutedClass}`}>
            <span className={`font-bold block ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>Colors definition:</span>
            <span className={`${isLight ? 'text-pink-600' : 'text-pink-400'} font-mono block`}>● Header (Algorithm & Token Type)</span>
            <span className={`${isLight ? 'text-indigo-600' : 'text-indigo-400'} font-mono block`}>● Payload (Claims & Expiration)</span>
            <span className={`${isLight ? 'text-emerald-600' : 'text-emerald-400'} font-mono block`}>● Signature (Verification string)</span>
          </div>
        </div>

        {/* Decoded Results (7 cols) */}
        <div className={`lg:col-span-7 flex flex-col border rounded-xl overflow-hidden min-h-[380px] lg:h-[500px] ${inputBgClass} ${borderClass}`}>
          <div className={`px-4 py-3 border-b flex items-center justify-between ${panelBgClass} ${borderClass}`}>
            <span className={`text-xs font-semibold font-mono font-bold ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>Decoded JSON Objects</span>
            {decoded && decoded.valid && (
              <span className={`text-[10px] font-mono flex items-center gap-1 ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`}>
                <CheckCircle className="w-3.5 h-3.5" /> Valid Base64 Structure
              </span>
            )}
          </div>

          <div className={`flex-1 overflow-auto p-4 space-y-5 ${canvasBgClass}`}>
            {decoded ? (
              decoded.valid ? (
                <div className="space-y-4">
                  {/* Metadata Check */}
                  {decoded.payload?.exp && (
                    <div className={`p-3 border rounded-xl flex justify-between items-center text-xs font-mono ${checkExpirationStatus(decoded.payload.exp).class}`}>
                      <span>JWT EXPIRATION STATUS:</span>
                      <span className="font-bold">{checkExpirationStatus(decoded.payload.exp).text} ({formatEpoch(decoded.payload.exp)})</span>
                    </div>
                  )}

                  {/* Header Block */}
                  <div className={`space-y-1 border rounded-lg p-3 ${
                    isLight 
                      ? 'border-pink-200 bg-pink-50/50 text-pink-900' 
                      : 'border-pink-950/40 bg-pink-950/5 text-pink-300'
                  }`}>
                    <div className="flex justify-between items-center">
                      <span className={`text-xs font-bold font-mono uppercase ${isLight ? 'text-pink-700' : 'text-pink-400'}`}>Header: Algorithm & Token Type</span>
                      <button
                        onClick={() => handleCopySection('header', JSON.stringify(decoded.header, null, 2))}
                        className={`text-[10px] font-mono font-bold border px-1.5 py-0.5 rounded cursor-pointer ${
                          isLight 
                            ? 'text-pink-700 bg-pink-50 border-pink-200 hover:bg-pink-100/70' 
                            : 'text-pink-400 bg-pink-950/20 border-pink-900/30 hover:bg-pink-900/30'
                        }`}
                      >
                        {copied.header ? 'Copied!' : 'Copy Header'}
                      </button>
                    </div>
                    <pre className="font-mono text-xs overflow-x-auto pt-1 select-all">{JSON.stringify(decoded.header, null, 2)}</pre>
                  </div>

                  {/* Payload Block */}
                  <div className={`space-y-1 border rounded-lg p-3 ${
                    isLight 
                      ? 'border-indigo-200 bg-indigo-50/50 text-indigo-900' 
                      : 'border-indigo-950/40 bg-indigo-950/5 text-indigo-300'
                  }`}>
                    <div className="flex justify-between items-center">
                      <span className={`text-xs font-bold font-mono uppercase ${isLight ? 'text-indigo-700' : 'text-indigo-400'}`}>Payload: Claims (Data payload)</span>
                      <button
                        onClick={() => handleCopySection('payload', JSON.stringify(decoded.payload, null, 2))}
                        className={`text-[10px] font-mono font-bold border px-1.5 py-0.5 rounded cursor-pointer ${
                          isLight 
                            ? 'text-indigo-700 bg-indigo-50 border-indigo-200 hover:bg-indigo-100/70' 
                            : 'text-indigo-400 bg-indigo-950/20 border-indigo-900/30 hover:bg-indigo-900/30'
                        }`}
                      >
                        {copied.payload ? 'Copied!' : 'Copy Payload'}
                      </button>
                    </div>
                    <pre className="font-mono text-xs overflow-x-auto pt-1 select-all">{JSON.stringify(decoded.payload, null, 2)}</pre>
                  </div>

                  {/* Claims explainer table */}
                  <div className={`border rounded-lg p-3 space-y-1.5 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-900'}`}>
                    <span className={`text-[10px] font-mono uppercase block ${textMutedClass}`}>Registered Claims Explainer:</span>
                    <div className="text-[10px] font-mono space-y-1">
                      {decoded.payload?.sub && (
                        <div className={`flex justify-between border-b pb-0.5 ${isLight ? 'border-slate-200' : 'border-slate-900/40'}`}>
                          <span className={textMutedClass}>sub (Subject):</span>
                          <span className={isLight ? 'text-slate-800' : 'text-slate-300'}>{decoded.payload.sub}</span>
                        </div>
                      )}
                      {decoded.payload?.iss && (
                        <div className={`flex justify-between border-b pb-0.5 ${isLight ? 'border-slate-200' : 'border-slate-900/40'}`}>
                          <span className={textMutedClass}>iss (Issuer):</span>
                          <span className={isLight ? 'text-slate-800' : 'text-slate-300'}>{decoded.payload.iss}</span>
                        </div>
                      )}
                      {decoded.payload?.iat && (
                        <div className={`flex justify-between border-b pb-0.5 ${isLight ? 'border-slate-200' : 'border-slate-900/40'}`}>
                          <span className={textMutedClass}>iat (Issued At):</span>
                          <span className={isLight ? 'text-slate-800' : 'text-slate-300'}>{formatEpoch(decoded.payload.iat)}</span>
                        </div>
                      )}
                      {decoded.payload?.aud && (
                        <div className={`flex justify-between border-b pb-0.5 ${isLight ? 'border-slate-200' : 'border-slate-900/40'}`}>
                          <span className={textMutedClass}>aud (Audience):</span>
                          <span className={isLight ? 'text-slate-800' : 'text-slate-300'}>{decoded.payload.aud}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-full py-20 flex flex-col items-center justify-center space-y-2">
                  <AlertCircle className="w-8 h-8 text-pink-500" />
                  <p className={`text-sm font-semibold ${isLight ? 'text-slate-800' : 'text-slate-400'}`}>Invalid JWT Signature Format</p>
                  <p className={`text-xs text-center max-w-sm font-mono leading-relaxed ${textMutedClass}`}>
                    {decoded.error}
                  </p>
                </div>
              )
            ) : (
              <div className="h-full flex flex-col items-center justify-center space-y-2">
                <Eye className={`w-8 h-8 ${isLight ? 'text-slate-300' : 'text-slate-600'}`} />
                <p className={`text-xs font-mono ${textMutedClass}`}>Awaiting JWT structure...</p>
                <p className={`text-[10px] max-w-sm text-center ${textMutedClass}`}>
                  Paste an encoded JSON Web Token in the left panel to examine algorithms, claims, and validation epochs.
                </p>
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
