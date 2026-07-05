"use client";

import { useState } from 'react';
import { Video } from 'lucide-react';

interface YouTubeItem {
  title?: string;
  channel?: string;
  published_at?: string;
  video_tickers?: string[];
  comment_tickers?: string[];
  search_query?: string;
  url?: string;
}

export default function YouTubeClient({ initialData }: { initialData: YouTubeItem[] }) {
  const [data] = useState<YouTubeItem[]>(initialData);

  return (
    <div className="border rounded-xl shadow-2xl flex flex-col h-[calc(100vh-140px)]" style={{ backgroundColor: '#0c0f17', borderColor: '#1f2937' }}>
      <div className="flex-1 overflow-auto bg-[#0b0f19] rounded-xl">
        <table className="w-full text-left text-xs whitespace-nowrap">
          <thead className="sticky top-0 z-10">
            <tr>
              {["#", "Video Title", "Channel Name", "Published", "Video Tickers", "Comment Tickers", "Search Concept"].map((header, i) => (
                <th key={header} className={`p-3 border-b font-bold text-center ${i < 6 ? 'border-r' : ''}`} style={{ backgroundColor: '#151d30', borderColor: '#1e293b', color: '#38bdf8' }}>
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1e293b]">
            {data.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-10 text-center">
                  <div className="flex flex-col items-center justify-center text-[#64748b]">
                    <Video className="w-12 h-12 mb-4 opacity-50" />
                    <p className="text-sm italic">No YouTube financial media data populated in the database yet.</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((item, idx) => (
                <tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? '#0c0f17' : '#111827' }} className="hover:bg-[#1f2937] transition-colors">
                  <td className="p-3 border-r text-center text-[#94a3b8]" style={{ borderColor: '#1e293b' }}>{idx + 1}</td>
                  <td className="p-3 border-r text-[#f8fafc] font-semibold truncate max-w-[300px]" style={{ borderColor: '#1e293b' }}>
                    {item.url ? (
                      <a href={item.url} target="_blank" rel="noreferrer" className="hover:text-[#38bdf8] hover:underline">
                        {item.title || 'N/A'}
                      </a>
                    ) : (
                      item.title || 'N/A'
                    )}
                  </td>
                  <td className="p-3 border-r text-center text-[#dfb86c]" style={{ borderColor: '#1e293b' }}>{item.channel || 'N/A'}</td>
                  <td className="p-3 border-r text-center text-[#94a3b8]" style={{ borderColor: '#1e293b' }}>{item.published_at || 'N/A'}</td>
                  <td className="p-0 border-r align-top" style={{ borderColor: '#1e293b' }}>
                    <div className="max-h-[150px] overflow-y-auto p-3 scrollbar-thin scrollbar-thumb-[#374151]">
                      <ul className="text-left font-bold text-[#10b981] space-y-1 ml-4">
                        {item.video_tickers?.map((t, i) => (
                          <li key={i}>• {t}</li>
                        )) || <li className="text-[#64748b] font-normal italic">None</li>}
                      </ul>
                    </div>
                  </td>
                  <td className="p-0 border-r align-top" style={{ borderColor: '#1e293b' }}>
                    <div className="max-h-[150px] overflow-y-auto p-3 scrollbar-thin scrollbar-thumb-[#374151]">
                      <ul className="text-left font-bold text-[#f43f5e] space-y-1 ml-4">
                        {item.comment_tickers?.map((t, i) => (
                          <li key={i}>• {t}</li>
                        )) || <li className="text-[#64748b] font-normal italic">None</li>}
                      </ul>
                    </div>
                  </td>
                  <td className="p-3 text-center text-[#94a3b8]">{item.search_query || 'N/A'}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
