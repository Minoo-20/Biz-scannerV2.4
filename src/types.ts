export type BusinessCategory = 
  | 'all'
  | 'contractor'
  | 'health_medical'
  | 'legal_finance'
  | 'auto'
  | 'salon_spa'
  | 'restaurant'
  | 'retail'
  | 'other';

export type LeadTier = 'HIGH_VAL' | 'MEDIUM_VAL' | 'STANDARD';

export type PipelineStatus = 'new' | 'contacted' | 'proposal' | 'won' | 'lost';

export interface Business {
  id: string;
  name: string;
  category: BusinessCategory;
  categoryLabel: string;
  rating: number;
  reviewCount: number;
  phone: string;
  address: string;
  city: string;
  lat: number;
  lng: number;
  website: string | null;
  status: 'NO_WEBSITE' | 'HAS_WEBSITE';
  distanceKm: number;
  estMonthlyRevenue: number;
  leadScore: number;
  leadTier: LeadTier;
  estWebsiteValue: number;
  pipelineStatus: PipelineStatus;
  notes: string;
  scannedAt: string;
  source: 'osm_live' | 'simulated';
}

export interface ScanParams {
  locationName: string;
  lat: number;
  lng: number;
  radiusKm: number;
  category: BusinessCategory;
  minRating: number;
  minReviews: number;
  scanMode: 'osm_live' | 'simulated';
  onlyHighValue: boolean;
}

export interface ScanLog {
  id: string;
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'skip' | 'alert';
}

export interface LocationPreset {
  name: string;
  city: string;
  country: string;
  lat: number;
  lng: number;
}
