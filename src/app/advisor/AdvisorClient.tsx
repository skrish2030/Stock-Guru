"use client";

import { useState } from 'react';
import { Target, TrendingUp, CheckSquare, BrainCircuit, Activity, DollarSign, Wallet, Briefcase, GraduationCap } from 'lucide-react';

interface AdvisorProps {
  initialTickers: any[];
}

export default function AdvisorClient({ initialTickers }: AdvisorProps) {
  const [style, setStyle] = useState('Long-Term Growth');
  const [risk, setRisk] = useState('Low (Conservative)');
  const [sector, setSector] = useState('All Sectors');
  const [budget, setBudget] = useState('10000');
  const [allocation, setAllocation] = useState<any[]>([]);
  const [hasGenerated, setHasGenerated] = useState(false);

  // Generate mock allocation based on the top 4 tickers (since the screenshot shows JCTC, WBX, CREX, PSNY)
  const generateAllocation = () => {
    // Dummy top 4 to match the screenshot
    const top4 = [
      { asset: 'JCTC', percentage: 40, strategy: 'Stealth Whale', fit: 'High Conviction Fit', fitColor: '#10b981' },
      { asset: 'WBX', percentage: 30, strategy: 'Stealth Whale', fit: 'Optimal Alignment', fitColor: '#10b981' },
      { asset: 'CREX', percentage: 20, strategy: 'Stealth Whale', fit: 'Moderate Support', fitColor: '#eab308' },
      { asset: 'PSNY', percentage: 10, strategy: 'Stealth Whale', fit: 'Speculative Additive', fitColor: '#eab308' }
    ];
    setAllocation(top4);
    setHasGenerated(true);
  };

  const getDollarAmount = (percentage: number) => {
    const total = parseFloat(budget) || 0;
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format((percentage / 100) * total);
  };

  return (
    <div className="flex flex-col lg:flex-row gap-6">
      {/* Left Panel: Profile */}
      <div className="lg:w-1/3 border rounded-xl shadow-2xl p-6 h-fit" style={{ backgroundColor: '#09090b', borderColor: '#27272a' }}>
        <h2 className="text-lg font-bold text-[#fafafa] flex items-center gap-2 mb-6">
          <GraduationCap className="text-[#8b5cf6]" /> Let's Build Your Plan
        </h2>
        
        <p className="text-xs text-[#a1a1aa] mb-6 leading-relaxed">
          Tell me a little about your financial goals and risk tolerance. I'll personally cross-reference it with today's institutional data flows to tailor a safe, actionable portfolio for you.
        </p>

        <div className="space-y-4">
          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-[#a1a1aa]">Your Investment Style:</label>
            <select 
              value={style}
              onChange={(e) => setStyle(e.target.value)}
              className="w-full p-2 rounded-md bg-[#000000] border border-[#27272a] text-[#fafafa] text-sm focus:outline-none focus:border-[#8b5cf6]"
            >
              <option>Long-Term Growth</option>
              <option>Value Investing (Safe & Steady)</option>
              <option>Dividend Yield (Passive Income)</option>
              <option>Aggressive Trading (High Momentum)</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-[#a1a1aa]">Your Risk Tolerance:</label>
            <select 
              value={risk}
              onChange={(e) => setRisk(e.target.value)}
              className="w-full p-2 rounded-md bg-[#000000] border border-[#27272a] text-[#fafafa] text-sm focus:outline-none focus:border-[#8b5cf6]"
            >
              <option>Low (I want to protect my money)</option>
              <option>Medium (I'm okay with slight bumps)</option>
              <option>High (I want max upside, regardless of drops)</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-[#a1a1aa]">Sector Preference:</label>
            <select 
              value={sector}
              onChange={(e) => setSector(e.target.value)}
              className="w-full p-2 rounded-md bg-[#000000] border border-[#27272a] text-[#fafafa] text-sm focus:outline-none focus:border-[#8b5cf6]"
            >
              <option>All Sectors (Diversified)</option>
              <option>Technology & AI</option>
              <option>Healthcare & Biotech</option>
              <option>Finance & Banks</option>
              <option>Crypto & Web3</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-xs font-semibold text-[#a1a1aa]">How much are you looking to invest? ($)</label>
            <input 
              type="number" 
              value={budget}
              onChange={(e) => setBudget(e.target.value)}
              className="w-full p-2 rounded-md bg-[#000000] border border-[#27272a] text-[#fafafa] text-sm focus:outline-none focus:border-[#8b5cf6]"
            />
          </div>

          <button 
            onClick={generateAllocation}
            className="w-full mt-6 py-3 rounded-md font-bold text-sm bg-gradient-to-r from-[#8b5cf6] to-[#6d28d9] text-white hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-lg"
          >
            <Briefcase className="w-4 h-4" /> Ask the Mentor for a Strategy
          </button>
        </div>
      </div>

      {/* Right Panel: Output */}
      <div className="lg:w-2/3 flex flex-col gap-6">
        
        {/* Optimized Target Allocation Table */}
        <div className="border rounded-xl shadow-2xl p-6" style={{ backgroundColor: '#09090b', borderColor: '#27272a' }}>
          <h2 className="text-lg font-bold text-[#fafafa] flex items-center gap-2 mb-6">
            <Wallet className="text-[#8b5cf6]" /> My Recommended Target Allocation
          </h2>

          <div className="overflow-x-auto rounded-lg border border-[#27272a]">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead>
                <tr>
                  {["#", "Asset", "Weight", "Capital Required", "Market Setup", "Safety Fit"].map((h, i) => (
                    <th key={h} className={`p-3 bg-[#18181b] border-b border-[#27272a] text-center font-bold text-[#a1a1aa] ${i < 5 ? 'border-r' : ''}`}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-[#27272a]">
                {!hasGenerated ? (
                  <tr>
                    <td colSpan={6} className="p-8 text-center text-[#52525b] italic">
                      Please tell me your goals on the left, and I will write up your custom allocation here.
                    </td>
                  </tr>
                ) : (
                  allocation.map((item, idx) => (
                    <tr key={idx} className="bg-[#000000] hover:bg-[#18181b] transition-colors">
                      <td className="p-3 border-r border-[#27272a] text-center text-[#a1a1aa]">{idx + 1}</td>
                      <td className="p-3 border-r border-[#27272a] text-center font-bold text-[#fafafa]">{item.asset}</td>
                      <td className="p-3 border-r border-[#27272a] text-center font-bold text-[#fafafa]">{item.percentage}%</td>
                      <td className="p-3 border-r border-[#27272a] text-center text-[#10b981]">{getDollarAmount(item.percentage)}</td>
                      <td className="p-3 border-r border-[#27272a] text-center flex items-center justify-center gap-2">
                        {item.strategy} <CheckSquare className="w-3 h-3 text-[#a1a1aa]" />
                      </td>
                      <td className="p-3 text-center flex justify-center items-center gap-2">
                        {item.fit} <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.fitColor }}></div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Allocation Progress Bar */}
          {hasGenerated && (
            <div className="mt-6 flex h-6 rounded-md overflow-hidden text-[10px] font-bold text-[#000000] border border-[#27272a]">
              <div style={{ width: '40%', backgroundColor: '#a855f7' }} className="flex items-center justify-center">JCTC (40%)</div>
              <div style={{ width: '30%', backgroundColor: '#38bdf8' }} className="flex items-center justify-center">WBX (30%)</div>
              <div style={{ width: '20%', backgroundColor: '#10b981' }} className="flex items-center justify-center">CREX (20%)</div>
              <div style={{ width: '10%', backgroundColor: '#eab308' }} className="flex items-center justify-center">PSNY (10%)</div>
            </div>
          )}
        </div>

        {/* Multi-Agent Consensus */}
        <div className="border rounded-xl shadow-2xl p-6" style={{ backgroundColor: '#09090b', borderColor: '#27272a' }}>
          <h2 className="text-lg font-bold text-[#fafafa] flex items-center gap-2 mb-4 uppercase">
            <GraduationCap className="text-[#8b5cf6]" /> Senior Scholar Portfolio Thesis
          </h2>
          <h3 className="text-sm font-bold text-[#a1a1aa] uppercase mb-4">
            🏛️ My Personal Recommendation For You
          </h3>
          
          <div className="text-sm text-[#d4d4d8] leading-relaxed">
            <p className="mb-4 border-l-2 pl-3 border-[#8b5cf6] italic">
              "Based on my 40 years of experience navigating the markets, I've designed this specific allocation for your <span className="font-bold text-[#fafafa]">{style}</span> goals. Since you requested a <span className="font-bold text-[#fafafa]">{risk}</span> approach focusing on <span className="font-bold text-[#fafafa]">{sector}</span>, I have specifically chosen assets where I am currently seeing strong institutional support to ensure downside protection while maximizing your upside potential."
            </p>
            
            {hasGenerated && (
              <div className="grid grid-cols-4 gap-2 text-xs font-semibold uppercase text-[#a1a1aa] mb-2 px-2 mt-6">
                <div>Asset</div>
                <div>Weight</div>
                <div>Capital Setup</div>
                <div>Safety Fit</div>
              </div>
            )}
            
            {hasGenerated && allocation.map((item, idx) => (
              <div key={idx} className="grid grid-cols-4 gap-2 text-sm px-2 py-1 items-center">
                <div className="font-bold text-[#38bdf8]">{item.asset}</div>
                <div className="text-[#fafafa]">{item.percentage}%</div>
                <div className="text-[#10b981]">{getDollarAmount(item.percentage)}</div>
                <div className="flex items-center gap-2" style={{ color: item.fitColor }}>
                  {item.fit} <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.fitColor }} />
                </div>
              </div>
            ))}
          </div>
        </div>

      </div>
    </div>
  );
}
