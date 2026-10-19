export interface CurrencyInfo {
  code: string;
  symbol: string;
  name: string;
  country: string;
  flag: any;
}

export const CURRENCIES: CurrencyInfo[] = [
  {
    code: "NPR",
    symbol: "रु",
    name: "Nepalese Rupee",
    country: "Nepal",
    flag: require("../../assets/images/flags/nepal.png"),
  },
  {
    code: "USD",
    symbol: "$",
    name: "US Dollar",
    country: "United States",
    flag: require("../../assets/images/flags/usa.png"),
  },
  {
    code: "GBP",
    symbol: "£",
    name: "British Pound",
    country: "United Kingdom",
    flag: require("../../assets/images/flags/uk.png"),
  },
  {
    code: "CNY",
    symbol: "¥",
    name: "Chinese Yuan",
    country: "China",
    flag: require("../../assets/images/flags/china.png"),
  },
];

export const DEFAULT_CURRENCY = CURRENCIES[0]; // Nepal (रु)

export function getCurrencyInfo(symbolOrCode?: string): CurrencyInfo {
  if (!symbolOrCode) return DEFAULT_CURRENCY;
  const clean = symbolOrCode.trim().toLowerCase();
  return (
    CURRENCIES.find(
      (c) =>
        c.symbol.toLowerCase() === clean ||
        c.code.toLowerCase() === clean ||
        clean === "npr" ||
        clean === "रु" ||
        clean === "rs." ||
        clean === "rs",
    ) ?? DEFAULT_CURRENCY
  );
}
