const admin = require("firebase-admin")

const serviceAccount = require("../../web-article-aggregator-firebase-adminsdk-4m63t-054d3ebb76.json")

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://web-article-aggregator.firebaseio.com"
})

const firestore = admin.firestore()
const settings = { timestampsInSnapshots: true }

firestore.settings(settings)

module.exports = {
  firestore
}
