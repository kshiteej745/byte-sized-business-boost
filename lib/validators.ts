import { z } from 'zod';

// Business validation
export const businessSchema = z.object({
  name: z.string().min(1).max(200),
  category: z.string().min(1).max(100),
  neighborhood: z.string().min(1).max(100),
  address: z.string().min(1).max(500),
  phone: z.string().max(20).optional(),
  website: z.string().url().max(500).optional().or(z.literal('')),
  description: z.string().max(2000).optional(),
  tagsCsv: z.string().max(500).optional(),
});

// Review validation
export const reviewSchema = z.object({
  businessId: z.number().int().positive(),
  rating: z.number().int().min(1).max(5),
  title: z.string().min(1).max(200),
  body: z.string().min(1).max(2000),
  displayName: z.string().min(1).max(100),
});

// Profile validation
export const profileSchema = z.object({
  nickname: z.string().min(1).max(100).regex(/^[a-zA-Z0-9_\- ]+$/, 'Nickname can only contain letters, numbers, spaces, hyphens, and underscores'),
});

// Deal validation
export const dealSchema = z.object({
  businessId: z.number().int().positive(),
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  couponCode: z.string().max(100).optional(),
  expiresOn: z.string().datetime().optional(),
  isActive: z.boolean().optional(),
});

// Math challenge validation
export const mathChallengeSchema = z.object({
  answer: z.number().int(),
  token: z.string(),
});

// Admin login validation
export const adminLoginSchema = z.object({
  username: z.string(),
  password: z.string(),
});

// Report filters validation
export const reportFiltersSchema = z.object({
  category: z.string().optional(),
  neighborhood: z.string().optional(),
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  minReviews: z.number().int().min(0).optional(),
  activeDealsOnly: z.boolean().optional(),
  expiryWindow: z.number().int().min(1).max(365).optional(),
});
