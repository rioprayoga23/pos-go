# YoSher Go Design System

YoSher Go uses the Stitch reference project `Tablet POS Interface` as its visual source of truth. The UI is designed for cafe operators on a tablet: high scanability, large touch targets, clear state colors, and a calm blue operational surface.

## Visual direction

- Modern blue workspace with white operational panels on a cool, pale canvas.
- Strong ink navy for headings and totals; muted blue-gray for supporting information.
- Rounded 12–16 px panels with restrained elevation and 1 px separators.
- Use color to communicate task state: blue for action, green for success/ready, amber for waiting, and red for destructive/error states.
- Keep data visible and direct. Avoid decorative gradients, dense shadows, and icon-only actions without labels or accessible labels.

## Color tokens

| Token | Value | Use |
| --- | --- | --- |
| `ink` | `#191C1E` | Primary heading, totals, dark QRIS panel |
| `inkMuted` | `#434655` | Supporting copy and labels |
| `inkSubtle` | `#737686` | Secondary metadata and table headers |
| `canvas` | `#F7F9FB` | App background |
| `surface` | `#FFFFFF` | Cards, inputs, content panels |
| `surfaceTint` | `#EFF6FF` | Active navigation and soft emphasis |
| `surfaceContainerLow` | `#F2F4F6` | Quiet controls and grouped surfaces |
| `primary` | `#2563EB` | Primary action, active tabs, links |
| `primaryDark` | `#004AC6` | Pressed/strong primary state |
| `success` | `#16A34A` | Ready, available, completed states |
| `successSoft` | `#D1FAE5` | Soft success surfaces |
| `warning` | `#D97706` | Waiting and timer states |
| `warningSoft` | `#FEF3C7` | Soft warning surfaces |
| `danger` | `#DC2626` | Delete and validation error states |
| `dangerSoft` | `#FEE2E2` | Soft danger surfaces |
| `line` | `#E2E8F0` | Borders and separators |

Tokens live in `src/theme/tokens.ts` and are merged into the Gluestack configuration in `src/theme/index.ts`. Screen files should import tokens instead of adding new raw colors.

## Typography

- Display: 28 px, 800 weight, used for screen titles.
- Title: 22 px, 800 weight, used for modal and prominent totals.
- Section: 18 px, 800 weight, used for panel headings.
- Body: 15 px, regular/600, used for primary copy.
- Body small: 13 px, regular/600, used for metadata.
- Label: 12 px, 700/800, used for fields, badges, and table headings.
- Caption: 11 px for supporting labels and compact metadata; micro: 10 px for dense table metadata and compact controls.
- Numeric: 24 px, 800, used for metric values.

Text should remain readable at tablet viewing distance. Keep supporting copy short and use `numberOfLines` only where truncation is intentional.

## Spacing and shape

Spacing uses a 4 px base: `xs 4`, `sm 8`, `md 12`, `lg 16`, `xl 20`, `xxl 24`, `xxxl 32`, `section 28`.

Radius tokens: `sm 8`, `md 12`, `lg 16`, `xl 22`, and `pill 999`. Use 12–16 px for content panels; reserve pills for filters, status, and compact controls.

Panels use a 1 px `line` border plus a soft blue-tinted elevation. Buttons use the same radius language and a soft primary shadow only for the primary action.

## Layout and breakpoints

- Compact tablet / portrait: below 960 px available width. Stack catalog and cart, use two-column product tiles, and let lists scroll horizontally when table content needs a minimum width.
- Expanded tablet / landscape: 960 px and above. Use catalog + cart split layout, three-column product tiles, and metric rows.
- Wide tablet: 1120 px and above. Increase catalog density to three columns and preserve a fixed, readable cart column.
- The root shell applies safe-area insets. Content uses flexible widths, wrapping, and minimum widths rather than fixed screen dimensions.

## Components

Gluestack UI is the primary component layer: `GluestackUIProvider`, `Box`/`VStack`/`HStack`, `Card`, `Button`, `Input`, `Modal`, `Switch`, `Pressable`, and `Text` are used throughout.

Reusable app components live in `src/components/ui.tsx`:

- `AppShell`: brand, route navigation, operator context, safe-area shell, and scroll container.
- `Panel`: shared white content surface with border and elevation.
- `SectionHeading`: heading/description/action composition.
- `MetricCard`: compact operational statistic.
- `StatusBadge`: consistent order-state label and icon.
- `EmptyState`: empty and recovery state pattern.
- `AppIcon`: MaterialCommunityIcons wrapper for one consistent icon system.

The thermal receipt is shared through `src/components/receipt/ReceiptPaper.tsx` by the payment preview and the history reprint dialog. `ReceiptPrintModal` presents the receipt and opens the platform print interface.

`DatePeriodFilter` in `src/components/date-period-filter/` is shared by Kelola Kas and the Kelola Stok mutation history. It pairs today/month presets with the shared date-range picker and uses the date-range helpers in `src/utils/date.ts`.

## Component states

- Default: white surface, `line` border, ink label.
- Pressed/active: `primary` background or `surfaceTint` background, higher text contrast.
- Focused: use Gluestack/native focus treatment; never remove the focus affordance.
- Disabled: lower opacity and no state-changing action. Disabled checkout is shown when the cart is empty.
- Loading: reserved for repository/API integration; current dummy data is synchronous.
- Error: inline red message next to the form that needs correction.
- Success: green status badge or confirmation modal with a next-step action.

## Accessibility and interaction rules

- Icon-only controls have an `accessibilityLabel`.
- Interactive controls use at least 48 dp of height or hit area.
- Never rely on color alone; status badges include text and icons.
- Use confirmation modals only for consequential actions such as closing a shift or deleting a menu item.
- Inputs use explicit labels and keyboard-friendly input types.
- Preserve task order in both orientations; landscape adds columns rather than hiding actions.
- The app uses Indonesian copy, IDR formatting, and explicit labels for cashier/barista workflows.

## Data and screen mapping

- `OrderScreen`: catalog, search, category filters, cart, quantity controls, and checkout handoff.
- `PaymentScreen`: QRIS dynamic-code mock, cash payment, customer detail, summary, and success confirmation.
- `QueueScreen`: active order metrics, filters, status progression, and barista actions.
- `HistoryScreen`: daily metrics, chart, payment distribution, recent transactions, and close-shift confirmation.
- `ProductsScreen`: search, category filters, product table, add/edit validation, availability switch, and delete confirmation.
