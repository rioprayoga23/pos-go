import { ProductForm } from "../types";
import { colors } from "../../../theme";

export const emptyForm: ProductForm = {
  name: "",
  price: "",
  recipeId: "",
  description: "",
  categoryId: "",
  isAvailable: true,
  accent: colors.cyan,
  icon: "cup-outline",
};
