import { Injectable } from "@nestjs/common";
import * as cheerio from "cheerio";
import { IJSWeeklyArchiveTemplate, IJSWeeklyConfig } from "./js-weekly.types";
import { JsWeeklyOriginIssuesTemplate } from "./archive/js-weekly-origin-archive-template";
import * as fetch from "node-fetch";

@Injectable()
export class JsWeeklyScraperService {
  private readonly identifier = "js_weekly";
  private readonly config: IJSWeeklyConfig = {
    archiveURL: "https://javascriptweekly.com/issues",
    FQDN: "https://javascriptweekly.com"
  };

  private getArticleIdentifier(title: string): string {
    return `${this.identifier}_article_${hashCode(title)}`;

    // https://stackoverflow.com/questions/7616461/generate-a-hash-from-string-in-javascript
    function hashCode(string) {
      let hash = 0;
      let i;
      let chr;

      if (string.length === 0) return hash;

      for (i = 0; i < string.length; i++) {
        chr = string.charCodeAt(i);
        hash = (hash << 5) - hash + chr;
        hash |= 0; // Convert to 32bit integer
      }
      return hash;
    }
  }

  public async getArchiveList() {
    const response = await fetch(this.config.archiveURL);
    const text = await response.text();
    const $ = cheerio.load(text);
    const templates = JsWeeklyScraperService.getOrderedTemplatesByDate([
      new JsWeeklyOriginIssuesTemplate(this.config, $)
    ]);

    const issues = $(".issue")
      .map((i, issue) => {
        for (const t of templates) {
          try {
            return t.parse(issue);
          } catch (e) {
            console.error(`Failed parsing with template ${t.name}`);
          }
        }
      })
      .get();

    console.log(issues);
  }

  private static getOrderedTemplatesByDate(
    templates: IJSWeeklyArchiveTemplate[]
  ) {
    return templates.sort((left, right) => {
      if (left.created < right.created) return -1;
      if (left.created > right.created) return 1;
      else return 0;
    });
  }
}
