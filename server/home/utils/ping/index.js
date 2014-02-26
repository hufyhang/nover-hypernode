#!/usr/bin/env node
var http = require('http');
var delay = 5000;

if (process.argv.length < 3) {
  console.log('Usage: ping [-s] [URL] [delay in seconds]');
  process.exit(0);
}

var url = process.argv[2];
var silent = false;

if (url === '-s') {
  silent = true;
  url = process.argv[3];
}

var lastArgv = process.argv[process.argv.length - 1];
var isNumber = /^[0-9]+$/.test(lastArgv);
if (isNumber) {
  lastArgv = parseInt(lastArgv, 10);
  delay = lastArgv * 1000;
}

var options = {
  host: url
};

var callback = function(response) {
  'use strict';
  var str = '';

  if (!silent) {
    response.on('data', function (chunk) {
      str += "Code: " + response.statusCode + '\n';

      for (var item in response.headers) {
        if (response.headers.hasOwnProperty(item)) {
          str += item + ": " + response.headers[item] + '\n';
        }
      }

    });

    response.on('end', function () {
      console.log(str);
    });
  }

};

console.log('URL: ' + url);
console.log('Delay: ' + delay);

http.get(options, callback).end();

setInterval(function () {
  'use strict';
  http.get(options, callback).end();
}, delay);
