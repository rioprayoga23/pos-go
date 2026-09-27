import { HStack, Text, VStack } from '@gluestack-ui/themed';
import { memo } from 'react';
import { AppIcon, Panel } from '../../../components/ui';
import { colors } from '../../../theme';
import { styles } from '../styles';

export const QueueSummary = memo(function QueueSummary({
  isWide,
  isMobile,
  isTablet,
  waitingCount,
  preparingCount,
  readyCount,
  activeCupCount,
}: {
  isWide: boolean;
  isMobile: boolean;
  isTablet: boolean;
  waitingCount: number;
  preparingCount: number;
  readyCount: number;
  activeCupCount: number;
}) {
  return (
    <Panel style={styles.summaryBar} padding={10}>
      <HStack style={[styles.summaryItems, !isWide && styles.summaryWrap]}>
        <SummaryItem label="TOTAL ANTREAN" value={String(waitingCount + preparingCount + readyCount)} helper={`${activeCupCount} Cup`} icon="clipboard-text-outline" tone="amber" isMobile={isMobile} isTablet={isTablet} />
        <SummaryItem label="SEDANG DIBUAT" value={String(preparingCount)} helper="Pesanan" icon="progress-clock" tone="blue" isMobile={isMobile} isTablet={isTablet} />
        <SummaryItem label="SIAP AMBIL" value={String(readyCount)} helper="Pesanan" icon="check-circle-outline" tone="green" isMobile={isMobile} isTablet={isTablet} />
      </HStack>
    </Panel>
  );
});

function SummaryItem({ label, value, helper, icon, tone, isMobile, isTablet }: {
  label: string;
  value: string;
  helper: string;
  icon: 'clipboard-text-outline' | 'progress-clock' | 'check-circle-outline';
  tone: 'blue' | 'amber' | 'green';
  isMobile: boolean;
  isTablet: boolean;
}) {
  const color = tone === 'blue' ? colors.primary : tone === 'amber' ? colors.warning : colors.success;
  const background = tone === 'blue' ? colors.surfaceTint : tone === 'amber' ? colors.warningSoft : colors.successSoft;
  return (
    <HStack style={[styles.summaryItem, { backgroundColor: background }]}>
      <HStack style={styles.summaryIcon}><AppIcon name={icon} size={21} color={color} /></HStack>
      <VStack style={{ flex: 1, gap: 2 }}>
        <Text style={[styles.summaryLabel, (isMobile || isTablet) && styles.summaryLabelAdaptive]}>{label}</Text>
        <HStack style={{ alignItems: 'baseline', gap: 6 }}>
          <Text style={[styles.summaryValue, isMobile && styles.summaryValueMobile, isTablet && styles.summaryValueTablet, { color }]}>{value}</Text>
          <Text style={[styles.summaryHelper, (isMobile || isTablet) && styles.summaryHelperAdaptive]}>{helper}</Text>
        </HStack>
      </VStack>
    </HStack>
  );
}
