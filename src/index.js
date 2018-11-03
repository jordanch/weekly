// program runs on scheduled basis.
// scrapes many sites, getting their archived posts.
// stores data into DB.
// user can search topics, getting back title, snippet, image and link.
const fetch = require("node-fetch")
const cheerio = require("cheerio")
const jsWeeklyConfig = require("./scrapers/config/js-weekly.config")

const jsWeekly = require("./scrapers/js-weekly").init(jsWeeklyConfig, cheerio)
// main
;(async () => {
  const response = await fetch(jsWeeklyConfig.archiveURL)
  const html = await response.text()
  const archiveIssues = await jsWeekly.getArchiveList(html)
  console.log(archiveIssues)
})()
