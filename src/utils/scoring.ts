import { BusinessCategory, LeadTier } from '../types';

export interface ScoreBreakdown {
  score: number;
  tier: LeadTier;
  estWebsiteValue: number;
  reasons: string[];
}

/**
 * Calculates Lead Score (0–100) and priority tier for businesses without a website.
 * High scores = High willingness to pay & high revenue potential.
 */
export function calculateLeadScore(
  category: BusinessCategory,
  rating: number,
  reviewCount: number,
  hasPhone: boolean,
  distanceKm: number
): ScoreBreakdown {
  let score = 0;
  const reasons: string[] = [];

  // 1. Industry Budget Weight (High-Ticket Niches pay $3k-$8k+ for websites)
  switch (category) {
    case 'legal_finance':
      score += 35;
      reasons.push('High-ticket legal & finance industry (+35)');
      break;
    case 'health_medical':
      score += 35;
      reasons.push('High-value medical & dental practice (+35)');
      break;
    case 'contractor':
      score += 30;
      reasons.push('Lucrative home services / contractor niche (+30)');
      break;
    case 'auto':
      score += 25;
      reasons.push('High volume automotive service (+25)');
      break;
    case 'salon_spa':
      score += 20;
      reasons.push('Appointment-heavy beauty / spa niche (+20)');
      break;
    case 'restaurant':
      score += 15;
      reasons.push('High foot-traffic dining (+15)');
      break;
    case 'retail':
      score += 12;
      reasons.push('Local retail storefront (+12)');
      break;
    default:
      score += 10;
      reasons.push('Standard commercial business (+10)');
      break;
  }

  // 2. Review Count Factor (More reviews without website = Booming foot traffic but zero web presence!)
  if (reviewCount >= 150) {
    score += 30;
    reasons.push(`Massive local foot traffic (${reviewCount} Google reviews, high urgency) (+30)`);
  } else if (reviewCount >= 60) {
    score += 22;
    reasons.push(`Strong existing customer base (${reviewCount} reviews) (+22)`);
  } else if (reviewCount >= 20) {
    score += 15;
    reasons.push(`Established customer activity (${reviewCount} reviews) (+15)`);
  } else {
    score += 8;
    reasons.push(`Developing client review presence (${reviewCount} reviews) (+8)`);
  }

  // 3. Rating Factor (High rating = cares about customer experience & reputation)
  if (rating >= 4.5) {
    score += 20;
    reasons.push(`Top-tier customer rating (${rating.toFixed(1)} ⭐) (+20)`);
  } else if (rating >= 4.0) {
    score += 12;
    reasons.push(`Solid positive rating (${rating.toFixed(1)} ⭐) (+12)`);
  } else {
    score += 5;
    reasons.push(`Moderate customer rating (${rating.toFixed(1)} ⭐) (+5)`);
  }

  // 4. Phone Availability (Direct outreach line)
  if (hasPhone) {
    score += 10;
    reasons.push('Direct phone contact available (+10)');
  }

  // Cap score at 99
  const finalScore = Math.min(99, Math.max(15, Math.round(score)));

  // Determine Tier & Estimated Deal Value
  let tier: LeadTier = 'STANDARD';
  let estWebsiteValue = 1800;

  if (finalScore >= 75) {
    tier = 'HIGH_VAL';
    estWebsiteValue = category === 'legal_finance' || category === 'health_medical' ? 5500 : 3800;
  } else if (finalScore >= 50) {
    tier = 'MEDIUM_VAL';
    estWebsiteValue = 2600;
  }

  return {
    score: finalScore,
    tier,
    estWebsiteValue,
    reasons
  };
}

export function getTierBadgeStyle(tier: LeadTier): { bg: string; text: string; label: string; border: string } {
  switch (tier) {
    case 'HIGH_VAL':
      return {
        bg: 'bg-amber-500/10',
        text: 'text-amber-400',
        border: 'border-amber-500/30',
        label: '🔥 High-Value Target'
      };
    case 'MEDIUM_VAL':
      return {
        bg: 'bg-emerald-500/10',
        text: 'text-emerald-400',
        border: 'border-emerald-500/30',
        label: '⚡ Strong Lead'
      };
    case 'STANDARD':
    default:
      return {
        bg: 'bg-sky-500/10',
        text: 'text-sky-400',
        border: 'border-sky-500/30',
        label: '🟢 Standard Lead'
      };
  }
}
