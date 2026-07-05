import { createClient } from '@supabase/supabase-js';
import ResearchClient from './ResearchClient';

export const revalidate = 60;

export default async function ResearchPage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data: tickers } = await supabase
    .from('alpha_tickers')
    .select('*')
    .order('score', { ascending: false });

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-[#38bdf8] mb-6 flex items-center gap-2">
        <span className="text-[#a855f7]">🔍</span> Deep Wall Street Research Engine
      </h1>
      <ResearchClient initialTickers={tickers || []} />
    </div>
  );
}
