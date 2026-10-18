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
