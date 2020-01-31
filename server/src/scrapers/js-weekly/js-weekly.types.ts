export interface IJSWeeklyConfig {
  archiveURL: string;
  FQDN: string;
}

export interface IJSWeeklyArchiveTemplate {
  name: string;
  created: Date;
  parse(
    issue: CheerioElement
  ): {
    issueNumber: number;
    href: URL;
    date: Date;
  };
}
