import { createClient } from '@supabase/supabase-js';
import PennyClient from './PennyClient';

export const revalidate = 60; // Revalidate every minute

export default async function PennyPage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Fetch all tickers to filter on the client side
  const { data: tickers, error } = await supabase
    .from('alpha_tickers')
    .select('*')
    .order('score', { ascending: false });

  if (error) {
    console.error("Supabase fetch error:", error);
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-[#38bdf8] mb-6 flex items-center gap-2">
        <span className="text-[#fbbf24]">🪙</span> Penny Stocks & Volatility Alerts Section
      </h1>
      <PennyClient initialTickers={tickers || []} />
    </div>
  );
}
