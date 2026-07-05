"use client";

import { useState } from 'react';
import { 
    BarChart, 
    Bar, 
    XAxis, 
    YAxis, 
    CartesianGrid, 
    Tooltip, 
    ResponsiveContainer,
    Cell
} from 'recharts';
import { TrendingUp, Flame, Activity, BrainCircuit, Anchor } from 'lucide-react';

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

export default function DashboardClient({ initialTickers }: { initialTickers: Ticker[] }) {
  const [tickers] = useState<Ticker[]>(initialTickers);

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-8">
      <header className="flex justify-between items-center pb-6 border-b border-white/10">
        <div>
          <h1 className="text-4xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400 flex items-center gap-3">
            <Activity className="w-10 h-10 text-indigo-400" />
            Alpha Tracker
          </h1>
          <p className="text-gray-400 mt-2 text-lg">Real-time Smart Money vs Retail Hype</p>
        </div>
      </header>

      {tickers.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-gray-500">
          <BrainCircuit className="w-12 h-12 mb-4 animate-pulse" />
          <p>No market data found. Ensure the Python engine has pushed to Supabase.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-[#111111] p-6 rounded-2xl border border-white/5 shadow-2xl">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Flame className="text-rose-500" /> Top Retail Hype
              </h2>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={tickers.sort((a, b) => b.retail_hype - a.retail_hype).slice(0, 5)} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" horizontal={false} />
                    <XAxis type="number" stroke="#666" />
                    <YAxis dataKey="symbol" type="category" stroke="#fff" fontWeight="bold" width={60} />
                    <Tooltip cursor={{ fill: '#ffffff10' }} contentStyle={{ backgroundColor: '#000', borderColor: '#333' }} />
                    <Bar dataKey="retail_hype" radius={[0, 4, 4, 0]}>
                      {tickers.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill="#f43f5e" />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="bg-[#111111] p-6 rounded-2xl border border-white/5 shadow-2xl">
              <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Anchor className="text-emerald-500" /> Top Smart Money (Institutions)
              </h2>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={tickers.sort((a, b) => b.smart_money - a.smart_money).slice(0, 5)} layout="vertical" margin={{ left: 20 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#333" horizontal={false} />
                    <XAxis type="number" stroke="#666" />
                    <YAxis dataKey="symbol" type="category" stroke="#fff" fontWeight="bold" width={60} />
                    <Tooltip cursor={{ fill: '#ffffff10' }} contentStyle={{ backgroundColor: '#000', borderColor: '#333' }} />
                    <Bar dataKey="smart_money" radius={[0, 4, 4, 0]}>
                      {tickers.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill="#10b981" />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="bg-[#111111] p-6 rounded-2xl border border-white/5 shadow-2xl">
            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
              <TrendingUp className="text-indigo-400" /> Alpha Pulse Screener
            </h2>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                <thead className="bg-[#1a1a1a] text-gray-400">
                  <tr>
                    <th className="p-4 rounded-tl-lg">Ticker</th>
                    <th className="p-4">Score</th>
                    <th className="p-4">Archetype</th>
                    <th className="p-4">Action</th>
                    <th className="p-4">Retail Hype</th>
                    <th className="p-4 rounded-tr-lg">Smart Money</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-white/5">
                  {tickers.sort((a, b) => b.score - a.score).map((t) => (
                    <tr key={t.id} className="hover:bg-white/5 transition-colors">
                      <td className="p-4 font-bold text-lg">{t.symbol}</td>
                      <td className="p-4">
                        <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                          t.score >= 70 ? 'bg-emerald-500/20 text-emerald-400' :
                          t.score >= 50 ? 'bg-yellow-500/20 text-yellow-400' :
                          'bg-rose-500/20 text-rose-400'
                        }`}>
                          {t.score}
                        </span>
                      </td>
                      <td className="p-4">{t.archetype}</td>
                      <td className="p-4 font-semibold">{t.action}</td>
                      <td className="p-4">
                        <div className="w-full bg-gray-800 rounded-full h-2 max-w-[100px]">
                          <div className="bg-rose-500 h-2 rounded-full" style={{ width: `${Math.min(t.retail_hype * 5, 100)}%` }}></div>
                        </div>
                      </td>
                      <td className="p-4">
                        <div className="w-full bg-gray-800 rounded-full h-2 max-w-[100px]">
                          <div className="bg-emerald-500 h-2 rounded-full" style={{ width: `${Math.min(t.smart_money * 5, 100)}%` }}></div>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
