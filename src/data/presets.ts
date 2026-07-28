import { LocationPreset, BusinessCategory, Business } from '../types';
import { calculateLeadScore } from '../utils/scoring';

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
  { name: 'Precision HVAC & Plumbing Repair', category: 'contractor' as BusinessCategory, catLabel: 'Plumbing & Heating', phone: '(555) 234-8901' },
  { name: 'ProCraft Roofing & Solar Solutions', category: 'contractor' as BusinessCategory, catLabel: 'Roofing Contractor', phone: '(555) 891-3420' },
  { name: 'Elite Electrician Services', category: 'contractor' as BusinessCategory, catLabel: 'Electrical Contractor', phone: '(555) 412-9876' },
  { name: 'MasterCraft Custom Woodworks', category: 'contractor' as BusinessCategory, catLabel: 'Carpentry', phone: '(555) 673-1209' },

  // Legal & Finance
  { name: 'Vanguard Family Law & Mediation', category: 'legal_finance' as BusinessCategory, catLabel: 'Family Law Firm', phone: '(555) 902-1144' },
  { name: 'Apex Tax & CPA Advisory Services', category: 'legal_finance' as BusinessCategory, catLabel: 'Accounting & CPA', phone: '(555) 345-6711' },
  { name: 'Capital Shield Financial Advisors', category: 'legal_finance' as BusinessCategory, catLabel: 'Financial Planning', phone: '(555) 789-0123' },

  // Health & Medical
  { name: 'Summit Dental & Smile Design', category: 'health_medical' as BusinessCategory, catLabel: 'Dental Clinic', phone: '(555) 888-2311' },
  { name: 'Radiant Skin & Dermatology', category: 'health_medical' as BusinessCategory, catLabel: 'Dermatology & Skin Care', phone: '(555) 543-9812' },
  { name: 'Spine & Wellness Chiropractic Center', category: 'health_medical' as BusinessCategory, catLabel: 'Chiropractor', phone: '(555) 123-7890' },
  { name: 'Optimal Physical Therapy & Rehab', category: 'health_medical' as BusinessCategory, catLabel: 'Physical Therapy', phone: '(555) 654-3210' },

  // Auto
  { name: 'Metro Collision & Auto Body Center', category: 'auto' as BusinessCategory, catLabel: 'Auto Repair', phone: '(555) 987-6543' },
  { name: 'SpeedyLube & Transmission Repair', category: 'auto' as BusinessCategory, catLabel: 'Auto Services', phone: '(555) 321-7654' },
  { name: 'ShineWorks Auto Detailing Studio', category: 'auto' as BusinessCategory, catLabel: 'Car Detailing', phone: '(555) 456-7890' },

  // Salons & Spas
  { name: 'Luxe Hair Studio & Color Bar', category: 'salon_spa' as BusinessCategory, catLabel: 'Hair Salon', phone: '(555) 789-4561' },
  { name: 'Serenity Touch Massage & Day Spa', category: 'salon_spa' as BusinessCategory, catLabel: 'Day Spa', phone: '(555) 234-5678' },
  { name: 'Glow Lash & Nail Boutique', category: 'salon_spa' as BusinessCategory, catLabel: 'Nail & Lash Salon', phone: '(555) 876-5432' },

  // Restaurants
  { name: 'Trattoria Bella Italian Kitchen', category: 'restaurant' as BusinessCategory, catLabel: 'Italian Restaurant', phone: '(555) 345-6789' },
  { name: 'El Fuego Authentic Mexican Grill', category: 'restaurant' as BusinessCategory, catLabel: 'Mexican Restaurant', phone: '(555) 901-2345' },
  { name: 'Golden Dragon Dim Sum & Tea', category: 'restaurant' as BusinessCategory, catLabel: 'Chinese Restaurant', phone: '(555) 567-8901' },
  { name: 'Cornerstone Artisan Bakery & Cafe', category: 'restaurant' as BusinessCategory, catLabel: 'Bakery & Cafe', phone: '(555) 123-4567' },

  // Retail
  { name: 'Vintage Vault Antique Collectibles', category: 'retail' as BusinessCategory, catLabel: 'Antique Shop', phone: '(555) 678-9012' },
  { name: 'Green Thumb Plant Nursery & Florist', category: 'retail' as BusinessCategory, catLabel: 'Plant Nursery', phone: '(555) 890-1234' }
];

/**
 * Generates realistic businesses around a center point [lat, lng].
 * Roughly 40–50% of businesses will LACK a website (the prime targets!),
 * while 50–60% will HAVE a website (which the scanner skips).
 */
export function generateSimulatedBusinesses(centerLat: number, centerLng: number, city: string): Business[] {
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

    const scoring = calculateLeadScore(tmpl.category, rating, reviewCount, true, distanceKm);

    list.push({
      id: `sim-${i}-${Date.now()}`,
      name: tmpl.name,
      category: tmpl.category,
      categoryLabel: tmpl.catLabel,
      rating,
      reviewCount,
      phone: tmpl.phone,
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
