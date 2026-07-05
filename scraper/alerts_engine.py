#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
🎓 Alpha Pulse - Project AlertShield Scheduler Engine
Performs background notification duties for Wall Street Mentor:
1. ☀️ Morning Newsletter (06:00 AM) - Top stock recommendations and financial news headlines.
2. 🔔 Day-End Portfolio Performance Recaps (04:15 PM) - Summarizes users active returns.
3. 🚨 Real-Time Risk Monitor (Every 3 minutes) - Pushes alerts if owned assets experience sudden drops.
"""

import os
import time
import json
import smtplib
import datetime
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from supabase import create_client, Client

# Load environment configuration
SUPABASE_URL = os.environ.get("NEXT_PUBLIC_SUPABASE_URL", "https://ibeqpbrulijyttxsaiqj.supabase.co")
SUPABASE_KEY = os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY", "") # Anon/Service key
GMAIL_USER = os.environ.get("SMTP_EMAIL", "alphapulse.reports@gmail.com")
GMAIL_PASSWORD = os.environ.get("SMTP_PASSWORD", "demo_password") # Gmail app password or SMTP password
SMTP_SERVER = os.environ.get("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.environ.get("SMTP_PORT", "587"))

# Initialize Supabase
if not SUPABASE_KEY:
    print("[-] WARNING: Supabase key is missing. Please set NEXT_PUBLIC_SUPABASE_ANON_KEY.")
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY) if SUPABASE_KEY else None

def log(msg):
    timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{timestamp}] {msg}")

def send_html_email(to_email, subject, html_content):
    """
    Delivers a styled HTML email newsletter using SMTP.
    """
    if not GMAIL_USER or not GMAIL_PASSWORD or "demo" in GMAIL_PASSWORD:
        log(f"[-] EMAIL SIMULATION to {to_email}: Subject: '{subject}' (Configure SMTP_PASSWORD to send actual emails)")
        log(f"--- SIMULATED CONTENT START ---\n{html_content[:500]}...\n--- SIMULATED CONTENT END ---")
        return True

    try:
        msg = MIMEMultipart("alternative")
        msg["Subject"] = subject
        msg["From"] = f"Alpha Pulse Wall Street Mentor <{GMAIL_USER}>"
        msg["To"] = to_email

        part = MIMEText(html_content, "html")
        msg.attach(part)

        server = smtplib.SMTP(SMTP_SERVER, SMTP_PORT)
        server.starttls()
        server.login(GMAIL_USER, GMAIL_PASSWORD)
        server.sendmail(GMAIL_USER, to_email, msg.as_string())
        server.quit()
        log(f"[+] Successfully sent email to {to_email}")
        return True
    except Exception as e:
        log(f"[-] Failed to deliver email to {to_email}: {e}")
        return False

def compile_morning_briefing(email, first_name="Trader"):
    """
    Compiles the 6:00 AM Morning Market setup briefing newsletter.
    """
    try:
        # Fetch Top Recommendations (Score >= 75)
        tickers_res = supabase.table("alpha_tickers").select("*").gte("score", 75).order("score", desc=True).limit(3).execute()
        top_stocks = tickers_res.data if tickers_res else []

        # Fetch News Headlines
        news_res = supabase.table("raw_market_data").select("payload").eq("data_type", "general_news").single().execute()
        news_items = news_res.data.get("payload", []) if news_res and news_res.data else []
        top_headlines = news_items[:5]

        # Build Newsletter HTML
        stocks_html = ""
        for s in top_stocks:
            stocks_html += f"""
            <div style='background-color:#18181b; padding:15px; border-radius:8px; border:1px solid #27272a; margin-bottom:12px;'>
                <div style='display:flex; justify-content:space-between; align-items:center;'>
                    <span style='font-size:18px; font-weight:bold; color:#fafafa;'>{s.get('symbol')}</span>
                    <span style='font-size:12px; font-weight:bold; color:#fbbf24; background-color:rgba(251,191,36,0.1); padding:3px 8px; border-radius:4px;'>Conviction Score: {s.get('score')}</span>
                </div>
                <p style='color:#a1a1aa; font-size:12px; margin:5px 0;'>{s.get('company_name')} | Price: ${s.get('price')} (+{s.get('percent_change')}% change)</p>
                <blockquote style='border-left:2px solid #8b5cf6; padding-left:10px; margin:10px 0 0; color:#d4d4d8; font-style:italic; font-size:13px;'>
                    "{s.get('ai_thesis') or 'Fundamentals are locking in momentum catalysts.'}"
                </blockquote>
            </div>
            """

        news_html = ""
        for n in top_headlines:
            news_html += f"<li><a href='{n.get('url') or n.get('link') or '#'}' style='color:#8b5cf6; font-weight:bold;'>{n.get('headline')}</a> - <span style='color:#a1a1aa; font-size:12px;'>{n.get('source')}</span></li>"

        html_body = f"""
        <html>
        <body style="font-family:sans-serif; background-color:#000000; color:#fafafa; padding:20px; max-width:600px; margin:0 auto;">
            <div style="text-align:center; padding-bottom:20px; border-bottom:1px solid #27272a;">
                <h1 style="color:#38bdf8; margin:0; letter-spacing:2px; font-size:24px;">🏛️ ALPHA PULSE</h1>
                <p style="color:#8b5cf6; margin:5px 0; font-size:12px; text-transform:uppercase; font-weight:bold;">Your Wall Street Morning Briefing</p>
            </div>
            
            <p style="font-size:14px; line-height:1.6; margin-top:20px; color:#d4d4d8;">
                Good morning. Here is your <strong>6:00 AM briefing</strong>. Today, institutional buy flows (Smart Money) are concentrating on a select group of assets. Here are the hot setups you should watch today:
            </p>

            <h3 style="color:#8b5cf6; border-bottom:1px solid #27272a; padding-bottom:5px; margin-top:25px;">💡 TOP VETERAN RECOMMENDATIONS</h3>
            {stocks_html or "<p style='color:#52525b; font-style:italic;'>No high-conviction signals captured for this morning's run.</p>"}

            <h3 style="color:#38bdf8; border-bottom:1px solid #27272a; padding-bottom:5px; margin-top:30px;">📰 TOP REAL-TIME FINANCIAL HEADLINES</h3>
            <ul style="padding-left:20px; line-height:1.8; font-size:13px; color:#d4d4d8;">
                {news_html or "<li>No major news aggregates cataloged this morning.</li>"}
            </ul>

            <div style="margin-top:40px; padding:15px; border-top:1px solid #27272a; text-align:center; font-size:11px; color:#52525b;">
                <p>Alpha Pulse Investment Terminal | 40+ Years of Wall Street Wisdom</p>
                <p style="margin-top:5px;">This email is sent automatically to active Alert subscribers. To manage settings, visit your Dashboard.</p>
            </div>
        </body>
        </html>
        """
        return html_body
    except Exception as e:
        log(f"[-] Error compiling morning briefing: {e}")
        return None

def compile_day_end_report(email, holdings):
    """
    Compiles the 4:15 PM Day-End performance report for the user's registered portfolio holdings.
    """
    try:
        # Fetch current ticker prices
        tickers_res = supabase.table("alpha_tickers").select("symbol, price, percent_change").execute()
        ticker_prices = {t["symbol"]: t for t in tickers_res.data} if tickers_res else {}

        total_cost = 0.0
        total_value = 0.0
        holdings_html = ""

        for h in holdings:
            symbol = h["symbol"]
            shares = float(h["shares"])
            avg_cost = float(h["avg_cost"])
            
            cost = shares * avg_cost
            total_cost += cost

            # Calculate current performance
            current_data = ticker_prices.get(symbol, {})
            current_price = float(current_data.get("price", avg_cost))
            val = shares * current_price
            total_value += val

            gain_loss = val - cost
            pct_gain_loss = (gain_loss / cost) * 100 if cost > 0 else 0
            color = "#10b981" if gain_loss >= 0 else "#f43f5e"
            sign = "+" if gain_loss >= 0 else ""

            holdings_html += f"""
            <tr style='border-bottom:1px solid #27272a;'>
                <td style='padding:10px; font-weight:bold; color:#fafafa;'>{symbol}</td>
                <td style='padding:10px; text-align:center; color:#fafafa;'>{shares}</td>
                <td style='padding:10px; text-align:center; color:#fafafa;'>${avg_cost:.2f}</td>
                <td style='padding:10px; text-align:center; color:#38bdf8;'>${current_price:.2f}</td>
                <td style='padding:10px; text-align:right; font-weight:bold; color:{color};'>
                    {sign}${gain_loss:.2f} ({sign}{pct_gain_loss:.2f}%)
                </td>
            </tr>
            """

        total_gain_loss = total_value - total_cost
        total_pct_gain_loss = (total_gain_loss / total_cost) * 100 if total_cost > 0 else 0
        total_color = "#10b981" if total_gain_loss >= 0 else "#f43f5e"
        total_sign = "+" if total_gain_loss >= 0 else ""

        html_body = f"""
        <html>
        <body style="font-family:sans-serif; background-color:#000000; color:#fafafa; padding:20px; max-width:600px; margin:0 auto;">
            <div style="text-align:center; padding-bottom:20px; border-bottom:1px solid #27272a;">
                <h1 style="color:#38bdf8; margin:0; letter-spacing:2px; font-size:24px;">🏛️ ALPHA PULSE</h1>
                <p style="color:#8b5cf6; margin:5px 0; font-size:12px; text-transform:uppercase; font-weight:bold;">Your Portfolio Closing Summary</p>
            </div>
            
            <p style="font-size:14px; line-height:1.6; margin-top:20px; color:#d4d4d8;">
                Here is your <strong>Day-End Portfolio Report</strong>. We have calculated today's close returns for your active investments:
            </p>

            <table style="width:100%; border-collapse:collapse; font-size:13px; margin:25px 0;">
                <thead>
                  <tr style="background-color:#18181b;">
                    <th style="padding:10px; text-align:left; color:#a1a1aa; border-bottom:2px solid #27272a;">Asset</th>
                    <th style="padding:10px; text-align:center; color:#a1a1aa; border-bottom:2px solid #27272a;">Shares</th>
                    <th style="padding:10px; text-align:center; color:#a1a1aa; border-bottom:2px solid #27272a;">Avg Cost</th>
                    <th style="padding:10px; text-align:center; color:#a1a1aa; border-bottom:2px solid #27272a;">Closing Price</th>
                    <th style="padding:10px; text-align:right; color:#a1a1aa; border-bottom:2px solid #27272a;">Gain/Loss</th>
                  </tr>
                </thead>
                <tbody>
                    {holdings_html}
                </tbody>
            </table>

            <div style="background-color:#18181b; padding:15px; border-radius:8px; border:1px solid #27272a; margin-top:20px; text-align:right;">
                <span style="font-size:12px; color:#a1a1aa; uppercase; font-weight:bold; display:block;">Total Capital Value</span>
                <span style="font-size:22px; font-weight:black; color:#fafafa; display:block; margin:5px 0;">${total_value:.2f}</span>
                <span style="font-size:13px; font-weight:bold; color:{total_color};">
                    Portfolio Return: {total_sign}${total_gain_loss:.2f} ({total_sign}{total_pct_gain_loss:.2f}%)
                </span>
            </div>

            <div style="margin-top:40px; padding:15px; border-top:1px solid #27272a; text-align:center; font-size:11px; color:#52525b;">
                <p>Alpha Pulse Investment Terminal | 40+ Years of Wall Street Wisdom</p>
            </div>
        </body>
        </html>
        """
        return html_body
    except Exception as e:
        log(f"[-] Error compiling closing report: {e}")
        return None

def compile_drop_warning(email, symbol, current_price, percent_change):
    """
    Compiles an instant real-time volatility drop warning email.
    """
    html_body = f"""
    <html>
    <body style="font-family:sans-serif; background-color:#450a0a; color:#fafafa; padding:20px; max-width:600px; margin:0 auto; border-radius:10px; border:1px solid #f43f5e;">
        <div style="text-align:center; padding-bottom:15px; border-bottom:1px solid rgba(244,63,94,0.3);">
            <h1 style="color:#f43f5e; margin:0; letter-spacing:1px; font-size:24px;">🚨 RISK SHIELD ALARM</h1>
            <p style="color:#d4d4d8; margin:5px 0; font-size:11px; text-transform:uppercase;">Immediate Volatility Outflow warning</p>
        </div>
        
        <p style="font-size:14px; line-height:1.6; margin-top:20px; color:#fafafa;">
            My scanners have detected a sudden, high-volume price drop in one of your active holdings. You need to verify this layout immediately.
        </p>

        <div style="background-color:#000000; padding:20px; border-radius:8px; border:1px solid #f43f5e; text-align:center; margin:20px 0;">
            <span style="font-size:12px; color:#a1a1aa; uppercase; font-weight:bold; display:block;">Ticker Symbol</span>
            <span style="font-size:36px; font-weight:black; color:#fafafa; display:block; margin:5px 0;">{symbol}</span>
            <span style="font-size:18px; color:#f43f5e; font-weight:bold; display:block;">
                Current Price: ${current_price:.2f} ({percent_change:.2f}%)
            </span>
        </div>

        <p style="font-size:13px; line-height:1.6; color:#d4d4d8; border-left:3px solid #f43f5e; padding-left:12px; font-style:italic;">
            "Whenever we see a drop exceeding 3.0% under heavy volume, big funds are exiting. If you are a conservative investor, protect your capital. Review your exit stops or hedge into gold/inverse ETFs today."
        </p>

        <div style="margin-top:30px; text-align:center; font-size:11px; color:#a1a1aa;">
            <p>Alpha Pulse Risk Engine | 40+ Years of Wall Street Protection</p>
        </div>
    </body>
    </html>
    """
    return html_body

def run_realtime_monitors():
    """
    Checks user portfolios and sends warning alerts if any stock drops below 3.0% today.
    """
    if not supabase: return
    try:
        # 1. Fetch user alerts who want trend warnings
        users_res = supabase.table("user_alert_settings").select("email").eq("trend_alerts", True).execute()
        emails = [u["email"] for u in users_res.data] if users_res else []
        if not emails: return

        # 2. Fetch all portfolio items for these users
        portfolio_res = supabase.table("user_portfolio").select("*").in_("email", emails).execute()
        holdings = portfolio_res.data if portfolio_res else []
        if not holdings: return

        # 3. Fetch active ticker states
        tickers_res = supabase.table("alpha_tickers").select("symbol, price, percent_change").execute()
        ticker_map = {t["symbol"]: t for t in tickers_res.data} if tickers_res else {}

        # Track already notified drops during this run to avoid spamming
        sent_warnings = set()

        for h in holdings:
            symbol = h["symbol"]
            email = h["email"]
            
            ticker_data = ticker_map.get(symbol)
            if not ticker_data: continue

            pct_change = float(ticker_data.get("percent_change", 0.0))
            price = float(ticker_data.get("price", 0.0))

            # Warning Trigger: If the stock has dropped more than 3.0%
            if pct_change <= -3.0:
                key = (email, symbol)
                if key not in sent_warnings:
                    sent_warnings.add(key)
                    log(f"[🚨 WARNING] Ticker {symbol} dropped {pct_change}%. Alerting {email}...")
                    html = compile_drop_warning(email, symbol, price, pct_change)
                    send_html_email(email, f"🚨 Alpha Pulse Risk Warning: {symbol} is dropping!", html)
    except Exception as e:
        print(f"[-] Error in real-time monitor: {e}")

def run_scheduled_briefings():
    """
    Evaluates current time and fires off daily morning/evening newsletters.
    """
    if not supabase: return
    now = datetime.datetime.now()
    hour = now.hour
    minute = now.minute

    # 1. Morning Briefing: Trigger at 06:00 AM (Check only once in that minute)
    if hour == 6 and minute == 0:
        log("[☀️ SCHEDULER] Triggering 6:00 AM Morning Market Briefings...")
        users_res = supabase.table("user_alert_settings").select("email").eq("morning_briefing", True).execute()
        emails = [u["email"] for u in users_res.data] if users_res else []
        for e in emails:
            html = compile_morning_briefing(e)
            if html:
                send_html_email(e, "☀️ Alpha Pulse: Your Morning Market Setup", html)
        # Sleep to pass the minute and avoid duplicate fires
        time.sleep(60)

    # 2. Closing Day-End Report: Trigger at 16:15 PM (Market closes at 4 PM)
    elif hour == 16 and minute == 15:
        log("[🔔 SCHEDULER] Triggering 4:15 PM Closing Portfolio Reports...")
        users_res = supabase.table("user_alert_settings").select("email").eq("day_end_report", True).execute()
        emails = [u["email"] for u in users_res.data] if users_res else []
        for e in emails:
            holdings_res = supabase.table("user_portfolio").select("*").eq("email", e).execute()
            holdings = holdings_res.data if holdings_res else []
            if holdings:
                html = compile_day_end_report(e, holdings)
                if html:
                    send_html_email(e, "🔔 Alpha Pulse: Your Closing Portfolio Report", html)
        time.sleep(60)

def main():
    log("[+] Alpha Pulse AlertShield background scheduler initialized successfully.")
    log(f"[*] Ingesting from Supabase Project: {SUPABASE_URL}")
    log("[*] Risk Monitor checking every 180 seconds. Waiting for schedule schedules...")

    # Main scheduler loop
    while True:
        try:
            run_realtime_monitors()
            run_scheduled_briefings()
        except Exception as e:
            log(f"[-] Main Loop Error: {e}")
        
        # Poll/Sleep for 3 minutes
        time.sleep(180)

if __name__ == "__main__":
    main()
