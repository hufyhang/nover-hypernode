#!/usr/bin/env node
var http = require('http');
var https = require('https');
var fs = require('fs');
var pa = require('path');
var request = require('request');

var CWD = process.env.HYPERNODE_CWD || __dirname;
var protocol = http;

var argv = process.argv;

var downloadFile = function (url, filename) {
  'use strict';
  var elements = url.split('/');
  while (!filename || filename.length === 0) {
    filename = elements.pop();
  }

  filename = pa.resolve(CWD, filename);

  request(url).pipe(fs.createWriteStream(filename));
};

if (argv.length < 3) {
  console.log('Usage: wget [URL] [filename]');
  process.exit(0);
}

var url = argv[2];
var filename = argv[3];

if (!/^http[s]?:\/\//.test(url)) {
  url = 'http://' + url;
}

if (/^https:\/\//.test(url)) {
  protocol = https;
}

downloadFile(url, filename);
