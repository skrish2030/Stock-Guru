"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  Activity, 
  Coins, 
  Newspaper, 
  Landmark, 
  Video, 
  MessageSquareWarning, 
  BrainCircuit, 
  Search, 
  Settings 
} from 'lucide-react';

const navItems = [
  { name: 'Overview', href: '/', icon: Activity },
  { name: 'Penny Volatility', href: '/penny', icon: Coins },
  { name: 'Live News Feed', href: '/news', icon: Newspaper },
  { name: 'Inside Track', href: '/congress', icon: Landmark },
  { name: 'YouTube Watch', href: '/youtube', icon: Video },
  { name: 'Retail Sentiment', href: '/retail', icon: MessageSquareWarning },
  { name: 'Personal Advisor', href: '/advisor', icon: BrainCircuit },
  { name: 'Deep Research', href: '/research', icon: Search },
  { name: 'Settings', href: '/settings', icon: Settings },
];

export default function Sidebar() {
  const pathname = usePathname();

  return (
    <div className="w-64 min-h-screen bg-[#070a0f] border-r border-[#1f2937] flex flex-col">
      <div className="p-6 border-b border-[#1f2937]">
        <h1 className="text-xl font-bold flex items-center gap-3 text-[#38bdf8] tracking-wider">
          <Activity className="w-6 h-6" />
          ALPHA PULSE
        </h1>
        <p className="text-[10px] text-[#64748b] mt-2 font-mono tracking-widest uppercase">
          Terminal v3.0 Web
        </p>
      </div>

      <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all duration-200 ${
                isActive
                  ? 'bg-[#0c0f17] text-[#dfb86c] border border-[#1f2937] shadow-lg'
                  : 'text-[#94a3b8] hover:bg-[#111827] hover:text-white border border-transparent'
              }`}
            >
              <Icon className={`w-5 h-5 ${isActive ? 'text-[#dfb86c]' : 'text-[#64748b]'}`} />
              {item.name}
            </Link>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-[#1f2937]">
         <div className="flex items-center justify-between text-xs font-mono text-[#64748b]">
             <span>SYSTEM:</span>
             <span className="text-[#10b981] animate-pulse">ONLINE</span>
         </div>
      </div>
    </div>
  );
}
