

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
			var query = "SELECT b.*, sp.name species, ge.name genus \
						 FROM bacteria b \
						 JOIN species sp ON sp.id = b.id_species \
						 JOIN genus ge ON sp.id_genus = ge.id";

			this.schema.query( query, function( err, bacts ){
				if ( err ) response.render( null, null, 500 );
				else if ( bacts && bacts.length === 0 ) response.render( [] );
				else {
					var   bacteria 			= {}
						, waiter 			= new Waiter()
						, selectedLanguage 	= null
						, bacteriaIds 		= [];

					// query languages
					if ( this.languages[ request.language.toLowerCase() ] ) selectedLanguage = this.languages[ request.language.toLowerCase() ];
					else if ( selectedLanguage === null ) selectedLanguage = this.languages[ "en" ];

					// map bacterias to object
					bacts.forEach( function( b ){
						bacteria[ b.id ] = b
						bacteria[ b.id ].selectedLanguageId = selectedLanguage;
						bacteria[ b.id ].selectedLanguage = this.reverseLanguages[ selectedLanguage ];
						bacteriaIds.push( b.id ); 
					}.bind( this ) );


					
					// get bacteria locales
					waiter.add( function( cb ){
						this.schema.bacteriaLocale.find( {
							  id_bacteria: { in: bacteriaIds }
						}, function( err, locales ){
							if ( err ) cb ( err );
							else {
								locales.forEach( function( loc ){
									if ( !bacteria[ loc.id_bacteria ].localeNames ) bacteria[ loc.id_bacteria ].localeNames = [];
									bacteria[ loc.id_bacteria ].localeNames.push( { name: loc.name, language: this.reverseLanguages[ loc.id_language ], id_language: loc.id_language } );
									if ( loc.id_language === selectedLanguage ) bacteria[ loc.id_bacteria ].localeName = loc.name;
								}.bind( this ) );

								cb();
							}
						}.bind( this ) );
					}.bind( this ) );


					waiter.add( function( cb ){
						this.schema.grouping.fetchAll( function( err, groupings ){
							if ( err ) cb ( err );
							else {
								bacts.forEach( function( bac ){
									groupings.forEach( function( group ){
										if ( bac.id_grouping === group.id ) {
											bacteria[ bac.id ].grouping = group.name;
										}										
									}.bind( this ) );

								}.bind( this ) );

								cb();
							}
						}.bind( this ) );
					}.bind( this ) );


					// grouping
					waiter.add( function( cb ){
						this.schema.groupingLocale.fetchAll( function( err, groupings ){
							if ( err ) cb ( err );
							else {
								bacts.forEach( function( bac ){
									if( !bacteria[ bac.id ].groupingLocales ) bacteria[ bac.id ].groupingLocales = [];

									groupings.forEach( function( group ){
										if ( bac.id_grouping === group.id_grouping ) {
											bacteria[ bac.id ].groupingLocales.push( { name: group.name, language: this.reverseLanguages[ group.id_language ], id_language: group.id_language } );
											if ( group.id_language === selectedLanguage ) bacteria[ bac.id ].groupingLocale = group.name;
										}										
									}.bind( this ) );

								}.bind( this ) );

								cb();
							}
						}.bind( this ) );
					}.bind( this ) );


					// shapes
					waiter.add( function( cb ){
						this.schema.shapeLocale.fetchAll( function( err, shapes ){
							if ( err ) cb ( err );
							else {
								bacts.forEach( function( bac ){
									if( !bacteria[ bac.id ].shapeLocales ) bacteria[ bac.id ].shapeLocales = [];

									shapes.forEach( function( shape ){
										if ( bac.id_shape === shape.id_shape ) {
											bacteria[ bac.id ].shapeLocales.push( { name: shape.name, language: this.reverseLanguages[ shape.id_language ], id_language: shape.id_language } );
											if ( shape.id_language === selectedLanguage ) bacteria[ bac.id ].shape = shape.name;
										}
									}.bind( this ) );

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

							// respond
							response.render( list );
						}
					}.bind( this ) );					
				}
			}.bind( this ) );
		}
	} );