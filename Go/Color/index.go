package main

var site string = `<!DOCTYPE html>
<html lang="en">
	<head>
		<meta charset="utf-8">
    	<meta http-equiv="X-UA-Compatible" content="IE=edge">
    	<meta name="viewport" content="width=device-width, initial-scale=1">
    	<meta name="author" content="Mackan">

		<meta content="Showing color {{.Color}}" property="og:description">
    	<meta content="Color {{.Color}}" property="og:title">
    	<meta content="" property="og:url">
		<meta content="Color" property="og:site_name">

		<meta name="description" content="Showing color {{.Color}}">
		<meta name="title" content="Color {{.Color}}">

		<title>{{.Color}}</title>
		<style>
			@import url(https://fonts.googleapis.com/css?family=Open+Sans:300);
			body, html{
				margin: 0;
				height: 100%;
				width: 100%;
				padding: 0;
				background-color: {{.Color}};
				color: {{.FCol}};
			}
			#main{
				height: 25vh;
			    margin: auto;
				position: absolute;
				text-align: center;
				top: 0; left: 0; bottom: 0; right: 0;
				font-family: 'Open Sans', sans-serif;
				-webkit-font-smoothing: antialiased;
				-moz-osx-font-smoothing: grayscale;
			}

		</style>
	</head>
	<body>
		<div id="main">
			<h1>{{.Color}}</h1>
		</div>
	</body>
</html>`