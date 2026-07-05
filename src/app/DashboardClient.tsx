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

  // Mock 7d trend data for the chart
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
      
      {/* Top Panels: Radar & Top Picks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        
        {/* Radar Panel */}
        <div className="col-span-1 border rounded-xl p-5 shadow-xl" style={{ backgroundColor: '#0c0f17', borderColor: '#1f2937' }}>
          <h2 className="text-sm font-bold flex items-center gap-2 mb-6" style={{ color: '#dfb86c' }}>
            <Target className="w-4 h-4" /> Today's Market Radar
          </h2>
          <div className="flex justify-between">
            <div>
              <p className="text-[10px] uppercase font-bold tracking-widest text-[#64748b] mb-1">Tickers Parsed</p>
              <p className="text-3xl font-bold text-white">{tickers.length}</p>
              <p className="text-[10px] text-[#64748b] mt-1">Feeds: YT, Reddit, Congress</p>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold tracking-widest text-[#64748b] mb-1">Smart Money Positioning</p>
              <p className="text-3xl font-bold text-white">{smartMoneyCount} <span className="text-sm text-[#94a3b8]">Positionings</span></p>
              <p className="text-[10px] text-[#64748b] mt-1 truncate max-w-[120px]">
                Whales: {tickers.filter(t => t.smart_money > 50).slice(0, 4).map(t => t.symbol).join(', ')}...
              </p>
            </div>
          </div>
        </div>

        {/* Top Picks Scroll Panel */}
        <div className="col-span-2 border rounded-xl p-5 shadow-xl flex flex-col" style={{ backgroundColor: '#0c0f17', borderColor: '#1f2937' }}>
          <h2 className="text-sm font-bold flex items-center gap-2 mb-4" style={{ color: '#38bdf8' }}>
            <Flame className="w-4 h-4 text-[#f43f5e]" /> Today's Top Picks (Score &gt;= 75)
          </h2>
          {topPicks.length === 0 ? (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-xs italic text-[#64748b]">No high conviction picks yet. Run scan...</p>
            </div>
          ) : (
            <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-[#374151] scrollbar-track-transparent">
              {topPicks.map(pick => (
                <div key={pick.id} className="min-w-[260px] border rounded-lg p-4 bg-[#070a0f] flex flex-col justify-between" style={{ borderColor: '#1f2937' }}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg text-white">{pick.symbol}</h3>
                      <p className="text-xs text-[#94a3b8] truncate max-w-[140px]">{pick.company_name}</p>
                    </div>
                    <div className="flex items-center gap-1 text-[#dfb86c] font-bold text-sm">
                       ★ {pick.score.toFixed(1)}
                    </div>
                  </div>
                  <div className="flex justify-between items-end mt-4">
                    <p className={`font-bold ${pick.percent_change >= 0 ? 'text-[#10b981]' : 'text-[#f43f5e]'}`}>
                      ${pick.price?.toFixed(2) || 'N/A'} {pick.percent_change >= 0 ? '+' : ''}{pick.percent_change?.toFixed(2) || '0.00'}%
                    </p>
                    <span className="text-[10px] font-bold px-2 py-1 rounded bg-[#dfb86c]/20 text-[#dfb86c] uppercase tracking-wider">
                      {pick.archetype || 'WHALES'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Filter Buttons */}
      <div className="flex flex-wrap gap-2">
        {filters.map(f => {
          const Icon = f.icon;
          const isActive = activeFilter === f.id;
          return (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-bold transition-all border ${
                isActive 
                  ? 'bg-[#111827] border-[#dfb86c] text-white shadow-[0_0_10px_rgba(223,184,108,0.2)]' 
                  : 'bg-[#0c0f17] border-[#1f2937] text-[#94a3b8] hover:bg-[#111827] hover:text-white'
              }`}
            >
              <Icon className="w-3 h-3" style={{ color: f.color }} />
              {f.label}
            </button>
          );
        })}
      </div>

      {/* Master Grid */}
      <div className="border rounded-xl shadow-2xl overflow-hidden" style={{ borderColor: '#1f2937', backgroundColor: '#0b0f19' }}>
        <div className="overflow-x-auto h-[400px]">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="sticky top-0 z-10">
              <tr>
                {["Ticker", "Company Name", "Price", "Change", "% Change", "Day Range", "Combined Score", "Strategic Archetype", "Smart Money", "Retail Hype", "Action Cue", "Signal Sources"].map(header => (
                  <th key={header} className="p-3 border-b border-r font-bold text-center" style={{ backgroundColor: '#111827', borderColor: '#0c0f17', color: '#dfb86c' }}>
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f2937]">
              {tickers.map((t, idx) => {
                const isSelected = selectedTicker?.id === t.id;
                return (
                  <tr 
                    key={t.id} 
                    onClick={() => setSelectedTicker(t)}
                    className="cursor-pointer transition-colors"
                    style={{ 
                      backgroundColor: isSelected ? '#1b2e22' : (idx % 2 === 0 ? '#0c0f17' : '#111827'),
                      border: isSelected ? '1px solid #22c55e' : 'none'
                    }}
                  >
                    <td className="p-3 border-r font-bold text-center" style={{ borderColor: '#1f2937', color: isSelected ? '#22c55e' : '#f8fafc' }}>{t.symbol}</td>
                    <td className="p-3 border-r text-center truncate max-w-[120px]" style={{ borderColor: '#1f2937', color: '#f8fafc' }}>{t.company_name}</td>
                    <td className="p-3 border-r text-center" style={{ borderColor: '#1f2937', color: '#38bdf8' }}>${t.price?.toFixed(2) || 'N/A'}</td>
                    <td className={`p-3 border-r text-center ${t.percent_change >= 0 ? 'text-[#10b981]' : 'text-[#f43f5e]'}`} style={{ borderColor: '#1f2937' }}>
                      {t.percent_change >= 0 ? '+' : ''}{((t.price || 0) * (t.percent_change || 0) / 100).toFixed(2)}
                    </td>
                    <td className={`p-3 border-r text-center ${t.percent_change >= 0 ? 'text-[#10b981]' : 'text-[#f43f5e]'}`} style={{ borderColor: '#1f2937' }}>
                      {t.percent_change >= 0 ? '+' : ''}{t.percent_change?.toFixed(2) || '0.00'}%
                    </td>
                    <td className="p-3 border-r text-center text-[#94a3b8]" style={{ borderColor: '#1f2937' }}>N/A</td>
                    <td className="p-3 border-r text-center font-bold text-[#f8fafc]" style={{ borderColor: '#1f2937' }}>{t.score.toFixed(1)}</td>
                    <td className="p-3 border-r text-center flex items-center justify-center gap-1 text-[#f8fafc]" style={{ borderColor: '#1f2937' }}>
                      {t.archetype} {t.smart_money > 50 ? <CheckSquare className="w-3 h-3 text-[#10b981]" /> : <Flame className="w-3 h-3 text-[#f43f5e]" />}
                    </td>
                    <td className="p-3 border-r text-center text-[#f8fafc]" style={{ borderColor: '#1f2937' }}>{t.smart_money.toFixed(1)}</td>
                    <td className="p-3 border-r text-center text-[#f8fafc]" style={{ borderColor: '#1f2937' }}>{t.retail_hype.toFixed(1)}</td>
                    <td className="p-3 border-r text-center font-bold" style={{ borderColor: '#1f2937', color: '#f8fafc' }}>{t.action}</td>
                    <td className="p-3 text-center text-[#94a3b8]">Database</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-4">
        
        {/* News Panel */}
        <div className="col-span-3 border rounded-xl shadow-xl flex flex-col" style={{ backgroundColor: '#151d30', borderColor: '#1e293b' }}>
          <div className="p-3 border-b" style={{ borderColor: '#1e293b' }}>
            <h2 className="text-sm font-bold flex items-center gap-2" style={{ color: '#38bdf8' }}>
              <Newspaper className="w-4 h-4" /> Selected Ticker Activity & Real-Time News
            </h2>
            <p className="text-xs text-[#94a3b8] mt-1">
              Click any ticker in the grid above to load its real-time company news...
            </p>
          </div>
          <div className="p-4 flex-1 bg-[#0b0f19] m-2 rounded border overflow-y-auto max-h-[250px]" style={{ borderColor: '#1e293b' }}>
            {!selectedTicker ? (
              <p className="text-xs italic text-[#64748b]">No ticker selected.</p>
            ) : (
              <div className="space-y-4">
                <div>
                  <h3 className="font-bold text-[#dfb86c]">AI Investment Thesis</h3>
                  <p className="text-sm text-[#f1f5f9] mt-2 leading-relaxed">{selectedTicker.ai_thesis || 'No thesis generated for this ticker.'}</p>
                </div>
                {/* We would render actual real-time news here if we had the array in DB */}
              </div>
            )}
          </div>
        </div>

        {/* 7d Trend Chart Panel */}
        <div className="col-span-2 border rounded-xl shadow-xl flex flex-col" style={{ backgroundColor: '#0c0f17', borderColor: '#1f2937' }}>
          <div className="p-3 border-b" style={{ borderColor: '#1f2937' }}>
            <h2 className="text-sm font-bold flex items-center gap-2" style={{ color: '#dfb86c' }}>
              <LineChartIcon className="w-4 h-4" /> Selected Ticker Performance (7d Trend)
            </h2>
          </div>
          <div className="p-4 flex-1 flex items-center justify-center">
            {!selectedTicker ? (
              <p className="text-xs font-bold text-[#64748b]">No price data. Select a stock to view trend chart.</p>
            ) : (
              <div className="w-full h-[200px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={mockTrendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1f2937" vertical={false} />
                    <XAxis dataKey="day" stroke="#64748b" tick={{ fontSize: 10 }} />
                    <YAxis stroke="#64748b" tick={{ fontSize: 10 }} domain={['auto', 'auto']} />
                    <RechartsTooltip 
                      contentStyle={{ backgroundColor: '#151d30', borderColor: '#1e293b', color: '#f1f5f9', fontSize: '12px' }}
                      itemStyle={{ color: '#10b981' }}
                    />
                    <Line type="monotone" dataKey="price" stroke="#10b981" strokeWidth={3} dot={{ r: 4, fill: '#0c0f17', stroke: '#10b981', strokeWidth: 2 }} />
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
