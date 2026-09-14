import React from 'react';
import { 
  Home, 
  ChevronRight, 
  BookOpen, 
  ShieldCheck, 
  Layers, 
  Key, 
  Binary, 
  Braces, 
  Globe
} from 'lucide-react';
import { ToolId, ToolDefinition } from '../types';

interface BreadcrumbsProps {
  activeTool: ToolId;
  educationTopic: string;
  toolsList: ToolDefinition[];
  theme: any;
  themeKey: string;
  basePath: string;
  onNavigate: (toolId: ToolId, topic?: string) => void;
}

// Canonical representative paths for each category hub
const CATEGORY_META: Record<string, { label: string; icon: React.ReactNode; representativeToolId: ToolId; path: string }> = {
  devops: { 
    label: 'DevOps & Cloud', 
    icon: <Layers className="w-3.5 h-3.5" />, 
    representativeToolId: 'docker',
    path: '/docker-compose-validator'
  },
  formatter: { 
    label: 'Formatters & Beautifiers', 
    icon: <Braces className="w-3.5 h-3.5" />, 
    representativeToolId: 'json',
    path: '/json-formatter'
  },
  network: { 
    label: 'REST Network Tools', 
    icon: <Globe className="w-3.5 h-3.5" />, 
    representativeToolId: 'api',
    path: '/api-tester'
  },
  encoder: { 
    label: 'Encoders & Ciphers', 
    icon: <Binary className="w-3.5 h-3.5" />, 
    representativeToolId: 'base64',
    path: '/base64-encoder'
  },
  utility: { 
    label: 'Security & String Utils', 
    icon: <Key className="w-3.5 h-3.5" />, 
    representativeToolId: 'jwt',
    path: '/jwt-debugger'
  }
};

export const Breadcrumbs: React.FC<BreadcrumbsProps> = ({
  activeTool,
  educationTopic,
  toolsList,
  themeKey,
  basePath,
  onNavigate
}) => {
  const isLight = themeKey === 'light';

  // Format educational topic title with standard naming
  const formatTopicName = (topic: string) => {
    const matchedTool = toolsList.find(t => t.id === topic);
    if (matchedTool) {
      return matchedTool.name.replace(/Formatter|Validator|Generator|Tester|Converter|Debugger/gi, '').trim() + ' Specification Manual';
    }
    return topic.charAt(0).toUpperCase() + topic.slice(1) + ' Handbook & RFC Guide';
  };

  // Find active tool metadata
  const currentTool = toolsList.find(t => t.id === activeTool);

  // Build hierarchical breadcrumb items with explicit crawlable URLs
  const items: Array<{
    label: string;
    href: string;
    icon?: React.ReactNode;
    onClick?: () => void;
    isCurrent: boolean;
  }> = [
    {
      label: 'Home',
      href: basePath ? `${basePath}/` : '/',
      icon: <Home className="w-3.5 h-3.5" />,
      onClick: () => onNavigate('home'),
      isCurrent: activeTool === 'home'
    }
  ];

  if (activeTool === 'education') {
    items.push({
      label: 'Developer Handbooks',
      href: `${basePath}/learn-json`,
      icon: <BookOpen className="w-3.5 h-3.5 text-teal-400" />,
      onClick: () => onNavigate('education', 'json'),
      isCurrent: false
    });
    items.push({
      label: formatTopicName(educationTopic),
      href: `${basePath}/learn-${educationTopic}`,
      isCurrent: true
    });
  } else if (['privacy', 'terms', 'about'].includes(activeTool)) {
    const legalMeta: Record<string, { label: string; path: string }> = {
      privacy: { label: 'Privacy Policy', path: '/privacy-policy' },
      terms: { label: 'Terms of Service', path: '/terms-of-service' },
      about: { label: 'About & Editorial Standards', path: '/about-us' }
    };
    items.push({
      label: 'Governance & Trust',
      href: `${basePath}/about-us`,
      icon: <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />,
      onClick: () => onNavigate('about'),
      isCurrent: false
    });
    items.push({
      label: legalMeta[activeTool]?.label || activeTool,
      href: `${basePath}${legalMeta[activeTool]?.path || '/' + activeTool}`,
      isCurrent: true
    });
  } else if (currentTool) {
    const categoryInfo = CATEGORY_META[currentTool.category];
    // Only show category breadcrumb if it does not point to the exact same page
    if (categoryInfo && categoryInfo.representativeToolId !== currentTool.id) {
      items.push({
        label: categoryInfo.label,
        href: `${basePath}${categoryInfo.path}`,
        icon: categoryInfo.icon,
        onClick: () => onNavigate(categoryInfo.representativeToolId),
        isCurrent: false
      });
    }

    // Current Active Tool (e.g. JSON Formatter, YAML Formatter, Cron Parser)
    const toolLabel = currentTool.id === 'json' ? 'JSON Formatter' : currentTool.id === 'yaml' ? 'YAML Formatter & Converter' : currentTool.id === 'cron' ? 'Cron Expression Parser' : currentTool.name;
    const toolHref = currentTool.id === 'json' ? '/json-formatter' : currentTool.id === 'yaml' ? '/yaml-formatter' : currentTool.id === 'cron' ? '/cron-parser' : (typeof window !== 'undefined' ? window.location.pathname : `${basePath}/${currentTool.id}`);

    items.push({
      label: toolLabel,
      href: toolHref,
      isCurrent: true
    });
  }

  // Schema.org BreadcrumbList structured data for Googlebot and search crawlers
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      item: typeof window !== 'undefined'
        ? (item.href.startsWith('http') ? item.href : (window.location.origin + item.href))
        : `https://ownformatters.com${item.href}`
    }))
  };

  return (
    <nav 
      aria-label="Breadcrumb"
      className={`w-full px-4 lg:px-6 py-2.5 border-b text-xs transition-colors ${
        isLight 
          ? 'bg-slate-100/80 border-slate-200 text-slate-600' 
          : 'bg-slate-900/60 border-slate-800/80 text-slate-400'
      }`}
    >
      {/* Schema.org Breadcrumb JSON-LD for rich snippet rendering in search engines */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />

      <div className="w-full flex items-center flex-wrap gap-1.5 font-medium leading-none">
        <ol className="flex items-center flex-wrap gap-1.5 list-none m-0 p-0">
          {items.map((item, idx) => {
            const isLast = idx === items.length - 1;

            return (
              <li key={idx} className="flex items-center gap-1.5">
                {idx > 0 && (
                  <ChevronRight 
                    className={`w-3 h-3 shrink-0 ${isLight ? 'text-slate-400' : 'text-slate-600'}`} 
                    aria-hidden="true" 
                  />
                )}
                
                {isLast || item.isCurrent ? (
                  <span 
                    aria-current="page"
                    className={`flex items-center gap-1.5 font-semibold px-2 py-1 rounded-md ${
                      isLight 
                        ? 'bg-white text-indigo-700 shadow-2xs border border-slate-200' 
                        : 'bg-slate-800/80 text-indigo-300 border border-slate-700/60'
                    }`}
                  >
                    {item.icon}
                    <span className="truncate max-w-[220px] sm:max-w-[340px] md:max-w-none">
                      {item.label}
                    </span>
                  </span>
                ) : (
                  <a
                    href={item.href}
                    onClick={(e) => {
                      if (!e.ctrlKey && !e.metaKey) {
                        e.preventDefault();
                        if (item.onClick) {
                          item.onClick();
                        } else {
                          window.history.pushState(null, '', item.href);
                          window.dispatchEvent(new PopStateEvent('popstate'));
                        }
                      }
                    }}
                    className={`flex items-center gap-1.5 px-1.5 py-1 rounded-md transition-colors cursor-pointer hover:underline ${
                      isLight 
                        ? 'hover:text-indigo-600 hover:bg-slate-200/60 text-slate-600' 
                        : 'hover:text-white hover:bg-slate-800 text-slate-400'
                    }`}
                  >
                    {item.icon}
                    <span>{item.label}</span>
                  </a>
                )}
              </li>
            );
          })}
        </ol>
      </div>
    </nav>
  );
};
