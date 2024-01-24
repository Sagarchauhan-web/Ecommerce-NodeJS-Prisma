import { z } from 'zod';

enum OrderStatus {
  PENDING = 'PENDING',
  ACCEPTED = 'ACCEPTED',
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
}
export const OrderStatusUpdateSchema = z.object({
  status: z.enum([
    OrderStatus.ACCEPTED,
    OrderStatus.OUT_FOR_DELIVERY,
    OrderStatus.CANCELLED,
    OrderStatus.DELIVERED,
    OrderStatus.PENDING,
  ]),
});
