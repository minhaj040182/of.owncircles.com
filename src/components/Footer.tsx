import React from 'react';
import { Sparkles, Home, Dumbbell, Utensils } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-100 border-t border-gray-200 text-slate-600 py-10 px-4 mt-16 text-xs">
      <div className="max-w-7xl mx-auto space-y-6">
        
        <div className="grid grid-cols-1 md:grid-cols-12 gap-8">
          
          {/* Brand Info */}
          <div className="md:col-span-6 space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-lg font-black text-slate-900 tracking-tight">
                Trend<span className="text-blue-600">Pulse</span>
              </span>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed max-w-sm">
              YouTube video curation for household innovations, daily exercise gear, and trending home gadgets with extracted product reviews and viewer sentiment analysis.
            </p>
          </div>

          {/* Developer Tools & Utilities */}
          <div className="md:col-span-3 space-y-2">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Developer Tools
            </h4>
            <div className="flex flex-col gap-1.5 text-xs text-slate-600">
              <a href="/base64-encoder-decoder" className="hover:text-blue-600 transition-colors flex items-center gap-1">
                Base64 Encoder / Decoder
              </a>
              <a href="/yaml-converter" className="hover:text-blue-600 transition-colors flex items-center gap-1">
                YAML &lt;&gt; JSON Converter
              </a>
              <a href="/csv-to-json" className="hover:text-blue-600 transition-colors flex items-center gap-1">
                CSV &lt;&gt; JSON Parser
              </a>
              <a href="/sitemap.xml" className="hover:text-blue-600 transition-colors flex items-center gap-1 text-slate-500">
                XML Sitemap Index
              </a>
            </div>
          </div>

          {/* Categories */}
          <div className="md:col-span-3 space-y-2">
            <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
              Categories
            </h4>
            <div className="flex flex-col gap-1.5 text-xs text-slate-600">
              <span className="flex items-center gap-1.5">
                <Home className="w-3.5 h-3.5 text-blue-600" /> Household Items
              </span>
              <span className="flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" /> Trending Home Gadgets
              </span>
              <span className="flex items-center gap-1.5">
                <Dumbbell className="w-3.5 h-3.5 text-blue-600" /> Exercise Gear
              </span>
              <span className="flex items-center gap-1.5">
                <Utensils className="w-3.5 h-3.5 text-blue-600" /> Kitchen Innovations
              </span>
            </div>
          </div>

        </div>

        {/* Amazon Associates Legal Compliance & Disclaimer */}
        <div className="pt-6 border-t border-gray-200 space-y-3">
          <div className="bg-amber-500/10 border border-amber-200/80 rounded-xl p-4 text-xs text-slate-700 leading-relaxed space-y-2">
            <p className="font-extrabold text-slate-900 flex items-center gap-1.5">
              <span>🛡️ Amazon Associates Program Legal Disclosure</span>
            </p>
            <p>
              TrendPulse is a participant in the <strong>Amazon Services LLC Associates Program</strong> and regional Amazon affiliate networks (including Amazon.in, Amazon.co.uk, Amazon.ca, Amazon.de, Amazon.com.au), an affiliate advertising program designed to provide a means for sites to earn advertising fees and sales commissions by advertising and linking to Amazon websites.
            </p>
            <p className="text-[11px] text-slate-500">
              Product pricing, promotional discounts, and stock availability displayed on this platform are updated periodically and are subject to change on Amazon at any time without prior notice.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-[11px] text-slate-500 pt-2">
            <p>
              As an Amazon Associate, TrendPulse earns from qualifying purchases made through converted affiliate links.
            </p>
            <p>
              TrendPulse © {new Date().getFullYear()} All rights reserved.
            </p>
          </div>
        </div>

      </div>
    </footer>
  );
};

