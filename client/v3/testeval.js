var price = null;
var brand = 'adresse';

const features = [price, brand]

body = '';
if (price != null)
{
    body += "'price' : { $lt: price }";
}
if (brand != null)
{
    if (body != '')
    {
        body += ', ';
    }
    body += "'brand' : brand";
}

var filters = '';
if (!features.every(x => x === null))
{
    console.log('Not all features are null');
    filters = `{${body}}`
}

var mongo_query = `products = await collection.find(${filters}).offset(offset).limit(limit).toArray();`;

console.log(mongo_query);
eval(mongo_query);