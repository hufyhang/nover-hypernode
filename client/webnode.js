var basis = require('./lib/basis');
var color = require('colors');

var socket;
var host = process.argv[2];
var path = '';

var sendPassword = function (err, pass) {
  'use strict';
  var password = basis.md5(pass.password);
  socket.emit('login', {user: pass.user, password: password});
};

var handleCmd = function (err, cmd) {
  'use strict';
  var command = cmd.cmd.trim();
  if (cmd.length !== 0) {
    if (!basis.sysCmd(command, socket)) {
      socket.emit('cmd', {command: command, cwd: path});
    }
  }
};

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
  basis.prompt(path, 'cmd', handleCmd);
});

socket.on('ok', function () {
  'use strict';
  basis.prompt(path, 'cmd', handleCmd);
});

socket.on('stdout', function (data) {
  'use strict';
  process.stdout.write(data.toString());
});

socket.on('stderr', function (data) {
  'use strict';
  process.stderr.write(data.toString().red);
});
