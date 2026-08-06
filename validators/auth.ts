import { z } from 'zod';

export const UserRoleSchema = z.enum([
  'CUSTOMER',
  'ADMIN',
  'SHOP_MANAGER',
  'RIDER',
  'DECOR_MANAGER',
  'DECOR_STAFF'
]);

export const RegisterSchema = z.object({
  fullName: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string()
}).refine(data => data.password === data.confirmPassword, {
  message: "Passwords don't match",
  path: ['confirmPassword']
});

export const LoginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required')
});

export const AddressSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  phone: z.string().min(7, 'Invalid phone number'),
  alternative_phone: z.string().optional(),
  address_line_1: z.string().min(5, 'Address details required'),
  address_line_2: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  area: z.string().min(2, 'Area is required'),
  postal_code: z.string().optional(),
  delivery_instructions: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  is_default: z.boolean().default(false)
});
