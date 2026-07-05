"use client";

import { useState } from 'react';
import { Video, ExternalLink } from 'lucide-react';

interface YouTubeItem {
  title?: string;
  channel?: string;
  published_time?: string;
  published_at?: string;
  video_tickers?: string[];
  comment_tickers?: string[];
  query?: string;
  search_query?: string;
  url?: string;
  videoId?: string;
}

export default function YouTubeClient({ initialData }: { initialData: YouTubeItem[] }) {
  const [data] = useState<YouTubeItem[]>(initialData);
  
  // Client-side pagination (10 items per page)
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.max(1, Math.ceil(data.length / itemsPerPage));

  const startIndex = (currentPage - 1) * itemsPerPage;
  const paginatedData = data.slice(startIndex, startIndex + itemsPerPage);

  const handlePrev = () => {
    if (currentPage > 1) setCurrentPage(currentPage - 1);
  };

  const handleNext = () => {
    if (currentPage < totalPages) setCurrentPage(currentPage + 1);
  };

  return (
    <div className="border rounded-xl shadow-2xl flex flex-col h-[calc(100vh-140px)]" style={{ backgroundColor: '#000000', borderColor: '#27272a' }}>
      <div className="flex-1 overflow-auto bg-[#09090b] rounded-t-xl">
        <table className="w-full text-left text-xs whitespace-nowrap">
          <thead className="sticky top-0 z-10">
            <tr>
              {["#", "Video Title", "Channel Name", "Published", "Video Tickers", "Comment Tickers", "Search Concept"].map((header, i) => (
                <th key={header} className={`p-3 border-b font-bold text-center ${i < 6 ? 'border-r' : ''}`} style={{ backgroundColor: '#18181b', borderColor: '#27272a', color: '#a1a1aa' }}>
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#27272a]">
            {data.length === 0 ? (
              <tr>
                <td colSpan={7} className="p-10 text-center">
                  <div className="flex flex-col items-center justify-center text-[#52525b]">
                    <Video className="w-12 h-12 mb-4 opacity-50" />
                    <p className="text-sm italic">No YouTube financial media data populated in the database yet.</p>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedData.map((item, idx) => {
                const globalIdx = startIndex + idx;
                const pubDate = item.published_time || item.published_at || 'Recent';
                const concept = item.query || item.search_query || 'General';
                const videoUrl = item.url || (item.videoId ? `https://www.youtube.com/watch?v=${item.videoId}` : '#');
                
                return (
                  <tr key={globalIdx} style={{ backgroundColor: globalIdx % 2 === 0 ? '#000000' : '#09090b' }} className="hover:bg-[#18181b] transition-colors border-b border-[#27272a]">
                    <td className="p-3 border-r text-center text-[#a1a1aa]" style={{ borderColor: '#27272a' }}>{globalIdx + 1}</td>
                    <td className="p-3 border-r text-[#fafafa] font-semibold truncate max-w-[300px]" style={{ borderColor: '#27272a' }}>
                      {videoUrl !== '#' ? (
                        <a href={videoUrl} target="_blank" rel="noreferrer" className="hover:text-[#8b5cf6] hover:underline flex items-center gap-1.5">
                          {item.title || 'N/A'} <ExternalLink className="w-3.5 h-3.5 opacity-60" />
                        </a>
                      ) : (
                        item.title || 'N/A'
                      )}
                    </td>
                    <td className="p-3 border-r text-center text-[#8b5cf6] font-bold" style={{ borderColor: '#27272a' }}>{item.channel || 'N/A'}</td>
                    <td className="p-3 border-r text-center text-[#a1a1aa]" style={{ borderColor: '#27272a' }}>{pubDate}</td>
                    <td className="p-0 border-r align-top" style={{ borderColor: '#27272a' }}>
                      <div className="max-h-[120px] overflow-y-auto p-3 scrollbar-thin scrollbar-thumb-[#27272a]">
                        <ul className="text-left font-bold text-[#10b981] space-y-1 ml-4">
                          {item.video_tickers?.map((t, i) => (
                            <li key={i}>• {t}</li>
                          )) || <li className="text-[#52525b] font-normal italic">None</li>}
                        </ul>
                      </div>
                    </td>
                    <td className="p-0 border-r align-top" style={{ borderColor: '#27272a' }}>
                      <div className="max-h-[120px] overflow-y-auto p-3 scrollbar-thin scrollbar-thumb-[#27272a]">
                        <ul className="text-left font-bold text-[#f43f5e] space-y-1 ml-4">
                          {item.comment_tickers?.map((t, i) => (
                            <li key={i}>• {t}</li>
                          )) || <li className="text-[#52525b] font-normal italic">None</li>}
                        </ul>
                      </div>
                    </td>
                    <td className="p-3 text-center text-[#a1a1aa]">{concept}</td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Controls Footer */}
      <div className="p-4 border-t flex justify-center items-center gap-4 bg-[#000000] rounded-b-xl" style={{ borderColor: '#27272a' }}>
        <button 
          onClick={handlePrev}
          disabled={currentPage === 1}
          className="px-4 py-2 text-xs font-bold rounded bg-[#18181b] border border-[#27272a] text-[#fafafa] hover:bg-[#27272a] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          ◀ Prev
        </button>
        <span className="text-xs text-[#a1a1aa]">
          Page <strong>{currentPage}</strong> of <strong>{totalPages}</strong>
        </span>
        <button 
          onClick={handleNext}
          disabled={currentPage === totalPages}
          className="px-4 py-2 text-xs font-bold rounded bg-[#18181b] border border-[#27272a] text-[#fafafa] hover:bg-[#27272a] disabled:opacity-40 disabled:cursor-not-allowed transition-all"
        >
          Next ▶
        </button>
      </div>

    </div>
  );
}
