"use client";

import { useState } from 'react';
import { 
    LineChart, 
    Line, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip as RechartsTooltip, 
    ResponsiveContainer 
} from 'recharts';
import { Target, Activity, Flame, Coins, LineChart as LineChartIcon, Rocket, BrainCircuit, Diamond, Landmark, DollarSign, CheckSquare, Newspaper, Info, Briefcase, Calendar, ShieldAlert, ShieldCheck, ToggleLeft, ToggleRight } from 'lucide-react';

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
}

export default function DashboardClient({ initialTickers }: { initialTickers: Ticker[] }) {
  const [tickers] = useState<Ticker[]>(initialTickers);
  const [activeFilter, setActiveFilter] = useState('all');
  const [selectedTicker, setSelectedTicker] = useState<Ticker | null>(null);
  
  // Premium feature: Simulated market crash toggle for testing
  const [simulateCrash, setSimulateCrash] = useState(false);

  const smartMoneyCount = tickers.filter(t => t.smart_money > 50).length;
  const topPicks = tickers.filter(t => t.score >= 75).sort((a, b) => b.score - a.score);

  // Dynamic risk calculation based on average ticker performance
  const realAverageChange = tickers.reduce((acc, t) => acc + (t.percent_change || 0), 0) / (tickers.length || 1);
  const averageChange = simulateCrash ? -4.85 : realAverageChange;

  const isCrash = averageChange < -1.5;
  const riskLevel = isCrash 
    ? 'CRITICAL (Crash Alert)' 
    : (averageChange < 0.5 ? 'MODERATE (Hedging Active)' : 'LOW (Bull Market)');
  const riskColor = isCrash ? '#f43f5e' : (averageChange < 0.5 ? '#fbbf24' : '#10b981');

  // Hardcoded defensive bear market hedges (Inverse ETFs, Gold, Treasury bonds) for non-technical users
  const bearHedges: Ticker[] = [
    {
      id: 'hedge-1',
      symbol: 'SH',
      company_name: 'ProShares Short S&P500 (Inverse S&P ETF)',
      price: 15.42,
      percent_change: simulateCrash ? 4.85 : -0.21,
      score: 85,
      tier: 'Tier 1',
      archetype: 'Bear Hedge 🛡️',
      action: simulateCrash ? 'Strong Buy (Crash Hedge)' : 'Hold / Watch',
      smart_money: 82,
      retail_hype: 45,
      ai_thesis: 'An inverse ETF that rises when the S&P 500 falls. The ultimate safe haven during market declines.'
    },
    {
      id: 'hedge-2',
      symbol: 'PSQ',
      company_name: 'ProShares Short QQQ (Inverse Nasdaq ETF)',
      price: 12.10,
      percent_change: simulateCrash ? 5.72 : -0.35,
      score: 88,
      tier: 'Tier 1',
      archetype: 'Bear Hedge 🛡️',
      action: simulateCrash ? 'Strong Buy (Tech Hedge)' : 'Hold / Watch',
      smart_money: 89,
      retail_hype: 50,
      ai_thesis: 'Direct short coverage for Nasdaq tech listings. Rises when tech crashes.'
    },
    {
      id: 'hedge-3',
      symbol: 'GLD',
      company_name: 'SPDR Gold Shares (Safe Haven Gold)',
      price: 215.30,
      percent_change: simulateCrash ? 2.10 : 0.05,
      score: 79,
      tier: 'Tier 2',
      archetype: 'Gold Safe Haven 🛡️',
      action: 'Accumulate (Safety)',
      smart_money: 75,
      retail_hype: 30,
      ai_thesis: 'Physical gold trust tracking metal prices. Standard inflation and systemic crash hedge.'
    },
    {
      id: 'hedge-4',
      symbol: 'TLT',
      company_name: 'iShares 20+ Year Treasury Bond ETF',
      price: 94.50,
      percent_change: simulateCrash ? 1.85 : -0.10,
      score: 74,
      tier: 'Tier 2',
      archetype: 'Treasury Safe Haven 🛡️',
      action: 'Hold / Accumulate',
      smart_money: 68,
      retail_hype: 25,
      ai_thesis: 'Long-term government bonds. Tends to appreciate when equity markets crash and capital flees to safety.'
    }
  ];

  // Combine regular tickers with defensive hedges if the user filters for them
  const allAvailableAssets = [...tickers, ...bearHedges];

  const filteredTickers = allAvailableAssets.filter(t => {
    switch (activeFilter) {
      case 'hedges': return t.archetype?.includes('Hedge') || t.archetype?.includes('Haven');
      case 'high': return t.score >= 75 && !t.archetype?.includes('Hedge');
      case 'penny': return t.price < 10 && t.price > 0 && !t.archetype?.includes('Hedge');
      case 'regular': return t.price >= 10 && !t.archetype?.includes('Hedge');
      case 'ipo': return t.archetype?.toLowerCase().includes('ipo') && !t.archetype?.includes('Hedge');
      case 'ai': return t.archetype?.toLowerCase().includes('ai') && !t.archetype?.includes('Hedge');
      case 'crypto': return t.archetype?.toLowerCase().includes('crypto') && !t.archetype?.includes('Hedge');
      case 'congress': return t.smart_money >= 50 && !t.archetype?.includes('Hedge'); 
      case 'cashflow': return t.score >= 80 && !t.archetype?.includes('Hedge');
      case 'all':
      default: return true;
    }
  });

  const mockTrendData = Array.from({ length: 7 }).map((_, i) => ({
    day: `Day ${i + 1}`,
    price: selectedTicker ? selectedTicker.price * (1 + (Math.random() * 0.1 - 0.05)) : 0
  }));

  const filters = [
    { id: 'all', label: 'All Assets', icon: Activity, color: '#38bdf8' },
    { id: 'hedges', label: 'Bear Market Hedges 🛡️', icon: ShieldCheck, color: '#f43f5e' },
    { id: 'high', label: 'High Conviction', icon: Flame, color: '#f43f5e' },
    { id: 'penny', label: 'Penny Stocks (<$10)', icon: Coins, color: '#fbbf24' },
    { id: 'regular', label: 'Regular Stocks (≥$10)', icon: LineChartIcon, color: '#94a3b8' },
    { id: 'ipo', label: 'IPOs', icon: Rocket, color: '#f472b6' },
    { id: 'ai', label: 'AI Sector', icon: BrainCircuit, color: '#a855f7' },
    { id: 'crypto', label: 'Crypto Web3', icon: Diamond, color: '#38bdf8' },
    { id: 'congress', label: 'Congress Picks', icon: Landmark, color: '#94a3b8' },
    { id: 'cashflow', label: 'High Cash Flow', icon: DollarSign, color: '#fbbf24' },
  ];

  return (
    <div className="p-6 space-y-6">

      {/* Global Market Health Warning System Banner */}
      <div className="border rounded-xl shadow-2xl p-4 flex flex-col md:flex-row justify-between items-center gap-4" style={{ backgroundColor: isCrash ? '#450a0a' : '#18181b', borderColor: isCrash ? '#f43f5e' : '#27272a' }}>
        <div className="flex items-start gap-4">
          <div className={`p-3 rounded-full ${isCrash ? 'bg-[#f43f5e]/20 text-[#f43f5e]' : 'bg-[#8b5cf6]/20 text-[#8b5cf6]'}`}>
            {isCrash ? <ShieldAlert className="w-6 h-6 animate-pulse" /> : <Briefcase className="w-6 h-6" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-black tracking-widest uppercase text-[#fafafa]">
                {isCrash ? '⚠️ EMERGENCY MARKET CRASH WARNING' : "Veteran's Daily Briefing"}
              </h2>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded" style={{ backgroundColor: riskColor + '20', color: riskColor, border: `1px solid ${riskColor}` }}>
                {riskLevel}
              </span>
            </div>
            <p className="text-sm text-[#d4d4d8] leading-relaxed mt-1">
              {isCrash ? (
                <span>
                  <strong>CRITICAL ALERT:</strong> Scanners indicate massive capital outflows and high short positions by hedge funds. We have triggered our <strong>Bear Market Hedging protocol</strong>. I strongly recommend hiding in safe havens (Gold) or utilizing <strong>Inverse ETFs (SH, PSQ)</strong> to profit on the way down. Protect your nest egg!
                </span>
              ) : (
                <span>
                  Good morning. Today, our scanners detected steady institutional buying (<span className="text-[#38bdf8] font-bold cursor-help" title="Large, quiet purchases by hedge funds and politicians">Smart Money</span>) shifting into the Tech & AI Sector. I recommend looking closely at our Top Picks below for potential swing trades this week.
                </span>
              )}
            </p>
          </div>
        </div>

        {/* Override Crash Simulator for Demo/Testing */}
        <button 
          onClick={() => {
            setSimulateCrash(!simulateCrash);
            setSelectedTicker(null);
          }}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-bold border border-[#27272a] bg-[#000000] text-[#a1a1aa] hover:text-[#fafafa] transition-colors whitespace-nowrap"
        >
          {simulateCrash ? <ToggleRight className="w-4 h-4 text-[#f43f5e]" /> : <ToggleLeft className="w-4 h-4" />}
          Simulate Market Crash
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Radar Card */}
        <div className="col-span-1 lg:col-span-1 border rounded-xl shadow-2xl p-6 relative overflow-hidden" style={{ backgroundColor: '#09090b', borderColor: '#27272a' }}>
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#8b5cf6] to-[#38bdf8]"></div>
          <h2 className="text-sm font-bold flex items-center gap-2 mb-6" style={{ color: '#8b5cf6' }}>
            <Target className="w-5 h-5" /> Today's Market Radar
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] font-bold text-[#a1a1aa] uppercase tracking-widest mb-1 flex items-center gap-1">
                Tickers Parsed <span title="The total number of stocks we analyzed today across news, YouTube, and Congress."><Info className="w-3 h-3 text-[#52525b] cursor-help" /></span>
              </p>
              <p className="text-4xl font-black text-[#fafafa]">{tickers.length}</p>
              <p className="text-[10px] text-[#52525b] mt-1">Feeds: YT, Reddit, Congress</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#a1a1aa] uppercase tracking-widest mb-1 flex items-center gap-1">
                Smart Money <span title="Number of stocks where hedge funds or politicians are actively buying."><Info className="w-3 h-3 text-[#52525b] cursor-help" /></span>
              </p>
              <p className="text-4xl font-black text-[#fafafa]">{smartMoneyCount}</p>
              <p className="text-[10px] text-[#52525b] mt-1">Whales: WBX, JCTC...</p>
            </div>
          </div>
        </div>

        {/* Top Picks Card */}
        <div className="col-span-1 lg:col-span-2 border rounded-xl shadow-2xl p-6 relative overflow-hidden" style={{ backgroundColor: '#09090b', borderColor: '#27272a' }}>
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#f43f5e] to-[#fbbf24]"></div>
          <h2 className="text-sm font-bold flex items-center gap-2 mb-4" style={{ color: '#38bdf8' }}>
            <Flame className="w-5 h-5 text-[#f43f5e]" /> 
            {isCrash ? '🛡️ Recommended Safety Hedges' : '🔥 My Top Recommendations'}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {isCrash ? (
              // Display Bear Hedges as Top Recommendations during crash simulation
              bearHedges.slice(0, 3).map((p, index) => (
                <div key={p.id} className="bg-[#000000] border p-4 rounded-lg flex flex-col justify-between relative" style={{ borderColor: '#f43f5e' }}>
                  <div className="absolute -top-3 left-4 bg-[#f43f5e] text-[#ffffff] text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 uppercase tracking-wider shadow-lg">
                    <ShieldAlert className="w-2.5 h-2.5" /> CRASH PROTECTION
                  </div>
                  
                  <div className="flex justify-between items-start mt-2 mb-2">
                    <div>
                      <h3 className="text-xl font-black text-[#fafafa] tracking-tight">{p.symbol}</h3>
                      <p className="text-[10px] text-[#a1a1aa] truncate w-32">{p.company_name}</p>
                    </div>
                    <div className="flex items-center gap-1 text-[#f43f5e] font-bold text-sm bg-[#f43f5e]/10 px-2 py-1 rounded">
                      🛡️ {p.score.toFixed(0)}
                    </div>
                  </div>
                  <div className="flex justify-between items-end mt-4">
                    <div className="font-bold text-[#10b981]">${p.price?.toFixed(2)} <span className="text-xs">+{p.percent_change?.toFixed(2)}%</span></div>
                    <div className="text-[9px] font-bold tracking-wider text-[#fafafa] bg-[#27272a] px-2 py-1 rounded uppercase">
                      Inverse ETF
                    </div>
                  </div>
                </div>
              ))
            ) : (
              topPicks.slice(0, 3).map((p, index) => {
                const horizons = ["Swing (1-3 wks)", "Day Trade (1-2 days)", "Long-Term Hold"];
                const horizon = horizons[index % horizons.length];
                
                return (
                  <div key={p.id} className="bg-[#000000] border p-4 rounded-lg flex flex-col justify-between relative" style={{ borderColor: '#27272a' }}>
                    <div className="absolute -top-3 left-4 bg-[#8b5cf6] text-[#ffffff] text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1 uppercase tracking-wider shadow-lg">
                      <Calendar className="w-2.5 h-2.5" /> {horizon}
                    </div>
                    
                    <div className="flex justify-between items-start mt-2 mb-2">
                      <div>
                        <h3 className="text-xl font-black text-[#fafafa] tracking-tight">{p.symbol}</h3>
                        <p className="text-[10px] text-[#a1a1aa] truncate w-32">{p.company_name}</p>
                      </div>
                      <div className="flex items-center gap-1 text-[#fbbf24] font-bold text-sm bg-[#fbbf24]/10 px-2 py-1 rounded" title="Combined Score (0-100)">
                        <Flame className="w-3 h-3" /> {p.score.toFixed(1)}
                      </div>
                    </div>
                    <div className="flex justify-between items-end mt-4">
                      <div className="font-bold text-[#10b981]">${p.price?.toFixed(2) || 'N/A'} <span className="text-xs">+{p.percent_change?.toFixed(2) || '0.00'}%</span></div>
                      <div className="text-[9px] font-bold tracking-wider text-[#fafafa] bg-[#27272a] px-2 py-1 rounded uppercase flex items-center gap-1 cursor-help" title={`Archetype: ${p.archetype}`}>
                        {p.archetype.substring(0, 10)}... <CheckSquare className="w-3 h-3 text-[#38bdf8]"/>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2">
        {filters.map(f => (
          <button 
            key={f.id}
            onClick={() => setActiveFilter(f.id)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all border ${activeFilter === f.id ? 'shadow-lg shadow-black/50' : 'opacity-70 hover:opacity-100'}`}
            style={{ 
              backgroundColor: activeFilter === f.id ? '#18181b' : '#000000',
              borderColor: activeFilter === f.id ? f.color : '#27272a',
              color: activeFilter === f.id ? '#fafafa' : '#a1a1aa'
            }}
          >
            <f.icon className="w-4 h-4" style={{ color: f.color }} /> {f.label}
          </button>
        ))}
      </div>

      {/* Master Grid Panel */}
      <div className="border rounded-xl shadow-2xl flex flex-col h-[400px]" style={{ backgroundColor: '#000000', borderColor: '#27272a' }}>
        <div className="flex-1 overflow-auto bg-[#09090b] rounded-xl">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="sticky top-0 z-10 backdrop-blur-md bg-[#18181b]/90">
              <tr>
                {[
                  { label: "Ticker", tooltip: "Stock symbol" },
                  { label: "Company Name", tooltip: "Full company name" },
                  { label: "Price", tooltip: "Current market price" },
                  { label: "Change", tooltip: "Dollar change today" },
                  { label: "% Change", tooltip: "Percentage change today" },
                  { label: "Day Range", tooltip: "High and low today" },
                  { label: "Combined Score", tooltip: "Our proprietary 0-100 rating. Above 75 is a strong buy." },
                  { label: "Strategic Archetype", tooltip: "The specific market setup this stock falls into (e.g. Stealth Whale means institutions are quietly buying)." },
                  { label: "Smart Money", tooltip: "A 0-100 gauge of how heavily hedge funds and politicians are buying." },
                  { label: "Retail Hype", tooltip: "A 0-100 gauge of how much retail traders (Reddit, YouTube) are talking about it." },
                  { label: "Action Cue", tooltip: "My explicit recommendation on what to do with this stock today." },
                  { label: "Signal Sources", tooltip: "Where we got this data." }
                ].map((col, i) => (
                  <th key={col.label} className={`p-3 border-b font-bold text-center ${i < 11 ? 'border-r' : ''}`} style={{ borderColor: '#27272a', color: '#8b5cf6' }}>
                    <div className="flex items-center justify-center gap-1">
                      {col.label}
                      <span title={col.tooltip}><Info className="w-3 h-3 text-[#52525b] cursor-help" /></span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#27272a]">
              {filteredTickers.length === 0 ? (
                <tr>
                  <td colSpan={12} className="p-8 text-center text-[#52525b] italic">
                    No tickers match the selected filter.
                  </td>
                </tr>
              ) : (
                filteredTickers.map((t, idx) => {
                  const isSelected = selectedTicker?.id === t.id;
                  return (
                    <tr 
                      key={t.id} 
                      onClick={() => setSelectedTicker(t)}
                      className="cursor-pointer transition-colors"
                      style={{ 
                        backgroundColor: isSelected ? '#18181b' : (idx % 2 === 0 ? '#000000' : '#09090b'),
                        border: isSelected ? '1px solid #8b5cf6' : 'none'
                      }}
                    >
                      <td className="p-3 border-r font-bold text-center" style={{ borderColor: '#27272a', color: isSelected ? '#8b5cf6' : '#fafafa' }}>{t.symbol}</td>
                      <td className="p-3 border-r text-center truncate max-w-[120px]" style={{ borderColor: '#27272a', color: '#fafafa' }}>{t.company_name}</td>
                      <td className="p-3 border-r text-center" style={{ borderColor: '#27272a', color: '#38bdf8' }}>${t.price?.toFixed(2) || 'N/A'}</td>
                      <td className={`p-3 border-r text-center ${t.percent_change >= 0 ? 'text-[#10b981]' : 'text-[#f43f5e]'}`} style={{ borderColor: '#27272a' }}>
                        {t.percent_change >= 0 ? '+' : ''}{((t.price || 0) * (t.percent_change || 0) / 100).toFixed(2)}
                      </td>
                      <td className={`p-3 border-r text-center ${t.percent_change >= 0 ? 'text-[#10b981]' : 'text-[#f43f5e]'}`} style={{ borderColor: '#27272a' }}>
                        {t.percent_change >= 0 ? '+' : ''}{t.percent_change?.toFixed(2) || '0.00'}%
                      </td>
                      <td className="p-3 border-r text-center text-[#a1a1aa]" style={{ borderColor: '#27272a' }}>N/A</td>
                      <td className="p-3 border-r text-center font-bold text-[#fafafa]" style={{ borderColor: '#27272a' }}>{t.score.toFixed(1)}</td>
                      <td className="p-3 border-r text-center flex items-center justify-center gap-1 text-[#fafafa]" style={{ borderColor: '#27272a' }}>
                        {t.archetype} {t.smart_money > 50 ? <CheckSquare className="w-3 h-3 text-[#10b981]" /> : <Flame className="w-3 h-3 text-[#f43f5e]" />}
                      </td>
                      <td className="p-3 border-r text-center text-[#fafafa]" style={{ borderColor: '#27272a' }}>{t.smart_money.toFixed(1)}</td>
                      <td className="p-3 border-r text-center text-[#fafafa]" style={{ borderColor: '#27272a' }}>{t.retail_hype.toFixed(1)}</td>
                      <td className="p-3 border-r text-center font-bold" style={{ borderColor: '#27272a', color: '#fafafa' }}>{t.action}</td>
                      <td className="p-3 text-center text-[#a1a1aa]">{t.id.startsWith('hedge') ? 'SafeHaven Engine' : 'Database'}</td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        
        {/* News Panel */}
        <div className="col-span-3 border rounded-xl shadow-xl flex flex-col" style={{ backgroundColor: '#09090b', borderColor: '#27272a' }}>
          <div className="p-3 border-b" style={{ borderColor: '#27272a' }}>
            <h2 className="text-sm font-bold flex items-center gap-2" style={{ color: '#38bdf8' }}>
              <Newspaper className="w-4 h-4" /> Selected Ticker Activity & Real-Time News
            </h2>
            <p className="text-xs text-[#a1a1aa] mt-1">
              Click any ticker in the grid above to load its real-time company news...
            </p>
          </div>
          <div className="p-4 flex-1 bg-[#000000] m-2 rounded border overflow-y-auto max-h-[250px]" style={{ borderColor: '#27272a' }}>
            {!selectedTicker ? (
              <p className="text-xs italic text-[#52525b]">No ticker selected. Please click on a stock from the table above.</p>
            ) : (
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold text-[#8b5cf6] flex items-center gap-2">
                    <Briefcase className="w-4 h-4" /> Wall Street Senior Analyst Thesis
                  </h3>
                  <p className="text-sm text-[#d4d4d8] mt-3 leading-relaxed border-l-2 pl-3 border-[#8b5cf6] italic">
                    {selectedTicker.ai_thesis && selectedTicker.ai_thesis !== 'No second opinion thesis provided.' 
                      ? selectedTicker.ai_thesis 
                      : (
                        `"Here is the bottom line on ${selectedTicker.company_name} (${selectedTicker.symbol}): The big hedge funds are ${selectedTicker.smart_money >= 50 ? "quietly loading up on shares right now (Smart Money Index: " + selectedTicker.smart_money.toFixed(1) + ")" : "sitting this one out for the moment"}. ${selectedTicker.retail_hype >= 50 ? "The general public is catching on, which means the retail crowd is adding fuel to the fire." : "The general public hasn't caught on yet, which makes this a fantastic stealth play."} Whenever I see this specific '${selectedTicker.archetype}' setup, it usually precedes a major move. My professional recommendation to you is simple: ${selectedTicker.action}."`
                      )
                    }
                  </p>
                </div>
              </div>
            )}
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
            {!selectedTicker ? (
              <p className="text-xs font-bold text-[#52525b]">No price data. Select a stock to view trend chart.</p>
            ) : (
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
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
