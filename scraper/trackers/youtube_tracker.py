import os
import re
import json
import requests
from concurrent.futures import ThreadPoolExecutor, as_completed

# Curated set of common English words and general finance terms
# that are often capitalized but should not be treated as tickers unless prefixed with '$'.
COMMON_WORDS = {
    # Pronouns
    'I', 'ME', 'MY', 'MYSELF', 'WE', 'OUR', 'OURS', 'OURSELVES', 'YOU', 'YOUR', 'YOURS',
    'YOURSELF', 'YOURSELVES', 'HE', 'HIM', 'HIS', 'HIMSELF', 'SHE', 'HER', 'HERS',
    'HERSELF', 'IT', 'ITS', 'ITSELF', 'THEY', 'THEM', 'THEIR', 'THEIRS', 'THEMSELVES',
    # Conjunctions & Prepositions
    'AND', 'BUT', 'OR', 'BECAUSE', 'AS', 'UNTIL', 'WHILE', 'OF', 'AT', 'BY', 'FOR',
    'WITH', 'ABOUT', 'AGAINST', 'BETWEEN', 'INTO', 'THROUGH', 'DURING', 'BEFORE',
    'AFTER', 'ABOVE', 'BELOW', 'TO', 'FROM', 'UP', 'DOWN', 'IN', 'OUT', 'ON', 'OFF',
    'OVER', 'UNDER', 'AGAIN', 'FURTHER', 'THEN', 'ONCE', 'HERE', 'THERE', 'WHEN',
    'WHERE', 'WHY', 'HOW', 'ALL', 'ANY', 'BOTH', 'EACH', 'FEW', 'MORE', 'MOST',
    'OTHER', 'SOME', 'SUCH', 'NO', 'NOR', 'NOT', 'ONLY', 'OWN', 'SAME', 'SO', 'THAN',
    'TOO', 'VERY', 'S', 'T', 'CAN', 'WILL', 'JUST', 'DON', 'SHOULD', 'NOW',
    # Verbs
    'IS', 'ARE', 'WAS', 'WERE', 'BE', 'BEEN', 'BEING', 'HAVE', 'HAS', 'HAD', 'HAVING',
    'DO', 'DOES', 'DID', 'DOING', 'GO', 'GOES', 'WENT', 'GONE', 'GET', 'GETS', 'GOT',
    'MAKE', 'MAKES', 'MADE', 'TAKE', 'TAKES', 'TOOK', 'TAKEN', 'USE', 'USES', 'USED',
    'WANT', 'WANTS', 'WANTED', 'LOOK', 'LOOKS', 'LOOKED', 'SEE', 'SEES', 'SAW', 'SEEN',
    'COME', 'COMES', 'CAME', 'CALL', 'CALLS', 'CALLED', 'WORK', 'WORKS', 'WORKED',
    'PLAY', 'PLAYS', 'PLAYED', 'BUY', 'BUYS', 'BOUGHT', 'SELL', 'SELLS', 'SOLD',
    'HOLD', 'HOLDS', 'HELD', 'RUN', 'RUNS', 'RAN', 'LIVE', 'LIVES', 'LIVED', 'LOVE',
    'LOVES', 'LOVED', 'NEED', 'NEEDS', 'NEEDED', 'LIKE', 'LIKES', 'LIKED',
    # Adjectives & Adverbs
    'NEW', 'GOOD', 'BAD', 'BEST', 'WORST', 'BIG', 'HUGE', 'GREAT', 'CRAZY', 'LAST',
    'NEXT', 'EARLY', 'LATE', 'DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY', 'REAL', 'FREE',
    'TRUE', 'FALSE', 'HIGH', 'LOW', 'SAFE', 'FAST', 'SLOW', 'HOT', 'COLD', 'WARM',
    # Numbers
    'ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'SIX', 'SEVEN', 'EIGHT', 'NINE', 'TEN',
    # Financial/Market Jargon
    'STOCK', 'STOCKS', 'MARKET', 'MARKETS', 'TRADE', 'TRADING', 'INVEST', 'INVESTING',
    'INVESTOR', 'INVESTORS', 'PORTFOLIO', 'PORTFOLIOS', 'OPTION', 'OPTIONS', 'LEAPS',
    'CALLS', 'PUTS', 'FUTURES', 'ETF', 'ETFS', 'MUTUAL', 'FUND', 'FUNDS', 'DIVIDEND',
    'DIVIDENDS', 'YIELD', 'INCOME', 'REVENUE', 'PROFIT', 'PROFITS', 'LOSS', 'LOSSES',
    'CASH', 'MONEY', 'DEBT', 'EQUITY', 'BULL', 'BEAR', 'SHORTS', 'LONG', 'SHORT',
    'USD', 'EUR', 'GBP', 'CAD', 'AUD', 'JPY', 'CNY', 'BTC', 'ETH', 'CEO', 'CFO',
    'COO', 'IPO', 'SPAC', 'SEC', 'FED', 'FOMC', 'GDP', 'CPI', 'ATH', 'DD', 'YOLO',
    'NYSE', 'NASDAQ', 'AMEX', 'OTC', 'RETIRE', 'RETIREMENT', 'WEALTH', 'RICH', 'POOR',
    'ALERT', 'WARNING', 'BOOM', 'CRASH', 'PUMP', 'DUMP', 'NEWS', 'INFO', 'TODAY',
    'TOMORROW', 'YESTERDAY', 'WEEK', 'MONTH', 'YEAR', 'DECADE', 'TIME', 'DATE',
    'HOUR', 'MINUTE', 'SECOND', 'EXCEL', 'POWER', 'MUST', 'DONT', 'WOULD', 'COULD',
    'POTENTIAL', 'VALUATION', 'VALUE', 'GROWTH', 'ANALYSIS', 'REPORT', 'REPORTS',
    'TREND', 'TRENDING', 'TRENDS', 'AMERICA', 'POTENTIAL', 'FOOD', 'BRAND', 'DEAD',
    'RIGHT', 'STAR', 'STARS', 'ARE', 'AI', 'MM', 'EVER', 'MANY'
}

POPULAR_TICKERS = {
    'TSLA', 'AAPL', 'MSFT', 'NVDA', 'AMZN', 'GOOG', 'GOOGL', 'META', 'NFLX', 'PLTR',
    'AMD', 'COIN', 'MSTR', 'GME', 'AMC', 'BABA', 'NIO', 'SQ', 'PYPL', 'DIS',
    'INTC', 'SBUX', 'NKE', 'XOM', 'WMT', 'COST', 'HD', 'BAC', 'LLY', 'AVGO',
    'QQQ', 'SPY', 'IWM', 'DIA', 'SMH', 'SOFI', 'ARM', 'LULU', 'MU', 'MRVL',
    'PANW', 'CRWD', 'SNOW', 'MDB', 'DDOG', 'ZS', 'OKTA'
}

COMPANY_KEYWORDS = {
    'tesla': 'TSLA',
    'apple': 'AAPL',
    'microsoft': 'MSFT',
    'nvidia': 'NVDA',
    'amazon': 'AMZN',
    'google': 'GOOGL',
    'alphabet': 'GOOGL',
    'meta': 'META',
    'facebook': 'META',
    'netflix': 'NFLX',
    'palantir': 'PLTR',
    'amd': 'AMD',
    'coinbase': 'COIN',
    'microstrategy': 'MSTR',
    'gamestop': 'GME',
    'disney': 'DIS',
    'intel': 'INTC',
    'starbucks': 'SBUX',
    'nike': 'NKE',
    'exxon': 'XOM',
    'walmart': 'WMT',
    'costco': 'COST',
    'sofi': 'SOFI'
}

class YouTubeTracker:
    def __init__(self, api_key: str = None, channels_list: list = None):
        self.api_key = api_key
        self.channels_list = channels_list or [
            "The Plain Bagel", "Sven Carlin", "Everything Money", "Joseph Carlson", 
            "Ben Felix", "ClearValue Tax", "tastytrade", "Investor's Business Daily", 
            "Unrivaled Investing", "Learn to Invest", "Focused Compounding", 
            "Graham Stephan", "Andrei Jikh", "Warrior Trading"
        ]
        
        # Load local valid symbols cache
        self.valid_symbols = set()
        base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        symbols_path = os.path.join(base_dir, "us_symbols.json")
        if os.path.exists(symbols_path):
            try:
                with open(symbols_path, "r", encoding="utf-8") as f:
                    self.valid_symbols = set(json.load(f))
                print(f"YouTube Tracker: Loaded symbols cache ({len(self.valid_symbols)} symbols)")
            except Exception as e:
                print(f"YouTube Tracker: Error loading symbols cache: {e}")

    def extract_tickers_from_metadata(self, text: str) -> list:
        if not text:
            return []
        
        # Match uppercase words of 2-5 letters or words with leading $
        raw_matches = re.findall(r'\b\$?[A-Z]{2,5}\b', text)
        tickers = []
        
        for t in raw_matches:
            clean = t.replace('$', '').upper()
            
            # 1. Check symbols cache if loaded
            if self.valid_symbols and clean not in self.valid_symbols:
                continue
                
            # 2. Check exclusions
            if clean in COMMON_WORDS:
                if t.startswith('$'):
                    tickers.append(clean)
            else:
                tickers.append(clean)
                
        return list(set(tickers))

    def extract_tickers_unified(self, title: str, description: str, comments: list, transcript: str) -> tuple:
        # 1. Extract tickers from Title, Description, and Transcript (Video Tickers)
        title_desc_text = f"{title}\n{description}"
        video_candidates = set(self.extract_tickers_from_metadata(title_desc_text))
        video_tickers = set(video_candidates)
        
        transcript_words = set()
        transcript_lower = ""
        if transcript:
            transcript_lower = transcript.lower()
            transcript_words = set(re.findall(r'\b[a-z]{2,5}\b', transcript_lower))
            
            # Add popular tickers if mentioned in transcript
            for ticker in POPULAR_TICKERS:
                if ticker.lower() in transcript_words:
                    video_tickers.add(ticker)
                    
            # Add company names if mentioned in transcript
            for name, ticker in COMPANY_KEYWORDS.items():
                if name in transcript_lower:
                    video_tickers.add(ticker)
                    
        # 2. Extract tickers from Comments (Comment Tickers)
        comment_tickers = set()
        for comment in comments:
            c_candidates = self.extract_tickers_from_metadata(comment)
            for cand in c_candidates:
                # If we have transcript, verify candidate is mentioned or is popular
                if transcript:
                    if cand.lower() in transcript_words or cand in POPULAR_TICKERS:
                        comment_tickers.add(cand)
                else:
                    comment_tickers.add(cand)
                    
        return sorted(list(video_tickers)), sorted(list(comment_tickers))

    def get_video_content(self, video_id: str) -> dict:
        result = {
            "title": "",
            "description": "",
            "comments": [],
            "transcript": "",
            "publishedAt": ""
        }
        
        # 1. Query YouTube Data API for Title, Description & Top Comments
        if self.api_key:
            try:
                from googleapiclient.discovery import build
                # Thread-safe client initialization per ThreadPool worker
                youtube = build("youtube", "v3", developerKey=self.api_key, cache_discovery=False)
                
                # Fetch snippet details
                res = youtube.videos().list(part="snippet", id=video_id).execute()
                items = res.get("items", [])
                if items:
                    snippet = items[0]["snippet"]
                    result["title"] = snippet.get("title", "")
                    result["description"] = snippet.get("description", "")
                    result["publishedAt"] = snippet.get("publishedAt", "")
            except Exception as e:
                print(f"YouTube Tracker: Error fetching video snippet for {video_id}: {e}")
                
            # Fetch comments
            try:
                comments_res = youtube.commentThreads().list(
                    part="snippet",
                    videoId=video_id,
                    maxResults=30,
                    textFormat="plainText"
                ).execute()
                for item in comments_res.get("items", []):
                    c_text = item["snippet"]["topLevelComment"]["snippet"]["textDisplay"]
                    result["comments"].append(c_text)
            except Exception as e:
                print(f"YouTube Tracker: Error fetching comments for {video_id}: {e}")
                
        # 2. Query youtube-transcript-api for video captions
        try:
            from youtube_transcript_api import YouTubeTranscriptApi
            api = YouTubeTranscriptApi()
            transcript_list = api.fetch(video_id)
            result["transcript"] = " ".join([t.text for t in transcript_list])
        except Exception:
            # Transcripts are frequently disabled by uploaders, so this is handled silently
            pass
            
        return result

    def scrape_youtube_search(self, query: str) -> list:
        url = f"https://www.youtube.com/results?search_query={query.replace(' ', '+')}"
        headers = {
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept-Language": "en-US,en;q=0.9"
        }
        try:
            res = requests.get(url, headers=headers, timeout=10)
            if res.status_code != 200:
                print(f"YouTube Tracker Scraper: Search HTTP {res.status_code} for query '{query}'")
                return []
            
            match = re.search(r'ytInitialData\s*=\s*({.*?});</script>', res.text)
            if not match:
                match = re.search(r'ytInitialData\s*=\s*({.*?});', res.text)
                
            if match:
                data = json.loads(match.group(1))
                try:
                    contents = data["contents"]["twoColumnSearchResultsRenderer"]["primaryContents"]["sectionListRenderer"]["contents"]
                except KeyError:
                    return []
                    
                video_items = []
                for content in contents:
                    if "itemSectionRenderer" in content:
                        items = content["itemSectionRenderer"]["contents"]
                        for item in items:
                            if "videoRenderer" in item:
                                vr = item["videoRenderer"]
                                video_id = vr.get("videoId")
                                title = ""
                                if "title" in vr and "runs" in vr["title"] and vr["title"]["runs"]:
                                    title = vr["title"]["runs"][0].get("text", "")
                                channel = ""
                                if "ownerText" in vr and "runs" in vr["ownerText"] and vr["ownerText"]["runs"]:
                                    channel = vr["ownerText"]["runs"][0].get("text", "")
                                desc = ""
                                if "descriptionSnippet" in vr and "runs" in vr["descriptionSnippet"] and vr["descriptionSnippet"]["runs"]:
                                    desc = vr["descriptionSnippet"]["runs"][0].get("text", "")
                                published_time = ""
                                if "publishedTimeText" in vr and "simpleText" in vr["publishedTimeText"]:
                                    published_time = vr["publishedTimeText"]["simpleText"]
                                
                                video_items.append({
                                    "title": title,
                                    "channel": channel,
                                    "description": desc,
                                    "videoId": video_id,
                                    "published_time": published_time
                                })
                return video_items
            else:
                print(f"YouTube Tracker Scraper: ytInitialData not found in HTML response for '{query}'")
        except Exception as e:
            print(f"YouTube Tracker Scraper error for query '{query}': {e}")
        return []

    def get_trending_tickers(self) -> tuple:
        """
        Returns (mentions_dict, raw_videos_list)
        """
        mentions = {}
        raw_videos = []
        all_videos = []
        
        # 1. Search general terms
        queries = ["stocks to buy", "trending stocks", "trading options", "stock market news"]
        for q in queries:
            print(f"YouTube Tracker Scraper: Searching '{q}'...")
            videos = self.scrape_youtube_search(q)
            # Take top 5 results
            for v in videos[:5]:
                v["query"] = q
                all_videos.append(v)
                
        # 2. Query specific high-profile investor channels from configuration list
        for channel_name in self.channels_list:
            print(f"YouTube Tracker Scraper: Searching channel focus '{channel_name}'...")
            videos = self.scrape_youtube_search(channel_name)
            # Take top 3 results
            for v in videos[:3]:
                channel_title = v["channel"]
                if channel_name.lower() in channel_title.lower() or channel_title.lower() in channel_name.lower():
                    v["query"] = f"Channel Focus: {channel_name}"
                    all_videos.append(v)
                    
        # 3. Fetch deep content in parallel (Descriptions, Comments, Transcripts)
        video_contents = {}
        def fetch_single_video(vid):
            return vid, self.get_video_content(vid)
            
        video_ids = list({v["videoId"] for v in all_videos if v.get("videoId")})
        print(f"YouTube Tracker Scraper: Fetching deep content for {len(video_ids)} videos in parallel...")
        
        with ThreadPoolExecutor(max_workers=10) as executor:
            futures = {executor.submit(fetch_single_video, vid): vid for vid in video_ids}
            for future in as_completed(futures):
                try:
                    vid, details = future.result()
                    video_contents[vid] = details
                except Exception as e:
                    print(f"YouTube Tracker Scraper: Parallel fetch error: {e}")
                    
        # 4. Extract verified tickers and accumulate results
        for v in all_videos:
            title = v["title"]
            channel = v["channel"]
            video_id = v.get("videoId")
            query = v["query"]
            
            details = video_contents.get(video_id, {"title": title, "description": "", "comments": [], "transcript": "", "publishedAt": ""})
            v_title = details.get("title") or title
            v_desc = details.get("description", "")
            v_comments = details.get("comments", [])
            v_transcript = details.get("transcript", "")
            pub_time = details.get("publishedAt") or v.get("published_time") or ""
            if pub_time and "T" in pub_time and "Z" in pub_time:
                try:
                    pub_time = pub_time.split("T")[0]
                except Exception:
                    pass
            
            video_tickers, comment_tickers = self.extract_tickers_unified(v_title, v_desc, v_comments, v_transcript)
            if video_tickers or comment_tickers:
                raw_videos.append({
                    "title": v_title,
                    "channel": channel,
                    "video_tickers": video_tickers,
                    "comment_tickers": comment_tickers,
                    "query": query,
                    "videoId": video_id,
                    "published_time": pub_time
                })
                
                # Mentions weighting: search query yields 1, channel focus yields 2
                weight = 2 if "Channel Focus" in query else 1
                for ticker in set(video_tickers + comment_tickers):
                    mentions[ticker] = mentions.get(ticker, 0) + weight
                    
        return mentions, raw_videos
