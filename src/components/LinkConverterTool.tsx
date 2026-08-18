import React, { useState } from 'react';
import { X, Link as LinkIcon, Check, Copy, Sparkles, Tag, ShieldCheck, ArrowRight } from 'lucide-react';
import { AFFILIATE_ID, convertTextWithAffiliateLinks } from '../utils/affiliate';

interface LinkConverterToolProps {
  onClose: () => void;
}

export const LinkConverterTool: React.FC<LinkConverterToolProps> = ({ onClose }) => {
  const [inputText, setInputText] = useState(
    'Check out this household vacuum link: https://www.amazon.in/s?k=sinking+fish+feed+pellets and exercise pad https://amazon.com/dp/B0BVL3K7M2'
  );
  const [copied, setCopied] = useState(false);

  const result = convertTextWithAffiliateLinks(inputText, AFFILIATE_ID);

  const handleCopy = () => {
    navigator.clipboard.writeText(result.convertedText);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-3xl overflow-hidden shadow-2xl my-auto text-slate-100">
        
        {/* Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="bg-amber-500/10 text-amber-400 p-2 rounded-xl border border-amber-500/30">
              <LinkIcon className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">
                  Amazon Affiliate Link Converter Tool
                </h2>
              </div>
              <p className="text-xs text-slate-400">
                Paste any video description or user comments to auto-rewrite all Amazon URLs to include your affiliate ID
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-5">
          {/* Stats Bar */}
          <div className="grid grid-cols-3 gap-3 text-center text-xs">
            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
              <span className="text-slate-400 block text-[11px]">Total Links Found</span>
              <strong className="text-base font-extrabold text-white">{result.linksFoundCount}</strong>
            </div>
            <div className="bg-emerald-950/40 p-3 rounded-xl border border-emerald-500/30">
              <span className="text-emerald-300 block text-[11px]">Amazon Links Converted</span>
              <strong className="text-base font-extrabold text-emerald-400">{result.amazonLinksConvertedCount}</strong>
            </div>
            <div className="bg-amber-950/40 p-3 rounded-xl border border-amber-500/30">
              <span className="text-amber-300 block text-[11px]">Affiliate ID Applied</span>
              <strong className="text-sm font-extrabold font-mono text-amber-400">{AFFILIATE_ID}</strong>
            </div>
          </div>

          {/* Input Text Area */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-300 block">
              Input Text / Raw Video Comments / Descriptions:
            </label>
            <textarea
              rows={4}
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Paste text containing amazon.com or amzn.to links here..."
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 font-mono"
            />
          </div>

          {/* Converted Output Text Area */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4" />
                Converted Output Text (All Links Tagged with {AFFILIATE_ID}):
              </label>

              <button
                onClick={handleCopy}
                disabled={!result.convertedText}
                className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg flex items-center gap-1 transition-all shadow-md"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-slate-950" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copied ? 'Copied to Clipboard!' : 'Copy Converted Text'}</span>
              </button>
            </div>

            <div className="w-full bg-slate-950 border border-emerald-500/40 rounded-xl p-3.5 text-xs text-emerald-200 font-mono min-h-[100px] break-all leading-relaxed whitespace-pre-wrap">
              {result.convertedText || <span className="text-slate-500 italic">Output will appear here...</span>}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-slate-950 px-6 py-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Amazon Affiliate Conversion Engine</span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl transition-all"
          >
            Done
          </button>
        </div>

      </div>
    </div>
  );
};
