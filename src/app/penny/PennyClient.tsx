"use client";

import { useState } from 'react';

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
  
  // Penny stocks (price < $10)
  const pennyStocks = tickers.filter(t => t.price && t.price < 10);
  
  // High volatility alerts (|percent_change| >= 15%)
  const volatilityStocks = tickers.filter(t => t.percent_change && Math.abs(t.percent_change) >= 15);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      
      {/* Hot Penny Stocks Grid */}
      <div className="border rounded-xl shadow-xl flex flex-col h-[600px]" style={{ backgroundColor: '#0c0f17', borderColor: '#1f2937' }}>
        <div className="p-4 border-b" style={{ borderColor: '#1f2937' }}>
          <h2 className="text-sm font-bold flex items-center gap-2" style={{ color: '#10b981' }}>
            🪙 Hot Penny Stocks (Price {'<'} $10)
          </h2>
        </div>
        <div className="p-4 flex-1 overflow-y-auto scrollbar-thin scrollbar-thumb-[#374151]">
          <div className="grid grid-cols-2 gap-4">
            {pennyStocks.length === 0 ? (
              <p className="col-span-2 text-xs italic text-[#64748b]">No trending penny stocks yet. Run scan...</p>
            ) : (
              pennyStocks.map(pick => (
                <div key={pick.id} className="border rounded-lg p-4 bg-[#070a0f] flex flex-col justify-between" style={{ borderColor: '#1f2937' }}>
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg text-white">{pick.symbol}</h3>
                      <p className="text-xs text-[#94a3b8] truncate max-w-[120px]">{pick.company_name}</p>
                    </div>
                    <div className="flex items-center gap-1 text-[#dfb86c] font-bold text-sm">
                       ★ {pick.score.toFixed(1)}
                    </div>
                  </div>
                  <div className="flex justify-between items-end mt-4">
                    <p className={`font-bold ${pick.percent_change >= 0 ? 'text-[#10b981]' : 'text-[#f43f5e]'}`}>
                      ${pick.price?.toFixed(2)} {pick.percent_change >= 0 ? '+' : ''}{pick.percent_change?.toFixed(2)}%
                    </p>
                    <span className="text-[10px] font-bold px-2 py-1 rounded bg-[#dfb86c]/20 text-[#dfb86c] tracking-wider border border-[#dfb86c]/30">
                      PENNY
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* High Volatility Table */}
      <div className="border rounded-xl shadow-xl flex flex-col h-[600px]" style={{ backgroundColor: '#0c0f17', borderColor: '#1f2937' }}>
        <div className="p-4 border-b" style={{ borderColor: '#1f2937' }}>
          <h2 className="text-sm font-bold flex items-center gap-2" style={{ color: '#f43f5e' }}>
            ⚡ High Volatility Alerts (|Change| {'>='} 15%)
          </h2>
        </div>
        <div className="flex-1 overflow-auto bg-[#0b0f19]">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="sticky top-0 z-10">
              <tr>
                {["Ticker", "Company Name", "Price", "Change", "% Change", "Combined Score", "Action Cue"].map(header => (
                  <th key={header} className="p-3 border-b border-r font-bold text-center" style={{ backgroundColor: '#111827', borderColor: '#0c0f17', color: '#38bdf8' }}>
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1f2937]">
              {volatilityStocks.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-4 text-center text-xs italic text-[#64748b]">No highly volatile stocks found in this scan.</td>
                </tr>
              ) : (
                volatilityStocks.map((t, idx) => (
                  <tr key={t.id} style={{ backgroundColor: idx % 2 === 0 ? '#0c0f17' : '#111827' }} className="hover:bg-[#1b2e22] transition-colors cursor-pointer">
                    <td className="p-3 border-r font-bold text-center text-[#f8fafc]" style={{ borderColor: '#1f2937' }}>{t.symbol}</td>
                    <td className="p-3 border-r text-center truncate max-w-[120px] text-[#f8fafc]" style={{ borderColor: '#1f2937' }}>{t.company_name}</td>
                    <td className="p-3 border-r text-center text-[#38bdf8]" style={{ borderColor: '#1f2937' }}>${t.price?.toFixed(2)}</td>
                    <td className={`p-3 border-r text-center ${t.percent_change >= 0 ? 'text-[#10b981]' : 'text-[#f43f5e]'}`} style={{ borderColor: '#1f2937' }}>
                      {t.percent_change >= 0 ? '+' : ''}{((t.price || 0) * (t.percent_change || 0) / 100).toFixed(2)}
                    </td>
                    <td className={`p-3 border-r text-center font-bold ${t.percent_change >= 0 ? 'text-[#10b981]' : 'text-[#f43f5e]'}`} style={{ borderColor: '#1f2937' }}>
                      {t.percent_change >= 0 ? '+' : ''}{t.percent_change?.toFixed(2)}%
                    </td>
                    <td className="p-3 border-r text-center font-bold text-[#f8fafc]" style={{ borderColor: '#1f2937' }}>{t.score.toFixed(1)}</td>
                    <td className="p-3 text-center font-bold text-[#f8fafc]">{t.action}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
