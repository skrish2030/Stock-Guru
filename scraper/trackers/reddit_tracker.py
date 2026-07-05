import re
import requests
from bs4 import BeautifulSoup

class RedditTracker:
    def __init__(self, subreddits: list = None):
        self.subreddits = subreddits or ["wallstreetbets", "stocks", "options"]
        self.user_agent = "windows:alphapulsetracker:v3.0.0 (by /u/alphapulse)"

    def extract_tickers(self, text: str) -> list:
        if not text:
            return []
        raw_matches = re.findall(r'\b\$?[A-Z]{2,5}\b', text)
        exclusions = {
            'USD', 'CEO', 'IPO', 'AI', 'STOCKS', 'BUY', 'SELL', 'HOLD', 'ETF', 
            'NYSE', 'NASDAQ', 'SEC', 'FED', 'FOMC', 'GDP', 'CPI', 'ATH', 'DD',
            'YOLO', 'PUMP', 'DUMP', 'CALL', 'PUT', 'EDIT', 'THE', 'AND', 'FOR', 'A', 'I',
            'CNBC', 'FREE', 'LIKE', 'LTD', 'CO', 'DAY', 'REAL', 'LIVE', 'BEST', 'STOCK',
            'LIST', 'WATCH', 'CRASH', 'WHILE', 'LG', 'US', 'UK', 'EU', 'NEWS', 'NEW',
            'MORE', 'NOW', 'OUT', 'GET', 'HAS', 'HOW', 'CAN', 'WHY', 'WHO', 'YOU', 'OUR'
        }
        tickers = []
        for t in raw_matches:
            clean = t.replace('$', '').upper()
            if clean not in exclusions and not clean.isdigit():
                tickers.append(clean)
        return list(set(tickers))

    def get_trending_tickers(self) -> tuple:
        """
        Returns (mentions_dict, raw_posts_list)
        """
        import warnings
        from bs4 import XMLParsedAsHTMLWarning
        warnings.filterwarnings("ignore", category=XMLParsedAsHTMLWarning)

        mentions = {}
        raw_posts = []
        headers = {"User-Agent": self.user_agent}
        
        for sub in self.subreddits:
            url = f"https://www.reddit.com/r/{sub}/.rss"
            print(f"Reddit Tracker RSS: Fetching r/{sub} RSS feed...")
            try:
                response = requests.get(url, headers=headers, timeout=10)
                if response.status_code == 200:
                    soup = BeautifulSoup(response.content, "html.parser")
                    entries = soup.find_all("entry")
                    print(f"Reddit Tracker RSS: Successfully parsed {len(entries)} entries for r/{sub}.")
                    for entry in entries:
                        title = entry.find("title").text if entry.find("title") else ""
                        content = entry.find("content").text if entry.find("content") else ""
                        clean_content = BeautifulSoup(content, "html.parser").text if content else ""
                        combined_text = f"{title} {clean_content}"
                        
                        found_tickers = self.extract_tickers(combined_text)
                        if found_tickers:
                            raw_posts.append({
                                "subreddit": sub,
                                "title": title,
                                "ups": 100, # Default metric since RSS doesn't expose upvotes
                                "tickers": found_tickers
                            })
                            
                            # Increment scoring
                            score_increment = 1
                            for ticker in found_tickers:
                                mentions[ticker] = mentions.get(ticker, 0) + score_increment
                else:
                    print(f"Reddit Tracker RSS: Failed to fetch r/{sub} RSS feed ({response.status_code})")
            except Exception as e:
                print(f"Reddit Tracker RSS: Error fetching r/{sub} RSS: {e}")
                
        return mentions, raw_posts
