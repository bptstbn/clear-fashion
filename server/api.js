const cors = require('cors');
const express = require('express');
const helmet = require('helmet');

const {MongoClient} = require('mongodb');
const ObjectId = require("mongodb").ObjectID;

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
  const MONGODB_URI = 'mongodb+srv://baptiste:1nIJqDVtew9teIHx@clear-fashion.j4yct.mongodb.net/myFirstDatabase?retryWrites=true&w=majority';
  const MONGODB_DB_NAME = 'clearfashion';

  const client = await MongoClient.connect(MONGODB_URI, {'useNewUrlParser': true});
  const db =  client.db(MONGODB_DB_NAME);
  const collection = db.collection('products');

  return await collection;
}


app.get("/products/:id", async (request, response) => {
  var collection = await get_collection();
  console.log(collection);
  collection.findOne({ "_id": new ObjectId(request.params.id) }, (error, result) => {
      if(error) {
          return response.status(500).send(error);
      }
      response.send(result);
  });
});


app.get("/products/search:id", async (request, response) => {
  var collection = await get_collection();
  console.log(collection);
  collection.findOne({ "_id": new ObjectId(request.params.id) }, (error, result) => {
      if(error) {
          return response.status(500).send(error);
      }
      response.send(result);
  });
});

console.log(`📡 Running on port ${PORT}`);
