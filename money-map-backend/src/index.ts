import { Elysia } from "elysia";
import { requestHandler } from "./scrape/amazonScraper";
import { CheerioCrawler } from "crawlee";
import cors from "@elysia/cors";
import { getBrazil, getFullGeojson } from "./map/geojsonService";

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
    const scrapedItem = crawlerData.items;

    // const usdValue = getUsdPrice(scrapedItem)
    // const geojsonWithTimeValue = mapToTime(usdValue)

    return scrapedItem;
  })
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
