import { createClient } from '@supabase/supabase-js';
import CongressClient from './CongressClient';

export const revalidate = 60;

export default async function CongressPage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data: rawData } = await supabase
    .from('raw_market_data')
    .select('payload')
    .eq('data_type', 'congress')
    .single();

  const congressItems = rawData?.payload || [];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-[#38bdf8] mb-6 flex items-center gap-2">
        <span className="text-[#94a3b8]">🏛️</span> Congressional Inside Track Filings
      </h1>
      <CongressClient initialData={congressItems} />
    </div>
  );
}
