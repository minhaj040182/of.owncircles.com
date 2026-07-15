import React, { useState } from 'react';
import { HelpCircle, Mail, Send, CheckCircle2, ShieldCheck, Sparkles, User, FileText } from 'lucide-react';

interface AboutToolProps {
  theme: any;
}

export default function AboutTool({ theme }: AboutToolProps) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [subject, setSubject] = useState('Feedback');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name.trim()) {
      setError('Please provide your name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setError('Please provide a valid developer email address.');
      return;
    }
    if (!message.trim() || message.length < 10) {
      setError('Message must be at least 10 characters long.');
      return;
    }

    setIsSubmitting(true);

    // Obfuscated recipient email address: minhaj@ownformatters.com
    const recipient = atob('bWluaGFqQG93bmZvcm1hdHRlcnMuY29t');
    const mailtoUrl = `mailto:${recipient}?subject=${encodeURIComponent(subject + ' - ' + name)}&body=${encodeURIComponent(
      `Developer Inquiry from OwnFormatters\n` +
      `====================================\n\n` +
      `Sender: ${name}\n` +
      `Contact Email: ${email}\n` +
      `Category: ${subject}\n\n` +
      `Message:\n` +
      `${message}`
    )}`;

    // Programmatically trigger mail client composition securely
    try {
      const link = document.createElement('a');
      link.href = mailtoUrl;
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.click();
    } catch (err) {
      // Fallback location change if window manipulation fails inside sandboxed frames
      window.location.href = mailtoUrl;
    }

    // Simulate sending message UI completion
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSubmitted(true);
      // Clean up fields
      setName('');
      setEmail('');
      setMessage('');
    }, 1200);
  };

  const isLight = theme.isDark === false;

  return (
    <div className="space-y-8 max-w-4xl mx-auto">
      {/* 1. ABOUT US INTELLECTUAL WORKSPACE */}
      <div className={`p-6 sm:p-8 rounded-2xl ${theme.card} border ${theme.border} space-y-6 shadow-xl`}>
        <div className={`border-b ${isLight ? 'border-slate-200' : 'border-slate-800'} pb-5`}>
          <div className="inline-flex items-center gap-2 px-3 py-1 text-xs font-mono font-bold rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Developer Workbench Philosophy</span>
          </div>
          <h1 className={`text-2xl sm:text-3xl font-black tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>About OwnFormatters</h1>
          <p className={`text-xs mt-1 ${theme.textMuted}`}>
            Built by developers, for developers. An elegant, privacy-first formatting and debugging toolkit.
          </p>
        </div>

        <div className={`space-y-4 text-xs leading-relaxed ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>
          <p>
            Welcome to <strong>OwnFormatters</strong>! We are a group of independent software architects and system engineers operating under the developer banner <strong>OwnCircles</strong>. We are passionate about creating high-performance developer tools that operate without bloated scripts, tracker pollution, or data security compromises.
          </p>

          <h3 className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'} mt-4 flex items-center gap-2`}>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            Why We Engineered OwnFormatters Client-Side
          </h3>
          <p className={theme.textMuted}>
            Most formatting and beautification tools online require sending your raw text or JSON trees to remote backends. This is a severe threat to professional data governance, as developer keys, private API endpoints, passwords, and sensitive client structures are frequently copy-pasted into browser bars. 
          </p>
          <p className={theme.textMuted}>
            OwnFormatters completely reverses this architecture. <strong>All calculation engines run 100% locally in your browser thread.</strong> Your sensitive data is kept inside your client sandbox and never transmitted over the network. It represents a fully reliable offline utility workbook that meets modern enterprise security and auditing benchmarks.
          </p>
        </div>

        {/* Feature Grid */}
        <div className={`grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t ${isLight ? 'border-slate-200' : 'border-slate-800'}`}>
          <div className={`p-4 rounded-xl border space-y-1 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/60 border-slate-800'}`}>
            <h4 className={`text-xs font-bold ${isLight ? 'text-slate-900' : 'text-white'} flex items-center gap-1.5`}>
              <span className="w-2 h-2 rounded-full bg-indigo-400" />
              Sub-Millisecond Rendering
            </h4>
            <p className={`text-[11px] ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
              V8-optimized Javascript parsing algorithms ensure massive XML, JSON, and YAML files are processed in real time.
            </p>
          </div>
          <div className={`p-4 rounded-xl border space-y-1 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/60 border-slate-800'}`}>
            <h4 className={`text-xs font-bold ${isLight ? 'text-slate-900' : 'text-white'} flex items-center gap-1.5`}>
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              Responsive Design Mechanics
            </h4>
            <p className={`text-[11px] ${isLight ? 'text-slate-700' : 'text-slate-300'}`}>
              A fully fluid, beautiful, multi-theme workspace tailored for widescreen developers as well as rapid mobile utility lookup.
            </p>
          </div>
        </div>
      </div>

      {/* 2. SECURE CONTACT FORM */}
      <div className={`p-6 sm:p-8 rounded-2xl ${theme.card} border ${theme.border} space-y-6 shadow-xl`}>
        <div>
          <h2 className={`text-xl font-bold ${isLight ? 'text-slate-900' : 'text-white'} flex items-center gap-2.5`}>
            <Mail className="w-5 h-5 text-indigo-400" />
            Get In Touch / Support Center
          </h2>
          <p className={`text-xs mt-1 ${theme.textMuted}`}>
            Have a question, feature proposal, or standard compliance request? Submit your developer inquiry directly to our engineering desk.
          </p>
        </div>

        {isSubmitted ? (
          <div className={`p-6 rounded-xl ${isLight ? 'bg-emerald-50 border border-emerald-100' : 'bg-emerald-500/5 border border-emerald-500/20'} text-center space-y-3`}>
            <div className="w-12 h-12 rounded-full bg-emerald-500/10 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className={`text-sm font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>Inquiry Received Successfully</h3>
              <p className={`text-xs ${theme.textMuted}`}>
                Thank you for contacting OwnCircles! Our core developer team has cataloged your ticket and will reply via email if necessary.
              </p>
            </div>
            <button
              onClick={() => setIsSubmitted(false)}
              className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-bold text-white transition-colors cursor-pointer mt-2"
            >
              Send Another Inquiry
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-medium">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className={`text-[10px] uppercase font-bold tracking-wider ${isLight ? 'text-slate-600' : 'text-slate-400'} flex items-center gap-1.5`}>
                  <User className="w-3 h-3" /> Name
                </label>
                <input
                  type="text"
                  placeholder="e.g., Jane Doe"
                  className={`w-full ${theme.inputBg} border ${theme.border} rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-indigo-500 transition-colors ${theme.text}`}
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="space-y-1.5">
                <label className={`text-[10px] uppercase font-bold tracking-wider ${isLight ? 'text-slate-600' : 'text-slate-400'} flex items-center gap-1.5`}>
                  <Mail className="w-3 h-3" /> Developer Email
                </label>
                <input
                  type="email"
                  placeholder="e.g., dev@example.com"
                  className={`w-full ${theme.inputBg} border ${theme.border} rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-indigo-500 transition-colors ${theme.text}`}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className={`text-[10px] uppercase font-bold tracking-wider ${isLight ? 'text-slate-600' : 'text-slate-400'} flex items-center gap-1.5`}>
                <FileText className="w-3 h-3" /> Category / Subject
              </label>
              <select
                className={`w-full ${theme.inputBg} border ${theme.border} rounded-xl px-3 py-2.5 text-xs focus:outline-none focus:border-indigo-500 transition-colors ${theme.text} [&>option]:bg-slate-950 [&>option]:text-white`}
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              >
                <option value="Feedback">General Feedback</option>
                <option value="Feature">Feature Request / Proposal</option>
                <option value="Security">Security Audit Query</option>
                <option value="AdSense">AdSense Integration & Advertising</option>
                <option value="Bug">Formatting Engine Bug Report</option>
              </select>
            </div>

            <div className="space-y-1.5">
              <label className={`text-[10px] uppercase font-bold tracking-wider ${isLight ? 'text-slate-600' : 'text-slate-400'} flex items-center gap-1.5`}>
                Message Content
              </label>
              <textarea
                placeholder="Briefly detail your inquiry (minimum 10 characters)..."
                rows={4}
                className={`w-full ${theme.inputBg} border ${theme.border} rounded-xl px-3.5 py-2.5 text-xs focus:outline-none focus:border-indigo-500 transition-colors ${theme.text} resize-none`}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 active:scale-[0.98] transition-all duration-150 flex items-center justify-center gap-2 text-xs font-bold text-white cursor-pointer ${
                isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
              }`}
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin" />
                  <span>Cataloging ticket...</span>
                </>
              ) : (
                <>
                  <Send className="w-4 h-4" />
                  <span>Transmit Secure Message</span>
                </>
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
