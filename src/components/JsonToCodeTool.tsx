import React, { useState, useEffect } from 'react';
import { 
  Braces, 
  FileCode, 
  Copy, 
  Check, 
  Settings, 
  Sparkles, 
  RefreshCw, 
  Trash2, 
  HelpCircle, 
  Info, 
  Code2,
  Terminal,
  Zap
} from 'lucide-react';

interface JsonToCodeToolProps {
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

type Language = 'typescript' | 'go' | 'rust' | 'python' | 'dart';

const SAMPLES = {
  user: {
    title: 'User Profile & Settings',
    data: {
      id: 10420,
      username: "dev_architect",
      email: "architect@ownformatters.com",
      profile: {
        firstName: "Sarah",
        lastName: "Connor",
        avatarUrl: "https://ownformatters.com/avatars/10420.png",
        bio: "Full-stack developer building robust serverless utilities."
      },
      roles: ["admin", "developer"],
      status: {
        active: true,
        lastLogin: "2026-07-19T05:00:00Z"
      },
      preferences: {
        theme: "dark_slate",
        notifications: {
          email: true,
          push: false
        }
      }
    }
  },
  apiResponse: {
    title: 'Paginated API Search Results',
    data: {
      status: "success",
      code: 200,
      pagination: {
        currentPage: 1,
        totalPages: 12,
        pageSize: 25,
        totalItems: 284,
        hasNext: true
      },
      results: [
        {
          id: "tool-08",
          name: "JWT Token Debugger",
          score: 0.985,
          tags: ["security", "auth", "debugging"]
        },
        {
          id: "tool-21",
          name: "JSON to Code Generator",
          score: 0.962,
          tags: ["code-gen", "json", "types"]
        }
      ]
    }
  },
  ecommerce: {
    title: 'Shopping Cart & Checkout',
    data: {
      cartId: "cart_9921a8b",
      userId: 5042,
      currency: "USD",
      pricing: {
        subtotal: 149.99,
        tax: 12.00,
        shipping: 0.00,
        total: 161.99
      },
      items: [
        {
          productId: "prod_premium_sub",
          title: "Developer Pro Suite Plan",
          quantity: 1,
          price: 149.99,
          attributes: {
            duration: "yearly",
            license: "single-user"
          }
        }
      ],
      couponApplied: "DEVPRO30"
    }
  }
};

export default function JsonToCodeTool({ theme }: JsonToCodeToolProps) {
  const [jsonInput, setJsonInput] = useState<string>(JSON.stringify(SAMPLES.user.data, null, 2));
  const [rootName, setRootName] = useState<string>('RootObject');
  const [targetLang, setTargetLang] = useState<Language>('typescript');
  const [outputCode, setOutputCode] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<boolean>(false);
  const [optionalFields, setOptionalFields] = useState<boolean>(false);
  const [useTypescriptTypes, setUseTypescriptTypes] = useState<boolean>(false); // interface vs type
  const [usePythonDataclass, setUsePythonDataclass] = useState<boolean>(false); // TypedDict vs Dataclass

  useEffect(() => {
    generateCode();
  }, [jsonInput, rootName, targetLang, optionalFields, useTypescriptTypes, usePythonDataclass]);

  const cardClass = theme?.card || 'bg-slate-900/50';
  const borderClass = theme?.border || 'border-slate-800/80';
  const inputBgClass = theme?.inputBg || 'bg-slate-950';
  const textMutedClass = theme?.textMuted || 'text-slate-400';

  const formatKeyName = (key: string): string => {
    // Camel/snake to PascalCase for struct/interface names
    const clean = key.replace(/[^a-zA-Z0-9_]/g, '');
    if (!clean) return 'Item';
    return clean
      .split(/[_-]/)
      .map(part => part.charAt(0).toUpperCase() + part.slice(1))
      .join('');
  };

  const getPrimitiveType = (val: any): string => {
    if (val === null) return 'any';
    if (typeof val === 'string') return 'string';
    if (typeof val === 'number') return 'number';
    if (typeof val === 'boolean') return 'boolean';
    return 'any';
  };

  const generateCode = () => {
    setError(null);
    if (!jsonInput.trim()) {
      setOutputCode('');
      return;
    }

    let parsed: any;
    try {
      parsed = JSON.parse(jsonInput);
    } catch (e: any) {
      setError(`Invalid JSON: ${e.message}`);
      return;
    }

    const structs: { name: string; definition: string }[] = [];
    const generatedNames = new Set<string>();

    const getUniqueName = (base: string): string => {
      let candidate = formatKeyName(base);
      if (candidate === rootName) candidate += 'Item';
      let suffix = 1;
      let finalName = candidate;
      while (generatedNames.has(finalName)) {
        finalName = `${candidate}${suffix}`;
        suffix++;
      }
      generatedNames.add(finalName);
      return finalName;
    };

    // Recursive helper to traverse the JSON and collect nested models
    const parseValue = (val: any, keyName: string): { typeStr: string; subModels: any[] } => {
      if (val === null) {
        return { typeStr: 'any', subModels: [] };
      }

      if (Array.isArray(val)) {
        if (val.length === 0) {
          return { typeStr: 'any[]', subModels: [] };
        }
        // Check first element
        const first = val[0];
        if (typeof first === 'object' && first !== null) {
          const subName = getUniqueName(keyName + 'Item');
          const childModels = buildModel(first, subName);
          return { typeStr: `${subName}[]`, subModels: childModels };
        } else {
          const prim = getPrimitiveType(first);
          return { typeStr: `${prim}[]`, subModels: [] };
        }
      }

      if (typeof val === 'object') {
        const subName = getUniqueName(keyName);
        const childModels = buildModel(val, subName);
        return { typeStr: subName, subModels: childModels };
      }

      return { typeStr: getPrimitiveType(val), subModels: [] };
    };

    const buildModel = (obj: any, name: string): any[] => {
      const keys = Object.keys(obj);
      const fields: { key: string; type: string; originalVal: any }[] = [];
      let allSubModels: any[] = [];

      for (const key of keys) {
        const val = obj[key];
        const { typeStr, subModels } = parseValue(val, key);
        fields.push({ key, type: typeStr, originalVal: val });
        allSubModels = [...allSubModels, ...subModels];
      }

      allSubModels.push({ name, fields });
      return allSubModels;
    };

    // Build the collection of structs/interfaces starting from the root
    let models: { name: string; fields: { key: string; type: string; originalVal: any }[] }[] = [];
    if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
      models = buildModel(parsed, rootName);
    } else if (Array.isArray(parsed)) {
      const { typeStr, subModels } = parseValue(parsed, rootName);
      models = subModels;
      // If we just have an array of primitives, handle manually
      if (models.length === 0) {
        if (targetLang === 'typescript') {
          setOutputCode(`export type ${rootName} = ${typeStr};`);
        } else if (targetLang === 'go') {
          setOutputCode(`type ${rootName} []${typeStr === 'number[]' ? 'float64' : typeStr.replace('[]', '')}`);
        } else if (targetLang === 'rust') {
          setOutputCode(`pub type ${rootName} = Vec<${typeStr === 'number[]' ? 'f64' : 'String'}>;`);
        } else if (targetLang === 'python') {
          setOutputCode(`from typing import List\n\n${rootName} = List[${typeStr === 'number[]' ? 'float' : 'str'}]`);
        } else if (targetLang === 'dart') {
          setOutputCode(`typedef ${rootName} = List<${typeStr === 'number[]' ? 'double' : 'String'}>;`);
        }
        return;
      }
    } else {
      setError("Root element of JSON must be an Object or an Array.");
      return;
    }

    // Now format based on language
    let code = '';

    if (targetLang === 'typescript') {
      models.forEach((m) => {
        const declaration = useTypescriptTypes ? 'type' : 'interface';
        const equalsSign = useTypescriptTypes ? ' = {' : ' {';
        const closingBrace = useTypescriptTypes ? '};' : '}';

        let mCode = `export ${declaration} ${m.name}${equalsSign}\n`;
        m.fields.forEach((f) => {
          let t = f.type;
          if (t === 'any') t = 'any';
          const opt = optionalFields ? '?' : '';
          mCode += `  ${f.key}${opt}: ${t};\n`;
        });
        mCode += closingBrace;
        structs.push({ name: m.name, definition: mCode });
      });
      // Sort reverse to put Root on top
      structs.reverse();
      code = structs.map(s => s.definition).join('\n\n');
    }

    else if (targetLang === 'go') {
      models.forEach((m) => {
        let mCode = `type ${m.name} struct {\n`;
        m.fields.forEach((f) => {
          // Map types to Go
          let goType = 'interface{}';
          let baseType = f.type;
          const isArray = baseType.endsWith('[]');
          if (isArray) baseType = baseType.replace('[]', '');

          if (baseType === 'string') goType = 'string';
          else if (baseType === 'number') {
            // Check if float or int based on original value
            const num = f.originalVal;
            if (Number.isInteger(num)) {
              goType = 'int64';
            } else {
              goType = 'float64';
            }
          }
          else if (baseType === 'boolean') goType = 'bool';
          else if (baseType === 'any') goType = 'interface{}';
          else {
            // It's a sub-struct
            goType = baseType;
          }

          if (isArray) {
            goType = `[]${goType}`;
          }

          const capitalizedKey = f.key.charAt(0).toUpperCase() + f.key.slice(1).replace(/[^a-zA-Z0-9]/g, '');
          const opt = optionalFields ? ',omitempty' : '';
          mCode += `    ${capitalizedKey} ${goType} \`json:"${f.key}${opt}"\`\n`;
        });
        mCode += `}`;
        structs.push({ name: m.name, definition: mCode });
      });
      structs.reverse();
      code = `package main\n\n` + structs.map(s => s.definition).join('\n\n');
    }

    else if (targetLang === 'rust') {
      models.forEach((m) => {
        let mCode = `#[derive(Debug, Clone, Serialize, Deserialize)]\n`;
        mCode += `pub struct ${m.name} {\n`;
        m.fields.forEach((f) => {
          let rustType = 'serde_json::Value';
          let baseType = f.type;
          const isArray = baseType.endsWith('[]');
          if (isArray) baseType = baseType.replace('[]', '');

          if (baseType === 'string') rustType = 'String';
          else if (baseType === 'number') {
            const num = f.originalVal;
            rustType = Number.isInteger(num) ? 'i64' : 'f64';
          }
          else if (baseType === 'boolean') rustType = 'bool';
          else if (baseType === 'any') rustType = 'serde_json::Value';
          else {
            rustType = baseType;
          }

          if (isArray) {
            rustType = `Vec<${rustType}>`;
          }

          if (optionalFields) {
            rustType = `Option<${rustType}>`;
          }

          // convert camelCase to snake_case for Rust idiomatic naming
          const rustKey = f.key.replace(/([A-Z])/g, '_$1').toLowerCase().replace(/^_/, '');
          const renameAttr = rustKey !== f.key ? `    #[serde(rename = "${f.key}")]\n` : '';
          mCode += `${renameAttr}    pub ${rustKey}: ${rustType},\n`;
        });
        mCode += `}`;
        structs.push({ name: m.name, definition: mCode });
      });
      structs.reverse();
      code = `use serde::{Serialize, Deserialize};\n\n` + structs.map(s => s.definition).join('\n\n');
    }

    else if (targetLang === 'python') {
      const header = usePythonDataclass 
        ? `from dataclasses import dataclass\nfrom typing import List, Optional, Any`
        : `from typing import TypedDict, List, Optional, Any`;

      models.forEach((m) => {
        let mCode = '';
        if (usePythonDataclass) {
          mCode += `@dataclass\nclass ${m.name}:\n`;
        } else {
          mCode += `class ${m.name}(TypedDict):\n`;
        }

        if (m.fields.length === 0) {
          mCode += '    pass\n';
        } else {
          m.fields.forEach((f) => {
            let pyType = 'Any';
            let baseType = f.type;
            const isArray = baseType.endsWith('[]');
            if (isArray) baseType = baseType.replace('[]', '');

            if (baseType === 'string') pyType = 'str';
            else if (baseType === 'number') {
              const num = f.originalVal;
              pyType = Number.isInteger(num) ? 'int' : 'float';
            }
            else if (baseType === 'boolean') pyType = 'bool';
            else if (baseType === 'any') pyType = 'Any';
            else pyType = baseType;

            if (isArray) {
              pyType = `List[${pyType}]`;
            }

            if (optionalFields) {
              pyType = `Optional[${pyType}]`;
            }

            mCode += `    ${f.key}: ${pyType}\n`;
          });
        }
        structs.push({ name: m.name, definition: mCode });
      });
      // Python classes must declare dependencies first, so we keep topological order!
      code = header + `\n\n` + structs.map(s => s.definition).join('\n\n');
    }

    else if (targetLang === 'dart') {
      models.forEach((m) => {
        let mCode = `class ${m.name} {\n`;
        
        // Constructor fields
        m.fields.forEach((f) => {
          let dartType = 'dynamic';
          let baseType = f.type;
          const isArray = baseType.endsWith('[]');
          if (isArray) baseType = baseType.replace('[]', '');

          if (baseType === 'string') dartType = 'String';
          else if (baseType === 'number') {
            const num = f.originalVal;
            dartType = Number.isInteger(num) ? 'int' : 'double';
          }
          else if (baseType === 'boolean') dartType = 'bool';
          else if (baseType === 'any') dartType = 'dynamic';
          else dartType = baseType;

          if (isArray) {
            dartType = `List<${dartType}>`;
          }

          if (optionalFields) {
            dartType = `${dartType}?`;
          }

          mCode += `  final ${dartType} ${f.key};\n`;
        });

        mCode += `\n  ${m.name}({\n`;
        m.fields.forEach((f) => {
          const prefix = optionalFields ? '' : 'required ';
          mCode += `    ${prefix}this.${f.key},\n`;
        });
        mCode += `  });\n`;

        // fromJson factory
        mCode += `\n  factory ${m.name}.fromJson(Map<String, dynamic> json) {\n`;
        mCode += `    return ${m.name}(\n`;
        m.fields.forEach((f) => {
          let dartType = 'dynamic';
          let baseType = f.type;
          const isArray = baseType.endsWith('[]');
          if (isArray) baseType = baseType.replace('[]', '');

          if (baseType === 'string') dartType = 'String';
          else if (baseType === 'number') {
            const num = f.originalVal;
            dartType = Number.isInteger(num) ? 'int' : 'double';
          }
          else if (baseType === 'boolean') dartType = 'bool';
          else if (baseType === 'any') dartType = 'dynamic';
          else dartType = baseType;

          if (isArray) {
            if (['String', 'int', 'double', 'bool'].includes(dartType)) {
              mCode += `      ${f.key}: List<${dartType}>.from(json['${f.key}'] as List),\n`;
            } else {
              mCode += `      ${f.key}: (json['${f.key}'] as List?)\n`;
              mCode += `          ?.map((e) => ${dartType}.fromJson(e as Map<String, dynamic>))\n`;
              mCode += `          .toList() ?? [],\n`;
            }
          } else if (!['String', 'int', 'double', 'bool', 'dynamic'].includes(dartType)) {
            mCode += `      ${f.key}: json['${f.key}'] != null ? ${dartType}.fromJson(json['${f.key}'] as Map<String, dynamic>) : null,\n`;
          } else {
            mCode += `      ${f.key}: json['${f.key}'] as ${dartType}${optionalFields ? '?' : ''},\n`;
          }
        });
        mCode += `    );\n  }\n`;

        // toJson map
        mCode += `\n  Map<String, dynamic> toJson() {\n`;
        mCode += `    return {\n`;
        m.fields.forEach((f) => {
          let baseType = f.type;
          const isArray = baseType.endsWith('[]');
          if (isArray) baseType = baseType.replace('[]', '');

          const isPrimitive = ['string', 'number', 'boolean', 'any'].includes(baseType);
          if (isPrimitive) {
            mCode += `      '${f.key}': ${f.key},\n`;
          } else if (isArray) {
            mCode += `      '${f.key}': ${f.key}.map((e) => e.toJson()).toList(),\n`;
          } else {
            mCode += `      '${f.key}': ${f.key}${optionalFields ? '?' : ''}.toJson(),\n`;
          }
        });
        mCode += `    };\n  }\n`;

        mCode += `}`;
        structs.push({ name: m.name, definition: mCode });
      });
      // Dart classes topological order
      code = structs.map(s => s.definition).join('\n\n');
    }

    setOutputCode(code);
  };

  const handleCopy = () => {
    if (!outputCode) return;
    navigator.clipboard.writeText(outputCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const loadSample = (key: 'user' | 'apiResponse' | 'ecommerce') => {
    setJsonInput(JSON.stringify(SAMPLES[key].data, null, 2));
    if (key === 'user') setRootName('UserProfile');
    else if (key === 'apiResponse') setRootName('SearchResponse');
    else if (key === 'ecommerce') setRootName('CheckoutPayload');
  };

  const handleClear = () => {
    setJsonInput('');
    setOutputCode('');
    setError(null);
  };

  const handleBeautify = () => {
    try {
      const parsed = JSON.parse(jsonInput);
      setJsonInput(JSON.stringify(parsed, null, 2));
      setError(null);
    } catch (e: any) {
      setError(`Invalid JSON to format: ${e.message}`);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Tool Header */}
      <div className={`p-6 rounded-2xl ${cardClass} border ${borderClass} relative overflow-hidden shadow-xl`}>
        <div className="flex flex-col md:flex-row gap-5 items-start md:items-center justify-between relative z-10">
          <div className="space-y-2 text-left">
            <h2 className="text-xl font-black flex items-center gap-2">
              <Code2 className="w-6 h-6 text-indigo-500 animate-pulse" />
              JSON to Code / Type Struct Generator
            </h2>
            <p className={`text-xs ${textMutedClass} max-w-2xl leading-relaxed`}>
              Paste any JSON payload to instantly generate nested models, typings, and companion serializers. Ideal for spinning up interfaces in <strong>TypeScript, Go, Rust, Python</strong>, or <strong>Dart</strong>.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button 
              onClick={() => loadSample('user')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${theme?.btnSecondary || 'bg-slate-800 hover:bg-slate-750 text-slate-300'} border ${borderClass} cursor-pointer`}
            >
              User Profile Sample
            </button>
            <button 
              onClick={() => loadSample('apiResponse')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${theme?.btnSecondary || 'bg-slate-800 hover:bg-slate-750 text-slate-300'} border ${borderClass} cursor-pointer`}
            >
              API Response Sample
            </button>
            <button 
              onClick={() => loadSample('ecommerce')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${theme?.btnSecondary || 'bg-slate-800 hover:bg-slate-750 text-slate-300'} border ${borderClass} cursor-pointer`}
            >
              E-commerce Sample
            </button>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Input and Parameters */}
        <div className="lg:col-span-6 space-y-6">
          {/* Settings Parameters Panel */}
          <div className={`p-5 rounded-2xl ${cardClass} border ${borderClass} space-y-4 shadow-md text-left`}>
            <h3 className="text-sm font-bold flex items-center gap-2 border-b pb-2.5 border-slate-800/40">
              <Settings className="w-4 h-4 text-indigo-400 animate-spin-slow" />
              1. Generation Options
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Root Object Name</label>
                <input 
                  type="text" 
                  value={rootName}
                  onChange={(e) => setRootName(e.target.value.replace(/[^a-zA-Z0-9_]/g, ''))}
                  className={`w-full text-xs px-3 py-2 rounded-lg border ${borderClass} ${inputBgClass} focus:outline-none focus:border-indigo-500 font-mono`}
                  placeholder="RootObject"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300">Target Language</label>
                <select
                  value={targetLang}
                  onChange={(e) => setTargetLang(e.target.value as Language)}
                  className={`w-full text-xs px-3 py-2 rounded-lg border ${borderClass} ${inputBgClass} focus:outline-none focus:border-indigo-500 font-sans cursor-pointer`}
                >
                  <option value="typescript">TypeScript Interfaces</option>
                  <option value="go">Go Structs (JSON tag)</option>
                  <option value="rust">Rust Serve Structs</option>
                  <option value="python">Python Data/TypedDict</option>
                  <option value="dart">Dart JSON Companion</option>
                </select>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 pt-1">
              <label className="flex items-center gap-2.5 cursor-pointer select-none">
                <input 
                  type="checkbox" 
                  checked={optionalFields}
                  onChange={(e) => setOptionalFields(e.target.checked)}
                  className="rounded text-indigo-600 focus:ring-indigo-500/30"
                />
                <span className="text-xs font-medium text-slate-300">Make Fields Optional / Nullable</span>
              </label>

              {targetLang === 'typescript' && (
                <label className="flex items-center gap-2.5 cursor-pointer select-none animate-fade-in">
                  <input 
                    type="checkbox" 
                    checked={useTypescriptTypes}
                    onChange={(e) => setUseTypescriptTypes(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500/30"
                  />
                  <span className="text-xs font-medium text-slate-300">Use alias "type" instead of "interface"</span>
                </label>
              )}

              {targetLang === 'python' && (
                <label className="flex items-center gap-2.5 cursor-pointer select-none animate-fade-in">
                  <input 
                    type="checkbox" 
                    checked={usePythonDataclass}
                    onChange={(e) => setUsePythonDataclass(e.target.checked)}
                    className="rounded text-indigo-600 focus:ring-indigo-500/30"
                  />
                  <span className="text-xs font-medium text-slate-300">Use @dataclass instead of TypedDict</span>
                </label>
              )}
            </div>
          </div>

          {/* JSON Input Editor */}
          <div className={`p-5 rounded-2xl ${cardClass} border ${borderClass} space-y-3.5 shadow-md text-left relative`}>
            <div className="flex items-center justify-between border-b pb-2.5 border-slate-800/40">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Braces className="w-4 h-4 text-indigo-400" />
                2. Raw JSON Payload
              </h3>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleBeautify}
                  className="text-[10px] text-indigo-400 hover:underline hover:text-indigo-300 cursor-pointer"
                  title="Format JSON input nicely"
                >
                  Beautify
                </button>
                <span className="text-slate-700">|</span>
                <button
                  onClick={handleClear}
                  className="text-[10px] text-rose-400 hover:underline hover:text-rose-300 cursor-pointer flex items-center gap-1"
                >
                  <Trash2 className="w-3 h-3" />
                  Clear
                </button>
              </div>
            </div>

            <textarea 
              rows={14}
              value={jsonInput}
              onChange={(e) => setJsonInput(e.target.value)}
              className={`w-full text-xs px-3.5 py-3 rounded-lg border ${borderClass} ${inputBgClass} focus:outline-none focus:border-indigo-500 font-mono placeholder:text-slate-650`}
              placeholder={`{\n  "key": "value"\n}`}
            />

            {error && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-semibold font-mono">
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Code Outputs and Documentation */}
        <div className="lg:col-span-6 space-y-6">
          {/* Target Outputs Editor */}
          <div className={`p-5 rounded-2xl ${cardClass} border ${borderClass} space-y-3.5 shadow-md text-left relative flex flex-col min-h-[460px]`}>
            <div className="flex items-center justify-between border-b pb-2.5 border-slate-800/40">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <FileCode className="w-4 h-4 text-emerald-400" />
                3. Generated {targetLang.charAt(0).toUpperCase() + targetLang.slice(1)} Structure
              </h3>
              <button
                onClick={handleCopy}
                disabled={!outputCode}
                className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-55 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
              >
                {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                {copied ? 'Copied!' : 'Copy Code'}
              </button>
            </div>

            <div className="relative flex-1 flex flex-col">
              <textarea 
                readOnly
                value={outputCode || 'Paste valid JSON on the left to generate typings...'}
                className={`w-full flex-1 text-xs px-3.5 py-3 rounded-lg border ${borderClass} ${inputBgClass} focus:outline-none font-mono text-emerald-300 resize-none`}
                rows={16}
              />
            </div>
          </div>

          {/* Integration Guide Banner */}
          <div className={`p-5 rounded-2xl bg-indigo-950/10 border ${borderClass} space-y-4 shadow-sm text-left`}>
            <h3 className="text-sm font-bold flex items-center gap-2 border-b pb-2.5 border-slate-800/40">
              <Zap className="w-4 h-4 text-indigo-400" />
              Pro Tips for Stronger APIs
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <p className="font-bold text-indigo-300 flex items-center gap-1">
                  <Terminal className="w-3.5 h-3.5" />
                  Snake vs Camel Case
                </p>
                <p className={`text-[10px] ${textMutedClass} leading-relaxed`}>
                  Rust and Go definitions automatically match their native casing standards (Rust converted to <code className="bg-slate-900 px-1 py-0.5 rounded">snake_case</code>, Go structs tag standard annotations).
                </p>
              </div>

              <div className="space-y-1">
                <p className="font-bold text-emerald-300 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" />
                  Null Integrity checks
                </p>
                <p className={`text-[10px] ${textMutedClass} leading-relaxed`}>
                  When using Dart, the companion `fromJson` factory maps missing nested array models into safe default structures (<code className="bg-slate-900 px-1 py-0.5 rounded">[]</code>) to prevent null pointer crashes.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
