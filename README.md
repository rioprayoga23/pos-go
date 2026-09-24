# YoSher Go

Tablet-first POS prototype for a cafe, built with Expo, React Native, TypeScript, Gluestack UI, React Navigation, and Zustand. All workflows currently use consistent local dummy data.

## Run locally

```bash
npm install
npx expo start
```

Then open the project in Expo Go, an Android emulator, or an iOS simulator.

Useful checks:

```bash
npx tsc --noEmit
npx expo-doctor
npx expo export --platform android
npx expo export --platform web
```

## Main routes

- `Kasir`: search/filter drinks, add to cart, change quantity, and start checkout.
- `Menu`: create, edit, search, filter, toggle availability, and delete products.
- `Pembayaran`: confirm QRIS or cash, show a dynamic QR mock, and complete the order.
- `Antrean`: filter active orders and advance barista status.
- `Riwayat`: review daily metrics, recent transactions, payment mix, and close the shift.

## Structure

```text
src/
  components/ui.tsx          shared Gluestack-based shell and UI patterns
  data/dummy.ts              one source of local products and orders
  navigation/                typed React Navigation stack
  screens/                   the five POS screens
  store/                     product, cart, and transaction Zustand stores
  theme/                     design tokens and Gluestack configuration
  types/                     domain types
  utils/                     IDR and date formatting
```

`PRODUCT.md`, `DESIGN_SYSTEM.md`, and `DESIGN.md` document the product context, Stitch-derived UI rules, and visual direction. API integration can replace the local seed data and store actions without changing the screen-level flow.

## Stitch references

The downloaded Stitch screenshots and HTML exports are in `stitch/tablet-pos-interface/`.
