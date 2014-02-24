#!/usr/bin/env node

var pa = require('path');
var fs = require('fs');

var CWD = process.env.HYPERNODE_CWD;

var path = process.argv[2];

if (!path) {
  console.error('Usage: cd [directory]');
  process.exit(0);
}

path = pa.resolve(CWD, path);

if (fs.existsSync(path)) {
  var stat = fs.statSync(path);

  if (stat.isDirectory()) {
    console.log(path);
  } else {
    console.error('No such directory: ' + path);
  }
} else {
  console.error('No such directory: ' + path);
}

process.exit(0);
