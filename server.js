var express = require('express');
var app = express();

var server = app.listen(9000, function () {

   var host = server.address().address
   var port = server.address().port

   console.log("Example app listening at http://%s:%s", host, port)
})

var io = require('socket.io').listen(server);

app.use(express.static('public'));

var channels = [{name: 'Music', users: []},
				{name: 'Arts', users: []},
				{name: 'Science', users: []},
				{name: 'Tech', users: []}
			];
var nicknames = [];

//GET request for homepage
app.get('/', function (req, res) {
   console.log("Got a GET request for the homepage");
   res.sendFile(__dirname + '/index.html');
})

io.sockets.on('connection', function(socket) {
	
	socket.on('nick_to_srv', function(data) {
		console.log("server.js: nick_to_front" + data)
		socket.nickname = data;
		nicknames.push(socket.nickname);
		socket.emit('nick_to_front', {nick: socket.nickname, chans: channels} );
	})

	socket.on('join_channel', function(data) {
		console.log("nick: " + socket.nickname)
		socket.channel = data;
		socket.join(data);

		var index = 0;
		for(i = 0; i < channels.length; i++) {
			if(channels[i].name == data) {
				channels[i].users.push(socket.nickname);
				index = i;
			}
		}

		socket.emit('joining_channel', {nick: socket.nickname, channel: data});
		io.sockets.in(data).emit('userlist', channels[index].users);
	})

	socket.on('leave_channel', function(){
		console.log("leave_channel: " + socket.channel)
		var channel = socket.channel;
		socket.leave(socket.channel);

		console.log("leave_channel: " + socket.channel)
		
		var index = 0;
		for(i = 0; i < channels.length; i++) {
			if(channels[i].name == channel) {
				for(j = 0; j < channels[i].users.length; j++) {
					if (channels[i].users[j] == socket.nickname)
						channels[i].users.splice(j,1);
				}
				index = i;
			}
		}
		io.sockets.in(channel).emit('userlist', channels[index].users);
		socket.emit('update_channellist', {nick: socket.nickname, chans: channels});
	})

	socket.on('new_channel', function(data) {
		console.log("new channel")
		var temp = {name: data, users: []};
		channels.push(temp);

		for(i = 0; i < channels.length; i++) {
			console.log("channels " + channels[i].name)
		}

		socket.channel = data;
		socket.join(data);

		var index = 0;
		for(i = 0; i < channels.length; i++) {
			if(channels[i].name == data) {
				channels[i].users.push(socket.nickname);
				index = i;
			}
		}
		
		socket.emit('joining_channel', {nick: socket.nickname, channel: data});
		io.sockets.in(data).emit('userlist', channels[index].users);
	})

	socket.on('send_msg', function(data) {
		console.log("server.js send_msg: nick (%s) sent message (%s) to channel (%s)", socket.nickname,data,socket.channel)
		io.sockets.in(socket.channel).emit('msg_to_chat', {nick: socket.nickname, msg: data});
	})

	socket.on('disconnect', function() {
		var channel = socket.channel;
		socket.leave(socket.channel);

		console.log("leave_channel: " + socket.channel)
		console.log("leave_channel: " + channel)
		
		var index = 0;
		for(i = 0; i < channels.length; i++) {
			if(channels[i].name == channel) {
				for(j = 0; j < channels[i].users.length; j++) {
					if (channels[i].users[j] == socket.nickname)
						channels[i].users.splice(j,1);
				}
				index = i;
			}
		}
		io.sockets.in(channel).emit('userlist', channels[index].users);

	})

})
