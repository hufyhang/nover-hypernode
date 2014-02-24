#!/usr/bin/env node

var fs   = require('fs');
var pa = require('path');

var CWD = process.env.HYPERNODE_CWD;

var hasFlag = process.argv[2] === '-l';
var targetDir;

if (hasFlag) {
  targetDir = process.argv[3] || '';
} else {
  targetDir = process.argv[2] || '';
}

var path = pa.resolve(CWD, targetDir);

var real = fs.existsSync(path);

var addItem = function (filename) {
  'use strict';
  var file = pa.basename(filename);
  var fileStat = fs.statSync(filename);

  if (fileStat.isDirectory()) {
    return '[' + file + '] ';
  } else {
    return file + ' ';
  }
};

var addItemDetail = function (filename) {
  'use strict';
  var file = pa.basename(filename);
  var fileStat = fs.statSync(filename);
  var buffer = '';

  buffer += (fileStat.mode & parseInt('0777', 8)).toString(8) + '\t' +
    fileStat.size + '\t' + fileStat.mtime + '\t -- ';

  if (fileStat.isDirectory()) {
    buffer += '[' + file + ']\n';
  } else {
    buffer += file + '\n';
  }
  return buffer;
};

var buffer = '';
if (real) {
  var stat = fs.statSync(path);
  if (stat.isDirectory()){
    var files = fs.readdirSync(path);
    files.forEach(function (file) {
      'use strict';
      var filename = pa.resolve(path, file);
      if (hasFlag) {
        buffer += addItemDetail(filename);
      } else {
        buffer += addItem(filename);
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
