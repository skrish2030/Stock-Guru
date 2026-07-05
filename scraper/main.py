import os
import json
import logging
from engine import EngineWorker

logging.basicConfig(level=logging.INFO)

def main():
    config_path = "config.json"
    if not os.path.exists(config_path):
        print(f"[-] Config file {config_path} not found.")
        return
        
    try:
        with open(config_path, "r") as f:
            config = json.load(f)
    except Exception as e:
        print(f"[-] Error loading config: {e}")
        return
        
    print("[*] Initializing Headless Stock-Guru Scraping Pipeline...")
    
    worker = EngineWorker(config, send_email=False, is_auto=True)
    worker.run()
    
    print("[+] Done!")

if __name__ == "__main__":
    main()
