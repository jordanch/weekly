const { forEach, chunk } = require("lodash")
// program runs on scheduled basis.
// 1. spin up process for each scraper
// 2. fetch stored issues from firebase db
// 3. fetch site archive, diff stored to archive list
// 4. fetch that which isn't yet stored
// 5. write to firebase and algeria for search
const fetch = require("node-fetch")
const cheerio = require("cheerio")

const jsWeeklyConfig = require("./scrapers/js-weekly/config/js-weekly.config")
const { writeIssue } = require("./database/firebase")

const jsWeekly = require("./scrapers/js-weekly/js-weekly.js").init(
  jsWeeklyConfig,
  cheerio
)
// main
;(async () => {
  try {
    const response = await fetch(jsWeeklyConfig.archiveURL)
    const html = await response.text()
    const archiveIssues = jsWeekly.getArchiveList(html)

    forEach(archiveIssues, async function(issue) {
      const response = await fetch(issue.href)
      const html = await response.text()
      const articles = jsWeekly.getArticlesFromIssue(html, issue.issueNumber)

      // const chunked = chunk(articles, 500)
      const document = {
        ...issue,
        articles
      }

      console.log(document)

      await writeIssue({
        collection: "jsweekly",
        id: issue.issueNumber.toString(),
        document
      })
    })
  } catch (error) {
    console.error(error)
  }
})()
