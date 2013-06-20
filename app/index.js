

	var   Class 			= require( "ee-class" )
		, Events 			= require( "ee-event" )
		, Waiter 			= require( "ee-waiter" )
		, project 			= require( "ee-project" )
		, MysqlSchema 		= require( "ee-mysql-schema" )
		, log 				= require( "ee-log" )
		, Webservice 		= require( "ee-webservice" )
		, Mutlilang 		= require( "em-multilang" )
		, Rest 				= require( "em-rest" )
		, APIRestriction 	= require( "em-api-restrictions" );



	module.exports = new Class( {
		inherits: Events

		, init: function(){

			// load the webservice
			this.service = new Webservice( project.config );


			// load schema
			this.schema	= new MysqlSchema( { 
				  name: 		project.config.model.name
				, database: 	project.config.model.database
				, hosts: 		project.config.model.hosts
				, on: { load: function(){


					// load rest api					
					this.rest = new Rest( { 
						path: project.root + "public-api"
						, options: { schema: this.schema }
						, on: { load: function(){


							// install mutlilang support
							this.service.use( new Mutlilang( { 
								defaultLanguage: 	project.config.defaultLanguage 
								, languages: 		project.config.languages
							} ) );


							// load api keys
							if ( !this.schema.apikey ) throw new Error( "missing model [apikeys] in schema [" + this.schema.name + "]!");
							this.schema.apikey.fetchAll( function( err, apikeys ){
								if ( err ) throw err;
								else {
									var keys = {};

									apikeys.forEach( function( key ){
										keys[ key.key ] = {};
									} );

									// implement api restrictions
									this.service.use( new APIRestriction( {
										apikeys: keys
									} ) );

									this.service.listen( function( err ){
										log.trace( err );
										log.info( "server ready ..." );
									}.bind( this ) );
								}
							}.bind( this ) );
						}.bind( this ) }
					} );
				}.bind( this ) }
			} );			
		}
	} );