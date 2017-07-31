var path = require('path');
var util = require('util');
var url = require('url');

var querystring = require('querystring');
var static = require('node-static');
var file = new static.Server('.');

var exprss = require('express');
var app = new exprss();
var http = require('http').Server(app);
var io = require('socket.io')(http);


function grab(flag){
	var index = process.argv.indexOf(flag);
	if (index === -1) {return null;} else {return process.argv[index+1]};
}

var directory = grab('--dir');
var start_directory = __dirname;
var node_program_directory = process.argv[0];

/*
app.get('/', function(req, res){
  res.sendFile(__dirname + '/index.html');
});
*/
app.use(exprss.static(__dirname+'/public'));

io.on('connection', function(socket){
  console.log('a user connected');
  socket.on('disconnect', function(){
    console.log('user disconnected');
  });
  socket.on('chat message', function(msg){
    console.log('nick: '+ msg.nickname+' message: ' + msg.message);
    io.emit('chat message', msg);
  });
});


http.listen(8080, function(){
  console.log('listening on *:8080');
});

