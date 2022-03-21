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
    console.log(result);
}

module.exports.insert = insert;

async function display()
{
    const client = await MongoClient.connect(MONGODB_URI, {'useNewUrlParser': true});
    const db =  client.db(MONGODB_DB_NAME);
    const collection = db.collection('products');

    // find all products
    const products = await collection.find().toArray();
    
    // find all products related to a given brand
    const brand = 'adresse';
    // const products = await collection.find({brand}).toArray();
    
    // find all products less than a price
    var min = 0;
    var max = 25;
    // const products = await collection.find({ 'price' : { $gt: min, $lt: max } }).toArray();
    
    // find all products sorted by price
    var sort_price = { price: 1 };
    // const products = await collection.find().sort(sort_price).toArray();

    // display products
    console.log(products);

    process.exit(1);
}


display();