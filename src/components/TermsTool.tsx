import React from 'react';
import { ShieldAlert, BookOpen, AlertCircle, RefreshCw, CheckSquare } from 'lucide-react';

interface TermsToolProps {
  theme: any;
}

export default function TermsTool({ theme }: TermsToolProps) {
  const isLight = theme.isDark === false;

  return (
    <div className={`p-6 sm:p-8 rounded-2xl ${theme.card} border ${theme.border} space-y-8 shadow-xl max-w-4xl mx-auto`}>
      {/* Page Header */}
      <div className={`border-b ${isLight ? 'border-slate-200' : 'border-slate-800'} pb-6`}>
        <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-mono font-bold rounded-full bg-violet-500/10 text-violet-400 border border-violet-500/20 mb-3">
          <BookOpen className="w-3.5 h-3.5" />
          <span>Publisher Guidelines</span>
        </div>
        <h1 className={`text-2xl sm:text-3xl font-black tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>Terms of Service</h1>
        <p className={`text-xs mt-1 ${theme.textMuted} font-mono`}>
          Effective Date: July 14, 2026 | Last Updated: July 14, 2026
        </p>
      </div>

      {/* Overview Card */}
      <div className={`p-5 rounded-xl border flex gap-4 items-start ${isLight ? 'bg-violet-50 border-violet-100' : 'bg-violet-500/5 border border-violet-500/20'}`}>
        <ShieldAlert className="w-5 h-5 text-violet-400 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <h3 className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>Acceptance of Terms</h3>
          <p className={`text-xs leading-relaxed ${theme.textMuted}`}>
            Please read these Terms of Service carefully before utilizing the web utilities, cryptographic checkers, and formatters hosted on OwnFormatters. By accessing or using our developer utility suite, you agree to be bound by these Terms. If you do not agree to all terms, do not access our tools.
          </p>
        </div>
      </div>

      {/* Policy Sections */}
      <div className={`space-y-6 text-xs leading-relaxed ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>
        <section className="space-y-2">
          <h2 className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'} flex items-center gap-2`}>
            <CheckSquare className="w-4 h-4 text-indigo-400" />
            1. Scope of Service & License
          </h2>
          <p className={theme.textMuted}>
            OwnFormatters offers a fully integrated, zero-install, web-native workstation containing interactive formatters, parser engines, cryptographic generators, and network testing consoles.
          </p>
          <ul className={`list-disc list-inside pl-4 space-y-1.5 ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>
            <li><strong>Permitted Use:</strong> Developers, system architects, and engineers are granted a free, non-exclusive, revocable, and non-transferable license to utilize the suite for local personal or commercial software development workflows.</li>
            <li><strong>Restrictions:</strong> You are strictly forbidden from attempting to scrape, automate rapid requests, scrape APIs, or load the application into embedded iframes without consent.</li>
          </ul>
        </section>

        <section className={`space-y-2 border-t ${isLight ? 'border-slate-200' : 'border-slate-800'} pt-6`}>
          <h2 className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'} flex items-center gap-2`}>
            <RefreshCw className="w-4 h-4 text-emerald-400" />
            2. Local processing & Data Security
          </h2>
          <p className={theme.textMuted}>
            Our web applications run completely on standard HTML5 client technologies. While we provide robust local hashing, text diffing, and code-formatting security, you understand that:
          </p>
          <ul className={`list-disc list-inside pl-4 space-y-1.5 ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>
            <li>You remain solely responsible for validating the output compiled from these formatting tools before deploying it into production environments or real repositories.</li>
            <li>The local environment isolates processing to the memory buffer of your specific browser. The user is responsible for ensuring their terminal is free of malicious monitoring scripts or malware.</li>
          </ul>
        </section>

        <section className={`space-y-2 border-t ${isLight ? 'border-slate-200' : 'border-slate-800'} pt-6`}>
          <h2 className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'} flex items-center gap-2`}>
            <AlertCircle className="w-4 h-4 text-cyan-400" />
            3. Disclaimer of Warranties
          </h2>
          <p className={theme.textMuted}>
            The software, services, and formatting tools provided on OwnFormatters are delivered "as is" and "as available" without warranty of any kind, either express or implied. OwnFormatters and its publisher group, OwnCircles, do not warrant that:
          </p>
          <ul className={`list-disc list-inside pl-4 space-y-1.5 ${isLight ? 'text-slate-700' : 'text-slate-400'}`}>
            <li>The formatting algorithms are 100% free of bugs, parsing errors, or layout anomalies.</li>
            <li>The service will operate continuously without temporary hosting interruptions.</li>
            <li>The API testing clients or diff utilities will work perfectly with non-standard server headers.</li>
          </ul>
        </section>

        <section className={`space-y-2 border-t ${isLight ? 'border-slate-200' : 'border-slate-800'} pt-6`}>
          <h2 className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'} flex items-center gap-2`}>
            <ShieldAlert className="w-4 h-4 text-rose-400" />
            4. Limitation of Liability
          </h2>
          <p className={theme.textMuted}>
            Under no circumstances shall OwnFormatters, its publishers, developers, or affiliates be held liable for any direct, indirect, incidental, special, consequential, or punitive damages arising out of your access, use, or inability to utilize the tools. This includes but is not limited to: loss of revenue, database transaction failures, exposed API credentials, code deployment failures, or computer performance lag.
          </p>
        </section>

        <section className={`space-y-2 border-t ${isLight ? 'border-slate-200' : 'border-slate-800'} pt-6`}>
          <h2 className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'} flex items-center gap-2`}>
            <BookOpen className="w-4 h-4 text-amber-400" />
            5. Modifications to Terms
          </h2>
          <p className={theme.textMuted}>
            We reserve the right to modify, amend, or replace these Terms of Service at any time without prior individual notice. All updates will be directly reflected on this page with an adjusted "Effective Date". Your continued use of the workbench following any modifications constitutes full acknowledgement and approval.
          </p>
        </section>
      </div>
    </div>
  );
}
