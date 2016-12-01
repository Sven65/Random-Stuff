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

var port = 8012;

var app = require('express')(),
	http = require('http').Server(app),
	io = require('socket.io')(http),
	sys = require('sys'),
	fs = require('fs'),
	sha512 = require('js-sha512');

// Database stuff

function getUser(name,callback){
	fs.exists('./users/'+name+".json", function(ex){
		console.log("ex: "+ex);
		if(ex){
			fs.readFile('./users/'+name+".json", "utf8", function (err, data){
				if(err) {
		        	return callback(err);
		        }
				//console.log("GU: " + data);
				return callback(data);
			});
		}else{
			return callback("err1");
		}
	});
}

var connected = [],
	clients = [],
	muted = [],
	ops = [];

function lo(msg){
	var currentdate = new Date(); 
	var datetime = currentdate.getDate() + "/"+ (currentdate.getMonth()+1)  + "/" + currentdate.getFullYear() + " @ "  + currentdate.getHours() + ":"  + currentdate.getMinutes() + ":" + currentdate.getSeconds();
	fs.appendFile('log.txt', datetime+" -> "+msg+"\n", function(err){
		if (err) throw err;
	});
	console.log(datetime+" -> "+msg+"\n");
}

app.get('/', function(req, res){
  res.sendFile(__dirname+'/index.html');
});

app.get('/js/:file', function(req, res){
	res.sendFile(__dirname+'/js/'+req.params.file);
});

app.get('/css/:file', function(req, res){
	res.sendFile(__dirname+'/css/'+req.params.file);
});

// Rewards

function checkReward(msg, name){
	if(msg.length > 20){
		var num = Math.floor(Math.random() * (10 - 1 + 1)) + 1;
		if(num > 6){
			var reward = Math.floor(Math.random() * (10 - 1 + 1)) + 1;
			io.emit("reward", name, reward);

			getUser(name, function(data){
				var d = JSON.parse(data);

				d.points += reward;

				fs.writeFile('./users/'+name+".json", JSON.stringify(d), function(err){
					if (err) return console.log(err);
				});
			});
		}
	}
}

function tip(from, to, amt){

	getUser(from, function(data){
		d1 = JSON.parse(data);
		getUser(to, function(data){
			d2 = JSON.parse(data);

			Number(d1.points) -= amt;
			Number(d2.points) += amt;

			fs.writeFile('./users/'+from+".json", JSON.stringify(d1), function(err){
				if (err) return console.log(err);
			});

			fs.writeFile('./users/'+to+".json", JSON.stringify(d2), function(err){
				if (err) return console.log(err);
			});
		});
	});

	

	
}

io.on('connection', function(socket){
	// Main logic
	console.log("A user connected");
	
	// Add conection to clients

	socket.on('disconnect', function(){
    	console.log('A user disconnected');
  	});

  	socket.on('chat message', function(msg, from){
  		if(ops.indexOf(from) > -1){
	    	io.emit('opM', msg);
  		}else{
  			if(muted.indexOf(from) > -1){
		  		io.sockets.connected[clients[connected.indexOf(from)]].emit('err', "Failed to send message! You're muted!");
	    	}else{
	    		getUser(from, function(data){
	    			try{
		    			var d = JSON.parse(data);
		    			if(d['color'].length > -1){
		    				io.emit('cChat', d['color'], msg);
		    			}else{
				    		lo(msg)
				    		io.emit('chat message', msg);
		    			}
		    		}catch(e){
		    			lo(msg)
				    	io.emit('chat message', msg);
		    		}
	    		});
	    		checkReward(msg, from);
	    	}
  		}
  	});

  	socket.on('sInfo', function(msg){
    	lo('sInfo: '+msg)
    	io.emit('sInfo', msg);
  	});

  	// Username check

  	socket.on('check', function(name, pass){
    	lo("Checking for name "+name);

    	getUser(name ,function(data){
   			if(data == "err1"){
   				io.emit('check2', name);
   			}else{
   				if(pass == JSON.parse(data)["pass"]){
	   				io.emit('check1', name);
		    		lo(name+" connected");
		    		connected.push(name);
		    		clients.push(socket.id);
	   			}else{
	   				io.emit('check2', name);
	    			lo(name+" already in use");
	   			}
   			 }
  		});
    });

  	// Register

  	socket.on('register', function(name, pass){
  		lo("Checking for name "+name);

    	fs.exists('./users/'+name+".json", function(ex){
			if(ex){
				io.emit("rErr", "User exists!");
			}else{
				fs.writeFile('./users/'+name+".json", '{"pass":"'+pass+'","points":0,"color":"white"}', function(err){
					if (err) return console.log(err);
					console.log(name+" registered");
					lo(name+" registered");
					io.emit('registered', name);
				});
			}
		});
  	});

  	socket.on('command', function(from, msg){
  		var c = msg.split(' '),
  			command = c[0],
  			args = c.slice(1);

	  		lo(from+" used the "+command+" command with args"+args);


  		//if(connected.indexOf(from) > -1) {

  			switch(command){
	  			case "help":
	  				//io.clients[connected.indexOf(from)].emit('sPm', 'Available commands are: \n/help, /me');
	  				//io.emit('sPm', 'Available commands are: \n/help, /me');
	  				if(args.length > 0){
	  					if(args[0] == "theme"){
	  						io.sockets.connected[clients[connected.indexOf(from)]].emit('sPm','Available themes are: Dark, Light, Monokai');
	  					}
	  				}else{
	  					if(ops.indexOf(from) > -1){
	  						var toSend = 'Available commands are: \n/help, /me, /theme, /pm, /oper, /mute, /unmute';
	  					}else{
	  						var toSend = 'Available commands are: \n/help, /me, /theme, /pm';
	  					}
	  					io.sockets.connected[clients[connected.indexOf(from)]].emit('sPm', toSend);
	  				}
	  				break;
	  			case "me":
	  				io.emit('chat message', "* "+from+" "+args.join(" "));
	  				break;
	  			case "color":
	  				var isOk  = /(^#[0-9A-F]{6}$)|(^#[0-9A-F]{3}$)/i.test(args[0]);
	  				if(isOk){
	  					io.emit('chat message', from+": <span style='color:"+args[0]+"'>"+args.slice(1).join(" ")+"</span>", {esc: false});
	  					lo("["+args[0]+"]"+from+": "+args.slice(1).join(" "));
	  				}else{
	  					if(args[0].substring(0,1) == "#"){
	  						io.emit('chat message', from+": "+args.slice(1).join(" "));
	  						lo(from+": "+args.slice(1).join(" "));
	  					}else{
	  						io.emit('chat message', from+": "+args.join(" "));
	  						lo(from+": "+args.join(" "));
	  					}
	  					
	  				}
	  				break;
	  			case "theme":
	  				if(args[0].length > 0){
	  					io.sockets.connected[clients[connected.indexOf(from)]].emit('theme', args[0]);
	  				}else{
	  					io.sockets.connected[clients[connected.indexOf(from)]].emit('sPm','Syntax: /theme <theme> Available themes are: Dark, Light, Monokai');
	  				}
	  				break;
	  			case "connected":
	  				io.sockets.connected[clients[connected.indexOf(from)]].emit('sPm', 'Connected users: '+connected.join(","));
	  				break;
	  			case "pm":
	  				if(connected.indexOf(args[0]) > -1){
	  					io.sockets.connected[clients[connected.indexOf(args[0])]].emit('pm', from, args.slice(1).join(" "));
	  					io.sockets.connected[clients[connected.indexOf(from)]].emit('sPm', from+" -> "+args[0]+": "+args.slice(1).join(" "));
	  				}else{
	  					io.sockets.connected[clients[connected.indexOf(from)]].emit('err', "Failed to message user "+args[0]+"! User is not online.");
	  				}
	  				break;
	  			case "oper":
	  				if(args[0] == 'nz8N_F@ntG5E__y1h64!yv_!ct4A!.r._2'){
	  					ops.push(from);
	  				}else{
	  					io.sockets.connected[clients[connected.indexOf(from)]].emit('err', "Failed to authenticate.");
	  				}
	  				break;
	  			case "mute":
	  				if(ops.indexOf(from) > -1){
	  					if(connected.indexOf(args[1]) > -1){
	  						io.sockets.connected[clients[connected.indexOf(from)]].emit('okM', "Muted "+args[1]);
				    		muted.push(args[1]);
				    	}else{
	  						io.sockets.connected[clients[connected.indexOf(from)]].emit('err', "Can't mute "+args[1]);
				    		
				    	}
	  				}
	  				break;
	  			case "unmute":
	  				if(ops.indexOf(from) > -1){
	  					if(connected.indexOf(args[1]) > -1){
	  						io.sockets.connected[clients[connected.indexOf(from)]].emit('okM', "Unmuted "+args[1]);
				    		muted.splice(args[1], 1);
				    	}else{
	  						io.sockets.connected[clients[connected.indexOf(from)]].emit('err', "Can't unmute "+args[1]);
				    		
				    	}
	  				}
	  				break;
	  			case "tip":
	  				if(args.length >= 2){
	  					if(connected.indexOf(args[0]) > -1){
	  						getUser(from, function(data){
	  							if(Number(JSON.parse(data)['points']) >= Number(args[1])){
				    				if(Number(args[1]) > 0){
				    					tip(from, args[0], args[1]);
				    					io.emit("tip", from, args[0], Number(args[1]));
				    				}else{
				    					lo(from+" tried to tip "+args[0]+" "+args[1]+" points");
	  									io.sockets.connected[clients[connected.indexOf(from)]].emit('err', "You need to tip atleast 1 point.");
				    				}
				    			}else{
						    		lo(from+" tried to tip "+args[0]+" "+args[1]+" points, but they don't have enough points.");
	  								io.sockets.connected[clients[connected.indexOf(from)]].emit('err', "You don't have enough balance.");
				    			}
	  						});
	  					}else{
						   	lo(from+" tried to tip "+args[0]+" "+args[1]+" points, but "+args[0]+" is offline");
	  						io.sockets.connected[clients[connected.indexOf(from)]].emit('err', "Can't tip "+args[0]+". User is offline");
	  					}
	  				}else{
	  					io.sockets.connected[clients[connected.indexOf(from)]].emit('err', "Usage: /tip <user> <amount>");
	  				}
	  				break;
  			}
  		//}
  	});

  	socket.on('disc', function(name){
    	lo(name+" disconnected");
  		console.log(name+" disconnected");
  		clients.splice(connected.indexOf(name), 1);
  		ops.splice(connected.indexOf(name), 1);
  		connected.splice(connected.indexOf(name), 1);
  		io.emit('sInfo', name+" disconnected");
  	});

});

http.listen(port, function(){
  lo("Listening on *:"+port);
  console.log('listening on *:'+port);
});

// Listen for console

var stdin = process.openStdin();

stdin.addListener("data", function(d) {
    var inp = d.toString().substring(0, d.length-1);
    args = inp.split(' ');
    if(args[0] == "b"){
    	io.emit('sInfo', 'BROADCAST: '+args.slice(1).join(" "));
    }else if(args[0] == 'check'){
    	console.log(connected[0]);
    }else if(args[0] == 'kick'){
    	console.log('Kicking '+args[1]);
    	io.emit('fDisk', args[1].toString());
    }else if(args[0] == 'e'){
    	eval(args.slice(1).join(" "));
    }else if(args[0] == 'mute'){
    	if(connected.indexOf(args[1]) > -1){
    		console.log("Muted "+args[1]);
    		muted.push(args[1]);
    	}else{
    		console.log("Can't mute "+args[1]);
    	}
    }else if(args[0] == 'unmute'){
    	if(muted.indexOf(args[1]) > -1){
    		console.log("Unmuted "+args[1]);
    		muted.splice(args[1], 1);
    	}else{
    		console.log("Can't unmute "+args[1]);
    	}
    }
});

process.on('uncaughtException', function(err){
  console.log('Caught exception: ' + err);
});
