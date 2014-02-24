#!/usr/bin/env node

var child = require('child_process');
var pa = require('path');
var CWD = process.env.HYPERNODE_CWD;
var argv = process.argv;
var DEFAULT_DURATION = 5 * 1000; // default process duration is 5 sec.

if (argv.length < 3) {
  console.error('Usage: now [duration] [filename] [args]');
  process.exit(0);
}

var dur;
var cmd = argv.slice(2);

if (/^[0-9]+$/.test(cmd[0])) {
  dur = parseInt(cmd.shift(), 10) * 1000;
} else {
  dur = DEFAULT_DURATION;
}

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

setTimeout(function () {
  'use strict';
  process.exit(0);
}, dur);
