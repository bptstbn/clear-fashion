const fs = require('fs');

module.exports = function save(products, filename)
{
  var path = 'data/' + filename + '.json';
  if (fs.existsSync(path))
  {
    fs.unlinkSync(path);
  }
  products.forEach(product => 
  {
    fs.appendFileSync(path, JSON.stringify(product) + '\n', err => 
    {
      if (err) 
      {
          console.log("Error : JSON file was not saved correctly.")
          throw err;
      }
      else
      {
        console.log("JSON data was saved successfully.");
      }
    });
  });
}