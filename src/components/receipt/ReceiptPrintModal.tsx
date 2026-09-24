import {
  ButtonText,
  Modal,
  ModalBackdrop,
  ModalBody,
  ModalContent,
  ModalFooter,
  ModalHeader,
  Text,
} from "@gluestack-ui/themed";
import * as Print from "expo-print";
import { useState } from "react";
import { Platform, ScrollView, useWindowDimensions } from "react-native";
import {
  AppButton as Button,
  AppIcon,
  AppModalCloseButton,
} from "../ui";
import { createReceiptHtml } from "./receiptHtml";
import { ReceiptPaper } from "./ReceiptPaper";
import { receiptModalStyles as styles } from "./styles";
import type { ReceiptData } from "./types";

export function ReceiptPrintModal({
  data,
  onClose,
}: {
  data: ReceiptData;
  onClose: () => void;
}) {
  const [isPrinting, setIsPrinting] = useState(false);
  const [printError, setPrintError] = useState("");
  const { height } = useWindowDimensions();

  const printAgain = async () => {
    setIsPrinting(true);
    setPrintError("");

    try {
      const html = createReceiptHtml(data);
      if (Platform.OS === "web") {
        await Print.printToFileAsync({ html, width: 302 });
      } else {
        await Print.printAsync({
          html,
          width: 302,
          height: Math.max(600, 500 + data.items.length * 38),
          margins: { top: 0, right: 0, bottom: 0, left: 0 },
        });
      }
    } catch {
      setPrintError("Dialog cetak tidak dapat dibuka. Coba lagi.");
    } finally {
      setIsPrinting(false);
    }
  };

  return (
    <Modal isOpen onClose={onClose} size="md">
      <ModalBackdrop />
      <ModalContent style={[styles.receiptModal, { maxHeight: height - 32 }]}>
        <ModalHeader style={styles.receiptModalHeader}>
          <Text style={styles.receiptModalTitle}>Struk Transaksi</Text>
          <AppModalCloseButton
            onPress={onClose}
            accessibilityLabel="Tutup preview struk"
          />
        </ModalHeader>
        <ModalBody style={styles.receiptModalBody}>
          <ScrollView
            style={styles.receiptModalScroll}
            contentContainerStyle={styles.receiptModalScrollContent}
            showsVerticalScrollIndicator={false}
          >
            <ReceiptPaper data={data} />
          </ScrollView>
          {printError ? (
            <Text style={styles.receiptPrintError}>{printError}</Text>
          ) : null}
        </ModalBody>
        <ModalFooter style={styles.receiptModalFooter}>
          <Button
            onPress={printAgain}
            isDisabled={isPrinting}
            style={styles.receiptPrintButton}
            accessibilityLabel="Cetak ulang struk"
          >
            <AppIcon name="printer-outline" size={16} color="#FFFFFF" />
            <ButtonText style={styles.receiptPrintButtonText}>
              {isPrinting ? "Menyiapkan cetak..." : "Cetak Ulang"}
            </ButtonText>
          </Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}
