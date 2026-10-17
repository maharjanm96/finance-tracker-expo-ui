/**
 * Standard currency and date formatters.
 * Consistent NPR currency formatting across all screens.
 */

export function formatCurrency(
  amount: number,
  currency: string = "Rs.",
): string {
  const rounded = Math.round(amount);
  const formatted = rounded.toLocaleString("en-IN"); // South Asian grouping standard for NPR
  return `${currency} ${formatted}`;
}

export function formatCompactCurrency(
  amount: number,
  currency: string = "Rs.",
): string {
  const abs = Math.abs(amount);
  if (abs >= 10000000) {
    return `${currency} ${(amount / 10000000).toFixed(1)}Cr`;
  }
  if (abs >= 100000) {
    return `${currency} ${(amount / 100000).toFixed(1)}L`;
  }
  if (abs >= 1000) {
    return `${currency} ${(amount / 1000).toFixed(1)}k`;
  }
  return formatCurrency(amount, currency);
}

export function formatPercentage(value: number): string {
  if (isNaN(value) || !isFinite(value)) return "0%";
  return `${Math.round(value)}%`;
}

export function formatDateLabel(dateString: string): string {
  // If already relative (e.g. "Today", "Yesterday")
  if (dateString.startsWith("Today") || dateString.startsWith("Yesterday")) {
    return dateString;
  }

  try {
    const d = new Date(dateString);
    if (isNaN(d.getTime())) return dateString;
    return d.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
    });
  } catch {
    return dateString;
  }
}
