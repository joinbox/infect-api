

	var Class 		= require( "ee-class" )
		, log 		= require( "ee-log" )
		, Waiter 	= require( "ee-waiter" );



	module.exports = new Class( {


		init: function( options ){
			this.schema 		= options.schema;
			this.languages 		= options.languages;

			//log.dir( options.languages );
		}





		, get: function( request, response, next ){
			var query = "SELECT b.*, sp.name species, ge.name genus \
						 FROM bacteria b \
						 JOIN species sp ON sp.id = b.id_species \
						 JOIN genus ge ON sp.id_genus = ge.id";

			this.schema.query( query, function( err, bacts ){
				if ( err ) response.render( null, null, 500 );
				else if ( bacts && bacts.length === 0 ) response.render( [] );
				else {
					var   bacteria 		= {}
						, waiter 		= new Waiter()
						, languages 	= []
						, bacteriaIds 	= [];

					// query languages
					if ( this.languages[ request.language ] ) languages.push( this.languages[ request.language ] );
					if ( request.language !== "en" && this.languages[ "en" ] ) languages.push( this.languages[ "en" ] );

					// map bacterias to object
					bacts.forEach( function( b ){ bacteria[ b.id ] = b, bacteriaIds.push( b.id ); } );


					
					// get bacteria locales
					waiter.add( function( cb ){
						this.schema.bacteriaLocale.find( {
							  id_language: { in: languages }
							, id_bacteria: { in: bacteriaIds }
						}, function( err, locales ){
							if ( err ) cb ( err );
							else {
								locales.forEach( function( loc ){
									if ( !bacteria[ loc.id_bacteria ].localeNames ) bacteria[ loc.id_bacteria ].localeNames = [];
									bacteria[ loc.id_bacteria ].localeNames.push( loc.name );
								} );

								cb();
							}
						}.bind( this ) );
					}.bind( this ) );


					// grouping
					waiter.add( function( cb ){
						this.schema.groupingLocale.find( {
							  id_language: { in: languages }
						}, function( err, groupings ){
							if ( err ) cb ( err );
							else {
								bacts.forEach( function( bac ){
									if( !bacteria[ bac.id ].grouping ) bacteria[ bac.id ].grouping = [];

									groupings.forEach( function( group ){
										if ( bac.id_grouping === group.id_grouping )  bacteria[ bac.id ].grouping.push( group.name );
									} );

								}.bind( this ) );

								cb();
							}
						}.bind( this ) );
					}.bind( this ) );


					// shapes
					waiter.add( function( cb ){
						this.schema.shapeLocale.find( {
							  id_language: { in: languages }
						}, function( err, shapes ){
							if ( err ) cb ( err );
							else {
								bacts.forEach( function( bac ){
									if( !bacteria[ bac.id ].shape ) bacteria[ bac.id ].shape = [];

									shapes.forEach( function( shape ){
										if ( bac.id_shape === shape.id_shape )  bacteria[ bac.id ].shape.push( shape.name );
									} );

								}.bind( this ) );

								cb();
							}
						}.bind( this ) );
					}.bind( this ) );

					// start async processing
					waiter.start( function( err ){
						if ( err ) {
							response.render( null, null, 500 );
							log.trace( err );
						}
						else {
							// create array from object
							var   list 	= []
								, keys 	= Object.keys( bacteria )
								, l 	= keys.length;

							while( l-- ) list.push( bacteria[ keys[ l ] ] );

							log( list );

							// respond
							response.render( list );
						}
					}.bind( this ) );					
				}
			}.bind( this ) );
		}
	} );