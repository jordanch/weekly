// fetch html from a configurable list of endpoints
// persist html onto disk, prefix with date and url

const fs = require("fs")
const promisify = require("util").promisify
const path = require("path")
const fetch = require("node-fetch")
const jsWeeklyConfig = require("../src/scrapers/js-weekly/config/js-weekly.config")

const writeFile = promisify(fs.writeFile)

async function main() {
  const response = await fetch(jsWeeklyConfig.archiveURL)
  const html = await response.text()

  await writeFile(
    "./src/scrapers/js-weekly/tests/html/js-weekly.archive-test.html",
    `<!-- ${new Date()} --> \n${html}`
  )
}

main()
