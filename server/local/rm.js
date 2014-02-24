#!/usr/bin/env node

var fs = require('fs');
var pa = require('path');

var deleteFolderRecursive = function (path) {
  'use strict';
  if( fs.existsSync(path) ) {
    fs.readdirSync(path).forEach(function(file,index){
      var curPath = path + "/" + file;
      if(fs.statSync(curPath).isDirectory()) { // recurse
        deleteFolderRecursive(curPath);
      } else { // delete file
        fs.unlinkSync(curPath);
      }
    });
    fs.rmdirSync(path);
  }
};

var argv = process.argv;

if (argv.length < 3) {
  console.error('Usage: rm [-r] [filename]');
  process.exit(0);
}

var path = process.env.HYPERNODE_CWD;
var dest;

if (argv[2] === '-r') {
  dest = pa.resolve(path, process.argv[3]);
  deleteFolderRecursive(dest);
} else {
  dest = pa.resolve(path, process.argv[2]);
  fs.unlinkSync(dest);
}

