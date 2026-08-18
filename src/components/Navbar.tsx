import React, { useRef } from 'react';
import { 
  Tv, 
  Search, 
  TrendingUp, 
  Home, 
  Dumbbell, 
  Utensils, 
  Sparkles,
  BookOpen,
  HeartHandshake,
  Baby,
  Dog,
  Briefcase,
  Compass,
  ChevronLeft,
  ChevronRight,
  Globe,
  Heart,
  Laptop
} from 'lucide-react';
import { Category } from '../types';
import { RegionCode, REGION_CONFIGS } from '../utils/localization';
import { CurrencyCode, CURRENCIES, detectUserCurrency } from '../utils/currency';

interface NavbarProps {
  selectedCategory: Category;
  onSelectCategory: (category: Category) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  onPullNewVideo?: () => void;
  isPulling?: boolean;
  onGoHome?: () => void;
  region?: RegionCode;
  onRegionChange?: (region: RegionCode) => void;
  savedCount?: number;
  selectedCurrency?: CurrencyCode;
  onCurrencyChange?: (currency: CurrencyCode) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  selectedCategory,
  onSelectCategory,
  searchQuery,
  onSearchChange,
  onPullNewVideo,
  isPulling = false,
  onGoHome,
  region = 'IN',
  onRegionChange,
  savedCount = 0,
  selectedCurrency
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const activeCurrencyCode = selectedCurrency || detectUserCurrency();
  const currentCurrency = CURRENCIES[activeCurrencyCode] || CURRENCIES.USD;

  const handleScroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -280 : 280;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const categories: { id: Category; label: string; icon: React.ReactNode; badge?: number }[] = [
    { id: 'all', label: 'All Reviews', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'saved', label: 'Saved Deals', icon: <Heart className="w-4 h-4 text-rose-300 fill-rose-300" />, badge: savedCount },
    { id: 'electronics', label: 'Electronics', icon: <Laptop className="w-4 h-4" /> },
    { id: 'household', label: 'Household', icon: <Home className="w-4 h-4" /> },
    { id: 'kitchen', label: 'Kitchen & Cooking', icon: <Utensils className="w-4 h-4" /> },
    { id: 'fitness', label: 'Fitness & Health', icon: <Dumbbell className="w-4 h-4" /> },
    { id: 'gadgets', label: 'Home Gadgets', icon: <Sparkles className="w-4 h-4" /> },
    { id: 'books_stationery', label: 'Books & Stationery', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'personal_care', label: 'Personal Care', icon: <HeartHandshake className="w-4 h-4" /> },
    { id: 'baby_parenting', label: 'Baby & Parenting', icon: <Baby className="w-4 h-4" /> },
    { id: 'pet_supplies', label: 'Pet Supplies', icon: <Dog className="w-4 h-4" /> },
    { id: 'home_office', label: 'Home Office', icon: <Briefcase className="w-4 h-4" /> },
    { id: 'travel_outdoor', label: 'Travel & Outdoor', icon: <Compass className="w-4 h-4" /> },
  ];

  return (
    <header className="bg-gradient-to-r from-blue-700 via-blue-600 to-indigo-700 text-white rounded-b-[2rem] sm:rounded-b-[2.5rem] shadow-xl pt-6 pb-5 px-4 sm:px-8">
      <div className="max-w-7xl mx-auto space-y-5">
        
        {/* Top Header Row */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Logo & Title */}
          <button 
            onClick={onGoHome || (() => onSelectCategory('all'))}
            className="flex items-center gap-3 text-left group cursor-pointer hover:opacity-90 transition-all active:scale-98"
            title="Return to Home Page"
          >
            <div className="w-11 h-11 rounded-2xl bg-white/15 backdrop-blur-md border border-white/30 flex items-center justify-center text-white shadow-inner shrink-0 group-hover:bg-white/25 transition-colors">
              <Tv className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2 group-hover:text-blue-100 transition-colors">
                TrendPulse
              </h1>
              <p className="text-xs text-blue-100/90 font-medium flex items-center gap-2 mt-0.5">
                <span>Trending Today</span>
              </p>
            </div>
          </button>

          {/* Controls: Automatic Location Currency Badge, Search, Region */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            
            {/* Automatic Location-Based Currency Badge */}
            <div 
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/15 border border-white/25 text-white text-xs font-bold backdrop-blur-md shadow-2xs"
              title="Currency is automatically detected based on your location"
            >
              <Globe className="w-3.5 h-3.5 text-amber-300 shrink-0" />
              <span className="whitespace-nowrap">{currentCurrency.flag} {currentCurrency.code}</span>
            </div>

            {/* Search Input */}
            <div className="relative flex-1 sm:w-64 min-w-[180px]">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-blue-200" />
              <input
                type="text"
                placeholder="Search products, channels..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full bg-white/15 focus:bg-white focus:text-slate-900 focus:placeholder-slate-400 text-white placeholder-blue-100/70 border border-white/25 focus:border-blue-500 rounded-xl pl-10 pr-4 py-2 text-xs font-medium transition-all shadow-inner outline-none"
              />
            </div>
          </div>
        </div>

        {/* Bottom Row: Category Navigation Pills */}
        <div className="relative flex items-center w-full pt-2 border-t border-white/10 group">
          {/* Scroll Left Button */}
          <button
            onClick={() => handleScroll('left')}
            className="absolute -left-2 z-10 p-2 rounded-full bg-slate-900/75 hover:bg-slate-900 text-white border border-white/30 shadow-lg backdrop-blur-md transition-all active:scale-90 flex items-center justify-center shrink-0"
            title="Scroll categories left"
            aria-label="Scroll left"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Full-width Category Navigation Pills */}
          <div 
            ref={scrollRef}
            className="flex items-center gap-2 overflow-x-auto py-1 px-8 w-full scroll-smooth no-scrollbar"
          >
            {categories.map((cat) => {
              const isActive = selectedCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => onSelectCategory(cat.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-white text-blue-700 shadow-md transform scale-102'
                      : 'bg-white/10 hover:bg-white/20 text-blue-100 border border-white/10'
                  }`}
                >
                  {cat.icon}
                  <span>{cat.label}</span>
                  {typeof cat.badge === 'number' && cat.badge > 0 && (
                    <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                      isActive ? 'bg-rose-500 text-white' : 'bg-rose-500/90 text-white'
                    }`}>
                      {cat.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Scroll Right Button */}
          <button
            onClick={() => handleScroll('right')}
            className="absolute -right-2 z-10 p-2 rounded-full bg-slate-900/75 hover:bg-slate-900 text-white border border-white/30 shadow-lg backdrop-blur-md transition-all active:scale-90 flex items-center justify-center shrink-0"
            title="Scroll categories right"
            aria-label="Scroll right"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </div>
    </header>
  );
};


