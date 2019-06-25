class JsWeeklyScraperError extends Error {
  constructor(message) {
    super(message)
    this.name = "JsWeeklyScraper"
  }
}

module.exports = {
  JsWeeklyScraperError
}
