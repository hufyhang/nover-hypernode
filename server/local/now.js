#!/usr/bin/env node

var child = require('child_process');
var pa = require('path');
var CWD = process.env.HYPERNODE_CWD;
var argv = process.argv;

if (argv.length < 3) {
  console.error('Usage: now [filename] [args]');
  process.exit(0);
}
var cmd = argv.slice(2);
cmd[0] = pa.resolve(CWD, cmd[0]);

var task = child.spawn('node', cmd);
task.stdout.on('data', function (data) {
  'use strict';
  console.log(data.toString().trim());
});

task.stderr.on('data', function (data) {
  'use strict';
  console.error(data.toString().trim());
});

task.on('close', function () {
  'use strict';
  process.exit(0);
});

process.on('exit', function () {
  'use strict';
  task.kill();
});
