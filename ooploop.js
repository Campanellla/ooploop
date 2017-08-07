////---INIT---

//var path = require('path');
//var util = require('util');
//var url = require('url');

var config = require('./config');

var querystring = require('querystring');
var static = require('node-static');
var file = new static.Server('.');

//Socket IO and Express
var exprss = require('express');
var app = new exprss();
var http = require('http').Server(app);
var io = require('socket.io')(http);

//Send time to console
var date = new Date();
console.log('Time restarted: ' + date.getHours() + ':' + date.getMinutes() + "." + date.getSeconds());

var start_directory = __dirname;
var node_program_directory = process.argv[0];

//init mongo client
var MongoClient = require('mongodb').MongoClient, assert = require('assert');
var DBurl = config.DBurl;


////---INIT----

//Check MongoDB connection?
MongoClient.connect(DBurl, function(err, db) {
	assert.equal(null, err);
	console.log('Connected successfully to server');
	db.close();
})

//Send Message to DB
function SendMessageToDB(msg){
	MongoClient.connect(DBurl, function(err, db) {
		if (err) throw err;
		var myobj = { date: Date(), nickname: msg.nickname, text: msg.message};
		db.collection("chatHistory.chat1").insertOne(myobj, function(err, res) {
			if (err) throw err;
			console.log("record inserted");
			db.close();
		});
	});
};

//get all messages from db
function GetMessagesFromDB(resp){
	MongoClient.connect(DBurl, function(err, db) {
		if (err) throw err;

		db.collection('chatHistory.chat1', function(err, collection) {
        	if (!err) {
          		collection.find({}).toArray(
          			function(err, data) {
          				resp(data);
          				db.close();
          			}
          		)
          	}
        })
	});
}

function CheckLogin(msgLogin, resp) {
	MongoClient.connect(DBurl, function(err, db) {
		if (err) throw err;

		db.collection('users', function(err, collection) {
        	if (!err) {
          		collection.find({'login': msgLogin.login}).toArray(
          			function(err, data) {

          				resp(data);
          				db.close();
          			}
          		)
          	}
        })
	});
}

function RegisterInDB(msg){
	MongoClient.connect(DBurl, function(err, db) {
		if (err) throw err;
		var myobj = { 'login':msg.login, 'password':msg.pass};
		db.collection("users").insertOne(myobj, function(err, res) {
			if (err) throw err;
			console.log("user inserted");
			db.close();
		});
	});
};


app.use(exprss.static(__dirname+'/public'));

io.on('connection', function(socket){
	console.log('a user connected');

	socket.on('disconnect', function(){
		console.log('user disconnected');
	});

	socket.on('chat message', function(msg) {
		SendMessageToDB(msg);
		console.log('nick: '+ msg.nickname+' message: ' + msg.message);
		io.emit('chat message', msg);
		console.log(socket.id);
	});

	socket.on('get messages', function(msg) {
		GetMessagesFromDB(function(aaa){
			io.to(socket.id).emit('receive messages', aaa);
		});
	})

	socket.on('login', function(msgLogin) {
		CheckLogin(msgLogin, function(data){
			if(data.length>1){
				console.log("too many users found: " + data[0].login);
				return null;
			} else if(data.length===0){
				io.to(socket.id).emit('loginCallback', "NOT OK");
				return null;
			}
			if(data[0].login===msgLogin.login) {
				if(data[0].password===msgLogin.pass) {
					io.to(socket.id).emit('loginCallback', "OK. Logged in.");
				} else {
					io.to(socket.id).emit('loginCallback', "NOT OK");
				};
			};
			return null;
		});
		//console.log(msgLogin.login+" "+msgLogin.pass)
	});

	socket.on('register', function(msg){
		RegisterInDB(msg);
	})

});


http.listen(config.server.port, function(){
  console.log('listening on *:' + config.server.port);
});


