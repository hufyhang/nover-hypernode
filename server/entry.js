var basis = require('./lib/basis');
var fs = require('fs');
var pa = require('path');
var spawn = require('child_process').spawn;
var ss = require('socket.io-stream');

var VERSION = '0.1.1';

var NODE = 'node';
var PATH = __dirname;
var LOCAL = PATH + '/local/';
var USER_DIR = PATH + '/user/';
var PASS_FILE = PATH + '/etc/passwd.json';

var PASS = JSON.parse(fs.readFileSync(PASS_FILE, 'utf-8'));

var clearSreen = '\033[2J\033[1;1H';

var io;

var queueJob = function (cmd, data, socket) {
  'use strict';

  process.nextTick(function () {
    var child = spawn(NODE, cmd, {cwd: data.cwd});
    basis.log('Worker: '.blue + child.pid +
              '\nCommand:\n'.blue + data.command.trim());

    child.stdout.on('data', function (data) {
      socket.emit('stdout', data.toString());
      // socket.emit('ok');
    });

    child.stderr.on('data', function (data) {
      socket.emit('stderr', data.toString());
      // socket.emit('ok');
    });

    child.on('exit', function () {
      socket.emit('ok');
    });

    // socket.emit('ok');
  });
};

var exec = function (data, socket) {
  'use strict';

  var cmd = data.command.trim().split(' ');
  var runFlag = false;

  // if run package, remove first cmd and add USER_DIR prefix
  if (cmd[0] === 'run') {
    cmd = cmd.slice(1);
    cmd[0] = USER_DIR + cmd[0];
    runFlag = true;
  }

  // add prefix if no directories specified
  var needPrefix = !~cmd[0].indexOf('/') || !runFlag;
  if (needPrefix) {
    cmd[0] = LOCAL + cmd[0];
  }

  // queue a job for nextTick
  queueJob(cmd, data, socket);
};

exports.__socket = function (server, data) {
  'use strict';
  io = require('socket.io').listen(server);

  io.sockets.on('connection', function (socket) {
    // ask client to drop connection due to wrong password
    socket.on('login', function (data) {
      if (data.password !== PASS[data.user]) {
        socket.emit('terminate');
      } else {
        socket.emit('stdout', clearSreen);
        socket.emit('stdout', 'Web.Node Cloud Platform (version: ' + VERSION
                    + ')\nWelcome, ' + data.user + '!\nServer time: ' +
                      (new Date()).toString() + '\n');
        socket.emit('ok.login', USER_DIR);
      }
    });

    socket.on('cmd', function (data) {
      exec(data, socket);
    });

    socket.on('empty', function () {
      socket.emit('ok');
    });

    // add socket.io-steam for file uploading
    ss(socket).on('push', function (stream, data) {
      var filename = USER_DIR + pa.basename(data.name);
      stream.pipe(fs.createWriteStream(filename));
      socket.emit('ok');
    });

  });
};
