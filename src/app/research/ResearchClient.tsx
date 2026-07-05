"use client";

import { useState } from 'react';
import { Search, Landmark, Zap } from 'lucide-react';

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
}

export default function ResearchClient({ initialTickers }: { initialTickers: Ticker[] }) {
  const [tickers] = useState<Ticker[]>(initialTickers);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTicker, setSelectedTicker] = useState<Ticker | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [report, setReport] = useState<string | null>(null);

  // Mock function to simulate a deep scan
  const executeScan = () => {
    if (!searchQuery) return;
    setIsScanning(true);
    setReport(null);
    
    // Simulate network delay
    setTimeout(() => {
      setIsScanning(false);
      setReport(`WALL STREET STRATEGIC OUTLOOK REPORT FOR ${searchQuery.toUpperCase()}\n\nExecution Date: ${new Date().toISOString().split('T')[0]}\nAnalyst: Alpha Pulse Deep Research Engine\n\nExecutive Summary:\nThe requested asset shows significant anomalous trading volume in dark pools. Institutional accumulation is evident across multiple secondary data sources. However, short interest has increased by 4% over the last 72 hours indicating a potential battleground stock.\n\nKey Drivers:\n1. Sustained Cash Flow generation limits downside risk.\n2. Upcoming catalyst in Q3 may trigger a volatility expansion.\n\nRecommendation:\nStrong Buy (DCA) - Initiate a 1/3 position at current levels, with limit orders 5% below VWAP to capture volatility spikes.`);
    }, 2000);
  };

  return (
    <div className="flex flex-col gap-6">
      
      {/* Top Table */}
      <div className="border rounded-xl shadow-2xl flex flex-col h-[350px]" style={{ backgroundColor: '#0c0f17', borderColor: '#1f2937' }}>
        <div className="p-3 border-b" style={{ borderColor: '#1e293b' }}>
          <h2 className="text-sm font-bold flex items-center gap-2" style={{ color: '#dfb86c' }}>
            <Landmark className="w-4 h-4" /> High Cash Flow Social Sentiment Leaders
          </h2>
        </div>
        <div className="flex-1 overflow-auto bg-[#0b0f19] rounded-b-xl">
          <table className="w-full text-left text-xs whitespace-nowrap">
            <thead className="sticky top-0 z-10">
              <tr>
                {["#", "Ticker", "Company Name", "Combined Score", "Social Mentions", "Cash Flow Assessment", "Wall Street Recommendation"].map((header, i) => (
                  <th key={header} className={`p-3 border-b font-bold text-center ${i < 6 ? 'border-r' : ''}`} style={{ backgroundColor: '#151d30', borderColor: '#1e293b', color: '#38bdf8' }}>
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1e293b]">
              {tickers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-10 text-center text-[#64748b] italic">No tickers found.</td>
                </tr>
              ) : (
                tickers.slice(0, 10).map((t, idx) => (
                  <tr key={t.id} style={{ backgroundColor: idx % 2 === 0 ? '#0c0f17' : '#111827' }} className="hover:bg-[#1f2937] transition-colors cursor-pointer" onClick={() => setSearchQuery(t.symbol)}>
                    <td className="p-3 border-r text-center text-[#94a3b8]" style={{ borderColor: '#1e293b' }}>{idx + 1}</td>
                    <td className="p-3 border-r text-center font-bold text-[#f8fafc]" style={{ borderColor: '#1e293b' }}>{t.symbol}</td>
                    <td className="p-3 border-r text-[#94a3b8] truncate max-w-[150px]" style={{ borderColor: '#1e293b' }}>{t.company_name}</td>
                    <td className="p-3 border-r text-center font-bold text-[#f8fafc]" style={{ borderColor: '#1e293b' }}>{t.score.toFixed(1)}</td>
                    <td className="p-3 border-r text-center text-[#94a3b8]" style={{ borderColor: '#1e293b' }}>{Math.floor(t.retail_hype)} mentions</td>
                    <td className="p-3 border-r text-center text-[#f8fafc] flex items-center justify-center gap-2" style={{ borderColor: '#1e293b' }}>
                      Whale Cash Inflow <div className="w-2 h-2 rounded-full bg-[#10b981]" />
                    </td>
                    <td className="p-3 text-center font-bold text-[#94a3b8]">{t.action || 'Strong Buy (DCA)'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Bottom Split View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[300px]">
        
        {/* Left Panel: Request Custom Scan */}
        <div className="col-span-1 border rounded-xl shadow-xl flex flex-col" style={{ backgroundColor: '#0c0f17', borderColor: '#1f2937' }}>
          <div className="p-3 border-b" style={{ borderColor: '#1e293b' }}>
            <h2 className="text-sm font-bold flex items-center gap-2" style={{ color: '#38bdf8' }}>
              <Search className="w-4 h-4" /> Request Custom Deep Scan
            </h2>
          </div>
          <div className="p-6 flex-1 flex flex-col justify-center gap-6">
            <div className="flex flex-col gap-2">
              <label className="text-xs font-bold text-[#94a3b8]">Search Ticker:</label>
              <input 
                type="text" 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="E.G. AAPL, NVDA, PLTR" 
                className="bg-[#070a0f] border border-[#1e293b] rounded-md p-3 text-white focus:outline-none focus:border-[#38bdf8]"
              />
            </div>
            <button 
              onClick={executeScan}
              disabled={isScanning || !searchQuery}
              className="flex items-center justify-center gap-2 w-full py-3 rounded-md font-bold text-[#0c0f17] bg-[#dfb86c] hover:bg-[#c9a35b] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Zap className="w-4 h-4" /> 
              {isScanning ? 'SCANNING...' : 'Execute Wall Street Research'}
            </button>
          </div>
        </div>

        {/* Right Panel: Hedge Fund Report */}
        <div className="col-span-2 border rounded-xl shadow-xl flex flex-col" style={{ backgroundColor: '#0c0f17', borderColor: '#1f2937' }}>
          <div className="p-3 border-b" style={{ borderColor: '#1e293b' }}>
            <h2 className="text-sm font-bold flex items-center gap-2" style={{ color: '#dfb86c' }}>
              <Landmark className="w-4 h-4" /> Hedge Fund Managing Director Analysis Timing Report
            </h2>
          </div>
          <div className="p-4 flex-1 bg-[#0b0f19] m-2 rounded border overflow-y-auto" style={{ borderColor: '#1e293b' }}>
            {!report ? (
              <p className="text-xs italic text-[#64748b]">Enter a ticker and execute research to view the Wall Street strategic outlook report.</p>
            ) : (
              <pre className="text-sm text-[#f1f5f9] whitespace-pre-wrap font-sans leading-relaxed">
                {report}
              </pre>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}
