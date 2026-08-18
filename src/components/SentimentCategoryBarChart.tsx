import React from 'react';
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
import { BarChart3, TrendingUp, ShieldCheck } from 'lucide-react';
import { AIPulse, CommentTopic } from '../types';

interface SentimentCategoryBarChartProps {
  pulse: AIPulse;
  topics?: CommentTopic[];
  compact?: boolean;
}

export interface SentimentCategoryData {
  category: string;
  shortName: string;
  score: number; // 0 to 100
  rating: string; // e.g. "4.8 / 5"
  color: string;
  benchmark: string;
}

export const calculateSentimentCategoryBreakdown = (
  pulse: AIPulse,
  topics?: CommentTopic[]
): SentimentCategoryData[] => {
  const posRatio = pulse.overallSentimentRatio?.positive ?? 88;
  const valueScore = Math.min(100, Math.max(60, Math.round(((pulse.valueRating ?? 4.8) / 5) * 100)));
  
  // Extract topic-based scores if available
  let buildScore = Math.min(99, Math.max(70, posRatio >= 85 ? posRatio + 2 : posRatio - 2));
  let perfScore = Math.min(99, Math.max(68, posRatio >= 90 ? posRatio : posRatio + 4));
  let easeScore = Math.min(99, Math.max(72, posRatio >= 80 ? posRatio + 3 : posRatio - 1));

  if (topics && topics.length > 0) {
    const buildTopic = topics.find(t => t.topic.toLowerCase().includes('build') || t.topic.toLowerCase().includes('quality'));
    const perfTopic = topics.find(t => t.topic.toLowerCase().includes('perform') || t.topic.toLowerCase().includes('speed'));
    const easeTopic = topics.find(t => t.topic.toLowerCase().includes('use') || t.topic.toLowerCase().includes('design') || t.topic.toLowerCase().includes('setup'));

    if (buildTopic) {
      buildScore = buildTopic.sentiment === 'positive' ? Math.min(98, posRatio + 3) : Math.max(65, posRatio - 12);
    }
    if (perfTopic) {
      perfScore = perfTopic.sentiment === 'positive' ? Math.min(97, posRatio + 2) : Math.max(60, posRatio - 15);
    }
    if (easeTopic) {
      easeScore = easeTopic.sentiment === 'positive' ? Math.min(96, posRatio + 4) : Math.max(68, posRatio - 10);
    }
  }

  return [
    {
      category: 'Build Quality',
      shortName: 'Build',
      score: buildScore,
      rating: `${(buildScore / 20).toFixed(1)}/5.0`,
      color: '#10b981', // Emerald
      benchmark: pulse.durabilityRating || 'High Durability'
    },
    {
      category: 'Value for Money',
      shortName: 'Value',
      score: valueScore,
      rating: `${(valueScore / 20).toFixed(1)}/5.0`,
      color: '#3b82f6', // Blue
      benchmark: 'Strong Price/Value'
    },
    {
      category: 'Performance',
      shortName: 'Perf',
      score: perfScore,
      rating: `${(perfScore / 20).toFixed(1)}/5.0`,
      color: '#6366f1', // Indigo
      benchmark: 'Top Benchmark'
    },
    {
      category: 'Ease of Use',
      shortName: 'Usability',
      score: easeScore,
      rating: `${(easeScore / 20).toFixed(1)}/5.0`,
      color: '#0ea5e9', // Sky
      benchmark: 'Intuitive Setup'
    },
    {
      category: 'Overall Positiveness',
      shortName: 'Overall',
      score: posRatio,
      rating: `${(posRatio / 20).toFixed(1)}/5.0`,
      color: '#f59e0b', // Amber
      benchmark: pulse.buyerRecommendation
    }
  ];
};

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: SentimentCategoryData;
  }>;
}

const CustomBarTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  if (active && payload && payload.length > 0) {
    const data = payload[0].payload;
    return (
      <div className="bg-slate-900 text-white p-2.5 rounded-xl border border-slate-700 shadow-xl text-xs space-y-1 z-50">
        <div className="flex items-center justify-between gap-3">
          <span className="font-bold text-slate-200">{data.category}</span>
          <span 
            className="font-black px-1.5 py-0.5 rounded text-[11px]"
            style={{ backgroundColor: `${data.color}25`, color: data.color }}
          >
            {data.score}%
          </span>
        </div>
        <div className="text-[11px] text-slate-400 flex items-center justify-between gap-2">
          <span>Score: <strong className="text-white">{data.rating}</strong></span>
          <span>•</span>
          <span className="text-emerald-400 font-medium">{data.benchmark}</span>
        </div>
      </div>
    );
  }
  return null;
};

export const SentimentCategoryBarChart: React.FC<SentimentCategoryBarChartProps> = ({
  pulse,
  topics,
  compact = false
}) => {
  const chartData = calculateSentimentCategoryBreakdown(pulse, topics || pulse.topTopics);

  return (
    <div className={`bg-white rounded-2xl border border-gray-200 shadow-2xs ${compact ? 'p-3.5 space-y-2.5' : 'p-5 space-y-4'}`}>
      {/* Header */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-2.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <BarChart3 className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-extrabold text-slate-900 flex items-center gap-1.5">
              <span>Sentiment by Category</span>
              <span className="bg-emerald-50 text-emerald-700 text-[10px] font-bold px-2 py-0.5 rounded-full border border-emerald-200">
                AI NLP Analysis
              </span>
            </h4>
            {!compact && (
              <p className="text-[11px] text-slate-500 font-medium">
                Viewer approval breakdown across key buying decision factors
              </p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1 text-[11px] font-bold text-slate-600 bg-slate-50 px-2.5 py-1 rounded-lg border border-gray-200">
          <TrendingUp className="w-3.5 h-3.5 text-blue-600" />
          <span>Avg: {Math.round(chartData.reduce((acc, curr) => acc + curr.score, 0) / chartData.length)}%</span>
        </div>
      </div>

      {/* Visual Recharts Bar Chart */}
      <div className={compact ? 'h-[160px] w-full' : 'h-[200px] w-full'}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            data={chartData}
            layout="vertical"
            margin={{ top: 5, right: 30, left: 4, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#f1f5f9" />
            <XAxis 
              type="number" 
              domain={[0, 100]} 
              tick={{ fontSize: 10, fill: '#64748b' }}
              tickFormatter={(v) => `${v}%`}
              axisLine={false}
              tickLine={false}
            />
            <YAxis 
              type="category" 
              dataKey="category" 
              tick={{ fontSize: 11, fill: '#334155', fontWeight: 600 }}
              width={compact ? 95 : 125}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomBarTooltip />} cursor={{ fill: 'rgba(241, 245, 249, 0.6)' }} />
            <Bar 
              dataKey="score" 
              radius={[0, 6, 6, 0]}
              barSize={compact ? 14 : 18}
              animationDuration={800}
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Category Pills Grid */}
      <div className={`grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1 ${compact ? 'text-[10px]' : 'text-xs'}`}>
        {chartData.map((item, idx) => (
          <div 
            key={idx} 
            className="p-2 rounded-xl bg-slate-50/80 border border-gray-100 flex items-center justify-between gap-1.5"
          >
            <div className="flex items-center gap-1.5 min-w-0">
              <span 
                className="w-2.5 h-2.5 rounded-full shrink-0" 
                style={{ backgroundColor: item.color }} 
              />
              <span className="font-semibold text-slate-700 truncate">{item.category}</span>
            </div>
            <span className="font-black text-slate-900 shrink-0">{item.score}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};
