#!/usr/bin/env node
var glob = require('glob');
var fs = require('fs');
var pa = require('path');

var CWD = process.env.HYPERNODE_CWD || __dirname;

var argv = process.argv;

var pattern = new RegExp(argv[2]);
var roots = [];

var readSearchLines = function (filename, data) {
  'use strict';
  var lines = data.split('\n');
  lines.forEach(function (line) {
    if (pattern.test(line)) {
      console.log(pa.basename(filename) + ': ' + line);
    }
  });
};

var iterateFiles = function (files) {
  'use strict';
  if (!files) {
    console.log('Files not found: ' + files);
    return;
  }

  files.forEach(function (file) {
    var stat = fs.statSync(file);
    if (stat.isDirectory()) {
      return;
    }

    fs.readFile(file, 'utf-8', function (err, data) {
      if (err) {
        console.error(err);
      }

      readSearchLines(file, data);
    });
  });
};

if (argv.length < 4) {
  console.log('Usage: grep [pattern] [filename]');
  process.exit(0);
}

for (var index = 3, end = argv.length; index !== end; ++index) {
  roots.push(argv[index]);
}

roots.forEach(function (root) {
  'use strict';
  var rootPath = pa.resolve(CWD, root);

  glob(rootPath, function (err, files) {
    if (err) {
      console.error(err);
    }

    iterateFiles(files);
  });
});

