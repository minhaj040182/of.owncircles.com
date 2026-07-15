import React, { useState } from 'react';
import { 
  Braces, FileText, FileCode, Database, Minimize2, Network, Terminal, Key, Clock, 
  AlignLeft, Hash, QrCode, BookOpen, Sparkles, Search, FileSpreadsheet, Palette, 
  Binary, Compass, AlertCircle, RefreshCw, Columns, Star, History
} from 'lucide-react';
import { ToolId, ToolDefinition } from '../types';

interface HomeToolProps {
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
  tools: ToolDefinition[];
  favorites?: ToolId[];
  toggleFavorite?: (id: ToolId) => void;
  recents?: ToolId[];
  onSelectTool: (id: ToolId, source?: 'normal' | 'favorite' | 'recent') => void;
}

export default function HomeTool({ theme, tools, favorites = [], toggleFavorite, recents = [], onSelectTool }: HomeToolProps) {
  const [localQuery, setLocalQuery] = useState<string>('');

  const isLight = theme?.isDark === false;
  const borderClass = theme?.border || 'border-slate-800/80';
  const cardClass = theme?.card || 'bg-slate-900/50';
  const inputBgClass = theme?.inputBg || 'bg-slate-950';
  const textMutedClass = theme?.textMuted || 'text-slate-400';

  const getToolIcon = (id: ToolId) => {
    switch (id) {
      case 'json': return <Braces className="w-5 h-5 text-indigo-400" />;
      case 'yaml': return <FileText className="w-5 h-5 text-violet-400" />;
      case 'xml': return <FileCode className="w-5 h-5 text-indigo-400" />;
      case 'sql': return <Database className="w-5 h-5 text-indigo-400" />;
      case 'minify': return <Minimize2 className="w-5 h-5 text-violet-400" />;
      case 'api': return <Network className="w-5 h-5 text-emerald-400" />;
      case 'base64': return <Terminal className="w-5 h-5 text-cyan-400" />;
      case 'url': return <Terminal className="w-5 h-5 text-cyan-400" />;
      case 'html': return <Terminal className="w-5 h-5 text-cyan-400" />;
      case 'jwt': return <Key className="w-5 h-5 text-amber-400" />;
      case 'timestamp': return <Clock className="w-5 h-5 text-amber-400" />;
      case 'text': return <AlignLeft className="w-5 h-5 text-amber-400" />;
      case 'hash': return <Hash className="w-5 h-5 text-amber-400" />;
      case 'uuid': return <Key className="w-5 h-5 text-amber-400" />;
      case 'qrcode': return <QrCode className="w-5 h-5 text-amber-400" />;
      case 'markdown': return <BookOpen className="w-5 h-5 text-amber-400" />;
      case 'csv': return <FileSpreadsheet className="w-5 h-5 text-indigo-400" />;
      case 'color': return <Palette className="w-5 h-5 text-emerald-400" />;
      case 'base': return <Binary className="w-5 h-5 text-cyan-400" />;
      case 'cron': return <Clock className="w-5 h-5 text-amber-400" />;
      case 'regex': return <Search className="w-5 h-5 text-amber-400" />;
      case 'diff': return <Columns className="w-5 h-5 text-slate-400" />;
      default: return <Sparkles className="w-5 h-5 text-indigo-400" />;
    }
  };

  const getCategoryTheme = (category: string) => {
    switch (category) {
      case 'formatter': return 'from-indigo-500/10 to-violet-500/5 border-indigo-500/20 text-indigo-400';
      case 'network': return 'from-emerald-500/10 to-teal-500/5 border-emerald-500/20 text-emerald-400';
      case 'encoder': return 'from-cyan-500/10 to-blue-500/5 border-cyan-500/20 text-cyan-400';
      case 'utility': return 'from-amber-500/10 to-orange-500/5 border-amber-500/20 text-amber-400';
      default: return 'from-slate-500/10 to-slate-500/5 border-slate-500/20 text-slate-400';
    }
  };

  const getHumanCategory = (category: string) => {
    switch (category) {
      case 'formatter': return 'Formatters & Beautifiers';
      case 'network': return 'REST Client Systems';
      case 'encoder': return 'Encoders & Decoders';
      case 'utility': return 'Security & String Utilities';
      default: return 'General Purpose Utilities';
    }
  };

  const filtered = tools.filter(tool =>
    tool.name.toLowerCase().includes(localQuery.toLowerCase()) ||
    tool.description.toLowerCase().includes(localQuery.toLowerCase()) ||
    tool.id.toLowerCase().includes(localQuery.toLowerCase())
  );

  // Group filtered tools by categories
  const categories = ['formatter', 'network', 'encoder', 'utility'] as const;

  return (
    <div className="space-y-8" id="ownformatters-home-panel">
      
      {/* Inline Search Dashboard Header */}
      <div className={`p-6 md:p-8 border rounded-2xl bg-gradient-to-br ${isLight ? 'from-slate-50 to-indigo-50/30 border-slate-200' : 'from-slate-900/40 to-indigo-950/20 border-slate-800'} space-y-4`}>
        <div className="space-y-1.5">
          <span className="text-[10px] font-bold font-mono tracking-widest text-indigo-500 uppercase block">Active Search Portal</span>
          <h3 className={`text-xl font-bold font-sans ${isLight ? 'text-slate-800' : 'text-white'}`}>Explore & Filter Utility Suite</h3>
          <p className={`text-xs ${textMutedClass} max-w-xl leading-relaxed`}>
            Instantly filter through formatters, security checks, and encoders. Everything executes completely local within your sandboxed browser thread.
          </p>
        </div>

        <div className="relative max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-500" />
          </span>
          <input
            type="text"
            placeholder="Filter by name, description, tags..."
            className={`w-full ${inputBgClass} border ${borderClass} hover:border-slate-800/40 text-xs ${theme?.text} rounded-xl pl-10 pr-4 py-3 focus:outline-none focus:border-indigo-500 font-sans transition-colors placeholder:text-slate-500`}
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
          />
        </div>
      </div>

      {/* FAVORITE & LAST VISITED TOOLS GRID */}
      {localQuery.trim() === '' && (favorites.length > 0 || recents.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Favorite Tools Section */}
          {favorites.length > 0 && (
            <div className={`p-6 border rounded-2xl ${cardClass} ${borderClass} space-y-4 bg-gradient-to-br from-amber-500/5 via-transparent to-transparent`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-500">
                    <Star className="w-4 h-4 fill-amber-500 text-amber-500" />
                  </span>
                  <h4 className={`text-xs font-bold font-mono uppercase tracking-wider ${isLight ? 'text-slate-800' : 'text-white'}`}>
                    Favorite Tools
                  </h4>
                </div>
                <span className={`text-[10px] font-mono ${textMutedClass}`}>
                  {favorites.length} Favorites
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {tools.filter(t => favorites.includes(t.id)).map(tool => (
                  <div
                    key={`pin-card-${tool.id}`}
                    onClick={() => onSelectTool(tool.id, 'favorite')}
                    className={`p-3.5 border rounded-xl cursor-pointer hover:-translate-y-0.5 hover:shadow-sm transition-all flex items-center justify-between group bg-slate-900/10 hover:bg-slate-900/30 dark:bg-slate-950/20 dark:hover:bg-indigo-950/20 ${borderClass}`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="shrink-0">
                        {getToolIcon(tool.id)}
                      </span>
                      <span className={`text-xs font-bold font-sans truncate ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                        {tool.name.replace(/Formatter|Validator|Generator|Tester|Converter|Debugger/gi, '').trim()}
                      </span>
                    </div>
                    {toggleFavorite && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleFavorite(tool.id);
                        }}
                        className="text-amber-500 hover:text-slate-500 p-1 shrink-0 cursor-pointer"
                        title="Remove from Favorites"
                      >
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Last Visited Tools Section */}
          {recents.length > 0 && (
            <div className={`p-6 border rounded-2xl ${cardClass} ${borderClass} space-y-4 bg-gradient-to-br from-indigo-500/5 via-transparent to-transparent`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-400">
                    <History className="w-4 h-4" />
                  </span>
                  <h4 className={`text-xs font-bold font-mono uppercase tracking-wider ${isLight ? 'text-slate-800' : 'text-white'}`}>
                    Last Visited Tools
                  </h4>
                </div>
                <span className={`text-[10px] font-mono ${textMutedClass}`}>
                  Last Visited
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {tools.filter(t => recents.includes(t.id))
                  .sort((a, b) => recents.indexOf(a.id) - recents.indexOf(b.id))
                  .slice(0, 4)
                  .map(tool => (
                    <div
                      key={`recent-card-${tool.id}`}
                      onClick={() => onSelectTool(tool.id, 'recent')}
                      className={`p-3.5 border rounded-xl cursor-pointer hover:-translate-y-0.5 hover:shadow-sm transition-all flex items-center justify-between group bg-slate-900/10 hover:bg-slate-900/30 dark:bg-slate-950/20 dark:hover:bg-indigo-950/20 ${borderClass}`}
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="shrink-0">
                          {getToolIcon(tool.id)}
                        </span>
                        <span className={`text-xs font-bold font-sans truncate ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>
                          {tool.name.replace(/Formatter|Validator|Generator|Tester|Converter|Debugger/gi, '').trim()}
                        </span>
                      </div>
                      <span className="text-[9px] font-mono opacity-50 group-hover:opacity-100 transition-opacity text-indigo-400 shrink-0">
                        Go →
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Categories block */}
      {categories.map((category) => {
        const categoryTools = filtered.filter(t => t.category === category);
        if (categoryTools.length === 0) return null;

        return (
          <div key={category} className="space-y-3.5">
            <h4 className={`text-xs font-bold font-mono uppercase tracking-wider px-1 ${
              category === 'formatter' ? (isLight ? 'text-indigo-650' : 'text-indigo-400') :
              category === 'network' ? (isLight ? 'text-emerald-750' : 'text-emerald-400') :
              category === 'encoder' ? (isLight ? 'text-cyan-750' : 'text-cyan-400') :
              (isLight ? 'text-amber-700' : 'text-amber-400')
            }`}>
              {getHumanCategory(category)} ({categoryTools.length})
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categoryTools.map((tool) => (
                <div
                  key={tool.id}
                  onClick={() => onSelectTool(tool.id, 'normal')}
                  className={`border rounded-xl p-5 cursor-pointer bg-gradient-to-br hover:scale-[1.01] hover:-translate-y-0.5 shadow-sm hover:shadow-md transition-all group flex flex-col justify-between h-36 ${cardClass} ${borderClass} ${getCategoryTheme(category)}`}
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <span className="shrink-0 p-1.5 rounded-lg bg-slate-900/40 border border-slate-800/40">
                          {getToolIcon(tool.id)}
                        </span>
                        <h5 className={`text-xs font-bold font-sans transition-colors group-hover:text-indigo-450 truncate ${isLight ? 'text-slate-900' : 'text-white'}`}>
                          {tool.name}
                        </h5>
                      </div>
                      {toggleFavorite && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            toggleFavorite(tool.id);
                          }}
                          className="p-1 rounded-lg hover:bg-slate-800/20 text-slate-500 hover:text-amber-500 transition-colors shrink-0 cursor-pointer"
                          title={favorites.includes(tool.id) ? "Remove from Favorites" : "Add to Favorites"}
                        >
                          <Star className={`w-3.5 h-3.5 ${favorites.includes(tool.id) ? 'fill-amber-400 text-amber-400' : ''}`} />
                        </button>
                      )}
                    </div>
                    <p className={`text-[11px] leading-relaxed line-clamp-2 ${textMutedClass}`}>
                      {tool.description}
                    </p>
                  </div>

                  <span className="text-[9px] font-mono font-bold uppercase self-end tracking-wider flex items-center gap-1 opacity-60 group-hover:opacity-100 transition-opacity">
                    Launch Tool <Compass className="w-3 h-3" />
                  </span>
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {filtered.length === 0 && (
        <div className={`p-8 text-center border border-dashed rounded-xl ${borderClass}`}>
          <AlertCircle className="w-8 h-8 text-slate-500 mx-auto mb-2" />
          <p className={`text-xs font-mono ${textMutedClass}`}>No matching utilities found for "{localQuery}"</p>
        </div>
      )}

    </div>
  );
}
