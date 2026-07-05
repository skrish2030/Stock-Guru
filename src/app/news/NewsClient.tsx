"use client";

import { useState } from 'react';
import { Newspaper } from 'lucide-react';

interface NewsItem {
  datetime?: number;
  published_time?: string;
  source?: string;
  headline?: string;
  summary?: string;
  url?: string;
  link?: string;
}

export default function NewsClient({ initialNews }: { initialNews: NewsItem[] }) {
  const [news] = useState<NewsItem[]>(initialNews);

  return (
    <div className="border rounded-xl shadow-2xl flex flex-col h-[calc(100vh-140px)]" style={{ backgroundColor: '#000000', borderColor: '#27272a' }}>
      <div className="flex-1 overflow-auto bg-[#09090b] rounded-xl">
        <table className="w-full text-left text-xs whitespace-nowrap">
          <thead className="sticky top-0 z-10">
            <tr>
              {["#", "Published Time", "Source", "Headline", "Summary / Abstract"].map((header, i) => (
                <th key={header} className={`p-3 border-b font-bold text-center ${i < 4 ? 'border-r' : ''}`} style={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#a1a1aa' }}>
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#27272a]">
            {news.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-10 text-center">
                  <div className="flex flex-col items-center justify-center text-[#52525b]">
                    <Newspaper className="w-12 h-12 mb-4 opacity-50" />
                    <p className="text-sm italic">No global financial news populated in the database yet.</p>
                  </div>
                </td>
              </tr>
            ) : (
              news.map((item, idx) => {
                const dateStr = item.datetime ? new Date(item.datetime * 1000).toLocaleString() : item.published_time || 'Recent';
                const link = item.url || item.link;
                
                return (
                  <tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? '#000000' : '#09090b' }} className="hover:bg-[#18181b] transition-colors border-b border-[#27272a]">
                    <td className="p-3 border-r text-center text-[#a1a1aa]" style={{ borderColor: '#27272a' }}>{idx + 1}</td>
                    <td className="p-3 border-r text-center text-[#a1a1aa]" style={{ borderColor: '#27272a' }}>{dateStr}</td>
                    <td className="p-3 border-r text-center font-bold tracking-widest text-xs uppercase" style={{ borderColor: '#27272a', color: '#8b5cf6' }}>
                      {item.source || 'UNKNOWN'}
                    </td>
                    <td className="p-3 border-r text-[#fafafa] font-semibold truncate max-w-[400px]" style={{ borderColor: '#27272a' }}>
                      {link ? (
                        <a href={link} target="_blank" rel="noreferrer" className="hover:text-[#8b5cf6] hover:underline">
                          {item.headline || 'N/A'}
                        </a>
                      ) : (
                        item.headline || 'N/A'
                      )}
                    </td>
                    <td className="p-3 text-[#a1a1aa] truncate max-w-[500px]">
                      {item.summary || 'N/A'}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
