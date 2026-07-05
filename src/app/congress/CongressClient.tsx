"use client";

import { useState } from 'react';
import { Landmark } from 'lucide-react';

interface CongressItem {
  representative?: string;
  ticker?: string;
  symbol?: string;
  transaction_type?: string;
  transactionType?: string;
  amount?: string;
  transaction_date?: string;
  date?: string;
}

export default function CongressClient({ initialData }: { initialData: CongressItem[] }) {
  const [data] = useState<CongressItem[]>(initialData);

  return (
    <div className="border rounded-xl shadow-2xl flex flex-col h-[calc(100vh-140px)]" style={{ backgroundColor: '#0c0f17', borderColor: '#1f2937' }}>
      <div className="flex-1 overflow-auto bg-[#0b0f19] rounded-xl">
        <table className="w-full text-left text-xs whitespace-nowrap">
          <thead className="sticky top-0 z-10">
            <tr>
              {["#", "Insider / Politician Name", "Symbol", "Transaction Type", "Amount Range", "Filing Date"].map((header, i) => (
                <th key={header} className={`p-3 border-b font-bold text-center ${i < 5 ? 'border-r' : ''}`} style={{ backgroundColor: '#151d30', borderColor: '#1e293b', color: '#38bdf8' }}>
                  {header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#1e293b]">
            {data.length === 0 ? (
              <tr>
                <td colSpan={6} className="p-10 text-center">
                  <div className="flex flex-col items-center justify-center text-[#64748b]">
                    <Landmark className="w-12 h-12 mb-4 opacity-50" />
                    <p className="text-sm italic">No congressional trading data populated in the database yet.</p>
                  </div>
                </td>
              </tr>
            ) : (
              data.map((item, idx) => {
                const transactionType = item.transactionType || item.transaction_type || 'N/A';
                const isPurchase = transactionType.toLowerCase().includes('purchase') || transactionType.toLowerCase().includes('buy');
                const symbol = item.symbol || item.ticker || 'N/A';
                const date = item.date || item.transaction_date || 'N/A';
                
                return (
                  <tr key={idx} style={{ backgroundColor: idx % 2 === 0 ? '#000000' : '#09090b' }} className="hover:bg-[#18181b] transition-colors border-b border-[#27272a]">
                    <td className="p-3 border-r text-center text-[#a1a1aa]" style={{ borderColor: '#27272a' }}>{idx + 1}</td>
                    <td className="p-3 border-r text-[#fafafa]" style={{ borderColor: '#27272a' }}>{item.representative || 'N/A'}</td>
                    <td className="p-3 border-r text-center font-bold text-[#fafafa]" style={{ borderColor: '#27272a' }}>{symbol}</td>
                    <td className="p-3 border-r text-center font-semibold text-[#fafafa] flex items-center justify-center gap-2" style={{ borderColor: '#27272a' }}>
                      {transactionType}
                      <div className={`w-2 h-2 rounded-full ${isPurchase ? 'bg-[#10b981]' : 'bg-[#f43f5e]'}`} />
                    </td>
                    <td className="p-3 border-r text-center text-[#8b5cf6]" style={{ borderColor: '#27272a' }}>{item.amount || 'N/A'}</td>
                    <td className="p-3 text-center text-[#a1a1aa]">{date}</td>
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
