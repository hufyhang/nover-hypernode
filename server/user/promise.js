#!/usr/bin/env node
var Q = require('q');

var calc = function (num) {
  'use strict';
  var defer = Q.defer();
  process.nextTick(function () {
    var max = num;
    for (var index = 0; index !== max; ++index) {
      num += num;
      console.log('Stage:', num);
    }

    defer.resolve(num);
  });

  return defer.promise;
};


var nextPromise = function (callback) {
  'use strict';
  var defer = Q.defer();
  defer.resolve(callback);
  return defer.promise;
};

calc(100)
.then(function (data) {
  'use strict';
  return nextPromise(console.log('Result:', data));
})
.then(function () {
  'use strict';
  console.log('Finish');

  var numbers = [0, 1, 2, 3, 4, 5, 6];

  var total = numbers.reduce(function (a, b) {
    return a + b;
  });

  console.log('Total:', total);
});

console.log('Now...');


