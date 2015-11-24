/**
 * Initialize the test suite by first launching the mock api server, and when
 * it's up, fire off `testem ci`, which will run the test suite in up to five
 * browsers concurrently. cha-ching!
 */

'use strict';
var server;
var testem;

var cp = require('child_process');
var errorDie = function(err) {
    var code = err.code === undefined ? 1 : err.code;
    console.log('Failed to start child process', err);
    process.exit(code);
};
var closeChild = function(code) {
    if (code > 0) {
        errorDie({ message: 'mock-api-server exited', code: code });
    }
};
var testemExit = function(code) {
    console.log('test run complete, closing server (exit code ' + code + ')');
    server.kill();
    return closeChild(code);
};
var spawnTestem = function() {
    testem = cp.spawn(
        'node_modules/.bin/testem', ['ci', '-p', '7575', '-P', '5'],
        { stdio: 'inherit' }
    );
    testem.on('error', errorDie);
    testem.on('exit', testemExit);
    console.log('Spawned testem, pid: ' + testem.pid);
};

var server = cp.fork('test/mock-api-server.js', { stdio: 'inherit' });
console.log('Spawned mock-api-server, pid: ' + server.pid);
server.on('error', errorDie);
server.on('exit', closeChild);
server.on('message', function handleMsg(msg) {
    if (msg && msg.status === 'READY') {
        console.log('server up! booting testem...');
        return spawnTestem();
    }
    throw new ReferenceError('unhandled msg: ' + JSON.stringify(msg));
});

// assert child processes exit when this process exits
process.on('exit', function() {
    server && server.kill();
    testem && testem.kill();
});
