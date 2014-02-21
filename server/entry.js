var basis = require('./lib/basis');
var fs = require('fs');
var pa = require('path');
var spawn = require('child_process').spawn;
var ss = require('socket.io-stream');

var VERSION = '0.1.2';

var NODE = 'node';
var PATH = __dirname;
var LOCAL = PATH + '/local/';
var USER_DIR = PATH + '/user/';
var PASS_FILE = PATH + '/etc/passwd.json';

var PASS = JSON.parse(fs.readFileSync(PASS_FILE, 'utf-8'));

var clearSreen = '\033[2J\033[1;1H';

var io;

var tasks = {};

var cleanupTask = function (pid) {
  'use strict';
  delete tasks[pid].task;
  delete tasks[pid].pid;
  delete tasks[pid].child;
  delete tasks[pid].status;
  delete tasks[pid].stdout;
  delete tasks[pid].stderr;
  delete tasks[pid];
};

var queueJob = function (cmd, data, offset, socket) {
  'use strict';

  process.nextTick(function () {
    var child = spawn(NODE, cmd, {cwd: data.cwd});
    var tokens = cmd[0].split('/');
    var isRunCommand = tokens[tokens.length - offset - 2] === 'user';
    // basis.log('Worker: '.blue + child.pid +
    //           '\nCommand:\n'.blue + data.command.trim());

    tasks[child.pid] = {};
    tasks[child.pid].child = child;
    tasks[child.pid].pid = child.pid;
    tasks[child.pid].status = 'RUNNING';
    tasks[child.pid].stdout = '';
    tasks[child.pid].stderr = '';
    tasks[child.pid].task = data.command.trim();

    child.stdout.on('data', function (data) {
      if (isRunCommand) {
         tasks[child.pid].stdout += data.toString();
      } else {
        socket.emit('stdout', data.toString());
      }
    });

    child.stderr.on('data', function (data) {
      if (isRunCommand) {
        tasks[child.pid].status = 'ERROR';
        tasks[child.pid].stderr += data.toString();
      } else {
        socket.emit('stderr', data.toString());
      }
    });

    child.on('exit', function () {
      if (isRunCommand) {
        // var msg = 'Task ' + child.pid + ' is done.';
        // socket.emit('task.notify', msg.cyan);
        tasks[child.pid].status = 'EXIT';
      } else {
        cleanupTask(child.pid);
        socket.emit('ok');
      }
      // socket.emit('ok');
    });

    if (isRunCommand) {
      socket.emit('ok');
    }
  });
};

var exec = function (data, socket) {
  'use strict';

  var cmd = data.command.trim().split(' ');
  var runFlag = false;

  var offset = 0;
  if (cmd[1]) {
    offset = cmd[1].split('/').length - 1;
  }

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
  queueJob(cmd, data, offset, socket);
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
        socket.emit('stdout', 'HyperNode Cloud Environment (version: ' + VERSION
                    + ')\nWelcome, ' + data.user + '!\nServer time: ' +
                      (new Date()).toString() +
                      '\nType "help" for user manual.\n');
        socket.emit('ok.login', USER_DIR);
      }
    });

    socket.on('cmd', function (data) {
      exec(data, socket);
    });

    socket.on('empty', function () {
      socket.emit('ok');
    });

    socket.on('task.kill', function (pid) {
      if (tasks[pid]) {
        if (tasks[pid].status !== 'EXIT') {
          tasks[pid].child.kill();
        } else {
          cleanupTask(pid);
        }
      }
      socket.emit('ok');
    });

    socket.on('task.stdout', function (pid) {
      if (tasks[pid]) {
        socket.emit('stdout', tasks[pid].stdout);
        socket.emit('ok');
      }
    });

    socket.on('task.stderr', function (pid) {
      if (tasks[pid]) {
        var msg = tasks[pid].stderr;
        if (msg.length !== 0) {
          socket.emit('stdout', tasks[pid].stdout);
        }
        socket.emit('ok');
      }
    });

    socket.on('task.all', function () {
      var msg = 'All tasks:\n';
      var count = 1;
      for (var task in tasks) {
        if (tasks.hasOwnProperty(task)) {
          console.log(task);
          msg += count + '\t' + tasks[task].pid + '\t' +
            tasks[task].task + '\t[' + tasks[task].status + ']\n';
          ++count;
        }
      }
      socket.emit('stdout', msg);
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
