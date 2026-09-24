import { Input, InputField, Text } from "@gluestack-ui/themed";
import { type ComponentProps, type ReactNode } from "react";
import {
  StyleProp,
  StyleSheet,
  TextStyle,
  ViewStyle,
} from "react-native";
import { colors, radius, spacing, type } from "../../theme";

type AppInputProps = {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  placeholderTextColor?: string;
  keyboardType?: ComponentProps<typeof InputField>["keyboardType"];
  editable?: ComponentProps<typeof InputField>["editable"];
  autoCapitalize?: ComponentProps<typeof InputField>["autoCapitalize"];
  accessibilityLabel?: string;
  variant?: "field" | "search";
  leading?: ReactNode;
  trailing?: ReactNode;
  style?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
};

export function AppInput({
  value,
  onChangeText,
  placeholder,
  placeholderTextColor = colors.inkSubtle,
  keyboardType,
  editable,
  autoCapitalize,
  accessibilityLabel,
  variant = "field",
  leading,
  trailing,
  style,
  inputStyle,
}: AppInputProps) {
  return (
    <Input
      style={[
        styles.appInput,
        variant === "search" && styles.appSearchInput,
        style,
      ]}
    >
      {leading}
      <InputField
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={placeholderTextColor}
        keyboardType={keyboardType}
        editable={editable}
        autoCapitalize={autoCapitalize}
        accessibilityLabel={accessibilityLabel}
        style={[styles.appInputField, inputStyle]}
      />
      {trailing}
    </Input>
  );
}

export function FieldLabel({ children }: { children: ReactNode }) {
  return <Text style={styles.fieldLabel}>{children}</Text>;
}

const styles = StyleSheet.create({
  appInput: {
    minHeight: 48,
    paddingHorizontal: spacing.md,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: radius.md,
    backgroundColor: colors.white,
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
  },
  appSearchInput: {
    minHeight: 44,
    borderWidth: 0,
    borderRadius: radius.pill,
    backgroundColor: colors.surfaceContainerLow,
  },
  appInputField: {
    flex: 1,
    minWidth: 0,
    paddingVertical: 0,
    color: colors.ink,
    fontSize: type.bodySmall,
  },
  fieldLabel: {
    color: colors.ink,
    fontSize: 12,
    fontWeight: "800",
    marginBottom: spacing.sm,
  },
});
