export interface FAQItem {
  question: string;
  answer: string;
}

export interface StepItem {
  title: string;
  desc: string;
}

export interface EducationTopic {
  title: string;
  shortDesc: string;
  definition: string;
  overviewDetailed: string;
  useCases: string[];
  bestPractices: string[];
  troubleshooting: string[];
  steps: StepItem[];
  exampleLabel: string;
  exampleCode: string;
  exampleLang: string;
  faqs: FAQItem[];
}

export const EDUCATION_DATA: Record<string, EducationTopic> = {
  json: {
    title: "JSON (JavaScript Object Notation) Formatter & Validator",
    shortDesc: "The universal lightweight data-interchange format for modern web APIs and microservices.",
    definition: "JSON (JavaScript Object Notation) is a lightweight, text-based, human-readable data format used globally to transmit data objects consisting of attribute-value pairs and array data types. Although derived from JavaScript object syntax, JSON is completely language-independent, with native parsers available in Python, Java, Go, Rust, C#, C++, PHP, Swift, and Kotlin.",
    overviewDetailed: "JSON has superseded legacy formats like XML in modern software architectures due to its minimal syntax, lower payload byte size, and seamless mapping to native programming language primitives (hashes, maps, dictionaries, lists, booleans, and floats). Validating JSON prior to serialization or REST API ingestion is critical to preventing unhandled runtime exceptions, deserialization crashes, and security vulnerabilities like Denial of Service (DoS) caused by deeply nested JSON payloads.",
    useCases: [
      "Client-server REST API request and response body payload serialization",
      "Application configuration files (package.json, tsconfig.json, settings.json)",
      "Document-oriented NoSQL database storage (MongoDB, CouchDB, DynamoDB, PostgreSQL JSONB)",
      "Client-side state persistence, browser localStorage caching, and IPC communication"
    ],
    bestPractices: [
      "Always wrap property keys in double quotes (\"key\"). Single quotes or unquoted keys violate the RFC 8259 JSON standard.",
      "Never leave trailing commas after the last element in an object or array.",
      "Ensure numbers do not have leading zeros (e.g., use 42 instead of 042).",
      "Use UTF-8 encoding exclusively to prevent character set corruption across distributed server networks.",
      "Sanitize string inputs to prevent unescaped double quotes or backslashes from breaking JSON syntax parsing."
    ],
    troubleshooting: [
      "Unexpected Token Error: Look for unescaped double quotes inside string values. Escaped quotes must use a backslash (\\\").",
      "Trailing Comma Error: Remove commas preceding closing braces (}) or square brackets (]).",
      "Single Quotes Error: Replace all single quotes ('') with double quotes (\"\") for property names and string values.",
      "Control Character Error: Replace raw unescaped line breaks or horizontal tabs inside strings with \\n and \\t escape sequences."
    ],
    steps: [
      { title: "Paste Raw JSON", desc: "Copy your raw, minified, or unformatted JSON text payload into the input editor canvas." },
      { title: "Automatic Validation", desc: "The engine instantly parses the syntax in real-time, highlighting exact line numbers and byte offsets if syntax errors exist." },
      { title: "Custom Formatting Options", desc: "Select preferred indentation depth (2 spaces, 4 spaces, or compact 1-line minification) and key sorting preferences." },
      { title: "Export & Copy", desc: "Click 'Copy Output' to place clean formatted JSON into your system clipboard, or download as a .json file." }
    ],
    exampleLabel: "Valid RFC 8259 JSON Object Payload",
    exampleLang: "json",
    exampleCode: `{
  "userId": 10420,
  "username": "dev_architect",
  "isActive": true,
  "roles": ["admin", "developer"],
  "profile": {
    "firstName": "Sarah",
    "lastName": "Connor"
  },
  "metadata": null
}`,
    faqs: [
      {
        question: "Is JSON case-sensitive?",
        answer: "Yes, JSON is strictly case-sensitive. Property keys like \"userId\" and \"userid\" are treated as completely separate, distinct fields. Booleans and null values must also be written strictly in lowercase (true, false, null)."
      },
      {
        question: "Why are comments not allowed in standard JSON?",
        answer: "Douglas Crockford, the creator of JSON, intentionally omitted comments to prevent developers from adding compiler directives or parsing directives that would break cross-platform interoperability. For configurations requiring comments, consider YAML or JSONC."
      },
      {
        question: "What is the difference between JSON and XML?",
        answer: "JSON is significantly lighter, easier to read and write, and maps directly to native programming language data structures. XML is tag-based, more verbose, supports custom schema namespaces, and is generally used in legacy enterprise systems."
      },
      {
        question: "How do I handle Date objects in JSON?",
        answer: "JSON has no native Date data type. The industry standard is to serialize dates as ISO 8601 strings (e.g., \"2026-07-19T05:04:30Z\") or Unix epoch timestamps in milliseconds."
      }
    ]
  },
  jwt: {
    title: "JWT (JSON Web Token) Decoder & Inspector",
    shortDesc: "The open standard (RFC 7519) for securely transmitting authenticated claims between client and server.",
    definition: "A JSON Web Token (JWT) is a compact, URL-safe means of representing claims to be transferred between two parties. The claims in a JWT are encoded as a JSON object that is used as the payload of a JSON Web Signature (JWS) structure or as the plaintext of a JSON Web Encryption (JWE) structure.",
    overviewDetailed: "JWTs enable stateless authentication in modern distributed microservice architectures. Because tokens are cryptographically signed using a secret key (HMAC SHA-256) or a public/private key pair (RSA/ECDSA), backend microservices can independently verify caller identity without querying a centralized session database on every request.",
    useCases: [
      "Stateless user authentication (Bearer tokens passed in HTTP Authorization headers)",
      "Single Sign-On (SSO) and Federated OAuth 2.0 / OpenID Connect (OIDC) session management",
      "Secure client-side claim verification without database roundtrips",
      "Temporary tokenized access authorization for specific S3 buckets or static media assets"
    ],
    bestPractices: [
      "Never store sensitive passwords, social security numbers, or private keys inside a JWT payload.",
      "Always enforce signature verification on the backend using strong 256-bit secret keys or public key pairs.",
      "Set short expiration periods (exp claim) to mitigate impact if a token is compromised.",
      "Store JWTs securely on the browser: prefer HTTP-only, Secure, SameSite=Strict cookies over localStorage to prevent XSS theft."
    ],
    troubleshooting: [
      "Signature Verification Failed: Ensure the public key or HMAC secret matches the authorization server that issued the token.",
      "Token Expired Error: Check the 'exp' claim Unix timestamp. Ensure client and server clocks are synchronized via NTP.",
      "Invalid Algorithm Error: Explicitly reject 'alg: none' in backend verification middleware to block critical JWT bypass attacks."
    ],
    steps: [
      { title: "Paste Encoded JWT", desc: "Paste your raw three-part JWT token (header.payload.signature) into the decoder input field." },
      { title: "Instant Payload Parsing", desc: "The engine immediately unpacks the Base64Url-encoded Header and Payload into clean formatted JSON objects." },
      { title: "Inspect Claims & Expiration", desc: "Review token issuance timestamp (iat), expiration timestamp (exp), subject (sub), and issuer (iss)." },
      { title: "Signature Verification Check", desc: "Optionally test secret signature verification directly in your browser tab." }
    ],
    exampleLabel: "Decoded JWT Claims Payload Example",
    exampleLang: "json",
    exampleCode: `{
  "sub": "user_1234567890",
  "name": "Alex Mercer",
  "role": "system_architect",
  "iat": 1784534400,
  "exp": 1784538000,
  "iss": "https://auth.ownformatters.com"
}`,
    faqs: [
      {
        question: "Are JWT payloads encrypted by default?",
        answer: "No. Standard JWS tokens are signed, not encrypted. The signature ensures data integrity, but the payload is merely Base64Url-encoded and readable by anyone who intercepts it."
      },
      {
        question: "What is the 'exp' claim in a JWT?",
        answer: "The 'exp' (expiration time) claim identifies the exact UTC time after which the JWT must not be accepted for processing."
      },
      {
        question: "How do you invalidate a stateless JWT before expiry?",
        answer: "To revoke a stateless JWT early, you must maintain a lightweight token blacklist in a fast cache like Redis, rotate signing keys, or use short expiration windows paired with refresh tokens."
      }
    ]
  },
  yaml: {
    title: "YAML (YAML Ain't Markup Language) Formatter & Converter",
    shortDesc: "The human-friendly data serialization language optimized for cloud infrastructure and DevOps.",
    definition: "YAML is a human-friendly data serialization standard that integrates natively with modern programming languages. It relies on indentation structure rather than explicit brackets or tags, making it the preferred configuration format for Kubernetes, Docker Compose, Ansible, and CI/CD pipelines.",
    overviewDetailed: "YAML's design emphasizes human readability, making it ideal for maintaining large infrastructure-as-code deployment specifications. Because YAML syntax is a superset of JSON, valid JSON objects can be embedded directly within YAML files.",
    useCases: [
      "DevOps and Cloud Infrastructure configuration (Docker Compose, Kubernetes manifests, Helm charts)",
      "Application configuration files (application.yml, config.yaml, serverless.yml)",
      "CI/CD workflow definitions (GitHub Actions, GitLab CI, CircleCI pipelines)",
      "Static site generator front matter metadata (Jekyll, Hugo, Gatsby)"
    ],
    bestPractices: [
      "Always use spaces for indentation, never tab characters. Tabs cause fatal parser syntax errors.",
      "Maintain consistent 2-space indentation levels throughout the entire document.",
      "Enclose string values in quotes if they resemble boolean keywords (e.g., \"yes\", \"no\", \"true\", \"false\").",
      "Use literal block scalars (|) to preserve exact line breaks for multi-line scripts."
    ],
    troubleshooting: [
      "Tab Character Error: Convert all tabs to 2 spaces.",
      "Indentation Error: Ensure child keys align precisely beneath their parent key.",
      "Type Coercion Error: Quote unquoted string values like country codes ('NO' for Norway) to prevent parsers from converting them to boolean 'false'."
    ],
    steps: [
      { title: "Input Raw YAML", desc: "Paste your raw YAML document or Kubernetes manifest into the editor." },
      { title: "Validation & Conversion", desc: "The engine validates indentation hierarchy and checks for invalid tab characters." },
      { title: "Format & Convert to JSON", desc: "Click to convert YAML directly to clean JSON or reformat indentation." },
      { title: "Copy & Export", desc: "Copy the output directly into your deployment repository." }
    ],
    exampleLabel: "Docker Compose YAML Configuration",
    exampleLang: "yaml",
    exampleCode: `version: "3.8"
services:
  web-app:
    image: node:20-alpine
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
      - API_KEY=secret_key_abc123
    volumes:
      - ./data:/app/data`,
    faqs: [
      {
        question: "Can YAML contain comments?",
        answer: "Yes! Comments start with a hash character (#) and can be placed anywhere on a line, making YAML far superior to standard JSON for documenting complex configs."
      },
      {
        question: "Is YAML a superset of JSON?",
        answer: "Yes, YAML is a technical superset of JSON. Any valid JSON file is also a valid YAML file."
      },
      {
        question: "What does the triple dash (---) mean in YAML?",
        answer: "The triple dash (---) indicates the start of a new document stream, allowing multiple deployment configurations inside a single physical file."
      }
    ]
  },
  sql: {
    title: "SQL (Structured Query Language) Formatter & Beautifier",
    shortDesc: "The declarative database query language for relational database management systems.",
    definition: "SQL (Structured Query Language) is the global standard programming language designed for querying, inserting, updating, and managing relational databases like PostgreSQL, MySQL, SQLite, SQL Server, and Oracle.",
    overviewDetailed: "Unformatted, single-line SQL queries with nested JOINs, subqueries, and complex WHERE clauses are difficult to review and debug. Formatting SQL query syntax standardizes capitalization, indents clauses logically, and improves team code readability.",
    useCases: [
      "Beautifying complex multi-table SQL queries for code reviews and documentation",
      "Formatting ORM-generated SQL logs (Prisma, Drizzle, Hibernate, Entity Framework)",
      "Standardizing database migration scripts and stored procedures",
      "Optimizing query performance through clear visual identification of JOIN patterns"
    ],
    bestPractices: [
      "Write SQL keywords (SELECT, FROM, WHERE, JOIN, GROUP BY) in uppercase.",
      "Place each major clause (SELECT, FROM, JOIN, WHERE) on its own separate line.",
      "Indent subqueries and JOIN conditions by 2 to 4 spaces for visual hierarchy.",
      "Always use parameterized queries or prepared statements in application code to eliminate SQL Injection risks."
    ],
    troubleshooting: [
      "Syntax Errors: Verify matching parentheses around subqueries and CTE expression blocks.",
      "Reserved Keyword Conflicts: Enclose column or table names that match SQL keywords in double quotes (PostgreSQL) or backticks (MySQL)."
    ],
    steps: [
      { title: "Paste SQL Query", desc: "Paste unformatted or minified SQL queries into the text input area." },
      { title: "Choose SQL Dialect", desc: "Select target dialect (Standard SQL, PostgreSQL, MySQL, MariaDB, SQLite, or T-SQL)." },
      { title: "Beautify Syntax", desc: "The engine formats keywords to UPPERCASE, indents subqueries, and aligns clauses." },
      { title: "Copy Clean SQL", desc: "Copy the beautifully formatted query directly into your database client." }
    ],
    exampleLabel: "Formatted PostgreSQL Multi-Table Query",
    exampleLang: "sql",
    exampleCode: `SELECT 
    u.id AS user_id,
    u.username,
    COUNT(o.id) AS total_orders,
    SUM(o.amount) AS total_spent
FROM users AS u
LEFT JOIN orders AS o ON u.id = o.user_id
WHERE u.status = 'active'
GROUP BY u.id, u.username
HAVING total_spent > 150.00
ORDER BY total_spent DESC;`,
    faqs: [
      {
        question: "What is the difference between SQL and NoSQL?",
        answer: "SQL databases are relational, table-based, enforce strict schemas, support JOINs, and guarantee ACID transactions. NoSQL databases are document or key-value based, schema-less, and scale horizontally."
      },
      {
        question: "What are SQL JOIN types?",
        answer: "INNER JOIN returns matching rows in both tables; LEFT JOIN returns all rows from the left table; RIGHT JOIN returns all rows from the right table; FULL JOIN returns all rows when there is a match in either."
      },
      {
        question: "How do database indexes improve query speed?",
        answer: "Indexes create B-tree lookup tables that allow database engines to pinpoint matching rows instantly without scanning millions of disk records."
      }
    ]
  }
};

// Generates high-quality, comprehensive documentation dynamically for all 36+ tools
export function getEducationTopic(toolId: string, toolName: string, category: string): EducationTopic {
  if (EDUCATION_DATA[toolId]) {
    return EDUCATION_DATA[toolId];
  }

  const capitalized = toolName.replace(/\b[a-z]/g, char => char.toUpperCase());

  return {
    title: `${capitalized} Professional Developer Utility`,
    shortDesc: `Comprehensive developer guide, technical specifications, and offline processing utility for ${toolName}.`,
    definition: `The ${capitalized} utility is a core module in the OwnFormatters suite, engineered specifically for high-performance ${category} operations directly within your local browser tab. Operating entirely client-side, it eliminates network latency, guarantees 100% data privacy, and enforces zero server data logging.`,
    overviewDetailed: `In modern software engineering, developer utilities must balance processing speed, syntax accuracy, and security. Traditional web converters transmit raw payloads across public networks, exposing API credentials, database strings, and user data to remote logging servers. OwnFormatters solves this by executing all calculations locally in WebWorker threads.`,
    useCases: [
      `Formatting, validating, and transforming ${category} payloads during frontend & backend development.`,
      `Debugging client-side parsing failures, encoding mismatches, and syntax errors.`,
      `Optimizing data structures for web APIs, microservices, and database persistence.`,
      `Preparing production-ready configurations and code snippets with zero external dependencies.`
    ],
    bestPractices: [
      `Verify input syntax against official specifications prior to committing code.`,
      `Ensure sensitive keys and tokens are cleansed or masked when sharing example payloads.`,
      `Utilize standard UTF-8 encoding across all text inputs to prevent multi-byte character corruption.`,
      `Keep local backups of complex multi-line configurations before bulk transformation.`
    ],
    troubleshooting: [
      `Syntax Errors: Verify that all braces, quotes, and structural delimiters are correctly closed.`,
      `Encoding Mismatches: Check for hidden BOM (Byte Order Mark) or non-standard control characters.`,
      `Memory Limits: For payloads exceeding 10MB, process data in smaller batch chunks to maintain smooth browser UI frame rates.`
    ],
    steps: [
      { title: "Input Raw Payload", desc: "Paste your raw text, code, or data payload into the editor canvas." },
      { title: "Local Browser Processing", desc: "The WebWorker calculation engine parses and transforms the input in real-time." },
      { title: "Review & Format", desc: "Inspect formatted output, syntax highlights, and validation status indicators." },
      { title: "Export & Clipboard", desc: "Copy clean output to clipboard or save directly as a local file." }
    ],
    exampleLabel: `${capitalized} Implementation Reference Code`,
    exampleLang: "javascript",
    exampleCode: `// Local Browser Execution Handler
const processPayload = (inputData) => {
  console.log("Processing ${toolName} locally...");
  return {
    status: "success",
    timestamp: new Date().toISOString(),
    tool: "${toolId}",
    category: "${category}"
  };
};`,
    faqs: [
      {
        question: `How does the ${toolName} tool handle data security?`,
        answer: "100% of calculation logic runs strictly inside your local browser memory thread. No inputs are transmitted over HTTP/HTTPS, logged to cloud databases, or processed on remote servers."
      },
      {
        question: `Can I use ${toolName} without an active internet connection?`,
        answer: "Yes! Once loaded in your browser tab, OwnFormatters functions fully offline as a local Web Application (PWA)."
      },
      {
        question: `Why choose local developer tools over server-side web converters?`,
        answer: "Server-side converters introduce network latency, risk exposure of sensitive credentials to third-party logs, and fail when working offline. Client-side processing is instant, secure, and private."
      }
    ]
  };
}
