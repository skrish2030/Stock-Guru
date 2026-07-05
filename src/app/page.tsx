import { createClient } from '@supabase/supabase-js';
import DashboardClient from './DashboardClient';

export const revalidate = 60; // Revalidate every minute

export default async function Home() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const supabase = createClient(supabaseUrl, supabaseKey);

  // Fetch top tickers sorted by score
  const { data: tickers, error } = await supabase
    .from('alpha_tickers')
    .select('*')
    .order('score', { ascending: false })
    .limit(30);

  if (error) {
    console.error("Supabase fetch error:", error);
  }

  // Fetch general news for the home carousel
  const { data: rawNews } = await supabase
    .from('raw_market_data')
    .select('payload')
    .eq('data_type', 'general_news')
    .single();

  const initialNews = rawNews?.payload || [];

  return (
    <main className="min-h-screen bg-[#0A0A0A] text-white selection:bg-indigo-500/30">
      <DashboardClient initialTickers={tickers || []} initialNews={initialNews} />
    </main>
  );
}
