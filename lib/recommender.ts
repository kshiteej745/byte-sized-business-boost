import { eq, and, sql, desc, asc } from 'drizzle-orm';
import { db } from './db';
import { businesses, deals, reviews } from './schema';

export interface RecommendationFilters {
  category?: string;
  neighborhood?: string;
  budget?: 'low' | 'medium' | 'high';
  tags?: string[];
  dealsOnly?: boolean;
}

export interface BusinessScore {
  businessId: number;
  score: number;
  reasons: string[];
}

/**
 * Score businesses based on filters
 */
export function scoreBusinesses(filters: RecommendationFilters): BusinessScore[] {
  let query = db.select({
    id: businesses.id,
    name: businesses.name,
    category: businesses.category,
    neighborhood: businesses.neighborhood,
    tagsCsv: businesses.tagsCsv,
    avgRating: sql<number>`COALESCE(AVG(${reviews.rating}), 0)`.as('avg_rating'),
    reviewCount: sql<number>`COUNT(${reviews.id})`.as('review_count'),
    hasActiveDeals: sql<boolean>`CASE WHEN COUNT(${deals.id}) > 0 THEN 1 ELSE 0 END`.as('has_active_deals'),
  })
    .from(businesses)
    .leftJoin(reviews, eq(businesses.id, reviews.businessId))
    .leftJoin(deals, and(
      eq(businesses.id, deals.businessId),
      eq(deals.isActive, true)
    ))
    .groupBy(businesses.id);

  const conditions = [];

  if (filters.category) {
    conditions.push(eq(businesses.category, filters.category));
  }

  if (filters.neighborhood) {
    conditions.push(eq(businesses.neighborhood, filters.neighborhood));
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }

  const results = query.all() as Array<{
    id: number;
    name: string;
    category: string;
    neighborhood: string;
    tagsCsv: string | null;
    avgRating: number;
    reviewCount: number;
    hasActiveDeals: boolean;
  }>;

  const scored: BusinessScore[] = results.map((b) => {
    let score = 0;
    const reasons: string[] = [];

    // Base score from ratings
    score += b.avgRating * 10;
    if (b.avgRating >= 4) {
      reasons.push(`highly rated (${b.avgRating.toFixed(1)} stars)`);
    }

    // Review count boost
    if (b.reviewCount >= 10) {
      score += 20;
      reasons.push(`well-reviewed (${b.reviewCount} reviews)`);
    } else if (b.reviewCount >= 5) {
      score += 10;
      reasons.push(`established (${b.reviewCount} reviews)`);
    }

    // Active deals boost
    if (b.hasActiveDeals && filters.dealsOnly) {
      score += 30;
      reasons.push('has active deals');
    } else if (b.hasActiveDeals) {
      score += 15;
      reasons.push('offers deals');
    }

    // Tag matching
    if (filters.tags && filters.tags.length > 0 && b.tagsCsv) {
      const businessTags = b.tagsCsv.toLowerCase().split(',').map(t => t.trim());
      const matchingTags = filters.tags.filter(tag => 
        businessTags.some(bt => bt.includes(tag.toLowerCase()))
      );
      if (matchingTags.length > 0) {
        score += matchingTags.length * 10;
        reasons.push(`matches your preferences: ${matchingTags.join(', ')}`);
      }
    }

    // Budget matching (simplified - in real app would use price data)
    if (filters.budget === 'low') {
      // Low budget businesses might have tags like "affordable", "cheap"
      if (b.tagsCsv?.toLowerCase().includes('affordable') || 
          b.tagsCsv?.toLowerCase().includes('cheap') ||
          b.tagsCsv?.toLowerCase().includes('budget')) {
        score += 15;
        reasons.push('affordable pricing');
      }
    }

    return {
      businessId: b.id,
      score,
      reasons,
    };
  });

  return scored.sort((a, b) => b.score - a.score);
}

/**
 * Parse natural language query into filters
 */
export function parseNaturalLanguageQuery(query: string): RecommendationFilters {
  const lowerQuery = query.toLowerCase();
  const filters: RecommendationFilters = {};

  // Categories
  const categories = ['food', 'restaurant', 'retail', 'service', 'coffee', 'shop', 'store'];
  for (const cat of categories) {
    if (lowerQuery.includes(cat)) {
      if (cat === 'food' || cat === 'restaurant') filters.category = 'Food & Dining';
      else if (cat === 'retail' || cat === 'shop' || cat === 'store') filters.category = 'Retail';
      else if (cat === 'service') filters.category = 'Services';
      else if (cat === 'coffee') {
        filters.category = 'Food & Dining';
        filters.tags = filters.tags || [];
        filters.tags.push('coffee');
      }
      break;
    }
  }

  // Neighborhoods
  const neighborhoods = [
    'carytown', 'short pump', 'the fan', 'shockoe', 'downtown', 'scott\'s addition',
    'museum district', 'church hill', 'jackson ward', 'oregon hill', 'west end'
  ];
  for (const hood of neighborhoods) {
    if (lowerQuery.includes(hood)) {
      filters.neighborhood = hood.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      break;
    }
  }

  // Budget indicators
  if (lowerQuery.includes('cheap') || lowerQuery.includes('affordable') || lowerQuery.includes('budget')) {
    filters.budget = 'low';
  } else if (lowerQuery.includes('expensive') || lowerQuery.includes('upscale')) {
    filters.budget = 'high';
  } else if (lowerQuery.includes('moderate') || lowerQuery.includes('mid')) {
    filters.budget = 'medium';
  }

  // Deals
  if (lowerQuery.includes('deal') || lowerQuery.includes('coupon') || lowerQuery.includes('discount')) {
    filters.dealsOnly = true;
  }

  // Tags/vibes
  const tagKeywords: Record<string, string[]> = {
    'family': ['family', 'family-friendly', 'kids'],
    'quiet': ['quiet', 'peaceful', 'calm'],
    'study': ['study', 'wifi', 'work'],
    'coffee': ['coffee', 'cafe', 'espresso'],
    'outdoor': ['outdoor', 'patio', 'terrace'],
  };

  const tags: string[] = [];
  for (const [tag, keywords] of Object.entries(tagKeywords)) {
    if (keywords.some(kw => lowerQuery.includes(kw))) {
      tags.push(tag);
    }
  }
  if (tags.length > 0) {
    filters.tags = tags;
  }

  return filters;
}
