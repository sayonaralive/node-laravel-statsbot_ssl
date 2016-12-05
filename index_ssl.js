var fs = require('fs');
var requestify = require('requestify');
var options = {
    key:    fs.readFileSync('/etc/letsencrypt/live/cashtop.win/privkey.pem'),
    cert:   fs.readFileSync('/etc/letsencrypt/live/cashtop.win/cert.pem')};

var express = require('express'),
app = express(),
server = require('https').createServer(options, app),
io = require('socket.io').listen(server);

server.listen(7777);

io.sockets.on('connection', function (socket) {

    updateStatus();
    gifts();

    socket.on('disconnect', function () {
        updateStatus();
        gifts();
    })

});

function updateStatus() {
    requestify.post('https://cashtop.win/api/stats', {})
        .then(function (response) {
            data = JSON.parse(response.body);
            var online = Object.keys(io.sockets.adapter.rooms).length;
            var users = data.users;
            var cases = data.cases;
            var data = [online, users, cases];
            io.sockets.emit('statbox', data);
        }, function (err) {

        });
}

function gifts() {
    setTimeout(function () {
        requestify.post('https://cashtop.win/api/last_drop', {})
            .then(function (response) {
                data = JSON.parse(response.body);
                io.sockets.emit('last gifts', data.last_drop);
            }, function (err) {

            });
    }, 4000);
}

io.sockets.on('last gift set', function () {
    setTimeout(function () {
        requestify.post('https://cashtop.win/api/last_drop_get', {})
            .then(function (response) {
                data = JSON.parse(response.body);
                io.sockets.emit('last gift get', data.last_drop);
            }, function (err) {

            });
    }, 2000);
})
