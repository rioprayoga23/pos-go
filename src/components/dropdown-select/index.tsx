import {
  Popover,
  PopoverBackdrop,
  PopoverBody,
  PopoverContent,
  Text,
} from "@gluestack-ui/themed";
import { useMemo, useState } from "react";
import {
  ScrollView,
  useWindowDimensions,
  type LayoutChangeEvent,
  type StyleProp,
  type TextStyle,
} from "react-native";
import { colors, spacing } from "../../theme";
import { AppIcon, AppInput, AppPressable, type IconName } from "../ui";
import { styles } from "./styles";

export type DropdownOption<Value extends string> = {
  value: Value;
  label: string;
  detail?: string;
  accessibilityLabel?: string;
};

type DropdownSelectProps<Value extends string> = {
  options: readonly DropdownOption<Value>[];
  value: Value | "";
  onChange: (value: Value) => void;
  placeholder: string;
  accessibilityLabel: string;
  fullWidth?: boolean;
  minWidth?: number;
  leadingIcon?: IconName;
  triggerTextStyle?: StyleProp<TextStyle>;
  disabled?: boolean;
};

export function DropdownSelect<Value extends string>({
  options,
  value,
  onChange,
  placeholder,
  accessibilityLabel,
  fullWidth = true,
  minWidth,
  leadingIcon,
  triggerTextStyle,
  disabled = false,
}: DropdownSelectProps<Value>) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [triggerWidth, setTriggerWidth] = useState(0);
  const { width: viewportWidth, height: viewportHeight } = useWindowDimensions();
  const selected = options.find((option) => option.value === value);
  const label = selected?.label ?? (value || placeholder);
  const showSearch = true;
  const normalizedQuery = query.trim().toLocaleLowerCase();
  const filteredOptions = useMemo(() => {
    if (!normalizedQuery) return options;
    return options.filter((option) =>
      `${option.label} ${option.detail ?? ""}`
        .toLocaleLowerCase()
        .includes(normalizedQuery),
    );
  }, [normalizedQuery, options]);
  const availableWidth = Math.max(0, viewportWidth - spacing.lg * 2);
  const minimumWidth = minWidth ?? (fullWidth ? 0 : 190);
  const minimumPopupWidth = Math.min(240, availableWidth);
  const popupWidth = Math.min(
    Math.max(triggerWidth, minimumWidth, minimumPopupWidth),
    availableWidth,
  );
  const popupMaxHeight = Math.max(
    180,
    Math.min(320, viewportHeight - spacing.xxxl * 2),
  );
  const optionListMaxHeight = Math.max(
    96,
    popupMaxHeight - (showSearch ? 60 : 16),
  );

  const measureTrigger = (event: LayoutChangeEvent) => {
    setTriggerWidth(event.nativeEvent.layout.width);
  };

  return (
    <Popover
      size="full"
      placement="bottom left"
      offset={6}
      shouldFlip
      isOpen={isOpen}
      onOpen={() => {
        setQuery("");
        setIsOpen(true);
      }}
      onClose={() => {
        setIsOpen(false);
        setQuery("");
      }}
      trigger={(triggerProps) => (
        <AppPressable
          {...triggerProps}
          onLayout={measureTrigger}
          disabled={disabled}
          style={[
            styles.trigger,
            { minWidth: fullWidth ? 0 : minimumWidth },
            fullWidth && styles.triggerFullWidth,
            disabled && styles.triggerDisabled,
          ]}
          accessibilityRole="button"
          accessibilityLabel={`${accessibilityLabel}, ${selected?.label ?? placeholder}`}
          accessibilityState={{ expanded: isOpen, disabled }}
        >
          {leadingIcon ? (
            <AppIcon name={leadingIcon} size={16} color={colors.primary} />
          ) : null}
          <Text
            style={[
              styles.triggerText,
              triggerTextStyle,
              disabled && styles.triggerTextDisabled,
            ]}
            numberOfLines={1}
          >
            {label}
          </Text>
          <AppIcon
            name={isOpen ? "chevron-up" : "chevron-down"}
            size={16}
            color={colors.inkMuted}
          />
        </AppPressable>
      )}
    >
      <PopoverBackdrop style={styles.backdrop} />
      <PopoverContent
        style={[styles.popup, { width: popupWidth || availableWidth, maxHeight: popupMaxHeight }]}
      >
        <PopoverBody style={styles.popupBody}>
          {showSearch ? (
            <AppInput
              value={query}
              onChangeText={setQuery}
              placeholder="Cari pilihan"
              accessibilityLabel="Cari pilihan"
              variant="search"
              style={styles.searchInput}
              leading={<AppIcon name="magnify" size={16} color={colors.inkSubtle} />}
            />
          ) : null}
          <ScrollView
            style={[styles.optionList, { maxHeight: optionListMaxHeight }]}
            contentContainerStyle={styles.optionListContent}
            nestedScrollEnabled
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={filteredOptions.length > 6}
          >
            {filteredOptions.length ? filteredOptions.map((option) => {
              const isSelected = option.value === value;
              return (
                <AppPressable
                  key={option.value}
                  onPress={() => {
                    onChange(option.value);
                    setIsOpen(false);
                    setQuery("");
                  }}
                  style={[styles.option, isSelected && styles.optionSelected]}
                  accessibilityRole="button"
                  accessibilityLabel={option.accessibilityLabel ?? option.label}
                  accessibilityState={{ selected: isSelected }}
                >
                  <Text
                    style={[styles.optionLabel, isSelected && styles.optionLabelSelected]}
                    numberOfLines={1}
                  >
                    {option.label}
                  </Text>
                  {option.detail ? (
                    <Text style={styles.optionDetail} numberOfLines={1}>
                      {option.detail}
                    </Text>
                  ) : null}
                  <AppIcon
                    name={isSelected ? "check-circle" : "circle-outline"}
                    size={18}
                    color={isSelected ? colors.primary : colors.inkSubtle}
                  />
                </AppPressable>
              );
            }) : (
              <Text style={styles.emptyResult}>
                {normalizedQuery ? "Tidak ada hasil" : "Belum ada pilihan"}
              </Text>
            )}
          </ScrollView>
        </PopoverBody>
      </PopoverContent>
    </Popover>
  );
}
