export const formatCurrency = (value: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(value);

export const formatPreciseCurrency = (value: number) =>
  new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 2 }).format(value);

export const digitsOnly = (value: string, maxLength?: number) => {
  const digits = value.replace(/\D/g, '').replace(/^0+(?=\d)/, '');
  return maxLength === undefined ? digits : digits.slice(0, maxLength);
};

export const parseWholeNumber = (value: string) => Number(digitsOnly(value)) || 0;

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
