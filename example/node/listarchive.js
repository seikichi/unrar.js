var fs = require('fs');
var Unrar = require('../../unrar.min');

if (process.argv.length <= 2) {
  console.log('usage: node listarchive.js archive.rar [password]');
  process.exit();
}

var archiveName = process.argv[2];
var password = process.argv[3] || '';

fs.readFile(archiveName, function (err, data) {
  if (err) { throw err; }
  var unrar = new Unrar(data, password);
  var entries = unrar.getEntries();

  console.log(['name', 'size', 'packed', 'time', 'directory'].join(', '));
  console.log('========================================================');
  for (var i = 0, len = entries.length; i < len; ++i) {
    var entry = entries[i];
    console.log([
      entry.name,
      entry.unpackSize,
      entry.packSize,
      entry.fileTime,
      entry.isDirectory()
    ].join(', '));
  }
  unrar.close();
});
