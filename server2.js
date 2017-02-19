var express = require('express');
var app = express();

var server = app.listen(9000, function () {

   var host = server.address().address
   var port = server.address().port

   console.log("Example app listening at http://%s:%s", host, port)
})

var io = require('socket.io').listen(server);

app.use(express.static('public'));

var channels = ['chan1','chan2'];
console.log(channels.length);

// This responds with "Hello World" on the homepage
app.get('/', function (req, res) {
   console.log("Got a GET request for the homepage");
   res.sendFile(__dirname + '/index.html');
   //res.send('Hello GET');
})

// This responds a POST request for the homepage
app.post('/', function (req, res) {
   console.log("Got a POST request for the homepage");
   res.send('Hello POST');
})

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
	socket.on('send_msg', function(data) {
		io.sockets.emit('msg_to_chat', data);
	})
})

// This responds a DELETE request for the /del_user page.
app.delete('/del_user', function (req, res) {
   console.log("Got a DELETE request for /del_user");
   res.send('Hello DELETE');
})

// This responds a GET request for the /list_user page.
app.get('/list_user', function (req, res) {
   console.log("Got a GET request for /list_user");
   res.send('Page Listing');
})

// This responds a GET request for abcd, abxcd, ab123cd, and so on
app.get('/ab*cd', function(req, res) {   
   console.log("Got a GET request for /ab*cd");
   res.send('Page Pattern Match');
})

//var server = app.listen(9000, function () {

  // var host = server.address().address
  // var port = server.address().port

  // console.log("Example app listening at http://%s:%s", host, port)
//})