import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { HStack, Text, VStack } from "@gluestack-ui/themed";
import { useState, type ReactNode, type RefObject } from "react";
import { Image, ScrollView, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import type { RootStackParamList } from "../../navigation/types";
import { useTransactionStore } from "../../store/transactionStore";
import { colors } from "../../theme";
import { AppIcon, AppPressable as Pressable } from "../ui";
import { CloseShiftDialog } from "./components/CloseShiftDialog";
import { HeaderActions } from "./components/HeaderActions";
import { MobileBottomNavigation } from "./components/MobileNavigation";
import { primaryNavigationItems } from "./navigationItems";
import { styles } from "./styles";

type Route = keyof RootStackParamList;

export function AppShell({
  active,
  children,
  scrollRef,
  scrollable = true,
}: {
  active: Route;
  children: ReactNode;
  scrollRef?: RefObject<ScrollView | null>;
  scrollable?: boolean;
}) {
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const closeShift = useTransactionStore((state) => state.closeShift);
  const [showCloseShiftConfirm, setShowCloseShiftConfirm] = useState(false);
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const activeNav = active === "Payment" ? "Order" : active;
  const isMedium = width >= 768;
  const isLarge = width >= 1024;
  const blueStatus =
    active === "Order" || active === "Products" || active === "Stock" || active === "Cash";

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
        {
          paddingTop: insets.top,
          paddingBottom: isMobile ? 0 : insets.bottom,
        },
      ]}
    >
      <HStack style={[styles.topBar, isMobile && styles.topBarMobile]}>
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
          showClockInHeader={isLarge}
          isMobile={isMobile}
          onRequestCloseShift={() => setShowCloseShiftConfirm(true)}
        />
      </HStack>
      <HStack style={styles.body}>
        {!isMobile ? (
          <VStack style={[styles.sidebar, { width: 128 }]}>
            <VStack style={styles.sideNav}>
              {primaryNavigationItems.map((item) => {
                const isActive = item.route === activeNav;
                return (
                  <Pressable
                    key={item.route}
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
                      {item.route === "Queue" ? (
                        <View style={styles.queueBadge}>
                          <Text style={styles.queueBadgeText}>4</Text>
                        </View>
                      ) : null}
                    </View>
                    <Text
                      style={[
                        styles.navLabel,
                        isActive && styles.navLabelActive,
                      ]}
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
        ) : null}
        {scrollable ? (
          <ScrollView
            ref={scrollRef}
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
      {isMobile ? (
        <MobileBottomNavigation
          active={activeNav}
          bottomInset={insets.bottom}
          onNavigate={(route) => navigation.navigate(route)}
        />
      ) : null}
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
