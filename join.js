$( document ).ready();

var channels = ['channel1', 'channel2', 'channel3', 'channel4', 'channel5'];
var temp = '';

for (var i = 0 ; i < channels.length ; i++){
	temp = '';
	temp = '<option value="' + channels[i] + '">' + channels[i] + '</option>';
	console.log(temp);
	$('#items').append($(temp));
}

/*function press_button() {
	var input = document.getElementById('search');

	//console.log(input);

	input.addEventListener("click", function(event) {
		event.preventDefault();
		show_rates(document.getElementById('date').value);
	});

}

function show_rates(text)
{
	$("#currencies").html('');
	//console.log('menee show_rates');
	var url = "http://api.fixer.io/" + text + "?callback=?" ;
	//console.log(url);

	$.getJSON( url, {
    	tags: text,
    	tagmode: "any",
    	format: "json"
  	}).done(function callback(data) {
		console.log("remarks", data);
	  	//console.log("doneen", data);
	  	var table_row = "";
	  	$.each(data.rates, function(key, item) {
	  		//console.log(key, item);
	  		table_row = "<tr><td>" + key + "</td><td>" + item + "</td></tr>";
	  		$("#currencies").append(table_row);
	  	})
	})
}*/


