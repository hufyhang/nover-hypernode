#!/usr/bin/env node

function Person(name, age) {
  'use strict';
  this.name = name;
  this.age = age;
}

Person.prototype.getName = function () {
  'use strict';
  return this.name;
};

Person.prototype.getAge = function () {
  'use strict';
  return this.age;
};

function Student(name, age, course) {
  'use strict';
  Person.call(this, name, age);
  this.course = course;
}

Student.prototype = new Person();
Student.prototype.constructor = Student;

Student.prototype.getCourse = function () {
  'use strict';
  return this.course;
};

var p = new Student('Feifei', 26, 'IT');

console.log(p.getName(), 'is now', p.getAge(), 'years old.',
           p.getName(), 'is studying', p.getCourse() + '.');

