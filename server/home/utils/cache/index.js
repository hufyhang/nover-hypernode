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
  json.latest = (new Date()).toString();
  console.log(JSON.stringify(json));
};

var saveCache = function (data) {
  'use strict';
  var file = ++info.times + '.html';
  var filename = pa.resolve(sys.dist, file);
  fs.writeFile(filename, data, showInfo);
};

var cacheUrl = function (url) {
  'use strict';
  var content = '';
  protocol.get(url, function (res) {
    res.on('data', function (chunk) {
      content += chunk + '\n';
    });

    res.on('end', function () {
      saveCache(content);
    });
  }).end();
};

if (argv.length < 3) {
  console.log('Usage: cache [URL] [dist] [delay]');
  process.exit(0);
}

var url = argv[2];
var hasProtocol = /^http[s]?:\/\//.test(url);
var isHttps = /^https:\/\/.+$/.test(url);
if (!hasProtocol) {
  // add http by default
  url = 'http://' + url;
}
else if (isHttps) {
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

// check and create dist folder
if (!fs.existsSync(sys.dist)) {
  fs.mkdirSync(sys.dist);
}

cacheUrl(info.url);

setInterval(function () {
  'use strict';
  cacheUrl(info.url);
}, sys.delay);

