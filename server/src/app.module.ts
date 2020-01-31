import { Module } from "@nestjs/common";
import { ScheduleModule } from "@nestjs/schedule";
import { AppController } from "./app.controller";
import { AppService } from "./app.service";
import { ScrapersModule } from "./scrapers/scrapers.module";

@Module({
  imports: [ScheduleModule.forRoot(), ScrapersModule],
  controllers: [AppController],
  providers: [AppService]
})
export class AppModule {}
