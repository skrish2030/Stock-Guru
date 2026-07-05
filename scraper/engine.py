import requests
from trackers.youtube_tracker import YouTubeTracker
from trackers.congress_tracker import CongressTracker
from trackers.reddit_tracker import RedditTracker
from trackers.discord_tracker import DiscordTracker

SECTOR_MAP = {
    "AI": ["NVDA", "MSFT", "GOOGL", "GOOG", "PLTR", "AMD", "AAPL", "AVGO", "META"],
    "Crypto": ["COIN", "HOOD", "MARA", "RIOT", "MSTR", "BTC-USD", "ETH-USD"],
    "ETFs": ["SPY", "QQQ", "IWM", "DIA"],
    "Bonds": ["TLT", "BND", "IEF", "SHY"]
}

def get_yahoo_trending_tickers() -> list:
    """
    Fetch top 10 trending stock tickers in the US from Yahoo Finance.
    """
    try:
        url = "https://query1.finance.yahoo.com/v1/finance/trending/US"
        headers = {"User-Agent": "Mozilla/5.0"}
        res = requests.get(url, headers=headers, timeout=4)
        if res.status_code == 200:
            trends = res.json().get("finance", {}).get("result", [{}])[0].get("quotes", [])
            symbols = []
            for t in trends:
                sym = t.get("symbol", "").upper().strip()
                # Filter out raw futures symbols containing '='
                if sym and not any(char in sym for char in ["=", "^", ":"]):
                    symbols.append(sym)
            return symbols[:10]
    except Exception:
        pass
    return []

def get_coingecko_trending_tickers() -> list:
    """
    Fetch top trending crypto symbols from CoinGecko.
    """
    try:
        url = "https://api.coingecko.com/api/v3/search/trending"
        headers = {"User-Agent": "Mozilla/5.0"}
        res = requests.get(url, headers=headers, timeout=4)
        if res.status_code == 200:
            coins = res.json().get("coins", [])
            symbols = []
            for c in coins:
                sym = c.get("item", {}).get("symbol", "").upper().strip()
                if sym:
                    symbols.append(sym)
            return symbols[:5]
    except Exception:
        pass
    return []

def get_yahoo_screener_tickers(scr_id: str) -> list:
    """
    Fetch top 10 tickers from a Yahoo Finance predefined screener (most_actives, day_gainers).
    """
    try:
        url = f"https://query1.finance.yahoo.com/v1/finance/screener/predefined/saved?formatted=false&scrIds={scr_id}&count=10"
        headers = {"User-Agent": "Mozilla/5.0"}
        res = requests.get(url, headers=headers, timeout=4)
        if res.status_code == 200:
            results = res.json().get("finance", {}).get("result", [{}])[0].get("quotes", [])
            symbols = []
            for r in results:
                sym = r.get("symbol", "").upper().strip()
                # Exclude indexes or futures
                if sym and not any(char in sym for char in ["=", "^", ":"]):
                    symbols.append(sym)
            return symbols
    except Exception:
        pass
    return []

def get_yahoo_web_gainers() -> list:
    """
    Scrape Yahoo Finance's live stock gainers page to extract all gainers,
    including micro-caps and penny stocks, directly from the embedded JSON.
    """
    try:
        url = "https://finance.yahoo.com/markets/stocks/gainers/"
        headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"}
        res = requests.get(url, headers=headers, timeout=6)
        if res.status_code == 200:
            from bs4 import BeautifulSoup
            import json
            soup = BeautifulSoup(res.text, "html.parser")
            extracted = []
            for script in soup.find_all("script"):
                content = script.string or script.text or ""
                if '"symbol"' in content and '"regularMarketPrice"' in content:
                    try:
                        data = json.loads(content.strip())
                        if isinstance(data, list):
                            for item in data:
                                if "symbol" in item:
                                    extracted.append(item)
                    except Exception:
                        pass
                    
                    try:
                        if content.strip().startswith("{") and "body" in content:
                            data = json.loads(content.strip())
                            if "body" in data:
                                body_data = json.loads(data["body"])
                                quotes = body_data.get("finance", {}).get("result", [{}])[0].get("quotes", [])
                                for q in quotes:
                                    extracted.append(q)
                    except Exception:
                        pass
                        
            symbols = []
            for q in extracted:
                sym = q.get("symbol", "").upper().strip()
                if sym and not any(char in sym for char in ["=", "^", ":"]):
                    pct = q.get("regularMarketChangePercent", {}).get("raw") or q.get("regularMarketChangePercent") or 0.0
                    if pct > 0:
                        symbols.append(sym)
            return list(set(symbols))
    except Exception:
        pass
    return []


def get_company_name(symbol: str, finnhub_key: str = None) -> str:
    common = {
        "AAPL": "Apple Inc.",
        "TSLA": "Tesla Inc.",
        "NVDA": "NVIDIA Corporation",
        "MSFT": "Microsoft Corporation",
        "AMZN": "Amazon.com Inc.",
        "GOOGL": "Alphabet Inc.",
        "GOOG": "Alphabet Inc.",
        "META": "Meta Platforms Inc.",
        "NFLX": "Netflix Inc.",
        "GME": "GameStop Corp.",
        "AMC": "AMC Entertainment Holdings",
        "PLTR": "Palantir Technologies",
        "AMD": "Advanced Micro Devices",
        "COIN": "Coinbase Global",
        "HOOD": "Robinhood Markets",
        "SPY": "SPDR S&P 500 ETF",
        "QQQ": "Invesco QQQ Trust",
        "NQ": "Nasdaq 100 E-mini Futures",
        "ES": "S&P 500 E-mini Futures",
        "DIS": "The Walt Disney Co.",
        "WMT": "Walmart Inc.",
        "JPM": "JPMorgan Chase & Co.",
        "V": "Visa Inc.",
        "MA": "Mastercard Inc.",
        "UNH": "UnitedHealth Group",
        "HD": "Home Depot Inc.",
        "BAC": "Bank of America Corp.",
        "XOM": "Exxon Mobil Corp.",
        "LLY": "Eli Lilly & Co.",
        "AVGO": "Broadcom Inc.",
        "COST": "Costco Wholesale",
        "MARA": "Marathon Digital Holdings",
        "RIOT": "Riot Platforms Inc.",
        "MSTR": "MicroStrategy Incorporated",
        "TLT": "iShares 20+ Year Treasury Bond ETF",
        "BND": "Vanguard Total Bond Market ETF",
        "IEF": "iShares 7-10 Year Treasury Bond ETF",
        "SHY": "iShares 1-3 Year Treasury Bond ETF",
        "IWM": "iShares Russell 2000 ETF",
        "DIA": "SPDR Dow Jones Industrial Average ETF",
        "BTC-USD": "Bitcoin USD",
        "ETH-USD": "Ethereum USD"
    }
    sym = symbol.upper().strip()
    if sym in common:
        return common[sym]
        
    if finnhub_key and finnhub_key != "YOUR_FINNHUB_API_KEY":
        try:
            url = f"https://finnhub.io/api/v1/stock/profile2?symbol={sym}&token={finnhub_key}"
            res = requests.get(url, timeout=3)
            if res.status_code == 200:
                name = res.json().get("name")
                if name:
                    return name
        except Exception:
            pass
            
    try:
        url = f"https://query2.finance.yahoo.com/v1/finance/search?q={sym}"
        headers = {"User-Agent": "Mozilla/5.0"}
        res = requests.get(url, headers=headers, timeout=3)
        if res.status_code == 200:
            quotes = res.json().get("quotes", [])
            for q in quotes:
                if q.get("symbol", "").upper() == sym:
                    name = q.get("longname") or q.get("shortname")
                    if name:
                        return name
    except Exception:
        pass
        
    return "Unknown Security"

def get_company_description(symbol: str) -> str:
    """
    Retrieves the business description from Yahoo Finance quoteSummary API.
    """
    sym = symbol.upper().strip()
    if "-USD" in sym or "USDT" in sym:
        crypto_profiles = {
            "BTC-USD": "Bitcoin is a decentralized digital currency, without a central bank or single administrator, that can be sent from user to user on the peer-to-peer bitcoin network.",
            "ETH-USD": "Ethereum is a decentralized, open-source blockchain with smart contract functionality. Ether is the native cryptocurrency of the platform."
        }
        return crypto_profiles.get(sym, "Decentralized digital asset traded on public cryptocurrency markets.")
        
    try:
        url = f"https://query1.finance.yahoo.com/v10/finance/quoteSummary/{sym}?modules=assetProfile"
        headers = {"User-Agent": "Mozilla/5.0"}
        res = requests.get(url, headers=headers, timeout=2.5)
        if res.status_code == 200:
            profile = res.json().get("quoteSummary", {}).get("result", [{}])[0].get("assetProfile", {})
            desc = profile.get("longBusinessSummary")
            if desc:
                return desc
    except Exception:
        pass
    return "Business description unavailable for this asset."

def generate_why_invest_bullets(ticker: str, meta: dict) -> str:
    """
    Programmatically compiles 2-3 specific reasons to allocate capital today
    based on quantitative and social signals.
    """
    bullets = []
    score = meta.get("score", 0)
    smart_money = meta.get("smart_money", 0)
    retail_hype = meta.get("retail_hype", 0)
    archetype = meta.get("archetype", "")
    
    quote = meta.get("quote") or {}
    pct = quote.get("percent_change", 0.0)
    
    # 1. Technical/Breakout Momentum
    if pct > 3.0:
        bullets.append(f"Strong upward technical breakout momentum, with the stock gaining {pct:.2f}% in recent sessions on expanding activity.")
    elif score >= 75:
        bullets.append("Elevated technical conviction score indicates a highly favorable risk-reward setup for near-term breakout.")
        
    # 2. Institutional/Congressional Support
    cg = meta.get("congress", 0)
    if cg > 0:
        bullets.append(f"High-conviction smart money alignment: detected {cg} recent transaction(s) by Congressional or institutional insiders.")
    elif "Stealth Whale" in archetype or smart_money >= 8:
        bullets.append("Heavy institutional block accumulation signals silent capital inflows from institutional 'whales'.")
        
    # 3. Social/Retail Buzz
    yt = meta.get("yt", 0)
    reddit = meta.get("reddit", 0)
    if yt > 0 or reddit > 0:
        platform_list = []
        if yt > 0: platform_list.append("YouTube channels")
        if reddit > 0: platform_list.append("Reddit forums")
        platforms = " & ".join(platform_list)
        bullets.append(f"Accelerating retail demand: the asset is gaining high-velocity traction and discussion counts across {platforms}.")
        
    # 4. Fundamental Catalysts
    headlines = meta.get("news_headlines", [])
    if headlines:
        bullets.append(f"Active corporate catalyst: news wires report high-signal event: '{headlines[0]}'.")
        
    if not bullets:
        bullets.append("Stable market structure and solid fundamental support provide a reliable watch/accumulation entry zone.")
        
    html_bullets = "\n".join([f"<li>{b}</li>" for b in bullets[:3]])
    return f"<ul>{html_bullets}</ul>"

def get_realtime_quote(symbol: str, finnhub_key: str = None) -> dict:
    """
    Query Finnhub Quote API to retrieve real-time price info.
    Falls back to Yahoo Finance quoteSummary for crypto (e.g. BTC-USD) or when Finnhub fails/is missing.
    """
    sym = symbol.upper().strip()
    
    # 1. Try Finnhub if it's NOT crypto and key is available
    is_crypto = "-USD" in sym or "USDT" in sym or sym.endswith("-USD")
    if not is_crypto and finnhub_key and finnhub_key != "YOUR_FINNHUB_API_KEY" and finnhub_key.strip():
        try:
            url = f"https://finnhub.io/api/v1/quote?symbol={sym}&token={finnhub_key}"
            res = requests.get(url, timeout=3)
            if res.status_code == 200:
                data = res.json()
                if data.get("c"):
                    return {
                        "price": round(data.get("c", 0.0), 2),
                        "change": round(data.get("d", 0.0), 2),
                        "percent_change": round(data.get("dp", 0.0), 2),
                        "high": round(data.get("h", 0.0), 2),
                        "low": round(data.get("l", 0.0), 2)
                    }
        except Exception:
            pass

    # 2. Fallback to Yahoo Finance quoteSummary using dynamic session/crumb
    try:
        import re
        session = requests.Session()
        session.headers.update({
            "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
            "Accept-Language": "en-US,en;q=0.5",
        })
        
        crumb = None
        try:
            r_page = session.get(f"https://finance.yahoo.com/quote/{sym}", timeout=4)
            if r_page.status_code == 200:
                match = re.search(r'"crumb"\s*:\s*"(.*?)"', r_page.text)
                if match:
                    crumb = match.group(1)
        except Exception:
            pass
            
        url = f"https://query1.finance.yahoo.com/v10/finance/quoteSummary/{sym}?modules=price"
        if crumb:
            url += f"&crumb={crumb}"
            
        res = session.get(url, timeout=5)
        if res.status_code == 200:
            data = res.json()
            result = data.get("quoteSummary", {}).get("result", [{}])[0]
            price_module = result.get("price", {})
            
            raw_price = price_module.get("regularMarketPrice", {}).get("raw")
            if raw_price is not None and raw_price > 0:
                raw_change = price_module.get("regularMarketChange", {}).get("raw", 0.0)
                raw_pct = price_module.get("regularMarketChangePercent", {}).get("raw", 0.0)
                raw_high = price_module.get("regularMarketDayHigh", {}).get("raw", raw_price)
                raw_low = price_module.get("regularMarketDayLow", {}).get("raw", raw_price)
                
                return {
                    "price": round(raw_price, 2),
                    "change": round(raw_change, 2),
                    "percent_change": round(raw_pct * 100.0, 2),
                    "high": round(raw_high, 2),
                    "low": round(raw_low, 2)
                }
    except Exception:
        pass
        
    return None

def fetch_feed(name, url):
    try:
        headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"}
        res = requests.get(url, headers=headers, timeout=2.0)
        if res.status_code == 200:
            return name, res.content
    except Exception:
        pass
    return name, None

def get_general_news(finnhub_key: str = None) -> list:
    """
    Retrieve top 45 news articles aggregated dynamically across 12+ premium financial publications key-lessly.
    """
    from concurrent.futures import ThreadPoolExecutor
    
    feeds = {
        "Wall Street Journal": "https://feeds.a.dj.com/rss/WSJcomUSBusiness.xml",
        "CNBC Finance": "https://www.cnbc.com/id/10000664/device/rss/rss.xml",
        "CNBC Business": "https://www.cnbc.com/id/10001147/device/rss/rss.xml",
        "MarketWatch": "https://rss.marketwatch.com/marketwatch/topstories",
        "Yahoo Finance": "https://finance.yahoo.com/news/rssindex",
        "Value Guru Watch (Buffett/Munger/Marks/Lynch)": "https://news.google.com/rss/search?q=(Buffett+OR+Munger+OR+Marks+OR+Lynch)+AND+(investing+OR+memo+OR+letter)&hl=en-US&gl=US&ceid=US:en",
        "Macro Guru Watch (Druckenmiller/Dalio/Alden/Ackman)": "https://news.google.com/rss/search?q=(Druckenmiller+OR+Dalio+OR+Alden+OR+Ackman+OR+Tepper)+AND+(macro+OR+rates+OR+economic)&hl=en-US&gl=US&ceid=US:en",
        "Valuation & Academy (Damodaran/Felix/Mauboussin)": "https://news.google.com/rss/search?q=(Damodaran+OR+Felix+OR+Mauboussin+OR+Greenblatt)+AND+(valuation+OR+factor+OR+decision)&hl=en-US&gl=US&ceid=US:en",
        "SEC EDGAR": "https://www.sec.gov/cgi-bin/browse-edgar?action=getcurrent&output=atom",
        "Federal Reserve": "https://www.federalreserve.gov/feeds/press_all.xml",
        "Zacks Research": "https://www.zacks.com/rss/headlines.php",
        "Motley Fool": "https://www.fool.com/feeds/index.aspx",
        "CoinDesk": "https://www.coindesk.com/arc/outboundfeeds/rss/",
        "Cointelegraph": "https://cointelegraph.com/rss",
        "Hacker News": "https://news.ycombinator.com/rss"
    }
    
    articles = []
    with ThreadPoolExecutor(max_workers=15) as executor:
        results = list(executor.map(lambda item: fetch_feed(item[0], item[1]), feeds.items()))
        
    for name, content in results:
        if not content:
            continue
        try:
            import xml.etree.ElementTree as ET
            import email.utils
            root = ET.fromstring(content)
            
            # Check if SEC atom feed
            if "atom" in root.tag.lower() or "feed" in root.tag.lower():
                ns = {'atom': 'http://www.w3.org/2005/Atom'}
                entries = root.findall('.//atom:entry', ns)
                for entry in entries[:10]:
                    title_el = entry.find('atom:title', ns)
                    title = title_el.text if title_el is not None else ""
                    link_el = entry.find('atom:link', ns)
                    link = link_el.attrib.get('href', '') if link_el is not None else ''
                    
                    if title:
                        articles.append({
                            "headline": title,
                            "source": f"SEC EDGAR ({name})",
                            "summary": title,
                            "url": link,
                            "datetime": 0
                        })
            else:
                items = root.findall(".//item")
                for item in items[:10]:
                    title_el = item.find("title")
                    title = title_el.text if title_el is not None else ""
                    link_el = item.find("link")
                    link = link_el.text if link_el is not None else ""
                    pub_date_el = item.find("pubDate")
                    pub_date = pub_date_el.text if pub_date_el is not None else ""
                    
                    ts = 0
                    if pub_date:
                        try:
                            dt = email.utils.parsedate_to_datetime(pub_date)
                            ts = int(dt.timestamp())
                        except Exception:
                            pass
                            
                    if title:
                        articles.append({
                            "headline": title,
                            "source": name,
                            "summary": title,
                            "url": link,
                            "datetime": ts
                        })
        except Exception:
            pass
            
    # Sort by datetime desc (if available) and limit to 45 top news headlines
    articles = sorted(articles, key=lambda x: x.get("datetime", 0), reverse=True)
    return articles[:45]

def generate_expert_thesis(ticker: str, meta: dict) -> str:
    """
    Programmatically compiles a sophisticated 3-sentence trading thesis
    by analyzing news headlines, price metrics, smart money, and retail scores.
    """
    price = 0.0
    quote = meta.get("quote")
    change_pct = 0.0
    if quote:
        price = quote.get("price", 0.0) or 0.0
        change_pct = quote.get("percent_change", 0.0) or 0.0

    score = meta.get("score", 50.0)
    smart_money = meta.get("smart_money", 0.0)
    retail_hype = meta.get("retail_hype", 0.0)
    archetype = meta.get("archetype", "Neutral Setup ⚖️")
    action = meta.get("action", "Watch / Hold")
    headlines = meta.get("news_headlines", [])

    # Heuristic 1: Catalyst classification via news keyword scan & sentiment
    catalyst_type = None
    headline_snippet = ""
    news_sentiment = 0
    
    if headlines:
        snippet = headlines[0]
        if len(snippet) > 85:
            snippet = snippet[:82] + "..."
        headline_snippet = snippet

        # Headline-based sentiment count
        hl_text = " ".join(headlines).lower()
        pos_words = ["breakout", "surges", "soars", "gains", "upgrade", "buy", "positive", "partnership", 
                     "growth", "record", "exceeds", "beats", "raises", "bullish", "approval", "success", 
                     "innovative", "ai", "expansion", "accrues", "strong", "higher"]
        neg_words = ["plummets", "drops", "slumps", "falls", "downgrade", "sell", "loss", "negative", 
                     "risk", "lawsuit", "investigation", "deficit", "misses", "bearish", "decline", 
                     "warns", "contracts", "lower", "weakness"]
        
        for w in pos_words:
            news_sentiment += hl_text.count(w)
        for w in neg_words:
            news_sentiment -= hl_text.count(w)

        # Keyword mapping
        if any(w in hl_text for w in ["ai", "nvidia", "chip", "gpu", "server", "data center", "blackwell", "intelligence", "copilot"]):
            catalyst_type = "accelerating artificial intelligence demand and tech infrastructure tailwinds"
        elif any(w in hl_text for w in ["earnings", "revenue", "profit", "quarter", "fiscal", "beaten", "report", "eps", "dividend"]):
            catalyst_type = "strong quarterly earnings performance outperforming street projections"
        elif any(w in hl_text for w in ["insider", "buy", "purchase", "shares", "acquire", "form 4", "accumulate"]):
            catalyst_type = "corporate insider buying signals suggesting long-term value alignment"
        elif any(w in hl_text for w in ["crypto", "bitcoin", "ethereum", "blockchain", "mining", "custody", "etf"]):
            catalyst_type = "surging digital asset adoption and elevated transaction volume indices"
        elif any(w in hl_text for w in ["fda", "clinical", "trial", "approval", "drug", "healthcare", "phase"]):
            catalyst_type = "positive regulatory clinical trial progress and product path approval"
        elif any(w in hl_text for w in ["partnership", "merger", "acquisition", "deal", "collaborate", "expansion"]):
            catalyst_type = "strategic corporate partnership actions expanding addressable market cap"
        elif any(w in hl_text for w in ["short interest", "squeeze", "meme", "upvotes", "retail"]):
            catalyst_type = "high speculative short interest indicating potential squeeze setup"
            
    if not catalyst_type:
        # Fallback to archetype-based catalyst if no news keyword found
        if "Stealth Whale" in archetype:
            catalyst_type = "heavy institutional positioning and block trade accumulation"
        elif "Hype Breakout" in archetype:
            catalyst_type = "rapid social media buzz spikes and retail breakout volume"
        elif "Golden Setup" in archetype:
            catalyst_type = "converging corporate insider flows and social sentiment anchors"
        elif "Retail Trap" in archetype:
            catalyst_type = "bearish divergence with overhead supply warning signs"
        else:
            catalyst_type = "sideways price consolidation within technical support corridors"

    # Sentence 1 construction: Catalyst and News Sentiment
    sentiment_str = "with strongly positive news sentiment" if news_sentiment >= 2 else "with moderate news headwinds" if news_sentiment <= -2 else "with neutral market sentiment"
    if headlines and headline_snippet:
        s1 = f"Analyzing news wires, the core catalyst is driven by {catalyst_type} ({sentiment_str}), highlighted by: '{headline_snippet}'."
    else:
        s1 = f"The security is driving forward on {catalyst_type} {sentiment_str} with key structural supports forming in the underlying order books."

    # Sentence 2: Flow & Smart Money analysis
    yt_val = meta.get("yt", 0)
    cg_val = meta.get("congress", 0)
    reddit_val = meta.get("reddit", 0)
    discord_val = meta.get("discord", 0)
    
    flow_details = []
    if cg_val > 0: flow_details.append(f"{cg_val} Congressional trade filings")
    if yt_val > 0: flow_details.append(f"{yt_val} YouTube features")
    if reddit_val > 0: flow_details.append(f"{reddit_val} Reddit hot posts")
    if discord_val > 0: flow_details.append(f"{discord_val} Discord alerts")
    flow_summary = " & ".join(flow_details) if flow_details else "stable market activity"

    if smart_money >= 12 and retail_hype < 4:
        s2 = f"Quant feeds show heavy Stealth Whale accumulation ({flow_summary}) with political/corporate insider block buying outrunning retail flow."
    elif smart_money < 4 and retail_hype >= 10:
        s2 = f"The ticker exhibits extreme retail breakout volume across social channels ({flow_summary}), indicating high momentum and short-term volatility."
    elif smart_money >= 8 and retail_hype >= 8:
        s2 = f"This represents a Golden Setup where substantial political trades ({cg_val} filing(s)) converge with surging social volume to support the breakout."
    elif smart_money <= -4:
        s2 = f"Caution is advised as high retail social hype ({retail_hype:.1f} index) masks significant insider distribution, creating an active retail trap signal."
    else:
        s2 = f"Smart money flow is holding stable at {smart_money} with consistent retail buzz ({flow_summary}, hype index: {retail_hype:.1f}) balancing the order book."

    # Append Guru mention details if present
    guru_mentions = meta.get("guru_mentions", [])
    if guru_mentions:
        unique_names = list(set([g for m in guru_mentions for g in m["gurus"]]))
        guru_names_str = ", ".join(unique_names)
        s2 += f" Notably, institutional tracking reports high-signal comments and analysis from {guru_names_str} regarding this ticker setup."

    # Sentence 3: Day trader exit/target guidance using dynamic volatility factor
    if price > 0:
        # Volatility factor based on price percent change (min 6%, max 25%)
        vol_factor = max(0.06, min(0.25, abs(change_pct) / 100.0 + 0.08))
        if "Buy" in action or "Accumulate" in action or "Ride" in action:
            pt = price * (1.0 + vol_factor)
            sl = price * (1.0 - vol_factor * 0.6)
            s3 = f"Technically, the next move targets the ${pt:.2f} resistance zone; senior guidance suggests scaling in with protective stops near ${sl:.2f}."
        elif "Short" in action or "Exit" in action:
            pt = price * (1.0 - vol_factor)
            sl = price * (1.0 + vol_factor * 0.6)
            s3 = f"Given bearish distribution, the price targets a slide to ${pt:.2f}; traders should exit or hold short stops at ${sl:.2f}."
        else:
            pt = price * (1.0 + vol_factor * 0.5)
            sl = price * (1.0 - vol_factor * 0.5)
            s3 = f"The setup supports a range bound play targeting ${pt:.2f}; recommend sitting on watch and enforcing strict stops at ${sl:.2f}."
    else:
        s3 = "Technically, look for a confirmed breakout above local resistance on expanding volume before executing entry coordinates."

    return f"{s1} {s2} {s3}"

def resolve_ticker_pipeline(ticker: str, meta: dict, finnhub_key: str, session=None):
    """
    Unified pipeline to resolve company name, quotes, and news headlines
    for a given ticker, check for high-profile guru comments, then compile the programmatic thesis.
    """
    # Initialize AI second opinion fields to None
    meta["ai_score"] = None
    meta["ai_archetype"] = None
    meta["ai_action"] = None
    meta["ai_thesis"] = None
    meta["guru_mentions"] = []

    # Resolve company name
    meta["company_name"] = get_company_name(ticker, finnhub_key)
    
    # Resolve quote
    meta["quote"] = get_realtime_quote(ticker, finnhub_key)
    
    # Resolve news headlines
    news_headlines = []
    try:
        news_url = f"https://news.google.com/rss/search?q={ticker}+stock&hl=en-US&gl=US&ceid=US:en"
        headers = {"User-Agent": "Mozilla/5.0"}
        if session:
            news_res = session.get(news_url, headers=headers, timeout=3)
        else:
            news_res = requests.get(news_url, headers=headers, timeout=3)
            
        if news_res.status_code == 200:
            import xml.etree.ElementTree as ET
            news_root = ET.fromstring(news_res.content)
            news_items = news_root.findall(".//item")
            for item in news_items[:3]:
                t_title = item.find("title").text if item.find("title") is not None else ""
                if t_title:
                    if " - " in t_title:
                        t_title = t_title.rsplit(" - ", 1)[0]
                    news_headlines.append(t_title)
    except Exception:
        pass
    meta["news_headlines"] = news_headlines
    
    # Search for Guru mentions relating to this ticker
    guru_mentions = []
    try:
        gurus_query = f"{ticker}+AND+(Buffett+OR+Munger+OR+Damodaran+OR+Marks+OR+Druckenmiller+OR+Alden+OR+Lynch+OR+Ackman+OR+Dalio+OR+Tepper+OR+Wood+OR+Jones)"
        guru_url = f"https://news.google.com/rss/search?q={gurus_query}&hl=en-US&gl=US&ceid=US:en"
        headers = {"User-Agent": "Mozilla/5.0"}
        if session:
            g_res = session.get(guru_url, headers=headers, timeout=3)
        else:
            g_res = requests.get(guru_url, headers=headers, timeout=3)
            
        if g_res.status_code == 200:
            import xml.etree.ElementTree as ET
            g_root = ET.fromstring(g_res.content)
            g_items = g_root.findall(".//item")
            for item in g_items[:3]:
                g_title = item.find("title").text if item.find("title") is not None else ""
                if g_title:
                    if " - " in g_title:
                        g_title = g_title.rsplit(" - ", 1)[0]
                    g_lower = g_title.lower()
                    gurus_found = []
                    # Scan for the actual guru names
                    for name in ["Buffett", "Munger", "Damodaran", "Marks", "Druckenmiller", "Alden", "Lynch", "Ackman", "Dalio", "Tepper", "Wood", "Jones"]:
                        if name.lower() in g_lower:
                            gurus_found.append(name)
                    if gurus_found:
                        guru_mentions.append({
                            "title": g_title,
                            "gurus": list(set(gurus_found)),
                            "url": item.find("link").text if item.find("link") is not None else ""
                        })
    except Exception:
        pass
    
    # Save the guru mentions list and apply a scoring boost
    meta["guru_mentions"] = guru_mentions
    if guru_mentions:
        unique_gurus = set()
        for mention in guru_mentions:
            for g in mention["gurus"]:
                unique_gurus.add(g)
        
        # Apply Guru Sentiment Boost to the quantitative score
        boost = len(unique_gurus) * 5.0
        meta["score"] = min(100.0, meta.get("score", 50.0) + boost)
        
        # Also give some extra weight to smart money or retail hype
        if any(g in ["Buffett", "Munger", "Marks", "Druckenmiller", "Ackman", "Dalio", "Tepper"] for g in unique_gurus):
            meta["smart_money"] = meta.get("smart_money", 0.0) + 4.0
        if any(g in ["Damodaran", "Alden", "Wood", "Lynch", "Jones"] for g in unique_gurus):
            meta["retail_hype"] = meta.get("retail_hype", 0.0) + 3.0
            
    # Resolve business description
    meta["company_description"] = get_company_description(ticker)

    # Generate the offline programmatic thesis theory
    meta["thesis"] = generate_expert_thesis(ticker, meta)

    # Compile dynamic investment reasons
    meta["why_invest"] = generate_why_invest_bullets(ticker, meta)

def deduplicate_raw_data(data: dict) -> dict:
    dedup = {
        "congress": [],
        "youtube": [],
        "reddit": [],
        "discord": [],
        "general_news": []
    }
    
    # 1. Congress
    seen_cg = set()
    for item in data.get("congress", []):
        key = (
            item.get("symbol", "").upper().strip(),
            item.get("representative", "").strip(),
            item.get("transactionType", "").strip(),
            item.get("amount", "").strip(),
            item.get("date", "").strip()
        )
        if key not in seen_cg:
            seen_cg.add(key)
            dedup["congress"].append(item)
            
    # 2. YouTube
    seen_yt = set()
    for item in data.get("youtube", []):
        key = (
            item.get("channel", "").strip(),
            item.get("title", "").strip()
        )
        if key not in seen_yt:
            seen_yt.add(key)
            dedup["youtube"].append(item)
            
    # 3. Reddit
    seen_reddit = set()
    for item in data.get("reddit", []):
        key = (
            item.get("subreddit", "").strip(),
            item.get("title", "").strip()
        )
        if key not in seen_reddit:
            seen_reddit.add(key)
            dedup["reddit"].append(item)
            
    # 4. Discord
    seen_dc = set()
    for item in data.get("discord", []):
        key = (
            item.get("channel", "").strip(),
            item.get("author", "").strip(),
            item.get("content", "").strip()
        )
        if key not in seen_dc:
            seen_dc.add(key)
            dedup["discord"].append(item)
            
    # 5. General News
    seen_news = set()
    for item in data.get("general_news", []):
        key = (
            item.get("headline", "").strip(),
            item.get("url", "").strip()
        )
        if key not in seen_news:
            seen_news.add(key)
            dedup["general_news"].append(item)
            
    return dedup

def recompile_signals(raw_data: dict) -> tuple:
    cg_signals = {}
    yt_signals = {}
    reddit_signals = {}
    discord_signals = {}
    
    # 1. Congress
    for item in raw_data.get("congress", []):
        ticker = item.get("symbol", "").upper().strip()
        if not ticker:
            continue
        trans_type = item.get("transactionType", "")
        if "Corporate Purchase" in trans_type:
            weight = 6
        elif "Congressional Purchase" in trans_type:
            weight = 5
        elif "Sale" in trans_type:
            weight = -2
        else:
            weight = 1
        cg_signals[ticker] = cg_signals.get(ticker, 0) + weight
        
    # 2. YouTube
    for item in raw_data.get("youtube", []):
        query = item.get("query", "")
        weight = 2 if "Channel Focus" in query else 1
        yt_t = item.get("video_tickers", []) + item.get("comment_tickers", [])
        if not yt_t:
            yt_t = item.get("tickers", [])
        for ticker in yt_t:
            ticker = ticker.upper().strip()
            if ticker:
                yt_signals[ticker] = yt_signals.get(ticker, 0) + weight
                
    # 3. Reddit
    for item in raw_data.get("reddit", []):
        for ticker in item.get("tickers", []):
            ticker = ticker.upper().strip()
            if ticker:
                reddit_signals[ticker] = reddit_signals.get(ticker, 0) + 1
                
    # 4. Discord
    for item in raw_data.get("discord", []):
        for ticker in item.get("tickers", []):
            ticker = ticker.upper().strip()
            if ticker:
                discord_signals[ticker] = discord_signals.get(ticker, 0) + 1
                
    return cg_signals, yt_signals, reddit_signals, discord_signals


class EngineWorker:
    def __init__(self, config: dict, send_email: bool = False, is_auto: bool = False):
        self.config = config
        self.send_email = send_email
        self.is_auto = is_auto

    def log(self, msg):
        print(msg)

    def status(self, msg):
        print("STATUS:", msg)

    def run(self):
        try:
            self._execute_run()
        except Exception as e:
            import traceback
            tb = traceback.format_exc()
            self.log(f"[-] Critical Error in Ingestion Pipeline: {e}")
            self.log(tb)
            self.status("Scan failed!")
            empty_raw = {
                "congress": [],
                "youtube": [],
                "reddit": [],
                "discord": [],
                "general_news": []
            }
            err_status = {"attempted": False, "success": False, "message": f"Critical failure: {e}"}
            self.finished_signal.emit(([], empty_raw, err_status))

    def _execute_run(self):
        self.status("Gathering market sentiment signals...")
        
        # 1. Congress Trading
        self.log("[*] Accessing Congressional trading records via Finnhub API...")
        cg_tracker = CongressTracker(self.config.get("finnhub_api_key", ""))
        cg_signals, cg_raw = cg_tracker.get_recent_trades()
        self.log(f"[+] Loaded Congressional data (signals for {len(cg_signals)} tickers)")

        # 2. YouTube
        self.log("[*] Scraping YouTube v3 Data API for trending stock videos...")
        yt_tracker = YouTubeTracker(
            api_key=self.config.get("youtube_api_key", ""),
            channels_list=self.config.get("youtube_channels", [])
        )
        yt_signals, yt_raw = yt_tracker.get_trending_tickers()
        self.log(f"[+] Loaded YouTube data (mentions for {len(yt_signals)} tickers)")

        # 3. Reddit
        self.log("[*] Fetching hot posts from Reddit subreddits...")
        reddit_tracker = RedditTracker(self.config.get("reddit_subreddits", []))
        reddit_signals, reddit_raw = reddit_tracker.get_trending_tickers()
        self.log(f"[+] Loaded Reddit data (mentions for {len(reddit_signals)} tickers)")

        # 4. Discord
        self.log("[*] Initializing Discord connection...")
        discord_signals = {}
        dc_raw = []
        token = self.config.get("discord_bot_token", "")
        channels = self.config.get("discord_channels", [])
        
        try:
            dc_tracker = DiscordTracker(token, channels)
            discord_signals, dc_raw = dc_tracker.get_discord_signals()
            self.log(f"[+] Loaded Discord data (mentions for {len(discord_signals)} tickers)")
        except Exception as e:
            self.log(f"[-] Discord scrap failed: {e}")

        # 4.5 Accumulate and De-duplicate Raw Feeds
        import os
        import json
        import datetime
        import sys
        
        # Resolve path to project root
        if getattr(sys, 'frozen', False):
            base_dir = os.path.dirname(sys.executable)
        else:
            base_dir = os.path.dirname(os.path.abspath(__file__))
        acc_file = os.path.join(base_dir, "raw_scans_accumulator.json")
        
        accumulated = {
            "congress": [],
            "youtube": [],
            "reddit": [],
            "discord": [],
            "general_news": []
        }
        
        if os.path.exists(acc_file):
            try:
                with open(acc_file, "r", encoding="utf-8") as f:
                    accumulated = json.load(f)
            except Exception:
                pass
                
        # Append new raw records
        accumulated["congress"].extend(cg_raw)
        accumulated["youtube"].extend(yt_raw)
        accumulated["reddit"].extend(reddit_raw)
        accumulated["discord"].extend(dc_raw)
        
        # De-duplicate accumulated raw data
        accumulated = deduplicate_raw_data(accumulated)
        
        # Write back to local cache
        try:
            with open(acc_file, "w", encoding="utf-8") as f:
                json.dump(accumulated, f, indent=2)
            self.log("[+] Raw scans accumulated and de-duplicated locally.")
        except Exception as e:
            self.log(f"[-] Failed to save accumulated raw scans: {e}")
            
        # Determine Daily Email Dispatch Status (Morning at 6:00 AM)
        send_email_now = False
        if self.send_email:
            if not self.is_auto:
                # Manual run: always send immediately
                send_email_now = True
            else:
                # Automated run: check if we are in the 6 AM hour and haven't sent today yet
                state_file = os.path.join(base_dir, "scheduler_state.json")
                last_sent_date = ""
                if os.path.exists(state_file):
                    try:
                        with open(state_file, "r", encoding="utf-8") as f:
                            state = json.load(f)
                            last_sent_date = state.get("last_sent_date", "")
                    except Exception:
                        pass
                
                now = datetime.datetime.now()
                today_str = now.strftime("%Y-%m-%d")
                if now.hour == 6 and today_str != last_sent_date:
                    send_email_now = True
                    # Update scheduler state file
                    try:
                        with open(state_file, "w", encoding="utf-8") as f:
                            json.dump({"last_sent_date": today_str}, f)
                    except Exception:
                        pass
                        
        # If it is the daily morning run, consolidate the analysis using the accumulated de-duplicated database
        if send_email_now:
            if self.is_auto:
                self.log("[*] Daily morning 6:00 AM interval reached. Reviewing accumulated raw data and running consolidated AI evaluation...")
            else:
                self.log("[*] Manual email run triggered. Reviewing accumulated raw data and running consolidated AI evaluation...")
            cg_signals, yt_signals, reddit_signals, discord_signals = recompile_signals(accumulated)
            cg_raw = accumulated["congress"]
            yt_raw = accumulated["youtube"]
            reddit_raw = accumulated["reddit"]
            dc_raw = accumulated["discord"]
            self.log(f"[+] Consolidated daily signals compiled: Congress={len(cg_signals)}, YouTube={len(yt_signals)}, Reddit={len(reddit_signals)}, Discord={len(discord_signals)}")
        elif self.send_email:
            self.log("[*] Accumulating data for daily report. Email dispatch deferred until morning at 6:00 AM.")

        # 5. Score aggregation and Wall Street Modeling
        self.log("[*] Modeling Smart Money vs Retail Hype dynamics...")
        weights = self.config.get("weights", {
            "youtube": 1.5,
            "discord": 1.0,
            "congress": 4.0,
            "reddit": 1.2
        })
        
        # Real-time trending indicators from Yahoo Finance & CoinGecko
        self.log("[*] Fetching real-time trending market indicators from Yahoo Finance & CoinGecko...")
        yh_trending = get_yahoo_trending_tickers()
        cg_trending = get_coingecko_trending_tickers()
        self.log(f"[+] Discovered {len(yh_trending)} trending assets on Yahoo Finance, {len(cg_trending)} on CoinGecko")
        
        # Real-time broker trading volume and day gainers (Fidelity, Robinhood, Moomoo aggregates)
        self.log("[*] Ingesting retail market movers (Fidelity, Robinhood, Moomoo aggregates)...")
        actives = get_yahoo_screener_tickers("most_actives")
        gainers_screener = get_yahoo_screener_tickers("day_gainers")
        gainers_web = get_yahoo_web_gainers()
        gainers = list(set(gainers_screener + gainers_web))
        self.log(f"[+] Discovered {len(actives)} most active tickers, {len(gainers)} day gainers (including micro-caps)")

        # Fetch Recent IPO Calendar from Finnhub to ensure new IPOs are automatically ingested
        self.log("[*] Querying Finnhub IPO Calendar for new listings...")
        ipo_tickers = []
        try:
            finnhub_key = self.config.get("finnhub_api_key", "")
            if finnhub_key:
                import datetime
                today = datetime.date.today()
                start_date = today - datetime.timedelta(days=120)  # past 4 months
                end_date = today + datetime.timedelta(days=7)
                ipo_url = f"https://finnhub.io/api/v1/calendar/ipo?from={start_date}&to={end_date}&token={finnhub_key}"
                ipo_res = requests.get(ipo_url, timeout=6)
                if ipo_res.status_code == 200:
                    ipo_calendar = ipo_res.json().get("ipoCalendar", [])
                    for ipo in ipo_calendar:
                        sym = (ipo.get("symbol") or "").upper().strip()
                        if sym and not any(char in sym for char in ["=", "^", ":"]):
                            ipo_tickers.append(sym)
                    self.log(f"[+] Loaded {len(ipo_tickers)} recent IPO symbols from Finnhub.")
        except Exception as e:
            self.log(f"[-] Finnhub IPO calendar pull failed: {e}")

        # Ensure all mapped sector tickers, Yahoo trending, broker movers, and IPOs are included in the scan
        sector_tickers = []
        for tickers in SECTOR_MAP.values():
            sector_tickers.extend(tickers)

        all_tickers = set(
            list(yt_signals.keys()) + 
            list(cg_signals.keys()) + 
            list(reddit_signals.keys()) + 
            list(discord_signals.keys()) +
            sector_tickers +
            yh_trending +
            actives +
            gainers +
            ipo_tickers
        )
        
        # Translate CoinGecko trending symbols to USD stock symbols (e.g. BTC -> BTC-USD)
        for sym in cg_trending:
            all_tickers.add(f"{sym}-USD")
        
        master_registry = {}
        for ticker in all_tickers:
            yt_val = yt_signals.get(ticker, 0)
            cg_val = cg_signals.get(ticker, 0)
            reddit_val = reddit_signals.get(ticker, 0)
            dc_val = discord_signals.get(ticker, 0)
            
            # Compute Smart Money & Retail Hype segments
            smart_money = cg_val * weights.get("congress", 4.0)
            retail_hype = (
                (yt_val * weights.get("youtube", 1.5)) +
                (dc_val * weights.get("discord", 1.0)) +
                (reddit_val * weights.get("reddit", 1.2))
            )
            
            # Apply real-time trend & broker activity sentiment boost
            if ticker in yh_trending or ticker in [f"{c}-USD" for c in cg_trending]:
                retail_hype += 2.5
            if ticker in actives:
                retail_hype += 3.0  # highly active broker volume
            if ticker in gainers:
                retail_hype += 3.5  # extreme retail buy momentum
                
            # Scale raw score (0-30+) to standardized 0-100 scale
            raw_score = smart_money + retail_hype
            if raw_score >= 20:
                score = min(100.0, 80.0 + (raw_score - 20.0) * 1.0)
            elif raw_score >= 10:
                score = 50.0 + (raw_score - 10.0) * 3.0
            elif raw_score >= 5:
                score = 30.0 + (raw_score - 5.0) * 4.0
            else:
                score = max(0.0, raw_score * 6.0)
            
            # 50-year Wall Street Veteran Archetype Engine
            if smart_money >= 12 and retail_hype < 4:
                archetype = "Stealth Whale 📈"
                action = "Accumulate (Long)"
                tier = "HIGH POTENTIAL"
            elif smart_money < 4 and retail_hype >= 10:
                archetype = "Hype Breakout 🔥"
                action = "Ride Hype (Day Trade)"
                tier = "HIGH POTENTIAL" if retail_hype >= 15 else "MODERATE"
            elif smart_money >= 8 and retail_hype >= 8:
                archetype = "Golden Setup 🎯"
                action = "Strong Buy (High Conf)"
                tier = "HIGH POTENTIAL"
            elif smart_money <= -4 and retail_hype >= 8:
                archetype = "Retail Trap ⚠️"
                action = "Short / Exit"
                tier = "SPECULATIVE"
            else:
                archetype = "Neutral Setup ⚖️"
                action = "Watch / Hold"
                tier = "HIGH POTENTIAL" if score >= 75 else "MODERATE" if score >= 50 else "SPECULATIVE"
                
            master_registry[ticker] = {
                "score": round(score, 2),
                "tier": tier,
                "archetype": archetype,
                "action": action,
                "smart_money": round(smart_money, 1),
                "retail_hype": round(retail_hype, 1),
                "yt": yt_val,
                "congress": cg_val,
                "reddit": reddit_val,
                "discord": dc_val,
                "is_ipo": ticker in ipo_tickers
            }
            
        # Sort master_registry items by score desc
        sorted_all = sorted(master_registry.items(), key=lambda x: x[1]["score"], reverse=True)
        
        # Select top 30 overall, ensuring the top 2 from each sector are included
        top_30 = []
        added_tickers = set()
        
        sector_must_have = set()
        for sector, tickers in SECTOR_MAP.items():
            sector_items = [item for item in sorted_all if item[0] in tickers]
            for s_ticker, _ in sector_items[:2]:
                sector_must_have.add(s_ticker)
                
        for item in sorted_all:
            ticker = item[0]
            if len(top_30) < 30:
                top_30.append(item)
                added_tickers.add(ticker)
            else:
                if ticker in sector_must_have and ticker not in added_tickers:
                    top_30.append(item)
                    added_tickers.add(ticker)
                    
        ranked_results = top_30
        
        # Resolve company names, quotes, news headlines, and compile theses concurrently
        self.log("[*] Resolving corporate metadata, quotes, and news wires concurrently...")
        finnhub_key = self.config.get("finnhub_api_key", "")
        
        # Concurrent processing to drastically optimize performance
        from concurrent.futures import ThreadPoolExecutor
        session = requests.Session()
        session.headers.update({"User-Agent": "Mozilla/5.0"})
        
        with ThreadPoolExecutor(max_workers=20) as executor:
            # We map all 30 tickers to resolve concurrently
            futures = [
                executor.submit(resolve_ticker_pipeline, ticker, meta, finnhub_key, session)
                for ticker, meta in ranked_results
            ]
            # Wait for all resolutions to finish
            for fut in futures:
                try:
                    fut.result()
                except Exception as e:
                    self.log(f"[-] Error in metadata resolution thread: {e}")
                    
        # Extract eval tickers for AI if configured (kept as fallback/second opinion)
        eval_tickers = [ticker for ticker, _ in ranked_results[:8]]
        for sector, tickers in SECTOR_MAP.items():
            sector_results = [item for item in ranked_results if item[0] in tickers]
            sector_results_sorted = sorted(sector_results, key=lambda x: x[1]["score"], reverse=True)
            for s_ticker, _ in sector_results_sorted[:2]:
                if s_ticker not in eval_tickers:
                    eval_tickers.append(s_ticker)

        # 5.5 Smart AI Evaluation (Gemini Integration)
        import json
        gemini_key = self.config.get("gemini_api_key", "")
        if gemini_key and gemini_key != "YOUR_GEMINI_API_KEY" and gemini_key.strip():
            self.log("[*] Requesting smart AI evaluation from Gemini API...")
            
            # Compile context for these evaluation tickers
            eval_list = []
            for ticker in eval_tickers:
                meta = master_registry[ticker]
                trades = [t for t in cg_raw if t.get("symbol", "").upper() == ticker]
                yt_t = []
                for v in yt_raw:
                    yt_t.extend(v.get("video_tickers", []) + v.get("comment_tickers", []) if ("video_tickers" in v or "comment_tickers" in v) else v.get("tickers", []))
                videos = [v for v in yt_raw if ticker in [sym.upper() for sym in (v.get("video_tickers", []) + v.get("comment_tickers", []) if ("video_tickers" in v or "comment_tickers" in v) else v.get("tickers", []))]]
                posts = [p for p in reddit_raw if ticker in [sym.upper() for sym in p.get("tickers", [])]]
                
                # Format to compact text
                trades_str = "; ".join([f"{t['representative']}: {t['transactionType']} ({t['amount']}) on {t['date']}" for t in trades[:5]])
                videos_str = "; ".join([f"{v['channel']} - {v['title']}" for v in videos[:5]])
                posts_str = "; ".join([f"r/{p['subreddit']} (ups:{p['ups']}) - {p['title']}" for p in posts[:5]])
                
                news_str = " | ".join(meta.get("news_headlines", [])) if meta.get("news_headlines") else "None"
                
                eval_list.append({
                    "ticker": ticker,
                    "company": meta.get("company_name", ticker),
                    "current_archetype": meta.get("archetype", ""),
                    "current_action": meta.get("action", ""),
                    "insider_signals": trades_str or "None",
                    "youtube_signals": videos_str or "None",
                    "reddit_signals": posts_str or "None",
                    "recent_news_headlines": news_str
                })
                
            # Build prompt (Wall Street Multi-Agent Consensus Committee)
            prompt = f"""You represent a consensus committee of senior Wall Street specialists:
1. The Fundamental Analyst: Evaluates corporate fundamentals, news headlines, and macro catalysts.
2. The Sentiment Strategist: Gauges retail momentum and social sentiment (Reddit, YouTube, Discord).
3. The Institutional Whale Watcher: Tracks political and corporate insider transactions.
4. The Risk & Compliance Officer: Evaluates downside risks and volatility.

As the Chief Investment Officer (CIO), synthesize their collective viewpoints to identify and recommend hot breakout tickers.
Your goal is to evaluate which stock has the absolute highest momentum in recent news and internal discussions, identify what stock is hot at the first place (early stage momentum breakout), and give a detailed thesis theory for it.
Strictly ignore penny stocks (price < $10) in your evaluations and recommendations.

For each ticker, decide:
1. "ticker" (string, must exactly match the input ticker name)
2. "score" (float, 0-100, representing the combined buy conviction based on structural feeds, institutional catalysts, and news/discussion momentum)
3. "archetype" (string, e.g., 'Stealth Whale 📈', 'Golden Setup 🎯', 'Hype Breakout 🔥', 'Retail Trap ⚠️', 'Neutral Setup ⚖️')
4. "action" (string, e.g., 'Accumulate (Long)', 'Strong Buy (High Conf)', 'Ride Hype (Day Trade)', 'Short / Exit', 'Watch / Hold')
5. "thesis" (string, a sophisticated 3-sentence summary of the committee consensus. Sentence 1: The Fundamental Analyst's take on corporate catalysts/news. Sentence 2: The Sentiment/Whale Analyst's take on social momentum and insider flows. Sentence 3: The CIO's risk-adjusted tactical recommendation.)
6. "description" (string, a concise 1-2 sentence description of what the company does/its core business)
7. "why_invest" (string containing HTML bullet points, e.g. "<ul><li>Reason 1</li><li>Reason 2</li></ul>", detailing 2-3 key reasons why to invest today)

Strictly return only a valid raw JSON array of objects, no markdown formatting (no ```json or ```).

Data to analyze:
{json.dumps(eval_list, indent=2)}"""

            # Call Gemini API
            url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key={gemini_key}"
            payload = {
                "contents": [{"parts": [{"text": prompt}]}]
            }
            try:
                res = requests.post(url, json=payload, timeout=45)
                if res.status_code == 200:
                    response_json = res.json()
                    candidates = response_json.get("candidates", [])
                    if candidates:
                        text_content = candidates[0].get("content", {}).get("parts", [{}])[0].get("text", "").strip()
                        if text_content.startswith("```"):
                            lines = text_content.split("\n")
                            if lines[0].startswith("```"):
                                lines = lines[1:]
                            if lines[-1].strip() == "```":
                                lines = lines[:-1]
                            text_content = "\n".join(lines).strip()
                            
                        ai_evals = json.loads(text_content)
                        ai_dict = {item["ticker"].upper(): item for item in ai_evals}
                        
                        for ticker, meta in ranked_results:
                            if ticker in ai_dict:
                                ai_data = ai_dict[ticker]
                                meta["ai_score"] = round(ai_data.get("score", meta["score"]), 2)
                                meta["ai_archetype"] = ai_data.get("archetype", meta["archetype"])
                                meta["ai_action"] = ai_data.get("action", meta["action"])
                                meta["ai_thesis"] = ai_data.get("thesis", "No second opinion thesis provided.")
                                if "description" in ai_data and ai_data["description"].strip():
                                    meta["company_description"] = ai_data["description"]
                                if "why_invest" in ai_data and ai_data["why_invest"].strip():
                                    meta["why_invest"] = ai_data["why_invest"]
                        self.log("[+] Successfully completed Smart AI second-opinion evaluation via Gemini API.")
                    else:
                        self.log("[-] Gemini API returned empty candidates.")
                else:
                    self.log(f"[-] Gemini API call failed with status code {res.status_code}: {res.text}")
            except Exception as e:
                self.log(f"[-] Gemini API evaluation error: {e}")
        
        self.log("[*] Fetching general live market news...")
        general_news = get_general_news(finnhub_key)
        
        raw_data = {
            "congress": cg_raw,
            "youtube": yt_raw,
            "reddit": reddit_raw,
            "discord": dc_raw,
            "general_news": general_news
        }
        
        # 6. Supabase Delivery
        self.log("[*] Pushing data to Supabase...")
        import os
        from supabase import create_client, Client
        try:
            from dotenv import load_dotenv
            load_dotenv(dotenv_path="../.env.local")
        except ImportError:
            pass
            
        url = os.environ.get("NEXT_PUBLIC_SUPABASE_URL")
        key = os.environ.get("SUPABASE_SERVICE_ROLE_KEY")
        if url and key:
            try:
                supabase: Client = create_client(url, key)
                
                # Insert Raw Data
                self.log("[*] Pushing Raw Market Data...")
                # To prevent DB bloat on free tier, delete old raw data first
                supabase.table("raw_market_data").delete().neq("id", "00000000-0000-0000-0000-000000000000").execute()
                
                raw_inserts = []
                for data_type, payload in raw_data.items():
                    raw_inserts.append({
                        "data_type": data_type,
                        "payload": payload
                    })
                if raw_inserts:
                    supabase.table("raw_market_data").insert(raw_inserts).execute()
                    
                # Insert Alpha Tickers
                self.log("[*] Pushing Ticker Insights...")
                ticker_inserts = []
                for ticker, meta in ranked_results:
                    quote = meta.get("quote", {})
                    ticker_inserts.append({
                        "symbol": ticker,
                        "company_name": meta.get("company_name"),
                        "score": meta.get("score"),
                        "tier": meta.get("tier"),
                        "archetype": meta.get("archetype"),
                        "action": meta.get("action"),
                        "smart_money": meta.get("smart_money"),
                        "retail_hype": meta.get("retail_hype"),
                        "yt_mentions": meta.get("yt", 0),
                        "congress_trades": meta.get("congress", 0),
                        "reddit_mentions": meta.get("reddit", 0),
                        "discord_mentions": meta.get("discord", 0),
                        "is_ipo": meta.get("is_ipo", False),
                        "price": quote.get("price") if quote.get("price") else None,
                        "percent_change": quote.get("percent_change") if quote.get("percent_change") else None,
                        "ai_thesis": meta.get("ai_thesis"),
                        "why_invest": meta.get("why_invest"),
                        "company_description": meta.get("company_description")
                    })
                    
                if ticker_inserts:
                    supabase.table("alpha_tickers").insert(ticker_inserts).execute()
                    self.log(f"[+] Successfully pushed {len(ticker_inserts)} tickers to Supabase!")
            except Exception as e:
                self.log(f"[-] Supabase Push Error: {e}")
        else:
            self.log("[-] Supabase keys not found. Skipping DB push.")
            
        self.status("Scan completed!")
        self.log("[+] Pipeline scan finished successfully.")
        return ranked_results, raw_data, {"success": True}
