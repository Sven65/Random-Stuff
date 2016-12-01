/*
 Copyright Mackan <mackan@discorddungeons.me>

   Licensed under the Apache License, Version 2.0 (the "License");
   you may not use this file except in compliance with the License.
   You may obtain a copy of the License at

       http://www.apache.org/licenses/LICENSE-2.0

   Unless required by applicable law or agreed to in writing, software
   distributed under the License is distributed on an "AS IS" BASIS,
   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
   See the License for the specific language governing permissions and
   limitations under the License.
*/

var socket = io();
var name = "";
var cName = "";
var block = false;
var act = true;
var x = 0;
var connected = false;

function linkify(text) {  
        var urlRegex =/(\b(https?|ftp|file):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/ig;  
        return text.replace(urlRegex, function(url) {  
			return '<a href="' + url + '" target="_blank">' + url + '</a>';
	});  
}

function escap(text){
  return text.replace('<', '&lt;').replace('>', '&gt');
}

function sc(){
  document.getElementById('bottom').scrollIntoView();
}

function nMsg(){
  if(!act && connected){
    x++;
    $('title').html("("+x+") New Message(s)! - Mackan's chat");
  }
}

$('#nin').on('keydown', function(e){
	if(e.keyCode == 13){
		$('#connect').click();
	}
});

$('#pass').on('keydown', function(e){
  if(e.keyCode == 13){
    $('#connect').click();
  }
});

$('#m').on('keydown', function(e){
	if(e.keyCode == 13){
		$('#Send').click();
	}
  //return false;
});

$('#Send').on('click', function(){
	if($('#m').val().length > 0){
		if($('#m').val().substring(0,1) == "/"){
      socket.emit('command', cName, $('#m').val().substring(1));
      $('#m').val('');
      //return false;
    }else{
      socket.emit('chat message', cName+': '+$('#m').val(), cName);
      $('#m').val('');
      //return false;
    }
	}
});


// Register stuff

$('#Register').on('click', function(){
  var n = $('#nin').val();
  if(n.length < 1){
    $('#err').html("Your username can't be empty!");
    $('#err').css("display", "block");
    if($('#pass').val().length < 1){
       $('#err').html("Your password can't be empty!");
      $('#err').css("display", "block");
    }
  }else{
    if($('#pass').val().length < 1){
       $('#err').html("Your password can't be empty!");
      $('#err').css("display", "block");
    }else{
      socket.emit('register', n.replace(" ", "_"), SHA512($('#pass').val()));
    }
  }
});

socket.on('rErr', function(n){
    $('#err').html(n);
    $('#err').css("display", "block");
    return false;
});

socket.on('registered', function(n){
        if(!block){
      name = n;
      block = true;
    }
    $('#ni').css('display', 'none');
    $('#main').css('display', 'block');
    socket.emit('sInfo', cName+" connected.");
    sc();
    $('#m').focus();
    return false;
});

// END Register

socket.on('chat message', function(ms, data){
  var msg = "";
  if(data !== undefined){
    if(!data.esc){
      msg = linkify(ms);
    }else{
      msg = linkify(escap(ms));
    }
  }else{
    msg = linkify(escap(ms));
  }
	$('#messages').append($('<li>').html(msg));
  sc();
  nMsg();

  return false;
});

socket.on('err', function(msg){
  $('#messages').append($('<li style="color:red">').html(linkify(escap(msg))));
  sc();
  nMsg();

  return false;
})

socket.on('okM', function(msg){
  $('#messages').append($('<li style="color:lime">').html(linkify(escap(msg))));
  sc();
  nMsg();

  return false;
})

socket.on('cChat', function(color, msg){
  $('#messages').append($('<li style="color:'+color+'">').html(linkify(escap(msg))));
  sc();
  nMsg();

  return false;
})


socket.on('opM', function(msg){
  $('#messages').append($('<li class="op">').html(linkify(escap(msg))));
  sc();
  nMsg();

  return false;
})

socket.on('sInfo', function(msg){
	$('#messages').append($("<li class='sInfo'>").html(linkify(msg)));
  sc();
  nMsg();

  return false;
});

socket.on('pm', function(from, msg){
  $('#messages').append($("<li class='pm'>").html(from+" -> "+linkify(escap(msg))));
  sc();
  nMsg();

  return false;
});


socket.on('me', function(msg){
  $('#messages').append($("<li>").html(linkify(escap(msg))));
  nMsg();
  sc();
  return false;
});

$('#connect').on('click', function(){
	var n = $('#nin').val();
	if(n.length < 1){
		$('#err').html("Your username can't be empty!");
		$('#err').css("display", "block");
	}else{
    cName = n.replace(" ", "_");
    socket.emit('check', n.replace(" ", "_"), SHA512($('#pass').val()));
	}
});

socket.on('check1', function(n){
    if(!block){
      name = n;
      block = true;
    }
    if(n == cName){
      $('#ni').css('display', 'none');
      $('#main').css('display', 'block');
      socket.emit('sInfo', cName+" connected.");
      sc();
      $('#m').focus();
      connected = true;
    }
    return false;
});

socket.on('check2', function(n){
    $('#err').html("Wrong username or password!");
    $('#err').css("display", "block");
    return false;
});

socket.on('sPm', function(msg){
    $('#messages').append($("<li class='sPm'>").html(linkify(msg)));
    return false;
});

socket.on('fDisk', function(nam){
  if(nam == cName){
    socket.disconnect();
  }
});

socket.on('theme', function(th){
  switch(th.toLowerCase()){
    case "dark":
      $('#css').attr('href', 'css/dark.css');
      break;
    case "light":
      $('#css').attr('href', 'css/light.css');
      break;
    case "monokai":
      $('#css').attr('href', 'css/monokai.css');
      break;
  }
  return false;
});

socket.on("reward", function(name, reward){
  $('#messages').append($("<li class='reward'>").html(linkify(name+" was rewarded "+reward+" points!")));
});

socket.on("tip", function(from, to, amt){
  $('#messages').append($("<li class='reward'>").html(linkify(from+" tipped "+to+" "+amt+" points!")));
});



$(window).focus(function() {
    if(!act){
      act = true;
      $('title').html("Mackan's chat");

    }
});

$(window).blur(function() {
    act = false;
    x = 0;
});

$(document).ready(function(){
  window.onbeforeunload = function(e) {
    if(connected){
      socket.emit('disc', cName);
    }
  };
});