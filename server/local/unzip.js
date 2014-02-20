#!/usr/bin/env node
var unzip = require('unzip');
var fs = require('fs');
var pa = require('path');
var argv = process.argv;

if (argv.length !== 3) {
  console.error('Usage: unzip [zip_file]');
  process.exit(0);
}

var filename = pa.resolve(__dirname, '../user/', argv[2]);
var path = pa.dirname(filename);

fs.createReadStream(filename)
  .pipe(unzip.Extract({path: path}));
