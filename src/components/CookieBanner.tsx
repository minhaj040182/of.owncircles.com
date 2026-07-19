import React, { useState, useEffect } from 'react';
import { ShieldCheck, Info, X, Check, Cookie, Lock, EyeOff, Settings, Sparkles } from 'lucide-react';

interface CookieBannerProps {
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
  onOpenPrivacy?: () => void;
}

export default function CookieBanner({ theme, onOpenPrivacy }: CookieBannerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [showDetailedModal, setShowDetailedModal] = useState(false);
  const [localDataDetails, setLocalDataDetails] = useState(false);

  useEffect(() => {
    // Check if user has already accepted or reviewed
    const hasAccepted = localStorage.getItem('ownformatters-cookies-accepted');
    if (!hasAccepted) {
      // Show banner with a small delay for premium page-load pacing
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, []);

  // Listen to custom global events to let users always reopen this policy from anywhere (like the footer)
  useEffect(() => {
    const handleReopen = () => {
      setShowDetailedModal(true);
    };
    window.addEventListener('reopen-cookie-policy', handleReopen);
    return () => {
      window.removeEventListener('reopen-cookie-policy', handleReopen);
    };
  }, []);

  const handleAccept = () => {
    localStorage.setItem('ownformatters-cookies-accepted', 'true');
    setIsVisible(false);
  };

  const handleAcceptAll = () => {
    localStorage.setItem('ownformatters-cookies-accepted', 'true');
    setIsVisible(false);
    setShowDetailedModal(false);
  };

  if (!isVisible && !showDetailedModal) return null;

  const cardClass = theme?.card || 'bg-slate-900/50';
  const borderClass = theme?.border || 'border-slate-800/80';
  const textMutedClass = theme?.textMuted || 'text-slate-400';
  const isDark = theme?.isDark !== false;

  return (
    <>
      {/* Floating Bottom Toast */}
      {isVisible && !showDetailedModal && (
        <div className="fixed bottom-4 left-4 right-4 md:left-auto md:right-4 md:max-w-md z-50 animate-slide-up">
          <div className={`p-5 rounded-2xl border shadow-2xl flex flex-col gap-4 relative overflow-hidden backdrop-blur-md ${
            theme?.id === 'light' 
              ? 'bg-white/95 border-slate-200 text-slate-900 shadow-slate-200/50' 
              : 'bg-slate-900/95 border-slate-800 text-white shadow-black/80'
          }`}>
            {/* Ambient Accent Indicator */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500" />
            
            <div className="flex items-start gap-3">
              <div className={`p-2 rounded-xl flex-shrink-0 ${theme?.id === 'light' ? 'bg-indigo-50 text-indigo-600' : 'bg-indigo-500/10 text-indigo-400'}`}>
                <Cookie className="w-5 h-5 animate-spin-slow" />
              </div>
              <div className="space-y-1 text-left">
                <p className="text-xs font-bold flex items-center gap-1.5">
                  Local-Only Preferences & Privacy
                </p>
                <p className={`text-[11px] leading-relaxed ${textMutedClass}`}>
                  This suite operates 100% serverless. We store <strong>no</strong> tracking or analytical cookies. The browser only saves functional, non-tracking parameters (your theme, active tools, and bookmark preferences) strictly on your device.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between gap-3 border-t pt-3 border-slate-800/20">
              <button
                onClick={() => setShowDetailedModal(true)}
                className={`text-[10px] font-mono hover:underline cursor-pointer ${textMutedClass}`}
              >
                Inspect Policy & Storage
              </button>
              
              <div className="flex items-center gap-2">
                <button
                  onClick={handleAccept}
                  className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold transition shadow-md shadow-indigo-500/10 cursor-pointer"
                >
                  Accept & Save
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Comprehensive Cookie & Storage Modal (Can be triggered via banner or footer link) */}
      {showDetailedModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className={`w-full max-w-lg p-6 rounded-2xl border ${
            theme?.id === 'light' ? 'bg-white border-slate-200 text-slate-900' : 'bg-slate-900 border-slate-800 text-white'
          } shadow-2xl relative space-y-5 overflow-hidden`}>
            
            {/* Top Close Button */}
            <button 
              onClick={() => setShowDetailedModal(false)}
              className="absolute right-4 top-4 p-1.5 rounded-lg hover:bg-slate-800/20 text-slate-400 transition"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Header */}
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div className="text-left">
                <h3 className="text-sm font-black">Zero-Tracking Cookie & Storage Policy</h3>
                <p className="text-[11px] text-slate-400">OwnFormatters Privacy Statement & Active States</p>
              </div>
            </div>

            {/* Explanatory Statement */}
            <div className={`p-4 rounded-xl border space-y-2.5 text-xs text-left leading-relaxed ${
              theme?.id === 'light' ? 'bg-slate-50 border-slate-250 text-slate-700' : 'bg-slate-950/80 border-slate-800/80 text-slate-300'
            }`}>
              <div className="flex items-center gap-1.5 text-indigo-400 font-bold">
                <Lock className="w-4 h-4" />
                <span>100% Client-Side Integrity</span>
              </div>
              <p className="text-[11px]">
                To maintain absolute speed and security, <strong>no code, API keys, parameters, or logs</strong> that you input into our tools are ever transmitted to our server or any third-party system. 
              </p>
              <p className="text-[11px]">
                We do not integrate Google Analytics, Hotjar, Facebook Pixels, or any analytical tracking scripts.
              </p>
            </div>

            {/* Interactive breakdown */}
            <div className="space-y-2.5">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-left">What we store vs. What we never store</p>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* Store column */}
                <div className={`p-3 rounded-xl border ${theme?.id === 'light' ? 'bg-emerald-50/50 border-emerald-100' : 'bg-emerald-500/5 border-emerald-500/15'}`}>
                  <p className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 mb-1.5">
                    <Check className="w-3.5 h-3.5" />
                    <span>Essential Settings</span>
                  </p>
                  <ul className="text-[10px] space-y-1 text-slate-400 list-disc list-inside">
                    <li>Active Theme (Light/Dark)</li>
                    <li>Bookmark popup preference</li>
                    <li>Last tool selected for recovery</li>
                    <li>Active format settings</li>
                  </ul>
                </div>

                {/* Never store column */}
                <div className={`p-3 rounded-xl border ${theme?.id === 'light' ? 'bg-red-50/50 border-red-100' : 'bg-rose-500/5 border-rose-500/15'}`}>
                  <p className="text-xs font-bold text-rose-400 flex items-center gap-1.5 mb-1.5">
                    <EyeOff className="w-3.5 h-3.5" />
                    <span>Zero Tracking Data</span>
                  </p>
                  <ul className="text-[10px] space-y-1 text-slate-400 list-disc list-inside">
                    <li>No formatted text inputs</li>
                    <li>No API Keys or JWT tokens</li>
                    <li>No demographic tracking</li>
                    <li>No IP logging or session logs</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Inspect Active values */}
            <div className={`p-3 rounded-xl border text-[11px] ${
              theme?.id === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/40 border-slate-800/50'
            }`}>
              <button 
                onClick={() => setLocalDataDetails(!localDataDetails)}
                className="w-full flex items-center justify-between text-left font-bold text-slate-400 text-[10px] hover:text-white transition"
              >
                <span>INSPECT YOUR LOCAL STORAGE (ACTIVE VALUES)</span>
                <span>{localDataDetails ? '▲ Hide' : '▼ Inspect'}</span>
              </button>

              {localDataDetails && (
                <div className="mt-2 pt-2 border-t border-slate-800/40 space-y-1.5 font-mono text-[9px] text-slate-500 text-left max-h-[100px] overflow-y-auto">
                  <div>
                    <span className="text-indigo-400">themeKey:</span> {localStorage.getItem('ownformatters-theme') || '"dark_slate"'}
                  </div>
                  <div>
                    <span className="text-indigo-400">cookieAccepted:</span> {localStorage.getItem('ownformatters-cookies-accepted') || '"false"'}
                  </div>
                  <div>
                    <span className="text-indigo-400">bookmarkDismissed:</span> {localStorage.getItem('ownformatters-bookmark-dismissed') || '"false"'}
                  </div>
                </div>
              )}
            </div>

            {/* Action buttons */}
            <div className="flex gap-2.5 pt-1">
              <button
                onClick={() => {
                  if (onOpenPrivacy) onOpenPrivacy();
                  setShowDetailedModal(false);
                }}
                className={`w-1/2 py-2.5 rounded-xl text-xs font-bold transition cursor-pointer text-center ${
                  theme?.id === 'light' ? 'bg-slate-100 hover:bg-slate-250 text-slate-700' : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                }`}
              >
                Privacy Policy
              </button>

              <button
                onClick={handleAcceptAll}
                className="w-1/2 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition shadow-lg shadow-indigo-500/20 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Agree & Save</span>
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
