import {
  ButtonText,
  HStack,
  Modal,
  ModalBackdrop,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Text,
  VStack,
} from "@gluestack-ui/themed";
import { useState } from "react";
import { ScrollView, useWindowDimensions } from "react-native";
import {
  AppButton as Button,
  AppIcon,
  AppInput,
  AppModalCloseButton,
} from "../../ui";
import { colors } from "../../../theme";
import { type HppComponent } from "../../../types/pos";
import { formatCurrency, formatThousands } from "../../../utils/format";
import { AddIngredientModal } from "./AddIngredientModal";
import { productFormStyles } from "../styles/form";
import { styles } from "../styles/modals";

export function HppModal({
  initialPrice,
  initialComponents,
  onClose,
  onSave,
}: {
  initialPrice: string;
  initialComponents: HppComponent[];
  onClose: () => void;
  onSave: (price: string, components: HppComponent[]) => void;
}) {
  const { height } = useWindowDimensions();
  const [sellingPrice, setSellingPrice] = useState(initialPrice);
  const [components, setComponents] = useState(() =>
    initialComponents.map((component) => ({ ...component })),
  );
  const [priceError, setPriceError] = useState("");
  const [showAddIngredient, setShowAddIngredient] = useState(false);
  const hppTotal = components.reduce((total, component) => total + component.cost, 0);
  const priceAmount = Number(sellingPrice.replace(/\D/g, ""));
  const profit = priceAmount - hppTotal;
  const margin = priceAmount > 0 ? Math.round((profit / priceAmount) * 100) : 0;
  const marginLabel = `${margin >= 0 ? "+" : "−"}${Math.abs(margin)}%`;
  const profitLabel = profit < 0
    ? `−${formatCurrency(Math.abs(profit))}`
    : formatCurrency(profit);
  const bodyMaxHeight = Math.max(220, Math.min(height - 250, 620));

  const save = () => {
    if (!priceAmount) {
      setPriceError("Masukkan harga jual lebih dari Rp 0.");
      return;
    }
    onSave(String(priceAmount), components);
  };

  const addComponent = (component: HppComponent) => {
    setComponents((current) => [...current, component]);
    setShowAddIngredient(false);
  };

  return (
    <>
      <Modal isOpen onClose={onClose} size="lg">
        <ModalBackdrop />
        <ModalContent style={[styles.hppModal, { maxHeight: height - 24 }]}>
          <ModalHeader style={styles.hppModalHeader}>
            <HStack style={styles.hppHeaderIcon}>
              <AppIcon name="calculator-variant" size={21} color={colors.primary} />
            </HStack>
            <VStack style={styles.hppHeaderCopy}>
              <Text style={styles.hppTitle}>Hitung Rincian HPP &amp; Set Harga Jual</Text>
              <Text style={productFormStyles.description}>
                Sesuaikan biaya bahan dan harga jual kasir di POS.
              </Text>
            </VStack>
            <AppModalCloseButton
              onPress={onClose}
              accessibilityLabel="Tutup pengaturan HPP"
            />
          </ModalHeader>
          <ModalBody style={styles.hppModalBody}>
            <ScrollView
              style={{ maxHeight: bodyMaxHeight }}
              contentContainerStyle={styles.hppBodyContent}
              showsVerticalScrollIndicator
              keyboardShouldPersistTaps="handled"
            >
              <VStack style={styles.hppPricePanel}>
                <HStack style={styles.hppPanelHeading}>
                  <AppIcon name="point-of-sale" size={18} color={colors.primary} />
                  <Text style={styles.hppPanelTitle}>
                    Pengaturan Harga Jual Kasir (POS)
                  </Text>
                </HStack>
                <Text style={styles.hppFieldLabel}>Nominal Harga Jual (Rp)</Text>
                <AppInput
                  value={formatThousands(sellingPrice)}
                  onChangeText={(value) => {
                    setSellingPrice(value.replace(/\D/g, ""));
                    if (priceError) setPriceError("");
                  }}
                  placeholder="28.000"
                  keyboardType="number-pad"
                  accessibilityLabel="Nominal harga jual kasir"
                  leading={<Text style={styles.hppCurrency}>Rp</Text>}
                  style={styles.hppPriceInput}
                  inputStyle={styles.hppPriceInputText}
                />
                {priceError ? (
                  <Text style={productFormStyles.errorText}>{priceError}</Text>
                ) : null}
              </VStack>

              <HStack style={styles.hppComponentsHeading}>
                <VStack style={styles.hppComponentsTitleGroup}>
                  <Text style={styles.hppPanelTitle}>
                    Rincian Komponen Biaya HPP per Cup
                  </Text>
                  <Text style={productFormStyles.description}>
                    {components.length} Komponen
                  </Text>
                </VStack>
                <Button
                  onPress={() => setShowAddIngredient(true)}
                  style={styles.addIngredientButton}
                  accessibilityLabel="Tambah bahan baku ke rincian HPP"
                >
                  <AppIcon name="plus" size={15} color={colors.white} />
                  <ButtonText style={styles.addIngredientText}>
                    Tambah Bahan
                  </ButtonText>
                </Button>
              </HStack>

              <VStack style={styles.hppComponentsList}>
                {components.length === 0 ? (
                  <Text style={styles.hppEmptyState}>
                    Belum ada komponen bahan. Tambahkan bahan untuk menghitung
                    HPP per cup.
                  </Text>
                ) : components.map((component, index) => (
                  <HStack
                    key={component.id}
                    style={[
                      styles.hppComponentRow,
                      index === components.length - 1 && styles.hppComponentRowLast,
                    ]}
                  >
                    <HStack style={styles.hppComponentIcon}>
                      <AppIcon name={component.icon as never} size={18} color={colors.primary} />
                    </HStack>
                    <VStack style={styles.hppComponentCopy}>
                      <Text style={styles.hppComponentName} numberOfLines={2}>
                        {component.name}
                      </Text>
                      <Text style={styles.hppComponentDetail} numberOfLines={2}>
                        {component.detail}
                      </Text>
                    </VStack>
                    <AppInput
                      value={formatThousands(component.cost)}
                      onChangeText={(value) => {
                        const cost = Number(value.replace(/\D/g, "")) || 0;
                        setComponents((current) =>
                          current.map((item) =>
                            item.id === component.id ? { ...item, cost } : item,
                          ),
                        );
                      }}
                      placeholder="0"
                      keyboardType="number-pad"
                      accessibilityLabel={`Biaya ${component.name} per cup`}
                      leading={<Text style={styles.hppCurrency}>Rp</Text>}
                      style={styles.hppComponentCostInput}
                      inputStyle={styles.hppComponentCostText}
                    />
                  </HStack>
                ))}
              </VStack>

              <HStack style={styles.hppSummary}>
                <HStack style={styles.hppSummaryIcon}>
                  <AppIcon name="cash-multiple" size={19} color={colors.success} />
                </HStack>
                <VStack style={styles.hppSummaryCopy}>
                  <Text style={styles.hppSummaryLabel}>
                    Hasil Kalkulasi Modal &amp; Margin
                  </Text>
                  <Text style={[styles.hppProfit, profit < 0 && styles.hppProfitNegative]}>
                    Laba: {profitLabel} / porsi ({marginLabel})
                  </Text>
                </VStack>
                <VStack style={styles.hppTotalBadge}>
                  <Text style={styles.hppTotalLabel}>Total HPP</Text>
                  <Text style={styles.hppTotalValue}>{formatCurrency(hppTotal)}</Text>
                </VStack>
              </HStack>
            </ScrollView>
          </ModalBody>
          <ModalFooter style={styles.hppModalFooter}>
            <Button onPress={save} style={styles.hppSaveButton}>
              <AppIcon name="check-circle" size={17} color={colors.white} />
              <ButtonText style={productFormStyles.publishText}>
                Simpan Pengaturan Harga &amp; HPP
              </ButtonText>
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
      {showAddIngredient ? (
        <AddIngredientModal
          onClose={() => setShowAddIngredient(false)}
          onAdd={addComponent}
        />
      ) : null}
    </>
  );
}
