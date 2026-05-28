import { Elysia } from "elysia";
import { ProductDetails, requestHandler } from "./scrape/amazonScraper";
import { CheerioCrawler } from "crawlee";
import cors from "@elysia/cors";
import {
  buildGeoJsonMapDataFromUsd,
  getBrazil,
  getFullGeojson,
} from "./map/geojsonService";
import { getUsdPrice } from "./currency/currencyService";

const app = new Elysia()
  .use(
    cors({
      origin: ["http://localhost:5173", "http://localhost:3000"],
    }),
  )
  .get("/", async () => {
    return await getBrazil();
  })
  .get("/scrape", async () => {
    const crawler = new CheerioCrawler({
      preNavigationHooks: [
        (_, gotOptions) => {
          gotOptions.http2 = false;
        },
      ],
      requestHandler,
    });

    await crawler.run([
      "https://www.amazon.com.br/Dumbbell-Halter-Gallant-Elite-Regul%C3%A1vel/dp/B0CM6TVWZ8",
    ]);

    const crawlerData = await crawler.getData();
    if (crawlerData.items.length != 1) {
      throw new Error(
        `crawler got wrong number of items:  ${crawlerData.items.length}. expected 1`,
      );
    }

    const scrapedItem = crawlerData.items[0] as ProductDetails;

    const usdPrice = await getUsdPrice(
      scrapedItem.price.value,
      scrapedItem.price.currency,
    );

    const geoJsonMapData = await buildGeoJsonMapDataFromUsd(usdPrice);

    return geoJsonMapData;
  })
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
