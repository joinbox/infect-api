

	var Class 		= require( "ee-class" )
		, log 		= require( "ee-log" )
		, Waiter 	= require( "ee-waiter" );



	module.exports = new Class( {


		init: function( options ){
			this.schema 			= options.schema;
			this.languages 			= options.languages;
			this.reverseLanguages 	= options.reverseLanguages;
		}





		, getSubstanceClasses: function( classTree, callback ){
			
		}



		, get: function( request, response, next ){

			this.schema.compound.fetchAll( function( err, antis ){
				if ( err ) response.render( null, null, 500 );
				else if ( antis && antis.length === 0 ) response.render( [] );
				else {
					var   antibiotics 	= {}
						, waiter 		= new Waiter()
						, languages 	= []
						, antibioticIds	= [];

					// query languages
					if ( this.languages[ request.language.toLowerCase() ] ) selectedLanguage = this.languages[ request.language.toLowerCase() ];
					else if ( selectedLanguage === null ) selectedLanguage = this.languages[ "en" ];

					// map antibiotics to object
					antis.forEach( function( a ){ antibiotics[ a.id ] = a.toJSON(), antibioticIds.push( a.id ); } );
	
/*
					// get compound locales
					waiter.add( function( cb ){
						this.schema.compoundLocale.find( {
							  id_language: { in: languages }
							, id_compound: { in: antibioticIds }
						}, function( err, locales ){
							if ( err ) cb ( err );
							else {
								locales.forEach( function( loc ){
									if ( !antibiotics[ loc.id_compound ].localeNames ) antibiotics[ loc.id_compound ].localeNames = [];
									antibiotics[ loc.id_compound ].localeNames.push( loc.name );
								} );

								cb();
							}
						}.bind( this ) );
					}.bind( this ) );
*/

					// substances
					waiter.add( function( cb ){
						var query = "SELECT s.*, sl0.name name0, sl1.name name1, cs.id_compound \
									 , GROUP_CONCAT( scl0.name ) cls0, GROUP_CONCAT( scl1.name ) cls1, GROUP_CONCAT( scl2.name ) cls2 \
									 , GROUP_CONCAT( scl3.name ) cls3, GROUP_CONCAT( scl4.name ) cls4, GROUP_CONCAT( scl5.name ) cls5 \
									 , GROUP_CONCAT( s0.id ) clsid0, GROUP_CONCAT( s1.id ) clsid1, GROUP_CONCAT( s2.id ) clsid2 \
									 , GROUP_CONCAT( s3.id ) clsid3, GROUP_CONCAT( s4.id ) clsid4, GROUP_CONCAT( s5.id ) clsid5 \
									 FROM substance s \
									 JOIN compound_substance cs ON cs.id_substance = s.id \
									 LEFT JOIN substanceLocale sl0 ON sl0.id_substance = s.id AND sl0.id_language = ? \
									 LEFT JOIN substanceLocale sl1 ON sl1.id_substance = s.id AND sl1.id_language = ? \
									 LEFT JOIN substance_substanceClass ss ON ss.id_substance = s.id \
									 LEFT JOIN substanceClass s0 ON s0.id = ss.id_substanceClass \
									 LEFT JOIN substanceClassLocale scl0 ON scl0.id_substanceClass = s0.id AND scl0.id_language IN ( {{lang}} ) \
									 LEFT JOIN substanceClass s1 ON s0.id_parent = s1.id \
									 LEFT JOIN substanceClassLocale scl1 ON scl1.id_substanceClass = s1.id AND scl1.id_language IN ( {{lang}} ) \
									 LEFT JOIN substanceClass s2 ON s1.id_parent = s2.id \
									 LEFT JOIN substanceClassLocale scl2 ON scl2.id_substanceClass = s2.id AND scl2.id_language IN ( {{lang}} ) \
									 LEFT JOIN substanceClass s3 ON s2.id_parent = s3.id \
									 LEFT JOIN substanceClassLocale scl3 ON scl3.id_substanceClass = s3.id AND scl3.id_language IN ( {{lang}} ) \
									 LEFT JOIN substanceClass s4 ON s3.id_parent = s4.id \
									 LEFT JOIN substanceClassLocale scl4 ON scl4.id_substanceClass = s4.id AND scl4.id_language IN ( {{lang}} ) \
									 LEFT JOIN substanceClass s5 ON s4.id_parent = s5.id \
									 LEFT JOIN substanceClassLocale scl5 ON scl5.id_substanceClass = s5.id AND scl5.id_language IN ( {{lang}} ) \
									 WHERE cs.id_compound in (?) \
									 GROUP BY s.id;".replace( /\{\{lang\}\}/gi, languages.join( "," ) );

						this.schema.query( query, [ languages[ 0 ], ( languages.length > 1 ? languages[ 1 ] : 0 ), antibioticIds.join( "," ) ], function( err, substances ){
							if ( err ) cb ( err );
							else {
								substances.forEach( function( sub ){
									if ( !antibiotics[ sub.id_compound ].substances ) {
										antibiotics[ sub.id_compound ].substances = [];
										antibiotics[ sub.id_compound ].substanceNames = [];
										antibiotics[ sub.id_compound ].classes = [];
									}
									if ( sub.name0 ) {
										antibiotics[ sub.id_compound ].substances.push( sub.name0 );
										antibiotics[ sub.id_compound ].substanceNames.push( sub.name0 );
									}
									if ( sub.name1 ) antibiotics[ sub.id_compound ].substances.push( sub.name1 );

									for ( var i = 0, l = 6; i < l; i++ ) {
										if ( sub[ "cls" + i ] ){
											var items = sub[ "cls" + i ].split( "," ).filter( function( el, index, arr ){ return arr.indexOf( el ) === index } );
											antibiotics[ sub.id_compound ].classes = antibiotics[ sub.id_compound ].classes.concat( items );
										}
									}
								} );


								cb();
							}
						}.bind( this ) );
					}.bind( this ) );


					// drugs
					waiter.add( function( cb ){
						cb();
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
								, keys 	= Object.keys( antibiotics )
								, l 	= keys.length;

							while( l-- ) {
								if( antibiotics[ keys[ l ] ].classes ) antibiotics[ keys[ l ] ].classes = antibiotics[ keys[ l ] ].classes.filter( function( cls ){ return !!cls; } );
								if ( antibiotics[ keys[ l ] ].substanceNames ) {
									antibiotics[ keys[ l ] ].name = antibiotics[ keys[ l ] ].substanceNames.join( " / " );
									delete antibiotics[ keys[ l ] ].substanceNames;
								}
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