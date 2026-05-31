import { CheerioAPI, CheerioCrawlingContext } from "crawlee";

type Price = {
  currency: string;
  value: number;
};

export type ProductDetails = {
  title: string;
  price: Price;
  imgUrl: string;
};

const parseCurrency = (input: string): Price => {
  const match = input.match(/^([^\d]+)([\d.,]+)$/);

  if (!match)
    throw new Error(
      `Unrecognized currency format: "${input}" with matcher ${match}`,
    );

  const [_, currency, rawValue] = match;
  const value = parseFloat(rawValue.replace(/\./g, "").replace(",", "."));

  console.log({ rawValue, value });

  if (isNaN(value))
    throw new Error(`Could not parse numeric value from: "${rawValue}"`);

  return { currency: currency.trim(), value };
};

const SELECTORS = {
  TITLE: "span#productTitle",
  PRICE: "span.priceToPay",
  IMG_URL: ".imgTagWrapper img",
} as const;

export const extractProductDetails = ($: CheerioAPI): ProductDetails => {
  const title = $(SELECTORS.TITLE).text().trim();
  const priceElementList = $(SELECTORS.PRICE);

  const price =
    priceElementList.length > 1
      ? priceElementList.first().text().trim()
      : priceElementList.text().trim();
  const imgUrl = $(SELECTORS.IMG_URL).attr("src") ?? "";

  return { title, price: parseCurrency(price), imgUrl };
};

export const requestHandler = async (context: CheerioCrawlingContext) => {
  const { $, pushData } = context;
  await pushData(extractProductDetails($));
};
