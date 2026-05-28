import { CheerioAPI } from "cheerio";

type ExchangeRate = {
  currencyCode: string;
  currencyName: string;
  rate: number;
};

const parseNumericRate = (value: string): number => {
  return parseFloat(value.replace(/,/g, ""));
};

export const extractExchangeRates = ($: CheerioAPI): ExchangeRate[] => {
  const rates: ExchangeRate[] = [];

  $("tr.country").each((_, row) => {
    const $row = $(row);
    const currencyCode = $row.data("currency-code") as string;
    const currencyName = $row.find(".country-name").text().trim();
    const rateAttr = $row.find(".money").data("rate");

    if (currencyCode && rateAttr) {
      rates.push({
        currencyCode,
        currencyName,
        rate: parseNumericRate(String(rateAttr)),
      });
    }
  });

  return rates;
};
