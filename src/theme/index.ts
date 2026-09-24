import { config as gluestackBaseConfig } from '@gluestack-ui/config';
import { colors } from './tokens';

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
      posWarning: colors.warning,
      posDanger: colors.danger,
    },
    fonts: {
      ...gluestackBaseConfig.tokens.fonts,
      body: 'Inter_400Regular',
      heading: 'PlusJakartaSans_700Bold',
    },
  },
};

export * from './tokens';
