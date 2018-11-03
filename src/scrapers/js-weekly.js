const { monthStringToZeroBasedNumber } = require("../helpers/dates")
const { stripNewLineAndExcessWhitespace } = require("../helpers/text")
const { includes } = require("lodash")

function init(config, cheerio) {
  const _config = config
  const _cheerio = cheerio

  return {
    getArchiveList,
    getArticlesFromIssue
  }

  /**
   * @description Return the list of archived issues, including the issue
   * number, hyperlink and issue date.
   *
   * @param {string} html
   */
  async function getArchiveList(html) {
    try {
      const $ = _cheerio.load(html)

      // todo: error handling
      return $(".issue")
        .map((i, issue) => {
          const anchor = $("a", issue)
          // format: July 18, 2014
          const dateSegments = $(issue)
            .text()
            .split(" — ")[1]
            .split(" ")
            .map((segment) => segment.trim().replace(",", ""))
            .filter((segment) => Boolean(segment))

          return {
            issueNumber: anchor.attr("href").split("/")[1],
            href: `${_config.FQDN}/${anchor.attr("href")}`,
            date: new Date(
              dateSegments[2], // year
              monthStringToZeroBasedNumber(dateSegments[0]), // month
              dateSegments[1] // day
            ).getTime()
          }
        })
        .get()
    } catch (error) {
      console.log(error)
    }
  }

  /**
   * @description Return the data for an issue, including the issue
   * number, title, description, author and URL.
   *
   * @param {string} html
   * @param {number} issueNumber
   */
  function getArticlesFromIssue(html, issueNumber) {
    const $ = cheerio.load(html)

    if (!issueNumber) throw new Error("Issue number required")

    const articles = $("table", "#content")
      .map((i, table) => {
        const $details = $(".desc", table)
        const $mainLinkContainer = $(".mainlink", table)
        const $titleAndLink = $("a", $mainLinkContainer)
        const $author = $(".name", table)

        try {
          const title = $titleAndLink.text()
          const description = $details
            .clone()
            .children()
            .remove("span")
            .end()
            .text()
            .replace(" — ", "")
          const author = $author.text()
          const URL = $titleAndLink.attr("href")

          if (!title || !description || !author || !URL) {
            return null
          }

          return {
            title: stripNewLineAndExcessWhitespace(title),
            description: stripNewLineAndExcessWhitespace(description),
            author: stripNewLineAndExcessWhitespace(author),
            URL: stripNewLineAndExcessWhitespace(URL)
          }
        } catch (error) {
          console.log(error)

          return null
        }
      })
      .get()

    return {
      [issueNumber]: articles
    }
  }
}

module.exports = {
  init
}
