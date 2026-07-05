import requests
from bs4 import BeautifulSoup

class CongressTracker:
    def __init__(self, api_key: str):
        self.api_key = api_key

    def generate_mock_trades(self) -> tuple:
        print("Congress Tracker: Generating key-less mock insider & political trade filings...")
        mock_trades = [
            {"symbol": "PLTR", "representative": "CFO of Palantir Inc. (Corporate Insider)", "transactionType": "Corporate Purchase 🟢", "amount": "$85,000", "date": "2026-06-09"},
            {"symbol": "COIN", "representative": "CEO of Coinbase Inc. (Corporate Insider)", "transactionType": "Corporate Purchase 🟢", "amount": "$1,200,000", "date": "2026-06-09"},
            {"symbol": "NVDA", "representative": "Nancy Pelosi (Representative)", "transactionType": "Congressional Purchase 🟢", "amount": "$1,000,001 - $5,000,000", "date": "2026-06-08"},
            {"symbol": "MSFT", "representative": "Nancy Pelosi (Representative)", "transactionType": "Congressional Purchase 🟢", "amount": "$250,001 - $500,000", "date": "2026-06-08"},
            {"symbol": "AAPL", "representative": "Carper Thomas R. (Senator)", "transactionType": "Congressional Purchase 🟢", "amount": "$15,001 - $50,000", "date": "2026-06-07"},
            {"symbol": "TSLA", "representative": "Tuberville Tommy (Senator)", "transactionType": "Congressional Sale 🔴", "amount": "$100,001 - $250,000", "date": "2026-06-06"},
            {"symbol": "GDDY", "representative": "McCaffrey Mark (CFO)", "transactionType": "Corporate Sale 🔴", "amount": "-$290,220", "date": "2026-06-10"},
            {"symbol": "SNOW", "representative": "Kleinerman Christian (EVP)", "transactionType": "Corporate Sale 🔴", "amount": "-$652,231", "date": "2026-06-10"},
            {"symbol": "AMD", "representative": "Lummis Cynthia M. (Senator)", "transactionType": "Congressional Purchase 🟢", "amount": "$50,001 - $100,000", "date": "2026-06-05"},
            {"symbol": "SPY", "representative": "McCaul Michael T. (Representative)", "transactionType": "Congressional Purchase 🟢", "amount": "$500,001 - $1,000,000", "date": "2026-06-04"}
        ]
        
        # Sort mock trades: corporate purchases first, then congressional purchases, then sales/neutral.
        def trade_priority(trade):
            tx_type = trade.get("transactionType", "")
            if "Corporate Purchase" in tx_type:
                return 0
            elif "Corporate Trade" in tx_type:
                return 1
            elif "Congressional Purchase" in tx_type:
                return 2
            elif "Corporate Sale" in tx_type:
                return 3
            elif "Congressional Trade" in tx_type:
                return 4
            elif "Congressional Sale" in tx_type:
                return 5
            return 6

        mock_trades.sort(key=lambda x: x.get("date", ""), reverse=True)
        mock_trades.sort(key=trade_priority)

        ticker_signals = {}
        for trade in mock_trades:
            ticker = trade["symbol"]
            trans_type = trade["transactionType"]
            if "Corporate Purchase" in trans_type:
                weight = 6
            elif "Congressional Purchase" in trans_type:
                weight = 5
            elif "Sale" in trans_type:
                weight = -2
            else:
                weight = 1
            ticker_signals[ticker] = ticker_signals.get(ticker, 0) + weight
        return ticker_signals, mock_trades

    def get_recent_trades(self) -> tuple:
        """
        Returns (ticker_signals_dict, raw_trades_list)
        Always fetches corporate insider purchases from OpenInsider.
        Additionally, queries Finnhub Congressional Trades API if key is set.
        Merges both and sorts corporate purchases first.
        """
        ticker_signals = {}
        raw_trades = []

        # 1. Scrape OpenInsider for U.S. Corporate Insider Transactions
        print("Congress Tracker: Fetching real-time corporate insider disclosures from OpenInsider...")
        headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
        }
        url = "http://openinsider.com/latest-insider-purchases-25k"
        
        try:
            res = requests.get(url, headers=headers, timeout=10)
            if res.status_code == 200:
                soup = BeautifulSoup(res.content, 'html.parser')
                table = soup.find(class_="tinytable")
                if table:
                    tbody = table.find('tbody')
                    rows = tbody.find_all('tr') if tbody else table.find_all('tr')[1:]
                    
                    # Take the top 30 transactions
                    for row in rows[:30]:
                        cols = [c.text.strip() for c in row.find_all('td')]
                        if len(cols) >= 13:
                            filing_date = cols[1]
                            ticker = cols[3].upper()
                            insider = cols[5]
                            title = cols[6]
                            trade_type = cols[7]
                            value = cols[12]
                            
                            rep_name = f"{insider} ({title})"
                            
                            trade_type_lower = trade_type.lower()
                            if "purchase" in trade_type_lower:
                                weight = 6
                                trans_type = "Corporate Purchase 🟢"
                            elif "sale" in trade_type_lower:
                                weight = -2
                                trans_type = "Corporate Sale 🔴"
                            else:
                                weight = 1
                                trans_type = "Corporate Trade ⚖️"
                                
                            ticker_signals[ticker] = ticker_signals.get(ticker, 0) + weight
                            
                            raw_trades.append({
                                "symbol": ticker,
                                "representative": rep_name,
                                "transactionType": trans_type,
                                "amount": value,
                                "date": filing_date
                            })
                    print(f"Congress Tracker: Successfully parsed {len(raw_trades)} real-time corporate insider filings.")
                else:
                    print("Congress Tracker: Failed to parse OpenInsider table class.")
            else:
                print(f"Congress Tracker: OpenInsider returned status code {res.status_code}")
        except Exception as e:
            print(f"Congress Tracker: Failed to scrape OpenInsider: {e}")

        # 2. Try Finnhub Congressional API if key is set
        if self.api_key and self.api_key != "YOUR_FINNHUB_API_KEY" and self.api_key.strip():
            url = f"https://finnhub.io/api/v1/stock/congressional-trading?token={self.api_key}"
            try:
                print("Congress Tracker: Querying Finnhub Congressional Trades API...")
                response = requests.get(url, timeout=6)
                if response.status_code == 200:
                    data = response.json()
                    trades_data = data.get("data", [])
                    if trades_data:
                        added_count = 0
                        for trade in trades_data[:30]:
                            ticker = trade.get("symbol")
                            if not ticker:
                                continue
                            ticker = ticker.upper()
                            trans_type = trade.get("transactionType", "")
                            rep_name = trade.get("name", "Unknown")
                            amount = trade.get("amount", "Unknown Amount")
                            date = trade.get("transactionDate", "Unknown Date")
                            
                            trans_type_lower = trans_type.lower()
                            if "purchase" in trans_type_lower:
                                weight = 5
                                trans_type_formatted = "Congressional Purchase 🟢"
                            elif "sale" in trans_type_lower or "exchange" in trans_type_lower:
                                weight = -2
                                trans_type_formatted = "Congressional Sale 🔴"
                            else:
                                weight = 1
                                trans_type_formatted = "Congressional Trade ⚖️"
                                
                            ticker_signals[ticker] = ticker_signals.get(ticker, 0) + weight
                            raw_trades.append({
                                "symbol": ticker,
                                "representative": f"{rep_name} (Representative/Senator)",
                                "transactionType": trans_type_formatted,
                                "amount": amount,
                                "date": date
                            })
                            added_count += 1
                        print(f"Congress Tracker: Successfully parsed {added_count} Congressional trade filings.")
                else:
                    print(f"Congress Tracker: Finnhub API returned code {response.status_code}.")
            except Exception as e:
                print(f"Congress Tracker: Finnhub API connection failed: {e}")

        # 3. Sort/prioritize raw_trades: corporate purchases first, then corporate trades, then congressional purchases, etc.
        def trade_priority(trade):
            tx_type = trade.get("transactionType", "")
            if "Corporate Purchase" in tx_type:
                return 0
            elif "Corporate Trade" in tx_type:
                return 1
            elif "Congressional Purchase" in tx_type:
                return 2
            elif "Corporate Sale" in tx_type:
                return 3
            elif "Congressional Trade" in tx_type:
                return 4
            elif "Congressional Sale" in tx_type:
                return 5
            return 6

        # Stable sort: date descending first, then priority ascending
        raw_trades.sort(key=lambda x: x.get("date", ""), reverse=True)
        raw_trades.sort(key=trade_priority)

        if not raw_trades:
            return self.generate_mock_trades()
            
        return ticker_signals, raw_trades
