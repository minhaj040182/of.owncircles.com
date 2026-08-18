import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Play, Sparkles, Flame, Eye, ThumbsUp, ShoppingBag, ArrowRight } from 'lucide-react';
import { VideoItem } from '../types';

interface FeaturedVideoCarouselProps {
  videos: VideoItem[];
  onSelectVideo: (video: VideoItem) => void;
}

export const FeaturedVideoCarousel: React.FC<FeaturedVideoCarouselProps> = ({ videos, onSelectVideo }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  // Pick top 5 featured videos by viral potential score
  const featuredList = [...videos]
    .sort((a, b) => b.pulse.viralPotentialScore - a.pulse.viralPotentialScore)
    .slice(0, 5);

  useEffect(() => {
    if (featuredList.length <= 1 || isHovered) return;

    const timer = setInterval(() => {
      setCurrentIndex(prev => (prev + 1) % featuredList.length);
    }, 6000);

    return () => clearInterval(timer);
  }, [featuredList.length, isHovered]);

  if (featuredList.length === 0) return null;

  const current = featuredList[currentIndex] || featuredList[0];
  if (!current) return null;

  const displayTitle = current.rephrasedTitle || current.title;
  const topProduct = current.products[0];

  const handlePrev = () => {
    setCurrentIndex(prev => (prev - 1 + featuredList.length) % featuredList.length);
  };

  const handleNext = () => {
    setCurrentIndex(prev => (prev + 1) % featuredList.length);
  };

  return (
    <div 
      className="relative bg-slate-900 border border-slate-800 rounded-3xl overflow-hidden shadow-2xl text-white transition-all my-2 group"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Background Blur Overlay from Thumbnail */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-30">
        <img
          src={current.thumbnailUrl}
          alt={displayTitle}
          className="w-full h-full object-cover blur-3xl scale-125 transition-all duration-700"
          referrerPolicy="no-referrer"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-slate-950 via-slate-900/90 to-transparent" />
      </div>

      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-6 p-6 sm:p-8 items-center">
        {/* Left Column: Video Thumbnail Preview */}
        <div 
          className="lg:col-span-7 relative aspect-video rounded-2xl overflow-hidden bg-slate-950 border border-slate-700/60 shadow-xl cursor-pointer group/thumb"
          onClick={() => onSelectVideo(current)}
        >
          <img
            src={current.thumbnailUrl}
            alt={displayTitle}
            className="w-full h-full object-cover transition-transform duration-700 group-hover/thumb:scale-105"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-transparent to-black/20" />

          {/* Play Button */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-16 h-16 rounded-full bg-blue-600/90 hover:bg-blue-600 text-white flex items-center justify-center pl-1 shadow-2xl transform transition-all group-hover/thumb:scale-115 group-hover/thumb:shadow-blue-500/50">
              <Play className="w-7 h-7 fill-white" />
            </div>
          </div>

          {/* Header Badges */}
          <div className="absolute top-4 left-4 flex items-center gap-2">
            <span className="bg-gradient-to-r from-amber-500 to-rose-500 text-white text-[11px] font-black uppercase tracking-wider px-3 py-1 rounded-lg shadow-md flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 fill-amber-200 text-amber-200" />
              #1 Featured Viral Review
            </span>
            <span className="bg-slate-900/80 backdrop-blur-md text-slate-200 border border-slate-700 font-bold text-[10px] uppercase px-2.5 py-1 rounded-lg">
              {current.category}
            </span>
          </div>

          {/* Bottom Video Meta */}
          <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between text-xs text-slate-200 font-medium">
            <div className="flex items-center gap-3 bg-slate-900/80 backdrop-blur-md px-3 py-1.5 rounded-xl border border-white/10">
              <span className="flex items-center gap-1 text-slate-300">
                <Eye className="w-3.5 h-3.5 text-blue-400" />
                {current.viewCount} views
              </span>
              <span>•</span>
              <span className="flex items-center gap-1 text-slate-300">
                <ThumbsUp className="w-3.5 h-3.5 text-emerald-400" />
                {current.likeCount} likes
              </span>
            </div>

            <span className="bg-emerald-500 text-white font-black text-xs px-3 py-1 rounded-xl shadow-lg flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              {current.pulse.viralPotentialScore}/100 Score
            </span>
          </div>
        </div>

        {/* Right Column: AI Analysis & Action */}
        <div className="lg:col-span-5 space-y-4 flex flex-col justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-extrabold uppercase tracking-widest text-amber-400 flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" /> Spotlight Recommendation
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {currentIndex + 1} of {featuredList.length}
              </span>
            </div>

            <h2 
              onClick={() => onSelectVideo(current)}
              className="text-lg sm:text-xl font-black text-white hover:text-blue-400 transition-colors line-clamp-2 cursor-pointer leading-snug"
            >
              {displayTitle}
            </h2>

            <p className="text-xs text-slate-300 line-clamp-3 leading-relaxed bg-slate-800/60 p-3 rounded-xl border border-slate-700/60 font-normal">
              "{current.pulse.summary}"
            </p>
          </div>

          {topProduct && (
            <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700 space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-300 flex items-center justify-center shrink-0 border border-amber-500/30">
                    <ShoppingBag className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-white truncate">{topProduct.name}</div>
                    <div className="text-[11px] text-amber-300 font-black">{topProduct.estimatedPrice || 'Check Amazon Deal'}</div>
                  </div>
                </div>
                <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-2 py-0.5 rounded-md font-bold shrink-0">
                  {current.pulse.overallSentimentRatio.positive}% Positive
                </span>
              </div>
              <div className="text-[10px] text-slate-400 flex items-center justify-between px-1 pt-0.5">
                <span>🔥 Amazon Official Affiliate Deal</span>
                <span className="text-amber-400 font-semibold">Ships Globally</span>
              </div>
            </div>
          )}

          <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
            <button
              onClick={() => onSelectVideo(current)}
              className="w-full sm:w-auto flex-1 py-3 px-5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
            >
              <span>Watch Full Review & Buy Deals</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            {/* Slider Navigation Buttons */}
            <div className="flex items-center gap-1.5 shrink-0">
              <button
                onClick={handlePrev}
                className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 flex items-center justify-center transition-all cursor-pointer"
                title="Previous Spotlight"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button
                onClick={handleNext}
                className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 flex items-center justify-center transition-all cursor-pointer"
                title="Next Spotlight"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Slider Dots Indicator */}
          <div className="flex items-center justify-center gap-1.5 pt-1">
            {featuredList.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setCurrentIndex(idx)}
                className={`h-1.5 rounded-full transition-all cursor-pointer ${
                  idx === currentIndex ? 'w-6 bg-blue-500' : 'w-1.5 bg-slate-700 hover:bg-slate-500'
                }`}
                aria-label={`Go to slide ${idx + 1}`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
