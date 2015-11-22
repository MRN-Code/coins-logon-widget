var http = require('http');
var finalhandler = require('finalhandler');
var Router = require('router');
var router = Router();
var port = 12354;
var server;

router.get('/', function(req, res) {
    res.setHeader('Content-Type', 'text/plain; charset=utf-8');
    res.end('yahtzee.  these are not the routes you\'re looking for');
});

router.post('/auth/keys', function(req, res) {
    res.writeHead(200, {
        'Set-Cookie': 'testcookie=testcookievalue',
        'Content-Type': 'application/json; charset=utf-8'
    });
    res.end(JSON.stringify({
        data: [
            {
                user: {
                    acctExpDate: '2099-11-22T01:01:01.001Z',
                    passwordExpDate: '2099-11-22T01:01:01.001Z',
                    username: 'testUser',
                }
            }
        ]
    }));
});

server = http.createServer(function(req, res) {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:7575');
    res.setHeader('Access-Control-Request-Method', 'http://localhost:7575');
    res.setHeader('Access-Control-Allow-Methods', 'OPTIONS, GET, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'http://localhost:7575');
    res.setHeader('Access-Control-Allow-Credentials', true);
    if (req.method === 'OPTIONS') {
        res.writeHead(200);
        res.end();
        return;
    }

    router(req, res, finalhandler);
});

server.listen(12354);

console.log('mock-api-server listening on', port);
if (process.send) {
    // alert parent process if present
    process.send({ status: 'READY' });
}
