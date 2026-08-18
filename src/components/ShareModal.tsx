import React, { useState } from 'react';
import { X, Copy, Check, Share2, Send, Mail, MessageCircle } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  url: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, title, url }) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const shareText = `Check out this product review: ${title}`;
  const shareUrl = url || window.location.href;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(shareUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const socialLinks = [
    {
      name: 'WhatsApp',
      icon: MessageCircle,
      bgColor: 'bg-emerald-500 hover:bg-emerald-600',
      textColor: 'text-white',
      shareUrl: `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`
    },
    {
      name: 'Facebook',
      icon: (props: any) => (
        <svg className={props.className} fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      ),
      bgColor: 'bg-blue-600 hover:bg-blue-700',
      textColor: 'text-white',
      shareUrl: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`
    },
    {
      name: 'X (Twitter)',
      icon: (props: any) => (
        <svg className={props.className} fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      ),
      bgColor: 'bg-slate-900 hover:bg-black',
      textColor: 'text-white',
      shareUrl: `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`
    },
    {
      name: 'LinkedIn',
      icon: (props: any) => (
        <svg className={props.className} fill="currentColor" viewBox="0 0 24 24">
          <path d="M19 3a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h14m-.5 15.5v-5.3a3.26 3.26 0 0 0-3.26-3.26c-.85 0-1.84.52-2.28 1.3v-1.11h-2.79v8.37h2.79v-4.93c0-.77.62-1.4 1.39-1.4a1.4 1.4 0 0 1 1.4 1.4v4.93h2.75M6.88 8.56a1.68 1.68 0 0 0 1.68-1.68c0-.93-.75-1.69-1.68-1.69a1.69 1.69 0 0 0-1.69 1.69c0 .93.76 1.68 1.69 1.68m1.39 9.94v-8.37H5.5v8.37h2.77z"/>
        </svg>
      ),
      bgColor: 'bg-blue-700 hover:bg-blue-800',
      textColor: 'text-white',
      shareUrl: `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`
    },
    {
      name: 'Reddit',
      icon: (props: any) => (
        <svg className={props.className} fill="currentColor" viewBox="0 0 24 24">
          <path d="M12 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0zm5.01 4.744c.688 0 1.25.561 1.25 1.249a1.25 1.25 0 0 1-2.498.056l-2.597-.547-.8 3.747c1.824.07 3.48.632 4.674 1.488.308-.309.73-.491 1.207-.491.968 0 1.754.786 1.754 1.754 0 .716-.435 1.333-1.01 1.614a3.111 3.111 0 0 1 .042.52c0 2.694-3.13 4.87-7.004 4.87-3.874 0-7.004-2.176-7.004-4.87 0-.183.015-.366.043-.534A1.748 1.748 0 0 1 4.028 12c0-.968.786-1.754 1.754-1.754.463 0 .898.196 1.207.49 1.207-.883 2.878-1.43 4.744-1.487l.885-4.182a.342.342 0 0 1 .14-.197.35.35 0 0 1 .238-.042l2.906.617a1.214 1.214 0 0 1 1.108-.701z"/>
        </svg>
      ),
      bgColor: 'bg-orange-600 hover:bg-orange-700',
      textColor: 'text-white',
      shareUrl: `https://www.reddit.com/submit?url=${encodeURIComponent(shareUrl)}&title=${encodeURIComponent(title)}`
    },
    {
      name: 'Telegram',
      icon: Send,
      bgColor: 'bg-sky-500 hover:bg-sky-600',
      textColor: 'text-white',
      shareUrl: `https://t.me/share/url?url=${encodeURIComponent(shareUrl)}&text=${encodeURIComponent(shareText)}`
    },
    {
      name: 'Email',
      icon: Mail,
      bgColor: 'bg-slate-700 hover:bg-slate-800',
      textColor: 'text-white',
      shareUrl: `mailto:?subject=${encodeURIComponent(title)}&body=${encodeURIComponent(shareText + '\n\n' + shareUrl)}`
    }
  ];

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-fadeIn"
      onClick={onClose}
    >
      <div 
        className="bg-white rounded-2xl shadow-2xl border border-gray-100 max-w-md w-full p-6 space-y-5 transform transition-all animate-scaleUp"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div className="flex items-center justify-between pb-3 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-base">Share Product Review</h3>
              <p className="text-xs text-slate-500">Select a platform or copy the link below</p>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-600 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Title Preview */}
        <div className="bg-slate-50 p-3 rounded-xl border border-gray-100 text-xs text-slate-700 font-semibold line-clamp-2">
          "{title}"
        </div>

        {/* Social Networks Grid */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
            Share to Social Network
          </label>
          <div className="grid grid-cols-4 gap-2.5">
            {socialLinks.map((item, idx) => {
              const IconComp = item.icon;
              return (
                <a
                  key={idx}
                  href={item.shareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center justify-center p-3 rounded-xl hover:bg-slate-50 border border-gray-100 transition-all hover:scale-105 active:scale-95 group text-center"
                >
                  <div className={`w-10 h-10 rounded-full ${item.bgColor} ${item.textColor} flex items-center justify-center shadow-xs mb-1.5 group-hover:shadow-md transition-all`}>
                    <IconComp className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-bold text-slate-700 group-hover:text-blue-600 truncate w-full">
                    {item.name}
                  </span>
                </a>
              );
            })}
          </div>
        </div>

        {/* Direct Link Copy Input */}
        <div className="space-y-1.5 pt-2 border-t border-gray-100">
          <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
            Or Copy Link
          </label>
          <div className="flex items-center gap-2">
            <input
              type="text"
              readOnly
              value={shareUrl}
              className="flex-1 bg-slate-100 border border-gray-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-700 focus:outline-none select-all truncate"
            />
            <button
              onClick={handleCopy}
              className={`px-4 py-2 font-bold text-xs rounded-xl transition-all flex items-center gap-1.5 shrink-0 ${
                copied 
                  ? 'bg-emerald-600 text-white shadow-xs' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white shadow-xs active:scale-95'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
