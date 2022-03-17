const cors = require('cors');
const express = require('express');
const helmet = require('helmet');

const {MongoClient} = require('mongodb');
// const ObjectId = require("mongodb").ObjectID;

const { calculateLimitAndOffset, paginate } = require('paginate-info');

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

  var filters = {};

  var limit = 12;
  if ('limit' in request.query) 
  {
    limit = parseInt(request.query.limit);
  }

  var page = 1;
  if ('page' in request.query) 
  {
    console.log('Reading page');
    page = parseInt(request.query.page);
    console.log(page);
  }

  var sortby;
  if ('sortby' in request.query) 
  {
    sortby = request.query.sortby;
  }

  var sort = {name: 1} ;
  switch (sortby)
  {
    case 'priceasc':
      sort = {price: 1};
      break;
    case 'pricedesc':
      sort = {price: -1};
      break;
  }

  var brand;
  if ('brand' in request.query)
  {
    brand = request.query.brand;
    filters['brand'] = brand;
  }
  
  var price;
  if ('price' in request.query)
  {
    price = parseInt(request.query.price);
    filters['price'] = { $lt: price };
  }
  
  console.log(filters);

  const { offset } = calculateLimitAndOffset(page, limit);
  try
  {
    var mongo_query = `collection.find(filters).sort(sort).skip(offset).limit(limit).toArray();`;
    console.log(mongo_query);
    // var result = await eval(mongo_query);
    var result = await collection.find(filters).sort(sort).skip(offset).limit(limit).toArray();
    console.log(result);
    var count = await collection.count();
    var meta = paginate(page, count, result, limit);
    meta.pageSize = limit;
    var data = {result, meta};
    var success = true;
    response.send({success, data});
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
