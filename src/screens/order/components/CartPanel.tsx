import { ButtonText, HStack, Text, VStack } from '@gluestack-ui/themed';
import { memo } from 'react';
import { Image, ScrollView, View } from 'react-native';
import { LivePulseDot } from '../../../components/indicators/LivePulseDot';
import { AppButton as Button, AppIcon, AppPressable as Pressable, EmptyState, Panel } from '../../../components/ui';
import { getCartTotals } from '../../../store/cartStore';
import type { CartItem } from '../../../types/pos';
import { colors } from '../../../theme';
import { formatCurrency } from '../../../utils/format';
import { getCartItemName, getCartLineTotal } from '../../../utils/cartPricing';
import { styles } from '../styles';

type Props = {
  items: CartItem[];
  onQuantity: (id: string, quantity: number) => void;
  onRemove: (id: string) => void;
  onClear: () => void;
  onCheckout: () => void;
  compact: boolean;
  isScreenFocused: boolean;
};

export const CartPanel = memo(function CartPanel({
  items,
  onQuantity,
  onRemove,
  onClear,
  onCheckout,
  compact,
  isScreenFocused,
}: Props) {
  const totals = getCartTotals(items);
  const cupCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <Panel
      style={[styles.cartPanel, compact ? styles.cartPanelCompact : styles.cartPanelFixed]}
      padding={0}
    >
      <HStack style={styles.cartHeader}>
        <HStack style={styles.cartHeaderTitle}>
          <LivePulseDot active={isScreenFocused && items.length > 0} />
          <Text style={styles.cartTitle}>Pesanan Aktif</Text>
          <Text style={styles.cartOrder}>#B-042</Text>
        </HStack>
        <Pressable
          onPress={onClear}
          disabled={!items.length}
          style={[styles.moreButton, !items.length && styles.clearCartDisabled]}
          accessibilityRole="button"
          accessibilityLabel="Kosongkan seluruh pesanan"
        >
          <AppIcon name="trash-can-outline" size={19} color={colors.danger} />
        </Pressable>
      </HStack>
      <ScrollView
        style={styles.cartItems}
        contentContainerStyle={styles.cartItemsContent}
        showsVerticalScrollIndicator={false}
      >
        {items.length === 0 ? (
          <EmptyState
            icon="cart-outline"
            title="Keranjang kosong"
            description="Pilih menu untuk membuat pesanan."
          />
        ) : (
          items.map((item) => (
            <VStack key={item.product.id} style={styles.cartItem}>
              <View style={styles.cartThumb}>
                {item.product.image ? (
                  <Image
                    source={item.product.image}
                    style={styles.cartThumbImage}
                    resizeMode="cover"
                  />
                ) : (
                  <AppIcon
                    name={item.product.icon as never}
                    size={21}
                    color={item.product.accent}
                  />
                )}
              </View>
              <VStack style={styles.cartItemInfo}>
                <HStack style={styles.cartItemHeading}>
                  <Text style={styles.cartItemName} numberOfLines={2}>
                    {getCartItemName(item.product.id, item.product.name)}
                  </Text>
                  <Text style={styles.cartItemPrice}>
                    {formatCurrency(
                      getCartLineTotal(item.product.id, item.quantity, item.product.price),
                    )}
                  </Text>
                </HStack>
                <HStack style={styles.cartItemMetaRow}>
                  <Text style={styles.cartCategory} numberOfLines={1}>
                    {item.product.categoryName}
                  </Text>
                  <HStack style={styles.cartItemControls}>
                    <HStack style={styles.quantityControl}>
                      <Pressable
                        onPress={() => onQuantity(item.product.id, item.quantity - 1)}
                        style={styles.quantityButton}
                      >
                        <AppIcon name="minus" size={14} color={colors.ink} />
                      </Pressable>
                      <Text style={styles.quantityValue}>{item.quantity}</Text>
                      <Pressable
                        onPress={() => onQuantity(item.product.id, item.quantity + 1)}
                        style={styles.quantityButton}
                      >
                        <AppIcon name="plus" size={14} color={colors.ink} />
                      </Pressable>
                    </HStack>
                    <Pressable
                      onPress={() => onRemove(item.product.id)}
                      style={styles.removeButton}
                      accessibilityLabel={`Hapus ${item.product.name}`}
                    >
                      <AppIcon name="trash-can-outline" size={17} color={colors.danger} />
                    </Pressable>
                  </HStack>
                </HStack>
              </VStack>
            </VStack>
          ))
        )}
      </ScrollView>
      <VStack style={styles.cartSummary}>
        <Text style={styles.subtotalLabel}>Subtotal</Text>
        <HStack style={styles.summaryRow}>
          <HStack style={styles.cupChip}>
            <AppIcon name="cup-outline" size={14} color={colors.primary} />
            <Text style={styles.summaryLabel}>{cupCount} Cup Minuman</Text>
          </HStack>
          <Text style={styles.summaryValue}>
            {formatCurrency(totals.subtotal)}
          </Text>
        </HStack>
        <Button
          onPress={onCheckout}
          isDisabled={!items.length}
          style={[styles.checkoutButton, !items.length && { opacity: 0.45 }]}
        >
          <HStack style={{ alignItems: 'center', gap: 8 }}>
            <AppIcon name="printer-outline" size={19} color={colors.white} />
            <ButtonText style={styles.checkoutText}>Cetak &amp; Bayar</ButtonText>
          </HStack>
        </Button>
      </VStack>
    </Panel>
  );
});
