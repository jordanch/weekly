const jsWeekly = require("../js-weekly")
const cheerio = require("cheerio")
const fs = require("fs")
const promisify = require("util").promisify
const path = require("path")
const { reduce, assign } = require("lodash")

const readFile = promisify(fs.readFile)

const TEST_CONFIG = {
  archiveURL: "https://javascriptweekly.com/issues",
  FQDN: "https://javascriptweekly.com"
}

const jsWeeklyScraper = jsWeekly.init(TEST_CONFIG, cheerio)

describe("JavaScript Weekly > Scraping", () => {
  test("Can scrape the archive issue list", async () => {
    try {
      const html = await readFile(
        path.join(__dirname, "/html/js-weekly.archive.html"),
        {
          encoding: "utf8"
        }
      )
      // create a map to more easily assert
      const issues = reduce(
        await jsWeeklyScraper.getArchiveList(html),
        (hash, issue) =>
          assign(hash, {
            [issue.issueNumber]: issue
          }),
        {}
      )

      const testData = reduce(
        [
          {
            issueNumber: "410",
            href: "https://javascriptweekly.com/issues/410",
            date: -2119744800000
          },
          {
            issueNumber: "409",
            href: "https://javascriptweekly.com/issues/409",
            date: 1540504800000
          },
          {
            issueNumber: "408",
            href: "https://javascriptweekly.com/issues/408",
            date: 1539900000000
          },
          {
            issueNumber: "407",
            href: "https://javascriptweekly.com/issues/407",
            date: 1539295200000
          },
          {
            issueNumber: "406",
            href: "https://javascriptweekly.com/issues/406",
            date: 1538690400000
          },
          {
            issueNumber: "405",
            href: "https://javascriptweekly.com/issues/405",
            date: 1538085600000
          },
          {
            issueNumber: "404",
            href: "https://javascriptweekly.com/issues/404",
            date: 1537480800000
          },
          {
            issueNumber: "403",
            href: "https://javascriptweekly.com/issues/403",
            date: 1536876000000
          },
          {
            issueNumber: "402",
            href: "https://javascriptweekly.com/issues/402",
            date: -1967248800000
          },
          {
            issueNumber: "401",
            href: "https://javascriptweekly.com/issues/401",
            date: 1535666400000
          },
          {
            issueNumber: "400",
            href: "https://javascriptweekly.com/issues/400",
            date: 1535061600000
          }
        ],
        (hash, issue) =>
          assign(hash, {
            [issue.issueNumber]: issue
          }),
        {}
      )

      expect(issues).toEqual(testData)
    } catch (error) {
      console.log(error)
      throw new Error(error)
    }
  })

  test("Can scrape an issue", async () => {
    const html = await readFile(
      path.join(__dirname, "/html/js-weekly.issue.html"),
      {
        encoding: "utf8"
      }
    )
    expect(jsWeeklyScraper.getArticlesFromIssue(html, 410)).toEqual({
      410: [
        {
          title: "An Annotated webpack 4 Config for Frontend Development",
          description:
            "A very thorough example of a real-world production webpack 4 config that takes modules, CSS, and image optimization into account.",
          author: "Andrew Welch",
          URL: "https://javascriptweekly.com/link/55117/web"
        },
        {
          title: "Storybook 4.0: The UI Component Workshop",
          description:
            "A great tool for building UI components gets a major update which includes support for webpack 4 & Babel 7, React Native, Ember, Svelte, Riot, and more, plus improvements for existing React, Vue and Angular users. If you’re not familiar with Storybook, learn more here.",
          author: "Michael Shilman",
          URL: "https://javascriptweekly.com/link/55118/web"
        }
      ]
    })
  })
})
