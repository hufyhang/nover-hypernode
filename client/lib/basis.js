var crypto = require('crypto');
var colors = require('colors');
var prompt = require('prompt');
var fs = require('fs');
var ss = require('socket.io-stream');

var basis = {};

// push files to server
basis.push = function (path, socket) {
  'use strict';
  var stream = ss.createStream();
  path = path.replace(/^~/, process.env['HOME']);
  ss(socket).emit('push', stream, {name: path});
  fs.createReadStream(path)
    .pipe(stream);
  return true;
};

basis.prompt = function (path, msg, callback) {
  'use strict';
  prompt.message = '';
  // prompt.message = path;
  prompt.delimiter = '';
  prompt.start();
  prompt.get({
    properties : {
      cmd: {
        description: '$'.green
      }
    }
  }, callback);
};

basis.password = function (callback) {
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
};


basis.md5 = function (data) {
  'use strict';
  return crypto.createHash('md5').update(data).digest('hex');
};

basis.sysCmd = function (cmd, socket) {
  'use strict';
  var argv;
  if (cmd === 'exit') {
    process.exit(0);
  }

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
};

module.exports = basis;
