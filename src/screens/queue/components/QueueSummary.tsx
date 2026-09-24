import { HStack, Text, VStack } from '@gluestack-ui/themed';
import { memo } from 'react';
import { AppIcon, Panel } from '../../../components/ui';
import { colors } from '../../../theme';
import { styles } from '../styles';

export const QueueSummary = memo(function QueueSummary({
  isWide,
}: {
  isWide: boolean;
}) {
  return (
    <Panel style={styles.summaryBar} padding={10}>
      <HStack style={[styles.summaryItems, !isWide && styles.summaryWrap]}>
        <SummaryItem label="TOTAL ANTREAN" value="8" helper="18 Cup" icon="clipboard-text-outline" tone="amber" />
        <SummaryItem label="SEDANG DIBUAT" value="3" helper="Pesanan" icon="progress-clock" tone="blue" />
        <SummaryItem label="SIAP AMBIL" value="4" helper="Pesanan" icon="check-circle-outline" tone="green" />
      </HStack>
    </Panel>
  );
});

function SummaryItem({ label, value, helper, icon, tone }: {
  label: string;
  value: string;
  helper: string;
  icon: 'clipboard-text-outline' | 'progress-clock' | 'check-circle-outline';
  tone: 'blue' | 'amber' | 'green';
}) {
  const color = tone === 'blue' ? colors.primary : tone === 'amber' ? colors.warning : colors.success;
  const background = tone === 'blue' ? colors.surfaceTint : tone === 'amber' ? colors.warningSoft : colors.successSoft;
  return (
    <HStack style={[styles.summaryItem, { backgroundColor: background }]}>
      <HStack style={styles.summaryIcon}><AppIcon name={icon} size={21} color={color} /></HStack>
      <VStack style={{ flex: 1, gap: 2 }}>
        <Text style={styles.summaryLabel}>{label}</Text>
        <HStack style={{ alignItems: 'baseline', gap: 6 }}>
          <Text style={[styles.summaryValue, { color }]}>{value}</Text>
          <Text style={styles.summaryHelper}>{helper}</Text>
        </HStack>
      </VStack>
    </HStack>
  );
}
