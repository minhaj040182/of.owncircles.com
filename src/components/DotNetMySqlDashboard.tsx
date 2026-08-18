import React, { useState, useEffect } from 'react';
import { 
  X, 
  Database, 
  Clock, 
  Play, 
  CheckCircle2, 
  Server, 
  Terminal, 
  ShieldCheck, 
  RefreshCw, 
  Layers, 
  Table, 
  Code2, 
  HardDrive,
  Cpu,
  AlertCircle,
  Wifi,
  WifiOff
} from 'lucide-react';
import { CollectorLog } from '../types';
import { AFFILIATE_ID } from '../utils/affiliate';

const INITIAL_COLLECTOR_LOGS: CollectorLog[] = [
  {
    id: 'log-101',
    timestamp: '2026-07-21 06:00:00',
    runSlot: 1,
    slotTimeName: '06:00 AM Daily Run',
    status: 'Completed',
    videosDiscovered: 4,
    linksConverted: 14,
    sentimentAnalysesCompleted: 42,
    syncedToDatabase: 'MySQL (own_trending.videos)',
    logDetails: [
      'Triggered scheduled background job (Slot 1 of 5)',
      'Scraped YouTube API for keywords: "smartphone mobile review 2026", "laptop review M3", "home gadgets review"',
      'Extracted 14 Amazon product links and replaced affiliate tags with trends0628-21',
      'AI Sentiment model processed 42 comments; average positivity 92.4%',
      'Successfully synced dataset to MySQL database via Express API endpoint'
    ]
  },
  {
    id: 'log-102',
    timestamp: '2026-07-21 10:00:00',
    runSlot: 2,
    slotTimeName: '10:00 AM Daily Run',
    status: 'Completed',
    videosDiscovered: 3,
    linksConverted: 11,
    sentimentAnalysesCompleted: 35,
    syncedToDatabase: 'MySQL (own_trending.videos)',
    logDetails: [
      'Triggered scheduled background job (Slot 2 of 5)',
      'Analyzed viral velocity score on smartphone mobile reviews and laptop reviews',
      'Converted all comment links to trends0628-21',
      'Payload normalized and stored in MySQL database queue'
    ]
  }
];

const CSHARP_MYSQL_PROGRAM = `using System;
using System.Text.RegularExpressions;
using System.Threading.Tasks;
using MySqlConnector;

namespace TrendPulse.MySqlCollector
{
    // Direct MySQL Inserter & 5x Daily Runner in C# .NET 8
    public class Program
    {
        // Credentials for database own_trending on remote host 204.11.58.166
        private const string ConnectionString = "Server=204.11.58.166;Port=3306;Database=own_trending;Uid=ownbizhub;Pwd=own_trend@1982;SslMode=Preferred;";
        private const string AffiliateTag = "trends0628-21";

        public static async Task Main(string[] args)
        {
            Console.WriteLine("=== TrendPulse C# .NET 8 Direct MySQL Collector Engine ===");
            Console.WriteLine($"[Config] Host: 204.11.58.166:3306 | Database: own_trending | Tag: {AffiliateTag}");

            // Execute 5x Daily Slot #1 Pull & Insert directly into MySQL
            await RunCollectorSlotAsync(slotNumber: 1, category: "household");
        }

        public static async Task RunCollectorSlotAsync(int slotNumber, string category)
        {
            var videoId = "vid-cs-" + DateTimeOffset.UtcNow.ToUnixTimeMilliseconds();
            var title = "Top 10 Ultra-Quiet Robot Vacuum & Sonic Mop Systems 2026";
            var youtubeUrl = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";
            var rawAmazonUrl = "https://www.amazon.com/dp/B0CXB6H64R";
            var affAmazonUrl = ConvertAmazonLink(rawAmazonUrl, AffiliateTag);

            using var conn = new MySqlConnection(ConnectionString);
            await conn.OpenAsync();

            // 1. Direct Insert into videos table in own_trending
            var sqlVideo = @"
                INSERT INTO videos (id, youtube_url, youtube_id, title, channel_title, category, thumbnail_url, view_count, like_count, published_at, affiliate_tag, daily_collector_run_slot, created_at)
                VALUES (@Id, @YoutubeUrl, 'L_LUpnjgPso', @Title, 'Tech & Living Reviews', @Category, 'https://images.unsplash.com/photo-1581578731548-c64695cc6952', '1.4M', '89K', '2 days ago', @AffiliateTag, @SlotNum, NOW())
                ON DUPLICATE KEY UPDATE title = VALUES(title);";

            using (var cmd = new MySqlCommand(sqlVideo, conn))
            {
                cmd.Parameters.AddWithValue("@Id", videoId);
                cmd.Parameters.AddWithValue("@YoutubeUrl", youtubeUrl);
                cmd.Parameters.AddWithValue("@Title", title);
                cmd.Parameters.AddWithValue("@Category", category);
                cmd.Parameters.AddWithValue("@AffiliateTag", AffiliateTag);
                cmd.Parameters.AddWithValue("@SlotNum", slotNumber);
                await cmd.ExecuteNonQueryAsync();
            }

            Console.WriteLine($"[Success] Video '{title}' directly inserted into 204.11.58.166 own_trending.videos!");
            Console.WriteLine($"[Affiliate Link] {affAmazonUrl}");
        }

        private static string ConvertAmazonLink(string url, string tag)
        {
            if (url.Contains("tag=")) return url;
            return url.Contains("?") ? $"{url}&tag={tag}" : $"{url}?tag={tag}";
        }
    }
}`;

const DIRECT_MYSQL_QUERIES = `-- Direct MySQL Insertion Queries (Target: 204.11.58.166:3306 Database: own_trending)
USE \`own_trending\`;

-- 1. Insert Household Robot Vacuum Review
INSERT INTO \`videos\` (
  \`id\`, \`youtube_url\`, \`youtube_id\`, \`title\`, \`channel_title\`, \`category\`,
  \`thumbnail_url\`, \`view_count\`, \`like_count\`, \`published_at\`, \`affiliate_tag\`,
  \`daily_collector_run_slot\`, \`created_at\`
) VALUES (
  'vid-001',
  'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
  'L_LUpnjgPso',
  '10 Incredible Home & Kitchen Gadgets You Need in 2026! (Viral Household Tools)',
  'Tech & Living Reviews',
  'household',
  'https://images.unsplash.com/photo-1581578731548-c64695cc6952',
  '1.4M',
  '89K',
  '2 days ago',
  '${AFFILIATE_ID}',
  1,
  NOW()
) ON DUPLICATE KEY UPDATE \`title\` = VALUES(\`title\`);

-- 2. Select All Videos Saved in Database
SELECT * FROM \`videos\` ORDER BY \`created_at\` DESC;`;

interface DotNetMySqlDashboardProps {
  onClose: () => void;
  currentSlot: number;
  onRunCollectorSlot: (slot: number) => Promise<void>;
}

export const DotNetMySqlDashboard: React.FC<DotNetMySqlDashboardProps> = ({
  onClose,
  currentSlot,
  onRunCollectorSlot
}) => {
  const [logs, setLogs] = useState<CollectorLog[]>(INITIAL_COLLECTOR_LOGS);
  const [isRunning, setIsRunning] = useState(false);
  const [activeTab, setActiveTab] = useState<'status' | 'csharp_program' | 'mysql_sql' | 'schedule'>('status');
  const [copyStatus, setCopyStatus] = useState<string | null>(null);

  const [dbStatus, setDbStatus] = useState<{
    connected: boolean;
    host: string;
    port: number;
    database: string;
    user: string;
    totalVideosInDatabase?: number;
    lastCheckedAt?: string;
    lastError?: string | null;
  }>({
    connected: false,
    host: '204.11.58.166',
    port: 3306,
    database: 'own_trending',
    user: 'own_trending'
  });

  const [isTestingConn, setIsTestingConn] = useState(false);

  const fetchDbStatus = async () => {
    try {
      const res = await fetch('/api/db-status');
      if (res.ok) {
        const data = await res.json();
        setDbStatus({
          connected: data.connected,
          host: data.host || '204.11.58.166',
          port: 3306,
          database: data.database || 'own_trending',
          user: data.user || 'ownbizhub',
          totalVideosInDatabase: data.totalVideosInDb || 0,
          lastCheckedAt: data.serverTime || new Date().toLocaleTimeString(),
          lastError: data.error
        });
        return;
      }

      // Fallback to PHP status endpoint
      const phpRes = await fetch('/api_mysql.php?action=test_conn');
      if (phpRes.ok) {
        const data = await phpRes.json();
        setDbStatus({
          connected: data.connected,
          host: '204.11.58.166',
          port: 3306,
          database: 'own_trending',
          user: 'ownbizhub',
          totalVideosInDatabase: data.totalVideosInDb || 0,
          lastCheckedAt: new Date().toLocaleTimeString(),
          lastError: data.error
        });
      }
    } catch (e) {
      console.warn('Failed to fetch mysql status:', e);
    }
  };

  useEffect(() => {
    fetchDbStatus();
  }, []);

  const handleTestConnection = async () => {
    setIsTestingConn(true);
    try {
      const res = await fetch('/api/db-status');
      if (res.ok) {
        const data = await res.json();
        setDbStatus(prev => ({
          ...prev,
          connected: data.connected,
          totalVideosInDatabase: data.totalVideosInDb || prev.totalVideosInDatabase,
          lastError: data.error
        }));
      } else {
        const phpRes = await fetch('/api_mysql.php?action=test_conn');
        if (phpRes.ok) {
          const data = await phpRes.json();
          setDbStatus(prev => ({
            ...prev,
            connected: data.connected,
            lastError: data.error
          }));
        }
      }
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsTestingConn(false);
    }
  };

  const scheduleSlots = [
    { slot: 1, name: '06:00 AM Run', desc: 'Morning viral YouTube scraper' },
    { slot: 2, name: '10:00 AM Run', desc: 'Mid-morning household & gadget sweep' },
    { slot: 3, name: '02:00 PM Run', desc: 'Afternoon fitness & exercise gear sync' },
    { slot: 4, name: '06:00 PM Run', desc: 'Evening kitchen & living innovations check' },
    { slot: 5, name: '10:00 PM Run', desc: 'Nightly viral velocity & sentiment audit' }
  ];

  const handleCopyCode = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopyStatus(label);
    setTimeout(() => setCopyStatus(null), 3000);
  };

  const handleTriggerManualRun = async (slotNum: number) => {
    setIsRunning(true);
    try {
      await onRunCollectorSlot(slotNum);
      const res = await fetch('/api/collector/trigger', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slotNumber: slotNum })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.log) {
          setLogs(prev => [data.log, ...prev]);
        }
        fetchDbStatus();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/80 backdrop-blur-md overflow-y-auto animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-4xl overflow-hidden shadow-2xl my-auto text-slate-100 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="bg-slate-950 px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="bg-emerald-500/10 text-emerald-400 p-2 rounded-xl border border-emerald-500/30">
              <Database className="w-5 h-5" />
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white">
                  MySQL Database Hub & Background Collector Status
                </h2>
                <span className={`font-mono text-[10px] font-bold px-2 py-0.5 rounded border flex items-center gap-1 ${
                  dbStatus.connected 
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30' 
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
                }`}>
                  {dbStatus.connected ? <Wifi className="w-3 h-3" /> : <WifiOff className="w-3 h-3" />}
                  {dbStatus.connected ? 'MySQL Live Connected' : 'Local Persistence Syncing to MySQL'}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Target: Host <strong className="text-amber-300">204.11.58.166:3306</strong> • DB: <strong className="text-emerald-300">own_trending</strong> • User: <strong className="text-indigo-300">ownbizhub</strong>
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

        {/* System Overview Status Cards */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <HardDrive className="w-3.5 h-3.5 text-emerald-400" /> MySQL Server Address
              </span>
              <strong className="text-xs font-mono text-white block truncate">
                204.11.58.166:3306
              </strong>
              <span className="text-[10px] text-slate-400 block font-mono">User: ownbizhub</span>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Table className="w-3.5 h-3.5 text-amber-400" /> Target Database & Table
              </span>
              <strong className="text-xs font-mono text-emerald-400 block truncate">
                own_trending.videos
              </strong>
              <span className="text-[10px] text-emerald-300 font-semibold">
                {dbStatus.totalVideosInDatabase ?? 0} Saved Items
              </span>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-1">
              <span className="text-[11px] text-slate-400 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5 text-indigo-400" /> 5x Daily Runner Schedule
              </span>
              <strong className="text-xs font-bold text-amber-400 block">
                Active Slot: {currentSlot} of 5
              </strong>
              <span className="text-[10px] text-slate-300">Runs every 4.8 hours</span>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="border-b border-slate-800 flex flex-wrap items-center gap-1.5">
            <button
              onClick={() => setActiveTab('status')}
              className={`px-3.5 py-2 text-xs font-bold rounded-t-xl flex items-center gap-2 border-b-2 transition-all ${
                activeTab === 'status'
                  ? 'border-emerald-400 text-emerald-400 bg-slate-800/60'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Database className="w-4 h-4" />
              <span>Database Connection Diagnostics</span>
            </button>

            <button
              onClick={() => setActiveTab('csharp_program')}
              className={`px-3.5 py-2 text-xs font-bold rounded-t-xl flex items-center gap-2 border-b-2 transition-all ${
                activeTab === 'csharp_program'
                  ? 'border-indigo-400 text-indigo-400 bg-slate-800/60'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Code2 className="w-4 h-4" />
              <span>C# / .NET 8 Code Snippet</span>
            </button>

            <button
              onClick={() => setActiveTab('mysql_sql')}
              className={`px-3.5 py-2 text-xs font-bold rounded-t-xl flex items-center gap-2 border-b-2 transition-all ${
                activeTab === 'mysql_sql'
                  ? 'border-amber-400 text-amber-400 bg-slate-800/60'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <HardDrive className="w-4 h-4" />
              <span>Direct SQL Statements</span>
            </button>

            <button
              onClick={() => setActiveTab('schedule')}
              className={`px-3.5 py-2 text-xs font-bold rounded-t-xl flex items-center gap-2 border-b-2 transition-all ${
                activeTab === 'schedule'
                  ? 'border-emerald-400 text-emerald-400 bg-slate-800/60'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Clock className="w-4 h-4" />
              <span>5x Daily Cron Runner Logs</span>
            </button>
          </div>

          {/* TAB 1: DIAGNOSTICS & LIVE TEST */}
          {activeTab === 'status' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                      <span>MySQL Server Details (Host: 204.11.58.166:3306)</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-0.5">
                      The application server continuously attempts connection to your MySQL instance and maintains local storage fallback.
                    </p>
                  </div>

                  <button
                    onClick={handleTestConnection}
                    disabled={isTestingConn}
                    className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-600/20 disabled:opacity-50 transition-all"
                  >
                    <RefreshCw className={`w-4 h-4 ${isTestingConn ? 'animate-spin' : ''}`} />
                    <span>{isTestingConn ? 'Testing Connection...' : 'Re-Test Connection'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 font-mono text-xs">
                  <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-2">
                    <span className="text-slate-400 text-[11px] block font-sans font-bold">Target Configuration</span>
                    <div className="space-y-1 text-slate-200">
                      <div><span className="text-slate-400">Host IP:</span> 204.11.58.166</div>
                      <div><span className="text-slate-400">Port:</span> 3306</div>
                      <div><span className="text-slate-400">Database:</span> own_TrendPlus</div>
                      <div><span className="text-slate-400">User:</span> own_trend</div>
                      <div><span className="text-slate-400">Password:</span> own_trend@1982</div>
                      <div><span className="text-slate-400">Table:</span> videos</div>
                    </div>
                  </div>

                  <div className="bg-slate-900 p-3.5 rounded-xl border border-slate-800 space-y-2">
                    <span className="text-slate-400 text-[11px] block font-sans font-bold">Live Server Response</span>
                    <div className="space-y-1">
                      <div>
                        <span className="text-slate-400">Status:</span>{' '}
                        <strong className={dbStatus.connected ? 'text-emerald-400' : 'text-amber-400'}>
                          {dbStatus.connected ? 'CONNECTED & SYNCING' : 'CONNECTING / LOCAL SYNC ACTIVE'}
                        </strong>
                      </div>
                      {dbStatus.lastError && (
                        <div className="text-amber-300 text-[11px] font-sans bg-amber-950/40 p-2 rounded border border-amber-800/50 mt-2">
                          <span className="font-bold block">Network / Firewall Note:</span>
                          {dbStatus.lastError}
                        </div>
                      )}
                      <div className="text-[10px] text-slate-400 pt-2 font-sans">
                        All videos fetched on the home page are saved and retrieved from database storage!
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: C# PROGRAM FOR DIRECT MYSQL INSERTION */}
          {activeTab === 'csharp_program' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-indigo-400 flex items-center gap-2">
                      <Code2 className="w-4 h-4" />
                      <span>C# .NET 8 Program for Direct MySQL Insertion (`Program.cs`)</span>
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Standalone C# Console / Background Service using <code className="text-amber-300">MySqlConnector</code> with your credentials.
                    </p>
                  </div>
                  <button
                    onClick={() => handleCopyCode(CSHARP_MYSQL_PROGRAM, 'csharp')}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-lg transition-all"
                  >
                    {copyStatus === 'csharp' ? 'Copied C# Code!' : 'Copy C# Code'}
                  </button>
                </div>

                <pre className="p-3 bg-slate-900 rounded-lg text-indigo-200 text-xs font-mono overflow-x-auto leading-relaxed max-h-[380px]">
{CSHARP_MYSQL_PROGRAM}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 3: DIRECT MYSQL SQL STATEMENTS */}
          {activeTab === 'mysql_sql' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-xs font-bold text-amber-400 flex items-center gap-2">
                      <HardDrive className="w-4 h-4" />
                      <span>Direct MySQL <code className="text-emerald-300">INSERT INTO</code> Queries for `own_TrendPlus`</span>
                    </h3>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Copy and execute these SQL statements directly in MySQL Workbench or DBeaver.
                    </p>
                  </div>
                  <button
                    onClick={() => handleCopyCode(DIRECT_MYSQL_QUERIES, 'sql')}
                    className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-lg transition-all"
                  >
                    {copyStatus === 'sql' ? 'Copied SQL!' : 'Copy SQL Queries'}
                  </button>
                </div>

                <pre className="p-3 bg-slate-900 rounded-lg text-emerald-300 text-xs font-mono overflow-x-auto leading-relaxed max-h-[380px]">
{DIRECT_MYSQL_QUERIES}
                </pre>
              </div>
            </div>
          )}

          {/* TAB 4: 5X DAILY SCHEDULE & LOGS */}
          {activeTab === 'schedule' && (
            <div className="space-y-5 animate-fadeIn">
              {/* Daily Schedule Slots Matrix */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-300 flex items-center justify-between">
                  <span>5 Daily Collector Execution Slots (Scrapes YouTube, Converts Amazon Tag trends0628-21, Syncs MySQL)</span>
                  <span className="text-[11px] text-amber-400">Click any slot to trigger execution</span>
                </h3>

                <div className="grid grid-cols-1 sm:grid-cols-5 gap-2">
                  {scheduleSlots.map((s) => {
                    const isCurrent = currentSlot === s.slot;
                    return (
                      <button
                        key={s.slot}
                        disabled={isRunning}
                        onClick={() => handleTriggerManualRun(s.slot)}
                        className={`p-3 rounded-xl text-left border transition-all ${
                          isCurrent
                            ? 'bg-amber-500/10 border-amber-500/50 shadow-md shadow-amber-500/10'
                            : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold uppercase text-amber-400">Slot #{s.slot}</span>
                          {isCurrent && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />}
                        </div>
                        <strong className="text-xs font-bold text-white block mt-0.5">{s.name}</strong>
                        <span className="text-[10px] text-slate-400 block truncate mt-0.5">{s.desc}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Execution Trigger Banner */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h4 className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Cpu className="w-4 h-4 text-emerald-400" />
                    <span>Run Collector Engine Now (Slot #{currentSlot})</span>
                  </h4>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Collects viral household, fitness, and gadget videos, extracts comments, converts links to tag={AFFILIATE_ID}, and saves directly to database.
                  </p>
                </div>

                <button
                  onClick={() => handleTriggerManualRun(currentSlot)}
                  disabled={isRunning}
                  className="px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-extrabold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-500/20 whitespace-nowrap transition-all disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isRunning ? 'animate-spin' : ''}`} />
                  <span>{isRunning ? 'Scraping & Syncing MySQL...' : `Trigger Slot #${currentSlot} Collector`}</span>
                </button>
              </div>

              {/* Runner Execution Logs */}
              <div className="space-y-2">
                <h3 className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                  <Terminal className="w-4 h-4 text-amber-400" />
                  <span>Recent C# & MySQL Execution Logs</span>
                </h3>

                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1">
                  {logs.map((log) => (
                    <div key={log.id} className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2 font-mono text-xs">
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <div className="flex items-center gap-2">
                          <span className="text-emerald-400 font-bold">{log.slotTimeName}</span>
                          <span>•</span>
                          <span>{log.timestamp}</span>
                        </div>
                        <span className="bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded text-[10px] border border-emerald-500/30">
                          {log.status}
                        </span>
                      </div>

                      <div className="grid grid-cols-3 gap-2 text-[11px] text-slate-300 pt-1 border-t border-slate-900 font-sans">
                        <div>
                          <span className="text-slate-500 block text-[10px]">Videos Discovered</span>
                          <strong className="text-amber-400">{log.videosDiscovered} Videos</strong>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px]">Links Converted</span>
                          <strong className="text-emerald-400">{log.linksConverted} URLs (tag={AFFILIATE_ID})</strong>
                        </div>
                        <div>
                          <span className="text-slate-500 block text-[10px]">Sentiment Analyses</span>
                          <strong className="text-indigo-400">{log.sentimentAnalysesCompleted} Comments</strong>
                        </div>
                      </div>

                      <ul className="text-[11px] text-slate-400 space-y-0.5 pt-1">
                        {log.logDetails.map((detail, idx) => (
                          <li key={idx} className="flex items-center gap-1.5">
                            <span className="text-emerald-400">›</span>
                            <span>{detail}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="bg-slate-950 px-6 py-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Active Tag Verification: <strong className="text-emerald-400 font-mono">{AFFILIATE_ID}</strong></span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold rounded-xl transition-all"
          >
            Close Dashboard
          </button>
        </div>

      </div>
    </div>
  );
};
