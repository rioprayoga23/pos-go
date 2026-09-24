import { HppComponent } from "../../../types/pos";
import { ProductForm } from "../types";

export const initialHppComponents: HppComponent[] = [
  {
    id: "hpp-premix",
    name: "Bubuk Premix / Powder",
    detail: "Avocado Premix Sachet 35g",
    icon: "coffee-outline",
    cost: 4500,
  },
  {
    id: "hpp-packaging",
    name: "Cup, Tutup, Sedotan",
    detail: "Packaging Set (Cup 16oz + Lid + Straw)",
    icon: "cup-outline",
    cost: 1250,
  },
  {
    id: "hpp-boba",
    name: "Boba Brown Sugar Pearl",
    detail: "Porsi Boba Kenyal 40g",
    icon: "chart-bubble",
    cost: 5000,
  },
  {
    id: "hpp-ice",
    name: "Es Batu & Air Filtrasi",
    detail: "Es Kristal & Air RO Higienis",
    icon: "snowflake",
    cost: 750,
  },
];

export const initialForm: ProductForm = {
  name: "Avocado Velvet Boba",
  price: "28000",
  stock: "85",
  hppComponents: initialHppComponents,
  description: "",
  categoryId: "boba",
  isAvailable: true,
  accent: "#77A96D",
  icon: "cup-outline",
  image: require("../../../../assets/stitch/order/brown-sugar.png"),
};

export const emptyForm: ProductForm = {
  name: "",
  price: "0",
  stock: "",
  hppComponents: [],
  description: "",
  categoryId: "",
  isAvailable: true,
  accent: "#77A96D",
  icon: "cup-outline",
};
