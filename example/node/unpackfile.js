var fs = require('fs');
var Unrar = require('../../unrar.min');

if (process.argv.length <= 4) {
  console.log('usage: node unpackfile.js archive.rar filename outputFileName [password]');
  process.exit();
}

var archiveName = process.argv[2];
var fileName = process.argv[3];
var outputFileName = process.argv[4];
var password = process.argv[5] || '';

fs.readFile(archiveName, function (err, data) {
  if (err) { throw err; }
  var unrar = new Unrar(data, password);
  var fileData = unrar.decompress(fileName);
  if (!fileData) {
    console.log('decompress failed...');
    process.exit();
  }
  fs.writeFile(outputFileName, new Buffer(fileData), function (err)  {
    if (err) { throw err; }
    unrar.close();
  });
});
