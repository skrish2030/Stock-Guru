import { createClient } from '@supabase/supabase-js';
import YouTubeClient from './YouTubeClient';

export const revalidate = 60;

export default async function YouTubePage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data: rawData } = await supabase
    .from('raw_market_data')
    .select('payload')
    .eq('data_type', 'youtube')
    .single();

  const youtubeItems = rawData?.payload || [];

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-[#38bdf8] mb-6 flex items-center gap-2">
        <span className="text-[#f43f5e]">🎥</span> YouTube Financial Media Watchlist
      </h1>
      <YouTubeClient initialData={youtubeItems} />
    </div>
  );
}
