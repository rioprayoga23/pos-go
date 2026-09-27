import type { Order } from '../types/pos';
import { digitsOnly } from './format';

export function getNextOrderNumber(orders: Pick<Order, 'number'>[]): string {
  const highestOrder = orders.reduce((highest, order) => {
    const numeric = Number(digitsOnly(order.number));
    return Math.max(highest, Number.isFinite(numeric) ? numeric : 0);
  }, 0);

  return `#${String(highestOrder + 1).padStart(3, '0')}`;
}
