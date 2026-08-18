import React, { useState } from 'react';
import { X, Sparkles, Youtube, Link as LinkIcon, AlertCircle, Loader2, CheckCircle2, ShieldCheck } from 'lucide-react';
import { Category, VideoItem } from '../types';
import { AFFILIATE_ID } from '../utils/affiliate';
import { analyzeVideoInline, fetchAndAnalyzeVideo } from '../utils/youtube';

interface AddVideoModalProps {
  onClose: () => void;
  onVideoAdded: (video: VideoItem) => void;
}

export const AddVideoModal: React.FC<AddVideoModalProps> = ({ onClose, onVideoAdded }) => {
  const [youtubeUrl, setYoutubeUrl] = useState('');
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<Category>('household');
  const [sampleCommentsText, setSampleCommentsText] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sampleIdeas = [
    {
      label: 'Cleaning Tech & Smart Robot Vacuum (Household)',
      url: 'https://www.youtube.com/watch?v=bCXhRtb16mk',
      title: 'Cleaning Tech ACTUALLY Worth Buying',
      cat: 'household' as Category,
      comments: 'Awesome vacuum review! I bought it here https://www.amazon.com/dp/B0CXB6H64R - so worth it.'
    },
    {
      label: 'Kindle Paperwhite E-Reader (Books & Stationery)',
      url: 'https://www.youtube.com/watch?v=XZ0pMbshy3o',
      title: 'Kindle Paperwhite (12th Gen) Review - 6 Months Later',
      cat: 'books_stationery' as Category,
      comments: 'Love this Kindle! Bought on Amazon here https://www.amazon.in/s?k=kindle+paperwhite+16gb'
    },
    {
      label: 'Under-Desk Walking Pad & Treadmill (Fitness)',
      url: 'https://www.youtube.com/watch?v=1fbUlzz2zfY',
      title: 'What you should know before buying a walking pad (treadmills)',
      cat: 'fitness' as Category,
      comments: 'Is this quiet enough for Zoom calls? Bought via link https://amazon.com/dp/B0BVL3K7M2'
    }
  ];

  const handleSelectIdea = (idea: typeof sampleIdeas[0]) => {
    setYoutubeUrl(idea.url);
    setTitle(idea.title);
    setCategory(idea.cat);
    setSampleCommentsText(idea.comments);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!youtubeUrl) {
      setError('Please provide a valid YouTube video URL');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const sampleCommentsArray = sampleCommentsText
        ? sampleCommentsText.split('\n').filter(c => c.trim().length > 0)
        : [];

      // Fetch real YouTube video details & analyze converted Amazon links
      const video = await fetchAndAnalyzeVideo({
        youtubeUrl,
        title,
        category,
        sampleComments: sampleCommentsArray
      });

      // Save to MySQL database via PHP API or client-side fallback
      try {
        await fetch('/api_mysql.php?action=add_video', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(video)
        });
      } catch (saveErr) {
        console.warn('Database save offline or unaccessible, adding to client state:', saveErr);
      }

      onVideoAdded(video);
      onClose();
    } catch (err: any) {
      console.error('Error analyzing video:', err);
      setError(err.message || 'Error processing video');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl my-auto text-slate-100">
        
        {/* Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="bg-amber-500/10 text-amber-400 p-2 rounded-xl border border-amber-500/30">
              <Youtube className="w-5 h-5 text-amber-400" />
            </span>
            <div>
              <h2 className="text-base font-bold text-white">
                Add YouTube Video for Product Review & Affiliate Conversion
              </h2>
              <p className="text-xs text-slate-400">
                Instantly converts any Amazon links in video description/comments to tag=<strong className="text-emerald-400">{AFFILIATE_ID}</strong>
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="bg-rose-950/80 border border-rose-500/40 p-3.5 rounded-xl text-rose-200 text-xs flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* Preset Viral Video Ideas */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-300 block">
              Quick Pick Viral Product Video Templates:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {sampleIdeas.map((idea, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectIdea(idea)}
                  className="p-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-amber-500/40 rounded-xl text-left transition-all text-xs"
                >
                  <span className="font-bold text-amber-400 block truncate">{idea.label}</span>
                  <span className="text-[10px] text-slate-400 truncate block">{idea.title}</span>
                </button>
              ))}
            </div>
          </div>

          {/* YouTube Link Input */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-200 block">
              YouTube Video URL <span className="text-amber-400">*</span>
            </label>
            <div className="relative">
              <LinkIcon className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="url"
                required
                placeholder="https://www.youtube.com/watch?v=..."
                value={youtubeUrl}
                onChange={(e) => setYoutubeUrl(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
            </div>
          </div>

          {/* Title & Category Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-200 block">
                Custom Video Title / Keywords (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g., 2026 Household Robot Vacuum Review"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-200 block">
                Category
              </label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              >
                <option value="household">Household Items</option>
                <option value="gadgets">Trending Home Gadgets</option>
                <option value="fitness">Daily Use Exercises</option>
                <option value="kitchen">Kitchen & Cooking</option>
                <option value="books_stationery">Books & Stationery</option>
                <option value="reviews">Selling & Product Reviews</option>
              </select>
            </div>
          </div>

          {/* Comments to Analyze with Affiliate Conversion */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-slate-200 flex items-center justify-between">
              <span>Viewer Comments to Analyze (1 per line)</span>
              <span className="text-[11px] text-emerald-400 font-mono">
                Auto-replaces Amazon links with tag={AFFILIATE_ID}
              </span>
            </label>
            <textarea
              rows={3}
              placeholder="Paste raw viewer comments or product links here (e.g., I bought this vacuum at https://www.amazon.com/dp/B0CXB6H64R)"
              value={sampleCommentsText}
              onChange={(e) => setSampleCommentsText(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500/50 font-sans"
            />
          </div>

          {/* Auto conversion guarantee banner */}
          <div className="bg-emerald-950/60 p-3 rounded-xl border border-emerald-500/30 text-xs text-emerald-200 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400 flex-shrink-0" />
            <span>
              <strong>Review Engine</strong> will extract product details, compute Positiveness/Negativeness scores, and rewrite all URLs with tag=<strong>{AFFILIATE_ID}</strong>.
            </span>
          </div>

          {/* Submit Actions */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition-all"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-extrabold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-slate-950" />
                  <span>Analyzing Review & Converting Links...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Analyze & Convert Link Now</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};
