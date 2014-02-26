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

var workOutModeCode = function (code) {
  'use strict';
  if (code === 7) {
    return 'rwx';
  }

  if (code === 6) {
    return 'rw-';
  }

  if (code === 5) {
    return 'r-x';
  }

  if (code === 4) {
    return 'r--';
  }

  if (code === 3) {
    return '-wx';
  }

  if (code === 2) {
    return '-w-';
  }

  if (code === 1) {
    return '--w';
  }

  if (code === 0) {
    return '---';
  }
};

var interpretMode = function (code){
  'use strict';
  var user = Math.floor(code / 100);
  var group = Math.floor((code - user * 100) / 10);
  var others = Math.floor(code - user * 100 - group * 10);

  return workOutModeCode(user) + workOutModeCode(group) + workOutModeCode(others);
};

var addItemDetail = function (filename) {
  'use strict';
  var file = pa.basename(filename);
  var fileStat = fs.statSync(filename);
  var buffer = '';

  var mode = (fileStat.mode & parseInt('0777', 8)).toString(8);
  mode = parseInt(mode, 10);

  buffer += interpretMode(mode) + '\t' +
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
  console.log("Not Found: " + path);
  process.exit(1);
}
