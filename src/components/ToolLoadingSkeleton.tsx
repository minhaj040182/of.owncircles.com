import React from 'react';

interface ToolLoadingSkeletonProps {
  themeKey?: string;
}

export const ToolLoadingSkeleton: React.FC<ToolLoadingSkeletonProps> = ({ themeKey = 'obsidian' }) => {
  const isLight = themeKey === 'light';

  return (
    <div 
      role="status" 
      aria-live="polite" 
      aria-label="Loading workspace module"
      className={`w-full min-h-[480px] rounded-2xl border p-6 flex flex-col justify-between transition-all duration-300 animate-pulse ${
        isLight 
          ? 'bg-white border-slate-200/80 shadow-xs' 
          : 'bg-slate-950/40 border-slate-900/80 shadow-xl'
      }`}
    >
      <div className="space-y-6">
        {/* Header toolbar placeholder */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800/30">
          <div className="flex items-center gap-3">
            <div className={`w-9 h-9 rounded-xl ${isLight ? 'bg-slate-200' : 'bg-slate-800'}`} />
            <div className="space-y-2">
              <div className={`h-4 w-44 rounded-md ${isLight ? 'bg-slate-200' : 'bg-slate-800'}`} />
              <div className={`h-2.5 w-60 rounded-md ${isLight ? 'bg-slate-100' : 'bg-slate-850'}`} />
            </div>
          </div>
          <div className="flex items-center gap-2 self-end sm:self-auto">
            <div className={`h-8 w-20 rounded-lg ${isLight ? 'bg-slate-100' : 'bg-slate-850'}`} />
            <div className={`h-8 w-24 rounded-lg ${isLight ? 'bg-slate-200' : 'bg-slate-800'}`} />
          </div>
        </div>

        {/* Action button row */}
        <div className="flex items-center gap-2">
          <div className={`h-8 w-28 rounded-lg ${isLight ? 'bg-indigo-100/70' : 'bg-indigo-950/40'}`} />
          <div className={`h-8 w-20 rounded-lg ${isLight ? 'bg-slate-100' : 'bg-slate-900'}`} />
          <div className={`h-8 w-20 rounded-lg ${isLight ? 'bg-slate-100' : 'bg-slate-900'}`} />
          <div className={`h-8 w-24 rounded-lg hidden sm:block ${isLight ? 'bg-slate-100' : 'bg-slate-900'}`} />
        </div>

        {/* Workspace editor skeleton body */}
        <div className={`w-full h-72 rounded-xl border p-5 font-mono space-y-3.5 ${
          isLight 
            ? 'bg-slate-50 border-slate-200/80' 
            : 'bg-slate-900/50 border-slate-800/80'
        }`}>
          <div className={`h-3 w-1/4 rounded ${isLight ? 'bg-slate-200' : 'bg-slate-800'}`} />
          <div className={`h-3 w-3/5 rounded ${isLight ? 'bg-slate-200' : 'bg-slate-800'}`} />
          <div className={`h-3 w-2/5 rounded ${isLight ? 'bg-slate-200' : 'bg-slate-800'}`} />
          <div className={`h-3 w-4/5 rounded ${isLight ? 'bg-slate-200' : 'bg-slate-800'}`} />
          <div className={`h-3 w-1/3 rounded ${isLight ? 'bg-slate-200' : 'bg-slate-800'}`} />
          <div className={`h-3 w-1/2 rounded ${isLight ? 'bg-slate-200' : 'bg-slate-800'}`} />
        </div>
      </div>

      {/* Footer status bar */}
      <div className="flex items-center justify-between pt-4 border-t border-slate-800/30 text-xs">
        <div className="flex items-center gap-2.5">
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-indigo-500"></span>
          </span>
          <span className={`text-xs font-mono font-medium ${isLight ? 'text-slate-500' : 'text-slate-400'}`}>
            Loading developer workspace module...
          </span>
        </div>
        <div className={`h-3 w-28 rounded ${isLight ? 'bg-slate-200' : 'bg-slate-800'}`} />
      </div>
    </div>
  );
};

export default ToolLoadingSkeleton;
