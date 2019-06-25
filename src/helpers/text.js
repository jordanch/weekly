const { filter } = require("lodash")

function stripNewLineAndExcessWhitespace(text) {
  return text
    .trim()
    .split("")
    .filter((char) => {
      if (char === "\n") return false

      return true
    })
    .filter((char, index, collection) => {
      if (char === " " && collection[index - 1] === " ") return false

      return true
    })
    .join("")
}

module.exports = {
  stripNewLineAndExcessWhitespace
}
