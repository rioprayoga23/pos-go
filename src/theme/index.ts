import { config as gluestackBaseConfig } from "@gluestack-ui/config";
import { colors } from "./tokens";

export const posGluestackConfig = {
  ...gluestackBaseConfig,
  tokens: {
    ...gluestackBaseConfig.tokens,
    colors: {
      ...gluestackBaseConfig.tokens.colors,
      posInk: colors.ink,
      posCanvas: colors.canvas,
      posSurfaceTint: colors.surfaceTint,
      posPrimary: colors.primary,
      posPrimaryDark: colors.primaryDark,
      posLine: colors.line,
      posSuccess: colors.success,
      posSuccessText: colors.successText,
      posWarning: colors.warning,
      posWarningText: colors.warningText,
      posDanger: colors.danger,
      posDangerText: colors.dangerText,
    },
    fonts: {
      ...gluestackBaseConfig.tokens.fonts,
      body: "Inter_400Regular",
      heading: "Inter_600SemiBold",
    },
  },
};

export * from "./tokens";
