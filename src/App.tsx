import React, { useState, useEffect } from 'react';
import { 
  Business, ScanParams, ScanLog, PipelineStatus 
} from './types';
import { fetchLiveOSMBusinesses } from './services/overpass';
import { CurrencyCode, CURRENCIES, getRegionalEstValue, detectCurrencyForRegion } from './utils/currency';

import { Navbar } from './components/Navbar';
import { ScanControls } from './components/ScanControls';
import { RadarTerminal } from './components/RadarTerminal';
import { MapView } from './components/MapView';
import { LeadTable } from './components/LeadTable';
import { PitchModal } from './components/PitchModal';
import { ExportModal } from './components/ExportModal';

export function App() {
  const [params, setParams] = useState<ScanParams>({
    locationName: 'Sousse, Tunisia',
    lat: 35.8256,
    lng: 10.6411,
    radiusKm: 3.0,
    category: 'all',
    minRating: 0,
    minReviews: 0,
    scanMode: 'osm_live',
    onlyHighValue: false
  });

  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [logs, setLogs] = useState<ScanLog[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [currentCheckingName, setCurrentCheckingName] = useState('');
  
  const [totalInspected, setTotalInspected] = useState(0);
  const [skippedCount, setSkippedCount] = useState(0);
  const [targetsFound, setTargetsFound] = useState(0);

  const [currency, setCurrency] = useState<CurrencyCode>('TND');

  // Auto-detect currency when scan parameters change (presets, typing, or GPS location)
  useEffect(() => {
    const detected = detectCurrencyForRegion(params.lat, params.lng, params.locationName);
    setCurrency(detected);
  }, [params.lat, params.lng, params.locationName]);

  // Update business estimated values when currency/PPP standards change
  useEffect(() => {
    if (businesses.length > 0) {
      setBusinesses(prev => prev.map(b => ({
        ...b,
        estWebsiteValue: getRegionalEstValue(b.leadTier, b.category, currency)
      })));
    }
  }, [currency]);

  const [selectedBusinessId, setSelectedBusinessId] = useState<string | undefined>();
  const [pitchBusiness, setPitchBusiness] = useState<Business | null>(null);
  const [showExportModal, setShowExportModal] = useState(false);
  const [isLocating, setIsLocating] = useState(false);

  // Initialize in idle state without auto-running scan on startup
  useEffect(() => {
    setLogs([
      {
        id: 'init-1',
        timestamp: new Date().toLocaleTimeString(),
        message: `BizRadar initialized in idle mode. Search your target city/region (e.g. Sousse, Paris) or use GPS, then click 'Launch Live OSM Scan'.`,
        type: 'info'
      }
    ]);
  }, []);

  const runLiveScan = async (scanParams: ScanParams) => {
    setIsScanning(true);
    setScanProgress(0);
    setLogs(prev => [
      {
        id: `start-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        message: `Querying real OpenStreetMap Overpass API for ${scanParams.locationName} (${scanParams.lat}, ${scanParams.lng}), Radius: ${scanParams.radiusKm}km...`,
        type: 'info'
      },
      ...prev
    ]);

    try {
      let rawList = await fetchLiveOSMBusinesses(scanParams, currency);

      // Apply category filter if specified
      if (scanParams.category !== 'all') {
        rawList = rawList.filter(b => b.category === scanParams.category);
      }

      // Apply high-value filter if specified
      if (scanParams.onlyHighValue) {
        rawList = rawList.filter(b => b.leadTier === 'HIGH_VAL');
      }

      let idx = 0;
      const total = rawList.length;
      let runningSkipped = 0;
      let runningTargets = 0;
      const newLogs: ScanLog[] = [];

      if (total === 0) {
        setLogs(prev => [
          {
            id: `empty-${Date.now()}`,
            timestamp: new Date().toLocaleTimeString(),
            message: `Scan completed. No businesses found matching criteria in this viewport. Try increasing radius or searching another region.`,
            type: 'alert'
          },
          ...prev
        ]);
        setIsScanning(false);
        setBusinesses([]);
        setTotalInspected(0);
        setSkippedCount(0);
        setTargetsFound(0);
        return;
      }

      const interval = setInterval(() => {
        if (idx < total) {
          const biz = rawList[idx];
          setCurrentCheckingName(biz.name);
          const progressPercent = ((idx + 1) / total) * 100;
          setScanProgress(progressPercent);

          const hasWeb = biz.status === 'HAS_WEBSITE';
          if (hasWeb) {
            runningSkipped++;
            newLogs.unshift({
              id: `scan-${idx}-${Date.now()}`,
              timestamp: new Date().toLocaleTimeString(),
              message: `[CHECK] "${biz.name}" (${biz.categoryLabel}) -> Website detected: YES -> SKIPPED.`,
              type: 'skip'
            });
          } else {
            runningTargets++;
            newLogs.unshift({
              id: `scan-${idx}-${Date.now()}`,
              timestamp: new Date().toLocaleTimeString(),
              message: `[TARGET FOUND] "${biz.name}" -> NO WEBSITE! Coords: (${biz.lat}, ${biz.lng}) -> Score: ${biz.leadScore}/100 [${biz.leadTier}]`,
              type: 'success'
            });
          }

          setTotalInspected(idx + 1);
          setSkippedCount(runningSkipped);
          setTargetsFound(runningTargets);
          setLogs(prev => [newLogs[0], ...prev.slice(0, 50)]);

          idx++;
        } else {
          clearInterval(interval);
          setIsScanning(false);
          setCurrentCheckingName('');
          setBusinesses(rawList);
          setLogs(prev => [
            {
              id: `complete-${Date.now()}`,
              timestamp: new Date().toLocaleTimeString(),
              message: `Exhaustive OSM query complete! Inspected ${total} businesses. Discovered ${runningTargets} prime targets without a website.`,
              type: 'success'
            },
            ...prev
          ]);
        }
      }, 120);

    } catch (error) {
      console.error(error);
      setIsScanning(false);
      setLogs(prev => [
        {
          id: `err-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString(),
          message: `Error querying Overpass API. Please check your internet connection or try a smaller radius.`,
          type: 'alert'
        },
        ...prev
      ]);
    }
  };

  // Handle GPS Geolocation
  const handleUseCurrentLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser');
      return;
    }
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const newParams = {
          ...params,
          locationName: 'Current GPS Location',
          lat,
          lng
        };
        setParams(newParams);
        setIsLocating(false);
        setLogs(prev => [
          {
            id: `gps-${Date.now()}`,
            timestamp: new Date().toLocaleTimeString(),
            message: `Acquired GPS location: ${lat.toFixed(4)}, ${lng.toFixed(4)}. Click 'Launch Live OSM Scan' to scan.`,
            type: 'success'
          },
          ...prev
        ]);
      },
      (err) => {
        console.warn(err);
        alert('Unable to retrieve your location');
        setIsLocating(false);
      }
    );
  };

  const handleStartScan = () => {
    runLiveScan(params);
  };

  const handleStopScan = () => {
    setIsScanning(false);
    setCurrentCheckingName('');
    setLogs(prev => [
      {
        id: `stop-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        message: `Scanner halted by user.`,
        type: 'alert'
      },
      ...prev
    ]);
  };

  const handleResetData = () => {
    setBusinesses([]);
    setTotalInspected(0);
    setSkippedCount(0);
    setTargetsFound(0);
    setLogs([
      {
        id: `reset-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        message: `Lead data cleared. Ready for new scan.`,
        type: 'info'
      }
    ]);
  };

  const handleCopyCoordinates = (lat: number, lng: number) => {
    navigator.clipboard.writeText(`${lat}, ${lng}`);
    alert(`Copied exact coordinates: ${lat.toFixed(5)}, ${lng.toFixed(5)}`);
  };

  const handleUpdateStatus = (id: string, status: PipelineStatus) => {
    setBusinesses(prev => prev.map(b => b.id === id ? { ...b, pipelineStatus: status } : b));
  };

  const handleUpdateNotes = (id: string, notes: string) => {
    setBusinesses(prev => prev.map(b => b.id === id ? { ...b, notes } : b));
  };

  const handleDeleteLead = (id: string) => {
    setBusinesses(prev => prev.filter(b => b.id !== id));
  };

  const handleSelectOnMap = (b: Business) => {
    setSelectedBusinessId(b.id);
    const mapElement = document.getElementById('map-view-section');
    if (mapElement) {
      mapElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
    } else {
      window.scrollTo({ top: 250, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      
      {/* Top Navigation / Stats Bar */}
      <Navbar
        discoveredLeads={businesses}
        isScanning={isScanning}
        currency={currency}
        onOpenExport={() => setShowExportModal(true)}
        onResetData={handleResetData}
      />

      {/* Main Content Dashboard */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 lg:px-8 py-6 space-y-6">
        
        {/* Controls Bar with Dynamic Search & Exhaustive OSM */}
        <ScanControls
          params={params}
          onChangeParams={(newParams) => {
            setParams(newParams);
          }}
          onStartScan={handleStartScan}
          onStopScan={handleStopScan}
          isScanning={isScanning}
          onUseCurrentLocation={handleUseCurrentLocation}
          isLocating={isLocating}
        />

        {/* Grid Section: Terminal & Map View */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          
          {/* Left: Radar Terminal Live Stream */}
          <div className="lg:col-span-5 h-[450px] lg:h-auto">
            <RadarTerminal
              logs={logs}
              isScanning={isScanning}
              scanProgress={scanProgress}
              totalInspected={totalInspected}
              skippedCount={skippedCount}
              targetsFound={targetsFound}
              currentCheckingName={currentCheckingName}
              onClearLogs={() => setLogs([])}
            />
          </div>

          {/* Right: Leaflet Interactive Map View */}
          <div id="map-view-section" className="lg:col-span-7 h-[450px] lg:h-auto">
            <MapView
              businesses={businesses}
              centerLat={params.lat}
              centerLng={params.lng}
              currency={currency}
              selectedBusinessId={selectedBusinessId}
              onSelectBusiness={(b) => setSelectedBusinessId(b.id)}
              onCopyCoordinates={handleCopyCoordinates}
            />
          </div>

        </div>

        {/* Discovered Target Leads Table / CRM */}
        <LeadTable
          leads={businesses}
          currency={currency}
          selectedBusinessId={selectedBusinessId}
          onCopyCoordinates={handleCopyCoordinates}
          onOpenPitch={(b) => setPitchBusiness(b)}
          onUpdateStatus={handleUpdateStatus}
          onUpdateNotes={handleUpdateNotes}
          onDeleteLead={handleDeleteLead}
          onSelectOnMap={handleSelectOnMap}
        />

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-900/50 py-4 px-4 text-center text-xs text-slate-500 mt-12">
        <p>BizRadar v2.6 • Exhaustive OpenStreetMap Live Scanner • Multi-Currency PPP Engine</p>
      </footer>

      {/* Modals */}
      {pitchBusiness && (
        <PitchModal
          business={pitchBusiness}
          currency={currency}
          onClose={() => setPitchBusiness(null)}
        />
      )}

      {showExportModal && (
        <ExportModal
          leads={businesses}
          currency={currency}
          onClose={() => setShowExportModal(false)}
        />
      )}

    </div>
  );
}

export default App;
