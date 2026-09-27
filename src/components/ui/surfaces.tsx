import {
  Card,
  HStack,
  Text,
  VStack,
} from "@gluestack-ui/themed";
import { type ReactNode } from "react";
import {
  StyleProp,
  StyleSheet,
  View,
  ViewStyle,
} from "react-native";
import {
  colors,
  elevation,
  radius,
  spacing,
  type,
  typography,
} from "../../theme";
import { OrderStatus } from "../../types/pos";
import { AppIcon, IconName } from "./interactive";

export function Panel({
  children,
  style,
  padding = spacing.lg,
}: {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
  padding?: number;
}) {
  return <Card style={[styles.panel, { padding }, style]}>{children}</Card>;
}

export function SectionHeading({
  title,
  description,
  action,
}: {
  title: string;
  description?: string;
  action?: ReactNode;
}) {
  return (
    <HStack style={styles.headingRow}>
      <VStack style={{ flex: 1, gap: spacing.xs }}>
        <Text style={styles.sectionTitle}>{title}</Text>
        {description ? (
          <Text style={styles.sectionDescription}>{description}</Text>
        ) : null}
      </VStack>
      {action}
    </HStack>
  );
}

const statusMeta: Record<
  OrderStatus,
  { label: string; background: string; text: string; icon: IconName }
> = {
  waiting: {
    label: "Menunggu",
    background: colors.warningSoft,
    text: colors.warning,
    icon: "clock-outline",
  },
  preparing: {
    label: "Sedang dibuat",
    background: colors.surfaceTint,
    text: colors.primary,
    icon: "progress-clock",
  },
  ready: {
    label: "Siap disajikan",
    background: colors.successSoft,
    text: colors.success,
    icon: "check-circle-outline",
  },
  completed: {
    label: "Selesai",
    background: colors.successSoft,
    text: colors.success,
    icon: "check-all",
  },
};

export function StatusBadge({ status }: { status: OrderStatus }) {
  const meta = statusMeta[status];
  return (
    <HStack style={[styles.badge, { backgroundColor: meta.background }]}>
      <AppIcon name={meta.icon} size={14} color={meta.text} />
      <Text style={[styles.badgeText, { color: meta.text }]}>{meta.label}</Text>
    </HStack>
  );
}

export function MetricCard({
  label,
  value,
  helper,
  icon,
  tint = colors.primarySoft,
}: {
  label: string;
  value: string;
  helper?: string;
  icon: IconName;
  tint?: string;
}) {
  return (
    <Panel style={styles.metricCard} padding={spacing.lg}>
      <HStack style={styles.metricTop}>
        <HStack style={[styles.iconBubble, { backgroundColor: tint }]}>
          <AppIcon name={icon} size={20} color={colors.primary} />
        </HStack>
        {helper ? <Text style={styles.metricHelper}>{helper}</Text> : null}
      </HStack>
      <Text style={styles.metricValue}>{value}</Text>
      <Text style={styles.metricLabel}>{label}</Text>
    </Panel>
  );
}

export function EmptyState({
  icon = "archive-outline",
  title,
  description,
  action,
  compact = false,
}: {
  icon?: IconName;
  title: string;
  description?: string;
  action?: ReactNode;
  compact?: boolean;
}) {
  return (
    <VStack style={[styles.emptyState, compact && styles.emptyStateCompact]}>
      <HStack style={[styles.emptyIcon, compact && styles.emptyIconCompact]}>
        <AppIcon name={icon} size={compact ? 22 : 28} color={colors.primary} />
      </HStack>
      <Text style={[styles.emptyTitle, compact && styles.emptyTitleCompact]}>
        {title}
      </Text>
      {description ? (
        <Text style={styles.emptyDescription}>{description}</Text>
      ) : null}
      {action}
    </VStack>
  );
}

export function Divider() {
  return <View style={styles.divider} />;
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: colors.surface,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.line,
    ...elevation.panel,
  },
  headingRow: {
    alignItems: "center",
    gap: spacing.lg,
    marginBottom: spacing.lg,
  },
  sectionTitle: {
    color: colors.ink,
    ...typography.sectionTitle,
  },
  sectionDescription: {
    color: colors.inkMuted,
    ...typography.description,
  },
  badge: {
    minHeight: 34,
    alignItems: "center",
    justifyContent: "center",
    alignSelf: "flex-start",
    gap: 5,
    paddingHorizontal: spacing.sm,
    paddingVertical: 6,
    borderRadius: radius.sm,
  },
  badgeText: { ...typography.compactButton },
  metricCard: { flex: 1, minWidth: 170, gap: spacing.sm },
  metricTop: { alignItems: "center", justifyContent: "space-between" },
  iconBubble: {
    width: 38,
    height: 38,
    borderRadius: radius.md,
    alignItems: "center",
    justifyContent: "center",
  },
  metricHelper: { ...typography.compactButton, color: colors.success },
  metricValue: {
    color: colors.ink,
    fontSize: type.numeric,
    lineHeight: 30,
    fontWeight: "600",
    marginTop: spacing.sm,
  },
  metricLabel: {
    color: colors.inkMuted,
    fontSize: type.bodySmall,
    fontWeight: "600",
  },
  emptyState: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    gap: spacing.md,
    padding: spacing.xxxl,
    minHeight: 260,
  },
  emptyStateCompact: {
    minHeight: 128,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.lg,
    gap: spacing.sm,
  },
  emptyIcon: {
    width: 62,
    height: 62,
    backgroundColor: colors.primarySoft,
    borderRadius: 99,
    alignItems: "center",
    justifyContent: "center",
  },
  emptyIconCompact: { width: 44, height: 44 },
  emptyTitle: {
    color: colors.ink,
    ...typography.sectionTitle,
    textAlign: "center",
  },
  emptyTitleCompact: { fontSize: type.bodySmall, lineHeight: 21 },
  emptyDescription: {
    maxWidth: 360,
    color: colors.inkMuted,
    ...typography.description,
    textAlign: "center",
  },
  divider: { height: 1, backgroundColor: colors.line },
});
