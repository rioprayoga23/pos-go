// Adapted from notion-DESIGN.md for a touch-first POS interface.
export const colors = {
  ink: '#1A1A1A',
  inkMuted: '#5D5B54',
  inkSubtle: '#787671',
  canvas: '#F6F5F4',
  surface: '#FFFFFF',
  surfaceTint: '#E6E0F5',
  surfaceBlue: '#DCECFA',
  surfaceContainerLow: '#FAFAF9',
  line: '#E5E3DF',
  lineStrong: '#C8C4BE',
  primary: '#5645D4',
  primaryDark: '#4534B3',
  primarySoft: '#E6E0F5',
  navy: '#0A1530',
  link: '#0075DE',
  cyan: '#2A9D99',
  success: '#1AAE39',
  successSoft: '#D9F3E1',
  warning: '#DD5B00',
  warningSoft: '#FFE8D4',
  danger: '#E03131',
  dangerSoft: '#FDE0EC',
  violet: '#7B3FF2',
  violetSoft: '#E6E0F5',
  tintPeach: '#FFE8D4',
  tintRose: '#FDE0EC',
  tintMint: '#D9F3E1',
  tintLavender: '#E6E0F5',
  tintSky: '#DCECFA',
  tintYellow: '#FEF7D6',
  tintYellowBold: '#F9E79F',
  tintCream: '#F8F5E8',
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

// Shared height for editable and select controls; also matches the minimum touch target.
export const fieldHeight = 44;

export const radius = {
  sm: 6,
  md: 8,
  lg: 12,
  xl: 16,
  pill: 999,
} as const;

export const type = {
  display: 28,
  title: 22,
  section: 18,
  body: 16,
  bodySmall: 14,
  label: 13,
  caption: 13,
  micro: 12,
  overline: 11,
  button: 14,
  amount: 20,
  numeric: 24,
} as const;

// Shared text roles keep common UI copy aligned across screens and components.
export const typography = {
  pageTitle: {
    fontSize: type.title,
    lineHeight: 29,
    fontWeight: "600" as const,
  },
  sectionTitle: {
    fontSize: type.section,
    lineHeight: 25,
    fontWeight: "600" as const,
  },
  body: {
    fontSize: type.body,
    lineHeight: 25,
    fontWeight: "400" as const,
  },
  description: {
    fontSize: type.bodySmall,
    lineHeight: 21,
    fontWeight: "400" as const,
  },
  label: {
    fontSize: type.label,
    lineHeight: 18,
    fontWeight: "600" as const,
  },
  input: {
    fontSize: type.bodySmall,
    lineHeight: 21,
    fontWeight: "400" as const,
  },
  helper: {
    fontSize: type.micro,
    lineHeight: 17,
    fontWeight: "400" as const,
  },
  button: {
    fontSize: type.button,
    lineHeight: 18,
    fontWeight: "500" as const,
  },
  compactButton: {
    fontSize: type.micro,
    lineHeight: 17,
    fontWeight: "600" as const,
  },
} as const;

export const elevation = {
  panel: {
    shadowColor: '#37352F',
    shadowOpacity: 0.035,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  button: {
    shadowColor: '#5645D4',
    shadowOpacity: 0.12,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
    elevation: 2,
  },
} as const;

export const tokens = {
  colors,
  spacing,
  radius,
  type,
  typography,
  elevation,
  fieldHeight,
};
