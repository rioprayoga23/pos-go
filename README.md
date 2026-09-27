# YoSher Go

Tablet-first POS prototype for a cafe, built with Expo, React Native, TypeScript, Gluestack UI, TanStack Query, and Zustand. Stock management connects directly to the Go API; the other POS workflows still use local demo data.

## Run locally

```bash
npm install
npx expo start
```

Then open the project in Expo Go, an Android emulator, or an iOS simulator.

Copy `.env.example` to `.env.local` and set `EXPO_PUBLIC_API_URL` to the Go API address. Use `http://localhost:8080` for web or an iOS simulator, `http://10.0.2.2:8080` for the Android emulator, or the computer's LAN IP for a physical phone. The Go API must allow the Expo web origin in `CORS_ALLOWED_ORIGINS`.

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

`src/services/apiClient.ts` is the shared API root and query-string helper for module services. `src/services/apiTypes.ts` contains common response envelope and pagination types. Module `api.ts` files use these shared pieces; TanStack Query hooks own each module's cache and mutations. Keep Zustand for shared client-side state such as the cart and transactions.

`PRODUCT.md`, `DESIGN_SYSTEM.md`, and `DESIGN.md` document the product context, Stitch-derived UI rules, and visual direction.

## Stitch references

The downloaded Stitch screenshots and HTML exports are in `stitch/tablet-pos-interface/`.
