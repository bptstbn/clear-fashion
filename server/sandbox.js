/* eslint-disable no-console, no-process-exit */
const dedicatedbrand = require('./sources/dedicatedbrand');
const mongo = require('./mongo')

//async function sandbox (eshop = 'https://www.dedicatedbrand.com/en/men/news') {
async function sandbox (eshop = 'https://www.dedicatedbrand.com/en/men/all-men') {
  try {
    console.log(`🕵️‍♀️  browsing ${eshop} source`);

    const products = await dedicatedbrand.scrape(eshop);

    console.log(products);
    await mongo.insert(products);
    console.log('done');
    process.exit(0);
  } catch (e) {
    console.error(e);
    process.exit(1);
  }
}

const [,, eshop] = process.argv;

sandbox(eshop);
