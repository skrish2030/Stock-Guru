"use client";

import { useState } from 'react';
import { Landmark, ArrowUpRight, ArrowDownRight, Compass, ShieldAlert, BadgeInfo } from 'lucide-react';

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
}

export default function PennyClient({ initialTickers }: { initialTickers: Ticker[] }) {
  const [tickers] = useState<Ticker[]>(initialTickers);
  const [activeTab, setActiveTab] = useState<'bullish' | 'bearish'>('bullish');

  // Bullish vs Bearish filters based on daily change
  const bullishStocks = [...tickers]
    .filter(t => t.percent_change > 0)
    .sort((a, b) => b.percent_change - a.percent_change);

  const bearishStocks = [...tickers]
    .filter(t => t.percent_change < 0)
    .sort((a, b) => a.percent_change - b.percent_change);

  // Formatting date/time helper
  const now = new Date();
  const formattedTime = now.toLocaleDateString('en-US', {
    month: '2-digit',
    day: '2-digit',
    year: '2-digit'
  }) + `, ${now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}`;

  return (
    <div className="p-6 space-y-6">
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* LEFT PANEL: Market Scanner Cards Grid (Matches Image 3) */}
        <div className="border rounded-xl shadow-2xl p-6 flex flex-col h-[700px]" style={{ backgroundColor: '#09090b', borderColor: '#27272a' }}>
          <div className="border-b pb-4 mb-6" style={{ borderColor: '#27272a' }}>
            <h2 className="text-lg font-bold text-[#fafafa] flex items-center gap-2 tracking-wider uppercase">
              <Compass className="text-[#8b5cf6]" /> Market Scanner
            </h2>
            <p className="text-xs text-[#a1a1aa] mt-1">
              Top moving volatility assets categorized by recent market scans.
            </p>
          </div>

          {/* Market Status Cards */}
          <div className="grid grid-cols-2 gap-4 mb-6">
            <div className="p-4 rounded-lg bg-[#000000] border" style={{ borderColor: '#27272a' }}>
              <span className="text-[10px] font-bold text-[#a1a1aa] uppercase tracking-wider">Market Status</span>
              <p className="text-lg font-black text-[#fafafa] mt-1">Market Closed</p>
            </div>
            <div className="p-4 rounded-lg bg-[#000000] border" style={{ borderColor: '#27272a' }}>
              <span className="text-[10px] font-bold text-[#a1a1aa] uppercase tracking-wider">Last Updated</span>
              <p className="text-sm font-black text-[#fafafa] mt-1.5">{formattedTime}</p>
            </div>
          </div>

          {/* Grid list of Volatility stocks */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-3 scrollbar-thin scrollbar-thumb-[#27272a]">
            <div className="grid grid-cols-2 gap-4">
              {tickers.slice(0, 10).map((t) => {
                const isUp = t.percent_change >= 0;
                // Generate a colored circle icon with first letter
                const colorHex = isUp ? '#10b981' : '#f43f5e';
                
                return (
                  <div key={t.id} className="bg-[#000000] border p-4 rounded-lg flex flex-col justify-between" style={{ borderColor: '#27272a' }}>
                    <div className="flex justify-between items-start">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs" style={{ backgroundColor: colorHex + '20', color: colorHex, border: `1px solid ${colorHex}30` }}>
                          {t.symbol.substring(0, 2)}
                        </div>
                        <div>
                          <h3 className="font-bold text-sm text-[#fafafa]">{t.symbol}</h3>
                          <p className="text-[9px] text-[#a1a1aa] truncate max-w-[80px]">{t.company_name}</p>
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
        </div>

        {/* RIGHT PANEL: Trending Stocks List Selector (Matches Image 2) */}
        <div className="border rounded-xl shadow-2xl p-6 flex flex-col h-[700px]" style={{ backgroundColor: '#09090b', borderColor: '#27272a' }}>
          <div className="border-b pb-4 mb-6" style={{ borderColor: '#27272a' }}>
            <h2 className="text-lg font-bold text-[#fafafa] flex items-center gap-2 tracking-wider uppercase">
              <Compass className="text-[#8b5cf6]" /> Trending Stocks
            </h2>
          </div>

          {/* Toggle buttons styled exactly like Image 2 */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-[#000000] border rounded-lg mb-6" style={{ borderColor: '#27272a' }}>
            <button 
              onClick={() => setActiveTab('bullish')}
              className={`py-2 text-xs font-bold uppercase rounded transition-all ${activeTab === 'bullish' ? 'bg-[#8b5cf6] text-[#ffffff] shadow-lg' : 'text-[#a1a1aa] hover:text-[#fafafa]'}`}
            >
              Bullish (Gainers)
            </button>
            <button 
              onClick={() => setActiveTab('bearish')}
              className={`py-2 text-xs font-bold uppercase rounded transition-all ${activeTab === 'bearish' ? 'bg-[#8b5cf6] text-[#ffffff] shadow-lg' : 'text-[#a1a1aa] hover:text-[#fafafa]'}`}
            >
              Bearish (Losers)
            </button>
          </div>

          {/* Vertical list of gainers/losers */}
          <div className="flex-1 overflow-y-auto pr-1 space-y-2 scrollbar-thin scrollbar-thumb-[#27272a]">
            {activeTab === 'bullish' ? (
              bullishStocks.length === 0 ? (
                <p className="text-xs italic text-[#52525b] text-center pt-10">No positive gainers in this scan.</p>
              ) : (
                bullishStocks.map((t, idx) => (
                  <div key={t.id} className="flex justify-between items-center p-3 rounded-lg bg-[#000000] hover:bg-[#18181b] border border-[#27272a]/40 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs bg-[#10b981]/10 text-[#10b981] border border-[#10b981]/20">
                        {t.symbol.substring(0, 2)}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-[#fafafa]">{t.company_name}</h4>
                        <p className="text-[10px] text-[#a1a1aa] font-semibold uppercase">{t.symbol}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-[#fafafa]">${t.price?.toFixed(2)}</p>
                      <p className="text-xs font-bold text-[#10b981] flex items-center justify-end gap-0.5">
                        +{t.percent_change.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                ))
              )
            ) : (
              bearishStocks.length === 0 ? (
                <p className="text-xs italic text-[#52525b] text-center pt-10">No declining assets in this scan.</p>
              ) : (
                bearishStocks.map((t, idx) => (
                  <div key={t.id} className="flex justify-between items-center p-3 rounded-lg bg-[#000000] hover:bg-[#18181b] border border-[#27272a]/40 transition-colors">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs bg-[#f43f5e]/10 text-[#f43f5e] border border-[#f43f5e]/20">
                        {t.symbol.substring(0, 2)}
                      </div>
                      <div>
                        <h4 className="text-sm font-bold text-[#fafafa]">{t.company_name}</h4>
                        <p className="text-[10px] text-[#a1a1aa] font-semibold uppercase">{t.symbol}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-black text-[#fafafa]">${t.price?.toFixed(2)}</p>
                      <p className="text-xs font-bold text-[#f43f5e] flex items-center justify-end gap-0.5">
                        {t.percent_change.toFixed(2)}%
                      </p>
                    </div>
                  </div>
                ))
              )
            )}
          </div>
        </div>

      </div>

    </div>
  );
}
