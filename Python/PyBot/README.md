# PyBot
A python IRC bot

PyBot requires Python 3

# Commands reference

### Default commands

| Command | Returns | User level |
|---------|---------|------------|
|!die     | Program exit | MASTER|
|!join &lt;channel&gt; | Joins &lt;channel&gt;| MASTER|
|!part &lt;channel&gt; | Parts &lt;channel&gt;| MASTER|
|!reload  | Reloads commands.json | MASTER |

### Your own commands

#### To add your own commands, you need to understand [JSON](http://json.org)

##### For reference, the default ``commands.json`` is provided below.
```json
{
	"!pong": {
		"type": "say",
		"returns": "{from}: Ping",
		"ul": "USER"
	},
	"!help": {
		"type": "say",
		"returns": "Help!",
		"ul": "USER"
	},
	"!args": {
		"type": "say",
		"returns": "Args {1} {2}",
		"ul": "USER"
	}
}
```

To add the command, add it as so:

```json
"!command": {
	"type": "type",
	"returns": "Text",
	"ul": "USERLEVEl"
}
```

``"type"`` is the [type of the command](https://github.com/Sven65/PyBot/wiki/command_type)

``!command`` is the text you want to trigger the command on

``"returns"`` is the text you want to return when the command is triggered.

```"ul"`` is the userlevel. Valid userlevels are ``MASTER`` and ``USER``
 
#### In ``"returns"`` you can have these variables:

| Variable | Returns |
|----------|---------|
| {from}   | Who executed the command |
| {to}     | The channel the command was sent to |
| {1} to {&#8734;} | Argument {1} to {&#8734;} |
| {color} | Gives {color} text|
| {format}| Formats text as {format} |

Valid colors are:

* black
* blue
* green
* red
* brown
* purple
* olive
* yellow
* lime
* teal
* aqua
* rblue
* pink
* dgray
* lgray
* white

Valid formats are:

* bold
* reset
* italic
* strike
* underline
* reverse


#### TODO

* ~~Add command type.~~

* ~~Add more text formatting.~~
* ~~Add error handling.~~
* Add nickserv authentication
* Add functionality to execute python
