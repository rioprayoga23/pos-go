import { useMemo } from 'react';
import { useTransactionStore } from '../../../store/transactionStore';

export function useQueueBoard() {
  const orders = useTransactionStore((state) => state.orders);
  const advanceStatus = useTransactionStore((state) => state.advanceStatus);
  const togglePreparedItem = useTransactionStore((state) => state.togglePreparedItem);

  return useMemo(() => {
    const waiting = orders.filter((order) => order.status === 'waiting');
    const preparing = orders.filter((order) => order.status === 'preparing');
    const ready = orders.filter((order) => order.status === 'ready');

    return {
      waiting,
      preparing,
      ready,
      readyCount: ready.length,
      advanceStatus,
      togglePreparedItem,
    };
  }, [orders, advanceStatus, togglePreparedItem]);
}
