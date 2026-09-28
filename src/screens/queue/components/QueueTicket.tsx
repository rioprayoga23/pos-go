import { ButtonText, HStack, Text, VStack } from '@gluestack-ui/themed';
import { memo } from 'react';
import { AppButton as Button, AppIcon, AppPressable as Pressable, Panel, StatusBadge } from '../../../components/ui';
import type { QueueOrder } from '../api';
import { colors } from '../../../theme';
import { QUEUE_ACTIONS } from '../constants/actions';
import { styles } from '../styles';

type Props = {
  order: QueueOrder;
  isMobile: boolean;
  isTablet: boolean;
  onAdvance: (id: string) => void;
  onTogglePreparedItem: (orderId: string, itemId: string, isPrepared: boolean) => void;
};

export const QueueTicket = memo(function QueueTicket({ order, isMobile, isTablet, onAdvance, onTogglePreparedItem }: Props) {
  const completed = order.status === 'completed';
  const preparedCount = order.items.filter((item) => item.isPrepared).length;
  const totalMenus = order.items.length;
  const actionDisabled = completed || (order.status === 'preparing' && preparedCount < totalMenus);
  const action = QUEUE_ACTIONS[order.status];
  const totalCups = order.items.reduce((sum, item) => sum + item.quantity, 0);
  const createdTime = new Date(order.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' });

  return (
    <Panel style={[styles.ticket, order.status === 'waiting' && styles.waitingTicket, order.status === 'preparing' && styles.preparingTicket, order.status === 'ready' && styles.readyTicket, completed && styles.completedTicket]} padding={14}>
      <HStack style={styles.ticketTop}>
        <VStack style={{ gap: 3 }}>
          <Text style={[styles.ticketNumber, isMobile && styles.ticketNumberMobile, isTablet && styles.ticketNumberTablet, order.status === 'preparing' && { color: colors.primary }, order.status === 'ready' && { color: colors.success }, completed && styles.completedText]}>{order.number}</Text>
          <Text style={[styles.ticketTime, (isMobile || isTablet) && styles.ticketTimeAdaptive, isTablet && styles.ticketTimeTablet]}>{createdTime} • {totalCups} Cup</Text>
        </VStack>
        <StatusBadge status={order.status} />
      </HStack>
      {order.status === 'preparing' ? <HStack style={styles.progressCount}><Text style={[styles.progressCountText, (isMobile || isTablet) && styles.progressCountTextAdaptive]}>{preparedCount} / {totalMenus} Menu Selesai</Text></HStack> : null}
      <VStack style={styles.ticketItems}>{order.items.map((item) => {
        const itemPrepared = order.status === 'ready' || completed || item.isPrepared;
        const canToggleItem = order.status === 'preparing';
        return (
          <HStack key={item.id} style={styles.ticketItem}>
            <Pressable
              onPress={() => onTogglePreparedItem(order.id, item.id, !item.isPrepared)}
              disabled={!canToggleItem}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: itemPrepared, disabled: !canToggleItem }}
              accessibilityLabel={`${item.productName}, ${itemPrepared ? 'sudah dibuat' : 'belum dibuat'}`}
              style={styles.itemCheckTarget}
            >
              <HStack style={[styles.itemCheck, itemPrepared && (order.status === 'ready' || completed ? styles.itemCheckReady : styles.itemCheckDone), canToggleItem && !itemPrepared && styles.itemCheckOpen]}>
                {itemPrepared ? <AppIcon name="check" size={12} color={colors.white} /> : null}
              </HStack>
            </Pressable>
            <VStack style={styles.itemCopy}>
              <Text style={[styles.itemName, (isMobile || isTablet) && styles.itemNameAdaptive, completed && styles.completedText]}>{item.quantity}x {item.productName}</Text>
            </VStack>
            {itemPrepared ? <HStack style={styles.preparedBadge}><Text style={[styles.preparedBadgeText, (isMobile || isTablet) && styles.preparedBadgeTextAdaptive]}>Selesai</Text></HStack> : null}
          </HStack>
        );
      })}</VStack>
      {order.status === 'preparing' ? <VStack style={styles.progressTrack}><VStack style={[styles.progressFill, { width: `${totalMenus ? (preparedCount / totalMenus) * 100 : 0}%` }]} /></VStack> : null}
      <Button onPress={() => onAdvance(order.id)} isDisabled={actionDisabled} style={[styles.ticketButton, { backgroundColor: action.color }, actionDisabled && styles.disabledButton]}>
        <ButtonText style={[styles.ticketButtonText, (isMobile || isTablet) && styles.ticketButtonTextAdaptive, actionDisabled && styles.disabledButtonText]}>{action.label}</ButtonText>
        <AppIcon name={action.icon} size={15} color={actionDisabled ? colors.ink : colors.white} />
      </Button>
    </Panel>
  );
});
