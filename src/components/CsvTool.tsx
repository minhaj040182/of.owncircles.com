import React, { useState } from 'react';
import { Copy, Check, Trash2, FileSpreadsheet, Sparkles, CheckCircle, AlertCircle, ArrowLeftRight, Download } from 'lucide-react';

const SAMPLE_CSV = `id,name,email,role,active,salary
101,John Doe,john@ownformatters.com,Engineer,true,95000
102,Jane Smith,jane@ownformatters.com,Manager,true,115000
103,Mark Wilson,mark@ownformatters.com,Designer,false,80000
104,Amy Adams,amy@ownformatters.com,Director,true,145000`;

const SAMPLE_JSON = `[
  {
    "id": 101,
    "name": "John Doe",
    "email": "john@ownformatters.com",
    "role": "Engineer",
    "active": true,
    "salary": 95000
  },
  {
    "id": 102,
    "name": "Jane Smith",
    "email": "jane@ownformatters.com",
    "role": "Manager",
    "active": true,
    "salary": 115000
  },
  {
    "id": 103,
    "name": "Mark Wilson",
    "email": "mark@ownformatters.com",
    "role": "Designer",
    "active": false,
    "salary": 80000
  }
]`;

interface CsvToolProps {
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

export default function CsvTool({ theme }: CsvToolProps) {
  const [activeTab, setActiveTab] = useState<'csv2json' | 'json2csv'>('csv2json');
  const [input, setInput] = useState<string>('');
  const [output, setOutput] = useState<string>('');
  const [delimiter, setDelimiter] = useState<',' | ';' | '\t'>(',');
  const [status, setStatus] = useState<{ type: 'idle' | 'success' | 'error'; message: string }>({ type: 'idle', message: '' });
  const [copied, setCopied] = useState<boolean>(false);

  // RFC-4180 standard compliant CSV Parser
  const parseCsv = (csvText: string, delim: string): any[] => {
    const rows: string[][] = [];
    let currentRow: string[] = [];
    let currentVal = "";
    let insideQuote = false;

    for (let i = 0; i < csvText.length; i++) {
      const char = csvText[i];
      const nextChar = csvText[i + 1];

      if (char === '"') {
        if (insideQuote && nextChar === '"') {
          currentVal += '"';
          i++; // skip next escaped quote
        } else {
          insideQuote = !insideQuote;
        }
      } else if (char === delim && !insideQuote) {
        currentRow.push(currentVal);
        currentVal = "";
      } else if ((char === '\n' || char === '\r') && !insideQuote) {
        if (char === '\r' && nextChar === '\n') {
          i++;
        }
        currentRow.push(currentVal);
        if (currentRow.length > 0 && (currentRow.length > 1 || currentRow[0] !== "")) {
          rows.push(currentRow);
        }
        currentRow = [];
        currentVal = "";
      } else {
        currentVal += char;
      }
    }
    if (currentRow.length > 0 || currentVal !== "") {
      currentRow.push(currentVal);
      rows.push(currentRow);
    }

    if (rows.length === 0) return [];
    const headers = rows[0].map(h => h.trim());
    const jsonResult: any[] = [];

    for (let r = 1; r < rows.length; r++) {
      const row = rows[r];
      const obj: any = {};
      for (let c = 0; c < headers.length; c++) {
        const headerName = headers[c] || `column_${c + 1}`;
        const cellVal = row[c] !== undefined ? row[c].trim() : "";
        
        // Auto convert strings to true types (numbers / booleans)
        if (cellVal.toLowerCase() === "true") {
          obj[headerName] = true;
        } else if (cellVal.toLowerCase() === "false") {
          obj[headerName] = false;
        } else if (cellVal !== "" && !isNaN(cellVal as any)) {
          obj[headerName] = Number(cellVal);
        } else {
          obj[headerName] = cellVal;
        }
      }
      jsonResult.push(obj);
    }
    return jsonResult;
  };

  const convertJsonToCsv = (jsonArr: any[], delim: string): string => {
    if (!Array.isArray(jsonArr) || jsonArr.length === 0) return "";
    
    // Collect unique header keys
    const headers = Array.from(
      new Set(jsonArr.reduce((acc, item) => [...acc, ...Object.keys(item)], []))
    ) as string[];

    const escapeCell = (val: any) => {
      if (val === null || val === undefined) return "";
      let str = String(val);
      if (str.includes(delim) || str.includes('"') || str.includes("\n") || str.includes("\r")) {
        str = '"' + str.replace(/"/g, '""') + '"';
      }
      return str;
    };

    const csvRows = [];
    csvRows.push(headers.map(escapeCell).join(delim));

    jsonArr.forEach(item => {
      const row = headers.map(header => escapeCell(item[header]));
      csvRows.push(row.join(delim));
    });

    return csvRows.join("\n");
  };

  const handleProcess = () => {
    if (!input.trim()) {
      setStatus({ type: 'error', message: 'Input is empty!' });
      return;
    }

    try {
      if (activeTab === 'csv2json') {
        const parsed = parseCsv(input, delimiter);
        setOutput(JSON.stringify(parsed, null, 2));
        setStatus({ type: 'success', message: `Parsed CSV (${parsed.length} rows) successfully converted to JSON!` });
      } else {
        let parsedJson: any;
        try {
          parsedJson = JSON.parse(input);
        } catch (jsonErr: any) {
          throw new Error(`Invalid JSON syntax: ${jsonErr.message}`);
        }

        const arrayToConvert = Array.isArray(parsedJson) ? parsedJson : [parsedJson];
        const csvStr = convertJsonToCsv(arrayToConvert, delimiter);
        setOutput(csvStr);
        setStatus({ type: 'success', message: `JSON successfully converted to CSV!` });
      }
    } catch (err: any) {
      setOutput('');
      setStatus({ type: 'error', message: err.message || 'Operation failed. Verify format integrity.' });
    }
  };

  const handleLoadSample = () => {
    if (activeTab === 'csv2json') {
      setInput(SAMPLE_CSV);
    } else {
      setInput(SAMPLE_JSON);
    }
    setOutput('');
    setStatus({ type: 'idle', message: '' });
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

  const handleDownload = () => {
    const textToDownload = output;
    if (!textToDownload) return;
    const fileExtension = activeTab === 'csv2json' ? 'json' : 'csv';
    const blob = new Blob([textToDownload], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `converted_data.${fileExtension}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  const handleSwap = () => {
    if (activeTab === 'csv2json') {
      setActiveTab('json2csv');
      setInput(output);
      setOutput('');
      setStatus({ type: 'idle', message: '' });
    } else {
      setActiveTab('csv2json');
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
    <div className="space-y-6" id="csv-converter-tool">
      
      {/* Top Banner Controls */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border p-4 rounded-xl ${cardClass} ${borderClass}`}>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => {
              setActiveTab('csv2json');
              handleClear();
            }}
            className={`text-xs font-semibold px-4 py-2 rounded-lg border transition-all cursor-pointer ${
              activeTab === 'csv2json' 
                ? '!bg-indigo-600 !text-white border-indigo-500 shadow-xs' 
                : isLight
                ? 'bg-white text-slate-600 border-slate-200 hover:text-slate-800 hover:bg-slate-50'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            CSV to JSON
          </button>
          <button
            onClick={() => {
              setActiveTab('json2csv');
              handleClear();
            }}
            className={`text-xs font-semibold px-4 py-2 rounded-lg border transition-all cursor-pointer ${
              activeTab === 'json2csv' 
                ? '!bg-indigo-600 !text-white border-indigo-500 shadow-xs' 
                : isLight
                ? 'bg-white text-slate-600 border-slate-200 hover:text-slate-800 hover:bg-slate-50'
                : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-white'
            }`}
          >
            JSON to CSV
          </button>
        </div>

        {/* Configurations */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2">
            <span className={`text-[10px] font-mono uppercase ${textMutedClass}`}>Delimiter:</span>
            <select
              value={delimiter}
              onChange={(e) => setDelimiter(e.target.value as any)}
              className={`border text-xs rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500 font-mono ${
                isLight ? 'bg-white border-slate-200 text-slate-850' : 'bg-slate-950 border-slate-800 text-slate-200'
              }`}
            >
              <option value=",">Comma (,)</option>
              <option value=";">Semicolon (;)</option>
              <option value="\t">Tab (\t)</option>
            </select>
          </div>

          <button
            onClick={handleLoadSample}
            className={`text-xs font-bold px-3 py-1.5 rounded-lg border transition-all cursor-pointer ${
              isLight 
                ? 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-800' 
                : 'bg-slate-950 hover:bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            Load Sample {activeTab === 'csv2json' ? 'CSV' : 'JSON'}
          </button>
        </div>
      </div>

      {/* Editor Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input area */}
        <div className={`flex flex-col h-[380px] border rounded-xl overflow-hidden ${inputBgClass} ${borderClass}`}>
          <div className={`px-4 py-3 border-b flex items-center justify-between ${panelBgClass} ${borderClass}`}>
            <span className={`text-xs font-semibold font-mono ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>
              {activeTab === 'csv2json' ? 'Raw CSV Data' : 'Raw JSON Array'}
            </span>
            <button
              onClick={handleClear}
              className={`${isLight ? 'text-slate-500 hover:text-red-650' : 'text-slate-400 hover:text-pink-400'} p-1 rounded transition-colors cursor-pointer`}
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
              activeTab === 'csv2json' 
                ? "id,name,value\n1,Alpha,100\n2,Beta,200"
                : "[\n  {\n    \"id\": 1,\n    \"name\": \"Alpha\",\n    \"value\": 100\n  }\n]"
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
              {activeTab === 'csv2json' ? 'Parsed JSON Output' : 'Formed CSV Output'}
            </span>
            <div className="flex items-center gap-1.5">
              {output && (
                <button
                  onClick={handleDownload}
                  className={`px-2 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 font-sans border cursor-pointer ${
                    isLight 
                      ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800' 
                      : 'bg-slate-950 hover:bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
                  }`}
                  title="Download output file"
                >
                  <Download className="w-3 h-3" />
                  Save File
                </button>
              )}
              <button
                onClick={handleCopy}
                className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 font-sans border cursor-pointer ${
                  isLight 
                    ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800' 
                    : 'bg-slate-950 hover:bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                {copied ? <Check className="w-3 h-3 text-emerald-500" /> : <Copy className="w-3 h-3" />}
                Copy Output
              </button>
            </div>
          </div>
          <div className={`flex-1 overflow-auto p-4 ${canvasBgClass}`}>
            {output ? (
              <pre className={`font-mono text-sm leading-relaxed whitespace-pre select-all ${isLight ? 'text-slate-900' : 'text-slate-200'}`}>{output}</pre>
            ) : (
              <div className="h-full flex flex-col items-center justify-center space-y-2">
                <FileSpreadsheet className={`w-6 h-6 ${isLight ? 'text-slate-300' : 'text-slate-750'}`} />
                <p className={`text-xs font-mono ${textMutedClass}`}>Output stream ready</p>
              </div>
            )}
          </div>
          <div className={`px-4 py-2 border-t text-[11px] font-mono ${panelBgClass} ${borderMutedClass} ${textMutedClass}`}>
            <span>Length: {output.length} chars</span>
          </div>
        </div>
      </div>

      {/* Trigger Row */}
      <div className="flex flex-wrap gap-3 items-center justify-between">
        <div className="flex items-center gap-2">
          <button
            onClick={handleProcess}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-5 py-2.5 rounded-xl shadow-md transition-all active:scale-[0.98] flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-white" />
            {activeTab === 'csv2json' ? 'Convert CSV to JSON' : 'Convert JSON to CSV'}
          </button>
          {output && (
            <button
              onClick={handleSwap}
              className={`border text-xs font-bold px-4 py-2.5 rounded-xl transition-all active:scale-[0.98] cursor-pointer ${
                isLight 
                  ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700' 
                  : 'bg-slate-900 hover:bg-slate-850 border-slate-800 text-slate-300'
              }`}
              title="Swap fields to invert conversion direction"
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
              <AlertCircle className={`w-3.5 h-3.5 ${isLight ? 'text-red-600' : 'text-red-450'}`} />
            )}
            <span>{status.message}</span>
          </div>
        )}
      </div>

      {/* Info Reference */}
      <div className={`border rounded-xl p-5 text-xs font-sans space-y-2 ${isLight ? 'bg-slate-50 border-slate-200 text-slate-650' : 'bg-slate-900/30 border-slate-850 text-slate-400'}`}>
        <h4 className={`font-bold flex items-center gap-1.5 ${isLight ? 'text-slate-800' : 'text-white'}`}>
          <FileSpreadsheet className={`w-4 h-4 ${isLight ? 'text-indigo-600' : 'text-indigo-400'}`} />
          CSV RFC-4180 Parsing Compliance
        </h4>
        <p className="leading-relaxed">
          OwnFormatters uses an RFC-4180 compliant state-machine scanner that supports embedded commas, double-quoted cell scopes, multiline fields, and carriage-returns. Numbers and booleans are automatically cast to their native types for clean, ready-to-use JSON structures. Delimiter conversions are executed 100% locally in browser memory.
        </p>
      </div>

    </div>
  );
}
