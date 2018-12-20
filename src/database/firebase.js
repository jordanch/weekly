const { firestore } = require("./firebase-setup")

async function writeIssue({ collection, id, document }) {
  try {
    await firestore
      .collection(collection)
      .doc(id)
      .set(document)
  } catch (error) {
    // todo: incorporate error loggin in prod.
    console.error(error)
  }
}

// function writeBulk

module.exports = {
  writeIssue
}
