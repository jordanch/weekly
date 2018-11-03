const stripNewLineAndExcessWhitespace = require("../text")
  .stripNewLineAndExcessWhitespace

describe("Helper > Text", () => {
  test("Can strip unwanted characters and whitespace", () => {
    const testText = "A world without \n anger is a good world      indeed!"

    expect(stripNewLineAndExcessWhitespace(testText)).toBe(
      "A world without anger is a good world indeed!"
    )
  })
})
