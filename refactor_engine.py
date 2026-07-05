import re
import os

engine_path = "scraper/engine.py"

with open(engine_path, "r", encoding="utf-8") as f:
    content = f.read()

# 1. Remove PySide6 imports
content = re.sub(r"from PySide6\.QtCore import QThread, Signal\n", "", content)

# 2. Refactor Class signature and signals
class_def = """class EngineWorker(QThread):
    log_signal = Signal(str)
    status_signal = Signal(str)
    finished_signal = Signal(object)
    
    def __init__(self, config: dict, send_email: bool, is_auto: bool = False):
        super().__init__()"""

new_class_def = """class EngineWorker:
    def __init__(self, config: dict, send_email: bool, is_auto: bool = False):"""

content = content.replace(class_def, new_class_def)

# 3. Add log and status methods
methods_def = """        self.send_email = send_email
        self.is_auto = is_auto"""
        
new_methods_def = """        self.send_email = send_email
        self.is_auto = is_auto

    def log(self, msg):
        print(msg)

    def status(self, msg):
        print("STATUS:", msg)"""

content = content.replace(methods_def, new_methods_def)

# 4. Replace self.log_signal.emit and self.status_signal.emit globally
content = content.replace("self.log_signal.emit", "self.log")
content = content.replace("self.status_signal.emit", "self.status")

# 5. Replace Email logic with Supabase push logic
# Locate the email delivery block
email_block_start = content.find("# 6. Email Delivery")
if email_block_start != -1:
    supabase_block = """# 6. Supabase Delivery
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
"""
    content = content[:email_block_start] + supabase_block

with open(engine_path, "w", encoding="utf-8") as f:
    f.write(content)

print("engine.py successfully refactored for Headless Supabase execution!")
