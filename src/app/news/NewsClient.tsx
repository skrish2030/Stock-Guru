"use client";

import { useState } from 'react';
import { Newspaper } from 'lucide-react';

interface NewsItem {
  published_time?: string;
  source?: string;
  headline?: string;
  summary?: string;
  link?: string;
}

export default function NewsClient({ initialNews }: { initialNews: NewsItem[] }) {
  const [news] = useState<NewsItem[]>(initialNews);

  return (
    <div className="border rounded-xl shadow-2xl flex flex-col h-[calc(100vh-140px)]" style={{ backgroundColor: '#0c0f17', borderColor: '#1f2937' }}>
      <div className="flex-1 overflow-auto bg-[#0b0f19] rounded-xl">
        <table className="w-full text-left text-xs whitespace-nowrap">
          <thead className="sticky top-0 z-10">
            <tr>
              {["#", "Published Time", "Source", "Headline", "Summary / Abstract"].map((header, i) => (
                <th key={header} className={`p-3 border-b font-bold text-center ${i < 4 ? 'border-r' : ''}`} style={{ backgroundColor: '#151d30', borderColor: '#1e293b', color: '#38bdf8' }}>
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1e293b]">
            {news.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-10 text-center">
                  <div className="flex flex-col items-center justify-center text-[#64748b]">
                    <Newspaper className="w-12 h-12 mb-4 opacity-50" />
                    <p className="text-sm italic">No global financial news populated in the database yet.</p>
                  </div>
                </td>
              </tr>
            ) : (
              news.map((item, idx) => (
                <tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? '#0c0f17' : '#111827' }} className="hover:bg-[#1f2937] transition-colors">
                  <td className="p-3 border-r text-center text-[#94a3b8]" style={{ borderColor: '#1e293b' }}>{idx + 1}</td>
                  <td className="p-3 border-r text-center text-[#f8fafc]" style={{ borderColor: '#1e293b' }}>{item.published_time || 'N/A'}</td>
                  <td className="p-3 border-r text-center font-bold tracking-widest text-xs uppercase" style={{ borderColor: '#1e293b', color: '#a855f7' }}>
                    {item.source || 'UNKNOWN'}
                  </td>
                  <td className="p-3 border-r text-[#f8fafc] font-semibold truncate max-w-[400px]" style={{ borderColor: '#1e293b' }}>
                    {item.link ? (
                      <a href={item.link} target="_blank" rel="noreferrer" className="hover:text-[#38bdf8] hover:underline">
                        {item.headline || 'N/A'}
                      </a>
                    ) : (
                      item.headline || 'N/A'
                    )}
                  </td>
                  <td className="p-3 text-[#94a3b8] truncate max-w-[500px]">
                    {item.summary || 'N/A'}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
