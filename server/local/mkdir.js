#!/usr/bin/env node

var fs = require('fs');
var pa = require('path');

var path = process.env.HYPERNODE_CWD;

var argv = process.argv;
var leng = argv.length;

for (var index = 2; index !== leng; ++index) {
  fs.mkdirSync(pa.resolve(path, argv[index]));
}
