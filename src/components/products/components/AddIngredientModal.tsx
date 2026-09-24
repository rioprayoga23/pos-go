import {
  ButtonText,
  HStack,
  Modal,
  ModalBackdrop,
  ModalBody,
  ModalContent,
  ModalHeader,
  Text,
  VStack,
} from "@gluestack-ui/themed";
import { useState } from "react";
import { View } from "react-native";
import {
  AppButton as Button,
  AppIcon,
  AppInput,
  AppModalCloseButton,
  AppPressable as Pressable,
} from "../../ui";
import { colors } from "../../../theme";
import { type HppComponent } from "../../../types/pos";
import { formatThousands } from "../../../utils/format";
import { productFormStyles } from "../styles/form";
import { styles } from "../styles/modals";

export function AddIngredientModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (component: HppComponent) => void;
}) {
  const [name, setName] = useState("");
  const [unit, setUnit] = useState("Gram (g)");
  const [cost, setCost] = useState("2500");
  const [showUnits, setShowUnits] = useState(false);
  const [error, setError] = useState("");
  const units = ["Gram (g)", "Mililiter (ml)", "Pcs / Unit", "Porsi / Scoop"];

  const add = () => {
    const amount = Number(cost.replace(/\D/g, ""));
    if (!name.trim()) {
      setError("Nama bahan baku wajib diisi.");
      return;
    }
    if (!cost.trim() || !Number.isFinite(amount)) {
      setError("Biaya per porsi wajib diisi dengan angka.");
      return;
    }
    onAdd({
      id: `hpp-${Date.now()}`,
      name: name.trim(),
      detail: `${unit} per porsi`,
      icon: "beaker-outline",
      cost: amount,
    });
  };

  return (
    <Modal isOpen onClose={onClose} size="md">
      <ModalBackdrop />
      <ModalContent style={styles.ingredientModal}>
        <ModalHeader style={styles.ingredientModalHeader}>
          <HStack style={styles.hppHeaderIcon}>
            <AppIcon name="plus-circle" size={20} color={colors.white} />
          </HStack>
          <VStack style={styles.hppHeaderCopy}>
            <Text style={styles.hppTitle}>Tambah Bahan Baku Baru</Text>
            <Text style={productFormStyles.description}>
              Tambahkan komponen biaya untuk kalkulasi HPP resep.
            </Text>
          </VStack>
          <AppModalCloseButton
            onPress={onClose}
            accessibilityLabel="Tutup form bahan baku"
          />
        </ModalHeader>
        <ModalBody>
          <VStack style={styles.ingredientForm}>
            <VStack style={styles.ingredientField}>
              <Text style={productFormStyles.fieldLabel}>
                Nama Bahan Baku <Text style={productFormStyles.required}>*</Text>
              </Text>
              <AppInput
                value={name}
                onChangeText={(value) => {
                  setName(value);
                  if (error) setError("");
                }}
                placeholder="Contoh: Sirup Karamel, Puree Alpukat"
                accessibilityLabel="Nama bahan baku"
                autoCapitalize="sentences"
              />
            </VStack>
            <View style={styles.ingredientFieldsRow}>
              <View style={styles.unitField}>
                <Text style={[productFormStyles.fieldLabel, styles.ingredientFieldLabel]}>
                  Satuan Ukuran
                </Text>
                <Pressable
                  onPress={() => setShowUnits((current) => !current)}
                  style={styles.unitSelect}
                  accessibilityRole="button"
                  accessibilityLabel={`Satuan: ${unit}. Ketuk untuk memilih satuan`}
                  accessibilityState={{ expanded: showUnits }}
                >
                  <Text style={styles.unitSelectText}>{unit}</Text>
                  <AppIcon
                    name={showUnits ? "chevron-up" : "chevron-down"}
                    size={17}
                    color={colors.inkMuted}
                  />
                </Pressable>
              </View>
              <View style={styles.ingredientCostField}>
                <Text style={[productFormStyles.fieldLabel, styles.ingredientFieldLabel]}>
                  Biaya / Porsi <Text style={productFormStyles.required}>*</Text>
                </Text>
                <AppInput
                  value={formatThousands(cost)}
                  onChangeText={(value) => {
                    setCost(value.replace(/\D/g, ""));
                    if (error) setError("");
                  }}
                  placeholder="2.500"
                  keyboardType="number-pad"
                  accessibilityLabel="Biaya bahan per porsi"
                  leading={<Text style={styles.hppCurrency}>Rp</Text>}
                  style={styles.ingredientCostInput}
                  inputStyle={styles.hppComponentCostText}
                />
              </View>
            </View>
            {showUnits ? (
              <HStack style={styles.unitOptions}>
                {units.map((option) => (
                  <Pressable
                    key={option}
                    onPress={() => {
                      setUnit(option);
                      setShowUnits(false);
                    }}
                    style={[styles.unitOption, unit === option && styles.unitOptionSelected]}
                    accessibilityRole="button"
                    accessibilityState={{ selected: unit === option }}
                  >
                    <Text
                      style={[
                        styles.unitOptionText,
                        unit === option && styles.unitOptionTextSelected,
                      ]}
                    >
                      {option}
                    </Text>
                  </Pressable>
                ))}
              </HStack>
            ) : null}
            {error ? (
              <Text style={productFormStyles.errorText}>{error}</Text>
            ) : null}
            <View style={styles.ingredientActions}>
              <Button onPress={add} style={styles.ingredientSubmitButton}>
                <AppIcon name="check" size={16} color={colors.white} />
                <ButtonText style={productFormStyles.publishText}>
                  Tambahkan ke Resep
                </ButtonText>
              </Button>
            </View>
          </VStack>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
