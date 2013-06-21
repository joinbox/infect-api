

	var Class = require( "ee-class" );



	module.exports = new Class( {


		init: function( options ){
			this.schema = options.schema;
		}





		, get: function( request, response, next ){

			this.schema.bacteria.fetchAll( function( err, bacteria ){
				if ( err ) response.render( null, null, 500 );
				else {
					response.render( bacteria );
				}
			}.bind( this ) );
		}
	} );