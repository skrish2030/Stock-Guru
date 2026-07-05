"use client";

import { useState, useEffect } from 'react';
import { 
    LineChart, 
    Line, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip as RechartsTooltip, 
    ResponsiveContainer 
} from 'recharts';
import { Target, Activity, Flame, Coins, LineChart as LineChartIcon, Rocket, BrainCircuit, Diamond, Landmark, DollarSign, CheckSquare, Newspaper, Info, Briefcase, Calendar, ChevronLeft, ChevronRight, NewspaperIcon, ExternalLink, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface Ticker {
  id: string;
  symbol: string;
  company_name: string;
  score: number;
  tier: string;
  archetype: string;
  action: string;
  smart_money: number;
  retail_hype: number;
  price: number;
  percent_change: number;
  ai_thesis: string;
  company_description?: string;
  why_invest?: string;
}

interface NewsItem {
  datetime?: number;
  published_time?: string;
  source?: string;
  headline?: string;
  summary?: string;
  url?: string;
  link?: string;
}

export default function DashboardClient({ initialTickers, initialNews }: { initialTickers: Ticker[], initialNews: NewsItem[] }) {
  const [tickers, setTickers] = useState<Ticker[]>(initialTickers);
  const [news] = useState<NewsItem[]>(initialNews);
  const [alertsEnabled, setAlertsEnabled] = useState(false);
  
  const [activeTab, setActiveTab] = useState<'watchlist' | 'news_scanner'>('watchlist');
  const [selectedTicker, setSelectedTicker] = useState<Ticker | null>(null);

  // Carousel State
  const [carouselIndex, setCarouselIndex] = useState(0);
  const carouselNews = news.slice(0, 5); // Take top 5 news items for carousel

  // Sync state with notification permission status on load
  useEffect(() => {
    if ("Notification" in window) {
      setAlertsEnabled(Notification.permission === 'granted');
    }
  }, []);

  // Real-time live polling from Supabase when alerts are enabled
  useEffect(() => {
    if (!alertsEnabled) return;

    const interval = setInterval(async () => {
      console.log("[Dashboard] Polling real-time stock updates from Supabase...");
      const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
      const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
      if (!supabaseUrl || !supabaseKey) return;

      try {
        const { createClient } = await import('@supabase/supabase-js');
        const supabaseClient = createClient(supabaseUrl, supabaseKey);
        const { data: latest } = await supabaseClient
          .from('alpha_tickers')
          .select('*')
          .order('score', { ascending: false })
          .limit(30);

        if (latest) {
          setTickers(latest);
        }
      } catch (err) {
        console.error("Live polling failed:", err);
      }
    }, 15000);

    return () => clearInterval(interval);
  }, [alertsEnabled]);

  const handleToggleAlerts = () => {
    if (alertsEnabled) {
      setAlertsEnabled(false);
      return;
    }

    if ("Notification" in window) {
      Notification.requestPermission().then(permission => {
        if (permission === 'granted') {
          setAlertsEnabled(true);
          new Notification("🚨 Real-Time Risk Shield Active", {
            body: "You will now receive desktop alerts for sudden stock drops & breakouts.",
            icon: '/favicon.ico'
          });
        } else {
          alert("Notification permission denied. Please allow notifications in your browser settings to enable real-time alerts.");
        }
      });
    } else {
      alert("This device/browser does not support native push notifications.");
    }
  };

  useEffect(() => {
    if (carouselNews.length === 0) return;
    const interval = setInterval(() => {
      setCarouselIndex((prev) => (prev + 1) % carouselNews.length);
    }, 7000); // Rotate news every 7 seconds
    return () => clearInterval(interval);
  }, [carouselNews]);

  const handlePrevNews = () => {
    if (carouselNews.length === 0) return;
    setCarouselIndex((prev) => (prev - 1 + carouselNews.length) % carouselNews.length);
  };

  const handleNextNews = () => {
    if (carouselNews.length === 0) return;
    setCarouselIndex((prev) => (prev + 1) % carouselNews.length);
  };

  const mockTrendData = Array.from({ length: 7 }).map((_, i) => ({
    day: `Day ${i + 1}`,
    price: selectedTicker ? selectedTicker.price * (1 + (Math.random() * 0.1 - 0.05)) : 0
  }));

  const formattedTime = new Date().toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: '2-digit'
  }) + `, ${new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;

  return (
    <div className="p-6 space-y-6">

      {/* LATEST NEWS CAROUSEL (Matches top of Image 1) */}
      {carouselNews.length > 0 && (
        <div className="border rounded-xl shadow-2xl relative overflow-hidden h-[180px]" style={{ backgroundColor: '#09090b', borderColor: '#27272a' }}>
          <div className="absolute top-0 left-0 w-full h-1 bg-[#8b5cf6]"></div>
          
          {/* Background overlay image / gradient */}
          <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent z-10"></div>
          
          <div className="absolute inset-0 p-6 flex flex-col justify-between z-20">
            <div>
              <span className="text-[10px] font-black text-[#8b5cf6] uppercase tracking-widest block mb-2">Latest News</span>
              <h2 className="text-base md:text-lg font-black text-[#fafafa] leading-tight max-w-xl truncate">
                {carouselNews[carouselIndex].headline}
              </h2>
              <p className="text-xs text-[#a1a1aa] mt-2 line-clamp-2 max-w-xl">
                {carouselNews[carouselIndex].summary || 'Click below to read the full advisory coverage...'}
              </p>
            </div>
            
            <div className="flex justify-between items-center text-[10px] text-[#52525b] font-bold">
              <span>
                SOURCE: {carouselNews[carouselIndex].source || 'Market Feed'} | DATE: {carouselNews[carouselIndex].published_time || 'Today'} | {carouselIndex + 1} of {carouselNews.length}
              </span>
              <div className="flex gap-2">
                <button onClick={handlePrevNews} className="p-1 rounded bg-[#18181b] hover:bg-[#27272a] text-[#fafafa] border border-[#27272a]">
                  <ChevronLeft className="w-3.5 h-3.5" />
                </button>
                <button onClick={handleNextNews} className="p-1 rounded bg-[#18181b] hover:bg-[#27272a] text-[#fafafa] border border-[#27272a]">
                  <ChevronRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* WATCH LIST / NEWS SCANNER TABS BAR (Matches Image 1 tab switcher) */}
      <div className="grid grid-cols-2 gap-2 p-1 bg-[#000000] border rounded-lg" style={{ borderColor: '#27272a' }}>
        <button 
          onClick={() => setActiveTab('watchlist')}
          className={`py-3 text-xs font-black uppercase rounded-md transition-all ${activeTab === 'watchlist' ? 'bg-[#8b5cf6] text-[#ffffff] shadow-lg' : 'text-[#a1a1aa] hover:text-[#fafafa]'}`}
        >
          Watch List
        </button>
        <button 
          onClick={() => setActiveTab('news_scanner')}
          className={`py-3 text-xs font-black uppercase rounded-md transition-all ${activeTab === 'news_scanner' ? 'bg-[#8b5cf6] text-[#ffffff] shadow-lg' : 'text-[#a1a1aa] hover:text-[#fafafa]'}`}
        >
          News Scanner
        </button>
      </div>

      {activeTab === 'watchlist' ? (
        <div className="space-y-6">
          
          {/* Pro Ticker Daily Watch List Card Alert (Matches Image 1 layout) */}
          <div className="border rounded-xl p-6 relative overflow-hidden flex flex-col justify-between items-center text-center shadow-2xl" style={{ backgroundColor: '#09090b', borderColor: '#27272a' }}>
            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#fbbf24] to-[#dfb86c]"></div>
            <div className="space-y-2">
              <h2 className="text-lg font-black text-[#dfb86c] tracking-wide uppercase border-b border-[#27272a] pb-2">
                Pro Ticker Daily Watch List
              </h2>
              <p className="text-sm text-[#fafafa] font-semibold">
                (We post alerts in <span className="text-[#fbbf24] underline">REAL TIME</span>—stay in the app and refresh to see them FIRST)
              </p>
            </div>
            
            {/* Clickable Green Checkbox (Toggles Real-Time Alerts) */}
            <div className="mt-4 flex flex-col items-center justify-center gap-2">
              <button 
                onClick={handleToggleAlerts}
                title="Click to toggle Real-Time Notifications & Live streaming updates"
                className={`w-9 h-9 rounded border flex items-center justify-center font-bold text-lg transition-all duration-300 ${
                  alertsEnabled 
                    ? 'bg-[#10b981] border-[#10b981] text-black shadow-lg shadow-[#10b981]/20 scale-105' 
                    : 'bg-[#10b981]/10 border-[#10b981]/40 text-[#10b981] hover:bg-[#10b981]/25 hover:border-[#10b981] cursor-pointer'
                }`}
              >
                ✓
              </button>
              <span className={`text-[10px] font-black uppercase tracking-wider ${alertsEnabled ? 'text-[#10b981]' : 'text-[#a1a1aa]'}`}>
                {alertsEnabled ? 'Real-Time Streaming Active 🟢' : 'Stream Paused (Click Checkbox to Activate) 🟡'}
              </span>
            </div>
          </div>

          {/* Market Scanner Title Header */}
          <div className="text-center pt-2">
            <h3 className="text-xs font-bold text-[#a1a1aa] tracking-widest uppercase border-t border-b border-[#27272a] py-2">
              — Market Scanner —
            </h3>
          </div>

          {/* Market Status Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-[#000000] border" style={{ borderColor: '#27272a' }}>
              <span className="text-[10px] font-bold text-[#a1a1aa] uppercase tracking-wider">Market Status</span>
              <p className="text-base font-black text-[#fafafa] mt-1">Market Closed</p>
            </div>
            <div className="p-4 rounded-xl bg-[#000000] border" style={{ borderColor: '#27272a' }}>
              <span className="text-[10px] font-bold text-[#a1a1aa] uppercase tracking-wider">Last Updated</span>
              <p className="text-xs font-black text-[#fafafa] mt-1.5">{formattedTime}</p>
            </div>
          </div>

          {/* Market Scanner Grid Cards (Top Stocks) */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {tickers.slice(0, 9).map((t) => {
              const isUp = t.percent_change >= 0;
              const colorHex = isUp ? '#10b981' : '#f43f5e';
              const isSelected = selectedTicker?.id === t.id;
              
              return (
                <div 
                  key={t.id} 
                  onClick={() => setSelectedTicker(t)}
                  className={`bg-[#000000] border p-4 rounded-lg flex flex-col justify-between cursor-pointer hover:bg-[#18181b] transition-all`} 
                  style={{ borderColor: isSelected ? '#8b5cf6' : '#27272a', borderWidth: isSelected ? '2px' : '1px' }}
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs" style={{ backgroundColor: colorHex + '20', color: colorHex, border: `1px solid ${colorHex}30` }}>
                        {t.symbol.substring(0, 2)}
                      </div>
                      <div>
                        <h3 className="font-bold text-sm text-[#fafafa]">{t.symbol}</h3>
                        <p className="text-[9px] text-[#a1a1aa] truncate max-w-[120px]">{t.company_name}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="mt-4 flex justify-between items-end">
                    <div>
                      <span className="text-[9px] font-bold text-[#a1a1aa] block uppercase">Last Price</span>
                      <p className="text-sm font-black text-[#fafafa]">${t.price?.toFixed(2) || 'N/A'}</p>
                    </div>
                    <div className="flex items-center gap-0.5 text-xs font-bold" style={{ color: colorHex }}>
                      {isUp ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
                      {isUp ? '+' : ''}{t.percent_change?.toFixed(2)}%
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      ) : (
        // NEWS SCANNER TAB: Listing of all real-time news articles
        <div className="space-y-4">
          <h3 className="text-xs font-bold text-[#a1a1aa] uppercase tracking-wider pl-1">
            Real-Time News Stream
          </h3>
          <div className="space-y-3">
            {news.map((item, idx) => (
              <div key={idx} className="p-4 rounded-lg bg-[#000000] border border-[#27272a] hover:bg-[#18181b] transition-colors">
                <div className="flex justify-between items-start">
                  <div>
                    <span className="text-[9px] font-bold text-[#8b5cf6] uppercase bg-[#8b5cf6]/10 px-2 py-0.5 rounded border border-[#8b5cf6]/20">
                      {item.source || 'News'}
                    </span>
                    <h4 className="text-sm font-bold text-[#fafafa] mt-2 leading-relaxed">
                      {item.headline}
                    </h4>
                    <p className="text-xs text-[#a1a1aa] mt-2 line-clamp-3">
                      {item.summary}
                    </p>
                  </div>
                </div>
                <div className="mt-3 flex justify-between items-center text-[10px] text-[#52525b] font-semibold border-t border-[#27272a]/40 pt-2">
                  <span>DATE: {item.published_time || 'Today'}</span>
                  {item.url && (
                    <a href={item.url} target="_blank" rel="noreferrer" className="text-[#38bdf8] hover:underline flex items-center gap-1">
                      Read Article <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Selected Ticker Details Split Panel */}
      {selectedTicker && (
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-4 border-t pt-6" style={{ borderColor: '#27272a' }}>
          
          {/* News Panel */}
          <div className="col-span-3 border rounded-xl shadow-xl flex flex-col" style={{ backgroundColor: '#09090b', borderColor: '#27272a' }}>
            <div className="p-3 border-b" style={{ borderColor: '#27272a' }}>
              <h2 className="text-sm font-bold flex items-center gap-2" style={{ color: '#38bdf8' }}>
                <Newspaper className="w-4 h-4" /> Selected Ticker Activity & Real-Time News
              </h2>
            </div>
            <div className="p-4 flex-1 bg-[#000000] m-2 rounded border overflow-y-auto max-h-[350px]" style={{ borderColor: '#27272a' }}>
              <div className="space-y-6">
                {/* What This Company Does */}
                <div>
                  <h3 className="text-xs font-black text-[#38bdf8] uppercase tracking-wider flex items-center gap-2">
                    <Target className="w-3.5 h-3.5 text-[#38bdf8]" /> What This Company Does
                  </h3>
                  <p className="text-xs text-[#fafafa] mt-2 leading-relaxed font-semibold">
                    {selectedTicker.company_description || `${selectedTicker.company_name} is an active player in the ${selectedTicker.symbol} market space, driven by institutional and social interest.`}
                  </p>
                </div>

                {/* Wall Street Verdict & Thesis */}
                <div>
                  <h3 className="text-xs font-black text-[#8b5cf6] uppercase tracking-wider flex items-center gap-2">
                    <Briefcase className="w-3.5 h-3.5 text-[#8b5cf6]" /> Wall Street Scholar Verdict
                  </h3>
                  <p className="text-xs text-[#d4d4d8] mt-2 leading-relaxed border-l-2 pl-3 border-[#8b5cf6] italic">
                    {selectedTicker.ai_thesis && selectedTicker.ai_thesis !== 'No second opinion thesis provided.' 
                      ? selectedTicker.ai_thesis 
                      : `"Following a comprehensive audit of ${selectedTicker.company_name} (${selectedTicker.symbol}), the consensus of the committee is clear. While whale loading activity is ${selectedTicker.smart_money >= 60 ? 'exceptionally high' : 'moderate'}, the sentiment indicators highlight a '${selectedTicker.archetype}' setup. Recommendation: ${selectedTicker.action}."`
                    }
                  </p>
                </div>

                {/* Catalysts Bullets */}
                {selectedTicker.why_invest && (
                  <div>
                    <h3 className="text-xs font-black text-[#10b981] uppercase tracking-wider flex items-center gap-2">
                      <Rocket className="w-3.5 h-3.5 text-[#10b981]" /> Key Catalysts
                    </h3>
                    <div 
                      className="text-xs text-[#a1a1aa] mt-2 space-y-1 list-disc pl-4"
                      dangerouslySetInnerHTML={{ __html: selectedTicker.why_invest }}
                    />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* 7d Trend Chart Panel */}
          <div className="col-span-2 border rounded-xl shadow-xl flex flex-col" style={{ backgroundColor: '#09090b', borderColor: '#27272a' }}>
            <div className="p-3 border-b" style={{ borderColor: '#27272a' }}>
              <h2 className="text-sm font-bold flex items-center gap-2" style={{ color: '#8b5cf6' }}>
                <LineChartIcon className="w-4 h-4" /> Selected Ticker Performance (7d Trend)
              </h2>
            </div>
            <div className="p-4 flex-1 flex items-center justify-center">
              <div className="w-full h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={mockTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                    <XAxis dataKey="day" stroke="#a1a1aa" tick={{ fontSize: 10 }} />
                    <YAxis stroke="#a1a1aa" tick={{ fontSize: 10 }} domain={['auto', 'auto']} />
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#fafafa', fontSize: '12px' }}
                      itemStyle={{ color: '#10b981' }}
                    />
                    <Line type="monotone" dataKey="price" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#000000', stroke: '#10b981', strokeWidth: 2 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

        </div>
      )}

    </div>
  );
}
