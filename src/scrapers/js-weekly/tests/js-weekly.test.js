const jsWeekly = require("../js-weekly")
const { JsWeeklyScraperError } = require("../../js-weekly/js-weekly.error")
const cheerio = require("cheerio")
const fs = require("fs")
const promisify = require("util").promisify
const path = require("path")

const readFile = promisify(fs.readFile)

const TEST_CONFIG = {
  archiveURL: "https://javascriptweekly.com/issues",
  FQDN: "https://javascriptweekly.com"
}

let issueHtml
let archiveHtml

beforeAll(async () => {
  archiveHtml = await readFile(
    path.join(__dirname, "/html/js-weekly.archive.html"),
    {
      encoding: "utf8"
    }
  )

  issueHtml = await readFile(
    path.join(__dirname, "/html/js-weekly.issue.html"),
    {
      encoding: "utf8"
    }
  )
})

const jsWeeklyScraper = jsWeekly.init(
  {
    getArchiveHtml: async function getArchiveList() {
      return archiveHtml
    },
    getIssueHtml: async function getIssueHtml() {
      return issueHtml
    },
    ...TEST_CONFIG
  },
  cheerio
)

describe("arguments", () => {
  describe("> articlesFromIssue", () => {
    test("should throw when `issueNumber` argument does not parse into integer", async () => {
      await expect(jsWeeklyScraper.articlesFromIssue()).rejects.toThrow(
        "Issue number incorrect type, value before parse: undefined"
      )

      await expect(
        jsWeeklyScraper.articlesFromIssue({ issueNumber: "Nah3758" })
      ).rejects.toThrow(
        "Issue number incorrect type, value before parse: Nah3758, string"
      )
    })

    test("should throw error if `html` argument not string type", async () => {
      const scraper = jsWeekly.init(
        {
          getIssueHtml: async function getIssueHtml() {
            return 140494
          },
          ...TEST_CONFIG
        },
        cheerio
      )
      await expect(
        scraper.articlesFromIssue({ issueNumber: 401 })
      ).rejects.toThrow("Html must be type string")
    })
  })
})

describe("scraping", () => {
  describe("> archiveList", () => {
    test("should scrape the archive issue list", async () => {
      // create a map to more easily assert
      const issues = await jsWeeklyScraper.archiveList()

      const testData = [
        {
          issueNumber: 410,
          href: "https://javascriptweekly.com/issues/410",
          date: 1541109600000
        },
        {
          issueNumber: 409,
          href: "https://javascriptweekly.com/issues/409",
          date: 1540504800000
        },
        {
          issueNumber: 408,
          href: "https://javascriptweekly.com/issues/408",
          date: 1539900000000
        },
        {
          issueNumber: 407,
          href: "https://javascriptweekly.com/issues/407",
          date: 1539295200000
        },
        {
          issueNumber: 406,
          href: "https://javascriptweekly.com/issues/406",
          date: 1538690400000
        },
        {
          issueNumber: 405,
          href: "https://javascriptweekly.com/issues/405",
          date: 1538085600000
        },
        {
          issueNumber: 404,
          href: "https://javascriptweekly.com/issues/404",
          date: 1537480800000
        },
        {
          issueNumber: 403,
          href: "https://javascriptweekly.com/issues/403",
          date: 1536876000000
        },
        {
          issueNumber: 402,
          href: "https://javascriptweekly.com/issues/402",
          date: 1536271200000
        },
        {
          issueNumber: 401,
          href: "https://javascriptweekly.com/issues/401",
          date: 1535666400000
        },
        {
          issueNumber: 400,
          href: "https://javascriptweekly.com/issues/400",
          date: 1535061600000
        }
      ].reduce(
        (hash, issue) =>
          Object.assign(hash, {
            [issue.issueNumber]: issue
          }),
        {}
      )

      expect(
        issues.reduce(
          (hash, issue) =>
            Object.assign(hash, {
              [issue.issueNumber]: issue
            }),
          {}
        )
      ).toEqual(testData)
    })
  })

  describe("> articlesFromIssue", () => {
    test("should scrape an issue", async () => {
      expect(
        await jsWeeklyScraper.articlesFromIssue({ href: "", issueNumber: 401 })
      ).toEqual([
        {
          title: "An Annotated webpack 4 Config for Frontend Development",
          description:
            "A very thorough example of a real-world production webpack 4 config that takes modules, CSS, and image optimization into account.",
          author: "Andrew Welch",
          URL: "https://javascriptweekly.com/link/55117/web",
          id: jsWeeklyScraper.articleIdentifier(
            "An Annotated webpack 4 Config for Frontend Development"
          ),
          errors: []
        },
        {
          title: "Storybook 4.0: The UI Component Workshop",
          description:
            "A great tool for building UI components gets a major update which includes support for webpack 4 & Babel 7, React Native, Ember, Svelte, Riot, and more, plus improvements for existing React, Vue and Angular users. If you’re not familiar with Storybook, learn more here.",
          author: "Michael Shilman",
          URL: "https://javascriptweekly.com/link/55118/web",
          id: jsWeeklyScraper.articleIdentifier(
            "Storybook 4.0: The UI Component Workshop"
          ),
          errors: []
        }
      ])
    })
  })
})
