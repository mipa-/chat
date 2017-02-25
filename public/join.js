var socket = io.connect();

var sendToSelected = '';
	
//choose nickname: press enter
$("#chooseNick").keypress(function(event){
	if (event.keyCode == 13) {
		chooseNickname(event);
	}
})

//choose nickname: press button
$("#nickBtn").click(function(event) {
	chooseNickname(event);
})

//choose nickname function
function chooseNickname(event) {
	event.preventDefault();
	nickname = $("#chooseNick").val().replace(/</g, "&lt;").replace(/>/g, "&gt;");
	socket.emit('nick_to_srv', nickname, function(callback) {
		if(callback == false) {
			$('#newNickError').empty();
			$('#newNickError').append('<br><div id="newNickError2" class="alert alert-danger" role="alert"><span class="glyphicon glyphicon-exclamation-sign"></span><span class="sr-only">Error:</span> The nickname already exists!');
			$('#newNickError').delay(2000).fadeOut();
			$('#newNickError').attr('style','display: unset');
		}
	});
	$('#chooseNick').val("");
}

socket.on('nick_to_front', function(data) {
	$('#helloNick').append('<p id="helloUser">Well hello ' + data.nick + '</p>');
	$('#channelGrid').show();
	$('#chooseNickForm').hide();
	//creating channel list
	for(i = 0; i < data.chans.length; i++) {
		$('#chanList').append('<li><a href="#" id="chanid' + data.chans[i].name + '" data-value="' 
			+ data.chans[i].name + '">' + data.chans[i].name + '</a></li>');
	}
})

//updating channel list
socket.on('update_channellist', function(data) {
	$('#chanList').empty();
	for(i = 0; i < data.chans.length; i++) {
		$('#chanList').append('<li><a href="#" id="chanid' + data.chans[i].name + '" data-value="' 
			+ data.chans[i].name + '">' + data.chans[i].name + '</a></li>');
	}
})

//choosing a channel to join
$("#chanList").on("click", "li", function(event) {
	event.preventDefault();
	var channel = $(this).text();
	socket.emit('join_channel', channel);
})

socket.on('joining_channel', function(data){
	$('#channelGrid').hide();
	$('#messageGrid').show();
	$('#welcomeChannel').append('<h3>Welcome to channel ' + data.channel + '</h3>');
})

//updating user list in channel
socket.on('userlist', function(data) {
	console.log("menee user list")
	$('#usersInRoom').empty();
	for (i = 0; i < data.length; i++) {
		var id = data[i].replace(/ /g,"");
		$('#usersInRoom').append('<li><a href="#" id="userid' + id + '" data-value="' 
			+ data[i] + '">' + data[i] + '</a></li>');
	}
})

$("#usersInRoom").on("click", "li", function(event) {
	event.preventDefault();
	$("a").removeClass('selected');
	var sendTo = $(this).text();
    var id = "#userid" + $(this).text().replace(/ /g,"");
	console.log("id " + id)

	if(sendToSelected == sendTo) {
		$(id).removeClass('selected');
		$("#message1").attr("placeholder", "Type Message");
		sendToSelected = "";
	}
	else {
	    $(id).addClass('selected');
    	$("#message1").attr("placeholder", "Type Message to " + sendTo);
    	sendToSelected = sendTo;
    }
})

//viesti chattiin buttonilla 	
var myBtn = document.getElementById('myButton'); 
if (myBtn) {	
	myBtn.addEventListener('click', function(event) { 		
	temp = document.getElementById("message1").value.replace(/</g, "&lt;").replace(/>/g, "&gt;"); 		
	socket.emit('send_msg', temp);		
	$('#message1').val(""); 	
});}

//viesti chattiin enterillä 	
$("#message1").keypress(function(event){ 	
	if(event.keyCode == 13) {
		sendMessage(event);
	}
});

function sendMessage(event) {
	event.preventDefault();
	var msg = document.getElementById("message1").value.replace(/</g, "&lt;").replace(/>/g, "&gt;");		
	
	if(sendToSelected == "")
		socket.emit('send_msg', msg);
	if(sendToSelected != "") {
		console.log("send private message " + sendToSelected + " " + msg)
		socket.emit('send_private_message', {nick: sendToSelected, msg: msg})
	}
	$('#message1').val("");
}

//sending message to chat
socket.on('msg_to_chat', function(data) {
	var time = getTime();
	$('#channel').append('[' + time + '] <b>' + data.nick + '</b> : ' + data.msg + '<br>');
})

socket.on('sending_private_message', function(data) {
	console.log("sending_private_message")
	var time = getTime();
	$('#channel').append('[' + time + '] <b>' + data.nick + ' secretly whispers to ' + data.to + ' : </b>' + data.msg + '<br>');
})

//sending join messages to chat
socket.on('join_msg_chat', function(nickname) {
	var time = getTime();
	$('#channel').append('[' + time + '] <i>' + nickname + ' joined the channel...</i><br>');
})

//sending leave message to chat
socket.on('leave_msg_chat', function(nickname) {
	var time = getTime();
	$('#channel').append('[' + time + '] <i>' + nickname + ' left the channel...</i><br>');

	if(sendToSelected == nickname)
		sendToSelected = "";
})

function getTime() {
	var d = new Date(); 			
	var hour = d.getHours();
	var min = d.getMinutes();
	var sec = d.getSeconds();
	if(hour< 10) {
		hour = '0' + hour;
	}
	if(min < 10) {
		min = '0' + min;
	}
	if(sec < 10) {
		sec = '0' + sec;
	}
	var time = hour + ":" + min + ":" + sec;
	return time;
}

$("#leaveButton").click(function(event){
	sendToSelected = "";
	socket.emit('leave_channel');
	$('#channelGrid').show();
	$('#messageGrid').hide();
	$('#welcomeChannel').empty();
	$('#channel').empty();
})

//event listener for creating a new channel: press enter
$("#newChannel").keypress(function(event) {
	if(event.keyCode == 13) {
		createNewChannel(event);
	}
})

//event listener for creating a new channel: press button
$("#newChanBtn").click(function(event){
	createNewChannel(event);
})

//create new channel function
function createNewChannel(event) {
	event.preventDefault();
	var channel = document.getElementById("newChannel").value.replace(/</g, "&lt;").replace(/>/g, "&gt;");
	socket.emit('new_channel', channel, function(callback) {
		if(callback == false) {
			$('#newChanError').empty();
			console.log("menee join.js callback falseen")
			$('#newChanError').append('<br><div id="newChanError2" class="alert alert-danger" role="alert"><span class="glyphicon glyphicon-exclamation-sign"></span><span class="sr-only">Error:</span> The channel already exists!');
			$('#newChanError').delay(2000).fadeOut();
			$('#newChanError').attr('style','display: unset');
		}
	});
	$('#newChannel').val("");
}