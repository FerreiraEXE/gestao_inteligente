import { Order, OrderItem } from '@/types';

/** Calculate the final total for an order */
export function calculateOrderTotal(
  items: OrderItem[],
  discount: number,
  tax: number,
  shipping: number
): number {
  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  return subtotal - discount + tax + shipping;
}

/** Generate the next order number based on existing orders */
export function generateOrderNumber(orders: Order[]): string {
  const prefix = 'ORD';
  if (orders.length === 0) {
    return `${prefix}-001`;
  }

  const latest = [...orders].sort((a, b) =>
    b.orderNumber.localeCompare(a.orderNumber)
  )[0];

  const latestNumber = parseInt(latest.orderNumber.split('-')[1], 10);
  const nextNumber = (latestNumber + 1).toString().padStart(3, '0');

  return `${prefix}-${nextNumber}`;
}
