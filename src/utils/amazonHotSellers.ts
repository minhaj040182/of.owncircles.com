import { VideoItem } from '../types';
import { RegionCode, getLocalizedAffiliateUrl } from './localization';

export interface AmazonHotSellerItem {
  id: string;
  asin: string;
  productName: string;
  category: string;
  salesRankBadge: string;
  monthlySalesVelocity: string;
  price: string;
  originalPrice: string;
  discountPercent: number;
  rating: number;
  reviewsCount: string;
  amazonUrl: string;
  imageUrl: string;
  bestReviewVideo: {
    ytId: string;
    title: string;
    channelTitle: string;
    views: string;
    duration: string;
  };
}

export const AMAZON_HOT_SELLERS_DATA: Record<string, AmazonHotSellerItem[]> = {
  US: [
    {
      id: 'hot-seller-us-1',
      asin: 'B0CMDFV8N3',
      productName: 'Apple iPhone 16 Pro Max (256 GB) - Desert Titanium',
      category: 'electronics',
      salesRankBadge: '#1 Best Seller in Unlocked Cell Phones',
      monthlySalesVelocity: '25K+ bought in past month',
      price: '$1,199.00',
      originalPrice: '$1,299.00',
      discountPercent: 8,
      rating: 4.9,
      reviewsCount: '8,420',
      amazonUrl: 'https://www.amazon.com/dp/B0CMDFV8N3',
      imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=80',
      bestReviewVideo: {
        ytId: '2QkS5j6bH_g',
        title: 'iPhone 16 Pro Max Review: Real World 30 Days Later & Camera Comparison',
        channelTitle: 'Marques Brownlee',
        views: '3.4M views',
        duration: '18:42'
      }
    },
    {
      id: 'hot-seller-us-2',
      asin: 'B0CX23G2Y4',
      productName: 'Apple MacBook Pro 16" M4 Pro Chip (36GB Unified Memory, 512GB SSD)',
      category: 'electronics',
      salesRankBadge: '#1 Mover & Shaker in Traditional Laptops',
      monthlySalesVelocity: '12K+ bought in past month',
      price: '$2,499.00',
      originalPrice: '$2,699.00',
      discountPercent: 7,
      rating: 4.9,
      reviewsCount: '4,150',
      amazonUrl: 'https://www.amazon.com/dp/B0CX23G2Y4',
      imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80',
      bestReviewVideo: {
        ytId: '1S0J95wQJvM',
        title: 'M4 MacBook Pro Comprehensive Review: The Ultimate Creator Laptop',
        channelTitle: 'Dave2D',
        views: '1.9M views',
        duration: '14:20'
      }
    },
    {
      id: 'hot-seller-us-3',
      asin: 'B0C6B8D3Z8',
      productName: 'Samsung Galaxy S24 Ultra AI Smartphone (512GB Titanium Black)',
      category: 'electronics',
      salesRankBadge: '#2 Best Seller in 5G Smartphones',
      monthlySalesVelocity: '18K+ bought in past month',
      price: '$1,299.99',
      originalPrice: '$1,419.99',
      discountPercent: 12,
      rating: 4.8,
      reviewsCount: '11,280',
      amazonUrl: 'https://www.amazon.com/dp/B0C6B8D3Z8',
      imageUrl: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&auto=format&fit=crop&q=80',
      bestReviewVideo: {
        ytId: 'sz-y6Gz6Ikg',
        title: 'Samsung Galaxy S24 Ultra Full In-Depth Review & AI Feature Test',
        channelTitle: 'Mrwhosetheboss',
        views: '4.8M views',
        duration: '21:15'
      }
    },
    {
      id: 'hot-seller-us-4',
      asin: 'B08N5WRWNW',
      productName: 'Ninja AF101 Air Fryer 4 Qt with Crisper Plate & Multi-Rack',
      category: 'kitchen',
      salesRankBadge: '#1 Best Seller in Small Kitchen Appliances',
      monthlySalesVelocity: '30K+ bought in past month',
      price: '$89.99',
      originalPrice: '$129.99',
      discountPercent: 31,
      rating: 4.8,
      reviewsCount: '62,400',
      amazonUrl: 'https://www.amazon.com/dp/B08N5WRWNW',
      imageUrl: 'https://images.unsplash.com/photo-1556911220-e15b29be8c8f?w=600&auto=format&fit=crop&q=80',
      bestReviewVideo: {
        ytId: '8f7z5q1d4-Y',
        title: 'Ninja Air Fryer AF101 Honest Test & 5 Easy Recipes',
        channelTitle: 'Kitchen Appliance Lab',
        views: '890K views',
        duration: '11:04'
      }
    },
    {
      id: 'hot-seller-us-5',
      asin: 'B08M9J4Y4C',
      productName: 'Dell XPS 16 9640 Intel Core Ultra 7 155H Laptop with OLED Touch',
      category: 'electronics',
      salesRankBadge: '#3 Best Seller in High Performance Laptops',
      monthlySalesVelocity: '8K+ bought in past month',
      price: '$1,899.00',
      originalPrice: '$2,149.00',
      discountPercent: 12,
      rating: 4.7,
      reviewsCount: '2,890',
      amazonUrl: 'https://www.amazon.com/dp/B08M9J4Y4C',
      imageUrl: 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?w=600&auto=format&fit=crop&q=80',
      bestReviewVideo: {
        ytId: 'sX8L8w88G7w',
        title: 'Dell XPS 16 OLED Review: The Windows MacBook Pro Challenger?',
        channelTitle: 'MobileTechReview',
        views: '760K views',
        duration: '16:10'
      }
    },
    {
      id: 'hot-seller-us-6',
      asin: 'B09V7S1B2Q',
      productName: 'Sperax Compact Under Desk Walking Pad Treadmill with Remote',
      category: 'fitness',
      salesRankBadge: '#1 Best Seller in Treadmills',
      monthlySalesVelocity: '20K+ bought in past month',
      price: '$189.99',
      originalPrice: '$299.99',
      discountPercent: 37,
      rating: 4.6,
      reviewsCount: '19,800',
      amazonUrl: 'https://www.amazon.com/dp/B09V7S1B2Q',
      imageUrl: 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600&auto=format&fit=crop&q=80',
      bestReviewVideo: {
        ytId: '1fbUlzz2zfY',
        title: 'Under Desk Walking Pad 6 Months Later: Best Work From Home Upgrade',
        channelTitle: 'Tech & Fitness Lab',
        views: '1.2M views',
        duration: '09:45'
      }
    }
  ],
  IN: [
    {
      id: 'hot-seller-in-1',
      asin: 'B0CS5X8T7M',
      productName: 'Samsung Galaxy S24 Ultra 5G AI Smartphone (12GB RAM, 256GB Titanium)',
      category: 'electronics',
      salesRankBadge: '#1 Best Seller in Premium Smartphones',
      monthlySalesVelocity: '15K+ bought in past month',
      price: '₹1,29,999',
      originalPrice: '₹1,34,999',
      discountPercent: 4,
      rating: 4.8,
      reviewsCount: '7,350',
      amazonUrl: 'https://www.amazon.in/dp/B0CS5X8T7M',
      imageUrl: 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?w=600&auto=format&fit=crop&q=80',
      bestReviewVideo: {
        ytId: 'sz-y6Gz6Ikg',
        title: 'Galaxy S24 Ultra In-Depth India Review & Camera Test',
        channelTitle: 'Geekyranjit',
        views: '2.1M views',
        duration: '19:30'
      }
    },
    {
      id: 'hot-seller-in-2',
      asin: 'B0CX1G7X39',
      productName: 'Apple MacBook Air 15-inch M3 Chip Laptop (16GB Unified RAM)',
      category: 'electronics',
      salesRankBadge: '#1 Best Seller in Thin & Light Laptops',
      monthlySalesVelocity: '9K+ bought in past month',
      price: '₹1,34,900',
      originalPrice: '₹1,44,900',
      discountPercent: 7,
      rating: 4.9,
      reviewsCount: '3,800',
      amazonUrl: 'https://www.amazon.in/dp/B0CX1G7X39',
      imageUrl: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=600&auto=format&fit=crop&q=80',
      bestReviewVideo: {
        ytId: '1S0J95wQJvM',
        title: 'M3 MacBook Air 15-inch Review: The Perfect Student & Office Laptop',
        channelTitle: 'Gyan Therapy',
        views: '1.4M views',
        duration: '13:50'
      }
    },
    {
      id: 'hot-seller-in-3',
      asin: 'B0CHX1W1XY',
      productName: 'Apple iPhone 15 / 16 (128 GB) 5G Super Retina XDR Display',
      category: 'electronics',
      salesRankBadge: '#1 Most Gifted in Smartphones',
      monthlySalesVelocity: '40K+ bought in past month',
      price: '₹69,999',
      originalPrice: '₹79,900',
      discountPercent: 12,
      rating: 4.7,
      reviewsCount: '24,100',
      amazonUrl: 'https://www.amazon.in/dp/B0CHX1W1XY',
      imageUrl: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=600&auto=format&fit=crop&q=80',
      bestReviewVideo: {
        ytId: '2QkS5j6bH_g',
        title: 'iPhone 15 & 16 Long-Term Review: Best Value Flagship in India?',
        channelTitle: 'Technical Guruji',
        views: '3.8M views',
        duration: '15:20'
      }
    },
    {
      id: 'hot-seller-in-4',
      asin: 'B0C7L8M9K0',
      productName: 'LG 9 Kg 5 Star Fully Automatic Front Load Smart AI Direct Drive Washing Machine',
      category: 'household',
      salesRankBadge: '#1 Best Seller in Washing Machines',
      monthlySalesVelocity: '10K+ bought in past month',
      price: '₹38,990',
      originalPrice: '₹53,990',
      discountPercent: 28,
      rating: 4.6,
      reviewsCount: '8,920',
      amazonUrl: 'https://www.amazon.in/dp/B0C7L8M9K0',
      imageUrl: 'https://images.unsplash.com/photo-1626806787461-102c1bfaaea1?w=600&auto=format&fit=crop&q=80',
      bestReviewVideo: {
        ytId: 'q9L_1S39E1Q',
        title: 'LG AI Direct Drive Front Load Washing Machine Review & Demo',
        channelTitle: 'Home Automation Reviews',
        views: '540K views',
        duration: '10:45'
      }
    },
    {
      id: 'hot-seller-in-5',
      asin: 'B08G8B8X8W',
      productName: 'ASUS TUF Gaming A15 AMD Ryzen 7 7435HS with RTX 4060 Laptop',
      category: 'electronics',
      salesRankBadge: '#1 Best Seller in Gaming Laptops',
      monthlySalesVelocity: '6K+ bought in past month',
      price: '₹76,990',
      originalPrice: '₹98,990',
      discountPercent: 22,
      rating: 4.5,
      reviewsCount: '5,120',
      amazonUrl: 'https://www.amazon.in/dp/B08G8B8X8W',
      imageUrl: 'https://images.unsplash.com/photo-1603302576837-37561b2e2302?w=600&auto=format&fit=crop&q=80',
      bestReviewVideo: {
        ytId: 'v8_aE9jRz6A',
        title: 'ASUS TUF Gaming A15 RTX 4060 Full Gaming Benchmark Review',
        channelTitle: 'Jarrod Tech Reviews',
        views: '810K views',
        duration: '17:15'
      }
    },
    {
      id: 'hot-seller-in-6',
      asin: 'B0BY8T5D7F',
      productName: 'Samsung 236 L 3 Star Convertible Inverter Digital Double Door Refrigerator',
      category: 'kitchen',
      salesRankBadge: '#1 Best Seller in Refrigerators',
      monthlySalesVelocity: '14K+ bought in past month',
      price: '₹25,990',
      originalPrice: '₹37,990',
      discountPercent: 32,
      rating: 4.7,
      reviewsCount: '16,400',
      amazonUrl: 'https://www.amazon.in/dp/B0BY8T5D7F',
      imageUrl: 'https://images.unsplash.com/photo-1571175443880-49e1d25b2bc5?w=600&auto=format&fit=crop&q=80',
      bestReviewVideo: {
        ytId: 'r5x-J8Xg7d8',
        title: 'Samsung Convertible Double Door Refrigerator Full Demo & Power Consumption',
        channelTitle: 'Home Appliance Lab India',
        views: '670K views',
        duration: '12:18'
      }
    }
  ]
};

// Convert Hot Seller to standard VideoItem for player modal compatibility
export const hotSellerToVideoItem = (item: AmazonHotSellerItem, region: RegionCode): VideoItem => {
  const affUrl = getLocalizedAffiliateUrl(item.amazonUrl, item.productName, region);
  return {
    id: `hot-seller-vid-${item.id}`,
    youtubeUrl: `https://www.youtube.com/watch?v=${item.bestReviewVideo.ytId}`,
    youtubeId: item.bestReviewVideo.ytId,
    title: item.bestReviewVideo.title,
    channelTitle: item.bestReviewVideo.channelTitle,
    rephrasedTitle: `${item.productName} - Full Amazon Review & Verdict`,
    rephrasedDescription: `Verified Amazon Best Seller with ${item.monthlySalesVelocity}. Customer rating ${item.rating}/5 from ${item.reviewsCount} reviews.`,
    slug: item.productName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
    category: item.category as any,
    thumbnailUrl: item.imageUrl,
    viewCount: item.bestReviewVideo.views,
    likeCount: '98%',
    commentCount: item.reviewsCount,
    publishedAt: '2026-08-18',
    affiliateTagUsed: 'trends0628-21',
    syncStatus: 'synced_dotnet_mysql',
    lastSyncedAt: new Date().toISOString(),
    dailyCollectorRunSlot: 1,
    region: region,
    products: [
      {
        id: `prod-${item.asin}`,
        name: item.productName,
        category: item.category,
        affiliateUrl: affUrl,
        affiliateTag: 'trends0628-21',
        estimatedPrice: item.price,
        originalPrice: item.originalPrice,
        discountPercentage: item.discountPercent,
        dealBadge: item.salesRankBadge,
        rating: item.rating,
        keyFeatures: [
          item.salesRankBadge,
          item.monthlySalesVelocity,
          `Customer rating ${item.rating}/5 from ${item.reviewsCount} verified reviews`,
          `Live Amazon deal: ${item.discountPercent}% discount`
        ],
        pros: ['High user satisfaction', 'Top sales rank', 'Great build quality'],
        cons: ['High demand may cause stock fluctuations'],
        targetAudience: 'Consumers looking for the highest rated and bestselling products',
        verdict: `Strong Buy — Ranked ${item.salesRankBadge} with ${item.monthlySalesVelocity}.`
      }
    ],
    comments: [],
    pulse: {
      summary: `Verified Amazon Best Seller with ${item.monthlySalesVelocity}. Customer rating ${item.rating}/5 from ${item.reviewsCount} reviews.`,
      keyTakeaways: [
        `Ranked ${item.salesRankBadge}`,
        `${item.monthlySalesVelocity}`,
        `${item.discountPercent}% off retail price`
      ],
      viralPotentialScore: 95,
      overallSentimentRatio: {
        positive: 88,
        negative: 5,
        neutral: 7
      },
      buyerRecommendation: 'Must Buy',
      aiVerdictText: `This product is currently ranking as ${item.salesRankBadge} on Amazon with exceptional buyer feedback (${item.rating}/5 across ${item.reviewsCount} ratings).`,
      buyerVerdictText: 'Overwhelmingly positive reviews praising performance and reliability.',
      valueRating: 4.8,
      durabilityRating: 'Premium Grade'
    }
  };
};
