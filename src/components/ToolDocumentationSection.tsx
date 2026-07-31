import React, { useEffect, useState } from 'react';
import { 
  BookOpen, 
  HelpCircle, 
  ShieldCheck, 
  CheckCircle2, 
  ChevronDown, 
  ChevronUp, 
  Code2, 
  FileText, 
  Sparkles,
  Lock,
  Zap,
  Copy,
  Check
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

  if (toolId === 'home' || ['privacy', 'terms', 'about', 'education'].includes(toolId)) {
    return null;
  }

  const topicData = getEducationTopic(toolId, toolId.toUpperCase(), 'utility');
  if (!topicData) return null;
  const isLight = themeKey === 'light';

  // Inject dynamic JSON-LD FAQPage & WebApplication Schema markup for search engines and AdSense review crawlers
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
      className={`mt-10 border rounded-2xl p-6 sm:p-8 space-y-8 shadow-xl transition-all duration-300 ${cardBg} ${borderClass}`}
      aria-label={`${topicData.title} Technical Specifications and Guide`}
    >
      {/* Header Badge & Section Title */}
      <div className={`border-b ${isLight ? 'border-slate-200' : 'border-slate-800'} pb-5 space-y-2`}>
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 text-[11px] font-mono font-bold rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Developer Guide & Specifications</span>
          </div>
          <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded-full flex items-center gap-1">
            <Lock className="w-2.5 h-2.5" />
            100% Client-Side Processing
          </span>
        </div>

        <h3 className={`text-xl sm:text-2xl font-black tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
          Understanding {topicData.title}
        </h3>
        <p className={`text-xs leading-relaxed ${textMutedClass}`}>
          Comprehensive developer manual, technical specifications, best practices, and troubleshooting guidelines for {topicData.title}.
        </p>
      </div>

      {/* Main Grid: Overview & Usage */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 text-xs leading-relaxed">
        
        {/* Left Column: Definition & Best Practices */}
        <div className="space-y-6">
          <div className="space-y-2.5">
            <h4 className={`text-sm font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
              <Zap className="w-4 h-4 text-indigo-400" />
              What is {topicData.title}?
            </h4>
            <p className={textMutedClass}>
              {topicData.definition}
            </p>
          </div>

          <div className="space-y-3">
            <h4 className={`text-sm font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Primary Industry Use Cases:
            </h4>
            <ul className="space-y-2">
              {topicData.useCases.map((useCase, idx) => (
                <li key={idx} className={`flex items-start gap-2.5 p-2 rounded-lg border ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/40 border-slate-800/60'}`}>
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                  <span className={textMutedClass}>{useCase}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="space-y-3">
            <h4 className={`text-sm font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              Developer Best Practices:
            </h4>
            <ul className="space-y-2">
              {topicData.bestPractices.map((practice, idx) => (
                <li key={idx} className={`flex items-start gap-2.5 p-2 rounded-lg border ${isLight ? 'bg-amber-50/50 border-amber-100 text-slate-800' : 'bg-amber-500/5 border-amber-500/10 text-slate-300'}`}>
                  <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                  <span className="text-[11px] leading-relaxed">{practice}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Right Column: Code Example & Interactive FAQ */}
        <div className="space-y-6">
          
          {/* Reference Syntax Example */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <h4 className={`text-sm font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
                <Code2 className="w-4 h-4 text-cyan-400" />
                {topicData.exampleLabel}
              </h4>
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
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>

            <div className={`p-4 rounded-xl border font-mono text-[11px] overflow-x-auto max-h-64 shadow-inner ${inputBgClass} ${borderClass}`}>
              <pre className={isLight ? 'text-slate-800' : 'text-indigo-300'}>
                <code>{topicData.exampleCode}</code>
              </pre>
            </div>
          </div>

          {/* Frequently Asked Questions Accordion */}
          <div className="space-y-3">
            <h4 className={`text-sm font-bold flex items-center gap-2 ${isLight ? 'text-slate-900' : 'text-white'}`}>
              <HelpCircle className="w-4 h-4 text-violet-400" />
              Frequently Asked Questions (FAQs):
            </h4>

            <div className="space-y-2">
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

      </div>

      {/* AdSense Transparency & Data Governance Statement Footer */}
      <div className={`pt-4 border-t ${isLight ? 'border-slate-200' : 'border-slate-800'} flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px]`}>
        <div className="flex items-center gap-2 text-slate-400">
          <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
          <span>
            <strong>Data Governance Pledge:</strong> OwnFormatters runs 100% locally in your browser memory. No inputs are collected, logged, or sent to server clouds.
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
          View Privacy & Ad Policy →
        </a>
      </div>
    </section>
  );
};
