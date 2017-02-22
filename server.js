var express = require('express');
var app = express();

var server = app.listen(9000, function () {

   var host = server.address().address
   var port = server.address().port

   console.log("Example app listening at http://%s:%s", host, port)
})

var io = require('socket.io').listen(server);

app.use(express.static('public'));

var channels = ['Music','Arts','Science','Tech'];
var nicknames = [];

// This responds with "Hello World" on the homepage
app.get('/', function (req, res) {
   console.log("Got a GET request for the homepage");
   res.sendFile(__dirname + '/index.html');
   //res.send('Hello GET');
})

// This responds a POST request for the homepage
//app.post('/', function (req, res) {
//   console.log("Got a POST request for the homepage");
//   res.send('Hello POST');
//s})

app.get('/channels', function (req, res) {
   // Prepare output in JSON format
   response = "Welcome to channel " + req.query.nick_name;
   //response = {
   //   nick_name:req.query.nick_name,
      //last_name:req.query.last_name
   //};
   console.log(response);
   res.sendFile(__dirname + '/channels.html');
   //res.end(response);
})

io.sockets.on('connection', function(socket) {
	//console.log("server.js: " + socket)

	socket.on('nick_to_srv', function(data) {
		console.log("server.js: nick_to_front" + data)
		socket.nickname = data;
		nicknames.push(socket.nickname);
		socket.emit('nick_to_front', {nick: socket.nickname, chans: channels} );

		for(i = 0; i < nicknames.length; i++)
			console.log("nicknames: " + nicknames[i])
	})

	socket.on('join_channel', function(data) {
		console.log("nick: " + socket.nickname)
		socket.channel = data;
		socket.join(data);
		console.log("channel: " + data)
		socket.emit('joining_channel', {nick: socket.nickname, channel: data});
	})

	socket.on('leave_channel', function(){
		console.log("leave_channel: " + socket.channel)
		socket.leave(socket.channel);
		//socket.emit('leaving_channel');
	})

	socket.on('send_msg', function(data) {
		console.log("send_msg server.js: " + data)
		console.log("send_msg nick: " + socket.nickname)
		console.log("send_msg channel: " + socket.channel)
		io.sockets.in(socket.channel).emit('msg_to_chat', {nick: socket.nickname, msg: data});
	})

})