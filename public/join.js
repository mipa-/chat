var socket = io.connect();

	
	//nicknamen valinta
	$("#chooseNick").keypress(function(event){
		console.log("keypress nickname")
		if (event.keyCode == 13) {
			event.preventDefault();
			nname = $("#chooseNick").val().replace(/</g, "&lt;").replace(/>/g, "&gt;");
			console.log("keypress keyCode: " + nname)
			socket.emit('nick_to_srv', nname);
		}
	})

	$("#nickBtn").click(function(event) {
		event.preventDefault();
		console.log("enter nickname")
		nname = $("#chooseNick").val().replace(/</g, "&lt;").replace(/>/g, "&gt;");
		console.log("keypress keyCode: " + nname)
		socket.emit('nick_to_srv', nname);
	})

	socket.on('nick_to_front', function(data) {
		$('#helloNick').show();
		$('#channelGrid').show();
		$('#helloUser').append(data.nick);
		$('#chooseNickForm').hide();
		
		//tuodaan käyttäjälle lista kanavista
		for(i = 0; i < data.chans.length; i++) {
			//console.log("joo: " + data.chans)
			//console.log("chans: " + data.chans[i].name)
			//<li><a href="#" data-value="1"> Style 1 </a></li>
			$('#chanList').append('<li><a href="#" id="chanid' + data.chans[i].name + '" data-value="' + data.chans[i].name + '">' + data.chans[i].name + '</a></li>');
			//$('#chanList2').append('<option id="chanid' + data.chans[i].name + '"">' + data.chans[i].name + '</option></br>');	
		}
	})

	socket.on('update_channellist', function(data) {
		$('#helloNick').show();
		$('#channelGrid').show();
		$('#chanList').empty();
		$('#helloUser').empty();
		$('#helloUser').append("Well hello " + data.nick);
		$('#chooseNickForm').hide();
		
		//tuodaan käyttäjälle lista kanavista
		for(i = 0; i < data.chans.length; i++) {
			//console.log("joo: " + data.chans)
			//console.log("chans: " + data.chans[i].name)
			//$('#chanList').append('<li id="chanid' + data.chans[i] + '"">' + data.chans[i] + '</li></br>');
			//$('#chanList2').append('<option id="chanid' + data.chans[i].name + '"">' + data.chans[i].name + '</option></br>');	
			$('#chanList').append('<li><a href="#" id="chanid' + data.chans[i].name + '" data-value="' + data.chans[i].name + '">' + data.chans[i].name + '</a></li>');
		}
	})

	$('select').change(function() {
		var channel = $('#chanList2 option:selected').text();
		console.log("select.value: " + channel)
		socket.emit('join_channel', channel);
	})

	$("#chanList").on("click", "li", function(event) {
		event.preventDefault();
		console.log("menee tänne")
		var channel = $(this).text();
		console.log("select.value: " + channel)
		socket.emit('join_channel', channel);
	})

	socket.on('joining_channel', function(data){
		console.log("joitain")
		$('#channelGrid').hide();
		$('#messageGrid').show();
		$('#welcomeChannel').append('<h3>Welcome to channel ' + data.channel + '</h3>');
	})

	socket.on('userlist', function(data) {
		console.log("menee user list")
		$('#usersInRoom').empty();
		for (i = 0; i < data.length; i++) {
			$('#usersInRoom').append('<li id="userid' + data[i] + '">' + data[i] + '</li>');
		}
	})

	//viesti chattiin buttonilla 	
	var myBtn = document.getElementById('myButton'); 
	if (myBtn) {	
		myBtn.addEventListener('click', function(event) { 		
		temp = document.getElementById("message1").value.replace(/</g, "&lt;").replace(/>/g, "&gt;"); 		
		socket.emit('send_msg', temp);		
		$('#message1').val(""); 	
	}); 	 	}

	//viesti chattiin enterillä 	
	$("#message1").keypress(function(event){ 	
		if(event.keyCode == 13) {		
			event.preventDefault(); 			
			var temp = document.getElementById("message1").value.replace(/</g, "&lt;").replace(/>/g, "&gt;");		
			console.log("replace: " + temp)	
			socket.emit('send_msg', temp);		
			$('#message1').val(""); 	
		}
	});

	//sending message to chat
	socket.on('msg_to_chat', function(data) {
		var time = getTime();
		$('#channel').append('[' + time + '] <b>' + data.nick + '</b> : ' + data.msg + '<br>');
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
				$('#newChanError').append('<br><div id="newChanError2" class="alert alert-danger" role="alert"><span class="glyphicon glyphicon-exclamation-sign"></span><span class="sr-only">Error:</span> That channel already exists!');
				$('#newChanError').delay(2500).fadeOut();
				$('#newChanError').attr('style','display: unset');
			}
		});
		$('#newChannel').val("");
	}


