#!/usr/bin/env node

var help = '';
help += '--- General Purpose ---\n';
help += 'run \t-- run a Node.js file.\n';
help += 'cat \t-- concatenate files.\n';
help += 'ls \t-- list files.\n';
help += '\n--- File/Folder Management---\n';
help += 'rm \t-- remove a file.\n';
help += 'rm -r \t-- remove a folder.\n';
help += 'mv \t-- move a file to somewhere.\n';
help += 'mkdir \t-- create a folder.\n';
help += '\n--- File Transfer ---\n';
help += 'push \t-- upload a local file.\n';
help += 'unzip \t-- unzip a zip file.\n';
help += '\n--- Task Management ---\n';
help += 'tasks \t-- list all running tasks.\n';
help += 'kill \t-- kill a running task.\n';

console.log(help);
