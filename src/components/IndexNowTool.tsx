import React, { useState, useEffect } from 'react';
import { 
  Globe, 
  Key, 
  FileText, 
  Send, 
  Copy, 
  Check, 
  AlertCircle, 
  CheckCircle, 
  HelpCircle, 
  List, 
  RefreshCw, 
  ExternalLink 
} from 'lucide-react';

interface IndexNowToolProps {
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

const DEFAULT_KEY = '4b1050e9944447399a9f01ecb66e24fc';
const DEFAULT_HOST = 'ownformatters.com';

const BUILT_IN_PAGES = [
  { path: '/home', label: 'Home Dashboard' },
  { path: '/json-formatter', label: 'JSON Formatter & Validator' },
  { path: '/json-schema-generator', label: 'JSON Schema Generator & Validator' },
  { path: '/jsonpath-tester', label: 'JSONPath Tester' },
  { path: '/yaml-converter', label: 'YAML <-> JSON Converter' },
  { path: '/xml-formatter', label: 'XML Formatter & Beautifier' },
  { path: '/sql-formatter', label: 'SQL Formatter & Beautifier' },
  { path: '/code-minifier', label: 'HTML, CSS & JS Code Minifier' },
  { path: '/api-tester', label: 'API Request Tester' },
  { path: '/graphql-tester', label: 'GraphQL API Tester' },
  { path: '/openapi-viewer', label: 'OpenAPI & Swagger Viewer' },
  { path: '/webhook-tester', label: 'Webhook Tester & Signer' },
  { path: '/mock-api-server', label: 'Interactive Mock API Server' },
  { path: '/docker-compose-validator', label: 'Docker Compose Validator' },
  { path: '/k8s-yaml-validator', label: 'Kubernetes YAML Validator' },
  { path: '/nginx-config-formatter', label: 'Nginx Config Formatter' },
  { path: '/base64-encoder', label: 'Base64 & URL Encoder' },
  { path: '/url-encoder', label: 'URL Encoder & Decoder' },
  { path: '/jwt-debugger', label: 'JWT Token Debugger' },
  { path: '/timestamp-converter', label: 'Epoch Unix Timestamp Converter' },
  { path: '/text-utility', label: 'Text Utility Case & Counters' },
  { path: '/hash-generator', label: 'Cryptographic Hash Generator' },
  { path: '/uuid-generator', label: 'UUID v4 & Password Generator' },
  { path: '/qrcode-generator', label: 'Dynamic QR Code Generator' },
  { path: '/markdown-editor', label: 'Markdown Live Editor & Preview' },
  { path: '/csv-converter', label: 'CSV <-> JSON Converter' },
  { path: '/color-converter', label: 'Color Space Converter' },
  { path: '/number-base-converter', label: 'Multi-Radix Number Base Converter' },
  { path: '/cron-parser', label: 'Cron Expression Parser & Builder' },
  { path: '/regex-tester', label: 'Regex Tester & Highlighter' },
  { path: '/text-diff', label: 'Myers Text Diff & Comparator' },
  { path: '/privacy-policy', label: 'Privacy Policy' },
  { path: '/terms-of-service', label: 'Terms of Service' },
  { path: '/about-us', label: 'About Us' }
];

export default function IndexNowTool({ theme }: IndexNowToolProps) {
  const [host, setHost] = useState(DEFAULT_HOST);
  const [key, setKey] = useState(DEFAULT_KEY);
  const [keyLocation, setKeyLocation] = useState(`https://${DEFAULT_HOST}/${DEFAULT_KEY}.txt`);
  
  const [selectedPages, setSelectedPages] = useState<string[]>(
    BUILT_IN_PAGES.slice(0, 8).map(p => p.path)
  );
  const [customUrls, setCustomUrls] = useState<string>('');
  
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<{
    success: boolean;
    code: number | null;
    message: string;
  } | null>(null);

  const [copiedKey, setCopiedKey] = useState(false);
  const [copiedCurl, setCopiedCurl] = useState(false);

  // Auto-update Key Location when host or key changes
  useEffect(() => {
    setKeyLocation(`https://${host}/${key}.txt`);
  }, [host, key]);

  const borderClass = theme?.border || 'border-slate-800/80';
  const cardClass = theme?.card || 'bg-slate-900/50';
  const inputBgClass = theme?.inputBg || 'bg-slate-950';
  const textMutedClass = theme?.textMuted || 'text-slate-400';
  const isDark = theme?.isDark !== false;

  const getAllUrls = () => {
    const protocol = 'https://';
    const cleanHost = host.replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/$/, '');
    
    const pages = selectedPages.map(path => {
      const cleanPath = path.startsWith('/') ? path : `/${path}`;
      return `${protocol}${cleanHost}${cleanPath}`;
    });

    const customs = customUrls
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0)
      .map(url => {
        if (!url.startsWith('http://') && !url.startsWith('https://')) {
          return `${protocol}${url}`;
        }
        return url;
      });

    return Array.from(new Set([...pages, ...customs]));
  };

  const getCurlCommand = () => {
    const payload = {
      host: host.replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/$/, ''),
      key: key.trim(),
      keyLocation: keyLocation.trim(),
      urlList: getAllUrls()
    };

    return `curl -X POST "https://api.indexnow.org/IndexNow" \\
  -H "Content-Type: application/json; charset=utf-8" \\
  -d '${JSON.stringify(payload, null, 2)}'`;
  };

  const handleCopyCurl = () => {
    navigator.clipboard.writeText(getCurlCommand());
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 2000);
  };

  const handleCopyKey = () => {
    navigator.clipboard.writeText(key);
    setCopiedKey(true);
    setTimeout(() => setCopiedKey(false), 2000);
  };

  const handleSubmit = async () => {
    const urls = getAllUrls();
    if (urls.length === 0) {
      setStatus({
        success: false,
        code: null,
        message: 'Please select or enter at least one URL to submit.'
      });
      return;
    }

    setSubmitting(true);
    setStatus(null);

    const payload = {
      host: host.replace(/^(https?:\/\/)?(www\.)?/, '').replace(/\/$/, ''),
      key: key.trim(),
      keyLocation: keyLocation.trim(),
      urlList: urls
    };

    try {
      // Direct call to standard IndexNow API endpoint
      const response = await fetch('https://api.indexnow.org/IndexNow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json; charset=utf-8'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setStatus({
          success: true,
          code: response.status,
          message: 'URLs submitted successfully! Search engines will now discover and crawl them.'
        });
      } else {
        let errDetail = '';
        if (response.status === 400) errDetail = 'Bad request (Invalid format)';
        else if (response.status === 403) errDetail = 'Forbidden (Verification Key or File mismatch)';
        else if (response.status === 422) errDetail = 'Unprocessable Entity (URLs do not belong to host)';
        else if (response.status === 429) errDetail = 'Too Many Requests (Rate limit exceeded)';
        else errDetail = `Status code: ${response.status}`;

        setStatus({
          success: false,
          code: response.status,
          message: `Submission failed. ${errDetail}`
        });
      }
    } catch (err: any) {
      // Handle potential CORS or Network Errors gracefully
      setStatus({
        success: false,
        code: null,
        message: `Network/CORS policy blocked direct browser submission. You can use the copyable cURL structure below to fire the request directly, or use Bing Webmaster Tools.`
      });
    } finally {
      setSubmitting(false);
    }
  };

  const handleTogglePage = (path: string) => {
    setSelectedPages(prev => 
      prev.includes(path) ? prev.filter(p => p !== path) : [...prev, path]
    );
  };

  const handleSelectAll = () => {
    if (selectedPages.length === BUILT_IN_PAGES.length) {
      setSelectedPages([]);
    } else {
      setSelectedPages(BUILT_IN_PAGES.map(p => p.path));
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner / Hero */}
      <div className={`p-6 rounded-2xl ${cardClass} border ${borderClass} relative overflow-hidden shadow-xl`}>
        <div className="flex flex-col md:flex-row gap-5 items-start md:items-center justify-between relative z-10">
          <div className="space-y-2">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Globe className="w-6 h-6 text-indigo-500" />
              IndexNow URL Submitter
            </h2>
            <p className={`text-xs ${textMutedClass} max-w-2xl`}>
              IndexNow is an open protocol that lets website owners instantly inform search engines (like Bing, Yandex, Seznam, and Naver) about the latest content changes on their website.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <a 
              href="https://www.bing.com/webmasters" 
              target="_blank" 
              rel="noreferrer noopener"
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-500/20`}
            >
              Bing Webmaster Tools
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: API parameters & Custom entries */}
        <div className="lg:col-span-7 space-y-6">
          {/* Section 1: Parameters */}
          <div className={`p-5 rounded-2xl ${cardClass} border ${borderClass} space-y-4 shadow-md`}>
            <h3 className="text-sm font-bold flex items-center gap-2 border-b pb-2.5 border-slate-800/40">
              <Key className="w-4 h-4 text-emerald-400" />
              1. Host & Keys Configuration
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Website Host</label>
                <input 
                  type="text" 
                  value={host}
                  onChange={(e) => setHost(e.target.value)}
                  className={`w-full text-xs px-3 py-2 rounded-lg border ${borderClass} ${inputBgClass} focus:outline-none focus:border-indigo-500 font-mono`}
                  placeholder="example.com"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-300">Verification API Key</label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={key}
                    onChange={(e) => setKey(e.target.value)}
                    className={`w-full text-xs pl-3 pr-10 py-2 rounded-lg border ${borderClass} ${inputBgClass} focus:outline-none focus:border-indigo-500 font-mono`}
                    placeholder="Enter key"
                  />
                  <button 
                    onClick={handleCopyKey}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 hover:text-white text-slate-400 transition"
                    title="Copy Key"
                  >
                    {copiedKey ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                </div>
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-300">Key Location (.txt File URL)</label>
              <input 
                type="text" 
                value={keyLocation}
                onChange={(e) => setKeyLocation(e.target.value)}
                className={`w-full text-xs px-3 py-2 rounded-lg border ${borderClass} ${inputBgClass} focus:outline-none focus:border-indigo-500 font-mono`}
                placeholder="https://example.com/key.txt"
              />
              <div className="flex items-center gap-1.5 mt-1">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <p className="text-[10px] text-emerald-400 font-medium">
                  Verified live at: <a href={`https://${DEFAULT_HOST}/${DEFAULT_KEY}.txt`} target="_blank" rel="noreferrer" className="underline hover:text-emerald-300">/{DEFAULT_KEY}.txt</a>
                </p>
              </div>
            </div>
          </div>

          {/* Section 2: Custom URLs submission */}
          <div className={`p-5 rounded-2xl ${cardClass} border ${borderClass} space-y-4 shadow-md`}>
            <h3 className="text-sm font-bold flex items-center gap-2 border-b pb-2.5 border-slate-800/40">
              <FileText className="w-4 h-4 text-blue-400" />
              2. Custom URLs bulk input (One URL per line)
            </h3>

            <textarea 
              rows={6}
              value={customUrls}
              onChange={(e) => setCustomUrls(e.target.value)}
              className={`w-full text-xs px-3 py-2.5 rounded-lg border ${borderClass} ${inputBgClass} focus:outline-none focus:border-indigo-500 font-mono placeholder:text-slate-600`}
              placeholder={`https://ownformatters.com/my-custom-subpage\nhttps://ownformatters.com/another-tool`}
            />
            <p className={`text-[10px] ${textMutedClass}`}>
              URLs must belong to the verified host domain.
            </p>
          </div>

          {/* Section 3: Submit Actions & Status Panel */}
          <div className="space-y-4">
            <div className="flex flex-wrap gap-3">
              <button
                onClick={handleSubmit}
                disabled={submitting}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-bold flex items-center gap-2 transition shadow-lg shadow-indigo-500/20 cursor-pointer"
              >
                {submitting ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                Submit URLs to IndexNow
              </button>

              <button
                onClick={handleCopyCurl}
                className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition ${theme?.btnSecondary || 'bg-slate-800 hover:bg-slate-700 text-slate-300'} cursor-pointer`}
              >
                {copiedCurl ? (
                  <Check className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
                Copy Curl Command
              </button>
            </div>

            {status && (
              <div className={`p-4 rounded-xl border flex gap-3 ${
                status.success 
                  ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300' 
                  : 'bg-amber-500/10 border-amber-500/30 text-amber-300'
              }`}>
                {status.success ? (
                  <CheckCircle className="w-5 h-5 flex-shrink-0" />
                ) : (
                  <AlertCircle className="w-5 h-5 flex-shrink-0" />
                )}
                <div className="space-y-1 text-xs">
                  <p className="font-bold">
                    {status.success ? 'Success' : 'Notice / Error'} 
                    {status.code !== null && ` (HTTP ${status.code})`}
                  </p>
                  <p className="leading-relaxed opacity-90">{status.message}</p>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Pre-filled checkboxes & protocol guidelines */}
        <div className="lg:col-span-5 space-y-6">
          {/* OwnFormatters Preset Checklist */}
          <div className={`p-5 rounded-2xl ${cardClass} border ${borderClass} space-y-4 shadow-md flex flex-col max-h-[380px]`}>
            <div className="flex items-center justify-between border-b pb-2.5 border-slate-800/40">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <List className="w-4 h-4 text-indigo-400" />
                3. Pre-filled Web Routes ({selectedPages.length})
              </h3>
              <button 
                onClick={handleSelectAll}
                className="text-[10px] text-indigo-400 hover:underline hover:text-indigo-300"
              >
                {selectedPages.length === BUILT_IN_PAGES.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>

            <div className="overflow-y-auto space-y-2 pr-1.5 flex-1 custom-scrollbar">
              {BUILT_IN_PAGES.map((page) => {
                const isSelected = selectedPages.includes(page.path);
                return (
                  <label 
                    key={page.path}
                    className={`flex items-start gap-2.5 p-2 rounded-lg border transition cursor-pointer ${
                      isSelected 
                        ? 'border-indigo-500/30 bg-indigo-500/5' 
                        : 'border-transparent hover:bg-slate-800/30'
                    }`}
                  >
                    <input 
                      type="checkbox" 
                      checked={isSelected}
                      onChange={() => handleTogglePage(page.path)}
                      className="mt-0.5 rounded text-indigo-600 focus:ring-indigo-500/30"
                    />
                    <div className="text-left">
                      <p className="text-[11px] font-semibold leading-none">{page.label}</p>
                      <p className="text-[10px] text-slate-500 font-mono mt-0.5">{page.path}</p>
                    </div>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Quick Step Guide */}
          <div className={`p-5 rounded-2xl bg-indigo-950/10 border ${borderClass} space-y-4 shadow-sm`}>
            <h3 className="text-sm font-bold flex items-center gap-2 border-b pb-2.5 border-slate-800/40">
              <HelpCircle className="w-4 h-4 text-indigo-400" />
              IndexNow Integration Guide
            </h3>

            <ol className="space-y-3.5 text-xs">
              <li className="flex gap-2.5">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-[10px] font-bold text-indigo-400 flex-shrink-0">
                  1
                </span>
                <div>
                  <p className="font-bold">Generate API Key</p>
                  <p className={`text-[10px] ${textMutedClass} mt-0.5`}>
                    Use the verification API key generated for your domain ownership.
                  </p>
                </div>
              </li>

              <li className="flex gap-2.5">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-[10px] font-bold text-indigo-400 flex-shrink-0">
                  2
                </span>
                <div>
                  <p className="font-bold">Host your API key</p>
                  <p className={`text-[10px] ${textMutedClass} mt-0.5`}>
                    We have successfully hosted the UTF-8 verification file at your root: 
                    <code className="block bg-slate-950 px-1.5 py-0.5 rounded font-mono text-[9px] mt-1 break-all select-all text-slate-300">
                      /{DEFAULT_KEY}.txt
                    </code>
                  </p>
                </div>
              </li>

              <li className="flex gap-2.5">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-[10px] font-bold text-indigo-400 flex-shrink-0">
                  3
                </span>
                <div>
                  <p className="font-bold">Submit URLs</p>
                  <p className={`text-[10px] ${textMutedClass} mt-0.5`}>
                    Submit bulk URLs using this active dashboard form or trigger the copyable cURL POST request.
                  </p>
                </div>
              </li>

              <li className="flex gap-2.5">
                <span className="flex items-center justify-center w-5 h-5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-[10px] font-bold text-indigo-400 flex-shrink-0">
                  4
                </span>
                <div>
                  <p className="font-bold">Verify in Webmaster Console</p>
                  <p className={`text-[10px] ${textMutedClass} mt-0.5`}>
                    Check Bing Webmaster Tools or Seznam Webmaster to monitor live indexed status.
                  </p>
                </div>
              </li>
            </ol>
          </div>
        </div>
      </div>
    </div>
  );
}
