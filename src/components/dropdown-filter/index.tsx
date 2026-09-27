import { DropdownSelect } from "../dropdown-select";

export type DropdownFilterOption<Value extends string> = {
  key: Value;
  label: string;
  count?: number;
};

export function DropdownFilter<Value extends string>({
  options,
  value,
  onChange,
  accessibilityLabel,
  fullWidth = false,
}: {
  options: readonly DropdownFilterOption<Value>[];
  value: Value;
  onChange: (value: Value) => void;
  accessibilityLabel: string;
  fullWidth?: boolean;
}) {
  return (
    <DropdownSelect
      options={options.map((option) => ({
        value: option.key,
        label: option.count === undefined
          ? option.label
          : `${option.label} (${option.count})`,
      }))}
      value={value}
      onChange={onChange}
      placeholder="Pilih filter"
      accessibilityLabel={accessibilityLabel}
      fullWidth={fullWidth}
      minWidth={fullWidth ? undefined : 190}
    />
  );
}
