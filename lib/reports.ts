import { eq, and, sql, gte, lte, desc, asc } from 'drizzle-orm';
import { db } from './db';
import { businesses, reviews, deals, favorites } from './schema';

export interface ReportFilters {
  category?: string;
  neighborhood?: string;
  startDate?: Date;
  endDate?: Date;
  minReviews?: number;
  activeDealsOnly?: boolean;
  expiryWindow?: number; // days
}

/**
 * Get top businesses by average rating
 */
export function getTopRatedBusinesses(filters: ReportFilters) {
  let query = db.select({
    id: businesses.id,
    name: businesses.name,
    category: businesses.category,
    neighborhood: businesses.neighborhood,
    avgRating: sql<number>`COALESCE(AVG(${reviews.rating}), 0)`.as('avg_rating'),
    reviewCount: sql<number>`COUNT(DISTINCT ${reviews.id})`.as('review_count'),
  })
    .from(businesses)
    .leftJoin(reviews, eq(businesses.id, reviews.businessId))
    .groupBy(businesses.id);

  const conditions = [];

  if (filters.category) {
    conditions.push(eq(businesses.category, filters.category));
  }

  if (filters.neighborhood) {
    conditions.push(eq(businesses.neighborhood, filters.neighborhood));
  }

  if (filters.startDate) {
    conditions.push(gte(reviews.createdAt, filters.startDate));
  }

  if (filters.endDate) {
    conditions.push(lte(reviews.createdAt, filters.endDate));
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }

  const results = query.all() as Array<{
    id: number;
    name: string;
    category: string;
    neighborhood: string;
    avgRating: number;
    reviewCount: number;
  }>;

  // Filter by min reviews and sort
  let filtered = results.filter(b => b.reviewCount >= (filters.minReviews || 0));
  filtered = filtered.sort((a, b) => {
    if (Math.abs(a.avgRating - b.avgRating) < 0.01) {
      return b.reviewCount - a.reviewCount;
    }
    return b.avgRating - a.avgRating;
  });

  return filtered;
}

/**
 * Get most reviewed businesses
 */
export function getMostReviewedBusinesses(filters: ReportFilters) {
  let query = db.select({
    id: businesses.id,
    name: businesses.name,
    category: businesses.category,
    neighborhood: businesses.neighborhood,
    reviewCount: sql<number>`COUNT(${reviews.id})`.as('review_count'),
    avgRating: sql<number>`COALESCE(AVG(${reviews.rating}), 0)`.as('avg_rating'),
  })
    .from(businesses)
    .leftJoin(reviews, eq(businesses.id, reviews.businessId))
    .groupBy(businesses.id);

  const conditions = [];

  if (filters.category) {
    conditions.push(eq(businesses.category, filters.category));
  }

  if (filters.neighborhood) {
    conditions.push(eq(businesses.neighborhood, filters.neighborhood));
  }

  if (filters.startDate) {
    conditions.push(gte(reviews.createdAt, filters.startDate));
  }

  if (filters.endDate) {
    conditions.push(lte(reviews.createdAt, filters.endDate));
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }

  const results = query.all() as Array<{
    id: number;
    name: string;
    category: string;
    neighborhood: string;
    reviewCount: number;
    avgRating: number;
  }>;

  let filtered = results.filter(b => b.reviewCount >= (filters.minReviews || 0));
  filtered = filtered.sort((a, b) => b.reviewCount - a.reviewCount);

  return filtered;
}

/**
 * Get category distribution
 */
export function getCategoryDistribution(filters: ReportFilters) {
  let query = db.select({
    category: businesses.category,
    count: sql<number>`COUNT(*)`.as('count'),
  })
    .from(businesses)
    .groupBy(businesses.category);

  const conditions = [];

  if (filters.neighborhood) {
    conditions.push(eq(businesses.neighborhood, filters.neighborhood));
  }

  if (conditions.length > 0) {
    query = query.where(and(...conditions)) as any;
  }

  return query.all() as Array<{ category: string; count: number }>;
}

/**
 * Get deals expiring soon
 */
export function getExpiringDeals(filters: ReportFilters) {
  const expiryDate = new Date();
  expiryDate.setDate(expiryDate.getDate() + (filters.expiryWindow || 7));

  let query = db.select({
    dealId: deals.id,
    dealTitle: deals.title,
    couponCode: deals.couponCode,
    expiresOn: deals.expiresOn,
    isActive: deals.isActive,
    businessId: businesses.id,
    businessName: businesses.name,
    category: businesses.category,
    neighborhood: businesses.neighborhood,
  })
    .from(deals)
    .innerJoin(businesses, eq(deals.businessId, businesses.id))
    .where(and(
      eq(deals.isActive, true),
      deals.expiresOn ? lte(deals.expiresOn, expiryDate) : sql`1=0`
    ));

  const conditions = [];

  if (filters.category) {
    conditions.push(eq(businesses.category, filters.category));
  }

  if (filters.neighborhood) {
    conditions.push(eq(businesses.neighborhood, filters.neighborhood));
  }

  if (conditions.length > 0) {
    query = query.where(and(...query as any, ...conditions)) as any;
  }

  return query.all();
}

/**
 * Get most favorited businesses
 */
export function getMostFavoritedBusinesses(filters: ReportFilters) {
  let query = db.select({
    id: businesses.id,
    name: businesses.name,
    category: businesses.category,
    neighborhood: businesses.neighborhood,
    favoriteCount: sql<number>`COUNT(DISTINCT ${favorites.id})`.as('favorite_count'),
  })
    .from(businesses)
    .leftJoin(favorites, eq(businesses.id, favorites.businessId))
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
    favoriteCount: number;
  }>;

  return results
    .filter(b => b.favoriteCount > 0)
    .sort((a, b) => b.favoriteCount - a.favoriteCount);
}

/**
 * Convert data to CSV format
 */
export function toCSV<T extends Record<string, any>>(data: T[], headers: string[]): string {
  const rows = data.map(row => 
    headers.map(header => {
      const value = row[header];
      if (value === null || value === undefined) return '';
      const str = String(value);
      // Escape quotes and wrap in quotes if contains comma or quote
      if (str.includes(',') || str.includes('"') || str.includes('\n')) {
        return `"${str.replace(/"/g, '""')}"`;
      }
      return str;
    }).join(',')
  );

  return [headers.join(','), ...rows].join('\n');
}
