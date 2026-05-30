import exchangeRatesJson from "../../data/rates.json";
import minimumWageJson from "../../data/minimumWage.json";

interface CurrencyRate {
  currencyCode: string;
  currencyName: string;
  rate: number;
}

interface CurrencyRates {
  baseCurrency: string;
  timestamp: Date;
  rates: Array<CurrencyRate>;
}

interface MinimumWage {
  country: string;
  minimumWage: string;
  dateEstimate: string;
  previousValue: string;
}

const CURRENCIES = {
  BRL: ["R$", "BRL"],
  USD: ["$", "USD"],
} as const;

const AVERAGE_HOURS_WORKED_IN_ONE_MONTH = 173.33;

export const getUsdPrice = async (
  value: number,
  currency: string,
): Promise<number> => {
  const currencyValues = CURRENCIES as Record<string, readonly string[]>;

  const normalizedCurrency = Object.keys(CURRENCIES).find((key) =>
    currencyValues[key].includes(currency),
  ) as keyof CurrencyRates;

  if (!normalizedCurrency) {
    throw new Error(`Currency "${currency}" not found.`);
  }

  const exchangeRates = exchangeRatesJson as CurrencyRates;
  const originalRate = exchangeRates.rates.find(
    (r) => r.currencyCode == normalizedCurrency,
  );

  if (!originalRate) {
    throw new Error(
      `originalRate from normalized currency ${normalizedCurrency} not found.`,
    );
  }

  return value / originalRate.rate;
};

export const usdToTime = (price: number, countryName: string) => {
  const minimumWages = minimumWageJson as Array<MinimumWage>;

  const countryWage = minimumWages.find((w) => w.country == countryName);
  if (!countryWage) {
    console.log(`Country "${countryName}" not found`);
    return 0;
  }

  const hourlyWage =
    parseFloat(countryWage.minimumWage.replace(",", "")) /
    AVERAGE_HOURS_WORKED_IN_ONE_MONTH;

  if (Number.isNaN(hourlyWage)) {
    throw new Error(
      `something went wrong while reading the minimum wage dataset. on ${countryWage.country}->minimumWage = ${countryWage.minimumWage}; hourlyWage = ${hourlyWage}`,
    );
  }

  return price / hourlyWage;
};
