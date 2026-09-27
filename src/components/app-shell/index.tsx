import { router } from "expo-router";
import { HStack, Text, VStack } from "@gluestack-ui/themed";
import { useState, type ReactNode, type RefObject } from "react";
import { Image, ScrollView, useWindowDimensions, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { routePaths, type RouteName } from "../../navigation/routes";
import { useTransactionStore } from "../../store/transactionStore";
import { colors } from "../../theme";
import { AppIcon, AppPressable as Pressable } from "../ui";
import { CloseShiftDialog } from "./components/CloseShiftDialog";
import { HeaderActions } from "./components/HeaderActions";
import { MobileBottomNavigation } from "./components/MobileNavigation";
import { OpenCashRegisterDialog } from "./components/OpenCashRegisterDialog";
import { primaryNavigationItems } from "./navigationItems";
import { styles } from "./styles";

export function AppShell({
  active,
  children,
  scrollRef,
  scrollable = true,
}: {
  active: RouteName;
  children: ReactNode | ((requestCashAction: () => void) => ReactNode);
  scrollRef?: RefObject<ScrollView | null>;
  scrollable?: boolean;
}) {
  const orders = useTransactionStore((state) => state.orders);
  const queueCount = orders.filter(
    (order) => order.status !== "completed",
  ).length;
  const cashRegisterOpen = useTransactionStore((state) =>
    state.isCashRegisterOpen(),
  );
  const cashRegisterClosedToday = useTransactionStore((state) =>
    state.isCashRegisterClosedToday(),
  );
  const openCashRegister = useTransactionStore(
    (state) => state.openCashRegister,
  );
  const closeShift = useTransactionStore((state) => state.closeShift);
  const [showOpenCashDialog, setShowOpenCashDialog] = useState(false);
  const [showCloseShiftDialog, setShowCloseShiftDialog] = useState(false);
  const handleCashAction = () => {
    if (cashRegisterOpen) setShowCloseShiftDialog(true);
    else if (!cashRegisterClosedToday) setShowOpenCashDialog(true);
  };
  const content =
    typeof children === "function" ? children(handleCashAction) : children;
  const insets = useSafeAreaInsets();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const sidebarWidth = width < 1280 ? 96 : 128;
  const activeNav = active === "Payment" ? "Order" : active;
  const isMedium = width >= 768;
  const isLarge = width >= 1024;
  const blueStatus =
    active === "Order" ||
    active === "Products" ||
    active === "Stock" ||
    active === "Cash";

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
                <Text style={styles.cashierText}>Kasir</Text>
              </HStack>
            </>
          ) : null}
        </HStack>
        <HeaderActions
          showClockInHeader={isLarge}
          isMobile={isMobile}
          cashRegisterOpen={cashRegisterOpen}
          cashRegisterClosedToday={cashRegisterClosedToday}
          onLogout={() => router.replace("/login")}
          onRequestCashAction={handleCashAction}
        />
      </HStack>
      <HStack style={styles.body}>
        {!isMobile ? (
          <VStack style={[styles.sidebar, { width: sidebarWidth }]}>
            <VStack style={styles.sideNav}>
              {primaryNavigationItems.map((item) => {
                const isActive = item.route === activeNav;
                return (
                  <Pressable
                    key={item.route}
                    onPress={() => router.navigate(routePaths[item.route])}
                    style={[styles.navItem, isActive && styles.navItemActive]}
                    accessibilityRole="button"
                    accessibilityLabel={`Buka ${item.label}`}
                  >
                    <View style={styles.navIconWrap}>
                      <AppIcon
                        name={item.icon}
                        size={21}
                        color={isActive ? colors.primaryDark : colors.inkMuted}
                      />
                      {item.route === "Queue" && queueCount > 0 ? (
                        <View style={styles.queueBadge}>
                          <Text style={styles.queueBadgeText}>
                            {queueCount > 99 ? "99+" : queueCount}
                          </Text>
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
              <Text
                style={[styles.onlineText, blueStatus && styles.onlineTextBlue]}
              >
                V 1.0.0
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
            {content}
          </ScrollView>
        ) : (
          <View style={contentStyle}>{content}</View>
        )}
      </HStack>
      {isMobile ? (
        <MobileBottomNavigation
          active={activeNav}
          bottomInset={insets.bottom}
          queueCount={queueCount}
          onNavigate={(route) => router.navigate(routePaths[route])}
        />
      ) : null}
      {showOpenCashDialog ? (
        <OpenCashRegisterDialog
          isOpen
          onClose={() => setShowOpenCashDialog(false)}
          onConfirm={(amount) => {
            if (openCashRegister(amount)) setShowOpenCashDialog(false);
          }}
        />
      ) : null}
      {showCloseShiftDialog && cashRegisterOpen ? (
        <CloseShiftDialog
          isOpen
          onClose={() => setShowCloseShiftDialog(false)}
          onConfirm={(countedCash) => {
            closeShift(countedCash);
            setShowCloseShiftDialog(false);
          }}
        />
      ) : null}
    </VStack>
  );
}
