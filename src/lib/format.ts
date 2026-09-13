export function formatPrice(amount: number): string {
  return `$${amount.toFixed(2)}`;
}

/** Add-on prices read as a delta, and a free option says so instead of "+$0.00". */
export function formatSurcharge(amount: number): string {
  return amount === 0 ? 'Included' : `+${formatPrice(amount)}`;
}
