import {
  Slider,
  SliderFilledTrack,
  SliderThumb,
  SliderTrack,
  Text,
} from "@gluestack-ui/themed";
import { View } from "react-native";
import { AppIcon, AppPressable } from "../../../components/ui";
import { Field, NumberField, ui } from "../../../components/management";
import { colors } from "../../../theme";
import { formatCurrency } from "../../../utils/format";
import { priceForTargetMargin, type summarizeDraft } from "../editorModel";
import { editorStyles as styles } from "../editorStyles";

const marginPresets = [
  { label: "Kompetitif", percent: 25 },
  { label: "Standar", percent: 45 },
  { label: "Premium", percent: 65 },
] as const;

export function MenuPricingPanel({
  price,
  onPriceChange,
  summary,
  compact,
  error,
}: {
  price: string;
  onPriceChange: (value: string) => void;
  summary: ReturnType<typeof summarizeDraft>;
  compact: boolean;
  error?: string;
}) {
  const pricingEnabled = summary.hpp !== null && summary.hpp > 0;
  const sliderPercent = Math.max(0, Math.min(90, summary.margin ?? 0));
  function applyMargin(percent: number) {
    if (summary.hpp === null) return;
    const price = priceForTargetMargin(summary.hpp, percent);
    if (price !== null) onPriceChange(String(price));
  }
  const marginLabel =
    summary.margin === null
      ? "—"
      : `${summary.margin.toLocaleString("id-ID", { maximumFractionDigits: 1 })}%`;
  return (
    <View style={styles.pricingPanel}>
      {pricingEnabled ? (
        <View style={styles.marginSection}>
          <Text style={ui.label}>Rekomendasi margin</Text>
          <View style={styles.marginPresets}>
            {marginPresets.map((preset) => {
              const selected =
                summary.margin !== null &&
                Math.abs(summary.margin - preset.percent) < 0.15;
              return (
                <AppPressable
                  key={preset.percent}
                  onPress={() => applyMargin(preset.percent)}
                  accessibilityRole="button"
                  accessibilityLabel={`${preset.label}, margin ${preset.percent}%`}
                  accessibilityState={{ selected }}
                  style={[
                    styles.marginPreset,
                    selected && styles.marginPresetSelected,
                  ]}
                >
                  <Text
                    style={[
                      styles.marginPresetLabel,
                      selected && styles.marginPresetSelectedText,
                    ]}
                  >
                    {preset.label} {preset.percent}%
                  </Text>
                </AppPressable>
              );
            })}
          </View>
          <View style={styles.sliderWrap}>
            <Slider
              value={sliderPercent}
              minValue={0}
              maxValue={90}
              step={1}
              onChange={applyMargin}
              accessibilityLabel="Atur margin rekomendasi"
              size="sm"
              style={styles.slider}
            >
              <SliderTrack style={styles.sliderTrack}>
                <SliderFilledTrack style={styles.sliderFilledTrack} />
              </SliderTrack>
              <SliderThumb style={styles.sliderThumb} />
            </Slider>
            <View style={styles.sliderScale}>
              <Text style={styles.sliderScaleLabel}>0%</Text>
              <Text style={styles.sliderScaleLabel}>90%</Text>
            </View>
          </View>
        </View>
      ) : null}
      {pricingEnabled ? <View style={styles.pricingDivider} /> : null}
      <Field label="Harga jual per cup" required error={error}>
        <NumberField
          value={price}
          onChange={onPriceChange}
          label="Harga jual per cup"
          money
        />
      </Field>
      <View style={styles.pricingDivider} />
      {summary.hpp === null ? (
        <View style={styles.recipeEmpty}>
          <AppIcon
            name="calculator-variant-outline"
            size={20}
            color={colors.inkSubtle}
          />
          <Text style={styles.emptyLabel}>HPP belum lengkap</Text>
        </View>
      ) : (
        <View
          style={[
            styles.pricingSummaryRow,
            compact && styles.pricingSummaryRowCompact,
          ]}
        >
          <View
            style={[
              styles.summaryMetric,
              compact && styles.summaryMetricCompact,
            ]}
          >
            <Text style={styles.pricingMetricLabel}>HPP per cup</Text>
            <Text style={styles.pricingMetricValue}>
              {formatCurrency(summary.hpp)}
            </Text>
          </View>
          <View
            style={[
              styles.summaryMetric,
              compact && styles.summaryMetricCompact,
            ]}
          >
            <Text style={styles.pricingMetricLabel}>Estimasi laba</Text>
            <Text
              style={[
                styles.pricingMetricValue,
                summary.profit === null
                  ? undefined
                  : summary.profit < 0
                    ? styles.profitNegative
                    : styles.profitPositive,
              ]}
            >
              {summary.profit === null ? "—" : formatCurrency(summary.profit)}
            </Text>
          </View>
          <View
            style={[
              styles.summaryMetric,
              compact && styles.summaryMetricCompact,
            ]}
          >
            <Text style={styles.pricingMetricLabel}>Margin keuntungan</Text>
            <Text style={[styles.pricingMetricValue, styles.marginValue]}>
              {marginLabel}
            </Text>
          </View>
          <View
            style={[
              styles.summaryMetric,
              compact && styles.summaryMetricCompact,
            ]}
          >
            <Text style={styles.pricingMetricLabel}>Porsi tersedia</Text>
            <Text style={styles.pricingMetricValue}>
              {summary.portions} cup
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}
