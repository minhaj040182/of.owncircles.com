import React, { useState } from 'react';
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ReferenceLine,
  Legend
} from 'recharts';
import { 
  TrendingDown, 
  TrendingUp, 
  Minus, 
  Calendar, 
  Tag, 
  Info, 
  Flame, 
  Sparkles,
  ArrowDownRight,
  ArrowUpRight
} from 'lucide-react';
import { DailyPricePoint, ProductPriceComparisonResult, formatLocalPrice } from '../utils/priceComparison';
import { RegionCode } from '../utils/localization';

interface PriceHistoryLineChartProps {
  comparison: ProductPriceComparisonResult;
  region: RegionCode;
}

export const PriceHistoryLineChart: React.FC<PriceHistoryLineChartProps> = ({
  comparison,
  region
}) => {
  const [activeMetric, setActiveMetric] = useState<'lowest' | 'amazon' | 'all'>('lowest');
  const history = comparison.priceHistory || [];

  if (history.length === 0) {
    return null;
  }

  const {
    thirtyDayLowest,
    thirtyDayHighest,
    thirtyDayAverage,
    currentTrend,
    trendPercent,
    currencySymbol,
    lowestPrice
  } = comparison;

  // Custom tool tip component for the 30-day time series
  const CustomHistoryTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data: DailyPricePoint = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white p-3.5 rounded-2xl border border-slate-700 shadow-2xl text-xs space-y-2 z-50 min-w-[200px]">
          <div className="flex items-center justify-between border-b border-slate-700/80 pb-1.5">
            <span className="font-bold text-slate-300 flex items-center gap-1">
              <Calendar className="w-3 h-3 text-blue-400" />
              {data.date} ({data.fullDate})
            </span>
            {data.eventLabel && (
              <span className="bg-amber-500/20 text-amber-300 text-[10px] font-black px-1.5 py-0.5 rounded border border-amber-500/30">
                {data.eventLabel}
              </span>
            )}
          </div>

          <div className="space-y-1 text-[11px]">
            <div className="flex items-center justify-between">
              <span className="text-emerald-400 font-semibold flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-400" />
                Best Market Price:
              </span>
              <strong className="text-white text-xs">{formatLocalPrice(data.lowestPrice, region)}</strong>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-amber-400 font-medium flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                Amazon Price:
              </span>
              <span className="text-slate-200">{formatLocalPrice(data.amazonPrice, region)}</span>
            </div>

            <div className="flex items-center justify-between">
              <span className="text-blue-400 font-medium flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-blue-400" />
                Top Competitors:
              </span>
              <span className="text-slate-200">{formatLocalPrice(data.competitorPrice, region)}</span>
            </div>

            <div className="flex items-center justify-between pt-1 border-t border-slate-800 text-slate-400">
              <span>Day Average:</span>
              <span>{formatLocalPrice(data.averagePrice, region)}</span>
            </div>
          </div>

          {data.isLowestDay && (
            <div className="bg-emerald-500/20 text-emerald-300 text-[10px] font-bold p-1 rounded text-center border border-emerald-500/30">
              ★ 30-Day Historical Low Point
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  // Determine trend badge color and text
  const isGoodTimeToBuy = lowestPrice <= thirtyDayLowest * 1.02;

  return (
    <div className="bg-slate-50/80 rounded-2xl border border-gray-200 p-4 sm:p-5 space-y-4">
      
      {/* Time-Series Header & KPI Stats */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-200/80 pb-3.5">
        <div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-blue-600" />
            <h4 className="text-xs sm:text-sm font-extrabold text-slate-900">
              30-Day Historical Price Trend
            </h4>
            <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded-full border border-blue-200">
              Daily Tracking
            </span>
          </div>
          <p className="text-[11px] text-slate-500 font-medium mt-0.5">
            Historical price fluctuations across verified multi-store retailers over the past month
          </p>
        </div>

        {/* Trend Verdict Badge */}
        <div className="flex items-center gap-2">
          {currentTrend === 'dropping' ? (
            <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-800 border border-emerald-200 px-2.5 py-1 rounded-xl text-xs font-bold shadow-2xs">
              <TrendingDown className="w-3.5 h-3.5 text-emerald-600" />
              <span>Trending Down ({trendPercent}% in 30d)</span>
            </div>
          ) : currentTrend === 'rising' ? (
            <div className="flex items-center gap-1.5 bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 rounded-xl text-xs font-bold shadow-2xs">
              <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
              <span>Trending Up (+{trendPercent}% in 30d)</span>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 bg-slate-100 text-slate-700 border border-slate-300 px-2.5 py-1 rounded-xl text-xs font-bold shadow-2xs">
              <Minus className="w-3.5 h-3.5 text-slate-500" />
              <span>Stable Market Price</span>
            </div>
          )}

          {isGoodTimeToBuy && (
            <span className="bg-emerald-600 text-white text-[10px] font-black px-2 py-1 rounded-xl shadow-2xs flex items-center gap-1">
              <Sparkles className="w-3 h-3" />
              Great Time to Buy
            </span>
          )}
        </div>
      </div>

      {/* 30-Day Quick Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
        <div className="bg-white p-2.5 rounded-xl border border-gray-200 shadow-2xs">
          <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">30-Day Low</span>
          <strong className="text-xs sm:text-sm font-black text-emerald-700">
            {formatLocalPrice(thirtyDayLowest, region)}
          </strong>
        </div>

        <div className="bg-white p-2.5 rounded-xl border border-gray-200 shadow-2xs">
          <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">30-Day High</span>
          <strong className="text-xs sm:text-sm font-black text-rose-600">
            {formatLocalPrice(thirtyDayHighest, region)}
          </strong>
        </div>

        <div className="bg-white p-2.5 rounded-xl border border-gray-200 shadow-2xs">
          <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">30-Day Average</span>
          <strong className="text-xs sm:text-sm font-black text-slate-800">
            {formatLocalPrice(thirtyDayAverage, region)}
          </strong>
        </div>

        <div className="bg-white p-2.5 rounded-xl border border-gray-200 shadow-2xs">
          <span className="text-[10px] text-slate-500 font-bold block uppercase tracking-wider">Current Best</span>
          <strong className="text-xs sm:text-sm font-black text-blue-700">
            {formatLocalPrice(lowestPrice, region)}
          </strong>
        </div>
      </div>

      {/* Filter View Selector */}
      <div className="flex items-center justify-between text-xs pt-1">
        <span className="text-[11px] font-bold text-slate-500">Show Series:</span>
        <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-gray-200">
          <button
            onClick={() => setActiveMetric('lowest')}
            className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
              activeMetric === 'lowest'
                ? 'bg-emerald-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Lowest Price Line
          </button>
          <button
            onClick={() => setActiveMetric('amazon')}
            className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
              activeMetric === 'amazon'
                ? 'bg-amber-500 text-slate-950 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Amazon vs Lowest
          </button>
          <button
            onClick={() => setActiveMetric('all')}
            className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
              activeMetric === 'all'
                ? 'bg-blue-600 text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Channels
          </button>
        </div>
      </div>

      {/* Recharts Time-Series Line Chart */}
      <div className="h-[200px] sm:h-[220px] w-full bg-white p-2.5 rounded-xl border border-gray-200 shadow-inner">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={history}
            margin={{ top: 12, right: 15, left: -10, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 10, fill: '#64748b' }}
              interval={4} // Show every 5th day label cleanly
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: '#64748b' }}
              domain={['dataMin - 100', 'dataMax + 100']}
              tickFormatter={(v) => `${currencySymbol}${v >= 1000 ? `${(v/1000).toFixed(1)}k` : v}`}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomHistoryTooltip />} />
            
            {/* Reference Line for 30-day Average */}
            <ReferenceLine 
              y={thirtyDayAverage} 
              stroke="#94a3b8" 
              strokeDasharray="4 4" 
              label={{ 
                value: `Avg: ${currencySymbol}${thirtyDayAverage >= 1000 ? `${(thirtyDayAverage/1000).toFixed(1)}k` : thirtyDayAverage}`, 
                fill: '#94a3b8', 
                fontSize: 9, 
                position: 'insideTopRight' 
              }} 
            />

            {/* Lowest Market Price Line */}
            <Line
              type="monotone"
              dataKey="lowestPrice"
              name="Lowest Market Price"
              stroke="#10b981"
              strokeWidth={2.5}
              dot={{ r: 2, fill: '#10b981' }}
              activeDot={{ r: 5, fill: '#10b981', stroke: '#ffffff', strokeWidth: 2 }}
              animationDuration={1000}
            />

            {/* Amazon Price Line (Conditional) */}
            {(activeMetric === 'amazon' || activeMetric === 'all') && (
              <Line
                type="monotone"
                dataKey="amazonPrice"
                name="Amazon Price"
                stroke="#f59e0b"
                strokeWidth={2}
                strokeDasharray="2 2"
                dot={{ r: 1.5, fill: '#f59e0b' }}
                activeDot={{ r: 4, fill: '#f59e0b', stroke: '#ffffff', strokeWidth: 1.5 }}
                animationDuration={1000}
              />
            )}

            {/* Top Competitor Line (Conditional) */}
            {activeMetric === 'all' && (
              <Line
                type="monotone"
                dataKey="competitorPrice"
                name="Competitor Average"
                stroke="#3b82f6"
                strokeWidth={1.5}
                strokeDasharray="4 2"
                dot={false}
                activeDot={{ r: 4, fill: '#3b82f6' }}
                animationDuration={1000}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Chart Footer Indicator */}
      <div className="flex items-center justify-between text-[11px] text-slate-500 font-medium px-1">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-emerald-700 font-semibold">
            <span className="w-2.5 h-0.5 bg-emerald-500 rounded" /> Lowest Market Price
          </span>
          {(activeMetric === 'amazon' || activeMetric === 'all') && (
            <span className="flex items-center gap-1 text-amber-700 font-medium">
              <span className="w-2.5 h-0.5 bg-amber-500 rounded border-dashed" /> Amazon
            </span>
          )}
          {activeMetric === 'all' && (
            <span className="flex items-center gap-1 text-blue-700 font-medium">
              <span className="w-2.5 h-0.5 bg-blue-500 rounded border-dotted" /> Retail Competitors
            </span>
          )}
        </div>

        <span className="text-[10px] text-slate-400">
          Source: Verified Multi-Retailer Daily Price Index
        </span>
      </div>

    </div>
  );
};
