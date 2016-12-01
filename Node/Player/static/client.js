var socket = io();
let f = true;

document.querySelector("#submit").addEventListener("click", (e) => {
	let text = document.querySelector("#url").value;
	if(text.length > 1){
		socket.emit("add", text, f);
		f = false;
	}
});

function setTitle(title){
	document.querySelector("title").innerHTML = title;
}

function getUrlFromBlob(data, name, type){
	return new Promise((resolve, reject) => {
		var blob = new Blob(data, {
			type: type
		});
		var url = window.URL.createObjectURL(blob);
		resolve(url);
	});
}

socket.on("addQ", (name, url, id) => {
	let x = document.createElement("div");
	x.id = id;
	let o = document.createElement("img");
	o.src = url;
	let title = document.createElement("span");
	title.innerHTML = name;
	x.appendChild(o);
	x.appendChild(title);
	document.querySelector(".queue").appendChild(x);
})

socket.on("removeQ", (id) => {
	document.getElementById(id).remove();
})

ss(socket).on('pushFile', function(stream, filename) {
	var fileBuffer = [];
	var fileLength = 0;
	stream.on('data', function (chunk) {
		fileLength += chunk.length;
		fileBuffer.push(chunk);
		document.querySelector("#status").innerHTML = "Loading..."
	});

	stream.on('end', function () {

		var filedata = new Uint8Array(fileLength),
		i = 0;

		//== Loop to fill the final array
		fileBuffer.forEach(function (buff) {
			for (var j = 0; j < buff.length; j++) {
				filedata[i] = buff[j];
				i++;
			}
		});
		//== Download file in browser
		getUrlFromBlob([filedata], filename, "audio/mpeg3").then((link) => {
			document.querySelector("#status").innerHTML = "Playing..."
			setTitle("Music Thing - Playing "+filename);
			var x = document.querySelector("audio");
			x.src = link;
			x.controls = true;
			x.play();
			x.addEventListener("ended", () => {
				setTitle("Music Thing");
				socket.emit("next");
			});
			//resolve(link);
		})

		//resolve();
	});
});
