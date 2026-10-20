import { Input, InputField, Text } from "@gluestack-ui/themed";
import { type ComponentProps, type ReactNode, type Ref, useState } from "react";
import {
  StyleProp,
  StyleSheet,
  type TextInput,
  TextStyle,
  ViewStyle,
} from "react-native";
import {
  colors,
  fieldHeight,
  inputHorizontalPadding,
  radius,
  spacing,
  typography,
} from "../../theme";

type AppInputProps = {
  value: string;
  onChangeText: (value: string) => void;
  placeholder?: string;
  placeholderTextColor?: string;
  keyboardType?: ComponentProps<typeof InputField>["keyboardType"];
  editable?: ComponentProps<typeof InputField>["editable"];
  multiline?: ComponentProps<typeof InputField>["multiline"];
  numberOfLines?: ComponentProps<typeof InputField>["numberOfLines"];
  autoCapitalize?: ComponentProps<typeof InputField>["autoCapitalize"];
  secureTextEntry?: ComponentProps<typeof InputField>["secureTextEntry"];
  returnKeyType?: ComponentProps<typeof InputField>["returnKeyType"];
  onSubmitEditing?: ComponentProps<typeof InputField>["onSubmitEditing"];
  inputRef?: Ref<TextInput>;
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
  multiline,
  numberOfLines,
  autoCapitalize,
  secureTextEntry,
  returnKeyType,
  onSubmitEditing,
  inputRef,
  accessibilityLabel,
  variant = "field",
  leading,
  trailing,
  style,
  inputStyle,
}: AppInputProps) {
  const [focused, setFocused] = useState(false);
  return (
    <Input
      style={[
        styles.appInput,
        variant === "search" && styles.appSearchInput,
        multiline && styles.appInputMultiline,
        style,
        editable === false && styles.appInputDisabled,
        focused && editable !== false && styles.appInputFocused,
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
        multiline={multiline}
        numberOfLines={numberOfLines}
        autoCapitalize={autoCapitalize}
        secureTextEntry={secureTextEntry}
        returnKeyType={returnKeyType}
        onSubmitEditing={onSubmitEditing}
        ref={inputRef as ComponentProps<typeof InputField>["ref"]}
        accessibilityLabel={accessibilityLabel}
        aria-label={accessibilityLabel}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        style={[
          styles.appInputField,
          multiline && styles.appInputFieldMultiline,
          inputStyle,
          editable === false && styles.appInputFieldDisabled,
        ]}
      />
      {trailing}
    </Input>
  );
}

export function FieldLabel({
  children,
  required = false,
  style,
}: {
  children: ReactNode;
  required?: boolean;
  style?: StyleProp<TextStyle>;
}) {
  return (
    <Text style={[styles.fieldLabel, style]}>
      {children}
      {required ? <Text style={styles.required}> *</Text> : null}
    </Text>
  );
}

const styles = StyleSheet.create({
  appInput: {
    height: fieldHeight,
    minHeight: fieldHeight,
    paddingHorizontal: inputHorizontalPadding,
    borderWidth: 1,
    borderColor: colors.lineStrong,
    borderRadius: radius.md,
    backgroundColor: colors.canvas,
    alignItems: "center",
    flexDirection: "row",
    gap: spacing.sm,
  },
  appSearchInput: {
    height: fieldHeight,
    minHeight: fieldHeight,
    borderColor: colors.lineStrong,
    backgroundColor: colors.canvas,
  },
  appInputMultiline: {
    height: 96,
    minHeight: 96,
    alignItems: "stretch",
    paddingVertical: spacing.sm,
  },
  appInputDisabled: {
    borderColor: colors.line,
    backgroundColor: colors.surfaceContainerLow,
  },
  appInputFocused: {
    borderColor: colors.primary,
    borderWidth: 2,
  },
  appInputField: {
    ...typography.input,
    flex: 1,
    minWidth: 0,
    paddingHorizontal: 0,
    paddingVertical: 0,
    color: colors.ink,
  },
  appInputFieldMultiline: {
    alignSelf: "stretch",
    textAlignVertical: "top",
    paddingVertical: spacing.xs,
  },
  appInputFieldDisabled: { color: colors.inkSubtle },
  fieldLabel: {
    color: colors.ink,
    ...typography.label,
    marginBottom: spacing.sm,
  },
  required: { color: colors.danger },
});
