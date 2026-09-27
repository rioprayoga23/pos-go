import type { PrimaryRouteName } from "../../navigation/routes";
import type { IconName } from "../ui";

export type PrimaryNavigationRoute = PrimaryRouteName;

type PrimaryNavigationItem = {
  route: PrimaryNavigationRoute;
  label: string;
  mobileLabel: string;
  icon: IconName;
};

export const primaryNavigationItems: PrimaryNavigationItem[] = [
  {
    route: "Order",
    label: "Kasir",
    mobileLabel: "Kasir",
    icon: "point-of-sale",
  },
  {
    route: "Queue",
    label: "Antrean",
    mobileLabel: "Antrean",
    icon: "hand-wave-outline",
  },
  {
    route: "Products",
    label: "Kelola Menu",
    mobileLabel: "Menu",
    icon: "coffee-outline",
  },
  {
    route: "Stock",
    label: "Kelola Stok",
    mobileLabel: "Stok",
    icon: "archive-outline",
  },
  {
    route: "Cash",
    label: "Kelola Kas",
    mobileLabel: "Kas",
    icon: "cash-register",
  },
  {
    route: "History",
    label: "Riwayat & Ringkasan",
    mobileLabel: "Riwayat & Ringkasan",
    icon: "receipt-text-outline",
  },
];
