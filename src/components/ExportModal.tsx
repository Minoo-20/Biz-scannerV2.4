import React, { useState } from 'react';
import { X, Download, FileSpreadsheet, FileCode, Check } from 'lucide-react';
import { Business } from '../types';

interface ExportModalProps {
  leads: Business[];
  onClose: () => void;
}

export const ExportModal: React.FC<ExportModalProps> = ({ leads, onClose }) => {
  const targetLeads = leads.filter(b => b.status === 'NO_WEBSITE');
  const [format, setFormat] = useState<'csv' | 'json'>('csv');
  const [downloaded, setDownloaded] = useState(false);

  const handleDownload = () => {
    if (format === 'csv') {
      const headers = ['Business Name', 'Category', 'Phone', 'Latitude', 'Longitude', 'City', 'Address', 'Rating', 'Reviews', 'Lead Score', 'Lead Tier', 'Est Website Value ($)', 'Pipeline Status'];
      const rows = targetLeads.map(b => [
        `"${b.name.replace(/"/g, '""')}"`,
        `"${b.categoryLabel}"`,
        `"${b.phone}"`,
        b.lat,
        b.lng,
        `"${b.city}"`,
        `"${b.address.replace(/"/g, '""')}"`,
        b.rating,
        b.reviewCount,
        b.leadScore,
        b.leadTier,
        b.estWebsiteValue,
        b.pipelineStatus
      ]);

      const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const encodedUri = encodeURI(csvContent);
      const link = document.createElement('a');
      link.setAttribute('href', encodedUri);
      link.setAttribute('download', `bizradar_no_website_leads_${Date.now()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } else {
      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(targetLeads, null, 2));
      const link = document.createElement('a');
      link.setAttribute('href', dataStr);
      link.setAttribute('download', `bizradar_leads_${Date.now()}.json`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

    setDownloaded(true);
    setTimeout(() => setDownloaded(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-fadeIn">
      
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl relative space-y-4">
        
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-xl bg-slate-800 transition-colors"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Download className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">Export Target Coordinates & Leads</h3>
            <p className="text-xs text-slate-400">
              Export {targetLeads.length} target leads lacking a website
            </p>
          </div>
        </div>

        {/* Format Selection */}
        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => setFormat('csv')}
            className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all cursor-pointer ${
              format === 'csv'
                ? 'bg-emerald-500/10 border-emerald-500 text-emerald-300 font-bold'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileSpreadsheet className="w-6 h-6" />
            <span className="text-xs">CSV Spreadsheet (Excel / Sheets)</span>
          </button>

          <button
            onClick={() => setFormat('json')}
            className={`p-4 rounded-xl border flex flex-col items-center gap-2 transition-all cursor-pointer ${
              format === 'json'
                ? 'bg-emerald-500/10 border-emerald-500 text-emerald-300 font-bold'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileCode className="w-6 h-6" />
            <span className="text-xs">JSON Raw Data File</span>
          </button>
        </div>

        {/* Summary Info */}
        <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-xs text-slate-300 space-y-1">
          <p className="flex justify-between">
            <span className="text-slate-500">Total Leads with Coordinates:</span>
            <span className="font-bold text-emerald-400">{targetLeads.length}</span>
          </p>
          <p className="flex justify-between">
            <span className="text-slate-500">High Value ($$$) Targets:</span>
            <span className="font-bold text-amber-400">
              {targetLeads.filter(b => b.leadTier === 'HIGH_VAL').length}
            </span>
          </p>
        </div>

        <button
          onClick={handleDownload}
          className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
        >
          {downloaded ? <Check className="w-4 h-4 text-slate-950" /> : <Download className="w-4 h-4" />}
          {downloaded ? 'File Downloaded!' : `Download ${format.toUpperCase()} Export File`}
        </button>

      </div>

    </div>
  );
};
