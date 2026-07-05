"use client";

import { useState } from 'react';
import { MessageSquareWarning } from 'lucide-react';

interface RetailItem {
  ticker?: string;
  mentions?: number;
  sentiment?: string;
  source?: string;
}

export default function RetailClient({ redditItems, discordItems }: { redditItems: RetailItem[], discordItems: RetailItem[] }) {
  const [activeTab, setActiveTab] = useState('reddit');
  const data = activeTab === 'reddit' ? redditItems : discordItems;

  return (
    <div className="border rounded-xl shadow-2xl flex flex-col h-[calc(100vh-140px)]" style={{ backgroundColor: '#0c0f17', borderColor: '#1f2937' }}>
      <div className="flex space-x-1 border-b" style={{ borderColor: '#1f2937' }}>
        <button 
          onClick={() => setActiveTab('reddit')}
          className={`px-5 py-3 font-bold text-sm rounded-t-lg transition-colors border-t border-l border-r ${activeTab === 'reddit' ? 'border-b-4' : 'border-b-0'}`}
          style={{
            backgroundColor: activeTab === 'reddit' ? '#0b0f19' : '#070a0f',
            color: activeTab === 'reddit' ? '#ff4500' : '#9ca3af',
            borderColor: activeTab === 'reddit' ? '#ff4500 #1f2937 #ff4500 #1f2937' : '#1f2937',
            borderBottomColor: activeTab === 'reddit' ? '#ff4500' : 'transparent',
          }}
        >
          r/WallStreetBets & Investing
        </button>
        <button 
          onClick={() => setActiveTab('discord')}
          className={`px-5 py-3 font-bold text-sm rounded-t-lg transition-colors border-t border-l border-r ${activeTab === 'discord' ? 'border-b-4' : 'border-b-0'}`}
          style={{
            backgroundColor: activeTab === 'discord' ? '#0b0f19' : '#070a0f',
            color: activeTab === 'discord' ? '#5865F2' : '#9ca3af',
            borderColor: activeTab === 'discord' ? '#5865F2 #1f2937 #5865F2 #1f2937' : '#1f2937',
            borderBottomColor: activeTab === 'discord' ? '#5865F2' : 'transparent',
          }}
        >
          Alpha Trading Discords
        </button>
      </div>
      <div className="flex-1 overflow-auto bg-[#0b0f19] rounded-b-xl">
        <table className="w-full text-left text-xs whitespace-nowrap">
          <thead className="sticky top-0 z-10">
            <tr>
              {["#", "Ticker Symbol", "Mention Volume", "Sentiment Assessment", "Scraped Source"].map((header, i) => (
                <th key={header} className={`p-3 border-b font-bold text-center ${i < 4 ? 'border-r' : ''}`} style={{ backgroundColor: '#151d30', borderColor: '#1e293b', color: '#38bdf8' }}>
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1e293b]">
            {data.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-10 text-center">
                  <div className="flex flex-col items-center justify-center text-[#64748b]">
                    <MessageSquareWarning className="w-12 h-12 mb-4 opacity-50" />
                    <p className="text-sm italic">No retail sentiment data for this source in the current scan.</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((item, idx) => (
                <tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? '#0c0f17' : '#111827' }} className="hover:bg-[#1f2937] transition-colors">
                  <td className="p-3 border-r text-center text-[#94a3b8]" style={{ borderColor: '#1e293b' }}>{idx + 1}</td>
                  <td className="p-3 border-r text-center font-bold text-[#f8fafc]" style={{ borderColor: '#1e293b' }}>{item.ticker || 'N/A'}</td>
                  <td className="p-3 border-r text-center font-bold text-[#dfb86c]" style={{ borderColor: '#1e293b' }}>{item.mentions || 0} mentions</td>
                  <td className="p-3 border-r text-center text-[#f8fafc]" style={{ borderColor: '#1e293b' }}>{item.sentiment || 'Neutral'}</td>
                  <td className="p-3 text-center text-[#94a3b8]">{item.source || (activeTab === 'reddit' ? 'Reddit' : 'Discord')}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
