import React, { useState, useEffect } from 'react';
import { 
  BookOpen, 
  Search, 
  Copy, 
  Check, 
  ExternalLink, 
  ArrowLeft, 
  HelpCircle, 
  Lightbulb, 
  CheckCircle, 
  Zap, 
  Play, 
  ChevronRight, 
  Bookmark, 
  Share2,
  Lock,
  Compass
} from 'lucide-react';
import { EDUCATION_DATA, getEducationTopic, EducationTopic } from '../data/educationContent';
import { ToolId, ToolDefinition } from '../types';

// We import the static tool list to show guides for all available tools
// Since they are defined in App.tsx or inside lists, let's keep a complete list of searchable educational categories.
const EDUCATIONAL_TOPICS_LIST = [
  { id: 'json', name: 'JSON Formatter & Validator', category: 'formatter' },
  { id: 'jsonschema', name: 'JSON Schema Generator', category: 'formatter' },
  { id: 'jsonpath', name: 'JSONPath Tester', category: 'formatter' },
  { id: 'jsontocode', name: 'JSON to Code Generator', category: 'formatter' },
  { id: 'yaml', name: 'YAML <-> JSON Converter', category: 'formatter' },
  { id: 'xml', name: 'XML Formatter & Beautifier', category: 'formatter' },
  { id: 'sql', name: 'SQL Formatter & Query Optimizer', category: 'formatter' },
  { id: 'minify', name: 'HTML, CSS & JS Code Minifier', category: 'formatter' },
  { id: 'jwt', name: 'JWT Security Debugger', category: 'security' },
  { id: 'regex', name: 'Regular Expressions (RegEx)', category: 'utility' },
  { id: 'cron', name: 'Cron Expression Scheduler', category: 'utility' },
  { id: 'timestamp', name: 'Epoch Timestamp Converter', category: 'utility' },
  { id: 'base64', name: 'Base64 Encoder & Decoder', category: 'encoder' },
  { id: 'url', name: 'URL Encoder & Decoder', category: 'encoder' },
  { id: 'hash', name: 'Cryptographic Hash Generator', category: 'security' },
  { id: 'uuid', name: 'UUID/GUID Key Generator', category: 'security' },
  { id: 'qrcode', name: 'QR Code Generator', category: 'utility' },
  { id: 'markdown', name: 'Markdown Editor & Previewer', category: 'formatter' },
  { id: 'csv', name: 'CSV to JSON/XML Converter', category: 'formatter' },
  { id: 'color', name: 'Color Converter & Palettes', category: 'utility' },
  { id: 'base', name: 'Number Base Converter', category: 'utility' },
  { id: 'diff', name: 'Text Diff Finder', category: 'utility' },
  { id: 'text', name: 'Text Case & Word Counters', category: 'utility' },
  { id: 'api', name: 'REST API Request Tester', category: 'network' },
  { id: 'graphql', name: 'GraphQL Query Tester', category: 'network' },
  { id: 'openapi', name: 'OpenAPI Schema Viewer', category: 'network' },
  { id: 'webhook', name: 'Webhook Request Inspector', category: 'network' },
  { id: 'mockapi', name: 'Mock API Server Builder', category: 'network' },
  { id: 'indexnow', name: 'IndexNow URL Submitter', category: 'network' },
  { id: 'docker', name: 'Docker Compose Validator', category: 'devops' },
  { id: 'k8s', name: 'Kubernetes YAML Validator', category: 'devops' },
  { id: 'nginx', name: 'Nginx Config Formatter', category: 'devops' }
];

interface EducationToolProps {
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
  activeTopicId?: string; // Passed down from route parser in App.tsx
  onSelectTopic?: (topicId: string) => void; // Callback to push route & state in App.tsx
  onLaunchTool?: (toolId: any) => void; // Launch the live interactive tool
}

export default function EducationTool({ 
  theme, 
  activeTopicId = 'json', 
  onSelectTopic, 
  onLaunchTool 
}: EducationToolProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [copied, setCopied] = useState(false);
  const [expandedFaqIndex, setExpandedFaqIndex] = useState<number | null>(null);

  const cardClass = theme?.card || 'bg-slate-900/50';
  const borderClass = theme?.border || 'border-slate-800/80';
  const textMutedClass = theme?.textMuted || 'text-slate-400';
  const inputBgClass = theme?.inputBg || 'bg-slate-950';

  // Get active topic data
  const currentItem = EDUCATIONAL_TOPICS_LIST.find(t => t.id === activeTopicId) || EDUCATIONAL_TOPICS_LIST[0];
  const topicData = getEducationTopic(currentItem.id, currentItem.name, currentItem.category);

  // Filter topics based on search query
  const filteredTopics = EDUCATIONAL_TOPICS_LIST.filter(topic => 
    topic.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    topic.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
    topic.category.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCopyCode = (code: string) => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleFaq = (index: number) => {
    setExpandedFaqIndex(prev => prev === index ? null : index);
  };

  const handleSelectLocalTopic = (id: string) => {
    if (onSelectTopic) {
      onSelectTopic(id);
    }
    // Collapse any open FAQs upon switching topics
    setExpandedFaqIndex(null);
  };

  return (
    <div className="space-y-6 animate-fade-in text-left">
      {/* Search Header Banner */}
      <div className={`p-6 rounded-2xl ${cardClass} border ${borderClass} relative overflow-hidden shadow-xl`}>
        <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="flex flex-col md:flex-row gap-5 items-start md:items-center justify-between relative z-10">
          <div className="space-y-1.5 max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <BookOpen className="w-3 h-3" />
              <span>Developer Reference & FAQ Hub</span>
            </div>
            <h2 className="text-xl font-black flex items-center gap-2">
              OwnFormatters Education Center
            </h2>
            <p className={`text-xs ${textMutedClass} leading-relaxed`}>
              In-depth technical guides, specifications, best practices, and frequently asked questions for high-speed offline local utilities.
            </p>
          </div>
          
          <div className="relative w-full md:w-72">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            <input 
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search guides & specs..."
              className={`w-full text-xs pl-9 pr-4 py-2 rounded-xl border ${borderClass} ${inputBgClass} focus:outline-none focus:border-indigo-500 transition-colors`}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Sidebar with full list of guides */}
        <div className="lg:col-span-4 space-y-4">
          <div className={`p-4 rounded-2xl ${cardClass} border ${borderClass} space-y-3 shadow-md max-h-[640px] overflow-y-auto`}>
            <p className="text-[10px] font-black tracking-wider text-indigo-400 uppercase">
              Select Educational Guide ({filteredTopics.length})
            </p>

            <div className="space-y-1">
              {filteredTopics.map((topic) => {
                const isActive = topic.id === activeTopicId;
                return (
                  <button
                    key={topic.id}
                    onClick={() => handleSelectLocalTopic(topic.id)}
                    className={`w-full px-3.5 py-2.5 rounded-xl text-xs text-left font-medium transition flex items-center justify-between gap-2 border cursor-pointer ${
                      isActive 
                        ? 'bg-indigo-600 border-indigo-500 text-white font-bold shadow-lg shadow-indigo-600/15'
                        : theme?.id === 'light'
                          ? 'bg-white border-slate-100 hover:bg-slate-50 text-slate-700 hover:border-slate-200'
                          : 'bg-slate-950/40 border-transparent hover:bg-slate-950/90 text-slate-400 hover:text-white'
                    }`}
                  >
                    <div className="truncate pr-1">
                      <p className="truncate">{topic.name}</p>
                      <p className={`text-[9px] uppercase tracking-wider font-mono mt-0.5 ${isActive ? 'text-indigo-200' : 'text-slate-500'}`}>
                        {topic.category}
                      </p>
                    </div>
                    <ChevronRight className={`w-3.5 h-3.5 flex-shrink-0 transition-transform ${isActive ? 'translate-x-0.5' : 'text-slate-600'}`} />
                  </button>
                );
              })}

              {filteredTopics.length === 0 && (
                <div className="py-6 text-center text-xs text-slate-500 space-y-1">
                  <p>No guides match "{searchQuery}"</p>
                  <button 
                    onClick={() => setSearchQuery('')}
                    className="text-indigo-400 hover:underline font-bold"
                  >
                    Clear Filter
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Privacy Integrity Banner */}
          <div className={`p-4 rounded-2xl border ${borderClass} ${theme?.id === 'light' ? 'bg-indigo-50/50' : 'bg-slate-950/20'} space-y-2`}>
            <div className="flex items-center gap-1.5 text-xs font-bold text-indigo-400">
              <Lock className="w-3.5 h-3.5" />
              <span>Absolute Privacy Compliance</span>
            </div>
            <p className="text-[10px] text-slate-500 leading-relaxed">
              We collect no search queries, reading patterns, or telemetry metrics from your visits to these handbook pages. Learn without tracking.
            </p>
          </div>
        </div>

        {/* Right Column: Educational Guide Body */}
        <div className="lg:col-span-8 space-y-6">
          {/* Main Handbook Content */}
          <div className={`p-6 md:p-8 rounded-2xl ${cardClass} border ${borderClass} space-y-6 shadow-md relative`}>
            {/* Topic Title */}
            <div className="space-y-2.5 border-b pb-5 border-slate-800/20">
              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                theme?.id === 'light' ? 'bg-indigo-100 text-indigo-700' : 'bg-indigo-500/10 text-indigo-400'
              }`}>
                {currentItem.category} Specification
              </span>
              <h1 className="text-2xl md:text-3xl font-black tracking-tight leading-none text-slate-100">
                {topicData.title} Handbook
              </h1>
              <p className={`text-sm ${textMutedClass} leading-relaxed`}>
                {topicData.shortDesc}
              </p>
            </div>

            {/* Technical Definition */}
            <div className="space-y-3 text-left">
              <h3 className="text-sm font-black flex items-center gap-1.5 text-slate-200">
                <Compass className="w-4 h-4 text-indigo-400" />
                Technical Definition & Overview
              </h3>
              <p className={`text-xs leading-relaxed ${textMutedClass}`}>
                {topicData.definition}
              </p>
            </div>

            {/* Grid for Use Cases and Best Practices */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
              {/* Core Use Cases */}
              <div className="space-y-3.5">
                <h4 className="text-xs font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                  <CheckCircle className="w-4 h-4" />
                  Primary Use Cases
                </h4>
                <ul className="space-y-2">
                  {topicData.useCases.map((useCase, idx) => (
                    <li key={idx} className="text-xs flex items-start gap-2 text-slate-300">
                      <span className="text-[10px] text-emerald-500 mt-0.5">●</span>
                      <span>{useCase}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Development Best Practices */}
              <div className="space-y-3.5">
                <h4 className="text-xs font-black uppercase tracking-wider text-indigo-400 flex items-center gap-1.5">
                  <Lightbulb className="w-4 h-4" />
                  Best Practices & Rules
                </h4>
                <ul className="space-y-2">
                  {topicData.bestPractices.map((rule, idx) => (
                    <li key={idx} className="text-xs flex items-start gap-2 text-slate-300">
                      <span className="text-[10px] text-indigo-500 mt-0.5">▪</span>
                      <span>{rule}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* Syntax Example Block */}
            <div className="space-y-3.5 pt-2">
              <div className="flex items-center justify-between">
                <h4 className="text-xs font-black uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Play className="w-3.5 h-3.5 text-slate-500" />
                  {topicData.exampleLabel}
                </h4>
                <button
                  onClick={() => handleCopyCode(topicData.exampleCode)}
                  className="px-2.5 py-1 rounded bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-400 hover:text-slate-200 text-[10px] font-mono flex items-center gap-1 transition cursor-pointer"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{copied ? 'Copied' : 'Copy'}</span>
                </button>
              </div>
              <pre className="p-4 rounded-xl border border-slate-800 bg-slate-950 overflow-x-auto text-xs font-mono text-emerald-300 leading-relaxed max-h-[280px]">
                <code>{topicData.exampleCode}</code>
              </pre>
            </div>

            {/* Interactive FAQs Section */}
            <div className="space-y-4 pt-4 border-t border-slate-800/35">
              <h3 className="text-sm font-black flex items-center gap-1.5 text-slate-200">
                <HelpCircle className="w-4 h-4 text-purple-400" />
                Frequently Asked Questions (FAQ)
              </h3>
              
              <div className="space-y-2.5">
                {topicData.faqs.map((faq, idx) => {
                  const isExpanded = expandedFaqIndex === idx;
                  return (
                    <div 
                      key={idx} 
                      className={`rounded-xl border transition ${
                        isExpanded 
                          ? 'border-indigo-500/40 bg-indigo-500/5' 
                          : 'border-slate-800/50 hover:border-slate-750 bg-slate-950/20'
                      }`}
                    >
                      <button
                        onClick={() => toggleFaq(idx)}
                        className="w-full px-4 py-3.5 text-left text-xs font-black flex items-center justify-between gap-3 text-slate-200 focus:outline-none cursor-pointer"
                      >
                        <span className="leading-snug">{faq.question}</span>
                        <ChevronRight className={`w-4 h-4 text-slate-500 flex-shrink-0 transition-transform ${isExpanded ? 'rotate-90 text-indigo-400' : ''}`} />
                      </button>
                      
                      {isExpanded && (
                        <div className="px-4 pb-4 text-xs text-slate-400 leading-relaxed border-t border-slate-800/30 pt-3 animate-fade-in text-left">
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* CTA Launcher Section */}
            <div className="mt-8 p-5 rounded-xl border border-indigo-500/30 bg-gradient-to-r from-indigo-950/40 via-purple-950/15 to-indigo-950/40 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="space-y-1 text-left">
                <p className="text-xs font-bold text-indigo-300 flex items-center gap-1.5">
                  <Zap className="w-4 h-4 text-amber-400" />
                  Ready to process your data?
                </p>
                <p className="text-[11px] text-slate-400">
                  Open the fully local, serverless {currentItem.name} workspace.
                </p>
              </div>

              <button
                onClick={() => onLaunchTool && onLaunchTool(currentItem.id)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer shadow-md shadow-indigo-500/10 self-stretch sm:self-auto justify-center"
              >
                <span>Launch Interactive Tool</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}
