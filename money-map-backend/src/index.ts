import { Elysia } from "elysia";
import { requestHandler } from "./scrape/amazonScraper";
import { CheerioCrawler } from "crawlee";

const app = new Elysia()
  .get("/", () => "Hello Elysia")
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

    return crawler.getData();
  })
  .listen(3000);

console.log(
  `🦊 Elysia is running at ${app.server?.hostname}:${app.server?.port}`,
);
