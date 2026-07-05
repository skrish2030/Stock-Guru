import { createClient } from '@supabase/supabase-js';
import { BrainCircuit } from 'lucide-react';

export const revalidate = 60;

export default async function AdvisorPage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data: tickers } = await supabase
    .from('alpha_tickers')
    .select('symbol, company_name, ai_thesis, score')
    .order('score', { ascending: false });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-[#38bdf8] mb-6 flex items-center gap-2">
        <span className="text-[#10b981]">🧠</span> Personal AI Advisor & Research
      </h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {!tickers || tickers.length === 0 ? (
          <div className="col-span-full border rounded-xl p-10 flex flex-col items-center justify-center text-[#64748b]" style={{ backgroundColor: '#0c0f17', borderColor: '#1f2937' }}>
            <BrainCircuit className="w-12 h-12 mb-4 opacity-50" />
            <p className="text-sm italic">No AI theses generated yet. Run pipeline scan.</p>
          </div>
        ) : (
          tickers.map(ticker => (
            <div key={ticker.symbol} className="border rounded-xl flex flex-col shadow-xl" style={{ backgroundColor: '#0c0f17', borderColor: '#1f2937' }}>
              <div className="p-4 border-b flex justify-between items-center" style={{ borderColor: '#1e293b' }}>
                <div>
                  <h2 className="font-bold text-lg text-white">{ticker.symbol}</h2>
                  <p className="text-xs text-[#94a3b8] truncate">{ticker.company_name}</p>
                </div>
                <div className="text-[#dfb86c] font-bold text-sm bg-[#dfb86c]/10 px-2 py-1 rounded">
                  ★ {ticker.score.toFixed(1)}
                </div>
              </div>
              <div className="p-4 flex-1 text-sm text-[#f1f5f9] leading-relaxed overflow-y-auto max-h-[300px] scrollbar-thin scrollbar-thumb-[#374151]">
                {ticker.ai_thesis || <span className="text-[#64748b] italic">No thesis provided for this ticker.</span>}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
