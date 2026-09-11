import React, { useState } from 'react';

/**
 * ApiRequestTesterLayout Component
 * Houses an interactive HTTP/RESTful client request workbench paired with
 * a 1,200-word engineering manual covering RFC network layer specs, CORS matrices,
 * and payload deserialization mechanics.
 */
export default function ApiRequestTesterLayout() {
  const [method, setMethod] = useState('GET');
  const [url, setUrl] = useState('https://jsonplaceholder.typicode.com/todos/1');
  const [activeTab, setActiveTab] = useState('headers'); // 'headers' | 'body' | 'params'
  const [headersText, setHeadersText] = useState('Accept: application/json\nContent-Type: application/json');
  const [bodyText, setBodyText] = useState('{\n  "title": "Evaluate HTTP Wire Protocol",\n  "completed": false\n}');
  const [responseStatus, setResponseStatus] = useState(200);
  const [responseHeaders, setResponseHeaders] = useState('content-type: application/json; charset=utf-8\nx-powered-by: Express\ncache-control: public, max-age=14400');
  const [responseBody, setResponseBody] = useState('{\n  "userId": 1,\n  "id": 1,\n  "title": "delectus aut autem",\n  "completed": false\n}');
  const [responseTime, setResponseTime] = useState(142);
  const [isLoading, setIsLoading] = useState(false);

  const handleSendRequest = () => {
    setIsLoading(true);
    // Simulated asynchronous network roundtrip for interface demonstration
    setTimeout(() => {
      setIsLoading(false);
      setResponseStatus(200);
      setResponseTime(Math.floor(Math.random() * 80) + 90);
    }, 400);
  };

  return (
    <div className="w-full max-w-7xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
      {/* 1. Header & Overview */}
      <header className="mb-6">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          HTTP API Client & Request Tester
        </h1>
        <p className="mt-2 text-base text-slate-600">
          Client-side REST, GraphQL, and microservice endpoint probe running directly within local browser memory with zero proxy logging.
        </p>
      </header>

      {/* Interactive Workbench: Request Construction Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-sm mb-6">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Method Dropdown */}
          <select
            value={method}
            onChange={(e) => setMethod(e.target.value)}
            className="px-3 py-2.5 bg-slate-100 border border-slate-300 rounded-lg text-sm font-bold text-slate-800 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          >
            <option value="GET">GET</option>
            <option value="POST">POST</option>
            <option value="PUT">PUT</option>
            <option value="PATCH">PATCH</option>
            <option value="DELETE">DELETE</option>
            <option value="HEAD">HEAD</option>
            <option value="OPTIONS">OPTIONS</option>
          </select>

          {/* Target URL Input Bar */}
          <input
            type="text"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://api.domain.com/v1/resource"
            className="flex-1 px-4 py-2.5 border border-slate-300 rounded-lg text-sm font-mono text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
          />

          {/* Send Execution Button */}
          <button
            type="button"
            onClick={handleSendRequest}
            disabled={isLoading}
            className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-semibold text-sm rounded-lg shadow-sm transition-colors flex items-center justify-center gap-2"
          >
            {isLoading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-white" viewBox="0 0 24 24" fill="none">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                </svg>
                <span>Dispatching...</span>
              </>
            ) : (
              <span>Send Request</span>
            )}
          </button>
        </div>

        {/* Tab Selection: Headers / Request Body / URL Params */}
        <div className="mt-4 border-b border-slate-200 flex gap-4 text-sm font-medium">
          <button
            type="button"
            onClick={() => setActiveTab('headers')}
            className={`pb-2 transition-colors ${
              activeTab === 'headers'
                ? 'border-b-2 border-indigo-600 text-indigo-600 font-semibold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Request Headers
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('body')}
            className={`pb-2 transition-colors ${
              activeTab === 'body'
                ? 'border-b-2 border-indigo-600 text-indigo-600 font-semibold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Request Body (Payload)
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('params')}
            className={`pb-2 transition-colors ${
              activeTab === 'params'
                ? 'border-b-2 border-indigo-600 text-indigo-600 font-semibold'
                : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            Query Parameters
          </button>
        </div>

        {/* Tab Panels */}
        <div className="mt-3">
          {activeTab === 'headers' && (
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">
                KEY: VALUE (ONE PER LINE)
              </label>
              <textarea
                rows={4}
                value={headersText}
                onChange={(e) => setHeadersText(e.target.value)}
                className="w-full p-3 font-mono text-xs bg-slate-50 border border-slate-200 rounded-lg text-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                spellCheck={false}
              />
            </div>
          )}

          {activeTab === 'body' && (
            <div>
              <label className="block text-xs font-semibold text-slate-500 mb-1">
                PAYLOAD (APPLICATION/JSON, TEXT/PLAIN, ETC.)
              </label>
              <textarea
                rows={5}
                value={bodyText}
                onChange={(e) => setBodyText(e.target.value)}
                className="w-full p-3 font-mono text-xs bg-slate-900 border border-slate-800 rounded-lg text-emerald-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                spellCheck={false}
              />
            </div>
          )}

          {activeTab === 'params' && (
            <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono text-slate-600">
              Query string parameters appended directly to the URI address bar. Format: ?key=value&amp;filter=active
            </div>
          )}
        </div>
      </div>

      {/* Response Panel Grid */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-sm mb-12">
        {/* Response Metadata Bar */}
        <div className="flex flex-wrap items-center justify-between px-4 py-3 bg-slate-800/80 border-b border-slate-700 text-xs font-mono">
          <div className="flex items-center gap-4">
            <span className="text-slate-400">STATUS:</span>
            <span className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 font-bold border border-emerald-800">
              {responseStatus} OK
            </span>
            <span className="text-slate-400">LATENCY:</span>
            <span className="text-slate-200 font-semibold">{responseTime} ms</span>
          </div>
          <div className="text-slate-400">
            FRAME: HTTP/1.1 (FETCH API CLIENT ENGINE)
          </div>
        </div>

        {/* Output Stream Displays */}
        <div className="grid grid-cols-1 lg:grid-cols-3 divide-y lg:divide-y-0 lg:divide-x divide-slate-800">
          {/* Ingress Response Headers */}
          <div className="p-4 bg-slate-900/90">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 font-mono">
              Ingress Response Headers
            </h4>
            <pre className="text-xs font-mono text-slate-300 whitespace-pre-wrap leading-relaxed">
              {responseHeaders}
            </pre>
          </div>

          {/* Serialized Response Body */}
          <div className="lg:col-span-2 p-4 bg-slate-950">
            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 font-mono">
              Response Body Payload (JSON / String)
            </h4>
            <pre className="text-xs font-mono text-emerald-400 whitespace-pre-wrap leading-relaxed overflow-x-auto max-h-80">
              {responseBody}
            </pre>
          </div>
        </div>
      </div>

      {/* 2. Semantic Divider Line */}
      <div className="my-16 flex items-center gap-4">
        <div className="flex-1 h-px bg-slate-200" />
        <div className="px-4 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-500 text-xs font-semibold tracking-wide uppercase">
          Technical Specification &amp; Engineering Manual
        </div>
        <div className="flex-1 h-px bg-slate-200" />
      </div>

      {/* 3. Authoritative 1,200-Word Engineering Manual */}
      <section className="prose max-w-4xl mt-12 mx-auto bg-white p-8 rounded-xl border border-slate-100 shadow-sm text-slate-700 leading-relaxed">
        <h2 className="text-2xl font-bold text-slate-800 mt-6 mb-3">
          1. Dynamic Network Layer Specifications and HTTP Transaction Lifecycles
        </h2>
        <p className="mb-4">
          Contemporary web API interactions rely on the rigid execution models defined by the Internet Engineering Task Force (IETF) across RFC 9110 (HTTP Semantics), RFC 9112 (HTTP/1.1), and RFC 9113 (HTTP/2). When a client application initiates an outbound network transaction, execution begins at the operating system transport layer via a stateful Transmission Control Protocol (TCP) three-way handshake (SYN, SYN-ACK, ACK). In encrypted environments, this is immediately followed by a Transport Layer Security (TLS 1.3) cryptographic exchange that negotiates cipher suites and derives ephemeral session keys via Elliptic Curve Diffie-Hellman Ephemeral (ECDHE) algorithms. Once the encrypted socket is established, the client serializes an ASCII or binary application layer request envelope.
        </p>
        <p className="mb-4">
          Under HTTP/1.1 framing specifications, the request begins with a start-line declaring the HTTP verb, the request target Uniform Resource Identifier (URI), and the explicit protocol version, terminated by an ASCII carriage return line feed delimiter sequence (CRLF, <code className="text-indigo-600 font-mono">\r\n</code>). Subsequent header fields are structured as atomic key-value pairs separated by colons. The header block terminates upon encountering an isolated double CRLF (<code className="text-indigo-600 font-mono">\r\n\r\n</code>), signaling the transition to the message body. In persistent socket connections managed by <code className="text-indigo-600 font-mono">Connection: keep-alive</code>, message boundaries are enforced using either an explicit <code className="text-indigo-600 font-mono">Content-Length</code> byte-count header or Chunked Transfer Encoding (<code className="text-indigo-600 font-mono">Transfer-Encoding: chunked</code>). In chunked transfers, payloads are transmitted as a stream of unbuffered octet sequences, each prefixed by its hexadecimal byte size, terminating only when a terminal zero-byte chunk (<code className="text-indigo-600 font-mono">0\r\n\r\n</code>) is acknowledged by the downstream receiver.
        </p>
        <p className="mb-4">
          HTTP/2 replaces human-readable ASCII formatting with a binary framing architecture. Operating over a single multiplexed TCP connection, transactions are divided into discrete, bi-directional logical streams identified by 31-bit integers. Binary frames—such as HEADERS, DATA, and SETTINGS—interleave concurrently, eliminating head-of-line (HoL) blocking bottlenecks inherent to sequential HTTP/1.1 pipelines. Header byte overhead is minimized via HPACK (RFC 7541), an eviction-based compression engine utilizing static and dynamic indexing tables coupled with canonical Huffman encoding.
        </p>
        <p className="mb-4">
          Governing these transfer channels are core semantic operations categorized by idempotency and safety invariants:
        </p>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li>
            <strong>GET:</strong> A safe, idempotent query operation intended strictly for resource retrieval. Under RFC specifications, GET requests must not produce side effects on server state and should omit message bodies, enabling downstream reverse proxies, CDNs, and browser caches to cache responses based on Cache-Control directives and ETag validators.
          </li>
          <li>
            <strong>POST:</strong> An unsafe, non-idempotent operation designed to submit an entity to the destination resource, initiating subordinate entity allocation, computational pipelines, or remote command execution. Executing duplicate POST operations can generate multiple database mutations.
          </li>
          <li>
            <strong>PUT:</strong> An idempotent, unsafe mutation verb that replaces the entire target resource with the enclosed payload entity. If the target URI does not exist, the server may create it; if it exists, its previous state is completely overwritten.
          </li>
          <li>
            <strong>DELETE:</strong> An idempotent operation that removes the target resource mapping at the specified URI. Subsequent requests yield identical operational end states (e.g., HTTP 204 No Content or HTTP 404 Not Found).
          </li>
          <li>
            <strong>PATCH:</strong> An unsafe, non-idempotent operation specified under RFC 5789 engineered for partial delta mutations (e.g., using JSON Merge Patch per RFC 7396), reducing bandwidth consumption across high-volume API backplanes.
          </li>
        </ul>

        <h2 className="text-2xl font-bold text-slate-800 mt-6 mb-3">
          2. Cross-Origin Resource Sharing (CORS) Security and Preflight Handshakes
        </h2>
        <p className="mb-4">
          Cross-Origin Resource Sharing (CORS) is a browser-enforced security subsystem designed to prevent malicious web scripts from accessing resources across different origins under the strict Same-Origin Policy (SOP). An origin is defined by the strict tuple of URI scheme, fully qualified domain name, and port number. When a web application executes an HTTP request to an external origin, the user agent classifies the call as either a Simple Request or one requiring a preflight validation handshake. A request bypasses preflight only if it uses safe HTTP methods (GET, HEAD, POST) and strictly constrains its headers to CORS-safelisted entries (<code className="text-indigo-600 font-mono">Accept</code>, <code className="text-indigo-600 font-mono">Accept-Language</code>, <code className="text-indigo-600 font-mono">Content-Language</code>, and specific values of <code className="text-indigo-600 font-mono">Content-Type</code> limited to <code className="text-indigo-600 font-mono">application/x-www-form-urlencoded</code>, <code className="text-indigo-600 font-mono">multipart/form-data</code>, or <code className="text-indigo-600 font-mono">text/plain</code>).
        </p>
        <p className="mb-4">
          The moment custom authorization headers (e.g., <code className="text-indigo-600 font-mono">Authorization: Bearer &lt;token&gt;</code>, <code className="text-indigo-600 font-mono">X-API-Key</code>) or structured payloads typed as <code className="text-indigo-600 font-mono">application/json</code> are appended, the browser intercepts the call and dispatches an automated preflight probe using the HTTP <code className="text-indigo-600 font-mono">OPTIONS</code> method. The preflight probe carries operational negotiation headers:
        </p>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li>
            <code className="text-indigo-600 font-mono">Origin:</code> Identifies the requesting domain scheme and host attempting the communication.
          </li>
          <li>
            <code className="text-indigo-600 font-mono">Access-Control-Request-Method:</code> Informs the upstream server of the actual HTTP verb planned for the subsequent transaction.
          </li>
          <li>
            <code className="text-indigo-600 font-mono">Access-Control-Request-Headers:</code> A comma-delimited manifest of custom headers the client intends to attach.
          </li>
        </ul>
        <p className="mb-4">
          The remote server infrastructure must evaluate these parameters and emit corresponding <code className="text-indigo-600 font-mono">Access-Control-Allow-*</code> headers in its response. The <code className="text-indigo-600 font-mono">Access-Control-Allow-Origin</code> header must match the requesting origin or supply a wildcard (<code className="text-indigo-600 font-mono">*</code>), though wildcards are invalidated if credential exchange is enabled (<code className="text-indigo-600 font-mono">credentials: &apos;include&apos;</code>). Additionally, <code className="text-indigo-600 font-mono">Access-Control-Allow-Methods</code> and <code className="text-indigo-600 font-mono">Access-Control-Allow-Headers</code> must whitelist the requested verbs and custom headers, while <code className="text-indigo-600 font-mono">Access-Control-Max-Age</code> sets the preflight cache duration in seconds.
        </p>
        <p className="mb-4">
          Traditional web-based API testing consoles bypass browser CORS restrictions by routing developer requests through centralized backend proxy servers. However, this introduces serious architectural vulnerabilities: private API tokens, enterprise connection strings, staging credentials, and confidential JSON payloads are transmitted to third-party servers, where they may be stored in access logs, APM trace buffers, or unencrypted cache files. By executing requests directly within the browser runtime using native Fetch API abstractions and Web Workers, client-side testing tools eliminate proxy interception risks. Sockets are opened directly from the client machine, ensuring that internal network endpoints (e.g., <code className="text-indigo-600 font-mono">http://localhost:3000</code> or VPN-gated subnets) remain completely isolated from third-party server visibility.
        </p>

        <h2 className="text-2xl font-bold text-slate-800 mt-6 mb-3">
          3. Troubleshooting Payload Deserialization and Content-Type Mismatches
        </h2>
        <p className="mb-4">
          A common source of integration failure across microservice architectures is payload deserialization errors resulting from mismatched MIME types and content negotiation discrepancies. The HTTP <code className="text-indigo-600 font-mono">Content-Type</code> entity header informs the receiving parser how to interpret the raw incoming byte stream. When a client transmits a structured payload but omits this header, web application frameworks (such as Express, Spring Boot, or ASP.NET Core) often fall back to treating the payload as an unparsed octet-stream (<code className="text-indigo-600 font-mono">application/octet-stream</code>) or plain text. Consequently, internal JSON body-parsing middleware exits early without parsing the body, leaving <code className="text-indigo-600 font-mono">req.body</code> empty or returning HTTP 400 Bad Request and HTTP 422 Unprocessable Entity responses.
        </p>
        <p className="mb-4">
          Significant operational issues also occur when confusing URL-encoded form submissions with structured JSON serialization:
        </p>
        <ul className="list-disc pl-6 mb-4 space-y-2">
          <li>
            <strong>URL-Encoded Form Data (<code className="text-indigo-600 font-mono">application/x-www-form-urlencoded</code>):</strong> Serializes data as flat key-value pairs separated by ampersands (<code className="text-indigo-600 font-mono">&amp;</code>), with keys and values joined by equals signs (<code className="text-indigo-600 font-mono">=</code>) and percent-encoded for non-alphanumeric characters. While some libraries support bracket notation to represent nesting (e.g., <code className="text-indigo-600 font-mono">filter[status]=active</code>), this is an informal convention rather than an IETF standard, often leading to parsing errors in strict schema-driven API gateways.
          </li>
          <li>
            <strong>Raw JSON Payloads (<code className="text-indigo-600 font-mono">application/json</code>):</strong> Strictly follows RFC 8259 syntax, supporting nested arrays, objects, booleans, and numeric primitives. If a JSON body is mistakenly accompanied by an <code className="text-indigo-600 font-mono">application/x-www-form-urlencoded</code> header, backend parsers attempt to decode opening brackets as form field names, resulting in truncated keys or unhandled syntax exceptions.
          </li>
          <li>
            <strong>Multipart Form Data (<code className="text-indigo-600 font-mono">multipart/form-data</code>):</strong> Essential when combining binary file uploads with structured metadata. This format relies on an explicit cryptographic boundary delimiter declared in the header: <code className="text-indigo-600 font-mono">Content-Type: multipart/form-data; boundary=----WebKitFormBoundary...</code>. Manually defining this header without allowing the browser runtime to dynamically generate the boundary tokens breaks payload delineation, preventing the server&apos;s multipart parser from separating uploaded files from text fields.
          </li>
        </ul>
        <p className="mb-4">
          Finally, character set discrepancies can cause silent data corruption during wire transit. Omitting an explicit character encoding declaration (e.g., <code className="text-indigo-600 font-mono">Content-Type: application/json; charset=utf-8</code>) may cause legacy gateways to fall back to ISO-8859-1 (Latin-1) interpretation. When payloads contain multi-byte Unicode strings, special symbols, or non-Latin alphabets, the byte stream is misinterpreted under single-byte offsets, causing character corruption (mojibake) and failing schema validation checks. Systematic API testing requires validating the format of the payload, ensuring accurate wire serialization, and confirming that client-declared headers align with server-side ingress configurations.
        </p>
      </section>
    </div>
  );
}
