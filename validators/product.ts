import { z } from 'zod';

export const ProductSchema = z.object({
  product_category_id: z.number().int().positive(),
  name: z.string().min(2, 'Name is too short'),
  slug: z.string().min(2, 'Slug is too short'),
  sku: z.string().min(2, 'SKU is required'),
  short_description: z.string().optional(),
  description: z.string().optional(),
  regular_price: z.number().positive('Regular price must be greater than zero'),
  sale_price: z.number().positive().optional().nullable(),
  cost_price: z.number().positive().optional().nullable(),
  stock_quantity: z.number().int().nonnegative('Stock cannot be negative'),
  low_stock_threshold: z.number().int().nonnegative(),
  weight_grams: z.number().int().positive().optional(),
  is_featured: z.boolean().default(false),
  is_visible: z.boolean().default(true),
  status: z.enum(['draft', 'active', 'inactive', 'archived']).default('active'),
  meta_title: z.string().optional(),
  meta_description: z.string().optional()
}).refine(data => {
  if (data.sale_price && data.sale_price >= data.regular_price) {
    return false;
  }
  return true;
}, {
  message: 'Sale price must be lower than regular price',
  path: ['sale_price']
});
