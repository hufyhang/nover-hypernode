#!/usr/bin/env node

var fs   = require('fs');
var argv = require('optimist').argv;
var pa = require('path');

var path = pa.resolve(__dirname, '../user/', argv._[0] || '');
var real = fs.existsSync(path);

if (real) {
  var stat = fs.statSync(path);
  if (stat.isDirectory()){
    console.log(fs.readdirSync(path));
  } else {
    console.log(path);
  }
  process.exit(0);
} else {
  console.error("Not Found");
  process.exit(1);
}
