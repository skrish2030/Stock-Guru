import { Search } from 'lucide-react';

export default function ResearchPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-[#38bdf8] mb-6 flex items-center gap-2">
        <span className="text-[#a855f7]">🔍</span> Deep Research Terminal
      </h1>
      
      <div className="border rounded-xl p-10 flex flex-col items-center justify-center text-[#64748b] min-h-[400px]" style={{ backgroundColor: '#0c0f17', borderColor: '#1f2937' }}>
        <Search className="w-12 h-12 mb-4 opacity-50 text-[#a855f7]" />
        <h2 className="text-lg font-bold text-white mb-2">Research Module Standby</h2>
        <p className="text-sm italic max-w-md text-center">
          The Deep Research module requires connecting the advanced secondary scraping engine. 
          Use the command line to trigger isolated research scans on specific tickers.
        </p>
      </div>
    </div>
  );
}
