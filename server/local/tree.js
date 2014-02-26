#!/usr/bin/env node

var fs = require('fs');
var pa = require('path');

var CWD = process.env.HYPERNODE_CWD;
var path = process.argv[2] || '.';
var buffer = path + '\n';
var noMoreHead = false;

path = pa.resolve(CWD, path);

var getSeparator = function (isRoot, index, array) {
  'use strict';
  if (isRoot) {
    return '';
  }
  else if (index !== array.length - 1) {
    return '│';
  } else {
    return '└';
  }
};

var getLeading = function (index, array) {
  'use strict';
  if (index < array.length) {
    return '│';
  }
  return ' ';
};

var getHead = function (isRoot, index, array) {
  'use strict';
  if (!isRoot) {
    return '│';
  }

  if (index < array.length - 1) {
    return '│';
  }

  if (noMoreHead) {
    return ' ';
  } else {
    noMoreHead = true;
    return '└';
  }
};

var appendTabs = function (inputTabs, leading, isRoot, level, noMore) {
  'use strict';
  var tabs = inputTabs || '';
  var head = '   ';
  var end = '';

  if (!isRoot) {
    end = '   ';
  }

  if (level < 2) {
    if (!isRoot) {
      return tabs + head + leading + end;
    } else {
      return tabs;
    }
  } else {
    if (level < 3) {
      leading = '';
    }

    if (noMore) {
      leading = '';
    }
    return tabs + leading + head + '' + end;
  }
};

var treeDir = function (isRoot, path, tabs, level, noMore) {
  'use strict';
  if (!level) {
    level = 0;
  }
  ++level;

  var stat = fs.statSync(path);
  if (stat.isDirectory()) {
    var files = fs.readdirSync(path);

    files.forEach(function (file, index, array) {
      var separator = getSeparator(isRoot, index, array);
      var leading = getLeading(index, array);
      var head = getHead(isRoot, index, array);

      var filePath = pa.resolve(path, file);
      var st = fs.statSync(filePath);

      var newTabs = appendTabs(tabs, leading, isRoot, level, noMore);
      var hasNoMore = index === array.length - 1;

      if (st.isDirectory()) {
        buffer += head + newTabs + separator + '── [' + file + ']\n';
        treeDir(false, filePath, newTabs, level, hasNoMore);
      } else {
        buffer += head + newTabs + separator + '── ' + file + '\n';
      }
    });
    return buffer;
  } else {
    return undefined;
  }
};

var result = treeDir(true, path, '', 0, false);
if (result) {
  console.log(result);
} else {
  console.error('Cannot open dir:\n' + path);
}

