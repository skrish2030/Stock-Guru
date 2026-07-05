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

export default function Sidebar() {
  const pathname = usePathname();

  const links = [
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

  return (
    <div className="w-64 h-screen border-r flex flex-col" style={{ backgroundColor: '#000000', borderColor: '#27272a' }}>
      <div className="p-6 border-b" style={{ borderColor: '#27272a' }}>
        <h1 className="text-xl font-black tracking-widest flex items-center gap-2 text-[#38bdf8]">
          <Activity className="w-6 h-6 text-[#8b5cf6]" /> ALPHA PULSE
        </h1>
        <p className="text-[10px] text-[#52525b] mt-2 tracking-widest font-bold uppercase">Terminal V3.0 Web</p>
      </div>
      
      <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
        {links.map((link) => {
          const isActive = pathname === link.href;
          const Icon = link.icon;
          return (
            <Link
              key={link.name}
              href={link.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-bold transition-all ${
                isActive 
                  ? 'text-[#8b5cf6]' 
                  : 'text-[#a1a1aa] hover:text-[#fafafa]'
              }`}
              style={{
                backgroundColor: isActive ? '#18181b' : 'transparent',
                border: isActive ? '1px solid #27272a' : '1px solid transparent'
              }}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-[#8b5cf6]' : 'text-[#52525b]'}`} />
              {link.name}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t" style={{ borderColor: '#27272a' }}>
         <div className="flex items-center justify-between text-xs font-mono text-[#52525b]">
             <span>SYSTEM:</span>
             <span className="text-[#8b5cf6] animate-pulse">ONLINE</span>
         </div>
      </div>
    </div>
  );
}
