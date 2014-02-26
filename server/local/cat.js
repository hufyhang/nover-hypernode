#!/usr/bin/env node

var fs = require('fs');
var pa = require('path');

var CWD = process.env.HYPERNODE_CWD;
var path = CWD;

var argv = process.argv.length;

for(var i=2; i < argv; i++) {
  var from = pa.resolve(path, process.argv[i]);
  if (fs.existsSync(from)) {
    fs.createReadStream(from).pipe( process.stdout );
  }
  else {
    console.log("cat: "+from+": No such file or directory");
  }
}
