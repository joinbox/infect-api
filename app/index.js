

	var   Class 			= require( "ee-class" )
		, Events 			= require( "ee-event" )
		, Waiter 			= require( "ee-waiter" )
		, project 			= require( "ee-project" )
		, MysqlSchema 		= require( "ee-mysql-schema" )
		, log 				= require( "ee-log" )
		, Webservice 		= require( "ee-webservice" )
		, Mutlilang 		= require( "em-multilang" )
		, Rest 				= require( "em-rest" )
		, Webfiles 			= require( "em-webfiles" )
		, project 			= require( "ee-project" )
		, APIRestriction 	= require( "em-api-restrictions" );



	module.exports = new Class( {
		inherits: Events

		, init: function(){

			// load the webservice
			this.service = new Webservice( project.config );



			this.service.use('*', { request: function( request, response, next  ){
				//log( request )
				response.setHeader( "Access-Control-Allow-Origin", "*" );

				next();
			} } );


			// load schema
			this.schema	= new MysqlSchema( { 
				  name: 		project.config.model.name
				, database: 	project.config.model.database
				, hosts: 		project.config.model.hosts
			} );

			this.schema.on('load', function(){

				// get initial data from db
				this.loadData( function(){

					// install mutlilang support
					this.service.use( new Mutlilang( { 
						  defaultLanguage: 	this.defaultLanguage 
						, languages: 		this.languageNames
						, countries: 		this.countryLanguageMap
					} ) );

					// implement api restrictions
					this.service.use( new APIRestriction( {
						  apikeys: 		this.apikeys
					} ) );

					// load rest api					
					this.rest = new Rest( { 
						  path: project.root + "public-api"
						, options: { 
							  schema: 				this.schema
							, languages: 			this.languages
							, reverseLanguages: 	this.reverseLanguages
							, sqlfiles: 			this.sqlfiles
						}
						, on: { load: function(){

							this.service.use( this.rest );

							// start listening
							this.service.listen( function( err ){
								log.trace( err );
								log.info( "server loaded ..." );
							}.bind( this ) );
						}.bind( this ) }
					} );
				}.bind( this ) );					
			}.bind( this ));
		}





		, loadData: function( callback ){
			var waiter = new Waiter();

			// get api keys
			waiter.add( function( cb ){
				if ( !this.schema.apikey ) throw new Error( "missing model [apikeys] in schema [" + this.schema.name + "]!");
				this.schema.apikey.fetchAll( function( err, apikeys ){
					if ( err ) cb( err );
					else {
						this.apikeys = {};

						apikeys.forEach( function( key ){
							this.apikeys[ key.key ] = {};
						}.bind( this ) );

						cb();
					}
				}.bind( this ) );
			}.bind( this ) );



			// load sql files
			waiter.add( function( cb ){
				var files = new Webfiles();
				files.load( project.root + "/sql/", function( err ){
					if ( err ) throw err;
					this.sqlfiles = files.hashTree["/"];
					cb();
				}.bind( this ) );
			}.bind( this ) );



			// get languages
			waiter.add( function( cb ){
				if ( !this.schema.language ) throw new Error( "missing model [language] in schema [" + this.schema.name + "]!");
				this.schema.language.fetchAll( function( err, languages ){
					if ( err ) cb( err );
					else {
						this.languages = {};
						this.reverseLanguages = {};
						this.languageNames = languages.map( function( l ){ return l.iso2.toLowerCase() } );

						languages.forEach( function( language ){
							this.languages[ language.iso2.toLowerCase() ] = language.id;
							this.reverseLanguages[ language.id ] = language.iso2.toLowerCase();
						}.bind( this ) );

						cb();
					}
				}.bind( this ) );
			}.bind( this ) );


			// get default language
			waiter.add( function( cb ){
				if ( !this.schema.country ) throw new Error( "missing model [country] in schema [" + this.schema.name + "]!");
				this.schema.country.fetchAll( function( err, countries ){
					if ( err ) cb( err );
					else {
						this.countries = countries;
						this.countryLanguageMap = {};
						cb();
					}
				}.bind( this ) );
			}.bind( this ) );



			// start async processing
			waiter.start( function(){

				// get default language
				this.countries.forEach( function( country ){
					var keys = Object.keys( this.languages )
						, l = keys.length;

					while( l-- ){
						if ( country.id_language === this.languages[ keys[ l ] ] ) this.countryLanguageMap[ country.iso2 ] = keys[ l ];
						break;
					}
				}.bind( this ) );


				callback();
			}.bind( this ) );
		}
	} );