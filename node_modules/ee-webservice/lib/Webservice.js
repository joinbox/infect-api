


	var   Class 	= require( "ee-class" )
		, Events 	= require( "ee-event" )
		, log 		= require( "ee-log" )
		, Webserver = require( "ee-webserver" );




	module.exports = new Class( {
		inherits: Events

		, "static Webserver": Webserver


		, middleware: []


		, init: function( options ){
			this.webserver = new Webserver( options );
			this.webserver.on( "request", this.handleRequest.bind( this ) );
		}


		, handleRequest: function( request, response ){
			this.nextRequest( request, response );
		}


		, nextRequest: function( request, response ){
			var   index = 0
				, next = function( err ){
					if ( this.middleware.length > index ) {
						index++;
						this.middleware[ index - 1 ].request( request, response, next, this.middleware.length === index );
					}
					else response.send();					
				}.bind( this );

			next();
		}


		, listen: function( callback ){
			this.webserver.listen( function(){
				this.emit( "listening" );
				if ( typeof callback === "function" ) callback();
			}.bind( this ) );
		}



		, use: function( middleware ){
			this.middleware.push( middleware );
		}
	} );