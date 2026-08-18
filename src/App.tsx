import React, { useState, useEffect, useCallback } from 'react';
import { 
  Sparkles, 
  Flame, 
  ShieldCheck, 
  TrendingUp, 
  Search, 
  Filter, 
  PlusCircle, 
  Link as LinkIcon, 
  Database, 
  CheckCircle2, 
  ThumbsUp, 
  ShoppingBag, 
  Layers, 
  Clock,
  ArrowUpDown,
  Home,
  Dumbbell,
  Utensils,
  ExternalLink,
  RefreshCw,
  Globe,
  Tag,
  Download,
  Heart
} from 'lucide-react';

import { Category, VideoItem } from './types';
import { AFFILIATE_ID } from './utils/affiliate';
import { updatePageSeo } from './utils/seo';
import { RegionCode, detectUserRegion, REGION_CONFIGS } from './utils/localization';
import { CurrencyCode, detectUserCurrency } from './utils/currency';
import { generateTenReviewVideosBatch } from './utils/youtube';

import { Navbar } from './components/Navbar';
import { VideoCard } from './components/VideoCard';
import { VideoViewer } from './components/VideoViewer';
import { FeaturedVideoCarousel } from './components/FeaturedVideoCarousel';
import { PartitionedVideoSections } from './components/PartitionedVideoSections';
import { AmazonVerticalBanner } from './components/AmazonVerticalBanner';
import { AmazonMobileDealCard } from './components/AmazonMobileDealCard';
import { AdBanner } from './components/AdBanner';
import { AddVideoModal } from './components/AddVideoModal';
import { CronUrlModal } from './components/CronUrlModal';
import { Footer } from './components/Footer';
import { LoadingProgressBar } from './components/LoadingProgressBar';
import { RecentlyViewed } from './components/RecentlyViewed';
import { GoogleTrendingProducts } from './components/GoogleTrendingProducts';
import { PriceComparisonModal } from './components/PriceComparisonModal';
import { DeveloperTools, DevToolType } from './components/DeveloperTools';
import { isCategoryMatch } from './utils/categoryMatcher';
import { Building2 } from 'lucide-react';

export default function App() {
  const [videos, setVideos] = useState<VideoItem[]>([]);
  const [currentDevTool, setCurrentDevTool] = useState<DevToolType | null>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (path.includes('base64-encoder-decoder')) return 'base64';
      if (path.includes('yaml-converter')) return 'yaml';
      if (path.includes('csv-to-json')) return 'csv';
    }
    return null;
  });

  const [region, setRegion] = useState<RegionCode>(() => {
    return detectUserRegion();
  });

  const [selectedCategory, setSelectedCategory] = useState<Category>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'viral' | 'positiveness' | 'views'>('viral');

  // Price Comparison Modal State
  const [isPriceComparisonModalOpen, setIsPriceComparisonModalOpen] = useState(false);
  const [priceComparisonQuery, setPriceComparisonQuery] = useState('');
  const [priceComparisonPrice, setPriceComparisonPrice] = useState<string | undefined>(undefined);

  const handleOpenPriceComparison = (query?: string, price?: string) => {
    const defaultQuery = query || searchQuery || (videos[0]?.products[0]?.name) || 'Smart Gadget';
    setPriceComparisonQuery(defaultQuery);
    setPriceComparisonPrice(price || (videos[0]?.products[0]?.estimatedPrice));
    setIsPriceComparisonModalOpen(true);
  };

  // Saved / Bookmarked deals state
  const [savedVideoIds, setSavedVideoIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('trendpulse_saved_deals');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch (err) {
      console.warn('Failed to parse saved deals from localStorage:', err);
    }
    return [];
  });

  // Auto-detected Currency state based on location
  const [selectedCurrency] = useState<CurrencyCode>(() => {
    return detectUserCurrency();
  });

  const toggleSaveVideo = useCallback((videoId: string) => {
    setSavedVideoIds(prev => {
      const exists = prev.includes(videoId);
      const updated = exists ? prev.filter(id => id !== videoId) : [...prev, videoId];
      try {
        localStorage.setItem('trendpulse_saved_deals', JSON.stringify(updated));
      } catch (err) {
        console.warn('Failed to save deals to localStorage:', err);
      }
      setPullNotification(exists ? 'Deal removed from your saved list.' : '💖 Deal saved to your bookmarks!');
      setTimeout(() => setPullNotification(null), 2500);
      return updated;
    });
  }, []);

  const [selectedVideo, setSelectedVideo] = useState<VideoItem | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isCronModalOpen, setIsCronModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isLoadingVideos, setIsLoadingVideos] = useState(true);
  const [loadingProgress, setLoadingProgress] = useState(15);
  const [loadingStage, setLoadingStage] = useState('Connecting to Video Database...');
  const [pullNotification, setPullNotification] = useState<string | null>(null);

  // Recently Viewed state loaded from localStorage
  const [recentlyViewed, setRecentlyViewed] = useState<VideoItem[]>(() => {
    try {
      const saved = localStorage.getItem('trendpulse_recently_viewed');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.slice(0, 5);
        }
      }
    } catch (err) {
      console.warn('Failed to parse recently viewed from localStorage:', err);
    }
    return [];
  });

  // Clear any legacy localStorage cache on mount
  useEffect(() => {
    try {
      localStorage.removeItem('trendpulse_videos');
      localStorage.removeItem('trendpulse_currency');
    } catch {}
  }, []);

  // Helper to strictly deduplicate videos by ID and YouTube ID
  const deduplicateVideos = useCallback((list: VideoItem[]): VideoItem[] => {
    const seenIds = new Set<string>();
    const seenYtIds = new Set<string>();
    return list.filter(v => {
      const yt = v.youtubeId || v.id;
      if (seenIds.has(v.id) || (yt && seenYtIds.has(yt))) {
        return false;
      }
      seenIds.add(v.id);
      if (yt) seenYtIds.add(yt);
      return true;
    });
  }, []);

  // Load videos directly from PHP API (api_mysql.php?action=get_videos&region=X) or direct pull fallback
  const loadVideosFromDatabase = useCallback(async (targetRegion: RegionCode = region) => {
    setIsLoadingVideos(true);
    setLoadingProgress(15);
    setLoadingStage(`Detecting Location (${targetRegion}) & Connecting to Database...`);

    const timer1 = setTimeout(() => {
      setLoadingProgress(45);
      setLoadingStage(`Fetching Product Reviews for Region (${targetRegion})...`);
    }, 200);

    const timer2 = setTimeout(() => {
      setLoadingProgress(75);
      setLoadingStage('Analyzing Viewer Sentiments with AI Pulse...');
    }, 450);

    // Log location visit in database asynchronously
    try {
      fetch(`https://trends.owncircles.com/api_mysql.php?action=log_visit&region=${targetRegion}`).catch(() => {
        fetch(`/api_mysql.php?action=log_visit&region=${targetRegion}`).catch(() => {});
      });
    } catch {}

    try {
      let data: any = null;
      // 1. Fetch from live MySQL backend API on trends.owncircles.com first
      try {
        const prodRes = await fetch(`https://trends.owncircles.com/api_mysql.php?action=get_videos&region=${targetRegion}`);
        if (prodRes.ok) {
          const text = await prodRes.text();
          if (text.trim().startsWith('{') || text.trim().startsWith('[')) {
            data = JSON.parse(text);
          }
        }
      } catch (e) {
        console.warn('[DB] Remote API fetch failed:', e);
      }

      if (!data) {
        const localRes = await fetch(`/api_mysql.php?action=get_videos&region=${targetRegion}`);
        if (localRes.ok) {
          const text = await localRes.text();
          if (text.trim().startsWith('{') || text.trim().startsWith('[')) {
            data = JSON.parse(text);
          }
        }
      }

      if (data && data.success && Array.isArray(data.videos) && data.videos.length > 0) {
        const deduped = deduplicateVideos(data.videos);
        // Filter out any broken/dummy videos with invalid YouTube IDs
        const validVideos = deduped.filter(v => {
          const ytId = v.youtubeId || (v.youtubeUrl ? (v.youtubeUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/) || [])[1] : '');
          return ytId && ytId.length === 11 && ytId !== 'undefined' && ytId !== 'null';
        });

        if (validVideos.length > 0) {
          setVideos(validVideos);
          setLoadingProgress(100);
          setLoadingStage('Catalog Ready');
          setTimeout(() => setIsLoadingVideos(false), 350);
          return validVideos;
        }
      }
    } catch (err) {
      console.warn('[Database Sync] Database query error, initiating direct YouTube pull:', err);
    } finally {
      clearTimeout(timer1);
      clearTimeout(timer2);
    }

    // Direct YouTube pull & automatic backend save if 0 videos in database for targetRegion
    const pulledVids = generateTenReviewVideosBatch('all', 0, targetRegion);
    const validPulled = pulledVids.filter(v => {
      const ytId = v.youtubeId || (v.youtubeUrl ? (v.youtubeUrl.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=|shorts\/))([\w-]{11})/) || [])[1] : '');
      return ytId && ytId.length === 11;
    });
    const dedupedPulled = deduplicateVideos(validPulled);
    setVideos(dedupedPulled);

    setLoadingProgress(100);
    setLoadingStage('Catalog Ready');
    setTimeout(() => setIsLoadingVideos(false), 350);
    return dedupedPulled;
  }, [region, deduplicateVideos]);

  useEffect(() => {
    const userRegion = detectUserRegion();
    setRegion(userRegion);
    loadVideosFromDatabase(userRegion).then((loadedVids) => {
      syncRouteFromUrl(loadedVids || videos);
    });
  }, []);

  // Sync selected video modal state with URL slug and track recently viewed videos in localStorage
  const handleSelectVideo = useCallback((video: VideoItem) => {
    setSelectedVideo(video);
    const slug = video.slug || 'video-review';
    window.history.pushState({ videoId: video.id, slug }, '', `/video/${slug}`);
    updatePageSeo(video);

    // Track in Recently Viewed (Max 5 items, newest first, deduplicated)
    setRecentlyViewed(prev => {
      const filtered = prev.filter(v => v.id !== video.id && v.youtubeId !== video.youtubeId);
      const updated = [video, ...filtered].slice(0, 5);
      try {
        localStorage.setItem('trendpulse_recently_viewed', JSON.stringify(updated));
      } catch (err) {
        console.warn('Failed to save recently viewed to localStorage:', err);
      }
      return updated;
    });
  }, []);

  const handleClearRecentlyViewed = useCallback(() => {
    setRecentlyViewed([]);
    try {
      localStorage.removeItem('trendpulse_recently_viewed');
    } catch (err) {
      console.warn('Failed to clear recently viewed from localStorage:', err);
    }
  }, []);

  const handleCloseVideo = useCallback(() => {
    setSelectedVideo(null);
    window.history.pushState({}, '', '/');
    updatePageSeo(null);
  }, []);

  const handleGoHome = useCallback(() => {
    setSelectedCategory('all');
    setSearchQuery('');
    setSelectedVideo(null);
    setCurrentDevTool(null);
    window.history.pushState({}, '', '/');
    updatePageSeo(null);
  }, []);

  // Sync state from current URL pathname on load or browser back/forward
  const syncRouteFromUrl = useCallback(async (videoList: VideoItem[]) => {
    const path = window.location.pathname;

    // Check for Developer Tool URLs
    if (path.includes('base64-encoder-decoder')) {
      setCurrentDevTool('base64');
      setSelectedVideo(null);
      return;
    }
    if (path.includes('yaml-converter')) {
      setCurrentDevTool('yaml');
      setSelectedVideo(null);
      return;
    }
    if (path.includes('csv-to-json')) {
      setCurrentDevTool('csv');
      setSelectedVideo(null);
      return;
    }

    setCurrentDevTool(null);

    if (path.startsWith('/video/')) {
      const slugFromUrl = path.replace('/video/', '').trim();
      if (slugFromUrl) {
        const found = videoList.find(
          v => v.slug === slugFromUrl || v.id === slugFromUrl || (v.rephrasedTitle && v.rephrasedTitle.toLowerCase().includes(slugFromUrl.replace(/-/g, ' ')))
        );
        if (found) {
          setSelectedVideo(found);
          updatePageSeo(found);
          return;
        }
      }
    }
    setSelectedVideo(null);
    updatePageSeo(null);
  }, []);

  // Listen for browser navigation (Back/Forward)
  useEffect(() => {
    const handlePopState = () => {
      syncRouteFromUrl(videos);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [videos, syncRouteFromUrl]);

  // Handler to auto-fetch category/product videos when needed
  const handleAutoFetchOnEmpty = useCallback(async (cat: string, query: string = '') => {
    setIsRefreshing(true);
    const cleanLabel = query || cat.replace(/_/g, ' ');
    setPullNotification(`Please wait, fetching 5 product review videos for "${cleanLabel}"...`);
    try {
      const trendingCronUrl = `https://trends.owncircles.com/cron_hourly_trending.php?region=${region}&product=${encodeURIComponent(query || cat)}`;
      const prodCronUrl = `https://trends.owncircles.com/cron_youtube_fetch.php?category=${encodeURIComponent(cat)}&geo=${region}&q=${encodeURIComponent(query || cat)}`;
      
      try {
        await fetch(trendingCronUrl);
      } catch (e) {
        console.warn('Prod trending cron error, trying local fallback:', e);
        await fetch(`/cron_hourly_trending.php?region=${region}&product=${encodeURIComponent(query || cat)}`).catch(() => {});
      }

      try {
        await fetch(prodCronUrl);
      } catch (e) {
        console.warn('Prod cron fetch error, trying local fallback:', e);
        await fetch(`/cron_youtube_fetch.php?category=${encodeURIComponent(cat)}&geo=${region}&q=${encodeURIComponent(query || cat)}`).catch(() => {});
      }

      await loadVideosFromDatabase(region);
    } catch (err) {
      console.warn('Auto fetch failed:', err);
      await loadVideosFromDatabase(region);
    } finally {
      setIsRefreshing(false);
      setTimeout(() => setPullNotification(null), 2500);
    }
  }, [region, loadVideosFromDatabase]);

  const handleSelectCategory = useCallback((cat: Category) => {
    setSelectedCategory(cat);
    setSearchQuery('');

    if (cat !== 'all' && cat !== 'viral' && cat !== 'top_rated' && cat !== 'saved') {
      const existing = videos.filter(v => 
        (!v.region || v.region === region) && isCategoryMatch(v.category, cat)
      );
      if (existing.length === 0) {
        handleAutoFetchOnEmpty(cat, '');
      }
    }
  }, [videos, region, handleAutoFetchOnEmpty]);

  const handleSelectTrendingProduct = useCallback((productName: string, category: string) => {
    setSelectedCategory(category as Category);
    setSearchQuery(productName);

    // Auto-fetch fresh top 5 reviews for this trending product, saving to DB & updating sitemap
    handleAutoFetchOnEmpty(category, productName);
  }, [handleAutoFetchOnEmpty]);

  // Handler to refresh video list from MySQL database
  const handleRefreshDatabase = async () => {
    setIsRefreshing(true);
    setPullNotification('Refreshing video catalog...');
    await loadVideosFromDatabase(region);
    setIsRefreshing(false);
    setTimeout(() => setPullNotification(null), 2500);
  };

  const handleVideoAdded = (newVid: VideoItem) => {
    setVideos(prev => [newVid, ...prev]);
    handleSelectVideo(newVid);
  };

  const handleRegionChange = (newRegion: RegionCode) => {
    setRegion(newRegion);
    try {
      localStorage.setItem('trendpulse_user_region', newRegion);
    } catch (e) {
      console.warn('Failed to save region in localStorage:', e);
    }
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set('region', newRegion);
    window.history.pushState({}, '', newUrl.toString());
    loadVideosFromDatabase(newRegion);
  };

  // Anchor Noun Groups for strict product match when searching
  const ANCHOR_NOUN_GROUPS = [
    {
      groupName: 'tv',
      queryKeywords: ['tv', 'tvs', 'television', 'televisions', 'oled', 'qled', 'led tv', 'smart tv'],
      videoKeywords: ['tv', 'tvs', 'television', 'televisions', 'oled', 'qled', 'led tv', 'smart tv', 'screen', 'display']
    },
    {
      groupName: 'refrigerator',
      queryKeywords: ['fridge', 'refrigerator', 'freezer'],
      videoKeywords: ['fridge', 'refrigerator', 'freezer', 'double door', 'french door', 'cooling']
    },
    {
      groupName: 'smartphone',
      queryKeywords: ['phone', 'smartphone', 'mobile', 'iphone', 'galaxy', 'pixel'],
      videoKeywords: ['phone', 'smartphone', 'mobile', 'iphone', 'galaxy', 'pixel', 'oneplus', 'android']
    },
    {
      groupName: 'laptop',
      queryKeywords: ['laptop', 'notebook', 'macbook', 'chromebook'],
      videoKeywords: ['laptop', 'notebook', 'macbook', 'chromebook', 'computer']
    },
    {
      groupName: 'vacuum',
      queryKeywords: ['vacuum', 'dyson', 'roomba'],
      videoKeywords: ['vacuum', 'cleaner', 'dyson', 'roomba', 'mop', 'sweeper']
    },
    {
      groupName: 'treadmill',
      queryKeywords: ['treadmill', 'walking pad'],
      videoKeywords: ['treadmill', 'walking pad', 'running pad']
    },
    {
      groupName: 'fryer',
      queryKeywords: ['fryer', 'air fryer'],
      videoKeywords: ['fryer', 'air fryer', 'cooker']
    },
    {
      groupName: 'earbuds',
      queryKeywords: ['earbuds', 'headphones', 'earphones', 'airpods'],
      videoKeywords: ['earbuds', 'headphones', 'earphones', 'airpods', 'audio']
    },
    {
      groupName: 'blender',
      queryKeywords: ['blender', 'juicer', 'mixer'],
      videoKeywords: ['blender', 'juicer', 'mixer', 'grinder']
    },
    {
      groupName: 'watch',
      queryKeywords: ['watch', 'smartwatch'],
      videoKeywords: ['watch', 'smartwatch']
    }
  ];

  // Evaluate relevancy score and match boolean for search queries
  const evaluateVideoRelevancy = (vid: VideoItem, query: string): { matches: boolean; score: number } => {
    if (!query) return { matches: true, score: 0 };

    const cleanQuery = query.toLowerCase().trim();
    const fullText = (
      (vid.title || '') + ' ' + 
      (vid.rephrasedTitle || '') + ' ' + 
      (vid.rephrasedDescription || '') + ' ' + 
      (vid.channelTitle || '') + ' ' + 
      (vid.pulse?.summary || '') + ' ' + 
      (vid.products || []).map(p => (p.name || '') + ' ' + (p.category || '')).join(' ')
    ).toLowerCase();

    // 1. Direct exact or substring match
    if (fullText.includes(cleanQuery)) {
      return { matches: true, score: 500 };
    }

    // 2. Check anchor noun groups
    let requiredVideoKeywords: string[] | null = null;
    for (const group of ANCHOR_NOUN_GROUPS) {
      if (group.queryKeywords.some(kw => cleanQuery.includes(kw))) {
        requiredVideoKeywords = group.videoKeywords;
        break;
      }
    }

    if (requiredVideoKeywords) {
      const hasAnchorTerm = requiredVideoKeywords.some(kw => fullText.includes(kw));
      if (!hasAnchorTerm) {
        return { matches: false, score: 0 };
      }
    }

    // 3. Tokenize query (keep words length >= 2, filter stop words)
    const stopWords = new Set(['best', 'top', 'new', '2026', '2025', '2024', 'review', 'reviews', 'the', 'and', 'for', 'with', 'item', 'from', 'finds', 'amazon', 'find', 'buy', 'cheap', 'deal', 'deals', 'gadget', 'gadgets', 'product', 'products']);
    const tokens = cleanQuery
      .split(/[^a-z0-9]+/)
      .filter(w => w.length >= 2 && !stopWords.has(w));

    if (tokens.length === 0) {
      return { matches: true, score: 10 };
    }

    const matchedTokens = tokens.filter(t => fullText.includes(t));
    const matchRatio = matchedTokens.length / tokens.length;

    // Require at least 40% of tokens OR at least 2 tokens
    const matches = matchedTokens.length >= 2 || matchRatio >= 0.4 || (tokens.length === 1 && matchedTokens.length === 1);

    const titleText = ((vid.title || '') + ' ' + (vid.rephrasedTitle || '')).toLowerCase();
    let score = matchedTokens.length * 30;
    matchedTokens.forEach(t => {
      if (titleText.includes(t)) score += 50;
    });

    return { matches, score };
  };

  // Map to store temporary scores for sorting
  const videoScoresMap = new Map<string, number>();

  // Filtering & Sorting
  const filteredVideos = videos.filter(vid => {
    // Strictly filter videos by active user region (e.g. IN, US, etc.)
    const matchesRegion = !vid.region || vid.region === region;
    if (!matchesRegion) return false;

    const query = searchQuery.toLowerCase().trim();
    const { matches: matchesQuery, score } = evaluateVideoRelevancy(vid, query);
    videoScoresMap.set(vid.id, score);

    let matchesCategory = false;
    if (selectedCategory === 'all' || selectedCategory === 'viral' || selectedCategory === 'top_rated' || selectedCategory === 'flash_deals') {
      matchesCategory = true;
    } else if (selectedCategory === 'saved') {
      matchesCategory = savedVideoIds.includes(vid.id);
    } else {
      matchesCategory = isCategoryMatch(vid.category, selectedCategory);
    }

    if (query && matchesQuery) {
      matchesCategory = true;
    }

    return matchesCategory && matchesQuery;
  }).sort((a, b) => {
    const query = searchQuery.toLowerCase().trim();
    if (query) {
      const scoreA = videoScoresMap.get(a.id) || 0;
      const scoreB = videoScoresMap.get(b.id) || 0;
      if (scoreA !== scoreB) {
        return scoreB - scoreA;
      }
    }

    const effectiveSort = selectedCategory === 'viral' || selectedCategory === 'flash_deals' ? 'viral' : selectedCategory === 'top_rated' ? 'positiveness' : sortBy;
    if (effectiveSort === 'viral') return b.pulse.viralPotentialScore - a.pulse.viralPotentialScore;
    if (effectiveSort === 'positiveness') return b.pulse.overallSentimentRatio.positive - a.pulse.overallSentimentRatio.positive;
    if (effectiveSort === 'views') return parseFloat(b.viewCount) - parseFloat(a.viewCount);
    return 0;
  });

  if (currentDevTool) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar 
          selectedCategory={selectedCategory}
          onSelectCategory={handleSelectCategory}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onPullNewVideo={handleRefreshDatabase}
          isPulling={isRefreshing}
          onGoHome={handleGoHome}
          region={region}
          onRegionChange={handleRegionChange}
          savedCount={savedVideoIds.length}
          selectedCurrency={selectedCurrency}
        />
        <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <DeveloperTools 
            initialTool={currentDevTool}
            onBackToHub={handleGoHome}
          />
        </main>
        <Footer />
      </div>
    );
  }

  if (selectedVideo) {
    return (
      <div className="min-h-screen flex flex-col bg-slate-50">
        <Navbar 
          selectedCategory={selectedCategory}
          onSelectCategory={handleSelectCategory}
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          onPullNewVideo={handleRefreshDatabase}
          isPulling={isRefreshing}
          onGoHome={handleGoHome}
          region={region}
          onRegionChange={handleRegionChange}
          savedCount={savedVideoIds.length}
          selectedCurrency={selectedCurrency}
        />
        <VideoViewer
          video={selectedVideo}
          allVideos={videos}
          onBack={handleCloseVideo}
          onSelectRelated={(v) => handleSelectVideo(v)}
          region={region}
        />
        {isAddModalOpen && (
          <AddVideoModal
            onClose={() => setIsAddModalOpen(false)}
            onVideoAdded={handleVideoAdded}
          />
        )}
        {isCronModalOpen && (
          <CronUrlModal
            onClose={() => setIsCronModalOpen(false)}
            onPullCompleted={(newVid) => { if (newVid) handleVideoAdded(newVid); }}
          />
        )}
        <Footer />
      </div>
    );
  }

  const activeRegionConfig = REGION_CONFIGS[region] || REGION_CONFIGS.IN;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      <Navbar 
        selectedCategory={selectedCategory}
        onSelectCategory={handleSelectCategory}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        onPullNewVideo={handleRefreshDatabase}
        isPulling={isRefreshing}
        onGoHome={handleGoHome}
        region={region}
        onRegionChange={handleRegionChange}
        savedCount={savedVideoIds.length}
        selectedCurrency={selectedCurrency}
      />

      {/* Refresh / Database Notification */}
      {pullNotification && (
        <div className="bg-emerald-600 text-white text-xs font-bold py-2.5 px-4 text-center shadow-md flex items-center justify-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          <span>{pullNotification}</span>
        </div>
      )}

      {/* Top Advertisement Banner: Freezes/sticks when scrolling past or touching header */}
      <div className="sticky top-0 z-40 w-full bg-slate-100/90 backdrop-blur-md border-b border-gray-200/80 py-1.5 px-3 shadow-xs flex justify-center items-center transition-all">
        <div className="max-w-7xl w-full mx-auto flex flex-col items-center">
          <AdBanner className="w-full bg-white/95 shadow-2xs border border-gray-200/90" />
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">

        {/* Top 10 Google Trending Products Bar */}
        <GoogleTrendingProducts 
          region={region} 
          onSelectTrendingProduct={handleSelectTrendingProduct} 
          activeSearchQuery={searchQuery}
          onClearFilter={() => setSearchQuery('')}
        />

        {/* Loading Progress Bar when fetching videos */}
        {isLoadingVideos && (
          <LoadingProgressBar 
            progress={loadingProgress} 
            stageMessage={loadingStage} 
            loadedCount={videos.length} 
          />
        )}

        {/* Top Horizontal Video Featured Carousel (Only shown on main default home view) */}
        {!isLoadingVideos && selectedCategory === 'all' && !searchQuery && (
          <FeaturedVideoCarousel 
            videos={videos} 
            onSelectVideo={handleSelectVideo} 
          />
        )}

        {/* Sub-header Bar: Category / Search Filter & Sort Options */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 rounded-2xl border border-gray-200 shadow-2xs">
          <div className="flex items-center gap-2.5 text-xs font-semibold text-slate-600 flex-wrap">
            {selectedCategory !== 'all' ? (
              <div className="flex items-center gap-2">
                <span className="text-slate-700 font-bold flex items-center gap-1.5">
                  Showing: <strong className="text-blue-600 font-black capitalize bg-blue-50 px-2.5 py-1 rounded-lg border border-blue-200">
                    {selectedCategory === 'viral' ? "Today's Viral Hits" : selectedCategory === 'flash_deals' ? "Today's Hot Deals & Viral Picks" : selectedCategory === 'top_rated' ? 'Most Popular & Top Rated' : selectedCategory.replace('_', ' ')}
                  </strong>
                </span>
                <button
                  onClick={handleGoHome}
                  className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2.5 py-1 rounded-lg text-xs font-bold cursor-pointer transition-all border border-gray-200 flex items-center gap-1"
                >
                  <span>View All Sections</span>
                </button>
              </div>
            ) : (
              <span className="text-slate-600 font-bold flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-blue-600" />
                {searchQuery ? `Filtered Results for "${searchQuery}"` : 'Partitioned Review Catalog'}
              </span>
            )}
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="bg-slate-100 hover:bg-slate-200 text-slate-700 px-2 py-0.5 rounded text-[11px] font-bold cursor-pointer"
              >
                Clear Search
              </button>
            )}
          </div>

          {/* Controls: Price Comparison & Sort Controls */}
          <div className="flex items-center gap-2.5 flex-wrap shrink-0 text-xs">
            <button
              onClick={() => handleOpenPriceComparison()}
              className="px-3.5 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 font-extrabold rounded-xl border border-blue-200 transition-all flex items-center gap-1.5 shadow-2xs cursor-pointer"
              title="Compare live store prices for any product across Amazon, Flipkart, Best Buy, Walmart, etc. in your country"
            >
              <Building2 className="w-3.5 h-3.5 text-blue-600" />
              <span>Show Price Comparison</span>
              <span className="bg-emerald-600 text-white text-[9px] font-black px-1.5 py-0.2 rounded uppercase">
                {region} Live
              </span>
            </button>

            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-medium flex items-center gap-1">
                <ArrowUpDown className="w-3.5 h-3.5 text-blue-600" /> Sort:
              </span>
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl border border-gray-200">
                <button
                  onClick={() => setSortBy('viral')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all text-xs cursor-pointer ${
                    sortBy === 'viral'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  Viral
                </button>
                <button
                  onClick={() => setSortBy('positiveness')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all text-xs cursor-pointer ${
                    sortBy === 'positiveness'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  Sentiment
                </button>
                <button
                  onClick={() => setSortBy('views')}
                  className={`px-3 py-1 rounded-lg font-bold transition-all text-xs cursor-pointer ${
                    sortBy === 'views'
                      ? 'bg-blue-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-200/60'
                  }`}
                >
                  Views
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Horizontal Advertisement Panel placed directly after Sort Panel */}
        <AdBanner />

        {/* Main Body Layout with Right-Side Vertical Amazon Affiliate Banner */}
        <div className="flex flex-col lg:flex-row gap-6 items-start">
          {/* Left / Main Catalog Area */}
          <div className="flex-1 min-w-0 space-y-6 w-full">
            {/* VIEW CONDITIONAL: Default Partitioned Sections VS Filtered Search Grid */}
            {selectedCategory === 'all' && !searchQuery ? (
              <PartitionedVideoSections 
                videos={filteredVideos}
                onSelectVideo={handleSelectVideo}
                onSelectCategory={(cat) => setSelectedCategory(cat as Category)}
                region={region}
                savedVideoIds={savedVideoIds}
                onToggleBookmark={toggleSaveVideo}
                selectedCurrency={selectedCurrency}
              />
            ) : filteredVideos.length === 0 ? (
              <div className="bg-white border border-gray-200 rounded-2xl p-10 text-center space-y-4 max-w-lg mx-auto shadow-sm">
                <div className="w-12 h-12 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto">
                  {selectedCategory === 'saved' ? <Heart className="w-6 h-6 fill-rose-500" /> : <Database className="w-6 h-6 text-blue-600" />}
                </div>
                <h3 className="text-base font-bold text-slate-900">
                  {selectedCategory === 'saved' 
                    ? 'No Saved Deals Yet'
                    : 'No Videos Matching Category'
                  }
                </h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {selectedCategory === 'saved'
                    ? 'Click the Heart icon on any video card to bookmark your favorite deals and revisit them here anytime!'
                    : `No video reviews matching category "${selectedCategory.replace('_', ' ')}".`
                  }
                </p>
                {selectedCategory === 'saved' && (
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className="mt-2 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl transition-all cursor-pointer shadow-sm"
                  >
                    Browse All Deals
                  </button>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredVideos.map((video) => (
                  <VideoCard
                    key={video.id}
                    video={video}
                    onSelect={(vid) => handleSelectVideo(vid)}
                    region={region}
                    isBookmarked={savedVideoIds.includes(video.id)}
                    onToggleBookmark={toggleSaveVideo}
                    selectedCurrency={selectedCurrency}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right Side Vertical 160x600 Style Amazon Banner */}
          <AmazonVerticalBanner
            videos={videos}
            region={region}
            selectedCurrency={selectedCurrency}
          />
        </div>

        {/* Amazon Deals Card for Mobile View (hidden on desktop) */}
        <AmazonMobileDealCard
          videos={videos}
          region={region}
          selectedCurrency={selectedCurrency}
        />

        {/* Recently Viewed Videos Section */}
        <RecentlyViewed
          videos={recentlyViewed}
          onSelectVideo={handleSelectVideo}
          onClearHistory={handleClearRecentlyViewed}
          region={region}
        />
      </main>

      {/* Add Video Form Modal */}
      {isAddModalOpen && (
        <AddVideoModal
          onClose={() => setIsAddModalOpen(false)}
          onVideoAdded={handleVideoAdded}
        />
      )}

      {/* Cron Endpoint URL Modal */}
      {isCronModalOpen && (
        <CronUrlModal
          onClose={() => setIsCronModalOpen(false)}
          onPullCompleted={(newVid) => { if (newVid) handleVideoAdded(newVid); }}
        />
      )}

      {/* Price Comparison Modal */}
      {isPriceComparisonModalOpen && (
        <PriceComparisonModal
          isOpen={isPriceComparisonModalOpen}
          onClose={() => setIsPriceComparisonModalOpen(false)}
          productName={priceComparisonQuery}
          initialPrice={priceComparisonPrice}
          initialRegion={region}
        />
      )}

      {/* Footer */}
      <Footer />
    </div>
  );
}
