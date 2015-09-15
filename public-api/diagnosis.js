

    var Class       = require( "ee-class" )
        , log       = require( "ee-log" )
        , Waiter    = require( "ee-waiter" );



    module.exports = new Class( {


        init: function( options ){
            this.schema             = options.schema;
            this.languages          = options.languages;
            this.reverseLanguages   = options.reverseLanguages;
            this.sqlfiles           = options.sqlfiles;
        }





        , get: function( request, response, next ){


            this.schema.diagnosis.fetchAll( function( err, diag ){
                if ( err ) response.render( null, null, 500 );
                else if ( diag && diag.length === 0 ) response.render( [] );
                else {
                    var   diagnosis             = {}
                        , waiter                = new Waiter()
                        , selectedLanguage      = null
                        , diagnosisIds          = [];

                    // query languages
                    if ( this.languages[ request.language.toLowerCase() ] ) selectedLanguage = this.languages[ request.language.toLowerCase() ];
                    else if ( selectedLanguage === null ) selectedLanguage = this.languages[ "en" ];

                    // map diagnosis to object
                    diag.forEach( function( a ){ 
                        diagnosis[ a.id ]                    = a.toJSON();
                        diagnosis[ a.id ].bacteria           = [];
                        diagnosis[ a.id ].selectedLanguageId = selectedLanguage;
                        diagnosis[ a.id ].selectedLanguage   = this.reverseLanguages[ selectedLanguage ];

                        diagnosisIds.push( a.id ); 
                    }.bind(this) );

                    // get diagnosis locales
                    waiter.add( function( cb ){
                        this.schema.diagnosisLocale.find( {
                              id_diagnosis: { in: diagnosisIds }
                        }, function( err, locales ){
                            if ( err ) cb ( err );
                            else {
                                locales.forEach( function( loc ){
                                    if ( !diagnosis[ loc.id_diagnosis ].locales ) diagnosis[ loc.id_diagnosis ].locales = [];
                                    diagnosis[ loc.id_diagnosis ].locales.push( { title: loc.title, language: this.reverseLanguages[ loc.id_language ], id_language: loc.id_language } );
                                    if ( loc.id_language === selectedLanguage ) diagnosis[ loc.id_diagnosis ].title = loc.title;
                                }.bind( this ) );

                                cb();
                            }
                        }.bind( this ) );
                    }.bind( this ) );
                    

                    // get diagnosis_bacteria mapping
                    waiter.add( function( cb ){
                        this.schema.query( this.sqlfiles[ "diagnosis_bacteria.sql" ].data.toString().replace( "%ids", diagnosisIds.join( "," ) ), function( err, mappings ){
                            if ( err ) cb( err );
                            else {
                                mappings.forEach(function(mapping) {
                                    if(diagnosis[mapping.id_diagnosis]) {
                                        if(diagnosis[mapping.id_diagnosis].bacteria.indexOf(mapping.id_bacteria) === -1) diagnosis[mapping.id_diagnosis].bacteria.push(mapping.id_bacteria);
                                    }
                                }.bind(this));
                                
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
                            var   list  = []
                                , keys  = Object.keys( diagnosis )
                                , l     = keys.length;

                            while( l-- ) list.push( diagnosis[ keys[ l ] ] );

                            // respond
                            response.render( list );
                        }
                    }.bind( this ) );                   
                }
            }.bind( this ) );
        }
    } );