import { useMemo } from 'react';
import { useTransactionStore } from '../../../store/transactionStore';

export function useQueueBoard() {
  const orders = useTransactionStore((state) => state.orders);
  const advanceStatus = useTransactionStore((state) => state.advanceStatus);
  const togglePreparedItem = useTransactionStore((state) => state.togglePreparedItem);

  return useMemo(() => {
    const waiting = orders.filter((order) => order.status === 'waiting');
    const preparing = orders.filter((order) => order.status === 'preparing');
    const readyOrders = orders.filter((order) => order.status === 'ready');
    const lastCompleted = orders.find(
      (order) => order.number === '#A-040' && order.status === 'completed',
    );

    return {
      waiting,
      preparing,
      ready: lastCompleted ? [...readyOrders, lastCompleted] : readyOrders,
      readyCount: readyOrders.length,
      advanceStatus,
      togglePreparedItem,
    };
  }, [orders, advanceStatus, togglePreparedItem]);
}
