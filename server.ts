import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // Dynamic robots.txt
  app.get("/robots.txt", (req, res) => {
    const host = req.headers.host || "of.owncircles.com";
    const protocol = req.headers["x-forwarded-proto"] || "https";
    res.type("text/plain");
    res.send(`User-agent: *
Allow: /
Disallow: /api/
Disallow: /api_mysql.php

Sitemap: ${protocol}://${host}/sitemap.xml
`);
  });

  // Dynamic sitemap.xml with host awareness
  app.get("/sitemap.xml", (req, res) => {
    const host = req.headers.host || "of.owncircles.com";
    const protocol = req.headers["x-forwarded-proto"] || "https";
    const baseUrl = `${protocol}://${host}`;
    const now = new Date().toISOString();

    const categories = [
      "electronics",
      "kitchen",
      "household",
      "fitness",
      "gadgets",
      "home_office",
      "personal_care",
      "travel_outdoor"
    ];

    let xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${baseUrl}/</loc>
    <lastmod>${now}</lastmod>
    <changefreq>hourly</changefreq>
    <priority>1.0</priority>
  </url>
  <url>
    <loc>${baseUrl}/base64-encoder-decoder</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/yaml-converter</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>
  <url>
    <loc>${baseUrl}/csv-to-json</loc>
    <lastmod>${now}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.9</priority>
  </url>
`;

    for (const cat of categories) {
      xml += `  <url>
    <loc>${baseUrl}/?category=${cat}</loc>
    <lastmod>${now}</lastmod>
    <changefreq>daily</changefreq>
    <priority>0.8</priority>
  </url>
`;
    }

    xml += `</urlset>`;
    res.type("application/xml");
    res.setHeader("Cache-Control", "public, max-age=3600");
    res.send(xml);
  });

  // Server-side Gemini API client initialization with lazy getter
  let aiClient: GoogleGenAI | null = null;
  function getGenAIClient(): GoogleGenAI {
    if (!aiClient) {
      aiClient = new GoogleGenAI({
        apiKey: process.env.GEMINI_API_KEY,
        httpOptions: {
          headers: {
            'User-Agent': 'aistudio-build',
          }
        }
      });
    }
    return aiClient;
  }

  // Health check endpoint
  app.get("/api/health", (req, res) => {
    res.json({ status: "ok", timestamp: new Date().toISOString() });
  });

  // Interpret 30-day Price Trend using Gemini 3.7 Flash API
  app.post("/api/gemini/interpret-price-trend", async (req, res) => {
    try {
      const { 
        productName, 
        region, 
        currencySymbol, 
        currentLowestPrice, 
        thirtyDayLowest, 
        thirtyDayHighest, 
        thirtyDayAverage, 
        currentTrend, 
        trendPercent,
        priceHistorySample
      } = req.body;

      if (!productName) {
        return res.status(400).json({ error: "productName is required" });
      }

      // Check if API key is provided
      if (!process.env.GEMINI_API_KEY) {
        // Provide intelligent fallback if key is unconfigured
        const fallbackSummary = generateFallbackInterpretation({
          productName,
          region,
          currencySymbol,
          currentLowestPrice,
          thirtyDayLowest,
          thirtyDayHighest,
          thirtyDayAverage,
          currentTrend,
          trendPercent
        });
        return res.json({ 
          summary: fallbackSummary.summary, 
          actionableAdvice: fallbackSummary.actionableAdvice,
          verdict: fallbackSummary.verdict,
          savingsPotential: fallbackSummary.savingsPotential,
          confidence: "High (Algorithmic)"
        });
      }

      const ai = getGenAIClient();

      const prompt = `You are an expert e-commerce market price analyst. Analyze the following 30-day price trend for the product and provide a clear, concise, data-driven summary and buying recommendation.

Product: ${productName}
Region: ${region || 'Global'}
Currency: ${currencySymbol || '$'}
Current Best Price: ${currencySymbol}${currentLowestPrice}
30-Day Historical Low: ${currencySymbol}${thirtyDayLowest}
30-Day Historical High: ${currencySymbol}${thirtyDayHighest}
30-Day Historical Average: ${currencySymbol}${thirtyDayAverage}
Calculated 30-Day Trend: ${currentTrend} (${trendPercent}% change)
Recent Price Movement Snapshot: ${JSON.stringify(priceHistorySample || [])}

Provide your response in JSON format with exactly these fields:
- summary: A clear 2-3 sentence explanation interpreting the 30-day price trend (e.g., "Price is currently trending downward by ${trendPercent}% over the last 30 days..."). Explicitly state if the price is dropping, steady, or rising, and how the current price compares to the 30-day low and average.
- actionableAdvice: A concise buying recommendation (e.g., "Strong Buy - Current price is within 2% of the 30-day lowest record" or "Wait - Price is currently above the 30-day average and trending upwards").
- verdict: One of ["STRONG_BUY", "GOOD_DEAL", "FAIR_PRICE", "WAIT_FOR_DROP"]
- savingsPotential: A brief statement on estimated discount or savings vs recent peak.`;

      const response = await ai.models.generateContent({
        model: "gemini-3.7-flash",
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          temperature: 0.2,
        },
      });

      const responseText = response.text || "{}";
      const parsedData = JSON.parse(responseText);

      return res.json({
        summary: parsedData.summary || `Price is currently ${currentTrend} (${trendPercent}% in the last 30 days) and currently priced at ${currencySymbol}${currentLowestPrice}.`,
        actionableAdvice: parsedData.actionableAdvice || `Current price of ${currencySymbol}${currentLowestPrice} is close to the 30-day low of ${currencySymbol}${thirtyDayLowest}.`,
        verdict: parsedData.verdict || (currentLowestPrice <= thirtyDayLowest * 1.03 ? "STRONG_BUY" : "GOOD_DEAL"),
        savingsPotential: parsedData.savingsPotential || `Save compared to 30-day high of ${currencySymbol}${thirtyDayHighest}`,
        confidence: "AI Generated"
      });
    } catch (error: any) {
      console.error("Error generating price trend interpretation:", error);
      // Fallback gracefully on model/network error
      const {
        productName = "this product",
        currencySymbol = "$",
        currentLowestPrice = 0,
        thirtyDayLowest = 0,
        thirtyDayHighest = 0,
        thirtyDayAverage = 0,
        currentTrend = "stable",
        trendPercent = 0
      } = req.body || {};

      const fallback = generateFallbackInterpretation({
        productName,
        region: req.body?.region || "Global",
        currencySymbol,
        currentLowestPrice,
        thirtyDayLowest,
        thirtyDayHighest,
        thirtyDayAverage,
        currentTrend,
        trendPercent
      });

      return res.json({
        summary: fallback.summary,
        actionableAdvice: fallback.actionableAdvice,
        verdict: fallback.verdict,
        savingsPotential: fallback.savingsPotential,
        confidence: "Algorithmic Fallback"
      });
    }
  });

  // Helper to serve index.html with dynamically adapted host canonical & meta tags
  const renderIndexHtml = (req: express.Request, res: express.Response, rawHtml: string) => {
    const host = req.headers.host || "of.owncircles.com";
    const protocol = req.headers["x-forwarded-proto"] || "https";
    const currentOrigin = `${protocol}://${host}`;
    const cleanPath = req.path === "/" ? "" : req.path;
    const fullCanonicalUrl = `${currentOrigin}${cleanPath}`;

    let customizedHtml = rawHtml;

    // 301 Permanent Redirects for legacy/WordPress/trailing slash URLs to fix Google Search Console issues
    const rawUrl = req.originalUrl || req.url;
    
    // Clean multiple slashes e.g. /the-hottest-selling-products-on-amazon-in-2023//
    if (req.path.endsWith("//") || (req.path.length > 1 && req.path.endsWith("/") && !req.path.startsWith("/api"))) {
      const cleanPath = req.path.replace(/\/+$/, "") || "/";
      const queryString = req.url.includes("?") ? req.url.substring(req.url.indexOf("?")) : "";
      return res.redirect(301, `${cleanPath}${queryString}`);
    }

    // Handle legacy RSS feed tracking parameters & outdated blog posts
    if (rawUrl.includes("attendance-system-smart-emp-lets-explore")) {
      return res.redirect(301, "/");
    }
    if (rawUrl.includes("the-hottest-selling-products-on-amazon-in-2023")) {
      return res.redirect(301, "/?category=electronics");
    }
    if (rawUrl.includes("utm_source=rss")) {
      const cleanUrl = rawUrl.replace(/[?&]utm_source=rss.*$/, "");
      return res.redirect(301, cleanUrl || "/");
    }

    // Replace canonical links & origins dynamically
    customizedHtml = customizedHtml.replace(
      /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/gi,
      `<link rel="canonical" href="${fullCanonicalUrl}" />`
    );

    customizedHtml = customizedHtml.replace(
      /https:\/\/trends\.owncircles\.com/g,
      currentOrigin
    );

    // Route specific SEO metadata overrides
    if (req.path.includes("base64-encoder-decoder")) {
      customizedHtml = customizedHtml
        .replace(/<title>.*?<\/title>/gi, `<title>Base64 Encoder &amp; Decoder Online Tool | OwnCircles</title>`)
        .replace(/<meta\s+name="description"\s+content="[^"]*"\s*\/?>/gi, `<meta name="description" content="Free online Base64 encoder and decoder. Convert text, strings, and UTF-8 data to Base64 and decode Base64 strings with zero latency." />`);
    } else if (req.path.includes("yaml-converter")) {
      customizedHtml = customizedHtml
        .replace(/<title>.*?<\/title>/gi, `<title>YAML to JSON &amp; JSON to YAML Converter | OwnCircles</title>`)
        .replace(/<meta\s+name="description"\s+content="[^"]*"\s*\/?>/gi, `<meta name="description" content="Free online YAML to JSON and JSON to YAML converter with syntax validation, formatting, and live error checking." />`);
    } else if (req.path.includes("csv-to-json")) {
      customizedHtml = customizedHtml
        .replace(/<title>.*?<\/title>/gi, `<title>CSV to JSON &amp; JSON to CSV Converter | OwnCircles</title>`)
        .replace(/<meta\s+name="description"\s+content="[^"]*"\s*\/?>/gi, `<meta name="description" content="Convert CSV tabular data to JSON arrays and JSON objects to clean CSV format instantly online. Fast, secure, client-side." />`);
    }

    res.setHeader("X-Robots-Tag", "all, index, follow");
    res.setHeader("Content-Type", "text/html; charset=utf-8");
    res.status(200).send(customizedHtml);
  };

  // Vite middleware for development vs static build in production
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    const indexHtmlPath = path.join(distPath, "index.html");
    
    app.use(express.static(distPath, { index: false }));

    app.get("*", (req, res) => {
      try {
        if (fs.existsSync(indexHtmlPath)) {
          const rawHtml = fs.readFileSync(indexHtmlPath, "utf-8");
          renderIndexHtml(req, res, rawHtml);
        } else {
          res.sendFile(indexHtmlPath);
        }
      } catch (e) {
        res.sendFile(indexHtmlPath);
      }
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}

function generateFallbackInterpretation(data: {
  productName: string;
  region: string;
  currencySymbol: string;
  currentLowestPrice: number;
  thirtyDayLowest: number;
  thirtyDayHighest: number;
  thirtyDayAverage: number;
  currentTrend: 'dropping' | 'stable' | 'rising';
  trendPercent: number;
}) {
  const {
    currencySymbol,
    currentLowestPrice,
    thirtyDayLowest,
    thirtyDayHighest,
    thirtyDayAverage,
    currentTrend,
    trendPercent
  } = data;

  const isNearLow = currentLowestPrice <= (thirtyDayLowest * 1.03);
  const isBelowAvg = currentLowestPrice < thirtyDayAverage;

  let trendPhrase = "Price is currently holding stable";
  if (currentTrend === 'dropping') {
    trendPhrase = `Price is currently trending downward by ${trendPercent}% over the last 30 days`;
  } else if (currentTrend === 'rising') {
    trendPhrase = `Price is currently trending upward (+${trendPercent}%) over recent weeks`;
  }

  const comparisonPhrase = isNearLow
    ? `Today's best price of ${currencySymbol}${currentLowestPrice} is right at the 30-day historical lowest point (${currencySymbol}${thirtyDayLowest}).`
    : isBelowAvg
    ? `At ${currencySymbol}${currentLowestPrice}, it is currently below the 30-day average of ${currencySymbol}${thirtyDayAverage}.`
    : `Current price of ${currencySymbol}${currentLowestPrice} sits near the 30-day high (${currencySymbol}${thirtyDayHighest}).`;

  const summary = `${trendPhrase}. ${comparisonPhrase} Market fluctuations indicate competitive pricing across major online retailers.`;

  const actionableAdvice = isNearLow
    ? "Strong Buy - Current price is at a 30-day promotional low. Excellent time to purchase."
    : isBelowAvg
    ? "Good Deal - Price is below recent market averages. Favorable window to buy."
    : "Consider Waiting - Price is slightly elevated above recent mid-month discount levels.";

  const verdict = isNearLow ? "STRONG_BUY" : isBelowAvg ? "GOOD_DEAL" : "WAIT_FOR_DROP";
  const potentialSave = Math.max(0, thirtyDayHighest - currentLowestPrice);

  return {
    summary,
    actionableAdvice,
    verdict,
    savingsPotential: potentialSave > 0 ? `Save up to ${currencySymbol}${potentialSave} compared to 30-day peak` : "Competitive pricing"
  };
}

startServer();
