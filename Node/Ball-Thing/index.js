var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var codes = [];

app.get('/', function (req, res) {
	res.sendFile(__dirname+"/index.html");
});

app.get('/css/:file', (req, res) => {
	res.sendFile(__dirname+"/res/"+req.params.file);
});

app.get('/js/:file', (req, res) => {
	res.sendFile(__dirname+"/res/"+req.params.file);
});

io.on('connection', function(socket){
	console.log('a user connected');

	socket.on("tilt", function(gamma, beta, alpha){
		io.to(socket.code).emit("tilt", gamma, beta, alpha);
	});

	socket.on("new", function(){

		var time = new Date().valueOf();
		var code = time.toString(36).toLowerCase();

		socket.join(code);
		codes.push(code);
		socket.code = code;
		io.to(code).emit("joined", "desktop", code);
	});

	socket.on("join", function(code){
		if(codes.indexOf(code.toLowerCase()) > -1){
			socket.join(code.toLowerCase());
			socket.code = code.toLowerCase();
			io.to(code.toLowerCase()).emit("joined", "mobile", code);
		}else{
			socket.emit("err", "Invalid code");
		}
	});

	socket.on("disconnect", function(){
		console.log(socket.code);
		if(socket.code != undefined){
			io.to(socket.code).emit("disconnect");
		}
	});
	

});

http.listen(3000, function () {
	console.log('Example app listening on port 3000!');
});
