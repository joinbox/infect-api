	
	var   fs 	= require( "fs" )
		, isDir = fs.existsSync( process.argv[ 1 ] ) && fs.statSync( process.argv[ 1 ] ).isDirectory()
		, path 	= ( isDir ? process.argv[ 1 ] : process.argv[ 1 ].substr( 0, process.argv[ 1 ].lastIndexOf( "/" ) ) ) + "/";


	module.exports = {
		  root: 		path
		, config: 		fs.existsSync( path + "config.js" ) ? require( path + "config.js" ) : {}
	};