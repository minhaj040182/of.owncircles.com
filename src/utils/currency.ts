export type CurrencyCode = 'USD' | 'INR' | 'PKR' | 'BDT' | 'GBP' | 'EUR' | 'AUD' | 'CAD';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  label: string;
  flag: string;
  rateFromUsd: number;
}

export const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  USD: { code: 'USD', symbol: '$', label: 'USD ($)', flag: '🇺🇸', rateFromUsd: 1.0 },
  INR: { code: 'INR', symbol: '₹', label: 'INR (₹)', flag: '🇮🇳', rateFromUsd: 83.5 },
  PKR: { code: 'PKR', symbol: 'Rs ', label: 'PKR (Rs)', flag: '🇵🇰', rateFromUsd: 278.0 },
  BDT: { code: 'BDT', symbol: '৳', label: 'BDT (৳)', flag: '🇧🇩', rateFromUsd: 118.0 },
  GBP: { code: 'GBP', symbol: '£', label: 'GBP (£)', flag: '🇬🇧', rateFromUsd: 0.79 },
  EUR: { code: 'EUR', symbol: '€', label: 'EUR (€)', flag: '🇪🇺', rateFromUsd: 0.92 },
  AUD: { code: 'AUD', symbol: 'A$', label: 'AUD (A$)', flag: '🇦🇺', rateFromUsd: 1.52 },
  CAD: { code: 'CAD', symbol: 'C$', label: 'CAD (C$)', flag: '🇨🇦', rateFromUsd: 1.36 }
};

/**
 * Automatically detect currency code based on user's geographic location (timezone & locale)
 */
export function detectUserCurrency(): CurrencyCode {
  try {
    const tz = (Intl.DateTimeFormat().resolvedOptions().timeZone || '').toLowerCase();
    const lang = (navigator.language || '').toLowerCase();
    const languages = (navigator.languages || []).map(l => l.toLowerCase());
    const allLangs = [lang, ...languages].join(' ');

    // India
    if (
      tz.includes('kolkata') ||
      tz.includes('calcutta') ||
      tz.includes('delhi') ||
      tz.includes('mumbai') ||
      tz.includes('india') ||
      allLangs.includes('-in') ||
      allLangs.includes('hi')
    ) {
      return 'INR';
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
      return 'PKR';
    }

    // Bangladesh
    if (
      tz.includes('dhaka') ||
      tz.includes('bangladesh') ||
      allLangs.includes('-bd') ||
      allLangs.includes('bn')
    ) {
      return 'BDT';
    }

    // United Kingdom
    if (
      tz.includes('london') ||
      tz.includes('belfast') ||
      allLangs.includes('-gb') ||
      allLangs.includes('en-gb')
    ) {
      return 'GBP';
    }

    // Europe (EUR)
    if (
      tz.includes('paris') ||
      tz.includes('berlin') ||
      tz.includes('rome') ||
      tz.includes('madrid') ||
      tz.includes('amsterdam') ||
      tz.includes('brussels') ||
      tz.includes('vienna') ||
      tz.includes('dublin') ||
      tz.includes('lisbon') ||
      tz.includes('athens') ||
      tz.includes('helsinki') ||
      tz.startsWith('europe/')
    ) {
      return 'EUR';
    }

    // Australia
    if (
      tz.includes('sydney') ||
      tz.includes('melbourne') ||
      tz.includes('brisbane') ||
      tz.includes('perth') ||
      tz.includes('adelaide') ||
      tz.startsWith('australia/') ||
      allLangs.includes('-au')
    ) {
      return 'AUD';
    }

    // Canada
    if (
      tz.includes('toronto') ||
      tz.includes('vancouver') ||
      tz.includes('edmonton') ||
      tz.includes('winnipeg') ||
      tz.includes('halifax') ||
      allLangs.includes('-ca')
    ) {
      return 'CAD';
    }
  } catch (err) {
    console.warn('[Currency] Auto location currency detection notice:', err);
  }
  return 'USD';
}

/**
 * Convert raw price string into formatted target currency string automatically based on location.
 */
export function formatPriceInCurrency(priceStr: string | undefined | null, targetCurrency?: CurrencyCode | string): string {
  const code = (targetCurrency as CurrencyCode) || detectUserCurrency();
  const target = CURRENCIES[code] || CURRENCIES.USD;

  if (!priceStr || typeof priceStr !== 'string') {
    return `${target.symbol}2,499`;
  }

  const clean = priceStr.trim();

  // Detect base currency from string symbol
  let baseUsdValue = 49.99;
  let numericVal = parseFloat(clean.replace(/[^0-9.]/g, ''));

  if (isNaN(numericVal) || numericVal <= 0) {
    numericVal = 49.99;
  }

  if (clean.includes('₹') || clean.toUpperCase().includes('INR')) {
    baseUsdValue = numericVal / CURRENCIES.INR.rateFromUsd;
  } else if (clean.toUpperCase().includes('PKR') || clean.includes('RS') || clean.includes('Rs')) {
    baseUsdValue = numericVal / CURRENCIES.PKR.rateFromUsd;
  } else if (clean.includes('৳') || clean.toUpperCase().includes('BDT')) {
    baseUsdValue = numericVal / CURRENCIES.BDT.rateFromUsd;
  } else if (clean.includes('£') || clean.toUpperCase().includes('GBP')) {
    baseUsdValue = numericVal / CURRENCIES.GBP.rateFromUsd;
  } else if (clean.includes('€') || clean.toUpperCase().includes('EUR')) {
    baseUsdValue = numericVal / CURRENCIES.EUR.rateFromUsd;
  } else if (clean.includes('A$') || clean.toUpperCase().includes('AUD')) {
    baseUsdValue = numericVal / CURRENCIES.AUD.rateFromUsd;
  } else if (clean.includes('C$') || clean.toUpperCase().includes('CAD')) {
    baseUsdValue = numericVal / CURRENCIES.CAD.rateFromUsd;
  } else {
    // Default USD
    baseUsdValue = numericVal;
  }

  // Convert USD base to target currency
  const converted = baseUsdValue * target.rateFromUsd;

  // Format with commas and appropriate decimal places
  if (code === 'INR' || code === 'PKR' || code === 'BDT') {
    return `${target.symbol}${Math.round(converted).toLocaleString('en-IN')}`;
  }

  return `${target.symbol}${converted.toFixed(2)}`;
}
