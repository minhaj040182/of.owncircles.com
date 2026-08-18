import React, { useState } from 'react';
import { 
  X, 
  Sparkles, 
  ShoppingBag, 
  ThumbsUp, 
  ThumbsDown, 
  MessageSquare, 
  ExternalLink, 
  CheckCircle2, 
  ShieldCheck, 
  Tag, 
  Flame, 
  Info, 
  AlertTriangle, 
  Copy, 
  Check, 
  Share2, 
  Layers, 
  Star, 
  CheckCircle, 
  Database, 
  Globe, 
  Youtube, 
  BarChart3,
  Building2
} from 'lucide-react';
import { VideoItem, SentimentType } from '../types';
import { AFFILIATE_ID } from '../utils/affiliate';
import { extractYouTubeId } from '../utils/youtube';
import { SentimentCategoryBarChart } from './SentimentCategoryBarChart';
import { PriceComparisonCard } from './PriceComparisonCard';

interface VideoDetailModalProps {
  video: VideoItem;
  onClose: () => void;
}

export const VideoDetailModal: React.FC<VideoDetailModalProps> = ({ video, onClose }) => {
  const [activeTab, setActiveTab] = useState<'pulse' | 'sentiment' | 'price_comparison' | 'products' | 'comments'>('pulse');
  const [commentFilter, setCommentFilter] = useState<'all' | 'positive' | 'negative' | 'links'>('all');
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [copiedSeoUrl, setCopiedSeoUrl] = useState(false);

  const displayTitle = video.rephrasedTitle || video.title;
  const displayDesc = video.rephrasedDescription || video.pulse.summary;
  const slug = video.slug || 'video-review';
  const fullSeoUrl = `${window.location.origin}/video/${slug}`;

  const handleCopyLink = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedLink(id);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  const handleCopySeoUrl = () => {
    navigator.clipboard.writeText(fullSeoUrl);
    setCopiedSeoUrl(true);
    setTimeout(() => setCopiedSeoUrl(false), 2000);
  };

  const filteredComments = video.comments.filter(c => {
    if (commentFilter === 'positive') return c.sentiment === 'positive';
    if (commentFilter === 'negative') return c.sentiment === 'negative';
    if (commentFilter === 'links') return c.containsAmazonUrl;
    return true;
  });

  const convertedCommentLinksCount = video.comments.filter(c => c.containsAmazonUrl).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-900/60 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="bg-white border border-gray-200 rounded-2xl w-full max-w-5xl overflow-hidden shadow-2xl my-auto text-slate-800 flex flex-col max-h-[92vh]">
        
        {/* Modal Header Bar */}
        <div className="bg-slate-50 px-6 py-4 border-b border-gray-200 flex items-center justify-between gap-4 sticky top-0 z-10">
          <div className="flex items-center gap-3 min-w-0">
            <span className="bg-blue-100 text-blue-700 p-2 rounded-xl shrink-0">
              <Sparkles className="w-5 h-5" />
            </span>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-bold text-slate-900 truncate max-w-xl">
                {displayTitle}
              </h2>
              <p className="text-xs text-slate-500 font-medium truncate">
                Channel: {video.channelTitle} • Category: <span className="capitalize text-blue-600 font-bold">{video.category}</span>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 bg-gray-200 hover:bg-gray-300 text-slate-700 rounded-xl transition-colors shrink-0"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Video Player & Summary Header */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 bg-white">
          
          {/* SEO URL Bar inside Modal */}
          <div className="bg-slate-900 text-slate-200 p-3 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs shadow-inner">
            <div className="flex items-center gap-2 min-w-0">
              <Tag className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="font-semibold text-slate-300 shrink-0">Unique SEO URL:</span>
              <span className="font-mono text-emerald-300 truncate bg-slate-950 px-2.5 py-1 rounded border border-slate-800">
                {fullSeoUrl}
              </span>
            </div>

            <button
              onClick={handleCopySeoUrl}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white font-bold rounded-lg flex items-center gap-1.5 text-xs transition-colors shrink-0"
            >
              {copiedSeoUrl ? (
                <>
                  <Check className="w-3.5 h-3.5 text-white" />
                  <span>SEO URL Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy SEO Link</span>
                </>
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Embedded YouTube Player */}
            <div className="lg:col-span-7 space-y-3">
              <div className="relative aspect-video rounded-xl overflow-hidden bg-slate-900 border border-gray-200 shadow-lg">
                <iframe
                  src={`https://www.youtube.com/embed/${extractYouTubeId(video.youtubeUrl || video.youtubeId)}?autoplay=0&rel=0&enablejsapi=1`}
                  title={displayTitle}
                  className="w-full h-full border-0"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                  referrerPolicy="strict-origin-when-cross-origin"
                  allowFullScreen
                />
              </div>

              <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600 bg-slate-50 p-3 rounded-xl border border-gray-200">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-slate-800">{video.channelTitle}</span>
                  <span>•</span>
                  <span>{video.viewCount} views</span>
                  <span>•</span>
                  <a
                    href={video.youtubeUrl || `https://www.youtube.com/watch?v=${extractYouTubeId(video.youtubeUrl || video.youtubeId)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-red-600 hover:text-red-700 font-bold ml-1"
                  >
                    <Youtube className="w-3.5 h-3.5" />
                    <span>Watch on YouTube</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
                <div className="flex items-center gap-1 text-blue-700 font-bold bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                  <Flame className="w-3.5 h-3.5 text-blue-600" />
                  <span>Viral Index: {video.pulse.viralPotentialScore}/100</span>
                </div>
              </div>
            </div>

            {/* AI Summary Dashboard */}
            <div className="lg:col-span-5 bg-slate-50 p-5 rounded-2xl border border-gray-200 space-y-4 flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-blue-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-blue-600" />
                    SEO Meta Description
                  </span>
                  <span className="text-xs bg-emerald-100 text-emerald-800 font-bold px-2.5 py-0.5 rounded-full border border-emerald-200">
                    Verdict: {video.pulse.buyerRecommendation}
                  </span>
                </div>

                <p className="text-xs text-slate-700 leading-relaxed bg-white p-3 rounded-xl border border-gray-200 shadow-sm mb-3">
                  <strong className="text-slate-900 font-bold block mb-1">Rephrased SEO Description:</strong>
                  {displayDesc}
                </p>

                {/* Visual Category Sentiment Bar Chart */}
                <div className="mt-4">
                  <SentimentCategoryBarChart pulse={video.pulse} topics={video.pulse.topTopics} compact={true} />
                </div>
              </div>

              {/* Verified Product Links */}
              <div className="bg-amber-50 p-3 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-center gap-2.5">
                <CheckCircle2 className="w-5 h-5 text-amber-600 flex-shrink-0" />
                <span>
                  All product purchase links include verified affiliate deal tags.
                </span>
              </div>

            </div>

          </div>

          {/* Tab Selection */}
          <div className="border-b border-gray-200 flex items-center gap-2 pt-2 overflow-x-auto scrollbar-none">
            <button
              onClick={() => setActiveTab('pulse')}
              className={`px-4 py-2.5 text-xs font-bold rounded-t-xl flex items-center gap-2 transition-all border-b-2 whitespace-nowrap ${
                activeTab === 'pulse'
                  ? 'border-blue-600 text-blue-700 bg-blue-50/60'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-gray-100'
              }`}
            >
              <Sparkles className="w-4 h-4 text-blue-600" />
              <span>Key Takeaways</span>
            </button>

            <button
              onClick={() => setActiveTab('sentiment')}
              className={`px-4 py-2.5 text-xs font-bold rounded-t-xl flex items-center gap-2 transition-all border-b-2 whitespace-nowrap ${
                activeTab === 'sentiment'
                  ? 'border-blue-600 text-blue-700 bg-blue-50/60'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-gray-100'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-blue-600" />
              <span>Sentiment Scores &amp; Breakdown</span>
            </button>

            <button
              onClick={() => setActiveTab('price_comparison')}
              className={`px-4 py-2.5 text-xs font-bold rounded-t-xl flex items-center gap-2 transition-all border-b-2 whitespace-nowrap ${
                activeTab === 'price_comparison'
                  ? 'border-blue-600 text-blue-700 bg-blue-50/60'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-gray-100'
              }`}
            >
              <Building2 className="w-4 h-4 text-blue-600" />
              <span>Show Price Comparison</span>
              <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase">
                Geo Live
              </span>
            </button>

            <button
              onClick={() => setActiveTab('products')}
              className={`px-4 py-2.5 text-xs font-bold rounded-t-xl flex items-center gap-2 transition-all border-b-2 whitespace-nowrap ${
                activeTab === 'products'
                  ? 'border-blue-600 text-blue-700 bg-blue-50/60'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-gray-100'
              }`}
            >
              <ShoppingBag className="w-4 h-4 text-blue-600" />
              <span>Featured Products ({video.products.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('comments')}
              className={`px-4 py-2.5 text-xs font-bold rounded-t-xl flex items-center gap-2 transition-all border-b-2 whitespace-nowrap ${
                activeTab === 'comments'
                  ? 'border-blue-600 text-blue-700 bg-blue-50/60'
                  : 'border-transparent text-slate-500 hover:text-slate-800 hover:bg-gray-100'
              }`}
            >
              <MessageSquare className="w-4 h-4 text-blue-600" />
              <span>Viewer Comments ({video.comments.length})</span>
            </button>
          </div>

          {/* TAB 1: AI PULSE DETAILS */}
          {activeTab === 'pulse' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-slate-50 p-5 rounded-2xl border border-gray-200 space-y-2">
                <h3 className="text-sm font-bold text-blue-700 flex items-center gap-2">
                  <Info className="w-4 h-4" />
                  <span>Executive Summary</span>
                </h3>
                <p className="text-xs text-slate-700 leading-relaxed">
                  {video.pulse.summary}
                </p>
              </div>

              {/* Full Category Sentiment Bar Chart */}
              <SentimentCategoryBarChart pulse={video.pulse} topics={video.pulse.topTopics} />

              <div className="bg-slate-50 p-5 rounded-2xl border border-gray-200 space-y-3">
                <h3 className="text-sm font-bold text-blue-700 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-blue-600" />
                  <span>Key Video Highlights</span>
                </h3>
                <ul className="space-y-2">
                  {video.pulse.keyTakeaways.map((takeaway, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs text-slate-700">
                      <span className="text-blue-600 font-bold mt-0.5">•</span>
                      <span>{takeaway}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* TAB 2: SENTIMENT SCORES BY CATEGORY */}
          {activeTab === 'sentiment' && (
            <div className="space-y-4 animate-fadeIn">
              <SentimentCategoryBarChart pulse={video.pulse} topics={video.pulse.topTopics} />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="bg-emerald-50/60 p-4 rounded-xl border border-emerald-200 space-y-2">
                  <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider flex items-center gap-1.5">
                    <ThumbsUp className="w-4 h-4 text-emerald-600" />
                    <span>Positive Driver Factors</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    {(video.pulse.pros || [
                      'Consistent high durability and premium build finishes',
                      'Exceeds price-to-performance expectations in real tests',
                      'Fast setup and intuitive usability highlighted by reviewers'
                    ]).map((pro, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-emerald-600 font-bold">✓</span>
                        <span>{pro}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-rose-50/60 p-4 rounded-xl border border-rose-200 space-y-2">
                  <div className="text-xs font-bold text-rose-800 uppercase tracking-wider flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-rose-600" />
                    <span>Buyer Considerations &amp; Cons</span>
                  </div>
                  <ul className="space-y-1.5 text-xs text-slate-700">
                    {(video.pulse.cons || [
                      'High viral demand can cause temporary regional inventory fluctuation',
                      'Ensure matching compatibility with existing accessories'
                    ]).map((con, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <span className="text-rose-600 font-bold">!</span>
                        <span>{con}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PRICE COMPARISON */}
          {activeTab === 'price_comparison' && (
            <div className="space-y-4 animate-fadeIn">
              <PriceComparisonCard
                productName={video.products[0]?.name || video.title}
                initialPrice={video.products[0]?.estimatedPrice}
                initialRegion={video.region || 'IN'}
                compact={false}
                showCustomSearch={true}
              />
            </div>
          )}

          {/* TAB 4: EXTRACTED PRODUCTS */}
          {activeTab === 'products' && (
            <div className="space-y-4 animate-fadeIn">
              {video.products.map((prod) => (
                <div key={prod.id} className="bg-slate-50 p-5 rounded-2xl border border-gray-200 space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="bg-blue-100 text-blue-800 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                          {prod.category}
                        </span>
                        <div className="flex items-center gap-1 text-amber-600 text-xs font-bold">
                          <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                          <span>{prod.rating} / 5 Rating</span>
                        </div>
                      </div>
                      <h3 className="text-base font-bold text-slate-900 mt-1">
                        {prod.name}
                      </h3>
                      <p className="text-xs text-slate-600 mt-0.5">
                        Best for: <strong className="text-slate-800">{prod.targetAudience}</strong>
                      </p>
                    </div>

                    <div className="flex items-center gap-2.5 flex-wrap sm:flex-nowrap">
                      <div className="text-right mr-1">
                        <span className="text-xs text-slate-500 block">Price</span>
                        <span className="text-lg font-black text-blue-700">{prod.estimatedPrice}</span>
                      </div>

                      <button
                        onClick={() => setActiveTab('price_comparison')}
                        className="px-3.5 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-xl flex items-center gap-1.5 border border-blue-200 transition-all cursor-pointer"
                        title="Compare price across Amazon, Flipkart, Best Buy, Walmart, etc."
                      >
                        <Building2 className="w-4 h-4 text-blue-600" />
                        <span>Compare Prices</span>
                      </button>

                      <a
                        href={prod.affiliateUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-extrabold text-xs rounded-xl flex items-center gap-2 shadow-sm transition-all transform hover:-translate-y-0.5"
                      >
                        <ShoppingBag className="w-4 h-4" />
                        <span>Buy on Amazon</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>

                  {/* Features, Pros and Cons */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-2">
                    <div className="bg-white p-3.5 rounded-xl border border-gray-200 space-y-2">
                      <span className="font-bold text-emerald-700 flex items-center gap-1.5">
                        <ThumbsUp className="w-3.5 h-3.5" /> Pros
                      </span>
                      <ul className="space-y-1 text-slate-700">
                        {prod.pros.map((p, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-emerald-600 font-bold">✓</span>
                            <span>{p}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="bg-white p-3.5 rounded-xl border border-gray-200 space-y-2">
                      <span className="font-bold text-rose-700 flex items-center gap-1.5">
                        <ThumbsDown className="w-3.5 h-3.5" /> Cons
                      </span>
                      <ul className="space-y-1 text-slate-700">
                        {prod.cons.map((c, i) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <span className="text-rose-600 font-bold">✗</span>
                            <span>{c}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: COMMENTS & SENTIMENT ANALYSIS */}
          {activeTab === 'comments' && (
            <div className="space-y-4 animate-fadeIn">
              {/* Comment Filters */}
              <div className="flex items-center justify-between flex-wrap gap-3 bg-slate-50 p-3 rounded-xl border border-gray-200">
                <span className="text-xs font-bold text-slate-700">
                  Filter Comments:
                </span>
                <div className="flex items-center gap-2 text-xs">
                  <button
                    onClick={() => setCommentFilter('all')}
                    className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                      commentFilter === 'all'
                        ? 'bg-blue-600 text-white font-bold'
                        : 'bg-gray-200 text-slate-700 hover:bg-gray-300'
                    }`}
                  >
                    All ({video.comments.length})
                  </button>
                  <button
                    onClick={() => setCommentFilter('positive')}
                    className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                      commentFilter === 'positive'
                        ? 'bg-emerald-600 text-white font-bold'
                        : 'bg-gray-200 text-slate-700 hover:bg-gray-300'
                    }`}
                  >
                    Positive
                  </button>
                  <button
                    onClick={() => setCommentFilter('negative')}
                    className={`px-3 py-1 rounded-lg font-semibold transition-all ${
                      commentFilter === 'negative'
                        ? 'bg-rose-600 text-white font-bold'
                        : 'bg-gray-200 text-slate-700 hover:bg-gray-300'
                    }`}
                  >
                    Negative
                  </button>
                </div>
              </div>

              {/* Comments List */}
              <div className="space-y-3">
                {filteredComments.length === 0 ? (
                  <p className="text-center text-slate-500 py-8 text-xs">
                    No comments match the selected filter.
                  </p>
                ) : (
                  filteredComments.map((comm) => (
                    <div key={comm.id} className="bg-slate-50 p-4 rounded-xl border border-gray-200 space-y-2">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-slate-900">{comm.author}</span>
                          <span className="text-slate-500">• {comm.timestamp}</span>
                        </div>

                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                          comm.sentiment === 'positive'
                            ? 'bg-emerald-100 text-emerald-800'
                            : comm.sentiment === 'negative'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-gray-200 text-slate-700'
                        }`}>
                          {comm.positivityScore}% Positiveness
                        </span>
                      </div>

                      <p className="text-xs text-slate-700 leading-relaxed">
                        {comm.convertedText}
                      </p>

                      <div className="flex items-center gap-3 text-[11px] text-slate-500 pt-1">
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="w-3 h-3 text-blue-600" />
                          {comm.likesCount} likes
                        </span>
                        <span>•</span>
                        <span>Themes: {comm.keyThemes.join(', ')}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

        </div>

        {/* Sticky "Buy on Amazon" Bar for Maximum Affiliate Conversions */}
        {video.products && video.products[0] && (
          <div className="bg-gradient-to-r from-amber-500 via-amber-400 to-amber-500 text-slate-950 p-3 sm:p-4 border-t border-amber-300 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3 sticky bottom-0 z-30">
            <div className="flex items-center gap-3 min-w-0">
              <span className="p-2 bg-slate-950 text-amber-400 rounded-xl font-bold shrink-0 hidden sm:inline-flex">
                <ShoppingBag className="w-5 h-5" />
              </span>
              <div className="min-w-0 text-center sm:text-left">
                <div className="flex items-center justify-center sm:justify-start gap-2 text-xs font-black text-slate-900">
                  <span className="truncate max-w-xs">{video.products[0].name}</span>
                  <span className="bg-slate-950 text-amber-300 px-2 py-0.5 rounded text-[11px] shrink-0 font-extrabold">
                    {video.products[0].estimatedPrice}
                  </span>
                </div>
                <p className="text-[11px] text-slate-800 font-medium truncate">
                  ⚡ Official Amazon Affiliate Deal • Verified Buyer Rating: {video.products[0].rating}/5 ⭐
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
              <a
                href={video.products[0].affiliateUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-6 py-2.5 bg-slate-950 hover:bg-slate-900 text-amber-300 hover:text-amber-200 font-extrabold text-xs sm:text-sm rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all transform hover:scale-102 cursor-pointer border border-amber-400/40"
              >
                <ShoppingBag className="w-4 h-4 text-amber-400" />
                <span>Check Live Price on Amazon</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        )}

        {/* Modal Footer */}
        <div className="bg-slate-50 px-6 py-3 border-t border-gray-200 flex flex-col sm:flex-row items-center justify-between gap-2 text-[11px] text-slate-500">
          <span>As an Amazon Associate, TrendPulse earns from qualifying purchases.</span>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-xs"
          >
            Close Modal
          </button>
        </div>

      </div>
    </div>
  );
};
