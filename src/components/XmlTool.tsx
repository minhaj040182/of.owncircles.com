import React, { useState } from 'react';
import { Copy, Check, Trash2, FileCode, Sparkles, CheckCircle, AlertCircle, ArrowLeftRight } from 'lucide-react';
import { formatXml } from '../utils';

const SAMPLE_XML = `<?xml version="1.0" encoding="UTF-8"?>
<ownformatters>
  <app name="OwnFormatters" version="2.4.0">
    <author>
      <name>OwnCircles Tech</name>
      <email>contact@owncircles.com</email>
    </author>
    <modules>
      <module id="json" active="true"/>
      <module id="xml" active="true"/>
      <module id="sql" active="true"/>
    </modules>
  </app>
</ownformatters>`;

const SAMPLE_JSON = `{
  "ownformatters": {
    "app": {
      "@attributes": {
        "name": "OwnFormatters",
        "version": "2.4.0"
      },
      "author": {
        "name": "OwnCircles Tech",
        "email": "contact@owncircles.com"
      },
      "modules": {
        "module": [
          { "@attributes": { "id": "json", "active": "true" } },
          { "@attributes": { "id": "xml", "active": "true" } },
          { "@attributes": { "id": "sql", "active": "true" } }
        ]
      }
    }
  }
}`;

interface XmlToolProps {
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

export default function XmlTool({ theme }: XmlToolProps) {
  const [activeTab, setActiveTab] = useState<'format' | 'json2xml' | 'xml2json'>('format');
  const [input, setInput] = useState<string>('');
  const [output, setOutput] = useState<string>('');
  const [status, setStatus] = useState<{ type: 'idle' | 'success' | 'error'; message: string }>({ type: 'idle', message: '' });
  const [copied, setCopied] = useState<boolean>(false);

  // Helper: Recursive XML element parsing to JSON
  const xmlNodeToJson = (xmlNode: Node): any => {
    let obj: any = {};

    // Element node type
    if (xmlNode.nodeType === 1) { 
      const element = xmlNode as Element;
      if (element.attributes.length > 0) {
        obj["@attributes"] = {};
        for (let j = 0; j < element.attributes.length; j++) {
          const attribute = element.attributes.item(j);
          if (attribute) {
            obj["@attributes"][attribute.nodeName] = attribute.nodeValue;
          }
        }
      }
    } else if (xmlNode.nodeType === 3) { // text node
      return xmlNode.nodeValue?.trim() || "";
    }

    if (xmlNode.hasChildNodes()) {
      for (let i = 0; i < xmlNode.childNodes.length; i++) {
        const item = xmlNode.childNodes.item(i);
        const nodeName = item.nodeName;

        if (item.nodeType === 3) { // text child
          const text = item.nodeValue?.trim();
          if (text) {
            if (xmlNode.childNodes.length === 1) {
              return text;
            } else {
              obj["#text"] = text;
            }
          }
        } else if (item.nodeType === 1) { // element child
          const value = xmlNodeToJson(item);
          if (typeof obj[nodeName] === "undefined") {
            obj[nodeName] = value;
          } else {
            if (!Array.isArray(obj[nodeName])) {
              const old = obj[nodeName];
              obj[nodeName] = [old];
            }
            obj[nodeName].push(value);
          }
        }
      }
    }
    return obj;
  };

  // Helper: Recursive JS object parsing to XML string
  const jsonObjectToXmlString = (obj: any, nodeName: string): string => {
    let xml = "";
    if (obj === null || obj === undefined) return `<${nodeName}/>`;

    if (typeof obj === "object") {
      if (Array.isArray(obj)) {
        obj.forEach(item => {
          xml += jsonObjectToXmlString(item, nodeName);
        });
      } else {
        xml += `<${nodeName}`;
        // Add attributes if any exist
        if (obj["@attributes"]) {
          Object.keys(obj["@attributes"]).forEach(attrKey => {
            xml += ` ${attrKey}="${obj["@attributes"][attrKey]}"`;
          });
        }
        
        const childKeys = Object.keys(obj).filter(k => k !== "@attributes");
        if (childKeys.length === 0) {
          xml += "/>";
        } else {
          xml += ">";
          childKeys.forEach(key => {
            if (key === "#text") {
              xml += obj[key];
            } else {
              xml += jsonObjectToXmlString(obj[key], key);
            }
          });
          xml += `</${nodeName}>`;
        }
      }
    } else {
      // Escape basic XML characters
      const escapedVal = String(obj)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
      xml += `<${nodeName}>${escapedVal}</${nodeName}>`;
    }
    return xml;
  };

  const handleProcess = () => {
    if (!input.trim()) {
      setStatus({ type: 'error', message: 'Input is empty!' });
      return;
    }

    try {
      if (activeTab === 'format') {
        const formatted = formatXml(input);
        setOutput(formatted);
        setStatus({ type: 'success', message: 'XML Document formatted successfully!' });
      } else if (activeTab === 'xml2json') {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(input, 'application/xml');
        
        const parserError = xmlDoc.getElementsByTagName('parsererror');
        if (parserError.length > 0) {
          throw new Error(parserError[0].textContent || 'XML Parsing Error');
        }
        
        const root = xmlDoc.documentElement;
        const convertedObj = { [root.nodeName]: xmlNodeToJson(root) };
        setOutput(JSON.stringify(convertedObj, null, 2));
        setStatus({ type: 'success', message: 'XML converted to JSON successfully!' });
      } else if (activeTab === 'json2xml') {
        // Parse input as JSON first
        let parsedJson: any;
        try {
          parsedJson = JSON.parse(input);
        } catch (jsonErr: any) {
          throw new Error(`Invalid JSON syntax: ${jsonErr.message}`);
        }

        const keys = Object.keys(parsedJson);
        if (keys.length === 0) {
          throw new Error('JSON object must contain at least one root property key.');
        }

        let xmlOutput = '<?xml version="1.0" encoding="UTF-8"?>\n';
        if (keys.length === 1) {
          xmlOutput += jsonObjectToXmlString(parsedJson[keys[0]], keys[0]);
        } else {
          // If multiple top-level keys, wrap in a generic root node
          xmlOutput += jsonObjectToXmlString(parsedJson, 'root');
        }
        
        setOutput(formatXml(xmlOutput));
        setStatus({ type: 'success', message: 'JSON converted to XML successfully!' });
      }
    } catch (err: any) {
      setOutput('');
      setStatus({ type: 'error', message: err.message || 'Operation failed. Verify syntax correctness.' });
    }
  };

  const handleLoadSample = () => {
    if (activeTab === 'json2xml') {
      setInput(SAMPLE_JSON);
    } else {
      setInput(SAMPLE_XML);
    }
    setStatus({ type: 'idle', message: '' });
    setOutput('');
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
    setStatus({ type: 'idle', message: '' });
  };

  const handleCopy = () => {
    const textToCopy = output || input;
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSwap = () => {
    if (activeTab === 'json2xml') {
      setActiveTab('xml2json');
      setInput(output);
      setOutput('');
      setStatus({ type: 'idle', message: '' });
    } else if (activeTab === 'xml2json') {
      setActiveTab('json2xml');
      setInput(output);
      setOutput('');
      setStatus({ type: 'idle', message: '' });
    }
  };

  // Theme support
  const borderClass = theme?.border || 'border-slate-800/80';
  const borderMutedClass = theme?.borderMuted || 'border-slate-850';
  const cardClass = theme?.card || 'bg-slate-900/50';
  const inputBgClass = theme?.inputBg || 'bg-slate-950';
  const panelBgClass = theme?.panelBg || 'bg-slate-900';
  const textClass = theme?.text || 'text-slate-200';
  const textMutedClass = theme?.textMuted || 'text-slate-400';
  const canvasBgClass = theme?.canvasBg || 'bg-[#02050c]';
  const isLight = theme?.isDark === false;

  return (
    <div className="space-y-6" id="xml-beautifier-tool">
      
      {/* Tab select row */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border p-4 rounded-xl ${cardClass} ${borderClass}`}>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setActiveTab('format');
              handleClear();
            }}
            className={`text-xs font-semibold px-4 py-2 rounded-lg border transition-all cursor-pointer ${
              activeTab === 'format' 
                ? '!bg-indigo-600 !text-white border-indigo-500 shadow-xs' 
                : isLight
                ? 'bg-white text-slate-600 border-slate-200 hover:text-slate-800 hover:bg-slate-50'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            XML Beautifier
          </button>
          <button
            onClick={() => {
              setActiveTab('json2xml');
              handleClear();
            }}
            className={`text-xs font-semibold px-4 py-2 rounded-lg border transition-all cursor-pointer ${
              activeTab === 'json2xml' 
                ? '!bg-indigo-600 !text-white border-indigo-500 shadow-xs' 
                : isLight
                ? 'bg-white text-slate-600 border-slate-200 hover:text-slate-800 hover:bg-slate-50'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            JSON to XML
          </button>
          <button
            onClick={() => {
              setActiveTab('xml2json');
              handleClear();
            }}
            className={`text-xs font-semibold px-4 py-2 rounded-lg border transition-all cursor-pointer ${
              activeTab === 'xml2json' 
                ? '!bg-indigo-600 !text-white border-indigo-500 shadow-xs' 
                : isLight
                ? 'bg-white text-slate-600 border-slate-200 hover:text-slate-800 hover:bg-slate-50'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            XML to JSON
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleLoadSample}
            className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
              isLight 
                ? 'bg-slate-55 hover:bg-slate-100 border-slate-200 text-slate-800' 
                : 'bg-slate-950 hover:bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            Load Sample {activeTab === 'json2xml' ? 'JSON' : 'XML'}
          </button>
        </div>
      </div>

      {/* Editor Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input area */}
        <div className={`flex flex-col h-[380px] border rounded-xl overflow-hidden ${inputBgClass} ${borderClass}`}>
          <div className={`px-4 py-3 border-b flex items-center justify-between ${panelBgClass} ${borderClass}`}>
            <span className={`text-xs font-semibold font-mono ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>
              {activeTab === 'format' ? 'Raw XML Input' : activeTab === 'xml2json' ? 'Raw XML Code' : 'Raw JSON Object'}
            </span>
            <button
              onClick={handleClear}
              className={`${isLight ? 'text-slate-500 hover:text-red-600' : 'text-slate-400 hover:text-pink-400'} p-1 rounded transition-colors cursor-pointer`}
              title="Clear Input"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          <textarea
            className={`flex-1 w-full p-4 font-mono text-sm leading-relaxed focus:outline-none resize-none bg-transparent ${textClass} ${
              isLight ? 'placeholder:text-slate-400' : 'placeholder:text-slate-600'
            }`}
            placeholder={
              activeTab === 'json2xml' 
                ? '{\n  "root": {\n    "message": "Hello World"\n  }\n}'
                : '<root>\n  <message>Hello World</message>\n</root>'
            }
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <div className={`px-4 py-2 border-t text-[11px] font-mono ${panelBgClass} ${borderMutedClass} ${textMutedClass}`}>
            <span>Length: {input.length} chars</span>
          </div>
        </div>

        {/* Output area */}
        <div className={`flex flex-col h-[380px] border rounded-xl overflow-hidden ${inputBgClass} ${borderClass}`}>
          <div className={`px-4 py-3 border-b flex items-center justify-between ${panelBgClass} ${borderClass}`}>
            <span className={`text-xs font-semibold font-mono ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>
              {activeTab === 'format' ? 'Formatted XML' : activeTab === 'xml2json' ? 'Converted JSON' : 'Converted XML'}
            </span>
            <button
              onClick={handleCopy}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 font-sans border cursor-pointer ${
                isLight 
                  ? 'bg-white hover:bg-slate-5 border-slate-200 text-slate-800' 
                  : 'bg-slate-950 hover:bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
              }`}
            >
              {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
              Copy Output
            </button>
          </div>
          <div className={`flex-1 overflow-auto p-4 ${canvasBgClass}`}>
            {output ? (
              <pre className={`font-mono text-sm leading-relaxed whitespace-pre select-all ${isLight ? 'text-slate-900' : 'text-slate-200'}`}>{output}</pre>
            ) : (
              <div className="h-full flex flex-col items-center justify-center space-y-2">
                <FileCode className={`w-6 h-6 ${isLight ? 'text-slate-300' : 'text-slate-750'}`} />
                <p className={`text-xs font-mono ${textMutedClass}`}>Output stream ready</p>
              </div>
            )}
          </div>
          <div className={`px-4 py-2 border-t text-[11px] font-mono ${panelBgClass} ${borderMutedClass} ${textMutedClass}`}>
            <span>Length: {output.length} chars</span>
          </div>
        </div>
      </div>

      {/* Action Buttons & Status Indicators */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={handleProcess}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md transition-all active:scale-[0.98] flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-white" />
            {activeTab === 'format' ? 'Format XML' : activeTab === 'xml2json' ? 'Convert to JSON' : 'Convert to XML'}
          </button>
          {output && activeTab !== 'format' && (
            <button
              onClick={handleSwap}
              className={`border text-xs font-bold px-4 py-2.5 rounded-xl transition-all active:scale-[0.98] cursor-pointer ${
                isLight 
                  ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700' 
                  : 'bg-slate-900 hover:bg-slate-850 border-slate-800 text-slate-300'
              }`}
              title="Swap fields to invert the conversion direction"
            >
              <ArrowLeftRight className="w-3.5 h-3.5 inline mr-1" /> Swap & Invert
            </button>
          )}
        </div>

        {status.type !== 'idle' && (
          <div className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-medium border font-mono ${
            status.type === 'success' 
              ? (isLight ? 'bg-emerald-50 border-emerald-200 text-emerald-800' : 'bg-emerald-950/20 border-emerald-900/40 text-emerald-300')
              : (isLight ? 'bg-red-50 border-red-200 text-red-800' : 'bg-pink-950/20 border-pink-900/40 text-pink-300')
          }`}>
            {status.type === 'success' ? (
              <CheckCircle className={`w-3.5 h-3.5 ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`} />
            ) : (
              <AlertCircle className={`w-3.5 h-3.5 ${isLight ? 'text-red-650' : 'text-red-400'}`} />
            )}
            <span>{status.message}</span>
          </div>
        )}
      </div>

      {/* Spec compliance Card */}
      <div className={`mt-12 border rounded-xl p-6 md:p-8 space-y-4 ${cardClass} ${borderClass} ${textMutedClass} text-xs`}>
        <h4 className={`text-sm font-bold flex items-center gap-2 ${isLight ? 'text-slate-800' : 'text-white'}`}>
          <FileCode className={`w-4 h-4 ${isLight ? 'text-indigo-600' : 'text-indigo-400'}`} /> XML / JSON Structural Alignment
        </h4>
        <p className="leading-relaxed">
          XML represents nodes with key hierarchies and optional attributes. In JSON alignment, tags are mapped directly as nested key objects. 
          To support attributes, we conform to the industry-standard <code className="px-1 py-0.5 rounded font-mono bg-slate-950/40">@attributes</code> nested key pattern. Children with duplicate sibling tags are normalized as indexed arrays, ensuring perfect schema integrity during bi-directional roundtrips.
        </p>
      </div>

    </div>
  );
}
