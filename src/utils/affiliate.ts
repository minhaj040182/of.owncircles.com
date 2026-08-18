export const AFFILIATE_ID = 'trends0628-21';

/**
 * Cleans comment text by unescaping HTML entities (&quot;, &#39;, &amp;, &lt;, &gt;),
 * replacing <a href="...">...</a> HTML tags with plain URLs, and stripping leftover HTML tags.
 */
export function cleanCommentText(rawText: string): string {
  if (!rawText) return '';

  let cleaned = rawText;

  // 1. Unescape common HTML entities
  cleaned = cleaned
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&apos;/g, "'")
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&nbsp;/g, ' ');

  // 2. Convert <a href="URL">...</a> tags into plain URLs
  cleaned = cleaned.replace(/<a\s+[^>]*href=["']([^"']+)["'][^>]*>(.*?)<\/a>/gi, (_match, href, anchorText) => {
    if (href && (href.startsWith('http') || href.includes('amazon') || href.includes('amzn'))) {
      return ` ${href} `;
    }
    if (anchorText && (anchorText.startsWith('http') || anchorText.includes('amazon') || anchorText.includes('amzn'))) {
      return ` ${anchorText} `;
    }
    return ` ${anchorText || href || ''} `;
  });

  // 3. Remove any remaining HTML tags (e.g. <br>, <b>, <i>, <span>, etc.)
  cleaned = cleaned.replace(/<\/?[^>]+(>|$)/g, ' ');

  // 4. Collapse consecutive spaces/newlines into a single space
  cleaned = cleaned.replace(/\s+/g, ' ').trim();

  return cleaned;
}

/**
 * Extracts an Amazon ASIN (e.g. B08N5WRWNW) from a URL or text string if present
 */
export function extractAsin(urlOrText: string): string | null {
  if (!urlOrText) return null;
  const match = urlOrText.match(/(?:dp|gp\/product|asin|product)\/([A-Z0-9]{10})/i) ||
                urlOrText.match(/\b(B0[A-Z0-9]{8})\b/i);
  return match ? match[1].toUpperCase() : null;
}

/**
 * Creates a standard Amazon search affiliate link on specific domain
 */
export function createAmazonSearchLink(query: string, domain: string = 'amazon.in', tag: string = AFFILIATE_ID): string {
  if (!query) return `https://www.${domain}/s?k=trending+products&tag=${tag}`;
  
  // Clean YouTube fluff words so Amazon search ALWAYS finds matching live products
  let cleanTerms = query
    .replace(/\b(Review|Reviews|Testing|Test|Tests|Unboxing|Real-World|Hands-On|Comparison|Vs|2026|2025|2024|In-Depth|Field Test|Full|Honest|Best|Top|Amazon|Finds|Gadgets|Gadget|India|USA|UK|Canada|Pakistan|Bangladesh|Germany|Australia|Must Watch|OMG|WOW)\b/gi, '')
    .replace(/[^\w\s-]/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 4)
    .join('+');

  if (!cleanTerms) cleanTerms = 'trending+products';

  return `https://www.${domain}/s?k=${cleanTerms}&tag=${tag}`;
}

/**
 * Ensures any URL, ASIN code, or product query uses the correct Amazon domain with affiliate tag.
 * If product code / ASIN is found, generates a direct product link.
 * If absent or confusing, generates a targeted Amazon search link.
 */
export function convertAmazonUrl(urlOrQuery: string, tag: string = AFFILIATE_ID, domain: string = 'amazon.in'): string {
  if (!urlOrQuery) return `https://www.${domain}/s?k=trending+products&tag=${tag}`;
  
  const trimmed = urlOrQuery.trim();

  // 1. Check if an explicit ASIN / product code is present
  const asin = extractAsin(trimmed);
  if (asin) {
    return `https://www.${domain}/dp/${asin}?tag=${tag}`;
  }

  // 2. If it's a raw non-Amazon text phrase, convert to search link
  if (!trimmed.startsWith('http://') && !trimmed.startsWith('https://') && !trimmed.includes('amazon.') && !trimmed.includes('amzn.to')) {
    return createAmazonSearchLink(trimmed, domain, tag);
  }

  // 3. Parse and reformat existing Amazon URLs
  try {
    let fullUrl = trimmed;
    if (!fullUrl.startsWith('http://') && !fullUrl.startsWith('https://')) {
      fullUrl = 'https://' + fullUrl;
    }

    const parsedUrl = new URL(fullUrl);
    const isAmazon = parsedUrl.hostname.includes('amazon.') || parsedUrl.hostname.includes('amzn.to');

    if (isAmazon) {
      // Re-check ASIN in pathname
      const pathAsin = extractAsin(parsedUrl.pathname);
      if (pathAsin) {
        return `https://www.${domain}/dp/${pathAsin}?tag=${tag}`;
      }

      parsedUrl.hostname = `www.${domain}`;
      parsedUrl.protocol = 'https:';
      parsedUrl.searchParams.set('tag', tag);

      if (parsedUrl.pathname.includes('/s')) {
        const queryTerm = parsedUrl.searchParams.get('k');
        if (queryTerm) {
          return createAmazonSearchLink(queryTerm, domain, tag);
        }
      }

      return parsedUrl.toString();
    }

    return createAmazonSearchLink(trimmed, domain, tag);
  } catch {
    return createAmazonSearchLink(trimmed, domain, tag);
  }
}

/**
 * Scans a text snippet, finds all product URLs or mentions,
 * and rewrites them into localized Amazon affiliate links.
 */
export function convertTextWithAffiliateLinks(text: string, tag: string = AFFILIATE_ID, domain: string = 'amazon.in'): {
  convertedText: string;
  linksFoundCount: number;
  amazonLinksConvertedCount: number;
} {
  if (!text) return { convertedText: '', linksFoundCount: 0, amazonLinksConvertedCount: 0 };

  let linksFoundCount = 0;
  let amazonLinksConvertedCount = 0;

  const urlRegex = /(https?:\/\/[^\s]+|amzn\.to\/[^\s]+|amazon\.[a-z.]+\/[^\s]+)/gi;

  const convertedText = text.replace(urlRegex, (matchedUrl) => {
    linksFoundCount++;
    amazonLinksConvertedCount++;
    return convertAmazonUrl(matchedUrl, tag, domain);
  });

  return {
    convertedText,
    linksFoundCount,
    amazonLinksConvertedCount,
  };
}


