import re
with open('scraper/engine.py', 'r', encoding='utf-8') as f:
    content = f.read()

# Replace the whole class definition with an empty string
# Match from class CompanyNewsWorker(QThread): down to def resolve_ticker_pipeline(ticker, meta, finnhub_key, session):
pattern = r"class CompanyNewsWorker\(QThread\):.*?def resolve_ticker_pipeline"
content = re.sub(pattern, "def resolve_ticker_pipeline", content, flags=re.DOTALL)

with open('scraper/engine.py', 'w', encoding='utf-8') as f:
    f.write(content)
print("Removed CompanyNewsWorker")
