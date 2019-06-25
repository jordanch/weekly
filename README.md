This application is three part:

1. front end client (React.js)

2. scaping on server (Node.js)

3. firebase firestore database

# overview

the program will

1. scrape a list of js weekly articles
2. scrape issues and extract information such as title and href
3. handle errors - network + code
4. handle notifying support of unexpected scraping results

# Tests

## HTML scraping

The scraper has two public functions that carry out:

- scraping archive, getting a list of issues
- scraping issue, getting a list of articles

HTML is used to test the functions. Find the html in `<scraper>/tests/html`.
