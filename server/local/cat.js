#!/usr/bin/env node

var fs = require('fs');
var pa = require('path');

var path = pa.resolve(__dirname, '../user/');

var argv = process.argv.length;

for(var i=2; i < argv; i++) {
  var from = pa.resolve(path, process.argv[i]);
  if (fs.existsSync(from)) {
    fs.createReadStream(from).pipe( process.stdout );
  }
  else {
    console.error("cat: "+from+": No such file or directory");
  }
}
