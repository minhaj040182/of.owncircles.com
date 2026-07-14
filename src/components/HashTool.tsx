import React, { useState, useEffect } from 'react';
import { Copy, Check, Trash2, Key, Sparkles, Hash, AlertCircle, CheckCircle, BookOpen, ShieldCheck, HelpCircle } from 'lucide-react';

// Light pure JS implementation of MD5 to ensure offline/sandbox resilience
function md5(string: string) {
  function RotateLeft(lValue: number, iShiftBits: number) {
    return (lValue << iShiftBits) | (lValue >>> (32 - iShiftBits));
  }
  function AddUnsigned(lX: number, lY: number) {
    let lX4, lY4, lX8, lY8, lResult;
    lX8 = (lX & 0x80000000);
    lY8 = (lY & 0x80000000);
    lX4 = (lX & 0x40000000);
    lY4 = (lY & 0x40000000);
    lResult = (lX & 0x3FFFFFFF) + (lY & 0x3FFFFFFF);
    if (lX4 & lY4) {
      return (lResult ^ 0x80000000 ^ lX8 ^ lY8);
    }
    if (lX4 | lY4) {
      if (lResult & 0x40000000) {
        return (lResult ^ 0xC0000000 ^ lX8 ^ lY8);
      } else {
        return (lResult ^ 0x40000000 ^ lX8 ^ lY8);
      }
    } else {
      return (lResult ^ lX8 ^ lY8);
    }
  }
  function F(x: number, y: number, z: number) { return (x & y) | ((~x) & z); }
  function G(x: number, y: number, z: number) { return (x & z) | (y & (~z)); }
  function H(x: number, y: number, z: number) { return (x ^ y ^ z); }
  function I(x: number, y: number, z: number) { return (y ^ (x | (~z))); }

  function FF(a: number, b: number, c: number, d: number, x: number, s: number, ac: number) {
    a = AddUnsigned(a, AddUnsigned(AddUnsigned(F(b, c, d), x), ac));
    return AddUnsigned(RotateLeft(a, s), b);
  }
  function GG(a: number, b: number, c: number, d: number, x: number, s: number, ac: number) {
    a = AddUnsigned(a, AddUnsigned(AddUnsigned(G(b, c, d), x), ac));
    return AddUnsigned(RotateLeft(a, s), b);
  }
  function HH(a: number, b: number, c: number, d: number, x: number, s: number, ac: number) {
    a = AddUnsigned(a, AddUnsigned(AddUnsigned(H(b, c, d), x), ac));
    return AddUnsigned(RotateLeft(a, s), b);
  }
  function II(a: number, b: number, c: number, d: number, x: number, s: number, ac: number) {
    a = AddUnsigned(a, AddUnsigned(AddUnsigned(I(b, c, d), x), ac));
    return AddUnsigned(RotateLeft(a, s), b);
  }

  function ConvertToWordArray(string: string) {
    let lWordCount;
    let lMessageLength = string.length;
    let lNumberOfWords_temp1 = lMessageLength + 8;
    let lNumberOfWords_temp2 = (lNumberOfWords_temp1 - (lNumberOfWords_temp1 % 64)) / 64;
    let lNumberOfWords = (lNumberOfWords_temp2 + 1) * 16;
    let lWordArray = Array(lWordArray_size);
    var lWordArray_size = lNumberOfWords - 1;
    let lBytePosition = 0;
    let lByteCount = 0;
    while (lByteCount < lMessageLength) {
      lWordCount = (lByteCount - (lByteCount % 4)) / 4;
      lBytePosition = (lByteCount % 4) * 8;
      lWordArray[lWordCount] = (lWordArray[lWordCount] | (string.charCodeAt(lByteCount) << lBytePosition));
      lByteCount++;
    }
    lWordCount = (lByteCount - (lByteCount % 4)) / 4;
    lBytePosition = (lByteCount % 4) * 8;
    lWordArray[lWordCount] = lWordArray[lWordCount] | (0x80 << lBytePosition);
    lWordArray[lNumberOfWords - 2] = lMessageLength << 3;
    lWordArray[lNumberOfWords - 1] = lMessageLength >>> 29;
    return lWordArray;
  }

  function WordToHex(lValue: number) {
    let WordToHexValue = '', WordToHexValue_temp = '', lByte, lCount;
    for (lCount = 0; lCount <= 3; lCount++) {
      lByte = (lValue >>> (lCount * 8)) & 255;
      WordToHexValue_temp = '0' + lByte.toString(16);
      WordToHexValue = WordToHexValue + WordToHexValue_temp.substr(WordToHexValue_temp.length - 2, 2);
    }
    return WordToHexValue;
  }

  function Utf8Encode(string: string) {
    string = string.replace(/\r\n/g, '\n');
    let utftext = '';
    for (let n = 0; n < string.length; n++) {
      let c = string.charCodeAt(n);
      if (c < 128) {
        utftext += String.fromCharCode(c);
      } else if ((c > 127) && (c < 2048)) {
        utftext += String.fromCharCode((c >> 6) | 192);
        utftext += String.fromCharCode((c & 63) | 128);
      } else {
        utftext += String.fromCharCode((c >> 12) | 224);
        utftext += String.fromCharCode(((c >> 6) & 63) | 128);
        utftext += String.fromCharCode((c & 63) | 128);
      }
    }
    return utftext;
  }

  let x: any[] = [];
  let k, S11, S12, S13, S14, S21, S22, S23, S24, S31, S32, S33, S34, S41, S42, S43, S44;
  let a = 0x67452301; let b = 0xEFCDAB89; let c = 0x98BADCFE; let d = 0x10325476;

  S11 = 7; S12 = 12; S13 = 17; S14 = 22;
  S21 = 5; S22 = 9; S23 = 14; S24 = 20;
  S31 = 4; S32 = 11; S33 = 16; S34 = 23;
  S41 = 6; S42 = 10; S43 = 15; S44 = 21;

  string = Utf8Encode(string);
  x = ConvertToWordArray(string);

  for (k = 0; k < x.length; k += 16) {
    let AA = a; let BB = b; let CC = c; let DD = d;
    a = FF(a, b, c, d, x[k + 0], S11, 0xD76AA478);
    d = FF(d, a, b, c, x[k + 1], S12, 0xE8C7B756);
    c = FF(c, d, a, b, x[k + 2], S13, 0x242070DB);
    b = FF(b, c, d, a, x[k + 3], S14, 0xC1BDCEEE);
    a = FF(a, b, c, d, x[k + 4], S11, 0xF57C0FAF);
    d = FF(d, a, b, c, x[k + 5], S12, 0x4787C62A);
    c = FF(c, d, a, b, x[k + 6], S13, 0xA8304613);
    b = FF(b, c, d, a, x[k + 7], S14, 0xFD469501);
    a = FF(a, b, c, d, x[k + 8], S11, 0x698098D8);
    d = FF(d, a, b, c, x[k + 9], S12, 0x8B44F7AF);
    c = FF(c, d, a, b, x[k + 10], S13, 0xFFFF5BB1);
    b = FF(b, c, d, a, x[k + 11], S14, 0x895CD7BE);
    a = FF(a, b, c, d, x[k + 12], S11, 0x6B901122);
    d = FF(d, a, b, c, x[k + 13], S12, 0xFD987193);
    c = FF(c, d, a, b, x[k + 14], S13, 0xA679438E);
    b = FF(b, c, d, a, x[k + 15], S14, 0x49B40821);

    a = GG(a, b, c, d, x[k + 1], S21, 0xF61E2562);
    d = GG(d, a, b, c, x[k + 6], S22, 0xC040B340);
    c = GG(c, d, a, b, x[k + 11], S23, 0x265E5A51);
    b = GG(b, c, d, a, x[k + 0], S24, 0xE9B6C7AA);
    a = GG(a, b, c, d, x[k + 5], S21, 0xD62F105D);
    d = GG(d, a, b, c, x[k + 10], S22, 0x2441453);
    c = GG(c, d, a, b, x[k + 15], S23, 0xD8A1E681);
    b = GG(b, c, d, a, x[k + 4], S24, 0xE7D3FBC8);
    a = GG(a, b, c, d, x[k + 9], S21, 0x21E1CDE6);
    d = GG(d, a, b, c, x[k + 14], S22, 0xC33707D6);
    c = GG(c, d, a, b, x[k + 3], S23, 0xF4D50D87);
    b = GG(b, c, d, a, x[k + 8], S24, 0x455A14ED);
    a = GG(a, b, c, d, x[k + 13], S21, 0xA9E3E905);
    d = GG(d, a, b, c, x[k + 2], S22, 0xFCEFA3F8);
    c = GG(c, d, a, b, x[k + 7], S23, 0x676F02D9);
    b = GG(b, c, d, a, x[k + 12], S24, 0x8D2A4C8A);

    a = HH(a, b, c, d, x[k + 5], S31, 0xFFFA3942);
    d = HH(d, a, b, c, x[k + 8], S32, 0x8771F681);
    c = HH(c, d, a, b, x[k + 11], S33, 0x6D9D6122);
    b = HH(b, c, d, a, x[k + 14], S34, 0xFDE5380C);
    a = HH(a, b, c, d, x[k + 1], S31, 0xA4BEEA44);
    d = HH(d, a, b, c, x[k + 4], S32, 0x4BDECFA9);
    c = HH(c, d, a, b, x[k + 7], S33, 0xF6BB4B60);
    b = HH(b, c, d, a, x[k + 10], S34, 0xBEBFBC70);
    a = HH(a, b, c, d, x[k + 13], S31, 0x289B7EC6);
    d = HH(d, a, b, c, x[k + 0], S32, 0xEAA127FA);
    c = HH(c, d, a, b, x[k + 3], S33, 0xD4EF3085);
    b = HH(b, c, d, a, x[k + 6], S34, 0x4881D05);
    a = HH(a, b, c, d, x[k + 9], S31, 0xD9D4D039);
    d = HH(d, a, b, c, x[k + 12], S32, 0xE6DB99E5);
    c = HH(c, d, a, b, x[k + 15], S33, 0x1FA27CF8);
    b = HH(b, c, d, a, x[k + 2], S34, 0xC4AC5665);

    a = II(a, b, c, d, x[k + 0], S41, 0xF4292244);
    d = II(d, a, b, c, x[k + 7], S42, 0x432AFF97);
    c = II(c, d, a, b, x[k + 14], S43, 0xAB9423A7);
    b = II(b, c, d, a, x[k + 5], S44, 0xFC93A039);
    a = II(a, b, c, d, x[k + 12], S41, 0x655B59C3);
    d = II(d, a, b, c, x[k + 3], S42, 0x8F0CCC92);
    c = II(c, d, a, b, x[k + 10], S43, 0xFFEFF47D);
    b = II(b, c, d, a, x[k + 1], S44, 0x85845DD1);
    a = II(a, b, c, d, x[k + 8], S41, 0x6FA87E4F);
    d = II(d, a, b, c, x[k + 15], S42, 0xFE2CE6E0);
    c = II(c, d, a, b, x[k + 6], S43, 0xA3014314);
    b = II(b, c, d, a, x[k + 13], S44, 0x4E0811A1);
    a = II(a, b, c, d, x[k + 4], S41, 0xF7537E82);
    d = II(d, a, b, c, x[k + 11], S42, 0xBD3AF235);
    c = II(c, d, a, b, x[k + 2], S43, 0x2AD7D2BB);
    b = II(b, c, d, a, x[k + 9], S44, 0xEB86D391);

    a = AddUnsigned(a, AA);
    b = AddUnsigned(b, BB);
    c = AddUnsigned(c, CC);
    d = AddUnsigned(d, DD);
  }

  const temp = WordToHex(a) + WordToHex(b) + WordToHex(c) + WordToHex(d);
  return temp.toLowerCase();
}

type HashAlgo = 'MD5' | 'SHA-1' | 'SHA-256' | 'SHA-512';

interface HashToolProps {
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

export default function HashTool({ theme }: HashToolProps) {
  const [input, setInput] = useState<string>('');
  const [algo, setAlgo] = useState<HashAlgo>('SHA-256');
  const [output, setOutput] = useState<string>('');
  const [copied, setCopied] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(false);

  const borderClass = theme?.border || 'border-slate-800/80';
  const borderMutedClass = theme?.borderMuted || 'border-slate-850';
  const cardClass = theme?.card || 'bg-slate-900/50';
  const inputBgClass = theme?.inputBg || 'bg-slate-950';
  const panelBgClass = theme?.panelBg || 'bg-slate-900';
  const textClass = theme?.text || 'text-slate-200';
  const textMutedClass = theme?.textMuted || 'text-slate-400';
  const canvasBgClass = theme?.canvasBg || 'bg-[#02050c]';
  const isLight = theme?.isDark === false;

  useEffect(() => {
    generateHash();
  }, [input, algo]);

  const generateHash = async () => {
    if (!input) {
      setOutput('');
      return;
    }

    if (algo === 'MD5') {
      setOutput(md5(input));
      return;
    }

    setLoading(true);
    try {
      const msgBuffer = new TextEncoder().encode(input);
      let subtleAlgo = 'SHA-256';
      if (algo === 'SHA-1') subtleAlgo = 'SHA-1';
      else if (algo === 'SHA-512') subtleAlgo = 'SHA-512';

      const hashBuffer = await crypto.subtle.digest(subtleAlgo, msgBuffer);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      setOutput(hashHex);
    } catch (err) {
      console.error('Crypto error: ', err);
      // Fallback
      setOutput('Unable to generate hash in this browser sandbox environment.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!output) return;
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
  };

  const handleLoadSample = () => {
    setInput('The quick brown fox jumps over the lazy dog');
  };

  return (
    <div className="space-y-6" id="cryptographic-hashing-tool">
      
      {/* Settings Selection Bar */}
      <div className={`flex flex-col sm:flex-row sm:items-center justify-between gap-4 border p-4 rounded-xl ${cardClass} ${borderClass}`}>
        <div className="flex flex-wrap items-center gap-2">
          {(['MD5', 'SHA-1', 'SHA-256', 'SHA-512'] as HashAlgo[]).map((algorithm) => (
            <button
              key={algorithm}
              onClick={() => setAlgo(algorithm)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold font-mono transition-all border cursor-pointer ${
                algo === algorithm
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow-md'
                  : (isLight 
                      ? 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50' 
                      : 'bg-slate-950 text-slate-400 border-slate-800 hover:text-slate-200')
              }`}
            >
              {algorithm}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2 text-xs">
          <button
            onClick={handleLoadSample}
            className={`border px-3 py-1.5 rounded-lg transition-all text-xs font-semibold cursor-pointer ${
              isLight 
                ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700' 
                : 'bg-slate-950 hover:bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
            }`}
          >
            Load Sample Text
          </button>
          <span className={`hidden md:inline ${isLight ? 'text-slate-300' : 'text-slate-500'}`}>|</span>
          <span className={`font-mono hidden md:inline ${textMutedClass}`}>100% Client-Side Encryption</span>
        </div>
      </div>

      {/* Inputs and Outputs Grid */}
      <div className="grid grid-cols-1 gap-6">
        
        {/* String Input */}
        <div className={`flex flex-col h-[200px] border rounded-xl overflow-hidden shadow-lg ${inputBgClass} ${borderClass}`}>
          <div className={`px-4 py-3 border-b flex items-center justify-between ${panelBgClass} ${borderClass}`}>
            <span className={`text-xs font-semibold font-mono ${isLight ? 'text-slate-855' : 'text-slate-300'}`}>Input Text String / Payload</span>
            <button
              onClick={handleClear}
              className={`${isLight ? 'text-slate-400 hover:text-red-500' : 'text-slate-400 hover:text-pink-400'} p-1 rounded transition-colors cursor-pointer`}
              title="Clear Input"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
          <textarea
            className={`flex-1 w-full p-4 font-mono text-sm leading-relaxed focus:outline-none resize-none ${
              isLight ? 'bg-white text-slate-800 placeholder:text-slate-400' : 'bg-slate-950 text-slate-200 placeholder:text-slate-650'
            }`}
            placeholder="Type or paste text content to generate crypto checksum hashes instantly..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
          />
          <div className={`px-4 py-2 border-t text-[10px] font-mono flex justify-between ${panelBgClass} ${borderMutedClass} ${textMutedClass}`}>
            <span>Size: {input.length} characters</span>
            <span>Bytes: {new TextEncoder().encode(input).length} B</span>
          </div>
        </div>

        {/* Generated Hash Hex Output */}
        <div className={`flex flex-col border rounded-xl overflow-hidden shadow-lg ${inputBgClass} ${borderClass}`}>
          <div className={`px-4 py-3 border-b flex items-center justify-between ${panelBgClass} ${borderClass}`}>
            <span className={`text-xs font-semibold font-mono ${isLight ? 'text-slate-855' : 'text-slate-300'}`}>
              Generated {algo} Hash Output (Hexadecimal)
            </span>
            {output && (
              <button
                onClick={handleCopy}
                className={`border px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1 font-sans cursor-pointer ${
                  isLight 
                    ? 'bg-white hover:bg-slate-50 border-slate-200 text-slate-800' 
                    : 'bg-slate-950 hover:bg-slate-900 border-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                {copied ? <Check className={`w-3.5 h-3.5 ${isLight ? 'text-emerald-600' : 'text-emerald-400'}`} /> : <Copy className="w-3 h-3" />}
                <span>Copy Checksum</span>
              </button>
            )}
          </div>
          <div className={`p-4 min-h-[80px] flex items-center justify-center ${canvasBgClass}`}>
            {output ? (
              <div className="w-full text-center">
                <span className={`font-mono text-sm md:text-base leading-relaxed break-all select-all block py-2 ${
                  isLight ? 'text-indigo-900 font-bold' : 'text-indigo-300'
                }`}>
                  {output}
                </span>
              </div>
            ) : (
              <div className="text-slate-500 font-mono text-xs text-center flex flex-col items-center gap-1.5">
                <Hash className={`w-6 h-6 animate-pulse ${isLight ? 'text-slate-300' : 'text-slate-800'}`} />
                <span className={textMutedClass}>Awaiting string input values...</span>
              </div>
            )}
          </div>
          <div className={`px-4 py-2 border-t text-[10px] font-mono flex justify-between ${panelBgClass} ${borderMutedClass} ${textMutedClass}`}>
            <span>Output Bits: {output ? (output.length * 4) : 0} bits</span>
            <span>Length: {output.length} hex chars</span>
          </div>
        </div>

      </div>

      {/* ADSENSE OPTIMIZED REFERENCE MANUAL AND FAQS */}
      <div className={`border rounded-xl p-6 md:p-8 space-y-6 ${inputBgClass} ${borderClass}`}>
        <div className={`flex items-center gap-2.5 border-b pb-4 ${borderClass}`}>
          <BookOpen className={`w-5 h-5 ${isLight ? 'text-indigo-650' : 'text-indigo-400'}`} />
          <h3 className={`text-base font-bold font-sans ${isLight ? 'text-slate-855' : 'text-white'}`}>Comprehensive Guide to Cryptographic Hashing Standards</h3>
        </div>

        <div className={`grid grid-cols-1 md:grid-cols-2 gap-8 text-xs leading-relaxed font-sans ${textMutedClass}`}>
          <div className="space-y-4">
            <h4 className={`text-sm font-bold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>What is a Cryptographic Hash Function?</h4>
            <p>
              A cryptographic hash function is a deterministic algorithm that maps input data of any size (often called the message) to a fixed-size string of hexadecimal characters (the hash value or digest).
            </p>
            <p>
              Hashing is a <strong>one-way process</strong>. It is mathematically impossible to reconstruct the original input from the output digest. This makes it distinct from encryption, which is designed for two-way decryption using appropriate cryptographic keys.
            </p>
            
            <h4 className={`text-sm font-bold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>Comparing Popular Hashing Algorithms:</h4>
            <div className="overflow-x-auto">
              <table className={`w-full border-collapse border text-left ${isLight ? 'border-slate-200' : 'border-slate-900'}`}>
                <thead>
                  <tr className={`font-mono text-[10px] ${isLight ? 'bg-slate-100 text-slate-700' : 'bg-slate-900 text-slate-300'}`}>
                    <th className={`border p-2 ${isLight ? 'border-slate-200' : 'border-slate-900'}`}>Algorithm</th>
                    <th className={`border p-2 ${isLight ? 'border-slate-200' : 'border-slate-900'}`}>Output Size</th>
                    <th className={`border p-2 ${isLight ? 'border-slate-200' : 'border-slate-900'}`}>Security Rating</th>
                  </tr>
                </thead>
                <tbody className={isLight ? 'text-slate-700' : 'text-slate-400'}>
                  <tr>
                    <td className={`border p-2 font-semibold ${isLight ? 'border-slate-200' : 'border-slate-900'}`}>MD5</td>
                    <td className={`border p-2 ${isLight ? 'border-slate-200' : 'border-slate-900'}`}>128 bits</td>
                    <td className={`border p-2 font-semibold text-pink-500 ${isLight ? 'border-slate-200' : 'border-slate-900'}`}>Legacy (Depreciated)</td>
                  </tr>
                  <tr>
                    <td className={`border p-2 font-semibold ${isLight ? 'border-slate-200' : 'border-slate-900'}`}>SHA-1</td>
                    <td className={`border p-2 ${isLight ? 'border-slate-200' : 'border-slate-900'}`}>160 bits</td>
                    <td className={`border p-2 font-semibold text-amber-500 ${isLight ? 'border-slate-200' : 'border-slate-900'}`}>Low (Collision Vulnerable)</td>
                  </tr>
                  <tr>
                    <td className={`border p-2 font-semibold ${isLight ? 'border-slate-200' : 'border-slate-900'}`}>SHA-256</td>
                    <td className={`border p-2 ${isLight ? 'border-slate-200' : 'border-slate-900'}`}>256 bits</td>
                    <td className={`border p-2 font-semibold text-emerald-600 ${isLight ? 'border-slate-200' : 'border-slate-900'}`}>Very High (Industry Standard)</td>
                  </tr>
                  <tr>
                    <td className={`border p-2 font-semibold ${isLight ? 'border-slate-200' : 'border-slate-900'}`}>SHA-512</td>
                    <td className={`border p-2 ${isLight ? 'border-slate-200' : 'border-slate-900'}`}>512 bits</td>
                    <td className={`border p-2 font-semibold text-emerald-600 ${isLight ? 'border-slate-200' : 'border-slate-900'}`}>Ultra High (Strongest Protection)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <div className="space-y-4">
            <h4 className={`text-sm font-bold ${isLight ? 'text-slate-800' : 'text-slate-200'}`}>Common Security Use Cases:</h4>
            <ul className="list-disc list-inside space-y-2 pl-1">
              <li><strong>Integrity Checks & Digital Signatures:</strong> Ensure a downloaded software package has not been tampered with or corrupted during transit by comparing the calculated SHA-256 with the author's published checksum.</li>
              <li><strong>Secure Password Storing:</strong> Web backends hash user passwords with random cryptographic salts (e.g. using bcrypt or argon2) instead of saving plain credentials, blocking database breach damage.</li>
              <li><strong>API Signature Verifications:</strong> Validate webhook requests by checking signature payloads.</li>
            </ul>

            <div className={`p-4 rounded-xl border space-y-2 font-sans ${isLight ? 'bg-slate-50 border-slate-200' : 'bg-slate-900/50 border-slate-850'}`}>
              <span className={`font-bold block ${isLight ? 'text-slate-800' : 'text-slate-300'}`}>Hashing FAQ:</span>
              <p><strong>Q: Can hashes be decrypted or reversed?</strong></p>
              <p className={isLight ? 'text-slate-600' : 'text-slate-500'}>A: No. Hashing is mathematically lossy. However, lookup sites use "rainbow tables" containing pre-computed hashes of weak strings (like "123456"). This is why strong passwords and dynamic salt are required.</p>
            </div>
          </div>
        </div>
      </div>

    </div>
  );
}
