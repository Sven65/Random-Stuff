/*

Copyright Max Thor <thormax5@gmail.com> Licensed under the Apache License, Version 2.0 (the "License"); you may not use this file except in compliance with the License. You may obtain a copy of the License at http://www.apache.org/licenses/LICENSE-2.0 Unless required by applicable law or agreed to in writing, software distributed under the License is distributed on an "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the License for the specific language governing permissions and limitations under the License.

*/

var fs = require('fs');
var express = require("express");
var server = express();
var colors = require('colors');
var bytes = require("bytes");
var port = 3000;
var dirList = true;
var restrict = ["NWeb.js"];
var cfg = false;
var servI = true;

// config

function config(){
  fs.exists("./config.json", function(exists){
    if(exists){
       fs.readFile("./config.json", "utf-8", function(err, data){
         if(err) throw err;
         var d = JSON.parse(data);
         port = d["port"];
         dirList = d["dirlist"];
         restrict = d['restrict'];
         servI = d["server"];
         cfg = true;
         console.log("config done");
       });
    }else{
      console.log("Configuration file is missing!");
      process.exit();
    }
  });
}

function fTime(seconds) {
    var sec_num = parseInt(seconds, 10); // don't forget the second param
    var hours   = Math.floor(sec_num / 3600);
    var minutes = Math.floor((sec_num - (hours * 3600)) / 60);
    var seconds = sec_num - (hours * 3600) - (minutes * 60);

    if (hours   < 10) {hours   = "0"+hours;}
    if (minutes < 10) {minutes = "0"+minutes;}
    if (seconds < 10) {seconds = "0"+seconds;}
    var time    = hours+':'+minutes+':'+seconds;
    return time;
}

server.get("/", function(req, res){
  fs.exists("index.html", function(exists){
    if(exists){
      res.sendFile(__dirname+"/index.html");
    }else{
      if(dirList){
          var m = "";
          fs.readdir("./", function(err, files){
            if(err) res.send(err);
            for(var x=0;x<files.length;x++){
                m += "<a href='./"+files[x]+"'>"+files[x]+"</a><br>";
            }
            res.send(m);
          });
      }else{
        res.send("Hello, World!");
      }
    }
  });
});

server.get("/server?/", function(req, res){
  if(servI){
    res.send("<a href='./info'>Info</a><br><a href='./uptime'>Uptime</a><br><a href='./disk'>Disk Info</a><br>");
  }
});

server.get("/:file", function(req, res){
  var f = req.params.file;
  if(restrict.indexOf(f) > -1){
    res.send("You don't have permission to view this file.");
  }else{
    res.sendFile(__dirname+"/"+f);
  }
});

server.get("/server/:file", function(req, res){
  if(servI){
    switch(req.params.file){
      case "info":
        var os = require("os");
        var m = "";
        m += "Hostname: "+os.hostname()+"<br>Type: "+os.type()+"<br>Platform: "+os.platform()+"<br>CPU Architecture: "+os.arch()+"<br>OS Release: "+os.release()+"<br>Uptime: "+fTime(os.uptime())+"<br>Total RAM: "+bytes(os.totalmem(), {thousandsSeparator: ' '})+"<br>Free RAM: "+bytes(os.freemem(), {thousandsSeparator: ' '});
        res.send(m);
      break;
      case "uptime":
        res.send(fTime(require("os").uptime()));
      break;
      case "disk":
        var diskspace = require('diskspace');
        diskspace.check('C', function (err, total, free, status) {
          if(err) res.send(err);
          var m = "You have "+bytes(Number(free), {thousandsSeparator: ' '})+" left of "+bytes(Number(total), {thousandsSeparator: ' '});
          res.send(m);
        });
      break;
    }
  }
});

config();

function listn(){
  if(cfg){
    if(port !== undefined){
      server.listen(port);
      console.log(colors.green("Listening at port "+port));

    }else{
      config();
    }
  }else{
    setTimeout(listn, 1000);
  }
}

listn();
process.on('uncaughtException', function(err){
    console.error(err.stack);
    console.log("Node NOT Exiting.");
});

