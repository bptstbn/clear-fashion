const fs = require('fs');
const {MongoClient} = require('mongodb');
const MONGODB_URI = 'mongodb+srv://baptiste:1nIJqDVtew9teIHx@clear-fashion.j4yct.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';
const MONGODB_DB_NAME = 'clearfashion';


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

    // const collection = db.collection('products');
    // const result = collection.insertMany(products);
    
    // console.log(result);

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

main()
