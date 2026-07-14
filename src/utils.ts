/**
 * Formatting and parsing helpers for OwnFormatters
 */

// Simple XML Beautifier
export function formatXml(xmlStr: string): string {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(xmlStr, 'application/xml');
    
    // Check for parsing errors
    const parserError = xmlDoc.getElementsByTagName('parsererror');
    if (parserError.length > 0) {
      throw new Error(parserError[0].textContent || 'XML Parsing Error');
    }

    let formatted = '';
    const reg = /(>)(<)(\/*)/g;
    xmlStr = xmlStr.replace(reg, '$1\r\n$2$3');
    let pad = 0;
    
    const lines = xmlStr.split('\r\n');
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      let indent = 0;
      if (line.match(/.+<\/\w[^>]*>$/)) {
        indent = 0;
      } else if (line.match(/^<\/\w/)) {
        if (pad !== 0) {
          pad -= 1;
        }
      } else if (line.match(/^<\w[^>]*[^\/]>.*$/)) {
        indent = 1;
      } else {
        indent = 0;
      }

      let padding = '';
      for (let j = 0; j < pad; j++) {
        padding += '  ';
      }

      formatted += padding + line + '\r\n';
      pad += indent;
    }
    
    return formatted.trim();
  } catch (err: any) {
    throw new Error(err.message || 'Invalid XML structure.');
  }
}

// Simple SQL Beautifier
export function formatSql(sql: string, uppercaseKeywords: boolean = true): string {
  if (!sql) return '';

  const keywords = [
    'SELECT', 'FROM', 'WHERE', 'AND', 'OR', 'LIMIT', 'OFFSET', 'ORDER BY', 'GROUP BY',
    'HAVING', 'LEFT JOIN', 'RIGHT JOIN', 'INNER JOIN', 'OUTER JOIN', 'JOIN', 'ON', 'UNION',
    'INSERT INTO', 'VALUES', 'UPDATE', 'SET', 'DELETE FROM', 'CREATE TABLE', 'DROP TABLE',
    'ALTER TABLE', 'INDEX', 'PRIMARY KEY', 'FOREIGN KEY', 'IN', 'NOT IN', 'LIKE', 'IS NULL',
    'IS NOT NULL', 'AS', 'DISTINCT', 'COUNT', 'SUM', 'AVG', 'MIN', 'MAX', 'CASE', 'WHEN',
    'THEN', 'ELSE', 'END', 'CROSS JOIN', 'USING', 'WITH', 'EXISTS'
  ];

  let formatted = sql.trim();

  // Normalize spaces
  formatted = formatted.replace(/\s+/g, ' ');

  // Standardize keyword case if requested
  if (uppercaseKeywords) {
    keywords.forEach(kw => {
      const regex = new RegExp(`\\b${kw}\\b`, 'gi');
      formatted = formatted.replace(regex, kw);
    });
  } else {
    keywords.forEach(kw => {
      const regex = new RegExp(`\\b${kw}\\b`, 'gi');
      formatted = formatted.replace(regex, kw.toLowerCase());
    });
  }

  // Inject line breaks before major statement sections
  const breakKeywords = [
    'FROM', 'WHERE', 'ORDER BY', 'GROUP BY', 'LIMIT', 'LEFT JOIN', 'RIGHT JOIN', 
    'INNER JOIN', 'OUTER JOIN', 'JOIN', 'UNION', 'SET', 'VALUES'
  ];

  breakKeywords.forEach(kw => {
    // Escape keywords for regex matching
    const regexKw = kw.replace(' ', '\\s+');
    const regex = new RegExp(`\\s+(${regexKw})\\b`, 'g');
    formatted = formatted.replace(regex, '\n$1');
  });

  // Also put newlines after SELECT columns if needed, but keeping it simple:
  // Split on SELECT and commas for projection
  formatted = formatted.replace(/SELECT\s+/g, 'SELECT\n  ');
  formatted = formatted.replace(/,\s+/g, ',\n  ');
  formatted = formatted.replace(/\s+AND\s+/g, '\n  AND ');
  formatted = formatted.replace(/\s+OR\s+/g, '\n  OR ');

  // Clean up formatting Artifacts
  formatted = formatted.split('\n').map(line => line.trimEnd()).join('\n');

  return formatted;
}

// Decode JWT helper
export interface JwtPayload {
  header: any;
  payload: any;
  valid: boolean;
  error?: string;
}

export function decodeJwt(token: string): JwtPayload {
  try {
    const parts = token.trim().split('.');
    if (parts.length !== 3) {
      throw new Error('JWT must have exactly 3 parts separated by dots');
    }

    const decodePart = (str: string) => {
      // Normalize base64url to standard base64
      let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
      while (base64.length % 4) {
        base64 += '=';
      }
      return JSON.parse(decodeURIComponent(escape(atob(base64))));
    };

    return {
      header: decodePart(parts[0]),
      payload: decodePart(parts[1]),
      valid: true
    };
  } catch (err: any) {
    return {
      header: null,
      payload: null,
      valid: false,
      error: err.message || 'Invalid JWT format'
    };
  }
}
