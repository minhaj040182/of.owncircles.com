import React, { useState, useEffect, useMemo } from 'react';
import { 
  Copy, 
  Check, 
  Clock, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  Info, 
  ChevronDown, 
  ChevronUp, 
  ArrowRight,
  ExternalLink,
  Sliders,
  Globe,
  HelpCircle
} from 'lucide-react';
import { 
  validateCronExpression, 
  calculateNextOccurrences, 
  NextOccurrence,
  explainCronExpression 
} from '../utils/cronEngine';

interface CronToolProps {
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

interface PresetItem {
  name: string;
  expression: string;
  description: string;
}

const COMMON_PRESETS: PresetItem[] = [
  { name: 'Every Minute', expression: '* * * * *', description: 'Executes every single minute, 24/7' },
  { name: 'Every 5 Minutes', expression: '*/5 * * * *', description: 'Executes at minute 0, 5, 10, 15...' },
  { name: 'Every Hour', expression: '0 * * * *', description: 'Executes at minute 0 of every hour' },
  { name: 'Daily at Midnight', expression: '0 0 * * *', description: 'Executes at 00:00 every calendar day' },
  { name: 'Weekdays at 09:00', expression: '0 9 * * 1-5', description: 'Executes at 09:00, Monday through Friday' },
  { name: 'Monthly on 1st', expression: '0 0 1 * *', description: 'Executes at 00:00 on the 1st of every month' },
  { name: 'Sunday at Midnight', expression: '0 0 * * 0', description: 'Executes at 00:00 every Sunday' },
];

export default function CronTool({ theme }: CronToolProps) {
  const [expression, setExpression] = useState<string>('0 9 * * 1-5');
  const [copiedExpr, setCopiedExpr] = useState<boolean>(false);
  const [copiedExplanation, setCopiedExplanation] = useState<boolean>(false);
  const [copiedRuns, setCopiedRuns] = useState<boolean>(false);

  // Timezone toggle: 'local' or 'utc'
  const [timezoneMode, setTimezoneMode] = useState<'local' | 'utc'>('local');
  const [localTzName, setLocalTzName] = useState<string>('Local Time');

  // Interactive field inputs
  const [minuteInput, setMinuteInput] = useState<string>('0');
  const [hourInput, setHourInput] = useState<string>('9');
  const [domInput, setDomInput] = useState<string>('*');
  const [monthInput, setMonthInput] = useState<string>('*');
  const [dowInput, setDowInput] = useState<string>('1-5');

  // Collapsible FAQ state
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);

  const isLight = theme?.isDark === false;
  const borderClass = theme?.border || 'border-slate-800/80';
  const cardClass = theme?.card || 'bg-slate-900/50';
  const inputBgClass = theme?.inputBg || 'bg-slate-950';
  const textMutedClass = theme?.textMuted || 'text-slate-400';

  // Detect local timezone name on client
  useEffect(() => {
    try {
      const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
      if (tz) setLocalTzName(tz);
    } catch {
      setLocalTzName('Local Time');
    }
  }, []);

  // Synchronize breakdown fields when main expression changes
  useEffect(() => {
    const parts = expression.trim().split(/\s+/);
    if (parts.length === 5) {
      setMinuteInput(parts[0]);
      setHourInput(parts[1]);
      setDomInput(parts[2]);
      setMonthInput(parts[3]);
      setDowInput(parts[4]);
    }
  }, [expression]);

  // Validation and Human Readable translation
  const validation = useMemo(() => {
    return validateCronExpression(expression);
  }, [expression]);

  // Next 5 occurrences calculation
  const nextRunData = useMemo(() => {
    if (!validation.valid) {
      return { occurrences: [] as NextOccurrence[], error: validation.error };
    }
    return calculateNextOccurrences(expression, timezoneMode, 5);
  }, [expression, validation.valid, validation.error, timezoneMode]);

  const handleFieldChange = (index: number, val: string) => {
    const currentParts = expression.trim().split(/\s+/);
    while (currentParts.length < 5) currentParts.push('*');
    currentParts[index] = val.trim() || '*';
    setExpression(currentParts.join(' '));
  };

  const handleCopyExpression = () => {
    navigator.clipboard.writeText(expression.trim());
    setCopiedExpr(true);
    setTimeout(() => setCopiedExpr(false), 2000);
  };

  const handleCopyExplanation = () => {
    if (validation.explanation) {
      navigator.clipboard.writeText(validation.explanation);
      setCopiedExplanation(true);
      setTimeout(() => setCopiedExplanation(false), 2000);
    }
  };

  const handleCopyRuns = () => {
    if (nextRunData.occurrences.length > 0) {
      const text = nextRunData.occurrences.map(o => o.formatted).join('\n');
      navigator.clipboard.writeText(text);
      setCopiedRuns(true);
      setTimeout(() => setCopiedRuns(false), 2000);
    }
  };

  const toggleFaq = (idx: number) => {
    setOpenFaqIndex(prev => (prev === idx ? null : idx));
  };

  return (
    <div className="space-y-8 w-full max-w-6xl mx-auto" id="cron-tool-container">
      
      {/* TOOL FIRST: WORKSPACE AREA */}
      <div className={`border rounded-2xl p-4 sm:p-7 shadow-xl space-y-6 ${cardClass} ${borderClass}`}>
        
        {/* Quick Presets Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className={`text-[11px] font-mono font-bold uppercase tracking-wider ${textMutedClass} flex items-center gap-1.5`}>
              <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
              Common Cron Presets:
            </span>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
              Standard 5-Field Crontab
            </span>
          </div>

          <div className="flex flex-wrap gap-1.5 sm:gap-2">
            {COMMON_PRESETS.map((p) => {
              const isActive = expression.trim() === p.expression;
              return (
                <button
                  key={p.name}
                  onClick={() => setExpression(p.expression)}
                  className={`text-xs px-2.5 py-1.5 rounded-lg border font-mono transition-all cursor-pointer ${
                    isActive
                      ? isLight
                        ? 'bg-indigo-600 text-white border-indigo-700 shadow-sm font-semibold'
                        : 'bg-indigo-600 text-white border-indigo-500 shadow-sm font-semibold'
                      : isLight
                      ? 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                      : 'bg-slate-900/80 hover:bg-slate-800 text-slate-300 border-slate-800'
                  }`}
                  title={`${p.name}: ${p.description}`}
                >
                  {p.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Unified Cron Expression Input */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor="cron-main-input" className={`text-xs font-bold font-mono uppercase tracking-wider ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
              Cron Schedule Expression
            </label>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyExpression}
                className={`text-xs font-mono px-2.5 py-1 rounded-md border flex items-center gap-1.5 transition-all cursor-pointer ${
                  copiedExpr 
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' 
                    : isLight 
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200' 
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
                }`}
                title="Copy cron expression to clipboard"
                aria-label="Copy cron expression"
              >
                {copiedExpr ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedExpr ? 'Copied' : 'Copy'}</span>
              </button>
            </div>
          </div>

          <div className="relative">
            <input
              id="cron-main-input"
              type="text"
              value={expression}
              onChange={(e) => setExpression(e.target.value)}
              placeholder="e.g. 0 9 * * 1-5"
              spellCheck={false}
              autoComplete="off"
              className={`w-full text-base sm:text-lg font-mono px-4 py-3.5 rounded-xl border focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all ${
                validation.valid
                  ? isLight
                    ? 'bg-white border-slate-300 text-slate-900 focus:border-indigo-500'
                    : 'bg-slate-950 border-slate-800 text-indigo-300 focus:border-indigo-500'
                  : 'bg-rose-950/20 border-rose-500/60 text-rose-300 focus:ring-rose-500'
              }`}
            />
          </div>
          <div className="flex items-center justify-between text-[11px] font-mono text-slate-400">
            <span>Syntax: <code>minute hour day-of-month month day-of-week</code></span>
            <span>5 fields separated by spaces</span>
          </div>
        </div>

        {/* Human-Readable Explanation Box */}
        <div 
          aria-live="polite"
          className={`rounded-xl border p-4 sm:p-5 transition-all ${
            validation.valid
              ? isLight
                ? 'bg-indigo-50/70 border-indigo-200 text-slate-800'
                : 'bg-indigo-950/20 border-indigo-800/40 text-slate-200'
              : isLight
              ? 'bg-rose-50 border-rose-200 text-rose-900'
              : 'bg-rose-950/20 border-rose-900/40 text-rose-200'
          }`}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-start gap-3">
              {validation.valid ? (
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500 dark:text-indigo-400 shrink-0 mt-0.5">
                  <Clock className="w-5 h-5" />
                </div>
              ) : (
                <div className="p-2 rounded-lg bg-rose-500/10 text-rose-500 dark:text-rose-400 shrink-0 mt-0.5">
                  <AlertCircle className="w-5 h-5" />
                </div>
              )}
              <div className="space-y-1">
                <span className={`text-[10px] font-mono uppercase tracking-wider font-bold ${
                  validation.valid ? 'text-indigo-600 dark:text-indigo-400' : 'text-rose-600 dark:text-rose-400'
                }`}>
                  {validation.valid ? 'Human-Readable Schedule' : 'Syntax Validation Error'}
                </span>
                <p className="text-sm sm:text-base font-medium leading-relaxed">
                  {validation.valid ? validation.explanation : validation.error}
                </p>
              </div>
            </div>

            {validation.valid && (
              <button
                onClick={handleCopyExplanation}
                className={`shrink-0 text-xs font-mono p-2 rounded-lg border transition-all cursor-pointer ${
                  copiedExplanation
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : isLight
                    ? 'bg-white hover:bg-slate-100 text-slate-700 border-indigo-200'
                    : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
                }`}
                title="Copy human-readable description"
                aria-label="Copy human explanation"
              >
                {copiedExplanation ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            )}
          </div>
        </div>

        {/* Field Breakdown (5 Interactive Fields) */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className={`text-xs font-bold font-mono uppercase tracking-wider ${isLight ? 'text-slate-800' : 'text-white'} flex items-center gap-1.5`}>
              <Sliders className="w-3.5 h-3.5 text-indigo-400" />
              Field-by-Field Breakdown
            </h3>
            <span className={`text-[11px] font-mono ${textMutedClass}`}>
              Edit any segment to update schedule
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            {/* 1. Minute */}
            <div className={`p-3.5 rounded-xl border space-y-2 ${inputBgClass} ${borderClass}`}>
              <div className="flex items-center justify-between">
                <label htmlFor="field-minute" className="text-xs font-bold font-mono text-indigo-400">
                  Minute
                </label>
                <span className="text-[10px] font-mono text-slate-400">0–59</span>
              </div>
              <input
                id="field-minute"
                type="text"
                value={minuteInput}
                onChange={(e) => {
                  setMinuteInput(e.target.value);
                  handleFieldChange(0, e.target.value);
                }}
                className={`w-full text-sm font-mono px-2.5 py-1.5 rounded-lg border text-center font-bold ${
                  validation.fields?.minute.valid
                    ? isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-800 text-white'
                    : 'bg-rose-950/20 border-rose-500 text-rose-300'
                }`}
              />
              <span className="text-[10px] font-mono text-slate-400 block text-center truncate">
                Allowed: * , - /
              </span>
            </div>

            {/* 2. Hour */}
            <div className={`p-3.5 rounded-xl border space-y-2 ${inputBgClass} ${borderClass}`}>
              <div className="flex items-center justify-between">
                <label htmlFor="field-hour" className="text-xs font-bold font-mono text-indigo-400">
                  Hour
                </label>
                <span className="text-[10px] font-mono text-slate-400">0–23</span>
              </div>
              <input
                id="field-hour"
                type="text"
                value={hourInput}
                onChange={(e) => {
                  setHourInput(e.target.value);
                  handleFieldChange(1, e.target.value);
                }}
                className={`w-full text-sm font-mono px-2.5 py-1.5 rounded-lg border text-center font-bold ${
                  validation.fields?.hour.valid
                    ? isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-800 text-white'
                    : 'bg-rose-950/20 border-rose-500 text-rose-300'
                }`}
              />
              <span className="text-[10px] font-mono text-slate-400 block text-center truncate">
                Allowed: * , - /
              </span>
            </div>

            {/* 3. Day of Month */}
            <div className={`p-3.5 rounded-xl border space-y-2 ${inputBgClass} ${borderClass}`}>
              <div className="flex items-center justify-between">
                <label htmlFor="field-dom" className="text-xs font-bold font-mono text-indigo-400">
                  Day of Month
                </label>
                <span className="text-[10px] font-mono text-slate-400">1–31</span>
              </div>
              <input
                id="field-dom"
                type="text"
                value={domInput}
                onChange={(e) => {
                  setDomInput(e.target.value);
                  handleFieldChange(2, e.target.value);
                }}
                className={`w-full text-sm font-mono px-2.5 py-1.5 rounded-lg border text-center font-bold ${
                  validation.fields?.dayOfMonth.valid
                    ? isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-800 text-white'
                    : 'bg-rose-950/20 border-rose-500 text-rose-300'
                }`}
              />
              <span className="text-[10px] font-mono text-slate-400 block text-center truncate">
                Allowed: * , - /
              </span>
            </div>

            {/* 4. Month */}
            <div className={`p-3.5 rounded-xl border space-y-2 ${inputBgClass} ${borderClass}`}>
              <div className="flex items-center justify-between">
                <label htmlFor="field-month" className="text-xs font-bold font-mono text-indigo-400">
                  Month
                </label>
                <span className="text-[10px] font-mono text-slate-400">1–12, JAN–DEC</span>
              </div>
              <input
                id="field-month"
                type="text"
                value={monthInput}
                onChange={(e) => {
                  setMonthInput(e.target.value);
                  handleFieldChange(3, e.target.value);
                }}
                className={`w-full text-sm font-mono px-2.5 py-1.5 rounded-lg border text-center font-bold ${
                  validation.fields?.month.valid
                    ? isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-800 text-white'
                    : 'bg-rose-950/20 border-rose-500 text-rose-300'
                }`}
              />
              <span className="text-[10px] font-mono text-slate-400 block text-center truncate">
                Allowed: * , - /
              </span>
            </div>

            {/* 5. Day of Week */}
            <div className={`p-3.5 rounded-xl border space-y-2 ${inputBgClass} ${borderClass}`}>
              <div className="flex items-center justify-between">
                <label htmlFor="field-dow" className="text-xs font-bold font-mono text-indigo-400">
                  Day of Week
                </label>
                <span className="text-[10px] font-mono text-slate-400">0–7, SUN–SAT</span>
              </div>
              <input
                id="field-dow"
                type="text"
                value={dowInput}
                onChange={(e) => {
                  setDowInput(e.target.value);
                  handleFieldChange(4, e.target.value);
                }}
                className={`w-full text-sm font-mono px-2.5 py-1.5 rounded-lg border text-center font-bold ${
                  validation.fields?.dayOfWeek.valid
                    ? isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-800 text-white'
                    : 'bg-rose-950/20 border-rose-500 text-rose-300'
                }`}
              />
              <span className="text-[10px] font-mono text-slate-400 block text-center truncate">
                0 & 7 = Sunday
              </span>
            </div>
          </div>
        </div>

        {/* Next Executions Timetable with Timezone Toggle */}
        <div className="space-y-3 pt-2">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <h3 className={`text-xs font-bold font-mono uppercase tracking-wider ${isLight ? 'text-slate-800' : 'text-white'} flex items-center gap-1.5`}>
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                Next 5 Upcoming Executions
              </h3>
              <p className={`text-[11px] font-mono ${textMutedClass}`}>
                Active Timezone: <span className="font-semibold text-indigo-400">{timezoneMode === 'utc' ? 'Coordinated Universal Time (UTC)' : `${localTzName} (Local Browser Time)`}</span>
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              {/* Timezone Toggle */}
              <div className={`p-0.5 rounded-lg border flex items-center ${isLight ? 'bg-slate-100 border-slate-200' : 'bg-slate-900 border-slate-800'}`}>
                <button
                  onClick={() => setTimezoneMode('local')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-medium transition-all cursor-pointer ${
                    timezoneMode === 'local'
                      ? 'bg-indigo-600 text-white shadow-sm font-bold'
                      : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
                  }`}
                  aria-pressed={timezoneMode === 'local'}
                >
                  Local Time
                </button>
                <button
                  onClick={() => setTimezoneMode('utc')}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-mono font-medium transition-all cursor-pointer ${
                    timezoneMode === 'utc'
                      ? 'bg-indigo-600 text-white shadow-sm font-bold'
                      : isLight ? 'text-slate-600 hover:text-slate-900' : 'text-slate-400 hover:text-white'
                  }`}
                  aria-pressed={timezoneMode === 'utc'}
                >
                  UTC
                </button>
              </div>

              {nextRunData.occurrences.length > 0 && (
                <button
                  onClick={handleCopyRuns}
                  className={`text-xs font-mono px-2.5 py-1 rounded-md border flex items-center gap-1.5 transition-all cursor-pointer ${
                    copiedRuns
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                      : isLight
                      ? 'bg-slate-100 hover:bg-slate-200 text-slate-700 border-slate-200'
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-800'
                  }`}
                  title="Copy execution times"
                >
                  {copiedRuns ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copiedRuns ? 'Copied' : 'Copy All'}</span>
                </button>
              )}
            </div>
          </div>

          <div className={`rounded-xl border overflow-hidden ${inputBgClass} ${borderClass}`}>
            {nextRunData.error ? (
              <div className="p-4 text-xs font-mono text-amber-400 flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{nextRunData.error}</span>
              </div>
            ) : nextRunData.occurrences.length === 0 ? (
              <div className={`p-4 text-xs font-mono text-center ${textMutedClass}`}>
                Enter a valid 5-field cron expression to calculate future run times.
              </div>
            ) : (
              <div className="divide-y divide-slate-800/60">
                {nextRunData.occurrences.map((item, idx) => (
                  <div
                    key={idx}
                    className={`px-4 py-2.5 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-xs font-mono ${
                      isLight ? 'hover:bg-slate-100/60' : 'hover:bg-slate-900/60'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                        idx === 0 
                          ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30' 
                          : isLight ? 'bg-slate-200 text-slate-600' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {idx + 1}
                      </span>
                      <span className={`font-semibold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                        {item.formatted}
                      </span>
                    </div>
                    <span className="text-[11px] text-indigo-400/90 pl-7 sm:pl-0 font-sans">
                      {item.relative}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Supported Syntax Banner */}
        <div className={`p-3.5 rounded-xl border flex items-center gap-2.5 text-xs ${
          isLight ? 'bg-amber-50/70 border-amber-200 text-amber-900' : 'bg-amber-950/20 border-amber-900/40 text-amber-200/90'
        }`}>
          <Info className="w-4 h-4 shrink-0 text-amber-500" />
          <p className="leading-relaxed">
            <strong>Supported Syntax:</strong> Standard 5-field crontab format (<code>minute hour day-of-month month day-of-week</code>). Non-standard 6-field or 7-field Quartz expressions (with seconds or years), AWS EventBridge expressions, and custom daemon flags are not supported.
          </p>
        </div>

      </div>

      {/* SUPPORTING TECHNICAL DOCUMENTATION (500–900 Useful Words, Strictly High-Value) */}
      <div className={`border rounded-2xl p-6 sm:p-10 shadow-xl space-y-10 ${cardClass} ${borderClass}`}>
        
        {/* Section 1: What Is a Cron Expression? */}
        <section className="space-y-3">
          <h2 className={`text-xl sm:text-2xl font-black tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
            What Is a Cron Expression?
          </h2>
          <p className={`text-xs sm:text-sm leading-relaxed ${textMutedClass}`}>
            A cron expression is a string of space-separated fields used in Unix-like operating systems and automation engines to schedule jobs to run periodically at fixed times, dates, or intervals. Originally built for the Unix <code>cron</code> background daemon by Brian Kernighan and rewritten by Paul Vixie, cron schedules automate routine system maintenance such as database backups, log rotations, SSL certificate renewals, and batch data processing.
          </p>
          <p className={`text-xs sm:text-sm leading-relaxed ${textMutedClass}`}>
            Because raw expressions such as <code>*/15 9-17 * * 1-5</code> are compact and easy to misread, a dedicated parser breaks each field down into plain English, validates that values remain within permissible ranges, and calculates exact upcoming execution timestamps before you commit crontab changes to production servers.
          </p>
        </section>

        {/* Section 2: Cron Expression Format */}
        <section className="space-y-3">
          <h2 className={`text-xl sm:text-2xl font-black tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
            Cron Expression Format
          </h2>
          <p className={`text-xs sm:text-sm leading-relaxed ${textMutedClass}`}>
            Standard Unix crontab files read expressions formatted with exactly five positional fields, separated by white space:
          </p>
          <div className={`p-4 rounded-xl border font-mono text-xs overflow-x-auto ${inputBgClass} ${borderClass}`}>
            <div className="text-indigo-400 font-bold mb-2">
              ┌───────────── Minute (0 - 59)
              <br />│ ┌─────────── Hour (0 - 23)
              <br />│ │ ┌───────── Day of Month (1 - 31)
              <br />│ │ │ ┌─────── Month (1 - 12 or JAN - DEC)
              <br />│ │ │ │ ┌───── Day of Week (0 - 7 or SUN - SAT, 0 and 7 are Sunday)
              <br />* * * * *
            </div>
            <p className={`text-[11px] font-sans pt-1 ${textMutedClass}`}>
              Note: Unlike Java Quartz or Spring schedules which require 6 or 7 fields including seconds and years, standard Unix cron always begins with the <strong>minute</strong> field.
            </p>
          </div>
        </section>

        {/* Section 3: Cron Field Reference */}
        <section className="space-y-4">
          <h2 className={`text-xl sm:text-2xl font-black tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
            Cron Field Reference
          </h2>
          <p className={`text-xs sm:text-sm leading-relaxed ${textMutedClass}`}>
            Each field accepts a distinct range of integers, recognized aliases, and special characters:
          </p>

          <div className="overflow-x-auto">
            <table className={`w-full text-left text-xs border rounded-xl overflow-hidden ${borderClass}`}>
              <thead className={isLight ? 'bg-slate-100 text-slate-800 font-bold' : 'bg-slate-800 text-slate-200 font-bold'}>
                <tr>
                  <th className="p-3 border-b border-slate-700/50">Field Position</th>
                  <th className="p-3 border-b border-slate-700/50">Field Name</th>
                  <th className="p-3 border-b border-slate-700/50">Allowed Values</th>
                  <th className="p-3 border-b border-slate-700/50">Supported Aliases</th>
                  <th className="p-3 border-b border-slate-700/50">Allowed Operators</th>
                </tr>
              </thead>
              <tbody className={`divide-y divide-slate-800/40 font-mono ${textMutedClass}`}>
                <tr>
                  <td className="p-3">Field 1</td>
                  <td className="p-3 font-semibold text-indigo-400">Minute</td>
                  <td className="p-3">0 – 59</td>
                  <td className="p-3 text-slate-500">None</td>
                  <td className="p-3">* , - /</td>
                </tr>
                <tr>
                  <td className="p-3">Field 2</td>
                  <td className="p-3 font-semibold text-indigo-400">Hour</td>
                  <td className="p-3">0 – 23</td>
                  <td className="p-3 text-slate-500">None</td>
                  <td className="p-3">* , - /</td>
                </tr>
                <tr>
                  <td className="p-3">Field 3</td>
                  <td className="p-3 font-semibold text-indigo-400">Day of Month</td>
                  <td className="p-3">1 – 31</td>
                  <td className="p-3 text-slate-500">None</td>
                  <td className="p-3">* , - /</td>
                </tr>
                <tr>
                  <td className="p-3">Field 4</td>
                  <td className="p-3 font-semibold text-indigo-400">Month</td>
                  <td className="p-3">1 – 12</td>
                  <td className="p-3 text-emerald-400">JAN – DEC</td>
                  <td className="p-3">* , - /</td>
                </tr>
                <tr>
                  <td className="p-3">Field 5</td>
                  <td className="p-3 font-semibold text-indigo-400">Day of Week</td>
                  <td className="p-3">0 – 7 (0 & 7 = Sun)</td>
                  <td className="p-3 text-emerald-400">SUN – SAT</td>
                  <td className="p-3">* , - /</td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className={`text-xs ${textMutedClass}`}>
            <strong>Note on Sunday:</strong> In POSIX standard cron, both <code>0</code> and <code>7</code> represent Sunday. Both values are fully supported by this parser.
          </p>
        </section>

        {/* Section 4: Common Cron Examples */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className={`text-xl sm:text-2xl font-black tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
              Common Cron Examples
            </h2>
            <span className={`text-xs ${textMutedClass}`}>Click any example to load into parser</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { expr: '* * * * *', label: 'Every minute', desc: 'Runs continuously at minute 0, 1, 2, 3...' },
              { expr: '*/5 * * * *', label: 'Every 5 minutes', desc: 'Frequent webhook polling or micro-syncs' },
              { expr: '0 * * * *', label: 'Every hour', desc: 'Runs at the beginning of each hour (:00)' },
              { expr: '0 0 * * *', label: 'Every day at midnight', desc: 'Daily database backups and log rolls' },
              { expr: '0 9 * * 1-5', label: 'Weekdays at 09:00', desc: 'Business hours Monday through Friday' },
              { expr: '0 0 1 * *', label: '1st of every month', desc: 'Monthly report generation at 00:00' },
              { expr: '0 0 * * 0', label: 'Every Sunday at midnight', desc: 'Weekly audit and vacuum maintenance' },
              { expr: '0 0 * JAN MON', label: 'Every Monday in January', desc: 'Demonstrates month and weekday aliases' }
            ].map((ex) => (
              <button
                key={ex.expr}
                onClick={() => {
                  setExpression(ex.expr);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className={`p-3.5 rounded-xl border text-left flex items-start justify-between gap-3 transition-all cursor-pointer ${
                  expression === ex.expr
                    ? isLight ? 'bg-indigo-50 border-indigo-300' : 'bg-indigo-950/30 border-indigo-600'
                    : isLight ? 'bg-white hover:bg-slate-50 border-slate-200' : 'bg-slate-900/40 hover:bg-slate-800/80 border-slate-800'
                }`}
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <code className="text-xs font-mono font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">
                      {ex.expr}
                    </code>
                    <span className={`text-xs font-bold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                      {ex.label}
                    </span>
                  </div>
                  <p className={`text-[11px] ${textMutedClass}`}>
                    {ex.desc}
                  </p>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 shrink-0 mt-1" />
              </button>
            ))}
          </div>
        </section>

        {/* Section 5: Cron Operators */}
        <section className="space-y-4">
          <h2 className={`text-xl sm:text-2xl font-black tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
            Cron Operators Explained
          </h2>
          <p className={`text-xs sm:text-sm leading-relaxed ${textMutedClass}`}>
            Cron expressions use four core operators to specify sets of time values:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className={`p-4 rounded-xl border space-y-2 ${inputBgClass} ${borderClass}`}>
              <div className="flex items-center gap-2">
                <code className="text-sm font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">*</code>
                <span className={`text-xs font-bold ${isLight ? 'text-slate-800' : 'text-white'}`}>Wildcard (All Values)</span>
              </div>
              <p className={`text-xs leading-relaxed ${textMutedClass}`}>
                Matches every possible value for that field. For example, <code>*</code> in the hour position means "every hour of the day".
              </p>
            </div>

            <div className={`p-4 rounded-xl border space-y-2 ${inputBgClass} ${borderClass}`}>
              <div className="flex items-center gap-2">
                <code className="text-sm font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">,</code>
                <span className={`text-xs font-bold ${isLight ? 'text-slate-800' : 'text-white'}`}>Comma (List Value)</span>
              </div>
              <p className={`text-xs leading-relaxed ${textMutedClass}`}>
                Specifies an explicit list of discrete values. For example, <code>1,15</code> in the day-of-month field executes on the 1st and the 15th.
              </p>
            </div>

            <div className={`p-4 rounded-xl border space-y-2 ${inputBgClass} ${borderClass}`}>
              <div className="flex items-center gap-2">
                <code className="text-sm font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">-</code>
                <span className={`text-xs font-bold ${isLight ? 'text-slate-800' : 'text-white'}`}>Hyphen (Range of Values)</span>
              </div>
              <p className={`text-xs leading-relaxed ${textMutedClass}`}>
                Defines an inclusive range between two numbers. For example, <code>1-5</code> in the day-of-week field means Monday through Friday.
              </p>
            </div>

            <div className={`p-4 rounded-xl border space-y-2 ${inputBgClass} ${borderClass}`}>
              <div className="flex items-center gap-2">
                <code className="text-sm font-bold text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded">/</code>
                <span className={`text-xs font-bold ${isLight ? 'text-slate-800' : 'text-white'}`}>Slash (Step Values)</span>
              </div>
              <p className={`text-xs leading-relaxed ${textMutedClass}`}>
                Defines step increments across a range or wildcard. For example, <code>*/10</code> in the minute field means "every 10th minute".
              </p>
            </div>
          </div>
        </section>

        {/* Section 6: Day-of-Month vs Day-of-Week Semantics (POSIX Union Rule) */}
        <section className="space-y-3">
          <h2 className={`text-xl sm:text-2xl font-black tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
            Day-of-Month vs. Day-of-Week Semantics (POSIX OR Rule)
          </h2>
          <p className={`text-xs sm:text-sm leading-relaxed ${textMutedClass}`}>
            One of the most frequent sources of confusion when authoring crontab schedules is the relationship between the <strong>Day of Month</strong> (field 3) and <strong>Day of Week</strong> (field 5).
          </p>
          <div className={`p-4 rounded-xl border space-y-2.5 ${isLight ? 'bg-indigo-50/50 border-indigo-200' : 'bg-indigo-950/20 border-indigo-900/40'}`}>
            <p className="text-xs font-semibold text-indigo-500 dark:text-indigo-300">
              The POSIX Standard OR Rule:
            </p>
            <p className={`text-xs leading-relaxed ${textMutedClass}`}>
              When <em>both</em> the day-of-month and day-of-week fields are restricted (i.e. neither field is set to <code>*</code>), standard Unix cron treats them as an <strong>OR condition</strong>, not an AND condition. The scheduled command executes if the current calendar day matches the day-of-month <strong>OR</strong> if it matches the day-of-week.
            </p>
            <p className={`text-xs font-mono ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
              Example: <code>0 9 1,15 * 1</code>
            </p>
            <p className={`text-xs leading-relaxed ${textMutedClass}`}>
              This runs at 09:00 on the 1st of the month, on the 15th of the month, <em>and on every Monday</em> during the month. It does <strong>not</strong> mean "only when the 1st or 15th falls on a Monday." Our parser and next execution calculator strictly adhere to this POSIX standard union behavior.
            </p>
          </div>
        </section>

        {/* Section 7: How to Read a Cron Expression */}
        <section className="space-y-3">
          <h2 className={`text-xl sm:text-2xl font-black tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
            How to Read a Cron Expression
          </h2>
          <p className={`text-xs sm:text-sm leading-relaxed ${textMutedClass}`}>
            To read any cron expression accurately, follow this simple left-to-right inspection workflow:
          </p>
          <ol className={`list-decimal list-inside space-y-2 text-xs sm:text-sm leading-relaxed ${textMutedClass}`}>
            <li><strong>Inspect the first two fields (Minute and Hour):</strong> Determine the exact time of day. <code>30 4</code> translates directly to 04:30 AM.</li>
            <li><strong>Check Day of Month (Field 3):</strong> Check if the job runs on specific calendar dates (e.g. <code>1,15</code>) or every day (<code>*</code>).</li>
            <li><strong>Check Month (Field 4):</strong> Verify whether the job is restricted to specific months (e.g. <code>6,12</code> or <code>JAN</code>) or applies year-round (<code>*</code>).</li>
            <li><strong>Check Day of Week (Field 5):</strong> Identify whether the schedule targets business weekdays (<code>1-5</code>), weekends (<code>0,6</code>), or specific days.</li>
            <li><strong>Evaluate Combined Semantics:</strong> Combine the parts into a single phrase, applying the POSIX OR rule if both fields 3 and 5 are specified.</li>
          </ol>
        </section>

        {/* Section 8: Cron Parser vs. Cron Generator */}
        <section className="space-y-3">
          <h2 className={`text-xl sm:text-2xl font-black tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
            Cron Parser vs. Cron Generator
          </h2>
          <p className={`text-xs sm:text-sm leading-relaxed ${textMutedClass}`}>
            A <strong>Cron Parser</strong> takes an existing cron expression string as input and translates its cryptic syntax into human-readable sentences, breaks down each segment, and calculates exact upcoming execution dates. This is essential for code review, debugging unexpected scheduler behavior, and verifying production configuration files.
          </p>
          <p className={`text-xs sm:text-sm leading-relaxed ${textMutedClass}`}>
            In contrast, a <strong>Cron Generator</strong> allows users to select human preferences (e.g. "every Tuesday at 3:00 PM") and builds the matching 5-field cron string. OwnFormatters provides both capabilities in one interface: you can type raw syntax directly, adjust individual segment sliders, or click presets to generate expressions.
          </p>
        </section>

        {/* Section 9: Frequently Asked Questions (Accordion) */}
        <section className="space-y-4">
          <h2 className={`text-xl sm:text-2xl font-black tracking-tight ${isLight ? 'text-slate-900' : 'text-white'}`}>
            Frequently Asked Questions
          </h2>

          <div className="space-y-3">
            {[
              {
                q: 'What is the difference between 5-field and 6-field cron expressions?',
                a: 'Standard Unix crontab uses exactly five fields: minute, hour, day-of-month, month, and day-of-week. Six-field cron formats (common in Java Quartz, Spring Framework, and some AWS services) add a seconds field at the beginning. Seven-field Quartz schedules also add a trailing year field. This tool focuses strictly on standard 5-field crontab syntax.'
              },
              {
                q: 'How does step syntax (e.g. */15) work?',
                a: 'The forward slash operator (/) specifies step increments. When paired with a wildcard (*/15 in the minute field), it begins at 0 and increments by 15 (0, 15, 30, 45). When applied to a range such as 10-30/5, execution occurs at minutes 10, 15, 20, 25, and 30.'
              },
              {
                q: 'Is Sunday represented by 0 or 7 in crontab?',
                a: 'Both 0 and 7 represent Sunday in standard Unix crontab implementations. 1 represents Monday, 2 is Tuesday, up through 6 for Saturday. OwnFormatters fully supports both 0 and 7.'
              },
              {
                q: 'Why do my next execution times differ from my server logs?',
                a: 'Discrepancies almost always stem from time zone differences. Crontab daemons execute based on the server system time (which is frequently configured to UTC). Use the Local Time / UTC toggle on this page to switch between your current browser time zone and UTC.'
              },
              {
                q: 'Are my cron expressions uploaded to an external server?',
                a: 'No. All cron parsing, validation, regular expression matching, and execution timetable calculations run 100% locally inside your web browser thread. No data is sent across the network.'
              }
            ].map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div 
                  key={idx}
                  className={`border rounded-xl transition-all ${
                    isOpen 
                      ? isLight ? 'bg-indigo-50/40 border-indigo-200' : 'bg-indigo-950/20 border-indigo-900/50'
                      : isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/30 border-slate-800'
                  }`}
                >
                  <button
                    onClick={() => toggleFaq(idx)}
                    className="w-full p-4 text-left flex items-center justify-between gap-3 cursor-pointer"
                    aria-expanded={isOpen}
                  >
                    <span className={`text-xs sm:text-sm font-bold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                      {faq.q}
                    </span>
                    {isOpen ? (
                      <ChevronUp className="w-4 h-4 text-indigo-400 shrink-0" />
                    ) : (
                      <ChevronDown className="w-4 h-4 text-slate-400 shrink-0" />
                    )}
                  </button>
                  {isOpen && (
                    <div className={`px-4 pb-4 text-xs sm:text-sm leading-relaxed border-t pt-3 ${
                      isLight ? 'border-indigo-100 text-slate-600' : 'border-slate-800/80 text-slate-400'
                    }`}>
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* Section 10: Related Developer Utilities */}
        <section className="space-y-4 pt-4 border-t border-slate-800/40">
          <h2 className={`text-base sm:text-lg font-bold ${isLight ? 'text-slate-900' : 'text-white'}`}>
            Related Developer Utilities
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            <a
              href="/timestamp-converter"
              className={`p-3.5 rounded-xl border flex flex-col justify-between transition-all ${
                isLight ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800' : 'bg-slate-900/50 hover:bg-slate-850 border-slate-800 text-slate-200'
              }`}
            >
              <div className="space-y-1">
                <span className="text-xs font-bold text-indigo-400">Epoch Timestamp Converter</span>
                <p className={`text-[11px] leading-relaxed ${textMutedClass}`}>
                  Convert Unix epoch seconds and milliseconds to ISO 8601 and UTC dates.
                </p>
              </div>
              <span className="text-[10px] font-mono text-indigo-400 mt-2 flex items-center gap-1">
                Launch tool →
              </span>
            </a>

            <a
              href="/regex-tester"
              className={`p-3.5 rounded-xl border flex flex-col justify-between transition-all ${
                isLight ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800' : 'bg-slate-900/50 hover:bg-slate-850 border-slate-800 text-slate-200'
              }`}
            >
              <div className="space-y-1">
                <span className="text-xs font-bold text-indigo-400">Regular Expression Tester</span>
                <p className={`text-[11px] leading-relaxed ${textMutedClass}`}>
                  Test and debug JavaScript regex patterns with live group capture highlights.
                </p>
              </div>
              <span className="text-[10px] font-mono text-indigo-400 mt-2 flex items-center gap-1">
                Launch tool →
              </span>
            </a>

            <a
              href="/json-formatter"
              className={`p-3.5 rounded-xl border flex flex-col justify-between transition-all ${
                isLight ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800' : 'bg-slate-900/50 hover:bg-slate-850 border-slate-800 text-slate-200'
              }`}
            >
              <div className="space-y-1">
                <span className="text-xs font-bold text-indigo-400">JSON Formatter & Beautifier</span>
                <p className={`text-[11px] leading-relaxed ${textMutedClass}`}>
                  Format, beautify, and validate complex JSON data with client-side privacy.
                </p>
              </div>
              <span className="text-[10px] font-mono text-indigo-400 mt-2 flex items-center gap-1">
                Launch tool →
              </span>
            </a>

            <a
              href="/yaml-formatter"
              className={`p-3.5 rounded-xl border flex flex-col justify-between transition-all ${
                isLight ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800' : 'bg-slate-900/50 hover:bg-slate-850 border-slate-800 text-slate-200'
              }`}
            >
              <div className="space-y-1">
                <span className="text-xs font-bold text-indigo-400">YAML Formatter & Validator</span>
                <p className={`text-[11px] leading-relaxed ${textMutedClass}`}>
                  Format Kubernetes manifests, Docker compose files, and convert to JSON.
                </p>
              </div>
              <span className="text-[10px] font-mono text-indigo-400 mt-2 flex items-center gap-1">
                Launch tool →
              </span>
            </a>
          </div>
        </section>

      </div>

    </div>
  );
}
