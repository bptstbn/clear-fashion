require('dotenv').config()
const {MongoClient} = require('mongodb');
const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB_NAME = 'clearfashion';

async function insert(products)
{
    console.log('🍃 Inserting products into database ...')
    const client = await MongoClient.connect(MONGODB_URI, {'useNewUrlParser': true});
    const db = client.db(MONGODB_DB_NAME);
    const collection = db.collection('products');
    var result = await collection.insertMany(products);
}

module.exports.insert = insert;