const fs = require('fs');
require('dotenv').config()
const {MongoClient} = require('mongodb');
const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME;


async function main() 
{
    const client = await MongoClient.connect(MONGODB_URI, {'useNewUrlParser': true});
    const db =  client.db(MONGODB_DB_NAME);
    databasesList = await client.db().admin().listDatabases();

    // Display available databases
    console.log("Databases:");
    databasesList.databases.forEach(db => console.log(` - ${db.name}`));

    console.log('Successfully connected to database');

    const products = loadjson();
    console.log(products);


    const collection = db.collection('products');
    console.log(collection);
    const result = collection.insertMany(products);
    console.log(result);

    const collectionsList = await client.db().listCollections().toArray();
    const collectionNames = collectionsList.map(c => c.name);
    console.log(collectionNames)

    process.exit(1);
}


function loadjson()
{
    var products = [];

    var jsonstring = fs.readFileSync('./data/adresse.json', 'utf8', (err, jsonstring) => 
    {
        
        if (err) 
        {
            console.log("File read failed:", err)
        }
    });

    var strings = jsonstring.split('\n');
    strings = strings.filter(e => e !== '');

    products = strings.map(e => JSON.parse(e));
    // OR strings.forEach(e => products.push(JSON.parse(e)));

    return products;
}

async function display()
{
    const client = await MongoClient.connect(MONGODB_URI, {'useNewUrlParser': true});
    const db =  client.db(MONGODB_DB_NAME);
    const collection = db.collection('products');

    // find all products
    // const products = await collection.find().toArray();
    
    

    // find all products related to a given brand
    const brand = 'adresse';
    // const products = await collection.find({brand}).toArray();
    
    // find all products less than a price
    var min = 0;
    var max = 25;
    const products = await collection.find({ 'price' : { $gt: min, $lt: max } }).toArray();
    
    // find all products sorted by price
    var sort_price = { price: 1 };
    // const products = await collection.find().sort(sort_price).toArray();

    // display products
    console.log(products);

    process.exit(1);
}


display();

