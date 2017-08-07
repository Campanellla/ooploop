
var socket = io();

$(function () {
	$('#messageInput').submit(function(){
		if ($('#m').val()==='//logout') {
			logout();
		}else{
			socket.emit('chat message', {
				"message" : $('#m').val(),
				"nickname" : $('#l').val()
			});
		}
		$('#m').val('');
		return false;
	});

	$('#loginInput').submit(function(){
		socket.emit('login', {
			"login" : $('#loginLogin').val(),
			"pass"	: $('#loginPass').val()
		});
		setCookie('username', $('#loginLogin').val(), 1);
		setCookie('password', $('#loginPass').val(), 1);
		return false;
	})

	$('#regbutton').click(function() {
		socket.emit('register', {
			"login" : $('#loginLogin').val(),
			"pass"	: $('#loginPass').val()
		});
	})

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

	socket.on('loginCallback', function(msg){
		console.log(msg);
		if(msg==="OK. Logged in."){
			$('#loginBody').hide();
			$('#loginPass').val('');
			$('#chatBody').show();
		}
	})

	///init
	socket.emit('get messages', {});

	function setCookie(cname, cvalue, exdays) {
	    var d = new Date();
	    d.setTime(d.getTime() + (exdays*24*60*60*1000));
	    var expires = "expires="+ d.toUTCString();
	    document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
	}

	function getCookie(cname) {
	    var name = cname + "=";
	    var decodedCookie = decodeURIComponent(document.cookie);
	    var ca = decodedCookie.split(';');
	    for(var i = 0; i <ca.length; i++) {
	        var c = ca[i];
	        while (c.charAt(0) == ' ') {
	            c = c.substring(1);
	        }
	        if (c.indexOf(name) == 0) {
	            return c.substring(name.length, c.length);
	        }
	    }
	    return "";
	}

	function logout(){

		setCookie('username','',0);
		setCookie('password', '', 0);

		$('#loginBody').show();
		$('#chatBody').hide();

	}

	///init
	var username = getCookie("username");
	if (username != "") {
		socket.emit('login', {
			"login" : username,
			"pass"	: getCookie("password")
		});
	}
});




