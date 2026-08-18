import React, { useState } from 'react';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Cell, 
  CartesianGrid 
} from 'recharts';
import { 
  Building2, 
  ExternalLink, 
  TrendingDown, 
  Sparkles, 
  CheckCircle2, 
  ShieldCheck, 
  Star, 
  ArrowRight,
  Globe,
  Truck,
  RotateCcw,
  Zap,
  LineChart as LineChartIcon,
  BarChart3,
  Calendar,
  Clock,
  PackageCheck,
  Tag,
  LayoutGrid,
  Table as TableIcon
} from 'lucide-react';
import { RegionCode, REGION_CONFIGS } from '../utils/localization';
import { 
  compareProductPrices, 
  StorePriceQuote, 
  ProductPriceComparisonResult 
} from '../utils/priceComparison';
import { PriceHistoryLineChart } from './PriceHistoryLineChart';
import { GeminiPriceSummary } from './GeminiPriceSummary';

interface PriceComparisonCardProps {
  productName: string;
  initialPrice?: string | number;
  initialRegion?: RegionCode;
  compact?: boolean;
  onSelectStore?: (store: StorePriceQuote) => void;
  showCustomSearch?: boolean;
}

export const PriceComparisonCard: React.FC<PriceComparisonCardProps> = ({
  productName,
  initialPrice,
  initialRegion = 'IN',
  compact = false,
  onSelectStore,
  showCustomSearch = false
}) => {
  const [selectedRegion, setSelectedRegion] = useState<RegionCode>(initialRegion);
  const [activeQuery, setActiveQuery] = useState(productName);
  const [searchInput, setSearchInput] = useState(productName);
  const [activeChartTab, setActiveChartTab] = useState<'comparison' | 'history'>('comparison');
  const [storeViewMode, setStoreViewMode] = useState<'table' | 'cards'>('table');

  const regionConfig = REGION_CONFIGS[selectedRegion] || REGION_CONFIGS.IN;
  const comparison: ProductPriceComparisonResult = compareProductPrices(
    activeQuery || productName,
    initialPrice,
    selectedRegion
  );

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setActiveQuery(searchInput.trim());
    }
  };

  // Recharts custom tooltip
  const CustomPriceTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data: StorePriceQuote = payload[0].payload;
      return (
        <div className="bg-slate-900 text-white p-3 rounded-xl border border-slate-700 shadow-xl text-xs space-y-1.5 z-50">
          <div className="flex items-center justify-between gap-3">
            <span className="font-bold text-slate-200">{data.storeName}</span>
            {data.isLowestPrice && (
              <span className="bg-emerald-500 text-slate-950 font-black px-1.5 py-0.5 rounded text-[10px]">
                LOWEST PRICE
              </span>
            )}
          </div>
          <div className="text-sm font-black text-white">
            {data.formattedPrice}
          </div>
          <div className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <Truck className="w-3 h-3 text-blue-400" />
            <span>{data.deliveryNote}</span>
          </div>
        </div>
      );
    }
    return null;
  };

  const availableRegions: RegionCode[] = ['IN', 'US', 'GB', 'CA', 'AU', 'DE', 'PK', 'BD'];

  return (
    <div className={`bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden ${compact ? 'p-4 space-y-3' : 'p-5 sm:p-6 space-y-5'}`}>
      
      {/* Header with Geo Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-600 border border-blue-200 flex items-center justify-center font-bold">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-extrabold text-slate-900 flex items-center gap-2">
                <span>Multi-Store Geo Price Comparison</span>
                <span className="bg-blue-50 text-blue-700 text-[10px] font-extrabold px-2 py-0.5 rounded-full border border-blue-200 uppercase">
                  {regionConfig.flag} {regionConfig.name}
                </span>
              </h3>
              <p className="text-xs text-slate-500 font-medium">
                Comparing leading e-commerce platforms in your geolocation
              </p>
            </div>
          </div>
        </div>

        {/* Region Flag Selector Pills */}
        <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 scrollbar-none">
          <span className="text-[11px] font-bold text-slate-400 mr-1 hidden sm:inline flex items-center gap-1">
            <Globe className="w-3 h-3" /> Region:
          </span>
          {availableRegions.map((code) => {
            const r = REGION_CONFIGS[code];
            const isSelected = selectedRegion === code;
            return (
              <button
                key={code}
                onClick={() => setSelectedRegion(code)}
                className={`px-2 py-1 rounded-lg text-xs font-bold transition-all flex items-center gap-1 cursor-pointer ${
                  isSelected 
                    ? 'bg-blue-600 text-white shadow-2xs' 
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-700 border border-gray-200'
                }`}
                title={`Compare in ${r.name}`}
              >
                <span>{r.flag}</span>
                <span className="text-[10px]">{code}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Optional In-Card Search Input */}
      {showCustomSearch && (
        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2">
          <input
            type="text"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            placeholder="Search any product name to compare prices..."
            className="flex-1 bg-slate-50 border border-gray-200 focus:border-blue-500 focus:bg-white text-slate-900 placeholder-slate-400 text-xs rounded-xl px-3.5 py-2 outline-none font-medium transition-all"
          />
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-2xs cursor-pointer shrink-0"
          >
            Compare
          </button>
        </form>
      )}

      {/* Savings Highlight Banner */}
      {comparison.potentialSavings > 0 && (
        <div className="bg-gradient-to-r from-emerald-500/10 via-teal-500/10 to-blue-500/10 border border-emerald-200/80 rounded-2xl p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-black shadow-md shrink-0">
              <TrendingDown className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-extrabold text-emerald-900 flex items-center gap-1.5">
                <span>Best Deal at {comparison.bestStore.storeName}</span>
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-black px-2 py-0.5 rounded-full border border-emerald-300">
                  Save {comparison.formattedSavings} ({comparison.savingsPercentage}% OFF)
                </span>
              </div>
              <p className="text-xs text-emerald-700/90 font-medium">
                Lowest verified price available vs other major retailers in {regionConfig.name}
              </p>
            </div>
          </div>

          <a
            href={comparison.bestStore.buyUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-black flex items-center justify-center gap-1.5 transition-all shadow-sm shrink-0 cursor-pointer hover:scale-102"
          >
            <span>Buy at {comparison.bestStore.logoText}</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        </div>
      )}

      {/* Interactive Chart Section: Store Comparison Bar Chart OR 30-Day Historical Trend Line Chart */}
      <div className="space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveChartTab('comparison')}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeChartTab === 'comparison'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
              }`}
            >
              <BarChart3 className="w-3.5 h-3.5" />
              <span>Multi-Store Comparison</span>
            </button>

            <button
              onClick={() => setActiveChartTab('history')}
              className={`px-3 py-1.5 rounded-xl text-xs font-extrabold flex items-center gap-1.5 transition-all cursor-pointer ${
                activeChartTab === 'history'
                  ? 'bg-blue-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900 hover:bg-slate-200/70'
              }`}
            >
              <LineChartIcon className="w-3.5 h-3.5" />
              <span>30-Day Price History</span>
              <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black px-1.5 py-0.2 rounded-full uppercase">
                Trend
              </span>
            </button>
          </div>

          <span className="text-[11px] text-slate-400 font-medium hidden sm:inline-block">
            {activeChartTab === 'comparison' ? 'Live Store Quotations' : 'Daily Trend Wave & 30-Day Lows'}
          </span>
        </div>

        {/* Tab 1: Store Price Comparison (Bar Chart) */}
        {activeChartTab === 'comparison' && (
          <div className="space-y-2 animate-fadeIn">
            <div className="flex items-center justify-between text-xs font-bold text-slate-700 px-1">
              <span className="flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-500" />
                Store Price Comparison ({comparison.currencyCode})
              </span>
              <span className="text-[11px] text-slate-400 font-medium">
                Lowest on Left / Top
              </span>
            </div>

            <div className={compact ? 'h-[170px] w-full' : 'h-[210px] w-full'}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={comparison.stores}
                  layout="vertical"
                  margin={{ top: 5, right: 35, left: 10, bottom: 5 }}
                >
                  <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
                  <XAxis 
                    type="number" 
                    tick={{ fontSize: 10, fill: '#64748b' }}
                    tickFormatter={(v) => `${comparison.currencySymbol}${v >= 1000 ? `${(v/1000).toFixed(1)}k` : v}`}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    type="category" 
                    dataKey="storeName" 
                    tick={{ fontSize: 11, fill: '#1e293b', fontWeight: 700 }}
                    width={compact ? 95 : 120}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip content={<CustomPriceTooltip />} cursor={{ fill: 'rgba(241, 245, 249, 0.7)' }} />
                  <Bar 
                    dataKey="price" 
                    radius={[0, 6, 6, 0]}
                    barSize={compact ? 16 : 20}
                    animationDuration={800}
                  >
                    {comparison.stores.map((entry, index) => (
                      <Cell 
                        key={`cell-store-${index}`} 
                        fill={entry.isLowestPrice ? '#10b981' : entry.accentColor} 
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        )}

        {/* Tab 2: 30-Day Historical Price Trend (Line Chart) */}
        {activeChartTab === 'history' && (
          <div className="animate-fadeIn space-y-3">
            <PriceHistoryLineChart
              comparison={comparison}
              region={selectedRegion}
            />
          </div>
        )}

        {/* Gemini AI 30-Day Price Trend Summary & Buying Advice */}
        <GeminiPriceSummary
          comparison={comparison}
          region={selectedRegion}
        />
      </div>

      {/* Store Breakdown: Detailed Table View with Shipping Cost & Delivery Estimates + Responsive Grid Cards */}
      <div className="space-y-3 pt-1">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h4 className="text-xs font-extrabold text-slate-900 flex items-center gap-2">
              <span>Verified Store Offers ({comparison.stores.length})</span>
              <span className="bg-slate-100 text-slate-700 text-[10px] font-bold px-2 py-0.5 rounded-full">
                Delivery &amp; Total Breakdown
              </span>
            </h4>
            <p className="text-[11px] text-slate-500 font-medium mt-0.5">
              Includes base item price, shipping fees, estimated delivery window, and merchant warranty
            </p>
          </div>

          {/* Table vs Grid Switcher */}
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-xl border border-gray-200 self-start sm:self-auto">
            <button
              onClick={() => setStoreViewMode('table')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                storeViewMode === 'table'
                  ? 'bg-white text-blue-600 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5" />
              <span>Table</span>
            </button>
            <button
              onClick={() => setStoreViewMode('cards')}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                storeViewMode === 'cards'
                  ? 'bg-white text-blue-600 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5" />
              <span>Cards</span>
            </button>
          </div>
        </div>

        {/* VIEW 1: ENHANCED COMPARISON TABLE WITH SHIPPING COSTS & DELIVERY ESTIMATES */}
        {storeViewMode === 'table' && (
          <div className="overflow-x-auto rounded-2xl border border-gray-200 shadow-2xs bg-white animate-fadeIn">
            <table className="w-full text-left border-collapse min-w-[620px]">
              <thead>
                <tr className="bg-slate-50/90 border-b border-gray-200 text-[11px] font-extrabold text-slate-600 uppercase tracking-wider">
                  <th className="py-3 px-3.5">Store / Merchant</th>
                  <th className="py-3 px-3">Item Price</th>
                  <th className="py-3 px-3">
                    <div className="flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5 text-blue-600" />
                      <span>Shipping Cost</span>
                    </div>
                  </th>
                  <th className="py-3 px-3">
                    <div className="flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5 text-indigo-600" />
                      <span>Estimated Delivery</span>
                    </div>
                  </th>
                  <th className="py-3 px-3">
                    <div className="flex items-center gap-1">
                      <PackageCheck className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Total Landed Cost</span>
                    </div>
                  </th>
                  <th className="py-3 px-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {comparison.stores.map((store) => (
                  <tr 
                    key={`table-row-${store.storeId}`}
                    className={`hover:bg-slate-50/80 transition-colors ${
                      store.isLowestPrice ? 'bg-emerald-50/35 font-medium' : ''
                    }`}
                  >
                    {/* Store Name & Badge */}
                    <td className="py-3 px-3.5">
                      <div className="flex items-center gap-2.5">
                        <span 
                          className="w-2.5 h-2.5 rounded-full shrink-0"
                          style={{ backgroundColor: store.accentColor }} 
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className="font-extrabold text-slate-900">{store.storeName}</span>
                            {store.isLowestPrice && (
                              <span className="bg-emerald-600 text-white text-[9px] font-black px-1.5 py-0.2 rounded uppercase tracking-wider">
                                Best Price
                              </span>
                            )}
                          </div>
                          <div className="flex items-center gap-1.5 text-[10px] text-slate-400 mt-0.5">
                            <span className="flex items-center gap-0.5 text-amber-500 font-bold">
                              <Star className="w-2.5 h-2.5 fill-amber-400 text-amber-400" />
                              {store.rating}
                            </span>
                            <span>•</span>
                            <span className="text-slate-500">{store.domain}</span>
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Item Price */}
                    <td className="py-3 px-3">
                      <div>
                        <span className={`font-black text-xs sm:text-sm ${store.isLowestPrice ? 'text-emerald-700' : 'text-slate-900'}`}>
                          {store.formattedPrice}
                        </span>
                        {store.formattedOriginalPrice && (
                          <div className="text-[10px] text-slate-400 line-through">
                            {store.formattedOriginalPrice}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Shipping Cost Table Cell */}
                    <td className="py-3 px-3">
                      {store.isFreeShipping ? (
                        <div className="inline-flex items-center gap-1 bg-emerald-100 text-emerald-800 text-[11px] font-extrabold px-2 py-0.5 rounded-md border border-emerald-200">
                          <span>FREE</span>
                        </div>
                      ) : (
                        <div className="text-slate-700 font-bold text-xs">
                          {store.formattedShippingCost}
                        </div>
                      )}
                    </td>

                    {/* Delivery Time Estimate Table Cell */}
                    <td className="py-3 px-3">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-1 text-slate-800 font-semibold text-xs">
                          <Clock className="w-3 h-3 text-slate-400 shrink-0" />
                          <span>{store.deliveryTimeEstimate}</span>
                        </div>
                        <p className="text-[10px] text-slate-500 truncate max-w-[170px]" title={store.deliveryNote}>
                          {store.deliveryNote}
                        </p>
                      </div>
                    </td>

                    {/* Total Landed Cost (Price + Shipping) */}
                    <td className="py-3 px-3">
                      <div>
                        <strong className="text-slate-900 font-extrabold text-xs">
                          {store.formattedTotalWithShipping}
                        </strong>
                        <span className="text-[10px] text-slate-400 block font-normal">
                          {store.isFreeShipping ? 'No hidden fees' : 'Includes shipping'}
                        </span>
                      </div>
                    </td>

                    {/* Action Link */}
                    <td className="py-3 px-3.5 text-right">
                      <a
                        href={store.buyUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => onSelectStore?.(store)}
                        className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-xl text-xs font-extrabold transition-all cursor-pointer shadow-2xs whitespace-nowrap ${
                          store.isLowestPrice
                            ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                            : 'bg-slate-100 hover:bg-blue-50 text-slate-800 hover:text-blue-700 border border-gray-200'
                        }`}
                      >
                        <span>Visit {store.logoText}</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* VIEW 2: COMPACT / DETAILED CARDS VIEW */}
        {storeViewMode === 'cards' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 animate-fadeIn">
            {comparison.stores.map((store) => (
              <div 
                key={store.storeId}
                className={`p-3.5 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                  store.isLowestPrice 
                    ? 'bg-emerald-50/40 border-emerald-300 shadow-2xs' 
                    : 'bg-slate-50/60 hover:bg-slate-50 border-gray-200'
                }`}
              >
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span 
                        className="w-2.5 h-2.5 rounded-full shrink-0"
                        style={{ backgroundColor: store.accentColor }} 
                      />
                      <strong className="text-xs font-black text-slate-900">{store.storeName}</strong>
                      {store.isLowestPrice && (
                        <span className="bg-emerald-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md uppercase tracking-wider">
                          Lowest
                        </span>
                      )}
                    </div>
                    <div className="mt-1 space-y-0.5">
                      <p className="text-[11px] text-slate-700 font-semibold flex items-center gap-1">
                        <Clock className="w-3 h-3 text-indigo-600" />
                        <span>Delivery: {store.deliveryTimeEstimate}</span>
                      </p>
                      <p className="text-[10px] text-slate-500 flex items-center gap-1">
                        <Truck className="w-3 h-3 text-slate-400" />
                        <span>Shipping: <strong className={store.isFreeShipping ? 'text-emerald-700' : 'text-slate-800'}>{store.formattedShippingCost}</strong></span>
                      </p>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="text-sm font-black text-slate-900">
                      {store.formattedPrice}
                    </div>
                    {store.formattedOriginalPrice && (
                      <div className="text-[10px] text-slate-400 line-through">
                        {store.formattedOriginalPrice}
                      </div>
                    )}
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      Total: <strong className="text-slate-800">{store.formattedTotalWithShipping}</strong>
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-2 pt-2 border-t border-gray-200/60">
                  <div className="flex items-center gap-1.5 text-[11px] font-semibold text-slate-600">
                    <span className="flex items-center gap-0.5 text-amber-500 font-bold">
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                      {store.rating}
                    </span>
                    <span>•</span>
                    <span className="text-emerald-700 font-medium text-[10px] bg-emerald-50 px-1.5 py-0.5 rounded">
                      {store.stockStatus}
                    </span>
                  </div>

                  <a
                    href={store.buyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => onSelectStore?.(store)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1 transition-all cursor-pointer shadow-2xs ${
                      store.isLowestPrice
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold'
                        : 'bg-white hover:bg-slate-100 text-slate-800 border border-gray-200'
                    }`}
                  >
                    <span>Visit {store.logoText}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
