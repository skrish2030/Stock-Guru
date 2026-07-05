import { Settings } from 'lucide-react';

export default function SettingsPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-[#38bdf8] mb-6 flex items-center gap-2">
        <span className="text-[#dfb86c]">⚙️</span> Pipeline Settings & Configurations
      </h1>
      
      <div className="border rounded-xl p-6 shadow-xl" style={{ backgroundColor: '#0c0f17', borderColor: '#1f2937' }}>
        <div className="max-w-2xl space-y-6">
          <div>
             <label className="block text-sm font-bold text-[#94a3b8] mb-2">Supabase Project URL</label>
             <input disabled type="text" value={process.env.NEXT_PUBLIC_SUPABASE_URL || 'Not configured'} className="w-full bg-[#070a0f] border border-[#374151] rounded-lg p-3 text-[#f8fafc] opacity-70" />
          </div>
          <div>
             <label className="block text-sm font-bold text-[#94a3b8] mb-2">Scraping Interval Strategy</label>
             <select disabled className="w-full bg-[#070a0f] border border-[#374151] rounded-lg p-3 text-[#f8fafc] opacity-70">
                <option>Manual Trigger Only</option>
                <option>Every 3 Hours</option>
                <option>End of Day</option>
             </select>
          </div>
          <div className="pt-4">
             <button disabled className="px-6 py-3 bg-[#1f2937] text-[#6b7280] font-bold rounded-lg cursor-not-allowed">
               Settings managed in backend config.json
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
