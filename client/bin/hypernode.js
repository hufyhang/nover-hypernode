#!/usr/bin/env node

var rl = require('readline');
var crypto = require('crypto');
var colors = require('colors');
var prompt = require('prompt');
var fs = require('fs');
var ss = require('socket.io-stream');

var iface;
var ifacePaused;
var socket;
var host = process.argv[2];
var path = '';

var basis = {
  // push files to server
  push: function (path, socket) {
    'use strict';
    var stream = ss.createStream();
    path = path.replace(/^~/, process.env.HOME);
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
    if (cmd === 'exit') {
      process.exit(0);
    }

    // push command
    argv = cmd.match(/^push\ ?(.+)?$/);
    if (argv) {
      var filename = argv[1];
      if (!filename) {
        console.error('Usage: push [filename]'.red);
        socket.emit('empty');
        return true;
      } else {
        basis.push(filename, socket);
        return true;
      }
    }

    // show all tasks
    if (cmd === 'jobs' || cmd === 'tasks') {
      socket.emit('task.all');
      return true;
    }

    // kill a task
    argv = cmd.match(/^kill\ ?([0-9]+)?$/);
    if (argv) {
      var pid = argv[1];
      if (!pid) {
        console.error('Usage: kill [task_pid]'.red);
        socket.emit('empty');
        return true;
      } else {
        socket.emit('task.kill', pid);
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

socket.on('ok.login', function (data) {
  'use strict';
  path = data;
  initPrompt();
  iface.prompt();
});

socket.on('ok', function () {
  'use strict';
  iface.prompt();
});

socket.on('stdout', function (data) {
  'use strict';
  // toggleReadline();
  process.stdout.write(data.toString());
  // toggleReadline();
});

socket.on('stderr', function (data) {
  'use strict';
  // toggleReadline();
  process.stderr.write(data.toString().red);
  // toggleReadline();
});

socket.on('worker.assign', function (pid) {
  'use strict';
  var msg = 'Worker assigned: ' + pid + '\n';
  process.stdout.write(msg.cyan);
});

socket.on('worker.exit', function (pid) {
  'use strict';
  var msg = 'Worker exit: ' + pid + '\n';
  process.stdout.write(msg.cyan);
});
