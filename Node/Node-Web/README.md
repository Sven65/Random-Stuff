# Node-Web
A node.js webserver.

To use Node-Web, simply clone this repository, do

```npm
npm install
```
And then

```
node NWeb.js
```

# Config.json

To configure Node-Web, edit config.json.

| Option | Default value | Used for |
|--------|---------------|----------|
| port   | 80            | Setting the listening port|
|dirlist | true          | Wheter to list the files in the directory in case of a missing index page|
|restrict| ["NWeb.js", "package.json", "config.json"] | Files to restrict access to|
|server  | true          | Wheter to allow access to /server|
