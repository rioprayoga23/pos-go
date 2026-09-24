# Product

<!-- impeccable:product-schema 1 -->

## Platform

adaptive

## Stack

delegated: Expo + React Native + TypeScript, React Navigation, Gluestack UI, and Zustand. The first release is local-only with dummy data and keeps repositories easy to replace with an API later.

## Users

Primary users are cafe cashiers and baristas operating a shared tablet during service. An inferred secondary user is the owner or supervisor reviewing daily sales and closing the register.

## Product Purpose

The POS helps a drink business manage its menu, take orders, accept QRIS or cash payments, monitor the barista queue, and close the daily register from one tablet-friendly workspace. Success means a cashier can complete a drink order quickly and the barista can act on it without losing context.

## Positioning

The product keeps front-of-house ordering, payment confirmation, and back-of-house drink production visible in one consistent blue operational workspace, instead of splitting each step across separate tools.

## Operating Context

The app runs in a busy cafe with a tablet held in portrait or landscape. Screens must stay scannable at a glance, support comfortable touch targets, and remain useful when the operator is moving between cashier and barista tasks.

## Capabilities and Constraints

- Manage drink categories and menu items with basic validation.
- Search and filter the menu while creating an order.
- Add items to a cart, adjust quantity, remove items, and calculate totals in IDR.
- Complete a payment using cash or QRIS; QRIS is represented by a dummy dynamic-code state.
- Show order status in a barista queue and advance orders through production states.
- Review transactions and close the daily register using dummy local data.
- Use separate Zustand domains for products, cart, and transactions.
- No API, authentication, persistence, or real payment integration in this phase.
- Inferred assumptions: one cafe location, Indonesian labels, IDR currency, one active shift, and no role-specific permissions yet.

## Brand Commitments

The supplied Stitch project "Tablet POS Interface" is the visual reference. The implementation preserves its modern blue palette, bright operational surfaces, rounded panels, strong numeric hierarchy, and Indonesian product language.

## Evidence on Hand

Stitch exports for the five required screens are stored under `stitch/tablet-pos-interface/` in this project. The source brief is the pasted POS requirements supplied by the user.

## Product Principles

1. Service speed beats decoration.
2. Every action should have an obvious next step.
3. Front-of-house and barista context should agree on the same order.
4. Dummy workflows should be replaceable with repositories without rewriting screens.
5. Tablet layouts should adapt before they collapse.

## Accessibility & Inclusion

Use accessible labels for icon-only actions, minimum 48 dp touch targets on Android, safe-area and keyboard insets, high-contrast text, and readable type at tablet viewing distance. Portrait and landscape layouts must preserve the same task order and available actions.
