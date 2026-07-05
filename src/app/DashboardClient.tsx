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
import { Target, Activity, Flame, Coins, LineChart as LineChartIcon, Rocket, BrainCircuit, Diamond, Landmark, DollarSign, CheckSquare, Newspaper } from 'lucide-react';

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

  const smartMoneyCount = tickers.filter(t => t.smart_money > 50).length;
  const topPicks = tickers.filter(t => t.score >= 75).sort((a, b) => b.score - a.score);

  const filteredTickers = tickers.filter(t => {
    switch (activeFilter) {
      case 'high': return t.score >= 75;
      case 'penny': return t.price < 10 && t.price > 0;
      case 'regular': return t.price >= 10;
      case 'ipo': return t.archetype?.toLowerCase().includes('ipo');
      case 'ai': return t.archetype?.toLowerCase().includes('ai');
      case 'crypto': return t.archetype?.toLowerCase().includes('crypto');
      case 'congress': return t.smart_money >= 50; 
      case 'cashflow': return t.score >= 80;
      case 'all':
      default: return true;
    }
  });

  const mockTrendData = Array.from({ length: 7 }).map((_, i) => ({
    day: `Day ${i + 1}`,
    price: selectedTicker ? selectedTicker.price * (1 + (Math.random() * 0.1 - 0.05)) : 0
  }));

  const filters = [
    { id: 'all', label: 'All Ingested Assets', icon: Activity, color: '#38bdf8' },
    { id: 'high', label: 'High Conviction (Score ≥ 75)', icon: Flame, color: '#f43f5e' },
    { id: 'penny', label: 'Penny Stocks (<$10)', icon: Coins, color: '#fbbf24' },
    { id: 'regular', label: 'Regular Stocks (≥$10)', icon: LineChartIcon, color: '#94a3b8' },
    { id: 'ipo', label: 'Recent IPOs', icon: Rocket, color: '#f472b6' },
    { id: 'ai', label: 'AI Sector Only', icon: BrainCircuit, color: '#a855f7' },
    { id: 'crypto', label: 'Crypto Web3', icon: Diamond, color: '#38bdf8' },
    { id: 'congress', label: 'Congress Picks', icon: Landmark, color: '#94a3b8' },
    { id: 'cashflow', label: 'High Cash Flow', icon: DollarSign, color: '#fbbf24' },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Radar Card */}
        <div className="col-span-1 lg:col-span-1 border rounded-xl shadow-2xl p-6 relative overflow-hidden" style={{ backgroundColor: '#09090b', borderColor: '#27272a' }}>
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#8b5cf6] to-[#38bdf8]"></div>
          <h2 className="text-sm font-bold flex items-center gap-2 mb-6" style={{ color: '#8b5cf6' }}>
            <Target className="w-5 h-5" /> Today's Market Radar
          </h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <p className="text-[10px] font-bold text-[#a1a1aa] uppercase tracking-widest mb-1">Tickers Parsed</p>
              <p className="text-4xl font-black text-[#fafafa]">{tickers.length}</p>
              <p className="text-[10px] text-[#52525b] mt-1">Feeds: YT, Reddit, Congress</p>
            </div>
            <div>
              <p className="text-[10px] font-bold text-[#a1a1aa] uppercase tracking-widest mb-1">Smart Money Positioning</p>
              <p className="text-4xl font-black text-[#fafafa]">{smartMoneyCount}</p>
              <p className="text-[10px] text-[#52525b] mt-1">Whales: WBX, JCTC...</p>
            </div>
          </div>
        </div>

        {/* Top Picks Card */}
        <div className="col-span-1 lg:col-span-2 border rounded-xl shadow-2xl p-6 relative overflow-hidden" style={{ backgroundColor: '#09090b', borderColor: '#27272a' }}>
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-[#f43f5e] to-[#fbbf24]"></div>
          <h2 className="text-sm font-bold flex items-center gap-2 mb-4" style={{ color: '#38bdf8' }}>
            <Flame className="w-5 h-5 text-[#f43f5e]" /> Today's Top Picks (Score {'>'}= 75)
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {topPicks.length === 0 ? (
              <p className="text-sm italic text-[#52525b] col-span-3 text-center mt-4">No high conviction picks yet. Run scan...</p>
            ) : (
              topPicks.slice(0, 3).map(p => (
                <div key={p.id} className="bg-[#000000] border p-4 rounded-lg flex flex-col justify-between" style={{ borderColor: '#27272a' }}>
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <h3 className="text-xl font-black text-[#fafafa] tracking-tight">{p.symbol}</h3>
                      <p className="text-[10px] text-[#a1a1aa] truncate w-32">{p.company_name}</p>
                    </div>
                    <div className="flex items-center gap-1 text-[#fbbf24] font-bold text-sm bg-[#fbbf24]/10 px-2 py-1 rounded">
                      <Flame className="w-3 h-3" /> {p.score.toFixed(1)}
                    </div>
                  </div>
                  <div className="flex justify-between items-end mt-4">
                    <div className="font-bold text-[#10b981]">${p.price?.toFixed(2) || 'N/A'} <span className="text-xs">+{p.percent_change?.toFixed(2) || '0.00'}%</span></div>
                    <div className="text-[9px] font-bold tracking-wider text-[#fafafa] bg-[#27272a] px-2 py-1 rounded uppercase flex items-center gap-1">
                      {p.archetype} <CheckSquare className="w-3 h-3 text-[#38bdf8]"/>
                    </div>
                  </div>
                </div>
              ))
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
                {["Ticker", "Company Name", "Price", "Change", "% Change", "Day Range", "Combined Score", "Strategic Archetype", "Smart Money", "Retail Hype", "Action Cue", "Signal Sources"].map((header, i) => (
                  <th key={header} className={`p-3 border-b font-bold text-center ${i < 11 ? 'border-r' : ''}`} style={{ borderColor: '#27272a', color: '#8b5cf6' }}>
                    {header}
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
                      <td className="p-3 text-center text-[#a1a1aa]">Database</td>
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
              <p className="text-xs italic text-[#52525b]">No ticker selected.</p>
            ) : (
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold text-[#8b5cf6]">Wall Street Senior Analyst Thesis</h3>
                  <p className="text-sm text-[#d4d4d8] mt-2 leading-relaxed">
                    {selectedTicker.ai_thesis && selectedTicker.ai_thesis !== 'No second opinion thesis provided.' 
                      ? selectedTicker.ai_thesis 
                      : (
                        `Based on our multi-factor terminal analysis, ${selectedTicker.company_name} (${selectedTicker.symbol}) ${selectedTicker.score >= 75 ? 'exhibits high-conviction breakout potential' : (selectedTicker.score >= 50 ? 'shows moderate accumulation signals' : 'remains in a neutral holding pattern')}. The current structural setup aligns with a '${selectedTicker.archetype}' profile. ${selectedTicker.smart_money >= 50 ? 'Strong institutional and corporate insider buying activity (Smart Money Index: ' + selectedTicker.smart_money.toFixed(1) + ') indicates deep-pocketed confidence.' : 'Institutional positioning remains relatively quiet.'} ${selectedTicker.retail_hype >= 50 ? 'Retail momentum is currently surging across social channels, adding speculative fuel.' : 'Retail hype is relatively muted, suggesting this remains a stealth play.'} Our tactical recommendation is to: ${selectedTicker.action}.`
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
