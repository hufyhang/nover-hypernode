#!/usr/bin/env node
var http = require('http');
var fs = require('fs');
var pa = require('path');
var CWD = process.env.HYPERNODE_CWD || __dirname;

if (process.argv.length < 3) {
  console.log('Usage: curl [options] [URL]');
  process.exit(0);
}

var opts = [];
var count = 2;
var url = process.argv[count];
while (/^-[A-Za-z]+$/.test(url)) {
  opts.push(url);
  url = process.argv[++count];
}

// check if the issued url has protocol prefix
var hasProtocol = /^http[s]?:\/\//.test(url);
if (!hasProtocol) {
  url = 'http://' + url;
}

var fetchHeader = function (response) {
  'use strict';
  var str = '';
  str += "Code: " + response.statusCode + '\n';
  for (var item in response.headers) {
    if (response.headers.hasOwnProperty(item)) {
      str += item + ": " + response.headers[item] + '\n';
    }
  }
  return str;
};

var savePage = function (url, file, data) {
  'use strict';
  var filename;

  if (!data) {
    data = file;
    url = url.replace(/^http[s]?:\/\//, '');
    var address = url.match(/^.+\/(.+[\..+]?)$/);
    if (address && address.length === 2) {
      filename = address[1];
    } else {
      filename = 'index.html';
    }
  } else {
    filename = file;
  }

  filename = pa.resolve(CWD, filename);

  fs.writeFile(filename, data, function (err) {
    if (err) {
      console.error(err);
    }
  });
};

var callback = function(response) {
  'use strict';
  var str = '';
  var headerFetched = false;

  response.on('data', function (chunk) {
    if (~opts.indexOf('-i')) {
      // make sure headers will only be fetched once
      if (!headerFetched) {
        str += fetchHeader(response) + '\n';
        headerFetched = true;
      }
    }

    str += chunk + '\n';

    if (~opts.indexOf('-L')) {
      var newUrl = response.headers.location || url;
      opts[opts.indexOf('-L')] = null;
      str = '';
      http.get(newUrl, callback).end();
    }
  });

  response.on('end', function () {
    if (~opts.indexOf('-O')) {
      savePage(url, str);
    }
    else if (~opts.indexOf('-o')) {
      var filename = process.argv[++count];
      if (filename) {
        savePage(url, filename, str);
      } else {
        savePage(url, str);
      }
    } else {
      console.log(str);
    }
  });
};

http.get(url, callback).end();

