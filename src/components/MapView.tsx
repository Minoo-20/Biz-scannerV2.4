import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import { Business, LeadTier } from '../types';
import { MapPin, Phone, Star, Copy, ExternalLink, GlobeX, Flame, Sparkles } from 'lucide-react';
import { CurrencyCode, CURRENCIES } from '../utils/currency';

interface MapViewProps {
  businesses: Business[];
  centerLat: number;
  centerLng: number;
  currency: CurrencyCode;
  selectedBusinessId?: string;
  onSelectBusiness?: (b: Business) => void;
  onCopyCoordinates: (lat: number, lng: number) => void;
}

// Controller component to re-center map when center coordinates change
function MapRecenter({ lat, lng, selectedBusiness }: { lat: number; lng: number; selectedBusiness?: Business }) {
  const map = useMap();
  useEffect(() => {
    if (selectedBusiness) {
      map.flyTo([selectedBusiness.lat, selectedBusiness.lng], 16, { duration: 1.2 });
    } else {
      map.flyTo([lat, lng], 13, { duration: 1.2 });
    }
  }, [lat, lng, selectedBusiness, map]);
  return null;
}

// Helper to create custom HTML DivIcons with custom glow & status colors
function createCustomMarkerIcon(tier: LeadTier, isSelected: boolean) {
  let color = '#38bdf8'; // Sky blue
  let glowColor = 'rgba(56, 189, 248, 0.5)';
  let iconEmoji = '🟢';

  if (tier === 'HIGH_VAL') {
    color = '#f59e0b'; // Amber / Gold
    glowColor = 'rgba(245, 158, 11, 0.7)';
    iconEmoji = '🔥';
  } else if (tier === 'MEDIUM_VAL') {
    color = '#10b981'; // Emerald
    glowColor = 'rgba(16, 185, 129, 0.6)';
    iconEmoji = '⚡';
  }

  const borderStyle = isSelected ? 'border-4 border-white scale-125 z-50' : 'border-2 border-slate-900';

  const html = `
    <div style="
      background-color: ${color};
      box-shadow: 0 0 15px ${glowColor};
      width: 28px;
      height: 28px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 13px;
      cursor: pointer;
      transition: transform 0.2s ease;
    " class="${borderStyle}">
      ${iconEmoji}
    </div>
  `;

  return L.divIcon({
    html,
    className: 'custom-map-pin',
    iconSize: [28, 28],
    iconAnchor: [14, 14],
    popupAnchor: [0, -14]
  });
}

export const MapView: React.FC<MapViewProps> = ({
  businesses,
  centerLat,
  centerLng,
  currency,
  selectedBusinessId,
  onSelectBusiness,
  onCopyCoordinates
}) => {
  // Only plot target businesses (businesses LACKING a website)
  const targetBusinesses = businesses.filter(b => b.status === 'NO_WEBSITE');
  const selectedBusiness = targetBusinesses.find(b => b.id === selectedBusinessId);

  return (
    <div className="relative w-full h-[450px] lg:h-full rounded-2xl overflow-hidden border border-slate-800 shadow-2xl bg-slate-950">
      
      {/* Map Header Overlay */}
      <div className="absolute top-3 left-3 z-[1000] bg-slate-900/90 backdrop-blur-md px-3.5 py-2 rounded-xl border border-slate-800 shadow-lg text-xs flex items-center gap-2">
        <MapPin className="w-4 h-4 text-emerald-400" />
        <span className="font-bold text-white">Target Map View</span>
        <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
          {targetBusinesses.length} Pins Lacking Website
        </span>
      </div>

      <MapContainer
        center={[centerLat, centerLng]}
        zoom={13}
        scrollWheelZoom={true}
        className="w-full h-full z-0"
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <MapRecenter lat={centerLat} lng={centerLng} selectedBusiness={selectedBusiness} />

        {targetBusinesses.map((biz) => {
          const isSelected = biz.id === selectedBusinessId;
          const icon = createCustomMarkerIcon(biz.leadTier, isSelected);

          return (
            <Marker
              key={biz.id}
              position={[biz.lat, biz.lng]}
              icon={icon}
              ref={(marker) => {
                if (marker && isSelected) {
                  marker.openPopup();
                }
              }}
              eventHandlers={{
                click: () => onSelectBusiness && onSelectBusiness(biz)
              }}
            >
              <Popup>
                <div className="p-1 max-w-xs space-y-2 font-sans">
                  
                  <div className="flex items-start justify-between gap-2 border-b border-slate-800 pb-2">
                    <div>
                      <h4 className="font-bold text-sm text-slate-100 leading-tight">{biz.name}</h4>
                      <p className="text-[11px] text-slate-400">{biz.categoryLabel} • {biz.city}</p>
                    </div>
                    <span className="shrink-0 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30 flex items-center gap-1">
                      <GlobeX className="w-3 h-3" />
                      NO WEBSITE
                    </span>
                  </div>

                  {/* Rating & Distance */}
                  <div className="flex items-center justify-between text-xs text-slate-300">
                    <span className="flex items-center gap-1 text-amber-400 font-bold">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      {biz.rating} <span className="text-slate-400 font-normal">({biz.reviewCount} reviews)</span>
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono">{biz.distanceKm} km away</span>
                  </div>

                  {/* High Value Target Score Badge */}
                  <div className="bg-slate-900 p-2 rounded-lg border border-slate-800 flex items-center justify-between text-xs">
                    <span className="text-slate-400 text-[11px]">Lead Target Score:</span>
                    <span className="font-bold text-emerald-400 flex items-center gap-1">
                      {biz.leadTier === 'HIGH_VAL' && <Flame className="w-3.5 h-3.5 text-amber-400" />}
                      {biz.leadScore}/100 ({biz.estWebsiteValue.toLocaleString()} {CURRENCIES[currency].symbol} Value)
                    </span>
                  </div>

                  {/* Exact Coordinates */}
                  <div className="bg-slate-950 p-2 rounded-lg text-[11px] font-mono flex items-center justify-between text-slate-300 border border-slate-800">
                    <div>
                      <p className="text-[9px] text-slate-500 uppercase tracking-wider">Exact GPS Coordinates</p>
                      <p className="text-emerald-400 font-bold">{biz.lat.toFixed(5)}, {biz.lng.toFixed(5)}</p>
                    </div>
                    <button
                      onClick={() => onCopyCoordinates(biz.lat, biz.lng)}
                      className="p-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all cursor-pointer"
                      title="Copy Coordinates"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Google Maps Business Profile Link */}
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${biz.lat},${biz.lng}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full flex items-center justify-center gap-1.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-100 text-xs rounded-lg transition-all font-medium"
                  >
                    <ExternalLink className="w-3.5 h-3.5 text-emerald-400" />
                    Open Business on Google Maps
                  </a>

                </div>
              </Popup>
            </Marker>
          );
        })}
      </MapContainer>
    </div>
  );
};
