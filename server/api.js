const cors = require('cors');
const express = require('express');
const helmet = require('helmet');

const {MongoClient} = require('mongodb');
// const ObjectId = require("mongodb").ObjectID;

const { calculateLimitAndOffset, paginate } = require('paginate-info');

require('dotenv').config()
const MONGODB_URI = process.env.MONGODB_URI;
const MONGODB_DB_NAME = 'clearfashion';

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
    case 'dateasc':
      sort = {date: 1};
      break;
    case 'datedesc':
      sort = {date: -1};
      break;
  }

  var brand;
  if ('brand' in request.query)
  {
    brand = request.query.brand;
    filters['brand'] = brand;
  }
  
  var minprice;
  if ('minprice' in request.query)
  {
    minprice = parseInt(request.query.minprice);
  }

  var maxprice;
  if ('maxprice' in request.query)
  {
    maxprice = parseInt(request.query.maxprice);
  }

  if (minprice != null || maxprice != null)
  {
    filters['price'] = {};
    if (minprice != null)
    {
      filters['price']['$gt'] = minprice;
    }
    if (maxprice != null)
    {
      filters['price']['$lt'] = maxprice;
    }
  }
  
  console.log(filters);

  const { offset } = calculateLimitAndOffset(page, limit);
  try
  {
    var result = await collection.find(filters).sort(sort).skip(offset).limit(limit).toArray();
    console.log(result);
    var count = await collection.find(filters).count();
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

app.get("/brands/", async (request, response) => {
  console.log('In brands route ...');
  var collection = await get_collection();
  try
  {
    const brands = await collection.distinct("brand");
    console.log(brands);
    var result = new Array();
    brands.forEach(brand =>
    {
      result.push(brand);
    });
    console.log(result);
    response.send(result);
  }
  catch (error) 
  {
    console.log('In error for brands');
    response.status(500).send(error);
  }
});

console.log(`📡 Running on port ${PORT}`);
