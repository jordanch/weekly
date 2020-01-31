import { Module } from "@nestjs/common";
import { ScrapersService } from "./scrapers.service";
import { JsWeeklyScraperService } from "./js-weekly/js-weekly.service";

@Module({
  providers: [ScrapersService, JsWeeklyScraperService]
})
export class ScrapersModule {}
