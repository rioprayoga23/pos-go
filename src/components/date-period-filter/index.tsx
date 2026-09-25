import { Text } from "@gluestack-ui/themed";
import { useWindowDimensions } from "react-native";
import type { DatePeriod, DatePeriodPreset, DateRange } from "../../types/dateRange";
import { formatDateKey } from "../../utils/date";
import { SegmentedFilterGroup, type SegmentedFilterOption } from "../segmented-filter";
import { AppIcon, AppPressable } from "../ui";
import { colors } from "../../theme";
import { styles } from "./styles";

function formatRangeLabel(range: DateRange) {
  const start = formatDateKey(range.startDate);
  const end = formatDateKey(range.endDate);
  if (range.startDate === range.endDate) return start;
  const startWithoutYear = start.replace(/\s\d{4}$/, "");
  return `${startWithoutYear} – ${end}`;
}

export function DateRangeButton({
  dateRange,
  onPress,
  selected = false,
}: {
  dateRange: DateRange;
  onPress: () => void;
  selected?: boolean;
}) {
  const { width } = useWindowDimensions();
  const isPhone = width < 620;
  const rangeLabel = formatRangeLabel(dateRange);

  return (
    <AppPressable
      onPress={onPress}
      style={[
        styles.button,
        styles.rangeButtonStandalone,
        isPhone && styles.rangeButtonPhone,
        selected && styles.buttonActive,
      ]}
      accessibilityRole="button"
      accessibilityLabel={`Pilih rentang tanggal, ${rangeLabel}`}
      accessibilityState={{ selected }}
    >
      <AppIcon
        name="calendar-outline"
        size={15}
        color={selected ? colors.primary : colors.inkSubtle}
      />
      <Text
        style={[
          styles.buttonText,
          styles.rangeText,
          styles.rangeButtonStandaloneText,
          selected && styles.buttonTextActive,
        ]}
        numberOfLines={1}
      >
        {rangeLabel}
      </Text>
    </AppPressable>
  );
}

export function DatePeriodFilter({
  period,
  dateRange,
  onSelectPreset,
  onOpenDatePicker,
}: {
  period: DatePeriod;
  dateRange: DateRange;
  onSelectPreset: (period: DatePeriodPreset) => void;
  onOpenDatePicker: () => void;
}) {
  const rangeLabel = formatRangeLabel(dateRange);
  const options: SegmentedFilterOption<DatePeriod>[] = [
    { key: "today", label: "Hari ini" },
    { key: "month", label: "Bulan ini" },
    {
      key: "custom",
      label: rangeLabel,
      icon: "calendar-outline",
      accessibilityLabel: `Pilih rentang tanggal, ${rangeLabel}`,
    },
  ];

  return (
    <SegmentedFilterGroup
      options={options}
      value={period}
      onChange={(value) => {
        if (value === "custom") onOpenDatePicker();
        else onSelectPreset(value);
      }}
      accessibilityLabel="Filter periode"
      backgroundColor={colors.white}
      color={colors.inkMuted}
      height={44}
      minHeight={34}
    />
  );
}
