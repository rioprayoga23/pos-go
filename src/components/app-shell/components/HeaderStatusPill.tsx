import { Text } from "@gluestack-ui/themed";
import { View } from "react-native";
import { colors } from "../../../theme";
import { AppIcon, AppPressable, type IconName } from "../../ui";
import { styles } from "../styles";

type Props = {
  icon: IconName;
  label: string;
  tone: "primary" | "danger" | "success";
  compact?: boolean;
  mobile?: boolean;
  onPress?: () => void;
};

export function HeaderStatusPill({
  icon,
  label,
  tone,
  compact = false,
  mobile = false,
  onPress,
}: Props) {
  const toneStyle =
    tone === "danger"
      ? styles.headerPillDanger
      : tone === "success"
        ? styles.headerPillSuccess
        : styles.headerPillPrimary;
  const textStyle =
    tone === "danger"
      ? styles.headerPillDangerText
      : tone === "success"
        ? styles.headerPillSuccessText
        : styles.headerPillPrimaryText;
  const iconColor =
    tone === "danger"
      ? colors.danger
      : tone === "success"
        ? colors.inkMuted
        : colors.primary;
  const pillStyle = [
    styles.headerPill,
    toneStyle,
    compact && styles.headerPillCompact,
    mobile && !compact && styles.headerPillMobile,
  ];
  const content = (
    <>
      <AppIcon name={icon} size={16} color={iconColor} />
      {!compact ? (
        <Text style={[styles.headerPillText, textStyle]} numberOfLines={1}>
          {label}
        </Text>
      ) : null}
    </>
  );

  return onPress ? (
    <AppPressable
      onPress={onPress}
      style={pillStyle}
      accessibilityRole="button"
      accessibilityLabel={label}
    >
      {content}
    </AppPressable>
  ) : (
    <View style={pillStyle}>{content}</View>
  );
}
