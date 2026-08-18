import React, { useState, useEffect } from 'react';

interface AdBannerProps {
  autoReload?: boolean;
  className?: string;
  minReloadSec?: number;
  maxReloadSec?: number;
}

export const AdBanner: React.FC<AdBannerProps> = ({
  autoReload = true,
  className = '',
  minReloadSec = 70,
  maxReloadSec = 90
}) => {
  const [adKey, setAdKey] = useState(0);

  useEffect(() => {
    if (!autoReload) return;

    let timerId: NodeJS.Timeout;

    const scheduleNextReload = () => {
      const minMs = minReloadSec * 1000;
      const maxMs = maxReloadSec * 1000;
      const randomMs = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;

      timerId = setTimeout(() => {
        setAdKey(prev => prev + 1);
        scheduleNextReload();
      }, randomMs);
    };

    scheduleNextReload();

    return () => {
      if (timerId) clearTimeout(timerId);
    };
  }, [autoReload, minReloadSec, maxReloadSec]);

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
    <div className={`bg-white/95 backdrop-blur-md border border-gray-200/80 rounded-2xl p-2 shadow-2xs flex flex-col items-center justify-center transition-all overflow-hidden max-w-full ${className}`}>
      <div className="w-full flex justify-center items-center overflow-x-auto overflow-y-hidden" style={{ minHeight: '90px' }}>
        <iframe
          key={adKey}
          srcDoc={adHtml}
          width={728}
          height={90}
          title="Advertisement"
          style={{ border: 'none', overflow: 'hidden', minWidth: '728px', height: '90px' }}
          scrolling="no"
        />
      </div>
    </div>
  );
};
