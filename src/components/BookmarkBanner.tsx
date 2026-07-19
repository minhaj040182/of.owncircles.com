import React, { useState, useEffect } from 'react';
import { Bookmark, Home, X, Check, Laptop, HelpCircle, ArrowRight, Star, ExternalLink, Info } from 'lucide-react';

interface BookmarkBannerProps {
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

export default function BookmarkBanner({ theme }: BookmarkBannerProps) {
  const [isVisible, setIsVisible] = useState(false);
  const [showInstructions, setShowInstructions] = useState<'bookmark' | 'homepage' | null>(null);
  const [isMac, setIsMac] = useState(false);
  const [browser, setBrowser] = useState('Chrome');
  const [dragHover, setDragHover] = useState(false);

  useEffect(() => {
    // Check if user has opted out
    const isDismissed = localStorage.getItem('ownformatters-bookmark-dismissed');
    if (!isDismissed) {
      // Show banner after 2 seconds for a non-intrusive premium feel
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, []);

  useEffect(() => {
    // Detect OS & Browser for precise instructions
    if (typeof window !== 'undefined') {
      const ua = window.navigator.userAgent;
      setIsMac(/Macintosh|MacIntel|MacPPC|Mac68K|iPad|iPhone|iPod/.test(ua));
      
      if (/Chrome/.test(ua) && !/Chromium|Edge|OPR/.test(ua)) {
        setBrowser('Chrome');
      } else if (/Safari/.test(ua) && !/Chrome/.test(ua)) {
        setBrowser('Safari');
      } else if (/Firefox/.test(ua)) {
        setBrowser('Firefox');
      } else if (/Edge/.test(ua)) {
        setBrowser('Edge');
      }
    }
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    localStorage.setItem('ownformatters-bookmark-dismissed', 'true');
  };

  const triggerBookmark = () => {
    // Try browser-specific bookmark trigger (mostly deprecated but nice fallback)
    try {
      const url = window.location.href;
      const title = document.title || 'OwnFormatters - Developer Utility Suite';

      const win = window as any;
      if (win.sidebar && win.sidebar.addPanel) {
        // Firefox legacy
        win.sidebar.addPanel(title, url, '');
      } else if (win.external && ('AddFavorite' in win.external)) {
        // IE legacy
        win.external.AddFavorite(url, title);
      } else {
        // For modern secure browsers, show instructions modal
        setShowInstructions('bookmark');
      }
    } catch (e) {
      setShowInstructions('bookmark');
    }
  };

  const triggerHomepage = () => {
    setShowInstructions('homepage');
  };

  if (!isVisible) return null;

  const cardClass = theme?.card || 'bg-slate-900/50';
  const borderClass = theme?.border || 'border-slate-800/80';
  const textMutedClass = theme?.textMuted || 'text-slate-400';

  return (
    <>
      {/* Top Banner Alert */}
      <div className={`w-full ${theme?.id === 'light' ? 'bg-indigo-50 border-b border-indigo-100' : 'bg-indigo-950/20 border-b border-indigo-500/20'} transition-all`}>
        <div className="max-w-7xl mx-auto px-4 lg:px-6 py-3.5 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`p-2 rounded-xl ${theme?.id === 'light' ? 'bg-indigo-100 text-indigo-700' : 'bg-indigo-500/10 text-indigo-400'} flex-shrink-0`}>
              <Star className="w-4 h-4 animate-pulse" />
            </div>
            <div className="text-left">
              <p className="text-xs font-bold flex items-center gap-1.5">
                Quick Access Preset
                <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${theme?.id === 'light' ? 'bg-indigo-100 text-indigo-800' : 'bg-indigo-500/20 text-indigo-300'}`}>
                  New
                </span>
              </p>
              <p className={`text-[11px] ${textMutedClass} mt-0.5`}>
                Add <strong>OwnFormatters</strong> to your Bookmarks or set as Homepage for instant, secure offline developer utilities.
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 self-end md:self-auto">
            <button
              onClick={triggerBookmark}
              className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition shadow-sm cursor-pointer"
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Bookmark Site</span>
            </button>

            <button
              onClick={triggerHomepage}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 border transition cursor-pointer ${
                theme?.id === 'light' 
                  ? 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50' 
                  : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-800/80'
              }`}
            >
              <Home className="w-3.5 h-3.5" />
              <span>Make Homepage</span>
            </button>

            <button
              onClick={handleDismiss}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer ${
                theme?.id === 'light'
                  ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
              }`}
            >
              No, thanks
            </button>

            <button
              onClick={handleDismiss}
              className={`p-1.5 rounded-lg border transition cursor-pointer ${
                theme?.id === 'light'
                  ? 'border-transparent hover:bg-slate-100 text-slate-500'
                  : 'border-transparent hover:bg-slate-800/60 text-slate-400'
              }`}
              title="Never show again"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Instructions Backdrop Modal */}
      {showInstructions && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className={`w-full max-w-md p-6 rounded-2xl border ${theme?.id === 'light' ? 'bg-white border-slate-200 shadow-2xl text-slate-950' : 'bg-slate-900 border-slate-800 shadow-2xl text-white'} relative space-y-5`}>
            
            <button 
              onClick={() => setShowInstructions(null)}
              className="absolute right-4 top-4 p-1.5 rounded-lg hover:bg-slate-800/40 text-slate-400 transition"
            >
              <X className="w-4 h-4" />
            </button>

            {/* Bookmark Mode */}
            {showInstructions === 'bookmark' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-indigo-500/10 text-indigo-400">
                    <Bookmark className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black">How to Bookmark</h3>
                    <p className="text-[11px] text-slate-400">Simple 1-second keyboard shortcut</p>
                  </div>
                </div>

                <div className={`p-4 rounded-xl border ${theme?.id === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'} text-center space-y-3`}>
                  <p className="text-xs text-slate-300">Press the following keys on your keyboard:</p>
                  <div className="flex items-center justify-center gap-2">
                    <kbd className={`px-3 py-1.5 rounded-lg border text-xs font-bold font-mono shadow-sm ${
                      theme?.id === 'light' ? 'bg-white border-slate-300 text-slate-700' : 'bg-slate-900 border-slate-700 text-slate-200'
                    }`}>
                      {isMac ? '⌘ Cmd' : 'Ctrl'}
                    </kbd>
                    <span className="text-xs font-bold text-slate-400">+</span>
                    <kbd className={`px-3 py-1.5 rounded-lg border text-xs font-bold font-mono shadow-sm ${
                      theme?.id === 'light' ? 'bg-white border-slate-300 text-slate-700' : 'bg-slate-900 border-slate-700 text-slate-200'
                    }`}>
                      D
                    </kbd>
                  </div>
                  <p className="text-[10px] text-slate-500">
                    This adds a bookmark for quick offline developer helper.
                  </p>
                </div>

                <div className="space-y-2 text-xs">
                  <p className="font-bold flex items-center gap-1.5 text-slate-300">
                    <Info className="w-3.5 h-3.5 text-indigo-400" />
                    Mobile Devices:
                  </p>
                  <ul className="list-disc list-inside space-y-1 text-[11px] text-slate-400 pl-1">
                    <li><strong>Safari:</strong> Tap the Share button (<span className="text-indigo-400 font-bold">↑</span>) then choose "Add Bookmark" or "Add to Home Screen".</li>
                    <li><strong>Chrome:</strong> Tap the menu button (<span className="text-indigo-400 font-bold">⋮</span>) near the URL bar then tap the star icon (★).</li>
                  </ul>
                </div>
              </div>
            )}

            {/* Homepage Mode */}
            {showInstructions === 'homepage' && (
              <div className="space-y-4">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400">
                    <Home className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-black">Set as Homepage</h3>
                    <p className="text-[11px] text-slate-400">Make OwnFormatters your default hub</p>
                  </div>
                </div>

                {/* Option 1: Drag & Drop (Firefox/Chrome/Edge) */}
                <div className={`p-4 rounded-xl border ${
                  dragHover ? 'border-indigo-500 bg-indigo-500/5' : theme?.id === 'light' ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-800'
                } text-center space-y-2.5 transition`}>
                  <p className="text-xs font-bold text-slate-300">Interactive Shortcut (IE/Firefox/Chrome):</p>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Drag the house icon below directly to your browser's <strong>Home (🏠)</strong> button to set as home page instantly:
                  </p>
                  
                  <div className="py-2">
                    <a
                      href="https://ownformatters.com"
                      draggable="true"
                      onDragStart={() => setDragHover(true)}
                      onDragEnd={() => setDragHover(false)}
                      className="inline-flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black shadow-lg shadow-indigo-500/20 cursor-grab active:cursor-grabbing select-none"
                    >
                      <Home className="w-4 h-4" />
                      <span>Drag Me to Home (🏠)</span>
                    </a>
                  </div>
                </div>

                {/* Option 2: Browser Manual Settings Guide */}
                <div className="space-y-2.5 text-xs">
                  <p className="font-bold text-slate-300 flex items-center gap-1.5">
                    <Laptop className="w-3.5 h-3.5 text-emerald-400" />
                    How to configure manually in {browser}:
                  </p>

                  <div className={`p-3 rounded-xl ${theme?.id === 'light' ? 'bg-slate-100 text-slate-700' : 'bg-slate-950 text-slate-400'} text-[11px] leading-relaxed space-y-1.5`}>
                    {browser === 'Chrome' && (
                      <>
                        <p>1. Open Chrome settings (<strong className="text-slate-200">⋮</strong>) &rarr; <strong>Settings</strong>.</p>
                        <p>2. Select <strong>Appearance</strong> on the sidebar.</p>
                        <p>3. Toggle <strong>Show Home button</strong> and select "Enter custom web address" and paste <code className="text-slate-200 bg-slate-900 px-1 py-0.5 rounded font-mono select-all">https://ownformatters.com</code></p>
                      </>
                    )}
                    {browser === 'Safari' && (
                      <>
                        <p>1. Open Safari &rarr; <strong>Preferences</strong> (or <kbd className="font-mono">⌘,</kbd>).</p>
                        <p>2. In <strong>General</strong>, look for the <strong>Homepage</strong> field.</p>
                        <p>3. Click <strong>Set to Current Page</strong> or enter <code className="text-slate-200 bg-slate-900 px-1 py-0.5 rounded font-mono select-all">https://ownformatters.com</code></p>
                      </>
                    )}
                    {browser === 'Firefox' && (
                      <>
                        <p>1. Open Firefox &rarr; <strong>Settings</strong>.</p>
                        <p>2. Go to <strong>Home</strong> on the left panel.</p>
                        <p>3. Set "Homepage and new windows" to <strong>Custom URLs</strong> and enter <code className="text-slate-200 bg-slate-900 px-1 py-0.5 rounded font-mono select-all">https://ownformatters.com</code></p>
                      </>
                    )}
                    {browser !== 'Chrome' && browser !== 'Safari' && browser !== 'Firefox' && (
                      <>
                        <p>1. Open your browser settings menu.</p>
                        <p>2. Search for <strong>Homepage</strong> or <strong>Home button</strong> settings.</p>
                        <p>3. Set the home URL option to <code className="text-slate-200 bg-slate-900 px-1 py-0.5 rounded font-mono select-all">https://ownformatters.com</code></p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Done Button */}
            <div className="flex gap-2.5">
              <button
                onClick={() => {
                  setShowInstructions(null);
                  handleDismiss();
                }}
                className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-md shadow-emerald-500/10 cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Check className="w-3.5 h-3.5" />
                <span>Mark as Setup & Save Preference</span>
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
