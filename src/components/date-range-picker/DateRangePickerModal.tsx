import {
  HStack,
  Modal,
  ModalBackdrop,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ScrollView,
  Text,
  VStack,
} from "@gluestack-ui/themed";
import { useState } from "react";
import { useWindowDimensions, View } from "react-native";
import { AppIcon, AppModalCloseButton, AppPressable as Pressable } from "../ui";
import { colors } from "../../theme";
import { dateFromKey, formatDateKey, getLocalDateKey } from "../../utils/date";
import type { DateRange } from "../../types/dateRange";
import { dateRangePickerStyles as styles } from "./styles";

const weekdays = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
const monthOptions = Array.from({ length: 12 }, (_, month) => ({
  value: month,
  label: new Intl.DateTimeFormat("id-ID", { month: "long" }).format(
    new Date(2024, month, 1),
  ),
}));
const currentYear = new Date().getFullYear();
const yearOptions = Array.from(
  { length: currentYear - 1979 },
  (_, index) => currentYear - index,
);

type CalendarView = "calendar" | "year" | "month";

type DraftRange = {
  startDate: string | null;
  endDate: string | null;
};

function getMonthDays(date: Date) {
  const year = date.getFullYear();
  const month = date.getMonth();
  const firstWeekday = (new Date(year, month, 1).getDay() + 6) % 7;
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cellCount = Math.ceil((firstWeekday + daysInMonth) / 7) * 7;

  return Array.from({ length: cellCount }, (_, index) => {
    const day = index - firstWeekday + 1;
    if (day < 1 || day > daysInMonth) return null;
    return getLocalDateKey(new Date(year, month, day, 12));
  });
}

export function DateRangePickerModal({
  isOpen,
  initialRange,
  onClose,
  onApply,
}: {
  isOpen: boolean;
  initialRange: DateRange;
  onClose: () => void;
  onApply: (range: DateRange) => void;
}) {
  const { height } = useWindowDimensions();
  const [draftRange, setDraftRange] = useState<DraftRange>(() => ({
    startDate: initialRange.startDate,
    endDate: initialRange.endDate,
  }));
  const [isPickingStart, setIsPickingStart] = useState(true);
  const [visibleMonth, setVisibleMonth] = useState(() => {
    const date = dateFromKey(initialRange.startDate);
    return new Date(date.getFullYear(), date.getMonth(), 1, 12);
  });
  const [calendarView, setCalendarView] = useState<CalendarView>("calendar");
  const [pickerYear, setPickerYear] = useState(() => visibleMonth.getFullYear());
  const monthDays = getMonthDays(visibleMonth);
  const monthLabel = new Intl.DateTimeFormat("id-ID", {
    month: "long",
    year: "numeric",
  }).format(visibleMonth);
  const hasCompleteRange = Boolean(draftRange.startDate && draftRange.endDate);
  const selectedRangeLabel = hasCompleteRange
    ? draftRange.startDate === draftRange.endDate
      ? formatDateKey(draftRange.startDate!)
      : `${formatDateKey(draftRange.startDate!)} – ${formatDateKey(draftRange.endDate!)}`
    : draftRange.startDate
      ? `${formatDateKey(draftRange.startDate)} – pilih tanggal akhir`
      : "Pilih tanggal mulai";

  const changeMonth = (amount: number) => {
    setVisibleMonth(
      (current) =>
        new Date(current.getFullYear(), current.getMonth() + amount, 1, 12),
    );
  };

  const openYearPicker = () => {
    setPickerYear(visibleMonth.getFullYear());
    setCalendarView("year");
  };

  const selectYear = (year: number) => {
    setPickerYear(year);
    setCalendarView("month");
  };

  const selectMonth = (month: number) => {
    setVisibleMonth(new Date(pickerYear, month, 1, 12));
    setCalendarView("calendar");
  };

  const selectDay = (dateKey: string) => {
    if (isPickingStart || !draftRange.startDate) {
      setDraftRange({ startDate: dateKey, endDate: null });
      setIsPickingStart(false);
      return;
    }

    setDraftRange(
      dateKey < draftRange.startDate
        ? { startDate: dateKey, endDate: draftRange.startDate }
        : { startDate: draftRange.startDate, endDate: dateKey },
    );
    setIsPickingStart(true);
  };

  const applyRange = () => {
    if (!draftRange.startDate || !draftRange.endDate) return;
    onApply({
      startDate: draftRange.startDate,
      endDate: draftRange.endDate,
    });
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="md">
      <ModalBackdrop />
      <ModalContent style={[styles.modal, { maxHeight: height - 32 }]}>
        <ModalHeader style={styles.header}>
          <VStack style={styles.heading}>
            <Text style={styles.title}>Pilih Rentang Tanggal</Text>
            <Text style={styles.subtitle}>Pilih tanggal awal dan akhir transaksi.</Text>
          </VStack>
          <AppModalCloseButton
            onPress={onClose}
            accessibilityLabel="Tutup pemilih tanggal"
          />
        </ModalHeader>

        <ModalBody style={styles.body}>
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={styles.scrollContent}
            showsVerticalScrollIndicator={false}
          >
            <VStack style={styles.selectedRange}>
              <Text style={styles.selectedLabel}>RENTANG DIPILIH</Text>
              <Text style={styles.selectedText}>{selectedRangeLabel}</Text>
            </VStack>

            {calendarView === "calendar" ? (
              <>
                <HStack style={styles.monthHeader}>
                  <Pressable
                    onPress={() => changeMonth(-1)}
                    style={styles.monthButton}
                    accessibilityRole="button"
                    accessibilityLabel="Bulan sebelumnya"
                  >
                    <AppIcon
                      name="chevron-left"
                      size={18}
                      color={colors.inkMuted}
                    />
                  </Pressable>
                  <Pressable
                    onPress={openYearPicker}
                    style={styles.monthTitleButton}
                    accessibilityRole="button"
                    accessibilityLabel={`Pilih bulan dan tahun, ${monthLabel}`}
                  >
                    <Text style={styles.monthTitle}>{monthLabel}</Text>
                    <AppIcon
                      name="chevron-down"
                      size={15}
                      color={colors.inkMuted}
                    />
                  </Pressable>
                  <Pressable
                    onPress={() => changeMonth(1)}
                    style={styles.monthButton}
                    accessibilityRole="button"
                    accessibilityLabel="Bulan berikutnya"
                  >
                    <AppIcon
                      name="chevron-right"
                      size={18}
                      color={colors.inkMuted}
                    />
                  </Pressable>
                </HStack>

                <View style={styles.weekdayRow}>
                  {weekdays.map((weekday) => (
                    <Text key={weekday} style={styles.weekday}>
                      {weekday}
                    </Text>
                  ))}
                </View>

                <View style={styles.dayGrid}>
                  {monthDays.map((dateKey, index) => {
                    if (!dateKey) {
                      return (
                        <View key={`empty-${index}`} style={styles.dayCell} />
                      );
                    }

                    const isStart = dateKey === draftRange.startDate;
                    const isEnd = dateKey === draftRange.endDate;
                    const isSelected = isStart || isEnd;
                    const isInRange = Boolean(
                      draftRange.startDate &&
                        draftRange.endDate &&
                        dateKey > draftRange.startDate &&
                        dateKey < draftRange.endDate,
                    );
                    const dayNumber = dateFromKey(dateKey).getDate();

                    return (
                      <View key={dateKey} style={styles.dayCell}>
                        <Pressable
                          onPress={() => selectDay(dateKey)}
                          style={[
                            styles.dayButton,
                            isInRange && styles.dayButtonInRange,
                            isSelected && styles.dayButtonSelected,
                          ]}
                          accessibilityRole="button"
                          accessibilityLabel={formatDateKey(dateKey)}
                          accessibilityState={{ selected: isSelected }}
                        >
                          <Text
                            style={[
                              styles.dayText,
                              isSelected && styles.dayTextSelected,
                            ]}
                          >
                            {dayNumber}
                          </Text>
                        </Pressable>
                      </View>
                    );
                  })}
                </View>
              </>
            ) : (
              <>
                <HStack style={styles.monthHeader}>
                  <Pressable
                    onPress={() =>
                      setCalendarView(
                        calendarView === "month" ? "year" : "calendar",
                      )
                    }
                    style={styles.monthButton}
                    accessibilityRole="button"
                    accessibilityLabel={
                      calendarView === "month"
                        ? "Kembali memilih tahun"
                        : "Kembali ke kalender"
                    }
                  >
                    <AppIcon
                      name="chevron-left"
                      size={18}
                      color={colors.inkMuted}
                    />
                  </Pressable>
                  <Text style={styles.monthTitle}>
                    {calendarView === "year"
                      ? "Pilih Tahun"
                      : `Pilih Bulan • ${pickerYear}`}
                  </Text>
                  <View style={styles.monthButton} />
                </HStack>

                {calendarView === "year" ? (
                  <View style={styles.yearGrid}>
                    {yearOptions.map((year) => {
                      const isSelected = year === pickerYear;

                      return (
                        <View key={year} style={styles.yearCell}>
                          <Pressable
                            onPress={() => selectYear(year)}
                            style={[
                              styles.selectorOption,
                              isSelected && styles.selectorOptionSelected,
                            ]}
                            accessibilityRole="button"
                            accessibilityLabel={`Tahun ${year}`}
                            accessibilityState={{ selected: isSelected }}
                          >
                            <Text
                              style={[
                                styles.selectorOptionText,
                                isSelected &&
                                  styles.selectorOptionTextSelected,
                              ]}
                            >
                              {year}
                            </Text>
                          </Pressable>
                        </View>
                      );
                    })}
                  </View>
                ) : (
                  <View style={styles.monthGrid}>
                    {monthOptions.map(({ value, label }) => {
                      const isSelected =
                        pickerYear === visibleMonth.getFullYear() &&
                        value === visibleMonth.getMonth();

                      return (
                        <View key={value} style={styles.monthCell}>
                          <Pressable
                            onPress={() => selectMonth(value)}
                            style={[
                              styles.selectorOption,
                              isSelected && styles.selectorOptionSelected,
                            ]}
                            accessibilityRole="button"
                            accessibilityLabel={`${label} ${pickerYear}`}
                            accessibilityState={{ selected: isSelected }}
                          >
                            <Text
                              style={[
                                styles.selectorOptionText,
                                isSelected &&
                                  styles.selectorOptionTextSelected,
                              ]}
                            >
                              {label}
                            </Text>
                          </Pressable>
                        </View>
                      );
                    })}
                  </View>
                )}
              </>
            )}
          </ScrollView>
        </ModalBody>

        <ModalFooter style={styles.footer}>
          <Pressable
            onPress={applyRange}
            disabled={!hasCompleteRange}
            style={[
              styles.applyButton,
              !hasCompleteRange && styles.applyButtonDisabled,
            ]}
            accessibilityRole="button"
            accessibilityState={{ disabled: !hasCompleteRange }}
          >
            <Text style={styles.applyText}>Terapkan</Text>
          </Pressable>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
