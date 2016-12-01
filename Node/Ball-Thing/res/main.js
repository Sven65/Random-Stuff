var socket = io();

var isMobile = {
    Android: function() {
        return navigator.userAgent.match(/Android/i);
    },
    BlackBerry: function() {
        return navigator.userAgent.match(/BlackBerry/i);
    },
    iOS: function() {
        return navigator.userAgent.match(/iPhone|iPad|iPod/i);
    },
    Opera: function() {
        return navigator.userAgent.match(/Opera Mini/i);
    },
    Windows: function() {
        return navigator.userAgent.match(/IEMobile/i);
    },
    any: function() {
        return (isMobile.Android() || isMobile.BlackBerry() || isMobile.iOS() || isMobile.Opera() || isMobile.Windows());
    }
};


if(window.DeviceOrientationEvent){
	var disp = document.getElementById("display");
	disp.innerHTML = "DeviceOrientation";

	if(isMobile.any()){
		window.addEventListener('deviceorientation', function(eventData) {
			var gamma = eventData.gamma;
			var beta = eventData.beta;
			var alpha = eventData.alpha;

			socket.emit("tilt", gamma, beta, alpha);
			
		}, false);
		disp.style.display = "none";
		disp.innerHTML = "Mobile";

		document.getElementById("btn-link").addEventListener("click", function(e){
			var code = document.getElementById("code").value;
			if(code != ""){
				socket.emit("join", code);
			}
		});

	}else{

		document.getElementById("mobile").style.display = "none";

		socket.emit("new");
	}

	

	socket.on("tilt", function(gamma, beta, alpha){
		if(!isMobile.any()){
			var ball = document.getElementById("ball");
			document.getElementById("stats").style.display = "";
			document.getElementById("game").style.display = "";
			document.getElementById("gamma").innerHTML = Math.round(gamma);
			document.getElementById("alpha").innerHTML = Math.round(alpha);
			document.getElementById("beta").innerHTML = Math.round(beta);

			var left = Number(ball.style.left.replace("px", ""))+Math.round(beta);
			var top = Number(ball.style.top.replace("px", ""))+Math.round(gamma);
			var maxLeft = window.innerWidth;
			var maxTop = window.innerHeight;

			console.log("L:" +left);
			console.log("T: "+top);

			if(left < maxLeft && left > 0){
				ball.style.left = left+"px";
			}

			if(top < maxTop && top > 0){
				ball.style.top = top+"px";
			}

		}
	});

	socket.on("joined", function(client, code){
		if(client == "desktop"){
			disp.innerHTML = "Waiting for controller.<br>"+code;
		}else if(client == "mobile"){
			disp.innerHTML = "Connected";
			if(isMobile.any()){
				document.getElementById("mobile").style.display = "none";
				disp.style.display = "";
				disp.innerHTML = "Connected.";
			}
		}
	});

	socket.on("err", function(e){
		alert(e);
	});

	socket.on("disconnect", function(){
		disp.innerHTML = "Connection lost.";
	})



}else{
	document.getElementById("doTiltLR").innerHTML = "Not supported.";
}
