import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { HStack, Text, VStack } from "@gluestack-ui/themed";
import { useState, type ReactNode } from "react";
import { Image, ScrollView, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { RootStackParamList } from "../../navigation/types";
import { useTransactionStore } from "../../store/transactionStore";
import { colors } from "../../theme";
import {
  AppIcon,
  AppPressable as Pressable,
  type IconName,
} from "../ui";
import { CloseShiftDialog } from "./components/CloseShiftDialog";
import { HeaderActions } from "./components/HeaderActions";
import { styles } from "./styles";

type Route = keyof RootStackParamList;

const navItems: { route: Route; label: string; icon: IconName }[] = [
  { route: "Order", label: "Kasir", icon: "point-of-sale" },
  { route: "Queue", label: "Antrean", icon: "hand-wave-outline" },
  { route: "Products", label: "Kelola Menu", icon: "coffee-outline" },
  { route: "History", label: "Ringkasan", icon: "receipt-text-outline" },
];

export function AppShell({
  active,
  children,
  scrollable = true,
}: {
  active: Route;
  children: ReactNode;
  scrollable?: boolean;
}) {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const closeShift = useTransactionStore((state) => state.closeShift);
  const [showCloseShiftConfirm, setShowCloseShiftConfirm] = useState(false);
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const activeNav = active === "Payment" ? "Order" : active;
  const isMedium = width >= 768;
  const isLarge = width >= 1024;
  const isExtraLarge = width >= 1280;
  const blueStatus = active === "Order" || active === "Products";
  const contentStyle = [
    styles.content,
    {
      padding: isLarge ? 24 : 16,
      paddingBottom: scrollable ? 48 : isLarge ? 24 : 16,
    },
    !scrollable && styles.contentStatic,
  ];

  return (
    <VStack
      style={[
        styles.shell,
        { paddingTop: insets.top, paddingBottom: insets.bottom },
      ]}
    >
      <HStack style={styles.topBar}>
        <HStack style={styles.brandBlock}>
          <Image
            source={require("../../../assets/stitch/order/logo.png")}
            style={styles.brandLogo}
          />
          <VStack style={styles.brandText}>
            <Text style={styles.brandName}>Kopi &amp; Boba Co.</Text>
            <Text style={styles.brandSub}>Outlet Kemang</Text>
          </VStack>
          {isMedium ? (
            <>
              <View style={styles.headerSeparator} />
              <HStack style={styles.cashierPill}>
                <View style={[styles.greenDot, blueStatus && styles.blueDot]} />
                <Text style={styles.cashierText}>Kasir: Sarah</Text>
              </HStack>
            </>
          ) : null}
        </HStack>
        <HeaderActions
          isLarge={isLarge}
          isExtraLarge={isExtraLarge}
          onRequestCloseShift={() => setShowCloseShiftConfirm(true)}
        />
      </HStack>
      <HStack style={styles.body}>
        <VStack style={[styles.sidebar, { width: isMedium ? 112 : 96 }]}>
          <VStack style={styles.sideNav}>
            {navItems.map((item, index) => {
              const isActive = item.route === activeNav;
              return (
                <Pressable
                  key={`${item.label}-${index}`}
                  onPress={() => navigation.navigate(item.route)}
                  style={[styles.navItem, isActive && styles.navItemActive]}
                  accessibilityRole="button"
                  accessibilityLabel={`Buka ${item.label}`}
                >
                  <View style={styles.navIconWrap}>
                    <AppIcon
                      name={item.icon}
                      size={21}
                      color={isActive ? colors.white : colors.inkMuted}
                    />
                    {item.label === "Antrean" ? (
                      <View style={styles.queueBadge}>
                        <Text style={styles.queueBadgeText}>4</Text>
                      </View>
                    ) : null}
                  </View>
                  <Text
                    style={[styles.navLabel, isActive && styles.navLabelActive]}
                  >
                    {item.label}
                  </Text>
                </Pressable>
              );
            })}
          </VStack>
          <HStack
            style={[styles.onlinePill, blueStatus && styles.onlinePillBlue]}
          >
            <View style={[styles.greenDot, blueStatus && styles.blueDot]} />
            <Text
              style={[styles.onlineText, blueStatus && styles.onlineTextBlue]}
            >
              Online
            </Text>
          </HStack>
        </VStack>
        {scrollable ? (
          <ScrollView
            style={styles.scroll}
            contentContainerStyle={contentStyle}
            showsVerticalScrollIndicator={false}
          >
            {children}
          </ScrollView>
        ) : (
          <View style={contentStyle}>{children}</View>
        )}
      </HStack>
      <CloseShiftDialog
        isOpen={showCloseShiftConfirm}
        onClose={() => setShowCloseShiftConfirm(false)}
        onConfirm={(countedCash) => {
          closeShift(countedCash);
          setShowCloseShiftConfirm(false);
          navigation.navigate("History");
        }}
      />
    </VStack>
  );
}
