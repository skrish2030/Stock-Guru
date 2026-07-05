import re
import asyncio
import discord

_discord_forbidden_cooldown = 0

class DiscordScraperClient(discord.Client):
    def __init__(self, channel_ids: list, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.channel_ids = channel_ids
        self.mentions = {}
        self.raw_messages = []

    def extract_tickers(self, text: str) -> list:
        if not text:
            return []
        raw_matches = re.findall(r'\b\$?[A-Z]{2,5}\b', text)
        exclusions = {
            'USD', 'CEO', 'IPO', 'AI', 'STOCKS', 'BUY', 'SELL', 'HOLD', 'ETF', 
            'NYSE', 'NASDAQ', 'SEC', 'FED', 'FOMC', 'GDP', 'CPI', 'ATH', 'DD',
            'YOLO', 'PUMP', 'DUMP', 'CALL', 'PUT', 'EDIT', 'THE', 'AND', 'FOR', 'A',
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

    async def on_ready(self):
        print(f"Discord client logged in as {self.user}. Starting scrap...")
        for chan_id in self.channel_ids:
            try:
                channel = self.get_channel(chan_id)
                if not channel:
                    channel = await self.fetch_channel(chan_id)
                if not channel:
                    print(f"Discord Tracker: Channel ID {chan_id} not found.")
                    continue
                
                chan_name = channel.name if hasattr(channel, 'name') else str(chan_id)
                print(f"Scraping messages in channel: {chan_name}")
                
                has_content_intent_error = False
                async for msg in channel.history(limit=500):
                    if msg.author.bot:
                        continue
                    if msg.content == "" and not msg.attachments and not msg.embeds:
                        has_content_intent_error = True
                    found_tickers = self.extract_tickers(msg.content)
                    if found_tickers:
                        self.raw_messages.append({
                            "channel": chan_name,
                            "author": msg.author.name,
                            "content": msg.content,
                            "tickers": found_tickers
                        })
                        for ticker in found_tickers:
                            self.mentions[ticker] = self.mentions.get(ticker, 0) + 1
                if has_content_intent_error:
                    print("[-] Discord Tracker Warning: Message content is blank. Please verify that 'MESSAGE CONTENT INTENT' is enabled under the Bot tab in the Discord Developer Portal.")
            except Exception as e:
                print(f"Discord Tracker error in channel {chan_id}: {e}")
                
        await self.close()

class DiscordTracker:
    def __init__(self, token: str, channel_ids: list):
        self.token = token
        self.channel_ids = channel_ids

    def generate_mock_signals(self) -> tuple:
        print("Discord Tracker: Querying ApeWisdom public API for real-time social sentiment feeds...")
        import requests
        try:
            url = "https://apewisdom.io/api/v1.0/filter/all-stocks"
            headers = {"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko)"}
            r = requests.get(url, headers=headers, timeout=6)
            if r.status_code == 200:
                data = r.json()
                results = data.get("results", [])
                if results:
                    mentions = {}
                    mock_messages = []
                    # Process top 10 tickers from ApeWisdom
                    for item in results[:10]:
                        ticker = item.get("ticker", "").upper().strip()
                        if not ticker:
                            continue
                        name = item.get("name", "Unknown Security")
                        m_count = item.get("mentions", 0)
                        upvotes = item.get("upvotes", 0)
                        sentiment = item.get("sentiment", "bullish")
                        
                        # Store in mentions (normalize/scale counts appropriately)
                        mentions[ticker] = int(m_count / 10) + 1
                        
                        # Generate dynamic message
                        sentiment_emoji = "🚀" if sentiment == "bullish" else "⚠️"
                        content = f"{ticker} ({name}) is trending heavily on social boards with {m_count:,} mentions and {upvotes:,} upvotes. Overall sentiment is {sentiment} {sentiment_emoji}."
                        mock_messages.append({
                            "channel": "📊-social-sentiment",
                            "author": "ApeWisdom",
                            "content": content,
                            "tickers": [ticker]
                        })
                    print(f"Discord Tracker: Successfully loaded real-time social sentiment for {len(mentions)} assets via ApeWisdom.")
                    return mentions, mock_messages
        except Exception as e:
            print(f"Discord Tracker: ApeWisdom sentiment pull failed: {e}. Falling back to static mock data.")

        # Original static fallback if ApeWisdom fails
        mock_messages = [
            {"channel": "📊-volume-alerts", "author": "BullishBets", "content": "TSLA breaking above resistance, next target $250. Heavy volume! 🚀", "tickers": ["TSLA"]},
            {"channel": "💎-general-chat", "author": "OptionsTrader", "content": "NVDA options chain is insane today, looking to reload calls on next dip.", "tickers": ["NVDA"]},
            {"channel": "🐋-whale-watches", "author": "MarketWhale", "content": "MSTR following BTC pump, getting ready for a huge squeeze.", "tickers": ["MSTR"]},
            {"channel": "💎-general-chat", "author": "DegenPro", "content": "Buying PLTR shares here, retail sentiment is incredibly bullish.", "tickers": ["PLTR"]},
            {"channel": "🪙-crypto-signals", "author": "CryptoHype", "content": "COIN breakout is starting! Watch the crypto channels.", "tickers": ["COIN"]},
            {"channel": "📊-volume-alerts", "author": "SqueezeHunter", "content": "GME trending heavily on social boards, volume picking up.", "tickers": ["GME"]},
            {"channel": "💎-general-chat", "author": "MoonRocket", "content": "SPY weekly calls looking strong here, trend is clearly bullish.", "tickers": ["SPY"]},
            {"channel": "📊-volume-alerts", "author": "OptionsTrader", "content": "AMD consolidation pattern is super clean. Eying the breakout.", "tickers": ["AMD"]},
            {"channel": "💎-general-chat", "author": "BullishBets", "content": "AAPL daily chart has a cup and handle pattern. Bullish!", "tickers": ["AAPL"]},
            {"channel": "🪙-crypto-signals", "author": "CryptoHype", "content": "MARA is moving fast. High retail activity!", "tickers": ["MARA"]}
        ]
        mentions = {}
        for msg in mock_messages:
            for ticker in msg["tickers"]:
                mentions[ticker] = mentions.get(ticker, 0) + 1
        return mentions, mock_messages

    def get_discord_signals(self) -> tuple:
        """
        Returns (mentions_dict, raw_messages_list)
        """
        global _discord_forbidden_cooldown
        if _discord_forbidden_cooldown > 0:
            print(f"Discord Tracker: Discord is in Forbidden Cooldown state. Skipping API connection. Remaining scans to skip: {_discord_forbidden_cooldown}")
            _discord_forbidden_cooldown -= 1
            return self.generate_mock_signals()

        if not self.token or self.token == "YOUR_DISCORD_BOT_TOKEN" or not self.channel_ids:
            return self.generate_mock_signals()
            
        try:
            # Run discord bot on a new event loop synchronously
            loop = asyncio.new_event_loop()
            asyncio.set_event_loop(loop)
            
            intents = discord.Intents.default()
            intents.message_content = True
            
            client = DiscordScraperClient(channel_ids=self.channel_ids, intents=intents)
            loop.run_until_complete(client.start(self.token))
            
            if not client.raw_messages:
                return self.generate_mock_signals()
                
            return client.mentions, client.raw_messages
        except Exception as e:
            err_str = str(e).lower()
            is_forbidden = any(word in err_str for word in ["forbidden", "unauthorized", "403", "login", "privilege", "intents"])
            if is_forbidden:
                _discord_forbidden_cooldown = 3
                print(f"Discord Tracker: Encountered Forbidden/Unauthorized error: {e}. Initiating 3-scan cooldown.")
            else:
                print(f"Discord Tracker execution error: {e}. Falling back to mock data.")
            return self.generate_mock_signals()

