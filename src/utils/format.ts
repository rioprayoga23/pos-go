export const formatCurrency = (value: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);

export const formatPreciseCurrency = (value: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 2 }).format(value);

export const digitsOnly = (value: string, maxLength?: number) => {
  const digits = value.replace(/\D/g, '').replace(/^0+(?=\d)/, '');
  return maxLength === undefined ? digits : digits.slice(0, maxLength);
};

export const parseWholeNumber = (value: string) => Number(digitsOnly(value)) || 0;

export const decimalOnly = (value: string, maxFractionDigits = 9) => {
  const input = value.trim();
  const commaIndex = input.lastIndexOf(',');
  const dotIndex = input.lastIndexOf('.');
  const dotIsDecimal = commaIndex < 0 && dotIndex >= 0 &&
    (input.length - dotIndex - 1 !== 3 || input.slice(0, dotIndex) === '0');
  const hasDecimal = commaIndex >= 0 || dotIsDecimal;
  const index = commaIndex >= 0 ? commaIndex : dotIndex;
  const integerSource = hasDecimal ? input.slice(0, index) : input;
  const fractionSource = hasDecimal ? input.slice(index + 1) : '';
  const integer = integerSource.replace(/\D/g, '').replace(/^0+(?=\d)/, '');
  const fraction = fractionSource.replace(/\D/g, '').slice(0, maxFractionDigits);
  return hasDecimal ? `${integer || '0'}.${fraction}` : integer;
};

export const parseDecimal = (value: string) => Number(value) || 0;

export const isValidQuantity = (value: number) =>
  Number.isFinite(value) && value >= 0 && value <= 1_000_000_000_000 &&
  (value === 0 || Math.round(value * 1_000_000_000) > 0) &&
  Math.abs(value - Math.round(value * 1_000_000_000) / 1_000_000_000) < 0.000000000001;

export const formatQuantity = (value: number) =>
  new Intl.NumberFormat('id-ID', { maximumFractionDigits: 9 }).format(Number.isFinite(value) ? value : 0);

export const formatDecimalInput = (value: string) => {
  const [integer = '', fraction] = value.split('.');
  const groupedInteger = integer.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
  return fraction === undefined ? groupedInteger : `${groupedInteger},${fraction}`;
};

export const formatThousands = (value: string | number) => {
  const digits = digitsOnly(String(value));
  return digits.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

export const formatCompactCurrency = (value: number) => {
  if (value >= 1_000_000) return `Rp ${(value / 1_000_000).toFixed(1).replace('.', ',')} jt`;
  if (value >= 1_000) return `Rp ${Math.round(value / 1_000)} rb`;
  return formatCurrency(value);
};

export const nowLabel = () =>
  new Intl.DateTimeFormat('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date());
