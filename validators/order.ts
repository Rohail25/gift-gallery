import { z } from 'zod';

export const CheckoutSchema = z.object({
  customerAddressId: z.number().int().positive('Delivery address is required'),
  paymentMethod: z.enum(['cod']),
  customerNote: z.string().optional()
});
