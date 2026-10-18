import { getCurrencyInfo } from "@/constants/currencies";

let activeCurrencySymbol = "NPR";

export function setActiveCurrency(currency: string) {
  const info = getCurrencyInfo(currency);
  activeCurrencySymbol = info.symbol;
}

export function getActiveCurrency(): string {
  return activeCurrencySymbol;
}

export function formatCurrency(amount: number, currency?: string): string {
  const curr = currency ?? activeCurrencySymbol;
  const rounded = Math.round(amount);

  const locale =
    curr === "$" || curr === "A$"
      ? "en-US"
      : curr === "£"
        ? "en-GB"
        : curr === "¥"
          ? "zh-CN"
          : "en-IN"; // South Asian grouping standard for NPR/INR

  const formatted = rounded.toLocaleString(locale);
  return `${curr} ${formatted}`;
}

export function formatCompactCurrency(
  amount: number,
  currency?: string,
): string {
  const curr = currency ?? activeCurrencySymbol;
  const abs = Math.abs(amount);
  if (abs >= 10000000) {
    return `${curr} ${(amount / 10000000).toFixed(1)}Cr`;
  }
  if (abs >= 100000) {
    return `${curr} ${(amount / 100000).toFixed(1)}L`;
  }
  if (abs >= 1000) {
    return `${curr} ${(amount / 1000).toFixed(1)}k`;
  }
  return formatCurrency(amount, curr);
}

export function formatPercentage(value: number): string {
  if (isNaN(value) || !isFinite(value)) return "0%";
  return `${Math.round(value)}%`;
}

export function formatDateLabel(dateString: string): string {
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
