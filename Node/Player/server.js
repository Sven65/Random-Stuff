let app = require('http').createServer(handler)
let io = require('socket.io')(app);
let ss = require('socket.io-stream');
const fs = require('fs');
const ytdl = require("ytdl-core");

app.listen(8080);

let q = [];
let first = true;

function handler (req, res) {

	if(req.url !== "/"){

		fs.readFile(__dirname+'/static'+req.url, function (err, data) {
			if (err) {
				res.writeHead(500);
				return res.end('Error loading file');
			}

			res.writeHead(200);
			res.end(data);
		});
	}else{
		fs.readFile(__dirname+'/static/index.html', function (err, data) {
			if (err) {
				res.writeHead(500);
				return res.end('Error loading file');
			}

			res.writeHead(200);
			res.end(data);
		});
	}
}

io.on('connection', function (socket) {
	socket.on("getFile", (link) => {
		let stream = ss.createStream();

		ytdl.getInfo(link, (err, info) => {
			if(err){ return;}
			ss(socket).emit('pushFile', stream, info.title);
			ytdl(link, {
				format: "mp3"
			}).pipe(stream);
		});
	});

	socket.on("next", (link) => {
		q.splice(0, 1);

		let stream = ss.createStream();

		ytdl.getInfo(q[0], (err, info) => {
			if(err){ return;}
			socket.emit("removeQ", info.video_id);
			ss(socket).emit('pushFile', stream, info.title);
			ytdl(q[0], {
				format: "mp3"
			}).pipe(stream);
		});
	});

	socket.on("add", (link, play) => {
		q.push(link);
		ytdl.getInfo(link, (err, info) => {
			if(err){ return;}
			if(play){
				let stream = ss.createStream();
				ss(socket).emit('pushFile', stream, info.title);
				ytdl(link, {
					format: "mp3"
				}).pipe(stream);
			}else{
				socket.emit("addQ", info.title, info.thumbnail_url, info.video_id);
			}
		})
	});
});
