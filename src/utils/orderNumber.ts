import type { Order } from '../types/pos';

export function getNextOrderNumber(orders: Pick<Order, 'number'>[]): string {
  const highestOrder = orders.reduce((highest, order) => {
    const numeric = Number(order.number.replace(/\D/g, ''));
    return Math.max(highest, Number.isFinite(numeric) ? numeric : 0);
  }, 0);

  return `#${String(highestOrder + 1).padStart(3, '0')}`;
}
