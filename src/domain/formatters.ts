import { getCurrencyInfo } from "@/constants/currencies";

let activeCurrencySymbol = "रु";

export function setActiveCurrency(currency: string) {
  const info = getCurrencyInfo(currency);
  activeCurrencySymbol = info.symbol;
}

export function getActiveCurrency(): string {
  return activeCurrencySymbol;
}

export function formatCurrency(amount: number, currency?: string): string {
  const info = getCurrencyInfo(currency ?? activeCurrencySymbol);
  const symbol = info.symbol;
  const rounded = Math.round(amount);

  const locale =
    info.code === "USD" || symbol === "$" || symbol === "A$"
      ? "en-US"
      : info.code === "GBP" || symbol === "£"
        ? "en-GB"
        : info.code === "CNY" || symbol === "¥"
          ? "zh-CN"
          : "en-US"; // Standard 3-digit comma grouping (e.g. 100,000)

  const formatted = Math.abs(rounded).toLocaleString(locale);
  const sign = rounded < 0 ? "-" : "";
  return `${sign}${symbol} ${formatted}`;
}

export function formatCompactCurrency(
  amount: number,
  currency?: string,
): string {
  const info = getCurrencyInfo(currency ?? activeCurrencySymbol);
  const symbol = info.symbol;
  const abs = Math.abs(amount);
  const sign = amount < 0 ? "-" : "";

  // Only compact after 1,000,000 (>= 1,000,000) -> e.g. 1M, 1.2M, 10M
  if (abs >= 1000000) {
    const millions = abs / 1000000;
    const formatted = parseFloat(millions.toFixed(2));
    return `${sign}${symbol} ${formatted}M`;
  }

  // Under 1,000,000: display full amount as it is (e.g. रु 100,000, रु 85,000)
  return formatCurrency(amount, symbol);
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

export function formatTime(dateOrTimestamp: Date | number): string {
  const d =
    typeof dateOrTimestamp === "number"
      ? new Date(dateOrTimestamp)
      : dateOrTimestamp;
  if (isNaN(d.getTime())) return "";

  let hours = d.getHours();
  const minutes = d.getMinutes();
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12;
  hours = hours ? hours : 12;
  const minutesStr = minutes < 10 ? `0${minutes}` : `${minutes}`;

  return `${hours}:${minutesStr} ${ampm}`;
}

export function formatTransactionDateTime(tx: {
  date: string;
  timestamp?: number;
  time?: string;
}): string {
  if (!tx) return "";

  // If date already includes ' at ' (e.g. 'Today at 11:10 AM')
  if (tx.date && tx.date.includes(" at ")) {
    return tx.date;
  }

  // Resolve time string
  let timeStr = tx.time;
  if (!timeStr && tx.timestamp) {
    timeStr = formatTime(tx.timestamp);
  }

  let dateLabel = tx.date || "Today";
  if (tx.timestamp) {
    const d = new Date(tx.timestamp);
    if (!isNaN(d.getTime())) {
      const now = new Date();
      const isToday =
        d.getFullYear() === now.getFullYear() &&
        d.getMonth() === now.getMonth() &&
        d.getDate() === now.getDate();

      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      const isYesterday =
        d.getFullYear() === yesterday.getFullYear() &&
        d.getMonth() === yesterday.getMonth() &&
        d.getDate() === yesterday.getDate();

      if (isToday) {
        dateLabel = "Today";
      } else if (isYesterday) {
        dateLabel = "Yesterday";
      } else if (
        !dateLabel ||
        dateLabel === "Today" ||
        dateLabel === "Yesterday"
      ) {
        const months = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];
        const month = months[d.getMonth()];
        const day = d.getDate();
        const year = d.getFullYear();
        dateLabel =
          year === now.getFullYear()
            ? `${month} ${day}`
            : `${month} ${day}, ${year}`;
      }
    }
  }

  if (timeStr) {
    return `${dateLabel} at ${timeStr}`;
  }

  return dateLabel;
}
