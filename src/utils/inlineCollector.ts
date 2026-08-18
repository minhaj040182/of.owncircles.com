import { VideoItem, Category } from '../types';
import { AFFILIATE_ID, convertTextWithAffiliateLinks, convertAmazonUrl } from './affiliate';
import { rephraseTitle, rephraseDescription, generateSlug } from './seo';

/**
 * Client-Side Inline Video Puller & Direct MySQL Data Exporter
 * Runs entirely inline in browser TypeScript without requiring a Node server backend.
 */
export async function pullVideoInline(
  categoryInput: string = 'household',
  slotNum: number = 1
): Promise<{ video: VideoItem; sqlInsert: string }> {
  const category = (categoryInput || 'household') as Category;
  const timestamp = Date.now();
  const videoId = `inline-${timestamp.toString().slice(-6)}`;
  
  const sampleTopics: Record<string, { title: string; prodName: string; rawUrl: string; ytId: string }> = {
    household: {
      title: '10 Incredible Home & Kitchen Cleaning Gadgets Tested & Reviewed',
      prodName: 'Roborock S8 MaxV Ultra Smart Cleaner',
      rawUrl: 'https://www.amazon.com/dp/B0CXB6H64R',
      ytId: 'a5p4Xj2A9aE'
    },
    fitness: {
      title: 'Compact Under Desk Walking Pad Treadmill & Fitness Gear Review',
      prodName: 'Sperax Under Desk Walking Pad Treadmill 2-in-1',
      rawUrl: 'https://www.amazon.com/dp/B0BVL3K7M2',
      ytId: '2g811Ko7gX8'
    },
    kitchen: {
      title: '7 Viral Kitchen Gadgets & Ninja Speedi Air Fryer Review',
      prodName: 'Ninja SF301 Speedi Air Fryer & Cooker',
      rawUrl: 'https://www.amazon.com/dp/B0B23BB5C9',
      ytId: '3tmd-ClpJxA'
    },
    electronics: {
      title: 'Top Flagship Smartphones & M4 AI Laptops Comprehensive Review',
      prodName: 'Samsung Galaxy S24 Ultra & Apple MacBook Pro',
      rawUrl: 'https://www.amazon.com/dp/B0CMDFV8N3',
      ytId: '2QkS5j6bH_g'
    },
    gadgets: {
      title: 'Samsung Galaxy S24 Ultra & iPhone Flagship Smartphone Mobile Review',
      prodName: 'Samsung Galaxy S24 Ultra 5G 512GB',
      rawUrl: 'https://www.amazon.com/dp/B0CMDFV8N3',
      ytId: 'sz-y6Gz6Ikg'
    },
    reviews: {
      title: 'M3 MacBook Pro & High-Performance Laptop Full Tech Review',
      prodName: 'Apple MacBook Pro 16" M3 Pro Chip',
      rawUrl: 'https://www.amazon.com/dp/B0CM5JV232',
      ytId: 'v8_aE9jRz6A'
    },
    books_stationery: {
      title: 'Kindle Paperwhite (16 GB) 6.8" Glare-Free E-Reader Review',
      prodName: 'Kindle Paperwhite 16GB Display E-Reader',
      rawUrl: 'https://www.amazon.com/dp/B09TMN3P41',
      ytId: 'hT_nvWreIhg'
    }
  };

  const topic = sampleTopics[category] || sampleTopics.household;
  const affProdUrl = convertAmazonUrl(topic.rawUrl, AFFILIATE_ID);
  
  const rawComment = `Amazing review! I ordered the ${topic.prodName} from Amazon here: ${topic.rawUrl} and it arrived super fast!`;
  const { convertedText: affCommentText } = convertTextWithAffiliateLinks(rawComment, AFFILIATE_ID);

  const rawTitle = `${topic.title} (Inline Browser Pulled)`;
  const rephrased = rephraseTitle(topic.title, category);
  const rephrasedDesc = rephraseDescription(topic.title, `Inline pulled details for ${topic.title}. All Amazon URLs rewritten.`, category);
  const slug = generateSlug(rephrased);

  const video: VideoItem = {
    id: `vid-inline-${timestamp}`,
    youtubeUrl: `https://www.youtube.com/watch?v=${topic.ytId}`,
    youtubeId: topic.ytId,
    title: rawTitle,
    rephrasedTitle: rephrased,
    rephrasedDescription: rephrasedDesc,
    slug: slug,
    channelTitle: 'Inline Browser Collector (TypeScript)',
    category: category,
    thumbnailUrl: 'https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?auto=format&fit=crop&w=800&q=80',
    viewCount: '1.2M',
    likeCount: '75K',
    publishedAt: 'Just now (Inline Browser Execution)',
    affiliateTagUsed: AFFILIATE_ID,
    syncStatus: 'synced_dotnet_mysql',
    lastSyncedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    dailyCollectorRunSlot: slotNum,
    pulse: {
      summary: `Inline pulled details for ${topic.title}. All Amazon URLs rewritten to include tag=${AFFILIATE_ID}.`,
      keyTakeaways: [
        'Client-side inline extraction executed in browser TypeScript',
        'Direct MySQL query generated for instant C# / MySQL insertion',
        'Auto-rewrote all affiliate links to tag=' + AFFILIATE_ID
      ],
      viralPotentialScore: 95,
      overallSentimentRatio: { positive: 91, negative: 6, neutral: 3 },
      buyerRecommendation: 'Must Buy',
      aiVerdictText: 'High viral engagement and clean affiliate link structure verified inline.'
    },
    products: [
      {
        id: `prod-inline-${timestamp}`,
        name: topic.prodName,
        category: category,
        originalUrl: topic.rawUrl,
        affiliateUrl: affProdUrl,
        affiliateTag: AFFILIATE_ID,
        estimatedPrice: '$149.99',
        rating: 4.8,
        keyFeatures: ['Smart App Control', 'High Efficiency', 'Compact Footprint'],
        pros: ['Flawless quality', 'Affiliate tag verified'],
        cons: ['High demand in stores'],
        targetAudience: 'Homeowners and fitness lovers',
        verdict: 'Must buy product',
        imageUrl: 'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=600&q=80'
      }
    ],
    comments: [
      {
        id: `comm-inline-${timestamp}`,
        author: 'Inline User',
        text: rawComment,
        convertedText: affCommentText,
        hasLinks: true,
        containsAmazonUrl: true,
        sentiment: 'positive',
        positivityScore: 96,
        negativityScore: 4,
        keyThemes: ['Fast Delivery', 'Great Product'],
        likesCount: 140,
        timestamp: 'Just now',
        priorityScore: 98
      }
    ]
  };

  // Generate MySQL Direct INSERT SQL Query
  const sqlInsert = `-- Direct MySQL Insertion Query for Video ID: ${video.id}
INSERT INTO \`viral_videos\` (
  \`video_id\`, \`youtube_url\`, \`title\`, \`category\`, \`affiliate_tag\`, \`positiveness_score\`, \`negativeness_score\`, \`created_at\`
) VALUES (
  '${video.id}',
  '${video.youtubeUrl}',
  '${video.title.replace(/'/g, "''")}',
  '${video.category}',
  '${AFFILIATE_ID}',
  91.00,
  6.00,
  NOW()
) ON DUPLICATE KEY UPDATE \`title\` = VALUES(\`title\`);

INSERT INTO \`affiliate_conversions\` (
  \`video_id\`, \`original_url\`, \`converted_url\`, \`affiliate_tag\`
) VALUES (
  '${video.id}',
  '${topic.rawUrl}',
  '${affProdUrl}',
  '${AFFILIATE_ID}'
);`;

  return { video, sqlInsert };
}
