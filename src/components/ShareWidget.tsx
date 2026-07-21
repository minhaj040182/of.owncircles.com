import React, { useState, useEffect, useRef } from 'react';
import { 
  Share2, 
  Copy, 
  Check, 
  Twitter, 
  Linkedin, 
  Facebook, 
  Send, 
  Link, 
  MessageSquare
} from 'lucide-react';

interface ShareWidgetProps {
  title: string;
  url: string;
  themeKey: string;
  theme: {
    card: string;
    border: string;
    text: string;
    textMuted: string;
    inputBg: string;
    badgeBg: string;
    activeNav?: string;
    inactiveNav?: string;
  };
  align?: 'left' | 'right' | 'center';
  label?: string;
  showIconOnly?: boolean;
}

export default function ShareWidget({ 
  title, 
  url, 
  themeKey, 
  theme, 
  align = 'right', 
  label = 'Share',
  showIconOnly = false
}: ShareWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Close when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(`Check out ${title} - OwnFormatters secure developer utility!`);

  const shareDestinations = [
    {
      name: 'X / Twitter',
      icon: <Twitter className="w-4 h-4 text-[#1DA1F2]" />,
      url: `https://twitter.com/intent/tweet?text=${encodedTitle}&url=${encodedUrl}`,
      bg: 'hover:bg-[#1DA1F2]/10'
    },
    {
      name: 'LinkedIn',
      icon: <Linkedin className="w-4 h-4 text-[#0077B5]" />,
      url: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
      bg: 'hover:bg-[#0077B5]/10'
    },
    {
      name: 'Reddit',
      icon: <span className="text-sm font-bold text-[#FF4500]">r/</span>,
      url: `https://www.reddit.com/submit?url=${encodedUrl}&title=${encodedTitle}`,
      bg: 'hover:bg-[#FF4500]/10'
    },
    {
      name: 'WhatsApp',
      icon: <MessageSquare className="w-4 h-4 text-[#25D366]" />,
      url: `https://api.whatsapp.com/send?text=${encodedTitle}%20${encodedUrl}`,
      bg: 'hover:bg-[#25D366]/10'
    },
    {
      name: 'Telegram',
      icon: <Send className="w-4 h-4 text-[#0088cc]" />,
      url: `https://t.me/share/url?url=${encodedUrl}&text=${encodedTitle}`,
      bg: 'hover:bg-[#0088cc]/10'
    },
    {
      name: 'Facebook',
      icon: <Facebook className="w-4 h-4 text-[#1877F2]" />,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
      bg: 'hover:bg-[#1877F2]/10'
    }
  ];

  const handleShareClick = (shareUrl: string) => {
    window.open(shareUrl, '_blank', 'noopener,noreferrer,width=600,height=450');
  };

  return (
    <div className="relative inline-block" ref={containerRef} id="share-widget-wrapper">
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
          isOpen
            ? 'bg-indigo-600 border-indigo-600 text-white shadow-md scale-102'
            : themeKey === 'light'
              ? 'bg-slate-50 hover:bg-slate-100 text-slate-800 border-slate-200'
              : 'bg-slate-900/60 hover:bg-slate-800/80 text-white border-slate-800/80 hover:border-indigo-500/40'
        }`}
        title={`Share ${title}`}
      >
        <Share2 className={`w-3.5 h-3.5 ${isOpen ? 'animate-pulse' : ''}`} />
        {!showIconOnly && <span>{label}</span>}
      </button>

      {/* Share Popover panel */}
      {isOpen && (
        <div 
          className={`absolute z-100 mt-2 w-72 rounded-2xl border p-4 shadow-2xl transition-all duration-200 animate-in fade-in slide-in-from-top-3 ${
            themeKey === 'light' 
              ? 'bg-white border-slate-200 text-slate-800' 
              : 'bg-[#0f172a] border-slate-800 text-white'
          } ${
            align === 'right' 
              ? 'right-0 origin-top-right' 
              : align === 'left' 
                ? 'left-0 origin-top-left' 
                : 'left-1/2 -translate-x-1/2 origin-top'
          }`}
        >
          {/* Popover Header */}
          <div className="pb-3 border-b border-slate-100 dark:border-slate-800/80 mb-3 flex items-center justify-between">
            <span className="text-[11px] uppercase font-extrabold tracking-wider text-indigo-500 font-mono">
              Share Workspace
            </span>
            <span className={`text-[10px] font-medium font-sans ${theme.textMuted} truncate max-w-[150px]`}>
              {title}
            </span>
          </div>

          {/* Social Grid */}
          <div className="grid grid-cols-2 gap-2 mb-4">
            {shareDestinations.map((dest) => (
              <button
                key={dest.name}
                onClick={() => handleShareClick(dest.url)}
                className={`flex items-center gap-2.5 p-2 rounded-xl text-xs font-medium text-left transition-all border border-transparent cursor-pointer ${
                  themeKey === 'light' 
                    ? 'hover:border-slate-100 bg-slate-50 hover:bg-slate-100/50 text-slate-700' 
                    : 'hover:border-slate-800/50 bg-slate-900/50 hover:bg-slate-900 text-slate-300'
                } ${dest.bg}`}
              >
                <div className="flex-shrink-0 w-6 h-6 rounded-lg bg-white dark:bg-slate-950 flex items-center justify-center shadow-sm">
                  {dest.icon}
                </div>
                <span className="truncate">{dest.name}</span>
              </button>
            ))}
          </div>

          {/* Copy Direct Link area */}
          <div className="space-y-1.5">
            <span className={`text-[9px] font-bold uppercase tracking-wider block font-mono ${theme.textMuted}`}>
              Direct Shareable Link
            </span>
            <div className="relative flex items-center">
              <input
                type="text"
                readOnly
                value={url}
                className={`w-full text-[10px] font-mono px-3 py-2 pr-10 border rounded-xl focus:outline-none ${
                  themeKey === 'light'
                    ? 'bg-slate-50 border-slate-200 text-slate-600'
                    : 'bg-slate-950/80 border-slate-800/80 text-slate-400'
                }`}
              />
              <button
                onClick={handleCopy}
                className={`absolute right-1.5 p-1.5 rounded-lg border transition-colors cursor-pointer ${
                  copied 
                    ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' 
                    : themeKey === 'light'
                      ? 'bg-white hover:bg-slate-100 border-slate-200 text-slate-500 hover:text-slate-700'
                      : 'bg-slate-900 hover:bg-slate-850 border-slate-800 text-slate-400 hover:text-white'
                }`}
                title="Copy Link to Clipboard"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
            {copied && (
              <span className="text-[10px] text-emerald-400 font-semibold flex items-center gap-1 animate-pulse justify-end">
                <Check className="w-3 h-3" />
                <span>Copied successfully!</span>
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
