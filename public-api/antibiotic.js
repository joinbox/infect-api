

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
			log(123);

			this.schema.compound.fetchAll( function( err, antis ){
				if ( err ) response.render( null, null, 500 );
				else if ( antis && antis.length === 0 ) response.render( [] );
				else {
					var   antibiotics 			= {}
						, waiter 				= new Waiter()
						, selectedLanguage 		= null
						, antibioticIds			= []
						, substanceClassTree 	= {}
						, substanceclassMapping = null;

					// query languages
					if ( this.languages[ request.language.toLowerCase() ] ) selectedLanguage = this.languages[ request.language.toLowerCase() ];
					else if ( selectedLanguage === null ) selectedLanguage = this.languages[ "en" ];

					// map antibiotics to object
					antis.forEach( function( a ){ 
						antibiotics[ a.id ] = a.toJSON();
						antibiotics[ a.id ].drugs = [];
						antibiotics[ a.id ].substanceClasses = [];						
						antibiotics[ a.id ].substances = [];

						antibioticIds.push( a.id ); 
					} );
					

					// get compund substanceClass mappings
					waiter.add( function( cb ){
						this.schema.query( this.sqlfiles[ "compound_substanceClass.sql" ].data.toString().replace( "%ids", antibioticIds.join( "," ) ), function( err, mappings ){
							if ( err ) cb( err );
							else {
								substanceclassMapping = mappings;
								cb();
							}
						}.bind( this ) );
					}.bind( this ) );


					// get substabce classes tree( nested set )
					waiter.add( function( cb ){
						this.schema.query( this.sqlfiles[ "substanceclass_subtree.sql" ].data.toString(), function( err, rows ){
							if ( err ) cb( err );
							else {
								rows.forEach( function( row ){
									if ( !substanceClassTree[ row.treeId ] ) substanceClassTree[ row.treeId ] = [];
									substanceClassTree[ row.treeId ].push( { id: row.id, name: row.name, originId: row.treeId, id_language: row.id_language, language: this.reverseLanguages[ row.id_language ] } );
								}.bind( this ) );

								cb();
							}
						}.bind( this ) );
					}.bind( this ) );



					// get substances
					waiter.add( function( cb ){
						this.schema.query( this.sqlfiles[ "substance.sql" ].data.toString().replace( "%ids", antibioticIds.join( "," ) ), function( err, rows ){
							if ( err ) cb( err );
							else {
								rows.forEach( function( row ){
									if ( !antibiotics[ row.id_compound ].substances ) antibiotics[ row.id_compound ].substances = [];
									antibiotics[ row.id_compound ].substances.push( { id: row.id, name: row.name, id_language: row.id_language, language: this.reverseLanguages[ row.id_language ] } );
									
									if ( row.id_language === selectedLanguage ) {
										if ( !antibiotics[ row.id_compound ].name ) antibiotics[ row.id_compound ].name = [];
										antibiotics[ row.id_compound ].name.push( row.name );
									}
								}.bind( this ) );

								cb();
							}
						}.bind( this ) );
					}.bind( this ) );


					// drugs
					waiter.add( function( cb ){
						this.schema.query( this.sqlfiles[ "drug.sql" ].data.toString().replace( "%ids", antibioticIds.join( "," ) ), function( err, rows ){
							if ( err ) cb( err );
							else {
								rows.forEach( function( row ){
									if ( !antibiotics[ row.id_compound ].drugs ) antibiotics[ row.id_compound ].drugs = [];
									antibiotics[ row.id_compound ].drugs.push( { id: row.id, name: row.name, id_country: row.id_country, id_language: row.id_language, language: this.reverseLanguages[ row.id_language ] } );
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
							// map substance classes to antibiotics
							substanceclassMapping.forEach( function( mapping ){
								if ( !antibiotics[ mapping.id_compound ].substanceClasses ) antibiotics[ mapping.id_compound ].substanceClasses = [];

								substanceClassTree[ mapping.id_substanceClass ].forEach( function( sc ){
									antibiotics[ mapping.id_compound ].substanceClasses.push( sc );
								}.bind( this ) );
							}.bind( this ) );


							// create array from object
							var   list 	= []
								, keys 	= Object.keys( antibiotics )
								, l 	= keys.length;

							while( l-- ) {;
								if ( antibiotics[ keys[ l ] ].name ) antibiotics[ keys[ l ] ].name = antibiotics[ keys[ l ] ].name.join( " / " );

								list.push( antibiotics[ keys[ l ] ] );
							}

							// respond
							response.render( list );
						}
					}.bind( this ) );					
				}
			}.bind( this ) );
		}
	} );