import React, { useState } from 'react';
import { 
  Target, Copy, ExternalLink, Star, Phone, MessageSquareText, 
  Trash2, ChevronDown, Flame, Search, ArrowUpDown, Filter, CheckCircle2 
} from 'lucide-react';
import { Business, PipelineStatus, LeadTier } from '../types';
import { getTierBadgeStyle } from '../utils/scoring';
import { CurrencyCode, CURRENCIES } from '../utils/currency';
import confetti from 'canvas-confetti';

interface LeadTableProps {
  leads: Business[];
  currency: CurrencyCode;
  selectedBusinessId?: string;
  onCopyCoordinates: (lat: number, lng: number) => void;
  onOpenPitch: (business: Business) => void;
  onUpdateStatus: (id: string, status: PipelineStatus) => void;
  onUpdateNotes: (id: string, notes: string) => void;
  onDeleteLead: (id: string) => void;
  onSelectOnMap: (b: Business) => void;
}

export const LeadTable: React.FC<LeadTableProps> = ({
  leads,
  currency,
  selectedBusinessId,
  onCopyCoordinates,
  onOpenPitch,
  onUpdateStatus,
  onUpdateNotes,
  onDeleteLead,
  onSelectOnMap
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [tierFilter, setTierFilter] = useState<'all' | LeadTier>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | PipelineStatus>('all');
  const [sortBy, setSortBy] = useState<'score' | 'reviews' | 'distance'>('score');

  // Filter only target businesses (lacking website)
  const targetLeads = leads.filter(b => b.status === 'NO_WEBSITE');

  const filtered = targetLeads
    .filter(b => {
      const matchesSearch = b.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            b.categoryLabel.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            b.city.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesTier = tierFilter === 'all' || b.leadTier === tierFilter;
      const matchesStatus = statusFilter === 'all' || b.pipelineStatus === statusFilter;
      return matchesSearch && matchesTier && matchesStatus;
    })
    .sort((a, b) => {
      if (sortBy === 'score') return b.leadScore - a.leadScore;
      if (sortBy === 'reviews') return b.reviewCount - a.reviewCount;
      if (sortBy === 'distance') return a.distanceKm - b.distanceKm;
      return 0;
    });

  const handleStatusChange = (id: string, newStatus: PipelineStatus) => {
    onUpdateStatus(id, newStatus);
    if (newStatus === 'won') {
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.6 }
      });
    }
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-2xl space-y-4">
      
      {/* Table Header & Controls */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        
        <div className="flex items-center gap-2">
          <Target className="w-5 h-5 text-emerald-400" />
          <div>
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              Discovered Target Leads
              <span className="text-xs bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded-full font-mono">
                {filtered.length} leads
              </span>
            </h2>
            <p className="text-xs text-slate-400">
              Businesses lacking an official website with coordinates & deal scores
            </p>
          </div>
        </div>

        {/* Filters & Search */}
        <div className="flex flex-wrap items-center gap-2">
          
          {/* Search */}
          <div className="relative min-w-[180px]">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search leads..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Tier Filter */}
          <select
            value={tierFilter}
            onChange={(e) => setTierFilter(e.target.value as any)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="all">All Tiers</option>
            <option value="HIGH_VAL">🔥 High-Value Target ($$$)</option>
            <option value="MEDIUM_VAL">⚡ Strong Lead</option>
            <option value="STANDARD">🟢 Standard Lead</option>
          </select>

          {/* Sort By */}
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-emerald-500 cursor-pointer"
          >
            <option value="score">Sort: Highest Score</option>
            <option value="reviews">Sort: Most Reviews</option>
            <option value="distance">Sort: Nearest First</option>
          </select>

        </div>

      </div>

      {/* Table / Grid */}
      {filtered.length === 0 ? (
        <div className="py-12 text-center text-slate-500 space-y-2">
          <Target className="w-10 h-10 mx-auto opacity-30" />
          <p className="text-sm font-medium">No business target leads match your current search.</p>
          <p className="text-xs text-slate-600">Run a new radar scan or adjust the filter parameters above.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            
            <thead className="text-[11px] uppercase tracking-wider text-slate-400 bg-slate-950/80 rounded-xl border-b border-slate-800">
              <tr>
                <th className="py-3 px-3 rounded-l-xl">Business Target</th>
                <th className="py-3 px-3">Exact Coordinates</th>
                <th className="py-3 px-3">Target Score</th>
                <th className="py-3 px-3">Rating / Reviews</th>
                <th className="py-3 px-3">Est. Deal Value</th>
                <th className="py-3 px-3">Pipeline Status</th>
                <th className="py-3 px-3 rounded-r-xl text-right">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y divide-slate-800/60">
              {filtered.map((biz) => {
                const tierStyle = getTierBadgeStyle(biz.leadTier);
                const isSelected = biz.id === selectedBusinessId;

                return (
                  <tr 
                    key={biz.id} 
                    className={`transition-all group ${
                      isSelected 
                        ? 'bg-emerald-950/50 border-l-4 border-emerald-400 ring-1 ring-emerald-500/30' 
                        : 'hover:bg-slate-800/40'
                    }`}
                  >
                    
                    {/* Business Name & Phone */}
                    <td className="py-3 px-3">
                      <div>
                        <button
                          onClick={() => onSelectOnMap(biz)}
                          className="font-bold text-slate-100 hover:text-emerald-400 transition-colors text-left flex items-center gap-1.5 cursor-pointer"
                        >
                          {biz.name}
                        </button>
                        <p className="text-[11px] text-slate-400 flex items-center gap-2 mt-0.5">
                          <span>{biz.categoryLabel}</span>
                          <span>•</span>
                          <span className="flex items-center gap-1 text-slate-300">
                            <Phone className="w-3 h-3 text-emerald-400" />
                            {biz.phone}
                          </span>
                        </p>
                      </div>
                    </td>

                    {/* Coordinates & Copy */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1.5 font-mono">
                        <span className="text-emerald-400 font-bold bg-slate-950 px-2 py-1 rounded border border-slate-800">
                          {biz.lat.toFixed(4)}, {biz.lng.toFixed(4)}
                        </span>
                        <button
                          onClick={() => onCopyCoordinates(biz.lat, biz.lng)}
                          className="p-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-all cursor-pointer"
                          title="Copy Coordinates"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>

                    {/* Score & Tier Badge */}
                    <td className="py-3 px-3">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full border font-semibold text-[11px] ${tierStyle.bg} ${tierStyle.text} ${tierStyle.border}`}>
                        {tierStyle.label} ({biz.leadScore}/100)
                      </span>
                    </td>

                    {/* Rating */}
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-1 font-semibold text-amber-400">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        {biz.rating}
                        <span className="text-slate-400 font-normal text-[11px]">
                          ({biz.reviewCount})
                        </span>
                      </div>
                    </td>

                    {/* Estimated Website Value */}
                    <td className="py-3 px-3 font-bold text-emerald-400 font-mono text-sm">
                      {biz.estWebsiteValue.toLocaleString()} {CURRENCIES[currency].symbol}
                    </td>

                    {/* Pipeline Status Dropdown */}
                    <td className="py-3 px-3">
                      <select
                        value={biz.pipelineStatus}
                        onChange={(e) => handleStatusChange(biz.id, e.target.value as PipelineStatus)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold focus:outline-none border cursor-pointer ${
                          biz.pipelineStatus === 'won'
                            ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                            : biz.pipelineStatus === 'contacted'
                            ? 'bg-sky-500/20 text-sky-300 border-sky-500/40'
                            : biz.pipelineStatus === 'proposal'
                            ? 'bg-purple-500/20 text-purple-300 border-purple-500/40'
                            : 'bg-slate-950 text-slate-300 border-slate-800'
                        }`}
                      >
                        <option value="new">🆕 New Lead</option>
                        <option value="contacted">📞 Contacted</option>
                        <option value="proposal">📄 Proposal Sent</option>
                        <option value="won">🎉 Closed / Won</option>
                        <option value="lost">❌ Passed</option>
                      </select>
                    </td>

                    {/* Pitch Script & Actions */}
                    <td className="py-3 px-3 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        
                        {/* Generate Sales Pitch */}
                        <button
                          onClick={() => onOpenPitch(biz)}
                          className="flex items-center gap-1 px-2.5 py-1.5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-[11px] rounded-lg transition-all cursor-pointer shadow-md shadow-emerald-500/10"
                          title="Generate Sales Pitch & Outreach Script"
                        >
                          <MessageSquareText className="w-3.5 h-3.5" />
                          Sales Pitch
                        </button>

                        {/* Open Google Maps Business Profile */}
                        <a
                          href={`https://www.google.com/maps/search/?api=1&query=${biz.lat},${biz.lng}`}
                          target="_blank"
                          rel="noreferrer"
                          className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-all"
                          title="Open Business on Google Maps"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>

                        {/* Delete */}
                        <button
                          onClick={() => onDeleteLead(biz.id)}
                          className="p-1.5 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 rounded-lg transition-all cursor-pointer"
                          title="Remove Lead"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>

                      </div>
                    </td>

                  </tr>
                );
              })}
            </tbody>

          </table>
        </div>
      )}

    </div>
  );
};
