export type CurrencyCode = 'TND' | 'USD' | 'EUR' | 'SAR' | 'PHP';

export interface CurrencyConfig {
  code: CurrencyCode;
  symbol: string;
  name: string;
}

export const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
  TND: { code: 'TND', symbol: 'DT', name: 'Tunisian Dinar (TND)' },
  USD: { code: 'USD', symbol: '$', name: 'US Dollar (USD)' },
  EUR: { code: 'EUR', symbol: '€', name: 'Euro (EUR)' },
  SAR: { code: 'SAR', symbol: 'SAR', name: 'Saudi Riyal (SAR)' },
  PHP: { code: 'PHP', symbol: '₱', name: 'Philippine Peso (PHP)' }
};

/**
 * Automatically detects the appropriate currency 100% automatically based on geographic coordinates (GPS bounding box)
 * or location name/city text search.
 */
export function detectCurrencyForRegion(lat?: number, lng?: number, locationName: string = ''): CurrencyCode {
  const query = locationName.toLowerCase();

  // Text matching
  if (query.includes('tunis') || query.includes('sousse') || query.includes('sfax') || query.includes('djerba') || query.includes('tunisia')) {
    return 'TND';
  }
  if (query.includes('philippines') || query.includes('manila') || query.includes('cebu') || query.includes('davao')) {
    return 'PHP';
  }
  if (query.includes('paris') || query.includes('lyon') || query.includes('france') || query.includes('berlin') || query.includes('germany') || query.includes('london') || query.includes('uk') || query.includes('europe')) {
    return 'EUR';
  }
  if (query.includes('dubai') || query.includes('abu dhabi') || query.includes('riyadh') || query.includes('saudi') || query.includes('uae')) {
    return 'SAR';
  }

  // GPS Bounding Box detection
  if (lat !== undefined && lng !== undefined) {
    // Philippines bounding box (~4-21°N, 116-127°E)
    if (lat >= 4 && lat <= 21 && lng >= 116 && lng <= 127) {
      return 'PHP';
    }
    // Tunisia bounding box (~30-38°N, 7-12°E)
    if (lat >= 30 && lat <= 38 && lng >= 7 && lng <= 12) {
      return 'TND';
    }
    // GCC / Middle East bounding box (~15-30°N, 35-60°E)
    if (lat >= 15 && lat <= 30 && lng >= 35 && lng <= 60) {
      return 'SAR';
    }
    // Europe bounding box (~35-60°N, -10 to 30°E)
    if (lat >= 35 && lat <= 60 && lng >= -10 && lng <= 30) {
      return 'EUR';
    }
  }

  return 'USD'; // Default Global USD
}

/**
 * Calculates local lead value factoring in regional Purchasing Power Parity (PPP)
 * and local market pricing standards automatically.
 */
export function getRegionalEstValue(
  tier: 'HIGH_VAL' | 'MEDIUM_VAL' | 'STANDARD',
  category: string,
  currency: CurrencyCode
): number {
  switch (currency) {
    case 'TND':
      if (tier === 'HIGH_VAL') {
        return category === 'legal_finance' || category === 'health_medical' ? 3500 : 2500;
      }
      if (tier === 'MEDIUM_VAL') return 1500;
      return 800;

    case 'PHP':
      if (tier === 'HIGH_VAL') {
        return category === 'legal_finance' || category === 'health_medical' ? 120000 : 90000;
      }
      if (tier === 'MEDIUM_VAL') return 65000;
      return 35000;

    case 'USD':
      if (tier === 'HIGH_VAL') {
        return category === 'legal_finance' || category === 'health_medical' ? 5500 : 3800;
      }
      if (tier === 'MEDIUM_VAL') return 2600;
      return 1800;

    case 'EUR':
      if (tier === 'HIGH_VAL') {
        return category === 'legal_finance' || category === 'health_medical' ? 4800 : 3200;
      }
      if (tier === 'MEDIUM_VAL') return 2200;
      return 1500;

    case 'SAR':
      if (tier === 'HIGH_VAL') {
        return category === 'legal_finance' || category === 'health_medical' ? 18000 : 12000;
      }
      if (tier === 'MEDIUM_VAL') return 8000;
      return 4500;

    default:
      return 800;
  }
}
