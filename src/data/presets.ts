import { LocationPreset, BusinessCategory, Business } from '../types';
import { calculateLeadScore } from '../utils/scoring';
import { CurrencyCode, detectCurrencyForRegion } from '../utils/currency';

export const LOCATION_PRESETS: LocationPreset[] = [
  { name: 'Los Angeles (Downtown / Hollywood)', city: 'Los Angeles', country: 'USA', lat: 34.0522, lng: -118.2437 },
  { name: 'New York (Manhattan)', city: 'New York', country: 'USA', lat: 40.7128, lng: -74.0060 },
  { name: 'Miami (Brickell & South Beach)', city: 'Miami', country: 'USA', lat: 25.7617, lng: -80.1918 },
  { name: 'Chicago (Loop & Lincoln Park)', city: 'Chicago', country: 'USA', lat: 41.8781, lng: -87.6298 },
  { name: 'London (Westminster / Soho)', city: 'London', country: 'UK', lat: 51.5074, lng: -0.1278 },
  { name: 'Paris (Le Marais / Central)', city: 'Paris', country: 'France', lat: 48.8566, lng: 2.3522 },
  { name: 'Dubai (Downtown & Marina)', city: 'Dubai', country: 'UAE', lat: 25.2048, lng: 55.2708 },
  { name: 'Sydney (CBD & Harbour)', city: 'Sydney', country: 'Australia', lat: -33.8688, lng: 151.2093 },
  { name: 'Toronto (Downtown)', city: 'Toronto', country: 'Canada', lat: 43.6532, lng: -79.3832 },
  { name: 'Tokyo (Shinjuku)', city: 'Tokyo', country: 'Japan', lat: 35.6895, lng: 139.6917 }
];

const SAMPLE_BIZ_TEMPLATES = [
  // Contractors / Home services
  { name: 'Precision HVAC & Plumbing Repair', category: 'contractor' as BusinessCategory, catLabel: 'Plumbing & Heating' },
  { name: 'ProCraft Roofing & Solar Solutions', category: 'contractor' as BusinessCategory, catLabel: 'Roofing Contractor' },
  { name: 'Elite Electrician Services', category: 'contractor' as BusinessCategory, catLabel: 'Electrical Contractor' },
  { name: 'MasterCraft Custom Woodworks', category: 'contractor' as BusinessCategory, catLabel: 'Carpentry' },

  // Legal & Finance
  { name: 'Vanguard Family Law & Mediation', category: 'legal_finance' as BusinessCategory, catLabel: 'Family Law Firm' },
  { name: 'Apex Tax & CPA Advisory Services', category: 'legal_finance' as BusinessCategory, catLabel: 'Accounting & CPA' },
  { name: 'Capital Shield Financial Advisors', category: 'legal_finance' as BusinessCategory, catLabel: 'Financial Planning' },

  // Health & Medical
  { name: 'Summit Dental & Smile Design', category: 'health_medical' as BusinessCategory, catLabel: 'Dental Clinic' },
  { name: 'Radiant Skin & Dermatology', category: 'health_medical' as BusinessCategory, catLabel: 'Dermatology & Skin Care' },
  { name: 'Spine & Wellness Chiropractic Center', category: 'health_medical' as BusinessCategory, catLabel: 'Chiropractor' },
  { name: 'Optimal Physical Therapy & Rehab', category: 'health_medical' as BusinessCategory, catLabel: 'Physical Therapy' },

  // Auto
  { name: 'Metro Collision & Auto Body Center', category: 'auto' as BusinessCategory, catLabel: 'Auto Repair' },
  { name: 'SpeedyLube & Transmission Repair', category: 'auto' as BusinessCategory, catLabel: 'Auto Services' },
  { name: 'ShineWorks Auto Detailing Studio', category: 'auto' as BusinessCategory, catLabel: 'Car Detailing' },

  // Salons & Spas
  { name: 'Luxe Hair Studio & Color Bar', category: 'salon_spa' as BusinessCategory, catLabel: 'Hair Salon' },
  { name: 'Serenity Touch Massage & Day Spa', category: 'salon_spa' as BusinessCategory, catLabel: 'Day Spa' },
  { name: 'Glow Lash & Nail Boutique', category: 'salon_spa' as BusinessCategory, catLabel: 'Nail & Lash Salon' },

  // Restaurants
  { name: 'Trattoria Bella Italian Kitchen', category: 'restaurant' as BusinessCategory, catLabel: 'Italian Restaurant' },
  { name: 'El Fuego Authentic Mexican Grill', category: 'restaurant' as BusinessCategory, catLabel: 'Mexican Restaurant' },
  { name: 'Golden Dragon Dim Sum & Tea', category: 'restaurant' as BusinessCategory, catLabel: 'Chinese Restaurant' },
  { name: 'Cornerstone Artisan Bakery & Cafe', category: 'restaurant' as BusinessCategory, catLabel: 'Bakery & Cafe' },

  // Retail
  { name: 'Vintage Vault Antique Collectibles', category: 'retail' as BusinessCategory, catLabel: 'Antique Shop' },
  { name: 'Green Thumb Plant Nursery & Florist', category: 'retail' as BusinessCategory, catLabel: 'Plant Nursery' }
];

/**
 * Generates regionally appropriate phone numbers based on GPS coordinates and region context.
 */
export function getLocalizedPhone(lat: number, lng: number, locationName: string, index: number): string {
  const currency = detectCurrencyForRegion(lat, lng, locationName);
  const seed = 200 + index * 17;

  if (currency === 'TND') {
    return `+216 ${73 + (index % 5)} ${100 + (seed % 899)} ${200 + (index % 799)}`;
  }
  if (currency === 'PHP') {
    return `+63 9${10 + (index % 89)} ${100 + (seed % 899)} ${1000 + (index % 8999)}`;
  }
  if (currency === 'EUR') {
    return `+33 1 ${40 + (index % 50)} ${10 + (seed % 80)} ${20 + (index % 70)}`;
  }
  if (currency === 'SAR') {
    return `+966 11 ${200 + (seed % 700)} ${1000 + (index % 8999)}`;
  }
  return `+1 (555) ${200 + (seed % 700)}-${1000 + (index % 8999)}`;
}

/**
 * Generates realistic businesses around a center point [lat, lng].
 * Roughly 40–50% of businesses will LACK a website (the prime targets!),
 * while 50–60% will HAVE a website (which the scanner skips).
 */
export function generateSimulatedBusinesses(centerLat: number, centerLng: number, city: string, currency: CurrencyCode = 'TND'): Business[] {
  const count = 28;
  const list: Business[] = [];

  for (let i = 0; i < count; i++) {
    const tmpl = SAMPLE_BIZ_TEMPLATES[i % SAMPLE_BIZ_TEMPLATES.length];
    
    // Slight random offset for coordinates around the center point (~0.5 - 5km radius)
    const angle = Math.random() * Math.PI * 2;
    const distanceKm = 0.3 + Math.random() * 4.2; // 0.3 to 4.5 km distance
    const latOffset = (distanceKm / 111) * Math.cos(angle);
    const lngOffset = (distanceKm / (111 * Math.cos((centerLat * Math.PI) / 180))) * Math.sin(angle);

    const lat = Number((centerLat + latOffset).toFixed(5));
    const lng = Number((centerLng + lngOffset).toFixed(5));

    // About 45% do NOT have a website
    const hasWebsite = Math.random() > 0.45;
    const website = hasWebsite 
      ? `https://www.${tmpl.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com` 
      : null;

    const rating = Number((3.8 + Math.random() * 1.2).toFixed(1)); // 3.8 to 5.0
    const reviewCount = Math.floor(12 + Math.random() * 240); // 12 to 252 reviews

    const phone = getLocalizedPhone(lat, lng, city, i);
    const scoring = calculateLeadScore(tmpl.category, rating, reviewCount, true, distanceKm, currency);

    list.push({
      id: `sim-${i}-${Date.now()}`,
      name: tmpl.name,
      category: tmpl.category,
      categoryLabel: tmpl.catLabel,
      rating,
      reviewCount,
      phone,
      address: `${100 + i * 15} Main St, ${city}`,
      city,
      lat,
      lng,
      website,
      status: hasWebsite ? 'HAS_WEBSITE' : 'NO_WEBSITE',
      distanceKm: Number(distanceKm.toFixed(2)),
      estMonthlyRevenue: Math.floor(15000 + Math.random() * 85000),
      leadScore: scoring.score,
      leadTier: scoring.tier,
      estWebsiteValue: scoring.estWebsiteValue,
      pipelineStatus: 'new',
      notes: '',
      scannedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      source: 'simulated'
    });
  }

  return list;
}
