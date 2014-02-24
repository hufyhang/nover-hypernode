var Q = require('Q');
var request = require('request');

function JsonIP(url) {
  'use strict';
  this.url = url;
}

JsonIP.prototype.get = function () {
  'use strict';
  var defer = Q.defer();
  request(this.url, function (err, res, body) {
    if (err) {
      defer.reject(err);
    } else {
      defer.resolve({response: res, body: body});
    }
  });
  return defer.promise;
};

var getJson = function (json, keys) {
  'use strict';
  var obj = JSON.parse(json);
  if (typeof keys !== 'object') {
    return obj[keys] || undefined;
  }

  var result = [];
  keys.forEach(function (key) {
    if (obj[key]) {
      result.push(obj[key]);
    }
  });
  return result;
};

var ip = new JsonIP('http://ip.jsontest.com');
ip.get()
.then(function (data) {
  'use strict';
  console.log(getJson(data.body, 'ip'));
})
.catch(function (err) {
  'use strict';
  console.error(err);
});
