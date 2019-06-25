// todo: older js weekly issues have a different html structure. how to scrape based on different html structure?
const { monthStringToZeroBasedNumber } = require("../../helpers/dates")
const { hashCode } = require("../../helpers/utils")
const { stripNewLineAndExcessWhitespace } = require("../../helpers/text")
const { JsWeeklyScraperError } = require("./js-weekly.error")
const { debug } = require("./js-weekly.debug")
const fetch = require("node-fetch")

function init(config, cheerio) {
  const identifier = "js_weekly"

  return {
    identifier,
    archiveList,
    articlesFromIssue,
    articleIdentifier
  }

  /**
   * @public
   * @param {string} title article title used to generate hashcode
   * @returns {number}
   */
  function articleIdentifier(title) {
    return `${identifier}_article_${hashCode(title)}`
  }

  /**
   * @description Return the list of archived issues, including the issue
   * number, hyperlink and issue date.
   *
   * @param {string} html
   * @return {{ issueNumber: number, href: string, date: number }[]}
   */
  async function archiveList() {
    const html = await config.getArchiveHtml()

    const $ = cheerio.load(html)

    const templates = [originTemplate($)]

    return $(".issue")
      .map((i, issueElement) => {
        // try get the data needed from a template definition module,
        // if any data is missing, go to next template,
        // if end of templates is reached with no data, create error.
        const data = {
          issueNumber: null,
          href: null,
          date: null
        }

        let template

        for (const t of templates) {
          template = t.template

          try {
            return Object.assign(data, t.data(issueElement))
          } catch (error) {
            debug(error)
          }
        }

        if (!template.isValid({ ...issue })) {
          throw new JsWeeklyScraperError(
            "Archive scrape failed after trying all templates"
          )
        }

        return issue
      })
      .get()

    // this template's functionality was implemented for the latest template when
    // the project started, hence origin
    function originTemplate($) {
      const identifier = "origin"

      const template = {
        id: identifier,
        isValid: function isOriginTemplateValid({ issue, href, date }) {
          const errors = []

          if (isIssueNumValid(issue)) {
            errors.push(`issue: ${issue}`)
          }

          if (isHrefValid(href)) {
            errors.push(`href: ${href}`)
          }

          if (isDateValid(date)) {
            errors.push(`date: ${date}`)
          }

          return {
            valid: errors.length > 0,
            errors: errors.join(", ")
          }

          function isIssueNumValid(number) {
            return Number.isFinite(number)
          }

          function isHrefValid(href) {
            return Boolean(href)
          }

          function isDateValid(number) {
            return Number.isFinite(number)
          }
        }
      }

      return {
        data: getTemplateData,
        template
      }

      function getTemplateData(issue) {
        const preValid = {
          issueNumber: issueNumber(issue),
          href: href(issue),
          date: date(issue)
        }

        const result = template.isValid({ ...preValid })

        if (!result.valid) {
          throw new JsWeeklyScraperError(
            `Archive template data invalid, specifically: ${result.errors}`
          )
        }

        return {
          ...preValid
        }
      }

      /**
       * @param {*} issue
       * @returns {number}
       */
      function issueNumber(issue) {
        return parseInt(
          $("a", issue)
            .attr("href")
            .split("/")[1],
          10
        )
      }

      /**
       * @param {*} issue
       * @returns
       */
      function date(issue) {
        // format: July 18, 2014
        const dateSegments = $(issue)
          .text()
          .split(" — ")[1]
          .split(" ")
          .map((segment) => segment.trim().replace(",", ""))
          .filter((segment) => Boolean(segment))

        return new Date(
          dateSegments[2], // year
          monthStringToZeroBasedNumber(dateSegments[0]), // month
          dateSegments[1] // day
        ).getTime()
      }

      /**
       * @param {*} $
       * @param {*} issue
       * @returns
       */
      function href(issue) {
        return `${config.FQDN}/${$("a", issue).attr("href")}`
      }
    }
  }

  /** @typedef {{ title: string, description: string, author: string, URL: string }} IArticle */
  /**
   * @description Return the data for an issue, including the issue
   * number, title, description, author and URL.
   *
   * @param {string} html
   * @param {number} issueNumber
   * @returns {{[property: number]: IArticle[] | null[] | []}}
   */
  async function articlesFromIssue({ href, issueNumber } = {}) {
    const issueNum = parseInt(issueNumber, 10)

    if (isNaN(issueNum)) {
      throw new JsWeeklyScraperError(
        `Issue number incorrect type, value before parse: ${issueNumber}, ${typeof issueNumber}`
      )
    }

    const html = await config.getIssueHtml(href)

    if (typeof html !== "string") {
      throw new JsWeeklyScraperError("Html must be type string")
    }

    const $ = cheerio.load(html)

    debug(`Loaded JsWeekly HTML issue ${issueNum} page`)

    const articles = $(".el-item.item", "#content")

    debug(`Processing ${articles.length} articles`)

    const processedArticles = articles
      .map((i, table) => {
        const $details = $(".desc", table)

        const $mainLinkContainer = $(".mainlink", table)

        const $titleAndLink = $("a", $mainLinkContainer)

        const $author = $(".name", table)

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
          const missing = `${!title ? "title" : ""} ${
            !description ? "description" : ""
          } ${!author ? "author" : ""} ${!URL ? "URL" : ""}`

          debug("Missing data from scraping article")

          return {
            errors: [
              new JsWeeklyScraperError(
                `Missing data from scraping article: ${missing}`
              )
            ]
          }
        }

        const cleanTitle = stripNewLineAndExcessWhitespace(title)

        debug(`Scraped ${cleanTitle}`)

        return {
          title: cleanTitle,
          description: stripNewLineAndExcessWhitespace(description),
          author: stripNewLineAndExcessWhitespace(author),
          URL: stripNewLineAndExcessWhitespace(URL),
          id: articleIdentifier(cleanTitle),
          errors: []
        }
      })
      .get()

    return processedArticles
  }
}

module.exports = {
  init
}
