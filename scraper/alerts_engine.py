#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
🏛️ Alpha Pulse - Project AlertShield Scheduler Engine
Designed from the perspective of a 40+ year Wall Street Senior Market Scholar.
Provides institutional-grade single-pass alert delivery for:
1. ☀️ The Morning Briefing (--mode morning)
2. 🥪 The Mid-Day Afternoon Review (--mode afternoon)
3. 🔔 The Day-End Closing Recap (--mode evening)
4. 🚨 Real-time Drop Alerts (Runs when no mode is supplied or via local infinite loop)
"""

import os
import sys
import time
import argparse
import smtplib
import datetime
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from supabase import create_client, Client

# Load environment configs
SUPABASE_URL = os.environ.get("NEXT_PUBLIC_SUPABASE_URL", "https://ibeqpbrulijyttxsaiqj.supabase.co")
SUPABASE_KEY = os.environ.get("NEXT_PUBLIC_SUPABASE_ANON_KEY", "") 
GMAIL_USER = os.environ.get("SMTP_EMAIL", "alphapulse.reports@gmail.com")
GMAIL_PASSWORD = os.environ.get("SMTP_PASSWORD", "demo_password") 
SMTP_SERVER = os.environ.get("SMTP_SERVER", "smtp.gmail.com")
SMTP_PORT = int(os.environ.get("SMTP_PORT", "587"))

# Connect to database
supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY) if SUPABASE_KEY else None

def log(msg):
    timestamp = datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    print(f"[{timestamp}] {msg}")

def send_html_email(to_email, subject, html_content):
    """
    Delivers a premium, styled HTML email using secure SMTP tls protocols.
    """
    if not GMAIL_USER or not GMAIL_PASSWORD or "demo" in GMAIL_PASSWORD:
        log(f"[-] EMAIL SIMULATION to {to_email}: Subject: '{subject}' (Configure SMTP_PASSWORD for actual sending)")
        log(f"--- SIMULATED CONTENT START ---\n{html_content[:600]}...\n--- SIMULATED CONTENT END ---")
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

def compile_morning_briefing(email):
    """
    Compiles the 6:00 AM Morning Market Setup briefing.
    Reflects the tone of a Senior Scholar explaining today's catalyst.
    """
    try:
        # Fetch Top Recommendations (Score >= 75)
        tickers_res = supabase.table("alpha_tickers").select("*").gte("score", 75).order("score", desc=True).limit(3).execute()
        top_stocks = tickers_res.data if tickers_res else []

        # Fetch News Headlines
        news_res = supabase.table("raw_market_data").select("payload").eq("data_type", "general_news").single().execute()
        news_items = news_res.data.get("payload", []) if news_res and news_res.data else []
        top_headlines = news_items[:5]

        stocks_html = ""
        for s in top_stocks:
            stocks_html += f"""
            <div style='background-color:#09090b; padding:20px; border-radius:8px; border:1px solid #27272a; margin-bottom:15px;'>
                <div style='display:flex; justify-content:space-between; align-items:center; border-bottom:1px solid #27272a; padding-bottom:8px; margin-bottom:10px;'>
                    <span style='font-size:18px; font-weight:900; color:#fafafa; letter-spacing:1px;'>{s.get('symbol')}</span>
                    <span style='font-size:11px; font-weight:bold; color:#8b5cf6; background-color:rgba(139,92,246,0.1); padding:4px 10px; border-radius:6px; border:1px solid rgba(139,92,246,0.2);'>VETERAN SCORE: {s.get('score')}</span>
                </div>
                <p style='color:#a1a1aa; font-size:12px; margin:5px 0;'><strong>Company:</strong> {s.get('company_name')} | <strong>Latest Price:</strong> ${s.get('price'):.2f} (+{s.get('percent_change'):.2f}%)</p>
                <div style='color:#e4e4e7; font-size:13px; font-style:italic; line-height:1.6; border-left:3px solid #8b5cf6; padding-left:12px; margin-top:12px;'>
                    "{s.get('ai_thesis') or 'Fundamentals are locking in momentum catalysts.'}"
                </div>
            </div>
            """

        news_html = ""
        for n in top_headlines:
            link = n.get('url') or n.get('link') or '#'
            news_html += f"""
            <li style='margin-bottom:12px;'>
                <a href='{link}' style='color:#38bdf8; text-decoration:none; font-weight:bold; font-size:13px;'>{n.get('headline')}</a><br/>
                <span style='color:#52525b; font-size:11px;'>SOURCE: {n.get('source')}</span>
            </li>
            """

        html_body = f"""
        <html>
        <body style="font-family:sans-serif; background-color:#000000; color:#fafafa; padding:30px; max-width:600px; margin:0 auto;">
            <div style="text-align:center; padding-bottom:20px; border-bottom:1px solid #27272a;">
                <h1 style="color:#fafafa; margin:0; letter-spacing:4px; font-size:26px; font-weight:900;">🏛️ ALPHA PULSE</h1>
                <p style="color:#8b5cf6; margin:8px 0; font-size:11px; text-transform:uppercase; font-weight:black; letter-spacing:2px;">THE SENIOR SCHOLAR'S DAILY BRIEFING</p>
            </div>
            
            <p style="font-size:14px; line-height:1.7; margin-top:25px; color:#e4e4e7;">
                Good morning. This is your <strong>6:00 AM Market Briefing</strong>. After scanning overnight data streams and institutional whale transactions, I have isolated three key setups showing strong breakout potential for today's session.
            </p>

            <h3 style="color:#8b5cf6; border-bottom:1px solid #27272a; padding-bottom:8px; margin-top:35px; font-size:14px; text-transform:uppercase; letter-spacing:1px;">💡 TODAY'S HOT SETUPS</h3>
            {stocks_html or "<p style='color:#52525b; font-style:italic;'>No high-conviction signals captured for this morning's run.</p>"}

            <h3 style="color:#38bdf8; border-bottom:1px solid #27272a; padding-bottom:8px; margin-top:35px; font-size:14px; text-transform:uppercase; letter-spacing:1px;">📰 VETTING THE HEADLINES</h3>
            <ul style="padding-left:20px; color:#e4e4e7; line-height:1.6;">
                {news_html or "<li>No major news aggregates cataloged this morning.</li>"}
            </ul>

            <div style="margin-top:50px; padding-top:20px; border-top:1px solid #27272a; text-align:center; font-size:11px; color:#52525b; line-height:1.6;">
                <p><strong>Alpha Pulse Advisory</strong> | 40+ Years of Wall Street Wisdom</p>
                <p style="margin-top:5px;">This email contains proprietary consensus thesis analysis. To adjust your subscription preferences, visit your Settings Terminal.</p>
            </div>
        </body>
        </html>
        """
        return html_body
    except Exception as e:
        log(f"[-] Error compiling morning briefing: {e}")
        return None

def compile_afternoon_briefing(email, holdings):
    """
    Compiles the 12:30 PM Afternoon Portfolio Check.
    Reassuring mid-day check-in on the stocks they prefer.
    """
    try:
        # Fetch current ticker prices
        tickers_res = supabase.table("alpha_tickers").select("symbol, price, percent_change").execute()
        ticker_prices = {t["symbol"]: t for t in tickers_res.data} if tickers_res else {}

        holdings_html = ""
        for h in holdings:
            symbol = h["symbol"]
            shares = float(h["shares"])
            avg_cost = float(h["avg_cost"])
            
            cost = shares * avg_cost
            current_data = ticker_prices.get(symbol, {})
            current_price = float(current_data.get("price", avg_cost))
            val = shares * current_price

            gain_loss = val - cost
            pct_gain_loss = (gain_loss / cost) * 100 if cost > 0 else 0
            color = "#10b981" if gain_loss >= 0 else "#f43f5e"
            sign = "+" if gain_loss >= 0 else ""

            holdings_html += f"""
            <tr style='border-bottom:1px solid #27272a;'>
                <td style='padding:12px; font-weight:bold; color:#fafafa;'>{symbol}</td>
                <td style='padding:12px; text-align:center; color:#fafafa;'>{shares}</td>
                <td style='padding:12px; text-align:center; color:#a1a1aa;'>${avg_cost:.2f}</td>
                <td style='padding:12px; text-align:center; color:#38bdf8; font-weight:bold;'>${current_price:.2f}</td>
                <td style='padding:12px; text-align:right; font-weight:bold; color:{color};'>
                    {sign}${gain_loss:.2f} ({sign}{pct_gain_loss:.2f}%)
                </td>
            </tr>
            """

        html_body = f"""
        <html>
        <body style="font-family:sans-serif; background-color:#000000; color:#fafafa; padding:30px; max-width:600px; margin:0 auto;">
            <div style="text-align:center; padding-bottom:20px; border-bottom:1px solid #27272a;">
                <h1 style="color:#fafafa; margin:0; letter-spacing:4px; font-size:26px; font-weight:900;">🏛️ ALPHA PULSE</h1>
                <p style="color:#8b5cf6; margin:8px 0; font-size:11px; text-transform:uppercase; font-weight:black; letter-spacing:2px;">MID-DAY ADVISORY UPDATE</p>
            </div>
            
            <p style="font-size:14px; line-height:1.7; margin-top:25px; color:#e4e4e7;">
                Hello. This is your <strong>12:30 PM Mid-Day Check-in</strong>. I have run our mid-session scanners to inspect the performance of the stocks you prefer. Here is how your active portfolio is holding up as institutional volumes settle:
            </p>

            <table style="width:100%; border-collapse:collapse; font-size:13px; margin:25px 0;">
                <thead>
                  <tr style="background-color:#18181b; border-bottom:2px solid #27272a;">
                    <th style="padding:12px; text-align:left; color:#a1a1aa;">Asset</th>
                    <th style="padding:12px; text-align:center; color:#a1a1aa;">Shares</th>
                    <th style="padding:12px; text-align:center; color:#a1a1aa;">Avg Cost</th>
                    <th style="padding:12px; text-align:center; color:#a1a1aa;">Mid-day Price</th>
                    <th style="padding:12px; text-align:right; color:#a1a1aa;">Unrealized G/L</th>
                  </tr>
                </thead>
                <tbody>
                    {holdings_html or "<tr><td colspan='5' style='padding:20px; text-align:center; color:#52525b;'>No preferred holdings registered in settings.</td></tr>"}
                </tbody>
              </table>

            <p style="font-size:13px; line-height:1.6; color:#d4d4d8; border-left:3px solid #8b5cf6; padding-left:12px; margin-top:25px; font-style:italic;">
                "Mid-day momentum dictates the closing direction. I am watching these symbols closely in the background. If any abnormal volume or crash warnings emerge during the afternoon session, you will be notified immediately."
            </p>

            <div style="margin-top:50px; padding-top:20px; border-top:1px solid #27272a; text-align:center; font-size:11px; color:#52525b; line-height:1.6;">
                <p><strong>Alpha Pulse Advisory</strong> | 40+ Years of Wall Street Wisdom</p>
            </div>
        </body>
        </html>
        """
        return html_body
    except Exception as e:
        log(f"[-] Error compiling afternoon briefing: {e}")
        return None

def compile_day_end_report(email, holdings):
    """
    Compiles the 4:15 PM Closing Summary report.
    Authoritative Wall Street scholar layout, showing the total P&L.
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
                <td style='padding:12px; font-weight:bold; color:#fafafa;'>{symbol}</td>
                <td style='padding:12px; text-align:center; color:#fafafa;'>{shares}</td>
                <td style='padding:12px; text-align:center; color:#a1a1aa;'>${avg_cost:.2f}</td>
                <td style='padding:12px; text-align:center; color:#38bdf8; font-weight:bold;'>${current_price:.2f}</td>
                <td style='padding:12px; text-align:right; font-weight:bold; color:{color};'>
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
        <body style="font-family:sans-serif; background-color:#000000; color:#fafafa; padding:30px; max-width:600px; margin:0 auto;">
            <div style="text-align:center; padding-bottom:20px; border-bottom:1px solid #27272a;">
                <h1 style="color:#fafafa; margin:0; letter-spacing:4px; font-size:26px; font-weight:900;">🏛️ ALPHA PULSE</h1>
                <p style="color:#8b5cf6; margin:8px 0; font-size:11px; text-transform:uppercase; font-weight:black; letter-spacing:2px;">THE CLOSING PORTFOLIO STATEMENT</p>
            </div>
            
            <p style="font-size:14px; line-height:1.7; margin-top:25px; color:#e4e4e7;">
                The closing bell has rung. Here is your <strong>Closing Portfolio Report</strong> summarizing today's performance and capital equity position:
            </p>

            <table style="width:100%; border-collapse:collapse; font-size:13px; margin:25px 0;">
                <thead>
                  <tr style="background-color:#18181b; border-bottom:2px solid #27272a;">
                    <th style="padding:12px; text-align:left; color:#a1a1aa;">Asset</th>
                    <th style="padding:12px; text-align:center; color:#a1a1aa;">Shares</th>
                    <th style="padding:12px; text-align:center; color:#a1a1aa;">Avg Cost</th>
                    <th style="padding:12px; text-align:center; color:#a1a1aa;">Closing Price</th>
                    <th style="padding:12px; text-align:right; color:#a1a1aa;">Total Return</th>
                  </tr>
                </thead>
                <tbody>
                    {holdings_html or "<tr><td colspan='5' style='padding:20px; text-align:center; color:#52525b;'>No preferred holdings registered.</td></tr>"}
                </tbody>
            </table>

            <div style="background-color:#09090b; padding:20px; border-radius:8px; border:1px solid #27272a; margin-top:25px; text-align:right;">
                <span style="font-size:11px; color:#a1a1aa; text-transform:uppercase; font-weight:bold; display:block; letter-spacing:1px;">Capital Account Value</span>
                <span style="font-size:24px; font-weight:900; color:#fafafa; display:block; margin:5px 0;">${total_value:.2f}</span>
                <span style="font-size:14px; font-weight:bold; color:{total_color};">
                    Net P&L: {total_sign}${total_gain_loss:.2f} ({total_sign}{total_pct_gain_loss:.2f}%)
                </span>
            </div>

            <div style="margin-top:50px; padding-top:20px; border-top:1px solid #27272a; text-align:center; font-size:11px; color:#52525b; line-height:1.6;">
                <p><strong>Alpha Pulse Advisory</strong> | 40+ Years of Wall Street Wisdom</p>
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
    Sleek, alarming, and highly protective copy.
    """
    html_body = f"""
    <html>
    <body style="font-family:sans-serif; background-color:#450a0a; color:#fafafa; padding:30px; max-width:600px; margin:0 auto; border-radius:10px; border:2px solid #f43f5e;">
        <div style="text-align:center; padding-bottom:15px; border-bottom:1px solid rgba(244,63,94,0.3);">
            <h1 style="color:#f43f5e; margin:0; letter-spacing:2px; font-size:22px; font-weight:900;">🚨 RISK SHIELD ALARM</h1>
            <p style="color:#d4d4d8; margin:5px 0; font-size:10px; text-transform:uppercase; font-weight:bold; letter-spacing:1px;">Immediate Volatility Alert</p>
        </div>
        
        <p style="font-size:14px; line-height:1.7; margin-top:25px; color:#fafafa;">
            My risk monitors have flagged a sudden, heavy volume price drop in one of your active holdings. Downside protection is now advised.
        </p>

        <div style="background-color:#000000; padding:20px; border-radius:8px; border:1px solid #f43f5e; text-align:center; margin:25px 0;">
            <span style="font-size:11px; color:#a1a1aa; text-transform:uppercase; font-weight:bold; display:block; letter-spacing:1px;">Ticker Symbol</span>
            <span style="font-size:36px; font-weight:900; color:#fafafa; display:block; margin:5px 0;">{symbol}</span>
            <span style="font-size:18px; color:#f43f5e; font-weight:bold; display:block;">
                Current Price: ${current_price:.2f} ({percent_change:.2f}%)
            </span>
        </div>

        <div style="color:#e4e4e7; font-size:13px; line-height:1.6; border-left:3px solid #f43f5e; padding-left:12px; font-style:italic; margin:20px 0;">
            "Whenever we see a drop exceeding 3.0% under heavy institutional sell volumes, smart money is rotating out. Protect your capital. Review your stops or hedge into cash/gold/inverse ETFs immediately."
        </div>

        <div style="margin-top:40px; text-align:center; font-size:11px; color:#a1a1aa; border-top:1px solid rgba(244,63,94,0.1); padding-top:15px;">
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
        users_res = supabase.table("user_alert_settings").select("email").eq("trend_alerts", True).execute()
        emails = [u["email"] for u in users_res.data] if users_res else []
        if not emails: return

        portfolio_res = supabase.table("user_portfolio").select("*").in_("email", emails).execute()
        holdings = portfolio_res.data if portfolio_res else []
        if not holdings: return

        tickers_res = supabase.table("alpha_tickers").select("symbol, price, percent_change").execute()
        ticker_map = {t["symbol"]: t for t in tickers_res.data} if tickers_res else {}

        sent_warnings = set()

        for h in holdings:
            symbol = h["symbol"]
            email = h["email"]
            
            ticker_data = ticker_map.get(symbol)
            if not ticker_data: continue

            pct_change = float(ticker_data.get("percent_change", 0.0))
            price = float(ticker_data.get("price", 0.0))

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
    Runs in a continuous loop when locally executed to support time-based actions.
    """
    if not supabase: return
    now = datetime.datetime.now()
    hour = now.hour
    minute = now.minute

    # 1. Morning Briefing (06:00 AM)
    if hour == 6 and minute == 0:
        log("[☀️ SCHEDULER] Triggering 6:00 AM Morning Market Briefings...")
        users_res = supabase.table("user_alert_settings").select("email").eq("morning_briefing", True).execute()
        emails = [u["email"] for u in users_res.data] if users_res else []
        for e in emails:
            html = compile_morning_briefing(e)
            if html:
                send_html_email(e, "☀️ Alpha Pulse: Your Morning Market Setup", html)
        time.sleep(60)

    # 2. Afternoon Portfolio Check (12:30 PM)
    elif hour == 12 and minute == 30:
        log("[🥪 SCHEDULER] Triggering 12:30 PM Afternoon Portfolio Updates...")
        users_res = supabase.table("user_alert_settings").select("email").eq("day_end_report", True).execute()
        emails = [u["email"] for u in users_res.data] if users_res else []
        for e in emails:
            holdings_res = supabase.table("user_portfolio").select("*").eq("email", e).execute()
            holdings = holdings_res.data if holdings_res else []
            if holdings:
                html = compile_afternoon_briefing(e, holdings)
                if html:
                    send_html_email(e, "🥪 Alpha Pulse: Your Mid-Day Advisory Update", html)
        time.sleep(60)

    # 3. Closing Day-End Report (16:15 PM)
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
    parser = argparse.ArgumentParser(description="Alpha Pulse AlertShield Engine CLI")
    parser.add_argument(
        "--mode", 
        choices=["morning", "afternoon", "evening", "monitors"], 
        help="Execute a single scheduled email or monitoring run immediately, then exit."
    )
    args = parser.parse_args()

    if not supabase:
        log("[-] Error: Supabase client is not initialized. Please verify keys.")
        sys.exit(1)

    if args.mode:
        log(f"[*] CLI execution mode triggered: {args.mode}")
        if args.mode == "morning":
            users_res = supabase.table("user_alert_settings").select("email").eq("morning_briefing", True).execute()
            emails = [u["email"] for u in users_res.data] if users_res else []
            for e in emails:
                html = compile_morning_briefing(e)
                if html:
                    send_html_email(e, "☀️ Alpha Pulse: Your Morning Market Setup", html)
        
        elif args.mode == "afternoon":
            users_res = supabase.table("user_alert_settings").select("email").execute()
            emails = [u["email"] for u in users_res.data] if users_res else []
            for e in emails:
                holdings_res = supabase.table("user_portfolio").select("*").eq("email", e).execute()
                holdings = holdings_res.data if holdings_res else []
                if holdings:
                    html = compile_afternoon_briefing(e, holdings)
                    if html:
                        send_html_email(e, "🥪 Alpha Pulse: Your Mid-Day Advisory Update", html)
        
        elif args.mode == "evening":
            users_res = supabase.table("user_alert_settings").select("email").eq("day_end_report", True).execute()
            emails = [u["email"] for u in users_res.data] if users_res else []
            for e in emails:
                holdings_res = supabase.table("user_portfolio").select("*").eq("email", e).execute()
                holdings = holdings_res.data if holdings_res else []
                if holdings:
                    html = compile_day_end_report(e, holdings)
                    if html:
                        send_html_email(e, "🔔 Alpha Pulse: Your Closing Portfolio Report", html)

        elif args.mode == "monitors":
            run_realtime_monitors()

        log("[+] CLI single-pass run completed successfully. Exiting.")
        sys.exit(0)

    # Local daemon mode
    log("[+] Daemon loop mode triggered. Checking schedules every 3 minutes...")
    while True:
        try:
            run_realtime_monitors()
            run_scheduled_briefings()
        except Exception as e:
            log(f"[-] Loop Error: {e}")
        time.sleep(180)

if __name__ == "__main__":
    main()
