export type Category = 
  | 'electronics'
  | 'household' 
  | 'gadgets' 
  | 'fitness' 
  | 'kitchen' 
  | 'books_stationery' 
  | 'personal_care' 
  | 'baby_parenting' 
  | 'pet_supplies' 
  | 'home_office' 
  | 'travel_outdoor' 
  | 'reviews' 
  | 'saved'
  | 'viral'
  | 'top_rated'
  | 'flash_deals'
  | 'all';

export type SentimentType = 'positive' | 'negative' | 'neutral';

export interface Comment {
  id: string;
  author: string;
  avatarUrl?: string;
  text: string;
  originalText?: string;
  hasLinks: boolean;
  containsAmazonUrl: boolean;
  convertedText: string;
  sentiment: SentimentType;
  positivityScore: number; // 0 to 100
  negativityScore: number; // 0 to 100
  keyThemes: string[];
  likesCount: number;
  timestamp: string;
  priorityScore: number; // Calculated engagement priority
  isVerifiedBuyer?: boolean;
}

export interface AlternativeProduct {
  name: string;
  price: string;
  affiliateUrl: string;
  reason: string;
  rating: number;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  originalUrl?: string;
  affiliateUrl: string;
  affiliateTag: string; // e.g., "trends0628-21"
  estimatedPrice: string;
  originalPrice?: string;
  discountPercentage?: number;
  dealBadge?: string;
  rating: number; // 1-5
  keyFeatures: string[];
  pros: string[];
  cons: string[];
  targetAudience: string;
  verdict: string;
  imageUrl?: string;
  buyIf?: string[];
  skipIf?: string[];
  alternatives?: AlternativeProduct[];
}

export interface CommentTopic {
  topic: string;
  count: number;
  sentiment: 'positive' | 'negative' | 'neutral';
  sampleComment?: string;
}

export interface ViewerQuestion {
  question: string;
  author: string;
  aiInsight: string;
}

export interface AIPulse {
  summary: string;
  keyTakeaways: string[];
  viralPotentialScore: number; // 0 to 100
  overallSentimentRatio: {
    positive: number; // percentage
    negative: number;
    neutral: number;
  };
  buyerRecommendation: 'Must Buy' | 'Great Value' | 'Consider Alternatives' | 'Proceed with Caution' | string;
  aiVerdictText?: string;
  buyerVerdictText?: string;
  valueRating?: number; // e.g. 4.8 out of 5
  durabilityRating?: string; // e.g. "Premium Grade"
  targetAudience?: string;
  pros?: string[];
  cons?: string[];
  buyerChecklist?: { factor: string; status: 'Passed' | 'Caution' | 'Notice'; detail: string }[];
  buyIf?: string[];
  skipIf?: string[];
  topTopics?: CommentTopic[];
  topPositiveQuotes?: { author: string; text: string; isVerifiedBuyer?: boolean }[];
  topCriticalQuotes?: { author: string; text: string; isVerifiedBuyer?: boolean }[];
  detectedQuestions?: ViewerQuestion[];
  confidenceScore?: number;
  engagementLevel?: 'Extreme Viral Interest' | 'High Engagement' | 'Steady Growth' | 'Standard';
}

export interface VideoItem {
  id: string;
  youtubeUrl: string;
  youtubeId: string;
  title: string;
  rephrasedTitle: string; // SEO rephrased title to avoid Google duplicate content issues
  rephrasedDescription: string; // SEO rephrased description
  slug: string; // SEO URL slug generated from rephrased title (e.g. "tested-reviewed-top-rated-home-kitchen-cleaning-innovations-2026")
  channelTitle: string;
  category: Category;
  thumbnailUrl: string;
  viewCount: string;
  likeCount: string;
  commentCount?: string; // YouTube total comments count e.g. "1.2K" or "425"
  publishedAt: string;
  affiliateTagUsed: string; // "trends0628-21"
  pulse: AIPulse;
  products: Product[];
  comments: Comment[];
  syncStatus: 'synced_dotnet_mysql' | 'pending_sync' | 'sync_error';
  lastSyncedAt: string;
  dailyCollectorRunSlot: number; // 1 to 5
  region?: string; // 'IN' | 'US'
}

export interface CollectorLog {
  id: string;
  timestamp: string;
  runSlot: number; // Slot 1, 2, 3, 4, or 5 for the daily schedule
  slotTimeName: string; // e.g. "06:00 AM Run", "10:00 AM Run", "02:00 PM Run", "06:00 PM Run", "10:00 PM Run"
  status: 'Completed' | 'Processing' | 'Failed';
  videosDiscovered: number;
  linksConverted: number;
  sentimentAnalysesCompleted: number;
  syncedToDatabase: string; // ".NET 8 Web API / MySQL db_trends"
  logDetails: string[];
}

export interface ConvertLinkRequest {
  text: string;
  affiliateTag?: string;
}

export interface ConvertLinkResponse {
  originalText: string;
  convertedText: string;
  linksFoundCount: number;
  amazonLinksConvertedCount: number;
  affiliateTag: string;
}
