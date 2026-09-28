import { HStack, Text, VStack } from '@gluestack-ui/themed';
import { memo } from 'react';
import { ScrollView } from 'react-native';
import { AppIcon, EmptyState, Panel } from '../../../components/ui';
import type { QueueOrder } from '../api';
import { colors } from '../../../theme';
import type { QueueTone } from '../types';
import { QueueTicket } from './QueueTicket';
import { styles } from '../styles';

type Props = {
  title: string;
  subtitle: string;
  tone: QueueTone;
  orders: QueueOrder[];
  emptyText: string;
  fillHeight: boolean;
  compactHeight: boolean;
  isMobile: boolean;
  isTablet: boolean;
  onAdvance: (id: string) => void;
  onTogglePreparedItem: (orderId: string, itemId: string, isPrepared: boolean) => void;
};

export const QueueColumn = memo(function QueueColumn({
  title, subtitle, tone, orders, emptyText, fillHeight, compactHeight, isMobile, isTablet, onAdvance, onTogglePreparedItem,
}: Props) {
  const meta = tone === 'waiting'
    ? { color: colors.warning, background: colors.warningSoft, icon: 'clipboard-text-outline' as const }
    : tone === 'preparing'
      ? { color: colors.primary, background: colors.surfaceTint, icon: 'progress-clock' as const }
      : { color: colors.success, background: colors.successSoft, icon: 'check-circle-outline' as const };
  const ticketContent = orders.length
    ? orders.map((order) => <QueueTicket key={order.id} order={order} isMobile={isMobile} isTablet={isTablet} onAdvance={onAdvance} onTogglePreparedItem={onTogglePreparedItem} />)
    : <EmptyState icon={meta.icon} title={emptyText} compact />;

  return (
    <Panel style={[styles.column, fillHeight && styles.columnFill, compactHeight && styles.columnCompact]} padding={12}>
      <HStack style={styles.columnHeader}>
        <HStack style={[styles.columnIcon, { backgroundColor: meta.background }]}><AppIcon name={meta.icon} size={20} color={meta.color} /></HStack>
        <VStack style={{ flex: 1, gap: 2 }}><Text style={[styles.columnTitle, isMobile && styles.columnTitleMobile, isTablet && styles.columnTitleTablet]}>{title}</Text><Text style={[styles.columnSubtitle, (isMobile || isTablet) && styles.columnSubtitleAdaptive]}>{subtitle}</Text></VStack>
        <HStack style={[styles.columnCount, { backgroundColor: meta.background }]}><Text style={[styles.columnCountText, { color: meta.color }]}>{orders.length}</Text></HStack>
      </HStack>
      {fillHeight
        ? <ScrollView style={styles.ticketListScroll} contentContainerStyle={styles.ticketList} showsVerticalScrollIndicator={false}>{ticketContent}</ScrollView>
        : <VStack style={styles.ticketList}>{ticketContent}</VStack>}
    </Panel>
  );
});
