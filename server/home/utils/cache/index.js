#!/usr/bin/env node

var http = require('http');
var https = require('https');
var pa = require('path');
var fs = require('fs');

var argv = process.argv;
var CWD = process.env.HYPERNODE_CWD || __dirname;

var protocol = http; // set protocol to HTTP by default.
var info = {
  times: 0
};

var sys = {
  delay: 30000,
  dist: pa.resolve(CWD, 'caches')
};

var showInfo = function () {
  'use strict';
  var json = info;
  json.latest = new Date();
  console.log(JSON.stringify(json));
};

var saveCache = function (url, data) {
  'use strict';
  var filename = pa.resolve(sys.dist, url, ++info.times);
  fs.write(filename, data, showInfo);
};

var cacheUrl = function (url, dist) {
  'use strict';
  var content = '';
  protocol.get(url, function (res) {
    res.on('data', function (chunk) {
      content += chunk + '\n';
    });

    res.on('end', function () {

    });
  }).end();
};

if (argv.length < 3) {
  console.log('Usage: cache [URL] [dist] [delay]');
  process.exit(0);
}

var url = argv[2];
var isHttps = /^https:\/\/.+$/.test(url);
if (isHttps) {
  protocol = https;
}
info.url = url;

var dist = argv[3];
var isNumber = /^[0-9]+$/.test(dist);
if (isNumber) {
  sys.delay = dist;
} else {
  sys.dist = pa.resolve(CWD, dist);

  var delay = argv[4] || undefined;
  if (delay && /^[0-9]+$/.test(delay)) {
    sys.delay = parseInt(delay, 10) * 1000;
  }
}

// check and create dist folders
if (!fs.existsSync(dist)) {
  fs.mkdirSync(dist);
}

var urlDist = pa.resolve(dist, info.url);
if (!fs.existsSync(urlDist)) {
  fs.mkdirSync(urlDist);
}

cacheUrl(info.url, sys.dist);

setInterval(function () {
  'use strict';
  cacheUrl(info.url, sys.dist);
}, sys.delay);

