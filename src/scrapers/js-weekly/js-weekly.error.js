const { ScraperError } = require("../scraper.error")

class JsWeeklyScraperError extends ScraperError {
  constructor(message) {
    super(message)
    this.scraper = "JsWeekly"
  }
}

module.exports = {
  JsWeeklyScraperError
}
