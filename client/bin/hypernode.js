#!/usr/bin/env node

var rl = require('readline');
var crypto = require('crypto');
var colors = require('colors');
var prompt = require('prompt');
var fs = require('fs');
var ss = require('socket.io-stream');

var VERSION = '0.1.3-pre';

var iface;
var ifacePaused;
var socket;
var host = process.argv[2];
var path = '';
var tasksInformation = '';

var basis = {
  // push files to server
  push: function (path, socket) {
    'use strict';
    var stream = ss.createStream();
    ss(socket).emit('push', stream, {name: path});
    fs.createReadStream(path)
    .pipe(stream);
    return true;
  },

  password: function (callback) {
    'use strict';
    prompt.message = '';
    prompt.delimiter = '';

    prompt.start();
    prompt.get({
      properties: {
        user: {
          description: 'Username:'.green,
        },
        password: {
          description: 'Password:'.green,
          hidden: true
        }
      }
    }, callback);
  },


  md5: function (data) {
    'use strict';
    return crypto.createHash('md5').update(data).digest('hex');
  },

  sysCmd: function (cmd, socket) {
    'use strict';
    var argv;
    var pid;

    if (cmd === 'exit') {
      process.exit(0);
    }

    // push command
    argv = cmd.match(/^push\ ?(.+)?$/);
    if (argv) {
      var filename = argv[1];
      if (!filename) {
        console.log('Usage: push [filename]');
        socket.emit('empty');
        return true;
      } else {
        filename = filename.replace(/^~/, process.env.HOME);
        if (fs.existsSync(filename)) {
          basis.push(filename, socket);
        } else {
          console.log('File not found.');
          socket.emit('empty');
        }
        return true;
      }
    }

    // show all tasks
    if (cmd === 'ts' || cmd === 'jobs' || cmd === 'tasks') {
      socket.emit('task.all');
      return true;
    }

    // // kill all tasks
    // if (cmd === 'killall') {
    //   socket.emit('task.killall');
    //   return true;
    // }

    // kill a task
    argv = cmd.match(/^kill\ ?([0-9]+)?$/);
    if (argv) {
      pid = argv[1];
      if (!pid) {
        console.log('Usage: kill [task_pid]');
        socket.emit('empty');
        return true;
      } else {
        socket.emit('task.kill', pid);
        return true;
      }
    }

    // stdout a task
    argv = cmd.match(/^show\ ?([0-9]+)?$/);
    if (argv) {
      pid = argv[1];
      if (!pid) {
        console.log('Usage: show [task_pid]');
        socket.emit('empty');
        return true;
      } else {
        socket.emit('task.stdout', pid);
        return true;
      }
    }

    // stderr a task
    argv = cmd.match(/^error\ ?([0-9]+)?$/);
    if (argv) {
      pid = argv[1];
      if (!pid) {
        console.log('Usage: error [task_pid]');
        socket.emit('empty');
        return true;
      } else {
        socket.emit('task.stderr', pid);
        return true;
      }
    }

  }

};


var sendPassword = function (err, pass) {
  'use strict';
  var password = basis.md5(pass.password);
  socket.emit('login', {user: pass.user, password: password});
};

var handleCmd = function (cmd) {
  'use strict';
  var command = cmd.trim();
  if (cmd.length !== 0) {
    if (!basis.sysCmd(command, socket)) {
      socket.emit('cmd', {command: command, cwd: path});
    }
  } else {
    socket.emit('empty');
  }
};

var initPrompt = function () {
  'use strict';

  iface = rl.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: true
  });

  iface.setPrompt('$ '.green);
  ifacePaused = false;

  // visually indicate closed pipe with ^D
  // otherwise exiting nested shells is confusing
  iface.on('close', function () {
    process.stdout.write('^D\n');
  });

  // handle ^C like bash
  iface.on('SIGINT', function () {
    process.stdout.write('^C');
    iface.clearLine();
    iface.prompt();
  });

  iface.on('line', handleCmd);
};

var toggleReadline = function () {
  'use strict';
  if (iface) {
    if (ifacePaused) {
      iface.resume();
      iface.prompt();
      ifacePaused = false;
    } else {
      // iface.clearLine();
      iface.pause();
      ifacePaused = true;
    }
  }
};

/////////////////
// program starts
/////////////////

if (!host) {
  console.log('HyperNode CLI '.green + VERSION.green);
  console.log('Usage: hypernode [HyperNode_Server_URL]'.red);
  console.log('To generate pass phrase: hypernode -p [password]'.red);
  process.exit(0);
}

// if to generate password
if (host === '-p') {
  var password = process.argv[3] || '';
  process.stdout.write(basis.md5(password) + '\n');
  process.exit(0);
}

socket = require('socket.io-client').connect(host);

socket.on('connect', function () {
  'use strict';
  // ask for password first
  basis.password(sendPassword);
});

socket.on('terminate', function () {
  'use strict';
  console.log('Wrong password.'.red);
  process.exit(0);
});

socket.on('ok.login', function (data, info) {
  'use strict';
  path = data;
  initPrompt();
  iface.setPrompt(info.green + ' $ '.green);
  iface.prompt();
});

socket.on('ok', function (tasksInfo) {
  'use strict';
  iface.setPrompt(tasksInfo.green + ' $ '.green);
  iface.prompt();
});

socket.on('stdout', function (data) {
  'use strict';
  process.stdout.write(data.toString());
});

socket.on('stderr', function (data) {
  'use strict';
  process.stderr.write(data.toString().red);
});

socket.on('task.notify', function (data) {
  'use strict';
  iface.clearLine();
  process.stdout.write(data.toString());
  iface.clearLine();
});
