import type { OrderStatus } from '../../../types/pos';
import { colors } from '../../../theme';

export const QUEUE_ACTIONS: Record<
  OrderStatus,
  { label: string; icon: 'play' | 'check' | 'check-all'; color: string }
> = {
  waiting: { label: 'Mulai Buat (Bar #2)', icon: 'play', color: colors.warning },
  preparing: { label: 'Tandai Siap Ambil', icon: 'check', color: colors.primary },
  ready: { label: 'Selesai', icon: 'check-all', color: colors.success },
  completed: { label: 'Pesanan Selesai', icon: 'check-all', color: '#94A3B8' },
};
