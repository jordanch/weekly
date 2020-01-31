import { IJSWeeklyArchiveTemplate, IJSWeeklyConfig } from "../js-weekly.types";
import { monthStringToZeroBasedNumber } from "../../../utils/dates";

export class JsWeeklyOriginIssuesTemplate implements IJSWeeklyArchiveTemplate {
  public readonly name = "origin";
  public readonly created = new Date(2020, 0, 31);
  private readonly config: IJSWeeklyConfig;
  private readonly $: CheerioStatic;

  constructor(config: IJSWeeklyConfig, $: CheerioStatic) {
    this.config = config;
    this.$ = $;
  }

  public parse(issue: CheerioElement) {
    const issueNumber = this.issueNumber(issue);
    const href = this.href(issue);
    const date = this.date(issue);

    if (!issueNumber || !href || !date) {
      throw new Error("part or whole meta data invalid");
    }

    return {
      issueNumber,
      href,
      date
    };
  }

  private issueNumber(issue: CheerioElement) {
    return parseInt(
      this.$("a", issue)
        .attr("href")
        .split("/")[1],
      10
    );
  }

  private href(issue: CheerioElement) {
    return new URL(`${this.config.FQDN}/${this.$("a", issue).attr("href")}`);
  }

  private date(issue: CheerioElement) {
    // format e.g: July 18, 2014
    const dateSegments = this.$(issue)
      .text()
      .split(" — ")[1]
      .split(" ")
      .map(segment => segment.trim().replace(",", ""))
      .filter(segment => Boolean(segment));

    return new Date(
      parseInt(dateSegments[2], 10), // year
      monthStringToZeroBasedNumber(dateSegments[0]), // month
      parseInt(dateSegments[1], 10) // day
    );
  }
}
