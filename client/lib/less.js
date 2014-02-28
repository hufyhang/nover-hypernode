var blessed = require('blessed');

var less = function (data) {
  'use strict';
  process.stdin.setRawMode(true);
  process.stdin.resume();

  // Create a screen object.
  var screen = blessed.screen();

  // Create a box perfectly centered horizontally and vertically.
  var box = blessed.box({
    content: data,
    alwaysScroll:true,
    scrollable: true,
  });

  // Append our box to the screen.
  screen.append(box);

  screen.key(['escape', 'q'], function(ch, key) {
    process.stdin.setRawMode(false);
    return process.exit(0);
  });

  screen.key(['space', 'C-d'], function(ch, key) {
    box.scroll(box.height);
    screen.render();
  });

  screen.key(['C-u'], function(ch, key) {
    box.scroll(-box.height);
    screen.render();
  });

  screen.key(['j'], function(ch, key) {
    box.scroll(1);
    screen.render();
  });

  screen.key(['k'], function(ch, key) {
    box.scroll(-1);
    screen.render();
  });

  // Focus our element.
  box.focus();

  // Render the screen.
  screen.render();
};

exports.less = less;
