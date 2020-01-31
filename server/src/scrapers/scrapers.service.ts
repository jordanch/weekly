import { Injectable, Logger } from "@nestjs/common";
import { Cron, CronExpression } from "@nestjs/schedule";
import { JsWeeklyScraperService } from "./js-weekly/js-weekly.service";

@Injectable()
export class ScrapersService {
  private readonly logger = new Logger(ScrapersService.name);

  constructor(private jsWeeklyScraper: JsWeeklyScraperService) {
    this.jsWeeklyScraper = jsWeeklyScraper;
  }

  @Cron(CronExpression.EVERY_30_SECONDS)
  handleCron() {
    this.logger.debug("Scraper cron executing...");
    this.jsWeeklyScraper.getArchiveList();
  }
}
