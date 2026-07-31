import React, { useState, useEffect } from 'react';
import { 
  Smartphone, 
  Cloud, 
  Rocket, 
  Mail, 
  ChevronLeft, 
  ChevronRight, 
  Sparkles, 
  Copy, 
  Check, 
  ArrowRight,
  Code2,
  Server,
  Layers,
  CheckCircle2,
  X
} from 'lucide-react';

interface ITServicesBannerProps {
  themeKey?: string;
  theme?: any;
}

const SLIDES = [
  {
    id: 'mobile-web',
    tag: 'Mobile & Web Development',
    title: 'Custom Mobile Apps & Web Solutions',
    description: 'iOS, Android, React & Full-Stack Web Development crafted for performance at nominal prices.',
    highlight: 'Nominal Prices • Fast Delivery',
    icon: Smartphone,
    accentColor: 'from-blue-600 via-indigo-600 to-violet-600',
    badgeColor: 'bg-blue-500/10 text-blue-400 border-blue-500/30'
  },
  {
    id: 'cloud-devops',
    tag: 'Cloud & DevOps Solutions',
    title: 'Scalable Cloud Architecture & DevOps',
    description: 'AWS, GCP, Docker, Kubernetes & CI/CD pipeline automation for maximum uptime & speed.',
    highlight: 'AWS • GCP • Kubernetes • CI/CD',
    icon: Cloud,
    accentColor: 'from-indigo-600 via-purple-600 to-pink-600',
    badgeColor: 'bg-indigo-500/10 text-indigo-400 border-indigo-500/30'
  },
  {
    id: 'software-solutions',
    tag: 'Enterprise IT & Software',
    title: 'Turn Your Idea into Digital Reality',
    description: 'End-to-end custom software development, MVP prototyping & API integrations built for growth.',
    highlight: 'Free Quote • Idea to Production',
    icon: Rocket,
    accentColor: 'from-emerald-600 via-teal-600 to-cyan-600',
    badgeColor: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
  }
];

export const ITServicesBanner: React.FC<ITServicesBannerProps> = ({ themeKey = 'obsidian', theme }) => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [copied, setCopied] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);

  // Auto-play slider every 5.5 seconds
  useEffect(() => {
    if (isPaused) return;
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % SLIDES.length);
    }, 5500);
    return () => clearInterval(timer);
  }, [isPaused]);

  const slide = SLIDES[currentSlide];
  const IconComponent = slide.icon;

  const handleCopyEmail = (e: React.MouseEvent) => {
    e.stopPropagation();
    navigator.clipboard.writeText('info@owncircles.com');
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isLight = themeKey === 'light';

  if (isMinimized) {
    return (
      <div className={`w-full py-1.5 px-4 text-xs font-medium border-b flex items-center justify-between transition-all ${
        isLight 
          ? 'bg-indigo-50/80 border-indigo-100 text-indigo-950' 
          : 'bg-indigo-950/40 border-indigo-900/40 text-indigo-200'
      }`}>
        <div className="flex items-center gap-2 overflow-hidden">
          <Sparkles className="w-3.5 h-3.5 text-indigo-500 shrink-0 animate-pulse" />
          <span className="font-bold truncate">OwnCircles IT Services:</span>
          <span className="truncate opacity-90">Mobile Apps, Websites, Cloud & Software at nominal prices.</span>
          <a 
            href="mailto:info@owncircles.com?subject=IT%20Services%20Inquiry%20-%20Free%20Quote"
            className="font-bold text-indigo-600 dark:text-indigo-400 underline hover:opacity-80 shrink-0 ml-1"
          >
            info@owncircles.com
          </a>
        </div>
        <button 
          onClick={() => setIsMinimized(false)}
          className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-indigo-500/20 hover:bg-indigo-500/30 transition-colors ml-2 shrink-0"
        >
          Expand Banner
        </button>
      </div>
    );
  }

  return (
    <section 
      className={`relative w-full border-b transition-all duration-300 overflow-hidden ${
        isLight 
          ? 'bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white border-indigo-900/40' 
          : 'bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950/80 text-white border-slate-800/80'
      }`}
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      aria-label="IT Services Banner Advertisement"
    >
      {/* Decorative subtle ambient lights */}
      <div className="absolute -top-24 left-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 right-1/4 w-96 h-96 bg-violet-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3 relative z-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-3">
          
          {/* Left Side: Service Tag & Slide Content */}
          <div className="flex items-center gap-3.5 w-full md:w-auto flex-1 min-w-0">
            {/* Animated Service Icon */}
            <div className={`p-2.5 sm:p-3 rounded-xl bg-gradient-to-br ${slide.accentColor} text-white shadow-lg shadow-indigo-500/20 shrink-0 transition-transform duration-300 hover:scale-105`}>
              <IconComponent className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>

            <div className="min-w-0 flex-1 space-y-0.5">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`text-[10px] font-mono font-bold tracking-wider uppercase px-2 py-0.5 rounded-full border ${slide.badgeColor} flex items-center gap-1`}>
                  <Sparkles className="w-2.5 h-2.5 animate-pulse" />
                  {slide.tag}
                </span>
                <span className="text-[10px] font-mono font-semibold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full hidden sm:inline-flex items-center gap-1">
                  <CheckCircle2 className="w-2.5 h-2.5" />
                  Nominal Rates
                </span>
              </div>

              <div className="flex items-baseline gap-2 flex-wrap">
                <h2 className="text-xs sm:text-sm font-extrabold tracking-tight text-white truncate">
                  {slide.title}
                </h2>
                <p className="text-[11px] sm:text-xs text-slate-300 hidden lg:block truncate max-w-xl">
                  {slide.description}
                </p>
              </div>
            </div>
          </div>

          {/* Right Side: CTA Action & Contacts */}
          <div className="flex items-center gap-2 sm:gap-3 w-full md:w-auto justify-between md:justify-end shrink-0 border-t md:border-t-0 pt-2 md:pt-0 border-slate-800/60">
            
            {/* Direct Email Callout / Copy Button */}
            <div className="flex items-center gap-1.5 bg-slate-900/90 border border-slate-700/60 rounded-xl px-2.5 py-1.5 shadow-inner">
              <Mail className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
              <div className="flex flex-col text-left">
                <span className="text-[9px] font-mono text-slate-400 uppercase tracking-wider leading-none">Free Quote</span>
                <a 
                  href="mailto:info@owncircles.com?subject=IT%20Services%20Inquiry%20-%20Free%20Quote"
                  className="text-xs font-mono font-bold text-indigo-300 hover:text-white transition-colors"
                  title="Click to send email"
                >
                  info@owncircles.com
                </a>
              </div>
              <button
                onClick={handleCopyEmail}
                className="ml-1 p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white transition-colors relative"
                title="Copy email address"
              >
                {copied ? (
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>

            {/* Main Action Button */}
            <a
              href="mailto:info@owncircles.com?subject=IT%20Services%20Inquiry%20-%20Free%20Quote"
              className="px-3 sm:px-4 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-400 hover:to-violet-500 text-white shadow-md shadow-indigo-500/25 flex items-center gap-1.5 transition-all hover:scale-[1.02] active:scale-95 shrink-0"
            >
              <span>Send Idea to get Free Quote</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>

            {/* Slider Navigation Controls */}
            <div className="flex items-center gap-1 pl-1 border-l border-slate-800">
              <button
                onClick={() => setCurrentSlide((prev) => (prev - 1 + SLIDES.length) % SLIDES.length)}
                className="p-1 rounded-lg hover:bg-slate-800/80 text-slate-400 hover:text-white transition-colors"
                title="Previous Service"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <div className="flex items-center gap-1 px-1">
                {SLIDES.map((_, idx) => (
                  <button
                    key={idx}
                    onClick={() => setCurrentSlide(idx)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      currentSlide === idx ? 'w-4 bg-indigo-400' : 'w-1.5 bg-slate-600 hover:bg-slate-400'
                    }`}
                    title={`Go to slide ${idx + 1}`}
                  />
                ))}
              </div>

              <button
                onClick={() => setCurrentSlide((prev) => (prev + 1) % SLIDES.length)}
                className="p-1 rounded-lg hover:bg-slate-800/80 text-slate-400 hover:text-white transition-colors"
                title="Next Service"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => setIsMinimized(true)}
                className="p-1 rounded-lg hover:bg-slate-800/80 text-slate-500 hover:text-slate-300 transition-colors ml-1"
                title="Minimize Banner"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

          </div>

        </div>
      </div>
    </section>
  );
};
