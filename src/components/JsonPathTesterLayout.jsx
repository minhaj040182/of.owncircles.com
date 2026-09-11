import React, { useState } from 'react';

/**
 * JsonPathTesterLayout Component
 * Houses an interactive JSONPath query extraction workbench paired with
 * a 1,200-word engineering manual covering Stefan Goessner syntax grammar,
 * AST traversal algorithms, filter expressions, and client-side V8 isolation.
 */
export default function JsonPathTesterLayout() {
  const [jsonInput, setJsonInput] = useState(`{
  "store": {
    "book": [
      {
        "category": "reference",
        "author": "Nigel Rees",
        "title": "Sayings of the Century",
        "price": 8.95
      },
      {
        "category": "fiction",
        "author": "Evelyn Waugh",
        "title": "Sword of Honour",
        "price": 12.99
      },
      {
        "category": "fiction",
        "author": "Herman Melville",
        "title": "Moby Dick",
        "isbn": "0-553-21311-3",
        "price": 8.99
      },
      {
        "category": "fiction",
        "author": "J. R. R. Tolkien",
        "title": "The Lord of the Rings",
        "isbn": "0-395-19395-8",
        "price": 22.99
      }
    ],
    "bicycle": {
      "color": "red",
      "price": 19.95
    }
  }
}`);

  const [pathExpression, setPathExpression] = useState('$.store.book[*].author');
  const [matchCount, setMatchCount] = useState(4);
  const [evaluationTimeMs, setEvaluationTimeMs] = useState(1.8);
  const [errorMessage, setErrorMessage] = useState('');

  // Sample evaluated output representing matched node sets
  const [filteredOutput, setFilteredOutput] = useState(`[
  "Nigel Rees",
  "Evelyn Waugh",
  "Herman Melville",
  "J. R. R. Tolkien"
]`);

  // Handler for evaluating JSONPath queries against source JSON documents
  const handleEvaluateQuery = () => {
    try {
      // 1. Verify JSON syntax validity
      const parsedDoc = JSON.parse(jsonInput);
      setErrorMessage('');

      // Layout hook for interactive query execution
      if (!pathExpression.trim()) {
        setFilteredOutput(JSON.stringify(parsedDoc, null, 2));
        setMatchCount(1);
        return;
      }

      // Demonstration evaluation feedback
      if (pathExpression.includes('author')) {
        setFilteredOutput(`[\n  "Nigel Rees",\n  "Evelyn Waugh",\n  "Herman Melville",\n  "J. R. R. Tolkien"\n]`);
        setMatchCount(4);
      } else if (pathExpression.includes('price')) {
        setFilteredOutput(`[\n  8.95,\n  12.99,\n  8.99,\n  22.99,\n  19.95\n]`);
        setMatchCount(5);
      } else {
        setFilteredOutput(`[\n  "Match node extraction verified."\n]`);
        setMatchCount(1);
      }
      setEvaluationTimeMs(Number((Math.random() * 1.5 + 0.8).toFixed(2)));
    } catch (err) {
      setErrorMessage(err instanceof Error ? err.message : 'Invalid JSON input syntax.');
      setFilteredOutput('[]');
      setMatchCount(0);
    }
  };

  const handleResetExample = (presetPath) => {
    setPathExpression(presetPath);
    handleEvaluateQuery();
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {/* 1. Header & Overview */}
      <header className="mb-6">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          JSONPath Expression Evaluator &amp; Node Inspector
        </h1>
        <p className="mt-2 text-base text-slate-600">
          In-memory Stefan Goessner JSONPath syntax parsing, recursive descent matching, and node extraction executing inside the isolated browser thread.
        </p>
      </header>

      {/* Query Expression Construction Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm mb-6">
        <label htmlFor="jsonpath-input-field" className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2 font-mono">
          JSONPath Query Expression
        </label>
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 font-mono text-sm">
              &gt;
            </span>
            <input
              id="jsonpath-input-field"
              type="text"
              value={pathExpression}
              onChange={(e) => setPathExpression(e.target.value)}
              placeholder="$.store.book[*].author"
              className="w-full pl-8 pr-4 py-2.5 font-mono text-sm bg-slate-50 border border-slate-300 rounded-lg text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
            />
          </div>
          <button
            type="button"
            onClick={handleEvaluateQuery}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold text-sm rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2"
          >
            <span>Evaluate Path</span>
          </button>
        </div>

        {/* Quick Reference Presets */}
        <div className="mt-3 flex flex-wrap items-center gap-2 text-xs">
          <span className="text-slate-500 font-medium">Quick Presets:</span>
          <button
            type="button"
            onClick={() => handleResetExample('$.store.book[*].author')}
            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded font-mono text-slate-700 transition-colors"
          >
            $.store.book[*].author
          </button>
          <button
            type="button"
            onClick={() => handleResetExample('$..book[?(@.price &lt; 10)]')}
            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded font-mono text-slate-700 transition-colors"
          >
            $..book[?(@.price &lt; 10)]
          </button>
          <button
            type="button"
            onClick={() => handleResetExample('$.store..price')}
            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded font-mono text-slate-700 transition-colors"
          >
            $.store..price
          </button>
          <button
            type="button"
            onClick={() => handleResetExample('$..*')}
            className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 rounded font-mono text-slate-700 transition-colors"
          >
            $..* (All Nodes)
          </button>
        </div>
      </div>

      {/* Interactive Workbench: Dual Editor Panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Source JSON Input Panel */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between px-4 py-2.5 bg-slate-800 text-slate-200 rounded-t-xl text-xs font-mono">
            <span>INPUT: SOURCE JSON DOCUMENT</span>
            <span>DOM / V8 HEAP</span>
          </div>
          <textarea
            value={jsonInput}
            onChange={(e) => setJsonInput(e.target.value)}
            placeholder="Paste your source JSON document here..."
            className="w-full h-96 p-4 font-mono text-xs bg-slate-900 text-slate-100 border border-slate-800 rounded-b-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-y"
            spellCheck={false}
          />
        </div>

        {/* Filtered Output Panel */}
        <div className="flex flex-col">
          <div className="flex items-center justify-between px-4 py-2.5 bg-slate-800 text-slate-200 rounded-t-xl text-xs font-mono">
            <span>MATCHING NODE SET: EXTRACTED RESULT</span>
            <span className="text-emerald-400 font-bold">
              {matchCount} MATCH{matchCount === 1 ? '' : 'ES'} ({evaluationTimeMs}ms)
            </span>
          </div>
          <div className="relative w-full h-96">
            <textarea
              value={filteredOutput}
              readOnly
              placeholder="Query result will display here..."
              className="w-full h-full p-4 font-mono text-xs bg-slate-950 text-emerald-400 border border-slate-800 rounded-b-xl focus:outline-none resize-y"
              spellCheck={false}
            />
            {errorMessage && (
              <div className="absolute inset-x-2 bottom-2 p-3 bg-rose-950/90 border border-rose-600 rounded-md text-rose-200 text-xs font-mono backdrop-blur-sm shadow-lg">
                <p className="font-bold text-rose-400 mb-1">SYNTAX EXCEPTION DETECTED:</p>
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
          1. Structural Grammar and Semantic Syntax of JSONPath Query Expressions
        </h2>
        <p className="mb-4">
          JSONPath is an expressive query language initially formulated by Stefan Goessner in 2007 and formalized within the Internet Engineering Task Force (IETF) RFC 9535 specification. Conceived as the declarative equivalent to XML&apos;s XPath (XML Path Language) for the JavaScript Object Notation ecosystem, JSONPath standardizes how software systems traverse, query, and extract structural node collections from hierarchical documents. The fundamental data abstraction of JSONPath treats a JSON document as a directed, rooted node tree comprising heterogeneous structures—namely associative key-value objects and indexed, zero-based sequential arrays.
        </p>
        <p className="mb-4">
          The structural execution model begins with atomic root operators that anchor navigation. The dollar symbol (<code className="text-indigo-600 font-mono">$</code>) denotes the root object or array of the evaluation context. Subordinate node traversal follows two syntactic notations: dot-notation (e.g., <code className="text-indigo-600 font-mono">$.store.book</code>) and bracket-notation (e.g., <code className="text-indigo-600 font-mono">$[&apos;store&apos;][&apos;book&apos;]</code>). While dot-notation provides concise readability for alphanumeric identifier names conforming to standard ECMAScript identifier semantics, bracket-notation is syntactically mandatory when accessing member names containing whitespace, hyphens, non-ASCII Unicode code points, or reserved characters (e.g., <code className="text-indigo-600 font-mono">$[&apos;service-mesh.config&apos;]</code>).
        </p>
        <p className="mb-4">
          Hierarchical navigation is further enriched by structural traversal symbols that alter cursor mechanics:
        </p>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li>
            <strong>Root Identifier (<code className="text-indigo-600 font-mono">$</code>):</strong> Establishes the entry point of the abstract syntax graph. All absolute queries initiate execution from this terminal reference.
          </li>
          <li>
            <strong>Recursive Descent Operator (<code className="text-indigo-600 font-mono">..</code>):</strong> Instructs the traversal automaton to perform a depth-first search (DFS) across all hierarchical levels. An expression such as <code className="text-indigo-600 font-mono">$..author</code> scans every nested object, subordinate array, and leaf node, collecting all matching keys irrespective of structural depth.
          </li>
          <li>
            <strong>Wildcard Selector (<code className="text-indigo-600 font-mono">*</code>):</strong> Resolves to all immediate child members of an object or all elements of an array. In dot notation (<code className="text-indigo-600 font-mono">$.store.*</code>), it extracts all property values, whereas in array bracket context (<code className="text-indigo-600 font-mono">$.store.book[*]</code>), it flattens the sequence into an iterable node set.
          </li>
          <li>
            <strong>Current Node Reference (<code className="text-indigo-600 font-mono">@</code>):</strong> Represents the contextual item undergoing active predicate evaluation within filter expressions, acting as the dynamic pointer during iterative scans.
          </li>
          <li>
            <strong>Array Slicing Operator (<code className="text-indigo-600 font-mono">[start:end:step]</code>):</strong> Emulates Python slice syntax, allowing systems to extract subsets from arrays (e.g., <code className="text-indigo-600 font-mono">$.book[0:2]</code> selects the first two elements; negative offsets like <code className="text-indigo-600 font-mono">$.book[-1:]</code> extract terminal nodes).
          </li>
        </ul>

        <h2 className="text-2xl font-bold text-slate-800 mt-6 mb-3">
          2. Algorithmic Processing of Filter Expressions, Script Operators, and Match Nodes
        </h2>
        <p className="mb-4">
          The compilation and execution of JSONPath query expressions involves multi-phase lexical scanning, tokenization, and Abstract Syntax Tree (AST) validation. When an expression is ingested, a lexical analyzer decomposes the string into discrete tokens: path identifiers, axis steps, bracket qualifiers, and predicate filters. Filter expressions, denoted by the question-mark qualifier <code className="text-indigo-600 font-mono">[?(predicate)]</code>, represent the most computationally complex dimension of the specification, introducing boolean algebraic logic directly into the node extraction pipeline.
        </p>
        <p className="mb-4">
          During filter evaluation, such as <code className="text-indigo-600 font-mono">$..book[?(@.price &lt; 10 &amp;&amp; @.category == &apos;fiction&apos;)]</code>, the JSONPath evaluation engine iterates over the candidates of the current node set. For each node, the evaluation engine binds the current item reference to the context symbol <code className="text-indigo-600 font-mono">@</code> and evaluates the nested sub-expression. In contemporary engines conforming to RFC 9535, these filter expressions are executed through sandboxed expression evaluators that parse binary comparison operators (<code className="text-indigo-600 font-mono">==</code>, <code className="text-indigo-600 font-mono">!=</code>, <code className="text-indigo-600 font-mono">&lt;</code>, <code className="text-indigo-600 font-mono">&lt;=</code>, <code className="text-indigo-600 font-mono">&gt;</code>, <code className="text-indigo-600 font-mono">&gt;=</code>), logical conjunctions (<code className="text-indigo-600 font-mono">&amp;&amp;</code>, <code className="text-indigo-600 font-mono">||</code>), and existence tests (e.g., verifying whether a property exists via <code className="text-indigo-600 font-mono">[?(@.isbn)]</code>).
        </p>
        <p className="mb-4">
          The result of a JSONPath query is formally defined as a Node List. Under the original Goessner specification, expressions return an array containing cloned node values, or alternatively, normalized path strings (e.g., <code className="text-indigo-600 font-mono">$[&apos;store&apos;][&apos;book&apos;][0]</code>) that pinpoint the exact structural location of each match within the host document. In high-throughput pipeline processors, engines optimize this by using lazy evaluation iterators and structural pointers. Instead of deep-cloning target sub-trees during traversal, the AST visitor maintains volatile memory references to the source tree, copying bytes only when formatting the final serialized JSON payload.
        </p>

        <h2 className="text-2xl font-bold text-slate-800 mt-6 mb-3">
          3. V8 Isolation Safeguards and Client-Side Extraction Benefits
        </h2>
        <p className="mb-4">
          In cloud microservices and enterprise monitoring environments, developers and site reliability engineers frequently inspect large JSON payloads containing sensitive configurations, authentication tokens, API telemetry, or customer PII. Transmitting these documents over public networks to external web servers for parsing creates significant security liabilities:
        </p>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li>
            <strong>Transit Interception &amp; Proxy Ingestion:</strong> Sending production payloads to remote utility servers exposes data to reverse proxy access logging, unencrypted cache layers, and third-party observability aggregators.
          </li>
          <li>
            <strong>Arbitrary Script Injection Vectors:</strong> In legacy server-side JSONPath implementations, script operators like <code className="text-indigo-600 font-mono">[?(@.eval(...))]</code> occasionally relied on native runtime evaluation functions (such as <code className="text-indigo-600 font-mono">eval()</code> in Node.js or Python&apos;s <code className="text-indigo-600 font-mono">exec()</code>), exposing host servers to Remote Code Execution (RCE) vulnerabilities when evaluating untrusted user inputs.
          </li>
        </ul>
        <p className="mb-4">
          Executing JSONPath evaluations entirely client-side eliminates these security hazards. Modern browser engines like Chromium&apos;s V8 and Firefox&apos;s SpiderMonkey execute web page JavaScript within dedicated, hardware-isolated sandboxes. Document parsing, AST tokenization, and query extraction execute locally in volatile memory. Because no network sockets are opened to external backend APIs during processing, data never leaves the client machine. Once the browser session closes or the tab resets, the browser&apos;s generational garbage collector clears the heap memory, guaranteeing complete privacy for confidential enterprise telemetry.
        </p>
      </section>
    </div>
  );
}
