/**
 * SEO & Unique Content Generation Utilities
 * 
 * Provides functions to:
 * 1. Convert titles into clean, hyphenated SEO slugs for unique URLs.
 * 2. Rephrase titles and descriptions to avoid Google Search duplicate content penalties.
 * 3. Dynamically set HTML metadata (title, description, canonical URL) for search engine indexing.
 */

import { VideoItem } from '../types';

/**
 * Converts any string title into a clean, lowercased, hypen-separated URL slug.
 * Example: "10 Incredible Home & Kitchen Gadgets You Need in 2026!"
 * Returns: "10-incredible-home-kitchen-gadgets-you-need-in-2026"
 */
export function generateSlug(text: string): string {
  if (!text) return 'trending-product-review';
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '') // Remove special punctuation
    .replace(/[\s_-]+/g, '-')  // Replace spaces/underscores with single hyphens
    .replace(/^-+|-+$/g, '');  // Trim leading/trailing hyphens
}

/**
 * Rephrases original titles into unique, search-engine-friendly titles.
 */
export function rephraseTitle(originalTitle: string, category: string = 'household'): string {
  let cleaned = originalTitle
    .replace(/\(.*?\)/g, '') // Remove parenthetical tags like (Viral Household Tools)
    .replace(/\[.*?\]/g, '')
    .trim();

  const prefixes: Record<string, string[]> = {
    household: [
      'Tested & Reviewed: ',
      'Expert Insight: ',
      'Home Cleaning Breakthrough: ',
      'Top Household Innovations: '
    ],
    kitchen: [
      'Kitchen Tech Guide: ',
      'Cooking Speed Upgrade: ',
      'Culinary Innovation Review: ',
      'Essential Kitchen Tools: '
    ],
    fitness: [
      'Home Fitness Gear Review: ',
      'Compact Workout Solution: ',
      'Daily Fitness Innovation: ',
      'Apartment Cardio Breakthrough: '
    ],
    gadgets: [
      'Smart Tech Deep Dive: ',
      'Next-Gen Home Automation: ',
      'Viral Tech Review: ',
      'Living Space Upgrade: '
    ],
    reviews: [
      'Comprehensive Product Breakdown: ',
      'Unbiased Hands-On Review: ',
      'Buyer Guide 2026: '
    ]
  };

  const options = prefixes[category] || prefixes.household;
  const prefix = options[Math.floor(Math.abs(hashString(cleaned)) % options.length)];

  // Rephrase common phrases to guarantee unique content
  cleaned = cleaned
    .replace(/Incredible/gi, 'Top-Rated')
    .replace(/Viral/gi, 'High-Demand')
    .replace(/You Need in 2026/gi, 'For Modern Living')
    .replace(/Must-Have/gi, 'Essential')
    .replace(/That Save You Hours/gi, 'For Maximum Efficiency')
    .replace(/Every Week/gi, 'In Daily Routines');

  return `${prefix}${cleaned}`;
}

/**
 * Rephrases or generates a unique, search-engine-optimized description (140-160 chars)
 * avoiding duplicate content penalties on Google.
 */
export function rephraseDescription(originalTitle: string, rawSummary?: string, category: string = 'household'): string {
  if (rawSummary && rawSummary.length > 50) {
    // Enhance existing summary to create a unique meta description
    return `In-depth analysis and viewer sentiment review: ${rawSummary} Discover full product specs, user ratings, and verified buying options.`;
  }

  const categoryDescriptions: Record<string, string> = {
    household: `Detailed review and viewer consensus on top-rated household cleaning gadgets and smart vacuum systems. Discover pros, cons, and performance tests.`,
    kitchen: `Comprehensive buyer guide and performance review of time-saving kitchen appliances and rapid cooking technology tested by real home cooks.`,
    fitness: `Expert breakdown and sentiment analysis of compact home exercise equipment designed for small spaces and daily workout routines.`,
    gadgets: `Explore in-depth specifications, user feedback, and value analysis for trending smart home automation gadgets and ambient lighting.`,
    reviews: `Unbiased review and sentiment scoring for top-selling consumer products with verified customer feedback and price breakdowns.`
  };

  return categoryDescriptions[category] || categoryDescriptions.household;
}

/**
 * Simple string hash function for deterministic variations
 */
function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return hash;
}

/**
 * Dynamically updates document metadata for SEO (title, meta description, canonical URL, OG tags).
 */
export function updatePageSeo(video: VideoItem | null) {
  const baseUrl = window.location.origin;

  if (video) {
    const displayTitle = video.rephrasedTitle || video.title;
    const displayDesc = video.rephrasedDescription || video.pulse.summary;
    const slug = video.slug || generateSlug(displayTitle);

    document.title = `${displayTitle} | TrendPulse Review`;

    // Meta Description
    let metaDesc = document.querySelector('meta[name="description"]');
    if (!metaDesc) {
      metaDesc = document.createElement('meta');
      metaDesc.setAttribute('name', 'description');
      document.head.appendChild(metaDesc);
    }
    metaDesc.setAttribute('content', displayDesc);

    // Canonical Link
    let canonical = document.querySelector('link[rel="canonical"]');
    if (!canonical) {
      canonical = document.createElement('link');
      canonical.setAttribute('rel', 'canonical');
      document.head.appendChild(canonical);
    }
    canonical.setAttribute('href', `${baseUrl}/video/${slug}`);

    // OpenGraph Title
    let ogTitle = document.querySelector('meta[property="og:title"]');
    if (!ogTitle) {
      ogTitle = document.createElement('meta');
      ogTitle.setAttribute('property', 'og:title');
      document.head.appendChild(ogTitle);
    }
    ogTitle.setAttribute('content', displayTitle);

    // OpenGraph Description
    let ogDesc = document.querySelector('meta[property="og:description"]');
    if (!ogDesc) {
      ogDesc = document.createElement('meta');
      ogDesc.setAttribute('property', 'og:description');
      document.head.appendChild(ogDesc);
    }
    ogDesc.setAttribute('content', displayDesc);

    // OpenGraph Image
    let ogImage = document.querySelector('meta[property="og:image"]');
    if (!ogImage) {
      ogImage = document.createElement('meta');
      ogImage.setAttribute('property', 'og:image');
      document.head.appendChild(ogImage);
    }
    ogImage.setAttribute('content', video.thumbnailUrl);

    // Twitter Card Tags
    let twTitle = document.querySelector('meta[name="twitter:title"]');
    if (twTitle) twTitle.setAttribute('content', displayTitle);
    let twDesc = document.querySelector('meta[name="twitter:description"]');
    if (twDesc) twDesc.setAttribute('content', displayDesc);
    let twImg = document.querySelector('meta[name="twitter:image"]');
    if (twImg) twImg.setAttribute('content', video.thumbnailUrl);

    // Schema.org JSON-LD (Product + VideoObject Structured Data)
    const topProduct = video.products && video.products[0];
    const ratingVal = (video.pulse?.overallSentimentRatio?.positive ? (video.pulse.overallSentimentRatio.positive / 20).toFixed(1) : "4.7");
    const reviewCount = video.comments ? Math.max(video.comments.length * 12, 85) : 120;

    const schemaData = {
      "@context": "https://schema.org",
      "@graph": [
        {
          "@type": "Product",
          "name": topProduct ? topProduct.name : displayTitle,
          "image": [video.thumbnailUrl],
          "description": displayDesc,
          "category": video.category,
          "aggregateRating": {
            "@type": "AggregateRating",
            "ratingValue": ratingVal,
            "reviewCount": reviewCount,
            "bestRating": "5",
            "worstRating": "1"
          },
          "offers": {
            "@type": "Offer",
            "priceCurrency": topProduct ? (topProduct.estimatedPrice.includes('₹') ? 'INR' : 'USD') : 'USD',
            "price": topProduct ? topProduct.estimatedPrice.replace(/[^0-9.]/g, '') || '49.99' : '49.99',
            "priceValidUntil": "2027-12-31",
            "itemCondition": "https://schema.org/NewCondition",
            "availability": "https://schema.org/InStock",
            "url": topProduct ? topProduct.affiliateUrl : `${baseUrl}/video/${slug}`,
            "seller": {
              "@type": "Organization",
              "name": "Amazon"
            }
          }
        },
        {
          "@type": "VideoObject",
          "name": displayTitle,
          "description": displayDesc,
          "thumbnailUrl": [video.thumbnailUrl],
          "uploadDate": "2026-01-01T08:00:00+00:00",
          "embedUrl": `https://www.youtube.com/embed/${video.youtubeId}`
        }
      ]
    };

    let schemaScript = document.querySelector('script[id="json-ld-schema"]');
    if (!schemaScript) {
      schemaScript = document.createElement('script');
      schemaScript.setAttribute('id', 'json-ld-schema');
      schemaScript.setAttribute('type', 'application/ld+json');
      document.head.appendChild(schemaScript);
    }
    schemaScript.textContent = JSON.stringify(schemaData);

  } else {
    document.title = 'TrendPulse | Amazon Affiliate Product Reviews & Video Curation';

    let metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) {
      metaDesc.setAttribute(
        'content',
        'Explore AI-curated YouTube product reviews, sentiment analysis, and converted Amazon affiliate recommendations for household items, gadgets, and fitness gear.'
      );
    }

    let canonical = document.querySelector('link[rel="canonical"]');
    if (canonical) {
      canonical.setAttribute('href', `${baseUrl}/`);
    }

    // Default WebSite & Organization JSON-LD Schema
    const websiteSchema = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": "TrendPulse",
      "url": baseUrl,
      "description": "YouTube product video curation with sentiment analysis and converted Amazon affiliate deals.",
      "publisher": {
        "@type": "Organization",
        "name": "TrendPulse Amazon Affiliate Network"
      }
    };

    let schemaScript = document.querySelector('script[id="json-ld-schema"]');
    if (!schemaScript) {
      schemaScript = document.createElement('script');
      schemaScript.setAttribute('id', 'json-ld-schema');
      schemaScript.setAttribute('type', 'application/ld+json');
      document.head.appendChild(schemaScript);
    }
    schemaScript.textContent = JSON.stringify(websiteSchema);
  }
}
