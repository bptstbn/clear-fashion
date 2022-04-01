const mongo = require('./mongo')

const dedicatedbrand = require('./sources/dedicatedbrand');
const adresse = require('./sources/adresse');
const loom = require('./sources/loom');

const sites = [{eshop : 'https://www.dedicatedbrand.com/en/men/all-men', module : dedicatedbrand},
             {eshop : 'https://adresse.paris/630-toute-la-collection', module : adresse},
             {eshop : 'https://www.loom.fr/collections/tous-les-vetements', module : loom}];


console.log(sites);

async function sandbox(site) 
{
    var eshop = site.eshop;
    module = site.module;
    try 
    {
        console.log(`🕵️‍♀️  browsing ${eshop} source`);
        const products = await module.scrape(eshop);
        console.log(products);
        await mongo.insert(products);
        console.log('done');
    }
    catch (e) 
    {
        console.error(e);
        process.exit(1);
    }
}


sites.forEach(site => sandbox(site))