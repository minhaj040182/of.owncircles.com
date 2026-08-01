import React, { useEffect, useState } from 'react';
import { 
  BookOpen, 
  HelpCircle, 
  ShieldCheck, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  Code2, 
  Lock,
  Zap,
  Copy,
  Check,
  AlertTriangle,
  Compass,
  FileCode2
} from 'lucide-react';
import { getEducationTopic } from '../data/educationContent';
import { ToolId } from '../types';

interface ToolDocumentationSectionProps {
  toolId: ToolId;
  theme?: any;
  themeKey?: string;
}

export const ToolDocumentationSection: React.FC<ToolDocumentationSectionProps> = ({ 
  toolId, 
  theme, 
  themeKey = 'obsidian' 
}) => {
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  if (toolId === 'home' || ['privacy', 'terms', 'about', 'education', 'ads_txt', 'robots_txt', 'sitemap_xml', 'indexnow', 'indexnow_key'].includes(toolId)) {
    return null;
  }

  const topicData = getEducationTopic(toolId, toolId.toUpperCase(), 'utility');
  if (!topicData) return null;
  const isLight = themeKey === 'light';

  // Inject dynamic JSON-LD FAQPage & WebApplication Schema markup for search engines and Bing/Google crawlers
  useEffect(() => {
    if (!topicData) return;

    const faqSchema = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": topicData.faqs.map(faq => ({
        "@type": "Question",
        "name": faq.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": faq.answer
        }
      }))
    };

    let faqScript = document.querySelector('script[data-schema="faq-page"]');
    if (!faqScript) {
      faqScript = document.createElement('script');
      faqScript.setAttribute('type', 'application/ld+json');
      faqScript.setAttribute('data-schema', 'faq-page');
      document.head.appendChild(faqScript);
    }
    faqScript.textContent = JSON.stringify(faqSchema);

    return () => {
      const existing = document.querySelector('script[data-schema="faq-page"]');
      if (existing) existing.remove();
    };
  }, [toolId, topicData]);

  const handleCopyExample = () => {
    if (!topicData?.exampleCode) return;
    navigator.clipboard.writeText(topicData.exampleCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const cardBg = theme?.card || 'bg-slate-900/50';
  const borderClass = theme?.border || 'border-slate-800/80';
  const textMutedClass = theme?.textMuted || 'text-slate-400';
  const inputBgClass = theme?.inputBg || 'bg-slate-950';

  return (
    <section 
      className={`mt-12 border rounded-2xl p-6 sm:p-10 space-y-10 shadow-2xl transition-all duration-300 ${cardBg} ${borderClass}`}
      aria-label={`${topicData.title} Technical Specifications, Developer Manual, and FAQs`}
    >
      {/* Article Top Header */}
      <div className={`border-b ${isLight ? 'border-slate-200' : 'border-slate-800'} pb-6 space-y-3`}>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 text-[11px] font-mono font-bold rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Developer Manual & Technical Standards</span>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <Lock className="w-2.5 h-2.5" />
            100% Client-Side Processing
          </span>
        </div>

        <h2 className={`text-2xl sm:text-3xl font-black tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
          {topicData.title}
        </h2>
        <p className={`text-xs sm:text-sm leading-relaxed max-w-4xl ${textMutedClass}`}>
          {topicData.shortDesc} This technical guide provides comprehensive operational details, syntax specifications, security best practices, and troubleshooting guidelines.
        </p>
      </div>

      {/* Comprehensive Architectural Overview */}
      <div className="space-y-4">
        <h3 className={`text-lg font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
          <Zap className="w-5 h-5 text-indigo-400" />
          Architectural Definition & Operational Overview
        </h3>
        <p className={`text-xs sm:text-sm leading-relaxed ${textMutedClass}`}>
          {topicData.definition}
        </p>
        <p className={`text-xs sm:text-sm leading-relaxed ${textMutedClass}`}>
          {topicData.overviewDetailed}
        </p>
      </div>

      {/* Step-by-Step Developer Quickstart Workflow */}
      <div className="space-y-4">
        <h3 className={`text-lg font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
          <Compass className="w-5 h-5 text-cyan-400" />
          Step-by-Step Execution Workflow
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {topicData.steps.map((step, idx) => (
            <div 
              key={idx} 
              className={`p-4 rounded-xl border flex flex-col justify-between space-y-2 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/60 border-slate-800'}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  Step {idx + 1}
                </span>
                <CheckCircle2 className="w-4 h-4 text-indigo-400 opacity-60" />
              </div>
              <h4 className={`text-xs font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
                {step.title}
              </h4>
              <p className={`text-[11px] leading-relaxed ${textMutedClass}`}>
                {step.desc}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Industry Use Cases & Best Practices Side-by-Side */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-xs leading-relaxed">
        
        {/* Primary Use Cases */}
        <div className="space-y-4">
          <h3 className={`text-base font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
            <FileCode2 className="w-4 h-4 text-emerald-400" />
            Primary Industry Use Cases
          </h3>
          <ul className="space-y-2.5">
            {topicData.useCases.map((useCase, idx) => (
              <li key={idx} className={`flex items-start gap-3 p-3 rounded-xl border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/40 border-slate-800/60'}`}>
                <span className="w-2 h-2 rounded-full bg-emerald-400 mt-1.5 shrink-0" />
                <span className={isLight ? 'text-slate-800' : 'text-slate-300'}>{useCase}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Developer Best Practices */}
        <div className="space-y-4">
          <h3 className={`text-base font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
            <ShieldCheck className="w-4 h-4 text-amber-400" />
            Security & Developer Best Practices
          </h3>
          <ul className="space-y-2.5">
            {topicData.bestPractices.map((practice, idx) => (
              <li key={idx} className={`flex items-start gap-3 p-3 rounded-xl border ${isLight ? 'bg-amber-50/60 border-amber-200 text-slate-800' : 'bg-amber-500/5 border-amber-500/10 text-slate-300'}`}>
                <CheckCircle2 className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                <span className="text-[11px] leading-relaxed">{practice}</span>
              </li>
            ))}
          </ul>
        </div>

      </div>

      {/* Troubleshooting & Edge Cases */}
      {topicData.troubleshooting && topicData.troubleshooting.length > 0 && (
        <div className="space-y-4">
          <h3 className={`text-base font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
            <AlertTriangle className="w-4 h-4 text-rose-400" />
            Common Syntax Errors & Troubleshooting
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {topicData.troubleshooting.map((item, idx) => (
              <div key={idx} className={`p-3.5 rounded-xl border flex items-start gap-3 ${isLight ? 'bg-rose-50/50 border-rose-200 text-slate-800' : 'bg-rose-500/5 border-rose-500/10 text-slate-300'}`}>
                <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span className="text-[11px] leading-relaxed">{item}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Code Syntax Reference & Interactive FAQ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-xs leading-relaxed">
        
        {/* Code Example */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className={`text-base font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
              <Code2 className="w-4 h-4 text-cyan-400" />
              {topicData.exampleLabel}
            </h3>
            <button
              onClick={handleCopyExample}
              className={`p-1.5 rounded-lg border text-[10px] font-mono font-semibold flex items-center gap-1 transition-colors cursor-pointer ${
                isLight 
                  ? 'bg-slate-100 hover:bg-slate-200 border-slate-200 text-slate-700' 
                  : 'bg-slate-800 hover:bg-slate-750 border-slate-700 text-slate-300'
              }`}
              title="Copy code snippet"
            >
              {copiedCode ? (
                <>
                  <Check className="w-3 h-3 text-emerald-400" />
                  <span>Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3 h-3" />
                  <span>Copy Snippet</span>
                </>
              )}
            </button>
          </div>

          <div className={`p-4 rounded-xl border font-mono text-[11px] overflow-x-auto max-h-72 shadow-inner ${inputBgClass} ${borderClass}`}>
            <pre className={isLight ? 'text-slate-800' : 'text-indigo-300'}>
              <code>{topicData.exampleCode}</code>
            </pre>
          </div>
        </div>

        {/* FAQs */}
        <div className="space-y-3">
          <h3 className={`text-base font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
            <HelpCircle className="w-4 h-4 text-violet-400" />
            Frequently Asked Questions (FAQs)
          </h3>

          <div className="space-y-2.5">
            {topicData.faqs.map((faq, index) => {
              const isOpen = openFaqIndex === index;
              return (
                <div 
                  key={index}
                  className={`border rounded-xl transition-all overflow-hidden ${
                    isOpen 
                      ? (isLight ? 'bg-indigo-50/60 border-indigo-200' : 'bg-slate-900/80 border-indigo-500/40') 
                      : (isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950/40 border-slate-800/80')
                  }`}
                >
                  <button
                    onClick={() => setOpenFaqIndex(isOpen ? null : index)}
                    className="w-full text-left p-3.5 flex items-center justify-between gap-3 font-semibold text-xs cursor-pointer hover:opacity-90"
                  >
                    <span className={isLight ? 'text-slate-900' : 'text-white'}>
                      {faq.question}
                    </span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-indigo-400 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-500 shrink-0" />
                    )}
                  </button>

                  {isOpen && (
                    <div className={`px-3.5 pb-3.5 pt-0 text-[11px] leading-relaxed border-t mt-1 ${isLight ? 'border-indigo-100 text-slate-700' : 'border-slate-800/80 text-slate-300'}`}>
                      <p className="mt-2">{faq.answer}</p>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>

      </div>

      {/* AdSense Transparency & Data Governance Statement Footer */}
      <div className={`pt-5 border-t ${isLight ? 'border-slate-200' : 'border-slate-800'} flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px]`}>
        <div className="flex items-center gap-2 text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            <strong>Data Governance Pledge:</strong> OwnFormatters executes 100% locally in your browser memory thread. No inputs or secret keys are collected, logged, or sent to server clouds.
          </span>
        </div>
        <a
          href="/privacy"
          onClick={(e) => {
            if (!e.ctrlKey && !e.metaKey) {
              e.preventDefault();
              window.history.pushState(null, '', '/privacy');
              window.dispatchEvent(new PopStateEvent('popstate'));
            }
          }}
          className="text-indigo-400 hover:underline font-mono text-[10px] shrink-0"
        >
          View Privacy & Publisher Policy →
        </a>
      </div>
    </section>
  );
};
