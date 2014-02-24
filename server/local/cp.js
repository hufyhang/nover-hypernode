#!/usr/bin/env node

var fs = require('fs');
var pa = require('path');

var path = process.env.HYPERNODE_CWD;

var from = pa.resolve(path, process.argv[2]);
var dest = pa.resolve(path, process.argv[3]);

fs.createReadStream(from).pipe( fs.createWriteStream(dest) );
