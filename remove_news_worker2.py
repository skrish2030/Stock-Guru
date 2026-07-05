with open('scraper/engine.py', 'r', encoding='utf-8') as f:
    lines = f.readlines()

new_lines = []
skip = False
for line in lines:
    if line.startswith("class CompanyNewsWorker(QThread):"):
        skip = True
    if line.startswith("def deduplicate_raw_data("):
        skip = False
        
    if not skip:
        new_lines.append(line)

with open('scraper/engine.py', 'w', encoding='utf-8') as f:
    f.writelines(new_lines)
print("Removed CompanyNewsWorker via line iteration.")
