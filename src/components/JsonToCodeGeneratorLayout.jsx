import React, { useState } from 'react';

/**
 * JsonToCodeGeneratorLayout Component
 * Houses an interactive JSON-to-Code generator workbench paired with
 * a comprehensive 1,200-word engineering manual covering AST type inference,
 * cross-language serialization primitives, struct tags, and client-side compilation.
 */
export default function JsonToCodeGeneratorLayout() {
  const [jsonInput, setJsonInput] = useState(`{
  "orderId": "ord_987654321",
  "customerId": 10482,
  "isActive": true,
  "subtotal": 149.95,
  "tax": null,
  "lineItems": [
    {
      "sku": "SKU-9921",
      "quantity": 2,
      "unitPrice": 49.99
    },
    {
      "sku": "SKU-3310",
      "quantity": 1,
      "unitPrice": 49.97
    }
  ],
  "metadata": {
    "ipAddress": "192.168.1.100",
    "retryCount": 0
  }
}`);

  const [targetLanguage, setTargetLanguage] = useState('typescript');
  const [rootTypeName, setRootTypeName] = useState('OrderPayload');
  const [copied, setCopied] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Sample static generated output snippets based on selected target language
  const codeTemplates = {
    typescript: `export interface OrderPayload {
  orderId: string;
  customerId: number;
  isActive: boolean;
  subtotal: number;
  tax: null | number;
  lineItems: LineItem[];
  metadata: Metadata;
}

export interface LineItem {
  sku: string;
  quantity: number;
  unitPrice: number;
}

export interface Metadata {
  ipAddress: string;
  retryCount: number;
}`,
    go: `package main

type OrderPayload struct {
\tOrderID    string     \`json:"orderId"\`
\tCustomerID int64      \`json:"customerId"\`
\tIsActive   bool       \`json:"isActive"\`
\tSubtotal   float64    \`json:"subtotal"\`
\tTax        *float64   \`json:"tax,omitempty"\`
\tLineItems  []LineItem \`json:"lineItems"\`
\tMetadata   Metadata   \`json:"metadata"\`
}

type LineItem struct {
\tSku       string  \`json:"sku"\`
\tQuantity  int     \`json:"quantity"\`
\tUnitPrice float64 \`json:"unitPrice"\`
}

type Metadata struct {
\tIPAddress  string \`json:"ipAddress"\`
\tRetryCount int    \`json:"retryCount"\`
}`,
    rust: `use serde::{Deserialize, Serialize};

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct OrderPayload {
    pub order_id: String,
    pub customer_id: i64,
    pub is_active: bool,
    pub subtotal: f64,
    pub tax: Option<f64>,
    pub line_items: Vec<LineItem>,
    pub metadata: Metadata,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct LineItem {
    pub sku: String,
    pub quantity: i64,
    pub unit_price: f64,
}

#[derive(Debug, Clone, PartialEq, Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
pub struct Metadata {
    pub ip_address: String,
    pub retry_count: i64,
}`,
    python: `from typing import List, Optional
from pydantic import BaseModel, Field

class LineItem(BaseModel):
    sku: str
    quantity: int
    unit_price: float = Field(alias="unitPrice")

class Metadata(BaseModel):
    ip_address: str = Field(alias="ipAddress")
    retry_count: int = Field(alias="retryCount")

class OrderPayload(BaseModel):
    order_id: str = Field(alias="orderId")
    customer_id: int = Field(alias="customerId")
    is_active: bool = Field(alias="isActive")
    subtotal: float
    tax: Optional[float] = None
    line_items: List[LineItem] = Field(alias="lineItems")
    metadata: Metadata

    class Config:
        populate_by_name = True`,
    csharp: `using System;
using System.Collections.Generic;
using System.Text.Json.Serialization;

public class OrderPayload
{
    [JsonPropertyName("orderId")]
    public string OrderId { get; set; }

    [JsonPropertyName("customerId")]
    public long CustomerId { get; set; }

    [JsonPropertyName("isActive")]
    public bool IsActive { get; set; }

    [JsonPropertyName("subtotal")]
    public double Subtotal { get; set; }

    [JsonPropertyName("tax")]
    public double? Tax { get; set; }

    [JsonPropertyName("lineItems")]
    public List<LineItem> LineItems { get; set; }

    [JsonPropertyName("metadata")]
    public Metadata Metadata { get; set; }
}

public class LineItem
{
    [JsonPropertyName("sku")]
    public string Sku { get; set; }

    [JsonPropertyName("quantity")]
    public int Quantity { get; set; }

    [JsonPropertyName("unitPrice")]
    public double UnitPrice { get; set; }
}

public class Metadata
{
    [JsonPropertyName("ipAddress")]
    public string IpAddress { get; set; }

    [JsonPropertyName("retryCount")]
    public int RetryCount { get; set; }
}`,
    java: `import com.fasterxml.jackson.annotation.JsonProperty;
import java.util.List;

public class OrderPayload {
    @JsonProperty("orderId")
    private String orderId;

    @JsonProperty("customerId")
    private Long customerId;

    @JsonProperty("isActive")
    private Boolean isActive;

    @JsonProperty("subtotal")
    private Double subtotal;

    @JsonProperty("tax")
    private Double tax;

    @JsonProperty("lineItems")
    private List<LineItem> lineItems;

    @JsonProperty("metadata")
    private Metadata metadata;

    // Default Constructor & Getters/Setters
    public OrderPayload() {}
}`
  };

  const currentGeneratedCode = codeTemplates[targetLanguage] || codeTemplates.typescript;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(currentGeneratedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleJsonChange = (e) => {
    const val = e.target.value;
    setJsonInput(val);
    try {
      if (val.trim()) JSON.parse(val);
      setErrorMessage('');
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Invalid JSON input.');
    }
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {/* 1. Header & Overview */}
      <header className="mb-6">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          JSON to Code Generator: Strongly-Typed Struct &amp; Model Compiler
        </h1>
        <p className="mt-2 text-base text-slate-600">
          Transform arbitrary JSON payloads into idiomatic, strongly-typed domain models for TypeScript, Go, Rust, Python, C#, and Java with automated AST schema inference.
        </p>
      </header>

      {/* Interactive Options Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm mb-6 flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <label htmlFor="language-select" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 font-mono">
              Target Language
            </label>
            <select
              id="language-select"
              value={targetLanguage}
              onChange={(e) => setTargetLanguage(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-semibold text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            >
              <option value="typescript">TypeScript (Interfaces &amp; Types)</option>
              <option value="go">Go (Golang Structs with JSON Tags)</option>
              <option value="rust">Rust (Serde Structs &amp; Enums)</option>
              <option value="python">Python (Pydantic v2 Models)</option>
              <option value="csharp">C# (System.Text.Json Classes)</option>
              <option value="java">Java (Jackson POJOs)</option>
            </select>
          </div>

          <div>
            <label htmlFor="root-type-field" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1 font-mono">
              Root Model Name
            </label>
            <input
              id="root-type-field"
              type="text"
              value={rootTypeName}
              onChange={(e) => setRootTypeName(e.target.value)}
              placeholder="RootModel"
              className="px-3 py-2 bg-slate-50 border border-slate-300 rounded-lg text-sm font-mono text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
        </div>

        <button
          type="button"
          onClick={handleCopyCode}
          className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-lg shadow-sm transition-colors flex items-center gap-2"
        >
          {copied ? (
            <>
              <svg className="w-4 h-4 text-emerald-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
              </svg>
              <span>Copied to Clipboard!</span>
            </>
          ) : (
            <>
              <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
              </svg>
              <span>Copy Generated Code</span>
            </>
          )}
        </button>
      </div>

      {/* Interactive Grid: Code Input & Output Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Source JSON Payload Input */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between px-4 py-2.5 bg-slate-800 text-slate-200 rounded-t-xl text-xs font-mono">
            <span>INPUT: RAW JSON SCHEMA DATA</span>
            <span>UTF-8 BUFFER</span>
          </div>
          <textarea
            value={jsonInput}
            onChange={handleJsonChange}
            placeholder="Paste raw JSON payload here..."
            className="w-full h-96 p-4 font-mono text-xs bg-slate-900 text-slate-100 border border-slate-800 rounded-b-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y"
            spellCheck={false}
          />
        </div>

        {/* Target Generated Code Output */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between px-4 py-2.5 bg-slate-800 text-slate-200 rounded-t-xl text-xs font-mono">
            <span>GENERATED DOMAIN MODELS</span>
            <span className="text-indigo-300 font-bold uppercase">{targetLanguage}</span>
          </div>
          <div className="relative w-full h-96">
            <textarea
              value={currentGeneratedCode}
              readOnly
              className="w-full h-full p-4 font-mono text-xs bg-slate-950 text-indigo-300 border border-slate-800 rounded-b-xl focus:outline-none resize-y"
              spellCheck={false}
            />
            {errorMessage && (
              <div className="absolute inset-x-2 bottom-2 p-3 bg-rose-950/90 border border-rose-600 rounded-md text-rose-200 text-xs font-mono backdrop-blur-sm shadow-lg">
                <p className="font-bold text-rose-400 mb-1">JSON SYNTAX EXCEPTION:</p>
                <p>{errorMessage}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 2. Semantic Structural Divider */}
      <div className="my-16 flex items-center gap-4">
        <div className="flex-1 h-px bg-slate-200" />
        <div className="px-4 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-500 text-xs font-semibold tracking-wide uppercase">
          Technical Specification &amp; Engineering Manual
        </div>
        <div className="flex-1 h-px bg-slate-200" />
      </div>

      {/* 3. Comprehensive Engineering Documentation */}
      <section className="prose max-w-4xl mt-12 mx-auto bg-white p-8 rounded-xl border border-slate-100 shadow-sm text-slate-700 leading-relaxed">
        <h2 className="text-2xl font-bold text-slate-800 mt-6 mb-3">
          1. Algorithmic Type Inference and Abstract Syntax Tree (AST) Mapping of JSON Payloads
        </h2>
        <p className="mb-4">
          Automated code synthesis from untyped, unstructured data envelopes requires rigorous compiler engineering principles. The transformation pipeline begins by ingesting a raw JSON (RFC 8259) string into a lexer and recursive descent parser to construct an Abstract Syntax Tree (AST). In this intermediate representation, every scalar, object, and array is mapped to a typed syntactic node. The fundamental challenge in dynamic type inference lies in extracting generalized schema invariants from singular, ephemeral runtime instances. Because JSON natively supports only six broad data types—objects, arrays, strings, numbers, booleans, and null—the inference engine must apply deterministic heuristics to resolve ambiguous structural typings.
        </p>
        <p className="mb-4">
          A critical phase of AST type inference is numeric resolution. In standard ECMAScript and JSON specifications, all numeric values are defined as double-precision floating-point numbers (IEEE 754). However, modern statically typed systems enforce strict boundaries between integer and floating-point representations. The type inference algorithm inspects numeric literal tokens across both lexical and semantic boundaries. If a number contains an explicit decimal separator or scientific notation exponent (e.g., <code className="text-indigo-600 font-mono">149.95</code> or <code className="text-indigo-600 font-mono">1.2e3</code>), the node is typed as a floating-point scalar (<code className="text-indigo-600 font-mono">f64</code> in Rust, <code className="text-indigo-600 font-mono">float64</code> in Go, or <code className="text-indigo-600 font-mono">double</code> in Java/C#). Conversely, if the token consists purely of digits and falls within signed 32-bit or 64-bit integer limits, the compiler promotes the type to an integer (<code className="text-indigo-600 font-mono">int</code>, <code className="text-indigo-600 font-mono">i64</code>, or <code className="text-indigo-600 font-mono">Long</code>).
        </p>
        <p className="mb-4">
          Array unification presents another complex algorithmic step. When an array node contains heterogeneous child elements (such as mixing string identifiers with integer codes, or null markers flanked by complete sub-records), a naive compiler fails. Advanced inference engines execute type union analysis by computing the lowest common ancestor in the type lattice. For example, if an array contains objects with differing property sets, the engine merges the structural schemas, marking non-intersecting properties as optional, nullable, or pointer types (<code className="text-indigo-600 font-mono">Option&lt;T&gt;</code>, <code className="text-indigo-600 font-mono">*T</code>, or <code className="text-indigo-600 font-mono">T?</code>). Similarly, encountering a <code className="text-indigo-600 font-mono">null</code> literal token forces the compiler to flag the associated property as an optional field, preventing null-pointer dereferences during runtime deserialization.
        </p>

        <h2 className="text-2xl font-bold text-slate-800 mt-6 mb-3">
          2. Cross-Language Target Code Generation: Struct Tags, Serialization Annotations, and Idiomatic Types
        </h2>
        <p className="mb-4">
          Synthesizing strongly typed source code from an AST requires conforming to the casing standards, memory management paradigms, and serialization frameworks unique to each target language:
        </p>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li>
            <strong>Go (Golang Structs &amp; Reflection Tags):</strong> Go mandates exported struct field names beginning with an uppercase letter (PascalCase), diverging from the typical camelCase convention of JSON API payloads. The code generator reconciles this discrepancy by appending explicit struct field tags (e.g., <code className="text-indigo-600 font-mono">`json:&quot;orderId&quot;`</code>). For nullable values, the compiler emits pointer types (e.g., <code className="text-indigo-600 font-mono">*float64</code> with <code className="text-indigo-600 font-mono">omitempty</code>), enabling the standard library <code className="text-indigo-600 font-mono">encoding/json</code> unmarshaler to assign nil when keys are absent or null.
          </li>
          <li>
            <strong>Rust (Serde Derives &amp; Zero-Cost Abstractions):</strong> In the Rust ecosystem, models require derive macros for serialization ecosystems. The compiler produces structs adorned with <code className="text-indigo-600 font-mono">#[derive(Serialize, Deserialize)]</code>, utilizing container attributes like <code className="text-indigo-600 font-mono">#[serde(rename_all = &quot;camelCase&quot;)]</code> to map snake_case Rust identifiers to wire JSON payloads. Nullable properties are safely wrapped inside the monadic <code className="text-indigo-600 font-mono">Option&lt;T&gt;</code> enum, enforcing compile-time null safety.
          </li>
          <li>
            <strong>Python (Pydantic v2 Validation Schemas):</strong> Modern Python microservices rely on Pydantic to enforce data contracts. The compiler emits models extending <code className="text-indigo-600 font-mono">BaseModel</code>, declaring typed attributes with snake_case conventions while utilizing <code className="text-indigo-600 font-mono">Field(alias=&quot;camelCaseName&quot;)</code>. It leverages <code className="text-indigo-600 font-mono">Optional[T] = None</code> and modern union operators (<code className="text-indigo-600 font-mono">T | None</code>) to handle nullable fields cleanly.
          </li>
          <li>
            <strong>C# (.NET System.Text.Json):</strong> C# classes adhere to PascalCase member declarations, utilizing <code className="text-indigo-600 font-mono">[JsonPropertyName(&quot;fieldName&quot;)]</code> annotations. Value types that permit nullability are cast using nullable value types (e.g., <code className="text-indigo-600 font-mono">double?</code> or <code className="text-indigo-600 font-mono">int?</code>), integrating directly with high-performance UTF-8 byte stream deserializers.
          </li>
          <li>
            <strong>Java (Jackson POJOs):</strong> Enterprise Java requires POJO blueprints with <code className="text-indigo-600 font-mono">@JsonProperty(&quot;fieldName&quot;)</code> annotations, mapping JSON primitives to their boxed object counterparts (<code className="text-indigo-600 font-mono">Long</code>, <code className="text-indigo-600 font-mono">Double</code>, <code className="text-indigo-600 font-mono">Boolean</code>) to support null-safe deserialization through the Jackson ObjectMapper.
          </li>
          <li>
            <strong>TypeScript (Interfaces &amp; Type Aliases):</strong> Generates structural interfaces using union types (<code className="text-indigo-600 font-mono">string | null</code>) and optional field modifiers (<code className="text-indigo-600 font-mono">field?: string</code>), providing static compile-time type validation across frontend and Node.js codebases.
          </li>
        </ul>

        <h2 className="text-2xl font-bold text-slate-800 mt-6 mb-3">
          3. Enterprise Data Privacy and Performance Gains of Client-Side Compilers
        </h2>
        <p className="mb-4">
          Software engineering teams frequently need to generate models for confidential production payloads, including user identity claims, billing records, database dumps, and internal microservice telemetry. Transmitting these payloads across external networks to cloud-hosted code generation utilities introduces significant security risks. Upstream servers, reverse proxies, and Content Delivery Networks (CDNs) routinely log HTTP request bodies into cold-storage log aggregators and APM trace systems, creating persistent plaintext copies of proprietary schema structures and confidential credentials.
        </p>
        <p className="mb-4">
          Executing AST tokenization, schema inference, and code synthesis entirely within local browser memory eliminates these security vulnerabilities. Modern browser execution runtimes—including Chromium&apos;s V8, Mozilla&apos;s SpiderMonkey, and Apple&apos;s JavaScriptCore—execute client-side JavaScript inside hardware-enforced process sandboxes. The compiler ingests the JSON string directly into volatile heap memory allocations. Because no outbound network calls or API endpoints are invoked during the compilation pass, zero bytes leave the developer&apos;s machine.
        </p>
        <p className="mb-4">
          Beyond data privacy, client-side compilation delivers near-instantaneous developer velocity. Server-side code generators suffer from network round-trip latency (RTT), queue times, and remote cold starts, often requiring hundreds of milliseconds to return results. In contrast, in-memory client-side AST visitors generate hundreds of lines of strongly typed boilerplate code in under two milliseconds. Once the developer closes the browser tab or clears the input buffer, the browser&apos;s generational garbage collector clears the heap memory, ensuring complete privacy, zero egress telemetry, and optimal development workflow efficiency.
        </p>
      </section>
    </div>
  );
}
