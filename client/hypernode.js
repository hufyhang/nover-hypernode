var basis = require('./lib/basis');
var color = require('colors');
var rl = require('readline');

var iface;
var ifacePaused;
var socket;
var host = process.argv[2];
var path = '';

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
  console.log('Usage: webnode [WebNode_Server_URL]'.red);
  console.log('To generate pass phrase: webnode -p [password]'.red);
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
