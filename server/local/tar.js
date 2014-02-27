#!/usr/bin/env node
var targz = require('tar.gz');
var pa = require('path');
var CWD = process.env.HYPERNODE_CWD || __dirname;

var argv = process.argv;

if (argv.length < 3) {
  console.log('Usage: tar [c/x] [tarball] [filename]');
  process.exit(0);
}

var compress = function (tarball, tgt) {
  'use strict';
  var tar = new targz().compress(tgt, tarball, function (err) {
    if (err) {
      console.error(err);
    }

    console.log('Tarball compressed');
  });
};

var extract = function (tarball, tgt) {
  'use strict';
  var tar = new targz().extract(tarball, tgt, function (err) {
    if (err) {
      console.error(err);
    }

    console.log('Tarball extracted');
  });
};

var mode = argv[2];
if (!/^[cx]$/.test(mode)) {
  console.log('Invalid option.');
  console.log('Please use either "c" to create tarball or "x" to extract one.');
  process.exit(0);
}

var tarball = pa.resolve(CWD, argv[3]);

var tgt = argv[4];


if (mode === 'c') {
  if (!tgt) {
    console.log('Target path is needed');
    process.exit(0);
  }

  compress(tarball, tgt);
}
else if (mode === 'x') {
  if (!tgt) {
    tgt = pa.resolve(CWD, pa.dirname(tarball), pa.basename(tarball, '.tar.gz'));
  } else {
    tgt = pa.resolve(CWD, tgt);
  }

  extract(tarball, tgt);
}

