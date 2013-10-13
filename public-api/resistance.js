

	var Class 		= require( "ee-class" )
		, log 		= require( "ee-log" )
		, Waiter 	= require( "ee-waiter" );



	module.exports = new Class( {


		init: function( options ){
			this.schema 			= options.schema;
			this.languages 			= options.languages;
			this.reverseLanguages 	= options.reverseLanguages;
		}
		

		, get: function( request, response, next ){


		}
	} );