import React from 'react';
import { Sparkles, Database, ShieldCheck, Cpu } from 'lucide-react';

interface LoadingProgressBarProps {
  progress: number;
  stageMessage: string;
  loadedCount?: number;
}

export const LoadingProgressBar: React.FC<LoadingProgressBarProps> = ({
  progress,
  stageMessage,
  loadedCount = 0
}) => {
  return (
    <div className="w-full bg-white border border-blue-100 rounded-3xl p-6 shadow-md space-y-4 my-4 animate-fadeIn">
      {/* Header Info */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-600 text-white flex items-center justify-center font-black shadow-md shrink-0">
            <Cpu className="w-5 h-5 animate-spin" />
          </div>
          <div>
            <div className="text-xs font-black uppercase tracking-wider text-blue-600 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Initializing Video Catalog & AI Pulse</span>
            </div>
            <h3 className="text-sm font-extrabold text-slate-900 mt-0.5">
              {stageMessage || 'Fetching product reviews from database...'}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          {loadedCount > 0 && (
            <span className="text-[11px] font-extrabold bg-blue-50 text-blue-700 px-3 py-1 rounded-full border border-blue-200 flex items-center gap-1">
              <Database className="w-3.5 h-3.5" />
              {loadedCount} Reviews Processed
            </span>
          )}
          <span className="text-sm font-black text-blue-600 font-mono bg-slate-100 px-3 py-1 rounded-xl">
            {Math.min(100, Math.round(progress))}%
          </span>
        </div>
      </div>

      {/* Progress Bar Container */}
      <div className="relative w-full h-3.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-slate-200">
        <div
          className="h-full bg-gradient-to-r from-blue-600 via-indigo-600 to-emerald-500 rounded-full transition-all duration-300 ease-out shadow-xs relative"
          style={{ width: `${Math.max(4, Math.min(100, progress))}%` }}
        >
          {/* Animated Glow Effect */}
          <div className="absolute inset-0 bg-white/20 animate-pulse rounded-full" />
        </div>
      </div>

      {/* Footer Sub-steps */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[11px] font-bold text-slate-500">
        <div className={`flex items-center gap-1.5 ${progress >= 25 ? 'text-blue-600' : 'opacity-50'}`}>
          <span className={`w-2 h-2 rounded-full ${progress >= 25 ? 'bg-blue-600' : 'bg-slate-300'}`} />
          <span>1. Database Sync</span>
        </div>
        <div className={`flex items-center gap-1.5 ${progress >= 50 ? 'text-indigo-600' : 'opacity-50'}`}>
          <span className={`w-2 h-2 rounded-full ${progress >= 50 ? 'bg-indigo-600' : 'bg-slate-300'}`} />
          <span>2. Comments Sentiment</span>
        </div>
        <div className={`flex items-center gap-1.5 ${progress >= 75 ? 'text-purple-600' : 'opacity-50'}`}>
          <span className={`w-2 h-2 rounded-full ${progress >= 75 ? 'bg-purple-600' : 'bg-slate-300'}`} />
          <span>3. AI Pulse Analysis</span>
        </div>
        <div className={`flex items-center gap-1.5 ${progress >= 95 ? 'text-emerald-600' : 'opacity-50'}`}>
          <span className={`w-2 h-2 rounded-full ${progress >= 95 ? 'bg-emerald-600' : 'bg-slate-300'}`} />
          <span>4. Home Partitioning</span>
        </div>
      </div>
    </div>
  );
};
