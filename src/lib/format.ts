const SUFFIXES = [
  { value: 1e12, symbol: 'T' },
  { value: 1e9, symbol: 'B' },
  { value: 1e6, symbol: 'M' },
  { value: 1e3, symbol: 'K' },
];

export function formatNumber(n: number): string {
  for (const { value, symbol } of SUFFIXES) {
    if (n >= value) {
      const formatted = (n / value).toFixed(1);
      return formatted.endsWith('.0')
        ? formatted.slice(0, -2) + symbol
        : formatted + symbol;
    }
  }
  return Math.floor(n).toLocaleString();
}

export function formatGold(n: number): string {
  return formatNumber(n);
}
