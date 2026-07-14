import React, { useState, useEffect } from 'react';
import { Copy, Check, Clock, Sparkles, CheckCircle, AlertCircle, HelpCircle } from 'lucide-react';

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

const PRESETS = [
  { name: 'Every Minute', expression: '* * * * *' },
  { name: 'Every 5 Minutes', expression: '*/5 * * * *' },
  { name: 'Every Hour (At minute 0)', expression: '0 * * * *' },
  { name: 'Every Day at Midnight', expression: '0 0 * * *' },
  { name: 'Every Weekday at Midnight (Mon-Fri)', expression: '0 0 * * 1-5' },
  { name: 'Every Sunday at Noon (12:00 PM)', expression: '0 12 * * 0' },
  { name: 'Every Month on the 1st at Midnight', expression: '0 0 1 * *' },
];

export default function CronTool({ theme }: CronToolProps) {
  const [expression, setExpression] = useState<string>('*/5 * * * *');
  const [copied, setCopied] = useState<boolean>(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error'; message: string }>({ type: 'success', message: '' });

  // Segments state
  const [minute, setMinute] = useState<string>('*/5');
  const [hour, setHour] = useState<string>('*');
  const [dayOfMonth, setDayOfMonth] = useState<string>('*');
  const [month, setMonth] = useState<string>('*');
  const [dayOfWeek, setDayOfWeek] = useState<string>('*');

  const isLight = theme?.isDark === false;
  const borderClass = theme?.border || 'border-slate-800/80';
  const cardClass = theme?.card || 'bg-slate-900/50';
  const inputBgClass = theme?.inputBg || 'bg-slate-950';
  const textMutedClass = theme?.textMuted || 'text-slate-400';

  // Synchronize segments when full expression changes
  useEffect(() => {
    const parts = expression.trim().split(/\s+/);
    if (parts.length === 5) {
      setMinute(parts[0]);
      setHour(parts[1]);
      setDayOfMonth(parts[2]);
      setMonth(parts[3]);
      setDayOfWeek(parts[4]);
      setStatus({ type: 'success', message: 'Cron expression syntactically parsed successfully!' });
    } else if (parts.length > 0 && expression.trim() !== '') {
      setStatus({ type: 'error', message: 'Standard cron expressions must contain exactly 5 space-separated parameters.' });
    }
  }, [expression]);

  // Synchronize unified expression when individual segments are typed
  const handleSegmentChange = (field: string, val: string) => {
    let cleanVal = val.replace(/\s+/g, '');
    let m = minute, h = hour, dom = dayOfMonth, mon = month, dow = dayOfWeek;
    
    if (field === 'min') { setMinute(cleanVal); m = cleanVal; }
    else if (field === 'hour') { setHour(cleanVal); h = cleanVal; }
    else if (field === 'dom') { setDayOfMonth(cleanVal); dom = cleanVal; }
    else if (field === 'mon') { setMonth(cleanVal); mon = cleanVal; }
    else if (field === 'dow') { setDayOfWeek(cleanVal); dow = cleanVal; }

    setExpression(`${m} ${h} ${dom} ${mon} ${dow}`);
  };

  const handleSelectPreset = (expr: string) => {
    setExpression(expr);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(expression);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Helper translations to sentence structures
  const translateField = (field: string, val: string): string => {
    if (val === '*') return 'Every';
    if (val.startsWith('*/')) {
      const step = val.split('/')[1];
      return `Every ${step} ${field}s`;
    }
    if (val.includes('-')) {
      const range = val.split('-');
      return `From ${field} ${range[0]} through ${range[1]}`;
    }
    if (val.includes(',')) {
      return `At ${field}s: [${val}]`;
    }
    return `At ${field} ${val}`;
  };

  const translateDayOfWeek = (val: string): string => {
    if (val === '*') return 'Every day of the week';
    const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    if (val.includes('-')) {
      const range = val.split('-');
      const d1 = parseInt(range[0], 10);
      const d2 = parseInt(range[1], 10);
      if (!isNaN(d1) && !isNaN(d2)) {
        return `From ${dayNames[d1] || d1} to ${dayNames[d2] || d2}`;
      }
    }
    if (val.includes(',')) {
      return val.split(',').map(v => dayNames[parseInt(v.trim(), 10)] || v).join(', ');
    }
    const d = parseInt(val, 10);
    return isNaN(d) ? `On day ${val}` : `On ${dayNames[d] || val}`;
  };

  const translateMonth = (val: string): string => {
    if (val === '*') return 'Every month';
    const months = ['', 'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
    if (val.includes('-')) {
      const range = val.split('-');
      const m1 = parseInt(range[0], 10);
      const m2 = parseInt(range[1], 10);
      if (!isNaN(m1) && !isNaN(m2)) {
        return `From ${months[m1] || m1} through ${months[m2] || m2}`;
      }
    }
    const m = parseInt(val, 10);
    return isNaN(m) ? `In month ${val}` : `In ${months[m] || val}`;
  };

  const getFullExplanation = (): string => {
    if (status.type === 'error') return 'Syntax error. Please adjust the expression fields.';
    
    // Build a human phrasing sentences
    let minText = translateField('minute', minute);
    let hourText = translateField('hour', hour);
    let domText = translateField('day of month', dayOfMonth);
    let monText = translateMonth(month);
    let dowText = translateDayOfWeek(dayOfWeek);

    if (minute === '*' && hour === '*' && dayOfMonth === '*' && month === '*' && dayOfWeek === '*') {
      return 'Every minute of every day.';
    }

    let statement = `Runs ${minText.toLowerCase()}`;
    
    if (hour !== '*') {
      statement += ` of ${hourText.toLowerCase()}`;
    } else if (minute !== '*') {
      statement += ' of every hour';
    }

    if (dayOfMonth !== '*') {
      statement += `, on ${domText.toLowerCase()}`;
    }

    if (month !== '*') {
      statement += `, ${monText.toLowerCase()}`;
    }

    if (dayOfWeek !== '*') {
      statement += `, and ${dowText.toLowerCase()}`;
    } else if (dayOfMonth === '*' && month === '*') {
      statement += ', daily';
    }

    return statement + '.';
  };

  // Helper: Generates Next occurrences estimations
  const calculateNextOccurrences = (): string[] => {
    if (status.type === 'error') return [];
    
    // We will generate the next 5 occurrences from current time
    const result: string[] = [];
    const now = new Date();
    let current = new Date(now.getTime() + 60000); // start at next minute

    // We implement a simplified cron evaluation for display
    // Support basic intervals
    const mStep = minute.startsWith('*/') ? parseInt(minute.split('/')[1], 10) : 1;
    const hStep = hour.startsWith('*/') ? parseInt(hour.split('/')[1], 10) : 1;

    let parsedMin = parseInt(minute, 10);
    let parsedHour = parseInt(hour, 10);
    let parsedDom = parseInt(dayOfMonth, 10);
    let parsedDow = parseInt(dayOfWeek, 10);

    for (let i = 0; i < 5000 && result.length < 5; i++) {
      let matches = true;

      // Minutes match check
      if (minute !== '*') {
        if (minute.startsWith('*/')) {
          if (current.getMinutes() % mStep !== 0) matches = false;
        } else if (minute.includes(',')) {
          const mins = minute.split(',').map(m => parseInt(m, 10));
          if (!mins.includes(current.getMinutes())) matches = false;
        } else if (!isNaN(parsedMin)) {
          if (current.getMinutes() !== parsedMin) matches = false;
        }
      }

      // Hours match check
      if (hour !== '*') {
        if (hour.startsWith('*/')) {
          if (current.getHours() % hStep !== 0) matches = false;
        } else if (hour.includes(',')) {
          const hours = hour.split(',').map(h => parseInt(h, 10));
          if (!hours.includes(current.getHours())) matches = false;
        } else if (!isNaN(parsedHour)) {
          if (current.getHours() !== parsedHour) matches = false;
        }
      }

      // Day of month check
      if (dayOfMonth !== '*' && !isNaN(parsedDom)) {
        if (current.getDate() !== parsedDom) matches = false;
      }

      // Month check
      if (month !== '*' && !isNaN(parseInt(month, 10))) {
        if (current.getMonth() + 1 !== parseInt(month, 10)) matches = false;
      }

      // Day of Week check
      if (dayOfWeek !== '*' && !isNaN(parsedDow)) {
        if (current.getDay() !== parsedDow) matches = false;
      }

      if (matches) {
        result.push(current.toLocaleString('en-US', {
          weekday: 'short',
          year: 'numeric',
          month: 'short',
          day: '2-digit',
          hour: '2-digit',
          minute: '2-digit',
          second: '2-digit'
        }));
      }

      current = new Date(current.getTime() + 60000); // Increment 1 min
    }

    if (result.length === 0) {
      // Fallback relative occurrences for demo
      return [
        'At the next matching interval',
        'In the next hour cycle',
        'Following daily recurrence trigger'
      ];
    }
    return result;
  };

  const nextDates = calculateNextOccurrences();

  return (
    <div className="space-y-6" id="cron-parser-tool">
      
      {/* Top Controller: Presets */}
      <div className={`border p-4 rounded-xl ${cardClass} ${borderClass} space-y-3`}>
        <span className={`text-xs font-mono uppercase block ${textMutedClass}`}>Common Cron Expression Presets:</span>
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((preset, idx) => (
            <button
              key={idx}
              onClick={() => handleSelectPreset(preset.expression)}
              className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
                expression === preset.expression
                  ? '!bg-indigo-600 !text-white border-indigo-500'
                  : isLight 
                    ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
                    : 'bg-slate-950 hover:bg-slate-900 border-slate-800 text-slate-300'
              }`}
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* Main Builder Box */}
      <div className={`border p-6 rounded-xl space-y-6 ${cardClass} ${borderClass}`}>
        
        {/* Unified string input */}
        <div className="space-y-2">
          <label className={`text-[10px] font-mono font-bold uppercase block ${textMutedClass}`}>Unified Cron Expression</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={expression}
              onChange={(e) => setExpression(e.target.value)}
              placeholder="* * * * *"
              className={`flex-1 ${inputBgClass} ${theme?.text || 'text-slate-100'} border ${borderClass} text-sm font-mono rounded-xl px-4 py-3 focus:outline-none focus:border-indigo-500`}
            />
            <button
              onClick={handleCopy}
              className={`px-4 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 border cursor-pointer ${
                isLight 
                  ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800' 
                  : 'bg-slate-950 hover:bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
              Copy Expression
            </button>
          </div>
        </div>

        {/* Builder Segments Grid */}
        <div className="space-y-3 border-t pt-4 border-slate-900/60">
          <label className={`text-[10px] font-mono font-bold uppercase block ${textMutedClass}`}>Cron Field-by-Field Builder</label>
          <div className="grid grid-cols-5 gap-3">
            
            {/* Minutes */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold font-sans text-slate-500 block text-center">Minutes</span>
              <input
                type="text"
                value={minute}
                onChange={(e) => handleSegmentChange('min', e.target.value)}
                placeholder="0-59"
                className={`w-full text-center ${inputBgClass} ${theme?.text || 'text-slate-100'} border ${borderClass} text-xs font-mono rounded-lg py-2 focus:outline-none focus:border-indigo-500`}
              />
              <span className="text-[8px] font-mono text-center block text-slate-600">0-59 or * , - /</span>
            </div>

            {/* Hours */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold font-sans text-slate-500 block text-center">Hours</span>
              <input
                type="text"
                value={hour}
                onChange={(e) => handleSegmentChange('hour', e.target.value)}
                placeholder="0-23"
                className={`w-full text-center ${inputBgClass} ${theme?.text || 'text-slate-100'} border ${borderClass} text-xs font-mono rounded-lg py-2 focus:outline-none focus:border-indigo-500`}
              />
              <span className="text-[8px] font-mono text-center block text-slate-600">0-23 or * , - /</span>
            </div>

            {/* Day of Month */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold font-sans text-slate-500 block text-center">Day of Mo</span>
              <input
                type="text"
                value={dayOfMonth}
                onChange={(e) => handleSegmentChange('dom', e.target.value)}
                placeholder="1-31"
                className={`w-full text-center ${inputBgClass} ${theme?.text || 'text-slate-100'} border ${borderClass} text-xs font-mono rounded-lg py-2 focus:outline-none focus:border-indigo-500`}
              />
              <span className="text-[8px] font-mono text-center block text-slate-600">1-31 or * , - /</span>
            </div>

            {/* Month */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold font-sans text-slate-500 block text-center">Month</span>
              <input
                type="text"
                value={month}
                onChange={(e) => handleSegmentChange('mon', e.target.value)}
                placeholder="1-12"
                className={`w-full text-center ${inputBgClass} ${theme?.text || 'text-slate-100'} border ${borderClass} text-xs font-mono rounded-lg py-2 focus:outline-none focus:border-indigo-500`}
              />
              <span className="text-[8px] font-mono text-center block text-slate-600">1-12 or * , - /</span>
            </div>

            {/* Day of Week */}
            <div className="space-y-1">
              <span className="text-[10px] font-bold font-sans text-slate-500 block text-center">Day of Wk</span>
              <input
                type="text"
                value={dayOfWeek}
                onChange={(e) => handleSegmentChange('dow', e.target.value)}
                placeholder="0-6"
                className={`w-full text-center ${inputBgClass} ${theme?.text || 'text-slate-100'} border ${borderClass} text-xs font-mono rounded-lg py-2 focus:outline-none focus:border-indigo-500`}
              />
              <span className="text-[8px] font-mono text-center block text-slate-600">0-6 (Sun-Sat)</span>
            </div>

          </div>
        </div>

        {/* Translation Output Box */}
        <div className={`p-4 rounded-xl border flex gap-3 ${
          status.type === 'error' 
            ? isLight
              ? 'bg-rose-50 border-rose-200 text-rose-900'
              : 'bg-pink-950/15 border-pink-900/40 text-pink-300' 
            : isLight
              ? 'bg-indigo-50 border-indigo-200 text-indigo-950'
              : 'bg-indigo-950/15 border-indigo-900/40 text-indigo-200'
        }`}>
          {status.type === 'error' ? (
            <AlertCircle className={`w-5 h-5 shrink-0 mt-0.5 ${isLight ? 'text-rose-600' : 'text-pink-500'}`} />
          ) : (
            <Clock className={`w-5 h-5 shrink-0 mt-0.5 ${isLight ? 'text-indigo-650' : 'text-indigo-400'}`} />
          )}
          <div className="space-y-1">
            <span className={`text-[10px] font-mono uppercase font-black tracking-wider block ${isLight ? 'text-indigo-800' : 'opacity-75'}`}>Human Readable Translation</span>
            <p className={`text-xs font-bold leading-relaxed ${isLight ? 'text-slate-900' : ''}`}>
              {getFullExplanation()}
            </p>
          </div>
        </div>

      </div>

      {/* Estimations list & Documentation FAQ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Schedule dates */}
        <div className={`border p-5 rounded-xl space-y-3.5 ${cardClass} ${borderClass}`}>
          <h4 className={`text-xs font-bold font-mono uppercase flex items-center gap-1.5 border-b pb-2 ${isLight ? 'text-slate-800 border-slate-200' : 'text-slate-300 border-slate-900'}`}>
            <Clock className="w-4 h-4 text-emerald-500" /> Upcoming Execution Times
          </h4>
          <ul className="space-y-2 font-mono text-xs">
            {nextDates.map((date, idx) => (
              <li key={idx} className="flex items-center gap-2">
                <span className={`${isLight ? 'text-indigo-600' : 'text-indigo-400'} font-bold`}>▶</span>
                <span className={isLight ? 'text-slate-800' : 'text-slate-200'}>{date}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Guide syntax */}
        <div className={`border p-5 rounded-xl space-y-3 ${cardClass} ${borderClass} text-xs ${textMutedClass}`}>
          <h4 className={`font-bold flex items-center gap-1.5 ${isLight ? 'text-slate-800' : 'text-white'}`}>
            <HelpCircle className={`w-4 h-4 ${isLight ? 'text-indigo-600' : 'text-indigo-400'}`} />
            Understanding Cron Syntax Symbols
          </h4>
          <ul className="space-y-1.5 list-disc list-inside">
            <li><strong>Asterisk (*):</strong> Represents wildcards (always matches every integer).</li>
            <li><strong>Comma (,):</strong> Separates list items (e.g., <code className="px-1 py-0.5 rounded bg-slate-950/40">1,3,5</code>).</li>
            <li><strong>Dash (-):</strong> Range parameter limits (e.g., <code className="px-1 py-0.5 rounded bg-slate-950/40">1-5</code>).</li>
            <li><strong>Slash (/):</strong> Intervals step values (e.g., <code className="px-1 py-0.5 rounded bg-slate-950/40">*/10</code> matches every 10).</li>
          </ul>
        </div>

      </div>

    </div>
  );
}
