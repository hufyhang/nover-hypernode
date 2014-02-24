#!/usr/bin/env node
var cluster = require('cluster');
var cpus = require('os').cpus().length;

var sayHi = function () {
  'use strict';
  console.log('Hi');
};

if (cluster.isMaster) {
  for (var index = 0; index !== cpus; ++index) {
    cluster.fork();
  }

  cluster.on('exit', function (worker, code, signal) {
    'use strict';
    cluster.fork();
  });
} else {
  sayHi();
}
