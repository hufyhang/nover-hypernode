#!/usr/bin/env node

var fs = require('fs');
var pa = require('path');

var path = process.env.HYPERNODE_CWD;

if (process.argv[2] !== "-s") {
  return process.exit(-1);
}

var from = pa.resolve(path, process.argv[3]);
var dest = pa.resolve(path, process.argv[4]);

fs.symlinkSync(from,dest);
