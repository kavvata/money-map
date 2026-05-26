import { CheerioAPI, CheerioCrawlingContext } from "crawlee";

type ProductDetails = {
  title: string;
  price: number;
  imgUrl: string;
};

const SELECTORS = {
  TITLE: "span#productTitle",
  PRICE_WHOLE: "div#corePriceDisplay_desktop_feature_div span.a-price-whole",
  PRICE_FRACTION: "span.a-price-fraction",
  IMG_URL: ".imgTagWrapper img",
} as const;

export const extractProductDetails = ($: CheerioAPI): ProductDetails => {
  const title = $(SELECTORS.TITLE).text().trim();
  const priceWhole = $(SELECTORS.PRICE_WHOLE).text().trim();
  const priceFraction = $(SELECTORS.PRICE_WHOLE).text().trim();
  const imgUrl = $(SELECTORS.IMG_URL).text().trim();

  console.log({ priceWhole, priceFraction });

  return { title, price: Number(`${priceWhole}.${priceFraction}`), imgUrl };
};

export const requestHandler = async (context: CheerioCrawlingContext) => {
  const { $ } = context;
  const { pushData } = context;
  const details = extractProductDetails($);
  await pushData(details);
};
