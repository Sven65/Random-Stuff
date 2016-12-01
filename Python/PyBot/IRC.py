# Copyright Max Thor <thormax5@gmail.com>
#
#   Licensed under the Apache License, Version 2.0 (the "License");
#   you may not use this file except in compliance with the License.
#   You may obtain a copy of the License at
#
#       http://www.apache.org/licenses/LICENSE-2.0
#
#   Unless required by applicable law or agreed to in writing, software
#   distributed under the License is distributed on an "AS IS" BASIS,
#   WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
#   See the License for the specific language governing permissions and
#   limitations under the License.

import sys, socket, string, json, linecache

cFile = open("config.json", "r")
config = json.loads(cFile.read())
cFile.close()

cmFile = open("commands.json", "r")
commands = json.loads(cmFile.read())
cmFile.close()

HOST = config['HOST']
PORT = config['PORT']
NICK = config['NICK']
IDENT = config['IDENT']
REALNAME = config['REALNAME']
MASTER = config['MASTER']
DEFAULTCHAN = config['DEFAULTCHAN']

readbuffer = ""

s=socket.socket( )
s.connect((HOST, PORT))

s.send(bytes("NICK %s\r\n" % NICK, "UTF-8"))
s.send(bytes("USER %s %s bla = %s\r\n" % (IDENT, HOST, REALNAME), "UTF-8"))
s.send(bytes("JOIN "+DEFAULTCHAN+"\r\n", "UTF-8"));


def PrintException():
    exc_type, exc_obj, tb = sys.exc_info()
    f = tb.tb_frame
    lineno = tb.tb_lineno
    filename = f.f_code.co_filename
    linecache.checkcache(filename)
    line = linecache.getline(filename, lineno, f.f_globals)
    return 'Exception {} in ({}, LINE {} ): {}'.format(exc_type, filename, lineno, exc_obj)


def send(to, message):
    try:
        s.send(bytes("PRIVMSG %s :%s\r\n" % (to, message), "UTF-8"))
    except:
        s.send(bytes("PRIVMSG %s :%s\r\n" % (to, "Unexpected error:", sys.exc_info()[0]), "UTF-8"))

while 1:
    readbuffer = readbuffer+s.recv(1024).decode("UTF-8")
    temp = str.split(readbuffer, "\n")
    readbuffer=temp.pop( )

    for line in temp:
        line = str.rstrip(line)
        line = str.split(line)

        if(line[0] == "PING"):
            s.send(bytes("PONG %s\r\n" % line[1], "UTF-8"))
        if(line[1] == "PRIVMSG"):
            sender = ""
            to = line[2]
            for char in line[0]:
                if(char == "!"):
                    break
                if(char != ":"):
                    sender += char 
            size = len(line)
            i = 3
            message = ""
            while(i < size): 
                message += line[i] + " "
                i = i + 1
            message.lstrip(":")
            if message == ":!die " and sender == MASTER:
            	sys.exit()
            elif message[0:7] == ":!join " and sender == MASTER:
            	lns = str.split(message)
            	s.send(bytes("JOIN %s\r\n" % (lns[1]), "UTF-8"))
            	print("Joined %s" % (lns[1]))
            elif message[0:7] == ":!part " and sender == MASTER:
            	lns = str.split(message)
            	s.send(bytes("PART %s\r\n" % (lns[1]), "UTF-8"))
            	print("Parted %s" % (lns[1]))
            elif message == ":!reload " and sender == MASTER:
                cmFile = open("commands.json", "r")
                commands = json.loads(cmFile.read())
                cmFile.close()

            if(str.split(message.replace(":", ""), " ")[0] in commands):
                #cm = message.replace(":", "")[0:len(message)-2]
                cm = str.split(message.replace(":", ""), " ")[0]
                args = str.split(message.replace(":", ""), " ")
                ul = commands[cm]['ul']
                typ = commands[cm]['type']

                if(ul == "MASTER"):
                    if(sender == MASTER):
                        if(typ == "say"):
                            try:
                                toS = commands[cm]['returns'].replace("{from}", sender).replace("{to}", to)
                                send(to, toS.replace("{black}", "\x031").replace("{blue}", "\x032").replace("{green}", "\x033").replace("{red}", "\x034").replace("{brown}", "\x035").replace("{purple}", "\x036").replace("{olive}", "\x037").replace("{yellow}", "\x038").replace("{lime}", "\x039").replace("{teal}","\x0310").replace("{aqua}","\x0311").replace("{rblue}","\x0312").replace("{pink}","\x0313").replace("{dgray}","\x0314").replace("{lgray}","\x0315").replace("{white}","\x0316").replace("{reset}", "\x00f").replace("{bold}","\x02").replace("{italic}", "\x09").replace("{strike}", "\x13").replace("{underline}", "\x15").replace("{reverse}", "\x16").format(*args))
                            except:
                                s.send(bytes("PRIVMSG %s :%s\r\n" % (to, PrintException()), "UTF-8"))
                        elif(typ == "nick"):
                            try:
                                s.send(bytes("NICK %s\r\n" % (commands[cm]['returns'].replace("{from}", sender).replace("{to}", to).format(*args)), "UTF-8"))
                            except:
                                s.send(bytes("PRIVMSG %s :%s\r\n" % (to, PrintException()), "UTF-8"))

                elif(ul == "USER"):
                    if(typ == "say"):
                            try:
                                toS = commands[cm]['returns'].replace("{from}", sender).replace("{to}", to)
                                send(to, toS.replace("{black}", "\x031").replace("{blue}", "\x032").replace("{green}", "\x033").replace("{red}", "\x034").replace("{brown}", "\x035").replace("{purple}", "\x036").replace("{olive}", "\x037").replace("{yellow}", "\x038").replace("{lime}", "\x039").replace("{teal}","\x0310").replace("{aqua}","\x0311").replace("{rblue}","\x0312").replace("{pink}","\x0313").replace("{dgray}","\x0314").replace("{lgray}","\x0315").replace("{white}","\x0316").replace("{reset}", "\x00f").replace("{bold}","\x02").replace("{italic}", "\x09").replace("{strike}", "\x13").replace("{underline}", "\x15").replace("{reverse}", "\x16").format(*args))
                            except:
                                s.send(bytes("PRIVMSG %s :%s\r\n" % (to, PrintException()), "UTF-8"))
                    elif(typ == "nick"):
                        try:
                            s.send(bytes("NICK %s\r\n" % (commands[cm]['returns'].replace("{from}", sender).replace("{to}", to).format(*args)), "UTF-8"))
                         except:
                            s.send(bytes("PRIVMSG %s :%s\r\n" % (to, PrintException()), "UTF-8"))


        print(" ".join(line))