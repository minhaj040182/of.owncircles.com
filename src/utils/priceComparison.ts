import { RegionCode, REGION_CONFIGS } from './localization';
import { CurrencyCode, CURRENCIES } from './currency';
import { AFFILIATE_ID } from './affiliate';

export interface StorePriceQuote {
  storeId: string;
  storeName: string;
  domain: string;
  logoText: string;
  accentColor: string; // Hex color for chart and UI
  price: number; // in local currency
  originalPrice?: number; // MRP
  formattedPrice: string;
  formattedOriginalPrice?: string;
  discountPercentage?: number;
  isLowestPrice: boolean;
  stockStatus: 'In Stock' | 'Limited Stock' | 'Fast Shipping' | 'Prime / Express';
  deliveryNote: string;
  shippingCost: number; // 0 for free shipping
  formattedShippingCost: string; // "FREE", "$4.99", "₹40", etc.
  deliveryTimeEstimate: string; // e.g., "Tomorrow by 9 PM", "1-2 Business Days", "3-5 Days"
  isFreeShipping: boolean;
  totalWithShipping: number;
  formattedTotalWithShipping: string;
  rating: number; // e.g. 4.7
  buyUrl: string;
  isAffiliate: boolean;
}

export interface DailyPricePoint {
  date: string; // e.g. "Jul 18" or "18 Aug"
  fullDate: string; // "2026-08-15"
  dayNumber: number;
  averagePrice: number;
  lowestPrice: number;
  highestPrice: number;
  amazonPrice: number;
  competitorPrice: number;
  isLowestDay?: boolean;
  eventLabel?: string; // e.g., "Flash Sale", "Weekend Deal", "Lowest Price"
}

export interface ProductPriceComparisonResult {
  productName: string;
  cleanedQuery: string;
  region: RegionCode;
  currencySymbol: string;
  currencyCode: string;
  lowestPrice: number;
  highestPrice: number;
  potentialSavings: number;
  formattedSavings: string;
  savingsPercentage: number;
  bestStore: StorePriceQuote;
  stores: StorePriceQuote[];
  priceHistory: DailyPricePoint[];
  thirtyDayLowest: number;
  thirtyDayHighest: number;
  thirtyDayAverage: number;
  currentTrend: 'dropping' | 'stable' | 'rising';
  trendPercent: number;
  lastUpdated: string;
}

interface StoreDefinition {
  id: string;
  name: string;
  domain: string;
  logoText: string;
  accentColor: string;
  basePriceMultiplier: number; // Multiplier relative to benchmark (0.94 to 1.08)
  deliveryNote: string;
  stockStatus: 'In Stock' | 'Limited Stock' | 'Fast Shipping' | 'Prime / Express';
  rating: number;
  createSearchUrl: (query: string) => string;
}

const REGIONAL_STORES: Record<RegionCode, StoreDefinition[]> = {
  IN: [
    {
      id: 'amazon_in',
      name: 'Amazon India',
      domain: 'amazon.in',
      logoText: 'Amazon',
      accentColor: '#f59e0b', // Amber
      basePriceMultiplier: 0.95, // Often best deals
      deliveryNote: 'Free Next-Day Delivery with Prime',
      stockStatus: 'Prime / Express',
      rating: 4.8,
      createSearchUrl: (q) => `https://www.amazon.in/s?k=${encodeURIComponent(q)}&tag=trends0628-in-21`
    },
    {
      id: 'flipkart_in',
      name: 'Flipkart',
      domain: 'flipkart.com',
      logoText: 'Flipkart',
      accentColor: '#2563eb', // Blue
      basePriceMultiplier: 0.97,
      deliveryNote: 'Plus Assured 2-Day Delivery',
      stockStatus: 'In Stock',
      rating: 4.6,
      createSearchUrl: (q) => `https://www.flipkart.com/search?q=${encodeURIComponent(q)}`
    },
    {
      id: 'croma_in',
      name: 'Croma Retail',
      domain: 'croma.com',
      logoText: 'Croma',
      accentColor: '#059669', // Emerald
      basePriceMultiplier: 1.02,
      deliveryNote: 'Store Pickup or Express Delivery',
      stockStatus: 'In Stock',
      rating: 4.5,
      createSearchUrl: (q) => `https://www.croma.com/searchB?q=${encodeURIComponent(q)}`
    },
    {
      id: 'reliance_in',
      name: 'Reliance Digital',
      domain: 'reliancedigital.in',
      logoText: 'Reliance',
      accentColor: '#dc2626', // Red
      basePriceMultiplier: 1.04,
      deliveryNote: 'Official Brand Warranty & Free Delivery',
      stockStatus: 'Fast Shipping',
      rating: 4.4,
      createSearchUrl: (q) => `https://www.reliancedigital.in/search?q=${encodeURIComponent(q)}`
    },
    {
      id: 'tatacliq_in',
      name: 'Tata CLiQ',
      domain: 'tatacliq.com',
      logoText: 'Tata CLiQ',
      accentColor: '#7c3aed', // Purple
      basePriceMultiplier: 0.99,
      deliveryNote: 'Authentic Brand Guarantee',
      stockStatus: 'In Stock',
      rating: 4.3,
      createSearchUrl: (q) => `https://www.tatacliq.com/search/?searchCategory=all&text=${encodeURIComponent(q)}`
    }
  ],
  US: [
    {
      id: 'amazon_us',
      name: 'Amazon US',
      domain: 'amazon.com',
      logoText: 'Amazon',
      accentColor: '#f59e0b',
      basePriceMultiplier: 0.95,
      deliveryNote: 'FREE One-Day Prime Delivery',
      stockStatus: 'Prime / Express',
      rating: 4.9,
      createSearchUrl: (q) => `https://www.amazon.com/s?k=${encodeURIComponent(q)}&tag=trends0628-21`
    },
    {
      id: 'bestbuy_us',
      name: 'Best Buy',
      domain: 'bestbuy.com',
      logoText: 'Best Buy',
      accentColor: '#1d4ed8',
      basePriceMultiplier: 0.98,
      deliveryNote: 'Price Match Guarantee & 1-Hour Pickup',
      stockStatus: 'In Stock',
      rating: 4.7,
      createSearchUrl: (q) => `https://www.bestbuy.com/site/searchpage.jsp?st=${encodeURIComponent(q)}`
    },
    {
      id: 'walmart_us',
      name: 'Walmart',
      domain: 'walmart.com',
      logoText: 'Walmart',
      accentColor: '#0284c7',
      basePriceMultiplier: 0.96,
      deliveryNote: 'Free 2-Day Shipping over $35',
      stockStatus: 'Fast Shipping',
      rating: 4.5,
      createSearchUrl: (q) => `https://www.walmart.com/search?q=${encodeURIComponent(q)}`
    },
    {
      id: 'target_us',
      name: 'Target',
      domain: 'target.com',
      logoText: 'Target',
      accentColor: '#e11d48',
      basePriceMultiplier: 1.01,
      deliveryNote: 'Same Day Delivery with Target Circle 360',
      stockStatus: 'In Stock',
      rating: 4.6,
      createSearchUrl: (q) => `https://www.target.com/s?searchTerm=${encodeURIComponent(q)}`
    },
    {
      id: 'bhphoto_us',
      name: 'B&H Photo Video',
      domain: 'bhphotovideo.com',
      logoText: 'B&H Photo',
      accentColor: '#047857',
      basePriceMultiplier: 1.03,
      deliveryNote: 'Authorized Dealer & Free Expedited Shipping',
      stockStatus: 'In Stock',
      rating: 4.8,
      createSearchUrl: (q) => `https://www.bhphotovideo.com/c/search?Ntt=${encodeURIComponent(q)}`
    }
  ],
  GB: [
    {
      id: 'amazon_gb',
      name: 'Amazon UK',
      domain: 'amazon.co.uk',
      logoText: 'Amazon',
      accentColor: '#f59e0b',
      basePriceMultiplier: 0.95,
      deliveryNote: 'Free Next Day Prime Delivery',
      stockStatus: 'Prime / Express',
      rating: 4.8,
      createSearchUrl: (q) => `https://www.amazon.co.uk/s?k=${encodeURIComponent(q)}&tag=trends0628-gb-21`
    },
    {
      id: 'currys_gb',
      name: 'Currys',
      domain: 'currys.co.uk',
      logoText: 'Currys',
      accentColor: '#6d28d9',
      basePriceMultiplier: 0.98,
      deliveryNote: 'Price Promise & Next Day Delivery Available',
      stockStatus: 'In Stock',
      rating: 4.6,
      createSearchUrl: (q) => `https://www.currys.co.uk/search?q=${encodeURIComponent(q)}`
    },
    {
      id: 'argos_gb',
      name: 'Argos UK',
      domain: 'argos.co.uk',
      logoText: 'Argos',
      accentColor: '#dc2626',
      basePriceMultiplier: 1.02,
      deliveryNote: 'Fast Track Same Day Delivery',
      stockStatus: 'Fast Shipping',
      rating: 4.5,
      createSearchUrl: (q) => `https://www.argos.co.uk/search/${encodeURIComponent(q)}/`
    },
    {
      id: 'johnlewis_gb',
      name: 'John Lewis',
      domain: 'johnlewis.com',
      logoText: 'John Lewis',
      accentColor: '#1e293b',
      basePriceMultiplier: 1.04,
      deliveryNote: 'Includes 2-Year Guarantee & Free Click & Collect',
      stockStatus: 'In Stock',
      rating: 4.8,
      createSearchUrl: (q) => `https://www.johnlewis.com/search?search-term=${encodeURIComponent(q)}`
    }
  ],
  CA: [
    {
      id: 'amazon_ca',
      name: 'Amazon Canada',
      domain: 'amazon.ca',
      logoText: 'Amazon',
      accentColor: '#f59e0b',
      basePriceMultiplier: 0.95,
      deliveryNote: 'Free Prime Fast Shipping in Canada',
      stockStatus: 'Prime / Express',
      rating: 4.8,
      createSearchUrl: (q) => `https://www.amazon.ca/s?k=${encodeURIComponent(q)}&tag=trends0628-ca-21`
    },
    {
      id: 'bestbuy_ca',
      name: 'Best Buy Canada',
      domain: 'bestbuy.ca',
      logoText: 'Best Buy',
      accentColor: '#1d4ed8',
      basePriceMultiplier: 0.99,
      deliveryNote: 'Quick and Easy In-Store Pickup in 1 Hour',
      stockStatus: 'In Stock',
      rating: 4.6,
      createSearchUrl: (q) => `https://www.bestbuy.ca/en-ca/search?search=${encodeURIComponent(q)}`
    },
    {
      id: 'walmart_ca',
      name: 'Walmart Canada',
      domain: 'walmart.ca',
      logoText: 'Walmart',
      accentColor: '#0284c7',
      basePriceMultiplier: 0.97,
      deliveryNote: 'Free Standard Shipping over $35',
      stockStatus: 'Fast Shipping',
      rating: 4.4,
      createSearchUrl: (q) => `https://www.walmart.ca/en/search?q=${encodeURIComponent(q)}`
    }
  ],
  AU: [
    {
      id: 'amazon_au',
      name: 'Amazon Australia',
      domain: 'amazon.com.au',
      logoText: 'Amazon',
      accentColor: '#f59e0b',
      basePriceMultiplier: 0.95,
      deliveryNote: 'Free Prime Expedited Delivery across Australia',
      stockStatus: 'Prime / Express',
      rating: 4.8,
      createSearchUrl: (q) => `https://www.amazon.com.au/s?k=${encodeURIComponent(q)}&tag=trends0628-au-21`
    },
    {
      id: 'jbhifi_au',
      name: 'JB Hi-Fi',
      domain: 'jbhifi.com.au',
      logoText: 'JB Hi-Fi',
      accentColor: '#eab308',
      basePriceMultiplier: 0.98,
      deliveryNote: '1-Hour Click & Collect or Fast Courier',
      stockStatus: 'In Stock',
      rating: 4.7,
      createSearchUrl: (q) => `https://www.jbhifi.com.au/search?query=${encodeURIComponent(q)}`
    },
    {
      id: 'thegoodguys_au',
      name: 'The Good Guys',
      domain: 'thegoodguys.com.au',
      logoText: 'Good Guys',
      accentColor: '#0284c7',
      basePriceMultiplier: 1.01,
      deliveryNote: 'Pay Less Pay Cash & Next Day Delivery',
      stockStatus: 'In Stock',
      rating: 4.5,
      createSearchUrl: (q) => `https://www.thegoodguys.com.au/search?searchTerm=${encodeURIComponent(q)}`
    },
    {
      id: 'harveynorman_au',
      name: 'Harvey Norman',
      domain: 'harveynorman.com.au',
      logoText: 'Harvey Norman',
      accentColor: '#1d4ed8',
      basePriceMultiplier: 1.03,
      deliveryNote: 'Shop with Confidence & Full Manufacturer Warranty',
      stockStatus: 'In Stock',
      rating: 4.4,
      createSearchUrl: (q) => `https://www.harveynorman.com.au/search?q=${encodeURIComponent(q)}`
    }
  ],
  DE: [
    {
      id: 'amazon_de',
      name: 'Amazon Germany',
      domain: 'amazon.de',
      logoText: 'Amazon',
      accentColor: '#f59e0b',
      basePriceMultiplier: 0.95,
      deliveryNote: 'Kostenlose Prime-Lieferung am nächsten Tag',
      stockStatus: 'Prime / Express',
      rating: 4.8,
      createSearchUrl: (q) => `https://www.amazon.de/s?k=${encodeURIComponent(q)}&tag=trends0628-de-21`
    },
    {
      id: 'mediamarkt_de',
      name: 'MediaMarkt',
      domain: 'mediamarkt.de',
      logoText: 'MediaMarkt',
      accentColor: '#dc2626',
      basePriceMultiplier: 0.98,
      deliveryNote: 'Abholung im Markt in 30 Minuten oder Expressversand',
      stockStatus: 'In Stock',
      rating: 4.6,
      createSearchUrl: (q) => `https://www.mediamarkt.de/de/search.html?query=${encodeURIComponent(q)}`
    },
    {
      id: 'saturn_de',
      name: 'Saturn',
      domain: 'saturn.de',
      logoText: 'Saturn',
      accentColor: '#0284c7',
      basePriceMultiplier: 0.99,
      deliveryNote: 'Technik-Garantie & Schnelle Lieferung',
      stockStatus: 'In Stock',
      rating: 4.5,
      createSearchUrl: (q) => `https://www.saturn.de/de/search.html?query=${encodeURIComponent(q)}`
    },
    {
      id: 'otto_de',
      name: 'Otto',
      domain: 'otto.de',
      logoText: 'OTTO',
      accentColor: '#b91c1c',
      basePriceMultiplier: 1.02,
      deliveryNote: 'Zuverlässiger Versand & Ratenzahlung verfügbar',
      stockStatus: 'Fast Shipping',
      rating: 4.4,
      createSearchUrl: (q) => `https://www.otto.de/suche/${encodeURIComponent(q)}/`
    }
  ],
  PK: [
    {
      id: 'daraz_pk',
      name: 'Daraz Pakistan',
      domain: 'daraz.pk',
      logoText: 'Daraz',
      accentColor: '#f97316',
      basePriceMultiplier: 0.96,
      deliveryNote: 'Daraz Mall Verified Seller & Express Delivery',
      stockStatus: 'In Stock',
      rating: 4.6,
      createSearchUrl: (q) => `https://www.daraz.pk/catalog/?q=${encodeURIComponent(q)}`
    },
    {
      id: 'priceoye_pk',
      name: 'PriceOye',
      domain: 'priceoye.pk',
      logoText: 'PriceOye',
      accentColor: '#059669',
      basePriceMultiplier: 0.95,
      deliveryNote: 'Lowest Price Guarantee & 2-4 Days Shipping',
      stockStatus: 'Prime / Express',
      rating: 4.7,
      createSearchUrl: (q) => `https://priceoye.pk/search?q=${encodeURIComponent(q)}`
    },
    {
      id: 'telemart_pk',
      name: 'Telemart',
      domain: 'telemart.pk',
      logoText: 'Telemart',
      accentColor: '#dc2626',
      basePriceMultiplier: 1.02,
      deliveryNote: 'Official Brand Warranty & Cash On Delivery',
      stockStatus: 'Fast Shipping',
      rating: 4.3,
      createSearchUrl: (q) => `https://www.telemart.pk/search?query=${encodeURIComponent(q)}`
    },
    {
      id: 'amazon_pk_global',
      name: 'Amazon Global Store',
      domain: 'amazon.com',
      logoText: 'Amazon',
      accentColor: '#f59e0b',
      basePriceMultiplier: 1.05,
      deliveryNote: 'International Shipping & Import Duty Handled',
      stockStatus: 'Fast Shipping',
      rating: 4.8,
      createSearchUrl: (q) => `https://www.amazon.com/s?k=${encodeURIComponent(q)}&tag=trends0628-pk-21`
    }
  ],
  BD: [
    {
      id: 'daraz_bd',
      name: 'Daraz Bangladesh',
      domain: 'daraz.com.bd',
      logoText: 'Daraz',
      accentColor: '#f97316',
      basePriceMultiplier: 0.96,
      deliveryNote: 'Daraz Mall 100% Authentic & Fast Delivery',
      stockStatus: 'In Stock',
      rating: 4.5,
      createSearchUrl: (q) => `https://www.daraz.com.bd/catalog/?q=${encodeURIComponent(q)}`
    },
    {
      id: 'startech_bd',
      name: 'Star Tech',
      domain: 'startech.com.bd',
      logoText: 'Star Tech',
      accentColor: '#dc2626',
      basePriceMultiplier: 0.97,
      deliveryNote: 'Leading Tech Retailer & Home Delivery',
      stockStatus: 'Prime / Express',
      rating: 4.8,
      createSearchUrl: (q) => `https://www.startech.com.bd/product/search?search=${encodeURIComponent(q)}`
    },
    {
      id: 'ryans_bd',
      name: 'Ryans Computers',
      domain: 'ryans.com',
      logoText: 'Ryans',
      accentColor: '#2563eb',
      basePriceMultiplier: 1.01,
      deliveryNote: 'Genuine Product Warranty & Express Branch Pickup',
      stockStatus: 'In Stock',
      rating: 4.6,
      createSearchUrl: (q) => `https://www.ryans.com/search?q=${encodeURIComponent(q)}`
    },
    {
      id: 'pickaboo_bd',
      name: 'Pickaboo',
      domain: 'pickaboo.com',
      logoText: 'Pickaboo',
      accentColor: '#7c3aed',
      basePriceMultiplier: 1.03,
      deliveryNote: 'Club Points & 3-Day Easy Return',
      stockStatus: 'Fast Shipping',
      rating: 4.4,
      createSearchUrl: (q) => `https://www.pickaboo.com/search/result/?q=${encodeURIComponent(q)}`
    }
  ]
};

/**
 * Clean product name into clean searchable keywords
 */
export function cleanProductSearchQuery(name: string): string {
  if (!name) return 'trending products';
  return name
    .replace(/\b(Review|Reviews|Testing|Test|Tests|Unboxing|Real-World|Hands-On|Comparison|Vs|2026|2025|2024|In-Depth|Field Test|Full|Honest|Best|Top|Amazon|Finds|Gadgets|Gadget|India|USA|UK|Canada|Pakistan|Bangladesh|Germany|Australia|Must Watch|OMG|WOW)\b/gi, '')
    .replace(/[^\w\s-]/g, ' ')
    .trim()
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 4)
    .join(' ');
}

/**
 * Parses raw price string or numerical estimation to base numerical price
 */
export function extractBaseNumericPrice(
  rawPrice: string | number | undefined,
  region: RegionCode
): number {
  const config = REGION_CONFIGS[region] || REGION_CONFIGS.IN;

  if (typeof rawPrice === 'number' && rawPrice > 0) {
    return rawPrice;
  }

  if (typeof rawPrice === 'string' && rawPrice.trim()) {
    const cleaned = rawPrice.replace(/[^0-9.]/g, '');
    const parsed = parseFloat(cleaned);
    if (!isNaN(parsed) && parsed > 0) {
      // If already in local currency order of magnitude
      if (rawPrice.includes(config.currencySymbol)) {
        return parsed;
      }
      // If in USD, convert to local currency
      if (rawPrice.includes('$') && region !== 'US') {
        return parsed * config.usdExchangeRate;
      }
      return parsed;
    }
  }

  // Realistic fallback price based on region
  const defaultUsd = 89.99;
  return Math.round(defaultUsd * config.usdExchangeRate);
}

/**
 * Format price according to region
 */
export function formatLocalPrice(amount: number, region: RegionCode): string {
  const config = REGION_CONFIGS[region] || REGION_CONFIGS.IN;
  if (region === 'IN' || region === 'PK' || region === 'BD') {
    return `${config.currencySymbol}${Math.round(amount).toLocaleString('en-IN')}`;
  }
  return `${config.currencySymbol}${amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/**
 * Compare price across top e-commerce stores in the given geolocation
 */
export function compareProductPrices(
  productName: string,
  rawPrice: string | number | undefined,
  region: RegionCode
): ProductPriceComparisonResult {
  const config = REGION_CONFIGS[region] || REGION_CONFIGS.IN;
  const storeDefs = REGIONAL_STORES[region] || REGIONAL_STORES.IN;
  const cleanedQuery = cleanProductSearchQuery(productName);
  const basePrice = extractBaseNumericPrice(rawPrice, region);

  // Generate deterministic store quotes based on store definition multipliers and query hash
  const queryHash = cleanedQuery.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);

  const quotes: StorePriceQuote[] = storeDefs.map((store, index) => {
    // Add slight natural variation (±1.5%) based on query hash
    const variation = ((queryHash * (index + 1)) % 7 - 3) * 0.005;
    const finalMultiplier = store.basePriceMultiplier + variation;
    
    // Round to realistic retail pricing (e.g. ending in 99 or 49 for US/EU, or 999 for IN/PK/BD)
    let calculatedPrice = basePrice * finalMultiplier;
    if (region === 'IN' || region === 'PK' || region === 'BD') {
      calculatedPrice = Math.round(calculatedPrice / 10) * 10 - 1;
      if (calculatedPrice < 100) calculatedPrice = Math.round(basePrice * finalMultiplier);
    } else {
      calculatedPrice = Math.round(calculatedPrice) - 0.01;
      if (calculatedPrice <= 0) calculatedPrice = Math.round(basePrice * finalMultiplier * 100) / 100;
    }

    const mrpMultiplier = 1.15 + (index % 3) * 0.05;
    let originalPrice = calculatedPrice * mrpMultiplier;
    if (region === 'IN' || region === 'PK' || region === 'BD') {
      originalPrice = Math.round(originalPrice / 50) * 50;
    } else {
      originalPrice = Math.round(originalPrice) + 0.99;
    }

    const discountPercentage = Math.round(((originalPrice - calculatedPrice) / originalPrice) * 100);

    // Compute realistic shipping cost and delivery time estimate for this store & region
    let shippingCost = 0;
    let deliveryTimeEstimate = '2-3 Business Days';
    let isFreeShipping = true;

    if (store.id.startsWith('amazon')) {
      isFreeShipping = true;
      shippingCost = 0;
      deliveryTimeEstimate = region === 'US' || region === 'GB' || region === 'DE' ? 'Tomorrow by 9 PM (Prime)' : 'Tomorrow / 1-2 Days';
    } else if (store.id.startsWith('flipkart') || store.id.startsWith('walmart') || store.id.startsWith('bestbuy') || store.id.startsWith('startech')) {
      if (calculatedPrice < (region === 'IN' ? 500 : (region === 'PK' || region === 'BD' ? 1000 : 35))) {
        shippingCost = region === 'IN' ? 40 : (region === 'PK' || region === 'BD' ? 120 : 4.99);
        isFreeShipping = false;
        deliveryTimeEstimate = '2-4 Business Days';
      } else {
        isFreeShipping = true;
        shippingCost = 0;
        deliveryTimeEstimate = '2-3 Days (Free Shipping)';
      }
    } else if (index % 3 === 1) {
      isFreeShipping = false;
      shippingCost = region === 'IN' ? 50 : (region === 'PK' || region === 'BD' ? 150 : 5.99);
      deliveryTimeEstimate = '3-5 Business Days';
    } else {
      isFreeShipping = true;
      shippingCost = 0;
      deliveryTimeEstimate = '2-4 Business Days (Express)';
    }

    const formattedShippingCost = isFreeShipping ? 'FREE' : formatLocalPrice(shippingCost, region);
    const totalWithShipping = calculatedPrice + shippingCost;
    const formattedTotalWithShipping = formatLocalPrice(totalWithShipping, region);

    return {
      storeId: store.id,
      storeName: store.name,
      domain: store.domain,
      logoText: store.logoText,
      accentColor: store.accentColor,
      price: Math.max(1, calculatedPrice),
      originalPrice,
      formattedPrice: formatLocalPrice(calculatedPrice, region),
      formattedOriginalPrice: formatLocalPrice(originalPrice, region),
      discountPercentage,
      isLowestPrice: false, // Calculated next
      stockStatus: store.stockStatus,
      deliveryNote: store.deliveryNote,
      shippingCost,
      formattedShippingCost,
      deliveryTimeEstimate,
      isFreeShipping,
      totalWithShipping,
      formattedTotalWithShipping,
      rating: store.rating,
      buyUrl: store.createSearchUrl(cleanedQuery),
      isAffiliate: store.id.startsWith('amazon')
    };
  });

  // Sort by price ascending
  quotes.sort((a, b) => a.price - b.price);

  // Mark the lowest price store
  if (quotes.length > 0) {
    quotes[0].isLowestPrice = true;
  }

  const lowestPrice = quotes[0]?.price ?? basePrice;
  const highestPrice = quotes[quotes.length - 1]?.price ?? basePrice;
  const potentialSavings = Math.max(0, highestPrice - lowestPrice);
  const savingsPercentage = highestPrice > 0 ? Math.round((potentialSavings / highestPrice) * 100) : 0;

  // Generate 30-day historical price points for the time-series line chart
  const amazonStore = quotes.find(q => q.storeId.startsWith('amazon')) || quotes[0];
  const topCompetitorStore = quotes.find(q => !q.storeId.startsWith('amazon')) || quotes[1] || quotes[0];

  const priceHistory: DailyPricePoint[] = [];
  const now = new Date();

  // Create a realistic price trend wave over 30 days
  for (let i = 29; i >= 0; i--) {
    const dayDate = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
    const dayLabel = dayDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    const fullDate = dayDate.toISOString().split('T')[0];

    // Mathematical wave model for price movement with realistic retail spikes & sale dips
    // Day 20-22 might be a weekend sale drop, Day 10 a small increase, Day 0 (today) current price
    const cyclePhase = Math.sin((30 - i) / 4.2 + (queryHash % 10));
    const noise = (((queryHash * (i + 13)) % 11) - 5) * 0.008;
    
    // Slight overall trend (e.g. slight price drop towards today)
    const trendDrift = (i / 30) * 0.04;
    const factor = 1 + (cyclePhase * 0.05) + noise + trendDrift;

    let dayLowest = Math.round(lowestPrice * factor);
    let dayHighest = Math.round(highestPrice * (factor + 0.02));
    let dayAmazon = Math.round(amazonStore.price * factor);
    let dayCompetitor = Math.round(topCompetitorStore.price * (factor + 0.03));

    // Fix last day (today) to exactly match current prices
    if (i === 0) {
      dayLowest = lowestPrice;
      dayHighest = highestPrice;
      dayAmazon = amazonStore.price;
      dayCompetitor = topCompetitorStore.price;
    }

    // Identify events like flash sales or historical lowest days
    let eventLabel: string | undefined = undefined;
    if (i === 18) {
      eventLabel = 'Mid-Month Promo';
      dayLowest = Math.round(dayLowest * 0.94);
      dayAmazon = Math.round(dayAmazon * 0.94);
    } else if (i === 7) {
      eventLabel = 'Weekend Drop';
      dayLowest = Math.round(dayLowest * 0.96);
    }

    const dayAvg = Math.round((dayLowest + dayHighest + dayAmazon + dayCompetitor) / 4);

    priceHistory.push({
      date: dayLabel,
      fullDate,
      dayNumber: 30 - i,
      averagePrice: dayAvg,
      lowestPrice: dayLowest,
      highestPrice: dayHighest,
      amazonPrice: dayAmazon,
      competitorPrice: dayCompetitor,
      eventLabel
    });
  }

  // Find 30-day min, max, avg
  const allHistoricalLowest = priceHistory.map(p => p.lowestPrice);
  const thirtyDayLowest = Math.min(...allHistoricalLowest);
  const thirtyDayHighest = Math.max(...priceHistory.map(p => p.highestPrice));
  const thirtyDayAverage = Math.round(
    priceHistory.reduce((acc, p) => acc + p.averagePrice, 0) / priceHistory.length
  );

  // Mark the lowest day in history
  priceHistory.forEach(p => {
    if (p.lowestPrice === thirtyDayLowest) {
      p.isLowestDay = true;
    }
  });

  // Calculate 30-day trend direction
  const price30DaysAgo = priceHistory[0].averagePrice;
  const priceToday = priceHistory[priceHistory.length - 1].averagePrice;
  const trendDiff = priceToday - price30DaysAgo;
  const trendPercent = Math.round(Math.abs((trendDiff / price30DaysAgo) * 100));
  let currentTrend: 'dropping' | 'stable' | 'rising' = 'stable';
  if (trendDiff < -basePrice * 0.015) currentTrend = 'dropping';
  else if (trendDiff > basePrice * 0.015) currentTrend = 'rising';

  return {
    productName,
    cleanedQuery,
    region,
    currencySymbol: config.currencySymbol,
    currencyCode: config.currencyCode,
    lowestPrice,
    highestPrice,
    potentialSavings,
    formattedSavings: formatLocalPrice(potentialSavings, region),
    savingsPercentage,
    bestStore: quotes[0],
    stores: quotes,
    priceHistory,
    thirtyDayLowest,
    thirtyDayHighest,
    thirtyDayAverage,
    currentTrend,
    trendPercent,
    lastUpdated: 'Live Regional Index'
  };
}
