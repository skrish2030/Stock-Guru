"use client";

import { useState } from 'react';
import { TrendingUp, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface Ticker {
  id: string;
  symbol: string;
  company_name: string;
  price: number;
  percent_change: number;
  score: number;
  retail_hype: number;
}

export default function TrendingClient({ initialTickers }: { initialTickers: Ticker[] }) {
  const [tickers] = useState<Ticker[]>(initialTickers);
  const [activeTab, setActiveTab] = useState<'bullish' | 'bearish' | 'actives'>('bullish');

  // Bullish: gainers sorted descending
  const bullish = [...tickers]
    .filter(t => t.percent_change > 0)
    .sort((a, b) => b.percent_change - a.percent_change);

  // Bearish: losers sorted ascending
  const bearish = [...tickers]
    .filter(t => t.percent_change < 0)
    .sort((a, b) => a.percent_change - b.percent_change);

  // Actives: highest retail hype / social activity volume
  const actives = [...tickers]
    .sort((a, b) => b.retail_hype - a.retail_hype);

  const renderStockRow = (t: Ticker, idx: number, colorHex: string, isUp: boolean) => {
    return (
      <div 
        key={t.id} 
        className="flex justify-between items-center p-4 rounded-lg bg-[#000000] border hover:bg-[#18181b] transition-colors"
        style={{ borderColor: '#27272a' }}
      >
        <div className="flex items-center gap-3">
          {/* Logo Badge (Matches Pro Ticker logo circle) */}
          <div 
            className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-xs"
            style={{ 
              backgroundColor: colorHex + '15', 
              color: colorHex, 
              border: `1.5px solid ${colorHex}30` 
            }}
          >
            {t.symbol.substring(0, 2)}
          </div>
          <div>
            <h4 className="text-sm font-black text-[#fafafa] tracking-wide">{t.company_name}</h4>
            <p className="text-[10px] text-[#a1a1aa] font-bold uppercase">{t.symbol}</p>
          </div>
        </div>

        <div className="text-right">
          <p className="text-sm font-black text-[#fafafa]">${t.price?.toFixed(2) || 'N/A'}</p>
          <span 
            className="text-xs font-bold flex items-center justify-end gap-0.5"
            style={{ color: colorHex }}
          >
            {isUp ? <ArrowUpRight className="w-3.5 h-3.5" /> : <ArrowDownRight className="w-3.5 h-3.5" />}
            {isUp ? '+' : ''}{t.percent_change?.toFixed(2) || '0.00'}%
          </span>
        </div>
      </div>
    );
  };

  return (
    <div className="border rounded-xl shadow-2xl p-6 flex flex-col h-[calc(100vh-140px)]" style={{ backgroundColor: '#09090b', borderColor: '#27272a' }}>
      
      {/* Selector Tabs (Matches Image 2 exactly) */}
      <div className="grid grid-cols-3 gap-2 p-1 bg-[#000000] border rounded-lg mb-6" style={{ borderColor: '#27272a' }}>
        <button 
          onClick={() => setActiveTab('bullish')}
          className={`py-3 text-xs font-black uppercase rounded-md transition-all ${activeTab === 'bullish' ? 'bg-[#8b5cf6] text-[#ffffff] shadow-lg' : 'text-[#a1a1aa] hover:text-[#fafafa]'}`}
        >
          Bullish
        </button>
        <button 
          onClick={() => setActiveTab('bearish')}
          className={`py-3 text-xs font-black uppercase rounded-md transition-all ${activeTab === 'bearish' ? 'bg-[#8b5cf6] text-[#ffffff] shadow-lg' : 'text-[#a1a1aa] hover:text-[#fafafa]'}`}
        >
          Bearish
        </button>
        <button 
          onClick={() => setActiveTab('actives')}
          className={`py-3 text-xs font-black uppercase rounded-md transition-all ${activeTab === 'actives' ? 'bg-[#8b5cf6] text-[#ffffff] shadow-lg' : 'text-[#a1a1aa] hover:text-[#fafafa]'}`}
        >
          Actives
        </button>
      </div>

      {/* Stock list container */}
      <div className="flex-1 overflow-y-auto pr-1 space-y-2 scrollbar-thin scrollbar-thumb-[#27272a]">
        {activeTab === 'bullish' && (
          bullish.length === 0 ? (
            <p className="text-xs italic text-[#52525b] text-center pt-10">No positive gainers today.</p>
          ) : (
            bullish.map((t, idx) => renderStockRow(t, idx, '#10b981', true))
          )
        )}

        {activeTab === 'bearish' && (
          bearish.length === 0 ? (
            <p className="text-xs italic text-[#52525b] text-center pt-10">No declining assets today.</p>
          ) : (
            bearish.map((t, idx) => renderStockRow(t, idx, '#f43f5e', false))
          )
        )}

        {activeTab === 'actives' && (
          actives.length === 0 ? (
            <p className="text-xs italic text-[#52525b] text-center pt-10">No active assets loaded.</p>
          ) : (
            actives.map((t, idx) => {
              const isUp = t.percent_change >= 0;
              return renderStockRow(t, idx, isUp ? '#10b981' : '#f43f5e', isUp);
            })
          )
        )}
      </div>

    </div>
  );
}
