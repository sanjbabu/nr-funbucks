const fs = require('fs');

const testFolder = __dirname + '/../config/server/';

fs.readdir(testFolder, (err, files) => {
  files
    .filter(file => file !== 'localhost.json')
    .filter(file => file.endsWith('.json'))
    .map(file => file.slice(0, -5))
    .forEach(file => {
    console.log(file);
  });
});