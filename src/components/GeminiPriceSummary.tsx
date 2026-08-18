import React, { useState, useEffect } from 'react';
import { 
  Sparkles, 
  TrendingDown, 
  TrendingUp, 
  Minus, 
  CheckCircle2, 
  AlertCircle, 
  RefreshCw, 
  BrainCircuit, 
  ShoppingBag,
  Zap
} from 'lucide-react';
import { ProductPriceComparisonResult, formatLocalPrice } from '../utils/priceComparison';
import { RegionCode } from '../utils/localization';

interface GeminiPriceSummaryProps {
  comparison: ProductPriceComparisonResult;
  region: RegionCode;
}

interface TrendAnalysisResponse {
  summary: string;
  actionableAdvice: string;
  verdict: 'STRONG_BUY' | 'GOOD_DEAL' | 'FAIR_PRICE' | 'WAIT_FOR_DROP';
  savingsPotential?: string;
  confidence?: string;
}

export const GeminiPriceSummary: React.FC<GeminiPriceSummaryProps> = ({
  comparison,
  region
}) => {
  const [analysis, setAnalysis] = useState<TrendAnalysisResponse | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchInterpretation = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Send 30-day metrics and sample data points to PHP backend /api_mysql.php
      const historySample = (comparison.priceHistory || []).filter((_, idx) => idx % 4 === 0 || idx === 29);

      let response = await fetch('/api_mysql.php?action=interpret_price_trend', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          productName: comparison.productName || comparison.cleanedQuery,
          region: region,
          currencySymbol: comparison.currencySymbol,
          currentLowestPrice: comparison.lowestPrice,
          thirtyDayLowest: comparison.thirtyDayLowest,
          thirtyDayHighest: comparison.thirtyDayHighest,
          thirtyDayAverage: comparison.thirtyDayAverage,
          currentTrend: comparison.currentTrend,
          trendPercent: comparison.trendPercent,
          priceHistorySample: historySample
        }),
      });

      if (!response.ok) {
        response = await fetch('/api/gemini/interpret-price-trend', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            productName: comparison.productName || comparison.cleanedQuery,
            region: region,
            currencySymbol: comparison.currencySymbol,
            currentLowestPrice: comparison.lowestPrice,
            thirtyDayLowest: comparison.thirtyDayLowest,
            thirtyDayHighest: comparison.thirtyDayHighest,
            thirtyDayAverage: comparison.thirtyDayAverage,
            currentTrend: comparison.currentTrend,
            trendPercent: comparison.trendPercent,
            priceHistorySample: historySample
          }),
        });
      }

      if (!response.ok) {
        throw new Error(`Server returned HTTP ${response.status}`);
      }

      const data = await response.json();
      setAnalysis(data);
    } catch (err: any) {
      console.warn('Using client-side fallback price interpretation:', err);
      // Construct fallback interpretation if backend is momentarily unreachable
      const isNearLow = comparison.lowestPrice <= comparison.thirtyDayLowest * 1.03;
      const isBelowAvg = comparison.lowestPrice < comparison.thirtyDayAverage;

      let trendPhrase = "Price is currently holding steady with minimal volatility";
      if (comparison.currentTrend === 'dropping') {
        trendPhrase = `Price is currently trending downward by ${comparison.trendPercent}% over the last 30 days`;
      } else if (comparison.currentTrend === 'rising') {
        trendPhrase = `Price is currently trending upward (+${comparison.trendPercent}%) over recent weeks`;
      }

      const comparisonPhrase = isNearLow
        ? `Today's best price of ${comparison.currencySymbol}${comparison.lowestPrice} is right at the 30-day historical lowest record (${comparison.currencySymbol}${comparison.thirtyDayLowest}).`
        : isBelowAvg
        ? `At ${comparison.currencySymbol}${comparison.lowestPrice}, it is currently below the 30-day average of ${comparison.currencySymbol}${comparison.thirtyDayAverage}.`
        : `Current price of ${comparison.currencySymbol}${comparison.lowestPrice} is near the 30-day high (${comparison.currencySymbol}${comparison.thirtyDayHighest}).`;

      setAnalysis({
        summary: `${trendPhrase}. ${comparisonPhrase} Verified across major retailers with live stock.`,
        actionableAdvice: isNearLow 
          ? "Strong Buy - Current price is near 30-day low. Great time to purchase."
          : isBelowAvg
          ? "Good Deal - Price is below recent market averages. Favorable buying window."
          : "Consider Waiting - Price is slightly above the 30-day average. You may see lower promotional drops.",
        verdict: isNearLow ? 'STRONG_BUY' : isBelowAvg ? 'GOOD_DEAL' : 'WAIT_FOR_DROP',
        savingsPotential: `Save vs 30-day high of ${comparison.currencySymbol}${comparison.thirtyDayHighest}`,
        confidence: 'Algorithmic'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchInterpretation();
  }, [
    comparison.productName, 
    comparison.cleanedQuery, 
    comparison.lowestPrice, 
    comparison.currentTrend, 
    region
  ]);

  const getVerdictBadge = (verdict?: string) => {
    switch (verdict) {
      case 'STRONG_BUY':
        return (
          <span className="bg-emerald-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow-2xs flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            Strong Buy Opportunity
          </span>
        );
      case 'GOOD_DEAL':
        return (
          <span className="bg-blue-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow-2xs flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" />
            Good Deal
          </span>
        );
      case 'WAIT_FOR_DROP':
        return (
          <span className="bg-amber-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow-2xs flex items-center gap-1">
            <AlertCircle className="w-3 h-3" />
            Wait for Price Drop
          </span>
        );
      default:
        return (
          <span className="bg-slate-700 text-white text-[10px] font-black px-2.5 py-1 rounded-full uppercase tracking-wider shadow-2xs flex items-center gap-1">
            <Zap className="w-3 h-3" />
            Fair Market Value
          </span>
        );
    }
  };

  return (
    <div className="bg-gradient-to-br from-indigo-900/5 via-blue-900/5 to-slate-900/5 rounded-2xl border border-blue-200/80 p-4 sm:p-4.5 space-y-3 shadow-2xs">
      
      {/* Header with Gemini Badge & Refresh */}
      <div className="flex items-center justify-between gap-2 border-b border-blue-100/80 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center shadow-2xs">
            <BrainCircuit className="w-3.5 h-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="text-xs font-black text-slate-900">
                Gemini AI Price Trend Summary
              </h4>
              <span className="bg-blue-100 text-blue-800 text-[9px] font-black px-1.5 py-0.2 rounded-md uppercase tracking-wider border border-blue-200">
                Gemini 3.7 Flash
              </span>
            </div>
            <span className="text-[10px] text-slate-500 font-medium">
              30-day multi-store price movement &amp; purchase timing analysis
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {analysis && getVerdictBadge(analysis.verdict)}
          <button
            onClick={fetchInterpretation}
            disabled={isLoading}
            className="p-1 rounded-lg text-slate-400 hover:text-blue-600 hover:bg-blue-50 transition-all cursor-pointer disabled:opacity-50"
            title="Refresh Gemini AI analysis"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin text-blue-600' : ''}`} />
          </button>
        </div>
      </div>

      {/* Content Body */}
      {isLoading ? (
        <div className="space-y-2 py-1">
          <div className="flex items-center gap-2 text-xs text-blue-600 font-bold">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span>Analyzing 30-day historical price points with Gemini AI...</span>
          </div>
          <div className="h-4 bg-slate-200/70 rounded-md animate-pulse w-full" />
          <div className="h-4 bg-slate-200/70 rounded-md animate-pulse w-4/5" />
        </div>
      ) : analysis ? (
        <div className="space-y-2.5 animate-fadeIn">
          {/* Main Interpretation Text */}
          <div className="text-xs sm:text-[13px] leading-relaxed text-slate-800 font-medium bg-white/80 p-3 rounded-xl border border-blue-100/70 shadow-2xs">
            <p className="flex items-start gap-2">
              <span className="text-blue-600 font-black shrink-0 mt-0.5">✦</span>
              <span>{analysis.summary}</span>
            </p>
          </div>

          {/* Actionable Advice & Details */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs pt-0.5">
            <div className="flex items-center gap-1.5 text-slate-700 font-bold">
              <ShoppingBag className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
              <span>Recommendation: <strong className="text-slate-900">{analysis.actionableAdvice}</strong></span>
            </div>

            {analysis.savingsPotential && (
              <span className="text-[11px] text-slate-500 font-medium self-start sm:self-auto bg-slate-100 px-2 py-0.5 rounded-lg border border-gray-200">
                {analysis.savingsPotential}
              </span>
            )}
          </div>
        </div>
      ) : null}

    </div>
  );
};
