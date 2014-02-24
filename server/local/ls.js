#!/usr/bin/env node

var fs   = require('fs');
var argv = require('optimist').argv;
var pa = require('path');

var CWD = process.env.HYPERNODE_CWD;

var path = pa.resolve(CWD, argv._[0] || '');

var real = fs.existsSync(path);

var buffer = '';
if (real) {
  var stat = fs.statSync(path);
  if (stat.isDirectory()){
    var files = fs.readdirSync(path);
    var fileStat;
    files.forEach(function (file) {
      'use strict';
      var filename = pa.resolve(path, file);
      fileStat = fs.statSync(filename);

      if (fileStat.isDirectory()) {
        buffer += '[' + file + '] ';
      } else {
        buffer += file + ' ';
      }
    });
    console.log(buffer);
  } else {
    console.log(path);
  }
  process.exit(0);
} else {
  console.error("Not Found: " + path);
  process.exit(1);
}
