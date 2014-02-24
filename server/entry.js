var fs = require('fs');
var pa = require('path');
var spawn = require('child_process').spawn;
var ss = require('socket.io-stream');

var server;
var express;

var VERSION = '0.1.3';

var NODE = 'node';
var PATH = __dirname;
var LOCAL = PATH + '/local/';
var USER_DIR = PATH + '/home/';
var PASS_FILE = PATH + '/etc/passwd.json';
var CONFIG_FILE = PATH + '/etc/config.json';

var PASS = JSON.parse(fs.readFileSync(PASS_FILE, 'utf-8'));
var CONFIG = JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8'));

var clearSreen = '\033[2J\033[1;1H';

var io;

process.env.HYPERNODE_CWD = USER_DIR;

var tasks = {};

var cleanupTask = function (pid) {
  'use strict';
  delete tasks[pid].task;
  delete tasks[pid].pid;
  delete tasks[pid].child;
  delete tasks[pid].status;
  delete tasks[pid].scheduled;
  delete tasks[pid].stdout;
  delete tasks[pid].stderr;
  delete tasks[pid];
};

var tasksInformation = function () {
  'use strict';
  var total = 0;
  var exits = 0;
  var errors = 0;

  for (var task in tasks) {
    if (tasks.hasOwnProperty(task)) {
      ++total;
      var status = tasks[task].status;

      if (status === 'EXIT') {
        ++exits;
      }
      else if (status === 'ERROR') {
        ++errors;
      }
    }
  }

  return '+' + total + '/' + exits + '/' + errors + '+';
};

var queueJob = function (cmd, data, offset, socket) {
  'use strict';

  process.nextTick(function () {
    var appendBuffer = cmd[cmd.length - 1] !== '&';
    if (!appendBuffer) {
      cmd.pop();
    }

    var child = spawn(NODE, cmd, {cwd: data.cwd});
    var tokens = cmd[0].split('/');
    var isRunCommand = tokens[tokens.length - offset - 2] === 'home';

    tasks[child.pid] = {};
    tasks[child.pid].child = child;
    tasks[child.pid].pid = child.pid;
    tasks[child.pid].status = 'RUNNING';
    tasks[child.pid].scheduled = (new Date()).toString();
    tasks[child.pid].stdout = '';
    tasks[child.pid].stderr = '';
    tasks[child.pid].task = data.command.trim();

    child.stdout.on('data', function (data) {
      if (isRunCommand) {
        if (appendBuffer) {
          tasks[child.pid].stdout += data.toString();
        } else {
          tasks[child.pid].stdout = data.toString();
        }
      } else {
        socket.emit('stdout', data.toString());
        // check if cd command
        if (tokens[tokens.length - 1] === 'cd') {
          process.env.HYPERNODE_CWD = data.toString();
        }
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
        if (tasks[child.pid].status !== 'ERROR') {
          tasks[child.pid].status = 'EXIT';
        }
      } else {
        cleanupTask(child.pid);
        socket.emit('ok', tasksInformation());
      }
      // socket.emit('ok');
    });

    if (isRunCommand) {
      socket.emit('ok', tasksInformation());
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

exports.__require = function (data) {
  'use strict';
  server = data.httpd;
  express = data.http;

  // apis
  // show all tasks
  express.get(CONFIG.access + '/tasks', function (req, res) {
    var json = {};
    var count = 0;
    for (var task in tasks) {
      if (tasks.hasOwnProperty(task)) {
        json.code = 200;
        json[count] = {};
        json[count].pid = tasks[task].pid;
        json[count].task = tasks[task].task;
        json[count].status = tasks[task].status;
        json[count].scheduled = tasks[task].scheduled;
        json[count].runtime = {};
        json[count].runtime.href = CONFIG.access + '/task/' + json[count].pid;
        ++count;
      }
    }

    if (count === 0) {
      json.code = 302;
      json.information = 'No scheduled tasks.';
    }

    json = JSON.stringify(json);
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.write(json);
    res.end();
  });

  // get one task
  express.get(CONFIG.access + '/task/:pid', function (req, res) {
    var pid = req.params.pid;
    var msg;
    if (tasks[pid]) {
      var json = {};
      json.code = 200;
      json.pid = pid;
      json.task = tasks[pid].task;
      json.scheduled = tasks[pid].scheduled;
      json.status = tasks[pid].status;
      var stdout = tasks[pid].stdout;
      stdout.replace(/\"/g, '\\"');
      stdout.replace(/\n/g, '\\n');
      json.stdout = stdout;

      var stderr = tasks[pid].stderr;
      stderr.replace(/\"/g, '\\"');
      stderr.replace(/\n/g, '\\n');
      json.stderr = stderr;
      msg = JSON.stringify(json);
    } else {
      msg = '{"code": 404, "information": "No such task."}';
    }
    res.writeHead(200, {'Content-Type': 'application/json'});
    res.write(msg);
    res.end();
  });

  // socket.io
  io = require('socket.io').listen(server);

  io.sockets.on('connection', function (socket) {
    // ask client to drop connection due to wrong password
    socket.on('login', function (data) {
      if (data.password !== PASS[data.user]) {
        socket.emit('terminate');
      } else {
        socket.emit('stdout', clearSreen);
        socket.emit('stdout', 'HyperNode Cloud Environment (version: ' +
                    VERSION + ')\nWelcome, ' + data.user + '!\nServer time: ' +
                    (new Date()).toString() + '\nType "help" for user manual.\n');
        socket.emit('ok.login', USER_DIR, tasksInformation());
      }
    });

    socket.on('cmd', function (data) {
      exec(data, socket);
    });

    socket.on('empty', function () {
      socket.emit('ok', tasksInformation());
    });

    socket.on('task.kill', function (pid) {
      if (tasks[pid]) {
        var isNotRunning = tasks[pid].status !== 'EXIT' &&
          tasks[pid].status !== 'ERROR';
        if (isNotRunning) {
          tasks[pid].child.kill();
        } else {
          cleanupTask(pid);
        }
      }
      socket.emit('ok', tasksInformation());
    });

    socket.on('task.stdout', function (pid) {
      if (tasks[pid]) {
        socket.emit('stdout', tasks[pid].stdout);
        socket.emit('ok', tasksInformation());
      }
    });

    socket.on('task.stderr', function (pid) {
      if (tasks[pid]) {
        var msg = tasks[pid].stderr;
        if (msg.length !== 0) {
          socket.emit('stdout', msg);
        }
        socket.emit('ok', tasksInformation());
      }
    });

    socket.on('task.all', function () {
      var msg = 'All tasks:\n';
      var count = 1;
      for (var task in tasks) {
        if (tasks.hasOwnProperty(task)) {
          console.log(task);
          msg += tasks[task].pid + ' [' + tasks[task].status + '] ' +
            tasks[task].scheduled + '| ' + tasks[task].task + '\n';
          ++count;
        }
      }
      socket.emit('stdout', msg);
      socket.emit('ok', tasksInformation());
    });

    // add socket.io-steam for file uploading
    ss(socket).on('push', function (stream, data) {
      var filename = USER_DIR + pa.basename(data.name);
      stream.pipe(fs.createWriteStream(filename));
      socket.emit('ok', tasksInformation());
    });

  });
};
