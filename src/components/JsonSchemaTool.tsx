import React, { useState } from 'react';
import { Play, Copy, Check, Trash2, Code, ArrowLeftRight, FileText, CheckCircle, AlertCircle, Sparkles, BookOpen } from 'lucide-react';

const SAMPLE_JSON = `{
  "id": 101,
  "name": "DevWorkspace Pro",
  "active": true,
  "tags": ["productivity", "developer-tools"],
  "settings": {
    "theme": "dark",
    "fontSize": 14,
    "enableNotifications": false
  },
  "quota": 85.5
}`;

const SAMPLE_SCHEMA = `{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "Developer Workspace Schema",
  "type": "object",
  "required": ["id", "name", "active", "settings"],
  "properties": {
    "id": {
      "type": "integer",
      "minimum": 1
    },
    "name": {
      "type": "string",
      "minLength": 3,
      "maxLength": 50
    },
    "active": {
      "type": "boolean"
    },
    "tags": {
      "type": "array",
      "items": {
        "type": "string"
      }
    },
    "settings": {
      "type": "object",
      "required": ["theme", "fontSize"],
      "properties": {
        "theme": {
          "type": "string",
          "enum": ["light", "dark", "system"]
        },
        "fontSize": {
          "type": "integer",
          "minimum": 8,
          "maximum": 32
        },
        "enableNotifications": {
          "type": "boolean"
        }
      }
    },
    "quota": {
      "type": "number",
      "minimum": 0.0,
      "maximum": 100.0
    }
  }
}`;

interface ValidationError {
  path: string;
  message: string;
  rule: string;
}

export default function JsonSchemaTool({ theme }: { theme?: any }) {
  const [jsonInput, setJsonInput] = useState<string>('');
  const [schemaInput, setSchemaInput] = useState<string>('');
  const [status, setStatus] = useState<{ type: 'idle' | 'success' | 'error'; message: string }>({ type: 'idle', message: '' });
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);
  const [copiedSchema, setCopiedSchema] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'generate' | 'validate'>('generate');

  const t = theme || {
    isDark: true,
    bg: 'bg-[#02050b]',
    text: 'text-slate-200',
    textMuted: 'text-slate-400',
    border: 'border-slate-900',
    borderMuted: 'border-slate-900/40',
    card: 'bg-slate-950/40',
    inputBg: 'bg-slate-950',
    panelBg: 'bg-slate-900',
    btnPrimary: 'bg-indigo-600 hover:bg-indigo-500 text-white',
    btnSecondary: 'bg-slate-900 hover:bg-slate-850 border-slate-800 text-slate-200',
    canvasBg: 'bg-[#02050c]'
  };

  const isLight = t.isDark === false;

  // Recursive Schema Generator
  const generateSchema = (val: any): any => {
    if (val === null) {
      return { type: 'null' };
    }
    if (Array.isArray(val)) {
      const itemsType = val.length > 0 ? generateSchema(val[0]) : { type: 'string' };
      return {
        type: 'array',
        items: itemsType
      };
    }
    if (typeof val === 'object') {
      const properties: Record<string, any> = {};
      const required: string[] = [];
      Object.entries(val).forEach(([k, v]) => {
        properties[k] = generateSchema(v);
        required.push(k);
      });
      return {
        type: 'object',
        properties,
        required
      };
    }
    if (typeof val === 'number') {
      return { type: Number.isInteger(val) ? 'integer' : 'number' };
    }
    if (typeof val === 'boolean') {
      return { type: 'boolean' };
    }
    return { type: 'string' };
  };

  const handleGenerate = () => {
    if (!jsonInput.trim()) {
      setStatus({ type: 'error', message: 'Please provide JSON input to generate a schema!' });
      return;
    }
    try {
      const parsed = JSON.parse(jsonInput);
      const generated = {
        $schema: 'http://json-schema.org/draft-07/schema#',
        title: 'Generated Schema',
        description: 'Generated from sample payload',
        ...generateSchema(parsed)
      };
      setSchemaInput(JSON.stringify(generated, null, 2));
      setStatus({ type: 'success', message: 'Schema generated successfully! Head over to the Validator tab to try it out.' });
      setValidationErrors([]);
    } catch (err: any) {
      setStatus({ type: 'error', message: `Invalid JSON structure: ${err.message}` });
    }
  };

  // Schema Validator Engine
  const validateJsonAgainstSchema = () => {
    if (!jsonInput.trim() || !schemaInput.trim()) {
      setStatus({ type: 'error', message: 'Both JSON Data and JSON Schema are required for validation!' });
      return;
    }

    let parsedJson: any;
    let parsedSchema: any;

    try {
      parsedJson = JSON.parse(jsonInput);
    } catch (err: any) {
      setStatus({ type: 'error', message: `Invalid JSON Data: ${err.message}` });
      return;
    }

    try {
      parsedSchema = JSON.parse(schemaInput);
    } catch (err: any) {
      setStatus({ type: 'error', message: `Invalid JSON Schema: ${err.message}` });
      return;
    }

    const errors: ValidationError[] = [];

    const checkType = (value: any, expectedType: string): boolean => {
      if (expectedType === 'null') return value === null;
      if (expectedType === 'array') return Array.isArray(value);
      if (expectedType === 'object') return value !== null && typeof value === 'object' && !Array.isArray(value);
      if (expectedType === 'integer') return Number.isInteger(value);
      if (expectedType === 'number') return typeof value === 'number';
      if (expectedType === 'boolean') return typeof value === 'boolean';
      if (expectedType === 'string') return typeof value === 'string';
      return true;
    };

    const validateNode = (nodeValue: any, nodeSchema: any, path: string) => {
      if (typeof nodeSchema !== 'object' || nodeSchema === null) return;

      // Type Check
      if (nodeSchema.type) {
        const types = Array.isArray(nodeSchema.type) ? nodeSchema.type : [nodeSchema.type];
        const hasValidType = types.some((t: string) => checkType(nodeValue, t));
        if (!hasValidType) {
          errors.push({
            path,
            message: `Value must be of type: ${types.join(' or ')}. Got ${valueTypeString(nodeValue)}.`,
            rule: 'type'
          });
          return; // Skip further validations if type is fundamentally wrong
        }
      }

      // Enum Check
      if (nodeSchema.enum) {
        if (!nodeSchema.enum.includes(nodeValue)) {
          errors.push({
            path,
            message: `Value must be one of the enum values: [${nodeSchema.enum.join(', ')}]. Got "${nodeValue}".`,
            rule: 'enum'
          });
        }
      }

      // String Constraints
      if (typeof nodeValue === 'string') {
        if (typeof nodeSchema.minLength === 'number' && nodeValue.length < nodeSchema.minLength) {
          errors.push({
            path,
            message: `String length must be at least ${nodeSchema.minLength} characters. Got ${nodeValue.length}.`,
            rule: 'minLength'
          });
        }
        if (typeof nodeSchema.maxLength === 'number' && nodeValue.length > nodeSchema.maxLength) {
          errors.push({
            path,
            message: `String length must be at most ${nodeSchema.maxLength} characters. Got ${nodeValue.length}.`,
            rule: 'maxLength'
          });
        }
        if (nodeSchema.pattern) {
          try {
            const regex = new RegExp(nodeSchema.pattern);
            if (!regex.test(nodeValue)) {
              errors.push({
                path,
                message: `String does not match pattern: ${nodeSchema.pattern}`,
                rule: 'pattern'
              });
            }
          } catch (e) {}
        }
      }

      // Numeric Constraints
      if (typeof nodeValue === 'number') {
        if (typeof nodeSchema.minimum === 'number' && nodeValue < nodeSchema.minimum) {
          errors.push({
            path,
            message: `Value must be greater than or equal to ${nodeSchema.minimum}. Got ${nodeValue}.`,
            rule: 'minimum'
          });
        }
        if (typeof nodeSchema.maximum === 'number' && nodeValue > nodeSchema.maximum) {
          errors.push({
            path,
            message: `Value must be less than or equal to ${nodeSchema.maximum}. Got ${nodeValue}.`,
            rule: 'maximum'
          });
        }
      }

      // Object Constraints
      if (nodeValue !== null && typeof nodeValue === 'object' && !Array.isArray(nodeValue)) {
        // Required Fields
        if (Array.isArray(nodeSchema.required)) {
          nodeSchema.required.forEach((reqField: string) => {
            if (!(reqField in nodeValue) || nodeValue[reqField] === undefined) {
              errors.push({
                path: path === 'root' ? reqField : `${path}.${reqField}`,
                message: `Required property "${reqField}" is missing.`,
                rule: 'required'
              });
            }
          });
        }

        // Properties Verification
        if (nodeSchema.properties) {
          Object.entries(nodeSchema.properties).forEach(([propName, propSchema]) => {
            if (propName in nodeValue && nodeValue[propName] !== undefined) {
              validateNode(nodeValue[propName], propSchema, path === 'root' ? propName : `${path}.${propName}`);
            }
          });
        }
      }

      // Array Constraints
      if (Array.isArray(nodeValue)) {
        if (typeof nodeSchema.minItems === 'number' && nodeValue.length < nodeSchema.minItems) {
          errors.push({
            path,
            message: `Array must contain at least ${nodeSchema.minItems} items. Got ${nodeValue.length}.`,
            rule: 'minItems'
          });
        }
        if (typeof nodeSchema.maxItems === 'number' && nodeValue.length > nodeSchema.maxItems) {
          errors.push({
            path,
            message: `Array must contain at most ${nodeSchema.maxItems} items. Got ${nodeValue.length}.`,
            rule: 'maxItems'
          });
        }

        if (nodeSchema.items) {
          nodeValue.forEach((itemVal: any, idx: number) => {
            validateNode(itemVal, nodeSchema.items, `${path}[${idx}]`);
          });
        }
      }
    };

    const valueTypeString = (v: any) => {
      if (v === null) return 'null';
      if (Array.isArray(v)) return 'array';
      return typeof v;
    };

    validateNode(parsedJson, parsedSchema, 'root');

    if (errors.length === 0) {
      setStatus({ type: 'success', message: 'JSON validation succeeded! No schema errors found.' });
      setValidationErrors([]);
    } else {
      setStatus({ type: 'error', message: `Validation failed with ${errors.length} error(s).` });
      setValidationErrors(errors);
    }
  };

  const handleLoadSamples = () => {
    setJsonInput(SAMPLE_JSON);
    setSchemaInput(SAMPLE_SCHEMA);
    setStatus({ type: 'idle', message: '' });
    setValidationErrors([]);
  };

  const handleClear = () => {
    setJsonInput('');
    setSchemaInput('');
    setStatus({ type: 'idle', message: '' });
    setValidationErrors([]);
  };

  const copyToClipboard = (text: string, setCopied: (b: boolean) => void) => {
    if (!text) return;
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className={`p-6 space-y-6 ${t.text}`}>
      {/* Title Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-2xl font-sans font-bold tracking-tight">JSON Schema Generator & Validator</h1>
          <p className={`text-xs ${t.textMuted} mt-1`}>
            Instantly auto-generate draft-07 schemas from JSON payloads and audit instance data against schema specs.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleLoadSamples}
            className={`px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 border transition-all ${t.btnSecondary}`}
          >
            <BookOpen className="w-3.5 h-3.5" />
            Load Preset Samples
          </button>
          <button
            onClick={handleClear}
            className={`px-3 py-2 rounded-xl text-xs flex items-center gap-1.5 border transition-all border-red-500/20 hover:border-red-500/40 text-red-400 hover:bg-red-500/5`}
          >
            <Trash2 className="w-3.5 h-3.5" />
            Clear
          </button>
        </div>
      </div>

      {/* Mode Navigation Tabs */}
      <div className="flex gap-1 p-1 bg-slate-900/40 rounded-xl border border-slate-900 w-fit">
        <button
          onClick={() => setActiveTab('generate')}
          className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
            activeTab === 'generate' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-3.5 h-3.5 inline mr-1.5" />
          Schema Generator
        </button>
        <button
          onClick={() => setActiveTab('validate')}
          className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
            activeTab === 'validate' ? 'bg-indigo-600 text-white shadow-md' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <CheckCircle className="w-3.5 h-3.5 inline mr-1.5" />
          Instance Validator
        </button>
      </div>

      {/* Core Split Pane Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Hand side JSON editor */}
        <div className="space-y-2">
          <div className="flex justify-between items-center px-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">
              JSON Object Data
            </span>
            <button
              onClick={() => copyToClipboard(jsonInput, () => {})}
              className="p-1 hover:text-indigo-400 text-slate-500 transition-colors"
              title="Copy input"
            >
              <Copy className="w-4 h-4" />
            </button>
          </div>
          <textarea
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder={`{\n  "key": "value"\n}`}
            className={`w-full h-96 p-4 rounded-xl border font-mono text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 ${t.inputBg} ${t.border} resize-none`}
            id="json-schema-instance-input"
          />
        </div>

        {/* Right Hand side JSON Schema */}
        <div className="space-y-2">
          <div className="flex justify-between items-center px-1">
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 font-mono">
              JSON Schema Definition
            </span>
            <button
              onClick={() => copyToClipboard(schemaInput, setCopiedSchema)}
              className="p-1 hover:text-indigo-400 text-slate-500 transition-colors flex items-center gap-1 text-xs"
              title="Copy Schema"
            >
              {copiedSchema ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              {copiedSchema && <span className="text-emerald-400 font-sans">Copied!</span>}
            </button>
          </div>
          <textarea
            value={schemaInput}
            onChange={(e) => setSchemaInput(e.target.value)}
            placeholder={`{\n  "$schema": "http://json-schema.org/draft-07/schema#",\n  "type": "object",\n  "properties": {}\n}`}
            className={`w-full h-96 p-4 rounded-xl border font-mono text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500 ${t.inputBg} ${t.border} resize-none`}
            id="json-schema-definition-input"
          />
        </div>
      </div>

      {/* Control Actions Panel */}
      <div className="flex items-center gap-3">
        {activeTab === 'generate' ? (
          <button
            onClick={handleGenerate}
            className={`px-5 py-3 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-lg shadow-indigo-600/15 ${t.btnPrimary}`}
          >
            <Sparkles className="w-4 h-4" />
            Generate JSON Schema
          </button>
        ) : (
          <button
            onClick={validateJsonAgainstSchema}
            className={`px-5 py-3 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all shadow-lg shadow-indigo-600/15 ${t.btnPrimary}`}
          >
            <Play className="w-4 h-4" />
            Validate JSON Payload
          </button>
        )}
      </div>

      {/* Status Notice */}
      {status.type !== 'idle' && (
        <div
          className={`p-4 rounded-xl flex items-start gap-3 border ${
            status.type === 'success'
              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
              : 'bg-red-500/10 border-red-500/30 text-red-300'
          }`}
        >
          {status.type === 'success' ? (
            <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          )}
          <div>
            <span className="text-xs font-semibold font-mono block uppercase tracking-wider">
              {status.type === 'success' ? 'SUCCESS' : 'VALIDATION ALERT'}
            </span>
            <p className="text-xs mt-1 font-mono leading-relaxed">{status.message}</p>
          </div>
        </div>
      )}

      {/* Visual Error Report Details */}
      {validationErrors.length > 0 && (
        <div className={`p-5 rounded-xl border ${t.border} bg-slate-900/20 space-y-3`}>
          <h3 className="text-sm font-semibold tracking-tight">Audit Issue Breakdown</h3>
          <div className="space-y-2 max-h-60 overflow-y-auto">
            {validationErrors.map((err, idx) => (
              <div key={idx} className="flex gap-3 p-3 rounded-lg bg-red-500/5 border border-red-500/15 text-xs text-red-400">
                <div className="px-1.5 py-0.5 rounded bg-red-500/20 text-[10px] font-mono self-start uppercase font-semibold">
                  {err.rule}
                </div>
                <div>
                  <p className="font-semibold text-slate-300">
                    Path: <span className="font-mono text-red-300 font-medium">/{err.path}</span>
                  </p>
                  <p className="text-slate-400 mt-1">{err.message}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
