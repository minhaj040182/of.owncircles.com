export interface FAQItem {
  question: string;
  answer: string;
}

export interface EducationTopic {
  title: string;
  shortDesc: string;
  definition: string;
  useCases: string[];
  bestPractices: string[];
  exampleLabel: string;
  exampleCode: string;
  exampleLang: string;
  faqs: FAQItem[];
}

export const EDUCATION_DATA: Record<string, EducationTopic> = {
  json: {
    title: "JSON (JavaScript Object Notation)",
    shortDesc: "The universal lightweight data-interchange format for modern APIs and web services.",
    definition: "JSON (JavaScript Object Notation) is a lightweight, text-based, human-readable data format used to transmit data objects consisting of attribute-value pairs and array data types. Although derived from the JavaScript scripting language, JSON is language-independent, with parsers existing for virtually every programming language on Earth.",
    useCases: [
      "Client-server communication (REST APIs, GraphQL, WebSockets)",
      "Configuration files (package.json, tsconfig.json)",
      "NoSQL database document storage (MongoDB, CouchDB)",
      "Application state serialization and offline caching"
    ],
    bestPractices: [
      "Always wrap property keys in double quotes (\"key\"). Single quotes are invalid in the JSON specification.",
      "Do not include trailing commas after the last element in an object or array.",
      "Ensure numbers do not have leading zeros (e.g., use 42 instead of 042).",
      "Use UTF-8 encoding exclusively to prevent encoding conflicts across services."
    ],
    exampleLabel: "Valid JSON Object Example",
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
        answer: "Yes, JSON is strictly case-sensitive. Property keys like \"userId\" and \"userid\" are treated as completely separate, distinct fields. Booleans and null values must also be written in lowercase (true, false, null)."
      },
      {
        question: "Why are comments not allowed in standard JSON?",
        answer: "Douglas Crockford, the creator of JSON, intentionally omitted comments to prevent people from using them for parsing directives or compiler instructions, which would break cross-platform interoperability. If you need configuration with comments, consider YAML, JSON5, or JSONC."
      },
      {
        question: "What is the difference between JSON and XML?",
        answer: "JSON is significantly lighter, easier to read/write for humans, and maps directly to native programming language data structures (like maps, lists, and primitives). XML is tag-based, more verbose, supports custom schemas/namespaces, and is generally used in legacy enterprise systems."
      },
      {
        question: "How do I handle Date objects in JSON?",
        answer: "JSON has no native Date data type. The industry standard is to serialize dates as ISO 8601 strings (e.g., \"2026-07-19T05:04:30Z\") or Unix epoch timestamps (integers representing seconds or milliseconds)."
      }
    ]
  },
  jwt: {
    title: "JWT (JSON Web Token)",
    shortDesc: "The open standard for securely transmitting claims between parties as a JSON object.",
    definition: "A JSON Web Token (JWT) is a compact, URL-safe means of representing claims to be transferred between two parties. The information in a JWT is digitally signed, making it tamper-proof. JWTs are composed of three parts separated by dots: a Header (algorithm and token type), a Payload (claims/data), and a Signature.",
    useCases: [
      "Stateless user authentication (Bearer tokens in HTTP authorization headers)",
      "Single Sign-On (SSO) across decentralized web domains",
      "Secure client-side session information exchange without server storage",
      "Secure temporary access delegation for specific server assets"
    ],
    bestPractices: [
      "Never store sensitive, private, or confidential data (like passwords) in a JWT. The payload is only Base64Url-encoded and can be read by anyone who intercepts it.",
      "Always enforce signature validation on the backend using a strong secret key or public/private key pair (RS256/ES256).",
      "Set appropriate expiration times (exp claim) to minimize the impact of token theft.",
      "Store JWTs securely on the client: prefer HTTP-only, Secure, SameSite=Strict cookies over localStorage to mitigate XSS risks."
    ],
    exampleLabel: "JWT Decoded Payload Structure",
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
        question: "Are JWTs encrypted?",
        answer: "By default, no. Standard JWTs (also known as JWS) are signed, not encrypted. The signature ensures data integrity and authenticity, but the data itself is base64-encoded and fully visible to anyone. Encrypted JWTs are known as JWE (JSON Web Encryption)."
      },
      {
        question: "What is the 'exp' claim in a JWT?",
        answer: "The 'exp' (expiration time) claim identifies the exact expiration time on or after which the JWT must not be accepted for processing. It must be a NumericDate value (Unix timestamp in seconds)."
      },
      {
        question: "How do you invalidate a JWT before it expires?",
        answer: "Because JWTs are stateless, they cannot be natively invalidated. To revoke them early, you must implement a token blacklist (storing revoked token IDs in a high-speed cache like Redis), use short expiration times with sliding refresh tokens, or rotate signing keys."
      }
    ]
  },
  yaml: {
    title: "YAML (YAML Ain't Markup Language)",
    shortDesc: "The human-friendly data serialization language optimized for configuration.",
    definition: "YAML is a human-friendly data serialization standard that integrates easily with modern programming languages. It is highly readable because it uses indentation to indicate nesting structure rather than brackets or tags. It is frequently converted to and from JSON since they share identical hierarchical object trees.",
    useCases: [
      "DevOps and Cloud Infrastructure configuration (Docker Compose, Kubernetes)",
      "Application setting files (application.yml, config.yaml)",
      "CI/CD workflow definitions (GitHub Actions, GitLab CI)",
      "Static site metadata definitions (Jekyll, Hugo front matter)"
    ],
    bestPractices: [
      "Use spaces for indentation, never tabs. Most parsers will throw a syntax error if tabs are encountered.",
      "Be consistent with the number of spaces for indentation (typically 2 spaces).",
      "Use quotes around strings that look like boolean values (e.g., \"yes\", \"no\") to prevent parsers from converting them to true/false.",
      "Utilize multi-line string block indicators: | to preserve newlines, and > to fold newlines into spaces."
    ],
    exampleLabel: "YAML Configuration Example",
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
        answer: "Yes! Comments in YAML start with a hash character (#) and can be placed anywhere on a line. This makes YAML highly superior to JSON for complex configurations where notes are required."
      },
      {
        question: "Is YAML a superset of JSON?",
        answer: "Yes, YAML is technically a superset of JSON. This means any valid JSON file is also a valid YAML file. You can even mix JSON flow syntax (brackets and commas) inside a YAML document."
      },
      {
        question: "What does the three dashes (---) mean in YAML?",
        answer: "The three dashes (---) represent the start of a document. It allows you to package multiple distinct YAML documents or configurations into a single physical stream or file."
      }
    ]
  },
  sql: {
    title: "SQL (Structured Query Language)",
    shortDesc: "The standard declarative programming language for managing relational databases.",
    definition: "SQL (Structured Query Language) is the global standard programming language designed for managing, querying, and manipulating data stored in relational database management systems (RDBMS). It operates on tables consisting of structured columns and rows, utilizing relationships and constraints to maintain mathematical data consistency.",
    useCases: [
      "Querying structured transactional data (SELECT, JOIN, WHERE)",
      "Database schema definitions (CREATE TABLE, ALTER, DROP)",
      "Transactional records modification (INSERT, UPDATE, DELETE)",
      "Database administration, user permissions, and query indexing"
    ],
    bestPractices: [
      "Write SQL keywords (SELECT, FROM, JOIN, WHERE) in uppercase to distinguish them from table and column names.",
      "Always use parameterized queries or prepared statements to prevent SQL Injection security vulnerabilities.",
      "Add indexes on columns frequently used in WHERE, JOIN, and ORDER BY clauses to boost query performance.",
      "Use meaningful aliases (AS) to make complex query results easier to read and parse."
    ],
    exampleLabel: "Clean Standard SQL Query",
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
        answer: "SQL databases are relational, table-based, enforce strict schemas, support complex JOIN operations, and guarantee ACID consistency (ideal for financial records). NoSQL databases are non-relational, document- or key-value-based, schema-less, scale horizontally, and are optimized for high-volume unstructured data."
      },
      {
        question: "What are JOIN operations in SQL?",
        answer: "JOINs are clauses used to combine rows from two or more tables based on a related column between them. Common types include: INNER JOIN (matching rows in both), LEFT JOIN (all rows from left table + matching from right), RIGHT JOIN (opposite of left), and FULL JOIN (all rows when there is a match in either)."
      },
      {
        question: "How do indexes speed up SQL queries?",
        answer: "Indexes are special lookup tables that the database search engine can use to locate data rows instantly without scanning the entire table. Think of it like a book index: instead of reading every page, you look up the term to find exact page numbers."
      }
    ]
  },
  regex: {
    title: "Regular Expressions (RegEx)",
    shortDesc: "The powerful pattern-matching language for string search, validation, and manipulation.",
    definition: "A Regular Expression (RegEx) is a sequence of characters that forms a search pattern. This pattern can be used for text search, text replacement, input validation, and lexical parsing. RegEx is supported in virtually all programming languages, command-line shells, and code editors.",
    useCases: [
      "Form input validation (validating emails, phone numbers, passwords)",
      "Advanced code-refactoring searches (searching with wildcards and lookaheads)",
      "Data extraction and scraping from logs or unstructured documents",
      "URL routing matchers in backend web servers"
    ],
    bestPractices: [
      "Keep regular expressions as simple as possible. Write clear comments explaining complex patterns to prevent maintenance nightmares.",
      "Avoid 'Catastrophic Backtracking' by writing patterns that fail fast instead of evaluating infinite sub-permutations.",
      "Use non-capturing groups (?:pattern) when you only need to group sub-expressions without storing them in memory.",
      "Always test your regex against edge cases, including empty strings and very long malicious payloads."
    ],
    exampleLabel: "RFC 5322 Compliant Email Regex",
    exampleLang: "javascript",
    exampleCode: `^[a-zA-Z0-9.!#$%&'*+/=?^_\`{|}~-]+@[a-zA-Z0-9-]+(?:\\.[a-zA-Z0-9-]+)*$`,
    faqs: [
      {
        question: "What does \\b represent in RegEx?",
        answer: "The \\b represents a word boundary. It matches the empty space between a word character (like a letter) and a non-word character (like spaces or punctuation), allowing you to match exact standalone words."
      },
      {
        question: "What is the difference between lazy and greedy matchers?",
        answer: "Greedy matchers (like * or +) match as many characters as possible. Lazy matchers (written as *? or +?) match as few characters as possible. For example, in \"<div>hello</div>\", \"<.*>\" (greedy) matches the entire string, while \"<.*?>\" (lazy) matches just \"<div>\"."
      },
      {
        question: "What are lookaheads and lookbehinds?",
        answer: "They are zero-width assertions that match a pattern depending on what follows (lookahead) or precedes (lookbehind) it, without including the asserted characters in the matched result. For example, \"(?<=\\$)\\d+\" matches numbers only if they are directly preceded by a dollar sign."
      }
    ]
  },
  cron: {
    title: "Cron Expressions & Schedulers",
    shortDesc: "The syntax standard for configuring recurring background tasks and daemon events.",
    definition: "A cron expression is a string comprising five or six fields separated by white spaces that represents a schedule for executing command-line scripts or functions. Originating from the Unix operating system's 'crontab' daemon, it enables developers to specify exact minute, hour, day, month, and day-of-week intervals.",
    useCases: [
      "Scheduling nightly database backup jobs",
      "Running server health-check scripts every 5 minutes",
      "Triggering promotional marketing emails at 8:00 AM every Monday",
      "Cleaning temporary cache files and old logs every Saturday night"
    ],
    bestPractices: [
      "Always schedule non-critical jobs during off-peak traffic hours (like 2:00 AM) to maintain server responsiveness.",
      "Include timezone configurations when scheduling tasks across international clusters.",
      "Use descriptive comments or headers in your cron configuration files to document what each schedule triggers.",
      "Utilize the slash indicator (/) for intervals instead of listing individual numbers (e.g., */15 instead of 0,15,30,45)."
    ],
    exampleLabel: "Cron Syntax Breakdown",
    exampleLang: "text",
    exampleCode: `┌───────────── minute (0 - 59)
│ ┌─────────── hour (0 - 23)
│ │ ┌───────── day of the month (1 - 31)
│ │ │ ┌─────── month (1 - 12)
│ │ │ │ ┌───── day of the week (0 - 6) (Sunday to Saturday)
│ │ │ │ │
* * * * *`,
    faqs: [
      {
        question: "What does '*/15 * * * *' mean?",
        answer: "This expression schedules a task to run every 15 minutes of every hour, of every day, of every month."
      },
      {
        question: "What is the difference between 0 and 7 in the day-of-week field?",
        answer: "In Unix cron schedules, both 0 and 7 represent Sunday. Many modern parsers and cloud schedulers accept names (SUN, MON, TUE) to make configurations cleaner and less error-prone."
      },
      {
        question: "What are non-standard macros like '@daily' or '@weekly'?",
        answer: "Many modern systems (like systemd, Kubernetes, and Node-cron) support shorthand macros. For example, @hourly translates to '0 * * * *', @daily is '0 0 * * *', and @reboot runs once at system startup."
      }
    ]
  }
};

// Generates high-quality fallback guides dynamically if a tool lacks a custom-crafted profile
export function getEducationTopic(toolId: string, toolName: string, category: string): EducationTopic {
  if (EDUCATION_DATA[toolId]) {
    return EDUCATION_DATA[toolId];
  }

  // Dynamic Generator to guarantee 100% SEO coverage for all tools!
  const capitalized = toolName.replace(/\b[a-z]/g, char => char.toUpperCase());
  return {
    title: `${capitalized}`,
    shortDesc: `The comprehensive developer utility and handbook guide for ${toolName}.`,
    definition: `This specialized utility serves as a core module in our developer toolkit, engineered to streamline ${toolName} processing directly on your local device. Operating 100% serverless, it guarantees zero data transmission, providing maximum privacy while maintaining peak system productivity.`,
    useCases: [
      `Validating and structuring input parameters for ${category} applications.`,
      "Formatting complex configuration trees and structural payloads on the fly.",
      "Debugging client-side parsing failures and data consistency issues.",
      "Automating workflow setups and formatting with copy-paste readiness."
    ],
    bestPractices: [
      "Ensure input data is correctly encoded and clean of invisible control characters.",
      "Inspect formatting guidelines and configuration keys prior to output storage.",
      "Keep local backups of highly complex configuration strings or files.",
      "Double-check generated outputs against standard technical guidelines before production deployment."
    ],
    exampleLabel: "Typical Code Snippet / Context",
    exampleLang: "javascript",
    exampleCode: `// Client-Side Developer Verification Code\nconst processTask = async (data) => {\n  console.log("Analyzing local payloads safely for ${toolName}...");\n  return {\n    success: true,\n    timestamp: Date.now(),\n    scope: "${category}"\n  };\n};`,
    faqs: [
      {
        question: `How does the ${toolName} tool process my data?`,
        answer: "All processing occurs entirely inside your local browser tab using client-side JavaScript. No data is sent to external servers, cloud stores, or third-party analytical endpoints, guaranteeing complete security for secret tokens, config structures, and API keys."
      },
      {
        question: `Is there an offline or bookmark shortcut for ${toolName}?`,
        answer: "Yes! You can press Cmd+D (Mac) or Ctrl+D (Windows) to bookmark this page, or click the 'Bookmark Site' banner at the top of the interface for single-click local launching."
      },
      {
        question: "Why is local developer tooling preferred over remote converters?",
        answer: "Remote online converters pose massive data security risks, as sensitive inputs (like keys, databases, or client emails) are transmitted across networks and often logged on remote servers. Local tools are completely immune to these data exposure channels."
      }
    ]
  };
}
