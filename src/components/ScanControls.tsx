import React, { useState } from 'react';
import { 
  Search, MapPin, Sliders, Play, Square, Compass, 
  Layers, Star, ShieldCheck, Zap, Globe, Flame, Loader2 
} from 'lucide-react';
import { ScanParams, BusinessCategory } from '../types';

interface ScanControlsProps {
  params: ScanParams;
  onChangeParams: (params: ScanParams) => void;
  onStartScan: () => void;
  onStopScan: () => void;
  isScanning: boolean;
  onUseCurrentLocation: () => void;
  isLocating: boolean;
}

export const ScanControls: React.FC<ScanControlsProps> = ({
  params,
  onChangeParams,
  onStartScan,
  onStopScan,
  isScanning,
  onUseCurrentLocation,
  isLocating
}) => {
  const [searchQuery, setSearchQuery] = useState(params.locationName);
  const [isSearchingLoc, setIsSearchingLoc] = useState(false);
  const [suggestions, setSuggestions] = useState<any[]>([]);

  // Geocode location using OpenStreetMap Nominatim API
  const handleSearchLocation = async (queryToSearch?: string) => {
    const q = queryToSearch || searchQuery;
    if (!q.trim()) return;

    setIsSearchingLoc(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=5`);
      const data = await res.json();
      if (data && data.length > 0) {
        setSuggestions(data);
      } else {
        alert('Location not found. Try another city name.');
      }
    } catch (err) {
      console.error('Geocoding error:', err);
      alert('Failed to search location.');
    } finally {
      setIsSearchingLoc(false);
    }
  };

  const handleSelectSuggestion = (item: any) => {
    const lat = parseFloat(item.lat);
    const lon = parseFloat(item.lon);
    const name = item.display_name.split(',')[0] + (item.display_name.split(',')[1] ? ',' + item.display_name.split(',')[1] : '');

    onChangeParams({
      ...params,
      locationName: name,
      lat,
      lng: lon
    });
    setSearchQuery(name);
    setSuggestions([]);
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-xl relative overflow-hidden">
      
      {/* Decorative ambient background blur */}
      <div className="absolute -top-12 -right-12 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none"></div>

      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 mb-4">
        
        {/* Title & Mode */}
        <div>
          <div className="flex items-center gap-2">
            <Compass className="w-5 h-5 text-emerald-400" />
            <h2 className="text-base font-bold text-white">Radar Scanner Controls (Exhaustive OSM Query)</h2>
          </div>
          <p className="text-xs text-slate-400 mt-0.5">
            Search any region worldwide to query real OpenStreetMap business data consistently
          </p>
        </div>

        {/* Quick Location Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          <span className="text-[11px] text-slate-400 font-medium shrink-0">Quick Search:</span>
          {['Sousse, Tunisia', 'Paris, France', 'Tokyo, Japan', 'New York, USA', 'London, UK', 'Dubai, UAE'].map((city) => (
            <button
              key={city}
              onClick={() => {
                setSearchQuery(city);
                handleSearchLocation(city);
              }}
              disabled={isScanning}
              className="text-[11px] px-2.5 py-1 bg-slate-950 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-300 transition-all shrink-0 cursor-pointer"
            >
              {city.split(',')[0]}
            </button>
          ))}
        </div>

      </div>

      {/* Main Grid Inputs */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* 1. Dynamic Location Search Bar */}
        <div className="relative">
          <label className="block text-xs font-medium text-slate-300 mb-1.5 flex items-center justify-between">
            <span>Search City / Country / Region</span>
            <button
              onClick={onUseCurrentLocation}
              disabled={isScanning || isLocating}
              className="text-[10px] text-emerald-400 hover:underline flex items-center gap-1"
            >
              <MapPin className="w-3 h-3" />
              {isLocating ? 'Locating...' : 'Use My GPS'}
            </button>
          </label>

          <div className="flex gap-1.5">
            <div className="relative flex-1">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') handleSearchLocation(); }}
                placeholder="e.g. Sousse, Paris, Tokyo..."
                disabled={isScanning}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-3 pr-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500 transition-all"
              />
            </div>
            <button
              onClick={() => handleSearchLocation()}
              disabled={isScanning || isSearchingLoc}
              className="px-3 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl transition-all cursor-pointer flex items-center justify-center shrink-0"
              title="Search Location"
            >
              {isSearchingLoc ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Search className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Suggestions Dropdown */}
          {suggestions.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-slate-900 border border-slate-800 rounded-xl shadow-2xl z-50 max-h-48 overflow-y-auto">
              {suggestions.map((item, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSelectSuggestion(item)}
                  className="w-full text-left px-3 py-2 text-xs text-slate-200 hover:bg-slate-800 border-b border-slate-800 last:border-0 truncate"
                >
                  {item.display_name}
                </button>
              ))}
            </div>
          )}

          <div className="mt-1 flex items-center justify-between text-[10px] text-slate-500 font-mono">
            <span>Lat: {params.lat.toFixed(4)}</span>
            <span>Lng: {params.lng.toFixed(4)}</span>
          </div>
        </div>

        {/* 2. Industry Category Filter */}
        <div>
          <label className="block text-xs font-medium text-slate-300 mb-1.5">
            Industry / Category
          </label>
          <select
            value={params.category}
            onChange={(e) => onChangeParams({ ...params, category: e.target.value as BusinessCategory })}
            disabled={isScanning}
            className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-100 focus:outline-none focus:border-emerald-500 transition-all cursor-pointer"
          >
            <option value="all">⚡ All Business Niches (Exhaustive)</option>
            <option value="contractor">🛠️ Contractors & Plumbers ($$$)</option>
            <option value="legal_finance">⚖️ Lawyers & CPAs ($$$$)</option>
            <option value="health_medical">🩺 Dentists & Clinics ($$$$)</option>
            <option value="auto">🚘 Auto Repair & Body Shop</option>
            <option value="salon_spa">💇 Salons & Beauty Spas</option>
            <option value="restaurant">🍕 Restaurants & Bakeries</option>
            <option value="retail">🛍️ Retail & Storefronts</option>
          </select>
          <p className="mt-1 text-[10px] text-slate-500">
            Queries real OpenStreetMap database
          </p>
        </div>

        {/* 3. Radius Slider */}
        <div>
          <div className="flex items-center justify-between text-xs font-medium text-slate-300 mb-1.5">
            <span>Scan Radius</span>
            <span className="text-emerald-400 font-bold">{params.radiusKm} km</span>
          </div>
          <input
            type="range"
            min="0.5"
            max="15"
            step="0.5"
            value={params.radiusKm}
            onChange={(e) => onChangeParams({ ...params, radiusKm: parseFloat(e.target.value) })}
            disabled={isScanning}
            className="w-full accent-emerald-500 cursor-pointer"
          />
          <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
            <span>0.5 km</span>
            <span>7.5 km</span>
            <span>15 km</span>
          </div>
        </div>

        {/* 4. High-Value Target Filter & Start Button */}
        <div className="flex flex-col justify-end gap-2">
          
          <button
            onClick={() => onChangeParams({ ...params, onlyHighValue: !params.onlyHighValue })}
            className={`flex items-center justify-between px-3 py-1.5 rounded-xl border text-xs transition-all cursor-pointer ${
              params.onlyHighValue
                ? 'bg-amber-500/10 border-amber-500/40 text-amber-300'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <span className="flex items-center gap-1.5 font-medium">
              <Flame className="w-3.5 h-3.5 text-amber-400" />
              High-Value Targets Only ($$$)
            </span>
            <span className={`w-2 h-2 rounded-full ${params.onlyHighValue ? 'bg-amber-400 animate-pulse' : 'bg-slate-700'}`}></span>
          </button>

          {!isScanning ? (
            <button
              onClick={onStartScan}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-gradient-to-r from-emerald-500 via-teal-500 to-cyan-500 hover:from-emerald-400 hover:to-cyan-400 text-slate-950 font-bold text-xs uppercase tracking-wider shadow-lg shadow-emerald-500/25 hover:shadow-emerald-500/40 transition-all cursor-pointer"
            >
              <Play className="w-4 h-4 fill-current" />
              Launch Live OSM Scan
            </button>
          ) : (
            <button
              onClick={onStopScan}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 border border-rose-500/40 text-rose-300 font-bold text-xs uppercase tracking-wider transition-all cursor-pointer"
            >
              <Square className="w-4 h-4 fill-current" />
              Halt Scanner
            </button>
          )}

        </div>

      </div>

    </div>
  );
};
