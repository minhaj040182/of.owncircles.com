import React, { useState } from 'react';
import { Copy, Check, Trash2, Code, Sparkles, AlertCircle, CheckCircle, Eye, Edit3, BookOpen } from 'lucide-react';

function compileMarkdown(markdown: string, isLight: boolean): string {
  let html = markdown;

  // Escape HTML tags to prevent XSS in sandbox preview
  html = html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  // Code Blocks
  html = html.replace(/```([\s\S]*?)```/g, isLight 
    ? '<pre class="bg-slate-50 border border-slate-200 p-4 rounded-xl font-mono text-xs my-3 text-indigo-900 block whitespace-pre overflow-x-auto">$1</pre>'
    : '<pre class="bg-slate-900 border border-slate-850 p-4 rounded-xl font-mono text-xs my-3 text-indigo-300 block whitespace-pre overflow-x-auto">$1</pre>');

  // Inline Code
  html = html.replace(/`([^`]+)`/g, isLight
    ? '<code class="bg-indigo-100 border border-indigo-200 text-indigo-900 font-mono text-xs px-1.5 py-0.5 rounded">$1</code>'
    : '<code class="bg-indigo-950/50 border border-indigo-900/30 text-indigo-300 font-mono text-xs px-1.5 py-0.5 rounded">$1</code>');

  // Headers (H1-H4)
  html = html.replace(/^#### (.*?)$/gm, isLight
    ? '<h4 class="text-sm font-bold text-slate-850 mt-4 mb-2">$1</h4>'
    : '<h4 class="text-sm font-bold text-slate-200 mt-4 mb-2">$1</h4>');
  html = html.replace(/^### (.*?)$/gm, isLight
    ? '<h3 class="text-base font-bold text-slate-850 mt-5 mb-2">$1</h3>'
    : '<h3 class="text-base font-bold text-slate-200 mt-5 mb-2">$1</h3>');
  html = html.replace(/^## (.*?)$/gm, isLight
    ? '<h2 class="text-lg font-bold text-slate-900 mt-6 mb-3 border-b border-slate-200 pb-1">$1</h2>'
    : '<h2 class="text-lg font-bold text-white mt-6 mb-3 border-b border-slate-900 pb-1">$1</h2>');
  html = html.replace(/^# (.*?)$/gm, isLight
    ? '<h1 class="text-2xl font-black text-slate-900 mt-8 mb-4 border-b border-slate-200 pb-2">$1</h1>'
    : '<h1 class="text-2xl font-black text-white mt-8 mb-4 border-b border-slate-900 pb-2">$1</h1>');

  // Blockquotes
  html = html.replace(/^> (.*?)$/gm, isLight
    ? '<blockquote class="border-l-4 border-indigo-500 pl-4 py-1.5 italic text-slate-650 bg-slate-100/60 my-3 rounded-r-lg">$1</blockquote>'
    : '<blockquote class="border-l-4 border-indigo-500 pl-4 py-1.5 italic text-slate-400 bg-slate-950/40 my-3 rounded-r-lg">$1</blockquote>');

  // Lists (Unordered)
  html = html.replace(/^\s*[\-\*]\s+(.*?)$/gm, isLight
    ? '<li class="list-disc ml-5 my-1 text-slate-700">$1</li>'
    : '<li class="list-disc ml-5 my-1 text-slate-300">$1</li>');

  // Bold & Italic
  html = html.replace(/\*\*([^\*]+)\*\*/g, '<strong>$1</strong>');
  html = html.replace(/\*([^\*]+)\*/g, '<em>$1</em>');

  // Links
  html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, isLight
    ? '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-indigo-650 hover:underline hover:text-indigo-750 font-semibold">$1</a>'
    : '<a href="$2" target="_blank" rel="noopener noreferrer" class="text-indigo-400 hover:underline hover:text-indigo-300">$1</a>');

  // Paragraphs (Separate empty line groupings)
  const lines = html.split('\n');
  let compiledLines = lines.map(line => {
    const isTag = /^\s*<[a-z]+/i.test(line);
    if (!line.trim()) return '';
    if (isTag) return line;
    return `<p class="my-2.5 text-xs ${isLight ? 'text-slate-700' : 'text-slate-300'} leading-relaxed">${line}</p>`;
  });

  return compiledLines.join('\n');
}

const SAMPLE_MARKDOWN = `# Welcome to OwnFormatters Editor!

## A Split-Pane Markdown Sandbox

This client-side utility translates **Markdown** structures into clean compiled HTML code instantly.

### Core Syntax Capabilities
- **Bold accents** and *italicized text elements*.
- Inline \`const workspace = true;\` snippets.
- Unordered bullets lists:
  - Standard indentation
  - Clean margins
- Interactive hyperlink anchor connections: [Visit OwnFormatter](https://ownformatters.com)

> "Markdown is an exceptionally powerful, lightweight markup language that guarantees formatting uniformity across the web."

### Live Source Code Syntax
\`\`\`javascript
function calculateHashEntropy(pwd) {
  const poolSize = 94; // Standard printable ascii characters
  return pwd.length * Math.log2(poolSize);
}
\`\`\`

Feel free to delete this sample template and paste your custom document!`;

interface MarkdownToolProps {
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

export default function MarkdownTool({ theme }: MarkdownToolProps) {
  const [input, setInput] = useState<string>(SAMPLE_MARKDOWN);
  const [copied, setCopied] = useState<boolean>(false);
  const [copiedHtml, setCopiedHtml] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'split' | 'edit' | 'preview'>('split');

  const borderClass = theme?.border || 'border-slate-800/80';
  const borderMutedClass = theme?.borderMuted || 'border-slate-850';
  const cardClass = theme?.card || 'bg-slate-900/50';
  const inputBgClass = theme?.inputBg || 'bg-slate-950';
  const panelBgClass = theme?.panelBg || 'bg-slate-900';
  const textClass = theme?.text || 'text-slate-200';
  const textMutedClass = theme?.textMuted || 'text-slate-400';
  const canvasBgClass = theme?.canvasBg || 'bg-[#02050c]';
  const isLight = theme?.isDark === false;

  const compiledHtml = compileMarkdown(input, isLight);

  const handleCopyMarkdown = () => {
    navigator.clipboard.writeText(input);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyHtml = () => {
    navigator.clipboard.writeText(compiledHtml);
    setCopiedHtml(true);
    setTimeout(() => setCopiedHtml(false), 2000);
  };

  const handleClear = () => {
    setInput('');
  };

  const handleLoadSample = () => {
    setInput(SAMPLE_MARKDOWN);
  };

  return (
    <div className="space-y-6" id="markdown-sandbox-tool">
      
      {/* Settings Panel */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border p-4 rounded-xl ${cardClass} ${borderClass}`}>
        <div className={`flex items-center gap-1.5 p-1 rounded-lg border ${
          isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-950 border-slate-900'
        }`}>
          <button
            onClick={() => setActiveTab('split')}
            className={`px-3 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'split' 
                ? (isLight ? 'bg-indigo-600 text-white shadow-xs' : 'bg-indigo-600 text-white') 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Split Screen
          </button>
          <button
            onClick={() => setActiveTab('edit')}
            className={`px-3 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'edit' 
                ? (isLight ? 'bg-indigo-600 text-white shadow-xs' : 'bg-indigo-600 text-white') 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Edit3 className="w-3.5 h-3.5 inline mr-1" />
            Editor Only
          </button>
          <button
            onClick={() => setActiveTab('preview')}
            className={`px-3 py-1 rounded text-xs font-semibold transition-all cursor-pointer ${
              activeTab === 'preview' 
                ? (isLight ? 'bg-indigo-600 text-white shadow-xs' : 'bg-indigo-600 text-white') 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Eye className="w-3.5 h-3.5 inline mr-1" />
            Live Preview
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleLoadSample}
            className={`border px-3 py-1.5 rounded-lg transition-all text-xs font-semibold cursor-pointer ${
              isLight 
                ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700' 
                : 'bg-slate-950 hover:bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            Load Example Template
          </button>
          <span className={`hidden md:inline ${isLight ? 'text-slate-300' : 'text-slate-500'}`}>|</span>
          <button
            onClick={handleCopyHtml}
            className={`border px-3 py-1.5 rounded-lg transition-all text-xs font-semibold flex items-center gap-1 cursor-pointer ${
              isLight 
                ? 'bg-indigo-50 hover:bg-indigo-100 border-indigo-200 text-indigo-700 font-bold' 
                : 'bg-slate-900 hover:bg-slate-800 border-slate-800 text-indigo-300 hover:text-white'
            }`}
          >
            {copiedHtml ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Code className="w-3.5 h-3.5" />}
            <span>Copy Raw HTML</span>
          </button>
        </div>
      </div>

      {/* Editor & Preview Split Panel */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* TEXT EDITOR AREA */}
        {(activeTab === 'split' || activeTab === 'edit') && (
          <div className={`${activeTab === 'split' ? 'lg:col-span-6' : 'lg:col-span-12'} flex flex-col h-[400px] border rounded-xl overflow-hidden shadow-lg ${inputBgClass} ${borderClass}`}>
            <div className={`px-4 py-3 border-b flex items-center justify-between ${panelBgClass} ${borderClass}`}>
              <span className={`text-xs font-semibold font-mono ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>Markdown Syntax Input</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleCopyMarkdown}
                  className={`${isLight ? 'text-slate-500 hover:text-indigo-650' : 'text-slate-400 hover:text-white'} p-1 rounded transition-colors cursor-pointer`}
                  title="Copy Raw Markdown"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
                <button
                  onClick={handleClear}
                  className={`${isLight ? 'text-slate-500 hover:text-red-500' : 'text-slate-400 hover:text-pink-400'} p-1 rounded transition-colors cursor-pointer`}
                  title="Clear Document"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
            <textarea
              className={`flex-1 w-full p-4 font-mono text-xs leading-relaxed focus:outline-none resize-none ${
                isLight ? 'bg-white text-slate-800 placeholder:text-slate-400' : 'bg-slate-950 text-slate-250 placeholder:text-slate-650'
              }`}
              placeholder="Start drafting document using Markdown rules..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
            />
            <div className={`px-4 py-2 border-t text-[10px] font-mono ${panelBgClass} ${borderMutedClass} ${textMutedClass}`}>
              <span>Lines: {input.split('\n').length} | Words: {input.trim().split(/\s+/).filter(Boolean).length}</span>
            </div>
          </div>
        )}

        {/* HTML LIVE PREVIEW AREA */}
        {(activeTab === 'split' || activeTab === 'preview') && (
          <div className={`${activeTab === 'split' ? 'lg:col-span-6' : 'lg:col-span-12'} flex flex-col h-[400px] border rounded-xl overflow-hidden shadow-lg ${inputBgClass} ${borderClass}`}>
            <div className={`px-4 py-3 border-b flex items-center justify-between ${panelBgClass} ${borderClass}`}>
              <span className={`text-xs font-semibold font-mono ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>Real-time Formatted Rendering</span>
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded border ${
                isLight 
                  ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                  : 'bg-emerald-950/40 text-emerald-400 border-emerald-900/30'
              }`}>
                Live Preview (Safe Mode)
              </span>
            </div>
            <div className={`flex-1 overflow-auto p-6 ${
              isLight ? 'bg-slate-50/50 text-slate-800' : 'bg-slate-950/20 text-slate-300'
            }`}>
              {input.trim() ? (
                <div 
                  className={`prose max-w-none text-xs space-y-2 select-text ${isLight ? 'prose-slate' : 'prose-invert'}`}
                  dangerouslySetInnerHTML={{ __html: compiledHtml }} 
                />
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-1">
                  <Eye className={`w-6 h-6 animate-pulse ${isLight ? 'text-slate-300' : 'text-slate-800'}`} />
                  <p className={`text-xs font-mono ${textMutedClass}`}>Awaiting Markdown compilation stream</p>
                </div>
              )}
            </div>
            <div className={`px-4 py-2 border-t text-[10px] font-mono ${panelBgClass} ${borderMutedClass} ${textMutedClass}`}>
              <span>Output HTML size: {compiledHtml.length} characters</span>
            </div>
          </div>
        )}

      </div>

      {/* RICH ARTICLE CONTENT FOR GOOGLE ADSENSE APPROVAL */}
      <div className={`border rounded-xl p-6 md:p-8 space-y-6 ${inputBgClass} ${borderClass}`}>
        <div className={`flex items-center gap-2.5 border-b pb-4 ${borderClass}`}>
          <BookOpen className={`w-5 h-5 ${isLight ? 'text-indigo-650' : 'text-indigo-400'}`} />
          <h3 className={`text-base font-bold font-sans ${isLight ? 'text-slate-850' : 'text-white'}`}>The Developer's Guide to Markdown Specifications</h3>
        </div>

        <div className={`grid grid-cols-1 md:grid-cols-2 gap-8 text-xs leading-relaxed font-sans ${textMutedClass}`}>
          <div className="space-y-4">
            <h4 className={`text-sm font-bold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>What is Markdown?</h4>
            <p>
              Created in 2004 by **John Gruber** with major contributions from the late **Aaron Swartz**, Markdown is a simple, lightweight markup language that provides a highly legible structure for plain text. It was designed with a fundamental philosophy: a Markdown-formatted document should be completely publishable as plain-text, without looking like it has been decorated with tags or formatting guidelines.
            </p>
            <p>
              Markdown has become the de facto communication standard across platforms like GitHub, Reddit, Stack Overflow, Discord, and Slack, alongside power tools such as Notion and Obsidian.
            </p>
            
            <h4 className={`text-sm font-bold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>CommonMark vs. GitHub Flavored Markdown (GFM)</h4>
            <p>
              In the early years, Markdown lacked a formal standard, leading to fragmentation as different libraries implemented custom syntax variations. To resolve this, a technical team established **CommonMark**, a highly defined, rigorous specification of Gruber's language.
            </p>
            <p>
              Later, GitHub expanded this spec to create **GFM** (GitHub Flavored Markdown), introducing custom, engineering-focused features such as checklists, strikethroughs, tables, autolinks, and inline task list checkboxes.
            </p>
          </div>

          <div className="space-y-4">
            <h4 className={`text-sm font-bold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>Advantages of Split-Pane Compilers:</h4>
            <ul className="list-disc list-inside space-y-1.5 pl-1">
              <li><strong>Dynamic UI Feedback:</strong> Real-time rendering helps identify visual mistakes or broken hyperlink brackets instantly.</li>
              <li><strong>Rapid Static Blog Generation:</strong> Draft blog posts, READMEs, and wikis before copy-pasting directly into production source repos.</li>
              <li><strong>Cross-Platform Compatibility:</strong> Standard markup layouts look identical across any compliant web browser.</li>
            </ul>

            <div className={`p-4 rounded-xl border space-y-2 ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/50 border-slate-850'}`}>
              <span className={`font-bold block ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>Markdown Formatting Tip:</span>
              <p>To insert a line break without beginning a new paragraph, simply type <strong>two trailing spaces</strong> at the end of your line and hit return.</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
