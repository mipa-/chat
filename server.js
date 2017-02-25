var express = require('express');
var app = express();

var server = app.listen(9000, function () {

   var host = server.address().address
   var port = server.address().port

   console.log("Example app listening at http://%s:%s", host, port)
})

var io = require('socket.io').listen(server);

app.use(express.static('public'));

var channels = [{name: 'Arts', users: []},
				{name: 'Music', users: []},
				{name: 'Science', users: []},
				{name: 'Tech', users: []}
			];
var nicknames = {};

//GET request for homepage
app.get('/', function (req, res) {
   console.log("Got a GET request for the homepage");
   res.sendFile(__dirname + '/index.html');
})

io.sockets.on('connection', function(socket) {
	
	socket.on('nick_to_srv', function(nickname, callback) {
		console.log("server.js: nick_to_front" + nickname)

		if(nickname.length > 15)
			nickname = nickname.substring(0,15);

		if(nicknames[nickname] == undefined) {
			console.log("new nickname")
			callback(true);
			socket.nickname = nickname;
			nicknames[socket.nickname] = socket;
			socket.emit('nick_to_front', {nick: socket.nickname, chans: channels} );
		}
		else {
			console.log("nick not free")
			callback(false);
		}
	})

	socket.on('join_channel', function(data) {
		console.log("join_channel: nick: " + socket.nickname)
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
		io.sockets.in(data).emit('join_msg_chat', socket.nickname);
	})

	socket.on('leave_channel', function(){
		console.log("leave_channel: " + socket.channel)
		var channel = socket.channel;
		socket.leave(socket.channel);

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
		io.sockets.in(channel).emit('leave_msg_chat', socket.nickname);
	})

	socket.on('new_channel', function(data, callback) {

		var chanExists = false;

		if(data.length > 15)
			data = data.substring(0,15);

		for(i = 0; i < channels.length; i++) {
			if(channels[i].name.toLowerCase() == data.toLowerCase()) {
				chanExists = true;
			}
		}	

		if(chanExists == true) {
			callback(false);
		}

		else {
			callback(true);
			var temp = {name: data, users: []};
			channels.push(temp);

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
			io.sockets.in(data).emit('join_msg_chat', socket.nickname);
			io.sockets.emit('update_channellist', {nick: socket.nickname, chans: channels});
		}
	})

	socket.on('send_msg', function(data) {
		console.log("server.js send_msg: nick (%s) sent message (%s) to channel (%s)", socket.nickname,data,socket.channel)
		io.sockets.in(socket.channel).emit('msg_to_chat', {nick: socket.nickname, msg: data});
	})

	socket.on('send_private_message', function(data) {
		console.log("send_priv_server " + socket.nickname + " to " + data.nick + " " + data.msg)
		var to_id = nicknames[data.nick].id;
		var my_id = socket.id;
		//console.log("joo " + nicknames[data.nick])
		io.sockets.connected[to_id].emit('sending_private_message', {nick: socket.nickname, to: data.nick, msg: data.msg});
		if (to_id != my_id)
			io.sockets.connected[my_id].emit('sending_private_message', {nick: socket.nickname, to: data.nick, msg: data.msg});
	})

	socket.on('disconnect', function() {
		var channel = socket.channel;
		socket.leave(socket.channel);
		delete nicknames[socket.nickname];

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
		io.sockets.in(channel).emit('leave_msg_chat', socket.nickname);
	})

})
