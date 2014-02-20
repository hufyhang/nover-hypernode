#!/usr/bin/env node

var fs = require('fs');
var pa = require('path');

var path = pa.resolve(__dirname, '../user/');

var from = pa.resolve(path, process.argv[2]);
var dest = pa.resolve(path, process.argv[3]);

fs.renameSync(from, dest);
