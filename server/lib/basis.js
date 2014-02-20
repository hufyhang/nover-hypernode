var crypto = require('crypto');
var colors = require('colors');

var basis = {};

basis.log = function (msg) {
  'use strict';
  var date = new Date();
  console.log('###############################');
  console.log(date.toString().blue);
  console.log(msg.green);
  console.log('###############################');
  console.log('\n');
};

basis.md5 = function (data) {
  'use strict';
  return crypto.createHash('md5').update(data).digest('hex');
};

module.exports = basis;
