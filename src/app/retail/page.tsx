import { createClient } from '@supabase/supabase-js';
import RetailClient from './RetailClient';

export const revalidate = 60;

export default async function RetailPage() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
  const supabase = createClient(supabaseUrl, supabaseKey);

  const { data: redditData } = await supabase.from('raw_market_data').select('payload').eq('data_type', 'reddit').single();
  const { data: discordData } = await supabase.from('raw_market_data').select('payload').eq('data_type', 'discord').single();

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-[#38bdf8] mb-6 flex items-center gap-2">
        <span className="text-[#a855f7]">👥</span> Retail Sentiment Analysis (Reddit & Discord)
      </h1>
      <RetailClient redditItems={redditData?.payload || []} discordItems={discordData?.payload || []} />
    </div>
  );
}
