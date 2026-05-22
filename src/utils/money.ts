export function formatMoney(amount = 0, currency = 'EGP') {
  const safeAmount = Number.isFinite(Number(amount)) ? Number(amount) : 0;

  try {
    return new Intl.NumberFormat('en-EG', {
      style: 'currency',
      currency,
      maximumFractionDigits: currency === 'EGP' ? 0 : 2,
    }).format(safeAmount);
  } catch {
    return `${currency} ${safeAmount.toFixed(currency === 'EGP' ? 0 : 2)}`;
  }
}

export function toNumber(value: unknown) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}
