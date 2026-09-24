# YoSher Go visual direction

<!-- impeccable:design-schema 1 -->

## Mode

Operate: a shared cafe tablet used under time pressure. Scanability and state clarity outrank decorative expression.

## World

The interface extends the supplied Stitch Tablet POS reference: a blue service console with white work surfaces, navy operational text, quiet separators, compact status pills, and a dark QRIS confirmation surface. It treats the tablet as a counter instrument rather than a mobile screen stretched to fill space.

## First viewport

The order screen leads with a clear `Kasir cepat` task heading, a searchable menu catalog, active category filters, and a persistent new-order cart. On expanded widths the catalog and cart form a split workspace; on smaller tablets the cart follows the catalog without dropping any action.

## Signature interaction

An order moves through the same language across the product: add a drink, confirm QRIS or cash, then advance it from Menunggu to Diproses to Siap diambil in the barista queue. Status badges use text, icon, and color together.

## Materials and tokens

The durable token and component rules are documented in `DESIGN_SYSTEM.md` and implemented in `src/theme/` and `src/components/ui.tsx`. Gluestack UI supplies the accessible component primitives, while YoSher Go tokens provide the product-specific palette, shape, spacing, and elevation.

## Native constraints

The app supports portrait and landscape tablet layouts, safe-area insets, 48 dp touch targets, system back navigation through React Navigation, and high-contrast status communication. No browser-only interaction is required for the primary flows.
