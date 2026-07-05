import { createClient } from '@supabase/supabase-js';
import NewsClient from './NewsClient';

export const revalidate = 60; // Revalidate every minute

export default async function NewsPage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const supabase = createClient(supabaseUrl, supabaseKey);

  // The Python scraper doesn't explicitly store general news in a separate table yet, 
  // but if it stores it in raw_market_data as 'news', we fetch it here.
  // We'll also just pass a fallback empty array if none exists.
  const { data: rawData } = await supabase
    .from('raw_market_data')
    .select('payload')
    .eq('data_type', 'general_news')
    .single();

  const newsItems = rawData?.payload || [];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-[#38bdf8] mb-6 flex items-center gap-2">
        <span className="text-[#94a3b8]">📰</span> Real-Time Global Financial News Wire
      </h1>
      <NewsClient initialNews={newsItems} />
    </div>
  );
}
