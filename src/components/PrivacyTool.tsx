import React from 'react';
import { Shield, Eye, Lock, Globe, CheckCircle } from 'lucide-react';

interface PrivacyToolProps {
  theme: any;
}

export default function PrivacyTool({ theme }: PrivacyToolProps) {
  const isLight = theme.isDark === false;

  return (
    <div className={`p-6 sm:p-8 rounded-2xl ${theme.card} border ${theme.border} space-y-8 shadow-xl max-w-4xl mx-auto`}>
      {/* Page Header */}
      <div className={`border-b ${isLight ? 'border-slate-200' : 'border-slate-800'} pb-6`}>
        <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-mono font-bold rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-3">
          <Shield className="w-3.5 h-3.5" />
          <span>Compliance Certified</span>
        </div>
        <h1 className={`text-2xl sm:text-3xl font-black tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>Privacy Policy</h1>
        <p className={`text-xs mt-1 ${theme.textMuted} font-mono`}>
          Effective Date: July 14, 2026 | Last Updated: July 14, 2026
        </p>
      </div>

      {/* Intro Highlight Box */}
      <div className={`p-5 rounded-xl border flex gap-4 items-start ${isLight ? 'bg-emerald-50 border-emerald-100' : 'bg-emerald-500/5 border border-emerald-500/20'}`}>
        <Lock className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h3 className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>100% Client-Side Private Processing Pledge</h3>
          <p className={`text-xs leading-relaxed ${theme.textMuted}`}>
            OwnFormatters is architected to operate fully in your local browser sandbox. All text transformations, code minifications, cryptographic hashing, and formatting calculations are performed directly on your local CPU thread using client-side JavaScript. <strong>We do not transmit, collect, or store any of your raw text inputs, developer credentials, database queries, or keys on our servers.</strong>
          </p>
        </div>
      </div>

      {/* Policy Sections */}
      <div className={`space-y-6 text-xs leading-relaxed ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>
        <section className="space-y-2">
          <h2 className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'} flex items-center gap-2`}>
            <CheckCircle className="w-4 h-4 text-indigo-400" />
            1. Information We Collect
          </h2>
          <p className={theme.textMuted}>
            Since our suite of formatting utilities operates purely client-side, we do not require user registrations, logins, or server-side account creations. We collect information only in the following limited ways:
          </p>
          <ul className={`list-disc list-inside pl-4 space-y-1.5 ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>
            <li><strong>Browser Storage:</strong> We use your local browser storage (<code className={`font-mono px-1 py-0.5 rounded text-[10px] ${isLight ? 'bg-slate-100 text-slate-800 border border-slate-200' : 'bg-slate-900 text-white'}`}>localStorage</code>) solely to preserve your active user preferences, such as selected UI color themes, so that your developer environment remains customized upon refresh.</li>
            <li><strong>Standard Web Log Files:</strong> Like most online publishers, we collect server-level logs consisting of anonymous details (including IP addresses, browser specifications, Internet Service Providers, referral origins, and date stamps) purely for statistical maintenance, security logging, and bandwidth optimization. This data cannot be traced back to personal developer identities.</li>
          </ul>
        </section>

        <section className={`space-y-2 border-t ${isLight ? 'border-slate-200' : 'border-slate-800'} pt-6`}>
          <h2 className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'} flex items-center gap-2`}>
            <Globe className="w-4 h-4 text-emerald-400" />
            2. Google AdSense & DoubleClick DART Cookies
          </h2>
          <p className={theme.textMuted}>
            Google, as a third-party advertising vendor, uses cookies to serve targeted advertisements on our website.
          </p>
          <ul className={`list-disc list-inside pl-4 space-y-1.5 ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>
            <li>Google's use of the DoubleClick DART cookie enables it to serve relevant interest-based ads to visitors based on their visit history to this and other websites across the Internet.</li>
            <li>Users may opt-out of the use of the DoubleClick DART cookie and manage personal advertising profiles by visiting the Google Ad and Content Network privacy policy at the following URL: <a href="https://policies.google.com/technologies/ads" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline font-mono">https://policies.google.com/technologies/ads</a></li>
          </ul>
        </section>

        <section className={`space-y-2 border-t ${isLight ? 'border-slate-200' : 'border-slate-800'} pt-6`}>
          <h2 className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'} flex items-center gap-2`}>
            <Eye className="w-4 h-4 text-cyan-400" />
            3. Third-Party Advertising Vendors
          </h2>
          <p className={theme.textMuted}>
            We may use third-party advertising companies to serve display ads when you visit our website. These companies may use cookies, web beacons, or persistent local storage to collect non-personal navigation patterns on this site to serve appropriate ads about developer goods and services. You may adjust your web browser settings to reject cookie footprints or alert you when cookies are sent.
          </p>
        </section>

        <section className={`space-y-2 border-t ${isLight ? 'border-slate-200' : 'border-slate-800'} pt-6`}>
          <h2 className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'} flex items-center gap-2`}>
            <Lock className="w-4 h-4 text-violet-400" />
            4. Enterprise Cryptographic Sandbox Security
          </h2>
          <p className={theme.textMuted}>
            We implement strict Content Security Policies (CSP) to guarantee that none of the user's interactive data can be leaked via cross-site requests. All cryptographic tools leverage standard browser native cryptography primitives (<code className={`font-mono px-1 py-0.5 rounded text-[10px] ${isLight ? 'bg-slate-100 text-slate-800 border border-slate-200' : 'bg-slate-900 text-white'}`}>crypto.subtle</code> WebCrypto interfaces) rather than unsafe custom scripts, preserving the mathematical integrity of all key generations.
          </p>
        </section>

        <section className={`space-y-2 border-t ${isLight ? 'border-slate-200' : 'border-slate-800'} pt-6`}>
          <h2 className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'} flex items-center gap-2`}>
            <Shield className="w-4 h-4 text-amber-400" />
            5. Acceptance of Terms & Contact
          </h2>
          <p className={theme.textMuted}>
            By utilizing the tools provided on OwnFormatters, you signify your compliance and acceptance of this Privacy Policy. If you have any inquiries regarding developer security protocols, privacy standards, or cookie compliance details, feel free to submit a request on our Contact Us page.
          </p>
        </section>
      </div>
    </div>
  );
}
