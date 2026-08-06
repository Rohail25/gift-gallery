import { z } from 'zod';

export const BookingSchema = z.object({
  decor_package_id: z.number().int().positive('Package selection is required'),
  event_type_id: z.number().int().positive('Event type is required'),
  event_date: z.string().refine(val => new Date(val) > new Date(), {
    message: 'Event date must be in the future'
  }),
  event_start_time: z.string().optional(),
  event_end_time: z.string().optional(),
  guest_count: z.number().int().positive().optional(),
  venue_type: z.string().optional(),
  venue_name: z.string().optional(),
  theme_preferences: z.string().optional(),
  customer_notes: z.string().optional(),

  // Venue details (snapshot)
  contact_name: z.string().min(2, 'Name is required'),
  contact_phone: z.string().min(7, 'Phone number is invalid'),
  alternative_phone: z.string().optional(),
  address_line_1: z.string().min(2, 'Address details are too short'),
  address_line_2: z.string().optional(),
  city: z.string().min(2, 'City is required'),
  area: z.string().min(2, 'Area is required'),
  postal_code: z.string().optional(),
  venue_instructions: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional()
});
