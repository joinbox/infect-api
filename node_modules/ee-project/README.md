# ee-project

determines the projects root path, loads a config.js if present, exports them

## installation

	npm install ee-project

## usage

	var project = require( "ee-project" );

	console.log( project.root ); // prints the path to the folder of the invoked script
	console.dir( project.config ); // prints the exported contents of the config.js file, if present )