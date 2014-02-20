#!/usr/bin/env node

var fs = require('fs');
var pa = require('path');

var path = pa.resolve(__dirname, '../user/');

var argv = process.argv;
var leng = argv.length;

for (var index = 2; index !== leng; ++index) {
  fs.mkdirSync(pa.resolve(path, argv[index]));
}
