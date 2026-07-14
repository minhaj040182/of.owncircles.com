import React, { useState, useEffect } from 'react';
import { Clock, Copy, Check, Calendar, ArrowLeftRight, Play, RefreshCw } from 'lucide-react';

interface TimestampToolProps {
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

export default function TimestampTool({ theme }: TimestampToolProps) {
  const [currentEpoch, setCurrentEpoch] = useState<number>(Math.floor(Date.now() / 1000));
  const [epochInput, setEpochInput] = useState<string>('');
  const [epochOutput, setEpochOutput] = useState<{ local: string; utc: string } | null>(null);
  
  const [dateInput, setDateInput] = useState<string>('');
  const [dateOutput, setDateOutput] = useState<number | null>(null);

  const [copiedCurrent, setCopiedCurrent] = useState<boolean>(false);
  const [copiedResult, setCopiedResult] = useState<boolean>(false);

  const borderClass = theme?.border || 'border-slate-800/80';
  const borderMutedClass = theme?.borderMuted || 'border-slate-850';
  const cardClass = theme?.card || 'bg-slate-900/50';
  const inputBgClass = theme?.inputBg || 'bg-slate-950';
  const panelBgClass = theme?.panelBg || 'bg-slate-900';
  const textClass = theme?.text || 'text-slate-200';
  const textMutedClass = theme?.textMuted || 'text-slate-400';
  const canvasBgClass = theme?.canvasBg || 'bg-[#02050c]';
  const isLight = theme?.isDark === false;

  // Tick the real-time clock
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentEpoch(Math.floor(Date.now() / 1000));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Pre-populate input on load
  useEffect(() => {
    setEpochInput(currentEpoch.toString());
    handleConvertEpoch(currentEpoch.toString());
    
    // Default ISO string for Date input
    const now = new Date();
    setDateInput(now.toISOString().slice(0, 19)); // e.g. YYYY-MM-DDTHH:mm:ss
    handleConvertDate(now.toISOString().slice(0, 19));
  }, []);

  const handleConvertEpoch = (val: string) => {
    const num = parseInt(val.trim());
    if (isNaN(num)) {
      setEpochOutput(null);
      return;
    }
    try {
      // Handle both seconds and milliseconds
      const date = num > 99999999999 ? new Date(num) : new Date(num * 1000);
      setEpochOutput({
        local: date.toString(),
        utc: date.toUTCString()
      });
    } catch (e) {
      setEpochOutput(null);
    }
  };

  const handleConvertDate = (val: string) => {
    if (!val.trim()) {
      setDateOutput(null);
      return;
    }
    try {
      const date = new Date(val);
      if (isNaN(date.getTime())) {
        setDateOutput(null);
        return;
      }
      setDateOutput(Math.floor(date.getTime() / 1000));
    } catch (e) {
      setDateOutput(null);
    }
  };

  const handleCopyCurrent = () => {
    navigator.clipboard.writeText(currentEpoch.toString());
    setCopiedCurrent(true);
    setTimeout(() => setCopiedCurrent(false), 2000);
  };

  const handleCopyResult = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedResult(true);
    setTimeout(() => setCopiedResult(false), 2000);
  };

  return (
    <div className="space-y-6" id="timestamp-converter-tool">
      
      {/* Realtime Countdown display card */}
      <div className={`border p-6 rounded-2xl flex flex-col md:flex-row items-center justify-between gap-6 ${
        isLight 
          ? 'bg-indigo-50 border-indigo-200 shadow-sm' 
          : 'bg-gradient-to-r from-indigo-950/40 to-slate-900 border-indigo-900/40'
      }`}>
        <div className="flex items-center gap-4 text-center md:text-left">
          <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${
            isLight ? 'bg-indigo-100 border-indigo-200 text-indigo-600' : 'bg-indigo-500/10 border-indigo-500/20 text-indigo-400'
          }`}>
            <Clock className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className={`text-[10px] uppercase tracking-wider font-bold font-mono ${isLight ? 'text-indigo-800' : 'text-indigo-300'}`}>Active Epoch Unix Timestamp</span>
            <h3 className={`text-3xl font-black font-mono tracking-tight mt-0.5 ${isLight ? 'text-indigo-900' : 'text-white'}`}>{currentEpoch}</h3>
          </div>
        </div>

        <button
          onClick={handleCopyCurrent}
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-md transition-all active:scale-[0.98] flex items-center gap-1.5 font-mono cursor-pointer"
        >
          {copiedCurrent ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
          {copiedCurrent ? 'Copied Epoch!' : 'Copy Active Epoch'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* LEFT PANEL: Epoch to Date */}
        <div className={`border rounded-xl p-5 space-y-4 ${inputBgClass} ${borderClass}`}>
          <div className={`flex items-center gap-2 border-b pb-3 ${borderClass}`}>
            <Calendar className={`w-4 h-4 ${isLight ? 'text-indigo-600' : 'text-indigo-400'}`} />
            <h3 className={`text-xs font-bold tracking-wider uppercase font-mono ${isLight ? 'text-slate-850' : 'text-white'}`}>Convert Epoch to Date</h3>
          </div>

          <div className="space-y-1.5">
            <label className={`text-xs font-semibold font-mono ${textMutedClass}`}>Epoch Timestamp (Seconds or Milliseconds)</label>
            <div className="flex gap-2">
              <input
                type="text"
                className={`flex-1 border text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-indigo-500 font-mono ${
                  isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-800 text-slate-200'
                }`}
                placeholder="e.g. 1783939200"
                value={epochInput}
                onChange={(e) => {
                  setEpochInput(e.target.value);
                  handleConvertEpoch(e.target.value);
                }}
              />
              <button
                onClick={() => {
                  setEpochInput(currentEpoch.toString());
                  handleConvertEpoch(currentEpoch.toString());
                }}
                className={`px-3 rounded-lg text-xs font-semibold border cursor-pointer ${
                  isLight 
                    ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700' 
                    : 'bg-slate-900 hover:bg-slate-855 border-slate-800 text-slate-300'
                }`}
                title="Use current timestamp"
              >
                Now
              </button>
            </div>
          </div>

          <div className={`rounded-xl border p-4 space-y-3 min-h-[140px] flex flex-col justify-center ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/30 border-slate-900'}`}>
            {epochOutput ? (
              <div className="space-y-2.5 text-xs font-mono">
                <div className="space-y-0.5">
                  <span className={`text-[10px] uppercase ${textMutedClass}`}>GMT / UTC Date string:</span>
                  <p className={`select-all font-semibold leading-relaxed ${isLight ? 'text-slate-900' : 'text-slate-200'}`}>{epochOutput.utc}</p>
                </div>
                <div className="space-y-0.5">
                  <span className={`text-[10px] uppercase ${textMutedClass}`}>Local Timezone:</span>
                  <p className={`select-all font-semibold leading-relaxed ${isLight ? 'text-indigo-700' : 'text-indigo-300'}`}>{epochOutput.local}</p>
                </div>
              </div>
            ) : (
              <p className={`text-xs font-mono text-center ${textMutedClass}`}>Enter a valid Epoch number above</p>
            )}
          </div>
        </div>

        {/* RIGHT PANEL: Date to Epoch */}
        <div className={`border rounded-xl p-5 space-y-4 ${inputBgClass} ${borderClass}`}>
          <div className={`flex items-center gap-2 border-b pb-3 ${borderClass}`}>
            <ArrowLeftRight className={`w-4 h-4 ${isLight ? 'text-indigo-600' : 'text-indigo-400'}`} />
            <h3 className={`text-xs font-bold tracking-wider uppercase font-mono ${isLight ? 'text-slate-855' : 'text-white'}`}>Convert Date to Epoch</h3>
          </div>

          <div className="space-y-1.5">
            <label className={`text-xs font-semibold font-mono ${textMutedClass}`}>ISO Date String or Local DateTime</label>
            <input
              type="text"
              className={`w-full border text-xs rounded-lg px-3 py-2.5 focus:outline-none focus:border-indigo-500 font-mono ${
                isLight ? 'bg-white border-slate-200 text-slate-800' : 'bg-slate-900 border-slate-800 text-slate-200'
              }`}
              placeholder="e.g. 2026-07-13T12:00:00 or July 13, 2026"
              value={dateInput}
              onChange={(e) => {
                setDateInput(e.target.value);
                handleConvertDate(e.target.value);
              }}
            />
          </div>

          <div className={`rounded-xl border p-4 space-y-2 min-h-[140px] flex flex-col justify-center ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/30 border-slate-900'}`}>
            {dateOutput !== null ? (
              <div className="space-y-2 text-xs font-mono">
                <div>
                  <span className={`text-[10px] uppercase ${textMutedClass}`}>Epoch Unix Timestamp (Seconds):</span>
                  <p className={`text-2xl font-black select-all tracking-tight pt-1 ${isLight ? 'text-slate-900' : 'text-white'}`}>{dateOutput}</p>
                </div>
                <div className="flex justify-between items-center pt-1.5">
                  <span className={`text-[10px] ${textMutedClass}`}>In Milliseconds: {dateOutput * 1000}</span>
                  <button
                    onClick={() => handleCopyResult(dateOutput.toString())}
                    className={`text-[10px] font-bold flex items-center gap-1 font-sans cursor-pointer ${
                      isLight ? 'text-indigo-600 hover:text-indigo-700' : 'text-indigo-400 hover:text-indigo-300'
                    }`}
                  >
                    {copiedResult ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                    Copy Epoch
                  </button>
                </div>
              </div>
            ) : (
              <p className={`text-xs font-mono text-center ${textMutedClass}`}>Enter a valid Date-Time format string above</p>
            )}
          </div>
        </div>
      </div>

    </div>
  );
}
