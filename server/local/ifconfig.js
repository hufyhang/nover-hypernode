#!/usr/bin/env node
var os = require('os');
var ifaces = os.networkInterfaces();
for (var dev in ifaces) {
  if (ifaces.hasOwnProperty(dev)) {
    var alias = 0;
    ifaces[dev].forEach(function (details) {
      'use strict';
      if (details.family === 'IPv4') {
        console.log(dev+(alias?':'+alias:''),details.address);
        ++alias;
      }
    });
  }
}
