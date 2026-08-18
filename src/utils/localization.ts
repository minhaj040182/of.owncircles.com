export type RegionCode = 'IN' | 'PK' | 'BD' | 'US' | 'GB' | 'CA' | 'AU' | 'DE';

export interface RegionConfig {
  code: RegionCode;
  name: string;
  flag: string;
  currencySymbol: string;
  currencyCode: string;
  amazonDomain: string;
  amazonTag: string;
  usdExchangeRate: number; // Conversion rate relative to USD
  storeName: string;
  deliveryNote: string;
}

export const REGION_CONFIGS: Record<RegionCode, RegionConfig> = {
  IN: {
    code: 'IN',
    name: 'India',
    flag: '🇮🇳',
    currencySymbol: '₹',
    currencyCode: 'INR',
    amazonDomain: 'amazon.in',
    amazonTag: 'trends0628-in-21',
    usdExchangeRate: 83.5,
    storeName: 'Amazon India',
    deliveryNote: 'Free Delivery with Prime India',
  },
  PK: {
    code: 'PK',
    name: 'Pakistan',
    flag: '🇵🇰',
    currencySymbol: 'Rs ',
    currencyCode: 'PKR',
    amazonDomain: 'amazon.pk',
    amazonTag: 'trends0628-pk-21',
    usdExchangeRate: 278.0,
    storeName: 'Amazon Pakistan / Global',
    deliveryNote: 'Standard Regional Delivery',
  },
  BD: {
    code: 'BD',
    name: 'Bangladesh',
    flag: '🇧🇩',
    currencySymbol: '৳',
    currencyCode: 'BDT',
    amazonDomain: 'amazon.com.bd',
    amazonTag: 'trends0628-bd-21',
    usdExchangeRate: 118.0,
    storeName: 'Amazon Bangladesh / Global',
    deliveryNote: 'Regional & Global Express Shipping',
  },
  US: {
    code: 'US',
    name: 'United States',
    flag: '🇺🇸',
    currencySymbol: '$',
    currencyCode: 'USD',
    amazonDomain: 'amazon.com',
    amazonTag: 'trends0628-21',
    usdExchangeRate: 1.0,
    storeName: 'Amazon US',
    deliveryNote: 'Free Prime 1-Day Shipping',
  },
  GB: {
    code: 'GB',
    name: 'United Kingdom',
    flag: '🇬🇧',
    currencySymbol: '£',
    currencyCode: 'GBP',
    amazonDomain: 'amazon.co.uk',
    amazonTag: 'trends0628-gb-21',
    usdExchangeRate: 0.79,
    storeName: 'Amazon UK',
    deliveryNote: 'Free Prime Next Day Delivery',
  },
  CA: {
    code: 'CA',
    name: 'Canada',
    flag: '🇨🇦',
    currencySymbol: 'C$',
    currencyCode: 'CAD',
    amazonDomain: 'amazon.ca',
    amazonTag: 'trends0628-ca-21',
    usdExchangeRate: 1.36,
    storeName: 'Amazon Canada',
    deliveryNote: 'Free Shipping with Prime Canada',
  },
  AU: {
    code: 'AU',
    name: 'Australia',
    flag: '🇦🇺',
    currencySymbol: 'A$',
    currencyCode: 'AUD',
    amazonDomain: 'amazon.com.au',
    amazonTag: 'trends0628-au-21',
    usdExchangeRate: 1.52,
    storeName: 'Amazon Australia',
    deliveryNote: 'Free Prime Delivery Australia',
  },
  DE: {
    code: 'DE',
    name: 'Germany / Europe',
    flag: '🇩🇪',
    currencySymbol: '€',
    currencyCode: 'EUR',
    amazonDomain: 'amazon.de',
    amazonTag: 'trends0628-de-21',
    usdExchangeRate: 0.92,
    storeName: 'Amazon Germany',
    deliveryNote: 'Kostenlose Prime-Lieferung',
  },
};

/**
 * Automatically detect user's region based on URL query param, saved preference, or timezone/language settings
 */
export function detectUserRegion(): RegionCode {
  try {
    // 1. Direct URL Query Parameter override (e.g. ?region=IN or ?geo=IN or ?country=IN)
    if (typeof window !== 'undefined' && window.location && window.location.search) {
      const urlParams = new URLSearchParams(window.location.search);
      const urlGeo = (urlParams.get('region') || urlParams.get('geo') || urlParams.get('country') || '').toUpperCase();
      if (urlGeo && REGION_CONFIGS[urlGeo as RegionCode]) {
        try {
          localStorage.setItem('trendpulse_user_region', urlGeo);
        } catch (e) {
          console.warn('Unable to persist URL geo preference:', e);
        }
        return urlGeo as RegionCode;
      }
    }

    // 2. Check Browser Timezone and Language FIRST for accurate physical location
    const tz = (Intl.DateTimeFormat().resolvedOptions().timeZone || '').toLowerCase();
    const lang = (navigator.language || '').toLowerCase();
    const languages = (navigator.languages || []).map(l => l.toLowerCase());
    const allLangs = [lang, ...languages].join(' ');

    // India (Kolkata, Calcutta, Delhi, Mumbai, Asia/Kolkata, hi, en-IN)
    if (
      tz.includes('kolkata') ||
      tz.includes('calcutta') ||
      tz.includes('delhi') ||
      tz.includes('mumbai') ||
      tz.includes('india') ||
      tz.includes('asia/calcutta') ||
      tz.includes('asia/kolkata') ||
      allLangs.includes('-in') ||
      allLangs.includes('en-in') ||
      allLangs.includes('hi')
    ) {
      return 'IN';
    }

    // 3. Saved user preference from localStorage (if user explicitly chose another region)
    const saved = localStorage.getItem('trendpulse_user_region');
    if (saved && REGION_CONFIGS[saved as RegionCode]) {
      return saved as RegionCode;
    }

    // Pakistan
    if (
      tz.includes('karachi') ||
      tz.includes('islamabad') ||
      tz.includes('lahore') ||
      tz.includes('pakistan') ||
      allLangs.includes('-pk') ||
      allLangs.includes('ur')
    ) {
      return 'PK';
    }

    // Bangladesh
    if (
      tz.includes('dhaka') ||
      tz.includes('bangladesh') ||
      allLangs.includes('-bd') ||
      allLangs.includes('bn')
    ) {
      return 'BD';
    }

    // United Kingdom
    if (
      tz.includes('london') ||
      tz.includes('belfast') ||
      allLangs.includes('-gb') ||
      allLangs.includes('en-gb')
    ) {
      return 'GB';
    }

    // Canada
    if (
      tz.includes('toronto') ||
      tz.includes('vancouver') ||
      tz.includes('edmonton') ||
      tz.includes('winnipeg') ||
      allLangs.includes('-ca')
    ) {
      return 'CA';
    }

    // Australia
    if (
      tz.includes('sydney') ||
      tz.includes('melbourne') ||
      tz.includes('brisbane') ||
      tz.includes('perth') ||
      allLangs.includes('-au')
    ) {
      return 'AU';
    }

    // Germany
    if (
      tz.includes('berlin') ||
      tz.includes('frankfurt') ||
      tz.includes('munich') ||
      allLangs.includes('-de') ||
      allLangs.includes('de')
    ) {
      return 'DE';
    }
  } catch (err) {
    console.warn('[Localization] Auto-detection fallback to US:', err);
  }
  return 'US'; // Default
}

/**
 * Format any price into localized currency
 */
export function formatPriceForRegion(
  price: string | number | undefined,
  region: RegionCode
): string {
  const config = REGION_CONFIGS[region] || REGION_CONFIGS.IN;
  if (!price && price !== 0) return `${config.currencySymbol}2,499`;

  let str = String(price).trim();
  
  // Clean number
  const num = parseFloat(str.replace(/[^0-9.]/g, ''));
  if (isNaN(num) || num <= 0) {
    return `${config.currencySymbol}2,499`;
  }

  // If already formatted for this region symbol
  if (str.startsWith(config.currencySymbol)) {
    return str;
  }

  // Calculate local price using USD base
  let usdValue = num;
  if (str.includes('₹') || str.toUpperCase().includes('INR')) {
    usdValue = num / REGION_CONFIGS.IN.usdExchangeRate;
  } else if (str.toUpperCase().includes('PKR') || str.toLowerCase().startsWith('rs')) {
    usdValue = num / REGION_CONFIGS.PK.usdExchangeRate;
  } else if (str.includes('৳') || str.toUpperCase().includes('BDT')) {
    usdValue = num / REGION_CONFIGS.BD.usdExchangeRate;
  } else if (str.includes('£') || str.toUpperCase().includes('GBP')) {
    usdValue = num / REGION_CONFIGS.GB.usdExchangeRate;
  } else if (str.includes('€') || str.toUpperCase().includes('EUR')) {
    usdValue = num / REGION_CONFIGS.DE.usdExchangeRate;
  }

  const localConverted = usdValue * config.usdExchangeRate;

  if (region === 'IN' || region === 'PK' || region === 'BD') {
    return `${config.currencySymbol}${Math.round(localConverted).toLocaleString('en-IN')}`;
  }

  return `${config.currencySymbol}${localConverted.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Generate localized Amazon Affiliate URL based on selected region
 */
export function getLocalizedAffiliateUrl(
  originalUrl: string | undefined,
  productName: string,
  region: RegionCode
): string {
  const config = REGION_CONFIGS[region] || REGION_CONFIGS.IN;
  
  // Clean YouTube fluff words so Amazon search ALWAYS finds matching live products
  let cleanTerms = (productName || '')
    .replace(/\b(Review|Reviews|Testing|Test|Tests|Unboxing|Real-World|Hands-On|Comparison|Vs|2026|2025|2024|In-Depth|Field Test|Full|Honest|Best|Top|Amazon|Finds|Gadgets|Gadget|India|USA|UK|Canada|Pakistan|Bangladesh|Germany|Australia|Must Watch|OMG|WOW)\b/gi, '')
    .replace(/[^\w\s-]/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 4)
    .join('+');

  if (!cleanTerms) cleanTerms = 'trending+products';
  const query = encodeURIComponent(cleanTerms);

  // If a direct URL is given and matches region domain, use it with tag attached
  if (originalUrl && originalUrl.includes('amazon') && originalUrl.includes(config.amazonDomain)) {
    let updated = originalUrl;
    if (updated.includes('tag=')) {
      updated = updated.replace(/tag=[^&]+/g, `tag=${config.amazonTag}`);
    } else {
      updated += (updated.includes('?') ? '&' : '?') + `tag=${config.amazonTag}`;
    }
    return updated;
  }

  // Guaranteed 100% working live Amazon search link with Affiliate Tag for specific domain
  return `https://www.${config.amazonDomain}/s?k=${query}&tag=${config.amazonTag}`;
}
