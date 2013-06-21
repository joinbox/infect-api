


	var   Application 	= require( "./app" )
		, log 			= require( "ee-log" );


	// print logo
	[ "","","","                                  __        _____              __   ","                                 |__| _____/ ____\\____   _____/  |_ ","                                 |  |/    \\   __\\/ __ \\_/ ___\\   __\\ ","                                 |  |   |  \\  | \\  ___/\\  \\___|  |  ","                                 |__|___|  /__|  \\___  >\\___  >__|  ","                                         \\/          \\/     \\/     ","", "","",].forEach( function( line ){
		console.log( line.red.bold );
	} );


	// start application
	var app = new Application();