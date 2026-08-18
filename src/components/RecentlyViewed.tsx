import React from 'react';
import { Clock, Play, Trash2, ArrowRight, Eye, Sparkles } from 'lucide-react';
import { VideoItem } from '../types';
import { RegionCode } from '../utils/localization';

interface RecentlyViewedProps {
  videos: VideoItem[];
  onSelectVideo: (video: VideoItem) => void;
  onClearHistory: () => void;
  region?: RegionCode;
}

const getCategoryBadgeClass = (category: string) => {
  const norm = (category || '').toLowerCase().replace(/[^a-z_]/g, '');
  switch (norm) {
    case 'household':
      return 'bg-indigo-600/90 text-white';
    case 'kitchen':
      return 'bg-amber-600/90 text-white';
    case 'fitness':
      return 'bg-emerald-600/90 text-white';
    case 'electronics':
    case 'gadgets':
      return 'bg-blue-600/90 text-white';
    case 'beauty':
    case 'personal_care':
      return 'bg-rose-600/90 text-white';
    case 'books_stationery':
      return 'bg-purple-600/90 text-white';
    case 'baby_parenting':
      return 'bg-sky-600/90 text-white';
    case 'pet_supplies':
      return 'bg-orange-600/90 text-white';
    case 'home_office':
      return 'bg-teal-600/90 text-white';
    case 'travel_outdoor':
      return 'bg-cyan-600/90 text-white';
    default:
      return 'bg-slate-700/90 text-white';
  }
};

export const RecentlyViewed: React.FC<RecentlyViewedProps> = ({
  videos,
  onSelectVideo,
  onClearHistory,
  region = 'IN'
}) => {
  if (!videos || videos.length === 0) {
    return null;
  }

  return (
    <section className="mt-8 mb-4 bg-white border border-gray-200 rounded-3xl p-5 md:p-6 shadow-sm relative overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between gap-4 mb-4 pb-3 border-b border-gray-100">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-blue-600 shrink-0">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <span>Recently Viewed</span>
              <span className="bg-blue-100 text-blue-700 text-[11px] font-extrabold px-2 py-0.5 rounded-full">
                {videos.length}
              </span>
            </h2>
            <p className="text-xs text-slate-500">Your last viewed video reviews</p>
          </div>
        </div>

        <button
          onClick={onClearHistory}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-red-50 text-slate-600 hover:text-red-600 text-xs font-semibold transition-colors cursor-pointer"
          title="Clear viewing history"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Clear History</span>
        </button>
      </div>

      {/* Video Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {videos.map((video) => {
          const displayTitle = video.rephrasedTitle || video.title;
          return (
            <div
              key={video.id}
              onClick={() => onSelectVideo(video)}
              className="bg-slate-50 border border-gray-200 hover:border-blue-400 hover:bg-blue-50/30 rounded-2xl p-2.5 flex flex-col justify-between transition-all duration-200 group cursor-pointer shadow-2xs hover:shadow-md"
            >
              <div>
                {/* Thumbnail Container */}
                <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-900 mb-2.5">
                  <img
                    src={video.thumbnailUrl}
                    alt={displayTitle}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                    <div className="w-8 h-8 rounded-full bg-white/90 text-blue-600 flex items-center justify-center shadow-md transform group-hover:scale-110 transition-transform">
                      <Play className="w-4 h-4 fill-blue-600 ml-0.5" />
                    </div>
                  </div>
                  <span className={`absolute bottom-1.5 right-1.5 text-[10px] font-bold px-2 py-0.5 rounded-md backdrop-blur-xs capitalize shadow-xs ${getCategoryBadgeClass(video.category)}`}>
                    {video.category.replace('_', ' ')}
                  </span>
                </div>

                {/* Title & Channel */}
                <h3 className="text-xs font-bold text-slate-800 group-hover:text-blue-600 transition-colors line-clamp-2 leading-snug mb-1">
                  {displayTitle}
                </h3>
                <p className="text-[11px] text-slate-500 truncate mb-2">
                  {video.channelTitle}
                </p>
              </div>

              {/* Footer info: Views & Sentiment */}
              <div className="pt-2 border-t border-gray-200/60 flex items-center justify-between text-[10px] text-slate-500 font-medium">
                <span className="flex items-center gap-1">
                  <Eye className="w-3 h-3 text-slate-400" />
                  {video.viewCount} views
                </span>
                <span className="text-emerald-600 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200/60">
                  {video.pulse?.overallSentimentRatio?.positive ?? 92}% Positive
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};
