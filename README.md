# YoSher Go

Tablet-first POS app for a cafe, built with Expo, React Native, TypeScript, Gluestack UI, TanStack Query, and Zustand. The login, catalog, orders, stock, and cash workflows use the Go API.

## Run locally

```bash
npm install
npx expo start
```

Then open the project in Expo Go, an Android emulator, or an iOS simulator.

Copy `.env.example` to `.env.local` and set `EXPO_PUBLIC_API_URL` to the Go API address. During local development, `http://localhost:8080` works for web and iOS Simulator; Android Emulator uses `10.0.2.2:8080`, and a phone connected through Expo's LAN mode uses the computer's LAN IP automatically. The phone and computer must share a network, and the Go API must listen on that network. With Expo tunnel or a hosted native build, set `EXPO_PUBLIC_API_URL_NATIVE` to an API URL reachable from the device. To open the web app from another device on the LAN, set `EXPO_PUBLIC_API_URL` to the computer's LAN IP and add that web origin to the backend's `CORS_ALLOWED_ORIGINS`. Production native builds require a reachable HTTPS API URL; development host detection does not run in production. The Go API must allow the Expo web origin in `CORS_ALLOWED_ORIGINS`.

Run the backend migrations and create accounts as described in `../pos-be/README.md` before logging in. The `owner` role can access all menus. The `pegawai` role can access Kasir, Pembayaran, and Antrean. Native sessions use Expo SecureStore; web sessions last for the browser tab/session.

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
