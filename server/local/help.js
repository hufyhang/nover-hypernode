#!/usr/bin/env node

var help = '';
help += '--- General Purpose ---\n';
help += 'cat \t-- concatenate files.\n';
help += 'cd \t-- change directory.\n';
help += 'ls \t-- list files.\n';
help += 'tree \t-- show directory tree.\n';
help += 'exit \t-- exit HyperNode.\n';

help += '\n--- File/Folder Management---\n';
help += 'cp \t-- copy a file.\n';
help += 'rm \t-- remove a file.\n';
help += 'rm -r \t-- remove a folder.\n';
help += 'mv \t-- move a file to somewhere.\n';
help += 'mkdir \t-- create a folder.\n';

help += '\n--- File Transfer ---\n';
help += 'push \t-- upload a local file.\n';
help += 'unzip \t-- unzip a zip file.\n';

help += '\n--- Task Management ---\n';
help += 'run \t-- run a long-term task.\n';
help += 'now \t-- run an immediate task.\n';
help += 'tasks \t-- list all running tasks.\n';
help += 'kill \t-- kill a running task.\n';
help += 'show \t-- show stdout of a task.\n';
help += 'error \t-- show stderr of a task.\n';

console.log(help);
