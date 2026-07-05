import os
import json

import sys

# Resolve absolute path to the directory containing the executable or script
if getattr(sys, 'frozen', False):
    # Running in a PyInstaller bundle
    base_dir = os.path.dirname(sys.executable)
else:
    # Running in normal Python environment
    base_dir = os.path.dirname(os.path.abspath(__file__))

CONFIG_PATH = os.path.join(base_dir, "config.json")


DEFAULT_CONFIG = {
    "gemini_api_key": "YOUR_GEMINI_API_KEY",
    "youtube_api_key": "YOUR_YOUTUBE_API_KEY",
    "discord_bot_token": "YOUR_DISCORD_BOT_TOKEN",
    "finnhub_api_key": "YOUR_FINNHUB_API_KEY",
    "discord_channels": [123456789012345678],
    "smtp_server": "smtp.gmail.com",
    "smtp_port": 587,
    "sender_email": "your_email@gmail.com",
    "sender_password": "your_app_password",
    "recipient_email": "target_email@gmail.com",
    "reddit_subreddits": ["wallstreetbets", "stocks", "options"],
    "youtube_channels": [
        "The Plain Bagel",
        "Sven Carlin",
        "Everything Money",
        "Joseph Carlson",
        "Ben Felix",
        "ClearValue Tax",
        "tastytrade",
        "Investor's Business Daily",
        "Unrivaled Investing",
        "Learn to Invest",
        "Focused Compounding",
        "Graham Stephan",
        "Andrei Jikh",
        "Warrior Trading"
    ],
    "weights": {
        "youtube": 1.5,
        "discord": 1.0,
        "congress": 4.0,
        "reddit": 1.2
    },
    "auto_scan_3h": True,
    "scan_interval_minutes": 10
}

def load_config():
    if not os.path.exists(CONFIG_PATH):
        save_config(DEFAULT_CONFIG)
        return DEFAULT_CONFIG
    try:
        with open(CONFIG_PATH, "r", encoding="utf-8") as f:
            config = json.load(f)
            # Ensure all default keys exist in case of partial configs
            updated = False
            for k, v in DEFAULT_CONFIG.items():
                if k not in config:
                    config[k] = v
                    updated = True
            if "weights" in config:
                for wk, wv in DEFAULT_CONFIG["weights"].items():
                    if wk not in config["weights"]:
                        config["weights"][wk] = wv
                        updated = True
            if updated:
                save_config(config)
            return config
    except Exception as e:
        print(f"Error loading config.json: {e}")
        return DEFAULT_CONFIG

def save_config(config):
    try:
        with open(CONFIG_PATH, "w", encoding="utf-8") as f:
            json.dump(config, f, indent=4)
        return True
    except Exception as e:
        print(f"Error saving config.json: {e}")
        return False
