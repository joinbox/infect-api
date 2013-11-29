

	var Class 		= require( "ee-class" )
		, log 		= require( "ee-log" )
		, Waiter 	= require( "ee-waiter" );



	module.exports = new Class( {


		init: function( options ){
			this.schema 			= options.schema;
			this.languages 			= options.languages;
			this.reverseLanguages 	= options.reverseLanguages;
			this.sqlfiles 			= options.sqlfiles;
		}


		, get: function( request, response, next ){

			var   collector 			= new Waiter()
				, data 					= {}
				, substanceClassTree 	= {};


			// get bacteria <> compound mapping
			collector.add( function( cb ){
				this.schema.bacteria_compound.fetchAll( function( err, mappings ){
					if ( err ) cb( err );
					else {
						mappings.forEach( function( mapping ){
							if ( !data[ mapping.id_bacteria ] ) data[ mapping.id_bacteria ] = {};
							if ( !data[ mapping.id_bacteria ][ mapping.id_compound ] ) data[ mapping.id_bacteria ][ mapping.id_compound ] = {};
							data[ mapping.id_bacteria ][ mapping.id_compound ].id_bacteria 			= mapping.id_bacteria;
							data[ mapping.id_bacteria ][ mapping.id_compound ].id_compound 			= mapping.id_compound;
							data[ mapping.id_bacteria ][ mapping.id_compound ].resistanceDefault 	= mapping.resistanceDefault;
							data[ mapping.id_bacteria ][ mapping.id_compound ].resistanceUser 		= mapping.resistanceUser;
							data[ mapping.id_bacteria ][ mapping.id_compound ].resistanceImport 	= mapping.resistanceImport;
						}.bind( this ) );

						cb();
					}
				}.bind( this ) );
			}.bind( this ) );


			// get bacteria <> substanceClass mapping	
			collector.add( function( cb ){
				this.schema.query( this.sqlfiles[ "resistance_substanceClass.sql" ].data.toString(), function( err, mappings ){
					if ( err ) cb( err );
					else {
						mappings.forEach( function( mapping ){
							if ( !data[ mapping.id_bacteria ] ) data[ mapping.id_bacteria ] = {};
							if ( !data[ mapping.id_bacteria ][ mapping.id_compound ] ) data[ mapping.id_bacteria ][ mapping.id_compound ] = {};
							data[ mapping.id_bacteria ][ mapping.id_compound ].id_bacteria 				= mapping.id_bacteria;
							data[ mapping.id_bacteria ][ mapping.id_compound ].id_compound 				= mapping.id_compound;
							data[ mapping.id_bacteria ][ mapping.id_compound ].classResistanceDefault 	= mapping.resistanceDefault;
							data[ mapping.id_bacteria ][ mapping.id_compound ].classResistanceUser 		= mapping.resistanceUser;
							data[ mapping.id_bacteria ][ mapping.id_compound ].classResistanceImport 	= mapping.resistanceImport;
						}.bind( this ) );

						cb();
					}
				}.bind( this ) );
			}.bind( this ) );


			collector.start( function( err ){
				if ( err ) {
					response.render( 500 );
					log.trace( err );
				}
				else {
					var list = [];

					Object.keys( data ).forEach( function( bacteriaId ){
						Object.keys( data[ bacteriaId ] ).forEach( function( compoundId ){
							list.push( data[ bacteriaId ][ compoundId ] );
						}.bind( this ) );
					}.bind( this ) );
					
					// respond
					response.render( list );
				}
			}.bind( this ) );
		}
	} );