#!/usr/bin/env node
var npm = require("npm");
var argv = process.argv;

if (argv.length < 4) {
  console.log('Usage: pkg [command] [package]');
  process.exit(0);
}

var command = argv[2];
var packages = [];

for (var index = 3, total = argv.length; index !== total; ++index) {
  packages.push(argv[index]);
}

var installPkg = function (pkgs) {
  'use strict';
  npm.load({}, function (err) {
    if (err) {
      console.log(err);
      return;
    }

    npm.commands.install(pkgs, function (er, data) {
      if (er) {
        console.log(er);
      }
      console.log(data);
    });

    npm.on("log", function (message) {
      // log the progress of the installation
      console.log(message);
    });
  });
};

var uninstallPkg = function (pkgs) {
  'use strict';
  npm.load({}, function (err) {
    if (err) {
      console.log(err);
      return;
    }

    npm.commands.uninstall(pkgs, function (er, data) {
      if (er) {
        console.log(er);
      }
      console.log(data);
    });

    npm.on("log", function (message) {
      // log the progress of the uninstallation
      console.log(message);
    });
  });
};

if (command === 'install') {
  installPkg(packages);
}
else if (command === 'uninstall' || command === 'remove') {
  uninstallPkg(packages);
}


