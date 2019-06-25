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
const { AppError } = require("./app.error")
const { debug } = require("./app.debug")
const jsWeekly = require("./scrapers/js-weekly/js-weekly.js")

// main
async function main() {
  const unsuccessful = []

  const successful = []

  const sites = [
    jsWeekly.init(
      {
        getArchiveHtml: async function getArchiveHtml() {
          const response = await fetch(jsWeeklyConfig.archiveURL)

          return response.text()
        },
        getIssueHtml: async function getIssueHtml(href) {
          const response = await fetch(href)

          return response.text()
        },
        ...jsWeeklyConfig
      },
      cheerio
    )
  ]

  const siteData = []

  try {
    sites.forEach(async function process(site = {}) {
      const articles = []
      // todo: we can cross check against the db to see which archive issues need to be processed
      // right now, everything is
      const { archiveList, articlesFromIssue, identifier } = site

      const issues = await archiveList()

      siteData.push(
        new Promise(function promise(resolve) {
          issues.map(function process(issue) {
            return new Promise(async function(resolve) {
              try {
                const articles = await articlesFromIssue(issue)

                if (articles.length === 0) {
                  // we have scraped the issue but did not find any articles.
                  return resolve({
                    errors: [`No articles for ${identifier}`],
                    issueNumber: issue.issueNumber
                  })
                }

                const validArticles = []

                articles.forEach(function processArticle(article) {
                  const _article = {
                    issueNumber: issue.issueNumber,
                    errors: article.errors
                  }

                  if (_article.errors.length > 0) {
                    unsuccessful.push(_article)
                  } else {
                    validArticles.push(_article)
                  }
                })

                if (validArticles.length === 0) {
                  return resolve({
                    errors: ["No valid articles"],
                    issueNumber: issue.issueNumber
                  })
                }

                // todo: chunk writing to db.
                // const chunked = chunk(articles, 500)
                const document = {
                  ...issue,
                  articles: validArticles
                }

                await writeIssue({
                  collection: "jsweekly",
                  id: issue.issueNumber.toString(),
                  document
                })

                return resolve({
                  errors: [],
                  issueNumber: issue.issueNumber
                })

                // sortBy(issuesWithNoArticles, "issueNumber")
              } catch (error) {
                debug(error)

                return resolve({
                  errors: [error],
                  issueNumber: issue.issueNumber
                })
              }
            })
          })
        })
      )
    })

    debug(articlesPs)

    const articles = await Promise.all(articlesPs)

    articles.forEach(function process(item) {
      if (item.errors.length > 0) {
        unsuccessful.push(item)
      } else {
        successful.push(item)
      }
    })

    unsuccessful.forEach(function analyse(item) {
      const { issueNumber, errors } = item

      debug(`unsuccessful scrape issue ${issueNumber}, errors:`, errors)
    })

    successful.forEach(function analyse(item) {
      const { issueNumber } = item

      debug(`successful scrape issue ${issueNumber}`)
    })
  } catch (error) {
    debug(error)
  }
}

main()
