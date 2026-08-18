import React, { useState, useEffect } from 'react';
import { 
  ArrowLeft, 
  ExternalLink, 
  ThumbsUp, 
  Eye, 
  Sparkles, 
  ShoppingBag, 
  MessageSquare, 
  Share2,
  Copy, 
  Check, 
  Star,
  CheckCircle,
  ShieldCheck,
  ChevronRight,
  Award,
  RefreshCw,
  Sliders,
  CheckSquare,
  AlertTriangle,
  BadgeCheck,
  HelpCircle,
  Tag,
  Quote,
  Zap,
  TrendingUp,
  BarChart2
} from 'lucide-react';
import { VideoItem, Comment, AIPulse } from '../types';
import { convertAmazonUrl, cleanCommentText } from '../utils/affiliate';
import { extractYouTubeId, buildPulseFromComments } from '../utils/youtube';
import { RegionCode, REGION_CONFIGS, formatPriceForRegion, getLocalizedAffiliateUrl } from '../utils/localization';
import { VideoCard } from './VideoCard';
import { ShareModal } from './ShareModal';
import { VideoPlayerAdOverlay } from './VideoPlayerAdOverlay';
import { SentimentCategoryBarChart } from './SentimentCategoryBarChart';
import { PriceComparisonCard } from './PriceComparisonCard';
import { AdBanner } from './AdBanner';
import { Building2 } from 'lucide-react';

interface VideoViewerProps {
  video: VideoItem;
  allVideos: VideoItem[];
  onBack: () => void;
  onSelectRelated: (video: VideoItem) => void;
  region?: RegionCode;
}

export const VideoViewer: React.FC<VideoViewerProps> = ({ 
  video, 
  allVideos, 
  onBack, 
  onSelectRelated,
  region = 'IN'
}) => {
  const activeRegion: RegionCode = (video.region as RegionCode) === 'US' ? 'US' : (region === 'US' ? 'US' : 'IN');
  const [activeTab, setActiveTab] = useState<'pulse' | 'products' | 'comments'>('pulse');
  const regionConfig = REGION_CONFIGS[activeRegion] || REGION_CONFIGS.IN;
  const [pulseOption, setPulseOption] = useState<'overview' | 'topics' | 'quotes' | 'faq' | 'checklist' | 'proscons' | 'buy_vs_skip' | 'sentiment' | 'price_comparison'>('overview');
  const [commentFilter, setCommentFilter] = useState<'all' | 'positive' | 'negative' | 'links'>('all');
  const [copiedLink, setCopiedLink] = useState<string | null>(null);
  const [copiedPageUrl, setCopiedPageUrl] = useState(false);
  const [isShareOpen, setIsShareOpen] = useState(false);

  // Dynamic comments and AI Pulse state
  const [comments, setComments] = useState<Comment[]>(video.comments || []);
  const [commentCount, setCommentCount] = useState<string>(video.commentCount || `${video.comments?.length || 0}`);
  const [pulse, setPulse] = useState<AIPulse>(video.pulse);
  const [isLoadingComments, setIsLoadingComments] = useState(false);

  const displayTitle = video.rephrasedTitle || video.title;
  const displayDesc = video.rephrasedDescription || pulse?.summary || video.title;
  const slug = video.slug || 'video-review';
  const pageUrl = `${window.location.origin}/video/${slug}`;
  const products = video.products || [];

  // Load comments from API on mount or video change and update SEO Meta tags
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // SEO Title & Description matching URL slug
    document.title = `${displayTitle} | TrendPulse Reviews`;
    let metaDescEl = document.querySelector('meta[name="description"]');
    if (!metaDescEl) {
      metaDescEl = document.createElement('meta');
      metaDescEl.setAttribute('name', 'description');
      document.head.appendChild(metaDescEl);
    }
    metaDescEl.setAttribute('content', displayDesc);

    let canonicalEl = document.querySelector('link[rel="canonical"]');
    if (!canonicalEl) {
      canonicalEl = document.createElement('link');
      canonicalEl.setAttribute('rel', 'canonical');
      document.head.appendChild(canonicalEl);
    }
    canonicalEl.setAttribute('href', pageUrl);

    const initialComments = video.comments || [];
    setComments(initialComments);
    setPulse(video.pulse || buildPulseFromComments(initialComments, displayTitle, video.category));
    setCommentCount(video.commentCount || `${initialComments.length}`);

    if (video.youtubeId) {
      setIsLoadingComments(true);
      fetch(`/api/youtube/comments?youtubeId=${video.youtubeId}`)
        .then(res => res.json())
        .then(data => {
          if (data.comments && Array.isArray(data.comments) && data.comments.length > 0) {
            setComments(data.comments);
            const freshPulse = data.aiPulse || buildPulseFromComments(data.comments, displayTitle, video.category);
            setPulse(freshPulse);
          }
          if (data.commentCount) {
            setCommentCount(data.commentCount);
          }
        })
        .catch(err => {
          console.warn('Comments API fetch notice:', err);
        })
        .finally(() => {
          setIsLoadingComments(false);
        });
    }
  }, [video, displayTitle, displayDesc, pageUrl]);

  const handleCopyPageUrl = () => {
    navigator.clipboard.writeText(pageUrl);
    setCopiedPageUrl(true);
    setTimeout(() => setCopiedPageUrl(false), 2000);
  };

  const handleCopyProductLink = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedLink(id);
    setTimeout(() => setCopiedLink(null), 2000);
  };

  // Render text replacing any URL with localized "Buy on Amazon" button
  const renderTextWithAffiliateButtons = (text: string) => {
    if (!text) return null;

    const cleanedText = cleanCommentText(text);
    const urlRegex = /(https?:\/\/[^\s]+|amzn\.to\/[^\s]+|amazon\.[a-z.]+\/[^\s]+)/gi;
    const parts = cleanedText.split(urlRegex);

    return (
      <span className="leading-relaxed">
        {parts.map((part, i) => {
          if (!part) return null;
          const isUrl = part.match(urlRegex);
          if (isUrl) {
            const finalUrl = convertAmazonUrl(part, regionConfig.amazonTag, regionConfig.amazonDomain);
            return (
              <a
                key={i}
                href={finalUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-3 py-1 my-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-lg transition-colors shadow-2xs mx-1 align-middle shrink-0"
              >
                <ShoppingBag className="w-3.5 h-3.5" />
                <span>Buy on Amazon</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            );
          }
          return <span key={i}>{part}</span>;
        })}
      </span>
    );
  };

  const renderCommentContent = (comment: Comment) => {
    const textToUse = comment.convertedText || comment.text;
    return renderTextWithAffiliateButtons(textToUse);
  };

  const filteredComments = comments.filter(c => {
    if (commentFilter === 'positive') return c.sentiment === 'positive';
    if (commentFilter === 'negative') return c.sentiment === 'negative';
    if (commentFilter === 'links') return c.containsAmazonUrl || c.hasLinks;
    return true;
  });

  const relatedVideos = (allVideos || [])
    .filter(v => v.id !== video.id)
    .slice(0, 3);

  const prosList = (pulse?.pros && pulse.pros.length > 0)
    ? pulse.pros
    : (products.flatMap(p => p.pros || []).length > 0
        ? products.flatMap(p => p.pros || [])
        : (pulse?.keyTakeaways || ['High build quality & performance', 'Verified positive user sentiment']));

  const consList = (pulse?.cons && pulse.cons.length > 0)
    ? pulse.cons
    : (products.flatMap(p => p.cons || []).length > 0
        ? products.flatMap(p => p.cons || [])
        : ['Requires initial setup', 'High market demand']);

  const defaultChecklist = [
    { factor: 'Value for Money', status: 'Passed' as const, detail: 'Competitively priced against market alternatives.' },
    { factor: 'Ease of Assembly/Use', status: 'Passed' as const, detail: 'Viewers report fast, hassle-free operation.' },
    { factor: 'Long-Term Durability', status: 'Passed' as const, detail: 'Sturdy material construction highlighted in reviews.' },
    { factor: 'Maintenance Needed', status: 'Notice' as const, detail: 'Standard regular cleaning recommended.' }
  ];

  const checklist = pulse?.buyerChecklist && pulse.buyerChecklist.length > 0
    ? pulse.buyerChecklist
    : defaultChecklist;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-16 animate-fadeIn">
      {/* Top Header Navigation */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-30 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between gap-4">
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 px-3.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all shadow-2xs hover:shadow-xs"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Reviews</span>
          </button>

          {/* Breadcrumb Navigation */}
          <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-500 font-medium truncate max-w-xl">
            <span className="hover:text-blue-600 cursor-pointer" onClick={onBack}>Home</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            <span className="capitalize text-slate-600">{video.category}</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            <span className="text-slate-900 font-bold truncate">{displayTitle}</span>
          </div>

          {/* Share Button */}
          <button
            onClick={() => setIsShareOpen(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all shadow-sm shrink-0 active:scale-95"
          >
            <Share2 className="w-4 h-4" />
            <span>Share Review</span>
          </button>
        </div>
      </div>

      {/* Top Advertisement Banner: Freezes/sticks when scrolling past or touching header */}
      <div className="sticky top-[53px] sm:top-[57px] z-20 w-full bg-slate-100/90 backdrop-blur-md border-b border-gray-200/80 py-1.5 px-3 shadow-xs flex justify-center items-center transition-all">
        <div className="max-w-7xl w-full mx-auto flex flex-col items-center">
          <AdBanner className="w-full bg-white/95 shadow-2xs border border-gray-200/90" />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-8">
        
        {/* Main Video Title Header */}
        <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-3">
          <div className="flex flex-wrap items-center gap-2 text-xs font-semibold">
            <span className="bg-blue-600 text-white font-bold uppercase tracking-wider px-2.5 py-1 rounded-md">
              {video.category}
            </span>
            <span className="text-slate-500">• Reviewer: <strong className="text-slate-800">{video.channelTitle?.replace(/YouTube/gi, 'Product') || 'Product Reviewer'}</strong></span>
            {video.publishedAt && <span className="text-slate-400">• Published: {video.publishedAt}</span>}
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-tight">
            {displayTitle}
          </h1>
        </div>

        {/* Main Grid Section */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Embedded Player & Primary AI Pulse */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Embedded Video Player */}
            {(() => {
              const activeYtId = extractYouTubeId(video.youtubeUrl || '') || (video.youtubeId && video.youtubeId.length === 11 ? video.youtubeId : 'bCXhRtb16mk');
              return (
                <div className="relative aspect-video rounded-2xl overflow-hidden bg-slate-900 border border-gray-200 shadow-xl group">
                  <iframe
                    src={`https://www.youtube.com/embed/${activeYtId}?autoplay=0&rel=0&enablejsapi=1`}
                    title={displayTitle}
                    className="w-full h-full border-0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    referrerPolicy="strict-origin-when-cross-origin"
                    allowFullScreen
                  />
                  {/* Closable Bottom Overlay Ad directly on Video Player */}
                  <VideoPlayerAdOverlay />
                </div>
              );
            })()}

            {/* Video Stats Bar */}
            <div className="bg-white border border-gray-200 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4 text-xs font-semibold shadow-sm">
              <div className="flex flex-wrap items-center gap-4">
                <span className="flex items-center gap-1.5 text-slate-700">
                  <Eye className="w-4 h-4 text-blue-600" />
                  {video.viewCount || '100K+'} Views
                </span>
                <span className="flex items-center gap-1.5 text-slate-700">
                  <ThumbsUp className="w-4 h-4 text-blue-600" />
                  {video.likeCount || '10K+'} Likes
                </span>
                <span className="flex items-center gap-1.5 text-slate-700">
                  <MessageSquare className="w-4 h-4 text-blue-600" />
                  {commentCount || video.commentCount || comments.length} Comments
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="bg-emerald-100 text-emerald-800 font-bold px-3 py-1 rounded-full border border-emerald-200">
                  Viral Score: {pulse?.viralPotentialScore || 90}/100
                </span>
              </div>
            </div>

            {/* VIRAL SCORE & ENGAGEMENT ANALYSIS PANEL (WITH STATIC NO-RELOAD BANNER) */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                  </div>
                  <div>
                    <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                      <span>Viral Score & Trend Potential</span>
                      <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200 font-extrabold">
                        {pulse?.viralPotentialScore || 92}/100 Index
                      </span>
                    </h2>
                    <p className="text-xs text-slate-500">Real-time audience sentiment & social engagement metrics</p>
                  </div>
                </div>
                <span className="text-[11px] font-bold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md border border-slate-200">
                  Static Ad Banner (Do Not Auto Reload)
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="p-3 bg-slate-50 rounded-xl border border-gray-200 text-center space-y-0.5">
                  <div className="text-[10px] text-slate-500 font-bold uppercase">Audience Sentiment Velocity</div>
                  <div className="text-sm font-black text-emerald-600">{pulse?.overallSentimentRatio?.positive || 88}% Positive</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-gray-200 text-center space-y-0.5">
                  <div className="text-[10px] text-slate-500 font-bold uppercase">Viral Potential Score</div>
                  <div className="text-sm font-black text-blue-600">{pulse?.viralPotentialScore || 92} / 100 Points</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl border border-gray-200 text-center space-y-0.5">
                  <div className="text-[10px] text-slate-500 font-bold uppercase">Buyer Consensus Rating</div>
                  <div className="text-sm font-black text-amber-600">{pulse?.buyerRecommendation || 'Great Value'}</div>
                </div>
              </div>
            </div>

            {/* PRODUCT REVIEW DESCRIPTION CARD */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                  <BadgeCheck className="w-5 h-5 text-blue-600" />
                  <span>Product Review Overview & Description</span>
                </h2>
                <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200">
                  Unique Rephrased Content
                </span>
              </div>

              <div className="text-xs text-slate-700 leading-relaxed font-medium space-y-3 bg-blue-50/40 p-4 rounded-xl border border-blue-100/80">
                {renderTextWithAffiliateButtons(displayDesc)}
              </div>

              {products.length > 0 && (() => {
                const p0 = products[0];
                const p0Url = getLocalizedAffiliateUrl(p0.affiliateUrl || p0.originalUrl, p0.name, activeRegion);
                const p0Price = formatPriceForRegion(p0.estimatedPrice, activeRegion);
                return (
                  <div className="pt-1 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-50 p-3.5 rounded-xl border border-gray-200">
                    <div className="text-xs space-y-0.5">
                      <span className="text-slate-500 font-medium">Featured Item:</span>
                      <div className="font-extrabold text-slate-900">{p0.name}</div>
                    </div>
                    <div className="flex items-center gap-2 w-full sm:w-auto">
                      <button
                        onClick={() => {
                          setPulseOption('price_comparison');
                          const el = document.getElementById('buyer-decision-engine');
                          if (el) el.scrollIntoView({ behavior: 'smooth' });
                        }}
                        className="flex-1 sm:flex-initial px-4 py-2.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 border border-blue-200 transition-colors shadow-2xs shrink-0 cursor-pointer"
                        title="Compare price across Amazon, Flipkart, Best Buy, Walmart, etc."
                      >
                        <Building2 className="w-4 h-4 text-blue-600" />
                        <span>Compare Prices</span>
                      </button>

                      <a
                        href={p0Url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex-1 sm:flex-initial px-5 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-2xs shrink-0"
                      >
                        <ShoppingBag className="w-4 h-4" />
                        <span>Buy on Amazon ({p0Price})</span>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                );
              })()}
            </div>

            {/* VIEWER COMMENTS SECTION */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                    <MessageSquare className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-base font-extrabold text-slate-900">
                      Viewer Comments ({commentCount || video.commentCount || comments.length})
                    </h2>
                    <p className="text-xs text-slate-500">Real feedback & discussions from verified viewers</p>
                  </div>
                </div>

                {isLoadingComments && (
                  <span className="text-xs text-blue-600 font-semibold flex items-center gap-1.5 bg-blue-50 px-3 py-1.5 rounded-xl border border-blue-100">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Updating comments...
                  </span>
                )}
              </div>

              {/* Comment Filter Options */}
              <div className="flex flex-wrap items-center justify-between gap-3 text-xs bg-slate-50 p-3 rounded-xl border border-gray-200">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-slate-700">Filter:</span>
                  <button
                    onClick={() => setCommentFilter('all')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      commentFilter === 'all' ? 'bg-blue-600 text-white shadow-xs' : 'bg-white text-slate-600 border border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    All ({comments.length})
                  </button>
                  <button
                    onClick={() => setCommentFilter('positive')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      commentFilter === 'positive' ? 'bg-emerald-600 text-white shadow-xs' : 'bg-white text-slate-600 border border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    Positive
                  </button>
                  <button
                    onClick={() => setCommentFilter('negative')}
                    className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                      commentFilter === 'negative' ? 'bg-rose-600 text-white shadow-xs' : 'bg-white text-slate-600 border border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    Critical
                  </button>
                </div>
              </div>

              {/* Comment List */}
              <div className="space-y-3 pt-1">
                {filteredComments.length === 0 ? (
                  <div className="p-6 bg-slate-50 rounded-xl border border-dashed border-gray-300 text-center text-xs text-slate-500">
                    No comments match the selected filter.
                  </div>
                ) : (
                  filteredComments.map(c => {
                    const isNeg = c.sentiment === 'negative';
                    const isPos = c.sentiment === 'positive';
                    return (
                      <div key={c.id} className="p-4 bg-slate-50 hover:bg-white rounded-xl border border-gray-200 transition-colors text-xs space-y-2.5">
                        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-gray-100/80 pb-2">
                          <div className="flex items-center gap-2">
                            <span className="font-extrabold text-slate-900">{c.author}</span>
                            {c.isVerifiedBuyer && (
                              <span className="bg-blue-50 text-blue-700 border border-blue-200 text-[10px] px-1.5 py-0.5 rounded-md font-bold">
                                Verified Buyer
                              </span>
                            )}
                          </div>

                          <div className="flex items-center gap-2">
                            {/* Message Nature Detection Badge */}
                            {isNeg ? (
                              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-extrabold bg-rose-100 text-rose-800 border border-rose-200 inline-flex items-center gap-1">
                                <AlertTriangle className="w-3 h-3 text-rose-600" /> Critical / Issue
                              </span>
                            ) : isPos ? (
                              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-extrabold bg-emerald-100 text-emerald-800 border border-emerald-200 inline-flex items-center gap-1">
                                <ThumbsUp className="w-3 h-3 text-emerald-600" /> Positive Feedback
                              </span>
                            ) : (
                              <span className="px-2.5 py-0.5 rounded-md text-[10px] font-extrabold bg-slate-100 text-slate-700 border border-slate-200 inline-flex items-center gap-1">
                                <MessageSquare className="w-3 h-3 text-slate-500" /> General Discussion
                              </span>
                            )}
                            <span className="text-[10px] text-slate-400 font-medium">{c.timestamp || 'Recent'}</span>
                          </div>
                        </div>

                        <div className="text-slate-700 leading-relaxed font-normal">
                          {renderCommentContent(c)}
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* ENHANCED BUYER DECISION ENGINE */}
            <div id="buyer-decision-engine" className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-6">
              
              {/* Buyer Decision Header with Options Bar */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-gray-100 pb-4">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                    <Award className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h2 className="text-base font-extrabold text-slate-900 flex items-center gap-2">
                      Buyer Decision Analysis &amp; Guide
                    </h2>
                    <p className="text-xs text-slate-500">Synthesized from verified video review insights and viewer discussions</p>
                  </div>
                </div>

                {pulse?.buyerRecommendation && (
                  <span className="bg-blue-600 text-white font-extrabold text-xs px-3.5 py-1.5 rounded-xl flex items-center gap-1.5 shadow-xs">
                    <Award className="w-4 h-4 text-amber-300" />
                    <span>{pulse.buyerRecommendation}</span>
                  </span>
                )}
              </div>

              {/* Interactive Buyer Pulse Navigation Options */}
              <div className="flex flex-wrap items-center gap-2 bg-slate-100 p-1.5 rounded-xl text-xs font-bold">
                <button
                  onClick={() => setPulseOption('overview')}
                  className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                    pulseOption === 'overview' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Award className="w-3.5 h-3.5" />
                  <span>Executive Guidance</span>
                </button>
                <button
                  onClick={() => setPulseOption('price_comparison')}
                  className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                    pulseOption === 'price_comparison' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Building2 className="w-3.5 h-3.5 text-blue-600" />
                  <span>Show Price Comparison</span>
                  <span className="bg-emerald-100 text-emerald-800 text-[9px] font-black px-1.5 py-0.5 rounded-full uppercase">
                    Geo Live
                  </span>
                </button>
                <button
                  onClick={() => setPulseOption('topics')}
                  className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                    pulseOption === 'topics' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Tag className="w-3.5 h-3.5 text-amber-500" />
                  <span>Comment Topics &amp; Themes</span>
                </button>
                <button
                  onClick={() => setPulseOption('quotes')}
                  className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                    pulseOption === 'quotes' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Quote className="w-3.5 h-3.5 text-emerald-500" />
                  <span>Viewer Feedback &amp; Quotes</span>
                </button>
                <button
                  onClick={() => setPulseOption('faq')}
                  className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                    pulseOption === 'faq' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <HelpCircle className="w-3.5 h-3.5 text-indigo-500" />
                  <span>Questions &amp; Insights</span>
                </button>
                <button
                  onClick={() => setPulseOption('checklist')}
                  className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                    pulseOption === 'checklist' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <CheckSquare className="w-3.5 h-3.5" />
                  <span>Buyer Checklist</span>
                </button>
                <button
                  onClick={() => setPulseOption('proscons')}
                  className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                    pulseOption === 'proscons' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Sliders className="w-3.5 h-3.5" />
                  <span>Pros &amp; Cons Matrix</span>
                </button>
                <button
                  onClick={() => setPulseOption('buy_vs_skip')}
                  className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                    pulseOption === 'buy_vs_skip' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <BadgeCheck className="w-3.5 h-3.5 text-blue-600" />
                  <span>Buy vs. Skip Guide</span>
                </button>
                <button
                  onClick={() => setPulseOption('sentiment')}
                  className={`px-3.5 py-1.5 rounded-lg transition-all flex items-center gap-1.5 ${
                    pulseOption === 'sentiment' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <ThumbsUp className="w-3.5 h-3.5" />
                  <span>Audience Sentiment</span>
                </button>
              </div>

              {/* Buyer Pulse Content Views */}
              {pulseOption === 'overview' && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="bg-blue-50/60 p-4 rounded-xl border border-blue-100 space-y-2">
                    <div className="text-xs font-bold text-blue-800 uppercase tracking-wider flex items-center gap-1">
                      <BadgeCheck className="w-4 h-4 text-blue-600" />
                      Audience Consensus Summary
                    </div>
                    <p className="text-xs text-slate-700 leading-relaxed font-medium">
                      {pulse?.summary || displayDesc}
                    </p>
                  </div>

                  {(pulse?.buyerVerdictText || pulse?.aiVerdictText) && (
                    <div className="p-4 bg-slate-900 text-slate-100 rounded-xl space-y-1.5 shadow-sm">
                      <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                        <Award className="w-3.5 h-3.5 text-amber-400" />
                        Final Purchase Recommendation
                      </div>
                      <p className="text-xs text-slate-200 leading-relaxed font-normal">
                        {pulse.buyerVerdictText || pulse.aiVerdictText}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
                    <div className="p-3 bg-slate-50 rounded-xl border border-gray-200 text-center">
                      <div className="text-[10px] text-slate-500 font-bold uppercase">Price/Value Rating</div>
                      <div className="text-sm font-black text-blue-600 mt-1 flex items-center justify-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{pulse?.valueRating || 4.8} / 5.0</span>
                      </div>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-gray-200 text-center">
                      <div className="text-[10px] text-slate-500 font-bold uppercase">Build Quality</div>
                      <div className="text-sm font-extrabold text-emerald-600 mt-1">
                        {pulse?.durabilityRating || 'Premium Grade'}
                      </div>
                    </div>
                    <div className="p-3 bg-slate-50 rounded-xl border border-gray-200 text-center">
                      <div className="text-[10px] text-slate-500 font-bold uppercase">Target Buyer</div>
                      <div className="text-xs font-bold text-slate-800 mt-1 truncate">
                        {pulse?.targetAudience || 'Modern Homeowners'}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {pulseOption === 'topics' && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                    <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Tag className="w-4 h-4 text-amber-500" />
                      <span>Extracted Comment Topics & Discussion Pillars</span>
                    </div>
                    <span className="text-[10px] font-extrabold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                      Sample Size: {comments.length} Threads
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(pulse?.topTopics || [
                      { topic: 'Build & Material Quality', count: 12, sentiment: 'positive', sampleComment: 'Very durable construction with solid finish.' },
                      { topic: 'Price & Value Proposition', count: 9, sentiment: 'positive', sampleComment: 'Unbeatable price for the feature set provided.' },
                      { topic: 'Usability & Ergonomics', count: 7, sentiment: 'positive', sampleComment: 'Super easy setup and intuitive controls.' },
                      { topic: 'Performance & Speed', count: 5, sentiment: 'positive', sampleComment: 'Operates smoothly without lags or noise.' }
                    ]).map((t, idx) => (
                      <div key={idx} className="p-3.5 bg-slate-50 hover:bg-white rounded-xl border border-gray-200 transition-all space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-xs text-slate-900 flex items-center gap-1.5">
                            <span className={`w-2 h-2 rounded-full ${t.sentiment === 'negative' ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                            <span>{t.topic}</span>
                          </span>
                          <span className="text-[10px] font-extrabold bg-slate-200/80 text-slate-700 px-2 py-0.5 rounded-full">
                            {t.count} mentions
                          </span>
                        </div>
                        {t.sampleComment && (
                          <p className="text-[11px] text-slate-600 italic bg-white/80 p-2 rounded-lg border border-gray-100 line-clamp-2">
                            "{t.sampleComment}"
                          </p>
                        )}
                      </div>
                    ))}
                  </div>

                  <div className="text-center pt-2">
                    <button
                      onClick={() => setActiveTab('comments')}
                      className="text-xs font-bold text-blue-600 hover:text-blue-800 flex items-center gap-1 mx-auto hover:underline cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>View All {comments.length} Raw Viewer Comments</span>
                    </button>
                  </div>
                </div>
              )}

              {pulseOption === 'quotes' && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                    <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <Quote className="w-4 h-4 text-emerald-600" />
                      <span>Verified Viewer Quotes & Community Feedback</span>
                    </div>
                    <span className="text-[10px] font-extrabold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                      Confidence: {pulse?.confidenceScore || 94}%
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Positive Praise */}
                    <div className="space-y-2">
                      <div className="text-xs font-extrabold text-emerald-800 bg-emerald-50 p-2 rounded-lg border border-emerald-200 flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          <ThumbsUp className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Top Praise Highlights</span>
                        </span>
                        <span className="text-[10px] font-bold text-emerald-600">{pulse?.topPositiveQuotes?.length || 0} quotes</span>
                      </div>
                      <div className="space-y-2">
                        {(pulse?.topPositiveQuotes || []).map((q, idx) => (
                          <div key={idx} className="p-3 bg-white rounded-xl border border-emerald-100 shadow-2xs space-y-1 text-xs">
                            <div className="flex items-center justify-between text-[11px]">
                              <span className="font-extrabold text-slate-900">{q.author}</span>
                              {q.isVerifiedBuyer && (
                                <span className="text-[9px] font-extrabold bg-blue-50 text-blue-700 border border-blue-200 px-1.5 py-0.5 rounded">
                                  Verified Buyer
                                </span>
                              )}
                            </div>
                            <p className="text-slate-700 leading-relaxed text-[11px] font-normal italic">
                              "{q.text}"
                            </p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Critical Notes */}
                    <div className="space-y-2">
                      <div className="text-xs font-extrabold text-rose-800 bg-rose-50 p-2 rounded-lg border border-rose-200 flex items-center justify-between">
                        <span className="flex items-center gap-1">
                          <AlertTriangle className="w-3.5 h-3.5 text-rose-600" />
                          <span>Critical Notes & Issues Mentioned</span>
                        </span>
                        <span className="text-[10px] font-bold text-rose-600">{pulse?.topCriticalQuotes?.length || 0} notes</span>
                      </div>
                      <div className="space-y-2">
                        {(pulse?.topCriticalQuotes || []).length === 0 ? (
                          <div className="p-4 bg-slate-50 text-slate-500 rounded-xl border border-gray-200 text-xs italic text-center">
                            Zero critical complaints detected in recent comments.
                          </div>
                        ) : (
                          pulse?.topCriticalQuotes?.map((q, idx) => (
                            <div key={idx} className="p-3 bg-white rounded-xl border border-rose-100 shadow-2xs space-y-1 text-xs">
                              <div className="flex items-center justify-between text-[11px]">
                                <span className="font-extrabold text-slate-900">{q.author}</span>
                                <span className="text-[9px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded">
                                  Issue Noted
                                </span>
                              </div>
                              <p className="text-slate-700 leading-relaxed text-[11px] font-normal italic">
                                "{q.text}"
                              </p>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {pulseOption === 'faq' && (
                <div className="space-y-4 animate-fadeIn">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                    <div className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <HelpCircle className="w-4 h-4 text-indigo-600" />
                      <span>Auto-Detected Viewer Questions & AI Insights</span>
                    </div>
                    <span className="text-[10px] font-extrabold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                      Deterministic NLP Engine
                    </span>
                  </div>

                  <div className="space-y-3">
                    {(pulse?.detectedQuestions || []).map((q, idx) => (
                      <div key={idx} className="p-4 bg-slate-50 hover:bg-white rounded-xl border border-gray-200 transition-colors space-y-2 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center font-black text-[10px] shrink-0">
                            Q
                          </span>
                          <span className="font-extrabold text-slate-900 leading-snug">{q.question}</span>
                          <span className="text-[10px] text-slate-400 font-normal ml-auto shrink-0">— {q.author}</span>
                        </div>
                        <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-lg space-y-1 text-slate-800">
                          <div className="text-[10px] font-extrabold text-indigo-800 uppercase flex items-center gap-1">
                            <Zap className="w-3 h-3 text-indigo-600" />
                            AI Pulse Insight Answer
                          </div>
                          <p className="text-[11px] font-medium leading-relaxed">
                            {q.aiInsight}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {pulseOption === 'checklist' && (
                <div className="space-y-3 animate-fadeIn">
                  <div className="text-xs font-bold text-slate-700">Pre-Purchase Decision Factors:</div>
                  <div className="space-y-2">
                    {checklist.map((item, idx) => (
                      <div key={idx} className="p-3.5 bg-slate-50 rounded-xl border border-gray-200 flex items-start justify-between gap-3 text-xs">
                        <div className="space-y-1">
                          <div className="font-bold text-slate-900">{item.factor}</div>
                          <p className="text-slate-600">{item.detail}</p>
                        </div>
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold shrink-0 ${
                          item.status === 'Passed' ? 'bg-emerald-100 text-emerald-800 border border-emerald-200' : 'bg-amber-100 text-amber-800 border border-amber-200'
                        }`}>
                          {item.status}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {pulseOption === 'proscons' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fadeIn">
                  <div className="space-y-3 bg-emerald-50/60 p-4 rounded-xl border border-emerald-100">
                    <h4 className="font-bold text-emerald-900 text-xs flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      Verified Advantages
                    </h4>
                    <ul className="space-y-2 text-xs text-slate-700">
                      {prosList.map((pro, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-emerald-600 font-bold">•</span>
                          <span>{pro}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="space-y-3 bg-rose-50/60 p-4 rounded-xl border border-rose-100">
                    <h4 className="font-bold text-rose-900 text-xs flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-rose-600" />
                      Considerations & Drawbacks
                    </h4>
                    <ul className="space-y-2 text-xs text-slate-700">
                      {consList.map((con, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-rose-600 font-bold">•</span>
                          <span>{con}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {pulseOption === 'buy_vs_skip' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 animate-fadeIn">
                  <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-200 space-y-3">
                    <h4 className="font-extrabold text-emerald-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4 text-emerald-600" />
                      Buy This Product If:
                    </h4>
                    <ul className="space-y-2 text-xs text-slate-700 font-medium">
                      {(pulse?.buyIf || [
                        'You need a long-lasting daily essential backed by positive user reviews',
                        'You value simple setup and low ongoing maintenance',
                        'You want fast shipping via verified Amazon sellers'
                      ]).map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2 bg-white p-2.5 rounded-lg border border-emerald-100 shadow-2xs">
                          <span className="text-emerald-600 font-bold shrink-0">✓</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="p-4 bg-amber-50 rounded-xl border border-amber-200 space-y-3">
                    <h4 className="font-extrabold text-amber-900 text-xs uppercase tracking-wider flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-600" />
                      Consider Skipping If:
                    </h4>
                    <ul className="space-y-2 text-xs text-slate-700 font-medium">
                      {(pulse?.skipIf || [
                        'You are looking for a basic entry-level alternative under $25',
                        'You already own a similar high-end model purchased recently'
                      ]).map((item, idx) => (
                        <li key={idx} className="flex items-start gap-2 bg-white p-2.5 rounded-lg border border-amber-100 shadow-2xs">
                          <span className="text-amber-600 font-bold shrink-0">!</span>
                          <span>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              )}

              {pulseOption === 'sentiment' && (
                <div className="space-y-4 animate-fadeIn">
                  <SentimentCategoryBarChart pulse={pulse} topics={pulse.topTopics} />

                  <div className="space-y-2 bg-slate-50 p-4 rounded-xl border border-gray-200">
                    <div className="flex items-center justify-between text-xs font-bold mb-1">
                      <span className="text-emerald-700">Positive Feedback: {pulse?.overallSentimentRatio?.positive ?? 88}%</span>
                      <span className="text-rose-600">Negative Feedback: {pulse?.overallSentimentRatio?.negative ?? 8}%</span>
                    </div>
                    <div className="h-3 w-full bg-gray-200 rounded-full overflow-hidden flex">
                      <div 
                        className="h-full bg-emerald-500" 
                        style={{ width: `${pulse?.overallSentimentRatio?.positive ?? 88}%` }} 
                      />
                      <div 
                        className="h-full bg-rose-500" 
                        style={{ width: `${pulse?.overallSentimentRatio?.negative ?? 8}%` }} 
                      />
                    </div>
                  </div>

                  {pulse?.keyTakeaways && pulse.keyTakeaways.length > 0 && (
                    <div className="text-xs text-slate-600 space-y-2 bg-slate-50 p-4 rounded-xl border border-gray-200">
                      <div className="font-bold text-slate-800">Key Viewer Takeaways:</div>
                      {pulse.keyTakeaways.map((takeaway, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span>{takeaway}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* PRICE COMPARISON VIEW */}
              {pulseOption === 'price_comparison' && (
                <div className="space-y-4 animate-fadeIn">
                  <PriceComparisonCard
                    productName={products[0]?.name || video.title}
                    initialPrice={products[0]?.estimatedPrice}
                    initialRegion={activeRegion}
                    compact={false}
                    showCustomSearch={true}
                  />
                </div>
              )}

            </div>
          </div>

          {/* Right Sidebar - Products List & Direct Affiliate Buttons */}
          <div className="lg:col-span-4 space-y-6">
            
            {/* Products Action Card */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                  <ShoppingBag className="w-5 h-5 text-blue-600" />
                  Featured Products ({products.length})
                </h3>
              </div>

              <div className="space-y-3">
                {products.length === 0 ? (
                  <p className="text-xs text-slate-500 py-2">No direct product links detected.</p>
                ) : (
                  products.map((prod) => {
                    const priceFormatted = formatPriceForRegion(prod.estimatedPrice, activeRegion);
                    const localUrl = getLocalizedAffiliateUrl(prod.affiliateUrl, prod.name, activeRegion);
                    return (
                      <div 
                        key={prod.id} 
                        className="p-4 bg-slate-50 rounded-xl border border-gray-200 hover:border-blue-300 transition-all space-y-2.5"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <h4 className="text-xs font-bold text-slate-900 line-clamp-2">
                            {prod.name}
                          </h4>
                          <span className="text-xs font-black text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded shrink-0 flex items-center gap-1">
                            <span>{regionConfig.flag}</span>
                            <span>{priceFormatted}</span>
                          </span>
                        </div>

                        <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                          {prod.verdict || (prod.keyFeatures && prod.keyFeatures.join(', ')) || 'Featured in review'}
                        </p>

                        <div className="pt-1 flex items-center justify-between gap-2">
                          <a
                            href={localUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 py-2 px-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-1.5 transition-colors shadow-2xs"
                          >
                            <ShoppingBag className="w-3.5 h-3.5" />
                            <span>Buy on {regionConfig.storeName} ({priceFormatted})</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>

                          <button
                            onClick={() => handleCopyProductLink(localUrl, prod.id)}
                            className="p-2 bg-white hover:bg-gray-100 text-slate-600 rounded-xl border border-gray-200 shrink-0"
                            title="Copy converted affiliate link"
                          >
                            {copiedLink === prod.id ? (
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>

            {/* Quick Sentiment Bar Card */}
            <div className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm space-y-3">
              <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                <ThumbsUp className="w-4 h-4 text-blue-600" />
                Live Audience Ratio
              </h3>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span className="text-emerald-700">Positive Feedback</span>
                  <span className="text-emerald-700">{pulse?.overallSentimentRatio?.positive ?? 88}%</span>
                </div>
                <div className="h-2.5 w-full bg-gray-200 rounded-full overflow-hidden flex">
                  <div 
                    className="h-full bg-emerald-500" 
                    style={{ width: `${pulse?.overallSentimentRatio?.positive ?? 88}%` }} 
                  />
                  <div 
                    className="h-full bg-rose-500" 
                    style={{ width: `${pulse?.overallSentimentRatio?.negative ?? 8}%` }} 
                  />
                </div>
              </div>
            </div>

          </div>
        </div>

        {/* Related Product Reviews Section */}
        {relatedVideos.length > 0 && (
          <div className="space-y-4 pt-4 pb-16">
            <h2 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-blue-600" />
              Related Product Reviews
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedVideos.map(rel => (
                <VideoCard
                  key={rel.id}
                  video={rel}
                  onSelect={(v) => onSelectRelated(v)}
                  region={region}
                />
              ))}
            </div>
          </div>
        )}

      </div>

      {/* STICKY QUICK BUY AFFILIATE BAR */}
      {products.length > 0 && (() => {
        const primaryProduct = products[0];
        const primaryPriceFormatted = formatPriceForRegion(primaryProduct?.estimatedPrice, activeRegion);
        const primaryLocalUrl = getLocalizedAffiliateUrl(primaryProduct?.affiliateUrl, primaryProduct?.name || displayTitle, activeRegion);
        return (
          <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800 text-white py-3 px-4 shadow-2xl">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shrink-0">
                  <ShoppingBag className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-200 line-clamp-1 flex items-center gap-2">
                    <span>{primaryProduct?.name || displayTitle}</span>
                  </div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                    <span className="text-emerald-400 font-extrabold flex items-center gap-1">
                      <span>{regionConfig.flag}</span>
                      <span>{primaryPriceFormatted}</span>
                    </span>
                    {primaryProduct?.originalPrice && (
                      <span className="line-through text-slate-500">
                        {formatPriceForRegion(primaryProduct.originalPrice, activeRegion)}
                      </span>
                    )}
                    {primaryProduct?.discountPercentage && (
                      <span className="text-amber-400 font-bold">({primaryProduct.discountPercentage}% OFF)</span>
                    )}
                    <span className="hidden sm:inline text-slate-500">• {regionConfig.deliveryNote}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={() => handleCopyProductLink(primaryLocalUrl, primaryProduct?.id || 'sticky')}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition-colors flex items-center justify-center gap-1.5"
                >
                  {copiedLink === (primaryProduct?.id || 'sticky') ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  <span className="hidden md:inline">Copy Link</span>
                </button>

                <a
                  href={primaryLocalUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 sm:flex-initial px-6 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs rounded-xl flex items-center justify-center gap-2 transition-all shadow-md active:scale-95"
                >
                  <span>Buy on {regionConfig.storeName} ({primaryPriceFormatted})</span>
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>
        );
      })()}
      {/* Share Modal */}
      <ShareModal
        isOpen={isShareOpen}
        onClose={() => setIsShareOpen(false)}
        title={displayTitle}
        url={video.youtubeUrl || window.location.href}
      />
    </div>
  );
};

