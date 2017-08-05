
var socket = io();

$(function () {
	$('#messageInput').submit(function(){
		socket.emit('chat message', {
			"message" : $('#m').val(),
			"nickname" : $('#l').val()
		});
		$('#m').val('');
		return false;
	});

	socket.on('chat message', function(msg){
		$('#messages').append($('<li>').text(msg.nickname + ' : '+ msg.message));
		$("html, body").animate({ scrollTop: $(document).height() }, 100);
	});

	socket.on('receive messages', function(msg) {
		var count = 0;
//		console.log(msg); // log received message
		if(msg!=null){
			while(msg[count]){
				$('#messages').append($('<li>').text(msg[count].nickname + ' : '+ msg[count].text));
				count++;
			}
		}

			$("html, body").animate({ scrollTop: $(document).height() }, 100);
		});
	
	///init
	socket.emit('get messages', {});


});




