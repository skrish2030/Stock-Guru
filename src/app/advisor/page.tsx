import { createClient } from '@supabase/supabase-js';
import AdvisorClient from './AdvisorClient';

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
        <span className="text-[#8b5cf6]">🧠</span> Personal Advisor & Research
      </h1>
      
      <AdvisorClient initialTickers={tickers || []} />
    </div>
  );
}
