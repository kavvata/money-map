import { Elysia, t } from "elysia";
import { ProductDetails, requestHandler } from "./scrape/amazonScraper";
import { CheerioCrawler } from "crawlee";
import cors from "@elysia/cors";
import { buildGeoJsonMapDataFromUsd } from "./map/geojsonService";
import { getUsdPrice } from "./currency/currencyService";

const app = new Elysia()
  .use(
    cors({
      origin: ["http://localhost:5173", "http://localhost:3000"],
    }),
  )
  .get("/", (): string => {
    return `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`;
  })
  .post(
    "/scrape",
    async ({ body }) => {
      const crawler = new CheerioCrawler({
        preNavigationHooks: [
          (_, gotOptions) => {
            gotOptions.http2 = false;
          },
        ],
        requestHandler,
      });

      await crawler.run([body.url]);

      const crawlerData = await crawler.getData();
      if (crawlerData.items.length != 1) {
        throw new Error(
          `crawler got wrong number of items:  ${crawlerData.items.length}. expected 1.\n${crawlerData.items}`,
        );
      }

      const scrapedItem = crawlerData.items[0] as ProductDetails;

      const usdPrice = await getUsdPrice(
        scrapedItem.price.value,
        scrapedItem.price.currency,
      );

      const geoJsonMapData = await buildGeoJsonMapDataFromUsd(usdPrice);

      return geoJsonMapData;
    },
    {
      body: t.Object({
        url: t.String(),
      }),
    },
  )
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
