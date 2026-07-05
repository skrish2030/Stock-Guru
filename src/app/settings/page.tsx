"use client";

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { Settings, Mail, Bell, ShieldAlert, ShieldCheck, Trash2, Plus, Calendar, Coins } from 'lucide-react';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';
const supabase = createClient(supabaseUrl, supabaseKey);

interface AlertSettings {
  email: string;
  morning_briefing: boolean;
  day_end_report: boolean;
  trend_alerts: boolean;
}

interface PortfolioItem {
  id?: string;
  email: string;
  symbol: string;
  shares: number;
  avg_cost: number;
}

export default function SettingsPage() {
  const [email, setEmail] = useState('');
  const [morning, setMorning] = useState(true);
  const [dayEnd, setDayEnd] = useState(true);
  const [trendAlerts, setTrendAlerts] = useState(true);
  
  const [portfolio, setPortfolio] = useState<PortfolioItem[]>([]);
  const [newSymbol, setNewSymbol] = useState('');
  const [newShares, setNewShares] = useState('');
  const [newCost, setNewCost] = useState('');
  
  const [dbError, setDbError] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // Try to load configurations once email is typed or stored
  useEffect(() => {
    const savedEmail = localStorage.getItem('alert_email');
    if (savedEmail) {
      setEmail(savedEmail);
      loadConfig(savedEmail);
    }
  }, []);

  const loadConfig = async (emailToLoad: string) => {
    if (!supabaseUrl) return;
    try {
      setLoading(true);
      // Fetch settings
      const { data: settings, error: sError } = await supabase
        .from('user_alert_settings')
        .select('*')
        .eq('email', emailToLoad)
        .single();
        
      if (sError) {
        console.warn("No settings found or tables not migrated yet.");
        if (sError.message?.includes("relation") || sError.message?.includes("does not exist")) {
          setDbError(true);
        }
      } else if (settings) {
        setMorning(settings.morning_briefing);
        setDayEnd(settings.day_end_report);
        setTrendAlerts(settings.trend_alerts);
      }

      // Fetch portfolio
      const { data: portItems } = await supabase
        .from('user_portfolio')
        .select('*')
        .eq('email', emailToLoad);
      
      if (portItems) {
        setPortfolio(portItems);
      }
      setDbError(false);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    
    setLoading(true);
    setSuccessMsg('');
    localStorage.setItem('alert_email', email);

    try {
      const { error } = await supabase
        .from('user_alert_settings')
        .upsert({
          email,
          morning_briefing: morning,
          day_end_report: dayEnd,
          trend_alerts: trendAlerts
        });

      if (error) {
        console.error(error);
        alert("Failed to save settings. Please verify you ran scripts/migration_alerts.sql in Supabase SQL editor!");
      } else {
        setSuccessMsg("Settings updated successfully!");
        loadConfig(email);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleAddHolding = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !newSymbol || !newShares || !newCost) {
      alert("Please configure your alert email and fill out all stock details.");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase
        .from('user_portfolio')
        .insert({
          email,
          symbol: newSymbol.toUpperCase().trim(),
          shares: parseFloat(newShares),
          avg_cost: parseFloat(newCost)
        });

      if (error) {
        console.error(error);
        alert("Failed to add holding. Ensure the alert email is registered first.");
      } else {
        setNewSymbol('');
        setNewShares('');
        setNewCost('');
        loadConfig(email);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteHolding = async (id: string) => {
    if (!confirm("Are you sure you want to delete this holding?")) return;
    setLoading(true);
    try {
      const { error } = await supabase
        .from('user_portfolio')
        .delete()
        .eq('id', id);

      if (error) {
        console.error(error);
      } else {
        loadConfig(email);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <h1 className="text-2xl font-bold text-[#38bdf8] mb-6 flex items-center gap-2">
        <span className="text-[#8b5cf6]">⚙️</span> Wall Street Alert Terminal & Portfolio Watcher
      </h1>

      {dbError && (
        <div className="border border-red-500 bg-red-950/20 text-red-400 p-4 rounded-xl text-sm leading-relaxed">
          <strong>⚠️ Tables Missing:</strong> The database tables `user_alert_settings` and `user_portfolio` do not exist in your Supabase project. 
          Please copy the SQL statements in <code className="bg-red-950 p-1 rounded font-mono">scripts/migration_alerts.sql</code> and run them in your Supabase SQL Editor.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left: Email Configurations */}
        <div className="border rounded-xl p-6 shadow-2xl space-y-6 flex flex-col justify-between" style={{ backgroundColor: '#09090b', borderColor: '#27272a' }}>
          <div>
            <h2 className="text-lg font-bold text-[#fafafa] flex items-center gap-2 mb-4">
              <Mail className="text-[#8b5cf6]" /> Email Notification Settings
            </h2>
            <p className="text-xs text-[#a1a1aa] mb-6 leading-relaxed">
              We send updates directly to your inbox so you never miss a market move. Provide your email below and configure your subscription alerts.
            </p>

            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-[#a1a1aa] mb-1">Your Notification Email:</label>
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@example.com"
                  className="w-full bg-[#000000] border border-[#27272a] rounded-lg p-3 text-[#fafafa] text-sm focus:outline-none focus:border-[#8b5cf6]"
                  required
                />
              </div>

              {/* Alert Toggle Tickers */}
              <div className="space-y-3 pt-2">
                <label className="flex items-center gap-3 cursor-pointer text-sm text-[#d4d4d8]">
                  <input 
                    type="checkbox" 
                    checked={morning}
                    onChange={(e) => setMorning(e.target.checked)}
                    className="w-4 h-4 rounded accent-[#8b5cf6]"
                  />
                  <span>☀️ Send 6 AM Morning Briefing (Potential stock picks & top headlines)</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer text-sm text-[#d4d4d8]">
                  <input 
                    type="checkbox" 
                    checked={dayEnd}
                    onChange={(e) => setDayEnd(e.target.checked)}
                    className="w-4 h-4 rounded accent-[#8b5cf6]"
                  />
                  <span>🔔 Send Day-End Performance Report (Recap of your active holdings)</span>
                </label>

                <label className="flex items-center gap-3 cursor-pointer text-sm text-[#d4d4d8]">
                  <input 
                    type="checkbox" 
                    checked={trendAlerts}
                    onChange={(e) => setTrendAlerts(e.target.checked)}
                    className="w-4 h-4 rounded accent-[#8b5cf6]"
                  />
                  <span>🚨 Send Instant Drop Warnings (Alert me if owned stocks crash &gt; 3%)</span>
                </label>
              </div>

              <div className="pt-4 flex items-center justify-between">
                <button 
                  type="submit" 
                  className="px-6 py-3 rounded-lg font-bold text-sm bg-gradient-to-r from-[#8b5cf6] to-[#6d28d9] text-white hover:opacity-90 transition-opacity"
                  disabled={loading}
                >
                  {loading ? 'Saving...' : 'Save Settings'}
                </button>
                {successMsg && <span className="text-xs text-[#10b981] font-semibold">{successMsg}</span>}
              </div>
            </form>
          </div>
        </div>

        {/* Right: Portfolio Ingestion */}
        <div className="border rounded-xl p-6 shadow-2xl flex flex-col justify-between" style={{ backgroundColor: '#09090b', borderColor: '#27272a' }}>
          <div>
            <h2 className="text-lg font-bold text-[#fafafa] flex items-center gap-2 mb-4">
              <Coins className="text-[#8b5cf6]" /> Manage Your Holdings
            </h2>
            <p className="text-xs text-[#a1a1aa] mb-6 leading-relaxed">
              Add the stocks you currently own. The system will watch over these assets and notify you of any sudden drops or end-of-day returns.
            </p>

            <form onSubmit={handleAddHolding} className="grid grid-cols-3 gap-2 items-end mb-6">
              <div>
                <label className="block text-[10px] uppercase font-bold text-[#a1a1aa] mb-1">Symbol:</label>
                <input 
                  type="text" 
                  value={newSymbol}
                  onChange={(e) => setNewSymbol(e.target.value)}
                  placeholder="AAPL"
                  className="w-full bg-[#000000] border border-[#27272a] rounded-lg p-2 text-[#fafafa] text-sm uppercase focus:outline-none focus:border-[#8b5cf6]"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-[#a1a1aa] mb-1">Shares:</label>
                <input 
                  type="number" 
                  step="any"
                  value={newShares}
                  onChange={(e) => setNewShares(e.target.value)}
                  placeholder="10"
                  className="w-full bg-[#000000] border border-[#27272a] rounded-lg p-2 text-[#fafafa] text-sm focus:outline-none focus:border-[#8b5cf6]"
                  required
                />
              </div>
              <div>
                <label className="block text-[10px] uppercase font-bold text-[#a1a1aa] mb-1">Avg Cost ($):</label>
                <input 
                  type="number" 
                  step="any"
                  value={newCost}
                  onChange={(e) => setNewCost(e.target.value)}
                  placeholder="182.50"
                  className="w-full bg-[#000000] border border-[#27272a] rounded-lg p-2 text-[#fafafa] text-sm focus:outline-none focus:border-[#8b5cf6]"
                  required
                />
              </div>
              <button 
                type="submit" 
                className="col-span-3 py-2 rounded-lg font-bold text-xs bg-[#27272a] hover:bg-[#3f3f46] text-[#fafafa] transition-colors flex items-center justify-center gap-1 mt-2"
                disabled={loading}
              >
                <Plus className="w-4 h-4" /> Add Asset to Portfolio
              </button>
            </form>

            <div className="overflow-x-auto rounded-lg border border-[#27272a] max-h-[220px]">
              <table className="w-full text-left text-xs whitespace-nowrap">
                <thead>
                  <tr className="bg-[#18181b]">
                    <th className="p-2.5 font-bold text-[#a1a1aa] border-b border-[#27272a]">Asset</th>
                    <th className="p-2.5 font-bold text-[#a1a1aa] border-b border-[#27272a] text-center">Shares</th>
                    <th className="p-2.5 font-bold text-[#a1a1aa] border-b border-[#27272a] text-center">Avg Cost</th>
                    <th className="p-2.5 font-bold text-[#a1a1aa] border-b border-[#27272a] text-center">Total Cost</th>
                    <th className="p-2.5 font-bold text-[#a1a1aa] border-b border-[#27272a] text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#27272a]">
                  {portfolio.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="p-4 text-center text-[#52525b] italic">No active holdings tracked.</td>
                    </tr>
                  ) : (
                    portfolio.map((item) => (
                      <tr key={item.id} className="bg-[#000000] hover:bg-[#18181b] transition-colors">
                        <td className="p-2.5 font-bold text-[#fafafa]">{item.symbol}</td>
                        <td className="p-2.5 text-center text-[#fafafa]">{item.shares}</td>
                        <td className="p-2.5 text-center text-[#fafafa]">${item.avg_cost.toFixed(2)}</td>
                        <td className="p-2.5 text-center text-[#10b981] font-bold">
                          ${(item.shares * item.avg_cost).toFixed(2)}
                        </td>
                        <td className="p-2.5 text-center">
                          <button 
                            onClick={() => item.id && handleDeleteHolding(item.id)}
                            className="text-red-400 hover:text-red-300 p-1"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
