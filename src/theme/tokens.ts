export const colors = {
  ink: '#191C1E',
  inkMuted: '#434655',
  inkSubtle: '#737686',
  canvas: '#F7F9FB',
  surface: '#FFFFFF',
  surfaceTint: '#EFF6FF',
  surfaceBlue: '#DBEAFE',
  surfaceContainerLow: '#F2F4F6',
  line: '#E2E8F0',
  primary: '#2563EB',
  primaryDark: '#004AC6',
  primarySoft: '#DBEAFE',
  cyan: '#2563EB',
  success: '#16A34A',
  successSoft: '#D1FAE5',
  warning: '#D97706',
  warningSoft: '#FEF3C7',
  danger: '#DC2626',
  dangerSoft: '#FEE2E2',
  violet: '#2C4BB9',
  violetSoft: '#E0E7FF',
  white: '#FFFFFF',
  black: '#000000',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
  section: 28,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 22,
  pill: 999,
} as const;

export const type = {
  display: 28,
  title: 22,
  section: 18,
  body: 15,
  bodySmall: 14,
  label: 13,
  caption: 12,
  micro: 11,
  numeric: 24,
} as const;

export const elevation = {
  panel: {
    shadowColor: '#0F172A',
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  button: {
    shadowColor: '#2563EB',
    shadowOpacity: 0.16,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 5 },
    elevation: 3,
  },
} as const;

export const tokens = { colors, spacing, radius, type, elevation };
