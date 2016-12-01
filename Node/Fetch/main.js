var fs = require('fs'),
    request = require('request');
    var path = require('path');
	var programName = path.basename(process.argv[1]);

var i = 0;
var dir = "./dl";

var download = function(uri, filename, callback){
  request.head(uri, function(err, res, body){
  	if(!err && res !== undefined){
  		if(res.statusCode == 200){
    		request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
    	}else{
    		console.log("Got error whilst getting file "+filename.substring(filename.lastIndexOf('/')+1).replace(/^\s+|\s+$/gm,''));
			callback();
    	}
	}else{
		if(res !== undefined){
			console.log("Got error "+res.statusCode+" whilst getting file "+filename.substring(filename.lastIndexOf('/')+1).replace(/^\s+|\s+$/gm,''));
		}else{
    		console.log("Got error whilst getting file "+filename.substring(filename.lastIndexOf('/')+1).replace(/^\s+|\s+$/gm,''));
		}
		callback();
	}
  });
};

function dlHandle(){
	var filename = links[i].substring(links[i].lastIndexOf('/')+1).replace(/^\s+|\s+$/gm,'');
	fs.exists(__dirname+"/"+dir+"/"+filename, function(ex){
		if(ex){
			/*ext = filename.substring(filename.lastIndexOf(".")+1);
			filename += "_2."+ext;
			download(links[i], __dirname+"/dl/"+filename, function(){

				console.log("Saved: "+filename+" ("+(i+1)+" files/"+links.length+" files)");
				if(i<links.length-1){
					i++;
					dlHandle();
				}
		
			});*/
			i++;
			dlHandle();
		}else{
			download(links[i], __dirname+"/"+dir+"/"+filename, function(){

				console.log("Saved: "+filename+" ("+(i+1)+" files/"+links.length+" files)");
				if(i<links.length-1){
					i++;
					dlHandle();
				}
				
			});
		}

	});
	
}

if(process.argv.length >= 3){

	fs.exists("./"+process.argv[2], function(ex){
		if(ex){
			fs.readFile('./'+process.argv[2], 'utf8', function(err, data){
				if(err){ throw err; }
				links = data.split("\n");
				console.log("Getting "+links.length+" files");
				if(process.argv.length >= 4){
					dir = process.argv[3];
				}
				fs.exists(dir, function(ex){
					if(!ex){
						fs.mkdir(dir, function(err){
							if(err){ throw err; }
						});
					}
				});
					
				dlHandle();

			});
		}else{
			console.log("Invalid file");
		}
	});
}else{
	console.log("Usage: "+programName+" [links]");
}

process.on('uncaughtException', function(err){
  console.log("Caught exception: "+err.stack);
});
