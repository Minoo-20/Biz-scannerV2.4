import { Business, BusinessCategory, ScanParams } from '../types';
import { calculateLeadScore } from '../utils/scoring';
import { CurrencyCode } from '../utils/currency';
import { getLocalizedPhone } from '../data/presets';

/**
 * Executes a live query against OpenStreetMap Overpass API to find real businesses in the area
 * and evaluates whether they possess an official website.
 */
export async function fetchLiveOSMBusinesses(params: ScanParams, currency: CurrencyCode = 'TND'): Promise<Business[]> {
  const radiusMeters = Math.min(10000, Math.max(500, params.radiusKm * 1000));
  const { lat, lng } = params;

  // Overpass QL query searching for commercial nodes/ways around lat/lng
  const query = `
    [out:json][timeout:25];
    (
      node["amenity"](around:${radiusMeters},${lat},${lng});
      node["shop"](around:${radiusMeters},${lat},${lng});
      node["craft"](around:${radiusMeters},${lat},${lng});
      node["office"](around:${radiusMeters},${lat},${lng});
      way["amenity"](around:${radiusMeters},${lat},${lng});
      way["shop"](around:${radiusMeters},${lat},${lng});
    );
    out center body 40;
  `;

  const url = 'https://overpass-api.de/api/interpreter';

  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: `data=${encodeURIComponent(query)}`
    });

    if (!response.ok) {
      throw new Error(`Overpass API response error: ${response.status}`);
    }

    const data = await response.json();
    const elements = data.elements || [];

    const results: Business[] = [];

    elements.forEach((elem: any, idx: number) => {
      const tags = elem.tags || {};
      const name = tags.name || tags['brand'] || tags['operator'];
      
      // Skip unnamed objects
      if (!name) return;

      const website = tags.website || tags['contact:website'] || tags['url'] || null;
      const rawPhone = tags.phone || tags['contact:phone'] || tags['mobile'] || tags['contact:mobile'] || null;
      
      const nodeLat = elem.lat || (elem.center ? elem.center.lat : lat);
      const nodeLng = elem.lon || (elem.center ? elem.center.lon : lng);

      const phone = rawPhone ? rawPhone : getLocalizedPhone(nodeLat, nodeLng, params.locationName, idx);

      // Distance calculation (haversine)
      const distanceKm = Number(calculateHaversineDistance(lat, lng, nodeLat, nodeLng).toFixed(2));

      // Category detection
      const { category, catLabel } = classifyOSMCategory(tags);

      // Random synthetic review/rating approximation for live OSM data
      const rating = Number((4.0 + (idx % 10) * 0.1).toFixed(1));
      const reviewCount = Math.floor(15 + (idx * 17) % 180);

      const hasWebsite = Boolean(website);
      const scoring = calculateLeadScore(category, rating, reviewCount, Boolean(rawPhone), distanceKm, currency);

      const street = tags['addr:street'] ? `${tags['addr:housenumber'] || ''} ${tags['addr:street']}` : 'Local Business Area';
      const city = tags['addr:city'] || params.locationName.split(',')[0] || 'Local District';

      results.push({
        id: `osm-${elem.id || idx}-${Date.now()}`,
        name,
        category,
        categoryLabel: catLabel,
        rating,
        reviewCount,
        phone,
        address: street,
        city,
        lat: Number(nodeLat.toFixed(5)),
        lng: Number(nodeLng.toFixed(5)),
        website,
        status: hasWebsite ? 'HAS_WEBSITE' : 'NO_WEBSITE',
        distanceKm,
        estMonthlyRevenue: Math.floor(20000 + (idx * 4500) % 70000),
        leadScore: scoring.score,
        leadTier: scoring.tier,
        estWebsiteValue: scoring.estWebsiteValue,
        pipelineStatus: 'new',
        notes: '',
        scannedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        source: 'osm_live'
      });
    });

    return results;
  } catch (error) {
    console.warn('Live OSM API call encountered issue, fallback will be used:', error);
    throw error;
  }
}

function calculateHaversineDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

function classifyOSMCategory(tags: Record<string, string>): { category: BusinessCategory; catLabel: string } {
  const amenity = tags.amenity || '';
  const shop = tags.shop || '';
  const craft = tags.craft || '';
  const office = tags.office || '';

  if (['dentist', 'doctors', 'clinic', 'pharmacy', 'hospital'].includes(amenity)) {
    return { category: 'health_medical', catLabel: 'Medical / Dental' };
  }
  if (['lawyer', 'accountant', 'financial', 'tax_advisor', 'insurance'].includes(office) || office === 'lawyer') {
    return { category: 'legal_finance', catLabel: 'Legal & Financial' };
  }
  if (['carpenter', 'electrician', 'plumber', 'roofing', 'painter', 'builder', 'hvac'].includes(craft)) {
    return { category: 'contractor', catLabel: 'Contractor & Services' };
  }
  if (['car_repair', 'car_wash', 'car_parts'].includes(shop) || amenity === 'car_wash') {
    return { category: 'auto', catLabel: 'Auto Care & Repair' };
  }
  if (['hairdresser', 'beauty', 'spa', 'massage'].includes(shop) || amenity === 'spa') {
    return { category: 'salon_spa', catLabel: 'Salon & Wellness' };
  }
  if (['restaurant', 'cafe', 'fast_food', 'pub', 'bar', 'bakery'].includes(amenity) || ['bakery', 'confectionery'].includes(shop)) {
    return { category: 'restaurant', catLabel: 'Dining & Cafe' };
  }
  if (shop && shop !== 'no') {
    return { category: 'retail', catLabel: `Retail (${shop.replace('_', ' ')})` };
  }

  return { category: 'other', catLabel: 'Commercial Enterprise' };
}
