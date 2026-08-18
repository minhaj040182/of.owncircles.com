import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';

export const VideoPlayerAdOverlay: React.FC = () => {
  const [isClosed, setIsClosed] = useState(false);
  const [adKey, setAdKey] = useState(0);

  useEffect(() => {
    let timerId: NodeJS.Timeout;

    const scheduleNextReload = () => {
      // Random time between 70,000 ms (70s) and 90,000 ms (90s)
      const randomMs = Math.floor(Math.random() * (90000 - 70000 + 1)) + 70000;

      timerId = setTimeout(() => {
        setAdKey(prev => prev + 1);
        scheduleNextReload();
      }, randomMs);
    };

    scheduleNextReload();

    return () => {
      if (timerId) clearTimeout(timerId);
    };
  }, []);

  if (isClosed) return null;

  const adHtml = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <style>
          body, html {
            margin: 0;
            padding: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
            display: flex;
            justify-content: center;
            align-items: center;
            background: transparent;
          }
        </style>
      </head>
      <body>
        <script type="text/javascript">
          atOptions = {
            'key' : '3f16c9c6ce3e68ae340bc5709a492208',
            'format' : 'iframe',
            'height' : 90,
            'width' : 728,
            'params' : {}
          };
        </script>
        <script type="text/javascript" src="https://www.highperformanceformat.com/3f16c9c6ce3e68ae340bc5709a492208/invoke.js"></script>
      </body>
    </html>
  `;

  return (
    <div className="absolute bottom-0 left-0 right-0 z-20 m-0 p-0 bg-black/80 backdrop-blur-sm transition-all duration-300 flex flex-col items-center justify-center pointer-events-auto border-t border-white/10">
      {/* Close button strictly positioned top right */}
      <button
        onClick={() => setIsClosed(true)}
        className="absolute top-1 right-1 z-30 p-1 bg-black/70 hover:bg-rose-600 text-white rounded-full transition-all cursor-pointer shadow-md flex items-center justify-center hover:scale-105"
        title="Close Ad"
        aria-label="Close Advertisement"
      >
        <X className="w-4 h-4" />
      </button>

      {/* Ad Content Container - no outer padding/margin */}
      <div className="w-full h-[90px] flex justify-center items-center overflow-hidden py-0 my-0">
        <div className="w-full max-w-[728px] h-[90px] flex items-center justify-center scale-90 sm:scale-100 transform origin-center">
          <iframe
            key={adKey}
            srcDoc={adHtml}
            width={728}
            height={90}
            title="Video Player Advertisement"
            style={{ border: 'none', overflow: 'hidden', width: '728px', height: '90px' }}
            scrolling="no"
          />
        </div>
      </div>
    </div>
  );
};
