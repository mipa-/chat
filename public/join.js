//$( document ).ready(chooseChannel);


/*function chooseChannel() {
	var numbers = ['channel1', 'channel2', 'channel3', 'channel4', 'channel5']; 	
	var temp = ''; 	

	for (var i=0;i<numbers.length;i++){ 		
		temp = ''; 		
		temp = '<li value="'+ numbers[i] + '">' + numbers[i] + '</li>'; 		
		console.log(temp); 		
		$('#items').append(temp); 	
	}
}*/

//alert("joo");

var socket = io.connect();

	//nicknamen valinta
	$("#chooseNick").keypress(function(event){
		console.log("keypress nickname")
		if (event.keyCode == 13) {
			event.preventDefault();
			nname = $("#chooseNick").val()
			console.log("keypress keyCode: " + nname)
			socket.emit('nick_to_srv', nname);
		}
	})

	socket.on('nick_to_front', function(data) {
		$('#helloNick').show();
		$('#channelGrid').show();
		$('#helloUser').append(data.nick);
		$('#chooseNickForm').hide();
		
		//tuodaan käyttäjälle lista kanavista
		for(i = 0; i < data.chans.length; i++) {
			console.log("joo: " + data.chans)
			console.log("chans: " + data.chans[i])
			//$('#chanList').append('<li id="chanid' + data.chans[i] + '"">' + data.chans[i] + '</li></br>');
			$('#chanList2').append('<option id="chanid' + data.chans[i] + '"">' + data.chans[i] + '</option></br>');	
		}
	})

	$('select').change(function() {
		var channel = $('#chanList2 option:selected').text();
		console.log("select.value: " + channel)
		socket.emit('join_channel', channel);
		//window.location.href = "http://127.0.0.1:9000/channels?=" + channel;

	})

	socket.on('joining_channel', function(data){
		console.log("joitain")
		$('#channelGrid').hide();
		$('#messageGrid').show();
		$('#welcomeChannel').append('<h3>Welcome to channel ' + data.channel + '</h3>');
	})

	//viesti chattiin buttonilla 	
	var myBtn = document.getElementById('myButton'); 
	if (myBtn) {	
		myBtn.addEventListener('click', function(event) { 		
		temp = document.getElementById("message1").value; 		
		socket.emit('send_msg', temp);		
		$('#message1').val(""); 	
	}); 	 	}

	//viesti chattiin enterillä 	
	$("#message1").keypress(function(event){ 	
		if(event.keyCode == 13) {		
			event.preventDefault(); 			
			temp = document.getElementById("message1").value; 			
			socket.emit('send_msg', temp);		
			$('#message1').val(""); 	
		}
	});

	$("#leaveButton").click(function(event){
		socket.emit('leave_channel');
		$('#channelGrid').show();
		$('#messageGrid').hide();
		$('#welcomeChannel').empty();
		$('#channel').empty();
	})

	/*socket.on('leaving_channel'), function() {
		console.log("join.js leaving channel")
		$('#channelGrid').show();
		$('#messageGrid').hide();
	}*/

	socket.on('msg_to_chat', function(data) {
		console.log("data: " + data.msg)
		console.log("nick: " + data.nick)

		var time = getTime();

		$('#channel').append('[' + time + '] <b>' + data.nick + '</b> : ' + data.msg + '<br>');
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


