import { Children, createContext, useContext, type ReactNode } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  View,
  useWindowDimensions,
} from "react-native";
import { AppPressable } from "../ui";
import { colors, spacing, typography } from "../../theme";
import { Root, useTabs, type TriggerProps } from "./context";

const FillContext = createContext(false);
function List({ children, label }: { children: ReactNode; label: string }) {
  const { width } = useWindowDimensions();
  const fill = width < 768 && Children.count(children) <= 2;
  return (
    <FillContext value={fill}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        accessibilityLabel={label}
        style={styles.list}
        contentContainerStyle={fill && { flexGrow: 1 }}
      >
        {children}
      </ScrollView>
    </FillContext>
  );
}
function Trigger({ value, children, disabled }: TriggerProps) {
  const tabs = useTabs();
  const fill = useContext(FillContext);
  const selected = tabs.value === value;
  return (
    <AppPressable
      preserveTouchSize
      disabled={disabled}
      accessibilityRole="tab"
      accessibilityState={{ selected, disabled }}
      onPress={() => tabs.onValueChange(value)}
      style={[
        styles.trigger,
        fill && { flex: 1 },
        selected && styles.selected,
        disabled && { opacity: 0.5 },
      ]}
    >
      <Text style={[styles.label, selected && { color: colors.primaryDark }]}>
        {children}
      </Text>
    </AppPressable>
  );
}
function Content({ value, children }: { value: string; children: ReactNode }) {
  const tabs = useTabs();
  return value === tabs.value ? (
    <View style={styles.content}>{children}</View>
  ) : null;
}
const styles = StyleSheet.create({
  list: { flexGrow: 0, borderBottomWidth: 1, borderBottomColor: colors.line },
  trigger: {
    minHeight: 48,
    paddingHorizontal: spacing.xl,
    justifyContent: "center",
    alignItems: "center",
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  selected: { borderBottomColor: colors.primary },
  label: { ...typography.button, color: colors.inkMuted },
  content: { paddingTop: spacing.xl },
});
export const Tabs = { Root, List, Trigger, Content };
