-- Drop tables if they already exist
DROP TABLE IF EXISTS alpha_tickers;
DROP TABLE IF EXISTS raw_market_data;

-- Table to hold the final evaluated tickers and AI analysis
CREATE TABLE alpha_tickers (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    symbol TEXT NOT NULL,
    company_name TEXT,
    score NUMERIC,
    tier TEXT,
    archetype TEXT,
    action TEXT,
    smart_money NUMERIC,
    retail_hype NUMERIC,
    yt_mentions NUMERIC,
    congress_trades NUMERIC,
    reddit_mentions NUMERIC,
    discord_mentions NUMERIC,
    is_ipo BOOLEAN DEFAULT FALSE,
    price NUMERIC,
    percent_change NUMERIC,
    ai_thesis TEXT,
    why_invest TEXT,
    company_description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Table to hold the raw scraped data (YouTube, Congress, Reddit, etc.)
CREATE TABLE raw_market_data (
    id UUID DEFAULT extensions.uuid_generate_v4() PRIMARY KEY,
    data_type TEXT NOT NULL, -- e.g., 'youtube', 'congress', 'reddit'
    payload JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS) but allow public reads
ALTER TABLE alpha_tickers ENABLE ROW LEVEL SECURITY;
ALTER TABLE raw_market_data ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access to tickers"
    ON alpha_tickers FOR SELECT
    USING (true);

CREATE POLICY "Allow public read access to raw data"
    ON raw_market_data FOR SELECT
    USING (true);

-- Allow service role to insert/update (implicitly allowed by Postgres for service_role)
