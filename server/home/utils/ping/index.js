#!/usr/bin/env node
var pin = require('pin');

var delay = 5000;

var _hosts = {};
var urls = [];

// Check if the given host has protocol added in its beginning.
// If not, add HTTP://. Or if it is IP address, ignore.
// Notice: only support HTTP and HTTPS
var validateHost = function (host) {
  'use strict';
  var isHostname = /^.*\w+.*$/.test(host);
  if (isHostname) {
    var withoutProtocol = /^http[s]?:\/\/.+$/.test(host)
      ? false
      : true;

    if (withoutProtocol) {
      return 'http://' + host;
    }
  }

  return host;
};

var upCallback = function (host, res) {
  'use strict';

  upHostEntry(host, res);

  console.log(_hosts[host]);
};

var downCallback = function (err, msg, host) {
  'use strict';

  downHostEntry(host);

  console.log(_hosts[host]);
};

// Add a host entry from json
// {
//   host: URL,
//   alias: ALIAS (optional)
// }
var addHostEntry = function (host) {
  'use strict';
  host = validateHost(host);

  _hosts[host] = {};
  _hosts[host].host = host;
  _hosts[host].pings = 0;
  _hosts[host].ups = 0;
  _hosts[host].downs = 0;
  _hosts[host].lastDown = 'N/A';
  _hosts[host].upRes = 0;
  _hosts[host].upRate = 0;
  _hosts[host].avgUpRes = 0;
  _hosts[host].lastRes = 0;
  _hosts[host].current = 'N/A';

  return host;
};

var upHostEntry = function (host, dur) {
  'use strict';
  _hosts[host].pings += 1;
  _hosts[host].ups += 1;
  _hosts[host].upRes += dur;
  _hosts[host].lastRes = dur;
  _hosts[host].current = 'up';

  var avg = Math.floor(_hosts[host].upRes / _hosts[host].ups);
  _hosts[host].avgUpRes = avg;

  var rate = (_hosts[host].ups/_hosts[host].pings).toFixed(2);
  _hosts[host].upRate = rate * 100 + '%';
};

var downHostEntry = function (host) {
  'use strict';
  var date = new Date();
  _hosts[host].pings += 1;
  _hosts[host].downs += 1;
  _hosts[host].lastDown = date.toString();
  _hosts[host].current = 'down';
  _hosts[host].lastRes = 'N/A';

  var rate = (_hosts[host].ups/_hosts[host].pings).toFixed(2);
  _hosts[host].upRate = rate * 100 + '%';
};

var pingHost = function (hostJson) {
  'use strict';

  var host = addHostEntry(hostJson);

  pin(host).interval(delay)
  .up(function (res, info) {
    upCallback(host, info.duration);
  })
  .down(function (err, res) {
    downCallback(err, res, host);
  });
};

// To start ping several hosts
var startAll = function (hosts) {
  'use strict';

  hosts.forEach(function (host) {
    pingHost(host);
  });
};

if (process.argv.length < 3) {
  console.log('Usage: ping [URL] [delay in seconds]');
  process.exit(0);
}

for (var index = 2, total = process.argv.length; index !== total; ++index) {
  urls.push(process.argv[index]);
}

var lastArgv = process.argv[process.argv.length - 1];
var isNumber = /^[0-9]+$/.test(lastArgv);
if (isNumber) {
  urls.pop();
  lastArgv = parseInt(lastArgv, 10);
  delay = lastArgv * 1000;
}

startAll(urls);

