"use client";

import { useState } from 'react';
import { MessageSquareWarning, ExternalLink } from 'lucide-react';

interface RedditItem {
  subreddit?: string;
  title?: string;
  ups?: number;
  tickers?: string[];
  published_at?: string;
}

interface DiscordItem {
  channel?: string;
  author?: string;
  content?: string;
  tickers?: string[];
  timestamp?: string;
}

export default function RetailClient({ redditItems, discordItems }: { redditItems: RedditItem[], discordItems: DiscordItem[] }) {
  const [activeTab, setActiveTab] = useState('reddit');

  return (
    <div className="border rounded-xl shadow-2xl flex flex-col h-[calc(100vh-140px)]" style={{ backgroundColor: '#000000', borderColor: '#27272a' }}>
      <div className="flex space-x-1 border-b" style={{ borderColor: '#27272a' }}>
        <button 
          onClick={() => setActiveTab('reddit')}
          className={`px-5 py-3 font-bold text-sm rounded-t-lg transition-colors border-t border-l border-r ${activeTab === 'reddit' ? 'border-b-4' : 'border-b-0'}`}
          style={{
            backgroundColor: activeTab === 'reddit' ? '#09090b' : '#000000',
            color: activeTab === 'reddit' ? '#ff4500' : '#a1a1aa',
            borderColor: activeTab === 'reddit' ? '#ff4500 #27272a #ff4500 #27272a' : '#27272a',
            borderBottomColor: activeTab === 'reddit' ? '#ff4500' : 'transparent',
          }}
        >
          r/WallStreetBets & Investing
        </button>
        <button 
          onClick={() => setActiveTab('discord')}
          className={`px-5 py-3 font-bold text-sm rounded-t-lg transition-colors border-t border-l border-r ${activeTab === 'discord' ? 'border-b-4' : 'border-b-0'}`}
          style={{
            backgroundColor: activeTab === 'discord' ? '#09090b' : '#000000',
            color: activeTab === 'discord' ? '#5865F2' : '#a1a1aa',
            borderColor: activeTab === 'discord' ? '#5865F2 #27272a #5865F2 #27272a' : '#27272a',
            borderBottomColor: activeTab === 'discord' ? '#5865F2' : 'transparent',
          }}
        >
          Alpha Trading Discords
        </button>
      </div>
      <div className="flex-1 overflow-auto bg-[#09090b] rounded-b-xl">
        <table className="w-full text-left text-xs whitespace-nowrap">
          <thead className="sticky top-0 z-10">
            <tr>
              {activeTab === 'reddit' ? (
                <>
                  <th className="p-3 border-b border-r font-bold text-center" style={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#a1a1aa' }}>#</th>
                  <th className="p-3 border-b border-r font-bold text-center" style={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#ff4500' }}>Subreddit</th>
                  <th className="p-3 border-b border-r font-bold text-center" style={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#8b5cf6' }}>Tickers Mentioned</th>
                  <th className="p-3 border-b border-r font-bold" style={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#fafafa' }}>Post Title</th>
                  <th className="p-3 border-b font-bold text-center" style={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#a1a1aa' }}>Upvotes</th>
                </>
              ) : (
                <>
                  <th className="p-3 border-b border-r font-bold text-center" style={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#a1a1aa' }}>#</th>
                  <th className="p-3 border-b border-r font-bold text-center" style={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#5865F2' }}>Channel</th>
                  <th className="p-3 border-b border-r font-bold text-center" style={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#8b5cf6' }}>Tickers Mentioned</th>
                  <th className="p-3 border-b border-r font-bold" style={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#fafafa' }}>Message Content</th>
                  <th className="p-3 border-b font-bold text-center" style={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#a1a1aa' }}>Author</th>
                </>
              )}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#27272a]">
            {activeTab === 'reddit' && redditItems.length === 0 && (
              <tr>
                <td colSpan={5} className="p-10 text-center">
                  <div className="flex flex-col items-center justify-center text-[#52525b]">
                    <MessageSquareWarning className="w-12 h-12 mb-4 opacity-50" />
                    <p className="text-sm italic">No Reddit sentiment data gathered in the current scan.</p>
                  </div>
                </td>
              </tr>
            )}
            
            {activeTab === 'discord' && discordItems.length === 0 && (
              <tr>
                <td colSpan={5} className="p-10 text-center">
                  <div className="flex flex-col items-center justify-center text-[#52525b]">
                    <MessageSquareWarning className="w-12 h-12 mb-4 opacity-50" />
                    <p className="text-sm italic">No Discord sentiment data gathered in the current scan.</p>
                  </div>
                </td>
              </tr>
            )}

            {activeTab === 'reddit' && redditItems.map((item, idx) => (
              <tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? '#000000' : '#09090b' }} className="hover:bg-[#18181b] transition-colors border-b border-[#27272a]">
                <td className="p-3 border-r text-center text-[#a1a1aa]" style={{ borderColor: '#27272a' }}>{idx + 1}</td>
                <td className="p-3 border-r text-center font-bold text-[#fafafa]" style={{ borderColor: '#27272a' }}>r/{item.subreddit || 'unknown'}</td>
                <td className="p-3 border-r text-center font-bold text-[#10b981]" style={{ borderColor: '#27272a' }}>
                  {item.tickers && item.tickers.length > 0 ? item.tickers.join(', ') : 'None'}
                </td>
                <td className="p-3 border-r text-[#fafafa] max-w-[400px] truncate" style={{ borderColor: '#27272a' }} title={item.title}>
                  {item.title || 'N/A'}
                </td>
                <td className="p-3 text-center text-[#8b5cf6] font-bold">+{item.ups || 0}</td>
              </tr>
            ))}

            {activeTab === 'discord' && discordItems.map((item, idx) => (
              <tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? '#000000' : '#09090b' }} className="hover:bg-[#18181b] transition-colors border-b border-[#27272a]">
                <td className="p-3 border-r text-center text-[#a1a1aa]" style={{ borderColor: '#27272a' }}>{idx + 1}</td>
                <td className="p-3 border-r text-center font-bold text-[#fafafa]" style={{ borderColor: '#27272a' }}>#{item.channel || 'general'}</td>
                <td className="p-3 border-r text-center font-bold text-[#10b981]" style={{ borderColor: '#27272a' }}>
                  {item.tickers && item.tickers.length > 0 ? item.tickers.join(', ') : 'None'}
                </td>
                <td className="p-3 border-r text-[#fafafa] max-w-[400px] truncate" style={{ borderColor: '#27272a' }} title={item.content}>
                  {item.content || 'N/A'}
                </td>
                <td className="p-3 text-center text-[#a1a1aa] font-bold">@{item.author || 'unknown'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
