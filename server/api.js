const cors = require('cors');
const express = require('express');
const helmet = require('helmet');

const {MongoClient} = require('mongodb');
// const ObjectId = require("mongodb").ObjectID;

require('dotenv').config()
const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB_NAME = process.env.MONGODB_DB_NAME;

const PORT = 8092;

const app = express();

module.exports = app;

app.use(require('body-parser').json());
app.use(cors());
app.use(helmet());

app.options('*', cors());

app.get('/', (request, response) => {
  response.send({'ack': true});
});

app.listen(PORT);

async function get_collection()
{
  const client = await MongoClient.connect(MONGODB_URI, {'useNewUrlParser': true});
  const db =  client.db(MONGODB_DB_NAME);
  const collection = db.collection('products');

  return await collection;
}





app.get("/products/search/", async (request, response) => {
  var collection = await get_collection();
  console.log('In search route ...');
  let products;

  var limit = 12;
  if ("limit" in request.query) 
  {
    limit = parseInt(request.query.limit);
  }

  var brand = 'none';
  if ('brand' in request.query)
  {
    brand = request.query.brand;
  }
  console.log(brand);
  
  var price = Infinity;
  if ("price" in request.query)
  {
    price = parseInt(request.query.price);
  }
  
  try
  {
    if (brand != 'none' & price != Infinity)
    {
      products = await collection.find({ 'price' : { $lt: price }, 'brand' : brand }).limit(limit).toArray();
    }
    else if (brand != 'none')
    {
      products = await collection.find({ 'brand' : brand }).limit(limit).toArray();
    }
    else if (price != Infinity)
    {
      products = await collection.find({ 'price' : { $lt: price } }).limit(limit).toArray();
    }
    else
    {
      products = await collection.find().limit(limit).toArray();
    }
    console.log(products);
    response.send(products);
  }

  catch (error) 
  {
    response.status(500).send(error);
  }
});



app.get("/products/:id", async (request, response) => {
  console.log('In products id route ...');
  var collection = await get_collection();
  collection.findOne({ "_id": request.params.id }, (error, result) => {
      if(error) {
          return response.status(500).send(error);
      }
      response.send(result);
  });
});

console.log(`📡 Running on port ${PORT}`);
